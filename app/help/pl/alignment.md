---
title: Wytycz oś trasy w planie
summary: Narysuj oś trasy przez jej PI, ustaw promienie łuków i stację początkową, przesuwaj PI oraz odczytuj dane łuków, kilometraż i odsunięcie.
keywords: trasa, brak rozwiązania, łuk się nie mieści, największy promień, najmniejszy promień, promień minimalny, prędkość projektowa, nakładanie, oś, pi, łuk poziomy, promień, kilometraż, styczna, utwórz trasę, układ trasy, pc, pt, kilometraż odsunięcie
from: 8c5df4aa
---

Trasa w CivilCraft to łańcuch stycznych przez punkty przecięcia (PI), z łukiem kołowym w każdym wewnętrznym PI, który ma promień. Jest kilometrowana od stacji początkowej, którą wybierasz. Projekt może zawierać wiele tras.

## Rysowanie trasy

1. Naciśnij {{key:A}} albo kliknij {{ui:Oś trasy}} w grupie **Projekt**.
   Podpowiedź brzmi: „Oś trasy: wskaż PI po kolei. Enter lub podwójne kliknięcie kończy, Backspace usuwa ostatni, Esc anuluje.”
2. Wskaż pierwszy PI (początek trasy).
3. Wskaż kolejne PI po kolei. Czerwona linia podąża za wskaźnikiem i pokazuje długość oraz azymut rysowanej stycznej, na przykład „212.40 ft  N 63°12'05" E”.
4. Wskaż ostatni PI (koniec trasy).
5. Naciśnij {{key:Enter}}.
   Trasa jest narysowana z kilometrażem i zaznaczona. Pasek stanu mówi na przykład: „Oś trasy 1: 386.36 ft, łuki o promieniu 100 ft tam, gdzie się mieszczą. Zmień promienie we Właściwościach; Profil (R) służy do zaprojektowania niwelety.”

Podczas rysowania: {{key:Backspace}} usuwa ostatni PI, {{key:Esc}} anuluje, a przeciągnięcie po pustym miejscu przesuwa widok, nie dodając PI.

:::warning
Zakończ klawiszem {{key:Enter}}. Podwójne kliknięcie też kończy, ale w tej wersji usuwa PI, w który kliknąłeś dwukrotnie. Wskaż ostatni PI raz, a potem naciśnij {{key:Enter}}.
:::

Każdy wewnętrzny PI dostaje łuk o promieniu 100 ft (30 m w projekcie w metrach) albo największy pełny promień, który mieści się w połowie każdej stycznej, gdy 100 ft się nie mieści. Bardzo ostre PI lub PI prowadzące na wprost nie dostają łuku.

## Ustawianie promieni i współrzędnych

Gdy trasa jest zaznaczona, prawy panel pokazuje **Oś trasy**:

1. **Nazwa** i **Stacja początkowa**. Wpisz stację jako `10+00` (stopy) lub `0+500` (metry), albo jako zwykłą liczbę. Zobacz [Jednostki, stacje i formaty liczb](topic:units-and-stations).
2. **Długość** i **Stacja końcowa** są obliczane za Ciebie.
3. Tabela **PI** pokazuje dla każdego PI **Wschód** i **Północ**, a dla każdego wewnętrznego PI **Promień**. Wpisz nową wartość i naciśnij {{key:Enter}}.
   - Promień 0 daje punkt załamania bez łuku.
   - Pierwszy i ostatni PI nigdy nie mają promienia.
   - Mały x na końcu wiersza usuwa ten PI (trasa zawsze ma co najmniej dwa).
4. Odczytaj listę **Łuki**: dla każdego łuku jego stacje PC i PT, promień R, kąt zwrotu Δ i kierunek (w lewo lub w prawo), długość L, styczną T, odległość zewnętrzną E i cięciwę.
5. Linia pod łukami podaje azymut pierwszej stycznej.

## Gdy łuk się nie mieści

Jeśli łuki potrzebują więcej stycznej, niż jest między ich PI, trasa nie ma rozwiązania: nie jest poprawnie narysowana, dopóki jej nie naprawisz, i jest pomijana przy eksporcie LandXML. Czerwone pole mówi, dlaczego, liczbami, i proponuje, co by się zmieściło:

- „Łuki w PI 2 i PI 3 potrzebują razem 240.00 ft stycznej (130.00 + 110.00), ale PI są oddalone o 180.00 ft.” — albo, gdy tylko jeden z nich ma łuk, „Łuk w PI 2 potrzebuje 240.00 ft stycznej w stronę PI 1 …”.
- Przycisk dla każdego PI ustawia **największy promień, który się tam mieści**, a drugi łuk zostaje bez zmian (musi też mieścić się w drugiej stycznej PI). Gdy oba PI mają łuki, **Oba** zmniejsza oba promienie proporcjonalnie, tak aby się dokładnie stykały.
- Gdy sam jeden łuk jest dłuższy niż styczna, pole mówi, że żaden łuk w drugim PI nie zmieści się, dopóki jest tak duży.
- PI, który zawraca prosto w tył, nie może mieć łuku; pole oferuje **Brak łuku w PI n**.

Każdy przycisk to jeden krok: {{key:Mod+Z}} przywraca promienie. Proponowane promienie są zaokrąglane w dół do 0,01, aby zawsze się mieściły.

### Minimalny promień projektowy

Wpisz **Minimalny promień projektowy** (na przykład z prędkości projektowej), aby każdy łuk był z nim sprawdzany; zostaw pole puste, jeśli go nie chcesz. Łuk mniejszy od niego jest wypisany z przyciskiem **najmniejszy promień spełniający minimum**, gdy ten promień się mieści. Gdy się nie mieści, pole to mówi i podaje największy promień, na jaki pozwalają styczne, abyś wiedział, że trzeba przesunąć PI albo obniżyć minimum.

## Przesuwanie PI w planie

1. Gdy aktywne jest {{ui:Zaznacz}}, kliknij trasę, aby ją zaznaczyć. Kwadratowe uchwyty pojawią się w jej PI.
2. Przeciągnij uchwyt. Trasa, jej kilometraż, profil i korytarz podążają za nim.
3. Puść. Przesunięcie to jeden krok cofnięcia.

Dodawanie PI między dwoma istniejącymi nie jest jeszcze dostępne: usuń trasę i narysuj ją od nowa albo wpisz nowe współrzędne dla PI, które masz.

## Odczyt stacji i odsunięcia

Najedź wskaźnikiem na plan. Pasek stanu pokazuje najbliższą trasę (albo zaznaczoną) z kilometrażem i odsunięciem: **L** lub **R**, patrząc w stronę rosnącej stacji, na przykład „Oś trasy 1: Staj 2+15.30, odsunięcie 18.42 R”. Poza każdym końcem dopisuje się „(za końcem)”.

## Co jest rysowane

Na planie, w DXF i w PDF: oś (styczne jako linie, łuki jako prawdziwe łuki), kreska co 50 ft (20 m) z dłuższą kreską i etykietą stacji co 100 jednostek, oraz kreski PC i PT podpisane ich stacjami.

## Usuwanie trasy

Zaznacz ją i naciśnij {{key:Delete}}, albo kliknij {{ui:Usuń}} na pasku narzędzi lub na dole prawego panelu. Jej profil i korytarz znikają razem z nią. {{key:Mod+Z}} ją przywraca.

:::mac
Na klawiaturze Mac klawisz oznaczony **delete** działa w przeglądarce jak {{key:Backspace}} i nie usuwa zaznaczenia. Naciśnij {{key:Delete}} (Fn i delete) albo użyj przycisku {{ui:Usuń}}.
:::

## Dalej

- [Zaprojektuj profil pionowy](topic:profile).
## Prędkość projektowa i klasa

Pod **Właściwościami** trasy **Prędkość projektowa** (km/h lub mph) i **Klasa projektowa** są zachowywane przy trasie, zapisywane w projekcie i w IFC (Pset_RoadDesignCriteriaCommon). CivilCraft nie ma tabeli łączącej prędkość z promieniem minimalnym, więc nic nie jest na ich podstawie sprawdzane: ustaw **Promień minimalny** według własnej normy projektowej.

## Klotoidy

Łuk może mieć klotoidę na każdym końcu: styczna, klotoida, łuk, klotoida, styczna. W tabeli PI wpisz długość w **Klotoida na wejściu** i **Klotoida na wyjściu** dla PI, który ma promień. PI zostaje tam, gdzie był; łuk przesuwa się do środka, aby zrobić miejsce, więc odległość styczna rośnie o przesunięcie klotoidy. Obie długości mogą się różnić, a PI z jedną długością dostaje klotoidę tylko na tym końcu.

Lista łuków pokazuje wtedy TS, SC, CS i ST (styczna do klotoidy, klotoida do łuku, łuk do klotoidy, klotoida do stycznej) z kątem klotoidy θs, odległościami stycznymi i odległością zewnętrzną. Stacje biegną wzdłuż klotoid tak jak wszędzie. Klotoidy, które razem skręcają bardziej niż łuk, są odrzucane z podaniem nazwanego PI; klotoida dłuższa, niż pozwala styczna, to nakładanie, jak przy każdym łuku. Przechyłka wykorzystuje klotoidę jako odcinek wyrównania (zobacz [Korytarz](topic:corridor)).
