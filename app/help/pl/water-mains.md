---
title: Sieci wodociągowe: ciśnienia, przepływy i przepływ pożarowy
summary: Narysuj sieć ciśnieniową z węzłów, zbiorników zasilających, zbiorników, rurociągów, pomp i zaworów redukcyjnych ciśnienia na planie; CivilCraft oblicza wysokości piezometryczne, ciśnienia i przepływy (Hazen–Williams, sieci oczkowe), przepływ dostępny do gaszenia pożaru i dobowe zapotrzebowanie. Funkcja w laboratorium; każdy wynik wymaga sprawdzenia przez inżyniera.
keywords: woda, sieć wodociągowa, dystrybucja wody, sieć ciśnieniowa, rurociąg ciśnieniowy, sieć oczkowa, hazen-williams, współczynnik C, strata wysokości, ciśnienie resztkowe, przepływ pożarowy, hydrant, zapotrzebowanie, węzeł, zbiornik zasilający, zbiornik, pompa, krzywa pompy, zawór redukcyjny ciśnienia, prv, zawór zwrotny, okres rozszerzony, epanet, inp, prędkość
from: df46bf6d
---

Sieci wodociągowe to ciśnieniowa część terenu: rury zawsze pełne, przez które woda jest tłoczona ze zbiornika zasilającego, zbiornika albo pompy. CivilCraft oblicza wysokość piezometryczną i ciśnienie w każdym węźle oraz przepływ w każdej rurze, także w sieciach oczkowych, gdzie woda ma więcej niż jedną drogę. Funkcja jest w laboratorium, dopóki jest sprawdzana.

**Wyłącznie pomoc obliczeniowa.** Każda liczba wymaga sprawdzenia przez wykwalifikowanego inżyniera: wynik jest tak dobry, jak zapotrzebowania, rzędne, średnice rur i wartości chropowatości, które podano, a model stanu ustalonego nic nie wie o uderzeniu hydraulicznym, jakości wody ani rzeczywistym zachowaniu pompy pożarowej.

## Narysuj sieć

1. W obszarze **Powierzchnia** › {{ui:Więcej}} wybierz {{ui:Sieci wodociągowe…}}. Okno pozostaje otwarte, gdy pracujesz nad planem.
2. Wybierz {{ui:Zbiornik zasilający}} i kliknij plan w miejscu zasilania. Jego wysokość zaczyna się 100 ft (30 m) nad terenem; zmień ją we Właściwościach.
3. Wybierz {{ui:Węzeł}} i kliknij każde miejsce, w którym pobierana jest woda albo spotykają się rury. Węzeł przejmuje rzędną z terenu; wpisz inną we Właściwościach, aby ją zmienić.
4. Wybierz {{ui:Rura}}, kliknij węzeł, a potem węzeł, z którym się łączy. Narzędzie pozostaje włączone dla następnej rury. {{ui:Pompa}} i {{ui:Zawór redukcyjny ciśnienia}} rysuje się tak samo, od węzła ssawnego (albo na górnym biegu) do węzła tłocznego (albo na dolnym biegu). {{ui:Zbiornik}} umieszcza się jak węzeł.
5. Zaznacz węzeł i wpisz jego {{ui:Zapotrzebowanie}} (gpm, albo L/s w projekcie w metrach). Zaznacz rurę i ustaw jej {{ui:Średnica}} (in albo mm) oraz, jeśli ją znasz, jej współczynnik C Hazen–Williams.

Każda zmiana to jeden krok cofania. Delete usuwa węzeł oraz rury, które się w nim kończą.

## Co oznacza każdy element

- **Rura.** Długość jest mierzona wzdłuż planu, chyba że wpiszesz własną. C to chropowatość Hazen–Williams (na start 130; domyślną wartość zmienisz w oknie). Współczynnik strat miejscowych K dodaje straty na łukach i kształtkach. Zaznacz **Zawór zwrotny** dla rury, która nie może przepuszczać wody wstecz; rura **Zamknięta** nie przenosi niczego.
- **Zbiornik zasilający.** Źródło o stałej wysokości, czyli poziomie wody, jaki utrzymuje ponad poziomem odniesienia. Oddaje lub pobiera tyle, ile potrzebuje sieć.
- **Zbiornik.** Poziom, który zmienia się w ciągu doby. W wynikach ustalonych jest źródłem na swoim bieżącym poziomie.
- **Pompa.** Jeden punkt projektowy (przepływ i wysokość) wyznacza przez siebie zwykłą krzywą: wysokość przy zerowym przepływie wynosi 133 % wysokości projektowej, a wysokość jest zerowa przy dwukrotności przepływu projektowego. Pompa nigdy nie tłoczy wody wstecz.
- **Zawór redukcyjny ciśnienia.** Utrzymuje ciśnienie, które ustawisz za nim, gdy zasilanie jest wyższe. Gdy zasilanie jest niższe, jest otwarty i niczego nie utrzymuje; gdy woda miałaby płynąć wstecz, zamyka się.

## Odczytaj wyniki

Okno pokazuje wysokość piezometryczną i ciśnienie każdego węzła oraz przepływ, prędkość i stratę wysokości na każde 1,000 ft (albo na km) dla każdego połączenia, a węzły są zabarwione na planie: zielony oznacza ciśnienie między najniższym a najwyższym z ustawionych, czerwony poniżej, bursztynowy powyżej. Strzałki przepływu pokazują kierunek. Zaznacz węzeł lub rurę, aby odczytać ich liczby we Właściwościach.

Pod tabelami jest lista tego, na co zwrócić uwagę: niskie lub wysokie ciśnienie, rura szybsza niż dopuszczalna, węzeł odcięty od wszystkich źródeł albo solver, który się nie ustabilizował. Te same ustalenia są w panelu Problemy. Ustaw limity w oknie (na start 20 psi, 100 psi i 10 ft/s; 140 kPa, 700 kPa i 3 m/s w projekcie w metrach).

## Przepływ pożarowy

{{ui:Przepływ pożarowy…}} rysuje przepływ w jednym węźle i pokazuje tam ciśnienie oraz najniższe ciśnienie w dowolnym miejscu sieci. Znajduje też przepływ dostępny w tym węźle, przy czym najsłabszy węzeł sieci zachowuje podane przez ciebie ciśnienie resztkowe. Pozostałe zapotrzebowania pozostają bez zmian.

## Doba zapotrzebowania

{{ui:Doba zapotrzebowania…}} przelicza sieć godzina po godzinie. Podaj wzorzec zapotrzebowania w ustawieniach pliku (lista mnożników, która się powtarza); zbiorniki napełniają się i opróżniają wraz z przepływem wejściowym i wyjściowym, a pompa może działać według wzorca włącz/wyłącz. Zbiornik, który osiągnie najwyższy lub najniższy poziom, jest wymieniony na liście: CivilCraft nie zamyka za ciebie jego wlotu ani wylotu, więc odczytaj to jako "ten zbiornik jest za mały albo pompa za duża".

## Tekst EPANET

{{ui:Zapisz jako tekst EPANET (.inp)}} zapisuje sieć w formacie zwykłego tekstu, który czyta wiele programów wodociągowych, a {{ui:Otwórz tekst EPANET (.inp)…}} odczytuje taki plik. Przenosi się tylko to, co modeluje CivilCraft: węzły, zbiorniki zasilające, zbiorniki, rury, pompy z krzywą wysokości, zawory redukcyjne ciśnienia, wzorce zapotrzebowania i czasy. Inne typy zaworów, pompy podawane mocą oraz inne wzory na straty wysokości są nazwane i pomijane. Plik musi używać tych samych jednostek co projekt.

## Hydranty, zawory i kształtki

Zaznacz węzeł i zaznacz **Hydrant**, aby go tam umieścić; zaznacz magistralę i naciśnij **Dodaj w środku**, aby umieścić na niej zawór, zawór powietrzny, zawór spustowy albo wodomierz. Są one obiektami sieci: przesuwają się razem z nią, a jeden krok cofania je usuwa.

Układ implikuje też kształtki, a CivilCraft wymienia je bez pytania: **trójnik** tam, gdzie spotykają się trzy magistrale, **krzyżak** tam, gdzie cztery, **łuk** (z kątem), gdzie dwie magistrale skręcają o 5° lub więcej, **redukcja**, gdzie spotykają się dwa rozmiary, i **korek** na ślepym końcu. {{ui:Zestawienie kształtek (CSV)}} zlicza je oraz magistrale według rozmiaru. To jest to, co wynika z układu: przedmiar do sprawdzenia z własnymi szczegółami, a nie lista do zamówienia.

Magistrale są układane na poziomie terenu minus przykrycie (4 ft albo 1.2 m), aby można je było narysować i zamodelować w 3D; powyższe ciśnienia nigdy od tego nie zależą.

## Na planie i w plikach

Plan, PDF oraz DWG lub DXF niosą magistrale na warstwie **C-WATR-MAIN** z ich rozmiarami na **C-WATR-TEXT**, hydranty na **C-WATR-HYDR**, zawory na **C-WATR-VALV**, a kształtki na **C-WATR-FITT**.

Eksport LandXML zapisuje sieć rurociągów wodociągowych (budowla dla każdego węzła, rura dla każdej magistrali, nazwane hydranty); import LandXML odczytuje ją z powrotem jako magistrale wodociągowe, bez zapotrzebowań, pomp i zaworów, których LandXML nie przenosi. Eksport IFC zapisuje magistrale jako segmenty rur, hydranty, zawory i kształtki w jednym systemie wodociągowym. Te pliki zostały sprawdzone przez nasze własne moduły odczytu i zapisu; wypróbuj je w innych programach i daj nam znać, co pokazują.

## Czego tu jeszcze nie ma

Jakość i wiek wody, sterowanie i reguły wykraczające poza wzorzec włącz/wyłącz pompy, inne typy zaworów, zapotrzebowanie zależne od ciśnienia, rury o zmiennej średnicy oraz przepływy w kanalizacji w czasie. Zobacz [Jeszcze nie zbudowano](topic:not-built-yet). Sanitarne przepływy obliczeniowe, które są innym obliczeniem, znajdują się w [Sanitarne przepływy obliczeniowe](topic:sanitary-design).
