---
title: Jednostki przy imporcie: plik podaje swoje jednostki albo zostaniesz zapytany
summary: Gdy rysunek lub siatka wczytywane do projektu podaje swoje jednostki, CivilCraft je przelicza i o tym informuje. Gdy ich nie podaje, CivilCraft pyta przed wczytaniem i zapamiętuje odpowiedź dla tego pliku.
keywords: jednostki, import, DWG, DXF, STL, OBJ, pomiar, stopy, stopy US survey, metry, milimetry, skala, zły rozmiar, za duży, za mały, pytanie, zapamiętane, INSUNITS, jednostki rysunku
from: 60921963
---

## Co zrobisz

Wczytaj plik do projektu i upewnij się, że wejdzie w odpowiednim rozmiarze.

## Kroki

1. Otwórz plik jak zwykle: {{ui:Otwórz}}, upuść go na plan albo użyj polecenia rysunku CAD.
2. Jeśli plik podaje swoje jednostki, nie jest zadawane żadne pytanie: okno importu pokazuje je jako **Zgodnie z rysunkiem**.
3. Jeśli nie, okno pyta o **Jednostki pliku** przed otwarciem okna importu. Wybierz, czym jest jedna jednostka w pliku, i kliknij {{ui:Użyj tych jednostek}}.
4. {{ui:Anuluj}} (albo {{key:Esc}}) pomija plik. Nic z niego nie jest wczytywane do projektu.

## Które pliki podają swoje jednostki

- **DWG i DXF**: jednostki wstawiania rysunku (`$INSUNITS`). Plik bez nich jest o nie pytany. Lista **Jednostki rysunku** w oknie importu zaczyna się od twojej odpowiedzi i nadal może ją zmienić.
- **STL i OBJ** (swobodne kształty ukształtowania terenu): nigdy nie podają jednostek. Jesteś o nie pytany.
- **Listy punktów** (CSV, TXT) i listy postępu pomiarów: lista, która podaje jednostkę w pierwszych wierszach, jest przeliczana, a wiersz stanu o tym informuje. Lista, która jej nie podaje, jest o nią pytana po naciśnięciu {{ui:Importuj}}, zanim punkty zostaną wczytane. Kolumny szerokości i długości geograficznej przechodzą zamiast tego przez układ współrzędnych.
- **Dodatek Chmury punktów**: pyta, gdy budujesz chmurę, której plik nie podaje jednostki, i podpisuje liczby chmury jednostką, którą ona niesie.
- **IFC i LandXML**: podają swoje; są przeliczane na jednostki projektu.
- **LAS, LAZ i rastry wysokości**: umieszczane według swojego układu współrzędnych; okno terenu pyta o jednostkę wysokości, gdy plik jej nie podaje.

## Warto wiedzieć

- Odpowiedź jest zapamiętywana dla tego pliku na tym komputerze, we wszystkich aplikacjach CadCraft. Przy następnym wczytaniu nie jesteś pytany.
- Aby zostać zapytanym ponownie: paleta poleceń ({{key:Mod+K}}) › **Pytaj ponownie o jednostki importowanych plików**.
- Jednostka podana na liście jest odczytywana z pierwszych ośmiu wierszy: wiersz taki jak `units: ft` albo nagłówki kolumn, które wszystkie niosą tę samą jednostkę w nawiasach, na przykład `Elevation (m)`.
