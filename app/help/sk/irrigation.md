---
title: Návrh zavlažovania
summary: Pomocný výpočet, nie overený projekt: hlavice, bočné rady, hlavný rad, ventily a kvapkové hadice na pozemku; zóny nájdené z potrubí; strata tlaku podľa Hazen–Williamsa, najhoršia hlavica, prietok a tlak voči prívodu, intenzity zrážok, časy behu, pokrytie a kusovník.
keywords: zavlažovanie, hlavica, hlavice, postrekovač, rotor, rotačná dýza, bublinkovač, kvapková hadica, kvapkač, ventil, zóna, stanica, riadiaca jednotka, hlavný rad, bočný rad, miesto pripojenia, prívod vody, tlak, psi, kpa, prietok, gpm, strata trením, hazen williams, intenzita zrážok, čas behu, pokrytie, hlavica k hlavici, kusovník
from: 7d6342c1
---

:::warning
Toto je pomocný výpočet, nie overený projekt: projektant zavlažovania skontroluje každý výsledok, skôr než sa čokoľvek postaví.
:::

## Navrhnite systém

1. V sekcii **Zavlažovanie** na ľavej strane zvoľte **Hlavicu**, jej **Oblúk** a kde oblúk začína, a veľkosti potrubia pre bočné rady a hlavný rad.
2. {{ui:Zavlažovanie}} › {{ui:Miesto pripojenia}}: kliknite, kde sa prívod vody pripája. V paneli Vlastnosti nastavte jeho **tlak**, **dostupný prietok** a stratu vodomera a spätnej klapky.
3. {{ui:Zavlažovanie}} › {{ui:Ventil}}: kliknite, kam ide ventil každej zóny. Ventil začína zónu.
4. {{ui:Zavlažovanie}} › {{ui:Hlavica}}: kliknite na miesta hlavíc; každé kliknutie umiestni jednu.
5. {{ui:Zavlažovanie}} › {{ui:Bočné potrubie}}: kliknite od ventilu cez jeho hlavice a stlačte {{key:Enter}}. {{ui:Hlavný rad}}: od miesta pripojenia k každému ventilu.

Konce potrubia sa prichytávajú k hlavicám, ventilom, prívodu a iným koncom potrubia, takže sa sieť spojí. Zóna je všetko, čo sa dosiahne od jej ventilu cez bočné rady; hlavný rad nesie jednu zónu naraz.

## Kvapkanie

{{ui:Zavlažovanie}} › {{ui:Kvapkacia hadica}}: kliknite pozdĺž čiary, začínajte tam, kde sa napája (koniec bočného radu alebo ventil). V paneli Vlastnosti nastavte **prietok kvapkača** a **rozstup**; jej prietok je daný kvapkačmi pozdĺž nej.

## Kontrola

{{ui:Zavlažovanie}} › {{ui:Skontrolovať systém…}} vypíše každú zónu:

| Stĺpec | Ako sa počíta |
|---|---|
| Prietok | Súčet prietokov hlavíc (a kvapkových hadíc) |
| Pri ventile | Pracovný tlak najhoršej hlavice plus straty v potrubí k nej (Hazen–Williams, vnútorný priemer potrubia, zmena výšky) a strata cez ventil |
| Pri prívode | To isté plus strata hlavného radu, ktorý nesie túto zónu, a strata vodomera a spätnej klapky |
| Zrážky | Prietok hlavíc vydelený plochou, ktorú zavlažujú pri rozstupe hlavica k hlavici |
| Minúty za týždeň | Na uplatnenie nastavenia **Voda za týždeň** |
| Problémy | Rýchlosť nad limitom, hlavica mimo svojho rozsahu tlaku, postrekovače a rotory na jednom ventile, nedostatočný tlak alebo prietok na prívode, hlavice bez zóny, slučky |

Vyberte ventil a uvidíte údaje jeho zóny a jeho najhoršiu hlavicu zakrúžkovanú na pôdoryse. Kusovník počíta hlavice podľa druhu a oblúka, potrubie podľa veľkosti, ventily, kvapkovú hadicu a kvapkače a stanice riadiacej jednotky. **Uložiť ako CSV** uloží oboje.

Nastavenia v sekcii Zavlažovanie: **Hazen–Williams C** (150 pre nové plastové potrubie), **najvyššia rýchlosť prietoku** v potrubí (1.5 m/s), **strata cez ventil** a **Voda za týždeň**. Ide o označené predvolené hodnoty.

## Pokrytie

{{ui:Zavlažovanie}} › {{ui:Zobraziť pokrytie}} ukáže, akú časť plochy hlavice nechávajú suchú, akú časť zavlažujú dve alebo viac hlavíc a ktoré hlavice nedosahujú k susednej (rozstup hlavica k hlavici).

## Hlavice

Uvedené hlavice sú **všeobecné** druhy, ktoré CadCraft zostavil z návrhových intenzít zrážok (pevné postrekovače, rotačné dýzy, prevodové rotory, bublinkovače, mikropostrekovače, kvapkače), nie produkty žiadneho výrobcu. **Pridať hlavice zo súboru…** načíta vaše vlastné hlavice (zoznam JSON s dosahom, prietokom alebo intenzitou zrážok každej hlavice a rozsahom tlaku); uložia sa spolu s projektom. Údaje zverejnené výrobcom sa pridajú iba so zaznamenaným súhlasom tohto výrobcu.

Pod všeobecnými hlavicami má zoznam **typické hlavice** (ich názvy končia na „typické hodnoty“): veľkosti dýz pevných postrekovačov, rotačných dýz a prevodových rotorov, mikropostrekovače, bublinkovače a kvapkače, s polomerom, prietokom a rozsahom tlaku. CadCraft ich vypočítal z verejne publikovaných vzorcov (rovnica otvoru pre prietok, škálovanie dosahu prúdu pre polomer) a menovitých tried prietoku, len z otvorených zdrojov; žiadna tabuľka výrobcu sa nekopíruje. Vyberte jednu a výber zobrazí jej základ a licenciu. Projekt, ktorý ju používa, si v súbore projektu ponechá hlavicu aj jej zdroj. Slúžia na plánovanie: pred stavbou overte vlastné údaje skutočnej hlavice.
