---
title: Ułóż własny układ i zapisz konfiguracje
summary: Wybierz, który panel pokazuje przeglądarkę projektu, Właściwości lub własną zawartość panelu, gdzie stoi przybornik i co zawierają paski; zapisz to jako własny układ i zachowaj całe konfiguracje pod nazwą, aby między nimi przełączać.
keywords: układ, przestrzeń robocza, ułóż, dostosuj, mój układ, własny układ, panele, edytory, przeglądarka projektu, właściwości, przybornik, szybki pasek, pole informacyjne, środowisko pracy, konfiguracja, profil, zapisz konfigurację, przełącz konfigurację, eksportuj konfigurację, importuj konfigurację, ccenv
from: 6af528e0
---

Oprócz trzech wbudowanych układów możesz ułożyć własny i zapisać całą konfigurację pod nazwą, aby jednym krokiem wrócić do niej.

## Ułóż własny układ

1. Otwórz {{ui:Ustawienia}} (koło zębate albo {{key:Mod+,}}), wybierz {{ui:Globalne}}, a potem {{ui:Układ}}.
2. Wybierz {{ui:Ułóż własny układ…}}. Okno zaczyna od układu, którego używasz teraz.
3. Nadaj mu nazwę, a potem wybierz:
   - **Nad rysunkiem:** pasek narzędzi aplikacji, wstążkę albo nic; pasek tytułu; pole informacyjne i to, które kontrolki zawiera.
   - **Obok rysunku:** przybornik po lewej, po prawej albo wcale, z {{ui:Moje narzędzia}} albo bez; który panel zawiera palety, który jest na wierzchu (na przykład przeglądarka projektu albo Właściwości) i które są kartami pod nim.
   - **Obszar rysunku:** karty widoków, szybki pasek i pasek widoku z kontrolkami, które zaznaczysz, paleta edycji, pasek stanu.
   - **Wygląd:** rozmiar, obrysy przycisków i styl kart.
4. Wybierz {{ui:Użyj tego układu}}. Aplikacja przełącza się od razu, a każda aplikacja, która ma układy, także z niego korzysta.

Oferowane jest tylko to, co ma ta aplikacja. Twój układ jest wymieniony w {{ui:Z dodatków i plików}}; {{ui:Eksportuj ten układ}} zapisuje go jako plik, który możesz przekazać koledze, a przycisk usuwania go usuwa. Panele, które wypełnia, nadal się dokują, unoszą i przenoszą do własnych okien, jak w [Ułóż panele](common:arrange-panels).

## Zapisz konfigurację jako środowisko pracy

Środowisko pracy to cała konfiguracja dla każdej aplikacji w tej przeglądarce: układ, styl menu i skróty, styl paska narzędzi, panele i ich rozmiary oraz {{ui:Moje narzędzia}}. Motyw i język do niego nie należą.

- **Zapisz:** wpisz nazwę pod {{ui:Środowiska pracy}} i wybierz {{ui:Zapisz moją konfigurację}}. Zapis pod istniejącą nazwą zastępuje tamtą konfigurację.
- **Przełącz:** wybierz konfigurację na liście i wybierz {{ui:Przełącz na nią}}. Aplikacja przeładuje się w tej konfiguracji; jeśli masz niezapisane zmiany, aplikacja najpierw zapyta, jak przy każdym przeładowaniu.
- **Udostępnij:** {{ui:Eksportuj}} zapisuje wybraną konfigurację jako plik `.ccenv.json`; {{ui:Importuj konfigurację…}} dodaje ją z pliku. Plik ustawia tylko te wybory, nic więcej.
- **Usuń:** wybierz konfigurację i wybierz {{ui:Usuń}}.

Możesz zachować do dwunastu konfiguracji.

Aby zmienić układ bez otwierania okna (przeciągnąć blok, kliknąć prawym przyciskiem narzędzie), zobacz [Zmiana układu na ekranie](common:layout-edit). Aby najpierw wypróbować wbudowane ustawienia, zobacz [układ przybornika i pola informacyjnego](common:layout-toolbox), [układ wstążki i przeglądarki projektu](common:layout-ribbon) oraz [układ rysunkowy](common:layout-drafting).
