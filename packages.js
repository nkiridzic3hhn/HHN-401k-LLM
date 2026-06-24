// Knowledge "packages": the knowledge base split into a folder of files that
// can be turned on or off from the admin dashboard. The server assembles the
// active knowledge base from CORE plus whichever packages are enabled, so an
// admin can stop (or start) the assistant answering for a given agency without
// a redeploy.
//
// Each file in packages/ starts with a small frontmatter header:
//   ---
//   id: family-care-visiting-nurse
//   title: Family Care Visiting Nurse (CT)
//   type: core | default-plan | agency
//   slot: engage | direct_care        (default-plan only)
//   locked: true|false                 (core is locked = always on)
//   default_enabled: true|false        (state used the first time it's seen)
//   order: 20                          (assembly + display order)
//   routing_on:  <one line>            (agency only: routing entry when ON)
//   routing_off: <one line>            (agency only: routing entry when OFF)
//   summary: <one line for the admin list>
//   ---
//   <markdown body>
//
// CORE (core.md) contains two markers the assembler fills in:
//   {{ENGAGE_STATUS}} / {{DIRECT_CARE_STATUS}}  -> default-plan availability
//   {{AGENCY_OVERRIDES}}                         -> buckets B (loaded) and C (off)
//   {{PLAN_PACKAGES}}                            -> the enabled plan/agency blocks

import fs from "fs";
import path from "path";

// --- Frontmatter parsing ----------------------------------------------------
// Minimal single-line `key: value` parser. Values stay on one line, so URLs and
// colons inside a value are fine (we split on the first colon only).
function parseFrontmatter(raw) {
  const text = raw.replace(/^﻿/, "");
  const m = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: text.trim() };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    meta[key] = val;
  }
  return { meta, body: m[2].trim() };
}

function toBool(v, dflt = false) {
  if (v === undefined) return dflt;
  return String(v).toLowerCase() === "true";
}

// --- Load packages from disk ------------------------------------------------
export function loadPackages(dir) {
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".md"));
  } catch {
    return [];
  }
  const pkgs = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const id = meta.id || file.replace(/\.md$/i, "");
    return {
      id,
      file,
      title: meta.title || id,
      type: meta.type || "agency",
      slot: meta.slot || null,
      locked: toBool(meta.locked, false),
      defaultEnabled: toBool(meta.default_enabled, true),
      order: Number.isFinite(parseInt(meta.order, 10)) ? parseInt(meta.order, 10) : 999,
      routingOn: meta.routing_on || "",
      routingOff: meta.routing_off || "",
      summary: meta.summary || "",
      body,
      sizeChars: body.length,
    };
  });
  pkgs.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  return pkgs;
}

// A package is effectively enabled if it's locked (core), or the enabled-state
// map says so, falling back to its default_enabled when we've never seen it.
export function isEnabled(pkg, enabledState) {
  if (pkg.locked) return true;
  if (enabledState && Object.prototype.hasOwnProperty.call(enabledState, pkg.id)) {
    return !!enabledState[pkg.id];
  }
  return pkg.defaultEnabled;
}

// --- Assemble the active knowledge base -------------------------------------
export function assembleKnowledge(pkgs, enabledState) {
  const core = pkgs.find((p) => p.type === "core");
  const on = (p) => isEnabled(p, enabledState);

  const defaultPlans = pkgs.filter((p) => p.type === "default-plan");
  const engage = defaultPlans.find((p) => p.slot === "engage");
  const directCare = defaultPlans.find((p) => p.slot === "direct_care");
  const agencies = pkgs.filter((p) => p.type === "agency");

  const engageStatus = engage && on(engage)
    ? "ENGAGE"
    : "ENGAGE (NOTE: the Engage plan package is currently OFF — do not give Engage plan details; route office / admin health questions to HR)";
  const directCareStatus = directCare && on(directCare)
    ? "DIRECT CARE"
    : "DIRECT CARE (NOTE: the Direct Care plan package is currently OFF — do not give Direct Care plan details; route field caregiver health questions to HR)";

  // Buckets B (loaded overrides) and C (recognized but off / not loaded).
  const loaded = agencies.filter(on);
  const off = agencies.filter((p) => !on(p));
  const loadedLines = loaded.length
    ? loaded.map((p) => "- " + (p.routingOn || p.title)).join("\n")
    : "- (none currently loaded)";
  const offLines = off.length
    ? off.map((p) => "- " + (p.routingOff || p.title)).join("\n")
    : "- (none)";

  const agencyOverrides =
    "B) OVERRIDE AGENCIES WITH LOADED PLANS — do NOT use the default. Use the agency's own block in the AGENCY-SPECIFIC OVERRIDES section below.\n" +
    loadedLines +
    "\n\n" +
    "C) RECOGNIZED BUT NOT LOADED RIGHT NOW — these agencies are known, but their plan details are NOT available in this tool right now (a different carrier, or turned off). Do NOT fall back to the Engage or Direct Care defaults for their health benefits, because that would give the wrong plan. Instead, confirm you recognize the agency, explain that their specific medical / dental / vision details aren't in this tool right now, and send them to HR (benefits help form or HR@honorhealthnetwork.com). The 401(k) is still the same for them and can be answered normally.\n" +
    offLines;

  // {{PLAN_PACKAGES}} — the enabled plan/agency content blocks.
  const blocks = [];
  if (engage && on(engage)) blocks.push(engage.body);
  if (directCare && on(directCare)) blocks.push(directCare.body);
  if (loaded.length) {
    blocks.push(
      "=====================================================================\n" +
        "# AGENCY-SPECIFIC OVERRIDES\n" +
        "# Each block below replaces the default plan for ONE agency. Only use a block\n" +
        "# when the person has confirmed they work for that agency (see AGENCY ROUTING).\n" +
        "# A block states which ROLE it applies to and what stays on the default.\n" +
        "====================================================================="
    );
    for (const p of loaded) blocks.push(p.body);
  }
  const planPackages = blocks.join("\n\n");

  const body = core ? core.body : "";
  const tokens = {
    "{{ENGAGE_STATUS}}": engageStatus,
    "{{DIRECT_CARE_STATUS}}": directCareStatus,
    "{{AGENCY_OVERRIDES}}": agencyOverrides,
    "{{PLAN_PACKAGES}}": planPackages,
  };
  let out = body;
  for (const [token, value] of Object.entries(tokens)) {
    out = out.split(token).join(value); // replace every occurrence
  }
  const leftover = out.match(/\{\{[A-Z_]+\}\}/);
  if (leftover) {
    console.warn(`assembleKnowledge: unfilled marker ${leftover[0]} in core.md`);
  }
  return out.trim();
}

// A compact view of each package for the admin dashboard (no full body).
export function packageSummaries(pkgs, enabledState) {
  return pkgs.map((p) => ({
    id: p.id,
    title: p.title,
    type: p.type,
    slot: p.slot,
    locked: p.locked,
    enabled: isEnabled(p, enabledState),
    summary: p.summary,
    sizeChars: p.sizeChars,
  }));
}
