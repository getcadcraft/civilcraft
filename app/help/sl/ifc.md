---
title: Izvoz in uvoz IFC
summary: Shranite celoten projekt kot eno datoteko IFC v IFC 4.3, IFC4 ali IFC2x3 (trase, ceste, zemeljska dela, površja, zidovi, cevi) in odprite datoteke IFC za njihove trase in površja.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, trasa, ifcalignment, cesta, ifcroad, zemeljska dela, tin, predaja, nabava, izvoz ifc, uvoz ifc
from: 6b998bcf
---

IFC je odprt izmenjalni format, ki ga mnogi javni naročniki zahtevajo kot predajo. CivilCraft zapiše celoten projekt v eno datoteko IFC in iz datotek IFC prebere trase in površja nazaj.

## Izvoz

1. Kliknite {{ui:IFC}} v skupini **Izvoz** (v slogih traku: {{ui:Izpis}} › {{ui:Izvoz}} › {{ui:IFC}}).
2. Izberite shemo. **IFC 4.3 ADD2** je prva in privzeta: to je izdaja s trasami, cestami in zemeljskimi deli. Izberite IFC4 ali IFC2x3 samo, če programska oprema prejemnika ne more brati 4.3.
3. Pogovorno okno pove, kaj bo datoteka vsebovala in kaj izbrana shema izpusti. Kliknite {{ui:Izvoz IFC}}.
   Datoteka se prenese kot "*ime projekta*-ifc4x3.ifc", "-ifc4.ifc" ali "-ifc2x3.ifc". CivilCraft si zapomni shemo, ki ste jo nazadnje izbrali.

## Kaj vsebuje vsaka shema

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Trase | IfcAlignment z vodoravno (ravnine, krožni loki, klotoidne spirale) in navpično (naklone, parabolične krivine) zasnovo, njihovimi krivuljami (IfcCompositeCurve, IfcGradientCurve), začetno postajo in dogodki nadvišanja | Tridimenzionalna polilinija na gradbenem elementu | Tridimenzionalna polilinija na proxyju |
| Koridorji | IfcRoad z deli ceste; pasovi, bankine, obcestni jarki in pločniki kot IfcPavement, robniki kot IfcKerb, zelenice; vsaka plast voziščne konstrukcije kot IfcCourse z debelino, materialom in prostornino; bočni nakloni kot IfcEarthworksCut in IfcEarthworksFill s prostorninami izkopa in nasipa; projektna hitrost in razred | Gradbeni elementi, poimenovani po tem, kar so, združeni na cesto | Proxyji, združeni na cesto |
| Površja | IfcGeographicElement TERRAIN s triangulirano nepravilno mrežo (TIN) | Zbirke trikotnih ploskev | Modeli površja na osnovi ploskev (večje datoteke) |
| Ploščadi in zidovi | Vrh ploščadi, njeni nakloni kot zemeljska dela, podporni zidovi kot IfcWall RETAININGWALL | Enako, zid kot uporabniško določen tip zidu | Enako, tip zidu v ObjectType |
| Cevna omrežja | IfcPipeSegment in IfcDistributionChamberElement v IfcDistributionSystem | Enako | IfcFlowSegment in jaški v IfcSystem |
| Georeferenciranje | IfcProjectedCRS in IfcMapConversion | Enako | ePSet_ProjectedCRS in ePSet_MapConversion na lokaciji |

**Železnica** (trasa z vklopljeno možnostjo Železnica) gre v IFC 4.3 kot IfcRailway: njeni prehodi kot lastni tipi (klotoida, kubična parabola, Bloss, Helmert, sinusni polval kot kosinusna krivulja, sinus), njen nagib kot IfcAlignmentCant, njen tir pa kot tirnice, pragovi in gramozna posteljica, s pod-gramozno plastjo spodaj. IFC4 in IFC2x3 dobita enake dele kot gradbene elemente ali proxyje. Odprtje železniške proge IFC 4.3 prinese nazaj njene prehode in nagib.

Vsaka datoteka prav tako vsebuje parcele (tlorise), rastline in utrjene površine delovnega okolja Landscape ter stavbne mase (vsaka je IfcBuilding s svojimi etažami), vse na eni lokaciji. Nabori lastnosti nosijo, kar ste zasnovali: postaje, tipični prerez, nakline izkopa in nasipa, širino in število pasov, notranja dna cevi, robove jaškov, višine zidov; količine (dolžine, površine, prostornine) so nabori IfcElementQuantity.

## Enote in koordinate

Datoteka je v dolžinski enoti projekta (metri ali US survey feet); površine in prostornine so v kvadratnih in kubičnih metrih. S koordinatnim sistemom (GIS › Koordinate) se datoteka postavi na zemljevid: vzhodna in severna koordinata izhodišča ter zasuk in merilo lokalnega sistema so v pretvorbi na zemljevid. Brez njega datoteka zapiše svoje lokalno izhodišče v nabor lastnosti in ni postavljena na zemljevid.

## Uvoz

Odprite datoteko .ifc z {{ui:Odpri}} ali jo spustite na tloris. Pogovorno okno za uvoz pove, kaj datoteka vsebuje:

- **Trase** iz IFC 4.3 (vodoravna in navpična zasnova) ter krivulje trase IFC 4x1 postanejo trase CivilCraft s svojimi PI, polmeri, dolžinami spiral in PVI. Trasa, ki je model PI v CivilCraft ne more zadržati (sestavljene krivine, spirale med dvema krivinama, trasa, ki se začne ali konča v krivini), ni uvožena, pogovorno okno pa pove zakaj.
- **Površja**: izberite tisto, ki postane obstoječi teren, ali ohranite projektnega.
- **Vse drugo** (in druga površja) lahko prikažete v 3D pogledu kot referenco. Referenčni elementi ostanejo, dokler je projekt odprt; v datoteko projekta se ne shranijo.

Datoteka, ki jo je CivilCraft zapisal v IFC4 ali IFC2x3, vrne svoje trase točno iz svojih naborov lastnosti.

## Še ni izdelano

- Nadvišanje ceste je zapisano kot dogodki nadvišanja in v površjih cest (nagib je za železnice).
- Shranjevanje referenčnih elementov v datoteko projekta ter uvoz cevnih omrežij ali ploščadi iz IFC kot urejljivih objektov.
