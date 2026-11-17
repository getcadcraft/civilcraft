---
title: Lög grunnmyndar
summary: Föstu heiti laga, litir og línuþykktir sem CivilCraft notar á skjánum, í DXF og í PDF, og hvaða birtingarstilling stýrir hverju.
keywords: lög, heiti laga, ncs, litir, aci, línuþykktir, dxf-lög, pdf, birtingarstillingar, línuverk
from: c2aa8475
---

Allt á grunnmyndinni tilheyrir lagi. Heitin fylgja algengu lagamynstri fyrir mannvirkjagerð (fag, meginhópur, undirhópur). Lögin eru föst í þessari útgáfu: ekki er hægt að endurnefna þau, breyta litum þeirra né bæta við eigin lögum. Í DXF hefur hvert lag litanúmerið sem sýnt er; í PDF með {{ui:Litir laga}} eru sömu litir notaðir, og með {{ui:Svart}} prentast allt svart.

| Lag | Inniheldur | Litur (DXF-númer) | Sýnt þegar |
|---|---|---|---|
| C-TOPO-MINR | Minni hæðarlínur | Grátt (8) | {{ui:Hæðarlínur}} |
| C-TOPO-MAJR | Meiri hæðarlínur | Hvítt eða svart (7) | {{ui:Hæðarlínur}} |
| C-TOPO-TEXT | Merkingar hæðarlína | Hvítt eða svart (7) | {{ui:Hæðarlínur}} og {{ui:Merkingar hæðarlína}} |
| C-TOPO-TINN | Jaðrar þríhyrninga | Grátt (8) | {{ui:Þríhyrningar}} |
| C-TOPO-BRKL | Brotlínur og markalínan | Appelsínugult (30) | {{ui:Brotlínur}} |
| C-TOPO-BNDY | Jaðar yfirborðs | Hvítt eða svart (7) | {{ui:Jaðar yfirborðs}} |
| C-TOPO-SLOP | Hallaörvar | Blágrænt (4) | {{ui:Hallaörvar}} |
| V-NODE | Mælipunktar | Grænt (3) | {{ui:Punktar}} |
| V-NODE-TEXT | Merkingar punkta: númer, kóti, lýsing | Grænt (3) | {{ui:Punktar}} og {{ui:Merkingar punkta}} |
| V-NODE-LINE | Línur úr línukóðum (hópar sem eru ekki brotlínur) | Grænt (3) | {{ui:Punktar}} |
| C-ROAD-CNTR | Miðlínur veglínu | Rautt (1) | Alltaf |
| C-ROAD-STAN | Stöðvamerki og merkingar, PC og PT | Rautt (1) | Alltaf |
| C-ROAD-CORR | Jaðrar vegbelta | Gult (2) | Alltaf |
| C-ROAD-SCTN | Sniðlínur (þar sem sniðin eru tekin) | Grátt (8) | Þegar veglínan hefur sniðlínur |
| C-GRAD-PADS | Útlínur flata | Blátt (5) | Alltaf |
| C-GRAD-DAYL | Skurðlínur | Fjólublátt (6) | Alltaf |
| C-GRAD-SLOP | Hallalínur landmótunar | Fjólublátt (6) | Alltaf |
| C-GRAD-FEAT | Einkennislínur (3D) | Grænt (3) | Alltaf |
| C-ROAD-SWPT | Akstursferlar: útlína, ystu hjólaför, heiti | Appelsínugult (30) | Alltaf |
| C-STRM-PIPE | Pípur | Blátt (5) | {{ui:Pípur}} |
| C-STRM-STRC | Brunnar | Blátt (5) | {{ui:Pípur}} |
| C-STRM-TEXT | Merkingar pípa og brunna | Blátt (5) | {{ui:Pípur}} |
| C-STRM-PROB | Pípur og brunnar með vandamál | Rautt (1) | {{ui:Pípur}} |

Brotlínur eru aðeins teiknaðar á meðan **Yfirborð** undir **Birting** er {{ui:Núverandi land}}; markalínan er teiknuð með hvoru yfirborði sem er.

## Línuþykktir í PDF

| Þykkt | Lög |
|---|---|
| 0.50 mm | Miðlínur veglínu, flatar, pípur, pípur með vandamál |
| 0.35 mm | Meiri hæðarlínur, skurðlínur, brunnar |
| 0.25 mm | Brotlínur |
| 0.13 mm | Minni hæðarlínur |
| 0.09 mm | Jaðrar þríhyrninga, hallalínur landmótunar |
| 0.18 mm | Allt annað |

DXF-skrár innihalda engar línuþykktir; stilltu þær eftir lögum í CAD-forritinu þínu.

## Stærðir texta

Texti er mældur á pappír: merkingar hæðarlína 2.0 mm, stöðvamerkingar 1.8 mm, merkingar PC og PT og merkingar pípa og brunna 1.6 mm, merkingar punkta 1.5 mm. Merkingar pípa sýna heiti, þvermál og halla; merkingar brunna sýna heiti og brún. Á skjánum haldast þær sömu stærð þegar þú breytir aðdrætti. Í DXF eru þær skalaðar fyrir mælikvarðann sem nefndur er í útflutningsskilaboðunum; sjá [Flytja grunnmynd út í DXF](topic:dxf-export).

## Ekki sýnt á neinu lagi

Hæðarbönd eru teiknuð undir línuverkinu, aðeins á skjánum. Langsniðsyfirlitið er ekki hluti af grunnmyndinni.
