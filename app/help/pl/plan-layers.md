---
title: Warstwy planu
summary: Stałe nazwy warstw, kolory i grubości linii, których CivilCraft używa na ekranie, w DXF i w PDF, oraz ustawienie wyświetlania, które steruje każdą z nich.
keywords: warstwy, nazwy warstw, ncs, kolory, aci, grubości linii, warstwy dxf, pdf, ustawienia wyświetlania, linie rysunku
from: c2aa8475
---

Wszystko na planie należy do warstwy. Nazwy podążają za powszechnym schematem warstw w inżynierii lądowej (dyscyplina, grupa główna, grupa podrzędna). Warstwy są stałe w tej wersji: nie można ich przemianować, zmienić ich kolorów ani dodać własnych. W DXF każda warstwa ma pokazany numer koloru; w PDF przy {{ui:Kolory warstw}} używane są te same kolory, a przy ustawieniu {{ui:Czarny}} wszystko drukuje się na czarno.

| Warstwa | Zawiera | Kolor (numer DXF) | Widoczna, gdy |
|---|---|---|---|
| C-TOPO-MINR | Poziomice pomocnicze | Szary (8) | {{ui:Poziomice}} |
| C-TOPO-MAJR | Poziomice główne | Biały lub czarny (7) | {{ui:Poziomice}} |
| C-TOPO-TEXT | Opisy poziomic | Biały lub czarny (7) | {{ui:Poziomice}} i {{ui:Opisy poziomic}} |
| C-TOPO-TINN | Krawędzie trójkątów | Szary (8) | {{ui:Trójkąty}} |
| C-TOPO-BRKL | Linie przełamań i granica | Pomarańczowy (30) | {{ui:Linie przełamań}} |
| C-TOPO-BNDY | Krawędź powierzchni | Biały lub czarny (7) | {{ui:Krawędź powierzchni}} |
| C-TOPO-SLOP | Strzałki spadków | Cyjan (4) | {{ui:Strzałki spadków}} |
| V-NODE | Punkty pomiarowe | Zielony (3) | {{ui:Punkty}} |
| V-NODE-TEXT | Opisy punktów: numer, rzędna, opis | Zielony (3) | {{ui:Punkty}} i {{ui:Opisy punktów}} |
| V-NODE-LINE | Linie z kodów linii (grupy, które nie są liniami przełamań) | Zielony (3) | {{ui:Punkty}} |
| C-ROAD-CNTR | Osie tras | Czerwony (1) | Zawsze |
| C-ROAD-STAN | Podziałki i opisy kilometrażu, PC i PT | Czerwony (1) | Zawsze |
| C-ROAD-CORR | Krawędzie korytarza | Żółty (2) | Zawsze |
| C-ROAD-SCTN | Linie przekrojów (miejsca wycinania przekrojów) | Szary (8) | Gdy trasa ma linie przekrojów |
| C-GRAD-PADS | Zarysy placów | Niebieski (5) | Zawsze |
| C-GRAD-DAYL | Linie przecięcia skarp (daylight) | Magenta (6) | Zawsze |
| C-GRAD-SLOP | Linie spadków niwelacji | Magenta (6) | Zawsze |
| C-GRAD-FEAT | Linie charakterystyczne (3D) | Zielony (3) | Zawsze |
| C-ROAD-SWPT | Trajektorie pojazdów: zarys, skrajne ślady kół, nazwa | Pomarańczowy (30) | Zawsze |
| C-STRM-PIPE | Rurociągi | Niebieski (5) | {{ui:Rurociągi}} |
| C-STRM-STRC | Budowle | Niebieski (5) | {{ui:Rurociągi}} |
| C-STRM-TEXT | Opisy rurociągów i budowli | Niebieski (5) | {{ui:Rurociągi}} |
| C-STRM-PROB | Rurociągi i budowle z problemami | Czerwony (1) | {{ui:Rurociągi}} |

Linie przełamań są rysowane tylko wtedy, gdy **Powierzchnia** w sekcji **Wyświetlanie** ma ustawienie {{ui:Istniejący teren}}; granica jest rysowana przy każdej powierzchni.

## Grubości linii w PDF

| Grubość | Warstwy |
|---|---|
| 0.50 mm | Osie tras, place, rurociągi, rurociągi z problemami |
| 0.35 mm | Poziomice główne, linie przecięcia skarp, budowle |
| 0.25 mm | Linie przełamań |
| 0.13 mm | Poziomice pomocnicze |
| 0.09 mm | Krawędzie trójkątów, linie spadków niwelacji |
| 0.18 mm | Cała reszta |

Pliki DXF nie zawierają grubości linii; ustaw je według warstw w swoim programie CAD.

## Rozmiary opisów

Opisy mają rozmiar na papierze: opisy poziomic 2.0 mm, opisy kilometrażu 1.8 mm, opisy PC i PT oraz opisy rurociągów i budowli 1.6 mm, opisy punktów 1.5 mm. Opisy rurociągów podają nazwę, średnicę i spadek; opisy budowli podają nazwę i rzędną włazu. Na ekranie zachowują ten sam rozmiar przy powiększaniu. W DXF są skalowane do skali podanej w komunikacie eksportu; zobacz [Eksport planu do DXF](topic:dxf-export).

## Niewidoczne na żadnej warstwie

Pasma rzędnych są rysowane pod liniami tylko na ekranie. Widok profilu nie jest częścią planu.
