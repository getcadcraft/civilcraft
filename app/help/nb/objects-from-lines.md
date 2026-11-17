---
title: Objekter fra linjer, med koblingen beholdt
summary: Lag belegning, et plantet område, en bed, en hekk, en sti, en mur, en kantstein, trapper, en rampe, en plattform, en grøft eller en formlinje fra en linje; den følger når linjen flyttes, til du bryter koblingen.
keywords: fra en linje, tegningslinjer, DWG, DXF, kobling, koblet, følg, regenerer, bryt koblingen, formlinje, formlinje fra tegningslinjer, importert lag, kontur, supercad studio, tegningslinje
from: eb67a0c6
---

{{ui:Fra en linje}} (Landskap › {{ui:Mer}}): klikk en formlinje, eller en linje eller kontur fra et importert DWG/DXF-lag. En lukket linje kan lage belegning, en plen, en plantet bed, en eng, bakkedekke, en bed eller en plattform; en åpen linje en sti, en mur, en kantstein, trapper (dens første og siste punkt), en rampe, en hekk eller en grøft. Begge typer kan lage en **formlinje**, unntatt en formlinje selv.

## En formlinje fra en linje

En formlinje laget av en linje tar over punktene, lukket hvis linjen var lukket. Høydene legges på eksisterende terreng (0 der det ikke finnes noe ennå), og bruken er **Av**: den former ikke terrenget før du velger en bruk og angir høydene i Egenskaper. Når linjen flyttes, beholder en formlinje med samme antall punkter hver høyde du har satt; når linjen får eller mister punkter, legges høydene på terrenget på nytt. Se [Formlinjer](topic:feature-lines).

Det nye objektet beholder en **kobling** til linjen sin. Når linjen flyttes (du drar punktene, eller tegningen flyttes eller leses på nytt), tar objektet den nye formen i samme angrertrinn, og gjennom terrengmodifikatorene følger det foreslåtte terrenget. Egenskaper sier hva det er koblet til; {{ui:Bryt koblingen}} gjør det fritt.

Linjer kontrolleres først: en linje trenger minst 2 punkter (3 for en kontur), høyst 5000, reelle tall, en kontur må være lukket og må ikke krysse seg selv. En linje som ikke går gjennom brukes ikke: objektet blir som det var, og Problemer-panelet sier hvorfor. Hvis linjen slettes, består objektet, og Problemer-panelet noterer det.

## I SuperCad Studio

Åpne tomten og 2D-tegningen i samme prosjekt. Velg én linje eller polylinje i 2D-tegningen, trykk Ctrl+K, og kjør {{ui:Landskapsobjekt fra den valgte tegningslinjen}}: CivilCraft spør hva det skal lages, som over, og objektet forblir koblet til den linjen i tegningen. Etter at du endrer linjer i tegningen, gjør Ctrl+K {{ui:Oppdater landskapet fra tegningen}} at objektene følger, ett angrertrinn for hver linje. Prosjektets koblingsfil registrerer hvilket objekt som følger hvilken linje. SuperCad Studios egen hjelp har et emne om landskap.
