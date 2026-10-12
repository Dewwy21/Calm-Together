#!/bin/bash
# Calm Together — One-Click Launcher
#
# Double-click this file in Finder to:
#   1. Start the local OpenFace FastAPI service (if not already running).
#   2. Start the Calm Together Expo Web dev server (if not already running).
#   3. Wait until both report ready.
#   4. Open the app in Chrome.
#
# Safe to double-click more than once: it detects services it already
# started (or that are already running some other way) and skips starting
# duplicates. It never installs dependencies, downloads model weights, or
# requires administrator permission.
#
# To stop everything this script started, double-click stop-calm-together.command.

set -u
set -m # job control: each backgrounded service gets its OWN process group,
       # so stop-calm-together.command can kill a whole group (including
       # any child process it spawns, e.g. npx's own child) instead of
       # just the top PID — without this, a non-interactive script leaves
       # every background job in the script's own group, and a group-kill
       # would hit the wrong target entirely.

PROJECT_ROOT="/Users/EliTan/Code extensions"
OPENFACE_DIR="$PROJECT_ROOT/openface-service"
RUNTIME_DIR="$PROJECT_ROOT/.launcher"
OPENFACE_PID_FILE="$RUNTIME_DIR/openface.pid"
EXPO_PID_FILE="$RUNTIME_DIR/expo.pid"
OPENFACE_LOG="$RUNTIME_DIR/openface.log"
EXPO_LOG="$RUNTIME_DIR/expo.log"
OPENFACE_URL="http://127.0.0.1:8000"
EXPO_URL="http://localhost:8099"

mkdir -p "$RUNTIME_DIR"

fail() {
  echo ""
  echo "ERROR: $1"
  echo ""
  echo "Press Return to close this window."
  read -r _ || true
  exit 1
}

# True if the PID recorded in $1 is alive AND its command line contains $2
# (this is what lets Stop later kill only processes THIS launcher started,
# never some unrelated process that happens to reuse a PID).
is_owned_process_alive() {
  local pidfile="$1"
  local expected_substring="$2"
  [ -f "$pidfile" ] || return 1
  local pid
  pid=$(cat "$pidfile" 2>/dev/null)
  [ -n "${pid:-}" ] || return 1
  kill -0 "$pid" 2>/dev/null || return 1
  local cmd
  cmd=$(ps -p "$pid" -o command= 2>/dev/null)
  case "$cmd" in
    *"$expected_substring"*) return 0 ;;
    *) return 1 ;;
  esac
}

wait_for_http() {
  local url="$1"
  local timeout_sec="$2"
  local waited=0
  while true; do
    if curl -s -o /dev/null -m 2 "$url"; then
      return 0
    fi
    sleep 1
    waited=$((waited + 1))
    [ "$waited" -ge "$timeout_sec" ] && return 1
  done
}

wait_for_openface_ready() {
  local timeout_sec="$1"
  local waited=0
  local body
  while true; do
    body=$(curl -s -m 2 "$OPENFACE_URL/health" 2>/dev/null)
    if echo "$body" | grep -q '"modelLoaded"[[:space:]]*:[[:space:]]*true'; then
      return 0
    fi
    sleep 1
    waited=$((waited + 1))
    [ "$waited" -ge "$timeout_sec" ] && return 1
  done
}

echo "=== Calm Together Launcher ==="
echo ""

# --- OpenFace FastAPI --------------------------------------------------
if is_owned_process_alive "$OPENFACE_PID_FILE" "uvicorn"; then
  echo "OpenFace service already running (PID $(cat "$OPENFACE_PID_FILE")) — skipping."
elif curl -s -o /dev/null -m 2 "$OPENFACE_URL/health"; then
  echo "OpenFace service already responding on $OPENFACE_URL (started outside this launcher) — skipping, and Stop will leave it alone."
else
  echo "Starting OpenFace service..."
  if [ ! -x "$OPENFACE_DIR/venv/bin/python" ]; then
    fail "Python virtual environment not found at $OPENFACE_DIR/venv — set it up first (see openface-service/README.md). This launcher never creates it automatically."
  fi
  cd "$OPENFACE_DIR" || fail "Could not enter $OPENFACE_DIR"
  "$OPENFACE_DIR/venv/bin/python" -m uvicorn server:app --host 127.0.0.1 --port 8000 > "$OPENFACE_LOG" 2>&1 &
  OPENFACE_PID=$!
  echo "$OPENFACE_PID" > "$OPENFACE_PID_FILE"
  cd "$PROJECT_ROOT" || fail "Could not return to $PROJECT_ROOT"
  echo "  (PID $OPENFACE_PID, log: $OPENFACE_LOG)"
fi

# --- Calm Together (Expo Web) -------------------------------------------
if is_owned_process_alive "$EXPO_PID_FILE" "expo start"; then
  echo "Calm Together (Expo Web) already running (PID $(cat "$EXPO_PID_FILE")) — skipping."
elif curl -s -o /dev/null -m 2 "$EXPO_URL"; then
  echo "Calm Together already responding on $EXPO_URL (started outside this launcher) — skipping, and Stop will leave it alone."
else
  echo "Starting Calm Together (Expo Web)..."
  if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    fail "node_modules not found at $PROJECT_ROOT — run 'npm install' first. This launcher never installs dependencies automatically."
  fi
  cd "$PROJECT_ROOT" || fail "Could not enter $PROJECT_ROOT"
  npx expo start --web --port 8099 > "$EXPO_LOG" 2>&1 &
  EXPO_PID=$!
  echo "$EXPO_PID" > "$EXPO_PID_FILE"
  echo "  (PID $EXPO_PID, log: $EXPO_LOG)"
fi

echo ""
echo "Waiting for the OpenFace model to finish loading (this can take a little while on a cold start)..."
if ! wait_for_openface_ready 90; then
  echo ""
  echo "----- last 20 lines of $OPENFACE_LOG -----"
  tail -n 20 "$OPENFACE_LOG" 2>/dev/null
  echo "-------------------------------------------"
  fail "OpenFace service did not report a loaded model within 90 seconds. See the log above (full log: $OPENFACE_LOG)."
fi
echo "OpenFace service is ready."

echo "Waiting for Calm Together (Expo Web)..."
if ! wait_for_http "$EXPO_URL" 60; then
  echo ""
  echo "----- last 20 lines of $EXPO_LOG -----"
  tail -n 20 "$EXPO_LOG" 2>/dev/null
  echo "----------------------------------------"
  fail "Expo web server did not become ready within 60 seconds. See the log above (full log: $EXPO_LOG)."
fi
echo "Calm Together is ready."

echo ""
echo "Opening $EXPO_URL in Chrome..."
open -a "Google Chrome" "$EXPO_URL" 2>/dev/null || open "$EXPO_URL"

echo ""
echo "Both services are running:"
echo "  OpenFace:      $OPENFACE_URL   (log: $OPENFACE_LOG)"
echo "  Calm Together: $EXPO_URL   (log: $EXPO_LOG)"
echo ""
echo "To stop them, double-click stop-calm-together.command."
echo ""
echo "This window will close in a few seconds..."
sleep 3
