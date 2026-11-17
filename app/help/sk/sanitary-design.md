---
title: Výpočet splaškových prietokov a kontrola kanalizácie
summary: Zadajte ľudí a plochu, ktoré vstupujú do každej šachty splaškovej siete; CivilCraft ich zosčíta po sieti nadol, vypočíta špičkový prietok so špičkovým súčiniteľom a infiltráciou a skontroluje kapacitu a rýchlosť každého potrubia.
keywords: splašková, kanalizácia, splašková kanalizácia, odpadová voda, výpočtový prietok, špičkový prietok, špičkový súčiniteľ, Harmon, Babbitt, infiltrácia, počet obyvateľov, na obyvateľa, stupeň naplnenia, samočistenie, rýchlosť, dimenzovanie potrubia, výpočtový list
from: 73ba197a
---

Splaškové výpočtové prietoky fungujú na [sieti potrubí](topic:pipe-network), keď jej {{ui:Typ}} je {{ui:Splašková}}. Keď nič nie je vybrané, pravý panel potom zobrazuje **Splaškové výpočtové prietoky**, kde dažďová sieť zobrazuje odvodnenie dažďovej kanalizácie.

## Zadanie prítoku

1. Vyberte šachtu. Pod **Splaškové výpočtové prietoky** zadajte {{ui:Ľudia vstupujúci sem}} a {{ui:Plocha vstupujúca sem}} (hektáre v projekte v metroch, akre v projekte v stopách).
2. Pre obchody, kancelárie alebo priemysel zadajte ekvivalentných ľudí: plocha krát počet ľudí na hektár (alebo akre), ktorý používa váš úrad. Plocha sa v oboch prípadoch počíta pre infiltráciu.
3. Zopakujte pre každú šachtu, kde sa pripája ulica alebo pozemok. Šachta, kde nič nepripája, ostane na oboch hodnotách 0.

Každé potrubie nesie všetko, čo vstupuje do jeho hornej šachty a nad ňu. Vyberte šachtu, aby ste videli, čo ňou prechádza.

## Nastavenia

| Nastavenie | Čo to znamená |
|---|---|
| {{ui:Prietok na osobu}} | priemerný prietok jednej osoby za deň: litre (projekt v metroch) alebo americké galóny (projekt v stopách) |
| {{ui:Infiltrácia}} | podzemná voda, ktorá presakuje dnu: litre za sekundu na hektár, alebo galóny za deň na akre |
| {{ui:Špičkový súčiniteľ}} | Harmon, 1 + 14 / (4 + √P), alebo Babbitt, 5 / P^0.2, kde P je počet obyvateľov v tisícoch |
| {{ui:Špičkový súčiniteľ najmenej}} / {{ui:Špičkový súčiniteľ najviac}} | súčiniteľ je držaný medzi týmito dvoma hodnotami |
| {{ui:Manningovo n}} | pre kapacitu a rýchlosť |
| {{ui:Najmenšia rýchlosť}} / {{ui:Najväčšia rýchlosť}} | pri hĺbke samotného špičkového prietoku v potrubí |
| {{ui:Najviac z plnej kapacity}} | ako plné môže potrubie byť v špičke, ako percento toho, čo nesie pri plnom prietoku |

Východiskové hodnoty sú zástupné, nie norma. Použite hodnoty, ktoré zverejňuje váš úrad.

## Čo sa vypočíta

Pre každé potrubie v poradí toku:

- špičkový prietok = ľudia × prietok na osobu × špičkový súčiniteľ + plocha × infiltrácia
- kapacita pri plnom prietoku (Manningova rovnica pri sklone potrubia) a aké plné ho špičkový prietok robí
- normálna hĺbka špičkového prietoku a rýchlosť v nej

Tabuľka **Výsledky splaškovej kanalizácie** uvádza pre každé potrubie ľudí, špičkový súčiniteľ, špičkový prietok (L/s, alebo gpm a kubické stopy za sekundu), stupeň naplnenia a rýchlosť. Pod ňou sú uvedené problémy: potrubie plnšie ako limit, pomalšie ako najmenšia rýchlosť (nemusí sa samo čistiť), rýchlejšie ako najväčšia alebo bez spádu. {{ui:Dimenzovať potrubia pre tieto prietoky}} vyberie pre každé potrubie najmenšiu normalizovanú veľkosť (200 mm alebo 8 palcov a viac), ktorá prenesie jeho špičku v rámci limitu; jeden {{key:Mod+Z}} to vráti späť.

:::note
Toto je ustálený špičkový prietok, aký počíta výpočtový list, overený voči uverejnenému výpočtovému listu na jeho vytlačené zaokrúhlenie. Nie je to model kanalizácie v čase: žiadne hydrogramy, akumulácia, čerpadlá ani prepady. Pozri [Ešte nie je hotové](topic:not-built-yet).
:::

Rýchlosti používajú Manningovu rovnicu s rovnakým n pri každej hĺbke. Niektoré úrady majú diagramy pre čiastočné naplnenie, kde sa n mení s hĺbkou, čo dáva o niečo nižšiu rýchlosť v potrubí naplnenom na 60 až 70 % (asi o 3 % menej).
