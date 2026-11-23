---
title: WaterCraft: odbery, požiarny prietok, výpadky a vek vody
summary: S doplnkom WaterCraft premeňte zákazníkov na odbery z vašich vodovodných potrubí, skontrolujte prietok dostupný pri každom hydrante, zistite, ktorý výpadok potrubia najviac bolí, a sledujte vek vody a chlór počas dňa.
keywords: watercraft, distribúcia vody, odbery, zákazníci, špičkový súčiniteľ, odberový profil, požiarny prietok, hydrant, zvyškový tlak, kritickosť, výpadok, úsek s armatúrami, vek vody, chlór, zvyškový, zdrojová stopa, slepý koniec, csv, doplnok
from: 066fb17a
---

WaterCraft je doplnok, ktorý pracuje so sieťou vody, ktorú ste už nakreslili nástrojmi pre vodovodné potrubia. Pridá kartu do pravého panela so štyrmi časťami.

:::warning
Iba pomôcka na výpočty. Bola overená podľa ručných výsledkov na vymyslených sieťach, nie na skutočnom modeli vodárenskej spoločnosti. Každý výsledok musí skontrolovať vodohospodársky inžinier. Scenáre, pravidlá riadenia, armatúry a terénne odčítania majú vlastné témy "Scenáre" a "Štúdie" v pomocníkovi doplnku WaterCraft.
:::

## Čo urobíte

- Umiestnite zákazníkov do siete ako odbery.
- Nájdite hydranty, ktoré nedosahujú potrebný prietok.
- Nájdite potrubia, ktorých strata je najdôležitejšia.
- Nájdite starú vodu a nízky obsah chlóru.

## Postup

1. Otvorte {{ui:Nastavenia}} › {{ui:Doplnky}} a zapnite {{ui:WaterCraft (distribúcia vody)}}. Na pravom paneli sa objaví karta {{ui:WaterCraft}}.
2. Najprv nakreslite nádrž, uzly a potrubia nástrojmi pre vodovodné potrubia (pozri [Vodovodné potrubia](topic:water-mains)). Bez siete vám karta to povie.
3. V časti {{ui:Odbery}} vložte jedného zákazníka na riadok: identifikátor, x, y, druh, množstvo. Zvoľte {{ui:Špičkový súčiniteľ}} a {{ui:Hodinový priebeh}} (obytný deň, obchodný deň, plochý alebo ponechať priebeh tak, ako je). Stlačte {{ui:Skontrolovať}}, aby ste videli, kde každý zákazník pristane (najbližší uzol), potom {{ui:Vložiť do siete}}. {{ui:Späť}} odstráni odbery.
4. V časti {{ui:Požiarny prietok}} nastavte potrebný prietok a zvyškový tlak, zvoľte, či sa zvyškový tlak drží {{ui:Iba pri hydrante}}, alebo {{ui:Všade v systéme (prísnejšie)}}, a stlačte {{ui:Pôdorysná dĺžka}}. Každý hydrant je uvedený od najhoršieho, označený ako vyhovuje alebo nedostatočný.
5. V časti {{ui:Ktoré potrubie je najdôležitejšie}} zvoľte {{ui:jedno potrubie naraz}} alebo {{ui:jeden úsek s armatúrami naraz}} a stlačte {{ui:Pôdorysná dĺžka}}. Každý výpadok ukáže odrezaný odber, odrezané uzly, uzly, ktoré novo klesli pod minimálny tlak, a najnižší zostávajúci tlak.
6. V časti {{ui:Vek vody a chlór}} zvoľte, čo sledovať (vek vody, chlór alebo zdrojovú stopu), nastavte hodiny behu a limity, ktoré chcete, a stlačte {{ui:Pôdorysná dĺžka}}. Uzly mimo vašich limitov sa uvedú v zozname.
7. Pod ľubovoľnou tabuľkou stlačte {{ui:Uložiť ako CSV}}, aby ste ju uchovali.

## Poznámky

- Potrebný požiarny prietok a spotreby na domácnosť alebo na akre sú východiskové hodnoty, nie normy. Použite vlastné údaje vašej vodárenskej spoločnosti.
- Potrubie, ktoré je čiastočne prerušené armatúrou, sa zatvorí celé, takže zobrazený výpadok je mierne horší ako skutočný.
- Spustite časť kvality vody dosť dlho, aby sa denný profil zopakoval, skôr ako si prečítate posledný deň.
- {{ui:Zastaviť}} ukončí dlhý beh skôr; zoznam potom ukáže iba to, čo sa stihlo.
- Vaša sieť zostáva v tomto projekte a na tomto počítači. Nič sa nikam neodosiela.
