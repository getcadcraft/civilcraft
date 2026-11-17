---
title: Výpočet návrhových průtoků splaškové kanalizace a kontrola stoky
summary: Zadejte obyvatele a plochu, které vtékají v každé šachtě splaškové sítě; CivilCraft je sčítá po síti, počítá maximální průtok se součinitelem špičky a infiltrací a kontroluje kapacitu a rychlost každého potrubí.
keywords: splašková, kanalizace, splašková kanalizace, odpadní voda, návrhový průtok, maximální průtok, součinitel špičky, Harmon, Babbitt, infiltrace, počet obyvatel, na obyvatele, naplnění v procentech, samočisticí, rychlost, návrh profilu potrubí, návrhový list
from: 73ba197a
---

Návrhové průtoky splaškové kanalizace fungují na [potrubní síti](topic:pipe-network), když je její {{ui:Typ}} {{ui:Splašková}}. Když nic není vybráno, pravý panel pak ukazuje **Návrhové průtoky splaškové kanalizace** tam, kde dešťová síť ukazuje **Odvodnění dešťových vod**.

## Zadání přítoku

1. Vyberte šachtu. Pod **Návrhové průtoky splaškové kanalizace** napište {{ui:Sem vtékající obyvatelé}} a {{ui:Sem vtékající plocha}} (hektary v metrickém projektu, akry v projektu v stopách).
2. Pro obchody, kanceláře nebo průmysl napište ekvivalentní obyvatele: plocha krát obyvatelé na hektar (nebo akr), které používá vaše agentura. Plocha se počítá pro infiltraci v obou případech.
3. Opakujte pro každou šachtu, kam se připojuje ulice nebo pozemek. Šachta, kam se nic nepřipojuje, zůstává na obou hodnotách 0.

Každé potrubí nese vše, co vtéká do jeho horní šachty a nad ni. Vyberte šachtu, abyste viděli, co jí prochází.

## Nastavení

| Nastavení | Co znamená |
|---|---|
| {{ui:Průtok na osobu}} | průměrný průtok jednoho člověka za den: litry (metrický projekt) nebo americké galony (projekt v stopách) |
| {{ui:Infiltrace}} | podzemní voda, která prosakuje dovnitř: litry za sekundu na hektar, nebo galony za den na akr |
| {{ui:Součinitel špičky}} | Harmon, 1 + 14 / (4 + √P), nebo Babbitt, 5 / P^0.2, kde P je počet obyvatel v tisících |
| {{ui:Součinitel špičky nejméně}} / {{ui:Součinitel špičky nejvíce}} | součinitel je držen mezi těmito dvěma hodnotami |
| {{ui:Manningovo n}} | pro kapacitu a rychlost |
| {{ui:Nejmenší rychlost}} / {{ui:Největší rychlost}} | při hloubce potrubí, kterou má samotný maximální průtok |
| {{ui:Nejvíce z plného průtoku}} | jak plné smí potrubí běžet při maximu, jako procento toho, co nese při plném průtoku |

Výchozí hodnoty jsou zástupné, ne norma. Použijte hodnoty, které zveřejňuje vaše agentura.

## Co se počítá

Pro každé potrubí, v pořadí toku:

- maximální průtok = obyvatelé × průtok na osobu × součinitel špičky + plocha × infiltrace
- kapacita při plném průtoku (Manningova rovnice při sklonu potrubí) a jak plné je maximum
- normální hloubka maximálního průtoku a rychlost v ní

Tabulka **Výsledky splaškové kanalizace** vypisuje u každého potrubí obyvatele, součinitel špičky, maximální průtok (l/s, nebo gpm a krychlové stopy za sekundu), naplnění v procentech a rychlost. Pod ní jsou vypsány problémy: potrubí plnější, než je limit, pomalejší než nejmenší rychlost (nemusí se samo čistit), rychlejší než největší, nebo bez spádu. {{ui:Navrhnout profily potrubí pro tyto průtoky}} vybere pro každé potrubí nejmenší normalizovanou velikost (200 mm nebo 8 palců a více), která nese jeho maximum v rámci limitu; jedno {{key:Mod+Z}} to vrátí zpět.

:::note
Toto je ustálený maximální průtok, který počítá návrhový list, zkontrolovaný proti zveřejněnému návrhovému listu až do jeho vytištěného zaokrouhlení. Není to model stoky v čase: žádné hydrogramy, akumulace, čerpadla ani přepady. Viz [Ještě není hotovo](topic:not-built-yet).
:::

Rychlosti používají Manningovu rovnici se stejným n v každé hloubce. Některé agentury nechají n v částečně plných grafech měnit s hloubkou, což dá o něco nižší rychlost v potrubí plném z 60 až 70 procent (asi o 3 procenta méně).
