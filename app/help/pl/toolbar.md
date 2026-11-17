---
title: Opis paska narzędzi
summary: Każdy przycisk paska narzędzi w CivilCraft, co robi, jego skrót oraz kiedy jest wyszarzony lub odmawia działania.
keywords: pasek narzędzi, przyciski, polecenia, narzędzia, plik, eksport, powierzchnia, projekt, edycja, widok, menu
from: 4c4352bc
---

Pasek narzędzi biegnie u góry aplikacji w siedmiu grupach. Każdy przycisk pokazuje podpowiedź i skrót po najechaniu kursorem.

## Plik

| Przycisk | Skrót | Działanie |
|---|---|---|
| {{ui:Nowy}} | brak | Tworzy pusty projekt. Najpierw pyta, jeśli są niezapisane zmiany. |
| {{ui:Otwórz}} | {{key:Mod+O}} | Otwiera plik punktów (CSV, TXT), LandXML lub projekt CivilCraft. |
| {{ui:Zapisz}} | {{key:Mod+S}} | Pobiera projekt jako `<name>.civilcraft.json`. |

## Eksport

| Przycisk | Skrót | Działanie |
|---|---|---|
| {{ui:LandXML}} | brak | Pobiera `<name>.xml`: punkty, powierzchnie, osie, profile i sieć rurociągów jako LandXML 1.2. "Nic jeszcze nie ma do wyeksportowania." gdy projekt jest pusty. |
| {{ui:DXF}} | brak | Pobiera `<name>.dxf`: linie planu jako DXF R12. |
| {{ui:PDF}} | {{key:Mod+P}} | Otwiera **Wydruk planu do PDF**. "Nic jeszcze nie ma do wydrukowania." gdy projekt jest pusty. |

## Powierzchnia

| Przycisk | Skrót | Działanie |
|---|---|---|
| {{ui:Linia przełamania}} | {{key:B}} | Klikaj punkty pomiarowe w kolejności, {{key:Enter}} kończy. Linia przełamania przejmuje rzędne punktów. |
| {{ui:Granica}} | {{key:O}} | Klikaj narożniki zewnętrznej granicy, {{key:Enter}} kończy. Zastępuje każdą granicę. |

Oba mówią "Nie ma jeszcze powierzchni: najpierw otwórz punkty pomiarowe.", gdy nie ma powierzchni.

## Projekt

| Przycisk | Skrót | Działanie |
|---|---|---|
| {{ui:Oś trasy}} | {{key:A}} | Klikaj PI w kolejności, {{key:Enter}} kończy. |
| {{ui:Plac}} | {{key:G}} | Klikaj narożniki placu, {{key:Enter}} kończy. Jak narzędzia powierzchni ostrzega, gdy nie ma powierzchni; plac wyrównuje się tylko na niej. |
| {{ui:Rurociągi}} | {{key:P}} | Klikaj budowle od góry w dół (kliknij istniejącą, aby ją połączyć), {{key:Enter}} kończy. |
| {{ui:Profil}} | {{key:R}} | Pokazuje lub ukrywa widok profilu pod planem. |

## Edycja

| Przycisk | Skrót | Działanie |
|---|---|---|
| {{ui:Cofnij}} | {{key:Mod+Z}} | Cofa ostatnią zmianę (do 200). Wyszarzony, gdy nie ma czego cofnąć. |
| {{ui:Ponów}} | {{key:Mod+Y}} | Ponawia to, co cofnięto. Wyszarzony, gdy nie ma czego ponowić. |
| {{ui:Kopiuj}} | {{key:Mod+C}} | Kopiuje zaznaczone punkty pomiarowe do schowka jako wiersze, które przyjmuje arkusz kalkulacyjny. Wyszarzony, dopóki nie zaznaczono punktów. |
| {{ui:Wklej}} | {{key:Mod+V}} | Wkleja punkty: podążają za wskaźnikiem, a kliknięcie je układa z numerami, których nie ma żaden inny punkt. Wiersze punktów skopiowane w arkuszu też się wklejają. |
| {{ui:Więcej}} | brak | Otwiera poniższe menu. |

Menu {{ui:Więcej}}:

| Pozycja | Skrót | Działanie |
|---|---|---|
| {{ui:Wytnij}} | {{key:Mod+X}} | Kopiuje zaznaczone punkty i je usuwa (jeden krok cofnięcia). |
| {{ui:Kopiuj}} | {{key:Mod+C}} | Jak przycisk {{ui:Kopiuj}}. |
| {{ui:Wklej}} | {{key:Mod+V}} | Jak przycisk {{ui:Wklej}}. |
| {{ui:Wklej w miejscu}} | {{key:Mod+Shift+V}} | Wkleja punkty w ich własnych współrzędnych, z numerami, których nie ma żaden inny punkt. |
| {{ui:Duplikuj}} | {{key:Mod+D}} | Kopia zaznaczonych punktów podąża za wskaźnikiem; kliknij, gdzie ma trafić. Schowek zostaje bez zmian. |
| {{ui:Usuń}} | {{key:Delete}} | Usuwa zaznaczone punkty pomiarowe albo zaznaczoną oś, plac, budowlę (z jej rurami), rurę lub PVI. |
| {{ui:Zaznacz wszystkie punkty}} | {{key:Mod+A}} | Zaznacza każdy punkt pomiarowy. |
| {{ui:Odznacz wszystko}} | {{key:Esc}} | Czyści zaznaczenie. |

Pozycja, która w danej chwili nie może działać, jest wyszarzona, a jej podpowiedź mówi dlaczego. Szczegóły: [Zaznaczanie, kopiowanie i wklejanie punktów pomiarowych](topic:copy-paste-points).

Cofnięcie obejmuje zmiany projektu, ustawień powierzchni i punktów pomiarowych (wklejanie, wycinanie, duplikowanie, usuwanie). Nie obejmuje ustawień wyświetlania, a otwarcie lub import dowolnego pliku je czyści.

## GIS

| Przycisk | Skrót | Działanie |
|---|---|---|
| {{ui:Współrzędne}} | brak | Otwiera okno **Układ współrzędnych**: podaj, w jakim układzie jest projekt, albo użyj współrzędnych gruntowych lub lokalnych. Zob. [Ustawianie układu współrzędnych projektu](topic:coordinate-systems) oraz [Współrzędne gruntowe i lokalne](topic:ground-and-local-coordinates). |
| {{ui:Importuj}} | brak | Importuje dane GIS: shapefile, GeoJSON, GeoPackage, siatki wysokości i LiDAR. Zob. [Import danych GIS](topic:gis-import). |
| {{ui:Eksport}} | brak | Eksportuje dane powykonawcze dla działu GIS. Zob. [Eksport danych powykonawczych do GIS](topic:gis-export). |
| {{ui:Analiza}} | brak | Otwiera panel analizy GIS: bufor, nakładanie, połączenie przestrzenne, zaznaczanie według atrybutu, pomiar. Zob. [Analiza warstw GIS](topic:gis-analysis). |
| {{ui:Tabela atrybutów}} | brak | W Powierzchnia › Więcej. Otwiera tabelę atrybutów warstwy GIS: sortowanie, filtrowanie, zaznaczanie, edycja, dodawanie pól, obliczenia, zapis jako CSV. Zob. [Praca z tabelą atrybutów warstwy](topic:gis-table). |
| {{ui:Mapa}} | brak | Otwiera okno **Warstwy mapy**: obraz z georeferencją albo dodane serwery map, rysowane pod planem. Zob. [Pokazywanie warstw mapy pod planem](topic:map-layers). |

Narzędzia GIS ładują się przy pierwszym użyciu jednego z tych przycisków, przy otwarciu pliku GIS albo projektu, który ma układ współrzędnych lub warstwy GIS.

## Widok

| Przycisk | Skrót | Działanie |
|---|---|---|
| {{ui:Zaznacz}} | {{key:V}} lub {{key:Esc}} | Kliknij, aby zaznaczyć osie, place, budowle, rury i punkty ({{key:Shift}} oraz kliknięcie lub przeciągnięcie dodaje punkty); przeciągaj uchwyty, aby przesuwać PI, narożniki placu i budowle. |
| {{ui:Dopasuj}} | {{key:F}} | Powiększa plan, aby pokazać powierzchnię, punkty, osie i place (w widoku 3D pokazuje wszystko). |
| {{ui:3D}} | {{key:D}} | Pokazuje teren w 3D nad planem albo wraca do planu. Pasek nad widokiem 3D ustawia widok, wyolbrzymienie pionowe, kolorowanie i to, co się pokazuje, oraz eksportuje GLB lub OBJ. Zob. [Podgląd terenu w 3D](topic:site-3d). |

## Przyciski w panelach

| Przycisk | Gdzie | Działanie |
|---|---|---|
| {{ui:Otwórz przykładowy teren}} | Pole na pustym planie | Wczytuje przykładowy pomiar (wymaga połączenia, chyba że CivilCraft jest zapisany do pracy offline) |
| {{ui:Usuń granicę}} | Lewy panel, Powierzchnia | Usuwa zewnętrzną granicę |
| {{ui:Usunięcie narysowanych linii przełamań}} | Lewy panel, Powierzchnia | Usuwa każdą linię przełamania narysowaną tym narzędziem (nie grupy linii przełamań) |
| {{ui:Przebuduj powierzchnię z punktów}} | Lewy panel, Powierzchnia (tylko powierzchnia z LandXML) | Usuwa siatkę TIN z LandXML i buduje z punktów; nie można tego cofnąć |
| {{ui:Zacznij od terenu}} | Prawy panel, Oś trasy | Zaczyna profil projektowy z PVI na terenie na każdym końcu |
| {{ui:Widok profilu}} | Prawy panel, Oś trasy | Otwiera widok profilu tej osi |
| {{ui:Dodaj PVI}} | Pasek profilu | Gdy wciśnięty, kliknięcie w profilu dodaje PVI |
| {{ui:Ustaw wszystkie dna według zasad}} | Prawy panel, Sieć rurociągów | Ustawia dna wszystkich rur według zasad |
| {{ui:Ustaw jej dna według zasad}} | Prawy panel, Rura | Ustawia dna tej rury według zasad |
