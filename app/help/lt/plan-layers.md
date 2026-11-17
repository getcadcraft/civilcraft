---
title: Plano sluoksniai
summary: Fiksuoti sluoksnių pavadinimai, spalvos ir linijų storiai, kuriuos CivilCraft naudoja ekrane, DXF ir PDF formatuose, bei kuris rodymo parametras valdo kiekvieną iš jų.
keywords: sluoksniai, sluoksnių pavadinimai, ncs, spalvos, aci, linijų storiai, dxf sluoksniai, pdf, rodymo parametrai, linijos
from: c2aa8475
---

Viskas plane priklauso sluoksniui. Pavadinimai atitinka įprastą civilinių sluoksnių schemą (disciplina, pagrindinė grupė, papildoma grupė). Sluoksniai šioje versijoje yra fiksuoti: negalite jų pervadinti, keisti spalvų ar pridėti savų. DXF faile kiekvienas sluoksnis turi nurodytą spalvos numerį; PDF faile su {{ui:Sluoksnių spalvos}} naudojamos tos pačios spalvos, o su {{ui:Juoda}} viskas spausdinama juodai.

| Sluoksnis | Turi | Spalva (DXF numeris) | Rodomas, kai |
|---|---|---|---|
| C-TOPO-MINR | Smulkios horizontalės | Pilka (8) | {{ui:Horizontalės}} |
| C-TOPO-MAJR | Pagrindinės horizontalės | Balta arba juoda (7) | {{ui:Horizontalės}} |
| C-TOPO-TEXT | Horizontalių žymos | Balta arba juoda (7) | {{ui:Horizontalės}} ir {{ui:Horizontalių žymos}} |
| C-TOPO-TINN | Trikampių kraštinės | Pilka (8) | {{ui:Trikampiai}} |
| C-TOPO-BRKL | Lūžio linijos ir riba | Oranžinė (30) | {{ui:Lūžio linijos}} |
| C-TOPO-BNDY | Paviršiaus kraštas | Balta arba juoda (7) | {{ui:Paviršiaus kraštas}} |
| C-TOPO-SLOP | Šlaitų rodyklės | Žydra (4) | {{ui:Šlaitų rodyklės}} |
| V-NODE | Geodeziniai taškai | Žalia (3) | {{ui:Taškai}} |
| V-NODE-TEXT | Taškų žymos: numeris, aukštis, aprašymas | Žalia (3) | {{ui:Taškai}} ir {{ui:Taškų žymos}} |
| V-NODE-LINE | Linijos pagal linijų kodus (grupės, kurios nėra lūžio linijos) | Žalia (3) | {{ui:Taškai}} |
| C-ROAD-CNTR | Trasų ašys | Raudona (1) | Visada |
| C-ROAD-STAN | Stočių žymos ir žymos PC bei PT | Raudona (1) | Visada |
| C-ROAD-CORR | Koridorių kraštai | Geltona (2) | Visada |
| C-ROAD-SCTN | Imties linijos (kur pjaunami pjūviai) | Pilka (8) | Kai trasa turi imties linijas |
| C-GRAD-PADS | Aikštelių kontūrai | Mėlyna (5) | Visada |
| C-GRAD-DAYL | Dienos šviesos linijos | Purpurinė (6) | Visada |
| C-GRAD-SLOP | Vertikaliojo planavimo šlaitų linijos | Purpurinė (6) | Visada |
| C-GRAD-FEAT | Charakteringosios linijos (3D) | Žalia (3) | Visada |
| C-ROAD-SWPT | Važiavimo trajektorijos: kontūras, išoriniai ratų takai, pavadinimas | Oranžinė (30) | Visada |
| C-STRM-PIPE | Vamzdžiai | Mėlyna (5) | {{ui:Vamzdžiai}} |
| C-STRM-STRC | Konstrukcijos | Mėlyna (5) | {{ui:Vamzdžiai}} |
| C-STRM-TEXT | Vamzdžių ir konstrukcijų žymos | Mėlyna (5) | {{ui:Vamzdžiai}} |
| C-STRM-PROB | Vamzdžiai ir konstrukcijos su problemomis | Raudona (1) | {{ui:Vamzdžiai}} |

Lūžio linijos rodomos tik tada, kai skiltyje **Rodymas** **Paviršius** nustatytas į {{ui:Esamas gruntas}}; riba rodoma su bet kuriuo paviršiumi.

## Linijų storiai PDF

| Storis | Sluoksniai |
|---|---|
| 0.50 mm | Trasų ašys, aikštelės, vamzdžiai, problemiški vamzdžiai |
| 0.35 mm | Pagrindinės horizontalės, dienos šviesos linijos, konstrukcijos |
| 0.25 mm | Lūžio linijos |
| 0.13 mm | Smulkios horizontalės |
| 0.09 mm | Trikampių kraštinės, vertikaliojo planavimo šlaitų linijos |
| 0.18 mm | Visa kita |

DXF failuose linijų storių nėra; nustatykite juos pagal sluoksnį savo CAD programoje.

## Žymų dydžiai

Žymos dydinamos popieriuje: horizontalių žymos 2.0 mm, stočių žymos 1.8 mm, PC ir PT žymos bei vamzdžių ir konstrukcijų žymos 1.6 mm, taškų žymos 1.5 mm. Vamzdžių žymose nurodomas pavadinimas, skersmuo ir nuolydis; konstrukcijų žymose – pavadinimas ir viršutinis kraštas. Ekrane jos išlieka tokio paties dydžio, kai keičiate mastelį. DXF faile jos keičiamos pagal eksporto pranešime nurodytą mastelį; žr. [Eksportuoti planą į DXF](topic:dxf-export).

## Nerodoma jokiame sluoksnyje

Aukščio juostos ekrane piešiamos tik po linijomis. Profilio vaizdas nėra plano dalis.
