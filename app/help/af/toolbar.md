---
title: Verwysing na die nutsbalk
summary: Elke nutsbalkknoppie in CivilCraft, wat dit doen, sy sleutel, en wanneer dit grys is of weier.
keywords: nutsbalk, knoppies, opdragte, gereedskap, lêer, uitvoer, oppervlak, ontwerp, wysig, aansig, kieslys
from: 4c4352bc
---

Die nutsbalk loop bo-oor die program in sewe groepe. Elke knoppie wys sy oplosteks en sleutel wanneer jy oor dit hou.

## Lêer

| Knoppie | Sleutel | Wat dit doen |
|---|---|---|
| {{ui:Nuut}} | geen | Begin 'n leë projek. Vra eers as daar ongestoorde veranderinge is. |
| {{ui:Maak oop}} | {{key:Mod+O}} | Maak 'n puntlêer (CSV, TXT), LandXML of 'n CivilCraft-projek oop. |
| {{ui:Stoor}} | {{key:Mod+S}} | Laai die projek af as `<naam>.civilcraft.json`. |

## Uitvoer

| Knoppie | Sleutel | Wat dit doen |
|---|---|---|
| {{ui:LandXML}} | geen | Laai `<naam>.xml` af: punte, oppervlaktes, belynings, lengteprofiele en die pypnetwerk as LandXML 1.2. "Niks om nog uit te voer nie." wanneer die projek leeg is. |
| {{ui:DXF}} | geen | Laai `<naam>.dxf` af: die plan-lynwerk as R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Maak **Plot die plan na PDF** oop. "Niks om nog te plot nie." wanneer die projek leeg is. |

## Oppervlak

| Knoppie | Sleutel | Wat dit doen |
|---|---|---|
| {{ui:Breeklyn}} | {{key:B}} | Klik opmetingspunte in volgorde, {{key:Enter}} om klaar te maak. Die breeklyn neem die punte se hoogtes. |
| {{ui:Grens}} | {{key:O}} | Klik die hoeke van die buitenste grens, {{key:Enter}} om klaar te maak. Vervang enige grens. |

Albei sê "Daar is nog geen oppervlak nie: maak eers opmetingspunte oop." wanneer daar geen oppervlak is nie.

## Ontwerp

| Knoppie | Sleutel | Wat dit doen |
|---|---|---|
| {{ui:Belyning}} | {{key:A}} | Klik die PI's in volgorde, {{key:Enter}} om klaar te maak. |
| {{ui:Plataform}} | {{key:G}} | Klik die plataform se hoeke, {{key:Enter}} om klaar te maak. Soos die oppervlakgereedskap waarsku dit wanneer daar geen oppervlak is nie; 'n plataform gradeer net op een. |
| {{ui:Pype}} | {{key:P}} | Klik strukture van bo-af na onder (klik 'n bestaande een om daarby aan te sluit), {{key:Enter}} om klaar te maak. |
| {{ui:Lengteprofiel}} | {{key:R}} | Wys of verberg die profielaansig onder die plan. |

## Wysig

| Knoppie | Sleutel | Wat dit doen |
|---|---|---|
| {{ui:Ontdoen}} | {{key:Mod+Z}} | Ontdoen die laaste verandering (tot 200). Grys wanneer daar niks is om te ontdoen nie. |
| {{ui:Herdoen}} | {{key:Mod+Y}} | Herdoen wat ontdoen is. Grys wanneer daar niks is om te herdoen nie. |
| {{ui:Kopieer}} | {{key:Mod+C}} | Kopieer die gekose opmetingspunte, en sit hulle op die knipbord as puntrye wat 'n sigblad kan neem. Grys tot punte gekies is. |
| {{ui:Plak}} | {{key:Mod+V}} | Plak punte: hulle volg die aanwyser, en 'n klik sit hulle neer met nommers wat geen ander punt het nie. Puntrye wat in 'n sigblad gekopieer is, plak ook. |
| {{ui:Meer}} | geen | Maak die kieslys hieronder oop. |

Die {{ui:Meer}}-kieslys:

| Item | Sleutel | Wat dit doen |
|---|---|---|
| {{ui:Sny}} | {{key:Mod+X}} | Kopieer die gekose punte en skrap hulle (een ontdoen-stap). |
| {{ui:Kopieer}} | {{key:Mod+C}} | Soos die {{ui:Kopieer}}-knoppie. |
| {{ui:Plak}} | {{key:Mod+V}} | Soos die {{ui:Plak}}-knoppie. |
| {{ui:Plak op dieselfde plek}} | {{key:Mod+Shift+V}} | Plak die punte op hulle eie koördinate, met nommers wat geen ander punt het nie. |
| {{ui:Dupliseer}} | {{key:Mod+D}} | 'n Kopie van die gekose punte volg die aanwyser; klik waar dit moet gaan. Die knipbord bly onaangeroer. |
| {{ui:Skrap}} | {{key:Delete}} | Skrap die gekose opmetingspunte, of die gekose belyning, plataform, struktuur (met sy pype), pyp of PVI. |
| {{ui:Kies alle punte}} | {{key:Mod+A}} | Kies elke opmetingspunt. |
| {{ui:Kies niks}} | {{key:Esc}} | Maak die keuse skoon. |

'n Item wat nou nie kan optree nie, is grys, en sy oplosteks sê waarom. Besonderhede: [Kies, kopieer en plak opmetingspunte](topic:copy-paste-points).

Ontdoen dek veranderinge aan die ontwerp, die oppervlakinstellings en die opmetingspunte (plak, sny, dupliseer, skrap). Dit dek nie vertoninginstellings nie, en om enige lêer oop te maak of in te voer, maak dit skoon.

## GIS

| Knoppie | Sleutel | Wat dit doen |
|---|---|---|
| {{ui:Koördinate}} | geen | Maak die **Koördinaatstelsel**-dialoog oop: sê in watter stelsel die projek is, of gebruik grond- of plaaslike koördinate. Sien [Stel die projek se koördinaatstelsel](topic:coordinate-systems) en [Grond- en plaaslike koördinate](topic:ground-and-local-coordinates). |
| {{ui:Voer in}} | geen | Voer GIS-data in: shapefiles, GeoJSON, GeoPackage, hoogterosters en LiDAR. Sien [Voer GIS-data in](topic:gis-import). |
| {{ui:Uitvoer}} | geen | Voer ingemete data uit vir 'n GIS-departement. Sien [Voer ingemete data uit vir GIS](topic:gis-export). |
| {{ui:Analiseer}} | geen | Maak die GIS-analisepaneel oop: buffer, oorlegging, ruimtelike koppeling, kies volgens kenmerk, meet. Sien [Analiseer GIS-lae](topic:gis-analysis). |
| {{ui:Eienskapstabel}} | geen | In Oppervlak › Meer. Maak die eienskapstabel van 'n GIS-laag oop: sorteer, filtreer, kies, wysig, voeg velde by, bereken, stoor as CSV. Sien [Werk met 'n laag se eienskapstabel](topic:gis-table). |
| {{ui:Kaart}} | geen | Maak die **Kaartlae**-dialoog oop: 'n georefereerde prent, of kaartbedieners wat jy byvoeg, onder die plan geteken. Sien [Wys kaartlae onder die plan](topic:map-layers). |

Die GIS-gereedskap laai die eerste keer wat jy een van hierdie knoppies gebruik, 'n GIS-lêer oopmaak, of 'n projek oopmaak wat 'n koördinaatstelsel of GIS-lae het.

## Aansig

| Knoppie | Sleutel | Wat dit doen |
|---|---|---|
| {{ui:Kies}} | {{key:V}} of {{key:Esc}} | Klik om belynings, plataforms, strukture, pype en punte te kies ({{key:Shift}} en 'n klik of 'n sleep voeg punte by); sleep handvatsels om PI's, plataformhoeke en strukture te skuif. |
| {{ui:Pas aan}} | {{key:F}} | Zoem die plan in om die oppervlak, punte, belynings en plataforms te wys (in die 3D-aansig: wys alles). |
| {{ui:3D}} | {{key:D}} | Wys die terrein in 3D oor die plan, of gaan terug na die plan. Die balk oor die 3D-aansig stel die aansig, oordrywing, kleuring en wat wys, en voer GLB of OBJ uit. Sien [Bekyk die terrein in 3D](topic:site-3d). |

## Knoppies in die paneel

| Knoppie | Waar | Wat dit doen |
|---|---|---|
| {{ui:Maak die voorbeeldterrein oop}} | Die kassie op 'n leë plan | Laai die voorbeeldopmeting (benodig 'n verbinding, tensy CivilCraft vir aflyn gebruik gestoor is) |
| {{ui:Verwyder die grens}} | Linker paneel, Oppervlak | Haal die buitenste grens weg |
| {{ui:Verwyder getekende breeklyne}} | Linker paneel, Oppervlak | Verwyder elke breeklyn wat met die gereedskap geteken is (nie die breeklyngroepe nie) |
| {{ui:Bou die oppervlak weer uit die punte}} | Linker paneel, Oppervlak (net LandXML-oppervlak) | Laat die LandXML TIN val en bou uit die punte; kan nie ontdoen word nie |
| {{ui:Begin vanaf die grond}} | Regter paneel, Belyning | Begin 'n ontwerpprofiel met 'n PVI op die grond aan elke kant |
| {{ui:Profielaansig}} | Regter paneel, Belyning | Maak die profielaansig vir hierdie belyning oop |
| {{ui:Voeg PVI's by}} | Profielbalk | Terwyl dit ingedruk is, voeg 'n klik in die profiel 'n PVI by |
| {{ui:Stel elke binnepeil volgens die reëls}} | Regter paneel, Pypnetwerk | Stel elke pyp se binnepeile volgens die reëls |
| {{ui:Stel sy binnepeile volgens die reëls}} | Regter paneel, Pyp | Stel hierdie pyp se binnepeile volgens die reëls |
