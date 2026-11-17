---
title: Zaznaczanie punktów pomiarowych lasso
summary: Przytrzymaj Shift i przeciągnij odręczny zarys wokół punktów pomiarowych, by je zaznaczyć jako okno, przecięcie lub płot; przełącz klawiszem Space podczas przeciągania. Proste przeciągnięcie nadal rysuje prostokąt.
keywords: lasso, odręczny, zaznaczanie punktów, zaznaczanie, okno, przecięcie, płot, space, wielokąt, zaznaczanie prostokątem, przeciąganie z Shift
from: 3dd4fcaa
---

## Czego się nauczysz

Jak zaznaczać punkty pomiarowe, rysując wokół nich, gdy prostokąt zabrałby punkty, których nie chcesz.

## Narysuj lasso

1. Kliknij {{ui:Zaznacz}} (albo naciśnij {{key:V}}).
2. Przytrzymaj {{key:Shift}}, naciśnij na planie i przeciągnij **wokół** punktów, które chcesz, poruszając się najpierw w **prawo**.
3. Puść.

Punkty wewnątrz zarysu są dodawane do zaznaczenia. Przeciągnięcie, które pozostaje blisko linii prostej, rysuje prostokąt, jak dotychczas; gdy tylko odchyli się od tej linii (o więcej niż około 12 pikseli), staje się lasso.

## Okno, przecięcie i płot

| Przeciągasz | Lasso | Zaznacza |
|---|---|---|
| Najpierw w prawo | Okno (ciągły zarys) | Punkty wewnątrz niego |
| Najpierw w lewo | Przecięcie (przerywane, zielone) | Punkty wewnątrz niego oraz punkty, których zarys dotyka |
| Naciśnij {{key:Space}} podczas przeciągania | Okno, potem przecięcie, potem płot | Płot (przerywana pomarańczowa ścieżka, niezamknięta): punkty, nad którymi przechodzi ścieżka |

Wiersz stanu podaje nazwę lasso podczas przeciągania. {{key:Esc}} podczas przeciągania anuluje je i nic nie zaznacza.

:::tip
Płot to szybki sposób na wybranie punktów wzdłuż krawężnika albo linii rowu: przeciągnij wzdłuż nich i puść.
:::

## Zobacz też

- [Zaznaczanie, kopiowanie i wklejanie punktów pomiarowych](topic:copy-paste-points)
- [Klawisze i mysz](topic:keyboard)
