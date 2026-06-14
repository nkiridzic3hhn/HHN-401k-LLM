import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildSystemPrompt } from "./prompt.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

// --- Load the knowledge base once at startup -------------------------------
// To update answers, edit knowledge-base.md and redeploy (push to GitHub;
// Railway redeploys automatically).
let KNOWLEDGE_BASE = "";
try {
  KNOWLEDGE_BASE = fs.readFileSync(path.join(__dirname, "knowledge-base.md"), "utf8");
  console.log(`Loaded knowledge base (${KNOWLEDGE_BASE.length} chars).`);
} catch (e) {
  console.warn("No knowledge-base.md found yet:", e.message);
}
const SYSTEM_PROMPT = buildSystemPrompt(KNOWLEDGE_BASE);

// --- Simple in-memory rate limit (protects your API bill) ------------------
// Not a real auth system. Replace with proper access control before going wide.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const hits = new Map(); // ip -> { count, resetAt }

function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

// --- Chat endpoint ---------------------------------------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
    if (rateLimited(ip)) {
      return res.status(429).json({ error: "You're sending messages too quickly. Please wait a moment." });
    }

    if (!API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set.");
      return res.status(500).json({ error: "The assistant isn't configured yet. Please contact HR." });
    }

    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "No question received." });
    }

    // Sanitize: only valid roles, cap history length and message size.
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
        system: SYSTEM_PROMPT,
        messages: safeMessages,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, errText);
      return res.status(502).json({ error: "The assistant is temporarily unavailable. Please try again." });
    }

    const data = await anthropicRes.json();
    const reply = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    res.json({ reply: reply || "Sorry, I didn't catch that. Could you rephrase?" });
  } catch (err) {
    console.error("Chat handler error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

app.get("/healthz", (_req, res) => res.send("ok"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HHN 401(k) Assistant running on port ${PORT} (model: ${MODEL})`));
