---
title: Profile zwierciadła wody w rzece
summary: Zamodeluj rzekę na podstawie powierzchni terenu i oblicz ustalone profile zwierciadła wody metodą standardowego kroku: poziomy wody, energię, prędkości, liczby Froude'a i zasięg powodzi na planie. Funkcja laboratoryjna; każdy wynik wymaga przeglądu przez inżyniera.
keywords: wał przeciwpowodziowy, nieefektywny obszar przepływu, edytor przekrojów, rzeka, hydraulika, profil zwierciadła wody, spiętrzenie, metoda standardowego kroku, przepływ ustalony, 1d, przekroje poprzeczne, manning, szorstkość, przepustowość, głębokość krytyczna, głębokość normalna, froude, linia energii, zasięg powodzi, zalew, zalanie, brzegi koryta, długości odcinków, zwężenie, rozszerzenie, poddźwiękowy, naddźwiękowy, reżim mieszany, skok hydrauliczny
from: fb8bf425
---

CivilCraft oblicza ustalone, jednowymiarowe profile zwierciadła wody wzdłuż rzeki: dla każdego podanego przepływu poziom wody na każdym przekroju poprzecznym, z bilansu energii między sąsiednimi przekrojami (metoda standardowego kroku). Funkcja jest w laboratorium, dopóki jest sprawdzana.

**Wyłącznie pomoc projektowa.** Poziomy wody wymagają przeglądu przez wykwalifikowanego inżyniera, zanim ktokolwiek na nich polegnie: model 1D jest tak dobry, jak jego przekroje, wartości szorstkości, długości odcinków i warunki brzegowe, a nie zna mostów, przepustów ani przepływu opuszczającego rzekę.

## Narysuj rzekę

1. Najpierw zbuduj istniejącą powierzchnię terenu (punkty, linie załamań lub otwarty TIN).
2. W **Powierzchnia** › {{ui:More}} wybierz {{ui:River}}.
3. Klikaj wzdłuż osi rzeki **od góry do dołu rzeki**, a następnie naciśnij {{key:Enter}} lub kliknij dwukrotnie.

CivilCraft wycina przekrój prostopadły do osi co 50 m (200 ft), po 100 m (300 ft) na każdą stronę, z terenu. Kilometraż rzeki liczony jest od dolnego końca, więc rośnie w górę rzeki. Brzegi startują jako przybliżenie 10 m (30 ft) po obu stronach najniższego punktu każdego przekroju.

Aby dodać przekrój tam, gdzie rzeka się zwęża lub znajduje się budowla, zaznacz rzekę, kliknij {{ui:Add a section}} i narysuj linię przekroju w poprzek niej (w obu kierunkach: zostanie obrócona tak, by biegła od lewej do prawej, patrząc w dół rzeki).

## Ustaw rzekę

Zaznacz rzekę, aby zobaczyć ją we **Właściwościach**:

- **Reżim przepływu**: poddźwiękowy (zwykły przypadek: obliczany w górę rzeki od warunku brzegowego na dole rzeki), naddźwiękowy (obliczany w dół rzeki od warunku brzegowego na górze rzeki) lub mieszany (oba, a następnie ten z większą siłą właściwą na każdym przekroju; podgląd).
- **Profile przepływu**: nazwa i przepływ dla każdego (na przykład przepływ 10-letni i 100-letni) oraz warunek brzegowy na dolnym końcu (i na górnym, gdy reżim nie jest poddźwiękowy): **Głębokość normalna** ze spadkiem energii (spadek dna jest pierwszym przybliżeniem), **Znane zwierciadło wody** o rzędnej, lub **Głębokość krytyczna**.
- **Przekroje z terenu**: odstęp, jak daleko w lewo i w prawo, przybliżenie brzegu oraz dwie wartości n Manninga; {{ui:Cut sections again}} zastępuje przekroje (jeden krok cofania).
- **Tabela przekrojów**: dla każdego przekroju przesunięcia lewego i prawego brzegu, n koryta i n terenu zalewowego, długości odcinków do następnego przekroju w dół rzeki (lewy teren zalewowy, koryto, prawy teren zalewowy; mierzone na planie od początku) oraz współczynniki zwężenia i rozszerzenia (na początek 0,1 i 0,3: łagodne przejścia). {{ui:Edit}} otwiera edytor przekrojów (poniżej); kropka za nim oznacza, że przekrój ma wał lub nieefektywny obszar.

Każda zmiana to jeden krok cofania ({{key:Mod+Z}}).

## Edytuj przekrój: brzegi, wały i nieefektywne obszary

{{ui:Edit}} przy przekroju rysuje jego teren i pozwala przeciągać to, co czyta solver: **lewy i prawy brzeg** (dzielą przekrój na lewy teren zalewowy, główne koryto i prawy teren zalewowy), **wał** po każdej stronie oraz **nieefektywne obszary przepływu**. Każdy uchwyt można też przesunąć klawiszami strzałek, a każdą liczbę wpisać obok wykresu. {{ui:Apply}} to jeden krok cofania.

- **Wał** ma położenie (przesunięcie) i rzędną korony. Teren za nim, z dala od rzeki, jest odcięty od rzeki, gdy zwierciadło wody jest poniżej korony: jego pole, obwód zwilżony i przepustowość nie są uwzględniane. Powyżej korony cały przekrój znów się liczy. Wał stoi poza brzegiem, który chroni; wał wewnątrz brzegów jest oznaczony.
- **Nieefektywny obszar przepływu** zatrzymuje wodę, ale nie przenosi przepływu (kieszeń za nasypem, martwa woda obok dojazdu do mostu). Podaj jego dwa przesunięcia i, jeśli chcesz, poziom wody, poniżej którego obszar jest nieefektywny ({{ui:always}}, gdy pole jest puste): powyżej tego poziomu płynie jak reszta. Obszar obejmujący część głównego koryta jest oznaczony.
- Między dwoma przekrojami zasięg powodzi pozostawia suchy teren za wałem, który mają oba przekroje, gdy zwierciadło wody jest tam poniżej korony (linia między dwiema koronami jest prosta).

## Oblicz i odczytaj wyniki

Kliknij {{ui:Water surface profiles}}. Dla wybranego profilu otrzymujesz:

- **wykres** wzdłuż rzeki (przepływ od lewej do prawej): dno koryta, brzegi, zwierciadło wody, linię energii i krytyczne zwierciadło wody; przekroje utrzymywane na głębokości krytycznej są zakreślone kołem;
- **tabelę** dla każdego przekroju: kilometraż rzeki, przepływ, dno koryta, zwierciadło wody, krytyczne zwierciadło wody, linię energii, głębokość, prędkość w korycie i ogólną, liczbę Froude'a koryta, pole przepływu, szerokość u góry, przepływ w każdym terenie zalewowym i w korycie, spadek energii oraz ostrzeżenia;
- **ostrzeżenia** zwykłym językiem, na przykład przekrój ustawiony na głębokości krytycznej, woda powyżej końców przekroju albo duża zmiana przepustowości między dwoma przekrojami (dodaj przekroje pomiędzy).

{{ui:Table (CSV)}}, {{ui:Report}} (zwykły tekst z metodą, warunkami brzegowymi i każdą tabelą) oraz {{ui:Plot (SVG)}} zapisują się w pobranych plikach. Każdy z nich zawiera wiersz z zastrzeżeniem o przeglądzie.

Zaznacz {{ui:Show the flood extent}} we **Właściwościach**, aby zacieniować mokry obszar na planie dla wybranego profilu, z linią brzegową tam, gdzie głębokość wynosi zero. Między przekrojami zwierciadło wody jest poziome w poprzek rzeki i zmienia się liniowo wraz z kilometrażem. Teren za wałem pozostaje suchy, gdy woda jest poniżej jego korony. Inne niskie tereny w korytarzu rzeki, do których woda nie może dotrzeć (na przykład za nasypem drogi), nadal są zacieniowane: sprawdź je.

## Na rysunku i w Problemach

Linie rzeki trafiają na plan, do PDF i DWG na własnych warstwach: **C-WATR-CNTR** (oś), **C-WATR-SCTN** (każda linia przekroju wraz z jego kilometrażem) oraz **C-WATR-FLOD** (linia brzegowa zasięgu powodzi, gdy dla profilu zaznaczono {{ui:Show the flood extent}}). Ostrzeżenia rzeki (przekrój ustawiony na głębokości krytycznej, woda powyżej końców przekroju, zmiana przepustowości wymagająca większej liczby przekrojów, bilans energii, który się nie domknął, wał wewnątrz brzegów) trafiają też do panelu **Problemy**, dotyczą rzeki i są umieszczone przy przekroju, z którego pochodzą.

## Jak to jest obliczane

- Energia między dwoma przekrojami: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Przepustowość metodą podziału: każdy teren zalewowy jest dzielony tam, gdzie zmienia się jego n, K = Σ (1/n)·A·R^(2/3) (1,486/n w jednostkach amerykańskich); koryto jest jednym elementem, ze złożonym n, gdy zmienia się jego n. α wynika z podziału przepustowości.
- Spadek tarcia ze średnią przepustowością, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², przy długości odcinka ważonej przepływem.
- Współczynnik zwężenia, gdy przepływ przyspiesza w dół rzeki, rozszerzenia, gdy zwalnia.
- Głębokość krytyczna = najmniejsza energia właściwa. Każdy poziom wody jest wyznaczany w przedziale, więc nigdy nie przeskakuje na złą stronę głębokości krytycznej; gdy rozwiązania nie ma, ustawiany jest na głębokość krytyczną i oznaczany.

Program jest sprawdzony względem głębokości normalnej Manninga, głębokości krytycznej w korycie prostokątnym oraz przykładu spiętrzenia Chowa (*Open-Channel Hydraulics*, 1959, rozdział 10), całkowanego niezależnie. Ta sama metoda jest stosowana w powszechnych programach rzecznych 1D, więc obliczenie ręczne lub notatki ze studiów są z nimi zgodne.

## Przepusty i mosty

We **Właściwościach** rzeki, w sekcji **Przepusty i mosty**, {{ui:Add a culvert}} lub {{ui:Add a bridge}} umieszcza jedną konstrukcję między dwoma przekrojami (każdy odcinek zachowuje co najmniej dwa przekroje). Profil poniżej niej się nie zmienia; zwierciadło wody tuż powyżej wynika z konstrukcji, a profil biegnie dalej w górę rzeki od tego miejsca. **Wyniki** dodają tabelę każdej konstrukcji: poziom wody za konstrukcją, poziom wody przed nią, które sterowanie jest decydujące, przepływ przez otwór oraz przepływ przez drogę lub pomost. Tylko przepływ poddźwiękowy.

- **Przepust** (skrzynkowy lub okrągły, jeden lub więcej jednakowych przewodów). Sterowanie na wlocie to przepływ przelewowy, dopóki wlot jest wolny, i przepływ przez otwór, gdy jest zalany, z płynnym przejściem między poziomem wody przed przepustem równym jednej a półtorej wysokości przepustu. Sterowanie na wylocie to bilans energii: strata na wlocie, tarcie i wysokość prędkości wylotu, ponad wyższą z wartości: poziomu wody za przepustem i połowy wysokości głębokości krytycznej oraz wierzchu, pomniejszone o spadek wzdłuż przewodu. Poziom wody przed przepustem to większa z tych dwóch wartości. Zaznacz **Woda może przelewać się przez drogę**, a przepływ przelewowy drogi dzieli przepływ z przewodami.
- **Most.** Otwór to przekrój poniżej mostu, przecięty na przyczółkach, a każdy filar jest obszarem nieprzenoszącym przepływu. Zwierciadło wody w otworze wynika z przekroju poniżej (współczynnik rozszerzenia), a przekrój powyżej z otworu (współczynnik zwężenia). Jeśli otwór nie przepuści przepływu przy tym poziomie wody za mostem, płynie na głębokości krytycznej, a most jest oznaczony jako dławiący. Jeśli woda sięga dolnej belki, przepływ jest ciśnieniowy (typ upustowy, dopóki poziom wody za mostem jest poniżej dolnej belki, zatopiony powyżej niej), a woda przelewająca się przez pomost dodaje przepływ przelewowy; poziom wody powyżej to ten, przy którym wszystkie składniki sumują się do przepływu.

Współczynniki (wydatku, straty na wlocie, przelewu) są wpisanymi, zaokrąglonymi wartościami domyślnymi. Zmień je na potrzeby swojego projektu. Nie są to dopasowane wykresy, które drukują podręczniki projektowania przepustów, więc traktuj poziom wody przed przepustem bliskim jego granicy jako szacunek. Woda przelewająca się przez drogę lub pomost, zatopiony wlot, dławiący otwór i szybki przepływ w przewodzie są pokazane w **Problemach**.

## Przepływ nieustalony

{{ui:Unsteady flow…}} we **Właściwościach** rzeki przeprowadza hydrogram powodziowy przez przekroje. Wpisz dopływ jako godziny i przepływy, po jednej parze w wierszu, spadek w dół rzeki (głębokość normalna) i czas trwania obliczeń. Obliczenia startują od ustalonego zwierciadła wody przy pierwszym przepływie i rozwiązują pełne równania jednowymiarowe (niejawny schemat czteropunktowy, z wagą 0,6 w czasie). Otrzymujesz szczytowy poziom wody i przepływ na każdym przekroju wraz z godziną wystąpienia, wykres przepływu na dwóch końcach oraz kontrolę objętości (wpływ, odpływ i zmiana zmagazynowana). Sprawdzane jest, czy przepływ ustalony pozostaje ustalony, czy skok dopływu kończy się na ustalonym profilu nowego przepływu, czy objętość się domyka oraz prędkość fali powodziowej względem fali kinematycznej. Przepływ poddźwiękowy, jeden odcinek, bez dopływu bocznego, bez przepustów i mostów wewnątrz obliczeń.

## Połączenia

Odcinki łączące przepływ w jeden wylot: przepływy się sumują, a zwierciadło wody na początku odcinka poniżej jest przenoszone w górę do końców odcinków, które się z nim łączą (to samo zwierciadło wody w węźle, metoda prosta: bez kąta i bez pędu, więc nadaje się do małych liczb Froude'a). Model i testy istnieją (`river-structures.js`); panel łączenia dwóch rzek na planie nie jest jeszcze zbudowany.

## Jeszcze nie zbudowano

Jazy i zapory jako osobne konstrukcje, panel połączeń, konstrukcje wewnątrz obliczeń nieustalonych oraz nieustalony przepływ naddźwiękowy. Obliczenie w reżimie mieszanym oznacza skok hydrauliczny między dwoma przekrojami, ale go nie umieszcza.

**Gdzie rzeki się łączą.** We **Właściwościach** rzeki pole „Dopływa do” wskazuje rzekę, do której ona wpada. Rzeki łączące się są rozwiązywane razem: rzeka, do której wpadają, niesie sumę ich przepływów, a każda z nich kończy się przy zwierciadle wody pierwszego przekroju tej rzeki (metoda równego zwierciadła wody; pomija kąt i pęd przepływów). Aby połączyć rzekę główną i potok, narysuj krótką rzekę poniżej połączenia i ustaw, by oba w nią wpadały. Wyniki pokazują tabelę połączenia. Wartości domyślne w tych wynikach (zwężenie 0,1, rozszerzenie 0,3, koryto jednoelementowe ze złożoną szorstkością, reżim mieszany według siły właściwej) pozostają do czasu przeglądu przez inżyniera, a Wyniki to mówią.
