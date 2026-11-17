---
title: Izvoz i uvoz IFC-a
summary: Spremi cijeli projekt kao jednu IFC datoteku u IFC 4.3, IFC4 ili IFC2x3 (osi trase, ceste, zemljani radovi, površine, zidovi, cijevi) i otvori IFC datoteke za njihove osi trase i površine.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, os trase, ifcalignment, cesta, ifcroad, zemljani radovi, tin, isporuka, nabava, izvoz ifc, uvoz ifc
from: 6b998bcf
---

IFC je otvoreni format za razmjenu koji mnogi javni naručitelji traže kao isporuku. CivilCraft zapisuje cijeli projekt u jednu IFC datoteku i čita osi trase i površine natrag iz IFC datoteka.

## Izvoz

1. Kliknite {{ui:IFC}} u grupi **Izvoz** (u stilovima vrpce: {{ui:Ispis}} › {{ui:Izvoz}} › {{ui:IFC}}).
2. Odaberite shemu. **IFC 4.3 ADD2** je prva i zadana: to je izdanje s osima trase, cestama i zemljanim radovima. Odaberite IFC4 ili IFC2x3 samo kad programi primatelja ne mogu čitati 4.3.
3. Dijaloški okvir kaže što će datoteka sadržavati i što odabrana shema izostavlja. Kliknite {{ui:Izvoz IFC-a}}.
   Datoteka se preuzima kao „*naziv projekta*-ifc4x3.ifc“, „-ifc4.ifc“ ili „-ifc2x3.ifc“. CivilCraft pamti shemu koju ste zadnju odabrali.

## Što svaka shema sadrži

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Osi trase | IfcAlignment s vodoravnim (pravci, kružni lukovi, klotoidne prijelaznice) i okomitim (nagibi, paraboličke krivulje) rasporedom, njihovim krivuljama (IfcCompositeCurve, IfcGradientCurve), početnom stacionažom i događajima nadvišenja | 3D polilinija na građevinskom elementu | 3D polilinija na proxy objektu |
| Koridori | IfcRoad s dijelovima ceste; trake, bankine, žlijebovi i pločnici kao IfcPavement, rubnjaci kao IfcKerb, zelene trake; svaki sloj kolnika kao IfcCourse s debljinom, materijalom i volumenom; bočni nagibi kao IfcEarthworksCut i IfcEarthworksFill s volumenima iskopa i nasipa; projektna brzina i razred | Građevinski elementi nazvani prema onome što jesu, grupirani po cesti | Proxy objekti, grupirani po cesti |
| Površine | IfcGeographicElement TERRAIN s triangulacijskom nepravilnom mrežom | Skupovi trokutastih ploha | Površinski modeli temeljeni na plohama (veće datoteke) |
| Platoi i zidovi | Gornja kota platoa, njegovi nagibi kao zemljani radovi, potporni zidovi kao IfcWall RETAININGWALL | Isto, zid kao korisnički definirani tip zida | Isto, tip zida u ObjectType |
| Mreže cijevi | IfcPipeSegment i IfcDistributionChamberElement u IfcDistributionSystem | Isto | IfcFlowSegment i okna u IfcSystem |
| Georeferenciranje | IfcProjectedCRS i IfcMapConversion | Isto | ePSet_ProjectedCRS i ePSet_MapConversion na lokaciji |

Željeznica (os trase s uključenom opcijom Željeznica) ide u IFC 4.3 kao IfcRailway: njezini prijelazi kao vlastiti tipovi (klotoida, kubna parabola, Bloss, Helmert, polovica sinusnog vala kao kosinusna krivulja, sinus), njezino nadvišenje kao IfcAlignmentCant, a njezin kolosijek kao tračnice, pragovi i tučenička posteljica, s podložnim slojem ispod. IFC4 i IFC2x3 dobivaju iste dijelove kao građevinske elemente ili proxy objekte. Otvaranje željeznice iz IFC 4.3 vraća njezine prijelaze i nadvišenje.

Svaka datoteka također nosi parcele (otiske), biljke i popločenja radnog prostora Krajobraz te mase zgrada (svaka kao IfcBuilding s etažama), sve na jednoj lokaciji. Skupovi svojstava nose ono što ste projektirali: stacionaže, sklop, nagibe iskopa i nasipa, širinu i broj traka, dna cijevi, rubove okana, visine zidova; količine (duljine, površine, volumeni) su skupovi IfcElementQuantity.

## Jedinice i koordinate

Datoteka je u mjernoj jedinici projekta (metri ili američke geodetske stope); površine i volumeni su u kvadratnim i kubnim metrima. S koordinatnim sustavom (GIS › Koordinate) datoteka se postavlja na kartu: istok i sjever njenog ishodišta te rotacija i mjerilo lokalnog (terenskog) sustava upisani su u pretvorbi karte. Bez njega datoteka u skupu svojstava zapisuje svoje lokalno ishodište i ne postavlja se na kartu.

## Uvoz

Otvorite .ifc datoteku pomoću {{ui:Otvori}} ili je ispustite na tlocrt. Dijaloški okvir za uvoz kaže što datoteka sadrži:

- **Osi trase** iz IFC 4.3 (vodoravni i okomiti raspored) i krivulje osi IFC 4x1 postaju CivilCraft osi trase s njihovim PI-jevima, radijusima, duljinama prijelaznica i PVI-jevima. Os trase koju model PI-jeva CivilCraft-a ne može držati (složene krivulje, prijelaznice između dviju krivulja, one koje počinju ili završavaju u krivulji) se ne uvozi, a dijaloški okvir kaže zašto.
- **Površine**: odaberite onu koja postaje postojeći teren ili zadržite onu projekta.
- **Sve ostalo** (i ostale površine) može se prikazati u 3D prikazu kao referenca. Referentni elementi ostaju dok je projekt otvoren; ne spremaju se u datoteku projekta.

Datoteka koju je CivilCraft zapisao u IFC4 ili IFC2x3 vraća svoje osi trase točno iz njihovih skupova svojstava.

## Još nije izrađeno

- Nadvišenje ceste zapisuje se kao događaji nadvišenja i u površinama cesta (za željeznice vrijedi nagib u zavoju).
- Spremanje referentnih elemenata u datoteku projekta te uvoz cijevi ili platoa iz IFC-a kao uredivih objekata.
