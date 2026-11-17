---
title: Zestawienia: tabele powiązane z obiektami
summary: Zapisane zestawienia z wierszami z roślin, obszarów nasadzeń, nawierzchni, murów, schodów, modyfikatorów terenu lub wszystkich ilości; własne kolumny i formuły, grupy i sumy; CSV, XLSX oraz tabela na arkuszach, zawsze aktualne.
keywords: zestawienie, tabela, zestawienie roślin, zestawienie nawierzchni, ilości, kolumny, formuła, suma, zliczanie, grupa, filtr, csv, xlsx, arkusz kalkulacyjny, tabela na arkuszu
from: 11bc1bac
---

{{ui:Zestawienia}} (Krajobraz › Więcej) otwiera zestawienia tego projektu. Za pierwszym razem tworzone są dla Ciebie **zestawienie roślin** oraz **zestawienie nawierzchni i obszarów**. Zestawienie jest wyliczane z obiektów za każdym razem, gdy jest wyświetlane, zapisywane lub umieszczane na arkuszu: zmień rabatę, a jej liczby zmienią się wszędzie.

- **Wiersze z**: rośliny (jeden wiersz na gatunek, odmianę i rozmiar), obszary nasadzeń, nawierzchnie, mury, schody, modyfikatory terenu (wykop i nasyp) lub wszystkie ilości.
- **Kolumny**: pole (`qty`, `area`, `botanical` lub nazwa w nawiasach kwadratowych, np. `[Net area]`) albo formuła: `+ - * / ^ %`, `&` do łączenia tekstu, `= <> < <= > >=`, oraz `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Formuła, której nie da się obliczyć, pokazuje w komórce `#ERR` (lub `#DIV/0`). Formuły czyta własny parser CadCraft; nic w nich nie jest uruchamiane jako kod.
- **Suma** dla każdej kolumny (suma, liczba, średnia, najmniejsza, największa), **Grupuj wg** (sumy częściowe dla każdej grupy) oraz **Tylko wiersze, gdzie**.
- {{ui:Zapisz jako CSV}}, {{ui:Zapisz jako XLSX}} oraz **Umieść to zestawienie na arkuszach** (Arkusze › Zestawienia rysuje je jako tabelę, na tylu arkuszach, ile potrzeba).

Etykiety na roślinach i obszarach używają tych samych nazw pól (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
