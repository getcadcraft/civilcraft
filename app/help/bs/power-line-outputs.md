---
title: Tablice dalekovoda, količine, listovi i GIS
summary: Tablice zatezanja i stubova, količine materijala za tabelu ili TakeoffCraft, listovi plana i profila sa izvještajem studije kao jedan PDF, te GIS slojevi sa svim podacima o svakoj imovini.
keywords: tablica zatezanja, tablica stubova, količine, spisak materijala, takeoffcraft, listovi, izvještaj, pdf, list profila, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Sve ovdje je pod {{ui:Više}} u grupi Dalekovodi.

| Izlaz | Šta dobijete |
|---|---|
| {{ui:Tablice zatezanja…}} | Po dionici, horizontalna napetost i ugib svakog raspona pri svakoj temperaturi; sačuvajte kao CSV. {{ui:Spasi tablicu stubova (CSV)}}: uloga svakog stuba, stavka, teren, vezivanje, najveće opterećenje, nazivno, OK, prijedlog, temelj, ljuljanje, podizanje |
| {{ui:Količine…}} | Vodič (dužine lančanice × vodiči × strujni krugovi + 2 % za premosnice i krajnja vezivanja), stubovi i oprema po stavci biblioteke, kabl, rov, iskop, cijevni kanali, spojnice. CSV, Excel ili datoteka količina za TakeoffCraft |
| {{ui:Listovi i izvještaj…}} | Jedan PDF: plan; list profila za svaki vod, s vodičem pri slučajevima opterećenja koje odaberete i trakom dužina raspona, ugiba i najnižih slobodnih visina; te izvještaj studije (skup pravila, dionice, tablice zatezanja, stubovi, svaka provjera) |
| {{ui:Izvoz u GIS…}} | Stubovi, rasponi, trase kablova, oprema i prepreke kao slojevi sa svojim podacima (visine, opterećenja, ugibi, slobodne visine, šta ne zadovoljava), kao GeoPackage, shapefile, GeoJSON, KML ili KMZ |

GeoJSON i KML trebaju koordinatni sistem projekta ([Koordinatni sistemi](topic:coordinate-systems)); bez njega GeoPackage i shapefile nose vlastite brojeve projekta.
