---
title: Einheiten, Stationen und Zahlenformate
summary: Projekte in US-Fuß oder Metern, wie Stationen, Neigungen, Böschungen, Richtungswinkel, Flächen, Massen und Rohrdurchmesser geschrieben und eingegeben werden und was das Ändern der Einheiten bewirkt.
keywords: Länge eingeben, Rechnen, Taschenrechner, Summe, Bruch, Fuß und Zoll, 4+7/16, Einheiten, Fuß, US-Survey-Fuß, Meter, metrisch, imperial, Stationsformat, Stationierung, Neigung, Prozent, Böschung, h:v, Richtungswinkel, Kubikyard, Durchmesser
from: 0b9b5b6b
---

## Projekteinheiten

Ein Projekt ist in **US-Fuß** oder **Metern** (**Einheiten** im linken Bereich). Jede Koordinate, Höhe, Länge und Station im Projekt ist in dieser Einheit.

:::warning
Das Ändern der **Einheiten** ändert die Beschriftungen, das Stationsformat, die Standardwerte und wie Dateien geschrieben werden. Es rechnet **keine** Zahl um. Ein in Fuß vermessenes Gelände, auf Meter umgestellt, behält dieselben Zahlen, die nun als Meter gelesen werden. Die Statusleiste meldet „Einheiten sind jetzt Meter. Koordinaten wurden nicht umgerechnet.“ Stellen Sie die Einheiten passend zu Ihren Daten ein, bevor Sie planen.
:::

Davon hängt ab:

| | US-Fuß | Meter |
|---|---|---|
| Stationsformat | `12+34.56` (100-ft-Stationen) | `1+234.567` (1000-m-Stationen) |
| Angebotene Höhenlinienabstände | 0.25 bis 20 ft | 0.1 bis 10 m |
| Fläche | sq ft | sq m |
| Volumen | cu yd | cu m |
| Rohr- und Bauwerksdurchmesser | Zoll | Millimeter |
| Standard-Kurvenradius | 100 ft | 30 m |
| Stationsmarkierungen im Plan | alle 50 ft, Beschriftung alle 100 ft | alle 20 m, Beschriftung alle 100 m |
| Plotmaßstäbe | 1" = 5' bis 1" = 1000' | 1:50 bis 1:10000 |
| LandXML-Längeneinheit | USSurveyFoot | meter |

Ein neues Projekt beginnt in Fuß oder, wenn die mit Stern markierte Längeneinheit unter {{ui:Settings}} › {{ui:General}} › {{ui:Units}} eine metrische ist, in Metern. Die Liste **Einheiten** zeigt die dort aktivierten Einheiten und immer die des Projekts selbst. Ist dort eine Flächen- oder Volumeneinheit mit Stern markiert (Acres, Hektar, Acre-Feet …), werden Flächen und Volumen darin statt in der Spalte oben angegeben. Siehe [Einheiten, eingegebene Werte und die Einheitenlisten](common:unit-lists).

Beim Öffnen einer LandXML-Datei übernimmt das Projekt die Einheiten der Datei. Eine Datei in internationalen Fuß wird als Fuß-Projekt geöffnet; die Zahlen werden nicht verändert.

## Längen und Summen eingeben

Jedes Feld für eine Länge oder Höhe liest mehr als eine einfache Zahl: Drücken Sie {{key:Enter}}, und das Feld zeigt das Ergebnis in den Projekteinheiten.

| Sie geben ein | In einem Fuß-Projekt | In einem Meter-Projekt |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | dieselben Längen in Metern |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | in Fuß | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, die übrigen in US-Survey-Fuß | dieselben Längen in Metern |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | die Summe, in Fuß | die Summe, in Metern |

Jede Längenmarke aus der gemeinsamen Einheitentabelle funktioniert mit ihrer genauen Größe: Die Fuß eines Projekts sind US-Survey-Fuß, daher ist `10 US ft` gleich 10, und `3 ch` (die Kette aus internationalen Fuß) ergibt 197.9996. Verwenden Sie `+ - * /` und Klammern sowie `abs`, `round`, `ceil` und `floor`. Ein Bindestrich in einer Länge gehört zu ihr (`24'-6"`, `6-1/2`); mit Leerzeichen davor und danach wird subtrahiert (`24' - 6"` = 23.5 ft). Eine einfache Zahl multipliziert oder dividiert eine Länge und ist eine Länge in den Projekteinheiten, wenn sie zu einer addiert wird. Wenn CivilCraft Ihre Eingabe nicht lesen kann, wird das Feld markiert und die Statusleiste zeigt, wo.

Stationen sind keine Summen: `10+00` in einem Stationsfeld ist Station 10+00. Neigungen in Prozent, Punktnummern und Beschreibungen werden so gelesen, wie sie sind.

## Stationen

Eine Station ist eine Entfernung entlang einer Trasse, geschrieben mit einem Pluszeichen:

- Fuß: Der Teil vor dem Plus sind Hunderte von Fuß. `12+34.56` sind 1,234.56 ft.
- Meter: Der Teil vor dem Plus sind Tausende von Metern. `1+234.567` sind 1,234.567 m.
- Negative Stationen behalten das Vorzeichen vorne: `-0+50.00`.

Überall, wo Sie eine Station eingeben (**Startstation**, **Station** eines PVI), können Sie sie mit Plus (`12+34.56`) oder als einfache Zahl (`1234.56`) schreiben. Leerzeichen werden ignoriert.

## Neigungen und Böschungen

- **Neigungen** (Längsschnitte, Rohrleitungen, Fahrstreifen- und Bankettneigungen) sind in Prozent: `+1.25%` steigt in Stationsrichtung an, `-0.50%` fällt ab.
- **Böschungen** (Bauplatz Abtrag und Auftrag, Korridor Abtrag und Auftrag) sind waagerecht zu senkrecht: `3` bedeutet 3 : 1, drei waagerecht je eins senkrecht, nach oben oder unten.
- **K** für eine Vertikalkurve ist ihre Länge geteilt durch die Änderung der Neigung in Prozent.

## Richtungswinkel und Winkel

Richtungswinkel sind Quadrantenrichtungswinkel in Grad, Minuten und Sekunden: `N 63°12'05" E`. Kurvenablenkungen (Δ) verwenden dieselben Grad, Minuten und Sekunden, mit „links“ oder „rechts“.

## Versätze

Versätze von einer Trasse sind Abstände rechtwinklig dazu, mit **L** (links) oder **R** (rechts), in Stationsrichtung gesehen.

## Zahlenanzeige

- Koordinaten und Höhen zeigen 2 Dezimalstellen in den Bereichen und der Statusleiste (3 für einen ausgewählten Punkt).
- Flächen und Volumen werden in Tausendern gruppiert: `128,250 sq ft`, `454.9 cu yd`.
- Koordinaten werden nie gruppiert, damit sie so kopiert werden können, wie sie sind.

## Koordinaten

CivilCraft arbeitet in einer ebenen Fläche: Rechtswert nach rechts, Hochwert nach oben. Die Planung erfolgt immer in projizierten Koordinaten (State Plane, UTM oder einem lokalen Raster). Sie können CivilCraft sagen, in welchem Koordinatensystem sie vorliegen und ob es Raster-, Gelände- oder lokale Koordinaten sind; dann zeigt es Breiten- und Längengrad und platziert GIS-Dateien und Kartenebenen, ändert aber nie Einheiten und verschiebt Ihre Koordinaten nicht von selbst. Siehe [Koordinatensystem des Projekts festlegen](topic:coordinate-systems) und [Gelände- und lokale Koordinaten](topic:ground-and-local-coordinates). Große State-Plane-Werte (Millionen Fuß) sind in Ordnung; CivilCraft arbeitet intern relativ zum Standort, um die Genauigkeit zu erhalten.
