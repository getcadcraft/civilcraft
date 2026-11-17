---
title: Záznamy rastlín, kultivary a dodané veľkosti
summary: Zoznam rastlín vášho projektu ako tabuľka: kultivary, dodané veľkosti (kontajner, koreňový bal, obvod, čistý kmeň), hustota, poznámky k špecifikácii, CSV dovnútra a von; každá umiestnená rastlina uvádza veľkosť; značky rastlín podľa mierky a vaše vlastné značky a 3D modely.
keywords: tabuľka rastlín, databáza rastlín, kultivar, odroda, dodaná veľkosť, kontajner, koreňový bal, holý koreň, obvod kmeňa, čistý kmeň, hustota, rastliny na meter štvorcový, špecifikácia, poznámky k špecifikácii, značka rastliny, blok, vlastná značka, 3D rastlina, úroveň detailu, mierka
from: 12251beb
---

Otvorte {{ui:Plant table}} z ponuky {{ui:More}} v skupine Krajina alebo z časti Rastliny. Každý riadok je záznam rastliny v zozname tohto projektu (záznam zo zoznamu rastlín sa skopíruje, keď ho pridáte). Každá úprava sa kontroluje rovnako ako importovaný súbor a je jedným krokom späť.

## Stĺpce

- **Botanický názov**, **Bežný názov**, **Typ**, **Výška** a **Rozpätie** v dospelosti (metre).
- **Rozstup** (od stredu k stredu) alebo **Hustota** (rastliny na m²). Záhon záznamu s hustotou a bez rozstupu sa vyplní touto hustotou podľa jeho vlastného vzoru (trojuholníkový alebo štvorcový).
- **Dodané veľkosti**: jeden záznam na veľkosť, oddelené `;`. Každý záznam je identifikátor, druh (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) a potom ľubovoľné z: objem `10L`, výška `h0.6`, rozpätie `s0.4`, obvod `g14-16` (cm), čistý kmeň `st1.8`. Príklad: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Kultivary**: názvy oddelené `;`. Kultivar si ponechá vlastné veľkosti a poznámky, ak ich mal importovaný súbor.
- **Poznámky k špecifikácii**.

{{ui:Duplicate}} skopíruje riadok pod novým kľúčom; {{ui:Save as CSV}} a {{ui:Save as a plants file}} zapíšu zoznam (riadky CSV pre kultivary sú pod ich druhom, s `cultivar_of`). Import CSV alebo súboru rastlín ich zlúči.

## Váš vlastný zoznam rastlín z Knižnice

Prihláste sa do svojho účtu CadCraft (Nastavenia, Vaše doplnky, Prihlásiť sa) a tabuľka rastlín môže použiť zoznam, ktorý máte v Knižnici:

- {{ui:From my Library list}} prinesie vaše vlastné položky rastlín (aj tie, ktoré ešte čakajú na kontrolu). Rastlina, ktorú už tu máte, sa aktualizuje z Knižnice; kultivary, dodané veľkosti, hustota a špecifikácia, ktoré ste pridali tu, sa zachovajú.
- {{ui:Save as a plant list}} uloží každý riadok ako vašu vlastnú položku rastliny v Knižnici, jednu položku na druh: nová rastlina je nová položka, zmenená rastlina je nová verzia, nezmenená sa nechá tak. Najprv zaškrtnite políčko: uloženie dá rastliny verejnosti pod CC0. Prvé verejné nahratie od osoby, ktorej ešte nie je dôverované, skontroluje človek, kým sa zobrazí, ako každé nahratie.

Knižnica uchováva základný záznam rastliny. Kultivary, dodané veľkosti, hustota a poznámky k špecifikácii zostávajú v projekte a v súbore rastlín ({{ui:Save as a plants file}}); dialóg pri každom uložení uvedie, koľko riadkov to ovplyvní.

## Umiestnená rastlina uvádza veľkosť

Vyberte rastlinu, živý plot alebo riadok zmesi záhonu či vysadenej plochy: ak má záznam kultivary alebo dodané veľkosti, {{ui:Cultivar and size}} vyberie jednu z nich. Zoznam rastlín potom počíta podľa druhu, kultivaru a veľkosti a popisok ich môže zobraziť: `{botanical} '{cultivar}' {size}` alebo `{full}`.

## Značky rastlín podľa mierky

{{ui:Plant graphics}} (Krajina › More) nastavuje, ako sa rastliny kreslia v pôdoryse: **automaticky** (pri mierke hrubšej ako 1:500 kruh v rozpätí, medzi 1:200 a 1:500 obrys so stredom, jemnejšie podrobná značka; obe mierky sa dajú zmeniť) alebo jedna úroveň pre každú mierku. Dialóg Listy má vlastnú **Podrobnosť rastlín v pôdoryse** pre túto sadu.

Na zázname v časti Rastliny {{ui:Own symbol…}} načíta SVG alebo blok výkresu DXF/DWG a nakreslí ho v rozpätí rastliny na podrobnej úrovni. {{ui:Own 3D model…}} načíta OBJ, STL alebo GLB; v Grafike rastlín zvoľte **Vlastný model každého záznamu**, aby sa zobrazil v 3D. Súbory majú limity (512 KB SVG, 2000 tvarov, 50 000 trojuholníkov) a uchovávajú sa v projekte. Transformácie SVG sa neuplatňujú (dostanete upozornenie, keď ich súbor obsahuje). Pozri [Grafika rastlín, vlastné značky a 3D rastliny](topic:plant-graphics) o úrovniach, limitoch a obsahu GLB.
