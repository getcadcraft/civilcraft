#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0
# run.sh — run one GPU or heavy test on the owner's workstation (workstation11a) and bring the results back (0.8 KICKOFF rule 25).
#
#   tools/gpu-remote/run.sh --session <name> [--lab] [--with <path>]... [--wsl] [--timeout <s>] -- <test.mjs> [test args]
#
#   --session  your session name (the run folder and the results folder are named after it)
#   --lab      mint a signed-in /lab session here (shell test admin) and pass it in CC_LAB_COOKIE (env only, never a file)
#   --with     another repo path the test reads (fixtures, a scenes file); the test's own folder and tools/gpu-remote always go
#   --wsl      run with the workstation's Linux Node instead (CPU-heavy work: field grids, NURBS sweeps, benchmarks); no browser GPU there
#   --timeout  seconds (default 1800)
#
# Browser tests run with the Windows Node + Windows Chrome (the real GPU); WSL has only SwiftShader. Use
# tools/gpu-remote/browser.mjs for the launch so the same test still runs here.
# One job at a time on the workstation (flock), and not while its display GPU is busy (the owner's desktop: > 50 % → wait).
# Two runs with the same --session share one remote folder, and the second one's cleanup deletes the first one's tmp/: when a run
# starts while another is waiting, give it a different --session name.
# Timings (owner 2026-11-22, for scheduling): every run appends one JSON line to tmp/gpu-runs/timings.jsonl with the time spent copying,
# waiting for the workstation lock, waiting for the display GPU, and running the test (`node tools/gpu-remote/timings.mjs` sums them up).
# Results: tmp/gpu-runs/<session>/<stamp>/ = run.log + whatever the test wrote under tmp/ there. Put the numbers in your
# log's ## Results with the machine line the test printed. The run folder there is emptied after each run.
set -euo pipefail
HOST=${CC_GPU_HOST:-ws11a}
REPO=$(cd "$(dirname "$0")/../.." && pwd)
SESSION='' LAB=0 WSL=0 TIMEOUT=1800 WITH=()
while [ $# -gt 0 ]; do
  case "$1" in
    --session) SESSION=$2; shift 2 ;;
    --lab) LAB=1; shift ;;
    --with) WITH+=("$2"); shift 2 ;;
    --wsl) WSL=1; shift ;;
    --timeout) TIMEOUT=$2; shift 2 ;;
    --) shift; break ;;
    *) echo "unknown option $1" >&2; exit 2 ;;
  esac
done
[ -n "$SESSION" ] && [ $# -ge 1 ] || { sed -n 3,12p "$0" >&2; exit 2; }
[[ "$SESSION" =~ ^[a-z0-9-]+$ ]] || { echo "session name: a-z 0-9 -" >&2; exit 2; }
TEST=$1; shift
[ -f "$REPO/$TEST" ] || { echo "no such test: $TEST" >&2; exit 2; }

T_QUEUED=$(date +%s)
STAMP=$(date -u +%Y%m%d-%H%M%S)
OUT="$REPO/tmp/gpu-runs/$SESSION/$STAMP"; mkdir -p "$OUT"
if [ $WSL = 1 ]; then RUNDIR="cc-runs/$SESSION"; RHOME='~'; else RUNDIR="cc-runs/$SESSION"; RHOME=/mnt/c/Users/Public; fi
R="$RHOME/$RUNDIR"

COOKIE=''
if [ $LAB = 1 ]; then COOKIE=$(sudo -u www-data php "$REPO/tools/shell-test/admin.php" session | sed -E 's/.*"cookie": ?"([^"]+)".*/\1/'); fi

# the files: the test's folder (no node_modules, no outputs), this folder, and --with paths, at their repo-relative places
PATHS=("$(dirname "$TEST")" tools/gpu-remote "${WITH[@]+"${WITH[@]}"}")
ssh -o BatchMode=yes "$HOST" "mkdir -p $R/repo && rm -rf $R/repo/tmp && mkdir -p $R/repo/tmp"
T_COPY0=$(date +%s)
(cd "$REPO" && rsync -rtRL --no-perms --exclude node_modules --exclude venv --exclude .venv --exclude __pycache__ --exclude 'tmp/' --exclude '*.log' "${PATHS[@]}" "$HOST:$R/repo/")
T_COPY1=$(date +%s)

REMOTE=$(cat <<EOF
set -e
exec 9>~/cc-runs/gpu.lock; mkdir -p ~/cc-runs
echo "waiting for the workstation lock…"; flock 9
echo "@@timing lock \$(date +%s)"
for i in \$(seq 1 60); do
  u=\$(/usr/lib/wsl/lib/nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits -i 0 2>/dev/null || echo 0)
  [ "\${u:-0}" -le 50 ] && break; echo "display GPU busy (\$u %), waiting"; sleep 30
done
echo "@@timing start \$(date +%s)"
cd $R/repo
echo "== $TEST on \$(hostname), \$(date -u +%FT%TZ); \$(uptime | sed 's/.*load/load/')"
if [ $WSL = 1 ]; then
  CC_GPU_REMOTE=1 CC_GPU_HOST=workstation11a timeout $TIMEOUT node "$TEST" $(printf '%q ' "$@")
else
  PW='C:\\Users\\Public\\cc-runs\\_pw'
  if [ ! -d /mnt/c/Users/Public/cc-runs/_pw/node_modules/playwright-core ]; then
    mkdir -p /mnt/c/Users/Public/cc-runs/_pw && cd /mnt/c/Users/Public/cc-runs/_pw && echo '{"private":true}' > package.json
    /mnt/c/Windows/System32/cmd.exe /c "cd /d \$PW && npm i --silent playwright-core@1.48.2" >/dev/null 2>&1; cd $R/repo
  fi
  export CC_GPU_REMOTE=1 CC_GPU_HOST=workstation11a CC_PW_ROOT="\$PW" CC_LAB_COOKIE='$COOKIE'
  export WSLENV=CC_GPU_REMOTE:CC_GPU_HOST:CC_PW_ROOT:CC_LAB_COOKIE
  set +e; timeout $TIMEOUT "/mnt/c/Program Files/nodejs/node.exe" "$TEST" $(printf '%q ' "$@"); rc=\$?; set -e
  # only Playwright's own Chrome windows (their temp profile), never the owner's
  /mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='chrome.exe'\\" | ? { \\\$_.CommandLine -like '*playwright_chrom*' } | % { Stop-Process -Id \\\$_.ProcessId -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1 || true
  exit \$rc
fi
EOF
)
set +e
ssh -o BatchMode=yes "$HOST" "bash -s" <<<"$REMOTE" 2>&1 | grep -v -E 'UNC paths are not supported|CMD.EXE was started' | tee "$OUT/run.log"
RC=${PIPESTATUS[0]}
T_END=$(date +%s)
set -e
# timings: the remote clock gives lock + start (both machines keep NTP time); a run that never got the lock has no lock/start
T_LOCK=$(grep -m1 -oE '^@@timing lock [0-9]+' "$OUT/run.log" | awk '{print $3}'); T_START=$(grep -m1 -oE '^@@timing start [0-9]+' "$OUT/run.log" | awk '{print $3}')
python3 - "$REPO/tmp/gpu-runs/timings.jsonl" "$SESSION" "$STAMP" "$TEST" "$RC" "$TIMEOUT" "$T_QUEUED" "$T_COPY0" "$T_COPY1" "${T_LOCK:-}" "${T_START:-}" "$T_END" "$*" <<'PYEOF' || true
import json, sys
f, sess, stamp, test, rc, tmo, tq, tc, tc1, tl, ts, te, args = sys.argv[1:14]
n = lambda v: int(v) if v else None
tq, tc, tc1, tl, ts, te = n(tq), n(tc), n(tc1), n(tl), n(ts), n(te)
row = {"session": sess, "stamp": stamp, "test": test, "args": args, "exit": int(rc), "timeout_s": int(tmo),
       "copy_s": tc1 - tc, "lock_wait_s": max(0, tl - tc1) if tl else None, "gpu_wait_s": (ts - tl) if ts and tl else None,
       "run_s": (te - ts) if ts else None, "total_s": te - tq, "timed_out": int(rc) == 124}
open(f, "a").write(json.dumps(row) + "\n")
print(f"== timing: lock wait {row['lock_wait_s']} s, display-GPU wait {row['gpu_wait_s']} s, run {row['run_s']} s, total {row['total_s']} s" + (" (hit --timeout)" if row["timed_out"] else ""))
PYEOF
rsync -rt --no-perms "$HOST:$R/repo/tmp/" "$OUT/" 2>/dev/null || true
ssh -o BatchMode=yes "$HOST" "rm -rf $R/repo/tmp" || true
echo "== exit $RC; results in ${OUT#$REPO/}"
exit $RC
