---
title: Przejście z innego oprogramowania inżynierii lądowej
summary: Jak znane przepływy pracy projektowania inżynierii lądowej odpowiadają CivilCraft oraz różnice, które mylą doświadczonych użytkowników w pierwszej godzinie.
keywords: przechodzenie, migracja, znane, różnice, przepływ pracy, polecenia, mapowanie, cogo, korytarz, niwelacja, sieć rurociągów, style, wiersz poleceń
from: feae37d6
---

Jeśli używałeś Civil 3D, znasz już idee CivilCraft: punkty i grupy punktów, powierzchnie TIN z liniami przełamań i granicami, trasy wg PI, profile wg PVI, zestawy przekrojów przeciągnięte w korytarze, niwelację do wykopu i nasypu, grawitacyjne sieci rurociągów, LandXML. Inne jest niemal wszystko wokół nich: nie ma pliku rysunku, nie ma wiersza poleceń (chyba że wybierzesz styl menu {{ui:Klasyczny rysunek}}), nie ma stylów, nie ma Prospectora ani okien ustawień. CivilCraft to małe, wyspecjalizowane narzędzie w przeglądarce i w tej wersji robi ułamek tego, co pełny pakiet inżynierski. Ta strona zestawia to, co znasz, z tym, co tu jest.

:::tip
Jeśli lubisz wstążkę Civil 3D, wybierz styl menu {{ui:Wstążka projektowa}} w {{ui:Ustawienia}} › {{ui:CivilCraft}} › {{ui:Menu, klawisze i mysz}}: karty Start, Powierzchnie, Modyfikacja, Geolokalizacja, Widok i Wyjście, przycisk środkowy przesuwa widok, a {{key:Shift}} z przyciskiem środkowym obraca widok 3D. Jeśli wpisujesz polecenia, {{ui:Klasyczny rysunek}} dodaje wiersz poleceń (ALIGNMENT, PAD, PROFILE, ZOOM …). Zobacz [Menu, klawisze i mysz](topic:menus-keys-and-mouse).
:::

## Mapa przepływu pracy

| Co chcesz zrobić | Znany sposób | W CivilCraft |
|---|---|---|
| Wczytaj punkty pomiarowe | Import punktów w formacie pliku punktowego | {{ui:Otwórz}}, potem sprawdź kolejność kolumn w **Importuj punkty** ([Importuj punkty pomiarowe](topic:import-points)) |
| Sortuj punkty | Grupy punktów, kody opisowe | Automatyczne grupy wg pierwszego słowa opisu; brak kodów opisowych |
| Edytuj punkt | Edytor punktów, uchwyty | Kliknij go i wpisz we Właściwościach albo przeciągnij ([Edytuj punkt pomiarowy](topic:edit-points)) |
| Zbuduj istniejący grunt | Utwórz powierzchnię, dodaj grupy punktów jako dane | Automatycznie: powierzchnia przebudowuje się, gdy zmienią się jej dane wejściowe |
| Dodaj linie przełamań | Dodaj linie przełamań z polilinii lub linii charakterystycznych | Ustaw grupę punktów na {{ui:Linia przełamania}} albo wskaż punkty narzędziem {{ui:Linia przełamania}} ({{key:B}}) |
| Przytnij powierzchnię | Granica zewnętrzna, granica ukryta, maksymalna długość trójkąta | {{ui:Granica}} ({{key:O}}, tylko zewnętrzna) i **Najdłuższa zewnętrzna krawędź** |
| Pokaż warstwice | Styl powierzchni | **Wyświetlanie** w lewym panelu: interwał, co ile główna, etykiety, pasma, strzałki spadku |
| Wytycz oś | Narzędzia tworzenia osi, ustawienia łuków i klotoid | {{ui:Oś trasy}} ({{key:A}}): wskaż PI, {{key:Enter}}; promienie i długości klotoid w tabeli PI |
| Utwórz widok profilu | Kreator widoku profilu, pasma | {{ui:Profil}} ({{key:R}}): jeden widok profilu pod planem, zawsze dopasowany |
| Zaprojektuj niweletę | Narzędzia układania profilu | {{ui:Zacznij od terenu}}, {{ui:Dodaj PVI}} ({{key:I}}), przeciągnij PVI, wpisz **Łuk L** |
| Zbuduj drogę | Zestaw przekrojów, podprzekroje, korytarz, cele, regiony | Zaznacz **Przeciągnij zestaw wzdłuż profilu projektowego** pod trasą; pas, pobocze i skarpę z każdej strony albo każdą stronę z części (ściek, krawężnik, chodnik …) |
| Wyrównaj plac | Linie charakterystyczne, grupy niwelacji, kryteria niwelacji | {{ui:Plac}} ({{key:G}}): płaski plac ze skarpami wykopu i nasypu do linii zerowej |
| Oblicz roboty ziemne | Powierzchnie objętościowe, panel objętości | **Roboty ziemne** w prawym panelu, metoda siatki, aktualizuje się na bieżąco |
| Wytycz kanalizację deszczową lub sanitarną | Sieć rurociągów z listą części, reguły | {{ui:Rurociągi}} ({{key:P}}): wskaż konstrukcje w dół biegu; trzy reguły, które ustawiasz; spady dna automatyczne |
| Wymieniaj z innymi | Import i eksport LandXML | {{ui:Otwórz}} plik LandXML; {{ui:LandXML}}, aby eksportować ([Wymiana LandXML](topic:landxml)) |
| Wyślij linie do CAD | Eksport do DWG | {{ui:DWG}} (format 2000 do 2018) lub {{ui:DXF}} (R12) |
| Wydrukuj | Układy, okna widokowe, zestawy arkuszy | {{ui:PDF}}: jeden poziomy arkusz planu w wybranej skali; arkusze planu i profilu oraz arkusze przekrojów jako PDF |
| Współdziel pracę między plikami | Skróty danych, odniesienia | Niedostępne: jeden projekt na plik |
| Cofnij | Cofnij | {{key:Mod+Z}} i {{key:Mod+Y}}, 200 kroków; ustawienia wyświetlania nie są krokami cofnięcia |

## Różnice, które mylą ludzi

**Nie ma wiersza poleceń**, chyba że wybierzesz styl menu {{ui:Klasyczny rysunek}}. Narzędzia to przyciski na pasku i pojedyncze litery: {{key:A}} oś trasy, {{key:G}} plac, {{key:P}} rurociągi, {{key:B}} linia przełamania, {{key:O}} granica, {{key:R}} profil, {{key:I}} dodaj PVI, {{key:V}} zaznacz, {{key:F}} dopasuj. W innych stylach menu wpisanie nazwy polecenia nic nie robi. Zobacz [Klawisze i mysz](topic:keyboard).

**Enter kończy; podwójne kliknięcie jest ryzykowne.** Kliknij ostatni punkt raz, a potem naciśnij {{key:Enter}}. W tej wersji podwójne kliknięcie też kończy, ale usuwa punkt, w który kliknąłeś dwukrotnie. Prawy przycisk myszy nie kończy ani nie powtarza; służy tylko do przesuwania widoku, gdy go przeciągasz.

**Wszystko jest dynamiczne, cały czas.** Zmień grupę punktów, promień, PVI albo spadek placu, a powierzchnia, warstwice, korytarz, linie zrzutu i objętości zaktualizują się od razu. Nie ma nic do przebudowania i nic nie jest nieaktualne.

**Nic nie jest obiektem rysunkowym.** Plan to widok projektu, a nie rysunek, który możesz edytować poleceniami CAD. Nie możesz dodać własnych linii ani tekstu, zmienić koloru warstwy ani rozbić obiektu. Wyeksportuj do DXF i dokończ rysunek w programie CAD.

**Brak stylów.** Kolory, grubości linii, rozmiary etykiet i nazwy warstw są stałe (zobacz [Warstwy planu](topic:plan-layers)). Przyciski Papier i Model na pasku aplikacji przełączają między jasnym a ciemnym ekranem.

**Po jednym z każdego.** Jedna istniejąca powierzchnia gruntu, jeden wynik niwelacji, jedna sieć rurociągów na projekt. Wiele tras i placów jest w porządku.

**Jednostki to tylko etykiety.** Wybranie {{ui:Stopy amerykańskie}} albo {{ui:Metry}} niczego nie przelicza. Nie ma skali rysunku. Układ współrzędnych jest opcjonalny: ustaw go w {{ui:Współrzędne}}, a nic się nie przesunie; tylko mówi, co znaczą liczby (zobacz [Ustaw układ współrzędnych projektu](topic:coordinate-systems)). Stopy są traktowane jako stopy amerykańskie (US survey feet) przy zapisie do LandXML.

**Grupy linii przełamań łączą się w kolejności numerów punktów.** Grupa ustawiona na {{ui:Linia przełamania}} staje się jedną linią przez wszystkie swoje punkty, w kolejności numerów. Wspólne kody (dwie linie spadku oznaczone „FL”) tworzą jedną zygzakowatą linię; rysuj je ręcznie.

**Stacje wyglądają tak samo, metry się różnią.** Stopy używają stacji co 100 ft (12+34.56); metry używają stacji co 1000 m (1+234.567).

**Usuwanie na Macu.** Klawisz oznaczony delete na Macu działa w przeglądarce jak Backspace. Aby usunąć zaznaczenie, użyj Fn i delete albo przycisku {{ui:Usuń}}.

**Pliki są pobierane.** {{ui:Zapisz}} pobiera plik `.civilcraft.json` za każdym razem; nie ma opcji „zapisz nad otwartym plikiem”. Kopia odzyskiwania niezapisanej pracy jest przechowywana w tej przeglądarce ([Odzyskaj niezapisaną pracę](common:recover)). Otwarcie pliku punktów zastępuje punkty bez pytania. Zobacz [Pliki, które możesz otworzyć, zapisać i wyeksportować](topic:files).

**Reguły są Twoje.** Reguły sieci rurociągów i zestaw przekrojów korytarza zaczynają się od wartości zastępczych, które nie są normą. Ustaw własne, zanim zaufasz jakiejkolwiek kontroli.

**Objętości są oparte na siatce.** Roboty ziemne pochodzą z drobnej siatki między dwiema powierzchniami, w obrębie linii zrzutu, bez współczynnika spęcznienia i skurczu. Są bliskie, ale nie tożsame z objętością TIN-do-TIN.

## Czego brakuje

Krzywe przejściowe inne niż klotoida, zestawy przekrojów zmieniające się wzdłuż drogi, place o spadku, pojemność i retencja wpustów, katalogi części, rurociągi w profilu, układy działek i wyznaczanie wielkości działek, wyrównanie metodą najmniejszych kwadratów i bazy danych pomiarów, otwieranie DWG i więcej. Pełna lista z tym, co zrobić dziś zamiast tego, jest w [Jeszcze nie zbudowano](topic:not-built-yet).
