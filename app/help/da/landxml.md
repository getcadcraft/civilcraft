---
title: Udveksl LandXML
summary: Åbn LandXML fra andre anlægsprogrammer som et nyt projekt, eksportér punkter, overflader, tracéer, profiler og rørnettet som LandXML 1.2, og vid, hvad der ikke kommer med.
keywords: landxml, xml, import, eksport, udveksling, tin, overflade, tracé, profil, rørnet, interoperabilitet, dataudveksling
from: 870d5ece
---

LandXML er det åbne udvekslingsformat, de fleste anlægsprogrammer læser og skriver. CivilCraft læser og skriver LandXML 1.2. Hvis du har brugt Civil 3D, er dens LandXML-import- og eksportdialoger den nærmeste sammenligning; her er der ingen valg at træffe, og noterne fortæller dig, hvad der er udeladt.

## Åbn en LandXML-fil

1. Klik på {{ui:Åbn}} (eller tryk {{key:Mod+O}}) og vælg `.xml`- eller `.landxml`-filen, eller slip den på planen.
2. Hvis det aktuelle projekt har ikke-gemte ændringer, spørger CivilCraft først. Vælg {{ui:Gem en kopi}}, {{ui:Gem ikke}} eller {{ui:Annuller}}.
3. Et **nyt projekt** oprettes. Statuslinjen siger, hvad der blev læst, fx »Åbnede site.xml: 412 punkter, 2 overflader, 3 tracéer.«
4. Kig på boksen under **Overflade**-oplysningerne. Den lister alt, der blev sprunget over eller ændret, fx:
   - »Kun den første overflade ("EG") blev åbnet; filen har 1 mere.«
   - »Tracéet "Ramp A" har elementer, CivilCraft ikke kan tegne endnu (ikke linjer, buer eller klothoide-spiraler); det blev sprunget over.«
   - »Regler for rørnettet var ikke i filen; pladsholderne bruges — angiv dine under Projekt.«

Sådan bliver det til:

| I filen | I CivilCraft |
|---|---|
| Enheder (Imperial eller Metric) | Projektets **Enheder** (fod eller meter) |
| Projektnavn | Projektets **Navn** |
| CgPoints | Projektets punkter; beskrivelsen (eller koden) giver gruppen |
| Den første TIN-overflade | Det eksisterende terræn, brugt som det er ("Overflade (fra LandXML)") |
| Hvert tracé med linjer, buer og klothoide-spiraler | Et tracé med sine PI'er, radier og spiral-længder genskabt ud fra kurverne |
| Den første projekterede profil for hvert tracé | Dens projekterede profil, med parabolske lodrette kurver |
| Det første rørnet | Rørnettet, med dets rande, sumpe og inverter |
| Planfeatures med linjer og buer | Feature-linjer, buer bevaret; fra andet program starter de som **Kun tegnet** |

Den fulde liste over elementer og attributter står i [LandXML: hvad der læses og skrives](topic:landxml-reference).

:::note
En overflade læst fra LandXML genopbygges ikke, når du ændrer punktgrupper eller tegner brudlinjer. Klik på {{ui:Genopbyg overfladen fra punkterne}} i afsnittet **Overflade** for i stedet at bygge den ud fra punkterne ({{key:Mod+Z}} henter LandXML-overfladen tilbage).
:::

## Eksportér LandXML

1. Klik på {{ui:LandXML}} i gruppen **Eksport**.
2. Browseren downloader `<name>.xml`. Statuslinjen siger, hvad der kom med, fx »Eksporterede LandXML 1.2: 276 punkter, 2 overflader, 1 tracé, rørnettet. Byggeplateauer indgår ikke i LandXML her; det gør den planerede overflade.«

Filen indeholder:

- **Enheder**: US survey-fod eller meter.
- **CgPoints**: hvert punkt med sit nummer som navn, sin beskrivelse og sin gruppe som kode.
- **Overflader**: det eksisterende terræn som en TIN med dets brudlinjer og ydre afgrænsning som kildedata; og, når byggeplateauer eller korridorer planeres, en anden TIN-overflade navngivet "Proposed".
- **Tracéer**: linjer, buer og klothoide-spiraler med deres stationer, hver med en profil, der holder det eksisterende terræn samplet langs tracéet, og den projekterede profil (PVI'er og parabolske kurver), når den har mindst to PVI'er.
- **PipeNetworks**: brønde med deres rande, sumpe og inverter pr. rør, og rørene med diameter, længde og fald.
- **PlanFeatures**: hver feature-linje som linjer og buer med koten i hver ende, og hvad den bruges til.

## Hvad der ikke kommer med

- Byggeplateauer og korridorer som objekter. Deres resultat står i den "Proposed"-overflade.
- Tracéer med fejl (fx overlappende kurver): udeladt og talt i statusmeddelelsen.
- Rør uden begge inverter, og netværk med færre end to brønde.
- En rand taget fra overfladen skrives som en fast rand. Når filen åbnes igen, beholder brønden det tal, selv hvis overfladen ændres.
- Netværksregler (mindste fald, dækning, fald pr. trin): LandXML har ingen plads til dem.
- Visningsindstillinger og punktgruppers valg af overflader: gem et CivilCraft-projekt for dem.

Ved åbning læser CivilCraft ikke spiraler andre end klothoide, gitteroverflader, punkter, der kun henviser til andre punkter, parceller, spiraler i planfeatures, veje eller opmålingsdata. Hver enkelt nævnes i noterne, aldrig gættet.

## Rundrejser

For at overdrage arbejde til nogen, der bruger andet anlægsprogram, og få det tilbage, eksportér LandXML, lad dem redigere, og åbn deres LandXML som et nyt projekt. Behold også din egen `.civilcraft.json`: det er den eneste fil, der beholder alt, CivilCraft ved.
