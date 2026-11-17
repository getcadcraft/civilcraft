---
title: Menu, klawisze i mysz
summary: Wybierz styl menu pasujący do dotychczasowego sposobu pracy, przypisz dowolnemu poleceniu własny klawisz, przenoś polecenia między kartami wstążki i ustaw, co robią kółko oraz przyciski myszy w rzucie i w 3D.
keywords: styl menu, menu, wstążka, wstążka projektowa, pasek narzędzi, wiersz poleceń, klasyczny rysunek, skróty klawiszowe, klawisze, dostosuj, przypisz ponownie, mysz, kółko, kierunek przewijania, przycisk środkowy, przycisk prawy, przesuwanie, eksport, import, przełączanie, znajomy
from: 07ac73a0
---

Polecenia CivilCraft są takie same, niezależnie od drogi dojścia do nich. **Styl menu** decyduje tylko o tym, gdzie polecenia znajdują się na ekranie, jak się tam nazywają i jakie klawisze je uruchamiają, dzięki czemu można zachować dotychczasowe nawyki. Wybierz go w {{ui:Ustawienia}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menu, klawisze i mysz}}; zmiana działa od razu, a ta przeglądarka ją pamięta.

## Trzy style

| Styl | Co dostajesz |
|---|---|
| {{ui:CivilCraft}} | Własny pasek narzędzi CivilCraft (Plik, Eksport, Powierzchnia, Projekt, Edycja, GIS, Widok) i pojedyncze klawisze: {{key:A}} trasa, {{key:G}} plac, {{key:P}} rurociągi, {{key:B}} linia przełamania, {{key:O}} granica, {{key:L}} linia charakterystyczna, {{key:R}} profil, {{key:X}} przekroje, {{key:E}} niwelacja, {{key:D}} 3D, {{key:F}} dopasuj, {{key:V}} zaznacz. Stan początkowy. |
| {{ui:Klasyczny rysunek}} | Mała wstążka ({{ui:Start}}, {{ui:Wstaw}}, {{ui:Wyjście}}) i wiersz poleceń dla osób, które wpisują polecenia: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (cofnij), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Zacznij pisać w dowolnym miejscu, a litery trafią do wiersza poleceń; {{key:Enter}} uruchamia polecenie, {{key:Enter}} bez wpisu powtarza ostatnie polecenie, {{key:Esc}} czyści wiersz. Środkowy przycisk przesuwa widok. |
| {{ui:Wstążka projektowa}} | Karty dużych przycisków, pogrupowane tak jak narzędzia w programach do projektów inżynierskich: {{ui:Start}} (dane terenowe, tworzenie projektu, widoki profilu i przekroju), {{ui:Powierzchnie}}, {{ui:Modyfikuj}}, {{ui:Geolokalizacja}}, {{ui:Widok}} i {{ui:Wyjście}}, z menu {{ui:Plik}} i szybkimi przyciskami po prawej stronie. Pojedyncze klawisze pozostają. Środkowy przycisk przesuwa rzut; w 3D środkowy przycisk przesuwa widok, a {{key:Shift}} ze środkowym przyciskiem go obraca. |

Każdy styl zachowuje klawisze {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Klawisz z układu CivilCraft, który styl przypisał innemu poleceniu, nie działa, a wiersz stanu podaje, dokąd trafiło to polecenie („W profilu Moje klawisze: plac to Ctrl+Alt+G”). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} i strzałki zawsze zachowują swoje znaczenie, a podczas rysowania linii jej punkty zachowują swoje klawisze ({{key:Backspace}}, {{key:Enter}}).
:::

## Ustaw po swojemu

1. Wybierz styl najbliższy oczekiwaniom, a następnie kliknij {{ui:Dostosuj…}}.
2. Na karcie {{ui:Klawisze i menu}} znajdź polecenie (pomaga pole wyszukiwania). Kliknij {{ui:Dodaj klucz}} i naciśnij klawisz albo dwa klawisze pod rząd dla klawisza dwuliterowego. Kliknij klawisz, aby go usunąć.
3. Przy wstążce {{ui:Gdzie jest}} przenosi polecenie na inną kartę i panel, do menu {{ui:Plik}} albo do {{ui:Tylko klawisze}}.
4. Na karcie {{ui:Mysz}} ustaw kółko, przyciski przesuwające rzut oraz to, co każdy przycisk robi w widoku 3D.
5. Nadaj nazwę i kliknij {{ui:Zapisz}}.

Zapisanie wbudowanego stylu tworzy własną kopię („Moja wstążka projektowa”); wbudowany styl nigdy się nie zmienia. Klawisz przypisany do dwóch poleceń albo taki, który uruchomiłby się, zanim dałoby się wpisać dwuliterowy klawisz, jest pokazywany na czerwono i trzeba go poprawić przed zapisaniem.

## Mysz

- **Kółko myszy**: {{ui:Przewinięcie w górę powiększa}} (domyślnie) albo {{ui:Przewinięcie w górę pomniejsza}}, a także jak szybko, w rzucie i w 3D. Szczypnięcie na gładziku zawsze powiększa zgodnie z ruchem palców.
- **Przesuwanie rzutu**: środkowym przyciskiem, prawym przyciskiem albo obydwoma. {{key:Space}} i przeciąganie też przesuwają. Lewy przycisk zawsze wskazuje i rysuje.
- **Przeciąganie w widoku 3D**: {{ui:Własne dla każdego widoku}} zachowuje przyciski CivilCraft (lewy obraca, prawy przesuwa). Albo ustaw każdy przycisk na obrót, przesuwanie, powiększanie lub nic; {{key:Shift}} z przyciskiem zamienia obrót z przesuwaniem. Kliknięcie bez przeciągania nadal wskazuje obiekt.

## Zabierz ze sobą

{{ui:Eksport}} zapisuje używany styl jako mały plik `.ccinput.json`; {{ui:Importuj…}} dodaje taki plik z innego komputera albo od kolegi. Zaimportowany plik może wskazywać tylko polecenia CivilCraft: wszystko inne zostaje pominięte i policzone w wierszu stanu. {{ui:Usuń ten styl}} usuwa jeden z własnych stylów.

:::note
Te ustawienia zostają w tej przeglądarce. {{ui:Używaj tego stylu we wszystkich aplikacjach}} pod kartami stylów sprawia, że każda aplikacja otwiera się w pasującym stylu (własnym pasku narzędzi, wstążce albo Klasycznym rysunku), ze zmianami wprowadzonymi w każdej aplikacji. CivilCraft nie ma stylu z paskiem menu: gdy dla wszystkich aplikacji wybrano pasek menu innej aplikacji, CivilCraft zachowuje własny pasek narzędzi.
:::

Powiązane: [Klawiatura i mysz](topic:keyboard) · [Ustawienia CivilCraft](topic:settings) · [Przejście z innego oprogramowania projektowego](topic:coming-from)
