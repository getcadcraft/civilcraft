---
title: Kontroller for kraftlinjer
summary: Hva CivilCraft kontrollerer på hver linje og kabel, alltid oppdatert: frirom, avstander, utslag, oppløft, mastelaster og dimensjonering, beslag, stag, fundamenter, manglende data, tilkoblinger, overbelastning og spenningsfall.
keywords: kontroller, frirom, hindring, kryssing, fasavstand, isolatorutslag, oppløft, mastelast, nominell last, dimensjonering, fundament, stag, avspenning, beslag, tverrarm, spenningsfall, overbelastning, manglende data, frakoblet
from: e6a0da47
---

**Kontroller** i Kraftlinjer-delen lister opp alle problemer, rødt for det som feiler og gult for advarsler. Klikk på en for å velge linjen, masten, kabelen eller utstyret den gjelder; masteer og spenn som feiler, markeres med rødt rundt på planen mens arbeidsområdet er åpent.

:::warning
Et designhjelpemiddel: dette er kontroller av designet ditt mot dine egne regler, ikke en sertifisering.
:::

## Frirom

Den lavest liggende fasen på lederen følges langs hvert spenn ved hver lastsituasjon. Dens laveste frirom over terrenget må nå linjens **Friromsregel**. Der et spenn krysser en **hindring** (tegnet med {{ui:Hindring}}: et punkt eller en linje, med sin høyde over terrenget og sin egen friromsregel), kontrolleres frirommet over hindringens topp på samme måte.

**Det som Landskapsarbeidsområdet legger over terrenget, teller også.** Enkeltplanter (kronen ved moden utbredelse og høyde), hekker og plantebed (den høyeste arten i dem) og murer (toppen av dem) er hindringer under en linje, uten at de må tegnes på nytt. De beholder reglene satt i {{ui:Lasttilfeller og grenser…}}: **Landskapsplanter under en linje** (eksempelsettene bruker *Trær og planter*, 3 m) og **Landskapsmurer under en linje** (*Bygning*); velg **Ikke kontrollert** for å utelate dem. Frirommet måles rett opp fra toppen av planten eller muren til lederen der spennet krysser den; avstanden i sidene til en krone ved siden av linjen kontrolleres ikke. Å flytte et tre eller heve en mur endrer kontrollene med én gang.

Dine friromsregler er dine egne: åpne dem med **Regler…** ved siden av en **Friromsregel** (eller {{ui:Lasttilfeller og grenser…}}) for å legge til, gi nytt navn til, endre eller fjerne dem.

## Avstander og utslag

- **Nødvendig fasavstand**: k·√(sigdybde + isolatorlengde) + U/150, med varmlastens sigdybde og spenningen U i kV (en vanlig form; k er regelsettets). Sammenlignes med tverrarmens fasavstand.
- **Isolatorutslag** på hengemaster, under vindlasten: atan(tverrlast ÷ vertikal last), mot regelsettets største utslag.
- **Oppløft**: en hengemast som står lavere enn naboene, kan trekkes opp i kulden; den markeres.

## Mastelaster og dimensjonering

For hver mast og lastsituasjon, med alle lederne på linjen:

- **Tverrlast**: vind per meter × vindspennet (halvparten av de to spennene), pluss 2·H·sin(vinkel ÷ 2) i en vinkel.
- **Langs linjen**: forskjellen mellom de to sidenes spenninger ved en endemast eller vinkel; ved en hengemast bare under is på én side (hvert spenn regnes for seg, noe som er på den sikre siden).
- **Vertikal**: vertikal last per meter × vektspennet (mellom de laveste punktene på hver side) pluss utstyret.

Den horisontale lasten føres til mastens nominelle punkt (ekvivalent last = last × festehøyde ÷ høyde til det nominelle punktet) og sammenlignes med dens **nominelle last** × regelsettets faktor. Når den er for svak, foreslås den minste masten av samme materiale i biblioteket ditt som tåler den. En mast med et **stag** overfører den horisontale lasten til staget, som bærer last ÷ sin(stagvinkel) og kontrolleres mot sin egen merkelast.

Beslag (klemmer, isolatorer, tverrarmer) kontrolleres mot merkelasten: et forankringsbeslag bærer lederens spenning, et hengebeslag sin andel av den vertikale og tverrgående lasten. **Fundamentet** som vises, er mastens dybde i bakken og et hull litt bredere enn foten.

## Data, tilkoblinger og strøm

- Et element der et nødvendig felt er tomt, eller en nøkkel som ikke finnes i biblioteket.
- En kabelrutes ende, eller et utstyr, som ikke er koblet til noe.
- **Spenningsfall** og **strøm** fra hver kilde (utstyr merket som kilde) til lastene (kW og effektfaktor på utstyret), langs luftspenn og kabler: √3·I·L·(R cos φ + X sin φ), med R ved 20 °C. Mer enn kabelens strømgrense, eller mer fall enn regelsettet tillater, markeres.
