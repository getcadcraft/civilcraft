---
title: Zmierz odległości, pola i spadki
summary: Mierz w rzucie, klikając punkty — długość każdego boku i jego kierunek, sumę narastającą, długość wzdłuż terenu, spadek oraz pole i obwód zamkniętego kształtu — a także między dwoma punktami na profilu linii napowietrznej.
keywords: zmierz, pomiar, odległość, długość, pole, obwód, kierunek, spadek, nachylenie, linijka, taśma, wzdłuż terenu, profil, różnica wysokości
from: d614eb25
---

{{ui:Powierzchnia}} › {{ui:Więcej}} › {{ui:Zmierz}} (także w menu {{ui:Więcej}} obszaru roboczego Linie napowietrzne albo po naciśnięciu {{key:M}}) mierzy, nic nie dodając do projektu.

## W rzucie

1. Wybierz {{ui:Zmierz}}, a następnie klikaj punkty. Kliknięcie w pobliżu punktu pomiarowego przyjmuje jego położenie i rzędną.
2. Wiersz stanu podaje liczbę punktów i łączną długość, długość i kierunek ostatniego boku, jego spadek, gdy teren jest znany pod obydwoma końcami, oraz długość wzdłuż terenu. Obok wskaźnika widać rysowany bok i sumę narastającą.
3. Kliknij ponownie pierwszy punkt, aby zamknąć kształt: wiersz stanu dodaje jego **pole** i **obwód**. Następne kliknięcie rozpoczyna nowy pomiar.
4. {{key:Enter}} kończy pomiar i zachowuje jego wyniki w wierszu stanu; {{key:Backspace}} cofa ostatni punkt; {{key:Esc}} czyści pomiar, a kolejne {{key:Esc}} wraca do {{ui:Zaznacz}}.

Długości są w jednostce projektu, a pola w jej jednostce kwadratowej. Spadek i długość wzdłuż terenu korzystają z powierzchni projektowej, gdy istnieje, w przeciwnym razie z istniejącego terenu; poza powierzchnią są pomijane.

## Na profilu linii napowietrznej

Na [profilu linii](topic:overhead-line#the-line-profile) {{ui:Zmierz}} na pasku profilu wymaga dwóch kliknięć i podaje odległość w poprzek, różnicę wysokości, prostą odległość oraz spadek między nimi. Kliknięcie w pobliżu terenu, przewodu albo wierzchu słupa przyciąga do niego. Kliknij ponownie {{ui:Zmierz}}, aby zakończyć.
