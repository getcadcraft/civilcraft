---
title: IFC-eksport og -import
summary: Gem hele projektet som én IFC-fil i IFC 4.3, IFC4 eller IFC2x3 (tracéer, veje, jordarbejder, overflader, mure, rør), og åbn IFC-filer for deres tracéer og overflader.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, tracé, ifcalignment, vej, ifcroad, jordarbejder, tin, leverance, udbud, eksportér ifc, importér ifc
from: 6b998bcf
---

IFC er det åbne udvekslingsformat, mange offentlige bygherrer beder om som leverance. CivilCraft skriver hele projektet til én IFC-fil og læser tracéer og overflader tilbage fra IFC-filer.

## Eksport

1. Klik på {{ui:IFC}} i gruppen **Eksportér** (i båndets stilarter: {{ui:Output}} › {{ui:Eksportér}} › {{ui:IFC}}).
2. Vælg skemaet. **IFC 4.3 ADD2** står først og er standard: det er udgaven med tracéer, veje og jordarbejder. Vælg IFC4 eller IFC2x3 kun, når modtagerens software ikke kan læse 4.3.
3. Dialogen siger, hvad filen vil indeholde, og hvad det valgte skema udelader. Klik på {{ui:Eksportér IFC}}.
   Filen downloades som "*projektnavn*-ifc4x3.ifc", "-ifc4.ifc" eller "-ifc2x3.ifc". CivilCraft husker det skema, du valgte sidst.

## Hvad hvert skema indeholder

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Tracéer | IfcAlignment med dets vandrette (linjer, cirkelbuer, klothoide overgangskurver) og lodrette (fald, parabolske kurver) forløb, deres kurver (IfcCompositeCurve, IfcGradientCurve), startstationen og overhøjdehændelserne | En 3D-polylinje på et civilt element | En 3D-polylinje på en proxy |
| Korridorer | IfcRoad med vejdele; kørebaner, skuldre, rendestene og fortove som IfcPavement, kantsten som IfcKerb, beplantningsstriber; hvert belægningslag som en IfcCourse med sin tykkelse, materiale og volumen; skråningerne som IfcEarthworksCut og IfcEarthworksFill med afgravnings- og opfyldningsvolumenerne; designhastigheden og klassen | Civile elementer navngivet efter, hvad de er, grupperet pr. vej | Proxyer, grupperet pr. vej |
| Overflader | IfcGeographicElement TERRAIN med et trekantet uregelmæssigt net | Trekantede flademængder | Flade-baserede overfladermodeller (større filer) |
| Plateauer og mure | Byggeplateauets top, dets skråninger som jordarbejder, støttemure som IfcWall RETAININGWALL | Det samme, med muren som en brugerdefineret muretype | Det samme, murens type i ObjectType |
| Rørnetværk | IfcPipeSegment og IfcDistributionChamberElement i en IfcDistributionSystem | Det samme | IfcFlowSegment og brønde i et IfcSystem |
| Georeferering | IfcProjectedCRS og IfcMapConversion | Det samme | ePSet_ProjectedCRS og ePSet_MapConversion på grunden |

En **jernbane** (et tracé med Jernbane slået til) går ind i IFC 4.3 som en IfcRailway: dens overgangskurver som deres egne typer (klothoide, kubisk parabel, Bloss, Helmert, sinus halvbølge som cosinuskurve, sinus), dens overhøjning som IfcAlignmentCant, og dens spor som skinner, svellere og ballastlejet med underballasten nedenunder. IFC4 og IFC2x3 får de samme dele som civile elementer eller proxyer. Åbnes en IFC 4.3-jernbane, kommer dens overgangskurver og overhøjning tilbage.

Hver fil medtager også parceller (fodaftryk), landskabsarbejdsområdets planter og befæstelse samt bygningsmasser (hver en IfcBuilding med sine etager), alt sammen på én grund. Egenskabssæt indeholder det, du har projekteret: stationer, tværprofilet, afgravnings- og opfyldningsskråninger, kørebanebredde og -antal, bundkoter, kanter og murhøjder; mængder (længder, arealer, volumener) er IfcElementQuantity-sæt.

## Enheder og koordinater

Filen er i projektets længdeenhed (meter eller US survey feet); arealer og volumener er i kvadrat- og kubikmeter. Med et koordinatsystem (GIS › Koordinater) placeres filen på kortet: dens udgangspunkts øst og nord samt et lokalt systems rotation og skala indgår i kortkonverteringen. Uden et koordinatsystem gemmer filen sit lokale udgangspunkt i et egenskabssæt og placeres ikke på et kort.

## Import

Åbn en .ifc-fil med {{ui:Åbn}}, eller slip den på planen. Importdialogen siger, hvad filen indeholder:

- **Tracéer** fra IFC 4.3 (de vandrette og lodrette forløb) og IFC 4x1-tracékurver bliver til CivilCraft-tracéer med deres PI'er, radier, overgangskurvelængder og PVI'er. Et tracé, som CivilCraft's PI-model ikke kan rumme (sammensatte kurver, overgangskurver mellem to kurver, et der starter eller slutter i en kurve), importeres ikke, og dialogen siger hvorfor.
- **Overflader**: vælg den, der bliver det eksisterende terræn, eller behold projektets.
- **Alt andet** (og de øvrige overflader) kan vises i 3D-visningen som reference. Referenceelementer bliver, mens projektet er åbent; de gemmes ikke i projektfilen.

En fil, CivilCraft har skrevet i IFC4 eller IFC2x3, henter sine tracéer tilbage nøjagtigt fra deres egenskabssæt.

## Ikke lavet endnu

- En vejs overhøjning skrives som overhøjdehændelser og i vejoverfladerne (overhøjning er til jernbaner).
- Gemning af referenceelementer i projektfilen, og import af rørnetværk eller plateauer fra IFC som redigerbare objekter.
