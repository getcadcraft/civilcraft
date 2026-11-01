---
title: Ułóż własny układ i zapisz swoje konfiguracje
summary: Wybierz, który panel pokazuje przeglądarkę projektu, Właściwości lub własną zawartość panelu, gdzie jest przybornik i co zawierają paski, zapisz to jako własny układ i trzymaj całe konfiguracje pod nazwą, aby między nimi przełączać.
keywords: układ, obszar roboczy, rozmieszczenie, dostosowanie, mój układ, własny układ, panele, edytory, przeglądarka projektu, właściwości, przybornik, szybki pasek, pole informacyjne, środowisko pracy, konfiguracja, profil, zapisz konfigurację, przełącz konfigurację, eksportuj konfigurację, importuj konfigurację, ccenv
from: 2a71af43
---

Oprócz trzech wbudowanych układów możesz ułożyć własny i zapisać całą konfigurację pod nazwą, aby wrócić do niej jednym krokiem.

## Ułóż własny układ

1. Otwórz {{ui:Ustawienia}} (koło zębate albo {{key:Mod+,}}), wybierz {{ui:Globalne}}, potem {{ui:Układ}}.
2. Wybierz {{ui:Ułóż własny układ…}}. Okno dialogowe zaczyna od układu, którego teraz używasz.
3. Nadaj mu nazwę, potem wybierz:
   - **Nad rysunkiem:** pasek narzędzi aplikacji, wstążkę albo nic; pasek tytułu; pole informacyjne i to, jakie elementy sterujące zawiera.
   - **Obok rysunku:** przybornik po lewej, po prawej albo wcale, z {{ui:Moje narzędzia}} lub bez; który panel zawiera palety, który jest na wierzchu (na przykład przeglądarka projektu lub Właściwości) i które są kartami pod nim.
   - **Obszar rysunku:** karty widoków, szybki pasek i pasek widoku z zaznaczonymi elementami sterującymi, paleta edycji, pasek stanu.
   - **Wygląd:** rozmiar, obrysy przycisków i styl kart.
4. Wybierz {{ui:Użyj tego układu}}. Aplikacja przełącza się na niego od razu, a używa go też każda aplikacja, która ma układy.

Oferowane jest tylko to, co ma ta aplikacja. Twój układ jest na liście pod {{ui:Z dodatków i plików}}; {{ui:Eksportuj ten układ}} zapisuje go jako plik, który możesz przekazać koledze, a przycisk usuwania go kasuje. Panele, które wypełnia, nadal się dokują, unoszą i przenoszą do własnych okien, jak w [Rozmieszczanie paneli](common:arrange-panels).

## Zapisz konfigurację jako środowisko pracy

Środowisko pracy to cała Twoja konfiguracja dla każdej aplikacji w tej przeglądarce: układ, styl menu i Twoje klawisze, styl paska narzędzi, panele i ich rozmiary oraz {{ui:Moje narzędzia}}. Motyw i język nie wchodzą w jej skład.

- **Zapisz:** wpisz nazwę pod {{ui:Środowiska pracy}} i wybierz {{ui:Zapisz moją konfigurację}}. Zapis pod istniejącą nazwą zastępuje tę konfigurację.
- **Przełącz:** wybierz konfigurację z listy i wybierz {{ui:Przełącz na nią}}. Aplikacja wczytuje się ponownie w tej konfiguracji; jeśli masz niezapisaną pracę, aplikacja najpierw zapyta, jak przy każdym ponownym wczytaniu.
- **Udostępnij:** {{ui:Eksportuj}} zapisuje wybraną konfigurację jako plik `.ccenv.json`; {{ui:Importuj konfigurację…}} dodaje konfigurację z pliku. Plik ustawia wyłącznie te wybory i nic więcej.
- **Usuń:** wybierz konfigurację i wybierz {{ui:Usuń}}.

Możesz mieć do dwunastu konfiguracji.

Aby najpierw wypróbować wbudowane układy, zobacz [układ z przybornikiem i polem informacyjnym](common:layout-toolbox) oraz [układ ze wstążką i przeglądarką projektu](common:layout-ribbon).
