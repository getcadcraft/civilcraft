---
title: Pracovní prostor Krajina
summary: Výsadbové plány, úpravy terénu, zpevněné plochy, zdi, schody, zavlažování a listy krajiny na stejném pozemku, se stejnými povrchy a ve stejném souboru jako civilní práce.
keywords: krajina, krajinářská architektura, zahrada, výsadba, rostliny, stromy, úpravy terénu, zpevněné plochy, dlažba, zavlažování, postřikovače, pracovní prostor, návrh pozemku, plán krajiny
from: eea929d1
---

Pracovní prostor Krajina přidává nástroje pro návrh krajiny na pozemek CivilCraftu, který již máte: stejné zaměřovací body, stejný stávající terén, stejný navržený povrch a stejný soubor projektu.

## Otevření

Zvolte {{ui:Povrch}} › {{ui:Více}} › {{ui:Pracovní prostor Krajina}}. Panel nástrojů pak ukáže volbu **Pracovní prostor** a skupinu **Krajina** a skupiny Povrch, Návrh a GIS ustoupí, aby pro ni vzniklo místo. Pro návrat zvolte pod Pracovní prostor **Civil**. CivilCraft si na tomto počítači pamatuje pracovní prostor, který jste použili naposledy.

Levý panel získá nahoře tři sekce:

- **Rostliny**: seznam rostlin, ve kterém hledáte a vybíráte, co umístíte. Viz [Seznam rostlin](topic:plant-list).
- **Kontroly terénu**: analýza sklonu, šipky toku a zaplavení. Viz [Úpravy terénu](topic:landscape-grading).
- **Zavlažování**: postřikovače a potrubí, které umístíte jako další, a nastavení přívodu vody. Viz [Zavlažování](topic:irrigation).

## Co je ve skupině Krajina

| Nástroj | Co dělá | Téma |
|---|---|---|
| **{{ui:Zasadit}}**, **{{ui:Záhon}}**, **{{ui:Živý plot}}** | Jednotlivé rostliny, záhony vyplněné v rozestupu rostlin, živé ploty podél čáry | [Výsadba](topic:planting) |
| **{{ui:Upravit terén}}** | Plošiny, valy, průlehy, plochy úprav s bodovými výškami a vrstevnicemi, kontroly sklonu a toku | [Úpravy terénu](topic:landscape-grading) |
| **{{ui:Zpevněné plochy}}** | Dlažby, cesty, zdi, obrubníky, rampy a schody, které se řídí terénem | [Zpevněné plochy](topic:hardscape) |
| **{{ui:Plochy}}** | Plochy osázené rostlinami: trávníky, záhony, louky a půdopokryvné plochy s konstrukční skladbou, oříznuté kolem zpevněných ploch | [Plochy osázené rostlinami](topic:planted-areas) |
| **{{ui:Výšky}}** | Úpravy terénu v pořadí s výkopem a násypem, bodové výšky, šipky sklonu, řezové čáry | [Úpravy terénu](topic:ground-modifiers), [Řezy](topic:landscape-sections) |
| **{{ui:Zavlažování}}** | Postřikovače, potrubí, ventily, kapkové linky, přívod, dosah a hydraulická kontrola | [Zavlažování](topic:irrigation) |
| **{{ui:Více}}** | Z čáry (objekty zachované propojené s čarami), rozpis rostlin, tabulka rostlin, výkazy, grafika rostlin, volné objekty, listy krajiny a sada k publikování, export IFC, velikost a popisky rostlin | [Objekty z čar](topic:objects-from-lines), [Záznamy rostlin](topic:plant-records), [Výkazy](topic:worksheets), [Listy krajiny](topic:landscape-sheets), [Volné objekty](topic:freeform-objects) |

Vše, co přidáte, je jeden krok zpět, je uloženo v souboru projektu a kreslí se na půdorys ve vrstvách pojmenovaných `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` a `L-IRRG-…`, takže je exporty DXF, DWG a PDF také obsahují.

## Jeden povrch pro vše

Plošiny, valy, průlehy, plochy úprav, dlažby a cesty se zaříznou do **navrženého povrchu**, stejného, který používají koridory a plochy pod stavby. **Stávající terén** se nikdy nemění. Rostliny stojí na terénu, který je pod nimi, takže se při změně úprav posunou. Zemní práce počítají úpravy krajiny spolu se vším ostatním.

:::tip
Nový v tom? [Navrhněte zahradu od začátku do konce](topic:landscape-walkthrough) projde celý pracovní prostor na vzorovém pozemku.
:::
