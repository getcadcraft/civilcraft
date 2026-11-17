---
title: Adrese objektam
summary: Pārvērst adresi par to, kas objektam jāzina: zemesgabalu, apkārtējās ēkas, teritorijas plānojumu, augsni un plūdu zonu, no atvērtiem datiem, ko pieprasāt ar pogu vai pievienojat kā failus, un nodot tos BimCraft kā ieteikumus.
keywords: adrese, ģeokodēšana, objekts, zemesgabals, ēkas, teritorijas plānojums, augsne, plūdi, atvērtie dati, openstreetmap, fema, ssurgo, usgs, konteksts, ccsite, bimcraft
from: 125d848a
---

## Ko tas dara

Virsma › Vairāk › Adrese objektam sniedz atbildi punktam: kurā zemesgabalā tas atrodas, apkārtējās ēkas, teritorijas plānojumu, augsni un plūdu zonu. Dati ir atvērti: faili, ko pievienojat (GeoJSON, shapefile, KML, GeoPackage), un, ja ieslēdzat papildinājumus, pogas, kas katra pieprasa vienu atvērtu pakalpojumu.

## Kā lietot

1. Ierakstiet adresi un nospiediet adreses meklēšanas pogu (papildinājums „Adrešu meklēšana”) vai ierakstiet platuma un garuma koordinātes.
2. Pievienojiet slāņus: failus ar „Pievienot failus” vai citas avotu pogas (plūdu zona, ēkas, augsne, zemes augstums, apgabala zemesgabali). Pakalpojums tiek pieprasīts tikai tad, kad nospiežat tā pogu; sākumā nekas netiek ielādēts.
3. Nospiediet palaišanas pogu, lai saņemtu atbildi tekstā un CSV failā.
4. „Saglabāt objektu kā failu” vai „Sūtīt uz BimCraft kā ieteikumus” nodod obrisus programmai BimCraft vai ModelCraft; tās tos uzskaita un pievieno tikai to, ko atzīmējat.

## Kas jāzina

- Adrešu meklēšana iet caur getcadcraft.com, kas jūsu vietā pieprasa OpenStreetMap Nominatim (ne vairāk kā viens pieprasījums sekundē; atbildes glabājas 90 dienas, lai viena un tā pati adrese netiktu pieprasīta divreiz; tiek glabāts tikai adreses jaucējkods, nekad nav zināms, kas pieprasīja). Citas pogas sūta pieprasījumu tieši no jūsu pārlūkprogrammas uz to pakalpojumu.
- Katram avotam ir sava licence (OpenStreetMap ir ODbL: saglabājiet autoru norādi).
- Slāņi ir tikpat precīzi, cik atvērtie dati jūsu vietā. Svarīgo pārbaudiet pret uzmērījumu.
