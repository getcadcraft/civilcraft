---
title: IFC eksports un imports
summary: Saglabājiet visu projektu kā vienu IFC failu formātā IFC 4.3, IFC4 vai IFC2x3 (trases, ceļi, zemes darbi, virsmas, sienas, caurules) un atveriet IFC failus to trasēm un virsmām.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, trase, ifcalignment, ceļš, ifcroad, zemes darbi, TIN, piegādājamais, iepirkums, eksportēt ifc, importēt ifc
from: 6b998bcf
---

IFC ir atvērtais apmaiņas formāts, ko daudzi publiskie klienti pieprasa kā piegādājamo. CivilCraft ieraksta visu projektu vienā IFC failā un nolasa trases un virsmas atpakaļ no IFC failiem.

## Eksports

1. Noklikšķiniet {{ui:IFC}} grupā **Eksportēt** (lentes stila režīmā: {{ui:Izvade}} › {{ui:Eksportēt}} › {{ui:IFC}}).
2. Izvēlieties shēmu. **IFC 4.3 ADD2** ir pirmā un noklusējuma: tā ir versija ar trasēm, ceļiem un zemes darbiem. Izvēlieties IFC4 vai IFC2x3 tikai tad, kad saņēmēja programma nevar nolasīt 4.3.
3. Dialogs parāda, ko fails saturēs un ko izvēlētā shēma neiekļauj. Noklikšķiniet {{ui:Eksportēt IFC}}.
   Fails tiek lejupielādēts kā "*projekta nosaukums*-ifc4x3.ifc", "-ifc4.ifc" vai "-ifc2x3.ifc". CivilCraft atceras pēdējo izvēlēto shēmu.

## Ko satur katra shēma

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Trases | IfcAlignment ar tā horizontālo (taisnes, apļveida loki, klotoīdas spirāles) un vertikālo (slīpumi, parabolas līknes) izkārtojumu, to līknes (IfcCompositeCurve, IfcGradientCurve), sākuma pikets un virsaugstuma notikumi | 3D polilīnija uz civilā elementa | 3D polilīnija uz starpniekelementa |
| Koridori | IfcRoad ar ceļa daļām; joslas, uzmalas, notekas un ietves kā IfcPavement, apmales kā IfcKerb, stādījumu joslas; katrs seguma slānis kā IfcCourse ar tā biezumu, materiālu un tilpumu; nogāzes kā IfcEarthworksCut un IfcEarthworksFill ar izrakuma un uzbēruma tilpumiem; projektētais ātrums un klase | Civilie elementi, nosaukti pēc to būtības, grupēti pa ceļiem | Starpniekelementi, grupēti pa ceļiem |
| Virsmas | IfcGeographicElement TERRAIN ar trīsstūrveida nelīdzenu tīklu | Trīsstūrveida virsmu kopas | Uz virsmām balstīti virsmu modeļi (lielāki faili) |
| Platformas un sienas | Platformas augša, tās nogāzes kā zemes darbi, atbalstsienas kā IfcWall RETAININGWALL | Tas pats, siena kā lietotāja definēts sienas tips | Tas pats, sienas tips laukā ObjectType |
| Cauruļu tīkli | IfcPipeSegment un IfcDistributionChamberElement IfcDistributionSystem ietvaros | Tas pats | IfcFlowSegment un kameras IfcSystem ietvaros |
| Georeferencēšana | IfcProjectedCRS un IfcMapConversion | Tas pats | ePSet_ProjectedCRS un ePSet_MapConversion uz vietas |

Dzelzceļš (trase ar ieslēgtu dzelzceļa režīmu) IFC 4.3 formātā iekļūst kā IfcRailway: tā pārejas kā atsevišķi tipi (klotoīde, kubiskā parabola, Bloss, Helmerts, sinusa pusvilnis kā kosinusa līkne, sinuss), tās sānslīpums kā IfcAlignmentCant un tās sliežu ceļš kā sliedes, gulšņi un balasta gultne, zem tās apakšbalasts. IFC4 un IFC2x3 saņem tās pašas daļas kā civilos elementus vai starpniekelementus. Atverot IFC 4.3 dzelzceļu, atgriežas tā pārejas un sānslīpums.

Katrs fails satur arī zemes gabalus (pēdas), ainavas darba vides augus un cietos segumus, un ēku masas (katra kā IfcBuilding ar stāviem), visu vienā vietā. Rekvizītu kopas satur to, ko projektējāt: pikets, konstrukciju, izrakuma un uzbēruma nogāzes, joslas platumu un skaitu, apakšējās atzīmes (inverts), akas vākus, sienu augstumus; daudzumi (garumi, laukumi, tilpumi) ir IfcElementQuantity kopas.

## Vienības un koordinātes

Fails ir projekta garuma vienībās (metros vai ASV aptaujas pēdās); laukumi un tilpumi ir kvadrātmetros un kubikmetros. Ar koordinātu sistēmu (GIS › Koordinātas) fails tiek novietots kartē: tā sākumpunkta austrumi un ziemeļi, kā arī vietējās (zemes) sistēmas pagrieziens un mērogs ir kartes pārveidē. Bez tās fails ieraksta savu vietējo sākumpunktu rekvizītu kopā un netiek novietots kartē.

## Imports

Atveriet .ifc failu ar {{ui:Atvērt}} vai nometiet to plānā. Importa dialogs parāda, ko fails satur:

- **Trases** no IFC 4.3 (horizontālais un vertikālais izkārtojums) un IFC 4x1 trašu līknes kļūst par CivilCraft trasēm ar to PI, rādiusiem, spirāļu garumiem un PVI. Trase, ko CivilCraft PI modelis nevar saturēt (saliktas līknes, spirāles starp divām līknēm, trase, kas sākas vai beidzas līknē), netiek importēta, un dialogs norāda, kāpēc.
- **Virsmas**: izvēlieties to, kas kļūst par esošo zemi, vai paturiet projekta.
- **Viss pārējais** (un citas virsmas) var tikt rādīts 3D skatā kā atsauce. Atsauces elementi paliek, kamēr projekts ir atvērts; tie netiek saglabāti projekta failā.

Fails, ko CivilCraft ierakstījis IFC4 vai IFC2x3 formātā, atgriež savas trases precīzi no to rekvizītu kopām.

## Vēl nav ieviests

- Ceļa virsaugstums tiek ierakstīts kā virsaugstuma notikumi un ceļu virsmās (sānslīpums attiecas uz dzelzceļiem).
- Atsauces elementu saglabāšana projekta failā un cauruļu tīklu vai platformu importēšana no IFC kā rediģējami objekti.
