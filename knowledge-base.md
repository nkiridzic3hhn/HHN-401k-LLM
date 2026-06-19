<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>HHN Benefits — Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Spectral:wght@500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --navy: #1F3A6E; --cyan: #1FAACE; --green: #6DB43F; --bg: #EEF3F8;
      --line: #d7e0ec; --muted: #5b6b82; --flag: #c0392b; --card: #ffffff;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: #1c2733; font-family: "IBM Plex Sans", system-ui, sans-serif; }
    header { background: #fff; border-bottom: 1px solid var(--line); padding: 16px 22px; display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; }
    header h1 { font-family: "Spectral", serif; color: var(--navy); font-size: 20px; margin: 0; }
    header .sub { color: var(--muted); font-size: 13px; }
    .wrap { max-width: 1120px; margin: 0 auto; padding: 22px; }
    .section-title { font-size: 13px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); margin: 26px 2px 12px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .stat { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; }
    .stat .label { font-size: 12px; color: var(--muted); }
    .stat .value { font-size: 26px; font-weight: 700; color: var(--navy); margin-top: 4px; line-height: 1.1; }
    .stat .value.flag { color: var(--flag); }
    .stat .sub { font-size: 11px; color: var(--muted); margin-top: 3px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 760px) { .grid2 { grid-template-columns: 1fr; } }
    .panel { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; }
    .panel h3 { margin: 0 0 12px; font-size: 14px; color: var(--navy); }
    .note { color: var(--muted); font-size: 12px; }
    .note.warn { color: var(--flag); }
    .bar-row { display: flex; align-items: center; gap: 10px; margin: 7px 0; font-size: 13px; }
    .bar-label { width: 130px; flex-shrink: 0; color: #2b3a4d; }
    .bar-track { flex: 1; background: #eef2f7; border-radius: 6px; height: 16px; overflow: hidden; }
    .bar-fill { height: 100%; background: var(--cyan); border-radius: 6px; }
    .bar-n { width: 34px; text-align: right; color: var(--muted); flex-shrink: 0; }
    .controls { display: flex; gap: 8px; align-items: center; margin: 8px 0 14px; flex-wrap: wrap; }
    .tab { border: 1px solid var(--line); background: #fff; color: var(--navy); padding: 7px 14px; border-radius: 999px; cursor: pointer; font-size: 13px; font-weight: 500; }
    .tab.active { background: var(--navy); color: #fff; border-color: var(--navy); }
    .count { color: var(--muted); font-size: 13px; margin-left: auto; }
    .card { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; }
    .card.flagged { border-left: 4px solid var(--flag); }
    .meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 7px; font-size: 12px; color: var(--muted); }
    .pill { font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 999px; }
    .pill.hr { background: #fdecea; color: var(--flag); }
    .pill.ok { background: #eaf5e0; color: #3e6b1a; }
    .pill.topic { background: #e7f0f6; color: var(--navy); }
    .pill.agency { background: #eef6ec; color: #3e6b1a; }
    .q { font-weight: 600; font-size: 15px; margin: 2px 0 8px; }
    .a { font-size: 14px; color: #34414f; white-space: pre-wrap; border-top: 1px dashed var(--line); padding-top: 8px; }
    .row-actions { margin-top: 10px; }
    .btn { border: 1px solid var(--line); background: #fff; color: var(--navy); padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; }
    .btn:hover { background: var(--bg); }
    .empty { color: var(--muted); font-size: 14px; padding: 26px 0; text-align: center; }
    .chart { width: 100%; height: 150px; display: block; }
    .chart .axis { font-size: 9px; fill: var(--muted); }
  </style>
</head>
<body>
  <header>
    <h1>Benefits Assistant Dashboard</h1>
    <span class="sub">Usage, cost, and what employees are asking</span>
  </header>
  <div class="wrap">

    <div class="section-title">Usage</div>
    <div class="cards" id="usageCards"><div class="empty">Loading…</div></div>

    <div class="section-title">Estimated API cost</div>
    <div class="panel" id="costPanel"><div class="empty">Loading…</div></div>

    <div class="section-title">Conversations — last 14 days</div>
    <div class="panel"><svg class="chart" id="chart" viewBox="0 0 700 150" preserveAspectRatio="none"></svg></div>

    <div class="section-title">What people ask about</div>
    <div class="grid2">
      <div class="panel"><h3>Top topics</h3><div id="topics"></div></div>
      <div class="panel"><h3>Top agencies</h3><div id="agencies"></div></div>
    </div>

    <div class="section-title">Questions the assistant couldn't answer</div>
    <div class="controls">
      <button class="tab active" data-filter="needs_hr">Needs HR</button>
      <button class="tab" data-filter="unreviewed">Unreviewed</button>
      <button class="tab" data-filter="all">All</button>
      <span class="count" id="count"></span>
    </div>
    <div id="list"></div>
  </div>

  <script>
    const TOPIC_LABELS = {
      retirement_401k: "401(k)", eligibility: "Eligibility", enrollment: "Enrollment",
      premiums_cost: "Premiums / cost", medical_plans: "Medical plans", dental: "Dental",
      vision: "Vision", pharmacy: "Pharmacy", hsa_fsa: "HSA / FSA",
      changing_coverage: "Changing coverage", account_access: "Account access",
      contacts: "Contacts", other: "Other",
    };
    function prettyTopic(t) { return TOPIC_LABELS[t] || prettySlug(t); }
    function prettySlug(s) { return (s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }
    function esc(s) { return (s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
    function fmtDate(s) { try { return new Date(s).toLocaleString(); } catch { return s; } }
    function money(n) { return "$" + (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function compact(n) { n = Number(n) || 0; return n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(1)+"k" : String(n); }

    let filter = "needs_hr";

    async function loadStats() {
      let s;
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error();
        s = await res.json();
      } catch { document.getElementById("usageCards").innerHTML = '<div class="empty">Could not load stats.</div>'; return; }

      if (s.dbReady === false) {
        document.getElementById("usageCards").innerHTML = '<div class="empty">Database not connected yet.</div>';
        return;
      }

      const c = s.conversations;
      document.getElementById("usageCards").innerHTML = [
        card("Conversations today", c.today),
        card("This week", c.week),
        card("This month", c.month),
        card("All time", c.total),
        card("Total questions", s.messagesTotal),
        card("Needs HR (open)", s.needsHr.open, s.needsHr.total + " total", true),
      ].join("");

      const k = s.cost;
      document.getElementById("costPanel").innerHTML = `
        <div class="cards">
          ${card("Since tracking began", money(k.total))}
          ${card("This month", money(k.month))}
          ${card("Input tokens", compact(k.inputTokens))}
          ${card("Output tokens", compact(k.outputTokens))}
        </div>
        <p class="note" style="margin-top:12px">Estimate based on logged tokens at ${money(k.rates.input)}/M input and ${money(k.rates.output)}/M output (Claude Sonnet 4.6). Counts start when this tracking went live; your Anthropic Console shows the exact bill.</p>`;

      drawChart(s.daily || []);
      renderBars("topics", (s.topics || []).map((r) => ({ label: prettyTopic(r.topic), n: r.n })));
      renderBars("agencies", (s.agencies || []).map((r) => ({ label: prettySlug(r.agency), n: r.n })));
    }

    function card(label, value, sub, flag) {
      return `<div class="stat"><div class="label">${esc(label)}</div>
        <div class="value${flag ? " flag" : ""}">${esc(String(value))}</div>
        ${sub ? '<div class="sub">' + esc(sub) + '</div>' : ''}</div>`;
    }

    function renderBars(elId, rows) {
      const el = document.getElementById(elId);
      if (!rows.length) { el.innerHTML = '<div class="note">No data yet.</div>'; return; }
      const max = Math.max(...rows.map((r) => r.n), 1);
      el.innerHTML = rows.map((r) => `
        <div class="bar-row">
          <div class="bar-label">${esc(r.label)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${(r.n / max) * 100}%"></div></div>
          <div class="bar-n">${r.n}</div>
        </div>`).join("");
    }

    function drawChart(daily) {
      // Fill in any missing days so the last 14 are continuous.
      const days = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const hit = daily.find((x) => x.day === key);
        days.push({ day: key, sessions: hit ? hit.sessions : 0 });
      }
      const W = 700, H = 150, pad = 22, n = days.length;
      const max = Math.max(...days.map((d) => d.sessions), 1);
      const bw = (W - pad * 2) / n;
      let svg = "";
      days.forEach((d, i) => {
        const h = (d.sessions / max) * (H - pad * 2);
        const x = pad + i * bw;
        const y = H - pad - h;
        svg += `<rect x="${x + 3}" y="${y}" width="${bw - 6}" height="${h}" rx="3" fill="var(--cyan)"></rect>`;
        if (i % 2 === 0) svg += `<text class="axis" x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${d.day.slice(5)}</text>`;
        if (d.sessions > 0) svg += `<text class="axis" x="${x + bw / 2}" y="${y - 3}" text-anchor="middle">${d.sessions}</text>`;
      });
      document.getElementById("chart").innerHTML = svg;
    }

    async function loadList() {
      const listEl = document.getElementById("list");
      const countEl = document.getElementById("count");
      listEl.innerHTML = '<div class="empty">Loading…</div>';
      let data;
      try {
        const res = await fetch("/api/admin/questions?filter=" + encodeURIComponent(filter));
        if (!res.ok) throw new Error();
        data = await res.json();
      } catch { listEl.innerHTML = '<div class="empty">Could not load questions.</div>'; return; }

      if (data.dbReady === false) { listEl.innerHTML = '<div class="empty">Database not connected yet.</div>'; return; }
      const rows = data.rows || [];
      countEl.textContent = rows.length + (rows.length === 1 ? " entry" : " entries");
      listEl.innerHTML = rows.length ? rows.map(renderCard).join("") : '<div class="empty">Nothing here right now.</div>';
    }

    function renderCard(r) {
      const hrPill = r.needs_hr ? '<span class="pill hr">Needs HR</span>' : "";
      const okPill = r.reviewed ? '<span class="pill ok">Reviewed</span>' : "";
      const topicPill = r.topic ? '<span class="pill topic">' + esc(prettyTopic(r.topic)) + '</span>' : "";
      const agencyPill = r.agency && r.agency !== "none" ? '<span class="pill agency">' + esc(prettySlug(r.agency)) + '</span>' : "";
      const btn = r.reviewed ? "Mark unreviewed" : "Mark reviewed";
      return `
        <div class="card${r.needs_hr ? " flagged" : ""}">
          <div class="meta">${hrPill}${okPill}${topicPill}${agencyPill}<span>${fmtDate(r.created_at)}</span></div>
          <div class="q">${esc(r.question)}</div>
          <div class="a">${esc(r.answer)}</div>
          <div class="row-actions"><button class="btn" onclick="toggleReview(${r.id}, ${!r.reviewed})">${btn}</button></div>
        </div>`;
    }

    async function toggleReview(id, reviewed) {
      try {
        await fetch("/api/admin/questions/" + id + "/review", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewed }),
        });
        loadList(); loadStats();
      } catch { alert("Could not update that entry."); }
    }

    document.querySelectorAll(".tab").forEach((t) => {
      t.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
        t.classList.add("active");
        filter = t.dataset.filter;
        loadList();
      });
    });

    loadStats();
    loadList();
  </script>
</body>
</html>
