---
title: Nechte AI asistenta pracovat s Vaší lokalitou
summary: Zapněte asistenty v Nastavení, aby asistent ve Vašem počítači mohl číst otevřenou lokalitu (body, povrchy, objemy, profily, parcely), přidávat geodetické body, ukládat a exportovat LandXML nebo DWG přes CadCraft Studio. Vypnuto, dokud je nezapnete.
keywords: ai, asistent, mcp, skript, automatizace, studio, body, výška, staničení, odsazení, osa trasy, objem, výkop, násyp, profil, parcela, landxml, dwg, usd, složky, oprávnění, odpojit, aktivita
from: d0356582
---

## Co se naučíte

Jak nechat AI asistenta (libovolného asistenta, který mluví přes MCP) pracovat s lokalitou, která máte otevřenou, co smí a nesmí, a jak ho zastavit.

## Co asistent může dělat v CivilCraftu

| Žádá o | Co dostane | Potřebuje |
|---|---|---|
| Lokalitu | Název, jednotky, souřadnicový systém, skupiny bodů, osy, povrchy, plošiny, parcely a potrubí | Čtení |
| Geodetické body | Číslo, X, Y, výšku a popis, podle skupiny, podle popisu nebo uvnitř obdélníku | Čtení |
| Výšky povrchu | Stávající terén (nebo upravený povrch) v libovolných bodech, které pojmenuje | Čtení |
| Staničení a odsazení | Staničení a odsazení bodů podél osy, nebo souřadnice a výšku terénu ve staničeních | Čtení |
| Profil | Výšky terénu, návrhového profilu a upraveného povrchu podél osy, po tolika stopách nebo metrech, kolik určí | Čtení |
| Výkop a násyp | Objemy mezi stávajícím terénem a upraveným povrchem (každé plošiny a koridoru také), nebo mezi terénem a rovinou | Čtení |
| Parcely | Rohy, plocha (v akrech nebo hektarech), obvod a popis pozemku | Čtení |
| Výběr | Body, které pojmenuje, se vyberou v půdorysu, jako byste je vybrali sami | Úpravy |
| Nové geodetické body | Body přidané s čísly, která dá, nebo s dalšími volnými čísly. Každé volání je jeden krok zpět | Úpravy |
| Uložení | Vlastní {{ui:Save}} CivilCraftu | Uložení |
| LandXML nebo DWG | Stejné soubory jako tlačítka {{ui:LandXML}} a {{ui:DWG}} | Export |
| Lokalita ve 3D | OpenUSD (.usdz, .usda nebo .usdc) terénu, upraveného povrchu, plošin a potrubí, tak jak je exportuje 3D pohled | Export |
| Rostliny a seznam rostlin | Rostliny nalezené v seznamu rostlin podle libovolného názvu a počty ze seznamu rostlin | Čtení |
| Výsadba a úpravy terénu | Rostliny, záhon nebo živý plot, nebo plošina, násyp, mělký příkop či plocha úpravy terénu přidané, každé jako jeden krok zpět, s jeho výkopem a násypem | Úpravy |
| Kontrola zavlažování | Průtok každé zóny, tlak potřebný u jejího ventilu a na přívodu, nejhorší výtlak, doby chodu, problémy a kusovník, jako pomocný výpočet, který ověří projektant zavlažování | Čtení |

Pracuje s lokalitou, která je otevřena. Ve Studiu může také ukládat a exportovat do složek, které zvolíte (níže); bez složky se jeho soubory stáhnou stejně jako u tlačítek.

## Zapněte to

Asistenti se k CivilCraftu dostanou přes CadCraft Studio na Vašem počítači; prostý prohlížeč k tomu cestu nemá.

1. Otevřete {{ui:Settings}} a zvolte kartu **CivilCraft**.
2. Pod **Asistenti** zaškrtněte **Povolit AI asistentům a skriptům používat CivilCraft**.
3. **Čtení** je za Vás zaškrtnuto. Zaškrtněte **Úpravy**, **Uložení** nebo **Export** jen tehdy, když je asistent potřebuje.
4. Chcete-li, aby mohl ukládat a exportovat do složky, zvolte {{ui:Add a folder…}} pod **Složky, které smí používat** a vyberte složku v dialogu Studia. {{ui:Remove}} ji odebere okamžitě; každá jiná cesta je odmítnuta.
5. Připojte asistenta ve Studiu (Studio ukáže adresu a nastavení, která do něj vložíte).

## Když je asistent připojen

Poznámka nahoře v pravém panelu říká, který asistent je připojen a co může dělat. Klikněte na {{ui:Disconnect}}, abyste jeho relaci okamžitě ukončili; aby pokračoval, musí se připojit znovu.

**Aktivita**, pod **Asistenti** v Nastavení, uvádí každé volání, které asistent udělal, od nejnovějšího, a zda uspělo.

:::tip
Ptejte se prostými slovy, například „jaká je výška terénu každých 50 stop podél Hlavní ulice?“, „kolik výkopu a násypu potřebují plošiny?“ nebo „přidej řídicí bod na těchto souřadnicích“. Asistent lokalitu přečte a odpoví, nebo provede změnu jako jeden krok zpět.
:::

## Bez otevření CivilCraftu

Souborový server CadCraftu pro asistenty (`npx @getcadcraft/mcp`) a příkazový řádek `cadcraft` otevřou uložené projekty CivilCraftu (`.civilcraft.json`) a soubory bodů pomocí vlastního kódu CivilCraftu, bez okna: stejné nástroje pro čtení, přidávání bodů, uložení projektu, LandXML a lokalitu ve 3D jako OpenUSD. Příkaz `cadcraft convert site.civilcraft.json site.xml` zapíše LandXML z příkazového řádku. Otevírání LandXML, export DWG a nástroje pracovního prostoru Krajina stále potřebují okno CivilCraftu.

## Vypněte to

Odškrtněte **Povolit AI asistentům a skriptům používat CivilCraft**. Každý asistent se okamžitě odpojí a nastavení se zachová pro příště.

## Viz také

- [Recepty pro AI asistenty](common:assistants-recipes): příklady s nástroji, které volají.
- [Návrh vodorovné osy trasy](topic:alignment)
- [Sestavení a úprava povrchu](topic:build-surface)
- [Výběr, kopírování a vkládání geodetických bodů](topic:copy-paste-points)
- [Nastavení CivilCraftu](topic:settings)
