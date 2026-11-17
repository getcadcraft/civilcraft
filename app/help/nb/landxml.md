---
title: Utveksle LandXML
summary: Åpne LandXML fra annen anleggsprogramvare som et nytt prosjekt, eksporter punkter, overflater, linjer, profiler og rørnettverket som LandXML 1.2, og vit hva som ikke følger med.
keywords: landxml, xml, import, eksport, utveksling, tin, overflate, linje, profil, rørnettverk, interoperabilitet, datautveksling
from: 870d5ece
---

LandXML er det åpne utvekslingsformatet de fleste anleggsprogrammer leser og skriver. CivilCraft leser og skriver LandXML 1.2. Hvis du har brukt Civil 3D, er dialogene for LandXML-import og -eksport der nærmest. Her er det ingen valg å ta, og notatene forteller hva som ble utelatt.

## Åpne en LandXML-fil

1. Klikk {{ui:Open}} (eller trykk {{key:Mod+O}}) og velg `.xml`- eller `.landxml`-filen, eller slipp den på planen.
2. Har det gjeldende prosjektet ulagrede endringer, spør CivilCraft først. Velg {{ui:Save a copy}}, {{ui:Don’t save}} eller {{ui:Cancel}}.
3. Et **nytt prosjekt** lages. Statuslinjen sier hva som ble lest, for eksempel «Åpnet site.xml: 412 punkter, 2 overflater, 3 linjer.»
4. Se på boksen under **Terrengmodell**-fakta. Den lister alt som ble hoppet over eller endret, for eksempel:
   - «Bare den første overflaten («EG») ble åpnet; filen har 1 til.»
   - «Veglinje «Ramp A» har elementer CivilCraft ikke kan tegne ennå (ikke linjer, buer eller klotoidespiraler); den ble hoppet over.»
   - «Regler for rørnettverk fantes ikke i filen; plassholderne er i bruk. Sett dine under Prosjekt.»

Hva som blir til hva:

| I filen | I CivilCraft |
|---|---|
| Enheter (Imperial eller Metric) | Prosjektets **Enheter** (fot eller meter) |
| Prosjektnavn | Prosjektets **Navn** |
| CgPoints | Prosjektets punkter; beskrivelsen (eller koden) gir gruppen |
| Den første TIN-overflaten | Eksisterende terreng, brukt som den er («Overflate (fra LandXML)») |
| Hver linje av linjer, buer og klotoidespiraler | En linje med sine PI-er, radier og spirallengder, bygget på nytt fra kurvene |
| Den første designprofilen for hver linje | Designprofilen, med parabelformede vertikalkurver |
| Det første rørnettverket | Rørnettverket, med sine kanter, sumper og inverter |
| Elementlinjer av linjer og buer | Elementlinjer, med buene beholdt; fra et annet program starter de som **Bare tegnet** |

Hele listen over elementer og attributter er i [LandXML: hva som leses og skrives](topic:landxml-reference).

:::note
En overflate lest fra LandXML bygges ikke på nytt når du endrer punktgrupper eller tegner bruddlinjer. Klikk {{ui:Rebuild the surface from the points}} i seksjonen **Terrengmodell** for å bygge den fra punktene i stedet ({{key:Mod+Z}} henter LandXML-overflaten tilbake).
:::

## Eksporter LandXML

1. Klikk {{ui:LandXML}} i gruppen **Eksport**.
2. Nettleseren laster ned `<name>.xml`. Statuslinjen sier hva som ble med, for eksempel «Eksporterte LandXML 1.2: 276 punkter, 2 overflater, 1 linje, rørnettverket. Byggeplater er ikke en del av LandXML her; det gjør den graderte overflaten.»

Filen inneholder:

- **Units**: amerikanske målefot eller meter.
- **CgPoints**: hvert punkt med sitt nummer som navn, sin beskrivelse og sin gruppe som kode.
- **Surfaces**: det eksisterende terrenget som en TIN, med bruddlinjene og den ytre grensen som kildedata; og, når byggeplater eller korridorer graderes, en andre TIN-overflate kalt «Proposed».
- **Alignments**: linjer, buer og klotoidespiraler med sine profilnumre, hver med en profil som holder det eksisterende terrenget samplet langs seg og designprofilen (PVI-er og parabelformede kurver) når den har minst to PVI-er.
- **PipeNetworks**: konstruksjoner med sine kanter, sumper og invert per rør, og rørene med diameter, lengde og fall.
- **PlanFeatures**: hver elementlinje som linjer og buer, med koten i hver ende og hva den brukes til.

## Hva som ikke følger med

- Byggeplater og korridorer som objekter. Resultatet deres er i den «Proposed»-overflaten.
- Linjer med feil (for eksempel overlappende kurver): utelatt, og telt i statusmeldingen.
- Rør uten begge inverter, og nettverk med færre enn to konstruksjoner.
- En kant hentet fra overflaten skrives som en fast kant. Åpnes den igjen, beholder konstruksjonen det tallet selv om overflaten endres.
- Nettverksregler (minste fall, dekning, fallhøyde): LandXML har ingen plass til dem.
- Visningsinnstillinger og punktgruppenes valg av overflate: lagre et CivilCraft-prosjekt for dem.

Når du åpner, leser ikke CivilCraft andre spiraler enn klotoide, rutenettoverflater, punkter som bare refererer til andre punkter, parseller, spiraler i elementlinjer, veier eller oppmålingsdata. Hver av dem er nevnt i notatene, aldri gjettet.

## Tur og retur

For å gi arbeid til noen som bruker annen anleggsprogramvare og få det tilbake, eksporter LandXML, la dem redigere, og åpne deres LandXML som et nytt prosjekt. Behold også din egen `.civilcraft.json`: det er den eneste filen som beholder alt CivilCraft vet.
