---
title: Rozwiązywanie problemów
summary: Objawy, przyczyny i sposoby naprawy problemów spotykanych w CivilCraft, z dokładnymi komunikatami, które pokazuje aplikacja.
keywords: problemy, błędy, nie działa, napraw, pomoc, komunikaty, rozwiązywanie problemów, odrzucony, brak, błędny, zamienione, brak poziomic
from: a9f7dedc
---

Komunikaty pojawiają się w pasku stanu w prawym dolnym rogu, w ramkach w lewym i prawym panelu oraz w oknach dialogowych. Tutaj są cytowane tak, jak pokazuje je aplikacja.

## Otwieranie plików

**"Ten plik ma ponad 200 MB; CivilCraft nie otwiera jeszcze plików tak dużych."**
Podziel plik punktów albo przed otwarciem przerzedź dane.

**"Nie udało się otworzyć site.json: To nie jest plik projektu CivilCraft."**
Plik kończy się na `.json` albo zaczyna się od `{`, ale nie jest projektem CivilCraft. Pliki punktów nie mogą zaczynać się od `{`.

**"Nie udało się otworzyć … Ten plik projektu pochodzi z nowszego CivilCraft (wersja 2)."**
Projekt zapisano w nowszej wersji. Otwórz go tam albo wyeksportuj z niego LandXML.

**"Nie udało się otworzyć … To jest XML, ale nie LandXML (jego element główny to <…>)."**
Plik jest innym rodzajem XML. Wyeksportuj LandXML z innego programu.

**"… nie zawiera punktów, powierzchni TIN ani tras, które CivilCraft może odczytać."**
Wszystko w pliku to elementy, które CivilCraft pomija (na przykład tylko powierzchnie siatkowe albo tylko trasy spiralne). Dalsza część komunikatu mówi, co w pliku było. Zobacz [LandXML: co jest odczytywane i zapisywane](topic:landxml-reference).

**"Nie udało się wczytać przykładu: …"**
{{ui:Otwórz przykładowy teren}} czyta plik z witryny CadCraft. Bez połączenia działa tylko wtedy, gdy CivilCraft zapisano do pracy offline (przycisk na pasku aplikacji pokazuje {{ui:Gotowe offline}}). Połącz się z siecią, kliknij {{ui:Zapisz do pracy offline}}, a od tej pory będzie działać offline. Zobacz [Tryb offline](common:offline).

**{{ui:Zapisz do pracy offline}} pokazuje {{ui:Nie udało się zapisać}}.**
Niektórych plików nie udało się pobrać. Sprawdź połączenie i kliknij przycisk ponownie.

**{{ui:Zapisz do pracy offline}} pokazuje {{ui:Tryb offline niedostępny}}.**
To okno przeglądarki nie może przechowywać kopii offline, zwykle dlatego, że jest to okno prywatne albo komputer jest zarządzany. Otwórz CivilCraft w zwykłym oknie.

**Offline aplikacja w ogóle się nie otwiera.**
Nie zapisano jej do pracy offline w tej przeglądarce albo przeglądarka wyczyściła dane witryny (Safari tak robi w przypadku witryn nieodwiedzanych przez kilka tygodni). Połącz się z siecią, otwórz CivilCraft i kliknij {{ui:Zapisz do pracy offline}}.

**Kopia offline jest starszą wersją.**
Kliknij {{ui:Gotowe offline}}, a następnie {{ui:Zapisz ponownie (pobierz najnowszą wersję)}}, będąc online.

**Plik jest wyszarzony w oknie otwierania.**
Okno pokazuje tylko pliki punktów, LandXML i projektów, rozpoznawane po rozszerzeniu. Przeciągnij plik na plan albo zmień mu nazwę na `.txt`.

## Importowanie punktów

**"Z tego pliku nie udało się odczytać żadnych punktów."**
Wybierz ręcznie kolejność kolumn w **Kolumny**. Jeśli nic nie działa, otwórz plik w edytorze tekstu i sprawdź, czy jest jeden punkt w wierszu, z liczbami.

**Teren wygląda na odbity lustrzanie, obrócony albo rozciągnięty w linię.**
Północ i wschód są zamienione. Podsumowanie mówiło "zgadnięto na podstawie liczby kolumn". Wybierz PENZD zamiast PNEZD (albo odwrotnie) w **Kolumny** albo zaimportuj ponownie.

**Punkty daleko od reszty, a plan wyświetla się pomniejszony do kropki.**
W wierszu jest literówka we współrzędnej albo plik miesza układy współrzędnych. Znajdź punkt (kliknij go, aby zobaczyć jego numer) i popraw plik.

**Wiersze wymienione w "Wiersze nieodczytane".**
Zobacz tabelę w [Importowanie punktów pomiarowych](topic:import-points#rows-that-are-not-read).

**Moje stare punkty zniknęły.**
Import pliku punktów zastępuje wszystkie punkty i czyści cofanie. Otwórz zapisany projekt, aby je odzyskać.

## Powierzchnia

**"Powierzchnia: Nie zbudowano" z czerwoną ramką.**
Ramka mówi, dlaczego: "Powierzchnia potrzebuje co najmniej trzech punktów z rzędnymi.", "Wszystkie punkty leżą na jednej linii: brak trójkątów.", "Brak punktów z rzędnymi.", "Granica nie pokrywa się z punktami." albo "Wewnątrz granicy nie zostały żadne trójkąty." Sprawdź kolejność kolumn, grupy punktów (czy są {{ui:Pominięte}}?) i granicę.

**Poziomice przecinają prosto rów albo grzbiet.**
Ta linia nie jest linią przełamania. Ustaw jej grupę na {{ui:Linia przełamania}} albo narysuj ją narzędziem {{ui:Linia przełamania}}. Zobacz [Budowa i udoskonalanie powierzchni](topic:build-surface).

**Grupa linii przełamania rysuje zygzak.**
Grupa zawiera więcej niż jedną linię albo jej punkty nie są ponumerowane wzdłuż linii. Ustaw grupę z powrotem na {{ui:Punkty}} i narysuj każdą linię narzędziem {{ui:Linia przełamania}}.

**Długie, wąskie trójkąty wzdłuż zewnętrznej krawędzi.**
Narysuj granicę ({{key:O}}) albo ustaw **Najdłuższa krawędź zewnętrzna**.

**Brak poziomic, mimo że powierzchnia jest zbudowana.**
Albo {{ui:Poziomice}} jest wyłączone w **Wyświetlanie**, albo odstęp jest tak mały, że powstałoby ponad 2,000 poziomic. Wybierz większy odstęp.

**Linie przełamania ani granica nic nie zmieniają.**
Powierzchnia pochodzi z LandXML ("Powierzchnia (z LandXML)"). Jest używana bez zmian. Kliknij {{ui:Przebuduj powierzchnię z punktów}}, aby zbudować ją z punktów.

**"Nie ma jeszcze powierzchni: najpierw otwórz punkty pomiarowe."**
Linia przełamania, granica i plac wymagają istniejącej powierzchni terenu. Najpierw zaimportuj punkty.

**"Kliknij punkt pomiarowy z rzędną: linia przełamania przyjmuje rzędne punktów."**
Narzędzie {{ui:Linia przełamania}} wybiera tylko punkty pomiarowe. Przybliż i kliknij punkt (pomarańczowy kwadrat pokazuje ten, który zostanie wzięty).

## Rysowanie

**Mój ostatni punkt zniknął, gdy dwukrotnie kliknąłem, aby zakończyć.**
W tej wersji dwukrotne kliknięcie kończy trasę, plac, linię przełamania lub granicę, ale pomija punkt, w który kliknąłeś dwukrotnie. Kliknij ostatni punkt raz i naciśnij {{key:Enter}}. Jeśli to już się stało, użyj {{key:Mod+Z}} i narysuj ponownie.

**Nie mogę zakończyć rysunku na tablecie.**
Do zakończenia potrzebny jest {{key:Enter}}; nie ma jeszcze przycisku na ekranie. Podłącz klawiaturę. Zobacz [Mysz, gładzik i dotyk](topic:keyboard#mouse-trackpad-and-touch).

**Przeciąganie, aby postawić punkt, zamiast tego przesuwa widok.**
Przeciągnięcie na więcej niż kilka pikseli przesuwa plan we wszystkich narzędziach. Klikaj bez przesuwania.

**"Trasa wymaga co najmniej dwóch punktów." / "Plac wymaga co najmniej trzech narożników." / "Ciąg rurociągu wymaga co najmniej dwóch budowli."**
Naciśnięto {{key:Enter}} za wcześnie. Rysunek zostaje odrzucony; zacznij od nowa.

**Klawisze, takie jak A czy G, nic nie robią.**
Pole tekstowe albo lista w panelu wciąż ma fokus, więc litery trafiają tam. Kliknij raz plan, a potem naciśnij klawisz. Na Macu klawisz usuwania to dla przeglądarki Backspace: aby usunąć zaznaczenie, użyj Fn i Delete.

## Trasy i profile

**"Łuki w PI 2 i PI 3 nakładają się: … Użyj mniejszych promieni."**
Dwa łuki potrzebują więcej stycznej, niż jest między ich PI. Zmniejsz jeden lub oba promienie w tabeli PI albo rozsuń PI.

**"PI 3 zawraca prosto do tyłu; nie może mieć łuku."**
Trasa zawraca na siebie w tym PI. Przesuń lub usuń PI.

**"Ta trasa nie ma pod sobą terenu, od którego można zacząć."**
Trasa leży poza powierzchnią. Przesuń ją na powierzchnię albo dodaj PVI, klikając przy włączonym {{ui:Dodaj PVI}}.

**"Łuk pionowy w PVI 3 (L = …) zaczyna się przed łukiem lub PVI przed jego końcem." / "… wykracza poza następne PVI."**
Skróć długość łuku albo rozsuń PVI.

**"Już istnieje PVI przy …"**
PVI istnieje na tym kilometrażu. Kliknij w innym miejscu albo przeciągnij istniejące.

**Widok profilu jest pusty: "Narysuj trasę, aby zobaczyć jej profil."**
Nie ma trasy albo wybrana ma błędy.

## Korytarze i place

**"Korytarz wymaga profilu projektowego bez błędów."**
Zacznij profil projektowy ({{ui:Zacznij od terenu}}) i popraw wszelkie nakładające się łuki.

**"… skarpy wychodzą poza powierzchnię, zanim spotkają grunt." / "… linie skarp wychodzą poza powierzchnię, zanim ją spotkają …"**
Niwelacja dochodzi do krawędzi powierzchni, zanim spotka grunt. Przesuń projekt od krawędzi do środka albo przybliż go do terenu. Nowy plac narysowany częściowo poza powierzchnią może zaczynać się na rzędnej 0: wpisz rzeczywistą rzędną.

**"Linie wyjścia skarp (daylight) korytarza przecinają …" / "Linia wyjścia skarpy przecina samą siebie …"**
Skarpy z różnych stron zderzają się ze sobą: ciasne łuki, wąskie place, głębokie wykopy albo wysokie nasypy. Użyj większego promienia, węższego przekroju poprzecznego, szerszego placu albo bardziej stromych skarp.

**"Nie ma jeszcze objętości: plac musi być wyprofilowany bez problemów."**
Usuń problemy wymienione w czerwonej ramce powyżej.

**{{ui:Projektowana (wyprowadzona)}} jest wyszarzona.**
Żaden plac ani korytarz nie jest jeszcze wyprowadzony.

## Rurociągi

**"P2 nie ma jeszcze rzędnych den."**
Kliknij {{ui:Ustaw jej dna według zasad}} albo wpisz rzędne den.

**"P1: brak terenu w S1, od którego można zacząć."**
Budowla na górnym biegu leży poza powierzchnią i nie ma krawędzi (rim). Wpisz dla niej rzędną krawędzi.

**Każdy rurociąg jest oznaczony po przesunięciu budowli.**
Przesunięcie budowli nie zmienia rzędnych den. Kliknij {{ui:Ustaw wszystkie dna według zasad}}.

Wszystkie komunikaty sieci są wyjaśnione w [Układanie sieci rurociągów grawitacyjnych](topic:pipe-network#read-and-fix-problems).

## Zapisywanie i eksport

**"Nie ma jeszcze nic do wyeksportowania." / "Nie ma jeszcze nic do wydruku."**
Projekt jest pusty. Najpierw zaimportuj punkty.

**Nie mogę znaleźć zapisanego pliku.**
Jest w pobranych plikach przeglądarki (zwykle w folderze Pobrane). Zobacz [Pliki, które możesz otworzyć, zapisać i wyeksportować](topic:files#where-the-files-go).

**Skala PDF na papierze jest błędna.**
Drukuj w 100% lub w rzeczywistym rozmiarze, a nie "dopasuj do strony".

**Znaki zapytania w tekście PDF.**
Nazwy lub opisy używają znaków spoza zachodnioeuropejskiego zestawu. Komunikat w pasku stanu je liczy. Zmień nazwy na zwykłe znaki.

**Wydruk jest ucięty na brzegach.**
Skala jest za duża dla arkusza. Wybierz skalę oznaczoną "(mieści się)", większy arkusz albo {{ui:To, co jest na ekranie}}.

**{{key:Mod+P}} otworzyło okno drukowania przeglądarki.**
Strona nie miała fokusu. Zamknij okno, kliknij plan i naciśnij ponownie {{key:Mod+P}}, albo kliknij {{ui:PDF}}.

## Sama aplikacja

**Ekran jest pusty albo pasek narzędzi nie działa.**
Użyj aktualnej wersji Chrome, Edge, Firefoksa lub Safari i odśwież stronę. Zobacz [Przeglądarki](common:browsers).

**Aplikacja działa wolno przy dużym pliku punktów.**
Wyłącz {{ui:Trójkąty}}, {{ui:Opisy punktów}} i {{ui:Pasma rzędnych}} i użyj większego odstępu poziomic. Bardzo duże powierzchnie przebudowują się po każdej zmianie przez chwilę.

**Przeglądarka pyta "Opuścić witrynę?"**
Projekt ma niezapisane zmiany. Zostań, zapisz za pomocą {{key:Mod+S}}, a potem opuść stronę.
