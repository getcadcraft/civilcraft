---
title: Aadress alaks
summary: Muuda aadress alaks, mis tähendab krunti, ümbritsevaid hooneid, tsoneeringut, pinnast ja üleujutusala avatud andmetest, mida küsid nupuga või tood failidena, ning anna need BimCraftile soovitustena.
keywords: aadress, geokodeerimine, ala, krunt, hooned, tsoneering, pinnas, üleujutus, avatud andmed, openstreetmap, fema, ssurgo, usgs, kontekst, ccsite, bimcraft
from: 125d848a
---

## Mida see teeb

Pind › Veel › Aadress alaks vastab punkti kohta: millisesse krundi see kuulub, ümbritsevad hooned, tsoneering, pinnas ja üleujutusala. Andmed on avatud: sinu lisatud failid (GeoJSON, shapefile, KML, GeoPackage) ja, kui lülitad lisandmoodulid sisse, nupud, mis küsivad igast avatud teenusest ühe.

## Kuidas kasutada

1. Sisesta aadress ja vajuta aadressiotsingu nuppu (lisandmoodul „Aadressiotsing“) või sisesta laiuskraad ja pikkuskraad.
2. Lisa kihid: failid nupuga „Lisa failid“ või teiste allikanuppudega (üleujutusala, hooned, pinnas, maapinna kõrgus, maakonna krundid). Teenust päritakse ainult siis, kui vajutad selle nuppu; algul ei tooda midagi.
3. Vajuta käivitusnuppu, et saada vastus sõnadena ja CSV-na.
4. „Salvesta ala failina“ või „Saada BimCraftile soovitustena“ annab piirjooned BimCraftile või ModelCraftile; need loetlevad need ja lisavad ainult need, mille märgid ära.

## Mida teada

- Aadressiotsing käib läbi getcadcraft.com, mis küsib OpenStreetMapi Nominatimilt sinu eest (kõige rohkem üks päring sekundis; vastused hoitakse 90 päeva, et sama aadressi ei küsitaks kaks korda; salvestatakse ainult aadressi räsi, mitte kunagi, kes küsis). Teised nupud lähevad otse sinu brauserist nende teenusesse.
- Igal allikal on oma litsents (OpenStreetMap on ODbL: jäta autoriviide alles).
- Kihid on sama head, kui on avatud andmed sinu piirkonnas. Kontrolli olulist mõõdistuse vastu.
