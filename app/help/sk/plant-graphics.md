---
title: Grafika rastlín podľa mierky, vlastné značky a 3D rastliny
summary: Ako sa rastliny kreslia v pôdoryse pri každej mierke výkresu a úrovni detailu a ako záznam rastliny dostane vlastnú značku (SVG alebo blok DXF/DWG) a vlastný 3D model (OBJ, STL alebo GLB).
keywords: grafika rastlín, značka rastliny, značka podľa mierky, úroveň detailu, podrobnosť, jednoduchý kruh, obrys, podrobná značka, vlastná značka, blok, svg, dxf, dwg, 3D rastlina, vlastný 3D model, obj, stl, glb, gltf, model stromu, rastliny v 3D
from: 875837d9
---

## Značky v pôdoryse podľa mierky

Krajina › {{ui:More}} › {{ui:Plant graphics}} nastavuje, ako sa rastliny kreslia v pôdoryse. **Automaticky podľa mierky** vyberie jednu z troch úrovní podľa mierky výkresu:

- **Jednoduchý kruh** (hrubšie ako 1:500): kruh v rozpätí rastliny v dospelosti.
- **Obrys so stredom** (od 1:500 do 1:200): kruh a malý stredový kríž.
- **Podrobná značka** (jemnejšie ako 1:200): vlastná značka záznamu, ak ju má, inak vstavaná značka.

Dve mierky zmeníte pomocou **Jednoduchá od 1:** a **Obrys od 1:**, alebo zvolíte jednu úroveň pre každú mierku. Každý list v dialógu Listy má vlastnú **Podrobnosť rastlín v pôdoryse**, takže pôdorys územia 1:500 a výsadbový plán 1:100 sa môžu líšiť. Nastavenia sa ukladajú spolu s projektom.

## Vlastná značka

Vyberte rastlinu v časti Rastliny a stlačte {{ui:Own symbol…}}. Program načíta súbor SVG alebo blok výkresu DXF či DWG (ak má výkres viac blokov, vyberiete jeden). Značka sa prispôsobí rozpätiu rastliny a kreslí sa na podrobnej úrovni. Uchováva sa v projekte, takže súbor putuje spolu s ním.

- SVG sa číta pre čiary, lomené čiary, mnohouholníky, obdĺžniky, kružnice, elipsy a cesty. Skripty, štýly, odkazy a obrázky v ňom sa nikdy nekontrolujú. Transformácie sa neuplatňujú: dostanete upozornenie, keď ich súbor obsahuje, takže ich najprv zploštite vo svojom výkresovom programe.
- Limity: 512 KB SVG a 2000 tvarov. Väčší súbor sa odmietne s uvedením dôvodu.

## Vlastný 3D model rastliny

{{ui:Own 3D model…}} na tom istom zázname načíta súbor **OBJ**, **STL** alebo **GLB**. Potom v Grafike rastlín nastavte **Rastliny v 3D** na **Vlastný model každého záznamu**: každá rastlina tohto záznamu zobrazí váš model, škálovaný na jej výšku a rozpätie. Záznamy bez vlastného modelu si ponechajú vstavané tvary. Pre rýchle pohľady na veľké lokality zvoľte **Jednoduché hmoty**.

Súbor GLB sa číta len pre tvar:

- Všetko, čo model potrebuje, musí byť vnútri súboru .glb. Model, ktorý odkazuje na iné súbory (samostatný .bin alebo obrázky podľa adresy), sa odmietne: nič sa nesťahuje.
- Komprimovaná alebo zabalená geometria (Draco, meshopt, kvantizované pozície) sa nečíta. Exportujte bez kompresie.
- Textúry a farby v súbore sa nepoužijú: model sa kreslí vo farbe rastliny. Textúry sa stále kontrolujú a textúra väčšia ako 4096 pixelov na stranu sa odmietne.
- Limity: súbor 32 MB, 50 000 trojuholníkov (počítané pri každej kópii časti umiestnenej viackrát), 64 obrázkov a 16 MB obrázkov.

Každý limit súbor odmietne s uvedením dôvodu; nič čiastočne načítané sa neuchová. Jeden krok späť dá záznamu značku alebo model a {{ui:Remove own symbol}} alebo {{ui:Remove own 3D model}} ich odstránia.

Pozri [Záznamy rastlín](topic:plant-records) o samotnom zázname a [Pohľad na lokalitu v 3D](topic:site-3d).
