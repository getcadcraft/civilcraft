---
title: Export och import av IFC
summary: Spara hela projektet som en IFC-fil i IFC 4.3, IFC4 eller IFC2x3 (linjeföringar, vägar, jordarbeten, ytor, murar, ledningar) och öppna IFC-filer för deras linjeföringar och ytor.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, linjeföring, ifcalignment, väg, ifcroad, jordarbeten, tin, leverans, upphandling, exportera ifc, importera ifc
from: 6b998bcf
---

IFC är det öppna utbytesformat som många offentliga beställare kräver som leverans. CivilCraft skriver hela projektet i en IFC-fil och läser linjeföringar och ytor tillbaka från IFC-filer.

## Export

1. Klicka på {{ui:IFC}} i gruppen **Exportera** (i menyflikens stil: {{ui:Utdata}} › {{ui:Exportera}} › {{ui:IFC}}).
2. Välj schema. **IFC 4.3 ADD2** står först och är standard: det är utgåvan med linjeföringar, vägar och jordarbeten. Välj IFC4 eller IFC2x3 endast när mottagarens program inte kan läsa 4.3.
3. Dialogrutan säger vad filen kommer att innehålla och vad det valda schemat utelämnar. Klicka på {{ui:Exportera IFC}}.
   Filen laddas ner som "*projektnamn*-ifc4x3.ifc", "-ifc4.ifc" eller "-ifc2x3.ifc". CivilCraft kommer ihåg vilket schema du valde senast.

## Vad varje schema innehåller

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Linjeföringar | IfcAlignment med sina horisontella (linjer, cirkelbågar, klotoidspiraler) och vertikala (lutningar, parabolkurvor) layouter, deras kurvor (IfcCompositeCurve, IfcGradientCurve), startstationen och överhöjningshändelserna | En 3D-polylinje på ett civilt element | En 3D-polylinje på en proxy |
| Korridorer | IfcRoad med vägdelar; körfält, vägrenar, rännor och gångbanor som IfcPavement, kantstöd som IfcKerb, planteringsremsor; varje beläggningslager som en IfcCourse med sin tjocklek, material och volym; slänterna som IfcEarthworksCut och IfcEarthworksFill med schakt- och fyllningsvolymerna; projekteringshastighet och klass | Civila element namngivna efter vad de är, grupperade per väg | Proxyer, grupperade per väg |
| Ytor | IfcGeographicElement TERRAIN med ett triangulerat oregelbundet nät | Triangulerade facemängder | Ytbaserade ytmodeller (större filer) |
| Byggplattor och murar | Byggplattans överkant, dess slänter som jordarbeten, stödmurar som IfcWall RETAININGWALL | Samma, murar som en användardefinierad murtyp | Samma, murens typ i ObjectType |
| Ledningsnät | IfcPipeSegment och IfcDistributionChamberElement i en IfcDistributionSystem | Samma | IfcFlowSegment och brunnar i ett IfcSystem |
| Georeferering | IfcProjectedCRS och IfcMapConversion | Samma | ePSet_ProjectedCRS och ePSet_MapConversion på platsen |

En **järnväg** (en linjeföring med Järnväg på) går in i IFC 4.3 som en IfcRailway: dess övergångar som egna typer (klotoid, kubisk parabel, Bloss, Helmert, sinus halvvåg som cosinuskurva, sinus), dess rälsförhöjning som IfcAlignmentCant och dess spår som räler, slipers och ballastbädden, med underballasten under. IFC4 och IFC2x3 får samma delar som civila element eller proxyer. Att öppna en IFC 4.3-järnväg tar tillbaka dess övergångar och rälsförhöjning.

Varje fil innehåller också fastigheter (fotavtryck), landskapsarbetsytans växter och beläggning samt byggnadsmassor (var och en som en IfcBuilding med sina våningsplan), allt på en plats. Egenskapsuppsättningar bär det du projekterat: stationer, sektionen, schakt- och fyllningsslänter, körfältsbredd och antal, bottennivåer, brunnsöverkanter och murhöjder; kvantiteter (längder, areor, volymer) är IfcElementQuantity-uppsättningar.

## Enheter och koordinater

Filen är i projektets längdenhet (meter, eller US survey feet); areor och volymer är i kvadratmeter och kubikmeter. Med ett koordinatsystem (GIS › Koordinater) placeras filen på kartan: dess origos östvärde och nordvärde samt ett lokalt systems rotation och skala ligger i kartkonverteringen. Utan ett sådant lagrar filen sin lokala origo i en egenskapsuppsättning och placeras inte på någon karta.

## Import

Öppna en .ifc-fil med {{ui:Öppna}} eller släpp den på planen. Importdialogen säger vad filen innehåller:

- **Linjeföringar** från IFC 4.3 (de horisontella och vertikala layouterna) och IFC 4x1-linjeföringskurvor blir CivilCraft-linjeföringar med sina PI:n, radier, spiralängder och PVI:n. En linjeföring som CivilCraft:s PI-modell inte kan hålla (sammansatta kurvor, spiraler mellan två kurvor, en som börjar eller slutar i en kurva) importeras inte, och dialogrutan säger varför.
- **Ytor**: välj den som blir den befintliga marken, eller behåll projektets.
- **Allt annat** (och de andra ytorna) kan visas i 3D-vyn som referens. Referenselement finns kvar så länge projektet är öppet; de sparas inte i projektfilen.

En fil som CivilCraft skrivit i IFC4 eller IFC2x3 tar tillbaka sina linjeföringar exakt från deras egenskapsuppsättningar.

## Finns inte ännu

- En vägs överhöjning skrivs som överhöjningshändelser och i vägytorna (rälsförhöjning gäller för järnvägar).
- Spara referenselement i projektfilen, och importera ledningsnät eller byggplattor från IFC som redigerbara objekt.
