---
title: Seznam rostlin
summary: Asi 420 běžných rostlin mírného pásma a středomořských rostlin s jejich velikostmi, mrazuvzdorností, osvětlením a vláhou, prohledatelných v libovolném jazyce, plus váš vlastní seznam uložený s projektem.
keywords: seznam rostlin, databáze rostlin, druh, botanický název, běžný název, paleta rostlin, seznam školky, zóna mrazuvzdornosti, csv, import rostlin, export rostlin, moje rostliny, seznam stromů, seznam keřů, knihovna rostlin
from: 7ed09e7e
---

Sekce **Rostliny** v levém panelu vypisuje každou rostlinu, kterou můžete umístit. Kliknutím na ni zobrazíte její velikosti a nastavíte ji jako rostlinu, kterou použijí **Zasadit**, **Záhon** a **Živý plot**.

## Hledání a filtrování

Zadejte do pole **Hledat** kterékoli slovo z názvu rostliny v libovolném jazyce (angličtina, španělština, portugalština), její botanický název, typ nebo slovo z jejích poznámek. Každé zadané slovo musí odpovídat, takže `quercus evergreen` najde stálezelené duby. Diakritika nehraje roli.

Seznam zúžíte pomocí **Typ**, **Osvětlení**, **Vláha** a **Mrazuvzdornost (zóna)** (zóna USDA, ve které je vaše lokalita: rostlina je v seznamu, když zóna spadá do jejího rozsahu).

## Co rostlina obsahuje

| Pole | Význam |
|---|---|
| Typ | Strom, keř, živý plot, tráva (včetně trávníků), trvalka, půdopokryvná rostlina nebo popínavá rostlina |
| V dospělosti | Výška a šířka rostliny dospělé v zahradě nebo na ulici, v metrech |
| Při výsadbě | Velikost, v jaké se sází, a její kontejner |
| Rozestup | Od středu ke středu v záhonu nebo podél živého plotu |
| Mrazuvzdornost (zóna) | Zóny USDA, ve kterých obvykle přezimuje |
| Osvětlení, vláha, půda | Co potřebuje |
| Poznámky | Použití a upozornění, například jedovaté části nebo rostlina, která se šíří |

:::note
Vestavěný seznam byl pro CadCraft sestaven z obecných zahradnických znalostí: typické velikosti, zaokrouhlené. Nejde o katalog žádné školky. Velikosti a mrazuvzdornost ověřte v místní školce. Nejznámější invazivní rostliny Pyrenejského poloostrova a velké části mírného pásma jsou záměrně vynechány a několik rostlin, které jsou invazivní jinde, má poznámku.
:::

## Vaše vlastní rostliny

- **Přidat do seznamu tohoto projektu** zkopíruje rostlinu do vlastního seznamu projektu, kde se uloží spolu s projektem. Rostlina ve vašem seznamu nahradí vestavěnou se stejným klíčem, takže můžete změnit její velikosti pro svůj region.
- **Importovat seznam rostlin…** načte CSV (nebo soubor rostlin). CSV potřebuje sloupec s botanickým názvem a ideálně typ, výšku a šířku; fungují i názvy sloupců vlastními slovy (Latin, Common name, Height, Spread, Width, Zone). Čárky, středníky nebo tabulátory a desetinné čárky se čtou. Prázdné velikosti při výsadbě, rozestupy a kontejnery dostanou pro daný typ rozumné výchozí hodnoty.
- **Exportovat jako CSV** uloží váš seznam (nebo, pokud žádný není, rostliny, které ukazuje hledání), aby se dal otevřít v tabulkovém procesoru.

Seznam rostlin se čte jako každý soubor zvenčí: cokoli, co nelze použít, se vynechá a spočítá.

## Rostliny v ostatních aplikacích

Seznam rostlin je jedna knihovna pro každou aplikaci CadCraft: BimCraft a ModelCraft mají stejný seznam, ale jejich vlastní Umístit z knihovny zatím rostliny nenabízí. Rostliny se dnes do modelu BIM dostanou přes IFC krajiny z CivilCraftu (každá rostlina jako `IfcGeographicElement`). Viz [Výsadba](topic:planting#ifc).
