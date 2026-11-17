---
title: Gör en utsättningsrapport
summary: Lista pinnar längs en linjeföring vid stationer och sidoavstånd, eller de mätpunkter som ligger nära den, med station, sidoavstånd, nordvärde, östvärde, projekterad höjd och markhöjd samt schakt eller fyll, och spara rapporten som CSV eller PDF.
keywords: utsättning, utsättningspinnar, rapport, skärlista, fyllnadslista, station, sidoavstånd, schakt, fyll, layout, byggutsättning, som-byggt
from: d8a4e9f1
---

Välj en linjeföring och klicka på **Utsättningsrapport** i dess **Palett**.

## Pinnar vid stationer och sidoavstånd

1. **Från** och **till**: stationerna att sätta ut (1+50 eller 150).
2. **varje**: intervallet. Pinnar sätts vid varje multipel av det, i båda ändar och (med rutan ikryssad) där linjeföringens kurvor börjar och slutar.
3. **Sidoavstånd**: till vänster och höger om linjeföringen, sett i stigande station: `12 L, 0, 12 R`, `L12 CL R12` eller `-12, 0, 12` (vänster är minus). En linjeföring med en korridor börjar med sina kanter på beläggning och vägrenar.
4. **Numrera från** och **med prefix** namnger pinnarna: 1, 2, 3, eller S101, S102.

## Mätpunkter nära linjeföringen

Välj **mätpunkter nära linjeföringen** och hur nära. Varje punkt inom det avståndet får sin station och sitt sidoavstånd, den projekterade höjden där och sin egen höjd som mark: en kontroll av punkter som satts ut eller mätts in som byggt.

## Vad rapporten innehåller

| Kolumn | Vad det är |
|---|---|
| Punkt | Pinnens namn, eller mätpunktens nummer |
| Station, sidoavstånd | Var den ligger längs linjeföringen: L vänster, R höger |
| Nordvärde, östvärde | Dess koordinater |
| Projekterad höjd | Den utformade korridorens yta där (från släntkrön till släntkrön), annars den projekterade profilen på mittlinjen |
| Markhöjd | Den befintliga ytan där, eller mätpunktens egna höjd |
| Schakt/fyll | C när marken ligger över det projekterade (schakta ned), F när den ligger under (fyll upp), i hundradelar |

En pinne utan projekterad höjd (utanför korridoren, eller på en linjeföring utan en sådan bort från mittlinjen) har ingen schakt eller fyll; dialogrutan säger hur många.

## Spara den

- **CSV**: en rubrikrad, sedan kolumnerna ovan, plus schakt eller fyll som ett tal med tecken (mark minus projekterad) för kalkylblad och datainsamlare.
- **PDF**: tabellsidor på det pappersformat du väljer, en pinne per rad, schakt i orange och fyll i grönt, med titelremsan från de andra bladen.

:::note
Pinnarna beräknas utifrån den projekterade utformningen i projektet. Kontrollera dem mot de godkända ritningarna innan något byggs.
:::
