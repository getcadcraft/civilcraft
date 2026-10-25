#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0
# build.sh — NVIDIA SMLib (the kernel + its C API, from usd-brep) and k1.cpp to WebAssembly with Emscripten, on the capped slice
# (KICKOFF rule 14). 0.7 D7.45 spike, session part-08. Nothing ships from here.
#   tools/partcraft-test/smlib-spike/build.sh <usd-brep checkout> <out dir> [jobs=3]
# Output: <out>/obj/*.o, <out>/k1.mjs + k1.wasm (run: node <out>/k1.mjs [case …]), <out>/build.log.
# Flags follow usd-brep's release build: C++17, NDEBUG NOMINMAX, no debug / graphics code, -ffp-contract=off (their note: one
# rounding on every platform). SM_USE_TBB stays undefined, as in their shipped build (single-threaded).
set -euo pipefail
SRC=$(realpath "$1"); OUT=$(realpath -m "$2"); JOBS=${3:-3}
HERE=$(dirname "$(realpath "$0")")
EMXX=${EMXX:-/opt/cadcraft-cpp/emsdk/upstream/emscripten/em++}
CAP=(systemd-run --scope --quiet --slice=forkrust.slice nice -n 19 ionice -c3)
mkdir -p "$OUT/obj"
FLAGS=(-O2 -std=c++17 -DNDEBUG -DNOMINMAX -DSM_NO_DEBUG_CODE -DSM_NO_GFX_OUTPUT_CODE -ffp-contract=off -fwasm-exceptions
  -Wno-everything -I"$SRC/source/SMLib/inc" -I"$SRC/source/SM_API/inc")
export EMXX OUT
printf '%s\n' "${FLAGS[@]}" > "$OUT/flags.txt"
# a file that leans on the Windows precompiled header for a declaration (SmApiImportExport.cpp) gets one retry with StdAfx.h
# forced in; their source is not edited
compile() { local f=$1 o; o="$OUT/obj/$(basename "$(dirname "$(dirname "$f")")")_$(basename "${f%.cpp}").o"; [ -s "$o" ] && [ "$o" -nt "$f" ] && return 0; mapfile -t F < "$OUT/flags.txt"
  "$EMXX" "${F[@]}" -c "$f" -o "$o" 2>/dev/null && return 0
  "$EMXX" "${F[@]}" -include "$(dirname "$(dirname "$f")")/inc/StdAfx.h" -c "$f" -o "$o" 2>>"$OUT/build.log" && { echo "needed StdAfx.h: $f" >>"$OUT/build.log"; return 0; }
  echo "FAILED $f" >>"$OUT/build.log"; return 1; }
export -f compile
start=$(date +%s)
ls "$SRC"/source/SMLib/src/*.cpp "$SRC"/source/SM_API/src/*.cpp | grep -v '/StdAfx.cpp$' \
  | "${CAP[@]}" xargs -P "$JOBS" -I{} bash -c 'compile "$@"' _ {}
echo "compiled in $(( $(date +%s) - start )) s" | tee -a "$OUT/build.log"
"${CAP[@]}" "$EMXX" "${FLAGS[@]}" "$HERE/k1.cpp" "$OUT"/obj/*.o -o "$OUT/k1.mjs" \
  -sENVIRONMENT=node -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=64MB -sSTACK_SIZE=8MB -sEXIT_RUNTIME=1 2>>"$OUT/build.log"
ls -l "$OUT/k1.wasm" "$OUT/k1.mjs" | tee -a "$OUT/build.log"
gzip -9 -c "$OUT/k1.wasm" | wc -c | sed 's/^/gzip bytes: /' | tee -a "$OUT/build.log"
