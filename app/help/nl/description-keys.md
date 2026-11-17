---
title: Omschrijvingssleutels en lijncodes
summary: Zet veldcodes om in puntgroepen met beschrijvingen, en verbind gecodeerde punten tot lijnen (begin, einde, sluiten) die breeklijnen worden.
keywords: omschrijvingssleutels, veldcodes, lijncodes, figuren, lijnwerk, begin, einde, sluiten, puntgroepen, codes, opmeetcodes, dataverzamelaar, breeklijnen, kantsteen, rand van de verharding
from: b3d1af8d
---

Opmeetploegen coderen elk meetpunt in het veld: `EP` voor rand van de verharding, `TC` voor bovenkant kantsteen, `BLDG` voor een hoek van een gebouw. De code is het eerste woord van de beschrijving van het punt. CivilCraft groepeert punten op die code, en zet lijncodes erna om in lijnen.

## Lijncodes

Een lijncode is het woord direct na de veldcode:

| Beschrijving | Betekenis |
|---|---|
| `EP B` | Begin hier een nieuwe lijn van de rand van de verharding |
| `EP` | Zet de huidige EP-lijn voort |
| `EP E` | Beëindig de huidige EP-lijn in dit punt |
| `BLDG C` | Sluit het gebouw: verbind dit punt met het eerste punt van de lijn |

Punten met dezelfde code worden verbonden in puntnummervolgorde. Verschillende codes zijn verschillende lijnen, ook als ze een groep delen, dus `EP1` en `EP2` geven twee randen tegelijk. Een code die nooit een lijncode gebruikt, wordt door al zijn punten verbonden, zoals in eerdere versies.

Lijnen in een groep die als **Breeklijn** wordt gebruikt, worden breeklijnen, één per lijn, zodat een kantsteen met een gat niet over dat gat wordt uitgerekt. Lijnen in andere groepen worden op het plan getekend (laag V-NODE-LINE) en gaan mee naar DXF, DWG en PDF.

De woorden voor begin, einde en sluiten zijn `B`, `BEG`, `START`; `E`, `END`; en `C`, `CLO`, `CLOSE`. Wijzig ze, of schakel lijncodes uit, in het dialoogvenster hieronder.

## Omschrijvingssleutels

Een omschrijvingssleutel zet een code om in een puntgroep, een gebruik en een lange beschrijving.

1. Klik onder **Punten** op {{ui:Omschrijvingssleutels en lijncodes}}.
2. Klik op {{ui:Een sleutel toevoegen}} en vul de rij in:
   - **Code**: de veldcode waarmee wordt gezocht. `*` staat voor willekeurige tekens en `?` voor één teken, dus `EP*` vangt EP, EP1 en EP12.
   - **Groep**: de puntgroep waar deze punten bij horen (leeg = de code zelf). `EP*` met groep `EP` zet EP1 en EP2 in één groep, terwijl ze gescheiden lijnen blijven.
   - **Gebruik**: Punten, Breeklijn of Weglaten, voor wanneer de groep voor het eerst verschijnt (of laat het over aan de tabel **Punten**).
   - **Beschrijving**: de lange naam, getoond in de **Eigenschappen** van een punt.
3. De kolom **Punten** telt de punten die elke sleutel vangt terwijl u typt. De eerste sleutel die op een code past, wint.
4. Klik op {{ui:Toepassen}}. De groepen, het oppervlak en het plan volgen in één stap: {{key:Mod+Z}} maakt het ongedaan.

Een groep behoudt het gebruik dat u er in de tabel **Punten** aan gaf; het gebruik van een sleutel stelt het alleen in voor een nieuwe groep. De sleutels en lijncodes worden in het projectbestand opgeslagen.
