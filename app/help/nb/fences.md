---
title: Gjerder
summary: Et gjerde langs en linje, eiendom eller byggeplate: stolper, rekker, paneler eller spiler, porter, skråstilt eller trinnet i terrenget, en tabell, plansymboler og IFC-elementer. Også tilgjengelig for en assistent.
keywords: gjerde, stolper, rekker, paneler, spiler, port, skråstilt, trinnet, terreng, tabell, ifc, rekkverk, grense
from: c0e7b84a
---

Lag et gjerde langs en bruddlinje, en veglinje, en eiendom eller en byggeplate, med stolper og porter plassert for deg.

## Lag et gjerde

1. Velg en linje, en eiendom eller en byggeplate.
2. Åpne **Terrengmodell, Mer, Gjerder...**
3. Velg stil (paneler, rekker eller spiler), skråstilt eller trinnet, høyde, stolpeavstand og portbredde, og velg deretter **Gjerde langs utvalg**, eller **Med port** for å sette en port midt på den lengste rette strekningen.

Stolper settes ved endene, i hvert hjørne (et toppunkt som svinger 20 grader eller mer), på begge kanter av hver port og i like felt mellom, ingen lenger enn avstanden. **Skråstilte** paneler følger terrenget mellom stolpene. **Trinnede** paneler holder seg vannrette og trinner ved stolpene; mellomrommet under et panel er størst ved stolpen nedover i skråningen, og vinduet varsler når dette mellomrommet er over grensen, eller når terrenget stiger gjennom et panel. Porter på 6 fot (1.8 m) og bredere får to fløyer; planen viser fløyene åpne med svingbanen.

## Tabell og resultater

Hvert gjerde viser lengden, stolper etter type, paneler, porter og trinn, med en **CSV**-tabell over stolper, paneler, rekker, spiler og porter. Planen har gjerdelag (C-FENC, C-FENC-POST, C-FENC-GATE) for PDF, DXF og DWG. IFC-eksporten inneholder stolpene (IfcMember, post), panelene (IfcRailing, user defined fence panel), rekkene (IfcMember) og portene (IfcDoor, gate), ett system per gjerde.

## Fra en assistent

`fence_build` lager et gjerde (punkter eller en navngitt linje, eiendom eller byggeplate, porter etter profilnummer), og `fence_list` lister gjerdene med tabellen sin.

## Hva som ikke er gjort

Startstørrelsene er vanlige valg, ikke en norm. Typer fra biblioteket tas bare med som navn. Porter må ligge på én rett strekning. BimCraft har ikke dette verktøyet ennå.
