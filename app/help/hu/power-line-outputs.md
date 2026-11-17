---
title: Távvezetéki táblázatok, mennyiségek, lapok és GIS
summary: Huzalfeszítési és tartótáblázatok, anyagmennyiségek táblázatkezelőhöz vagy TakeoffCraft-hoz, alaprajzi és hossz-szelvény lapok egy PDF-ben egy vizsgálati jelentéssel, valamint GIS-rétegek minden elem adataival.
keywords: huzalfeszítési táblázat, tartótáblázat, mennyiségek, anyagjegyzék, takeoffcraft, lapok, jelentés, pdf, hossz-szelvény lap, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Mindez a Távvezetékek csoport {{ui:Továbbiak}} menüjében található.

| Kimenet | Mit kap |
|---|---|
| {{ui:Huzalfeszítési táblázatok…}} | Szakaszonként a vízszintes feszítőerő és minden fesztáv lehajlása minden hőmérsékleten; mentés CSV-ként. {{ui:A tartótáblázat mentése (CSV)}}: minden tartó szerepe, eleme, talaja, rögzítése, legnagyobb terhelése, névleges értéke, OK, javaslat, alapozás, lengés, felemelkedés |
| {{ui:Mennyiségek…}} | Vezető (láncgörbe-hosszak × vezetők × áramkörök + 2% az áthidalókhoz és a végtartókhoz), tartók és berendezések könyvtári elemenként, kábel, árok, földkiemelés, csövek, kötések. CSV, Excel vagy TakeoffCraft mennyiségi fájl |
| {{ui:Lapok és jelentés…}} | Egy PDF: az alaprajz; minden vezetékhez egy hossz-szelvény lap a kiválasztott terhelési esetek vezetőivel és egy sávval a fesztávhosszakról, lehajlásokról és a legalacsonyabb szabad magasságokról; valamint egy vizsgálati jelentés (szabálykészlet, szakaszok, huzalfeszítési táblázatok, tartók, minden ellenőrzés) |
| {{ui:Exportálás GIS-be…}} | Tartók, fesztávok, kábelútvonalak, berendezések és akadályok rétegekként az adataikkal (magasságok, terhelések, lehajlások, szabad magasságok, mi hibás), GeoPackage, shapefile, GeoJSON, KML vagy KMZ formátumban |

A GeoJSON és a KML a projekt koordinátarendszerét igényli ([Koordinátarendszerek](topic:coordinate-systems)); koordinátarendszer nélkül a GeoPackage és a shapefile a projekt saját számait tartalmazza.
