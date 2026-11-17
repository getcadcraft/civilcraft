---
title: Průvěs a tah
summary: Vaše zatěžovací stavy (teplota, vítr, námraza) a limity tahu, jak CivilCraft počítá tah každého úseku, a montážní tabulky.
keywords: průvěs, tah, zatěžovací stav, teplota, vítr, námraza, nesymetrická námraza, rozhodující rozpětí, ekvivalentní rozpětí, změna stavu, řetězovka, montážní tabulka, pevnost v tahu, běžné napětí
from: f8876c35
---

## Zatěžovací stavy a limity

{{ui:Více}} › {{ui:Zatěžovací stavy a limity…}} upravuje pravidla, kterými se řídí každé vedení v projektu.

- **Zatěžovací stavy**: teplota, tlak větru na vodič (Pa) a radiální námraza (mm, s její hustotou). První stav je referenční.
- **Limity tahu**: podíl pevnosti vodiče v tahu, na vodorovný tah nebo na největší tah u podpory, v jednom zatěžovacím stavu. Nebo zadejte vodorovný tah sami.
- **Světlé výšky**: světlá výška, kterou vodič drží nad terénem, silnicí, budovou a podobně. Přidávejte, přejmenovávejte a odebírejte je: jsou vaše. Pod nimi zvolte pravidla pro **Rostliny v krajině pod vedením**, **Zdi v krajině pod vedením** a **Podzemní křížení**.
- **Stavy použité v kontrolách**: který stav dá největší průvěs (horko), vybočení izolátoru (vítr), námrazu a námrazu na jedné straně podpory.
- **Součinitele**: součinitel vzdálenosti fází k, největší vybočení izolátoru, součinitel zatížení podpor a armatur, úhly odklonu, které dělají úhlové a koncové podpory, nejmenší krytí podzemních kabelů a největší úbytek napětí.

## Balíčky: pravidla a knihovna pro zemi

Žádná pravidla žádné země nejsou zabudována do CivilCraft. **Balíček** uchovává sadu pravidel a knihovnu pohromadě v jednom souboru (`.cclinepack.json`), pro zemi, provozovatele sítě nebo firmu:

- **Uložit jako balíček…** v {{ui:Zatěžovací stavy a limity…}} zapíše zobrazenou sadu pravidel a vaši knihovnu (nebo, když ve vaší knihovně ještě nic není, položky, které tento projekt používá). Nejdřív napište **Země nebo region**.
- **Otevřít sadu pravidel nebo balíček…** načte balíček, soubor pravidel nebo soubor knihovny. Pravidla balíčku se zobrazí v dialogu (kliknutím na {{ui:Použít}} je použijete) a jeho položky se dostanou do vaší knihovny.
- Balíčky, které ostatní sdílejí, jsou uvedeny na stránce doplňků pod **Balíčky pro elektrická vedení**. Dva příkladné balíčky ukazují formát; nejsou pravidly žádné země.

Každý balíček se při otevření kontroluje jako každý soubor. Než cokoli vytvoříte, ověřte každou hodnotu podle platné normy.

Výchozí jsou dvě příkladné sady pravidel: **Příklad: chladné klima** a **Příklad: mírné klima**. Jejich čísla nepocházejí z žádné normy: nastavte hodnoty podle své normy. {{ui:Uložit pravidla}} a {{ui:Otevřít pravidla…}} sdílejí sadu pravidel jako soubor.

## Jak se počítá tah

Pro každý úsek mezi kotevními podporami:

1. **Rozhodující rozpětí** je √(ΣL³ ÷ ΣL) jeho polí.
2. Každý limit se převede na vodorovný tah v referenčním stavu přes **rovnici změny stavu** na rozhodujícím rozpětí: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Nejpřísnější nastaví tah.
3. Tah každého zatěžovacího stavu vyplyne z tohoto a tvar každého pole je přesná **řetězovka** procházející jeho dvěma uchycovacími body (včetně polí na svahu): průvěs z tětivy, délka a tah na každém konci.

Zatížení na metr v daném stavu: vlastní tíha plus námraza (plocha námrazy × hustota × g) svisle; tlak větru × průměr s námrazou vodorovně.

## Montážní tabulky

{{ui:Více}} › {{ui:Montážní tabulky…}} vypíše pro každý úsek vodorovný tah a průvěs každého pole při každé teplotě sady pravidel (zpočátku od −5 °C do 40 °C po 5 °C), za bezvětří. Uložte je i tabulku podpor jako CSV.

Nezapočítáno: dotvarování vodiče v průběhu let a protažení nového vodiče. Přidejte je přes teploty, při kterých vedení napínáte.
