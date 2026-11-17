---
title: Punoni me tabelën e atributeve të një shtrese
summary: Shiko çdo element të një shtrese GIS si tabelë, renditeni dhe filtroje, përzgjidh rreshta dhe elemente së bashku, korrigjo vlera, shto fusha, llogarit vlera të reja dhe ruaje tabelën si CSV.
keywords: tabela e atributeve, tabelë, fusha, kolona, rreshta, renditje, filtër, shprehje, përzgjidh, redakto, llogaritës fushash, llogarit, shto fushë, riemëro fushën, hiq fushën, csv, eksport, gis, shapefile, geopackage, simbologji
from: fd9d6c11
---

Hap tabelën e një shtrese nga menuja **tre pikat** te lista e Shtresave GIS ({{ui:Tabela e atributeve…}}), nga Sipërfaqja › Më shumë › {{ui:Tabela e atributeve}}, ose duke shkruar `ATTRIBUTES`, `ATTTABLE` ose `TABLE`. Tabela hapet pranë planimetrisë dhe mbetet e hapur ndërsa punoni. Vizatohen vetëm rreshtat që shihni, kështu që një shtresë me mijëra elemente hapet dhe lëviz shpejt.

## Rendit, filtro dhe përzgjidh

- **Rendit:** kliko titullin e kolonës. Një klikim i dytë e kthen, një i tretë rikthen rendin e skedarit. Vlerat boshe qëndrojnë gjithmonë në fund. Renditja ndryshon vetëm atë që shihni, kurrë shtresën.
- **Filtro:** shkruaj në kutinë e filtrit. Një shprehje si `AREA > 500 and USE = 'Res'` mban rreshtat ku është e vërtetë (të njëjtat fjalë si skeda Përzgjidh te [Analizo shtresat GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Çdo gjë që nuk është shprehje, si `oak maple`, kërkon ato fjalë në çdo kolonë.
- **Përzgjidh rreshta:** kliko një rresht. Ctrl+klikimi shton ose heq një rresht, Shift+klikimi zgjedh një varg, dhe {{ui:Përzgjidh rreshtat e shfaqur}} merr çdo rresht që kalon filtrin. Elementët e zgjedhur vizatohen në planimetri, dhe një klikim mbi një element në planimetri zgjedh rreshtin e tij këtu.
- Me rreshta të zgjedhur mund të {{ui:Zmadho}} te ta, të bësh një **shtresë nga përzgjedhja**, dhe të lexosh sipërfaqen ose gjatësinë totale në rreshtin e statusit.

## Korrigjo vlerat

Kliko dy herë një qelizë (ose lëviz me shigjetat dhe shtyp Enter), shkruaj vlerën e re dhe shtyp Enter. Esc e lë si ishte. Një vlerë duhet të përshtatet me kolonën: numrat si numra, datat si `YYYY-MM-DD`, po/jo si yes, no, true ose false. Një vlerë që nuk përshtatet refuzohet me një fjali dhe asgjë nuk ndryshon. Një kuti bosh e bën vlerën boshe. Çdo redaktim është një hap zhbërjeje: {{ui:Zhbëj}} dhe {{ui:Ribëj}} janë në fund të tabelës, dhe Ctrl+Z funksionon në planimetri.

## Fushat

Nën **Fushat** mund të shtoni një fushë (tekst, numër, datë ose po/jo), ta riemëroni ose ta hiqni. Një fushë e re fillon bosh. Riemërimi ndiqet: fusha e etiketës dhe [stili sipas atributit](topic:gis-symbology) i shtresës kalojnë në emrin e ri, dhe heqja e një fushe heq etiketën dhe stilin që e përdornin. Çdo veprim është një hap zhbërjeje që kthen gjithçka mbrapsht.

## Llogaritësi i fushave

Shkruan një vlerë në çdo rresht (ose vetëm në rreshtat e zgjedhur) nga fushat e tjera të rreshtit, gjeometria e tij dhe disa funksione. Zgjidh një fushë ekzistuese ose **Një fushë e re…** dhe jep emrin dhe tipin e saj. Asgjë nuk ekzekutohet si kod: shprehja lexohet nga një analizues i vogël me një listë fikse funksionesh.

| Grupi | Fjalët |
|---|---|
| Numrat | `+ - * /`, kllapa, `abs round(x, digits) floor ceil sqrt pow min max` |
| Teksti | `upper lower trim len substr(text, from, count) left right replace concat` (teksti shkruhet në 'thonjëza të vetme'; një emër fushe me hapësira shkruhet në "thonjëza" ose [kllapa katrore]) |
| Zgjedhja | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datat | `year month day` e një vlere `YYYY-MM-DD` |
| Gjeometria | `$area $perimeter $length $x $y $vertices`, në njësitë e projektit |

Një rezultat që nuk mund të ruhet në tipin e fushës (tekst në një fushë numrore) lihet bosh dhe numërohet në mesazh. Pjesëtimi me zero jep vlerë boshe. Për shembull `round($area / 43560, 2)` shkruan akrat nga këmbët katrore.

## Eksporto

{{ui:Eksporto CSV}} ruan rreshtat që shihni (pas filtrit dhe renditjes) si skedar CSV UTF-8, me emrat e fushave në rreshtin e parë. Një tekst që fillon me `=`, `+`, `-` ose `@` merr një apostrof para, që një fletëllogaritëse ta mos e ekzekutojë si formulë. Për të ruajtur vetë shtresën, përdor [Eksporto të dhënat as-built për GIS](topic:gis-export).

## Kufizime

Tabela tregon shtresën në një rend renditjeje dhe me një filtër njëherësh. Rreshtat nuk shtohen dhe nuk fshihen këtu (bëj një shtresë të re nga një përzgjedhje në vend të kësaj), gjeometria nuk redaktohet, dhe tipi i një fushe nuk mund të ndryshohet pasi të jetë krijuar.
