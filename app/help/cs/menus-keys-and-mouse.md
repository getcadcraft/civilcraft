---
title: Nabídky, klávesy a myš
summary: Vyberte styl nabídek, který odpovídá tomu, jak už pracujete, přiřaďte libovolnému příkazu vlastní klávesu, přesouvejte příkazy mezi kartami pásu a nastavte, co dělá kolečko a tlačítka myši na plánu a ve 3D.
keywords: styl nabídek, nabídky, pás karet, pás inženýrských nástrojů, panel nástrojů, příkazový řádek, klasické kreslení, klávesové zkratky, klávesy, přizpůsobit, přiřadit jinak, myš, kolečko, převrácení, směr zoomu, prostřední tlačítko, pravé tlačítko, posun, otáčení, export, import, přepínání, známé
from: 07ac73a0
---

Příkazy CivilCraftu jsou stejné, ať se k nim dostanete jakkoli. **Styl nabídek** určuje jen to, kde jsou na obrazovce, jak se jmenují a kterými klávesami se spouštějí, takže si můžete ponechat své zvyky. Zvolte jej v {{ui:Nastavení}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Nabídky, klávesy a myš}}; změna se projeví okamžitě a tento prohlížeč si ji zapamatuje.

## Tři styly

| Styl | Co získáte |
|---|---|
| {{ui:CivilCraft}} | Vlastní panel nástrojů CivilCraftu (Soubor, Export, {{ui:Povrch}}, Návrh, Úpravy, GIS, {{ui:Pohled}}) a jednoduché klávesy: {{key:A}} osa, {{key:G}} plošina, {{key:P}} potrubí, {{key:B}} lomová hrana, {{key:O}} hranice, {{key:L}} hranová čára, {{key:R}} profil, {{key:X}} řezy, {{key:E}} sklony, {{key:D}} 3D, {{key:F}} přizpůsobit, {{key:V}} výběr. Výchozí stav. |
| {{ui:Klasické kreslení}} | Malý pás karet ({{ui:Domů}}, {{ui:Vložit}}, {{ui:Výstup}}) a příkazový řádek pro ty, kdo píší příkazy: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (zpět), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Začněte psát kdekoli a písmena půjdou na příkazový řádek; {{key:Enter}} spustí, {{key:Enter}} bez zadání zopakuje poslední příkaz, {{key:Esc}} ho vymaže. Prostřední tlačítko posouvá. |
| {{ui:Pás inženýrských nástrojů}} | Karty velkých tlačítek, seskupené tak, jak programy pro návrh staveb seskupují své nástroje: {{ui:Domů}} (údaje o terénu, vytvoření návrhu, pohledy na profil a řez), {{ui:Povrchy}}, {{ui:Úpravy}}, {{ui:Zeměpisná poloha}}, {{ui:Pohled}} a {{ui:Výstup}}, s nabídkou {{ui:Soubor}} a rychlými tlačítky vpravo. Jednoduché klávesy zůstávají. Prostřední tlačítko posouvá plán; ve 3D posouvá prostřední tlačítko a {{key:Shift}} s prostředním tlačítkem otáčí. |

Každý styl zachovává klávesy {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Klávesa, která patří k rozložení CivilCraftu, ale váš styl ji přiřadil jinému příkazu, nedělá nic, a stavový řádek říká, kam její příkaz přešel („V Mé klávesy je Plošina na Ctrl+Alt+G“). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} a šipky si vždy zachovají svůj význam; a když kreslíte čáru, její body si ponechají své klávesy ({{key:Backspace}}, {{key:Enter}}).
:::

## Vytvořte si vlastní verzi

1. Vyberte styl nejblíže tomu, co chcete, a klikněte na {{ui:Přizpůsobit…}}.
2. V {{ui:Klávesy a nabídky}} najděte příkaz (pomůže vyhledávací pole). Klikněte na {{ui:Přidat klíč}} a stiskněte klávesu, nebo dvě klávesy za sebou u dvoupísmenné zkratky. Kliknutím na klávesu ji odeberete.
3. U pásu karet {{ui:Kde je}} přesune příkaz na jinou kartu a panel, do nabídky {{ui:Soubor}}, nebo na {{ui:Jen klávesy}}.
4. Na kartě {{ui:Myš}} nastavte kolečko, tlačítka, která posouvají plán, a to, co dělá každé tlačítko v 3D zobrazení.
5. Dejte stylu název a klikněte na {{ui:Uložit}}.

Uložení vestavěného stylu vytvoří vaši vlastní kopii („Můj pás inženýrských nástrojů“); vestavěný se nikdy nemění. Klávesa přiřazená dvěma příkazům, nebo klávesa, která by se spustila dřív, než by šlo napsat dvoupísmenou zkratku, se zobrazí červeně a před uložením ji musíte opravit.

## Myš

- **Kolečko myši**: {{ui:Posun kolečkem nahoru přibližuje}} (výchozí), nebo {{ui:Posun kolečkem nahoru oddaluje}}, a to, jak rychle, na plánu i ve 3D. Stažení nebo roztažení prstů na touchpadu vždy zoomuje tak, jak se pohybují vaše prsty.
- **Posun plánu**: prostředním tlačítkem, pravým tlačítkem, nebo oběma. Také {{key:Space}} a tažení posouvá. Levé tlačítko vždy vybírá a kreslí.
- **Tažení ve 3D zobrazení**: {{ui:Vlastní pro každé zobrazení}} ponechá tlačítka CivilCraftu (levé otáčí, pravé posouvá). Nebo nastavte každé tlačítko na otáčení, posun, zoom, nebo na nic; {{key:Shift}} s tlačítkem prohodí otáčení a posun. Pouhý klik bez tažení stále vybírá.

## Vezměte si to s sebou

{{ui:Export}} uloží styl v používání jako malý soubor `.ccinput.json`; {{ui:Import…}} přidá takový soubor z jiného počítače nebo od kolegy. Importovaný soubor může odkazovat jen na vlastní příkazy CivilCraftu: cokoli jiného v něm se vynechá a započítá do stavového řádku. {{ui:Smazat tento styl}} odstraní jeden z vašich vlastních.

:::note
Tato nastavení zůstávají v tomto prohlížeči. {{ui:Používat tento styl ve všech aplikacích}} pod kartami stylů zajistí, že se každá aplikace otevře ve svém odpovídajícím stylu (vlastní panel nástrojů, pás karet nebo klasické kreslení), se změnami, které jste v každé aplikaci provedli. CivilCraft nemá styl s panelem nabídek: když je pro všechny aplikace zvolen panel nabídek jiné aplikace, CivilCraft si ponechá vlastní panel nástrojů.
:::

Související: [Klávesnice a myš](topic:keyboard) · [Nastavení CivilCraftu](topic:settings) · [Přechod z jiného civilního softwaru](topic:coming-from)
