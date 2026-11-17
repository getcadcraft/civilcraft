---
title: Ułóż panele i użyj drugiego monitora
summary: Zadokuj panele boczne po lewej, po prawej lub na dole, ułóż je jeden na drugim, grupuj jako karty, przypinaj lub ukrywaj, unoś nad rysunkiem, zagęść układ, wybierz liczbę wierszy paska narzędzi albo przenieś je do osobnego okna na innym ekranie.
keywords: panele, dokuj, unoś, przenieś panel, przeciągnij, układ, karty, grupa kart, ułóż, przypnij, automatyczne ukrywanie, ukryj panel, zamknij panel, zwarty, gęstość układu, gęsty, wiersze paska narzędzi, zawijaj, 1 wiersz, 2 wiersze, wiersze, drugi monitor, dwa ekrany, podwójny monitor, wiele monitorów, okno, wyskakujące okno, resetuj układ
from: 49530239
---

Panele obok rysunku można przesuwać. Ustaw je tam, gdzie są wygodne, albo przenieś je do osobnego okna na drugim monitorze, aby rysunek zajął cały pierwszy.

:::note
Każdy panel ma pasek tytułu: wąski pasek z nazwą panelu, menu {{ui:⋯}}, pinezkę i przycisk zamknięcia u góry panelu. Wersje przed 0.7 mają tylko nazwę i menu {{ui:⋯}}.
:::

## Przesuń panel w oknie

1. Przeciągnij panel za jego nazwę u góry.
2. Podczas przeciągania po lewej, prawej i na dole rysunku pojawiają się obrysowane obszary. Upuść panel na jednym z nich, aby go zadokować. Obszar, nad którym jesteś, ciemnieje.
3. Upuść panel w dowolnym innym miejscu nad rysunkiem, aby się unosił.

Panele mogą dzielić jedną stronę: układają się jeden na drugim, a każda linia między dwoma z nich służy do przeciągania, by podzielić miejsce (gdy linia ma fokus, klawisze strzałek ją przesuwają, a dwukrotne kliknięcie dzieli miejsce równo). Przeciągnij wewnętrzną krawędź zadokowanej strony, aby ją poszerzyć lub zwęzić; dwukrotne kliknięcie krawędzi przywraca ją.

Unoszący się panel pozostaje nad rysunkiem. Przesuwaj go za nazwę, a zmieniaj jego rozmiar, przeciągając prawy dolny róg (albo przejdź klawiszem Tab do rogu i użyj strzałek). Dwukrotne kliknięcie nazwy zadokuje go ponownie w poprzednim miejscu.

:::touch
Przeciągaj jednym palcem za nazwę panelu. Przeciągnij jednym palcem prawy dolny róg unoszącego się panelu, aby zmienić jego rozmiar, a krawędzie między zadokowanymi panelami zmieniaj tak samo. Aby unieść lub zadokować panel bez przeciągania, użyj menu {{ui:⋯}}.
:::

## Grupuj panele jako karty

Dwa panele mogą dzielić jedną ramkę i pokazywać po jednym naraz. Przeciągnij panel za nazwę na pasek tytułu innego panelu (pasek jest obrysowany, gdy nad nim jesteś) i puść: ramka dostaje kartę dla każdego panelu, na swoim pasku tytułu. Kliknij kartę, aby pokazać jej panel. Gdy karta ma fokus, {{key:Left}} i {{key:Right}} przełączają karty, a {{key:Home}} i {{key:End}} przechodzą do pierwszej i ostatniej.

Aby wyjąć panel z grupy, wybierz {{ui:Move out of the tab group}} w jego menu {{ui:⋯}} albo przeciągnij go w inne miejsce. Wybierz {{ui:Karta z}} i nazwę panelu, aby zgrupować je bez przeciągania.

## Przypinaj, ukrywaj i przywracaj

- Pinezka na pasku tytułu panelu włącza **automatyczne ukrywanie**: panel opuszcza swoje miejsce przy krawędzi i staje się małą kartą przy tej krawędzi. Wskaż kartę, ustaw na niej fokus lub kliknij ją, a panel wysunie się nad rysunek; odsuń się (albo naciśnij {{key:Esc}}), a panel wróci. Naciśnij pinezkę ponownie albo wybierz {{ui:Odepnij}}, aby zadokować panel na stałe.
- Przycisk zamknięcia albo {{ui:Hide this panel}} w menu ukrywa panel i zwija jego miejsce przy krawędzi. Przerywana karta przy krawędzi przywraca panel: kliknij ją albo ustaw na niej fokus i naciśnij {{key:Enter}}.

## Zagęść układ

{{ui:Settings}} › {{ui:General}} › {{ui:Layout density}} ma dwa wybory. {{ui:Comfortable}} jest ustawieniem domyślnym. {{ui:Compact}} zmniejsza wysokość wierszy, marginesy paneli, przyciski paska narzędzi i tekst paneli w danej aplikacji, aby na ekranie zmieściło się więcej. Ustawienie jest zapamiętywane dla każdej aplikacji. Ekran dotykowy zachowuje duże przyciski w obu wariantach, a telefon własny układ. {{ui:Reset layout}} nie zmienia gęstości, którą wybrano.

## Wybierz liczbę wierszy paska narzędzi

{{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}} ma trzy wybory. {{ui:Wrap}} jest domyślne: każda grupa narzędzi jest widoczna, w tylu wierszach, ile potrzeba. {{ui:2 rows}} utrzymuje pasek w dwóch wierszach, a {{ui:1 row}} w jednym, dzięki czemu rysunek ma więcej wysokości; grupy, które się nie mieszczą, przewijają się w bok wewnątrz paska (użyj kółka myszy, gestu dwoma palcami albo klawisza Tab, aby przejść do narzędzia). Pasek, który już mieści się w dwóch wierszach, zostaje bez zmian przy {{ui:2 rows}}, bo siatka tylko by go wydłużyła. Wybór jest zapamiętywany dla każdej aplikacji. Ekran dotykowy i telefon zachowują własny układ. CadCraft ma osobne ustawienie swojego paska, w {{ui:Settings}} › {{ui:CadCraft}}.

## Używanie klawiatury

Przycisk {{ui:⋯}} każdego panelu otwiera menu: {{ui:Zadokuj po lewej}}, {{ui:Zadokuj po prawej}}, {{ui:Zadokuj na dole}}, {{ui:Unosi się nad rysunkiem}}, {{ui:Przypnij do krawędzi}}, {{ui:Ukryj ten panel}}, {{ui:Karta z}} innym panelem, {{ui:Przenieś do nowego okna}} i {{ui:Przywróć}}. Przejdź do przycisku klawiszem Tab, naciśnij {{key:Enter}}, przesuwaj strzałkami i naciśnij {{key:Enter}} ponownie. {{key:Esc}} zamyka menu.

## Umieść panele na drugim monitorze

1. Wybierz {{ui:⋯}} przy panelu, a potem {{ui:Przenieś wszystkie panele do nowego okna}}. Możesz też wybrać {{ui:Przenieś panele do nowego okna}} w {{ui:Ustawienia}}.
2. Otworzy się małe okno z panelami. Przeciągnij je na drugi monitor i powiększ, jak chcesz.
3. Pracuj dalej: panele działają na rysunku jak wcześniej, a rysunek wypełnia główne okno.

Skróty działają dalej, gdy okno paneli jest na wierzchu: klawisze naciśnięte tam, poza wpisywaniem w polu, trafiają do rysunku. Pytania i okna dialogowe, które wyświetla aplikacja, nadal otwierają się w głównym oknie, więc gdy któreś się pojawi, sprawdź tam. Motyw i rozmiar tekstu paneli są zgodne z głównym oknem.

:::chromium
Chrome i Edge mogą same ustawić okno na innym ekranie. Gdy drugi ekran jest podłączony, wybierz {{ui:Przenieś na mój drugi ekran}} w oknie paneli (albo {{ui:Przenieś panele na mój drugi ekran}} w menu {{ui:⋯}} panelu). Przeglądarka pyta raz, czy ta strona może widzieć Twoje ekrany; po zgodzie okno paneli otwiera się na tym ekranie za każdym razem.
:::

:::firefox safari
Przeciągnij okno paneli na drugi monitor samodzielnie. Następnym razem otworzy się w tym samym miejscu i w tym samym rozmiarze.
:::

## Więcej niż jedno okno paneli

Każdy panel może mieć własne okno: do czterech okien paneli, na przykład po jednym na monitor.

- W menu {{ui:⋯}} panelu {{ui:Przenieś do nowego okna}} otwiera dla tego panelu kolejne okno, a {{ui:Przenieś do okna paneli 2}} (i tak dalej) przenosi go do już otwartego. Drugie okno nazywa się „panele 2”.
- Przeciągnij panel za nazwę z jednego okna do drugiego: puść go nad głównym oknem, aby go zadokować tam (obrysowane obszary pokazują się, gdy nad nim jesteś) albo aby go unieść, a nad innym oknem paneli, aby go tam przenieść. Puszczony w innym miejscu zostaje, gdzie był.
- Okno paneli, w którym nie ma już paneli, zamyka się samo.

Po przeładowaniu aplikacja ponownie proponuje okna paneli. Przeglądarki otwierają jedno okno na kliknięcie, więc wybierz {{ui:Otwórz następne}} raz dla każdego okna.

## Tak samo dla każdej części układu

Wstążka, przybornik, wiersze narzędzi i pasek stanu opuszczają główne okno do własnego okna tak samo jak panel: otwórz menu {{ui:⋯}} tej części i wybierz {{ui:Przenieś do nowego okna}}; {{ui:Przywróć}} (albo zamknięcie okna) przenosi ją z powrotem. Klawisze naciśnięte w tym oknie trafiają do aplikacji, tak jak z okna paneli. Każda część ma jedno takie menu.

## Przesuń okno dialogowe

Każde okno dialogowe można odsunąć z drogi rysunku: naciśnij i przeciągnij jego pasek tytułu. Okno pamięta, gdzie je zostawiono, każde osobno, i wraca w to miejsce przy następnym otwarciu. Dwukrotne kliknięcie paska tytułu wyśrodkowuje je ponownie.

Z klawiatury naciśnij {{key:Alt}}+{{key:Shift}}+klawisz strzałki, gdy fokus jest w oknie dialogowym, aby przesuwać je po 16 pikseli; dodaj {{key:Ctrl}}, aby przesuwać po 64. Okno, które znalazło się poza ekranem (po zmniejszeniu okna lub ekranu), zostaje przywrócone.

Na telefonie okna dialogowe pozostają na całą szerokość i nie są przesuwane.

W CadCraft Studio okno {{ui:Wydruk do PDF}} CadCraft, które możesz zostawić otwarte podczas pracy, ma w pasku tytułu przycisk {{ui:Otwórz w osobnym oknie}}. Okno przechodzi do własnego okna, które możesz ustawić na innym monitorze. Zamknięcie okna dialogowego zamyka to okno, a zamknięcie tego okna zamyka okno dialogowe.

## Przywróć panele

- Wybierz {{ui:Przywróć panele}} w oknie paneli albo po prostu je zamknij. Panele wracają na swoje miejsce.
- Zamknięcie lub przeładowanie głównego okna zamyka także okno paneli. Gdy aplikacja otworzy się ponownie, powie, że panele były w osobnym oknie; wybierz {{ui:Otwórz}}, aby przywrócić okno, albo {{ui:Zostaw tutaj}}.
- {{ui:Ustawienia}} › {{ui:Ogólne}} › {{ui:Resetuj układ}} przywraca każdy panel na miejsce, w którym był na początku.

:::tip
Jeśli po przeniesieniu paneli do nowego okna nic się nie otworzy, przeglądarka zablokowała wyskakujące okno. Aplikacja to zgłasza i zostawia panele tam, gdzie były. Zezwól na wyskakujące okna dla getcadcraft.com, a potem spróbuj ponownie.
:::

Układ jest zapamiętywany dla każdej aplikacji w tej przeglądarce, razem z innymi ustawieniami.
