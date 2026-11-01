---
title: Lêers wat jy kan oopmaak, stoor en uitvoer
summary: Puntlêers, LandXML en CivilCraft-projekte in; projekte, LandXML, DXF en PDF uit; wat elk hou, waarheen die lêers gaan, en wat verander sonder aanlyn-verbinding.
keywords: oopmaak, stoor, uitvoer, invoer, lêerformate, csv, txt, landxml, xml, dxf, pdf, json, aflaai, projeklêer
from: a7debb61
---

CivilCraft maak lêers oop van jou rekenaar en stoor deur lêers terug na jou rekenaar af te laai. Niks word opgelaai nie en niks word op 'n bediener gehou nie. Sien ook [Jou lêers](common:your-files).

## Wat dit oopmaak

Klik op {{ui:Maak oop}} (of druk {{key:Mod+O}}) en kies 'n lêer, of sleep die lêer vanaf {{pick:mac=Finder|windows=File Explorer|linux=jou lêerbestuurder}} na die plan. Een lêer op 'n slag; lêers groter as 200 MB word geweier.

| Soort | Lêernaam | Wat gebeur |
|---|---|---|
| Puntlêer | `.csv`, `.txt`, `.pnt`, `.xyz` (enige tekslêer) | Die dialoog **Punte invoer** maak oop. Die punte vervang die projek se punte; belynings, plataforms en pype bly. |
| LandXML | `.xml`, `.landxml` | 'n **nuwe projek** word uit die lêer gemaak (jy word eers gevra as die huidige een nie-gestoorde veranderinge het). |
| CivilCraft-projek | `.civilcraft.json` (enige `.json`) | Die projek maak oop soos dit gestoor is (jy word eers gevra as die huidige een nie-gestoorde veranderinge het). |

CivilCraft besluit volgens die lêer se einde, en dan volgens sy eerste karakters: teks wat met `{` begin, word as 'n projek gelees, teks wat met `<` begin as LandXML, en enigiets anders as 'n puntlêer. 'n Lêer wat die oopkassie grys maak, kan steeds op die plan gelaat word.

:::note
Die invoer van 'n puntlêer in 'n projek wat alreeds punte het, vervang hulle sonder om te vra, en dit maak die ontdoen-geskiedenis skoon (om enige lêer oop te maak is 'n nuwe begin vir ontdoen). As die oppervlak van LandXML gekom het, skakel die invoer van punte dit terug na 'n oppervlak wat uit die punte gebou is. Stoor eers as jy dalk die ou punte weer wil hê.
:::

Besonderhede: [Puntlêerformate](topic:point-file-formats), [LandXML: wat gelees en geskryf word](topic:landxml-reference).

## Wat dit stoor

{{ui:Stoor}} ({{key:Mod+S}}) skryf twee lêers langs mekaar, genoem na **Naam** in die linkerpaneel: `<naam>.civilcraft.json`, die projek waarop jy voortgaan om te wysig, en `<naam>.ifc`, dieselfde ontwerp as IFC 4.3 vir almal anders (sien [IFC-uitvoer en -invoer](topic:ifc)). Elke lêer verwys na die ander, en die IFC dra ook 'n saamgeperste kopie van die projek, sodat 'n IFC wat alleen gestuur word, steeds volledig redigeerbaar oopmaak.

- **In Studio** word albei lêers langs mekaar, op dieselfde plek, geskryf.
- **In Chrome en Edge** vra die eerste stoor vir 'n vouer en skryf albei daarin; latere stoorings gaan na dieselfde vouer. Kanselleer die vraag oor die vouer om albei eerder af te laai.
- **In ander blaaiers** word albei lêers afgelaai, die projeklêer eerste.

Om enige lêer oop te maak, soek na die ander. Maak albei saam oop (of sleep albei), of maak een oop: in Studio word die ander in dieselfde vouer gevind; in 'n blaaier vra CivilCraft jou om dit by te voeg, of om met die een wat jy het voort te gaan. As die IFC deur 'n ander program verander is nadat CivilCraft dit gestoor het, of een lêer ouer as die ander is, word die projek oopgemaak uit die nuwer ontwerp, en die Probleme-paneel sê wat gebeur het, met **Stoor nou** (skryf albei lêers weer) en **Wys die IFC se geometrie as verwysing**. 'n IFC op sy eie wat 'n ander program verander het, maak oop uit sy kopie van die projek met wat steeds pas: belynings wat dit verander het, neem sy geometrie, voorwerpe wat dit verwyder het, word weggelaat, en die res van sy veranderinge word gelys, nie toegepas nie. 'n Projeklêer van voor 0.7.1 maak oop soos vantevore.

Die projeklêer hou:

- elke punt (nommer, koördinate, hoogte, beskrywing) en die naam van die puntlêer waarvandaan hulle gekom het
- die oppervlakinstellings: groepkeuses, geteekende breeklyne, die grens, die langste buitenste rand, en 'n TIN wat uit LandXML gelees is
- die vertoninstellings
- belynings met hul PI's, radiusse en beginstasie, hul ontwerplengteprofiele (PVI's en kromlengtes) en koridorinstellings
- plataforms en die pypnetwerk met sy reëls

Dit hou nie die ontdoen-geskiedenis nie. Oppervlaktes, kontoerlyne, daglig-lyne en volumes word nie gestoor nie; hulle word weer gebou uit die gestoorde insette wanneer die projek oopmaak. 'n Projeklêer van 'n nuwer CivilCraft word geweier, met 'n boodskap wat sy weergawe noem.

## Wat dit uitvoer

| Knoppie | Lêer | Inhoud |
|---|---|---|
| {{ui:LandXML}} | `<naam>.xml` | LandXML 1.2: punte, die bestaande grond (en die gegradeerde oppervlak wanneer daar een is) as TIN-oppervlaktes, belynings, grond- en ontwerplengteprofiele, die pypnetwerk |
| {{ui:DXF}} | `<naam>.dxf` | R12 DXF van die planlynwerk soos dit vertoon word, op benoemde lae |
| {{ui:DWG}} | `<naam>.dwg` | Dieselfde lynwerk as 'n DWG-tekening, in die formaat wat jy kies (2000 tot 2018) |
| {{ui:PDF}} | `<naam>.pdf` | 'n Vektorplot van die plan op 'n blad, teen 'n skaal wat jy kies |
| {{ui:GLB}} of {{ui:OBJ}} (op die 3D-aansig se balk) | `<naam>-3d.glb`, `<naam>-3d.obj` | Wat die 3D-aansig as 'n 3D-model wys: meter, Y na bo, ware skaal, rondom 'n opgetekende plaaslike oorsprong |

Wat elk een weglaat: [Uitruil-LandXML](topic:landxml), [Voer die plan na DXF uit](topic:dxf-export) (DWG ook), [Plot die plan na PDF](topic:plot-pdf), [Voer die terrein in 3D uit](topic:export-3d).

## Waarheen die lêers gaan

Gestoorde en uitgevoerde lêers gaan waar jou blaaier aflaaie plaas, gewoonlik die Aflaaie-vouer. Om elke keer 'n vouer te kies:

:::chromium
Maak die blaaier se **Instellings** oop, dan **Aflaaie**, en skakel **Vra waar elke lêer gestoor word voordat dit afgelaai word** aan.
:::

:::firefox
Maak **Instellings** oop, dan **Algemeen**, en kies onder **Lêers en programme** **Vra altyd waar lêers gestoor moet word**.
:::

:::safari
Maak **Safari > Instellings > Algemeen** oop en stel **Aflaailokasie vir lêers** op **Vra vir elke aflaai**.
:::

As jy twee keer met dieselfde naam stoor, voeg die blaaier dalk 'n nommer by die tweede lêer, byvoorbeeld `Terrein (1).civilcraft.json`. Maak die nuutste een die volgende keer oop.

## Aanlyn en vanlyn

CivilCraft werk altyd net op jou rekenaar: oopmaak lees die lêer in die blaaier, stoor laai dit af. Om CivilCraft sonder enige verbinding oop te maak, stoor dit eers vir gebruik vanlyn:

1. Terwyl jy aanlyn is, klik op {{ui:Stoor vir vanlyn}} in die programbalk bo.
2. Die knoppie tel op ("Stoor 12 van 30") en wys dan {{ui:Vanlyn gereed}}. CivilCraft is klein (ongeveer 0.6 MB), so dit neem 'n oomblik. Die gestoorde kopie sluit hierdie hulp en die voorbeeldterrein in.
3. Sonder verbinding, maak dieselfde adres oop (of 'n boekmerk daarvan). Alles werk, insluitend {{ui:Maak die voorbeeldterrein oop}}.

Die knoppie se ander toestande:

- {{ui:Kon nie stoor nie}}: sommige lêers is nie afgelaai nie. Kontroleer die verbinding en klik daarop om weer te probeer.
- {{ui:Vanlyn nie beskikbaar nie}}: hierdie blaaiervenster kan nie 'n vanlynkopie hou nie (privaatvensters en sommige bestuurde rekenaars blokkeer dit). Gebruik 'n normale venster.

Klik op {{ui:Vanlyn gereed}} om te sien wanneer die kopie gestoor is, met twee keuses: {{ui:Stoor weer (kry die nuutste weergawe)}} en {{ui:Verwyder die vanlyn-kopie}}. Stoor weer voor 'n terreinbesoek sodat die kopie by die nuutste bou pas. Meer in [Vanlyn](common:offline).

:::offline
Jy is nou vanlyn. As CivilCraft vir vanlyn gebruik gestoor is, werk alles, insluitend die voorbeeldterrein. As nie, hou aan om in hierdie oortjie te werk, maar moenie dit herlaai totdat jy weer aanlyn is nie; sonder 'n gestoorde kopie misluk {{ui:Maak die voorbeeldterrein oop}} met "Die voorbeeld kon nie gelaai word nie".
:::

:::tip
Vir gebruik in die veld, stoor CivilCraft vir gebruik vanlyn en neem jou puntlêers op die skootrekenaar self saam. Projekte en uitvoere stoor as aflaaie sonder verbinding, so jy kan 'n dag se metings invoer, die oppervlak nagaan en die projek op die terrein stoor.
:::

Wolkstoring is nog nie beskikbaar nie, en rekenaarweergawes is nog nie uit nie. Vandag is die lêers wat jy stoor die enigste kopie: hou hulle ergens waar daar 'n rugsteun is.

## Byvoegings wat 'n lêer gebruik

Wanneer jy 'n projek stoor wat data van 'n byvoeging bevat (die Bouregulasie-merkhokkies, of 'n Adres-na-terrein-bron), teken die lêer watter byvoegings en watter weergawes. Maak dit oop op 'n rekenaar wat 'n ontbrekende een het, en 'n balk bo die plan sê so en bied aan om dit uit jou rekening se lys by te voeg. Die aantekening is net 'n nota: die lêer maak in elk geval oop.

## Ontdoen vanuit Studio

Binne CadCraft Studio word elke stap wat jy in CivilCraft afhandel aan Studio meegedeel, sodat sy projekwye ontdoen die nuutste stap oor programme heen kan terugneem. Studio ontdoen 'n stap net wanneer CivilCraft se eie ontdoenstapel presies is soos daardie stap dit gelaat het; nadat jy 'n ander lêer oopmaak, slaan dit hierdie venster oor.

## Sluit met nie-gestoorde veranderinge

Wanneer die projek nie-gestoorde veranderinge het en jy die oortjie sluit, herlaai of die bladsy verlaat, vra die blaaier of jy wil weggaan. Die bewoording en voorkoms daarvan behoort aan die blaaier en kan nie deur CivilCraft verander word nie. {{ui:Nuut}}, en die oopmaak van 'n projek- of LandXML-lêer, vra eerder in CivilCraft se eie **Nie-gestoorde veranderinge**-kassie, met {{ui:Kanselleer}}, {{ui:Moenie stoor nie}} en {{ui:Stoor 'n kopie}}.
