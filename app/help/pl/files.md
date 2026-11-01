---
title: Pliki, które możesz otworzyć, zapisać i wyeksportować
summary: Pliki punktów, LandXML i projekty CivilCraft na wejściu; projekty, LandXML, DXF i PDF na wyjściu; co zachowuje każdy z nich, dokąd trafiają pliki i co zmienia się w trybie offline.
keywords: otwórz, zapisz, eksport, import, formaty plików, csv, txt, landxml, xml, dxf, pdf, json, pobierz, plik projektu
from: a7debb61
---

CivilCraft otwiera pliki z komputera, a zapisuje je, pobierając z powrotem na komputer. Nic nie jest przesyłane i nic nie jest przechowywane na serwerze. Zobacz też [Twoje pliki](common:your-files).

## Co otwiera

Kliknij {{ui:Otwórz}} (albo naciśnij {{key:Mod+O}}) i wybierz plik, lub przeciągnij plik z {{pick:mac=Finder|windows=File Explorer|linux=twojego menedżera plików}} na plan. Jeden plik naraz; pliki większe niż 200 MB są odrzucane.

| Rodzaj | Nazwy plików | Co się dzieje |
|---|---|---|
| Plik punktów | `.csv`, `.txt`, `.pnt`, `.xyz` (dowolny plik tekstowy) | Otwiera się okno dialogowe **Importuj punkty**. Punkty zastępują punkty projektu; trasy (osie), place i rurociągi pozostają. |
| LandXML | `.xml`, `.landxml` | Z pliku tworzony jest **nowy projekt** (najpierw zostaniesz zapytany, jeśli bieżący projekt ma niezapisane zmiany). |
| Projekt CivilCraft | `.civilcraft.json` (dowolny `.json`) | Projekt otwiera się tak, jak został zapisany (najpierw zostaniesz zapytany, jeśli bieżący projekt ma niezapisane zmiany). |

CivilCraft rozpoznaje typ po rozszerzeniu pliku, a potem po jego pierwszych znakach: tekst zaczynający się od `{` jest odczytywany jako projekt, tekst zaczynający się od `<` jako LandXML, a wszystko inne jako plik punktów. Plik, który okno otwierania wyszarza, nadal można upuścić na plan.

:::note
Import pliku punktów do projektu, który już ma punkty, zastępuje je bez pytania i czyści historię cofania (otwarcie dowolnego pliku to świeży start dla cofania). Jeśli powierzchnia pochodzi z LandXML, import punktów przełącza ją z powrotem na powierzchnię zbudowaną z punktów. Zapisz najpierw, jeśli możesz chcieć później przywrócić stare punkty.
:::

Szczegóły: [Formaty plików punktów](topic:point-file-formats), [LandXML: co jest odczytywane i zapisywane](topic:landxml-reference).

## Co zapisuje

{{ui:Zapisz}} ({{key:Mod+S}}) zapisuje dwa pliki obok siebie, nazwane według **Nazwa** w lewym panelu: `<nazwa>.civilcraft.json`, czyli projekt, który dalej edytujesz, oraz `<nazwa>.ifc`, czyli ten sam projekt w formacie IFC 4.3 dla innych programów (zobacz [Eksport i import IFC](topic:ifc)). Każdy z plików wskazuje drugi, a IFC zawiera też skompresowaną kopię projektu, więc IFC wysłany samodzielnie nadal otwiera się w pełni edytowalny.

- **W Studio** oba pliki są zapisywane obok siebie, w tym samym miejscu.
- **W Chrome i Edge** przy pierwszym zapisie pojawia się pytanie o folder; oba pliki są zapisywane w nim, a kolejne zapisy trafiają do tego samego folderu. Anuluj pytanie o folder, aby zamiast tego pobrać oba pliki.
- **W innych przeglądarkach** oba pliki są pobierane, najpierw plik projektu.

Otwierając którykolwiek z plików, CivilCraft szuka drugiego. Otwórz oba razem (albo przeciągnij oba), albo jeden: w Studio drugi znajdowany jest w tym samym folderze; w przeglądarce CivilCraft prosi o dodanie go albo o kontynuowanie z tym, który masz. Jeśli IFC został zmieniony przez inny program po zapisie w CivilCraft albo jeden plik jest starszy od drugiego, projekt otwiera się z nowszej wersji, a panel **Problemy** wyjaśnia, co się stało, z przyciskami **Zapisz teraz** (ponownie zapisuje oba pliki) i **Pokaż geometrię IFC jako odniesienie**. Samodzielny IFC zmieniony przez inny program otwiera się ze swoją kopią projektu, z tym, co nadal pasuje: trasy, które zmienił, przyjmują jego geometrię, obiekty, które usunął, są pomijane, a pozostałe zmiany są wymienione, ale nie przejmowane. Plik projektu sprzed wersji 0.7.1 otwiera się jak dotychczas.

Plik projektu zawiera:

- każdy punkt (numer, współrzędne, rzędną, opis) oraz nazwę pliku punktów, z którego pochodzą
- ustawienia powierzchni: wybory grup, narysowane linie załamania, granicę, najdłuższą zewnętrzną krawędź oraz TIN odczytany z LandXML
- ustawienia wyświetlania
- trasy wraz z ich PI, promieniami i kilometrażem początkowym, ich profile projektowe (PVI i długości łuków) oraz ustawienia korytarza
- place i sieć rurociągów wraz z jej regułami

Nie zachowuje historii cofania. Powierzchnie, warstwice, linie przecięcia z terenem i objętości nie są zapisywane; są odbudowywane z zapisanych danych wejściowych przy otwieraniu projektu. Plik projektu z nowszej wersji CivilCraft jest odrzucany z komunikatem podającym jego wersję.

## Co eksportuje

| Przycisk | Plik | Zawartość |
|---|---|---|
| {{ui:LandXML}} | `<nazwa>.xml` | LandXML 1.2: punkty, istniejący teren (oraz wyrównana powierzchnia, jeśli istnieje) jako powierzchnie TIN, trasy, profile terenu i projektowe, sieć rurociągów |
| {{ui:DXF}} | `<nazwa>.dxf` | DXF R12 linii planu tak, jak są wyświetlane, na nazwanych warstwach |
| {{ui:DWG}} | `<nazwa>.dwg` | Te same linie jako rysunek DWG, w formacie, który wybierzesz (od 2000 do 2018) |
| {{ui:PDF}} | `<nazwa>.pdf` | Wektorowy wydruk planu na arkuszu, w skali, którą wybierzesz |
| {{ui:GLB}} lub {{ui:OBJ}} (na pasku widoku 3D) | `<nazwa>-3d.glb`, `<nazwa>-3d.obj` | To, co widok 3D pokazuje jako model 3D: metry, oś Y w górę, prawdziwa skala, wokół zapisanego lokalnego początku układu |

Czego każdy z nich nie zawiera: [Wymiana LandXML](topic:landxml), [Eksport planu do DXF](topic:dxf-export) (także DWG), [Wydruk planu do PDF](topic:plot-pdf), [Eksport terenu do 3D](topic:export-3d).

## Gdzie trafiają pliki

Zapisane i wyeksportowane pliki trafiają tam, gdzie przeglądarka umieszcza pobrane pliki, zwykle do folderu Pobrane. Aby wybierać folder za każdym razem:

:::chromium
Otwórz **Ustawienia** przeglądarki, potem **Pobrane**, i włącz **Pytaj, gdzie zapisać każdy plik przed pobraniem**.
:::

:::firefox
Otwórz **Ustawienia**, potem **Ogólne**, i w sekcji **Pliki i aplikacje** wybierz **Zawsze pytaj, gdzie zapisać pliki**.
:::

:::safari
Otwórz **Safari > Ustawienia > Ogólne** i ustaw **Lokalizacja pobranych plików** na **Pytaj przy każdym pobieraniu**.
:::

Jeśli zapiszesz dwa razy pod tą samą nazwą, przeglądarka może dodać numer do drugiego pliku, na przykład `Site (1).civilcraft.json`. Następnym razem otwórz najnowszy.

## Online i offline

CivilCraft działa wyłącznie na Twoim komputerze w obu przypadkach: otwieranie odczytuje plik w przeglądarce, zapisywanie go pobiera. Aby otworzyć CivilCraft bez żadnego połączenia, najpierw zapisz go do pracy offline:

1. Będąc online, kliknij {{ui:Zapisz do pracy offline}} na pasku aplikacji u góry.
2. Przycisk liczy w górę („Zapisywanie 12 z 30”), a potem pokazuje {{ui:Gotowe offline}}. CivilCraft jest mały (około 0,6 MB), więc chwilę to trwa. Zapisana kopia zawiera tę pomoc i przykładowy teren.
3. Bez połączenia otwórz ten sam adres (albo zakładkę do niego). Wszystko działa, łącznie z {{ui:Otwórz przykładowy teren}}.

Pozostałe stany przycisku:

- {{ui:Nie udało się zapisać}}: niektóre pliki nie zostały pobrane. Sprawdź połączenie i kliknij przycisk, aby spróbować ponownie.
- {{ui:Tryb offline niedostępny}}: to okno przeglądarki nie może zachować kopii offline (okna prywatne i niektóre zarządzane komputery to blokują). Użyj zwykłego okna.

Kliknij {{ui:Gotowe offline}}, aby zobaczyć, kiedy zapisano kopię, z dwiema opcjami: {{ui:Zapisz ponownie (pobierz najnowszą wersję)}} i {{ui:Usuń kopię offline}}. Zapisz ponownie przed wizytą na terenie, aby kopia odpowiadała najnowszej wersji. Więcej w [Offline](common:offline).

:::offline
Jesteś teraz offline. Jeśli CivilCraft został zapisany do pracy offline, wszystko działa, łącznie z przykładowym terenem. Jeśli nie, pracuj dalej w tej karcie, ale nie przeładowuj jej, dopóki nie będziesz znów online; bez zapisanej kopii {{ui:Otwórz przykładowy teren}} kończy się błędem „Nie udało się wczytać przykładu”.
:::

:::tip
Do pracy w terenie zapisz CivilCraft do pracy offline i przenieś pliki punktów na sam laptop. Projekty i eksporty zapisują się jako pobrane pliki bez połączenia, więc możesz zaimportować pomiary z całego dnia, sprawdzić powierzchnię i zapisać projekt na miejscu.
:::

Zapis w chmurze nie jest jeszcze dostępny, a wersje na komputer nie zostały jeszcze wydane. Na razie pliki, które zapisujesz, są jedyną kopią: przechowuj je w miejscu objętym kopią zapasową.

## Dodatki używane przez plik

Gdy zapisujesz projekt, który zawiera dane z dodatku (zaznaczenia **Przepisy budowlane** albo źródło **Adres na teren**), plik zapisuje, które dodatki i w jakich wersjach. Otwarcie go na komputerze, na którym brakuje dodatku, pokazuje pasek nad planem z informacją i propozycją dodania go z listy na Twoim koncie. Ten zapis to tylko notatka: plik otwiera się tak czy inaczej.

## Cofanie w Studio

W CadCraft Studio każdy ukończony krok w CivilCraft jest przekazywany do Studio, więc jego cofanie na poziomie projektu może cofnąć ostatni krok między aplikacjami. Studio cofa krok tylko wtedy, gdy stos cofania CivilCraft jest dokładnie taki, jak krok go zostawił; po otwarciu innego pliku pomija to okno.

## Zamykanie z niezapisanymi zmianami

Gdy projekt ma niezapisane zmiany, a zamykasz kartę, przeładowujesz stronę albo ją opuszczasz, przeglądarka pyta, czy chcesz wyjść. Jej treść i wygląd należą do przeglądarki i CivilCraft ich nie zmieni. {{ui:Nowy}}, a także otwarcie projektu lub pliku LandXML, pytają natomiast we własnym oknie CivilCraft **Niezapisane zmiany**, z przyciskami {{ui:Anuluj}}, {{ui:Nie zapisuj}} i {{ui:Zapisz kopię}}.
