---
title: Zoznam rastlín
summary: Asi 420 bežných rastlín mierneho a stredomorského pásma s ich veľkosťami, odolnosťou, svetlom a vodou, prehľadávateľných v ľubovoľnom jazyku, plus váš vlastný zoznam uložený s projektom.
keywords: zoznam rastlín, databáza rastlín, druh, botanický názov, bežný názov, paleta rastlín, zoznam škôlky, pásmo odolnosti, csv, import rastlín, export rastlín, moje rastliny, zoznam stromov, zoznam kríkov, knižnica rastlín
from: 7ed09e7e
---

Časť **Rastliny** v ľavom paneli zobrazuje každú rastlinu, ktorú môžete umiestniť. Kliknutím na rastlinu zobrazíte jej veľkosti a nastavíte ju ako rastlinu, ktorú používajú {{ui:Plant}}, {{ui:Bed}} a {{ui:Hedge}}.

## Vyhľadávanie a filtrovanie

Napíšte do poľa **Hľadať**: ľubovoľné slovo z názvu rastliny v ľubovoľnom jazyku (angličtina, španielčina, portugalčina), jej botanický názov, typ alebo slovo v jej poznámkach. Každé slovo, ktoré napíšete, sa musí zhodovať, takže `quercus evergreen` nájde stále zelené duby. Diakritika nie je dôležitá.

Zúžte zoznam pomocou **Typ**, **Svetlo**, **Voda** a **Pásmo odolnosti** (zóna USDA, v ktorej sa váš pozemok nachádza: rastlina sa zobrazí, ak je zóna v jej rozsahu).

## Čo rastlina obsahuje

| Pole | Význam |
|---|---|
| Typ | Strom, krík, živý plot, tráva (vrátane trávnikov), trvalka, pôdopokryvná rastlina alebo popínavá rastlina |
| V dospelosti | Výška a rozpätie rastliny pestovanej v záhrade alebo na ulici, v metroch |
| Pri výsadbe | Veľkosť, s ktorou sa vysádza, a jej kontajner |
| Rozstup | Od stredu k stredu v záhone alebo pozdĺž živého plotu |
| Pásmo odolnosti | Zóny USDA, v ktorých je zvyčajne odolná |
| Svetlo, voda, pôda | Čo potrebuje |
| Poznámky | Použitie a upozornenia, napríklad jedovaté časti alebo rastlina, ktorá sa šíri |

:::note
Vstavaný zoznam vznikol pre CadCraft zo všeobecných záhradníckych znalostí: typické veľkosti, zaokrúhlené. Nie je to katalóg žiadnej škôlky. Veľkosti a odolnosť overte u miestnej škôlky. Najznámejšie invazívne rastliny Iberského polostrova a veľkej časti mierneho pásma sú úmyselne vynechané a niekoľko rastlín, ktoré sú invazívne inde, má poznámku.
:::

## Vaše vlastné rastliny

- **Pridať do zoznamu tohto projektu** skopíruje rastlinu do vlastného zoznamu projektu, kde sa uloží spolu s projektom. Rastlina vo vašom zozname nahradí vstavanú s rovnakým kľúčom, takže jej veľkosti môžete zmeniť pre svoj región.
- **Importovať zoznam rastlín…** načíta CSV (alebo súbor rastlín). CSV potrebuje stĺpec s botanickým názvom a ideálne typ, výšku a rozpätie; fungujú aj názvy stĺpcov vo vlastnej reči (Latin, Common name, Height, Spread, Width, Zone). Čiarky, bodkočiarky alebo tabulátory a desatinné čiarky sa čítajú. Prázdne veľkosti pri výsadbe, rozstupy a kontajnery dostanú rozumné predvolené hodnoty pre daný typ.
- **Exportovať ako CSV** uloží váš zoznam (alebo, ak žiadny nemáte, rastliny, ktoré ukazuje vyhľadávanie) na otvorenie v tabuľkovom procesore.

Zoznam rastlín sa číta ako každý súbor zvonka: čokoľvek, čo sa nedá použiť, sa vynechá a spočíta.

## Rastliny v iných aplikáciách

Zoznam rastlín je jedna knižnica pre každú aplikáciu CadCraft: BimCraft a ModelCraft majú rovnaký zoznam, ale ich vlastné **Umiestniť z knižnice** zatiaľ rastliny neponúka. Dnes sa rastliny do BIM modelu dostanú cez krajinný IFC aplikácie CivilCraft (každá rastlina ako `IfcGeographicElement`). Pozri [Výsadba](topic:planting#ifc).
