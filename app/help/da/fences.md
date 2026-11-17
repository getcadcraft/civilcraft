---
title: Hegn
summary: Et hegn langs en linje, matrikel eller et byggeplateau: stolper, rammer, paneler eller stakit, låger, skråt eller trinvist på terrænet, en liste, plansymboler og IFC-elementer. Også tilgængelig for en assistent.
keywords: hegn, stolper, rammer, paneler, stakit, låge, skråt, trinvis, terræn, liste, ifc, gelænder, grænse
from: c0e7b84a
---

Lav et hegn langs en feature-linje, en linjeføring, en matrikel eller et byggeplateau, med stolper og låger placeret for dig.

## Lav et hegn

1. Vælg en linje, en matrikel eller et byggeplateau.
2. Åbn **Terræn, Mere, Hegn...**
3. Vælg typen (paneler, rammer eller stakit), skråt eller trinvist, højden, stolpeafstanden og lågebredden, og klik derefter på **Hegn langs valget**, eller på **Med låge** for at sætte en låge midt på den længste lige strækning.

Stolper placeres i enderne, ved hvert hjørne (et hjørnepunkt, hvor der drejes 20 grader eller mere), ved begge kanter af hver låge og med lige store felter imellem, ingen længere end afstanden. **Skråtstillede** paneler følger terrænet mellem deres stolper. **Trinvise** paneler forbliver vandrette og træder ned ved stolperne; mellemrummet under et panel er størst ved stolpen på den nedadgående side, og vinduet advarer, når mellemrummet er over grænsen, eller når terrænet stiger op gennem et panel. Låger på 6 feet (1.8 m) og bredere får to fløje; planen viser fløjene åbne med deres udsving.

## Liste og output

Hvert hegn viser sin længde, stolper efter type, paneler, låger og trin, med en **CSV**-liste over stolper, paneler, rammer, stakit og låger. Planen har hegnslag (C-FENC, C-FENC-POST, C-FENC-GATE) til PDF, DXF og DWG. IFC-eksporten indeholder stolperne (IfcMember, post), panelerne (IfcRailing, user defined fence panel), rammerne (IfcMember) og lågerne (IfcDoor, gate), ét system pr. hegn.

## Fra en assistent

`fence_build` laver et hegn (punkter eller en navngivet linje, matrikel eller byggeplateau, låger efter station), og `fence_list` lister hegnene med deres liste.

## Hvad der ikke er lavet endnu

Startstørrelserne er almindelige valg, ikke en norm. Typer fra biblioteket medtages kun som navn. Låger skal ligge i én lige strækning. BimCraft har ikke dette værktøj endnu.
