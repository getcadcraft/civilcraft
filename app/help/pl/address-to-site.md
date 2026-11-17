---
title: Adres na teren
summary: Zamień adres w to, co teren musi wiedzieć: działkę, budynki wokół niej, strefowanie, glebę i strefę zalewową, z otwartych danych, o które poprosisz przyciskiem albo które dodasz jako pliki, i przekaż je do BimCraft jako sugestie.
keywords: adres, geokodowanie, teren, działka, budynki, strefowanie, gleba, powódź, dane otwarte, openstreetmap, fema, ssurgo, usgs, kontekst, ccsite, bimcraft
from: 125d848a
---

## Co robi

Powierzchnia › Więcej › Adres na teren odpowiada dla punktu: w jakiej działce leży, jakie budynki są w pobliżu, jakie jest strefowanie, gleba i strefa zalewowa. Dane są otwarte: pliki, które dodajesz (GeoJSON, shapefile, KML, GeoPackage), oraz, gdy włączysz dodatki, przyciski, które pytają o jedną otwartą usługę każdy.

## Jak używać

1. Wpisz adres i naciśnij przycisk wyszukiwania adresu (dodatek „Wyszukiwanie adresu”) albo wpisz szerokość i długość geograficzną.
2. Dodaj warstwy: pliki przyciskiem „Dodaj pliki” albo innymi przyciskami źródeł (strefa zalewowa, budynki, gleba, wysokość terenu, działki powiatowe). Usługa jest pytana tylko wtedy, gdy naciśniesz jej przycisk; na starcie nic nie jest pobierane.
3. Naciśnij przycisk uruchomienia, aby otrzymać odpowiedź słowami i plik CSV.
4. „Zapisz teren jako plik” albo „Wyślij do BimCraft jako sugestie” przekazuje kontury do BimCraft lub ModelCraft; tam są one wypisane i dodawane są tylko te, które zaznaczysz.

## Co warto wiedzieć

- Wyszukiwanie adresu idzie przez getcadcraft.com, który za Ciebie pyta Nominatim OpenStreetMap (najwyżej jedno zapytanie na sekundę; odpowiedzi są przechowywane 90 dni, więc ten sam adres nigdy nie jest pytany dwa razy; zapisywany jest tylko skrót adresu, nigdy to, kto pytał). Pozostałe przyciski łączą się z ich usługą bezpośrednio z Twojej przeglądarki.
- Każde źródło ma własną licencję (OpenStreetMap jest na licencji ODbL: zachowaj wiersz z podaniem autorstwa).
- Warstwy są tak dobre, jak otwarte dane w Twojej okolicy. To, co istotne, sprawdź z pomiarem.
