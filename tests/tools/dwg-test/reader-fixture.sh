#!/bin/sh
# reader-fixture.sh — build builder R's feature fixture (reader-fixture.py) and save it as DWG in every
# version with the ODA File Converter: tmp/dwg-reader/fixture/all/fixture-<AC10xx>.dwg
set -e
cd "$(dirname "$0")/../.."
F=tmp/dwg-reader/fixture
rm -rf $F && mkdir -p $F/dxf $F/all
tools/civilcraft-test/venv/bin/python -I tools/dwg-test/reader-fixture.py $F/dxf/cc-fixture.dxf
for v in ACAD2000:AC1015 ACAD2004:AC1018 ACAD2007:AC1021 ACAD2010:AC1024 ACAD2013:AC1027 ACAD2018:AC1032 ACAD14:AC1014 ACAD13:AC1012; do
  o=${v%%:*}; d=${v##*:}; mkdir -p $F/$d
  xvfb-run -a tools/civilcraft-test/venv/dwg-readers/oda/AppRun $F/dxf $F/$d $o DWG 0 1 "*.dxf" >/dev/null 2>&1 || true
  if [ -s $F/$d/cc-fixture.dwg ]; then cp $F/$d/cc-fixture.dwg $F/all/fixture-$d.dwg; else echo "ODA could not save $o"; fi
done
ls $F/all
