---
title: Grafika rostlin podle měřítka, vlastní značky a rostliny ve 3D
summary: Jak se rostliny kreslí v půdorysu při každém měřítku výkresu a stupni podrobnosti a jak záznam rostliny dostane vlastní značku (SVG, nebo blok DXF/DWG) a vlastní 3D model (OBJ, STL nebo GLB).
keywords: grafika rostlin, značka rostliny, značka podle měřítka, stupeň podrobnosti, úroveň podrobnosti, jednoduchý kruh, obrys, podrobná značka, vlastní značka, blok, svg, dxf, dwg, 3d rostlina, vlastní 3D model, obj, stl, glb, gltf, model stromu, rostliny ve 3D
from: 875837d9
---

## Značky v půdorysu podle měřítka

Krajina › {{ui:Více}} › {{ui:Grafika rostlin}} nastavuje, jak se rostliny kreslí v půdorysu. **Automaticky podle měřítka** vybere jednu ze tří úrovní podle měřítka výkresu:

- **Jednoduchý kruh** (hrubší než 1:500): kruh o šířce rostliny.
- **Obrys se středem** (od 1:500 do 1:200): kruh a malý středový kříž.
- **Podrobná značka** (jemnější než 1:200): vlastní značka záznamu, pokud ji má, jinak vestavěná značka.

Obě měřítka změníte pomocí **Jednoduchý kruh od 1:** a **Obrys od 1:**, nebo zvolíte jednu úroveň pro všechna měřítka. Každá sada listů v dialogu Listy má vlastní **Podrobnost rostlin v půdorysu**, takže situační plán v 1:500 a výsadbový plán v 1:100 se mohou lišit. Nastavení se ukládá s projektem.

## Vlastní značka

Vyberte rostlinu v sekci Rostliny a stiskněte {{ui:Vlastní značka…}}. Načte SVG, nebo blok z výkresu DXF či DWG (když výkres obsahuje více bloků, vyberete jeden). Značka se přizpůsobí šířce rostliny a kreslí se na podrobné úrovni. Uloží se do projektu, takže soubor putuje spolu s ním.

- SVG se čte pro čáry, lomené čáry, mnohoúhelníky, obdélníky, kružnice, elipsy a cesty. Skripty, styly, odkazy a obrázky v něm se nikdy nečtou. Transformace se neaplikují: budete upozorněni, pokud je soubor obsahuje, takže je nejprve zploštěte ve svém kreslicím programu.
- Limity: 512 KB SVG a 2000 tvarů. Větší soubor je odmítnut s uvedením důvodu.

## Vlastní 3D rostlina

{{ui:Vlastní 3D model…}} u stejného záznamu čte soubor **OBJ**, **STL** nebo **GLB**. Potom v {{ui:Grafika rostlin}} nastavte **Rostliny ve 3D** na **Vlastní model každého záznamu**: každá rostlina tohoto záznamu zobrazí váš model, zmenšený nebo zvětšený na svou výšku a šířku. Záznamy bez vlastního modelu si ponechají vestavěné tvary. Pro rychlé pohledy na velké lokality zvolte **Jednoduché hmoty**.

GLB se čte jen pro tvar:

- Vše, co model potřebuje, musí být uvnitř souboru .glb. Model, který odkazuje na jiné soubory (samostatný .bin nebo obrázky podle adresy), je odmítnut: nic se nestahuje.
- Komprimovaná nebo zabalená geometrie (Draco, meshopt, kvantizované pozice) se nečte. Exportujte bez komprese.
- Textury a barvy v souboru se nepoužijí: model se vykreslí barvou rostliny. Textury se stále kontrolují a textura větší než 4096 pixelů na stranu je odmítnuta.
- Limity: soubor 32 MB, 50 000 trojúhelníků (počítají se všechny kopie dílu umístěné vícekrát), 64 obrázků a 16 MB obrázků.

Každý limit soubor odmítne s uvedením důvodu; nic napůl načteného se neuchová. Jeden krok zpět přiřadí záznamu značku nebo model a {{ui:Odebrat vlastní značku}} nebo {{ui:Odebrat vlastní 3D model}} je zase odebere.

Záznam samotný viz [Záznamy rostlin](topic:plant-records) a [Zobrazení lokality ve 3D](topic:site-3d).
