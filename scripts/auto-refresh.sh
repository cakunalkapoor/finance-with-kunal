#!/bin/bash
# Finance with Kunal — automated data refresh
# Triggered DAILY at 8 AM IST by launchd (StartCalendarInterval wakes Mac from sleep).
# The 3-day interval is enforced by a .last-refresh timestamp file below.
# Logs to: logs/refresh.log

# ── Environment ────────────────────────────────────────────────────────────────
# launchd runs with a minimal PATH — add Homebrew + common node locations
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# Load nvm if present (used when node was installed via nvm)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" --no-use

PROJECT="/Users/kunalkapoor/Downloads/finance-with-kunal"
LOG="$PROJECT/logs/refresh.log"

mkdir -p "$PROJECT/logs"

log() { echo "  $1" >> "$LOG"; }

# ── 3-day interval guard ───────────────────────────────────────────────────────
# launchd fires this DAILY (to get wake-from-sleep). We skip unless 3+ days
# have passed since the last successful run.
STAMP="$PROJECT/.last-refresh"
INTERVAL=$((3 * 86400))   # 3 days in seconds

if [ -f "$STAMP" ]; then
  LAST=$(cat "$STAMP")
  NOW=$(date +%s)
  ELAPSED=$(( NOW - LAST ))
  DAYS=$(( ELAPSED / 86400 ))
  if [ "$ELAPSED" -lt "$INTERVAL" ]; then
    # Silent exit — no log spam on the skipped days
    exit 0
  fi
fi

echo "" >> "$LOG"
echo "━━━━ Auto-refresh: $(date '+%Y-%m-%d %H:%M:%S') ━━━━" >> "$LOG"

cd "$PROJECT" || { echo "✗ Cannot cd to project — aborting" >> "$LOG"; exit 1; }

# Load API keys from .env.local (FRED_API_KEY etc.)
if [ -f .env.local ]; then
  while IFS='=' read -r key val; do
    [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
    export "$key"="${val//\"/}"
  done < .env.local
  log "✓ Loaded .env.local"
else
  log "⚠ No .env.local found — FRED fetch may fail"
fi

# ── Python venv ────────────────────────────────────────────────────────────────
if [ ! -f ".venv/bin/python3" ]; then
  log "→ Python venv missing — running setup..."
  npm run fetch:yahoo:setup >> "$LOG" 2>&1
fi

# ── Fetch scripts ──────────────────────────────────────────────────────────────
log "→ fetch:yahoo (equity indices, crypto, FX)..."
npm run fetch:yahoo >> "$LOG" 2>&1 \
  && log "  ✓ yahoo done" \
  || log "  ✗ yahoo failed"

log "→ fetch:fred (bonds, GDP, CPI, unemployment)..."
npm run fetch:fred >> "$LOG" 2>&1 \
  && log "  ✓ fred done" \
  || log "  ✗ fred failed"

log "→ fetch:data (Alpha Vantage commodities)..."
npm run fetch:data >> "$LOG" 2>&1 \
  && log "  ✓ data done" \
  || log "  ✗ data failed / no fresh AV dumps to process"

log "→ fetch:heatmap (S&P 500 / TSX / NIFTY constituents)..."
npm run fetch:heatmap >> "$LOG" 2>&1 \
  && log "  ✓ heatmap done" \
  || log "  ✗ heatmap failed"

# ── Patch fetched values into the tracked data file ─────────────────────────────
log "→ patch site-data.ts (Yahoo + FRED → equities, bonds, macro, commodities, crypto, FX)..."
node scripts/patch-site-data.mjs >> "$LOG" 2>&1 \
  && log "  ✓ site-data patched" \
  || log "  ✗ site-data patch failed"

log "→ patch:heatmap (heatmap section)..."
npm run patch:heatmap >> "$LOG" 2>&1 \
  && log "  ✓ heatmap patched" \
  || log "  ✗ heatmap patch failed"

# ── Commit & push ──────────────────────────────────────────────────────────────
if ! git diff --quiet src/lib/; then
  CHANGED=$(git diff --name-only src/lib/ | wc -l | tr -d ' ')
  log "→ $CHANGED file(s) changed in src/lib/ — committing..."
  git add src/lib/
  git commit -m "data: automated refresh $(date '+%Y-%m-%d')" >> "$LOG" 2>&1
  git push origin main >> "$LOG" 2>&1 \
    && log "  ✓ pushed to origin/main" \
    || log "  ✗ push failed — check git credentials"
else
  log "→ No changes in src/lib/ — nothing to commit"
fi

# Record successful completion time for the 3-day interval guard
date +%s > "$STAMP"

echo "━━━━ Done ━━━━" >> "$LOG"
