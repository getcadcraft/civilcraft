---
title: Tablice dalekovoda, količine, listovi i GIS
summary: Tablice zatezanja i stupova, količine materijala za proračunsku tablicu ili TakeoffCraft, tlocrt i profilni listovi s izvještajem o studiji kao jednim PDF-om te GIS slojevi sa svim podacima o svakoj imovini.
keywords: tablica zatezanja, tablica stupova, količine, sastavnica, takeoffcraft, listovi, izvještaj, pdf, profilni list, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Sve je ovdje pod {{ui:Više}} u grupi Dalekovodi.

| Izlaz | Što dobivate |
|---|---|
| {{ui:Tablice zatezanja…}} | Po dionici, vodoravna napetost i progib svakog raspona pri svakoj temperaturi; spremi kao CSV. {{ui:Spremi tablicu stupova (CSV)}}: uloga svakog stupa, stavka, teren, vezanje, najveće opterećenje, nazivno, OK, prijedlog, temelj, otklon, podizanje |
| {{ui:Količine…}} | Vodič (duljine lančanice × vodiči × strujni krugovi + 2 % za premosnice i zatezne stupove), stupovi i oprema po stavki knjižnice, kabel, rov, iskop, cijevi, spojevi. CSV, Excel ili datoteka količina za TakeoffCraft |
| {{ui:Listovi i izvještaj…}} | Jedan PDF: tlocrt; profilni list za svaki vod s vodičem pri slučajevima opterećenja koje odaberete i trakom duljina raspona, progiba i najmanjih slobodnih visina; te izvještaj o studiji (skup pravila, dionice, tablice zatezanja, stupovi, svaka provjera) |
| {{ui:Izvezi u GIS…}} | Stupovi, rasponi, trase kabela, oprema i prepreke kao slojevi s njihovim podacima (visine, opterećenja, progibi, slobodne visine, što ne prolazi), kao GeoPackage, shapefile, GeoJSON, KML ili KMZ |

GeoJSON i KML trebaju koordinatni sustav projekta ([Koordinatni sustavi](topic:coordinate-systems)); bez njega GeoPackage i shapefile nose vlastite brojeve projekta.
