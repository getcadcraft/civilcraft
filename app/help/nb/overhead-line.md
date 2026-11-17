---
title: Tegn en kraftledning
summary: Plasser master på planen, la CivilCraft finne ut hver mastes rolle og seksjonene mellom endemaster, og flytt master på planen eller på linjeprofilen.
keywords: kraftledning, mast, stolpe, spenn, seksjon, endemast, vinkel, hengemast, profil, høyde, tverrbjelke, stag, avspenning
from: b8e5e272
---

## Tegn den

1. Ha en terrengmodell: terrenget under ledningen kommer fra den ([Bygg en terrengmodell](topic:build-surface)). En mast uten terreng under seg listes under **Kontroller**; skriv inn dens **Terrengnivå** i Egenskaper i stedet.
2. Klikk {{ui:Linje}} i gruppen Kraftledninger og klikk hver mast på planen.
3. Dobbeltklikk den siste, eller trykk Enter.

Linjen får lederen, masten og utstyret du brukte sist på denne datamaskinen (første gang: eksempler fra biblioteket). Endre dem i Egenskaper.

## Linjen i Egenskaper

Velg linjen (klikk et spenn) for å sette dens **Leder**, **Ledere per krets**, **Kretser**, **Spenning**, **Avstandsregelen** den må holde over terrenget, og utstyret **På hver mast** (en tverrbjelke, isolatorer, beslag). Tabellen lister dens **seksjoner** med hvert referansespenn, daglig spenning og lasttilfellet som styrer det.

## Master

Klikk en mast for å velge den. I Egenskaper:

- **Mast**: dens bibliotekselement. Når den er for svak, legger {{ui:Bruk …}} inn den minste masten av samme materiale i biblioteket ditt som bærer lasten.
- **Rolle**: Automatisk, Opphengning, Vinkel eller Avspenning. Automatisk betyr: første og siste mast er endemaster; en sving over vinkelen i regelsettet gir en vinkelmast; en større sving gir en endemast.
- **Høyde over terreng**: tom tar den fra bibliotekselementet (lengden minus dybden i grunnen).
- **Også på denne masten**: ekstra utstyr, som et **stag**. En avstivet mast overfører linjens trekk til stagen.
- **Eksisterende mast**: den kontrolleres som de andre, men utelates fra mengdene.

{{ui:Mast}} legger til en mast på spennet nærmest klikket ditt. Dra en mast på planen for å flytte den. {{ui:Slett}} fjerner den (en linje beholder minst to).

Seksjoner går mellom endemastene: innenfor en seksjon løper lederen fritt gjennom opphengsklemmene, så én spenning holder for hele seksjonen.

## Linjeprofilen

Klikk {{ui:Lengdeprofil}} (eller **Lengdeprofil** i linjens Egenskaper). Panelet under planen viser terrenget langs linjen, hver mast fra terrenget til toppen, lederens laveste fase ved **Lasttilfelle** du velger, og avstanden linjen må holde, som en stiplet linje. Et spenn som ikke holder, er rødt; tallet under hvert spenn er dens laveste avstand.

- **Linje** velger kraftledningen som vises. Å velge en annen linje, eller en av dens master, på planen bytter profilen til den.
- Før pekeren over profilen: en hjelpelinje følger den, og etiketten viser avstanden langs linjen, terrenget, lederen og avstanden der (og sier når avstanden er under linjens regel).
- {{ui:Mål}} i profilens verktøylinje: klikk to punkter for å få avstanden på tvers, høydeforskjellen, den rette avstanden og helningen mellom dem. Et klikk nær terrenget, lederen eller toppen av en mast fester seg til det. Klikk {{ui:Mål}} igjen for å stoppe.
- Hindringer ledningen krysser står opp fra terrenget: tegnede som stolper, Landskap-planter som sin krone, vegger som stolper (se [Kraftledningskontroller](topic:power-line-checks#clearances)). Kabeltraseer og rør som ledningen krysser, merkes under terrenget ved toppen, med navn.

- Dra en mast sideveis for å flytte den langs linjen.
- Dra toppen opp eller ned for å sette høyden over terrenget.
