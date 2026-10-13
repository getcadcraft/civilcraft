#!/bin/sh
# solids-fixture.sh — build builder S's solids/lights fixture (solids-fixture.py: ACIS as SAT from an R2000 DXF and as
# SAB from an R2018 DXF) and save each as DWG in every version with the ODA File Converter, then let the converter
# write its own DXF of every DWG (in the DWG's version) (the truth solids-check.mjs compares against):
#   tmp/dwg-solids/dwg/<sat|sab>-<AC10xx>.dwg   tmp/dwg-solids/truth/<sat|sab>-<AC10xx>.dxf
set -e
cd "$(dirname "$0")/../.."
F=tmp/dwg-solids
ODA=tools/civilcraft-test/venv/dwg-readers/oda/AppRun
rm -rf $F && mkdir -p $F/dxf $F/dwg $F/truth $F/w
tools/civilcraft-test/venv/bin/python -I tools/dwg-test/solids-fixture.py $F/dxf
for v in ACAD2000:AC1015 ACAD2004:AC1018 ACAD2007:AC1021 ACAD2010:AC1024 ACAD2013:AC1027 ACAD2018:AC1032; do
  o=${v%%:*}; d=${v##*:}; rm -rf $F/w/$d; mkdir -p $F/w/$d
  xvfb-run -a $ODA $F/dxf $F/w/$d $o DWG 0 1 "*.dxf" >/dev/null 2>&1 || true
  for s in sat sab; do
    if [ -s $F/w/$d/solids-$s.dwg ]; then cp $F/w/$d/solids-$s.dwg $F/dwg/$s-$d.dwg; else echo "ODA could not save $s as $o"; fi
    [ -f $F/w/$d/solids-$s.dwg.err ] && echo "ODA .err for $s $o: $(cat $F/w/$d/solids-$s.dwg.err)"
  done
done
# truth: the converter's DXF of each DWG in the DWG's own version (DXF ≤ 2010 carries SAT text, 2013+ SAB records)
for v in ACAD2000:AC1015 ACAD2004:AC1018 ACAD2007:AC1021 ACAD2010:AC1024 ACAD2013:AC1027 ACAD2018:AC1032; do
  o=${v%%:*}; d=${v##*:}; rm -rf $F/w/i $F/w/t; mkdir -p $F/w/i $F/w/t
  cp $F/dwg/*-$d.dwg $F/w/i/
  xvfb-run -a $ODA $F/w/i $F/w/t $o DXF 0 1 "*.dwg" >/dev/null 2>&1 || true
  cp $F/w/t/*.dxf $F/truth/
done
# the AutoCAD samples of the corpus (they hold REGIONs, a 3DSOLID with history and a LIGHT): the converter's DXF in the
# DWG's own version (the corpus truth is DXF 2018 only, whose SAB is re-saved in another ACIS version)
C=/var/www/CADCRAFT/testfiles/dwg-corpus
for v in ACAD2000:AC1015 ACAD2004:AC1018 ACAD2007:AC1021 ACAD2010:AC1024 ACAD2013:AC1027 ACAD2018:AC1032; do
  o=${v%%:*}; d=${v##*:}; rm -rf $F/w/i $F/w/t; mkdir -p $F/w/i $F/w/t $F/corpus-truth/$d
  cp $C/$d/example-20*.dwg $F/w/i/ 2>/dev/null || continue
  xvfb-run -a $ODA $F/w/i $F/w/t $o DXF 0 1 "*.dwg" >/dev/null 2>&1 || true
  cp $F/w/t/*.dxf $F/corpus-truth/$d/
done
ls -la $F/dwg $F/truth
