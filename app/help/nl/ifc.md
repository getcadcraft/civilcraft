---
title: IFC-export en -import
summary: Sla het hele project op als één IFC-bestand in IFC 4.3, IFC4 of IFC2x3 (tracés, wegen, grondwerken, terreinen, muren, leidingen), en open IFC-bestanden voor hun tracés en terreinen.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, tracé, ifcalignment, weg, ifcroad, grondwerken, tin, oplevering, aanbesteding, ifc exporteren, ifc importeren
from: 6b998bcf
---

IFC is het open uitwisselingsformaat dat veel publieke opdrachtgevers als oplevering vragen. CivilCraft schrijft het hele project in één IFC-bestand en leest tracés en terreinen weer terug uit IFC-bestanden.

## Exporteren

1. Klik op {{ui:IFC}} in de groep **Exporteren** (in de lintstijlen: {{ui:Uitvoer}} › {{ui:Exporteren}} › {{ui:IFC}}).
2. Kies het schema. **IFC 4.3 ADD2** staat eerst en is de standaard: dat is de versie met tracés, wegen en grondwerken. Kies IFC4 of IFC2x3 alleen wanneer de software van de ontvanger 4.3 niet kan lezen.
3. Het dialoogvenster zegt wat het bestand bevat en wat het gekozen schema weglaat. Klik op {{ui:IFC exporteren}}.
   Het bestand wordt gedownload als "*projectnaam*-ifc4x3.ifc", "-ifc4.ifc" of "-ifc2x3.ifc". CivilCraft onthoudt het schema dat u laatst koos.

## Wat elk schema bevat

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Tracés | IfcAlignment met zijn horizontale (lijnen, cirkelbogen, klothoïdes) en verticale (hellingen, parabolische bochten) layouts, hun krommen (IfcCompositeCurve, IfcGradientCurve), het startstation en de overhogingsgebeurtenissen | Een 3D-polylijn op een civiel element | Een 3D-polylijn op een proxy |
| Corridors | IfcRoad met wegdelen; rijstroken, bermen, goten en trottoirs als IfcPavement, kantstenen als IfcKerb, plantstroken; elke verhardingslaag als IfcCourse met dikte, materiaal en volume; de taluds als IfcEarthworksCut en IfcEarthworksFill met de ontgravings- en ophogingsvolumes; de ontwerpsnelheid en -klasse | Civiele elementen benoemd naar wat ze zijn, per weg gegroepeerd | Proxies, per weg gegroepeerd |
| Terreinen | IfcGeographicElement TERRAIN met een getrianguleerd onregelmatig netwerk | Getrianguleerde vlakverzamelingen | Op vlakken gebaseerde oppervlaktemodellen (grotere bestanden) |
| Platen en muren | De bovenkant van de plaat, de taluds als grondwerken, keerwanden als IfcWall RETAININGWALL | Hetzelfde, de wand als eigen muurtype | Hetzelfde, het type van de wand in ObjectType |
| Leidingnetwerken | IfcPipeSegment en IfcDistributionChamberElement in een IfcDistributionSystem | Hetzelfde | IfcFlowSegment en putten in een IfcSystem |
| Georeferentie | IfcProjectedCRS en IfcMapConversion | Hetzelfde | ePSet_ProjectedCRS en ePSet_MapConversion op de bouwplaats |

Een **spoorweg** (een tracé met Spoorweg aan) gaat in IFC 4.3 als IfcRailway: zijn overgangen als eigen typen (klothoïde, kubieke parabool, Bloss, Helmert, sinus halve golf als cosinuskromme, sinus), zijn kanteling als IfcAlignmentCant, en zijn spoor als rails, dwarsliggers en het ballastbed, met de onderballast eronder. IFC4 en IFC2x3 krijgen dezelfde onderdelen als civiele elementen of proxies. Het openen van een IFC 4.3-spoorweg brengt zijn overgangen en kanteling terug.

Elk bestand bevat ook percelen (voetafdrukken), de beplanting en verharding van de werkomgeving Landschap, en bouwmassa's (elk een IfcBuilding met zijn verdiepingen), allemaal op één bouwplaats. Eigenschapssets bevatten wat u ontwierp: stations, de opbouw, ontgravings- en ophogingstaluds, rijstrookbreedte en aantal, bodempeilen, deksels, muurhoogten; hoeveelheden (lengtes, oppervlakten, volumes) zijn IfcElementQuantity-sets.

## Eenheden en coördinaten

Het bestand is in de lengte-eenheid van het project (meters of Amerikaanse surveyvoet); oppervlakten en volumes zijn in vierkante en kubieke meters. Met een coördinatenstelsel (GIS › Coördinaten) wordt het bestand op de kaart geplaatst: het oorsprongspunt (oostwaarde en noordwaarde) en de rotatie en schaal van een lokaal stelsel staan in de kaartconversie. Zonder stelsel legt het bestand zijn lokale oorsprong vast in een eigenschapsset en wordt het niet op een kaart geplaatst.

## Importeren

Open een .ifc-bestand met {{ui:Openen}} of sleep het op het plan. Het importdialoogvenster zegt wat het bestand bevat:

- **Tracés** uit IFC 4.3 (de horizontale en verticale layouts) en IFC 4x1-trace-krommen worden CivilCraft-tracés met hun PI's, stralen, overgangslengtes en PVI's. Een tracé dat het PI-model van CivilCraft niet kan bevatten (samengestelde bochten, overgangen tussen twee bochten, een tracé dat in een bocht begint of eindigt) wordt niet geïmporteerd, en het dialoogvenster zegt waarom.
- **Terreinen**: kies het terrein dat het bestaande maaiveld wordt, of behoud dat van het project.
- **Al het andere** (en de andere terreinen) kan in de 3D-weergave als referentie worden getoond. Referentie-elementen blijven zolang het project open is; ze worden niet opgeslagen in het projectbestand.

Een bestand dat CivilCraft in IFC4 of IFC2x3 schreef, brengt zijn tracés precies terug uit hun eigenschapssets.

## Nog niet beschikbaar

- De overhoging van een weg wordt geschreven als overhogingsgebeurtenissen en in de wegoppervlakken (kanteling geldt voor spoorwegen).
- Het opslaan van referentie-elementen in het projectbestand, en het importeren van leidingnetwerken of platen uit IFC als bewerkbare objecten.
