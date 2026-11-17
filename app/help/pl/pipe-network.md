---
title: Ułóż grawitacyjną sieć rurociągów
summary: Rysuj odcinki rurociągów deszczowych lub sanitarnych budowla po budowli, ustaw zasady spadku, przykrycia i uskoku, pozwól CivilCraft ustawić dna i napraw problemy, które wymienia.
keywords: kreator budowli, typ budowli, budowla prostokątna, studzienka, rama, przykrycie, grubość ścianki, element biblioteki, sieć rurociągów, deszczowa, sanitarna, kanalizacja, budowle, studzienki, wpusty, dna, spadek, uskok, obrzeże, osadnik, rurociągi grawitacyjne
from: 10a3c14d
---

Projekt zawiera jedną grawitacyjną sieć rurociągów, deszczową albo sanitarną. Składa się z budowli (studzienek, wpustów) i prostych rurociągów między nimi. Przepływ idzie w kierunku rysowania. CivilCraft sprawdza każdy rurociąg i każdą budowlę według trzech zasad, które ustawia się samodzielnie, i może ustawić wszystkie dna według tych zasad.

## Rysowanie ciągu

Rurociągi można rysować bez powierzchni, ale obrzeża, przykrycie i automatyczne dna jej wymagają.

1. Naciśnij {{key:P}} albo kliknij {{ui:Rurociągi}} w grupie **Projekt**.
   Podpowiedź brzmi: „Rurociągi: klikaj budowle od góry ciągu w dół (kliknij istniejącą, aby ją połączyć). Enter kończy.”
2. Kliknij, gdzie ma być budowla powyżej. Budowla zostaje umieszczona.
3. Klikaj kolejne budowle w dół. Aby połączyć z istniejącą budowlą, kliknij ją: pasek stanu podaje „Połączono S3.”
4. Naciśnij {{key:Enter}}.
   Rurociągi są rysowane, ich dna są ustawiane według zasad, a pasek stanu podaje na przykład: „Narysowano 3 rurociągi, 12 den ustawiono według zasad; wszystkie kontrole zaliczone.”

Nowe budowle nazywają się S1, S2 … i mają średnicę 48 in (1200 mm). Nowe rurociągi nazywają się P1, P2 … i mają średnicę 12 in (300 mm). Średnice są w calach w projekcie w stopach i w milimetrach w projekcie w metrach.

Zakończ klawiszem {{key:Enter}}. Dwukrotne kliknięcie też działa, ale gdy dwukrotnie kliknie się na istniejącą budowlę, aby zakończyć ciąg w tym miejscu, połączenie zostaje odrzucone: kliknij ją raz, a potem naciśnij {{key:Enter}}.

## Ustaw zasady

Gdy nic nie jest zaznaczone, prawy panel (**Projekt**) ma blok **Sieć rurociągów**:

| Ustawienie | Wartość początkowa | Znaczenie |
|---|---|---|
| Typ | Deszczowa | {{ui:Deszczowa}} albo {{ui:Sanitarna}}; zapisywany do LandXML |
| Najmniejszy spadek | 0.50% | Każdy rurociąg musi opadać co najmniej tyle |
| Najmniejsze przykrycie | 2 ft (0.6 m) | Od terenu do wierzchu rury, na całej długości rury |
| Uskok w budowlach | 0.10 ft (0.03 m) | Dno wylotu musi być co najmniej tyle niżej niż każde dno wlotu |

**Te wartości początkowe są przykładowe, a nie normą.** Wpisz wartości wymagane przez zamawiającego lub projekt. Przykrycie mierzy się od terenu do wierzchu (dno plus średnica wewnętrzna); grubość ścianki się nie wlicza. Tam, gdzie place lub korytarze są wyniwelowane, wyniwelowana powierzchnia jest terenem.

## Niech CivilCraft ustawi dna

- {{ui:Ustaw wszystkie dna według zasad}} (w bloku **Sieć rurociągów**) ustawia wszystkie rurociągi.
- {{ui:Ustaw jej dna według zasad}} (przy jednym zaznaczonym rurociągu) ustawia tylko ten rurociąg.

Idąc w dół, każdy ciąg zaczyna się z co najmniej najmniejszym przykryciem przy górnej budowli, opada o co najmniej najmniejszy spadek, ma co najmniej uskok przez każdą budowlę i jest głębszy wszędzie tam, gdzie teren wzdłuż rurociągu dawałby mniejsze przykrycie niż najmniejsze. Dna są zaokrąglane w dół do 0.01, nigdy w górę. Pasek stanu podaje: „Ustawiono dna: najmniejsze przykrycie na początku każdego ciągu, co najmniej najmniejszy spadek, co najmniej uskok w każdej budowli.” albo nazywa to, czego nie udało się zrobić.

## Edycja budowli i rurociągów

Kliknij budowlę albo rurociąg narzędziem {{ui:Zaznacz}}, aby zobaczyć go w prawym panelu.

**Budowla**: **Nazwa**, **Obrzeże**, **Głębokość osadnika**, **Średnica**, potem **Użyte obrzeże**, **Osadnik**, **Wschód** i **Północ**, oraz rurociągi wchodzące i wychodzące wraz z ich dnami.

- Zostaw **Obrzeże** puste, aby pobrać je z powierzchni; pole pokazuje wtedy wartość powierzchni szarym kolorem. Wpisz wartość, aby ustalić obrzeże.
- Przeciągnij uchwyt budowli w rzucie, aby ją przesunąć. Jej rurociągi podążają za nią; ich dna zostają takie, jakie były, więc sprawdź problemy potem.

**Typ**: wybierz jeden z typów budowli sieci (poniżej) albo brak, dla okrągłej budowli o własnej średnicy.

**Rurociąg**: **Nazwa**, budowle, między którymi biegnie, **Średnica**, **Dno górne**, **Dno dolne**, potem **Długość**, **Spadek** i **Najmniejsze przykrycie**.

Naciśnij {{key:Enter}} po każdej wartości.

## Odczyt i naprawa problemów

Blok **Sieć rurociągów** wymienia każdy problem (do 40); kliknij jeden, aby zaznaczyć rurociąg lub budowlę. Zaznaczony rurociąg lub budowla wymienia własne problemy. Gdy nic nie jest zaznaczone, pisze: „Każdy rurociąg i każda budowla spełniają zasady.”

| Komunikat (przykłady) | Co zrobić |
|---|---|
| „P2 biegnie pod górę (-0.40%).” albo „… biegnie płasko …” | Zamień dna miejscami albo ustaw je według zasad. |
| „P2 przy 0.30% jest łagodniejszy niż minimum 0.50%.” | Obniż dno na wylocie albo podnieś dno na wlocie. |
| „P3 ma wzdłuż siebie 1.40 przykrycia przy 35, mniej niż minimum 2.” | Obniż rurociąg; ustaw jego dna według zasad. |
| „W S3 P4 wypływa na 245.20, mniej niż 0.1 poniżej P3 wpływającej na 245.25.” | Obniż górne dno rurociągu wylotowego. |
| „Wierzch P1 jest powyżej obrzeża S1.” | Rurociąg jest zbyt wysoko dla budowli. |
| „S2 ma 2 rurociągi wychodzące; sieć grawitacyjna powinna mieć jedno wyjście z każdej budowli.” | Usuń jeden wychodzący rurociąg albo narysuj go w prawidłowym kierunku. |
| „Rurociągi tworzą pętlę; przepływ musi kończyć się na wylocie.” | Ciąg został narysowany z powrotem w siebie; usuń rurociąg. |
| „S5 leży poza powierzchnią i nie ma rzędnej obrzeża.” | Wpisz obrzeże albo przesuń budowlę na powierzchnię. |
| „P6 częściowo leży poza powierzchnią; przykrycie tam jest nieznane.” | Rozszerz powierzchnię albo przyjmij, że przykrycie tam nie jest sprawdzane. |
| „P7 nie ma jeszcze den.” | Wpisz je albo ustaw według zasad. |

Rurociągi i budowle z problemami są także zaznaczone na czerwono w rzucie.

## Typy budowli

Typ budowli to budowla zbudowana z parametrów: studzienka, wpust, skrzynka łącznikowa albo wylot, **okrągła** (średnica wewnętrzna) lub **prostokątna** (szerokość i długość wewnętrzna), z **grubością ścianki**, **płytą denną**, **osadnikiem** poniżej najniższego rurociągu i **ramą i pokrywą** (okrągły lub prostokątny otwór, wysokość ramy). Typy należą do sieci, pod **Typami budowli** we Właściwościach projektu.

1. Kliknij {{ui:Nowy typ budowli}}. Okno rysuje budowlę w rzucie i w przekroju podczas pisania.
2. Kliknij {{ui:Dodaj typ}}.
3. Zaznacz budowlę i wybierz typ pod **Typ**. Przejmuje rozmiar typu i osadnik; jej własny osadnik nadal może być zmieniony.

Edycja typu sprawia, że każda budowla tego typu przyjmuje jego rozmiary. Usunięcie typu pozostawia jego budowle jako okrągłe o tej samej szerokości. Każda zmiana to jeden krok: {{key:Mod+Z}} ją cofa.

Prostokątna budowla jest rysowana w rzucie, w DXF, DWG i PDF, a w 3D jako prostokąt, którego długość biegnie wzdłuż jej rurociągu wylotowego; rurociągi zaczynają się przy jej ściance. LandXML zapisuje ją jako budowlę prostokątną (`RectStruct`) z jej grubością ścianki i odczytuje takie budowle z powrotem jako typy.

### Udostępnij typ przez bibliotekę

{{ui:Zapisz jako element biblioteki}} zapisuje typ jako element biblioteki CadCraft (plik `.json`): jego symbol w rzucie, bryłę 3D do typowej głębokości i wszystkie rozmiary. Prześlij go do biblioteki, aby go udostępnić. {{ui:Otwórz element biblioteki}} odczytuje budowlę zapisaną w ten sposób z powrotem do sieci, przeliczoną na jednostki projektu. Elementy biblioteki, które nie są budowlami zrobionymi w CivilCraft, są odrzucane wraz z podaniem przyczyny.

## Usuwanie

Zaznacz rurociąg i naciśnij {{key:Delete}}, aby go usunąć. Usunięcie budowli usuwa także podłączone do niej rurociągi. Na Macu naciśnij Fn i Delete albo kliknij {{ui:Usuń}}.

## Jeszcze nie zbudowano

Przepływy, rozmiary rurociągów i linia ciśnień hydraulicznych są w [Odwodnieniu deszczowym](topic:storm-drainage). Katalogi rur, rury nieokrągłe, rury w widoku profilu, rury krzywoliniowe i więcej niż jedna sieć w projekcie nie są jeszcze dostępne. Zobacz [Jeszcze nie zbudowano](topic:not-built-yet).
