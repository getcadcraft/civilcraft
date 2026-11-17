---
title: Obiekty dowolne
summary: Przenieś kształt wykonany w innej aplikacji (STL, OBJ lub element biblioteki) na teren; stoi na gruncie albo zostaje w niego wcięty, a jego objętość, powierzchnia i powierzchnia zabudowy są liczone jak reszta.
keywords: dowolny kształt, obiekt niestandardowy, rzeźba, donica, ława, siatka, stl, obj, element biblioteki, uwzględnia teren, podąża za terenem, wcina się w grunt, zestawienia, objętość, ifc
from: ec835f33
---

Pojedynczy element (donicę, murek-ławę, rzeźbę, kopiec do zabawy) można wykonać w ModelCraft lub PartCraft i umieścić tutaj, aby znalazł się w tym samym modelu i zestawieniach co wszystko inne.

1. Krajobraz › {{ui:Więcej}} › {{ui:Obiekt dowolny…}} i wybierz plik **STL** lub **OBJ** (w jednostkach projektu: stopy w projekcie w stopach, metry w projekcie w metrach) albo **element biblioteki** CadCraft (`.json`) z bryłą siatkową.
2. Kliknij miejsce, w którym ma stanąć.

## Jego podstawa

- **Podąża za terenem**: jego najniższy punkt leży na najniższym gruncie pod jego rzutem, więc nic nie wisi w powietrzu. Właściwości szacują, jaka jego część jest poniżej terenu.
- **Wcina się w teren**: jego podstawa jest ustawiona na określonej rzędnej, a grunt wewnątrz jego rzutu jest niwelowany do niej ze skarpami daylight, liczonymi w **Robotach ziemnych** jak platforma.

Obróć go przyciskiem **Obróć**, a przeciągnij na rzucie, aby go przesunąć.

## Liczone

**Właściwości** podają jego **objętość** (dla zamkniętej bryły), **pole powierzchni**, **powierzchnię zabudowy** i **wysokość**, mierzone z siatki. Eksport IFC zapisuje go z **klasą IFC**, którą wybierasz, i tymi wielkościami.

:::note
Powierzchnia zabudowy to otoczka wypukła zarysu: wklęsły kształt (donica w kształcie litery L) jest niwelowany tak, jakby był wypełniony.
:::
