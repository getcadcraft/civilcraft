---
title: Záznamy rostlin, kultivary a dodávané velikosti
summary: Vlastní seznam rostlin projektu jako tabulka: kultivary, dodávané velikosti (kontejner, kořenový bal, obvod, čistý kmen), hustota, poznámky ke specifikaci, CSV dovnitř i ven; každá umístěná rostlina uvádí velikost; značky rostlin podle měřítka, vlastní značky a 3D modely.
keywords: tabulka rostlin, databáze rostlin, kultivar, odrůda, dodávaná velikost, kontejner, kořenový bal, rootball, holý kořen, obvod kmene, čistý kmen, hustota, rostlin na metr čtvereční, specifikace, poznámky ke specifikaci, značka rostliny, blok, vlastní značka, 3D rostlina, stupeň podrobnosti, měřítko
from: 12251beb
---

Otevřete {{ui:Tabulka rostlin}} z nabídky {{ui:Více}} skupiny Krajina, nebo ze sekce Rostliny. Každý řádek je záznam rostliny ve vlastním seznamu tohoto projektu (záznam ze seznamu rostlin se při přidání zkopíruje). Každá úprava se kontroluje stejně jako importovaný soubor a je jedním krokem zpět.

## Sloupce

- **Botanický název**, **Běžný název**, **Typ**, **Výška** a **Šířka** v dospělosti (metry).
- **Rozestup** (od středu ke středu) nebo **Hustota** (rostlin na m²). Záhon záznamu s hustotou a bez rozestupu se vyplní touto hustotou podle vlastního vzoru (trojúhelníkového nebo čtvercového).
- **Dodávané velikosti**: jeden záznam na velikost, oddělené `;`. Každý záznam je identifikátor, druh (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) a pak libovolné z: objem `10L`, výška `h0.6`, šířka `s0.4`, obvod kmene `g14-16` (cm), čistý kmen `st1.8`. Příklad: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Kultivary**: názvy oddělené `;`. Kultivar si ponechá vlastní velikosti a poznámky, pokud je měl importovaný soubor.
- **Poznámky ke specifikaci**.

{{ui:Duplikovat}} zkopíruje řádek pod novým klíčem; {{ui:Uložit jako CSV}} a {{ui:Uložit jako soubor rostlin}} seznam zapíší (řádky CSV pro kultivary jsou pod svým druhem, s `cultivar_of`). Import CSV nebo souboru rostlin jej sloučí.

## Váš vlastní seznam rostlin z knihovny

Přihlaste se ke svému účtu CadCraft (Nastavení, Vaše doplňky, Přihlásit se) a tabulka rostlin může používat seznam, který máte v knihovně:

- {{ui:Z mého seznamu knihovny}} načte vaše vlastní položky rostlin (včetně těch, které ještě čekají na kontrolu). Rostlina, kterou zde už máte, se aktualizuje z knihovny; kultivary, dodávané velikosti, hustota a specifikace, které jste přidali zde, se zachovají.
- {{ui:Uložit jako seznam rostlin}} uloží každý řádek jako vaši vlastní položku rostliny v knihovně, jednu položku na druh: nová rostlina je nová položka, změněná rostlina je nová verze, nezměněná zůstane beze změny. Nejprve zaškrtněte políčko: uložením zpřístupníte rostliny veřejně pod licencí CC0. První veřejné nahrání od osoby, která zatím není ověřená, zkontroluje člověk dříve, než se zobrazí, stejně jako každé nahrání.

Knihovna uchovává základní záznam rostliny. Kultivary, dodávané velikosti, hustota a poznámky ke specifikaci zůstávají v projektu a v souboru rostlin ({{ui:Uložit jako soubor rostlin}}); dialog při každém uložení uvádí, kolik řádků to ovlivní.

## Umístěná rostlina uvádí velikost

Vyberte rostlinu, živý plot nebo řádek směsi záhonu či osázené plochy: pokud záznam má kultivary nebo dodávané velikosti, {{ui:Kultivar a velikost}} vybere jeden z nich. Rozpis rostlin pak počítá podle druhu, kultivaru a velikosti a popisek je může zobrazit: `{botanical} '{cultivar}' {size}` nebo `{full}`.

## Značky rostlin podle měřítka

{{ui:Grafika rostlin}} (Krajina › Více) nastavuje, jak se rostliny kreslí v půdorysu: **automaticky** (hrubší než 1:500 kruh o šířce rostliny, mezi 1:200 a 1:500 obrys se středem, jemněji podrobná značka; obě měřítka lze změnit), nebo jedna úroveň pro všechna měřítka. Dialog Listy má pro tuto sadu vlastní **Podrobnost rostlin v půdorysu**.

U záznamu v sekci Rostliny {{ui:Vlastní značka…}} načte SVG, nebo blok výkresu DXF/DWG, a nakreslí jej v šířce rostliny na podrobné úrovni. {{ui:Vlastní 3D model…}} načte OBJ, STL nebo GLB; v Grafice rostlin zvolte **Vlastní model každého záznamu**, aby se zobrazil ve 3D. Soubory mají limity (512 KB SVG, 2000 tvarů, 50 000 trojúhelníků) a uloží se do projektu. Transformace SVG se neaplikují (budete upozorněni, pokud je soubor obsahuje). Úrovně, limity a to, co může GLB obsahovat, viz [Grafika rostlin, vlastní značky a rostliny ve 3D](topic:plant-graphics).
