#!/bin/bash
# Calm Together — Stop Services
#
# Double-click this file in Finder to stop whatever
# start-calm-together.command started. It only ever stops processes it can
# confirm it started itself (tracked by PID file + a command-line check) —
# never a broad "kill anything on this port" sweep, so it can't take down
# some unrelated dev server that happens to be running.

set -u

PROJECT_ROOT="/Users/EliTan/Code extensions"
RUNTIME_DIR="$PROJECT_ROOT/.launcher"
OPENFACE_PID_FILE="$RUNTIME_DIR/openface.pid"
EXPO_PID_FILE="$RUNTIME_DIR/expo.pid"

echo "=== Calm Together — Stop Services ==="
echo ""

stop_owned() {
  local pidfile="$1"
  local expected_substring="$2"
  local label="$3"

  if [ ! -f "$pidfile" ]; then
    echo "$label: nothing tracked by this launcher — nothing to stop."
    return
  fi

  local pid
  pid=$(cat "$pidfile" 2>/dev/null)
  if [ -z "${pid:-}" ] || ! kill -0 "$pid" 2>/dev/null; then
    echo "$label: tracked process is not running — nothing to stop."
    rm -f "$pidfile"
    return
  fi

  local cmd
  cmd=$(ps -p "$pid" -o command= 2>/dev/null)
  case "$cmd" in
    *"$expected_substring"*)
      echo "$label: stopping PID $pid..."
      # Negative PID = send the signal to the whole process group this
      # launcher created for that job, so any child process it spawned
      # (e.g. npx's own child) is stopped too, not just the top PID.
      kill -TERM "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null
      for _ in 1 2 3 4 5; do
        kill -0 "$pid" 2>/dev/null || break
        sleep 1
      done
      if kill -0 "$pid" 2>/dev/null; then
        echo "$label: did not stop gracefully within 5 seconds, forcing..."
        kill -KILL "-$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null
      fi
      rm -f "$pidfile"
      echo "$label: stopped."
      ;;
    *)
      echo "$label: PID $pid is no longer the process this launcher started (command line doesn't match) — leaving it alone for safety."
      rm -f "$pidfile"
      ;;
  esac
}

stop_owned "$OPENFACE_PID_FILE" "uvicorn" "OpenFace service"
stop_owned "$EXPO_PID_FILE" "expo start" "Calm Together (Expo Web)"

echo ""
echo "Done. This window will close in a few seconds..."
sleep 3
