#!/bin/bash
# ============================================================================
# Claude Code Statusline — Small (2-line) Edition
# ============================================================================
# Line 1: 🧠 Model ⚡effort 💡 │ 🌿branch🚧 │ 📂 ~/path
# Line 2: 📝 ████░░░░░░ 44% │ 🚀 5H ███░░░░░░░ 31% (2h10m) · 7D ██████░░░░ 58% (Mon)
# Derived from awesome-statusline.sh v1.0.3 (same parsing/gradients, compact)
# ============================================================================

export PATH="$(dirname "$0"):$PATH"

input=$(cat)

# jq is not available on this machine — parse the JSON with node instead.
NODE_FIELDS=$(printf '%s' "$input" | node -e '
const chunks = [];
process.stdin.on("data", d => chunks.push(d));
process.stdin.on("end", () => {
  let data = {};
  try { data = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch (e) {}
  const g = (path, def) => {
    let o = data;
    for (const p of path.split(".")) {
      if (o === null || o === undefined || o[p] === undefined || o[p] === null) return def;
      o = o[p];
    }
    return o;
  };
  const usage = g("context_window.current_usage", null);
  const lines = [
    g("model.display_name", "Unknown"),
    g("workspace.current_dir", "."),
    g("context_window.context_window_size", 200000),
    usage ? (usage.input_tokens || 0) : 0,
    usage ? (usage.cache_creation_input_tokens || 0) : 0,
    usage ? (usage.cache_read_input_tokens || 0) : 0,
    g("rate_limits.five_hour.used_percentage", ""),
    g("rate_limits.five_hour.resets_at", ""),
    g("rate_limits.seven_day.used_percentage", ""),
    g("rate_limits.seven_day.resets_at", ""),
    g("effort.level", ""),
    g("thinking.enabled", ""),
    "STATUSLINE_END"
  ];
  process.stdout.write(lines.join("\n") + "\n");
});
')

mapfile -t SF <<< "$NODE_FIELDS"
MODEL="${SF[0]}"
CURRENT_DIR="${SF[1]}"
CONTEXT_SIZE="${SF[2]}"
INPUT_TOKENS="${SF[3]}"
CACHE_CREATE="${SF[4]}"
CACHE_READ="${SF[5]}"
FIVE_HOUR_PCT="${SF[6]}"
FIVE_HOUR_RESET="${SF[7]}"
SEVEN_DAY_PCT="${SF[8]}"
SEVEN_DAY_RESET="${SF[9]}"
EFFORT="${SF[10]}"
THINKING="${SF[11]}"

# Normalize Windows backslash paths to forward slashes: avoids printf %b
# misreading "\Users\..." as a \U unicode escape, and lets the ~ substitution
# below match bash's forward-slash $HOME.
CURRENT_DIR="${CURRENT_DIR//\\//}"

RESET="\033[0m"
BOLD="\033[1m"
CLR="\033[K"
C_PINK="\033[38;2;245;194;231m"
C_LAVENDER="\033[38;2;180;190;254m"
C_SKY="\033[38;2;137;220;235m"
C_TEXT="\033[38;2;205;214;244m"
C_PEACH="\033[38;2;250;179;135m"
C_OVERLAY="\033[38;2;108;112;134m"

# Context gradient: Latte Yellow(0%) → Latte Red(50%) → Mauve(100%)
get_context_gradient_color() {
    local pct=$1 r g b
    if [[ $pct -lt 50 ]]; then
        local t=$((pct * 2))
        r=$((223 + (210 - 223) * t / 100)); g=$((142 + (15 - 142) * t / 100)); b=$((29 + (57 - 29) * t / 100))
    else
        local t=$(((pct - 50) * 2))
        r=$((210 + (136 - 210) * t / 100)); g=$((15 + (57 - 15) * t / 100)); b=$((57 + (239 - 57) * t / 100))
    fi
    echo "$r;$g;$b"
}

# Usage gradient: Mocha Green → Latte Teal → Latte Blue
get_usage_gradient_color() {
    local pct=$1 r g b
    if [[ $pct -lt 50 ]]; then
        local t=$((pct * 2))
        r=$((166 + (23 - 166) * t / 100)); g=$((227 + (146 - 227) * t / 100)); b=$((161 + (153 - 161) * t / 100))
    else
        local t=$(((pct - 50) * 2))
        r=$((23 + (30 - 23) * t / 100)); g=$((146 + (102 - 146) * t / 100)); b=$((153 + (245 - 153) * t / 100))
    fi
    echo "$r;$g;$b"
}

# Gradient progress bar (same as big version)
generate_progress_bar() {
    local pct=$1 width=$2 gradient_type=$3 bar=""
    local filled=$(( (pct * width + 50) / 100 ))
    [[ $filled -gt $width ]] && filled=$width
    local end_color
    if [[ "$gradient_type" == "context" ]]; then
        end_color=$(get_context_gradient_color "$pct")
    else
        end_color=$(get_usage_gradient_color "$pct")
    fi
    for ((i=0; i<filled; i++)); do
        local block_pct=$((i * 100 / width))
        local color
        if [[ "$gradient_type" == "context" ]]; then
            color=$(get_context_gradient_color "$block_pct")
        else
            color=$(get_usage_gradient_color "$block_pct")
        fi
        bar+="\033[38;2;${color}m█"
    done
    local empty=$((width - filled))
    for ((i=0; i<empty; i++)); do
        bar+="\033[38;2;${end_color}m░"
    done
    bar+="$RESET"
    printf "%b" "$bar"
}

# Model with emoji
case "$MODEL" in
    *Opus*) MODEL_DISPLAY="🧠 ${C_PINK}${MODEL}${RESET}" ;;
    *Sonnet*) MODEL_DISPLAY="🎵 ${C_LAVENDER}${MODEL}${RESET}" ;;
    *Haiku*) MODEL_DISPLAY="⚡️ ${C_SKY}${MODEL}${RESET}" ;;
    *) MODEL_DISPLAY="🤖 ${C_TEXT}${MODEL}${RESET}" ;;
esac
[ -n "$EFFORT" ] && MODEL_DISPLAY="${MODEL_DISPLAY} ${C_PEACH}⚡${EFFORT}${RESET}"
[ "$THINKING" = "true" ] && MODEL_DISPLAY="${MODEL_DISPLAY} \033[38;2;249;226;175m💡${RESET}"

# Git: branch + dirty marker in one token
GIT_DISPLAY="${C_OVERLAY}no git${RESET}"
cd "$CURRENT_DIR" 2>/dev/null
if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null)
    [[ -z "$BRANCH" ]] && BRANCH="detached"
    if git diff --quiet && git diff --cached --quiet 2>/dev/null; then
        GIT_DISPLAY="\033[38;2;64;160;43m🌿${BRANCH}${RESET}"
    else
        GIT_DISPLAY="\033[38;2;64;160;43m🌿${BRANCH}${RESET}${C_PEACH}🚧${RESET}"
    fi
fi

# Context percent + bar (10 cols, lives on line 2 with the usage bars)
CONTEXT_PERCENT=0
CURRENT_TOKENS=$(( ${INPUT_TOKENS:-0} + ${CACHE_CREATE:-0} + ${CACHE_READ:-0} ))
[[ "$CONTEXT_SIZE" -gt 0 ]] && CONTEXT_PERCENT=$((CURRENT_TOKENS * 100 / CONTEXT_SIZE))
CTX_COLOR=$(get_context_gradient_color "$CONTEXT_PERCENT")
CTX_BAR=$(generate_progress_bar "$CONTEXT_PERCENT" 10 "context")
CTX_DISPLAY="📝 ${CTX_BAR} \033[38;2;${CTX_COLOR}m${CONTEXT_PERCENT}%${RESET}"

# Directory (home abbreviated to ~). On Windows, $HOME (/c/Users/...) and the
# drive-letter path the harness sends (C:/Users/... after normalization above)
# use different notations for the same folder, so also try $USERPROFILE.
# Prefix is stripped and "~" prepended via concatenation, not via
# ${var/pattern/~} — bash tilde-expands a literal ~ used as replacement text,
# which would silently turn it back into $HOME instead of staying "~".
DIR_COMPACT="$CURRENT_DIR"
if [[ -n "$USERPROFILE" ]]; then
    USERPROFILE_NORM="${USERPROFILE//\\//}"
    [[ "$DIR_COMPACT" == "$USERPROFILE_NORM"* ]] && DIR_COMPACT="~${DIR_COMPACT#$USERPROFILE_NORM}"
fi
[[ "$DIR_COMPACT" == "$HOME"* ]] && DIR_COMPACT="~${DIR_COMPACT#$HOME}"
C_BLUE="\033[38;2;137;180;250m"
DIR_DISPLAY="📂 ${C_BLUE}${DIR_COMPACT}${RESET}"

LINE1="${BOLD}${MODEL_DISPLAY}${RESET} │ ${GIT_DISPLAY} │ ${DIR_DISPLAY}"

# Usage reset formatting
format_time_remaining() {
    local reset_epoch="$1"
    [[ -z "$reset_epoch" || "$reset_epoch" == "null" ]] && return
    local now_epoch=$(date +%s)
    local remaining=$((reset_epoch - now_epoch))
    [[ $remaining -lt 0 ]] && remaining=0
    echo "$((remaining / 3600))h$(((remaining % 3600) / 60))m"
}
# LINE 2: usage bars (10 cols each)
if [[ -n "$FIVE_HOUR_PCT" ]]; then
    FIVE_HOUR=$(printf "%.0f" "$FIVE_HOUR_PCT")
    SEVEN_DAY=$(printf "%.0f" "${SEVEN_DAY_PCT:-0}")
    FIVE_RESET_FMT=$(format_time_remaining "$FIVE_HOUR_RESET")
    SEVEN_RESET_FMT=$(format_time_remaining "$SEVEN_DAY_RESET")
    FIVE_BAR=$(generate_progress_bar "$FIVE_HOUR" 10 "usage")
    SEVEN_BAR=$(generate_progress_bar "$SEVEN_DAY" 10 "usage")
    FIVE_COLOR=$(get_usage_gradient_color "$FIVE_HOUR")
    SEVEN_COLOR=$(get_usage_gradient_color "$SEVEN_DAY")
    LINE2="${CTX_DISPLAY} │ 🚀 \033[38;2;${FIVE_COLOR}m5H${RESET} ${FIVE_BAR} \033[38;2;${FIVE_COLOR}m${FIVE_HOUR}%${RESET} ${C_OVERLAY}(${FIVE_RESET_FMT})${RESET} · \033[38;2;${SEVEN_COLOR}m7D${RESET} ${SEVEN_BAR} \033[38;2;${SEVEN_COLOR}m${SEVEN_DAY}%${RESET} ${C_OVERLAY}(${SEVEN_RESET_FMT})${RESET}"
else
    LINE2="${CTX_DISPLAY} │ ${C_OVERLAY}🚀 Usage: unavailable${RESET}"
fi

printf "%b%b\n" "$LINE1" "$CLR"
printf "%b%b\n" "$LINE2" "$CLR"
