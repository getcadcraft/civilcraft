---
title: Lêers wat jy kan oopmaak, stoor en uitvoer
summary: Puntlêers, LandXML en CivilCraft-projekte invoer; projekte, LandXML, DXF en PDF uitvoer; wat elke lêer hou, waar die lêers heen gaan, en wat met vanlyn-gebruik verander.
keywords: oopmaak, stoor, uitvoer, invoer, lêerformate, csv, txt, landxml, xml, dxf, pdf, json, aflaai, projeklêer
from: 82bff559
---

CivilCraft maak lêers op van jou rekenaar en stoor deur lêers terug na jou rekenaar af te laai. Niks word opgelaai nie en niks word op 'n bediener gehou nie. Sien ook [Jou lêers](common:your-files).

## Wat dit oopmaak

Klik {{ui:Maak oop}} (of druk {{key:Mod+O}}) en kies 'n lêer, of sleep die lêer vanaf {{pick:mac=Finder|windows=Lêerverkenner|linux=jou lêerbestuurder}} op die plan. Een lêer op 'n slag; lêers groter as 200 MB word geweier. 'n LandXML- of projeklêer groter as 32 MB word in stukke van ongeveer 4 MB gelees, nooit as een blok teks nie. Terwyl 'n LandXML oopmaak, verwag dat dit ongeveer 13 keer die lêer se grootte in geheue gebruik ('n 69 MB-lêer het ongeveer 0,9 GB in ons toets gebruik).

| Soort | Lêernaam | Wat gebeur |
|---|---|---|
| Puntlêer | `.csv`, `.txt`, `.pnt`, `.xyz` (enige tekslêer) | Die dialoog **Voer punte in** maak oop. Die punte vervang die projek se punte; belynings, plakke en pype bly. |
| LandXML | `.xml`, `.landxml` | 'n **nuwe projek** word uit die lêer gemaak (jy word eers gevra as die huidige projek ongestoorde veranderinge het). |
| CivilCraft-projek | `.civilcraft.json` (enige `.json`) | Die projek maak oop soos dit gestoor is (jy word eers gevra as die huidige projek ongestoorde veranderinge het). |

CivilCraft besluit volgens die lêer se eindpunt, en dan volgens sy eerste karakters: teks wat met `{` begin, word as 'n projek gelees, teks wat met `<` begin as LandXML, en enigiets anders as 'n puntlêer. 'n Lêer wat die oopboks grys maak, kan steeds op die plan gesleep word.

:::note
Die invoer van 'n puntlêer in 'n projek wat reeds punte het, vervang hulle sonder om te vra, en dit maak die ontdoen-geskiedenis leeg (om enige lêer oop te maak, begin ontdoen vars). As die oppervlak uit LandXML gekom het, skakel die invoer van punte dit terug na 'n oppervlak wat uit die punte gebou is. Stoor eers as jy dalk die ou punte weer wil hê.
:::

Besonderhede: [Puntlêerformate](topic:point-file-formats), [LandXML: wat gelees en geskryf word](topic:landxml-reference).

## Wat dit stoor

{{ui:Stoor}} ({{key:Mod+S}}) skryf twee lêers langs mekaar, genoem na **Naam** in die linkerpaneel: `<naam>.civilcraft.json`, die projek waarin jy aanhou wysig, en `<naam>.ifc`, dieselfde ontwerp as IFC 4.3 vir almal anders (sien [IFC-uitvoer en -invoer](topic:ifc)). Elke lêer verwys na die ander, en die IFC dra ook 'n saamgeperste kopie van die projek, sodat 'n IFC wat alleen gestuur word, steeds volledig wysigbaar oopmaak.

- **In Studio** word albei lêers langs mekaar, op dieselfde plek, geskryf.
- **In Chrome en Edge** vra die eerste stoor vir 'n vouer en skryf albei daarin; latere stoor gaan na dieselfde vouer. Kanselleer die vouervraag om albei eerder af te laai.
- **In ander blaaiers** word albei lêers afgelaai, die projeklêer eerste.

Om enige van die twee lêers oop te maak, soek vir die ander. Maak albei saam oop (of sleep albei), of maak een oop: in Studio word die ander in dieselfde vouer gevind; in 'n blaaier vra CivilCraft jou om dit by te voeg, of om met die een wat jy het voort te gaan. As die IFC ná CivilCraft se stoor deur 'n ander program verander is, of een lêer ouer as die ander is, maak die projek oop uit die nuwer ontwerp en die **Probleme**-paneel sê wat gebeur het, met **Stoor nou** (skryf albei lêers weer) en **Wys die IFC se geometrie as verwysing**. 'n IFC op sy eie wat 'n ander program verander het, maak oop uit sy kopie van die projek met wat steeds pas: belynings wat verander is, neem sy geometrie; voorwerpe wat verwyder is, word weggelaat; en die res van die veranderinge word gelys, nie geneem nie. 'n Projeklêer van voor 0.7.1 maak soos vantevore oop.

Die projeklêer hou:

- elke punt (nommer, koördinate, hoogte, beskrywing) en die naam van die puntlêer waaruit hulle gekom het
- die oppervlakinstellings: groepkeuses, getekende breeklyne, die grens, die langste buitenste rand, en 'n TIN wat uit LandXML gelees is
- die vertoninginstellings
- belynings met hul PIs, radiusse en beginstasie, hul ontwerpprofiele (PVIs en boglengtes) en korridorinstellings
- plakke en die pypnetwerk met sy reëls

Dit hou nie die ontdoen-geskiedenis nie. Oppervlakke, kontoere, daglig-lyne en volumes word nie gestoor nie; hulle word weer gebou uit die gestoorde insette wanneer die projek oopmaak. 'n Projeklêer van 'n nuwer CivilCraft word geweier met 'n boodskap wat sy weergawe noem.

## Wat dit uitvoer

| Knoppie | Lêer | Inhoud |
|---|---|---|
| {{ui:LandXML}} | `<naam>.xml` | LandXML 1.2: punte, die bestaande grond (en die gelykgemaakte oppervlak wanneer daar een is) as TIN-oppervlakke, belynings, grond- en ontwerpprofiele, die pypnetwerk |
| {{ui:DXF}} | `<naam>.dxf` | R12 DXF van die plan se lynwerk soos dit vertoon word, op benoemde lae |
| {{ui:DWG}} | `<naam>.dwg` | Dieselfde lynwerk as 'n DWG-tekening, in die formaat wat jy kies (2000 tot 2018) |
| {{ui:PDF}} | `<naam>.pdf` | 'n Vektorplot van die plan op 'n blad, op 'n skaal wat jy kies |
| {{ui:GLB}} of {{ui:OBJ}} (op die 3D-aansig se balk) | `<naam>-3d.glb`, `<naam>-3d.obj` | Wat die 3D-aansig as 3D-model wys: meter, Y op, ware skaal, rondom 'n opgeteekende plaaslike oorsprong |

Wat elkeen weglaat: [LandXML-uitruil](topic:landxml), [Voer die plan na DXF uit](topic:dxf-export) (DWG ook), [Druk die plan na PDF](topic:plot-pdf), [Voer die terrein in 3D uit](topic:export-3d).

## Waar die lêers heen gaan

Gestoorde en uitgevoerde lêers gaan waarheen jou blaaier aflaaie plaas, gewoonlik die Aflaaie-vouer. Om elke keer 'n vouer te kies:

:::chromium
Maak die blaaier se **Instellings** oop, dan **Aflaaie**, en skakel **Vra waar om elke lêer te stoor voordat dit afgelaai word** aan.
:::

:::firefox
Maak **Instellings** oop, dan **Algemeen**, en kies onder **Lêers en programme** die opsie **Vra my altyd waar lêers gestoor moet word**.
:::

:::safari
Maak **Safari > Instellings > Algemeen** oop en stel **Aflaailokasie** op **Vra vir elke aflaai**.
:::

As jy twee keer met dieselfde naam stoor, kan die blaaier 'n nommer by die tweede lêer voeg, byvoorbeeld `Terrein (1).civilcraft.json`. Maak die nuutste een die volgende keer oop.

## Aanlyn en vanlyn

CivilCraft werk net op jou rekenaar, in albei gevalle: oopmaak lees die lêer in die blaaier, stoor laai dit af. Om CivilCraft sonder enige verbinding oop te maak, stoor dit eers vir vanlyn-gebruik:

1. Terwyl jy aanlyn is, klik {{ui:Stoor vir vanlyn}} in die programbalk bo.
2. Die knoppie tel op ("Stoor 12 van 30") en wys dan {{ui:Vanlyn gereed}}. CivilCraft is klein (ongeveer 0,6 MB), dus neem dit 'n oomblik. Die gestoorde kopie sluit hierdie hulp en die voorbeeldterrein in.
3. Sonder verbinding, maak dieselfde adres oop (of 'n boekmerk daarvan). Alles werk, insluitend {{ui:Maak die voorbeeldterrein oop}}.

Die knoppie se ander toestande:

- {{ui:Kon nie stoor nie}}: sommige lêers is nie afgelaai nie. Kontroleer die verbinding en klik dit om weer te probeer.
- {{ui:Vanlyn nie beskikbaar nie}}: hierdie blaaiervenster kan nie 'n vanlyn-kopie hou nie (privaatvensters en sommige bestuurde rekenaars blokkeer dit). Gebruik 'n normale venster.

Klik {{ui:Vanlyn gereed}} om te sien wanneer die kopie gestoor is, met twee keuses: {{ui:Stoor weer (kry die nuutste weergawe)}} en {{ui:Verwyder die vanlyn-kopie}}. Stoor weer voor 'n terreinbesoek sodat die kopie by die nuutste bou pas. Meer in [Vanlyn](common:offline).

:::offline
Jy is nou vanlyn. As CivilCraft vir vanlyn-gebruik gestoor is, werk alles, insluitend die voorbeeldterrein. As nie, hou aan werk in hierdie blad, maar moenie dit herlaai voordat jy weer aanlyn is nie; sonder 'n gestoorde kopie misluk {{ui:Maak die voorbeeldterrein oop}} met "Die voorbeeld kon nie gelaai word nie".
:::

:::tip
Vir veldgebruik, stoor CivilCraft vir vanlyn-gebruik en bring jou puntlêers op die skootrekenaar self. Projekte en uitvoere stoor as aflaaie sonder verbinding, so jy kan 'n dag se meetings invoer, die oppervlak nagaan en die projek op die terrein stoor.
:::

Wolkstoor is nog nie beskikbaar nie, en rekenaarweergawes is nog nie uit nie. Vandag is die lêers wat jy stoor die enigste kopie: hou dit op 'n plek wat rugsteun het.

## Byvoegings wat 'n lêer gebruik

Wanneer jy 'n projek stoor wat data van 'n byvoeging bevat (die Bouregulasies-kruisies, of 'n Adres-na-terrein-bron), onthou die lêer watter byvoegings en watter weergawes. Maak dit oop op 'n rekenaar wat een mis, en 'n balk bo die plan sê dit en bied aan om dit uit jou rekening se lys by te voeg. Die rekord is net 'n nota: die lêer maak in elk geval oop.

## Ontdoen vanuit Studio

Binne CadCraft Studio word elke stap wat jy in CivilCraft afhandel aan Studio vertel, sodat sy ontdoen op projekvlak die laaste stap oor programme heen kan terugneem. Studio ontdoen 'n stap slegs wanneer CivilCraft se eie ontdoen-stapel presies is soos daardie stap dit gelaat het; nadat jy 'n ander lêer oopmaak, slaan dit hierdie venster oor.

## Sluit met ongestoorde veranderinge

Wanneer die projek ongestoorde veranderinge het en jy die oortjie sluit, herlaai, of die bladsy verlaat, vra die blaaier of jy wil weggaan. Die woorde en voorkoms daarvan behoort aan die blaaier en kan nie deur CivilCraft verander word nie. {{ui:Nuut}}, en oopmaak van 'n projek- of LandXML-lêer, vra in plaas daarvan in CivilCraft se eie **Ongestoorde veranderinge**-boks, met {{ui:Kanselleer}}, {{ui:Moenie stoor nie}} en {{ui:Stoor 'n kopie}}.
