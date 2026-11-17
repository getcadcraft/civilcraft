---
title: Plāna slāņi
summary: Fiksētie slāņu nosaukumi, krāsas un līniju biezumi, ko CivilCraft izmanto ekrānā, DXF un PDF failos, un kura attēlošanas iestatījums vada katru no tiem.
keywords: slāņi, slāņu nosaukumi, ncs, krāsas, aci, līniju biezumi, dxf slāņi, pdf, attēlošanas iestatījumi, līnijas
from: c2aa8475
---

Viss plānā pieder kādam slānim. Nosaukumi seko ierastajam civilo slāņu modelim (disciplīna, galvenā grupa, apakšgrupa). Šajā versijā slāņi ir fiksēti: tos nevar pārdēvēt, mainīt to krāsas vai pievienot savus. DXF failā katram slānim ir norādītais krāsas numurs; PDF failā ar {{ui:Slāņu krāsas}} tiek izmantotas tās pašas krāsas, bet ar {{ui:Melna}} viss tiek drukāts melnā krāsā.

| Slānis | Satur | Krāsa (DXF numurs) | Rādīts, kad |
|---|---|---|---|
| C-TOPO-MINR | Papildhorizontāles | Pelēka (8) | {{ui:Horizontāles}} |
| C-TOPO-MAJR | Galvenās horizontāles | Balta vai melna (7) | {{ui:Horizontāles}} |
| C-TOPO-TEXT | Horizontāļu uzraksti | Balta vai melna (7) | {{ui:Horizontāles}} un {{ui:Horizontāļu uzraksti}} |
| C-TOPO-TINN | Trijstūru malas | Pelēka (8) | {{ui:Trijstūri}} |
| C-TOPO-BRKL | Lūzumlīnijas un robeža | Oranža (30) | {{ui:Lūzumlīnijas}} |
| C-TOPO-BNDY | Virsmas mala | Balta vai melna (7) | {{ui:Virsmas mala}} |
| C-TOPO-SLOP | Nogāžu bultiņas | Ciāna (4) | {{ui:Nogāžu bultiņas}} |
| V-NODE | Uzmērījuma punkti | Zaļa (3) | {{ui:Punkti}} |
| V-NODE-TEXT | Punktu uzraksti: numurs, augstuma atzīme, apraksts | Zaļa (3) | {{ui:Punkti}} un {{ui:Punktu uzraksti}} |
| V-NODE-LINE | Līnijas no līniju kodiem (grupas, kas nav lūzumlīnijas) | Zaļa (3) | {{ui:Punkti}} |
| C-ROAD-CNTR | Trases centrlīnijas | Sarkana (1) | Vienmēr |
| C-ROAD-STAN | Pikešu atzīmes un uzraksti, PC un PT | Sarkana (1) | Vienmēr |
| C-ROAD-CORR | Koridora malas | Dzeltena (2) | Vienmēr |
| C-ROAD-SCTN | Paraugu līnijas (kur tiek veikti griezumi) | Pelēka (8) | Kad trasei ir paraugu līnijas |
| C-GRAD-PADS | Platformu kontūras | Zila (5) | Vienmēr |
| C-GRAD-DAYL | Nogāžu robežlīnijas | Fuksīna (6) | Vienmēr |
| C-GRAD-SLOP | Vertikālās plānošanas nogāžu līnijas | Fuksīna (6) | Vienmēr |
| C-GRAD-FEAT | Raksturlīnijas (3D) | Zaļa (3) | Vienmēr |
| C-ROAD-SWPT | Braukšanas trajektorijas: kontūra, ārējās riteņu trajektorijas, nosaukums | Oranža (30) | Vienmēr |
| C-STRM-PIPE | Caurules | Zila (5) | {{ui:Caurules}} |
| C-STRM-STRC | Konstrukcijas | Zila (5) | {{ui:Caurules}} |
| C-STRM-TEXT | Cauruļu un konstrukciju uzraksti | Zila (5) | {{ui:Caurules}} |
| C-STRM-PROB | Caurules un konstrukcijas ar problēmām | Sarkana (1) | {{ui:Caurules}} |

Lūzumlīnijas tiek zīmētas tikai tad, kad **Virsma** sadaļā **Attēlojums** ir {{ui:Esošais reljefs}}; robeža tiek zīmēta ar jebkuru virsmu.

## Līniju biezumi PDF failā

| Biezums | Slāņi |
|---|---|
| 0.50 mm | Trases centrlīnijas, platformas, caurules, problemātiskas caurules |
| 0.35 mm | Galvenās horizontāles, nogāžu robežlīnijas, konstrukcijas |
| 0.25 mm | Lūzumlīnijas |
| 0.13 mm | Papildhorizontāles |
| 0.09 mm | Trijstūru malas, vertikālās plānošanas nogāžu līnijas |
| 0.18 mm | Visi pārējie |

DXF failos līniju biezumi nav iekļauti; iestatiet tos pēc slāņiem savā CAD programmā.

## Uzrakstu izmēri

Uzraksti ir izmērīti uz papīra: horizontāļu uzraksti 2.0 mm, pikešu uzraksti 1.8 mm, PC un PT uzraksti, kā arī cauruļu un konstrukciju uzraksti 1.6 mm, punktu uzraksti 1.5 mm. Cauruļu uzrakstos norāda nosaukumu, diametru un slīpumu; konstrukciju uzrakstos — nosaukumu un vāka augstumu. Ekrānā tie paliek vienādā izmērā, tuvinot skatu. DXF failā tie tiek mērogoti atbilstoši mērogam, kas norādīts eksporta ziņojumā; skat. [Plāna eksportēšana uz DXF](topic:dxf-export).

## Netiek rādīts nevienā slānī

Augstuma joslas ekrānā tiek zīmētas tikai zem līnijām. Profila skats nav daļa no plāna.
