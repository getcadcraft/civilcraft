---
title: Pozwól asystentowi AI pracować z Twoim terenem
summary: Włącz asystentów w Ustawieniach, aby asystent na Twoim komputerze mógł czytać otwarty teren (punkty, powierzchnie, objętości, profile, działki), dodawać punkty pomiarowe, zapisywać i eksportować LandXML lub DWG przez CadCraft Studio. Wyłączone, dopóki go nie włączysz.
keywords: ai, asystent, mcp, skrypt, automatyzacja, studio, punkty, rzędna, kilometraż, odsunięcie, trasa, objętość, wykop, nasyp, profil, działka, landxml, dwg, usd, foldery, uprawnienia, rozłącz, aktywność
from: d0356582
---

## Czego się nauczysz

Jak pozwolić asystentowi AI (każdemu asystentowi, który mówi przez MCP) pracować z otwartym terenem, czego może, a czego nie może, i jak go zatrzymać.

## Co asystent może zrobić w CivilCraft

| Pyta o | Co dostaje | Wymaga |
|---|---|---|
| Teren | Nazwę, jednostki, układ współrzędnych, grupy punktów, trasy, powierzchnie, place, działki i rurociągi | Odczyt |
| Punkty pomiarowe | Numer, wschód, północ, rzędną i opis, według grupy, według opisu albo wewnątrz prostokąta | Odczyt |
| Rzędne powierzchni | Istniejący grunt (albo niwelowaną powierzchnię) w dowolnych wskazanych punktach | Odczyt |
| Kilometraż i odsunięcia | Kilometraż i odsunięcie punktów wzdłuż trasy albo współrzędne i rzędną terenu dla stacji | Odczyt |
| Profil | Rzędne terenu, profilu projektowego i niwelowanej powierzchni wzdłuż trasy, co tyle stóp lub metrów | Odczyt |
| Wykop i nasyp | Objętości między istniejącym gruntem a niwelowaną powierzchnią (także każdego placu i korytarza) albo między gruntem a poziomem | Odczyt |
| Działki | Narożniki, powierzchnię (w akrach lub hektarach), obwód i opis prawny | Odczyt |
| Zaznaczenie | Punkty, które wskaże, zostają zaznaczone w planie, jakbyś je wybrał sam | Edycja |
| Nowe punkty pomiarowe | Punkty dodane z numerami, które podaje, albo z kolejnymi wolnymi. Każde wywołanie to jeden krok, który możesz cofnąć | Edycja |
| Zapis | Własny {{ui:Zapisz}} CivilCraft | Zapis |
| LandXML lub DWG | Te same pliki, co przyciski {{ui:LandXML}} i {{ui:DWG}} | Eksport |
| Teren w 3D | OpenUSD (.usdz, .usda lub .usdc) gruntu, niwelowanej powierzchni, placów i rurociągów, tak jak eksportuje go widok 3D | Eksport |
| Rośliny i zestawienie roślin | Rośliny znalezione na liście roślin po dowolnej nazwie oraz liczby z zestawienia roślin | Odczyt |
| Sadzenie i niwelacja | Rośliny, rabata lub żywopłot posadzone albo dodana platforma, wał, rów odpływowy lub strefa niwelacji, każda jako jeden krok do cofnięcia, z jej wykopem i nasypem | Edycja |
| Kontrola nawadniania | Przepływ każdej strefy, ciśnienie potrzebne przy jej zaworze i przy zasilaniu, najgorsza wysokość podnoszenia, czasy pracy, problemy i zestawienie materiałów, jako pomoc w obliczeniach, którą sprawdza projektant instalacji | Odczyt |

Działa z otwartym terenem. W Studio może też zapisywać i eksportować do folderów, które wybierzesz (poniżej); bez folderu jego pliki są pobierane tak jak z przycisków.

## Włącz

Asystenci łączą się z CivilCraft przez CadCraft Studio na Twoim komputerze; zwykła przeglądarka nie ma do tego dostępu.

1. Otwórz {{ui:Ustawienia}} i wybierz kartę **CivilCraft**.
2. Pod **Asystenci** zaznacz **Pozwól asystentom AI i skryptom korzystać z CivilCraft**.
3. **Odczyt** jest dla Ciebie zaznaczony. Zaznacz **Edycja**, **Zapis** lub **Eksport** tylko wtedy, gdy asystent ich potrzebuje.
4. Aby pozwolić mu zapisywać i eksportować do folderu, wybierz {{ui:Dodaj folder…}} pod **Foldery, z których może korzystać** i wskaż folder w oknie Studio. {{ui:Usuń}} odbiera dostęp od razu; każda inna ścieżka jest odrzucana.
5. Połącz asystenta w Studio (Studio pokazuje adres i ustawienia do wklejenia).

## Gdy asystent jest połączony

Notatka na górze prawego panelu mówi, który asystent jest połączony i co może. Kliknij {{ui:Rozłącz}}, aby od razu zakończyć jego sesję; musi połączyć się ponownie, aby kontynuować.

**Aktywność**, pod **Asystenci** w Ustawieniach, wypisuje każde wywołanie asystenta, od najnowszego, z informacją, czy się udało.

:::tip
Pytaj zwykłymi słowami, na przykład „jaka jest rzędna terenu co 50 stóp wzdłuż ulicy Głównej?”, „ile wykopu i nasypu potrzebują place?” albo „dodaj punkt kontrolny w tych współrzędnych”. Asystent odczyta teren i odpowie albo wprowadzi zmianę jako jeden krok, który możesz cofnąć.
:::

## Bez otwierania CivilCraft

Serwer plików CadCraft dla asystentów (`npx @getcadcraft/mcp`) i wiersz poleceń `cadcraft` otwierają zapisane projekty CivilCraft (`.civilcraft.json`) oraz pliki punktów przy użyciu kodu CivilCraft, bez okna: te same narzędzia odczytu, dodawanie punktów, zapis projektu, LandXML i teren w 3D jako OpenUSD. `cadcraft convert site.civilcraft.json site.xml` zapisuje LandXML z wiersza poleceń. Otwieranie LandXML, eksport DWG i narzędzia obszaru roboczego Landscape nadal wymagają okna CivilCraft.

## Wyłącz

Odznacz **Pozwól asystentom AI i skryptom korzystać z CivilCraft**. Każdy asystent zostaje od razu rozłączony, a ustawienie jest zachowane na następny raz.

## Zobacz też

- [Przepisy dla asystentów AI](common:assistants-recipes): przykłady, każdy z narzędziami, które wywołuje.
- [Wytycz oś trasy w planie](topic:alignment)
- [Zbuduj i popraw powierzchnię](topic:build-surface)
- [Zaznacz, kopiuj i wklej punkty pomiarowe](topic:copy-paste-points)
- [Ustawienia CivilCraft](topic:settings)
