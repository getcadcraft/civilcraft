---
title: Mål avstander, arealer og helninger
summary: Mål i planen ved å klikke punkter — lengden og retningen til hver side, den løpende summen, lengden langs terrenget, helningen, og arealet og omkretsen av en lukket figur — og mellom to punkter på en kraftlednings profil.
keywords: mål, måling, avstand, lengde, areal, omkrets, retning, helning, fall, linjal, målebånd, langs terrenget, profil, høydeforskjell
from: d614eb25
---

{{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Mål}} (også i {{ui:Mer}}-menyen i arbeidsområdet Kraftledninger, eller trykk {{key:M}}) måler uten å legge til noe i prosjektet.

## På planen

1. Velg {{ui:Mål}}, og klikk deretter punkter. Et klikk nær et landmålingspunkt tar dets plass og høyde.
2. Statuslinjen viser antall punkter og total lengde, lengden og retningen til siste side, helningen der terrenget er kjent i begge ender, og lengden langs terrenget. Ved pekeren vises siden som tegnes og den løpende summen.
3. Klikk på første punkt igjen for å lukke figuren: statuslinjen legger til **areal** og **omkrets**. Neste klikk starter en ny måling.
4. {{key:Enter}} avslutter målingen og beholder tallene i statuslinjen; {{key:Backspace}} tar tilbake siste punkt; {{key:Esc}} tømmer den, og {{key:Esc}} igjen går tilbake til {{ui:Velg}}.

Lengder er i prosjektets enhet og arealer i prosjektets kvadratenhet. Helningen og lengden langs terrenget bruker den foreslåtte terrengmodellen der den finnes, ellers det eksisterende terrenget; utenfor terrengmodellen utelates de.

## På en kraftledningsprofil

I [linjeprofilen](topic:overhead-line#the-line-profile) tar {{ui:Mål}} i profilens verktøylinje to klikk og gir avstanden på tvers, høydeforskjellen, den rette avstanden og helningen mellom dem. Et klikk nær terrenget, lederen eller toppen av en mast fester seg til det. Klikk {{ui:Mål}} igjen for å stoppe.
