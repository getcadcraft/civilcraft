---
title: Export a import IFC
summary: Uložte celý projekt ako jeden súbor IFC v IFC 4.3, IFC4 alebo IFC2x3 (osi trás, cesty, zemné práce, povrchy, múry, potrubia) a otvárajte súbory IFC pre ich osi trás a povrchy.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, os trasy, ifcalignment, cesta, ifcroad, zemné práce, tin, odovzdávaný výstup, obstarávanie, export ifc, import ifc
from: 6b998bcf
---

IFC je otvorený výmenný formát, ktorý mnohí verejní objednávatelia požadujú ako odovzdávaný výstup. CivilCraft zapíše celý projekt do jedného súboru IFC a osi trás a povrchy načíta späť zo súborov IFC.

## Export

1. Kliknite na {{ui:IFC}} v skupine **Export** (v štýle pásu s nástrojmi: {{ui:Výstup}} › {{ui:Export}} › {{ui:IFC}}).
2. Vyberte schému. **IFC 4.3 ADD2** je prvá a predvolená: je to vydanie s osami trás, cestami a zemnými prácami. Vyberte IFC4 alebo IFC2x3, iba ak softvér príjemcu nedokáže čítať 4.3.
3. Dialóg uvedie, čo bude súbor obsahovať a čo zvolená schéma vynechá. Kliknite na {{ui:Exportovať IFC}}.
   Súbor sa stiahne ako „*názov projektu*-ifc4x3.ifc“, „-ifc4.ifc“ alebo „-ifc2x3.ifc“. CivilCraft si zapamätá schému, ktorú ste zvolili naposledy.

## Čo obsahuje každá schéma

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Osi trás | IfcAlignment s jeho vodorovným (priamky, kruhové oblúky, klotoidné špirály) a zvislým (sklony, parabolické oblúky) vedením, ich krivky (IfcCompositeCurve, IfcGradientCurve), počiatočné staničenie a udalosti prevýšenia | 3D lomená čiara na civilnom prvku | 3D lomená čiara na proxy |
| Koridory | IfcRoad s časťami cesty; jazdné pruhy, krajnice, žľaby a chodníky ako IfcPavement, obrubníky ako IfcKerb, pásy výsadby; každá vrstva krytu ako IfcCourse s hrúbkou, materiálom a objemom; bočné svahy ako IfcEarthworksCut a IfcEarthworksFill s objemami výkopu a násypu; návrhová rýchlosť a trieda | Civilné prvky pomenované podľa toho, čím sú, zoskupené podľa cesty | Proxy, zoskupené podľa cesty |
| Povrchy | IfcGeographicElement TERRAIN s triangulovanou nepravidelnou sieťou | Množiny triangulovaných plôch | Modely povrchov založené na plochách (väčšie súbory) |
| Plošiny a múry | Horná plocha plošiny, jej svahy ako zemné práce, oporné múry ako IfcWall RETAININGWALL | Rovnako, múr ako používateľom definovaný typ múra | Rovnako, typ múra v ObjectType |
| Potrubné siete | IfcPipeSegment a IfcDistributionChamberElement v IfcDistributionSystem | Rovnako | IfcFlowSegment a šachty v IfcSystem |
| Georeferencovanie | IfcProjectedCRS a IfcMapConversion | Rovnako | ePSet_ProjectedCRS a ePSet_MapConversion na pozemku |

**Železnica** (os trasy so zapnutou voľbou Železnica) ide do IFC 4.3 ako IfcRailway: jej prechodnice ako vlastné typy (klotoida, kubická parabola, Bloss, Helmert, sínusová polovlna ako kosínusová krivka, sínus), jej prevýšenie ako IfcAlignmentCant a jej trať ako koľajnice, podvaly a štrkové lôžko s podložím pod ním. IFC4 a IFC2x3 dostanú tie isté časti ako civilné prvky alebo proxy. Otvorenie železnice v IFC 4.3 vráti jej prechodnice a prevýšenie späť.

Každý súbor nesie aj parcely (stopy), rastliny a spevnené plochy z pracovného priestoru Krajina a objemy budov (každý ako IfcBuilding s podlažiami), všetko v jednom pozemku. Množiny vlastností nesú to, čo ste navrhli: staničenia, priečny profil, sklony výkopu a násypu, šírku a počet pruhov, dná potrubí a horné hrany šachiet, výšky múrov. Množstvá (dĺžky, plochy, objemy) sú množiny IfcElementQuantity.

## Jednotky a súradnice

Súbor je v dĺžkovej jednotke projektu (metre alebo americké prieskumné stopy); plochy a objemy sú v štvorcových a kubických metroch. So súradnicovým systémom (GIS › Súradnice) sa súbor umiestni na mapu: východisko jeho Y a X a rotácia a mierka lokálneho systému sú v mapovej konverzii. Bez neho si súbor zapíše svoj lokálny začiatok do množiny vlastností a na mapu sa neumiestni.

## Import

Otvorte súbor .ifc cez {{ui:Otvoriť}} alebo ho pustite na pôdorys. Dialóg importu uvedie, čo súbor obsahuje:

- **Osi trás** z IFC 4.3 (vodorovné a zvislé vedenie) a krivky osí trás z IFC 4x1 sa stanú osami trás CivilCraft s ich PI, polomermi, dĺžkami špirál a PVI. Os, ktorú model PI v CivilCraft nedokáže uchovať (zložené oblúky, špirály medzi dvoma oblúkmi, os, ktorá začína alebo končí v oblúku), sa neimportuje a dialóg uvedie prečo.
- **Povrchy**: vyberte ten, ktorý sa stane jestvujúcim terénom, alebo ponechajte povrch projektu.
- **Všetko ostatné** (a ostatné povrchy) sa môže zobraziť v 3D zobrazení ako referencia. Referenčné prvky zostávajú, kým je projekt otvorený; v súbore projektu sa neukladajú.

Súbor, ktorý CivilCraft zapísal v IFC4 alebo IFC2x3, vráti svoje osi trás presne z ich množín vlastností.

## Ešte nie je hotové

- Prevýšenie cesty sa zapisuje ako udalosti prevýšenia a v povrchoch vozovky (sklon v priečnom reze patrí železniciam).
- Ukladanie referenčných prvkov do súboru projektu a import potrubných sietí alebo plošín z IFC ako upraviteľných objektov.
