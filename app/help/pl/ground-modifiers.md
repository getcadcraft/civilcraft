---
title: Modyfikatory terenu i rzędne na żywo
summary: Wszystko, co kształtuje teren projektowany, na jednej uporządkowanej liście (późniejszy modyfikator wygrywa tam, gdzie się nakładają), wykop i nasyp dla każdego modyfikatora, kontrole połączeń w panelu Problemy oraz rzędne punktowe i strzałki spadku, które odczytują teren na żywo.
keywords: modyfikatory terenu, stos, kolejność, teren projektowany, teren istniejący, nakładanie, wykop i nasyp, połączenie, mur oporowy, krawędź nawierzchni, rzędna dna, spocznik, rzędna punktowa, wysokość punktowa, strzałka spadku, etykieta spadku, spadki
from: 3998a5b0
---

Teren projektowany = teren istniejący + modyfikatory, w kolejności. Teren istniejący nigdy nie jest zmieniany.

## Lista

{{ui:Rzędne}} › {{ui:Modyfikatory terenu…}} wypisuje każdy obiekt kształtujący teren: platformy, wały ziemne, rowy chłonne, obszary niwelacji, nawierzchnie i ścieżki, nasadzenia z gotową rzędną oraz schody i rampy, w których zaznaczono pole **Kształtuje teren** (wraz z ich rzędnymi dołu i góry). Gdy dwa obiekty się nakładają, **późniejszy** wygrywa. Przeciągnij wiersz albo użyj strzałek, aby zmienić kolejność; teren jest natychmiast przebudowywany. Każdy wiersz pokazuje swój wykop i nasyp (to, co kształtuje po obiektach powyżej), a pod listą – sumę.

## Kontrole połączeń

Panel Problemy wypisuje, z przyciskiem **przejdź do**:

- mur, którego wysoka strona leży powyżej jego wierzchu (grunt nad murem), albo którego niska strona odsłania stopę;
- obszar nasadzeń, którego gotowa rzędna leży powyżej krawędzi nawierzchni, z którą się styka, albo więcej niż typowe 150 mm poniżej niej;
- schody, których dół lub góra nie łączy się z nawierzchnią, na której się kończą;
- dwa modyfikatory, które się nakładają (późniejszy wygrywa w tym miejscu).

Mur oporowy może mieć wierzch podążający za wysoką stroną terenu: jego wysokość jest wyliczana na nowo za każdym razem, gdy zmienia się teren.

## Mur oporowy kształtujący teren

Zaznacz mur oporowy i zaznacz **Kształtuje teren**. Pas pod murem (o szerokości równej grubości muru) dołącza do listy jako modyfikator:

- krawędź po **wysokiej stronie** jest utrzymywana na poziomie terenu w każdym punkcie, tak że wierzch muru podąża za wysoką stroną (z nakrywą na górze). Wpisz rzędną **Wierzch**, a wysoka strona zostanie utrzymana na tej rzędnej pomniejszonej o nakrywę;
- krawędź po **niskiej stronie** jest utrzymywana na rzędnej **Rzędna terenu po niskiej stronie**, którą wpiszesz, a jeśli pole pozostanie puste – na poziomie terenu w tym miejscu;
- wysoka strona to ta, po której teren jest wyżej na całej długości muru, więc nigdy nie zmienia się wzdłuż muru;
- teren poza pasem nie jest zmieniany, a teren istniejący nigdy.

Jak każdy modyfikator, pas znajduje się na liście, a modyfikator umieszczony za nim wygrywa tam, gdzie się nakładają. Mur, którego utrzymywana rzędna na końcu odbiega o więcej niż typowe 150 mm od istniejącego terenu, otrzymuje ostrzeżenie w panelu Problemy (z przyciskiem **przejdź do**). Mur wolnostojący nie kształtuje terenu. Pole jest wyłączone w plikach z wcześniejszych wersji, więc otwierają się tak, jak były.

## Rzędne punktowe i strzałki spadku

{{ui:Rzędna punktowa}} (jedno kliknięcie) i {{ui:Strzałka spadku}} (dwa kliknięcia) odczytują teren za każdym razem, gdy są rysowane: przesuń lub zmień rzędną obiektu, a etykiety pójdą za nim. We **Właściwościach** wybierz, czy etykieta odczytuje teren projektowany, czy istniejący; etykiety dla terenu istniejącego są pokazywane w nawiasach. Strzałki wskazują w dół stoku i podają `1:20 (5.0 %)`.
