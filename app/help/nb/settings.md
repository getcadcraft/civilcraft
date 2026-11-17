---
title: CivilCraft-innstillinger
summary: Velg kolonnerekkefølgen for kopierte og innlimte punktrader og for å gjette en fils kolonner, hvordan innlimte punkter nummereres, hva punktetiketter viser, hjørneindikatoren, vertikal overdrivelse i 3D, hvordan breddegrad og lengdegrad vises, og om kartlag hentes fra internett.
keywords: innstillinger, valg, pnezd, penzd, kolonnerekkefølge, punktrader, nummerer på nytt, punktnumre, startnummer, punktetiketter, etiketter, beskrivelse, kote, visningskube, aksesymbol, hjørneindikator, kompass, vertikal overdrivelse, 3d, breddegrad, lengdegrad, dms, desimalgrader, kartlag, internett, personvern
from: 64b9cb92
---

Åpne {{ui:Innstillinger}} med tannhjulet i programlinjen eller {{key:Mod+,}}. Den første fanen, {{ui:CivilCraft}}, holder innstillingene som hører til denne appen; {{ui:Generelt}} holder dem alle CadCraft-appene deler (tema, verktøylinje, paneler). CivilCrafts innstillinger finnes bare i appen: du endrer dem her, og denne nettleseren husker dem. {{ui:Tilbakestill CivilCraft-innstillinger}} setter hver innstilling tilbake til startverdien.

## Punktrader

**P, N, E, Z, D** (start) eller **P, E, N, Z, D**: punkt, nord, øst, kote, beskrivelse, eller øst før nord. Den brukes på tre steder:

- **Kopier**: radene CivilCraft legger på systemets utklippstavle for et regneark.
- **Lim inn**: rader limt inn fra et regneark eller en tekstfil som ikke har en overskriftsrad.
- **Importer**: gjetningen i dialogen **Importer punkter** når en fil ikke har overskriftsrad (en fil med fire kolonner leses som PENZ, med tre som ENZ). Se [Punktfilformater](topic:point-file-formats).

En overskriftsrad som navngir kolonnene går alltid foran, og det samme gjelder et valg i importdialogens liste **Kolonner**.

## Nummer for innlimte punkter

- **Behold ledige numre** (start): et innlimt punkt beholder sitt nummer når ingen punkt har det; bare punkter som kolliderer får nye numre.
- **Alltid nye numre**: hvert innlimt punkt får et nytt nummer, selv om sitt eget er ledig.

**Nye numre starter på**: la det stå tomt for å telle videre fra ett mer enn det høyeste nummeret i bruk. Skriv inn et tall, for eksempel 5000, for å gi nye punkter numre fra 5000 og oppover; numre som allerede er i bruk hoppes over. To punkter deler aldri et nummer uansett. Se [Velg, kopier og lim inn målepunkter](topic:copy-paste-points#point-numbers-never-clash).

## Punktetiketter

Hva en punktetikett viser når {{ui:Punktetiketter}} er på under **Vis**: **Nummer**, **Nummer og kote**, eller **Nummer, kote og beskrivelse** (start). Eksportene til DXF, DWG og PDF viser de samme etikettene som skjermen.

## Hjørneindikator

Hva som står i hjørnet av planen og 3D-visningen: **ViewCube** (start), **Aksesymbol** eller **Ingen**.

- **ViewCube** (øverst til høyre). I planen viser den toppen, med kompassringen: N er rutenettets nord (opp i planen). Klikk en annen side, kant eller hjørne av kuben, eller dra den, og [3D-visningen](topic:site-3d) åpnes og ser derfra. {{ui:Hjem}} på plankuben tilpasser planen.
- I 3D-visningen dreier kuben seg med visningen: klikk en side, kant eller hjørne for å se derfra, dra kuben for å kretse rundt, dra kompassringen for å dreie om vertikalen, klikk en bokstav for å se fra den siden, og bruk {{ui:Hjem}} for iso-visningen av hele området. Når du ser rett mot en side, flytter små piler til neste side, og buede piler dreier visningen en kvart omdreining.
- **Aksesymbol** (nede til venstre): en liten X (øst) og Y (nord)-markør i planen, X, Y og Z (opp) i 3D.

## Vertikal overdrivelse i 3D

Hvor mye 3D-visningen strekker kotene: **1×**, **2×** (start), **3×**, **5×** eller **10×**. Listen på 3D-visningens linje er den samme innstillingen, så endrer du den ene, endres begge. Volumer, profiler og 3D-eksporter er i sann målestokk.

## Breddegrad og lengdegrad

Hvordan statuslinjen viser pekerens breddegrad og lengdegrad når prosjektet har et koordinatsystem: **grader, minutter og sekunder** (start, for eksempel `30°18′00.00″ N`) eller **desimalgrader** (`30.300000° N`). Se [Sett prosjektets koordinatsystem](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Kartlag fra internett

**Av** (start) eller **På**. Når det er på, ber CivilCraft kartserverne du legger til om bilder av området på skjermen. Tegningen din blir på denne datamaskinen; serveren ser området og internettadressen din. Mens det er av, spørres ingen kartserver om noe, selv om et prosjekt du åpner nevner en; et georeferert bilde fra en fil fungerer uansett. Se [Vis kartlag under planen](topic:map-layers).

## Assistenter

**La KI-assistenter og skript bruke CivilCraft** (av ved start) lar en assistent på datamaskinen din nå det åpne området gjennom CadCraft Studio: **Les** beskriver området og gir punkter, terrengkoter, profilnumre, profiler, volumer og eiendommer; **Rediger** lar den velge og legge til målepunkter; **Lagre** og **Eksporter** lar den lagre prosjektet og skrive LandXML eller DWG. **Mapper den kan bruke** (i Studio) er hvor den får lagre og eksportere. **Aktivitet** lister dens kall. Se [La en KI-assistent arbeide med området ditt](topic:assistants).
