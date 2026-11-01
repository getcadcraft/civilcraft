---
title: Przeglądarki i komputery
summary: W jakich przeglądarkach działają aplikacje, czym się różnią i czego potrzebuje Twój komputer.
keywords: chrome, edge, firefox, safari, brave, przeglądarka, mac, windows, linux, ipad, tablet, webgl, wymagania, pamięć
from: a11b09b1
---

Aplikacje działają w przeglądarce internetowej. Pracę wykonują na Twoim komputerze: pliki są tam otwierane i nigdy nie są do nas wysyłane (zobacz [Dokąd trafiają Twoje pliki](common:your-files)).

## Którą przeglądarkę wybrać

Użyj aktualnej wersji jednej z tych:

| Przeglądarka | Silnik | Uwagi |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Najpełniejsza: wybór folderu, zapis do pracy offline, obsługa plików. |
| Firefox | Gecko | Działa. Otwarcie całego folderu używa prostszego okna wyboru. Zapis offline może nie działać w oknach prywatnych. |
| Safari | WebKit | Działa na Macu i iPadzie. Otwarcie całego folderu używa prostszego okna wyboru. Safari może usunąć kopię offline, której nie używano od kilku tygodni. |

Wszystkie trzy silniki nadają się do codziennej pracy. Gdy aplikacja działa inaczej w którymś z nich, jej pomoc pokazuje kroki dla Twojej przeglądarki.

## Czym różnią się przeglądarki

- **Otwieranie folderu.** Przeglądarki Chromium pokazują prawdziwe okno wyboru folderu i mogą czytać folder bezpośrednio. Firefox i Safari proszą o wybranie folderu, a potem czytają każdy plik w nim, co trwa dłużej przy dużych folderach projektów; przeciągnięcie folderu na aplikację działa we wszystkich trzech.
- **Zapisywanie.** Aplikacje zapisują, pobierając plik. To przeglądarka decyduje, gdzie trafiają pobrane pliki i czy najpierw pyta.

:::chromium
W Chrome lub Edge włącz „Przed pobraniem pytaj, gdzie zapisać każdy plik” (w Ustawieniach, w sekcji Pobrane), aby za każdym razem wybierać folder.
:::

:::firefox
W Firefoksie otwórz Ustawienia, potem Ogólne, potem Pliki i aplikacje i wybierz „Zawsze pytaj, gdzie zapisać pliki”, aby za każdym razem wybierać folder.
:::

:::safari
W Safari otwórz Ustawienia, potem Ogólne, i ustaw „Lokalizacja pobranych plików” na „Pytaj przy każdym pobieraniu”, aby za każdym razem wybierać folder.
:::

## Mac, Windows i Linux

Aplikacje są takie same na każdym komputerze. Zmienia się klawiatura: skróty są zapisywane automatycznie dla Twojego komputera. Zobacz [Klawisze, myszy i gładziki](common:keys).

## Tablety i ekrany dotykowe

Niektóre aplikacje obsługują dotyk (jeden palec rysuje lub zaznacza, dwa palce szczypią, aby powiększyć i przesunąć widok). Pomoc każdej aplikacji mówi, czy tak jest. Na iPadzie użyj Safari albo Chrome. Klawiatura pomaga w aplikacjach używających poleceń wpisywanych z klawiatury.

## Najstarsza przeglądarka i system

Odczytaliśmy to z kodu aplikacji 0.7, a nie na oko: każdy plik został przeanalizowany, a każda użyta w nim funkcja języka została sprawdzona w opublikowanych danych o zgodności przeglądarek. Poniżej tych wersji aplikacje nie mogą się nawet uruchomić, bo przeglądarka nie rozumie kodu.

| | Najstarsza wersja, w której aplikacje mogą się uruchomić |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS i iOS 16.4) |

CadCraft Studio ma w Windows własny silnik internetowy, więc wymaga Windows 10 lub 11; na Macu używa silnika systemowego, więc wymaga macOS 13.3 lub nowszego. Ustawienia › Aktualizacje w Studio pokazuje, na czym działa Twoja kopia.

To najstarsza wersja, w której aplikacja *się uruchamia*, odczytana z kodu. Nie jest to lista starych przeglądarek, w których uruchamialiśmy aplikacje, więc starsza przeglądarka, w której aplikacja się uruchomi, może nadal nie mieć jakiejś funkcji.

## Czego potrzebuje Twój komputer

To planowane minima dla aplikacji, a nie zmierzone wymagania:

- 8 GB pamięci (16 GB zalecane dla dużych modeli federacyjnych).
- Układ graficzny z WebGL 2 dla aplikacji 3D. Jeśli widok 3D pozostaje pusty, sprawdź, czy w ustawieniach przeglądarki włączone jest przyspieszanie sprzętowe.
- Ekran o szerokości co najmniej 1280 pikseli dla pełnych pasków narzędzi; mniejsze ekrany zawijają je.

Bardzo duże pliki (duże zestawy planów, duże modele) zajmują w karcie przeglądarki dużo pamięci. Zamknij inne ciężkie karty, jeśli aplikacja zwalnia.
