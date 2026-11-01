---
title: Ustawianie paneli i praca na drugim monitorze
summary: Zadokuj panele boczne po lewej, po prawej lub na dole, ułóż je w stos, grupuj jako karty, przypinaj lub ukrywaj, unoś nad rysunkiem, zagęść układ, wybierz liczbę wierszy paska narzędzi albo przenieś panele do ich własnego okna na innym ekranie.
keywords: panele, dokowanie, unoszenie, przesuwanie panelu, przeciągnij, układ, karty, grupa kart, stos, przypnij, automatyczne ukrywanie, ukryj panel, zamknij panel, zwarty, gęstość układu, gęsty, wiersze paska narzędzi, zawijaj, 1 wiersz, 2 wiersze, wiersze paska narzędzi, drugi monitor, dwa ekrany, podwójny monitor, wiele monitorów, okno, wyskakujące okno, resetuj układ
from: 32a8dae2
---

Panele obok rysunku można przesuwać. Ustaw je tam, gdzie Ci wygodnie, albo przenieś je do własnego okna na drugim monitorze, aby rysunek zajął cały pierwszy ekran.

:::note
Każdy panel ma pasek tytułu: wąski pasek z nazwą panelu, menu {{ui:⋯}}, pinezką i przyciskiem zamknięcia u góry panelu. Wersje przed 0.7 mają tylko nazwę i menu {{ui:⋯}}.
:::

## Przesuwanie panelu w oknie

1. Przeciągnij panel za jego nazwę u góry.
2. Podczas przeciągania po lewej, prawej i na dole rysunku pojawiają się obrysowane obszary. Upuść panel na jednym z nich, aby go zadokować. Obszar, nad którym się znajdujesz, ciemnieje.
3. Upuść panel w dowolnym innym miejscu nad rysunkiem, aby się unosił.

Panele mogą dzielić jedną krawędź: układają się w stos, a każda linia między dwoma z nich przeciąga się, aby podzielić przestrzeń (gdy linia jest zaznaczona, klawisze strzałek ją przesuwają, a dwukrotne kliknięcie dzieli przestrzeń po równo). Przeciągnij wewnętrzną krawędź zadokowanej strony, aby ją poszerzyć lub zwęzić; dwukrotne kliknięcie krawędzi przywraca ją do poprzedniego stanu.

Unoszący się panel pozostaje nad rysunkiem. Przesuwasz go za nazwę, a zmieniasz jego rozmiar, przeciągając prawy dolny róg (albo przechodząc do rogu klawiszem Tab i używając klawiszy strzałek). Dwukrotne kliknięcie nazwy zadokowuje go ponownie w miejscu, w którym był.

:::touch
Przeciągnij palcem za nazwę panelu. Aby zmienić rozmiar unoszącego się panelu, przeciągnij palcem prawy dolny róg, a krawędzie między zadokowanymi panelami zmieniaj w ten sam sposób. Aby panel unieść lub zadokować bez przeciągania, użyj menu {{ui:⋯}}.
:::

## Grupowanie paneli jako kart

Dwa panele mogą współdzielić jedną ramkę i pokazywać po jednym naraz. Przeciągnij panel za nazwę na pasek tytułu innego panelu (pasek jest obrysowany, gdy nad nim jesteś) i puść: ramka ma teraz kartę dla każdego panelu, na jej pasku tytułu. Kliknij kartę, aby pokazać dany panel. Gdy karta jest zaznaczona, klawisze {{key:Left}} i {{key:Right}} przełączają karty, a {{key:Home}} i {{key:End}} przechodzą do pierwszej i ostatniej.

Aby wyjąć panel z grupy, wybierz {{ui:Move out of the tab group}} w jego menu {{ui:⋯}} albo przeciągnij go w inne miejsce. Wybierz {{ui:Tab with}} i nazwę panelu, aby zgrupować panele bez przeciągania.

## Przypinanie, ukrywanie i przywracanie

- Pinezka na pasku tytułu panelu włącza **automatyczne ukrywanie**: panel opuszcza swoje miejsce przy krawędzi i zostaje małą kartą przy tej krawędzi. Wskaż kartę, zaznacz ją klawiaturą lub kliknij, a panel wysunie się nad rysunek; odsuń kursor (lub naciśnij {{key:Esc}}), a panel się schowa. Naciśnij pinezkę ponownie lub wybierz {{ui:Unpin}}, aby zadokować panel na stałe.
- Przycisk zamknięcia albo {{ui:Hide this panel}} w menu ukrywa panel i zwija jego dok. Przerywana karta przy krawędzi przywraca panel: kliknij ją albo zaznacz i naciśnij {{key:Enter}}.

## Zagęszczanie układu

{{ui:Settings}} › {{ui:General}} › {{ui:Layout density}} ma dwie opcje. Domyślna jest {{ui:Comfortable}}. {{ui:Compact}} zmniejsza wysokość wierszy, odstępy w panelach, przyciski paska narzędzi i tekst paneli w danej aplikacji, dzięki czemu na ekranie mieści się więcej. Ustawienie jest zapamiętywane osobno dla każdej aplikacji. Ekran dotykowy zachowuje duże przyciski w obu trybach, a telefon zachowuje własny układ. {{ui:Reset layout}} nie zmienia gęstości ustawionej przez Ciebie.

## Wybór liczby wierszy paska narzędzi

{{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}} ma trzy opcje. Domyślna jest {{ui:Wrap}}: każda grupa narzędzi jest widoczna, w tylu wierszach, ile potrzeba. {{ui:2 rows}} ogranicza pasek narzędzi do dwóch wierszy, a {{ui:1 row}} do jednego, dzięki czemu rysunek zyskuje wysokość; grupy, które się nie mieszczą, przewijają się w bok wewnątrz paska narzędzi (użyj kółka myszy, gestu dwoma palcami albo klawisza {{key:Tab}}, aby przejść do narzędzia). Pasek narzędzi, który już mieści się w dwóch wierszach, pozostaje bez zmian przy {{ui:2 rows}}, ponieważ siatka tylko by go wydłużyła. Ustawienie jest zapamiętywane osobno dla każdej aplikacji. Ekran dotykowy i telefon zachowują własny układ. CadCraft ma własne ustawienie paska narzędzi w {{ui:Settings}} › {{ui:CadCraft}}.

## Korzystanie z klawiatury

Przycisk {{ui:⋯}} każdego panelu otwiera menu: {{ui:Dock on the left}}, {{ui:Dock on the right}}, {{ui:Dock at the bottom}}, {{ui:Float over the drawing}}, {{ui:Pin to the edge}}, {{ui:Hide this panel}}, {{ui:Tab with}} inny panel, {{ui:Move to a new window}} i {{ui:Put it back}}. Przejdź klawiszem {{key:Tab}} do przycisku, naciśnij {{key:Enter}}, poruszaj się klawiszami strzałek i naciśnij {{key:Enter}} ponownie. {{key:Esc}} zamyka menu.

## Umieszczanie paneli na drugim monitorze

1. Wybierz {{ui:⋯}} przy panelu, a następnie {{ui:Move all panels to a new window}}. Możesz też wybrać {{ui:Move panels to a new window}} w {{ui:Settings}}.
2. Otworzy się małe okno z panelami. Przeciągnij je na drugi monitor i powiększ do dowolnego rozmiaru.
3. Pracuj dalej: panele działają na rysunku jak wcześniej, a rysunek wypełnia główne okno.

Skróty nadal działają, gdy okno paneli jest na wierzchu: klawisze naciskane w tym oknie, z wyjątkiem wpisywania tekstu w polu, trafiają do rysunku. Pytania i okna dialogowe, które wyświetla aplikacja, nadal otwierają się w głównym oknie, więc gdy się pojawią, szukaj ich tam. Motyw i rozmiar tekstu paneli są zgodne z głównym oknem.

:::chromium
Chrome i Edge mogą same umieścić okno na drugim ekranie. Gdy drugi ekran jest podłączony, wybierz {{ui:Put it on my other screen}} w oknie paneli (albo {{ui:Put the panels on my other screen}} w menu {{ui:⋯}} panelu). Przeglądarka zapyta raz, czy ta strona może widzieć Twoje ekrany; po jej zaakceptowaniu okno paneli otwiera się na tym ekranie za każdym razem.
:::

:::firefox safari
Przeciągnij okno paneli na drugi monitor samodzielnie. Następnym razem otworzy się w tym samym miejscu i w tym samym rozmiarze.
:::

## Więcej niż jedno okno paneli

Każdy panel może mieć własne okno: do czterech okien paneli, na przykład po jednym na monitor.

- W menu {{ui:⋯}} panelu opcja {{ui:Move to a new window}} otwiera kolejne okno dla tego panelu, a {{ui:Move to panels window 2}} (i tak dalej) przenosi go do już otwartego okna. Drugie okno nazywa się „panels 2”.
- Przeciągnij panel za nazwę z jednego okna do drugiego: puść go nad głównym oknem, aby go zadokować (obrysowane obszary są widoczne, gdy nad nim jesteś) lub aby go unieść, albo nad innym oknem paneli, aby go tam przenieść. Puszczony w innym miejscu zostaje, gdzie był.
- Okno paneli, w którym nie ma już paneli, zamyka się samo.

Po przeładowaniu aplikacja ponownie proponuje Twoje okna paneli. Przeglądarki otwierają jedno okno po każdym kliknięciu, więc wybierz {{ui:Open the next one}} po jednym razie dla każdego okna.

## Przesuwanie okna dialogowego

Każde okno dialogowe można przesunąć z drogi rysunkowi: naciśnij i przeciągnij jego pasek tytułu. Okno dialogowe zapamiętuje, gdzie je zostawiono, osobno dla każdego okna, i wraca w to miejsce przy następnym otwarciu. Dwukrotne kliknięcie paska tytułu wyśrodkowuje je ponownie.

Z klawiatury, gdy fokus jest wewnątrz okna dialogowego, naciśnij {{key:Alt}}+{{key:Shift}} i klawisz strzałki, aby przesuwać je po 16 pikseli; dodaj {{key:Ctrl}}, aby przesuwać po 64 piksele. Okno dialogowe, które znalazło się poza ekranem (po zmniejszeniu okna lub ekranu), zostaje przywrócone.

Na telefonie okna dialogowe pozostają pełnoekranowe i nie da się ich przesuwać.

W CadCraft Studio okno {{ui:Plot to PDF}} CadCraft, które możesz zostawić otwarte podczas pracy, ma w pasku tytułu przycisk {{ui:Open in its own window}}. Okno dialogowe przechodzi wtedy do własnego okna, które można przenieść na inny monitor. Zamknięcie okna dialogowego zamyka okno, a zamknięcie okna zamyka okno dialogowe.

## Przywracanie paneli

- Wybierz {{ui:Put the panels back}} w oknie paneli albo po prostu zamknij je. Panele wracają na swoje miejsca.
- Zamknięcie lub przeładowanie głównego okna zamyka też okno paneli. Gdy aplikacja uruchomi się ponownie, informuje, że panele były w osobnym oknie; wybierz {{ui:Open it}}, aby przywrócić okno, albo {{ui:Keep them here}}.
- {{ui:Settings}} › {{ui:General}} › {{ui:Reset layout}} przywraca każdy panel na miejsce, w którym zaczynał.

:::tip
Jeśli po przeniesieniu paneli do nowego okna nic się nie otwiera, przeglądarka zablokowała wyskakujące okno. Aplikacja to zgłasza i zostawia panele tam, gdzie były. Zezwól na wyskakujące okna dla getcadcraft.com, a następnie spróbuj ponownie.
:::

Układ jest zapamiętywany osobno dla każdej aplikacji w tej przeglądarce, razem z pozostałymi ustawieniami.
