const STARTERS = [
  "When am I eligible for health benefits?",
  "What medical plans can I choose from?",
  "How much does the 401(k) match?",
  "How do I enroll, and what's the deadline?",
  "Can I change my health plan mid-year?",
  "What's the difference between traditional and Roth?",
];

const scrollEl = document.getElementById("scroll");
const msgsEl = document.getElementById("msgs");
const emptyEl = document.getElementById("empty");
const startersEl = document.getElementById("starters");
const inputEl = document.getElementById("input");
const sendEl = document.getElementById("send");

const history = []; // { role: "user" | "assistant", content }
let loading = false;

// Build starter chips
STARTERS.forEach((q) => {
  const b = document.createElement("button");
  b.className = "chip";
  b.textContent = q;
  b.addEventListener("click", () => send(q));
  startersEl.appendChild(b);
});

const BOT_AVATAR = `
  <div class="avatar" aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 40 40">
      <path d="M9 27 C 15 27, 18 14, 31 11" fill="none" stroke="#9DCB3B" stroke-width="3" stroke-linecap="round" />
      <circle cx="31" cy="11" r="3.4" fill="#FFFFFF" />
    </svg>
  </div>`;

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// Turn URLs, form paths, emails, and phone numbers into clickable links.
// Everything is escaped first, so this is safe to set as innerHTML.
function renderRich(text) {
  const pattern = /(https?:\/\/[^\s<]+)|(\/forms\/[A-Za-z0-9_\-]+\.pdf)|([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})|(\(\d{3}\)\s?\d{3}-\d{4}|\b\d{3}-\d{3}-\d{4}\b)/g;
  let out = "";
  let last = 0;
  let m;
  while ((m = pattern.exec(text))) {
    out += escapeHtml(text.slice(last, m.index));
    const token = m[0];
    if (m[1]) {
      out += `<a href="${escapeHtml(token)}" target="_blank" rel="noopener noreferrer">${escapeHtml(token)}</a>`;
    } else if (m[2]) {
      out += `<a href="${escapeHtml(token)}" target="_blank" rel="noopener noreferrer">${escapeHtml(token)}</a>`;
    } else if (m[3]) {
      out += `<a href="mailto:${escapeHtml(token)}">${escapeHtml(token)}</a>`;
    } else if (m[4]) {
      const tel = token.replace(/[^\d]/g, "");
      out += `<a href="tel:${tel}">${escapeHtml(token)}</a>`;
    }
    last = m.index + token.length;
  }
  out += escapeHtml(text.slice(last));
  return out;
}

function scrollToBottom() {
  scrollEl.scrollTop = scrollEl.scrollHeight;
}

function addBubble(role, text) {
  if (emptyEl) emptyEl.classList.add("hidden");
  const row = document.createElement("div");
  row.className = "row" + (role === "user" ? " user" : "");
  const bubbleClass = role === "user" ? "user" : role === "error" ? "err" : "bot";
  const bubble = document.createElement("div");
  bubble.className = "bubble " + bubbleClass;
  if (role === "assistant") {
    bubble.innerHTML = renderRich(text); // clickable links in answers
  } else {
    bubble.textContent = text; // user + error stay plain
  }
  if (role !== "user") row.innerHTML = BOT_AVATAR;
  row.appendChild(bubble);
  msgsEl.appendChild(row);
  scrollToBottom();
  return row;
}

function showTyping() {
  const row = document.createElement("div");
  row.className = "row";
  row.id = "typing-row";
  row.innerHTML = BOT_AVATAR + `<div class="bubble bot"><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div>`;
  msgsEl.appendChild(row);
  scrollToBottom();
}

function hideTyping() {
  const t = document.getElementById("typing-row");
  if (t) t.remove();
}

function setLoading(v) {
  loading = v;
  sendEl.disabled = v || !inputEl.value.trim();
}

async function send(text) {
  const trimmed = (text != null ? text : inputEl.value).trim();
  if (!trimmed || loading) return;

  addBubble("user", trimmed);
  history.push({ role: "user", content: trimmed });
  inputEl.value = "";
  inputEl.style.height = "auto";
  setLoading(true);
  showTyping();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json();
    hideTyping();

    if (!res.ok) {
      addBubble("error", data.error || "Something went wrong. Please try again.");
    } else {
      addBubble("assistant", data.reply);
      history.push({ role: "assistant", content: data.reply });
    }
  } catch (err) {
    hideTyping();
    addBubble("error", "Couldn't reach the assistant. Please check your connection and try again.");
  } finally {
    setLoading(false);
  }
}

// Composer behavior
inputEl.addEventListener("input", () => {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 130) + "px";
  sendEl.disabled = loading || !inputEl.value.trim();
});

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

sendEl.addEventListener("click", () => send());
sendEl.disabled = true;
