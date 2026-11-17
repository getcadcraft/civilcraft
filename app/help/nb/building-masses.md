---
title: Tegn bygningsvolumer på en tomt
summary: Tegn et bygningsvolum på en eiendom, gi det etasjer og etasjehøyde, se bruttoarealet, velg hvordan det sitter på skrånende terreng, skyv og trekk høyden i 3D, og send det til BimCraft eller lagre det som IFC-fil.
keywords: volum, volumstudie, bygningsvolum, fotavtrykk, etasjer, etasjehøyde, bruttoareal, GFA, skråning, podium, skjæring og fylling, skyv trekk, 3D, tomtestudie, tidlig prosjektering, IFC, utvikle, BimCraft, A-MASS
from: e5a67c16
---

Et bygningsvolum er et fotavtrykk, et antall etasjer og en etasjehøyde: det tidlige spørsmålet «hvor mye bygning får plass her, og hva gjør den med terrenget». Volumene ligger i planen med navn, antall etasjer og bruttoareal, går inn i PDF-utskriften og i DWG- og DXF-eksportene på layerne `A-MASS` og `A-MASS-TEXT`, og lagres i prosjektfilen.

## Tegn et volum

1. Under **Egenskaper**, under **Bygningsvolumer**, klikk **Tegn et volum**. (Det finnes også i verktøylinjens meny **Mer** ved siden av **Terrengmodell**.)
2. Klikk hjørnene av fotavtrykket. Et klikk nær et hjørne på eiendommen eller et oppmålingspunkt tar nøyaktig det punktets plass.
3. Klikk på det første hjørnet igjen, eller trykk {{key:Enter}}, for å avslutte. {{key:Backspace}} tar tilbake det siste hjørnet; {{key:Esc}} stopper.

Et nytt volum har tre etasjer og en etasjehøyde på 12 ft (3.6 m), og hører til eiendommen som midtpunktet ligger i.

## Etasjer, høyde og areal

Klikk på et volum for å endre **Navn**, **Bruk**, **Etasjer**, **Etasjehøyde** og **Eiendom**. **Høyde** er etasjer ganger etasjehøyde: skriver du inn en høyde, blir antall etasjer nærmeste hele antall (aldri mindre enn én). **Fotavtrykk** og **Bruttoareal** (fotavtrykk ganger etasjer) beregnes for deg.

## På skrånende terreng

Terrenget under et volum leses fra terrengmodellen: eksisterende terreng, eller det planerte terrenget der du valgte **Planlagt terreng (planert)**. **På skrånende terreng** sier hvor første etasje legges:

- **Trinnvis**: ved gjennomsnittsterrenget under fotavtrykket. Den lave siden fylles opp til det, og den høye siden skjæres, og de to kommer nær å balansere hverandre.
- **Podium**: ved det høyeste terrenget. Et massivt sokkel fyller den lave siden.
- **Skjæring**: ved det laveste terrenget. Den høye siden skjæres bort inn i bakken.

Egenskaper viser spennet av terreng under volumet, **Nivå for første etasje**, og volumet av fylling og skjæring mellom terrenget og det nivået. En del av fotavtrykket som er utenfor terrengmodellen, utelates, og Egenskaper sier hvor mange.

## I 3D-visningen

Volumene tegnes i 3D-visningen av tomten, med en linje rundt hver etasje og navnene deres over taket. **Vis** har en avkrysningsboks for **Bygningsvolumer**. Klikk på et volum for å velge det. Med et volum valgt:

- dra taket opp eller ned for å skyve eller trekke det en etasje om gangen, eller trykk {{key:PageUp}} og {{key:PageDown}};
- hele flyttingen er ett steg for å angre.

Gatevisningen i **Kjør** ser også volumene, og **Sol** kaster skygger av dem på terrenget.

## Send det videre

- **Volumer som IFC** lagrer hvert volum som en IFC4-fil: en tomt, en bygning med etasjene sine, og volumet som et bygningselement med tallene sine i egenskapssettet `CadCraft_SiteMass`. Når et koordinatsystem er satt for prosjektet, plasseres filen på kartet og bærer tomtens breddegrad og lengdegrad; uten det sier den ingenting om hvor den ligger.
- **Utvikle i BimCraft** åpner BimCraft i en ny fane med volumene. Der viser et valgt volum tallene sine og **Utvikle dette volumet**, som bygger vegger på hver etasje og et gulv under bygningen fra fotavtrykket, i ett steg for å angre. Ingenting lastes opp: filen går mellom de to fanene i denne nettleseren.

Se også **Arealbruksgrenser** og **Soltimer**.
