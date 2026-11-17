---
title: Kontrola exportu IFC podle IDS klienta
summary: Načtěte soubor .ids, který Vám dal klient nebo silniční správa, a v Problémech uvidíte každý exportovaný prvek, který mu nevyhovuje.
keywords: ids, specifikace předávání informací, buildingsmart, požadavky, předání, kontrola, validace, qa, export ifc, ifc 4.3, osa trasy, silnice, veřejná zakázka
from: 183d9a0e
---

## Co uděláte

IDS (Information Delivery Specification, standard buildingSMART) je seznam toho, co musí IFC obsahovat. Veřejné zadávání ho často posílá spolu se zakázkou. CivilCraft zkontroluje IFC, které tento projekt exportuje, ve verzi IFC, kterou jste zvolili pro export, proti němu a vypíše každý prvek, který nevyhovuje.

## Postup

1. Otevřete svůj projekt.
2. Klikněte na {{ui:IFC}} ve skupině Export na panelu nástrojů. V dialogu vyberte verzi IFC, kterou budete předávat.
3. Klikněte na {{ui:Check against IDS…}}.
4. Klikněte na {{ui:Load an .ids file…}} a vyberte soubor. Nic se nenahrává.
5. Přečtěte výsledek: každou specifikaci s {{ui:Pass}} nebo {{ui:Fail}} a kolik prvků se na ni vztahuje.
6. Otevřete Problémy ({{key:Ctrl+Shift+M}}) a klikněte na selhání, abyste vybrali osu trasy, plošinu, potrubí, objekt nebo hmotu budovy, ze kterého pochází.

## Co uvidíte

- Jedno varování na každý exportovaný prvek a požadavek, který nesplňuje, s názvem specifikace, tím, co IDS žádá, a tím, co export obsahuje.
- Zpráva o kontrole (v Problémech) začíná IDS: jeho názvem, verzí, autorem a počty každé specifikace.

## Dobré vědět

- IDS se uloží do souboru projektu, takže se při otevření projektu zkontroluje znovu. Načtení nebo zapomenutí je jeden krok zpět.
- Každá změna se zkontroluje o chvíli později. U velkých povrchů zápis trvá déle, takže kontrola mezi běhy čeká o něco déle.
- Kontrola používá stejný soubor, jaký zapisuje export {{ui:IFC}}, ve verzi, která tam byla naposledy vybrána (IFC 4.3, pokud jste žádnou nevybrali).
- Čísla se porovnávají v jednotkách SI: projekt ve stopách se nejprve převede na metry.

- Vzory v IDS se čtou jako celá hodnota. Znak `^` na začátku a `$` na konci se také berou jako „celá hodnota“, jak to většina souborů IDS myslí.

## Dále

- [Export IFC](topic:ifc)
