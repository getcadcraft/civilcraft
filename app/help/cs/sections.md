---
title: Vzorkovací čáry a příčné řezy
summary: Řezy kolmo k ose trasy, pohled na terén, návrh a výkop a násyp v každém staničení, objemy metodou průměru koncových ploch.
keywords: zemní bilance, diagram zemní bilance, bilanční body, úbytek, nárůst, vzdálenost přepravy, výměna, odvoz, listy řezů, listy příčných řezů, pdf řezů, řezy, příčné řezy, vzorkovací čáry, pohled na řez, výkop, násyp, plochy, průměr koncových ploch, objemy koncových ploch, zemní práce, staničení, odsazení, csv
from: 09639ce2
---

Příčný řez ukazuje silnici tak, jak bude postavena: napříč osou trasy v jednom staničení, stávající terén, návrh (koridor nebo plošina zapracovaná do terénu) a výkop a násyp mezi nimi.

## Přidání vzorkovacích čar

1. Vyberte osu trasy. Ve **Vlastnostech** v části **Vzorkovací čáry** klikněte na {{ui:Přidat vzorkovací čáry}}.
2. Nastavte **Každých** (rozestup: zpočátku 50 ft nebo 20 m), **Levou šířku** a **Pravou šířku** (jak daleko od osy každý řez sahá).
3. Chcete-li vést řez v konkrétním staničení, zadejte ho do **Přidat staničení** (například `2+35`) a stiskněte {{key:Enter}}.

Řezy se vedou v každém celém násobku rozestupu, na obou koncích osy trasy, na začátku a konci každého oblouku (PC a PT) a v staničeních, která přidáte. Vzorkovací čáry se v půdorysu zobrazují jako šedé čáry napříč osou; vystupují také do DXF, DWG a PDF na vrstvě C-ROAD-SCTN. Každá změna je jeden krok: {{key:Mod+Z}} ji vrátí zpět.

## Pohled na řez

Otevřete ho tlačítkem {{ui:Pohled na řez}} ve **Vlastnostech** osy trasy, {{ui:Řezy}} v části **Povrch** › {{ui:Více}}, nebo klávesou {{key:X}}. Nahradí pohled na profil pod půdorysem.

- Procházejte řezy šipkami na jeho liště, v seznamu staničení, nebo klávesami {{key:Left}} a {{key:Right}} při zaměřeném pohledu na řez ({{key:Home}} a {{key:End}} pro první a poslední).
- Šedá čára je stávající terén, červená návrh. Výkop je vyšrafován oranžově, násyp zeleně. Body koridoru jsou označeny: CL (osa), EOP (okraj vozovky), SH (krajnice) a DL (průsečnice se terénem).
- Záhlaví uvádí staničení, plochy výkopu a násypu tohoto řezu a vertikální zvětšení. {{ui:Přizpůsobit}} vyplní panel; zvolte 1× pro zobrazení řezu ve skutečném měřítku.
- Tlustá čára v půdorysu ukazuje, který řez je na obrazovce.
- **Zoom a posun:** kolečko přibližuje k ukazateli a tažení posouvá pohled. {{ui:Přizpůsobit}} (nebo {{key:F}}, nebo dvojklik) znovu přizpůsobí celý řez.

## Měření v řezu

1. Klikněte na {{ui:Měřit}} na liště řezu, nebo stiskněte {{key:M}}. Nápověda říká "Klikněte na první bod, potom na druhý."
2. Klikněte na dva body. Každý se přichytí ke konci čáry nebo k bodu koridoru (CL, EOP, SH, DL); podržte {{key:Alt}} pro volný bod.
3. Odečet uvádí vodorovnou vzdálenost (ΔH), svislou vzdálenost (ΔV), sklon v procentech s jeho poměrem a přímou délku v jednotkách projektu.

Dalším kliknutím zahájíte nové měření. {{key:Esc}} ho vymaže a {{key:M}} vypne Měřit.

## Listy řezů

{{ui:Listy řezů (PDF)}} v části **Vzorkovací čáry** umístí každý řez na stránky PDF, v řadách zleva doprava a shora dolů v pořadí staničení. Zvolte **Papír**, **Měřítko půdorysu** (vodorovné měřítko řezů) a **Zvětšení profilu** (1×, 2×, 5× nebo 10×); dialog řekne, kolik řezů se vejde na stránku a kolik stránek to vyjde.

Každý řez ukazuje síť s odsazeními a výškami, terén (čárkovaně), návrh, výkop a násyp vyšrafované (oranžově a zeleně), body koridoru a pod ním své staničení a plochy výkopu a násypu. Všechny řezy na listech jsou nakresleny stejně velké, dost vysoké pro největší z nich; když se to při vašem zvětšení nevejde na stránku, CivilCraft použije největší, který se vejde, a řekne to. Pruh s názvem uvádí osu trasy, staničení na té stránce, měřítka a "List 1 z 3".

## K čemu se měří výkop a násyp

Koridor může mít vrstvy pod vozovkou: vrstvy vozovky, součásti šablony, trasu. Výběr **Objemy měřené k** na liště řezu určí, kam výkop a násyp sahají:

- **Spodní povrch** (výchozí): ke dnu těchto součástí, takže výkop zahrnuje hloubku skladby vozovky.
- **Horní povrch**: jen k horní hraně návrhu, jak tomu bylo předtím, než se součásti počítaly.

Plochy v záhlaví, objemy pod ním, CSV i zemní bilance se řídí touto volbou a uloží se s projektem.

## Objemy metodou průměru koncových ploch

Mezi dvěma sousedními řezy je objem průměrem jejich dvou ploch vynásobeným vzdáleností jejich staničení. Lišta ukazuje součty pro osu trasy a {{ui:CSV}} stáhne plochy a objemy každého řezu s průběžnými součty (krychlové yardy pro projekty ve stopách, krychlové metry pro metrické).

**Vlastnosti** ukazují stejné součty vedle objemů metodou sítě z [Objemy zemních prací](topic:volumes). Obě jsou různé aproximace: těsnější řezy je přiblíží k sobě a na přímé silnici na rovině jsou stejné.

:::note
Výkop a násyp se počítají jen uvnitř upravených ploch (průsečnic se terénem koridoru nebo plošiny), stejně jako metoda sítě. Bez koridoru nebo plošiny je návrh terén, takže řez neukazuje žádný výkop ani násyp.
:::

## Zemní bilance

**Zemní bilance** v části **Vzorkovací čáry** kreslí diagram zemní bilance z týchž objemů koncových ploch: podél staničení průběžný součet výkopu minus násypu.

- **Úbytek (−) nebo nárůst (+) výkopu** říká, co udělá krychlový yard výkopu, až je uložen jako násyp: −10 % (výchozí hodnota, zástupná) znamená, že se zmenší na 0.9; hornina, která nabývá, může mít +5 %. Použijte údaj z vašeho geotechnického posudku.
- Kde čára stoupá, je silnice ve výkopu; kde klesá, v násypu. Nad nulou (vyšrafováno oranžově) se zemina přesouvá ve směru rostoucího staničení; pod nulou (zeleně) ve směru klesajícího staničení.
- **Bilanční body** jsou místa, kde čára protíná nulu: mezi dvěma z nich se výkop a násyp vyrovnávají. Tabulka uvádí každý vyrovnaný úsek, přemístěný objem (jeho nejvyšší nebo nejnižší bod) a průměrnou vzdálenost přepravy (vyšrafovaná plocha dělená tímto objemem).
- Kde čára končí mimo nulu, zbývající část je **odvoz** (nad nulou), nebo **výměna** (pod nulou). V tom posledním úseku se jako přesunutá počítá jen zemina nad úrovní, na které končí.

**CSV** uloží ordinátu zemní bilance v každém řezu, úseky a koeficient.
