---
title: Lag en utsettingsrapport
summary: List utsettingspunkter langs en veglinje ved profilnummer og forskyvning, eller oppmålingspunktene nær den, med profilnummer, forskyvning, nord, øst, prosjekterte kote og terrengkote samt skjæring eller fylling, og lagre rapporten som CSV eller PDF.
keywords: utsetting, utsettingsrapport, merkepinner, skjæringsliste, fyllingsliste, profilnummer, forskyvning, skjæring, fylling, planlegging, byggeutsetting, som-bygget
from: d8a4e9f1
---

Velg en veglinje og klikk **Utsettingsrapport** under **Egenskaper**.

## Utsettingspunkter ved profilnummer og forskyvning

1. **Fra** og **til**: profilnumrene som skal settes ut (1+50 eller 150).
2. **hver**: intervallet. Punkter settes ved hvert multiplum av det, i begge ender, og (med boksen avkrysset) der veglinjens kurver begynner og slutter.
3. **Forskyvninger**: til venstre og høyre for veglinjen, sett i retning av stigende profilnummer: `12 L, 0, 12 R`, `L12 CL R12` eller `-12, 0, 12` (venstre er minus). En veglinje med korridor starter med kjørebanekantene og skuldrene.
4. **Nummer fra** og **med prefiks** navngir punktene: 1, 2, 3, eller S101, S102.

## Oppmålingspunkter nær veglinjen

Velg **oppmålingspunkter nær veglinjen** og hvor nær. Hvert punkt innenfor den avstanden får sitt profilnummer og sin forskyvning, den prosjekterte høyden der, og sin egen høyde som terreng: en kontroll av punkter som er satt ut eller målt inn som bygget.

## Hva rapporten viser

| Kolonne | Hva det er |
|---|---|
| Punkt | Utsettingspunktets navn, eller oppmålingspunktets nummer |
| Profilnummer, Forskyvning | Hvor det er langs veglinjen: L venstre, R høyre |
| Nord, Øst | Koordinatene |
| Prosj. kote | Korridorens overflate der (fra skjæringslinje til skjæringslinje), ellers den prosjekterte lengdeprofilen på senterlinjen |
| Terrengkote | Eksisterende overflate der, eller oppmålingspunktets egen høyde |
| Skjæring/fylling | C når terrenget er over prosjektert (skjær ned), F når under (fyll opp), til hundredel |

Et utsettingspunkt uten prosjektert kote (utenfor korridoren, eller på en veglinje uten en slik kote bort fra senterlinjen) får ingen skjæring eller fylling; dialogen sier hvor mange.

## Lagre den

- **CSV**: en tittellinje, deretter kolonnene over, pluss skjæring eller fylling som et fortegnstall (terreng minus prosjektert) for regneark og datainnsamlere.
- **PDF**: tabellsider på papiret du velger, ett punkt per rad, skjæringer i oransje og fyllinger i grønt, med tittelstripen som de andre arkene har.

:::note
Utsettingspunktene beregnes ut fra prosjektets prosjektering. Kontroller dem mot de godkjente planene før noe bygges.
:::
