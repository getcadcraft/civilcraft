---
title: Prievis a napätie
summary: Vaše zaťažovacie stavy (teplota, vietor, námraza) a limity napätia, ako CivilCraft vypočíta napätie každého úseku, a tabuľky vešania.
keywords: prievis, napätie, zaťažovací stav, teplota, vietor, námraza, asymetrická námraza, rozhodujúce pole, ekvivalentné pole, zmena stavu, reťazovka, tabuľka vešania, pevnosť v pretrhnutí, bežné namáhanie
from: f8876c35
---

## Zaťažovacie stavy a limity

{{ui:Viac}} › {{ui:Zaťažovacie stavy a limity…}} upravuje pravidlá, ktorými sa riadi každé vedenie v projekte.

- **Zaťažovacie stavy**: teplota, tlak vetra na vodič (Pa) a radiálna námraza (mm, s jej hustotou). Prvý stav je referenčný.
- **Limity napätia**: podiel pevnosti vodiča v pretrhnutí, pri vodorovnom napätí alebo pri najväčšom napätí na podpere, v jednom zaťažovacom stave. Alebo zadajte vodorovné napätie sami.
- **Odstupy**: odstup, ktorý vodič dodržiava nad terénom, cestou, budovou a podobne. Pridávajte, premenúvajte a odstraňujte ich: sú vaše. Pod nimi zvoľte pravidlá pre **Rastliny v krajine pod vedením**, **Múry v krajine pod vedením** a **Podzemné križovania**.
- **Stavy použité pri kontrolách**: ktorý stav dáva najväčší prievis (horúco), výchylku izolátora (vietor), námrazu a námrazu na jednej strane podpery.
- **Činitele**: činiteľ vzdialenosti fáz k, najväčšia výchylka izolátora, činiteľ na zaťaženie podpier a armatúr, uhly zalomenia, ktoré určujú uhlové a kotevné podpery, najmenšie krytie zakopaných káblov a najväčší úbytok napätia.

## Balíky: pravidlá a knižnica pre krajinu

CivilCraft neobsahuje pravidlá žiadnej krajiny. **Balík** spája sadu pravidiel a knižnicu v jednom súbore (`.cclinepack.json`) pre krajinu, prevádzkovateľa siete alebo firmu:

- **Uložiť ako balík…** v {{ui:Zaťažovacie stavy a limity…}} zapíše zobrazenú sadu pravidiel a vašu knižnicu (alebo, keď vaša knižnica ešte nič neobsahuje, položky, ktoré tento projekt používa). Najprv zadajte **Krajinu alebo región**.
- **Otvoriť sadu pravidiel alebo balík…** načíta balík, súbor pravidiel alebo súbor knižnice. Pravidlá balíka sa zobrazia v dialógovom okne (kliknutím na **Použiť** ich použijete) a jeho položky sa pridajú do vašej knižnice.
- Balíky, ktoré iní zdieľajú, sú uvedené na stránke doplnkov pod **Balíky pre elektrické vedenia**. Dva príkladové balíky ukazujú formát; nie sú pravidlami žiadnej krajiny.

Každý balík sa pri otvorení kontroluje ako každý súbor. Každú hodnotu overte podľa platnej normy, skôr než sa čokoľvek vytvorí.

Dve príkladové sady pravidiel slúžia ako východisko: **Príklad: chladné podnebie** a **Príklad: mierne podnebie**. Ich čísla nepochádzajú z žiadnej normy: nastavte hodnoty, ktoré dáva vaša norma. {{ui:Uložiť pravidlá}} a {{ui:Otvoriť pravidlá…}} zdieľajú sadu pravidiel ako súbor.

## Výpočet napätia

Pre každý úsek medzi kotvením:

1. **Rozhodujúce pole** je √(ΣL³ ÷ ΣL) z jeho polí.
2. Každý limit sa prepočíta na vodorovné napätie v referenčnom stave pomocou **rovnice zmeny stavu** na rozhodujúcom poli: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Najobmedzujúcejší z nich určuje napätie.
3. Napätie každého zaťažovacieho stavu vychádza z tohto napätia a tvar každého poľa je presná **reťazovka** cez jeho dva upevňovacie body (vrátane polí na svahu): prievis od tetivy, dĺžka a napätie na každom konci.

Zaťaženie na meter v stave: tiaž plus námraza (plocha námrazy × hustota × g) zvisle; tlak vetra × priemer s námrazou vodorovne.

## Tabuľky vešania

{{ui:Viac}} › {{ui:Tabuľky vešania…}} vypíše pre každý úsek vodorovné napätie a prievis každého poľa pri každej teplote zo sady pravidiel (na začiatok od −5 °C do 40 °C po 5 °C), v bezvetrí. Uložte ich a tabuľku podpier ako CSV.

Nezahrnuté: dotvarovanie vodiča v priebehu rokov a predĺženie nového vodiča. Pridajte ich cez teploty, pri ktorých napínate vodiče.
