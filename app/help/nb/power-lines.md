---
title: Arbeidsområdet Kraftlinjer
summary: Luftlinjer og jordkabler på stedet ditt, med egne biblioteker, nedhengning og spenning under lastsituasjonene dine, kontroll av frirom og styrke, strekketabeller, mengder, ark og GIS-eksport.
keywords: kraftlinje, luftlinje, elektrisk, distribusjon, stolper, master, leder, sigdybde, spenning, strekk, frirom, jordkabel, grøft, arbeidsområde, nettselskap
from: 638dd856
---

Kraftlinjer-arbeidsområdet legger luftlinjer og jordkabler inn på CivilCraft-stedet du allerede har: de samme oppmålingspunktene, det samme terrenget, den samme prosjektfilen.

:::warning
Et designhjelpemiddel. Arbeidsområdet regner ut nedhengning, spenning, frirom og laster ut fra **dine** lastsituasjoner og grenser; ingen lands standard er innebygd. En ingeniør kontrollerer hvert resultat mot standarden som gjelder før noe bygges.
:::

## Åpne det

Velg {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Kraftlinjearbeidsområde}}, eller **Kraftlinjer** under Arbeidsområde. Verktøylinjen viser da en **Kraftlinjer**-gruppe; Design- og GIS-gruppene trer til side. Velg **Civil** under Arbeidsområde for å gå tilbake. CivilCraft husker arbeidsområdet du brukte sist på denne datamaskinen.

Venstre panel får to nye seksjoner øverst:

- **Kraftlinjer**: lasttilfellene og grensene dine, linjene og kablene i prosjektet, og **Kontroller**, alltid oppdatert. Klikk en kontroll for å velge det den gjelder.
- **Bibliotek**: dine egne ledere, kabler, master, utstyr og grøftetyper. Se [Ditt kraftlinjebibliotek](topic:power-line-library).

## Hva som finnes i Kraftlinjer-gruppen

| Verktøy | Hva det gjør | Emne |
|---|---|---|
| **Linje** | En luftlinje: klikk på hver mast | [Tegn en luftlinje](topic:overhead-line) |
| **Mast** | Legg til en mast i et spenn | [Tegn en luftlinje](topic:overhead-line) |
| **Kabel** | En jordkabelrute i en grøft | [Jordkabler](topic:underground-cables) |
| **Utstyr** | Et skap, en transformator, en skjøt, eller kilden nettet mates fra | [Jordkabler](topic:underground-cables) |
| **Hindring** | Noe en linje krysser: en vei, en bygning, en annen linje | [Kontroller](topic:power-line-checks) |
| **Profil** | Linjeprofilet: terreng, master og lederen ved hver lastsituasjon | [Tegn en luftlinje](topic:overhead-line#the-line-profile) |
| **Mer** | Lasttilfeller og grenser, strekketabeller, mengder, ark og rapport, GIS, studiefiler | [Sigdybde og spenning](topic:sag-and-tension), [Resultater](topic:power-line-outputs), [Studiefiler](topic:power-line-study-file) |

Alt du legger til, er ett steg for å angre, lagres i prosjektfilen og tegnes på planen på layere som heter `C-POWR-…`, så DXF-, DWG- og PDF-eksportene tar det med også.
