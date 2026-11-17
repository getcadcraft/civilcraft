---
title: Rysuj z przyciąganiem, wybranymi narożnikami oraz przesuwaj, kopiuj i obracaj
summary: Umieszczaj osie, place, działki i linie charakterystyczne dokładnie w punktach i narożnikach, które już masz; wpisz lub wskaż współrzędne E i N narożnika; obróć styczną ku dwóm punktom; przesuń, skopiuj lub obróć obiekt o odległość lub kąt.
keywords: przyciąganie, osnap, przyciągnij do punktu, przyciągnij do narożnika, pi, wierzchołek, narożnik, wskaż, krzyżyk, wschód, północ, współrzędne, wpisane współrzędne, styczna, kierunek, azymut, przesuń, kopiuj, obróć, przekształć, kopiuj obrócony, duplikuj, alt, swobodny punkt, rysowanie
from: 49864dda
---

Nowość w wersji 0.9: podczas rysowania kursor trafia w punkty i narożniki, które są już na planie, a narożnik placu, działki lub linii charakterystycznej można wpisać lub wskazać. Ten temat przechodzi przez trzy narzędzia.

## Co zrobisz

- Rysuj z przyciąganiem, tak aby nowa oś, plac, działka lub linia zaczynały się i kończyły dokładnie na czymś istniejącym.
- Ustaw współrzędne E i N narożnika, wpisując je albo wskazując miejsce na planie.
- Obróć styczną osi ku dwóm wskazanym punktom.
- Przesuń, skopiuj lub obróć cały obiekt.

## Kroki

1. Wybierz narzędzie rysowania, na przykład {{ui:Alignment}}, {{ui:Pad}}, {{ui:Parcel}} lub {{ui:Feature line}}. Przesuń kursor blisko punktu pomiarowego, PI osi, narożnika placu, działki lub obrysu, wierzchołka linii charakterystycznej albo budowli burzowej. Pojawi się znacznik z etykietą (PI, Narożnik, Wierzchołek, Budowla albo Punkt i jego numer) oraz współrzędne E i N, w które trafi. Kliknij, aby umieścić punkt właśnie tam.
2. Aby umieścić punkt swobodnie, przytrzymaj {{key:Alt}} podczas kliknięcia. Przyciąganie się wyłącza.
3. Zaznacz plac, działkę lub linię charakterystyczną. We **Właściwościach** blok {{ui:Corners}} wymienia każdy narożnik z polem Wschód i polem Północ. Wpisz nowe liczby albo naciśnij przycisk krzyżyka obok narożnika i kliknij miejsce na planie. Narożnik przyjmuje tę współrzędną E i N. Naciśnij {{key:Esc}}, aby anulować wskazywanie. Krzyżyk działa tylko na planie: najpierw zamknij widok 3D.
4. Aby obrócić styczną, zaznacz oś. We **Właściwościach**, pod {{ui:Tangent from two points}}, wybierz styczną, naciśnij {{ui:First point}} i kliknij na planie, naciśnij {{ui:Second point}} i kliknij ponownie, a potem naciśnij {{ui:Set direction}}. Styczna obraca się tak, by biegła od pierwszego punktu ku drugiemu, i zachowuje swoją długość.
5. Aby przesunąć, skopiować lub obrócić, zaznacz oś, plac, działkę lub linię charakterystyczną. We **Właściwościach**, pod {{ui:Move, copy and rotate}}, wpisz {{ui:Move east}} i {{ui:Move north}} (liczby ujemne idą na zachód i południe) i naciśnij {{ui:Move}} lub {{ui:Copy}}. Albo naciśnij {{ui:Distance from two points}} i kliknij punkt, z którego przesuwasz, oraz punkt, do którego przesuwasz.
6. Aby obrócić, wpisz kąt w {{ui:Rotate counter-clockwise}} (w stopniach), potem naciśnij {{ui:Rotate}} lub {{ui:Copy rotated}}. Obiekt obraca się wokół środka swoich narożników, chyba że wskażesz krzyżykiem obok kąta punkt, wokół którego ma się obracać.

## Uwagi

- Kopia zostawia oryginał na miejscu i jest potem zaznaczona.
- Każde przesunięcie, kopiowanie, obrót, wskazany narożnik i obrócona styczna to jeden krok cofania.
- Przyciąganie sięga 10 pikseli ekranu od kursora. Znacznik przyciągania tylko proponuje miejsce; nic się nie zmienia, dopóki nie klikniesz.
- Ten sam krzyżyk jest w wierszach PI osi. Zob. [Osie tras](topic:alignment), [Działki](topic:parcels) i [Linie charakterystyczne](topic:feature-lines).
