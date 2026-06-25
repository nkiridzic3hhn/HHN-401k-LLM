import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { buildSystemPrompt } from "./prompt.js";
import { loadPackages, assembleKnowledge, isEnabled, packageSummaries } from "./packages.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: "1mb" }));

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Token prices (USD per 1,000,000 tokens). Defaults are Claude Sonnet 4.6
// ($3.00 input / $15.00 output). Override with env vars if the model or the
// rates ever change. These drive the cost estimate on the /admin dashboard.
const PRICE_IN_PER_MTOK = parseFloat(process.env.PRICE_IN_PER_MTOK || "3.00");
const PRICE_OUT_PER_MTOK = parseFloat(process.env.PRICE_OUT_PER_MTOK || "15.00");

// --- Knowledge packages ----------------------------------------------------
// The knowledge base is split into packages/ (one file per plan or agency).
// The active system prompt is assembled from CORE plus whichever packages are
// enabled. Editing a package's text still means edit + push + redeploy, but
// turning a package on/off is live from /admin (no redeploy) and persists in
// the package_state table. If packages/ is empty, we fall back to the legacy
// single knowledge-base.md so the assistant never goes dark.
const PACKAGES_DIR = path.join(__dirname, "packages");
let PACKAGES = loadPackages(PACKAGES_DIR);
let packageState = {}; // id -> boolean; loaded from the DB at startup
let SYSTEM_PROMPT = "";

function rebuildSystemPrompt() {
  let kb = "";
  if (PACKAGES.length) {
    kb = assembleKnowledge(PACKAGES, packageState);
  } else {
    try {
      kb = fs.readFileSync(path.join(__dirname, "knowledge-base.md"), "utf8");
      console.warn("No packages/ found — using legacy knowledge-base.md.");
    } catch (e) {
      console.warn("No packages and no knowledge-base.md:", e.message);
    }
  }
  SYSTEM_PROMPT = buildSystemPrompt(kb);
  return SYSTEM_PROMPT;
}
rebuildSystemPrompt();
console.log(`Loaded ${PACKAGES.length} knowledge package(s); system prompt is ${SYSTEM_PROMPT.length} chars.`);

// --- Question log (Postgres) -----------------------------------------------
// Optional: if DATABASE_URL isn't set, the assistant still runs normally and
// logging plus the /admin page are simply turned off. On Railway, add the
// Postgres plugin and it injects DATABASE_URL automatically.
const { Pool } = pg;
let pool = null;
let dbReady = false;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
  });
  initDb();
} else {
  console.warn("DATABASE_URL not set — question logging and /admin are disabled.");
}

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        question TEXT NOT NULL,
        answer TEXT,
        needs_hr BOOLEAN NOT NULL DEFAULT false,
        reviewed BOOLEAN NOT NULL DEFAULT false,
        session_id TEXT
      );
    `);
    // Add the newer columns if an older table already exists (safe to re-run).
    await pool.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0;`);
    await pool.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0;`);
    await pool.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS cache_read_tokens INTEGER DEFAULT 0;`);
    await pool.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS cache_write_tokens INTEGER DEFAULT 0;`);
    await pool.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic TEXT;`);
    await pool.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS agency TEXT;`);
    await pool.query(`CREATE INDEX IF NOT EXISTS questions_created_at_idx ON questions (created_at);`);
    // Per-package on/off state for the knowledge packages. Survives redeploys.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS package_state (
        id TEXT PRIMARY KEY,
        enabled BOOLEAN NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    dbReady = true;
    await loadPackageState();
    console.log("Question log and package state are ready.");
  } catch (e) {
    console.error("Could not initialize the database tables:", e.message);
  }
}

// Load saved package on/off state from the DB and rebuild the system prompt so
// admin toggles persist across redeploys.
async function loadPackageState() {
  if (!pool || !dbReady) return;
  try {
    const { rows } = await pool.query("SELECT id, enabled FROM package_state");
    packageState = {};
    for (const r of rows) packageState[r.id] = r.enabled;
    rebuildSystemPrompt();
    console.log(`Applied saved state for ${rows.length} package(s).`);
  } catch (e) {
    console.error("Could not load package state:", e.message);
  }
}

// Strip things people shouldn't have typed before anything is stored.
function scrubPII(text) {
  if (!text) return text;
  return text
    .replace(/\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, "[redacted]") // SSN-like
    .replace(/\b\d{9,}\b/g, "[redacted]"); // long digit runs (account numbers, etc.)
}

function normalizeAgency(slug) {
  if (!slug) return "none";
  const s = String(slug).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return s || "none";
}

async function logQuestion(row) {
  if (!pool || !dbReady) return;
  try {
    await pool.query(
      `INSERT INTO questions
         (question, answer, needs_hr, session_id, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, topic, agency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        scrubPII(row.question)?.slice(0, 4000) || "",
        scrubPII(row.answer)?.slice(0, 8000) || "",
        !!row.needsHr,
        row.sessionId ? String(row.sessionId).slice(0, 100) : null,
        row.inputTokens || 0,
        row.outputTokens || 0,
        row.cacheReadTokens || 0,
        row.cacheWriteTokens || 0,
        row.topic || "other",
        row.agency || "none",
      ]
    );
  } catch (e) {
    console.error("Could not log question:", e.message);
  }
}

// --- Usage limits (protect the API bill) -----------------------------------
// Three layers, all tunable via env vars:
//   MAX_PER_MIN     burst cap per person (per IP), per minute
//   MAX_PER_IP_DAY  total messages one person (per IP) can send in a day
//   MAX_GLOBAL_DAY  total messages from everyone in a day (backstop)
// These are in-memory, so they reset on redeploy. They are the first line of
// defense; for a hard guarantee, also set a monthly spend limit in the
// Anthropic Console.
const MAX_PER_MIN = parseInt(process.env.MAX_PER_MIN || "20", 10);
const MAX_PER_IP_DAY = parseInt(process.env.MAX_PER_IP_DAY || "60", 10);
const MAX_GLOBAL_DAY = parseInt(process.env.MAX_GLOBAL_DAY || "1500", 10);

const minuteHits = new Map(); // ip -> { count, resetAt }
const dayHits = new Map(); // ip -> { count, day }
let globalDay = { day: dayKey(), count: 0 };

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Check all limits and, if the request is allowed, count it. Returns either
// { ok: true } or { ok: false, status, error }.
function checkAndCount(ip) {
  const now = Date.now();
  const day = dayKey();

  if (globalDay.day !== day) globalDay = { day, count: 0 };

  let burst = minuteHits.get(ip);
  if (!burst || now > burst.resetAt) burst = { count: 0, resetAt: now + 60_000 };

  let perDay = dayHits.get(ip);
  if (!perDay || perDay.day !== day) perDay = { count: 0, day };

  if (burst.count >= MAX_PER_MIN) {
    return { ok: false, status: 429, error: "You're sending messages too quickly. Please wait a moment." };
  }
  if (globalDay.count >= MAX_GLOBAL_DAY) {
    return { ok: false, status: 503, error: "The assistant is taking a short break due to high usage. Please try again later, or contact HR for help." };
  }
  if (perDay.count >= MAX_PER_IP_DAY) {
    return { ok: false, status: 429, error: "You've reached today's limit for the assistant. For more help right now, please contact HR." };
  }

  burst.count += 1;
  minuteHits.set(ip, burst);
  perDay.count += 1;
  dayHits.set(ip, perDay);
  globalDay.count += 1;
  return { ok: true };
}

// Light periodic cleanup so the maps don't grow forever.
setInterval(() => {
  const now = Date.now();
  const day = dayKey();
  for (const [ip, b] of minuteHits) if (now > b.resetAt) minuteHits.delete(ip);
  for (const [ip, d] of dayHits) if (d.day !== day) dayHits.delete(ip);
}, 3_600_000).unref();

// --- Parse and strip the model's hidden review tag -------------------------
// Tag looks like: [[META | topic: premiums_cost | agency: family_care | answered: no]]
// We also still honor the older [[NEEDS_HR]] marker for safety.
const META_RE = /\[\[META\b[^\]]*\]\]/gi;
const LEGACY_NEEDS_HR = /\[\[NEEDS_HR\]\]/gi;

function parseAndStripTag(text) {
  let needsHr = false;
  let topic = "other";
  let agency = "none";

  const metaMatch = text.match(/\[\[META\b[^\]]*\]\]/i);
  if (metaMatch) {
    const raw = metaMatch[0];
    const grab = (key) => {
      const m = raw.match(new RegExp(key + "\\s*:\\s*([A-Za-z0-9_\\-]+)", "i"));
      return m ? m[1].toLowerCase() : null;
    };
    topic = grab("topic") || "other";
    agency = normalizeAgency(grab("agency"));
    needsHr = grab("answered") === "no";
  }
  if (LEGACY_NEEDS_HR.test(text)) needsHr = true;

  const clean = text.replace(META_RE, "").replace(LEGACY_NEEDS_HR, "").trim();
  return { clean, needsHr, topic, agency };
}

// --- Chat endpoint ---------------------------------------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
    const limit = checkAndCount(ip);
    if (!limit.ok) {
      return res.status(limit.status).json({ error: limit.error });
    }

    if (!API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set.");
      return res.status(500).json({ error: "The assistant isn't configured yet. Please contact HR." });
    }

    const { messages, sessionId } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "No question received." });
    }

    const safeMessages = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    if (safeMessages.length === 0) {
      return res.status(400).json({ error: "No question received." });
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        // Cache the system prompt (persona + knowledge base). It's identical on
        // every request, so after the first call Claude reads it from cache at
        // ~1/10 the input price instead of re-charging the full ~8k tokens.
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages: safeMessages,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, errText);
      return res.status(502).json({ error: "The assistant is temporarily unavailable. Please try again." });
    }

    const data = await anthropicRes.json();
    let reply = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    const { clean, needsHr, topic, agency } = parseAndStripTag(reply);
    const finalReply = clean || "Sorry, I didn't catch that. Could you rephrase?";

    const usage = data.usage || {};
    const lastUser = [...safeMessages].reverse().find((m) => m.role === "user");

    logQuestion({
      question: lastUser?.content || "",
      answer: finalReply,
      needsHr,
      topic,
      agency,
      sessionId,
      inputTokens: usage.input_tokens || 0,
      outputTokens: usage.output_tokens || 0,
      cacheReadTokens: usage.cache_read_input_tokens || 0,
      cacheWriteTokens: usage.cache_creation_input_tokens || 0,
    });

    res.json({ reply: finalReply });
  } catch (err) {
    console.error("Chat handler error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// --- Admin (HR review page) ------------------------------------------------
function adminAuth(req, res, next) {
  if (!ADMIN_PASSWORD) {
    return res.status(503).send("The review page isn't configured yet. Set ADMIN_PASSWORD to enable it.");
  }
  const header = req.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const decoded = Buffer.from(encoded, "base64").toString();
    const pass = decoded.slice(decoded.indexOf(":") + 1);
    if (pass && pass === ADMIN_PASSWORD) return next();
  }
  res.set("WWW-Authenticate", 'Basic realm="HHN Benefits Review"');
  return res.status(401).send("Authentication required.");
}

app.get("/admin", adminAuth, (_req, res) => {
  res.sendFile(path.join(__dirname, "admin-page.html"));
});

app.get("/api/admin/questions", adminAuth, async (req, res) => {
  if (!pool || !dbReady) return res.json({ dbReady: false, rows: [] });
  try {
    const filter = req.query.filter;
    let where = "";
    if (filter === "needs_hr") where = "WHERE needs_hr = true AND reviewed = false";
    else if (filter === "unreviewed") where = "WHERE reviewed = false";
    const { rows } = await pool.query(
      `SELECT id, created_at, question, answer, needs_hr, reviewed, session_id, topic, agency
       FROM questions ${where}
       ORDER BY created_at DESC
       LIMIT 500`
    );
    res.json({ dbReady: true, rows });
  } catch (e) {
    console.error("Could not load questions:", e.message);
    res.status(500).json({ error: "Could not load questions." });
  }
});

app.get("/api/admin/stats", adminAuth, async (_req, res) => {
  if (!pool || !dbReady) return res.json({ dbReady: false });
  try {
    const [totals, tokens, daily, topics, agencies] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(DISTINCT session_id) FILTER (WHERE created_at >= date_trunc('day', now()))   AS sessions_today,
          COUNT(DISTINCT session_id) FILTER (WHERE created_at >= date_trunc('week', now()))  AS sessions_week,
          COUNT(DISTINCT session_id) FILTER (WHERE created_at >= date_trunc('month', now())) AS sessions_month,
          COUNT(DISTINCT session_id) AS sessions_total,
          COUNT(*) AS messages_total,
          COUNT(*) FILTER (WHERE needs_hr) AS needs_hr_total,
          COUNT(*) FILTER (WHERE needs_hr AND NOT reviewed) AS needs_hr_open
        FROM questions
      `),
      pool.query(`
        SELECT
          COALESCE(SUM(input_tokens),0)  AS in_tok,
          COALESCE(SUM(output_tokens),0) AS out_tok,
          COALESCE(SUM(cache_read_tokens),0)  AS cache_read_tok,
          COALESCE(SUM(cache_write_tokens),0) AS cache_write_tok,
          COALESCE(SUM(input_tokens)  FILTER (WHERE created_at >= date_trunc('month', now())),0) AS in_tok_month,
          COALESCE(SUM(output_tokens) FILTER (WHERE created_at >= date_trunc('month', now())),0) AS out_tok_month,
          COALESCE(SUM(cache_read_tokens)  FILTER (WHERE created_at >= date_trunc('month', now())),0) AS cache_read_month,
          COALESCE(SUM(cache_write_tokens) FILTER (WHERE created_at >= date_trunc('month', now())),0) AS cache_write_month
        FROM questions
      `),
      pool.query(`
        SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
               COUNT(DISTINCT session_id) AS sessions,
               COUNT(*) AS messages
        FROM questions
        WHERE created_at >= now() - interval '13 days'
        GROUP BY 1 ORDER BY 1
      `),
      pool.query(`
        SELECT COALESCE(NULLIF(topic,''),'other') AS topic, COUNT(*) AS n
        FROM questions GROUP BY 1 ORDER BY n DESC LIMIT 20
      `),
      pool.query(`
        SELECT COALESCE(NULLIF(agency,''),'unknown') AS agency, COUNT(*) AS n
        FROM questions
        WHERE agency IS NOT NULL AND agency NOT IN ('none','')
        GROUP BY 1 ORDER BY n DESC LIMIT 20
      `),
    ]);

    const t = totals.rows[0];
    const k = tokens.rows[0];
    const num = (x) => Number(x) || 0;
    // Cache reads are billed at ~10% of input; 5-minute cache writes at ~125%.
    const CACHE_READ_PER_MTOK = PRICE_IN_PER_MTOK * 0.1;
    const CACHE_WRITE_PER_MTOK = PRICE_IN_PER_MTOK * 1.25;
    const cost = (inTok, outTok, cacheRead, cacheWrite) =>
      (num(inTok) / 1e6) * PRICE_IN_PER_MTOK +
      (num(outTok) / 1e6) * PRICE_OUT_PER_MTOK +
      (num(cacheRead) / 1e6) * CACHE_READ_PER_MTOK +
      (num(cacheWrite) / 1e6) * CACHE_WRITE_PER_MTOK;

    res.json({
      dbReady: true,
      conversations: {
        today: num(t.sessions_today),
        week: num(t.sessions_week),
        month: num(t.sessions_month),
        total: num(t.sessions_total),
      },
      messagesTotal: num(t.messages_total),
      needsHr: { total: num(t.needs_hr_total), open: num(t.needs_hr_open) },
      limits: {
        globalToday: globalDay.day === dayKey() ? globalDay.count : 0,
        maxGlobalDay: MAX_GLOBAL_DAY,
        maxPerIpDay: MAX_PER_IP_DAY,
        maxPerMin: MAX_PER_MIN,
      },
      cost: {
        inputTokens: num(k.in_tok) + num(k.cache_read_tok) + num(k.cache_write_tok),
        outputTokens: num(k.out_tok),
        cachedReadTokens: num(k.cache_read_tok),
        total: cost(k.in_tok, k.out_tok, k.cache_read_tok, k.cache_write_tok),
        month: cost(k.in_tok_month, k.out_tok_month, k.cache_read_month, k.cache_write_month),
        rates: { input: PRICE_IN_PER_MTOK, output: PRICE_OUT_PER_MTOK },
      },
      daily: daily.rows.map((r) => ({ day: r.day, sessions: num(r.sessions), messages: num(r.messages) })),
      topics: topics.rows.map((r) => ({ topic: r.topic, n: num(r.n) })),
      agencies: agencies.rows.map((r) => ({ agency: r.agency, n: num(r.n) })),
    });
  } catch (e) {
    console.error("Could not load stats:", e.message);
    res.status(500).json({ error: "Could not load stats." });
  }
});

app.post("/api/admin/questions/:id/review", adminAuth, async (req, res) => {
  if (!pool || !dbReady) return res.status(503).json({ error: "Review log isn't available." });
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Bad id." });
  const reviewed = req.body?.reviewed !== false;
  try {
    await pool.query("UPDATE questions SET reviewed = $1 WHERE id = $2", [reviewed, id]);
    res.json({ ok: true });
  } catch (e) {
    console.error("Could not update question:", e.message);
    res.status(500).json({ error: "Could not update." });
  }
});

// --- Knowledge packages (admin config) -------------------------------------
// List every package with its on/off state and metadata. `persisted` tells the
// UI whether toggles will survive a redeploy (they only do when the DB is up).
app.get("/api/admin/packages", adminAuth, (_req, res) => {
  res.json({
    persisted: !!(pool && dbReady),
    activePromptChars: SYSTEM_PROMPT.length,
    packages: packageSummaries(PACKAGES, packageState),
  });
});

// Full text of one package, for the admin preview panel.
app.get("/api/admin/packages/:id", adminAuth, (req, res) => {
  const pkg = PACKAGES.find((p) => p.id === req.params.id);
  if (!pkg) return res.status(404).json({ error: "No such package." });
  res.json({
    id: pkg.id,
    title: pkg.title,
    type: pkg.type,
    locked: pkg.locked,
    enabled: isEnabled(pkg, packageState),
    sizeChars: pkg.sizeChars,
    body: pkg.body,
  });
});

// Turn a package on or off. Takes effect on the next chat within seconds; no
// redeploy. Locked packages (core) cannot be turned off.
app.post("/api/admin/packages/:id", adminAuth, async (req, res) => {
  const pkg = PACKAGES.find((p) => p.id === req.params.id);
  if (!pkg) return res.status(404).json({ error: "No such package." });
  if (pkg.locked) {
    return res.status(400).json({ error: "This package is always on and can't be turned off." });
  }
  const enabled = req.body?.enabled !== false;
  packageState[pkg.id] = enabled;

  let persisted = false;
  if (pool && dbReady) {
    try {
      await pool.query(
        `INSERT INTO package_state (id, enabled, updated_at) VALUES ($1, $2, now())
         ON CONFLICT (id) DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = now()`,
        [pkg.id, enabled]
      );
      persisted = true;
    } catch (e) {
      console.error("Could not persist package state:", e.message);
    }
  }

  rebuildSystemPrompt();
  console.log(`Package "${pkg.id}" turned ${enabled ? "ON" : "OFF"} (prompt now ${SYSTEM_PROMPT.length} chars).`);
  res.json({ ok: true, id: pkg.id, enabled, persisted });
});

// --- Static site (the employee-facing assistant) ---------------------------
// Everything lives in one flat folder, so we serve ONLY an explicit allow-list.
// This keeps internal files (server.js, prompt.js, knowledge-base.md,
// admin-page.html, Dockerfile, configs) private even though they sit alongside
// the public assets.
const STATIC_FILES = {
  "/": "index.html",
  "/index.html": "index.html",
  "/styles.css": "styles.css",
  "/app.js": "app.js",
  "/honor-health-logo.jpg": "honor-health-logo.jpg",
  "/assistant-avatar.png": "assistant-avatar.png",
  "/benny.png": "benny.png",
};
const PUBLIC_PDFS = new Set([
  "2026-engage-benefits-summary.pdf",
  "401k-enrollment-booklet.pdf",
  "accessing-your-account.pdf",
  "hardship-withdrawal-request.pdf",
  "incoming-rollover-request.pdf",
]);

app.get(Object.keys(STATIC_FILES), (req, res) => {
  res.sendFile(path.join(__dirname, STATIC_FILES[req.path]));
});

// The knowledge base links PDFs as /forms/<name>.pdf, but they live at the root.
app.get("/forms/:name", (req, res) => {
  if (PUBLIC_PDFS.has(req.params.name)) {
    return res.sendFile(path.join(__dirname, req.params.name));
  }
  res.status(404).send("Not found.");
});

app.get("/healthz", (_req, res) => res.send("ok"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HHN Benefits Assistant running on port ${PORT} (model: ${MODEL})`));
