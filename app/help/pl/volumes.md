---
title: Objętości robót ziemnych
summary: Odczytaj objętości wykopu, nasypu i netto między gruntem istniejącym a powierzchnią projektową, dla każdego placu i korytarza oraz łącznie, i zrozum metodę siatki, na której się opierają.
keywords: objętości, roboty ziemne, wykop, nasyp, netto, wykop i nasyp, ilości, metoda siatki, porównanie powierzchni, powierzchnia objętości, jardy sześcienne, metry sześcienne
from: 299d7bc7
---

Gdy tylko plac lub korytarz zostanie wyprowadzony bez problemów, CivilCraft porównuje powierzchnię projektową z istniejącym terenem i raportuje wykop i nasyp. Liczby aktualizują się przy każdej zmianie.

## Gdzie je odczytać

- **Roboty ziemne** w prawym panelu, gdy nic nie jest zaznaczone (widok **Projekt**), gdy jest co najmniej jeden plac lub jeden korytarz.
- **Roboty ziemne** w prawym panelu, gdy plac jest zaznaczony (te same sumy dla całego projektu).
- Wiersz pod ustawieniami korytarza, z jego własnym wykopem i nasypem.

Blok **Roboty ziemne** pokazuje:

- **Wykop**, **Nasyp** i **Netto** (z "nasyp" albo "wykop" po nim, zależnie od tego, co jest większe)
- wiersz dla każdej pozycji, gdy jest ich więcej niż jedna, na przykład "Plac 1: wykop 120.4 cu yd, nasyp 310.2 cu yd"
- wiersz metody: "Metoda siatki: istniejący grunt i powierzchnia wyprowadzona próbkowane co 0.5 ft wewnątrz linii wyjścia skarp (92,891 komórek). Nie zastosowano spęcznienia ani skurczu."

Objętości są w jardach sześciennych w projekcie w stopach i w metrach sześciennych w projekcie w metrach.

## Wyślij je do TakeoffCraft

Aby wycenić roboty ziemne, wybierz {{ui:Wyślij do TakeoffCraft}} u dołu bloku **Roboty ziemne**. CivilCraft zapisuje plik ilości (`<site>.quantities.json`) z dwiema ilościami: wykopem i nasypem, w jardach sześciennych (projekt w stopach) albo w metrach sześciennych (projekt w metrach), te same liczby co w bloku, z dokładnością do setnych. Otwórz go w TakeoffCraft za pomocą **Otwórz przedmiar** albo przeciągnij go tam: staną się dwiema pozycjami, które możesz wycenić ([Wykop i nasyp z CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Po zmianie wyślij ponownie i otwórz nowy plik: te same pozycje przyjmą nowe liczby.

Wysyłane są tylko sumy, więc nic nie jest liczone dwa razy; uwaga w pliku wymienia wykop i nasyp każdego placu i korytarza.

## Jak są obliczane

CivilCraft stosuje **metodę siatki**:

1. Siatka kwadratowych komórek jest nakładana na obszar wewnątrz każdej linii wyjścia skarp.
2. W środku każdej komórki pobierane są próbki obu powierzchni.
3. Każda komórka liczona jest jako graniastosłup: różnica rzędnych razy pole komórki. Tam, gdzie powierzchnia projektowa jest niższa, jest to wykop; wyższa, to nasyp.
4. Komórki są sumowane.

Rozmiar komórki jest dobierany za ciebie tak, aby prostokąt wokół wyprowadzonych obszarów mieścił około 250,000 komórek, zaokrąglony do zgrabnej wartości (1, 2 lub 5 razy potęga dziesięciu). Nie możesz go jeszcze ustawić sam. Wiersz metody podaje rozmiar i liczbę komórek. Mniejsze komórki są dokładniejsze wzdłuż krawędzi; przy pełnych komórkach między płaszczyznami płaskimi wynik jest dokładny.

## Warto wiedzieć

- Liczony jest tylko obszar wewnątrz linii wyjścia skarp. Teren poza nimi pozostaje bez zmian.
- Plac lub korytarz z problemem nie jest wliczany i nic nie dodaje. Jeśli blok mówi "Nie ma jeszcze objętości: plac musi być wyprofilowany bez problemów.", poszukaj czerwonej ramki nad nim.
- Gdy pozycje nakładają się, późniejsza zastępuje wcześniejszą wewnątrz swojej linii wyjścia skarp, a nakładanie liczone jest raz.
- Nie stosuje się współczynnika spęcznienia ani skurczu. Jeśli potrzebujesz objętości w stanie rodzimym, luźnym lub zagęszczonym, pomnóż wyniki samodzielnie.
- Zdejmowanie humusu, grubości nawierzchni i podłoża oraz objętości graniastosłupów TIN-do-TIN nie są jeszcze dostępne.

## Sprawdzanie wyniku

- Włącz {{ui:Projektowana (wyprowadzona)}} w **Wyświetlanie** i spójrz na poziomice wewnątrz linii wyjścia skarp.
- Najedź kursorem na wyprowadzony obszar: pasek stanu pokazuje **Teren** i **Wyprowadzona**. Różnica to głębokość wykopu lub nasypu w tym miejscu.
- Dla korytarza odczyt widoku profilu pokazuje wykop lub nasyp na osi w każdym kilometrażu.
