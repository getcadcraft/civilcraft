---
title: Aprēķināt saules stundas teritorijā
summary: Izvēlieties dienu (vai sezonu) un laika joslu un skatiet tiešās saules stundas uz katras ēku masas sienas un apkārtējās zemes, ar zemi, kas zīmēta plānā, un skaitļiem CSV formātā.
keywords: saule, saules stundas, ēna, ēnojums, saules pieejamība, dienasgaismas stundas, fasāde, siena, sezona, saulgrieži, ekvinokcija, laika josla, vasaras laiks, platums, garums, CSV, rastrs
from: 4e32a314
---

**Saules stundas** skaita tiešās saules stundas, kas sasniedz katru ēku masas sienu un apkārtējo zemi, izvēlētā dienā vai vidēji pa sezonu. Masas un pati zeme met ēnu; nekas cits to nedara (nav koku, nav kaimiņu ēku, ko neesat zīmējis). Debess gaisma, kas nav tiešā saule, netiek skaitīta.

## Pirms sākat

Saules atrašanās vieta nāk no objekta platuma un garuma, kas tiek ņemti no projekta **koordinātu sistēmas**. Projekts bez tās tiek noraidīts ar ziņojumu: vispirms to iestatiet (**Koordinātes** GIS grupā). Platums un garums, ievadīti ar roku, būtu minējums, tāpēc lauka nav.

## Aprēķināšana

Sadaļā **Rekvizīti**, zem **Ēku masas**, **Saules stundas**:

1. Izvēlieties **Diena**. Tā sākas ar dienu, kad saule ir zemākā jūsu vietā (21. decembris vai 21. jūnijs dienvidu puslodē). Sezonai atzīmējiet **Pa sezonu**, izvēlieties **Pēdējā diena** un cik dienu attālumā ņemt paraugus.
2. Ierakstiet **Laika josla**: nosaukums, piemēram, `America/Mexico_City`, vai nobīde no UTC, piemēram, `-6`. Nosaukums seko šīs joslas vasaras laika noteikumiem attiecīgajai dienai; ierakstītā nobīde tiek lietota tieši kā ierakstīta, tāpēc izmantojiet to, kas tajā dienā ir spēkā. Rindā zem lauka ir norādīts, kādu nobīdi tā atrada.
3. Izvēlieties, cik bieži novietot sauli (ik 5, 10, 15 vai 30 minūtes), tad **Aprēķināt saules stundas**. Sezona tiek aprēķināta fona procesos; **Apturēt** to atceļ.

## Ko iegūstat

- Tabula pa masām: **sliktākā siena**, **vidējā** un **labākā siena** stundās dienā, un tabula par katru sienu ar tās orientāciju un stundām pa stāviem.
- Zeme ap masām plānā zīmēta no tumšas (bez saules) līdz dzeltenai (visvairāk, ko jebkura šūna saņem), ar legendu. Šūnas zem masas paliek tukšas. **Rādīt zemi plānā** to izslēdz.
- **Sienas kā CSV** un **Zeme kā CSV** saglabā skaitļus.

Sezonai skaitļi ir vidējais dienā pa paraugā iekļautajām dienām. Projektā nekas netiek saglabāts: rezultāts ir paredzēts skatīšanai, un tā atkārtota palaišana to izveido no jauna.

## Noderīgi zināt

- Siena skaita brīdi kā saulainu tikai tad, kad tā ir pavērsta pret sauli un nekas nestāv ceļā. Siena, kas ir pavērsta prom, nesaņem neko.
- Zeme tiek ņemta paraugos režģī, kas atkarīgs no objekta izmēra, un saules atrašanās vieta tiek ņemta katra laika soļa vidū, tāpēc stundas ir precīzas līdz aptuveni izvēlētajam solim.
- Saules atrašanās vieta ir publicēta astronomiska formula, precīza līdz aptuveni vienai loka minūtei.
