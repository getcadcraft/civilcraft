---
title: "Klimatické scénáře: záplavy, horko a požáry v letech 2050 a 2080"
summary: V Adrese na lokalitu zvedněte hladinu záplav lokality pro budoucí klima, proveďte předběžné posouzení expozice požárům, přetvořte soubor počasí a porovnejte současnost s budoucností z datového balíčku klimatu (SSP2-4.5 a SSP5-8.5, 2050 a 2080).
keywords: klima, změna klimatu, budoucnost, 2050, 2080, ssp, cmip6, scénář, hladina moře, záplavy, základní záplavová výška, bfe, fema, horko, soubor počasí, epw, morfing, požár, lesní požár
from: b0d2ee38
---

Klimatická data pocházejí z **datového balíčku**, ne z aplikace. Zapněte doplněk {{ui:Klimatické scénáře}} v Nastavení › Doplňky, nebo načtěte vlastní soubor balíčku v bloku {{ui:Klimatický scénář}}.

:::warning
Balíček, který přichází s doplňkem, je **ukázkový**: tři místa (Denver, Miami, Johannesburg), jeden klimatický model a pět let v každém 20letém období. Slouží k vyzkoušení nástrojů, **ne pro návrh**. Úplný balíček se sestaví nástrojem `tools/climate/build-pack.mjs` z dat NASA NEX-GDDP-CMIP6.
:::

## Kde to je

Povrch › Další › Adresa na lokalitu. Nastavte bod, přidejte vrstvy (vrstva záplav FEMA dává základní záplavovou výšku) a stiskněte tlačítko, které lokalitu načte. Pod řádky lokality je blok {{ui:Klimatický scénář}}: vyberte **Scénář** (SSP2-4.5 nebo SSP5-8.5) a **Rok** (2050 = 2041-2060, 2080 = 2071-2090, obojí oproti 1995-2014). Použije se místo balíčku nejblíže k bodu, nebo to, které vyberete; je-li daleko od všech míst, použijí se globální průměrné změny a panel to řekne.

## Návrhová hladina záplav

Současná hladina je základní záplavová výška FEMA, pokud ji vrstva záplav měla (stopy, NAVD 88), jinak zadejte vlastní. Zvolte typ záplavy (pobřežní, říční nebo přívalový déšť, nebo obojí), hloubku záplavy na lokalitě pro část způsobenou deštěm a volnou výšku, pokud ji chcete. {{ui:Zvýšit hladinu záplav}} ukáže současnou a budoucí hladinu vedle sebe, části způsobené hladinou moře a deštěm a předpoklady: celé zvýšení hladiny moře se přičte k pobřežní hladině; průtok řeky roste v poměru 1:1 se srážkami nejvlhčího dne a hloubka sleduje průtok na mocninu 0.6 (Manning, široké koryto); části se sečtou.

:::warning
Jde o předběžné posouzení změny, ne o studii záplav. Návrhovou hladinu záplav určuje úřad nebo Váš inženýr.
:::

## Expozice požárům (jen předběžné posouzení)

Nejbližší vegetace, svah nahoru od ní a vzdálenost dávají pásmo od velmi nízkého po extrémní, současné i budoucí (budoucí násobí změnou indexu počasí pro požár z balíčku). **Jen předběžné posouzení:** naše vlastní relativní stupnice, která ukáže, zda lokalita potřebuje řádné posouzení požárního rizika; není to hodnocení podle předpisu.

## Horko: budoucí soubor počasí

Vyberte současný soubor `.epw` a klikněte na {{ui:Vytvořit budoucí soubor počasí}}: soubor se přetvoří zveřejněnou metodou posunu a natažení (Belcher, Hacker a Powell 2005) a porovná se horko (průměrná a nejvyšší teplota, návrhové teploty, hodiny nad 30 °C a 35 °C, stupňodny). {{ui:Uložit budoucí soubor počasí}} ho uloží pro panel Prostředí, kontrolu energie v BimCraftu nebo Vaše vlastní nástroje.

## Odkud čísla pocházejí

NASA NEX-GDDP-CMIP6 (zjemněný výstup modelů CMIP6, CC BY 4.0 podle modelu) pro teplotu, vlhkost, sluneční svit, déšť a počasí pro požár; globální průměr IPCC AR6 pro vzestup hladiny moře, pokud balíček neobsahuje místní údaje. Panel ukazuje zdroj balíčku, licenci a datum.
