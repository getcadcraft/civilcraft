---
title: Adresa te vendi
summary: Ktheje një adresë në atë që një vend duhet të dijë: parcelën, ndërtesat përreth, zonimin, tokën dhe zonën e përmbytjes, nga të dhëna të hapura që kërkon me buton ose sjell si skedarë, dhe t'i japësh BimCraft si sugjerime.
keywords: adresë, gjeokodim, vend, parcelë, ndërtesa, zonim, tokë, përmbytje, të dhëna të hapura, openstreetmap, fema, ssurgo, usgs, kontekst, ccsite, bimcraft
from: 125d848a
---

## Çfarë bën

Sipërfaqe › Më › Adresa te vendi jep, për një pikë: në cilën parcelë ndodhet, ndërtesat përreth, zonimin, tokën dhe zonën e përmbytjes. Të dhënat janë të hapura: skedarët që shton (GeoJSON, shapefile, KML, GeoPackage) dhe, kur i ndez shtojcat, butona që kërkojnë nga një shërbim i hapur secili.

## Si përdoret

1. Shkruaj një adresë dhe shtyp butonin e kërkimit të adresës (shtojca "Kërkimi i adresës"), ose shkruaj gjerësinë dhe gjatësinë gjeografike.
2. Shto shtresa: skedarë me "Shto skedarë", ose butonat e tjerë të burimit (zona e përmbytjes, ndërtesat, toka, lartësia e terrenit, parcelat e qarkut). Një shërbim kërkohet vetëm kur shtyp butonin e tij; asgjë nuk merret në fillim.
3. Shtyp butonin e ekzekutimit për përgjigjen me fjalë, me një CSV.
4. "Ruaj vendin si skedar" ose "Dërgo te BimCraft si sugjerime" i jep konturet BimCraft ose ModelCraft; ato i listojnë dhe shtojnë vetëm ato që zgjedh.

## Gjërat që duhet t'i dish

- Kërkimi i adresës kalon nga getcadcraft.com, që e pyet Nominatim të OpenStreetMap për ty (jo më shumë se një kërkesë në sekondë; përgjigjet mbahen 90 ditë, që e njëjta adresë të mos pyetet dy herë; ruhet vetëm një hash i adresës, kurrë kush e pyeti). Butonat e tjerë shkojnë drejt e nga shfletuesi yt te shërbimi i tyre.
- Çdo burim ka licencën e vet (OpenStreetMap është ODbL: mbaje rreshtin e kredisë).
- Shtresat janë aq të mira sa të dhënat e hapura në vendin tënd. Kontrollo ato që kanë rëndësi me një matje.
