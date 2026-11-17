---
title: Eksport og import av IFC
summary: Lagre hele prosjektet som én IFC-fil i IFC 4.3, IFC4 eller IFC2x3 (linjeføringer, veier, jordarbeider, overflater, murer, rør), og åpne IFC-filer for linjeføringene og overflatene deres.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, linjeføring, ifcalignment, vei, ifcroad, jordarbeider, TIN, leveranse, anskaffelse, eksporter ifc, importer ifc
from: 6b998bcf
---

IFC er det åpne utvekslingsformatet mange offentlige oppdragsgivere ber om som leveranse. CivilCraft skriver hele prosjektet til én IFC-fil og leser linjeføringer og overflater tilbake fra IFC-filer.

## Eksport

1. Klikk {{ui:IFC}} i gruppen {{ui:Eksporter}} (i båndstilene: {{ui:Utdata}} › {{ui:Eksporter}} › {{ui:IFC}}).
2. Velg skjemaet. **IFC 4.3 ADD2** står først og er standard: det er utgaven med linjeføringer, veier og jordarbeider. Velg IFC4 eller IFC2x3 bare når mottakerens programvare ikke kan lese 4.3.
3. Dialogen forteller hva filen vil inneholde, og hva det valgte skjemaet utelater. Klikk {{ui:Eksporter IFC}}.
   Filen lastes ned som "*prosjektnavn*-ifc4x3.ifc", "-ifc4.ifc" eller "-ifc2x3.ifc". CivilCraft husker skjemaet som sist ble valgt.

## Hva hvert skjema inneholder

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Linjeføringer | IfcAlignment med sine horisontale (linjer, sirkelbuer, klotoide-spiraler) og vertikale (fall, parabelkurver) layouter, kurvene deres (IfcCompositeCurve, IfcGradientCurve), startstasjonen og overhøydehendelsene | En 3D-polylinje på et sivilelement | En 3D-polylinje på en proxy |
| Korridorer | IfcRoad med vegdeler; kjørefelt, skuldre, renner og fortau som IfcPavement, kantsteiner som IfcKerb, beplantningsstriper; hvert belegningslag som IfcCourse med tykkelse, materiale og volum; sideskråningene som IfcEarthworksCut og IfcEarthworksFill med skjærings- og fyllingsvolumene; dimensjonerende hastighet og klasse | Sivilelementer navngitt etter hva de er, gruppert per vei | Proxyer, gruppert per vei |
| Overflater | IfcGeographicElement TERRAIN med et triangulert uregelmessig nett | Triangulerte flatesett | Flatebaserte overflatemodeller (større filer) |
| Byggeplater og murer | Byggeplatens topp, skråningene som jordarbeider, støttemurer som IfcWall RETAININGWALL | Samme, med murer som en brukerdefinert murtype | Samme, murens type i ObjectType |
| Rørnett | IfcPipeSegment og IfcDistributionChamberElement i en IfcDistributionSystem | Samme | IfcFlowSegment og kummer i en IfcSystem |
| Georeferering | IfcProjectedCRS og IfcMapConversion | Samme | ePSet_ProjectedCRS og ePSet_MapConversion på tomten |

En **jernbane** (en linjeføring med Jernbane slått på) går inn i IFC 4.3 som en IfcRailway: overgangene som egne typer (klotoide, kubisk parabel, Bloss, Helmert, sinus halvbølge som cosinuskurve, sinus), overhøyden som IfcAlignmentCant, og banen som skinner, sville og ballastlegemet, med underballasten under. IFC4 og IFC2x3 får de samme delene som sivilelementer eller proxyer. Åpning av en IFC 4.3-jernbane gir tilbake overgangene og overhøyden.

Hver fil har også eiendommer (fotavtrykk), Landskap-arbeidsområdets planter og harde flater, og bygningsmasser (hver en IfcBuilding med sine etasjer), alt i ett område. Egenskapssettene har det som er prosjektert: stasjoner, oppbygning, skjærings- og fyllingsskråninger, feltbredde og antall, bunnkoter og kumtopper, murhøyder. Mengder (lengder, arealer, volumer) er IfcElementQuantity-sett.

## Enheter og koordinater

Filen er i prosjektets lengdeenhet (meter, eller US survey feet); arealer og volumer er i kvadrat- og kubikkmeter. Med et koordinatsystem (GIS › {{ui:Koordinater}}) plasseres filen på kartet: origoets øst- og nordkoordinat, og rotasjon og skala for et lokalt (terreng-)system, står i kartkonverteringen. Uten et koordinatsystem lagrer filen sitt lokale origo i et egenskapssett og plasseres ikke på et kart.

## Import

Åpne en .ifc-fil med {{ui:Åpne}} eller slipp den på planen. Importdialogen sier hva filen inneholder:

- **Linjeføringer** fra IFC 4.3 (de horisontale og vertikale layoutene) og IFC 4x1-linjeføringskurver blir CivilCraft-linjeføringer med sine PI-er, radier, spiral-lengder og PVI-er. En linjeføring som CivilCraft sin PI-modell ikke kan holde (sammensatte kurver, spiraler mellom to kurver, en som starter eller slutter i en kurve), importeres ikke, og dialogen sier hvorfor.
- **Overflater**: velg den som blir eksisterende terreng, eller behold prosjektets.
- **Alt annet** (og de andre overflatene) kan vises i 3D-visningen som referanse. Referanseelementer blir værende så lenge prosjektet er åpent; de lagres ikke i prosjektfilen.

En fil CivilCraft skrev i IFC4 eller IFC2x3 gir tilbake linjeføringene sine nøyaktig fra egenskapssettene.

## Ikke bygget ennå

- En vei sin overhøyde skrives som overhøydehendelser og i veioverflatene (overhøyde gjelder for jernbaner).
- Lagring av referanseelementer i prosjektfilen, og import av rørnett eller byggeplater fra IFC som redigerbare objekter.
