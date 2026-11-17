---
title: IFC izvoz i uvoz
summary: Snimite cijeli projekt kao jednu IFC datoteku u IFC 4.3, IFC4 ili IFC2x3 (trase, putevi, zemljani radovi, površine, zidovi, cjevovodi), te otvorite IFC datoteke za njihove trase i površine.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, trasa, ifcalignment, put, ifcroad, zemljani radovi, tin, isporučevina, nabavka, izvezi ifc, uvezi ifc
from: 6b998bcf
---

IFC je otvoreni format za razmjenu koji mnogi javni naručioci traže kao isporučevinu. CivilCraft upisuje cijeli projekt u jednu IFC datoteku i čita trase i površine nazad iz IFC datoteka.

## Izvoz

1. Kliknite {{ui:IFC}} u grupi **Izvoz** (u stilovima trake: {{ui:Izlaz}} › {{ui:Izvoz}} › {{ui:IFC}}).
2. Izaberite šemu. **IFC 4.3 ADD2** je prva i zadana: to je izdanje sa trasama, putevima i zemljanim radovima. Izaberite IFC4 ili IFC2x3 samo kada softver primaoca ne može čitati 4.3.
3. Dijalog kaže šta će datoteka sadržavati i šta izabrana šema izostavlja. Kliknite {{ui:Izvezi IFC}}.
   Datoteka se preuzima kao "*naziv projekta*-ifc4x3.ifc", "-ifc4.ifc" ili "-ifc2x3.ifc". CivilCraft pamti šemu koju ste zadnju izabrali.

## Šta svaka šema sadrži

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Trase | IfcAlignment sa njegovim horizontalnim (linije, kružni lukovi, klotoidne spirale) i vertikalnim (nagibi, parabolične krivine) rasporedom, njihove krivine (IfcCompositeCurve, IfcGradientCurve), početna stacionaža i događaji nadvišenja | 3D polilinija na građevinskom elementu | 3D polilinija na proksiju |
| Koridori | IfcRoad sa dijelovima puta; trake, bankine, odvodni žljebovi i trotoari kao IfcPavement, ivičnjaci kao IfcKerb, pojasevi zelenila; svaki sloj kolovoza kao IfcCourse sa svojom debljinom, materijalom i zapreminom; bočni nagibi kao IfcEarthworksCut i IfcEarthworksFill sa zapreminama iskopa i nasipa; projektovana brzina i kategorija | Građevinski elementi imenovani prema onome što jesu, grupisani po putu | Proksiji, grupisani po putu |
| Površine | IfcGeographicElement TERRAIN sa triangulisanom nepravilnom mrežom | Skupovi triangulisanih ploha | Modeli površina zasnovani na plohama (veće datoteke) |
| Platoi i zidovi | Gornja površina plata, njegovi nagibi kao zemljani radovi, potporni zidovi kao IfcWall RETAININGWALL | Isto, zid kao korisnički definisan tip zida | Isto, tip zida u ObjectType |
| Mreže cijevi | IfcPipeSegment i IfcDistributionChamberElement u IfcDistributionSystem | Isto | IfcFlowSegment i šahtovi u IfcSystem |
| Georeferenciranje | IfcProjectedCRS i IfcMapConversion | Isto | ePSet_ProjectedCRS i ePSet_MapConversion na lokaciji |

**Željeznica** (trasa sa uključenom opcijom Željeznica) ulazi u IFC 4.3 kao IfcRailway: njeni prelazi kao zasebni tipovi (klotoida, kubna parabola, Bloss, Helmert, sinusna polutalasa kao kosinusna kriva, sinus), njen nagib kao IfcAlignmentCant, a njen kolosijek kao šine, pragovi i sloj tucanika, sa podtucanikom ispod. IFC4 i IFC2x3 dobijaju iste dijelove kao građevinske elemente ili proksije. Otvaranje IFC 4.3 željeznice vraća njene prelaze i nagib.

Svaka datoteka također nosi parcele (otiske), biljke i tvrdo uređenje radnog prostora Pejzaž, te mase zgrada (svaka kao IfcBuilding sa svojim spratovima), sve na jednoj lokaciji. Skupovi svojstava nose ono što ste projektovali: stacionaže, sklop, nagibe iskopa i nasipa, širinu i broj traka, kote dna cijevi, gornje kote okana, visine zidova; količine (dužine, površine, zapremine) su skupovi IfcElementQuantity.

## Jedinice i koordinate

Datoteka je u jedinici dužine projekta (metri ili američke geodetske stope); površine i zapremine su u kvadratnim i kubnim metrima. Uz koordinatni sistem (GIS › Koordinate) datoteka se postavlja na kartu: koordinate istok i sjever njenog ishodišta, te rotacija i razmjera lokalnog (terenskog) sistema, nalaze se u konverziji karte. Bez njega datoteka upisuje svoje lokalno ishodište u skup svojstava i ne postavlja se na kartu.

## Uvoz

Otvorite .ifc datoteku sa {{ui:Otvori}} ili je prevucite na plan. Dijalog uvoza kaže šta datoteka sadrži:

- **Trase** iz IFC 4.3 (horizontalni i vertikalni raspored) i krivine trasa IFC 4x1 postaju CivilCraft trasama sa svojim PI, poluprečnicima, dužinama spirala i PVI. Trasa koju CivilCraft model PI ne može prihvatiti (složene krivine, spirale između dvije krivine, ona koja počinje ili završava u krivini) ne uvozi se, a dijalog kaže zašto.
- **Površine**: izaberite onu koja postaje postojeći teren, ili zadržite projektovanu.
- **Sve ostalo** (i ostale površine) može se prikazati u 3D prikazu kao referenca. Referentni elementi ostaju dok je projekt otvoren; ne čuvaju se u datoteci projekta.

Datoteka koju je CivilCraft napisao u IFC4 ili IFC2x3 vraća svoje trase tačno iz njihovih skupova svojstava.

## Još nije izrađeno

- Nadvišenje puta se upisuje kao događaji nadvišenja i u površinama puta (nagib je za željeznice).
- Čuvanje referentnih elemenata u datoteci projekta, te uvoz mreža cijevi ili platoa iz IFC-a kao objekata za uređivanje.
