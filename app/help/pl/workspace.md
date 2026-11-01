---
title: Ekran, część po części
summary: Przegląd każdego paska i panelu w CivilCraft według nazw na ekranie, od paska narzędzi po pasek stanu.
keywords: interfejs, ekran, pasek narzędzi, panele, właściwości, pasek stanu, widok profilu, układ, przegląd, ui
from: 76272010
---

CivilCraft ma jeden ekran. Nie ma kart ani układów. Panele boczne można przenosić, pływające lub w osobnym oknie: zobacz [Rozmieść panele i użyj drugiego monitora](common:arrange-panels). Od góry do dołu i od lewej do prawej:

- **pasek aplikacji** (znak CadCraft, nazwa aplikacji, wersja, informacje o aplikacji, tryb ekranu, Pomoc, Zapisz do pracy offline, Papier i Model)
- **pasek narzędzi** z siedmioma grupami przycisków
- **lewy panel**: Teren, Punkty, Powierzchnia, Wyświetlanie i, po zaimportowaniu, Warstwy GIS
- **plan** pośrodku, a pod nim **widok profilu**, gdy jest otwarty
- **prawy panel**: Właściwości zaznaczonego obiektu
- **pasek stanu** wzdłuż dołu

## Pasek aplikacji

Cienki pasek na samej górze należy do witryny CadCraft, nie do samego CivilCraft.

- Menu wersji pokazuje, którą wersję uruchomiono.
- {{ui:O CivilCraft}} otwiera stronę aplikacji w witrynie.
- {{ui:Pełny ekran}} przełącza tryby ekranu: pełny ekran, potem pełny ekran z ukrytymi paskami, potem z powrotem normalny. {{key:Ctrl+Shift+F}} robi to samo na każdej platformie, także na Macu (tam to klawisz Control, nie Command). Przy ukrytych paskach przesuń wskaźnik do górnej krawędzi, aby je przywrócić.
- {{ui:Pomoc}} (lub {{key:F1}}) otwiera tę pomoc w panelu bocznym; {{key:F1}} lub {{key:Esc}} ją zamyka.
- {{ui:Zapisz do pracy offline}} zachowuje CivilCraft w tej przeglądarce, aby otwierał się bez połączenia; potem pokazuje {{ui:Gotowe offline}}. Zobacz [Pliki, które możesz otworzyć, zapisać i wyeksportować](topic:files#online-and-offline).
- {{ui:Papier}} i {{ui:Model}} przełączają jasny i ciemny motyw. Plan i profil podążają za motywem; PDF-y zawsze drukują się na białym.

## Pasek narzędzi

Każda grupa ma małą etykietę nad przyciskami. Najedź na przycisk, aby zobaczyć podpowiedź i klawisz.

| Grupa | Przyciski | Co robią |
|---|---|---|
| Plik | {{ui:Nowy}}, {{ui:Otwórz}}, {{ui:Zapisz}} | Zaczyna od nowa, otwiera plik punktów, LandXML lub projekt, zapisuje projekt jako pobrany plik |
| Eksport | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Zapisuje LandXML 1.2, DXF R12 lub DWG planu albo drukuje plan do PDF |
| Powierzchnia | {{ui:Linia przełamania}}, {{ui:Granica}} | Rysuje linię przełamania przez punkty pomiarowe; rysuje granicę zewnętrzną |
| Projekt | {{ui:Oś}}, {{ui:Plac}}, {{ui:Rurociągi}}, {{ui:Profil}} | Rysuje trasę, plac, ciąg rurociągów; pokazuje lub ukrywa widok profilu |
| Edycja | {{ui:Cofnij}}, {{ui:Ponów}}, {{ui:Kopiuj}}, {{ui:Wklej}}, {{ui:Więcej}} | Cofa, ponawia, kopiuje i wkleja punkty pomiarowe; {{ui:Więcej}} zawiera Wytnij, Wklej w miejscu, Duplikuj, Usuń, Zaznacz wszystkie punkty i Odznacz wszystko |
| GIS | {{ui:Współrzędne}}, {{ui:Importuj}}, {{ui:Eksportuj}}, {{ui:Mapa}} | Ustawia układ współrzędnych, importuje i eksportuje pliki GIS, pokazuje warstwy mapy pod planem |
| Widok | {{ui:Zaznacz}}, {{ui:Dopasuj}}, {{ui:3D}} | Wybiera i przesuwa obiekty; powiększa, aby pokazać wszystko; pokazuje teren w 3D ([Zobacz teren w 3D](topic:site-3d)) |

Narzędzie rysowania pozostaje wciśnięte, dopóki jest aktywne. Kliknięcie go ponownie, naciśnięcie {{key:Esc}} lub {{key:V}} wraca do {{ui:Zaznacz}}. {{ui:Cofnij}}, {{ui:Ponów}}, {{ui:Kopiuj}} i pozycje w {{ui:Więcej}} są wyszarzone, gdy nie mogą działać; podpowiedź mówi dlaczego (na przykład „Najpierw zaznacz punkty pomiarowe”). Każdy przycisk jest opisany w [Opis paska narzędzi](topic:toolbar).

W wąskim oknie pasek narzędzi przewija się na boki.

## Lewy panel

### Teren

- **Nazwa**: nazwa projektu. Nazywa każdy zapisywany lub eksportowany plik i jest drukowana w pasku tytułowym PDF.
- **Jednostki**: {{ui:Stopy amerykańskie}} lub {{ui:Metry}}. To mówi, co oznaczają liczby. Zmiana **nie** przelicza współrzędnych; zobacz [Jednostki, kilometraż i formaty liczb](topic:units-and-stations).

### Punkty

Gdy jest pusty, podpowiada, jak otworzyć plik punktów. Gdy są punkty, pokazuje nazwę pliku, liczbę punktów i ile z nich ma rzędną, a potem tabelę **grup punktów**: jeden wiersz na pierwsze słowo opisu (GRD, FL, TBS …), z liczbą i wyborem **Powierzchnia**:

- {{ui:Punkty}}: punkty wchodzą do powierzchni (domyślnie dla każdej grupy).
- {{ui:Linia przełamania}}: punkty grupy są łączone, w kolejności numerów punktów, w jedną linię przełamania.
- {{ui:Pominięte}}: grupa nie wpływa na powierzchnię.

### Powierzchnia

Dane o terenie istniejącym: punkty, trójkąty, najniższa i najwyższa rzędna, rzędna średnia, pole 2D i 3D, linie przełamań i informacja, czy jest granica. Pod danymi ramka wymienia wszystko, co budowanie powierzchni musiało poprawić lub czego nie zdołało zrobić. Dalej:

- **Najdłuższa krawędź zewnętrzna**: 0 zachowuje każdy trójkąt zewnętrzny; liczba odcina z zewnątrz długie, wąskie trójkąty.
- Łącza, które pojawiają się, gdy mają zastosowanie: {{ui:Usuń granicę}}, {{ui:Usunięcie narysowanych linii przełamań}} oraz, dla powierzchni odczytanej z LandXML, {{ui:Przebuduj powierzchnię z punktów}}.

### Wyświetlanie

- **Powierzchnia**: {{ui:Istniejący teren}} lub {{ui:Projektowana (wyprowadzona)}}. Druga jest dostępna, gdy plac lub korytarz wyprowadza teren bez problemów.
- **Poziomice co**, **Główne co** i **Pasma** (liczba pasm kolorów).
- Pola wyboru: {{ui:Poziomice}}, {{ui:Opisy poziomic}}, {{ui:Trójkąty}}, {{ui:Pasma rzędnych}}, {{ui:Strzałki spadków}}, {{ui:Punkty}}, {{ui:Opisy punktów}}, {{ui:Linie przełamań}}, {{ui:Krawędź powierzchni}}, {{ui:Rurociągi}}.
- Gdy pasma są włączone, pojawia się legenda rzędnych pasm.

Ustawienia wyświetlania są zapisywane z projektem, ale nie są krokami cofania: {{key:Mod+Z}} nigdy nie cofa pola wyboru.

## Plan

Plan pokazuje punkty, powierzchnię i wszystko, co projektujesz, w rzucie z północą u góry. Kółko powiększa w miejscu wskaźnika, przeciągnięcie pustego miejsca przesuwa widok. Pełna lista jest w [Klawisze i mysz](topic:keyboard).

- Na pustym projekcie ramka **Zacznij od punktów pomiarowych** wymienia pierwsze kroki i oferuje {{ui:Otwórz przykładowy teren}}.
- Gdy narzędzie rysowania jest aktywne, podpowiedź na górze planu mówi, co kliknąć i jak zakończyć.
- Przeciągnięcie pliku nad plan pokazuje „Upuść plik punktów, LandXML albo projekt”.
- Zaznaczone obiekty są podświetlone. Zaznaczona trasa lub plac pokazuje kwadratowe uchwyty w PI lub narożnikach; zaznaczona budowla pokazuje jeden uchwyt. Przeciągnij uchwyt, aby go przesunąć.
- Zaznaczone punkty pomiarowe mają pierścień. {{key:Shift}} i kliknięcie dodaje lub usuwa punkt; {{key:Shift}} i przeciągnięcie rysuje ramkę (lub, gdy przeciągniesz wokół nich, lasso), która dodaje punkty w środku. Zobacz [Zaznaczanie, kopiowanie i wklejanie punktów pomiarowych](topic:copy-paste-points).

## Widok profilu

Naciśnij {{key:R}} lub kliknij {{ui:Profil}}, aby otworzyć go pod planem. Jego pasek zawiera:

- listę tras (włączona, gdy są dwie lub więcej tras)
- {{ui:Dodaj PVI}}: gdy jest wciśnięty, kliknięcie w profilu dodaje PVI ({{key:I}} przełącza)
- odczyt kilometrażu, terenu, rzędnej projektowej, spadku oraz wykopu lub nasypu pod wskaźnikiem
- przycisk zamknięcia

Profil pokazuje teren istniejący, profil projektowy, spadki na każdej prostej, kilometraż i rzędną każdego PVI, L i K każdego łuku pionowego z jego BVC i EVC, punkty najwyższe i najniższe oraz przewyższenie pionowe. Zawsze mieści całą trasę: nie powiększa się ani nie przesuwa. Przesuwanie wskaźnika wzdłuż niego stawia kropkę na trasie w planie.

## Prawy panel: Właściwości

Jego nagłówek mówi, co pokazuje.

- **Projekt** (nic nie zaznaczono): trasy i place jako łącza, blok **Roboty ziemne** oraz blok **Sieć rurociągów** z regułami i problemami.
- **Oś trasy**: nazwa, kilometraż początkowy, długość, tabela PI, łuki, tabela PVI profilu projektowego z danymi oraz ustawienia **Korytarza**.
- **Plac**: nazwa, rzędna, nachylenia wykopu i nasypu, pole, dane o linii zasięgu skarp i roboty ziemne.
- **Budowla** lub **Rura**: rozmiary, rzędne wierzchu, dna, spadek, przykrycie i ewentualne problemy.
- **Punkt** i jego numer: współrzędne punktu, rzędna, opis i grupa (tylko do odczytu).

Pola zaczynają działać po naciśnięciu {{key:Enter}} lub opuszczeniu pola. Wartość, która nie zostanie przyjęta, jest oznaczona jako nieprawidłowa i nic się nie zmienia.

## Pasek stanu

- **E** i **N**: współrzędna wschodnia i północna pod wskaźnikiem.
- Rzędna **Teren** w tym miejscu (i **Wyprowadzony**, gdzie zmienił ją plac lub korytarz) albo „Poza powierzchnią”.
- Najbliższa trasa (lub zaznaczona) z kilometrażem **Sta** i odsunięciem (**L** lub **R**) pod wskaźnikiem.
- Po prawej komunikaty: co się właśnie stało albo dlaczego coś odrzucono. Komunikat sam znika po kilku sekundach.

## Okna dialogowe

- **Importuj punkty**: otwiera się przy każdym pliku punktów. Zobacz [Zaimportuj punkty pomiarowe](topic:import-points).
- **Wydrukuj plan do PDF**: zobacz [Wydrukuj plan do PDF](topic:plot-pdf).
- **Niezapisane zmiany**: pyta, zanim {{ui:Nowy}} lub otwarcie projektu albo pliku LandXML odrzuci niezapisaną pracę. {{ui:Zapisz kopię}} najpierw pobiera projekt.

## Małe ekrany

Do 760 pikseli szerokości, na przykład w telefonie, plan zachowuje ekran: pasek narzędzi to jeden wiersz przewijany na boki, a panele otwierają się jako arkusze z paska na dole. {{ui:Narzędzia}} ukrywa pasek narzędzi, a {{ui:Przenieś}} umieszcza go na dole.
