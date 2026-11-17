---
title: IFC-vienti ja -tuonti
summary: Tallenna koko projekti yhdeksi IFC-tiedostoksi IFC 4.3-, IFC4- tai IFC2x3-muodossa (linjaukset, tiet, maanrakennus, pinnat, seinät, putket) ja avaa IFC-tiedostoja niiden linjauksia ja pintoja varten.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, linjaus, ifcalignment, tie, ifcroad, maanrakennus, TIN, toimitettava, hankinta, vie ifc, tuo ifc
from: 6b998bcf
---

IFC on avoin vaihtomuoto, jota monet julkiset tilaajat pyytävät toimitettavaksi. CivilCraft kirjoittaa koko projektin yhteen IFC-tiedostoon ja lukee linjaukset ja pinnat takaisin IFC-tiedostoista.

## Vienti

1. Napsauta {{ui:IFC}} **Vie**-ryhmästä (valintanauhan tyyleissä: {{ui:Tuloste}} › {{ui:Vie}} › {{ui:IFC}}).
2. Valitse skeema. **IFC 4.3 ADD2** on ensimmäinen ja oletus: se on painos, jossa ovat linjaukset, tiet ja maanrakennus. Valitse IFC4 tai IFC2x3 vain silloin, kun vastaanottajan ohjelmisto ei lue 4.3-muotoa.
3. Ikkuna kertoo, mitä tiedosto sisältää ja mitä valittu skeema jättää pois. Napsauta {{ui:Vie IFC}}.
   Tiedosto ladataan nimellä "*projektin nimi*-ifc4x3.ifc", "-ifc4.ifc" tai "-ifc2x3.ifc". CivilCraft muistaa viimeksi valitsemasi skeeman.

## Mitä kukin skeema sisältää

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Linjaukset | IfcAlignment, jossa vaakasuuntainen (suorat, ympyräkaaret, klotoidi-siirtymäkaaret) ja pystysuuntainen (kaltevuudet, paraboliset kaaret) asettelu, niiden käyrät (IfcCompositeCurve, IfcGradientCurve), alkupaalu ja kallistuksen tapahtumat | Kolmiulotteinen murtoviiva siviilielementillä | Kolmiulotteinen murtoviiva proxy-elementillä |
| Käytävät | IfcRoad tieosineen; kaistat, pientareet, sadevesiojat ja jalkakäytävät IfcPavement-elementteinä, reunakivet IfcKerb-elementteinä, istutuskaistat; jokainen päällysteen kerros IfcCourse-elementtinä paksuutensa, materiaalinsa ja tilavuutensa kanssa; sivuluiskat IfcEarthworksCut- ja IfcEarthworksFill-elementteinä leikkaus- ja pengertilavuuksineen; suunnittelunopeus ja luokka | Siviilielementit nimettyinä sen mukaan, mitä ne ovat, ryhmiteltyinä tieittäin | Proxy-elementit, ryhmiteltyinä tieittäin |
| Pinnat | IfcGeographicElement TERRAIN kolmioidulla epäsäännöllisellä verkolla | Kolmioidut pintajoukot | Pintapohjaiset pintamallit (suuremmat tiedostot) |
| Alustat ja seinät | Alustan yläpinta, sen luiskat maanrakennuksena, tukimuurit IfcWall RETAININGWALL -elementteinä | Sama, seinä käyttäjän määrittämänä seinätyyppinä | Sama, seinän tyyppi kentässä ObjectType |
| Putkiverkot | IfcPipeSegment ja IfcDistributionChamberElement järjestelmässä IfcDistributionSystem | Sama | IfcFlowSegment ja kaivot IfcSystem-järjestelmässä |
| Georeferointi | IfcProjectedCRS ja IfcMapConversion | Sama | ePSet_ProjectedCRS ja ePSet_MapConversion tontilla |

**Rata** (linjaus, jossa Rata on päällä) menee IFC 4.3 -muotoon IfcRailway-elementtinä: sen siirtymät omina tyyppeinään (klotoidi, kuutioparabeli, Bloss, Helmert, siniaalto kosinikäyränä, sini), sen kallistus IfcAlignmentCant-elementtinä ja sen rata kiskoina, pölkkyinä ja ballastipenkkana, jonka alla on alaballasti. IFC4 ja IFC2x3 saavat samat osat siviilielementteinä tai proxy-elementteinä. Avattaessa IFC 4.3 -rata siirtymät ja kallistus palautuvat.

Jokainen tiedosto sisältää myös tontit (rajaukset), Maisematyötilan kasvit ja päällystykset sekä rakennusmassat (kukin IfcBuilding-elementtinä kerroksineen), kaikki yhdellä tontilla. Ominaisuusjoukot kantavat suunnittelemasi asiat: paalut, poikkileikkauksen, leikkaus- ja pengerluiskat, kaistan leveyden ja määrän, pohjan korkeudet, kaivojen reunat ja seinien korkeudet. Määrät (pituudet, alat, tilavuudet) ovat IfcElementQuantity-joukkoja.

## Yksiköt ja koordinaatit

Tiedosto on projektin pituusyksikössä (metriä tai US-mittakaavan jalkoja); alat ja tilavuudet ovat neliö- ja kuutiometreinä. Kun koordinaatisto on asetettu (GIS › Koordinaatit), tiedosto sijoitetaan kartalle: sen origon itä- ja pohjoiskoordinaatit sekä paikallisen (maan) järjestelmän kierto ja mittakaava ovat karttamuunnoksessa. Ilman koordinaatistoa tiedosto tallentaa paikallisen origonsa ominaisuusjoukkoon eikä sijoitu kartalle.

## Tuonti

Avaa .ifc-tiedosto {{ui:Avaa}}-painikkeella tai pudota se suunnitelmalle. Tuontiikkuna kertoo, mitä tiedosto sisältää:

- **Linjaukset** IFC 4.3 -muodosta (vaaka- ja pystysuuntainen asettelu) ja IFC 4x1 -linjauskäyrät tulevat CivilCraft-linjauksiksi PI-pisteineen, säteineen, siirtymäkaarien pituuksineen ja PVI-pisteineen. Linjaus, jota CivilCraftin PI-malli ei pysty pitämään (yhdistetyt kaaret, siirtymät kahden kaaren välillä, linjaus, joka alkaa tai päättyy kaarelle), ei tuoda, ja ikkuna kertoo syyn.
- **Pinnat**: valitse, josta tulee nykyinen maanpinta, tai säilytä projektin oma.
- **Kaikki muu** (ja muut pinnat) voidaan näyttää 3D-näkymässä vertailuna. Vertailuelementit pysyvät auki olevan projektin ajan; niitä ei tallenneta projektitiedostoon.

Tiedosto, jonka CivilCraft kirjoitti IFC4- tai IFC2x3-muodossa, tuo linjauksensa takaisin tarkasti niiden ominaisuusjoukoista.

## Ei vielä toteutettu

- Tien kallistus kirjoitetaan kallistuksen tapahtumina ja tien pintoihin (kallistus koskee rautateitä).
- Vertailuelementtien tallennus projektitiedostoon sekä putkiverkkojen tai alustojen tuonti IFC:stä muokattavina kohteina.
