---
title: Arbejdsområdet Elledninger
summary: Luftledninger og underjordiske kabler på din plads, med dine egne biblioteker, gennemhængning og spænding under dine lasttilfælde, frihøjde- og styrkekontroller, optrækningstabeller, mængder, ark og GIS-eksport.
keywords: elledning, luftledning, elektrisk, distribution, stolper, understøtninger, leder, gennemhængning, spænding, optrækning, frihøjde, underjordisk kabel, grøft, arbejdsområde, forsyning
from: 638dd856
---

Arbejdsområdet Elledninger placerer luftledninger og underjordiske kabler på den CivilCraft-plads, du allerede har: de samme målepunkter, det samme terræn, den samme projektfil.

:::warning
Et designhjælpemiddel. Arbejdsområdet regner gennemhængning, spænding, frihøjder og laster ud fra **dine** lasttilfælde og grænser; ingen lands standard er indbygget. En ingeniør kontrollerer hvert resultat mod den standard, der gælder, før noget bygges.
:::

## Åbn det

Vælg {{ui:Overflade}} › {{ui:Mere}} › {{ui:Arbejdsområde for elledninger}}, eller **Elledninger** under Arbejdsområde. Værktøjslinjen viser så en gruppe **Elledninger**; grupperne Design og GIS træder til side. Vælg **Civil** under Arbejdsområde for at gå tilbage. CivilCraft husker det arbejdsområde, du brugte sidst på denne computer.

Venstre panel får to afsnit øverst:

- **Elledninger**: dine lasttilfælde og grænser, linjerne og kablerne i projektet og **Kontroller**, altid opdateret. Klik på en kontrol for at vælge det, den handler om.
- **Bibliotek**: dine egne ledere, kabler, understøtninger, udstyr og grøftetyper. Se [Dit elledningsbibliotek](topic:power-line-library).

## Hvad der er i gruppen Elledninger

| Værktøj | Hvad det gør | Emne |
|---|---|---|
| **Linje** | En luftledning: klik på hver understøtning | [Tegn en luftledning](topic:overhead-line) |
| **Understøtning** | Tilføj en understøtning på et spænd | [Tegn en luftledning](topic:overhead-line) |
| **Kabel** | En underjordisk kabelrute i en grøft | [Underjordiske kabler](topic:underground-cables) |
| **Udstyr** | Et skab, en transformer, en samling eller kilden, netværket forsynes fra | [Underjordiske kabler](topic:underground-cables) |
| **Forhindring** | Noget en linje krydser: en vej, en bygning, en anden linje | [Kontroller](topic:power-line-checks) |
| **Profil** | Linjens profil: terræn, understøtninger og lederen ved hvert lasttilfælde | [Tegn en luftledning](topic:overhead-line#the-line-profile) |
| **Mere** | Lasttilfælde og grænser, optrækningstabeller, mængder, ark og rapport, GIS, undersøgelsesfiler | [Gennemhængning og spænding](topic:sag-and-tension), [Resultater](topic:power-line-outputs), [Undersøgelsesfiler](topic:power-line-study-file) |

Alt, du tilføjer, er ét trin at fortryde, gemmes i projektfilen og tegnes på planen på lag med navnene `C-POWR-…`, så DXF-, DWG- og PDF-eksporter også har det med.
