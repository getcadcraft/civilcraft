---
title: Pliki, które można otworzyć, zapisać i wyeksportować
summary: Pliki punktów, LandXML i projekty CivilCraft do otwarcia; projekty, LandXML, DXF i PDF na wyjściu; co zachowuje każdy z nich, dokąd trafiają pliki i co zmienia się w trybie offline.
keywords: otwórz, zapisz, eksportuj, importuj, formaty plików, csv, txt, landxml, xml, dxf, pdf, json, pobierz, plik projektu
from: 82bff559
---

CivilCraft otwiera pliki z komputera i zapisuje je, pobierając z powrotem na komputer. Nic nie jest wysyłane i nic nie jest przechowywane na serwerze. Zobacz też [Twoje pliki](common:your-files).

## Co otwiera

Kliknij {{ui:Open}} (lub naciśnij {{key:Mod+O}}) i wybierz plik, albo przeciągnij plik z {{pick:mac=Finder|windows=Eksplorator plików|linux=menedżera plików}} na plan. Jeden plik naraz; pliki większe niż 200 MB są odrzucane. Plik LandXML lub projektu większy niż 32 MB jest odczytywany fragmentami po około 4 MB, nigdy jako jeden blok tekstu. Podczas otwierania LandXML spodziewaj się, że zużyje w pamięci około 13 razy więcej, niż wynosi rozmiar pliku (plik 69 MB zużył w naszym teście około 0,9 GB).

| Rodzaj | Nazwy plików | Co się dzieje |
|---|---|---|
| Plik punktów | `.csv`, `.txt`, `.pnt`, `.xyz` (dowolny plik tekstowy) | Otwiera się okno **Importuj punkty**. Punkty zastępują punkty projektu; osie trasy, place i rurociągi pozostają. |
| LandXML | `.xml`, `.landxml` | Z pliku tworzony jest **nowy projekt** (najpierw pytanie, jeśli bieżący ma niezapisane zmiany). |
| Projekt CivilCraft | `.civilcraft.json` (dowolny `.json`) | Projekt otwiera się tak, jak został zapisany (najpierw pytanie, jeśli bieżący ma niezapisane zmiany). |

CivilCraft rozpoznaje plik po jego rozszerzeniu, a potem po pierwszych znakach: tekst zaczynający się od `{` jest odczytywany jako projekt, tekst zaczynający się od `<` jako LandXML, a wszystko inne jako plik punktów. Plik, który okno otwierania szarzy, nadal można upuścić na plan.

:::note
Import pliku punktów do projektu, który ma już punkty, zastępuje je bez pytania i czyści historię cofania (otwarcie dowolnego pliku to nowy początek dla cofania). Jeśli powierzchnia pochodziła z LandXML, import punktów przełącza ją z powrotem na powierzchnię zbudowaną z punktów. Zapisz najpierw, jeśli możesz chcieć odzyskać stare punkty.
:::

Szczegóły: [Formaty plików punktów](topic:point-file-formats), [LandXML: co jest odczytywane i zapisywane](topic:landxml-reference).

## Co zapisuje

{{ui:Save}} ({{key:Mod+S}}) zapisuje dwa pliki obok siebie, nazwane według pola **Nazwa** w lewym panelu: `<nazwa>.civilcraft.json`, czyli projekt, który dalej edytujesz, oraz `<nazwa>.ifc`, czyli ten sam projekt jako IFC 4.3 dla innych programów (zobacz [Eksport i import IFC](topic:ifc)). Każdy plik zapisuje informację o drugim, a IFC zawiera też skompresowaną kopię projektu, więc IFC wysłany samodzielnie nadal otwiera się w pełni edytowalny.

- **W Studio** oba pliki zapisują się obok siebie, w tym samym miejscu.
- **W Chrome i Edge** pierwszy zapis pyta o folder i zapisuje oba pliki do niego; kolejne zapisy trafiają do tego samego folderu. Anuluj pytanie o folder, aby zamiast tego pobrać oba pliki.
- **W innych przeglądarkach** oba pliki są pobierane, najpierw plik projektu.

Otwierając jeden z plików, CivilCraft szuka drugiego. Otwórz oba razem (lub przeciągnij oba) albo jeden z nich: w Studio drugi zostanie znaleziony w tym samym folderze; w przeglądarce CivilCraft zapyta, czy go dodać, albo czy kontynuować z tym, który masz. Jeśli IFC został zmieniony przez inny program po zapisie w CivilCraft albo jeden plik jest starszy od drugiego, projekt otwiera się z nowszego opracowania, a panel Problemy wyjaśnia, co się stało, z przyciskami **Zapisz teraz** (zapisuje oba pliki ponownie) i **Pokaż geometrię IFC jako odniesienie**. Sam IFC zmieniony przez inny program otwiera się z jego kopii projektu z tym, co nadal się zgadza: osie zmienione w nim przyjmują jego geometrię, usunięte obiekty są pomijane, a pozostałe zmiany są wymienione, ale nie przejęte. Plik projektu sprzed wersji 0.7.1 otwiera się jak dotychczas.

Plik projektu zachowuje:

- każdy punkt (numer, współrzędne, rzędną, opis) oraz nazwę pliku punktów, z którego pochodzą
- ustawienia powierzchni: wybory grup, narysowane linie załamań, granicę, najdłuższą zewnętrzną krawędź oraz TIN odczytany z LandXML
- ustawienia wyświetlania
- osie trasy wraz z ich PI, promieniami i kilometrażem początkowym, ich profile projektowe (PVI i długości łuków) oraz ustawienia korytarza
- place i sieć rurociągów wraz z jej regułami

Nie zachowuje historii cofania. Powierzchnie, warstwice, linie wykopu i nasypu oraz objętości nie są przechowywane; są odtwarzane z zapisanych danych wejściowych przy otwieraniu projektu. Plik projektu z nowszej wersji CivilCraft jest odrzucany, a komunikat podaje jego wersję.

## Co eksportuje

| Przycisk | Plik | Zawartość |
|---|---|---|
| {{ui:LandXML}} | `<nazwa>.xml` | LandXML 1.2: punkty, istniejący teren (oraz wyrównana powierzchnia, gdy istnieje) jako powierzchnie TIN, osie trasy, profile terenu i projektowe, sieć rurociągów |
| {{ui:DXF}} | `<nazwa>.dxf` | Rysunek DXF R12 linii planu tak, jak są wyświetlane, na nazwanych warstwach |
| {{ui:DWG}} | `<nazwa>.dwg` | Te same linie jako rysunek DWG, w wybranym formacie (od 2000 do 2018) |
| {{ui:PDF}} | `<nazwa>.pdf` | Wektorowy wydruk planu na arkuszu, w wybranej skali |
| {{ui:GLB}} lub {{ui:OBJ}} (na pasku widoku 3D) | `<nazwa>-3d.glb`, `<nazwa>-3d.obj` | To, co widok 3D pokazuje jako model 3D: metry, oś Y w górę, prawdziwa skala, względem zapisanego lokalnego początku |

Co każdy z nich pomija: [Wymiana LandXML](topic:landxml), [Eksport planu do DXF](topic:dxf-export) (także DWG), [Wydruk planu do PDF](topic:plot-pdf), [Eksport terenu w 3D](topic:export-3d).

## Gdzie trafiają pliki

Zapisane i wyeksportowane pliki trafiają tam, gdzie przeglądarka umieszcza pobrane pliki, zwykle do folderu Pobrane. Aby wybierać folder za każdym razem:

:::chromium
Otwórz **Ustawienia** przeglądarki, potem **Pobrane**, i włącz **Pytaj, gdzie zapisać każdy plik przed pobraniem**.
:::

:::firefox
Otwórz **Ustawienia**, potem **Ogólne**, a w sekcji **Pliki i aplikacje** wybierz **Zawsze pytaj, gdzie zapisać pliki**.
:::

:::safari
Otwórz **Safari > Ustawienia > Ogólne** i ustaw **Lokalizacja pobierania plików** na **Pytaj przy każdym pobieraniu**.
:::

Jeśli zapiszesz dwa razy pod tą samą nazwą, przeglądarka może dodać numer do drugiego pliku, na przykład `Teren (1).civilcraft.json`. Następnym razem otwórz najnowszy.

## Online i offline

CivilCraft działa tylko na Twoim komputerze w obu przypadkach: otwieranie odczytuje plik w przeglądarce, a zapis go pobiera. Aby otworzyć CivilCraft bez jakiegokolwiek połączenia, najpierw zapisz go do pracy offline:

1. Będąc online, kliknij {{ui:Save for offline}} na pasku aplikacji u góry.
2. Przycisk pokazuje postęp („Zapisywanie 12 z 30”), a potem {{ui:Offline ready}}. CivilCraft jest mały (około 0,6 MB), więc zajmuje to chwilę. Zapisana kopia zawiera tę pomoc i przykładowy teren.
3. Bez połączenia otwórz ten sam adres (lub zakładkę z nim). Wszystko działa, łącznie z {{ui:Open the sample site}}.

Pozostałe stany przycisku:

- {{ui:Could not save}}: niektóre pliki nie zostały pobrane. Sprawdź połączenie i kliknij, aby spróbować ponownie.
- {{ui:Offline not available}}: to okno przeglądarki nie może zachować kopii offline (okna prywatne i niektóre zarządzane komputery to blokują). Użyj zwykłego okna.

Kliknij {{ui:Offline ready}}, aby zobaczyć, kiedy zapisano kopię, z dwoma wyborami: {{ui:Save again (get the newest version)}} i {{ui:Remove the offline copy}}. Zapisz ponownie przed wizytą na placu, aby kopia odpowiadała najnowszej wersji. Więcej w [Tryb offline](common:offline).

:::offline
Jesteś teraz offline. Jeśli CivilCraft został zapisany do pracy offline, wszystko działa, łącznie z przykładowym terenem. Jeśli nie, pracuj dalej w tej karcie, ale nie przeładowuj jej, dopóki nie wrócisz online; bez zapisanej kopii {{ui:Open the sample site}} kończy się błędem „Nie udało się wczytać przykładu”.
:::

:::tip
Do pracy w terenie zapisz CivilCraft do pracy offline i przenieś pliki punktów na sam laptop. Projekty i eksporty zapisują się jako pobrane pliki bez połączenia, więc możesz zaimportować pomiary z dnia, sprawdzić powierzchnię i zapisać projekt na miejscu.
:::

Zapis w chmurze nie jest jeszcze dostępny, a wersje desktopowe jeszcze nie są gotowe. Na razie pliki, które zapisujesz, są jedyną kopią: przechowuj je w miejscu objętym kopią zapasową.

## Dodatki używane przez plik

Gdy zapisujesz projekt zawierający dane z dodatku (zaznaczenia Przepisy budowlane lub źródło Adres do terenu), plik zapisuje, które dodatki i w jakich wersjach. Jeśli otworzysz go na komputerze, na którym brakuje dodatku, pasek nad planem to powie i zaproponuje dodanie go z listy Twojego konta. Zapis jest tylko notatką: plik otwiera się tak czy inaczej.

## Cofanie w Studio

W CadCraft Studio każdy zakończony krok w CivilCraft jest zgłaszany Studio, więc jego cofanie na poziomie projektu może cofnąć najnowszy krok między aplikacjami. Studio cofa krok tylko wtedy, gdy stos cofania CivilCraft jest dokładnie w stanie, w jakim zostawił go ten krok; po otwarciu innego pliku pomija to okno.

## Zamykanie z niezapisanymi zmianami

Gdy projekt ma niezapisane zmiany, a zamykasz kartę, przeładowujesz stronę lub opuszczasz ją, przeglądarka pyta, czy chcesz wyjść. Jej treść i wygląd należą do przeglądarki i nie mogą być zmienione przez CivilCraft. {{ui:New}} oraz otwieranie projektu lub pliku LandXML pytają zamiast tego w oknie CivilCraft **Niezapisane zmiany**, z przyciskami {{ui:Cancel}}, {{ui:Don’t save}} i {{ui:Save a copy}}.
