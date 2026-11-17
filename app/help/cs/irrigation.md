---
title: Návrh zavlažování
summary: Pomůcka pro výpočty, ne autorizovaný návrh: hlavice, rozvodné potrubí, hlavní řad, ventily a kapkové linky na lokalitě; zóny nalezené z potrubí; tlaková ztráta podle Hazen–Williamse, nejnepříznivější hlavice, průtok a tlak oproti přívodu, intenzita srážek, doby zavlažování, pokrytí a kusovník.
keywords: zavlažování, postřikovač, postřik, rotor, rotační tryska, bublátor, kapková závlaha, kapková linka, vypouštěč, ventil, zóna, stanice, řídicí jednotka, hlavní řad, rozvodné potrubí, místo napojení, přívod vody, tlak, psi, kpa, průtok, gpm, tlaková ztráta, hazen williams, intenzita srážek, doba zavlažování, pokrytí, tryska k trysce, kusovník
from: 7d6342c1
---

:::warning
Toto je pomůcka pro výpočty, ne autorizovaný návrh: projektant zavlažování zkontroluje každý výsledek, než se cokoli postaví.
:::

## Nastavení systému

1. V sekci **Zavlažování** vlevo vyberte **Hlavice**, její **Oblouk** a místo, kde oblouk začíná, a průměry potrubí pro rozvody a hlavní řad.
2. {{ui:Zavlažování}} › {{ui:Místo napojení}}: klikněte, kde se přívod vody připojuje. Nastavte jeho **tlak**, **dostupný průtok** a ztrátu na vodoměru a zpětné klapce ve Vlastnostech.
3. {{ui:Zavlažování}} › {{ui:Ventil}}: klikněte, kam patří ventil každé zóny. Ventil zahajuje zónu.
4. {{ui:Zavlažování}} › {{ui:Hlavice}}: klikněte pro umístění hlavic; každý klik umístí jednu.
5. {{ui:Zavlažování}} › {{ui:Rozvodné potrubí}}: klikněte od ventilu přes jeho hlavice a stiskněte {{key:Enter}}. {{ui:Hlavní řad}}: od místa napojení k jednotlivým ventilům.

Konce potrubí se přichytí k hlavicím, ventilům, přívodu a k ostatním koncům potrubí, takže se síť spojí. Zóna je vše, čeho se od jejího ventilu dosáhne přes rozvody; hlavní řad nese vždy jednu zónu.

## Kapková závlaha

{{ui:Zavlažování}} › {{ui:Kapková linka}}: klikněte podél linky, počínaje místem, kde je napájena (konec rozvodu nebo ventil). Nastavte **průtok vypouštěče** a **rozestup** ve Vlastnostech; její průtok je součtem vypouštěčů podél ní.

## Kontrola

{{ui:Zavlažování}} › {{ui:Zkontrolovat systém…}} vypíše každou zónu:

| Sloupec | Jak se počítá |
|---|---|
| Průtok | Součet průtoků hlavic (a kapkových linek) |
| U ventilu | Pracovní tlak nejnepříznivější hlavice plus ztráty potrubí k ní (Hazen–Williams, vnitřní průměr potrubí, změna výšky) a ztráta ventilem |
| U přívodu | Totéž plus ztráta hlavního řadu, který nese tuto zónu, a ztráta vodoměrem a zpětnou klapkou |
| Srážky | Průtok hlavic přes plochu, kterou zalévají, při rozestupu tryska k trysce |
| Minut za týden | Pro nastavení **Zalévání za týden** |
| Problémy | Rychlost nad limitem, hlavice mimo svůj rozsah tlaku, postřikovače a rotory na jednom ventilu, nedostatečný tlak nebo průtok na přívodu, hlavice bez zóny, smyčky |

Vyberte ventil, aby se zobrazily údaje jeho zóny a její nejnepříznivější hlavice orámovaná v půdorysu. Kusovník počítá hlavice podle druhu a oblouku, potrubí podle průměru, ventily, kapkovou linku a vypouštěče a stanice řídicí jednotky. **Uložit jako CSV** uchová obojí.

Nastavení v sekci Zavlažování: **Hazen–Williams C** (150 pro nové plastové potrubí), **nejvyšší průtok** v potrubí (1.5 m/s), **ztráta ventilem** a **Zalévání za týden**. Jsou označena jako výchozí hodnoty.

## Pokrytí

{{ui:Zavlažování}} › {{ui:Zobrazit pokrytí}} říká, jakou část plochy hlavice nechávají suchou, jakou část zalévají dvě nebo více hlavic a které hlavice nedosáhnou na sousedku (rozestup tryska k trysce).

## Hlavice

Uvedené hlavice jsou **obecné** druhy, které CadCraft sestavil z návrhových intenzit srážek (pevné postřiky, rotační trysky, převodové rotory, bublátory, mikropostřiky, vypouštěče), ne produkty žádného výrobce. **Přidat hlavice ze souboru…** načte vaše vlastní hlavice (seznam JSON s dostřikem, průtokem nebo intenzitou srážek a rozsahem tlaku každé hlavice); ukládají se s projektem. Zveřejněná data výrobce se vloží jen s jeho zaznamenaným souhlasem.

Pod obecnými hlavicemi seznam obsahuje **typické hlavice** (jejich názvy končí na „typické hodnoty“): velikosti trysek pevných postřiků, rotační trysky a převodové rotory, mikropostřiky, bublátory a vypouštěče, s poloměrem, průtokem a rozsahem tlaku. CadCraft je vypočítal z publikované matematiky (rovnice otvoru pro průtok, škálování dostřiku proudu pro poloměr) a jmenovitých průtokových tříd, pouze z otevřených zdrojů; žádná tabulka výrobce se nekopíruje. Vyberte jednu a výběr ukáže její základ a licenci. Projekt, který ji používá, uchovává hlavici i její zdroj v souboru projektu. Slouží k plánování: před stavbou zkontrolujte vlastní údaje skutečné hlavice.
