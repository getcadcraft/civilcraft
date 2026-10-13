#!/bin/sh
# make-fixture3d.sh — rebuilds tools/bimcraft-test/fixtures/dwg3d-*.dwg from fixture3d.py (ezdxf) through the ODA File
# Converter (tools/civilcraft-test/setup-dwg-readers.sh installs it). The 3D test reads the DWGs, AutoCAD 2000 and 2018
# (readDwg), and the ezdxf DXF itself (dxf-model.js).
#   sh tools/bimcraft-test/make-fixture3d.sh        (as root; a few seconds)
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../.." && pwd)
PY="$ROOT/tools/cadcraft-test/venv/bin/python"
ODA="$ROOT/tools/civilcraft-test/venv/dwg-readers/oda/AppRun"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/in" "$HERE/fixtures"
"$PY" "$HERE/fixture3d.py" "$TMP/in/dwg3d.dxf"
cp "$TMP/in/dwg3d.dxf" "$HERE/fixtures/dwg3d.dxf"
for v in ACAD2000 ACAD2018; do
  mkdir -p "$TMP/$v"
  xvfb-run -a "$ODA" "$TMP/in" "$TMP/$v" "$v" DWG 0 1 '*.dxf' >/dev/null 2>&1 || true
  test -s "$TMP/$v/dwg3d.dwg" || { echo "ODA did not write $v"; exit 1; }
  cp "$TMP/$v/dwg3d.dwg" "$HERE/fixtures/dwg3d-$(echo $v | tr 'A-Z' 'a-z').dwg"
done
echo "Fixtures in $HERE/fixtures"
