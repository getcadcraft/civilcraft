#!/bin/sh
# SPDX-License-Identifier: Apache-2.0
# xclip.dxf → xclip-<ver>.dwg in all six versions, by the ODA File Converter (setup-dwg-readers.sh).
set -e
here=$(cd "$(dirname "$0")" && pwd)
oda="$here/../../../civilcraft-test/venv/dwg-readers/oda/AppRun"
tmp=$(mktemp -d); mkdir "$tmp/in"; cp "$here/xclip.dxf" "$tmp/in/"
for v in 2000 2004 2007 2010 2013 2018; do
  mkdir -p "$tmp/$v"; xvfb-run -a "$oda" "$tmp/in" "$tmp/$v" "ACAD$v" DWG 0 1 '*.dxf' >/dev/null 2>&1
  cp "$tmp/$v/xclip.dwg" "$here/xclip-$v.dwg"
done
rm -rf "$tmp"
