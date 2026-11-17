---
title: Layout af parkeringsplads
summary: Læg båse, kørebaner, handicap- og varebilspladser og øer ud inden for et omrids, planér pladsen med fald mod dræn i forhold til det eksisterende terræn, og belæg og beplant den. Også tilgængelig for en assistent.
keywords: parkering, parkeringsplads, bås, kørebane, handicap, ada, varebil, ø, dræn, fald, planering, afgravning, opfyld, belægning, belægningssten, beplantning, træer, terræn, punktsky, mcp, assistent
from: 06c14da9
---

Tilpas en parkeringsplads i en matrikel, et byggeplateau eller en lukket feature-linje, og få optællingerne, planeringen og belægningen i ét trin.

## Lav layoutet

1. Vælg en matrikel, et byggeplateau eller en lukket feature-linje på planen.
2. Åbn **Terræn, Mere, Parkeringsplads...**
3. Vælg reglerne, båsevinklen (90, 75, 60, 45, 30 grader eller parallel) og envejs- eller tovejs kørebaner. Mål for bås, kørebane og ø starter fra tabellen, og hver af dem kan overskrives ved indtastning.
4. Vælg **Lav layout**.

Rækkerne løber langs den kant af omridset, der giver flest båse (eller i den vinkel, du indtaster). En bås tæller kun, hvis den ligger helt inden for omridset. Hvor der er plads til én række og en kørebane, tilføjes et enkeltbelastet bånd. Vinduet viser pladserne, handicap- og varebilspladserne, øerne, dræn og arealet pr. plads, og planen viser båse, handicapspladser med deres skraverede adgangskørebaner, øer, kørebanernes midterlinjer og dræn på egne lag (C-PARK-...), så de kommer med til PDF, DXF og DWG.

## Handicapspladser

Med de amerikanske regler følger antallet 2010 ADA Standards, tabel 208.2, for de pladser, der etableres (én ud af seks, rundet op, er en varebilsplads). Pladserne placeres tættest på det første hjørne af omridset (indgangen), hver med en adgangskørebane; to deler én. En bås, der er smallere end handicapbredden, eller et fald, der er stejlere end 1:48 på handicapspladser, vises som et problem. **Disse tal er indtastet fra standarden efter hukommelse og er ikke kontrolleret mod den trykte standard.** Typiske mål for båse og kørebaner stammer fra vejledninger i parkeringsdesign og er heller ikke kontrolleret. Kontrollér begge dele, og din lokale bygningsregulering, før du stoler på dem. Vælg **Brugerdefineret** for at indtaste dit eget antal handicapspladser.

## Fald mod dræn, afgravning og opfyld

Medmindre du slår det fra, bliver parkeringspladsen et planeringsområde i arbejdsområdet Landskab. Dræn lægges på kørebanernes midterlinjer ca. hver 100 feet (30 m); overfladen stiger fra hvert dræn med det fald, du angiver (1.5 procent til at starte med), så hvert punkt falder mod sit nærmeste dræn. Niveauet vælges, så parkeringspladsens afgravning og opfyld balancerer på det eksisterende terræn. Det eksisterende terræn er projektets eksisterende overflade, som kan komme fra opmålingspunkter, LandXML, en lidar- eller scanningspunktsky omdannet til en overflade, eller højdekurver. Vinduet viser estimatet for afgravning og opfyld; projektets egne volumener viser den præcise værdi bagefter. Planeringsområdet holder sin kant på det eksisterende terræn, så hvor den nye overflade afviger fra terrænet ved kanten, får du et trin, og vinduet angiver, hvor stort det er.

## Belægning og beplantning

Hele omridset får en belægning med belægningssten (et løbermønster, som du kan ændre under Landskab, Hardscape), og hver ø får en buskbed og, hvor den er bred nok, et træ hentet fra plantelisten. Alt er derefter et almindeligt Landskab-objekt: rediger det, eller vælg **Lav layout igen** for at erstatte det, parkeringspladsen lavede. Fjernes parkeringspladsen, fjernes det, den lavede.

## Fra en assistent

Den samme parkeringsplads kan bestilles via MCP: `parking_layout` viser en forhåndsvisning, `parking_build` skriver, og `parking_remove` fjerner en parkeringsplads. Angiv matrikelnavnet, eller send omridset.

## Hvad der ikke er lavet endnu

Det kontrolleres ikke, om kørebanerne når en vej. Belægningen dækker hele omridset, så dens areal omfatter øerne. Valg af belægningsmateriale fra biblioteket og en biblioteks-type for båse er ikke lavet endnu; belægningsmønsteret er Hardscape-mønsteret. Andre landes regler er ikke lavet endnu.
