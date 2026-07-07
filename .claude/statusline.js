#!/usr/bin/env node
// ============================================================================
// Claude Code Statusline — Small (2-line) Edition (Node.js port, no jq needed)
// Line 1: 🧠 Model ⚡effort 💡 │ 🌿branch🚧 │ 📂 ~/path
// Line 2: 📝 ████░░░░░░ 44% │ 🚀 5H ███░░░░░░░ 31% (2h10m) · 7D ██████░░░░ 58% (Mon)
// ============================================================================

const { execSync } = require("child_process");

function readStdin() {
  const chunks = [];
  const fd = 0;
  const buf = Buffer.alloc(65536);
  const fs = require("fs");
  while (true) {
    let bytes;
    try {
      bytes = fs.readSync(fd, buf, 0, buf.length, null);
    } catch (e) {
      if (e.code === "EAGAIN") continue;
      break;
    }
    if (bytes === 0) break;
    chunks.push(Buffer.from(buf.slice(0, bytes)));
  }
  return Buffer.concat(chunks).toString("utf8");
}

let input = {};
try {
  input = JSON.parse(readStdin());
} catch (e) {
  input = {};
}

const get = (obj, path, fallback) => {
  try {
    const val = path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
    return val === undefined || val === null ? fallback : val;
  } catch (e) {
    return fallback;
  }
};

const MODEL = get(input, "model.display_name", "Unknown");
const CURRENT_DIR = get(input, "workspace.current_dir", ".");
const CONTEXT_SIZE = get(input, "context_window.context_window_size", 200000);
const CURRENT_USAGE = get(input, "context_window.current_usage", null);
const FIVE_HOUR_PCT = get(input, "rate_limits.five_hour.used_percentage", null);
const FIVE_HOUR_RESET = get(input, "rate_limits.five_hour.resets_at", null);
const SEVEN_DAY_PCT = get(input, "rate_limits.seven_day.used_percentage", null);
const SEVEN_DAY_RESET = get(input, "rate_limits.seven_day.resets_at", null);
const EFFORT = get(input, "effort.level", "");
const THINKING = get(input, "thinking.enabled", false);

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const CLR = "\x1b[K";
const C_PINK = "\x1b[38;2;245;194;231m";
const C_LAVENDER = "\x1b[38;2;180;190;254m";
const C_SKY = "\x1b[38;2;137;220;235m";
const C_TEXT = "\x1b[38;2;205;214;244m";
const C_PEACH = "\x1b[38;2;250;179;135m";
const C_OVERLAY = "\x1b[38;2;108;112;134m";
const C_BLUE = "\x1b[38;2;137;180;250m";
const C_GREEN = "\x1b[38;2;64;160;43m";

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

// Context gradient: Latte Yellow(0%) -> Latte Red(50%) -> Mauve(100%)
function getContextGradientColor(pct) {
  let r, g, b;
  if (pct < 50) {
    const t = (pct * 2) / 100;
    r = lerp(223, 210, t);
    g = lerp(142, 15, t);
    b = lerp(29, 57, t);
  } else {
    const t = ((pct - 50) * 2) / 100;
    r = lerp(210, 136, t);
    g = lerp(15, 57, t);
    b = lerp(57, 239, t);
  }
  return `${r};${g};${b}`;
}

// Usage gradient: Mocha Green -> Latte Teal -> Latte Blue
function getUsageGradientColor(pct) {
  let r, g, b;
  if (pct < 50) {
    const t = (pct * 2) / 100;
    r = lerp(166, 23, t);
    g = lerp(227, 146, t);
    b = lerp(161, 153, t);
  } else {
    const t = ((pct - 50) * 2) / 100;
    r = lerp(23, 30, t);
    g = lerp(146, 102, t);
    b = lerp(153, 245, t);
  }
  return `${r};${g};${b}`;
}

function generateProgressBar(pct, width, gradientType) {
  const getColor = gradientType === "context" ? getContextGradientColor : getUsageGradientColor;
  const filled = Math.min(width, Math.round((pct * width) / 100));
  const endColor = getColor(pct);
  let bar = "";
  for (let i = 0; i < filled; i++) {
    const blockPct = Math.floor((i * 100) / width);
    bar += `\x1b[38;2;${getColor(blockPct)}m█`;
  }
  for (let i = filled; i < width; i++) {
    bar += `\x1b[38;2;${endColor}m░`;
  }
  bar += RESET;
  return bar;
}

// Model with emoji
let MODEL_DISPLAY;
if (/Opus/.test(MODEL)) MODEL_DISPLAY = `🧠 ${C_PINK}${MODEL}${RESET}`;
else if (/Sonnet/.test(MODEL)) MODEL_DISPLAY = `🎵 ${C_LAVENDER}${MODEL}${RESET}`;
else if (/Haiku/.test(MODEL)) MODEL_DISPLAY = `⚡️ ${C_SKY}${MODEL}${RESET}`;
else MODEL_DISPLAY = `🤖 ${C_TEXT}${MODEL}${RESET}`;

if (EFFORT) MODEL_DISPLAY += ` ${C_PEACH}⚡${EFFORT}${RESET}`;
if (THINKING === true) MODEL_DISPLAY += ` \x1b[38;2;249;226;175m💡${RESET}`;

// Git: branch + dirty marker
let GIT_DISPLAY = `${C_OVERLAY}no git${RESET}`;
try {
  execSync("git rev-parse --git-dir", { cwd: CURRENT_DIR, stdio: "ignore" });
  let branch = "";
  try {
    branch = execSync("git branch --show-current", { cwd: CURRENT_DIR }).toString().trim();
  } catch (e) {}
  if (!branch) branch = "detached";
  let dirty = false;
  try {
    execSync("git diff --quiet", { cwd: CURRENT_DIR });
    execSync("git diff --cached --quiet", { cwd: CURRENT_DIR });
  } catch (e) {
    dirty = true;
  }
  GIT_DISPLAY = dirty
    ? `${C_GREEN}🌿${branch}${RESET}${C_PEACH}🚧${RESET}`
    : `${C_GREEN}🌿${branch}${RESET}`;
} catch (e) {
  // not a git repo
}

// Context percent + bar
let CONTEXT_PERCENT = 0;
if (CURRENT_USAGE) {
  const inputTokens = get(CURRENT_USAGE, "input_tokens", 0);
  const cacheCreate = get(CURRENT_USAGE, "cache_creation_input_tokens", 0);
  const cacheRead = get(CURRENT_USAGE, "cache_read_input_tokens", 0);
  const currentTokens = inputTokens + cacheCreate + cacheRead;
  if (CONTEXT_SIZE > 0) CONTEXT_PERCENT = Math.floor((currentTokens * 100) / CONTEXT_SIZE);
}
const CTX_COLOR = getContextGradientColor(CONTEXT_PERCENT);
const CTX_BAR = generateProgressBar(CONTEXT_PERCENT, 10, "context");
const CTX_DISPLAY = `📝 ${CTX_BAR} \x1b[38;2;${CTX_COLOR}m${CONTEXT_PERCENT}%${RESET}`;

// Directory (home abbreviated to ~)
const HOME = process.env.HOME || process.env.USERPROFILE || "";
let dirCompact = CURRENT_DIR;
if (HOME) {
  const normHome = HOME.replace(/\\/g, "/");
  const normDir = CURRENT_DIR.replace(/\\/g, "/");
  if (normDir.startsWith(normHome)) dirCompact = "~" + normDir.slice(normHome.length);
  else dirCompact = normDir;
}
const DIR_DISPLAY = `📂 ${C_BLUE}${dirCompact}${RESET}`;

const LINE1 = `${BOLD}${MODEL_DISPLAY}${RESET} │ ${GIT_DISPLAY} │ ${DIR_DISPLAY}`;

function formatTimeRemaining(resetEpoch) {
  if (!resetEpoch) return "";
  const now = Math.floor(Date.now() / 1000);
  let remaining = resetEpoch - now;
  if (remaining < 0) remaining = 0;
  return `${Math.floor(remaining / 3600)}h${Math.floor((remaining % 3600) / 60)}m`;
}

function dateFmtDay(epoch) {
  if (!epoch) return "";
  const d = new Date(epoch * 1000);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[d.getDay()];
}

let LINE2;
if (FIVE_HOUR_PCT !== null && FIVE_HOUR_PCT !== undefined) {
  const fiveHour = Math.round(FIVE_HOUR_PCT);
  const sevenDay = Math.round(SEVEN_DAY_PCT || 0);
  const fiveResetFmt = formatTimeRemaining(FIVE_HOUR_RESET);
  const sevenResetFmt = dateFmtDay(SEVEN_DAY_RESET);
  const fiveBar = generateProgressBar(fiveHour, 10, "usage");
  const sevenBar = generateProgressBar(sevenDay, 10, "usage");
  const fiveColor = getUsageGradientColor(fiveHour);
  const sevenColor = getUsageGradientColor(sevenDay);
  LINE2 =
    `${CTX_DISPLAY} │ 🚀 \x1b[38;2;${fiveColor}m5H${RESET} ${fiveBar} \x1b[38;2;${fiveColor}m${fiveHour}%${RESET} ${C_OVERLAY}(${fiveResetFmt})${RESET} · ` +
    `\x1b[38;2;${sevenColor}m7D${RESET} ${sevenBar} \x1b[38;2;${sevenColor}m${sevenDay}%${RESET} ${C_OVERLAY}(${sevenResetFmt})${RESET}`;
} else {
  LINE2 = `${CTX_DISPLAY} │ ${C_OVERLAY}🚀 Usage: unavailable${RESET}`;
}

process.stdout.write(`${LINE1}${CLR}\n`);
process.stdout.write(`${LINE2}${CLR}\n`);
