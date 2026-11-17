---
title: Tabele, količine, listovi i GIS za dalekovode
summary: Tabele zatezanja i stubova, količine materijala za tabelu ili TakeoffCraft, listovi osnove i profila sa izveštajem o studiji kao jedan PDF, i GIS slojevi sa podacima svakog objekta.
keywords: tabela zatezanja, tabela stubova, količine, spisak materijala, takeoffcraft, listovi, izveštaj, pdf, list profila, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Sve ovde je pod {{ui:Više}} u grupi Dalekovodi.

| Izlaz | Šta dobijaš |
|---|---|
| {{ui:Tabele zatezanja…}} | Po deonici, horizontalno zatezanje i ugib svakog raspona na svakoj temperaturi; sačuvaj kao CSV. {{ui:Sačuvaj tabelu stubova (CSV)}}: uloga svakog stuba, stavka, tlo, vezivanje, najveće opterećenje, nominalno, OK, predlog, temelj, zanjihavanje, uzgon |
| {{ui:Količine…}} | Provodnik (dužine lanca × provodnici × kola + 2 % za spojeve i zatezne krajeve), stubovi i oprema po stavci biblioteke, kabl, rov, iskop, kablovski kanali, spojevi. CSV, Excel ili datoteka količina za TakeoffCraft |
| {{ui:Listovi i izveštaj…}} | Jedan PDF: osnova; list profila za svaki vod sa provodnikom pri slučajevima opterećenja koje izabereš i trakom dužina raspona, ugiba i najnižih razmaka; i izveštaj o studiji (skup pravila, deonice, tabele zatezanja, stubovi, svaka provera) |
| {{ui:Izvezi u GIS…}} | Stubovi, rasponi, trase kablova, oprema i prepreke kao slojevi sa svojim podacima (visine, opterećenja, ugibi, razmaci, šta ne prolazi), kao GeoPackage, shapefile, GeoJSON, KML ili KMZ |

GeoJSON i KML trebaju koordinatni sistem projekta ([Koordinatni sistemi](topic:coordinate-systems)); bez njega, GeoPackage i shapefile nose sopstvene brojeve projekta.
