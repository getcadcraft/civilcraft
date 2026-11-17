---
title: Vaše knihovna elektrických vedení
summary: Vytvořte si vlastní vodiče, podzemní kabely, podpěry, zařízení a typy výkopů v kategoriích, které pojmenujete, a sdílejte je jako soubory.
keywords: knihovna, vodič, kabel, sloup, podpěra, traverza, izolátor, armatura, kotvení, transformátor, skříň, spojka, výkop, kategorie, csv, import, export
from: 88733744
---

Část **Knihovna** pracovního prostoru Elektrická vedení obsahuje každou položku, kterou může vedení nebo kabel použít. Nic v ní není vázáno na konkrétní zemi ani výrobce: položky si vytváříte podle toho, se kterými pracujete.

## Tři druhy položek

| Druh | Kde je uložena | Můžete ji změnit? |
|---|---|---|
| **Vzory** | Dodávány s CivilCraft, s obecnými hodnotami, které jsme odvodili z vlastností materiálů | Ne: nejprve {{ui:Kopírovat do mé knihovny}} |
| **V projektu** | Přišly se souborem projektu, který jste otevřeli | Ne: nejprve {{ui:Kopírovat do mé knihovny}} |
| **Moje** | Vaše vlastní položky uložené v tomto prohlížeči | Ano, změny se ukládají okamžitě |

Každý projekt si ponechá kopii každé položky, kterou používá, takže se projekt otevře na libovolném počítači se svými vlastními vodiči a sloupy.

:::warning
Vzorové položky jsou jen příklady: každou hodnotu si ověřte u dodavatele. Podzemní kabely nemají záměrně žádný jmenovitý proud, protože ten závisí na tom, jak je kabel uložen.
:::

## Vytvoření položky

1. V **Knihovna** vyberte **Druh** (nadzemní vodiče, podzemní kabely, podpěry, zařízení nebo typy výkopů).
2. Klikněte na {{ui:Nová položka}}, nebo vyberte vzor a klikněte na {{ui:Kopírovat do mé knihovny}} nebo {{ui:Duplikovat}}.
3. Vyplňte její pole. Pole označená `*` jsou ta, která kontroly potřebují. Položka, které některé z nich chybí, je označena `!` a při použití v některém vedení se uvede pod **Kontroly**.
4. Přiřaďte jí **Kategorii**, s `/` mezi úrovněmi: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. Strom se řídí vašimi kategoriemi.

Co každý druh potřebuje:

| Druh | Potřebné pro kontroly |
|---|---|
| Nadzemní vodič | průřez, průměr, hmotnost na metr, pevnost v tahu, modul pružnosti, tepelná roztažnost |
| Podzemní kabel | počet žil, průřez, napětí, průměr, odpor, jmenovitý proud |
| Podpěra | celková délka, jmenovité zatížení (počítané v bodě pod vrcholem), hloubka v zemi |
| Zařízení | jeho typ; jmenovité zatížení pro traverzy, armatury a kotvení; rozteč fází a úbytek pro traverzy; délka pro izolátory; úhel pro kotvení |
| Typ výkopu | hloubka, šířka, krytí kabelů |

## Sdílení

- {{ui:Uložit mou knihovnu}} uloží všechny vaše položky do jednoho souboru `.cclines.json`; {{ui:Otevřít knihovnu…}} ho načte zpět (položky se stejným klíčem se nahradí).
- {{ui:Uložit jako CSV}} uloží druh, který právě vidíte, jako tabulku; {{ui:Otevřít knihovnu…}} načte zpět CSV tohoto druhu. Sloupce mohou být v libovolném pořadí; soubor oddělený středníkem může používat desetinnou čárku.
