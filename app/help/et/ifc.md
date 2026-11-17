---
title: IFC eksport ja import
summary: Salvesta kogu projekt ühe IFC-failina formaadis IFC 4.3, IFC4 või IFC2x3 (joondused, teed, pinnatööd, pinnad, seinad, torustikud) ja ava IFC-failid nende joonduste ja pindade jaoks.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, joondus, ifcalignment, tee, ifcroad, pinnatööd, tin, tarnitav dokument, hange, ekspordi ifc, impordi ifc
from: 6b998bcf
---

IFC on avatud vahetusformaat, mida paljud avaliku sektori kliendid nõuavad tarnena. CivilCraft kirjutab kogu projekti ühte IFC-faili ja loeb joondused ning pinnad IFC-failidest tagasi.

## Eksport

1. Klõpsa {{ui:IFC}} nupule grupis **Ekspordi** (lindi stiilides: {{ui:Väljund}} › {{ui:Ekspordi}} › {{ui:IFC}}).
2. Vali skeem. **IFC 4.3 ADD2** on esimene ja vaikimisi valitud: see on versioon, millel on joondused, teed ja pinnatööd. Vali IFC4 või IFC2x3 ainult siis, kui saaja tarkvara ei oska lugeda 4.3-te.
3. Dialoog ütleb, mida fail sisaldab ja mida valitud skeem välja jätab. Klõpsa {{ui:Ekspordi IFC}}.
   Fail laaditakse alla nimega „*projekti nimi*-ifc4x3.ifc“, „-ifc4.ifc“ või „-ifc2x3.ifc“. CivilCraft mäletab viimati valitud skeemi.

## Mis iga skeem sisaldab

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Joondused | IfcAlignment oma horisontaalse (sirged lõigud, ringkaared, klotoidspiraalid) ja vertikaalse (kallakud, parabolilised kõverad) paigutusega, nende kõverad (IfcCompositeCurve, IfcGradientCurve), algjaam ja ülekallde sündmused | 3D polüjoon tsiviilelemendil | 3D polüjoon proksil |
| Koridorid | IfcRoad teeosadega; rajad, õlad, kraavid ja kõnniteed kui IfcPavement, äärekivid kui IfcKerb, istutusribad; iga kattekiht kui IfcCourse oma paksuse, materjali ja mahuga; külgnõlvad kui IfcEarthworksCut ja IfcEarthworksFill koos kaevandi ja täite mahtudega; projektkiirus ja klass | Tsiviilelemendid nimetatud selle järgi, mis nad on, grupeeritud tee kaupa | Proksid, grupeeritud tee kaupa |
| Pinnad | IfcGeographicElement TERRAIN kolmnurkstatud ebakorrapärase võrguga | Kolmnurkstatud näokogumid | Näopõhised pinnamudelid (suuremad failid) |
| Platsid ja seinad | Platsi pealispind, selle nõlvad pinnatöödena, tugiseinad kui IfcWall RETAININGWALL | Sama, sein kasutaja määratud seinatüübina | Sama, seina tüüp ObjectType'is |
| Torustikud | IfcPipeSegment ja IfcDistributionChamberElement IfcDistributionSystem'is | Sama | IfcFlowSegment ja kambrid IfcSystem'is |
| Geograafiline sidumine | IfcProjectedCRS ja IfcMapConversion | Sama | ePSet_ProjectedCRS ja ePSet_MapConversion asukohal |

Raudtee (joondus, kus Raudtee on sisse lülitatud) läheb IFC 4.3-sse kui IfcRailway: selle üleminekud omaette tüüpidena (klotoid, kuupparabool, Bloss, Helmert, siinuse poollaine kui koossiinus, siinus), selle kallutus kui IfcAlignmentCant ja rada kui rööpad, talad ja rongi alus, selle all alusballast. IFC4 ja IFC2x3 saavad samad osad tsiviilelementidena või proksidena. IFC 4.3 raudtee avamine toob üleminekud ja kallutuse tagasi.

Igas failis on ka kinnistud (jalajäljed), haljastuse tööruumi taimed ja sillutis ning hoonete massid (igaüks IfcBuilding oma korrustega), kõik ühel asukohal. Omaduste komplektid kannavad seda, mida sa projekteerisid: jaamad, koostu, pinnatööde nõlvad, rajalaius ja -arv, põhjad, servad ja seinte kõrgused; kogused (pikkused, pindalad, mahud) on IfcElementQuantity komplektid.

## Ühikud ja koordinaadid

Fail on projekti pikkuseühikus (meetrites või USA miilijalgades); pindalad ja mahud on ruut- ja kuupmeetrites. Koordinaadisüsteemiga (GIS › Coordinates) asetatakse fail kaardile: selle algpunkti idakoordinaat ja põhjakoordinaat ning kohaliku (maapinna) süsteemi pööre ja mõõtkava on kaardi teisenduses. Ilma koordinaadisüsteemita salvestab fail oma kohaliku algpunkti omaduste komplekti ega asetu kaardile.

## Import

Ava .ifc-fail {{ui:Ava}} abil või lohista see plaanile. Impordidialoog ütleb, mida fail sisaldab:

- **Joondused** IFC 4.3-st (horisontaalne ja vertikaalne paigutus) ja IFC 4x1 joonduskõverad muutuvad CivilCraft'i joondusteks oma PI-de, raadiuste, spiraalide pikkuste ja PVI-dega. Joondus, mida CivilCraft'i PI-mudel ei mahuta (liitkõverad, kahe kõvera vahelised spiraalid, kõver, mis algab või lõpeb kõveras), ei impordita ning dialoog ütleb, miks.
- **Pinnad**: vali see, mis saab olemasoleva maapinna, või säilita projekti oma.
- **Kõik muu** (ja muud pinnad) saab kuvada 3D-vaates võrdlusena. Võrdlusobjektid jäävad alles, kui projekt on avatud; neid ei salvestata projektifaili.

CivilCraft'i poolt IFC4 või IFC2x3 formaadis kirjutatud fail toob oma joondused tagasi täpselt omaduste komplektidest.

## Veel ehitamata

- Tee ülekallet kirjutatakse üleminekusündmustena ja teepindadesse (kallutus on raudtee jaoks).
- Võrdlusobjektide salvestamine projektifaili ning torustike või platside importimine IFC-st muudetavate objektidena.
