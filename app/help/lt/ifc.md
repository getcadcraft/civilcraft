---
title: IFC eksportas ir importas
summary: Išsaugokite visą projektą kaip vieną IFC failą IFC 4.3, IFC4 ar IFC2x3 (trasos, keliai, žemės darbai, paviršiai, sienos, vamzdžiai), ir atidarykite IFC failus jų trasoms ir paviršiams.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, trasa, ifcalignment, kelias, ifcroad, žemės darbai, tin, pristatomas rezultatas, viešieji pirkimai, eksportuoti ifc, importuoti ifc
from: 6b998bcf
---

IFC yra atvirasis keitimosi formatas, kurio daugelis viešųjų klientų reikalauja kaip pristatomo rezultato. CivilCraft įrašo visą projektą į vieną IFC failą ir nuskaito trasas bei paviršius iš IFC failų.

## Eksportas

1. Spustelėkite {{ui:IFC}} grupėje **Eksportavimas** (juostelės stiliumi: {{ui:Išvestis}} › {{ui:Eksportuoti}} › {{ui:IFC}}).
2. Pasirinkite schemą. **IFC 4.3 ADD2** yra pirmoji ir numatytoji: tai leidimas su trasomis, keliais ir žemės darbais. Pasirinkite IFC4 arba IFC2x3 tik tada, kai gavėjo programinė įranga negali nuskaityti 4.3.
3. Dialogas nurodo, ką failas turės ir ko pasirinktoje schemoje nebus. Spustelėkite {{ui:Eksportuoti IFC}}.
   Failas atsisiunčiamas kaip "*projekto pavadinimas*-ifc4x3.ifc", "-ifc4.ifc" arba "-ifc2x3.ifc". CivilCraft prisimena, kurią schemą pasirinkote paskutinę.

## Ką laiko kiekviena schema

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Trasos | IfcAlignment su horizontaliu (tiesios atkarpos, apskritiminiai lankai, klotoidinės spiralės) ir vertikaliu (nuolydžiai, parabolinės kreivės) išdėstymu, jų kreivės (IfcCompositeCurve, IfcGradientCurve), pradžios stotis ir viršaukščio įvykiai | 3D polilinija ant civilinio elemento | 3D polilinija ant proxy |
| Koridoriai | IfcRoad su kelio dalimis; eismo juostos, pakraščiai, latakai ir šaligatviai kaip IfcPavement, bordiūrai kaip IfcKerb, želdynų juostos; kiekvienas dangos sluoksnis kaip IfcCourse su storiu, medžiaga ir tūriu; šlaitai kaip IfcEarthworksCut ir IfcEarthworksFill su iškasų ir pylimų tūriais; projektinis greitis ir klasė | Civiliniai elementai, pavadinti pagal tai, kuo jie yra, sugrupuoti pagal kelią | Proxy, sugrupuoti pagal kelią |
| Paviršiai | IfcGeographicElement TERRAIN su trianguliuotu nereguliariu tinklu (TIN) | Trikampių paviršių rinkiniai | Paviršių modeliai pagal veidus (didesni failai) |
| Aikštelės ir sienos | Aikštelės viršus, jos šlaitai kaip žemės darbai, atraminės sienos kaip IfcWall RETAININGWALL | Tas pats, siena kaip vartotojo apibrėžtas sienos tipas | Tas pats, sienos tipas ObjectType lauke |
| Vamzdynų tinklai | IfcPipeSegment ir IfcDistributionChamberElement IfcDistributionSystem sistemoje | Tas pats | IfcFlowSegment ir šuliniai IfcSystem sistemoje |
| Georeferencavimas | IfcProjectedCRS ir IfcMapConversion | Tas pats | ePSet_ProjectedCRS ir ePSet_MapConversion vietovėje |

**Geležinkelis** (trasa su įjungtu langeliu Railway) patenka į IFC 4.3 kaip IfcRailway: jo perėjimai – kaip atskiri tipai (klotoidė, kubinė parabolė, Bloss, Helmert, sinusinis pusbangis kaip kosinuso kreivė, sinusas), jo skersinis nuolydis – kaip IfcAlignmentCant, o kelio linija – kaip bėgiai, pabėgiai ir balasto sluoksnis, su poballastiniu sluoksniu po juo. IFC4 ir IFC2x3 gauna tas pačias dalis kaip civiliniai elementai ar proxy. Atidarius IFC 4.3 geležinkelį, grąžinami jo perėjimai ir skersinis nuolydis.

Kiekviename faile taip pat yra sklypai (pėdsakai), Kraštovaizdžio darbo srities augalai ir kietoji danga bei pastatų masės (kiekviena kaip IfcBuilding su savo aukštais), visi vienoje vietovėje. Savybių rinkiniuose yra tai, ką suprojektavote: stotys, konstrukcija, iškasų ir pylimų šlaitai, eismo juostos plotis ir skaičius, vamzdžių dugnai, šulinių viršai, sienų aukščiai; kiekiai (ilgiai, plotai, tūriai) yra IfcElementQuantity rinkiniai.

## Vienetai ir koordinatės

Failas yra projekto ilgio vienetais (metrais arba JAV topografinėmis pėdomis); plotai ir tūriai – kvadratiniais ir kubiniais metrais. Su koordinačių sistema (GIS › Koordinatės) failas patalpinamas žemėlapyje: jo pradžios taško rytai ir šiaurė, o vietinės (grunto) sistemos sukimas ir mastelis įrašomi žemėlapio konversijoje. Be jos failas savo vietinę pradžią įrašo savybių rinkinyje ir nepatalpinamas žemėlapyje.

## Importas

Atidarykite .ifc failą su {{ui:Atidaryti}} arba nuleiskite jį ant plano. Importavimo dialogas nurodo, ką failas turi:

- **Trasos** iš IFC 4.3 (horizontalus ir vertikalus išdėstymas) ir IFC 4x1 trasų kreivės tampa CivilCraft trasomis su savo PI, spindulių, spiralių ilgiais ir PVI. Trasa, kurios CivilCraft PI modelis negali talpinti (sudėtinės kreivės, spiralės tarp dviejų kreivių, trasa, prasidedanti ar baigianti kreive), neimportuojama, o dialogas nurodo kodėl.
- **Paviršiai**: pasirinkite, kuris taps esamu gruntu, arba palikite projekto.
- **Viskas kita** (ir kiti paviršiai) gali būti rodoma 3D rodinyje kaip nuoroda. Nuorodiniai elementai išlieka, kol projektas atidarytas; jie neįrašomi į projekto failą.

CivilCraft įrašytas IFC4 ar IFC2x3 failas grąžina savo trasas tiksliai iš savo savybių rinkinių.

## Dar neįgyvendinta

- Kelio viršaukštis įrašomas kaip viršaukščio įvykiai ir kelių paviršiuose (skersinis nuolydis – geležinkeliams).
- Nuorodinių elementų įrašymas projekto faile ir vamzdynų ar aikštelių importavimas iš IFC kaip redaguojamų objektų.
