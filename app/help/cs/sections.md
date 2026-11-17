---
title: Vzorkovací čáry a příčné řezy
summary: Řezy kolmé k ose trasy, pohled na terén, návrh a výkop a násyp v každém staničení a objemy průměrem koncových ploch.
keywords: zemní bilance, diagram zemní bilance, bod bilance, smrštění, bobtnání, dopravní vzdálenost, výměna, odvoz, listy řezů, listy příčných řezů, řezy PDF, řezy, příčné řezy, vzorkovací čáry, pohled na řez, výkop, násyp, plochy, průměr koncových ploch, objemy z koncových ploch, zemní práce, staničení, odsazení, CSV
from: 5060173c
---

Příčný řez ukazuje silnici tak, jak bude postavena: napříč osou trasy v jednom staničení, stávající terén, návrh (koridor nebo plošina zarovnaná dovnitř) a výkop a násyp mezi nimi.

## Přidání vzorkovacích čar

1. Vyberte osu trasy. Ve **Vlastnosti**, pod **Vzorkovací čáry**, klikněte na {{ui:Přidat vzorkovací čáry}}.
2. Nastavte **Každých** (rozestup: na začátku 50 ft nebo 20 m), **Levou šířku** a **Pravou šířku** (jak daleko každý řez sahá od osy).
3. Chcete-li řez vést v určitém staničení, napište jej do **Přidat staničení** (například `2+35`) a stiskněte {{key:Enter}}.

Řezy se vedou v každém celém násobku rozestupu, na obou koncích osy trasy, na začátku a konci každého oblouku (PC a PT) a v staničeních, která přidáte. Vzorkovací čáry se v půdorysu zobrazují jako šedé čáry napříč osou; jdou také do DXF, DWG a PDF na vrstvu C-ROAD-SCTN. Každá změna je jeden krok: {{key:Mod+Z}} ji vrátí.

## Pohled na řez

Otevřete jej přes {{ui:Pohled na řez}} ve **Vlastnosti** osy trasy, {{ui:Řezy}} pod **Povrch** › {{ui:Více}}, nebo {{key:X}}. Nahradí pohled na profil pod půdorysem.

- Procházejte řezy šipkami v jeho liště, seznamem staničení, nebo klávesami {{key:Left}} a {{key:Right}}, když má pohled na řez zaměření ({{key:Home}} a {{key:End}} pro první a poslední).
- Šedá čára je stávající terén, červená čára návrh. Výkop je vystínován oranžově, násyp zeleně. Body koridoru jsou označeny: CL (osa trasy), EOP (hrana vozovky), SH (krajnice) a DL (napojení na terén).
- Záhlaví udává staničení, výkop a násyp tohoto řezu a svislé zvětšení. **Přizpůsobit** vyplní panel; zvolte 1×, abyste viděli řez ve skutečném měřítku.
- Silná čára v půdorysu ukazuje, který řez je na obrazovce.

## Listy řezů

{{ui:Listy řezů (PDF)}} pod **Vzorkovací čáry** umístí každý řez na stránky PDF, v řadách zleva doprava a shora dolů v pořadí staničení. Zvolte **Papír**, **Měřítko půdorysu** (vodorovné měřítko řezů) a **Svislé zvětšení profilu** (1×, 2×, 5× nebo 10×); dialog říká, kolik řezů se vejde na stránku a kolik stránek to udělá.

Každý řez na listech ukazuje mřížku s odsazeními a výškami, terén (čárkovaně), návrh, výkop a násyp vystínované (oranžově a zeleně), body koridoru a pod ním své staničení a plochy výkopu a násypu. Každý řez na listech je nakreslen stejně velký, dost vysoký pro největší z nich; když se to při vašem zvětšení nevejde na stránku, CivilCraft použije největší, který se vejde, a řekne to. Pruh s názvem uvádí osu trasy, staničení na té stránce, měřítka a „List 1 z 3“.

## Objemy průměrem koncových ploch

Mezi dvěma sousedními řezy je objem průměrem jejich dvou ploch krát vzdálenost jejich staničení. Lišta ukazuje součty pro osu trasy a {{ui:CSV}} stáhne plochy a objemy každého řezu s běžícími součty (krychlové yardy pro projekty v stopách, krychlové metry pro metrické).

**Vlastnosti** ukazují tytéž součty vedle objemů mřížkovou metodou z [Objemy zemních prací](topic:volumes). Obě jsou jiné aproximace: těsnější řezy je přiblíží a na rovné silnici na rovinatém terénu jsou stejné.

:::note
Výkop a násyp se počítají jen uvnitř upravených ploch (linií napojení koridoru nebo plošiny), jako to dělá mřížková metoda. Bez koridoru nebo plošiny je návrh terén, takže řez neukazuje žádný výkop ani násyp.
:::

## Zemní bilance

**Zemní bilance** pod **Vzorkovací čáry** nakreslí diagram zemní bilance z týchž objemů koncových ploch: podél staničení běžící součet výkopu minus násypu.

- **Smrštění (−) nebo bobtnání (+) výkopu** říká, co krychlový yard výkopu udělá, jakmile je uložen jako násyp: −10 % (výchozí hodnota, zástupná) znamená, že se smrští na 0.9; skalní hornina, která bobtná, může být +5 %. Použijte údaj z vaší geotechnické zprávy.
- Kde čára stoupá, je silnice ve výkopu; kde klesá, je v násypu. Nad nulou (vystínováno oranžově) se zemina pohybuje po staničení nahoru; pod nulou (zeleně) dolů po staničení.
- **Body bilance** jsou místa, kde čára protíná nulu: mezi dvěma z nich se výkop a násyp vyrovnávají. Tabulka vypisuje každý vyrovnaný úsek, přemístěný objem (jeho nejvyšší nebo nejnižší bod) a průměrnou dopravní vzdálenost (vystínovaná plocha dělená tímto objemem).
- Kde čára končí mimo nulu, zbytek je **odvoz** (nad) nebo **výměna** (pod). V tom posledním úseku se jako přemístěná počítá jen zemina za úrovní, na které čára končí.

**CSV** uloží hodnotu zemní bilance v každém řezu, úseky a faktor.
