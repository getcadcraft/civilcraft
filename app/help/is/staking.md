---
title: Búa til útsetningarskýrslu
summary: Telja upp staura meðfram veglínu við stöðvar og frávik, eða mælipunkta nálægt henni, með stöð, frávik, norðurhnit, austurhnit, hönnunarkóta og landkóta ásamt skurði eða fyllingu, og vista skýrsluna sem CSV eða PDF.
keywords: útsetning, útsetningarskýrsla, skurðarblað, hæðarblað, stöð, frávik, skurður, fylling, útlögn, útsetning á framkvæmdastað, eins og byggt
from: d8a4e9f1
---

Veldu veglínu og smelltu á **Útsetningarskýrsla** í **Eiginleikum** hennar.

## Staurar við stöðvar og frávik

1. **Frá** og **til**: stöðvarnar sem á að staura (1+50 eða 150).
2. **Á hverju**: bilið. Staurar fara á hverja margfeldistölu þess, við báða enda og (ef reiturinn er hakaður) þar sem beygjur veglínunnar byrja og enda.
3. **Frávik**: vinstri og hægri við veglínuna, horft í átt að vaxandi stöð: `12 L, 0, 12 R`, `L12 CL R12` eða `-12, 0, 12` (vinstri er mínus). Veglína með ræmu byrjar á brúnum slitlags og axla.
4. **Númera frá** og **með forskeyti** nefna staurana: 1, 2, 3, eða S101, S102.

## Mælipunktar nálægt veglínunni

Veldu **mælipunkta nálægt veglínunni** og hversu nálægt. Hver punktur innan þeirrar fjarlægðar fær stöð sína og frávik, hönnunina á þeim stað og eigin hæð sem landkóta: athugun á punktum sem hafa verið settir út eða mældir sem byggt.

## Það sem skýrslan segir

| Dálkur | Hvað hann er |
|---|---|
| Punktur | Heiti staursins, eða númer mælipunktsins |
| Stöð, frávik | Hvar hann er eftir veglínunni: L vinstri, R hægri |
| Norðurhnit, austurhnit | Hnit hans |
| Hönnunarkóti | Yfirborð ræmunnar þar sem landi hefur verið mótað (frá skurðbrúnarlínu að skurðbrúnarlínu), annars hönnunarlengdarsniðið á miðlínunni |
| Landkóti | Núverandi yfirborð þar, eða eigin hæð mælipunktsins |
| Skurður/fylling | C þegar landið er yfir hönnuninni (skera niður), F þegar það er undir (fylla upp), að hundraðshluta |

Staur án hönnunarkóta (utan ræmunnar, eða á veglínu án hans fjarri miðlínu) hefur hvorki skurð né fyllingu; glugginn segir hversu margir þeir eru.

## Vista hana

- **CSV**: titillína, síðan dálkarnir hér að ofan, auk skurðar eða fyllingar sem tölu með formerki (landkóti mínus hönnunarkóti) fyrir töflureikna og gagnasöfnunartæki.
- **PDF**: töflusíður á þeim pappír sem þú velur, eitt staur í röð, skurðir appelsínugulir og fyllingar grænar, með titilræmu hinna blaðanna.

:::note
Staurar eru reiknaðir út frá hönnuninni í verkefninu. Berðu þá saman við samþykktar teikningar áður en nokkuð er byggt.
:::
