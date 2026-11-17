---
title: Ustaw układ współrzędnych projektu
summary: Określ, w jakim układzie współrzędnych jest pomiar, aby CivilCraft pokazywał szerokość i długość geograficzną, umieszczał pliki GIS i warstwy map oraz zapisywał pliki .prj. Wybierz według kodu, nazwy, samych współrzędnych lub z pliku .prj.
keywords: układ współrzędnych, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, odwzorowanie, prj, wkt, datum, szerokość geograficzna, długość geograficzna, lat long, geograficzny, siatka, georeferencja, przypisanie układu współrzędnych
from: 964250e2
---

Współrzędne projektu są zwykłymi liczbami, dopóki nie powiesz, co oznaczają. Ustawienie układu współrzędnych **nigdy niczego nie przesuwa**: mówi CivilCraft, że na przykład E 6,150,000 N 2,080,000 to współrzędne state plane strefy 6 Kalifornii w stopach US survey. Gdy już to wie:

- w pasku stanu pokazuje się szerokość i długość geograficzna kursora,
- pliki GIS w innych układach (shapefile, GeoJSON, GeoPackage, siatki wysokości, LiDAR) są przeliczane na projekt podczas ich otwierania,
- warstwy map mogą być rysowane pod planem ([Pokaż warstwy map pod planem](topic:map-layers)),
- eksporty do formatów GIS zawierają układ (plik `.prj` dla shapefile, kod EPSG dla GeoPackage i GeoTIFF).

## Wybierz układ

1. Wybierz {{ui:Coordinates}} w grupie {{ui:GIS}} na pasku narzędzi. Otworzy się okno dialogowe **Układ współrzędnych**. Na górze pisze, w czym projekt jest teraz, albo **Brak — współrzędne są tylko liczbami**.
2. Znajdź układ jednym z tych sposobów:
   - **Wyszukiwanie**: wpisz kod EPSG (`2277`, `EPSG:2277`) lub słowa z nazwy (`texas central`, `utm 14n`, `lambert-93`). Dla kodu lista zaczyna się od tego, co wpisałeś; dla słów wyświetlane są układy, których nazwa zawiera wszystkie wpisane wyrazy.
   - {{ui:Systems these coordinates fit}} (gdy projekt ma punkty lub powierzchnię): CivilCraft odczytuje środek projektu we wszystkich układach z rodziny jednostek projektu i wypisuje te, których obszar użycia go obejmuje. Współrzędne state plane zwykle pasują tylko do kilku stref: projekt w Teksasie o E 3,115,000 N 10,070,000 w stopach US survey pasuje do czterech wariantów Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Każdy wpis pokazuje, gdzie wypadłby środek projektu.
   - **W pobliżu (szer., dł. geogr.)** i {{ui:Suggest}}: wpisz, gdzie leży teren, na przykład `30.27, -97.74` lub `30°16′N 97°44′W`, a CivilCraft wypisze układy płaskie, których obszar go obejmuje, najpierw krajowe i stanowe siatki.
   - {{ui:Read a .prj file…}}: otwórz plik `.prj`, który przyszedł z shapefile lub rysunkiem. CivilCraft dopasowuje go do swojej listy na podstawie rachunku odwzorowania (więc `.prj`, który inaczej nazywa datum, nadal znajdzie właściwy układ) i mówi, który to jest. Gdy nic nie pasuje dokładnie, używany jest opis zawarty w samym pliku. Możesz też przeciągnąć plik `.prj` na okno dialogowe albo otworzyć lub przeciągnąć go na sam plan.
3. Kliknij układ na liście. Pod **Wybrany** pokazuje się nazwa, kod EPSG, jednostka, to, jak dobrze jego datum jest powiązany z WGS 84, obszar użycia w szerokości i długości geograficznej oraz to, gdzie wypada środek projektu.
4. Zostaw zaznaczone **Siatka** (większość projektów; zob. [Współrzędne terenowe i lokalne](topic:ground-and-local-coordinates) dla pozostałych) i wybierz {{ui:Apply}}.

Pasek stanu pokazuje teraz szerokość i długość geograficzną kursora obok E i N. Ustawienie układu to jeden krok cofania: {{key:Mod+Z}} je cofa.

:::note
Jednostki muszą się zgadzać: projekt w stopach przyjmuje układy w stopach US survey lub stopach międzynarodowych, projekt w metrach przyjmuje układy w metrach. CivilCraft wyjaśnia odmowę (na przykład „Projekt jest w stopach, ale ten układ jest w metrach…”). Projekt w stopach z układem w stopach US survey używa stóp survey: „ft” projektu oznacza stopę układu. Układy geograficzne (szerokość i długość, jak sam WGS 84) nie mogą być układem projektu, ponieważ rysunki potrzebują współrzędnych E i N.
:::

## Zmień lub usuń układ

Otwórz ponownie {{ui:Coordinates}}, wybierz inny układ i wybierz {{ui:Apply}}. Gdy projekt ma punkty lub projekt, CivilCraft pyta **Czy współrzędne są już w … ?**

- {{ui:Yes — nothing moves}}: liczby zostają takie same, zmienia się tylko ich znaczenie. Użyj tego, gdy stary układ wybrano omyłkowo.
- {{ui:No — convert them}}: każdy punkt pomiarowy, linia przełamania, granica, PI osi, narożnik placu i budowla są przeliczane ze starego układu na nowy, w jednym kroku cofania. Powierzchnia wczytana z LandXML jako trójkąty nie może być przeliczona; najpierw odbuduj ją z punktów.

{{ui:Remove the system}} usuwa układ (nic się nie przesuwa). Warstwy GIS już w projekcie zostają tam, gdzie są.

## Szerokość i długość geograficzna w pasku stanu

Gdy projekt ma układ, pasek stanu pokazuje szerokość i długość geograficzną kursora w WGS 84, na przykład `30°18′00.00″ N  97°42′00.00″ W`. Aby zamiast tego wybrać stopnie dziesiętne, ustaw w {{ui:Settings}}, {{ui:CivilCraft}}, **Szerokość i długość geograficzna** ([Ustawienia CivilCraft](topic:settings)). Przy współrzędnych terenowych lub lokalnych odczyt przechodzi najpierw przez ten krok, więc jest poprawny dla punktu pod kursorem.

## Jak dobre jest przesunięcie datum

Szerokość, długość, GeoJSON i warstwy map są wszystkie w WGS 84. Powiązanie każdego układu z WGS 84 pokazane jest w oknie dialogowym:

| Co mówi okno dialogowe | Co to znaczy |
|---|---|
| WGS 84 itself | Brak jakiegokolwiek przesunięcia. |
| NAD83 is taken as WGS 84 | Oba różnią się o metr lub dwa w większości Ameryki Północnej, co najwyżej o kilka metrów. Dobre do warstw map i kontekstu terenu; nie do osnowy geodezyjnej. |
| Known to about *n* m (EPSG's figure) | Opublikowane przesunięcie; warstwy map i GeoJSON mogą być oddalone o około tyle. |
| Not known for this datum | Brak opublikowanego przesunięcia bez pliku siatki: warstwy map i GeoJSON mogą być oddalone o setki metrów. |
| From the grid shift file … | Używany jest plik przesunięcia siatki (poniżej): w obrębie siatki w granicach około 10 cm od NAD83. |

Współrzędne samego projektu nigdy nie przechodzą przez przesunięcie datum: tylko to, co jest przeliczane do lub z szerokości i długości geograficznej. Pionowe datum i modele geoidy nie są obsługiwane (rzędne nigdy nie są przeliczane). Tam, gdzie najlepsze przesunięcie wymaga pliku siatki, lista podaje przybliżone opublikowane przesunięcie, a okno pokazuje jego dokładność (na przykład dla układów NAD27 około 20 m), dopóki nie dodasz siatki.

## Pliki przesunięcia siatki

Dla układu NAD27 **Plik przesunięcia siatki** w oknie dialogowym układu współrzędnych sprowadza szerokość i długość geograficzną, pliki GIS i warstwy map do około 10 cm od NAD83 zamiast około 20 m:

- **Pobierz** siatkę, którą sugeruje dla obszaru układu (NADCON5 dla stanów zjednoczonych kontynentalnych, NADCON dla Alaski, NTv2 dla Kanady) z cdn.proj.org, publicznego serwera siatek PROJ. Wysyłana jest tylko nazwa pliku siatki.
- Albo **Dodaj plik siatki…**, jeśli go masz: NTv2 (`.gsb`) lub siatkę PROJ GeoTIFF (`.tif`), do 20 MB.

Siatka jest zapisywana w pliku projektu, więc podróżuje z projektem. Sekcja mówi, czy środek projektu leży w siatce: poza nią nie jest stosowane żadne przesunięcie, dlatego użyj siatki, która obejmuje teren. **Przestań używać siatki** wraca do przybliżonego przesunięcia. Każda zmiana to jeden krok: {{key:Mod+Z}} ją cofa.

Warstwy GIS już w projekcie zostają tam, gdzie były, gdy siatka się zmienia; zaimportuj je ponownie, aby umieścić je przez siatkę. Współrzędne samego projektu nigdy się nie przesuwają.

## Co sprawdzono

- Każde przeliczenie porównano z PROJ (pyproj 3.7.1 z PROJ 9.5.1), biblioteką współrzędnych, z której korzysta większość programów GIS, na ponad 330 układach: state plane w stopach US survey i stopach, UTM północ i południe, Lambert-93, British National Grid, GDA2020 MGA, Transverse Mercator Nowej Zelandii i web Mercator, między innymi. Wschód i północ zgadzają się do 1 cm przy tym samym przesunięciu datum (większość znacznie poniżej 1 mm), a rachunek odwzorowania zgadza się z własnymi definicjami PROJ do 1 cm.
- Pliki `.prj` zapisane przez PROJ w obu popularnych postaciach (ESRI i OGC) odczytano z powrotem dla 105 układów: 208 z 210 pasowało do dokładnego kodu EPSG, a pozostałe dwa do układu o tej samej matematyce na tym samym elipsoidzie. Pliki `.prj` zapisywane przez CivilCraft PROJ odczytuje jako ten sam układ. Pliki `.prj` ESRI dla układów stereograficznych biegunowych (UPS, polarna Alaska) nie mogą być odczytane; wybieraj te układy po kodzie.
- Szerokość i długość geograficzna w pasku stanu zgadzały się z PROJ do 0.01″ w przeglądarce.
