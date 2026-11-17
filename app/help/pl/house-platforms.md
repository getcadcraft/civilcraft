---
title: Platformy pod domy na pochyłych działkach
summary: Niwelacja placu na zboczu: mury oporowe jako krawędzie placu, mapa wykopów i nasypów cieniowana według głębokości z rzędnymi punktowymi (plan i 3D), przekrój rysowany w dowolnym miejscu przez teren i projekt oraz rampy lub pochyłe place pod podjazdy.
keywords: platforma, plac, plac pod dom, pochyły teren, zbocze, mur oporowy, wykop i nasyp, mapa wykopów i nasypów, rzędne punktowe, dowolny przekrój, linia przekroju, rysunki dla gminy, podjazd, rampa, pochyły plac, niwelacja, współczynnik spulchnienia, roboty ziemne
from: daa08a3f
---

Platforma pod dom to **plac** (**Projekt** › {{ui:Plac}}): płaski wielokąt na jednej rzędnej, wyrównany do terenu. Cztery rzeczy pomagają na zboczu.

## Mury oporowe jako krawędzie placu

Zaznacz plac i ustaw bok na {{ui:Pionowy (mur oporowy)}} zamiast pochylenia (**Właściwości** › {{ui:Boki i mury oporowe}} albo {{ui:Pionowe: mury oporowe}}, aby ustawić wszystkie boki naraz). Wysokość muru jest odczytywana z terenu wzdłuż niego: góra na terenie, dół na placu, pokazywana na obu końcach i w najwyższym punkcie na planie, z ostrzeżeniem, gdy jest wyższa niż ustawiony limit. Mury i pochylenia mogą występować obok siebie.

## Mapa wykopów i nasypów

Zaznacz {{ui:Mapa wykopów i nasypów}} w sekcji **Pokaż**. Plan jest cieniowany według głębokości wykopu lub nasypu, w równych krokach (wykop ciepły, nasyp niebieski, prawie poziomy – blady), z legendą, a na placu wyświetlane są **rzędne punktowe**: zmiana rzędnej w punktach siatki oraz najgłębszy wykop i najwyższy nasyp oznaczone ▲. Komórki są te same, których używają objętości robót ziemnych, więc mapa i liczby zawsze się zgadzają.

W widoku 3D wybierz **Wykop i nasyp** z listy kolorów, aby nałożyć te same kolory na teren i projekt.

Współczynnik spulchnienia lub zagęszczenia znajduje się w narzędziu diagramu mas (**Projekt** › {{ui:Diagram mas}}); nie jest stosowany do objętości placu.

## Dowolny przekrój

W **Powierzchnia** › {{ui:Więcej}} wybierz {{ui:Dowolny przekrój}}, kliknij punkty linii przekroju w dowolnym miejscu (może być łamana) i naciśnij {{key:Enter}}. Okno dialogowe rysuje przekrój: istniejący teren, niwelowany projekt (przerywany) oraz wykop i nasyp między nimi, cieniowane, z ich polami (projekt liczy się tylko wewnątrz placów i dróg). {{ui:Przewyższenie pionowe}} domyślnie dopasowuje się do rysunku; {{ui:Zapisz jako SVG}} i {{ui:Zapisz jako CSV}} dają rysunek dla gminy i liczby.

## Rampy i pochyłe place

W **Powierzchnia** › {{ui:Więcej}} wybierz {{ui:Rampa lub pochyły plac}}, kliknij dolny koniec, a potem górny, naciśnij {{key:Enter}} i podaj szerokość, rzędną dolnego końca oraz spadek. Plac jest pasem, którego narożniki niosą te rzędne (krawędź między dwoma narożnikami biegnie ze stałym spadkiem), i wyrównuje się do terenu jak każdy plac. Narożniki dowolnego placu mogą też mieć własne rzędne, więc podjazd, rampa lub nachylony taras to plac z rzędną w każdym narożniku.
