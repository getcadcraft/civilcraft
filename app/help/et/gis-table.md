---
title: Kihi atribuuditabeliga töötamine
summary: Vaata GIS-kihi iga objekti tabelina, sorteeri ja filtreeri seda, vali ridu ja objekte koos, paranda väärtusi, lisa välju, arvuta uusi väärtusi ja salvesta tabel CSV-na.
keywords: atribuuditabel, tabel, väljad, veerud, read, sorteerimine, filter, avaldis, valimine, muutmine, väljaarvutaja, arvuta, lisa väli, nimeta väli ümber, eemalda väli, csv, eksport, gis, shapefile, geopackage, sümboolika
from: fd9d6c11
---

Ava kihi tabel kihtide loendi **kolme punkti** menüüst ({{ui:Atribuuditabel…}}), menüüst Pind › Veel › {{ui:Atribuuditabel}} või tippides `ATTRIBUTES`, `ATTTABLE` või `TABLE`. Tabel avaneb joonise kõrvale ja jääb avatuks, kui töötad. Kuvatakse ainult nähtavad read, nii et tuhandete objektidega kiht avaneb ja kerib kiiresti.

## Sorteeri, filtreeri ja vali

- **Sorteeri:** klõpsa veeru pealkirja. Teine klõps pöörab järjestuse, kolmas paneb faili järjekorra tagasi. Tühjad väärtused jäävad alati lõppu. Sorteerimine muudab ainult seda, mida näed, mitte kihti.
- **Filtreeri:** kirjuta filtrikasti. Avaldis nagu `AREA > 500 and USE = 'Res'` jätab read, kus see on tõene (samad sõnad nagu jaotises [GIS-kihtide analüüs](topic:gis-analysis), vahelehel Vali: `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Kõik, mis ei ole avaldis, nagu `oak maple`, otsitakse igast veerust.
- **Vali read:** klõpsa rida. Ctrl+klõps lisab või eemaldab ühe, Shift+klõps valib järjestikuse rea ja {{ui:Vali näidatud read}} võtab kõik read, mis läbivad filtri. Valitud objektid kuvatakse joonisel ja joonisel objektil klõpsamine valib siin tema rea.
- Valitud ridadega saad {{ui:Suumi}} nende peale, teha valikust eraldi kihi ning lugeda kogupindala või -pikkuse olekureast.

## Paranda väärtusi

Topeltklõpsa lahtrit (või liigu sinna nooleklahvidega ja vajuta Enter), kirjuta uus väärtus ja vajuta Enter. Escape jätab selle nii, nagu see oli. Väärtus peab sobima veergu: arvud arvudena, kuupäevad kujul `YYYY-MM-DD`, jah/ei-veerud väärtustega yes, no, true või false. Väärtus, mis ei sobi, lükatakse tagasi lausega ja midagi ei muutu. Tühi lahter teeb väärtuse tühjaks. Iga muudatus on üks tagasivõtmise samm: {{ui:Võta tagasi}} ja {{ui:Tee uuesti}} on tabeli all ning Ctrl+Z töötab joonisel.

## Väljad

Jaotises **Väljad** saad lisada välja (tekst, arv, kuupäev või jah/ei), nimetada ühe ümber või eemaldada ühe. Uus väli algab tühjana. Ümbernimetamine kandub edasi: kihi sildi väli ja [atribuudi järgi stiil](topic:gis-symbology) liiguvad uuele nimele ning välja eemaldamine kustutab sildi ja stiili, mis seda kasutasid. Igaüks on üks tagasivõtmise samm, mis toob kõik tagasi.

## Väljaarvutaja

Kirjutab väärtuse igasse reasse (või ainult valitud ridadesse) rea teistest väljadest, selle geomeetriast ja mõnest funktsioonist. Vali olemasolev väli või **Uus väli…** ning anna sellele nimi ja tüüp. Midagi ei käivitata koodina: avaldise loeb väike süntaksianalüsaator kindla funktsioonide loendiga.

| Rühm | Sõnad |
|---|---|
| Arvud | `+ - * /`, sulud, `abs round(x, digits) floor ceil sqrt pow min max` |
| Tekst | `upper lower trim len substr(text, from, count) left right replace concat` (tekst läheb 'ühekordsetesse jutumärkidesse'; väljanimi, millel on tühikud, läheb „topeltjutumärkidesse“ või [kantsulgudesse]) |
| Valimine | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Kuupäevad | `year month day` väärtusest `YYYY-MM-DD` |
| Geomeetria | `$area $perimeter $length $x $y $vertices`, projekti ühikutes |

Tulemus, mida ei saa salvestada välja tüüpi (näiteks tekst arvuväljas), jääb tühjaks ja loetakse teates. Nulliga jagamine annab tühja väärtuse. Näiteks `round($area / 43560, 2)` kirjutab aakrid ruutjalgadest.

## Eksport

{{ui:Ekspordi CSV}} salvestab read, mida näed (pärast filtrit ja sorteerimist), UTF-8 CSV-failina, väljanimed esimesel real. Tekst, mis algab märkidega `=`, `+`, `-` või `@`, saab ette ülakoma, et tabelarvutus seda ei käivitaks valemina. Kihi enda salvestamiseks kasuta [Ekspordi teostusandmed GIS-i](topic:gis-export).

## Piirangud

Tabel näitab kihti ühe sorteerimisjärjestuse ja ühe filtriga korraga. Ridu ei saa siin lisada ega kustutada (tee selle asemel valikust uus kiht), geomeetriat ei muudeta ja välja tüüpi ei saa pärast loomist muuta.
