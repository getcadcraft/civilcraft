---
title: Wydruk planu do PDF
summary: Wydrukuj wszystko albo bieżący widok do wektorowego PDF na standardowym arkuszu w skali inżynierskiej lub metrycznej, w kolorach warstw lub na czarno.
keywords: wydruk, drukowanie, pdf, arkusz, skala, rozmiar papieru, arkusz planu, publikacja, tabliczka rysunkowa, strzałka północy, pasek skali
from: 9af396ca
---

{{ui:PDF}} tworzy wydruk planu do wektorowego PDF na jednym arkuszu, z paskiem tytułowym, strzałką północy i paskiem skali. PDF jest tworzony w przeglądarce i pobierany; nie przechodzi przez okno drukowania przeglądarki.

## Wydruk

1. Ustaw plan w sekcji **Wyświetlanie**: pokazywana powierzchnia, interwał poziomic i to, co jest włączone. Wydruk stosuje te ustawienia.
2. Jeśli chcesz tylko część terenu, przybliż i przesuń plan do niej.
3. Kliknij {{ui:PDF}} w grupie **Eksport** albo naciśnij {{key:Mod+P}}.
   Otwiera się okno **Wydruk planu do PDF**.
4. Wybierz **Obszar**: {{ui:Everything}} albo {{ui:What is on screen}}.
5. Wybierz **Papier**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 lub A1. Projekt w stopach zaczyna się od Tabloid, projekt w metrach od A3. Arkusze są zawsze ułożone poziomo.
6. Wybierz **Skalę**. Lista oznacza największą skalę, która się mieści, znacznikiem „(mieści się)" i ją zaznacza.
   - Stopy: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metry: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Wybierz **Tusz**: {{ui:Kolory warstw}} albo {{ui:Czarny}}.
8. Przeczytaj linię pod wyborami. Podaje rozmiar obszaru na papierze i rozmiar arkusza, na przykład „Obszar ma 297 × 222 mm przy skali 1" = 40' na arkuszu 432 × 279 mm (poziomo)."
9. Kliknij {{ui:Pobierz PDF}}.
   Przeglądarka pobiera `<name>.pdf`. Pasek stanu podaje „Wydrukowano <name>.pdf w skali 1" = 40'."

Jeśli obszar jest większy od arkusza przy wybranej skali, wydruk jest wyśrodkowany, a krawędzie są przycięte. Wybierz skalę oznaczoną „(mieści się)" albo większy arkusz.

## Co jest na arkuszu

- Plan wyśrodkowany w obszarze rysunku, jako prawdziwe wektory: poziomice, opisy, trasy z kilometrażem, korytarze, place i linie przecięcia skarp, rurociągi, punkty.
- Grubości linii według warstw: trasy, place i rurociągi grubsze; trójkąty i pomocnicze poziomice cieńsze.
- Pasek tytułowy wzdłuż dołu z **Nazwą** projektu, skalą, informacją o interwale poziomic i tym, która powierzchnia (istniejąca czy wyrównana), oraz po prawej datą i numerem kompilacji.
- Strzałka północy w prawym górnym rogu (północ planu jest u góry) i pasek skali w pasku tytułowym.
- Warstwy mapy pokazywane pod planem (obraz, kafelki mapy albo usługa map), gdy zaznaczono **Warstwy mapy pod planem**: są rysowane jako jeden obraz całego obszaru rysunku, w 150 punktach na cal (dpi), pod liniami, a atrybucja mapy trafia do paska tytułowego. CivilCraft czeka do 8 sekund na obrazy map, które wciąż napływają; jeśli niektóre nadal brakują, pasek stanu o tym informuje.

Tekst używa wbudowanej w PDF czcionki Helvetica. Znaki spoza zachodnioeuropejskiego zestawu znaków (Windows-1252) drukują się jako „?", a komunikat na pasku stanu je zlicza.

## Czego nie drukuje się

- Pasma rzędnych.
- Widok profilu. Drukowanie profili nie jest jeszcze dostępne.
- Więcej niż jeden arkusz (dla trasy użyj [arkuszy planu i profilu](topic:plan-profile-sheets)), okien widokowych (viewport), własnej tabliczki rysunkowej ani arkuszy w orientacji pionowej.

:::note
Okno dialogowe informuje, że strzałki spadków są tylko na ekranie. W tej wersji strzałki spadków włączone w **Wyświetlaniu** są drukowane (i eksportowane do DXF). Wyłącz je przed wydrukiem, jeśli ich nie chcesz.
:::

## Drukowanie na papierze

Otwórz pobrany PDF w dowolnej przeglądarce PDF i drukuj w skali 100% (rzeczywisty rozmiar), aby skala pozostała prawdziwa. „Dopasuj do strony" zmienia skalę.
