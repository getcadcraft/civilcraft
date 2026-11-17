---
title: Lav en afsætningsrapport
summary: Opliste pæle langs et tracé ved stationer og forskydninger, eller de opmålingspunkter der ligger nær det, med station, forskydning, nord, øst, projekteret kote og terrænkote samt afgravning eller opfyld, og gem rapporten som CSV eller PDF.
keywords: afsætning, afsætningspæl, pælerapport, afgravningsark, koteark, station, forskydning, afgravning, opfyld, udlægning, byggeafsætning, layout, som bygget
from: d8a4e9f1
---

Vælg et tracé, og klik på **Afsætningsrapport** under dets **Egenskaber**.

## Pæle ved stationer og forskydninger

1. **Fra** og **til**: stationerne der skal afsættes (1+50 eller 150).
2. **Hver**: intervallet. Pæle sættes ved hver multipel af det, i begge ender, og (med feltet markeret) dér hvor tracéets kurver begynder og slutter.
3. **Forskydninger**: til venstre og højre for tracéet, set i stigende stationsretning: `12 L, 0, 12 R`, `L12 CL R12` eller `-12, 0, 12` (venstre er minus). Et tracé med en korridor starter med kanterne af belægning og skuldre.
4. **Nummerér fra** og **med præfiks** navngiver pælene: 1, 2, 3 eller S101, S102.

## Opmålingspunkter nær tracéet

Vælg **opmålingspunkter nær tracéet** og hvor nær. Hvert punkt inden for den afstand får sin station og forskydning, det projekterede der, og sin egen kote som terræn: en kontrol af punkter, der er afsat eller indmålt som bygget.

## Hvad rapporten viser

| Kolonne | Hvad det er |
|---|---|
| Punkt | Pælens navn, eller opmålingspunktets nummer |
| Station, Forskydning | Hvor den ligger langs tracéet: L venstre, R højre |
| Nord, Øst | Dens koordinater |
| Projekteret kote | Den planlagte korridors overflade dér (fra dagslinje til dagslinje), ellers den projekterede længdeprofil på centerlinjen |
| Terrænkote | Den eksisterende overflade dér, eller opmålingspunktets egen kote |
| Afgravning/opfyld | C når terrænet ligger over det projekterede (afgrav det), F når det ligger under (fyld op), på to decimaler |

En pæl uden projekteret kote (uden for korridoren, eller på et tracé uden en sådan væk fra centerlinjen) har ingen afgravning eller opfyld; dialogen siger, hvor mange.

## Gem den

- **CSV**: en titellinje, derefter kolonnerne ovenfor, plus afgravning eller opfyld som et fortegnet tal (terræn minus projekt) til regneark og datasamlere.
- **PDF**: tabelsider på det papir, du vælger, én pæl pr. række, afgravninger i orange og opfyldninger i grønt, med tegningshovedet fra de øvrige ark.

:::note
Pælene beregnes ud fra projektets design. Kontrollér dem mod de godkendte planer, før noget bygges.
:::
