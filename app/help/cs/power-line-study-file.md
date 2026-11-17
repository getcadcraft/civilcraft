---
title: Soubory studie pro jiný program vedení (.DON)
summary: Uložte jedno nadzemní vedení jako studijní soubor .DON, nebo načtěte podpěry jiného vedení do nového. Nezkoušeno s programem, který je čte.
keywords: don, .don, soubor studie, xml, export, import, program nadzemního vedení, napínání, canton
from: 1abc4d07
---

Některé programy pro nadzemní vedení ukládají studii do souboru `.DON` (textové XML). CivilCraft umí jedno vedení zapsat do takového souboru a načíst podpěry z něj.

:::warning
**Nezkoušeno.** Vytvořili jsme to podle seznamu názvů polí formátu, který sdílel uživatel, ne podle skutečného souboru, a své soubory jsme v programu, který je čte, neotevřeli. Otevřete soubor tam a před použitím zkontrolujte každou hodnotu. Pokud můžete sdílet soubor `.DON` (s vynechanými údaji o klientovi), pomůže nám to to opravit.
:::

## Uložení souboru studie

1. Přiřaďte vedení vodič a ujistěte se, že má výsledky (v jeho Vlastnostech není „nevypočítáno“).
2. {{ui:Více}} › {{ui:Uložit soubor studie (.DON)…}}, vyberte vedení, přidejte popis a číslo zakázky.
3. {{ui:Uložit soubor studie}}.

Soubor obsahuje podpěry vedení (souřadnice, terén, výšky, role, traverzu, podpěru ponechanou nebo navrženou, zatížení pro každý zatěžovací stav, základ), jeden úsek mezi koncovými upevněními (vodič, napětí, rozhodující rozpětí, rozpětí, napětí a parametr řetězovky, největší napětí pro každý zatěžovací stav) a montážní tabulky. Délky jsou v metrech a síly v daN. Text se zapisuje v kódování Latin-1, takže znak mimo něj se změní na `?`.

## Načtení souboru studie

{{ui:Více}} › {{ui:Otevřít soubor studie (.DON)…}} načte podpěry do nového vedení. Vodič, podpěry a traverzy se přiřadí k vaší knihovně podle názvu. Cokoli nenalezeného necháte vybrat ve Vlastnostech.
