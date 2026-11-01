---
title: Pierwsze kroki w CivilCraft
summary: Co robi CivilCraft, jak go otworzyć i pierwsze dziesięć minut z przykładowym terenem: od punktów do poziomic, drogi i zapisanego projektu.
keywords: start, pierwsze uruchomienie, przykładowy teren, wprowadzenie, szybki start, samouczek, początek, nowy projekt
from: c9b6dd8e
---

CivilCraft to aplikacja do projektowania infrastruktury i terenu z rodziny CadCraft. Z punktów pomiarowych buduje powierzchnię (TIN) z poziomicami, a potem pozwala wytyczyć trasy z profilami projektowymi, przeciągnąć prosty korytarz drogowy, wyprowadzić place budowlane do linii zasięgu skarp, sprawdzić grawitacyjną sieć rurociągów według Twoich reguł i zobaczyć objętości wykopów i nasypów. Czyta i zapisuje LandXML, eksportuje plan do DXF i drukuje go do PDF.

Jeśli pracowałeś(-aś) w Civil 3D, pojęcia będą znajome: punkty, grupy punktów, linie przełamań, trasy według PI, profile według PVI, korytarze, niwelacja, sieci rurociągów. Sposób pracy jest inny i dużo mniejszy: nie ma wiersza poleceń, stylów ani pliku rysunku. Przeczytaj raz [Jeśli przychodzisz z innego oprogramowania dla inżynierii lądowej](topic:coming-from) przed pierwszą prawdziwą pracą.

## Czego potrzebujesz

- Nowej przeglądarki na komputerze: Chrome, Edge, Firefox lub Safari. Zobacz [Przeglądarki](common:browsers).
- Myszy lub gładzika i klawiatury albo ekranu dotykowego: rysowanie ma tam na ekranie przyciski {{ui:Zakończ}}, {{ui:Cofnij punkt}} i {{ui:Anuluj}} (zobacz [Mysz, gładzik i dotyk](topic:keyboard#mouse-trackpad-and-touch)).
- Plan rysuje się w 2D na płótnie przeglądarki. [Widok 3D](topic:site-3d) używa grafiki WebGL przeglądarki; jeśli nie może się uruchomić, pasek stanu podaje powód, a plan nadal działa.
- Nie potrzeba konta ani przesyłania plików. Pliki otwierają się na Twoim komputerze i zapisują jako pobrane pliki. Zobacz [Twoje pliki](common:your-files).

:::note
CivilCraft działa dziś jako wczesna wersja w przeglądarce, która wciąż powstaje. Wersji na komputer jeszcze nie ma, a zapis w chmurze jeszcze nie jest dostępny. Wszystko, co zrobisz, zostaje na Twoim komputerze, dopóki tego nie zapiszesz lub nie wyeksportujesz.
:::

## Otwórz CivilCraft

1. Otwórz CivilCraft w przeglądarce.
2. Poczekaj, aż ekran się wypełni: pasek narzędzi na górze, panel po lewej, plan pośrodku i panel **Właściwości** po prawej.
3. Na pustym planie zobaczysz ramkę **Zacznij od punktów pomiarowych**. Zawiera pierwsze kroki i łącze {{ui:Otwórz przykładowy teren}}.

Aby później używać CivilCraft bez połączenia, kliknij {{ui:Zapisz do pracy offline}} na pasku aplikacji i poczekaj na {{ui:Gotowe offline}}. Kopia zawiera tę pomoc, przykładowy teren oraz biblioteki 3D i GIS. Zobacz [Praca offline](common:offline). Naciśnij {{key:F1}} lub kliknij {{ui:Pomoc}}, aby w dowolnej chwili otworzyć tę pomoc obok aplikacji.

## Pierwsze dziesięć minut: przykładowy teren

Przykładowy teren to niewielki pomiar w stopach amerykańskich: 276 punktów we współrzędnych state plane, grzbiet, rowek z linią spływu i dwie górne krawędzie skarp. Jest dołączony do aplikacji, więc możesz pracować bez własnego pliku.

1. Kliknij {{ui:Otwórz przykładowy teren}} w ramce na planie.
   Otworzy się okno **Importuj punkty**. Pisze w nim, że odczytano 276 punktów jako PNEZD (z wiersza nagłówka), rozdzielonych przecinkami, i pokazuje pierwsze wiersze.
2. Kliknij {{ui:Importuj}}.
   Plan wypełnia się punktami, poziomicami i krawędzią powierzchni. Pasek stanu na dole informuje, że punkty zaimportowano, i podaje liczbę trójkątów powierzchni (546).
3. Spójrz na lewy panel w sekcji **Punkty**. Punkty są pogrupowane według pierwszego słowa opisu: CP, FL, GRD, RIDGE, TBN, TBS i TREE.
4. W kolumnie **Powierzchnia** tej tabeli ustaw **FL**, **RIDGE**, **TBN** i **TBS** na {{ui:Linia przełamania}}.
   Powierzchnia przebudowuje się od razu. Dane **Powierzchnia** pokazują teraz „Linie przełamań: 4”, a poziomice ostro zakręcają wzdłuż linii spływu i grzbietu zamiast ciąć je w poprzek.
5. Przesuń wskaźnik nad planem. Pasek stanu pokazuje współrzędną wschodnią i północną pod wskaźnikiem oraz rzędną terenu w tym miejscu.
6. W sekcji **Wyświetlanie** ustaw {{ui:Poziomice co}} na 0.5 ft i włącz {{ui:Pasma rzędnych}}. Pod polami wyboru pojawi się skala kolorów z legendą. Po zakończeniu wyłącz pasma.

Masz teraz powierzchnię terenu istniejącego. Teraz droga.

## Wytycz krótką drogę

1. Naciśnij {{key:A}} (lub kliknij {{ui:Oś}} w grupie **Projekt**).
2. Kliknij kolejno trzy punkty na terenie. Czerwona linia podąża za wskaźnikiem i pokazuje długość i kierunek następnej prostej.
3. Naciśnij {{key:Enter}}, aby zakończyć.
   Trasa pojawia się z kilometrażem. Prawy panel pokazuje **Oś trasy**: jej długość, tabelę PI i łuk w środkowym PI (promień 100 ft lub mniejszy, jeśli 100 ft się nie mieści).
4. W prawym panelu, w sekcji **Profil projektowy**, kliknij {{ui:Zacznij od terenu}}.
   Pod planem otwiera się widok profilu z terenem istniejącym i prostą niweletą projektową od końca do końca.
5. Naciśnij {{key:I}}, aby włączyć {{ui:Dodaj PVI}}, a potem kliknij raz w widoku profilu blisko środka. Pojawi się PVI.
6. W tabeli PVI po prawej wpisz długość łuku (na przykład 100) w polu **Łuk L** środkowego PVI i naciśnij {{key:Enter}}. Profil ma teraz łuk pionowy z opisaną wartością K.
7. W sekcji **Korytarz** zaznacz **Przeciągnij przekrój wzdłuż profilu projektowego**.
   Droga jest wyprowadzona w teren: pasy ruchu, pobocza i skarpy do linii zasięgu. Blok **Roboty ziemne** pokazuje wykop i nasyp.

Nie przejmuj się dokładnymi wartościami. Każdą liczbę można zmienić w prawym panelu, a {{key:Mod+Z}} cofa ostatnią zmianę.

## Zapisz swoją pracę

1. Wpisz nazwę w polu **Nazwa** na górze lewego panelu.
2. Naciśnij {{key:Mod+S}} (lub kliknij {{ui:Zapisz}}).
   Przeglądarka pobiera plik nazwany według terenu, z końcówką `.civilcraft.json`. Zawiera punkty, ustawienia powierzchni, trasy, profile, korytarze, place i rurociągi.
3. Aby kontynuować później, kliknij {{ui:Otwórz}} (lub naciśnij {{key:Mod+O}}) i wybierz ten plik albo upuść go na plan.

:::warning
Nie ma automatycznego zapisu. Jeśli zamkniesz kartę z niezapisanymi zmianami, przeglądarka zapyta, czy wyjść; jeśli wyjdziesz, zmiany przepadną. Zapisuj często.
:::

## Dokąd dalej

- [Zaimportuj punkty pomiarowe](topic:import-points) z własnych plików.
- [Zbuduj i dopracuj powierzchnię](topic:build-surface) za pomocą linii przełamań i granicy.
- [Ekran, część po części](topic:workspace).
- [Klawisze i mysz](topic:keyboard).
