---
title: Hamisha na ingiza IFC
summary: Hifadhi mradi mzima kama faili moja la IFC katika IFC 4.3, IFC4 au IFC2x3 (mipangilio ya njia, barabara, kazi za ardhi, nyuso, kuta, mabomba), na fungua faili za IFC kwa mipangilio ya njia na nyuso zake.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, mpangilio wa njia, ifcalignment, barabara, ifcroad, kazi za ardhi, tin, matokeo ya mwisho, ununuzi, hamisha ifc, ingiza ifc
from: 6b998bcf
---

IFC ni umbizo huria la kubadilishana ambalo wateja wengi wa umma huliomba kama matokeo ya mwisho. CivilCraft huandika mradi mzima kwenye faili moja la IFC na husoma mipangilio ya njia na nyuso kutoka kwenye faili za IFC.

## Hamisha

1. Bofya {{ui:IFC}} katika kikundi cha **Hamisha** (kwenye mitindo ya utepe: {{ui:Matokeo}} › {{ui:Hamisha}} › {{ui:IFC}}).
2. Chagua muundo (schema). **IFC 4.3 ADD2** ndio wa kwanza na chaguo-msingi: ni toleo lenye mipangilio ya njia, barabara na kazi za ardhi. Chagua IFC4 au IFC2x3 pale tu programu ya mpokeaji isipoweza kusoma 4.3.
3. Kisanduku kinasema faili litashikilia nini na kile ambacho muundo uliochaguliwa unaacha. Bofya {{ui:Hamisha IFC}}.
   Faili linapakuliwa kama "*jina la mradi*-ifc4x3.ifc", "-ifc4.ifc" au "-ifc2x3.ifc". CivilCraft inakumbuka muundo uliochagua mwisho.

## Kila muundo unashikilia nini

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Mipangilio ya njia | IfcAlignment yenye mipangilio yake ya mlalo (mistari, matao ya mduara, spirali za clothoid) na wima (miteremko, mikunjo ya parabolic), mikunjo yake (IfcCompositeCurve, IfcGradientCurve), kituo cha kuanzia na matukio ya superelevation | Polilaini ya 3D kwenye kipengele cha kiraia | Polilaini ya 3D kwenye proksi |
| Korido | IfcRoad yenye sehemu za barabara; njia, mabega, mifereji ya kando na vijia kama IfcPavement, ukingo kama IfcKerb, mistari ya kupanda; kila tabaka la lami kama IfcCourse pamoja na unene wake, nyenzo na ujazo; miteremko ya pembeni kama IfcEarthworksCut na IfcEarthworksFill pamoja na juzuu za kukata na kujaza; kasi ya muundo na daraja | Vipengele vya kiraia vilivyopewa majina kulingana na vilivyo, vilivyokusanywa kwa kila barabara | Proksi, zilizokusanywa kwa kila barabara |
| Nyuso | IfcGeographicElement TERRAIN yenye mtandao wa pembetatu usio wa kawaida | Seti za nyuso za pembetatu | Miundo ya nyuso kulingana na nyuso (faili kubwa zaidi) |
| Pedi na kuta | Juu ya pedi, miteremko yake kama kazi za ardhi, kuta za kubakiza kama IfcWall RETAININGWALL | Vilevile, ukuta kama aina ya ukuta iliyofafanuliwa na mtumiaji | Vilevile, aina ya ukuta katika ObjectType |
| Mitandao ya mabomba | IfcPipeSegment na IfcDistributionChamberElement kwenye IfcDistributionSystem | Vilevile | IfcFlowSegment na vyumba kwenye IfcSystem |
| Kuweka kwenye ramani | IfcProjectedCRS na IfcMapConversion | Vilevile | ePSet_ProjectedCRS na ePSet_MapConversion kwenye eneo |

**Reli** (mpangilio wa njia wenye Reli imewashwa) huingia IFC 4.3 kama IfcRailway: mpito wake kama aina zao wenyewe (clothoid, parabola ya ujazo, Bloss, Helmert, nusu-wimbi la sine kama mkunjo wa cosine, sine), mwinamo wake kama IfcAlignmentCant, na njia yake kama reli, mbao za reli na kitanda cha changarawe, pamoja na sub-ballast chini yake. IFC4 na IFC2x3 zinapata sehemu zile zile kama vipengele vya kiraia au proksi. Kufungua reli ya IFC 4.3 kunarudisha mpito wake na mwinamo.

Kila faili pia hubeba viwanja (alama za msingi), mimea na ardhi ngumu ya eneo la Mandhari, na misa za majengo (kila moja ni IfcBuilding yenye ghorofa zake), vyote kwenye eneo moja. Seti za sifa zinabeba kile ulichobuni: vituo, mkusanyiko, miteremko ya kukata na kujaza, upana na idadi ya njia, viwango vya chini vya mabomba, viwango vya juu vya mashimo, urefu wa kuta; kiasi (urefu, maeneo, juzuu) ni seti za IfcElementQuantity.

## Vitengo na kuratibu

Faili liko kwenye kitengo cha urefu cha mradi (mita, au futi za US survey); maeneo na juzuu viko kwenye mita za mraba na za ujazo. Ukiwa na mfumo wa kuratibu (GIS › Kuratibu) faili linawekwa kwenye ramani: easting na northing ya asili yake, pamoja na mzunguko na mizani ya mfumo wa ardhi wa ndani, vinakuwa kwenye ubadilishaji wa ramani. Bila hilo faili linarekodi asili yake ya ndani kwenye seti ya sifa na halijawekwa kwenye ramani.

## Ingiza

Fungua faili la .ifc kwa {{ui:Fungua}} au liangushe kwenye mpango. Kisanduku cha uingizaji kinasema faili linashikilia nini:

- **Mipangilio ya njia** kutoka IFC 4.3 (mipangilio ya mlalo na wima) na mikunjo ya mpangilio ya IFC 4x1 inakuwa mipangilio ya njia ya CivilCraft yenye PI zake, radii, urefu wa spirali na PVI. Mpangilio ambao modeli ya PI ya CivilCraft haiwezi kuushikilia (mikunjo mchanganyiko, spirali kati ya mikunjo miwili, mpangilio unaoanzia au kuishia kwenye mkunjo) haujaingizwa, na kisanduku kinasema kwa nini.
- **Nyuso**: chagua ile itakayokuwa ardhi iliyopo, au weka ya mradi.
- **Kila kitu kingine** (na nyuso nyingine) kinaweza kuonyeshwa kwenye mwonekano wa 3D kama marejeo. Vipengele vya marejeo vinabaki mradi ukiwa wazi; havihifadhiwi kwenye faili la mradi.

Faili ambalo CivilCraft iliandika kwa IFC4 au IFC2x3 linarudisha mipangilio yake ya njia kikamilifu kutoka seti zao za sifa.

## Bado hazijajengwa

- Superelevation ya barabara inaandikwa kama matukio ya superelevation na kwenye nyuso za barabara (mwinamo ni wa reli).
- Kuhifadhi vipengele vya marejeo kwenye faili la mradi, na kuingiza mitandao ya mabomba au pedi kutoka IFC kama vitu vinavyoweza kuhaririwa.
