---
title: Klávesy a myš
summary: Každá klávesová zkratka a každá akce myší, touchpadem a dotykem v CivilCraftu, seskupené, s rozdíly prohlížeče a platformy.
keywords: klávesnice, zkratky, horké klávesy, klávesy, myš, touchpad, dotyk, posun, zoom, sevření, kolečko, pravé tlačítko, mac, klávesa command
from: a9756f46
---

Klávesy s jedním písmenem fungují, když nepíšete do pole. Zkratky s {{key:Mod}} používají Command na Macu a Ctrl jinde. Viz také [Klávesy v prohlížeči](common:keys).

## Soubory a úpravy

| Klávesa | Akce |
|---|---|
| {{key:Mod+O}} | Otevřít soubor bodů, LandXML nebo projekt |
| {{key:Mod+S}} | Uložit projekt (stáhne soubor `.civilcraft.json`) |
| {{key:Mod+P}} | Vykreslit půdorys do PDF (otevře dialog vykreslení, ne tisk prohlížeče) |
| {{key:Mod+Z}} | Zpět |
| {{key:Mod+Y}} | Znovu |
| {{key:Delete}} | Smazat vybrané body měření, osu, plošinu, konstrukci, potrubí nebo PVI |
| {{key:Mod+C}} | Kopírovat vybrané body měření (také jako řádky bodů pro tabulku) |
| {{key:Mod+X}} | Vyjmout vybrané body měření |
| {{key:Mod+V}} | Vložit body: sledují ukazatel, klikněte, kam mají patřit |
| {{key:Mod+Shift+V}} | Vložit na stejné místo: na vlastních souřadnicích bodů |
| {{key:Mod+D}} | Duplikovat vybrané body: kopie sleduje ukazatel |
| {{key:Mod+A}} | Vybrat všechny body měření |
| {{key:Esc}} | Zrušit výběr (a zrušit vložení) |

{{key:Mod+S}}, {{key:Mod+O}} a {{key:Mod+P}} fungují i tehdy, když píšete do pole. {{key:Mod+Z}} a {{key:Mod+Y}} v textovém poli vrátí zpět vaše psaní, jak je obvyklé, a stejně tak {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} a {{key:Mod+A}}: v poli kopírují, vyjímají, vkládají a vybírají jeho text. Je-li text na stránce označen (v panelu), {{key:Mod+C}} zkopíruje ten text. {{key:Mod+Shift+Z}} v CivilCraftu nedělá nic: použijte {{key:Mod+Y}} nebo tlačítko {{ui:Znovu}}.

:::mac
Klávesa označená **delete** na Macu je v prohlížeči {{key:Backspace}}. Chcete-li smazat výběr, stiskněte {{key:Delete}} (Fn a delete), nebo zvolte {{ui:Smazat}} v nabídce {{ui:Více}} na panelu nástrojů.
:::

## Nástroje

| Klávesa | Nástroj |
|---|---|
| {{key:V}} | {{ui:Výběr}} |
| {{key:M}} | {{ui:Měřit}}: vzdálenosti, plochy a sklony na půdorysu ([Měření](topic:measure)) |
| {{key:A}} | {{ui:Osa trasy}} |
| {{key:G}} | {{ui:Plošina}} |
| {{key:P}} | {{ui:Potrubí}} |
| {{key:B}} | {{ui:Lomová hrana}} |
| {{key:O}} | {{ui:Hranice}} |
| {{key:R}} | Zobrazit nebo skrýt pohled na profil |
| {{key:I}} | Zapnout nebo vypnout {{ui:Přidat PVI}} (otevře pohled na profil, je-li zavřený) |
| {{key:F}} | {{ui:Přizpůsobit}}: zobrazit všechno |
| {{key:D}} | {{ui:3D}}: zobrazit lokalitu ve 3D, nebo se vrátit na půdorys |
| {{key:E}} | Zobrazit nebo skrýt sklony a výšky podél každé lomové čáry (jen na obrazovce) |

Stisknutí klávesy aktivního nástroje znovu vrátí na {{ui:Výběr}}. Písmena s Shift nedělají nic.

## Při kreslení

| Klávesa | Akce |
|---|---|
| {{key:Enter}} | Dokončit osu, plošinu, běh potrubí, lomovou hranu nebo hranici |
| {{key:Backspace}} | Odebrat poslední kliknutý bod |
| {{key:C}} | Lomová čára: zapnout nebo vypnout oblouky (po vrcholu klikněte na bod na křivce, pak na její konec) |
| {{key:Esc}} | Zrušit kreslení (nebo vložení); stisknutá znovu (nebo když nic není nakresleno) vrátí na {{ui:Výběr}} a zruší výběr |

## Pohled na půdorys

| Klávesa nebo akce | Výsledek |
|---|---|
| Kolečko | Přiblížit nebo oddálit u ukazatele |
| Tažení po prázdném místě | Posun (v libovolném nástroji; krátké kliknutí stále klikne; s podrženým {{key:Shift}} nakreslí výběrový rámeček) |
| Tažení prostředním tlačítkem | Posun |
| Tažení pravým tlačítkem | Posun (nic se neotevře) |
| {{key:Space}} a tažení | Posun |
| Klik | Vybrat (s {{ui:Výběr}}), nebo umístit bod (s nástrojem kreslení) |
| {{key:Shift}} a klik | Přidat bod měření do výběru, nebo ho z něj vyjmout |
| {{key:Shift}} a tažení | Nakreslit rámeček: body měření uvnitř se přidají do výběru. Obtáhněte kolem nich pro [lasso](topic:lasso-selection) |
| {{key:Space}} při kreslení lasa | Okno, pak křížení, pak plot |
| Klik při vkládání | Vložit body tam ({{key:Enter}} je vloží na jejich vlastní souřadnice) |
| Tažení úchytu | Přesunout PI, roh plošiny nebo konstrukci (jeden krok zpět) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Posun, když má půdorys zaměření (nejdřív na něj klikněte) |
| {{key:Plus}} a {{key:Minus}} | Přiblížit a oddálit uprostřed, když má půdorys zaměření |

Klávesa = přibližuje jako {{key:Plus}}, takže Shift nepotřebujete.

## Pohled na profil

| Akce | Výsledek |
|---|---|
| Klik při zapnutém {{ui:Přidat PVI}} | Přidá tam PVI |
| Klik na PVI | Vybere ho |
| Tažení PVI | Přesune ho (jeden krok zpět) |
| {{key:Delete}} nebo {{key:Backspace}} | Odebere vybrané PVI ({{key:Backspace}} jen tehdy, když má pohled na profil zaměření) |

Pohled na profil se nepřibližuje ani neposouvá.

## Obrazovka a nápověda

| Klávesa | Akce |
|---|---|
| {{key:F1}} | Otevřít nebo zavřít tuto nápovědu (postranní panel); {{ui:Nápověda}} v horní liště dělá totéž |
| {{key:Esc}} | Zavřít panel nápovědy, je-li otevřený |
| {{key:Ctrl+Shift+F}} | Přepínat režimy obrazovky: celá obrazovka, celá obrazovka se skrytými lištami, normální |
| {{key:Esc}} | Opustit celou obrazovku (vlastní klávesa prohlížeče) |

{{key:F1}} se dostane k nápovědě dříve, než ho CivilCraft zachytí, takže funguje v libovolném nástroji. Na většině klávesnic Mac stiskněte fn s F1, nebo klikněte na {{ui:Nápověda}}. {{key:Ctrl+Shift+F}} používá klávesu Control na každé platformě, včetně Macu. Jak v této nápovědě hledat, viz [Použití nápovědy](common:help).

## Myš, touchpad a dotyk

:::mouse
- Kolečko přibližuje u ukazatele. Myš s volně se otáčejícím kolečkem přibližuje rychle: otáčejte krátce.
- Posun libovolným tažením po prázdném místě, prostředním tlačítkem, pravým tlačítkem, nebo {{key:Space}} a tažení.
:::

:::mac
Na touchpadu Macu:

- Posouvání dvěma prsty **přibližuje** (neposouvá) a sevření také přibližuje.
- Posun: stiskněte a táhněte po prázdném místě jedním prstem, nebo držte {{key:Space}} a táhněte.
- Klik dvěma prsty (pravé tlačítko) neotevře nabídku a sám o sobě nedělá nic.
:::

:::touch
Na dotykové obrazovce:

- První dotyk zvětší tlačítka a řádky nabídek na velikost prstu.
- Klepněte pro výběr nebo umístění bodu; jeden prst tažený po prázdném místě posouvá. Klepnutí může lehce vibrovat: posune se teprve tehdy, když se prst pohne zhruba o 10 pixelů.
- Dva prsty sevřením přibližují a společným pohybem posouvají.
- Táhněte úchyt nebo PVI jedním prstem. Úchyty berou kolem sebe šířku prstu.
- Při kreslení osy, plošiny, lomové hrany, hranice, běhu potrubí, lomové čáry nebo parcely nabídne lišta nad půdorysem {{ui:Dokončit}} ({{key:Enter}}), {{ui:Zpět o bod}} ({{key:Backspace}}) a {{ui:Zrušit}} ({{key:Esc}}). Dlouhé stisknutí (půl sekundy bez pohybu) také dokončí.
- Ve {{ui:Výběr}} dlouhé stisknutí bodu měření přidá bod do výběru, nebo ho z něj vyjme, jako dělá {{key:Shift}}+klik.
- Ve 3D zobrazení jeden prst obíhá, dva sevřením přibližují a posouvají a klepnutí vybírá.
- Na dotyku není žádné najetí, takže údaje stavového řádku se aktualizují jen tehdy, když je prst na obrazovce.
:::

## Klávesy prohlížeče, které mají přednost

Některé klávesy patří prohlížeči a do CivilCraftu se nikdy nedostanou, například {{key:Mod+W}} (zavřít kartu), {{key:Mod+T}} (nová karta), {{key:Mod+N}} (nové okno) a {{key:F11}} (celá obrazovka v prohlížečích pro Windows a Linux). CivilCraft je nepoužívá. Pokud zkratka místo toho otevře něco v prohlížeči, jednou klikněte na půdorys, aby stránka měla zaměření, a zkuste to znovu.

## Kde je Přesun

Příkaz Přesun neexistuje: zvolte {{ui:Výběr}} a přetáhněte bod nebo vrchol, nebo upravte jeho souřadnice ve {{ui:Vlastnosti}}. Viz [Úprava bodů](topic:edit-points).
