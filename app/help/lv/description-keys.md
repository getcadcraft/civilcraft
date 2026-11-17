---
title: Aprakstu atslēgas un līniju kodi
summary: Pārvērsiet lauka kodus punktu grupās ar aprakstiem un savienojiet kodētos punktus līnijās (sākums, beigas, slēgums), kas kļūst par lūzumlīnijām.
keywords: aprakstu atslēgas, lauka kodi, līniju kodi, zīmējumi, līnijas, sākums, beigas, slēgt, punktu grupas, kodi, uzmērīšanas kodi, datu ierakstītājs, lūzumlīnijas, bordiūrs, braucamās daļas mala
from: b3d1af8d
---

Uzmērītāju komandas kodē katru uzmērījumu lauka darbā: `EP` braucamās daļas malai, `TC` bordiūra augšai, `BLDG` ēkas stūrim. Kods ir punkta apraksta pirmais vārds. CivilCraft grupē punktus pēc tā un pārvērš tam sekojošos līniju kodus līnijās.

## Līniju kodi

Līniju kods ir vārds tieši pēc lauka koda:

| Apraksts | Nozīme |
|---|---|
| `EP B` | Sākt jaunu braucamās daļas malas līniju šajā punktā |
| `EP` | Turpināt pašreizējo EP līniju |
| `EP E` | Beigt pašreizējo EP līniju šajā punktā |
| `BLDG C` | Slēgt ēku: savienot šo punktu atpakaļ ar līnijas pirmo punktu |

Punkti ar vienādu kodu tiek savienoti punktu numuru secībā. Dažādi kodi ir dažādas līnijas, pat ja tie dalās grupā, tāpēc `EP1` un `EP2` dod divas malas vienlaikus. Kods, kas nekad neizmanto līniju kodu, tiek savienots caur visiem saviem punktiem, kā agrākajās versijās.

Līnijas grupā, kas izmantota kā **Lūzumlīnija**, kļūst par lūzumlīnijām, pa vienai katrai līnijai, tāpēc bordiūrs ar pārtrauku netiek izstiepts pāri pārtraukumam. Līnijas citās grupās tiek zīmētas plānā (slānis V-NODE-LINE) un iet ārā DXF, DWG un PDF.

Vārdi sākumam, beigām un slēgumam ir `B`, `BEG`, `START`; `E`, `END`; un `C`, `CLO`, `CLOSE`. Mainiet tos vai izslēdziet līniju kodus zemāk esošajā dialoglodziņā.

## Aprakstu atslēgas

Apraksta atslēga pārvērš kodu punktu grupā, lietojumā un garajā aprakstā.

1. Sadaļā **Punkti** noklikšķiniet uz {{ui:Aprakstu atslēgas un līniju kodi}}.
2. Noklikšķiniet uz {{ui:Pievienot atslēgu}} un aizpildiet rindu:
   - **Kods**: lauka kods, ar ko sakrist. `*` nozīmē jebkurus simbolus un `?` vienu simbolu, tātad `EP*` atrod EP, EP1 un EP12.
   - **Grupa**: punktu grupa, kurā šie punkti tiek apvienoti (tukšs = pats kods). `EP*` ar grupu `EP` ievieto EP1 un EP2 vienā grupā, kaut arī tās paliek atsevišķas līnijas.
   - **Lietojums**: Punkti, Lūzumlīnija vai Izlaists, kad grupa pirmo reizi parādās (vai atstājiet to tabulai **Punkti**).
   - **Apraksts**: garais nosaukums, redzams punkta **Rekvizītos**.
3. Kolonna **Punkti** skaita punktus, ko katra atslēga atrod, kamēr rakstāt. Pirmā atslēga, kas sakrīt, uzvar.
4. Noklikšķiniet uz {{ui:Lietot}}. Grupas, virsma un plāns seko vienā solī: {{key:Mod+Z}} to atsauc.

Grupa paturē lietojumu, ko jūs tai devāt tabulā **Punkti**; atslēgas lietojums to iestata tikai grupai, kas ir jauna. Atslēgas un līniju kodi tiek saglabāti projekta failā.
