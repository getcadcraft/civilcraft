---
title: "Klíma budúcnosti: záplavy, horúčava a lesné požiare v rokoch 2050 a 2080"
summary: V Adrese na lokalitu zvýšte úroveň záplavy lokality pre budúcu klímu, vyhodnoťte vystavenie lesným požiarom a upravte meteorologický súbor, porovnajte súčasnosť a budúcnosť vedľa seba z balíka klimatických dát (SSP2-4.5 a SSP5-8.5, 2050 a 2080).
keywords: klíma, zmena klímy, budúcnosť, 2050, 2080, ssp, cmip6, scenár, hladina mora, záplava, základná výška záplavy, bfe, fema, horúčava, meteorologický súbor, epw, morfovanie, lesný požiar, požiar
from: b0d2ee38
---

Klimatické údaje pochádzajú z **balíka dát**, nie z aplikácie. Zapnite doplnok {{ui:Klíma budúcnosti}} v Nastaveniach › Doplnky, alebo načítajte vlastný súbor balíka v bloku {{ui:Klimatická budúcnosť}}.

:::warning
Balík, ktorý je súčasťou doplnku, je **vzorka**: tri miesta (Denver, Miami, Johannesburg), jeden klimatický model a päť rokov v každom 20-ročnom období. Slúži na vyskúšanie nástrojov, **nie na projektovanie**. Úplný balík sa vytvorí pomocou `tools/climate/build-pack.mjs` z údajov NASA NEX-GDDP-CMIP6.
:::

## Kde to je

Povrch › Ďalšie › Adresa na lokalitu. Nastavte bod, pridajte vrstvy (vrstva záplav FEMA poskytne základnú výšku záplavy) a stlačte tlačidlo, ktoré prečíta lokalitu. Pod riadkami lokality je blok {{ui:Klimatická budúcnosť}}: zvoľte **Scenár** (SSP2-4.5 alebo SSP5-8.5) a **Rok** (2050 = 2041-2060, 2080 = 2071-2090, obe voči 1995-2014). Použije sa miesto balíka najbližšie k bodu, alebo to, ktoré zvolíte; ak je ďaleko od každého miesta, použijú sa globálne priemerné zmeny a panel to povie.

## Návrhová úroveň záplavy

Súčasná úroveň je základná výška záplavy FEMA, ak ju vrstva záplav mala (stopy, NAVD 88), inak zadajte vlastnú. Zvoľte typ záplavy (pobrežná, riečna alebo prívalový dážď, alebo oba), hĺbku záplavy na lokalite pre časť od dažďa a voľný bok, ak ho chcete. {{ui:Zvýšiť úroveň záplavy}} zobrazí súčasnú a budúcu úroveň vedľa seba, časti od hladiny mora a od dažďa a predpoklady: celé stúpanie hladiny mora sa pripočíta k pobrežnej úrovni; prietok riek stúpa jedna ku jednej s dažďom najmokrejšieho dňa a hĺbka sleduje prietok na mocninu 0.6 (Manning, široké koryto); časti sa sčítajú.

:::warning
Ide o orientačné posúdenie zmeny, nie o štúdiu záplav. Návrhovú úroveň záplavy určuje úrad alebo váš projektant.
:::

## Vystavenie lesným požiarom (len orientačne)

Najbližšia vegetácia, svah smerom hore od nej a vzdialenosť dávajú pásmo od veľmi nízkeho po extrémne, súčasné aj budúce (budúce sa násobí zmenou indexu požiarneho počasia z balíka). **Len orientačne:** náš vlastný relatívny rozsah, aby ste zistili, či lokalita potrebuje riadne posúdenie požiarneho rizika; nie je to normové hodnotenie.

## Horúčava: budúci meteorologický súbor

Vyberte súčasný súbor `.epw` a kliknite na {{ui:Vytvoriť budúci meteorologický súbor}}: upraví sa publikovanou metódou posunu a natiahnutia (Belcher, Hacker a Powell 2005) a porovná sa horúčava (priemerná a najvyššia teplota, návrhové teploty, hodiny nad 30 °C a 35 °C, stupňodni). {{ui:Uložiť budúci meteorologický súbor}} ho uloží pre panel Prostredie, kontrolu energie v BimCraft alebo vaše vlastné nástroje.

## Odkiaľ sú čísla

NASA NEX-GDDP-CMIP6 (zmenšené výstupy modelov CMIP6, CC BY 4.0 pre každý model) pre teplotu, vlhkosť, slnečný svit, dážď a požiarne počasie; globálny priemer IPCC AR6 pre stúpanie hladiny mora, pokiaľ balík neobsahuje miestne údaje. Panel ukazuje zdroj, licenciu a dátum balíka.
