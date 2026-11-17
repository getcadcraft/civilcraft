---
title: Izvoz i uvoz IFC-a
summary: Sačuvaj ceo projekat kao jednu IFC datoteku u IFC 4.3, IFC4 ili IFC2x3 (trase, putevi, zemljani radovi, površi, zidovi, cevi), i otvori IFC datoteke za njihove osovine trasa i površi.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, osovina trase, ifcalignment, put, ifcroad, zemljani radovi, tin, isporuka, nabavka, izvoz ifc, uvoz ifc
from: 6b998bcf
---

IFC je otvoreni format za razmenu koji mnogi javni naručioci traže kao isporuku. CivilCraft upisuje ceo projekat u jednu IFC datoteku i čita osovine trasa i površi nazad iz IFC datoteka.

## Izvoz

1. Klikni {{ui:IFC}} u grupi **Izvoz** (u stilovima trake: {{ui:Izlaz}} › {{ui:Izvoz}} › {{ui:IFC}}).
2. Izaberi šemu. **IFC 4.3 ADD2** je prva i podrazumevana: to je izdanje sa trasama, putevima i zemljanim radovima. Izaberi IFC4 ili IFC2x3 samo kad softver primaoca ne može da čita 4.3.
3. Dijalog kaže šta će datoteka sadržati i šta izabrana šema izostavlja. Klikni {{ui:Izvezi IFC}}.
   Datoteka se preuzima kao „*naziv projekta*-ifc4x3.ifc“, „-ifc4.ifc“ ili „-ifc2x3.ifc“. CivilCraft pamti šemu koju si poslednju izabrao.

## Šta svaka šema sadrži

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Osovine trasa | IfcAlignment sa svojim horizontalnim (prave, kružni lukovi, klotoidne spirale) i vertikalnim (nagibi, parabolične krivine) rasporedima, njihove krive (IfcCompositeCurve, IfcGradientCurve), početna stacionaža i događaji nadvišenja | 3D polilinija na građevinskom elementu | 3D polilinija na proksiju |
| Koridori | IfcRoad sa delovima puta; trake, bankine, žljebovi i trotoari kao IfcPavement, ivičnjaci kao IfcKerb, zelene trake; svaki sloj kolovoza kao IfcCourse sa svojom debljinom, materijalom i zapreminom; bočne kosine kao IfcEarthworksCut i IfcEarthworksFill sa zapreminama iskopa i nasipa; projektovana brzina i klasa | Građevinski elementi nazvani prema onome što jesu, grupisani po putu | Proksiji, grupisani po putu |
| Površi | IfcGeographicElement TERRAIN sa trougaonom nepravilnom mrežom | Skupovi trouglastih lica | Površinski modeli zasnovani na licima (veće datoteke) |
| Plato i zidovi | Gornja površina platoa, njegove kosine kao zemljani radovi, potporni zidovi kao IfcWall RETAININGWALL | Isto, zid kao korisnički definisan tip zida | Isto, tip zida u ObjectType |
| Mreže cevi | IfcPipeSegment i IfcDistributionChamberElement u IfcDistributionSystem | Isto | IfcFlowSegment i šahtovi u IfcSystem |
| Georeferenciranje | IfcProjectedCRS i IfcMapConversion | Isto | ePSet_ProjectedCRS i ePSet_MapConversion na lokaciji |

**Železnica** (trasa sa uključenom opcijom Železnica) ulazi u IFC 4.3 kao IfcRailway: njeni prelazi kao sopstveni tipovi (klotoida, kubna parabola, Bloss, Helmert, sinusna polutalasna kao kosinusna kriva, sinus), njen nagib kao IfcAlignmentCant, a njen kolosek kao šine, pragovi i tucanička posteljica, sa podtucanikom ispod. IFC4 i IFC2x3 dobijaju iste delove kao građevinske elemente ili proksije. Otvaranje IFC 4.3 železnice vraća njene prelaze i nagib.

Svaka datoteka takođe nosi parcele (otiske), biljke i tvrdo uređenje iz radnog prostora Pejzaž, i mase zgrada (svaka kao IfcBuilding sa svojim spratovima), sve na jednoj lokaciji. Skupovi svojstava nose ono što si projektovao: stacionaže, sklop, kosine iskopa i nasipa, širinu i broj traka, kote dna i poklopaca, visine zidova; količine (dužine, površine, zapremine) su skupovi IfcElementQuantity.

## Jedinice i koordinate

Datoteka je u jedinici dužine projekta (metri ili američke geodetske stope); površine i zapremine su u kvadratnim i kubnim metrima. Sa koordinatnim sistemom (GIS › Koordinate) datoteka se postavlja na mapu: koordinate istoka i severa njenog početka, kao i rotacija i razmera lokalnog (terenskog) sistema, nalaze se u konverziji mape. Bez njega datoteka beleži svoj lokalni početak u skupu svojstava i ne postavlja se na mapu.

## Uvoz

Otvori .ifc datoteku pomoću {{ui:Otvori}} ili je prevuci na plan. Dijalog uvoza kaže šta datoteka sadrži:

- **Osovine trasa** iz IFC 4.3 (horizontalni i vertikalni raspored) i krive osovina iz IFC 4x1 postaju CivilCraft trase sa svojim PI, poluprečnicima, dužinama spirala i PVI. Trasa koju CivilCraft-ov model PI-ja ne može da drži (složene krive, spirale između dve krive, krive koja počinje ili završava u krivini) se ne uvozi, a dijalog kaže zašto.
- **Površi**: izaberi onu koja postaje postojeći teren, ili zadrži projektovanu.
- **Sve ostalo** (i druge površi) može se prikazati u 3D pregledu kao referenca. Referentni elementi ostaju dok je projekat otvoren; ne čuvaju se u datoteci projekta.

Datoteka koju je CivilCraft napisao u IFC4 ili IFC2x3 vraća svoje osovine tačno iz njihovih skupova svojstava.

## Još nije napravljeno

- Nadvišenje puta se upisuje kao događaji nadvišenja i u površima puta (nagib je za železnice).
- Čuvanje referentnih elemenata u datoteci projekta i uvoz cevovoda ili platoa iz IFC-a kao izmenljivih objekata.
