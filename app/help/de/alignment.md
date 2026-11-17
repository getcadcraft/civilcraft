---
title: Horizontale Trasse anlegen
summary: Eine Trasse über ihre PIs zeichnen, Kurvenradien und Anfangsstation festlegen, PIs verschieben und die Bogendaten sowie Station und Versatz ablesen.
keywords: Trasse, keine Lösung, Bogen passt nicht, größter Radius, kleinster Radius, Mindestradius, Entwurfsgeschwindigkeit, Überlappung, Achse, PI, horizontaler Bogen, Radius, Stationierung, Tangente, Trasse anlegen, Trassenlayout, PC, PT, Station Versatz
from: 8c5df4aa
---

Eine Trasse in CivilCraft ist eine Kette von Tangenten durch Schnittpunkte (PIs). An jedem inneren PI mit Radius liegt ein kreisförmiger Bogen. Sie wird ab einer Anfangsstation gemessen, die Sie wählen. Ein Projekt kann viele Trassen enthalten.

## Trasse zeichnen

1. Drücken Sie {{key:A}} oder klicken Sie in der Gruppe **Entwurf** auf {{ui:Trasse}}.
   Der Hinweis lautet: „Trasse: PIs der Reihe nach anklicken. Enter oder Doppelklick beendet, Backspace entfernt den letzten, Esc bricht ab.“
2. Klicken Sie auf den ersten PI (den Anfang der Trasse).
3. Klicken Sie danach jeden weiteren PI der Reihe nach an. Eine rote Linie folgt dem Zeiger und zeigt Länge und Richtung der Tangente, die Sie gerade zeichnen, zum Beispiel „212.40 ft  N 63°12'05" E“.
4. Klicken Sie auf den letzten PI (das Ende der Trasse).
5. Drücken Sie {{key:Enter}}.
   Die Trasse wird mit Stationierung gezeichnet und ist ausgewählt. Die Statusleiste zeigt zum Beispiel: „Trasse 1: 386.36 ft, Bögen mit 100 ft Radius, wo sie passen. Radien unter Eigenschaften bearbeiten; Längsschnitt (R) zum Entwerfen des Gefälles.“

Während des Zeichnens entfernt {{key:Backspace}} den letzten PI, {{key:Esc}} bricht ab, und Ziehen auf leerer Fläche verschiebt die Ansicht, ohne einen PI hinzuzufügen.

:::warning
Beenden Sie mit {{key:Enter}}. Ein Doppelklick beendet ebenfalls, verwirft in dieser Version aber den PI, auf den Sie doppelgeklickt haben. Klicken Sie den letzten PI einmal an und drücken Sie dann {{key:Enter}}.
:::

Jeder innere PI erhält einen Bogen mit 100 ft (in einem Projekt in Metern 30 m) oder den größten ganzzahligen Radius, der in die Hälfte jeder Tangente passt, falls 100 ft nicht passt. Sehr spitze oder gerade durchlaufende PIs erhalten keinen Bogen.

## Radien und Koordinaten festlegen

Bei ausgewählter Trasse zeigt das rechte Bedienfeld **Trasse**:

1. **Name** und **Anfangsstation**. Geben Sie eine Station als `10+00` (Fuß) oder `0+500` (Meter) ein oder als reine Zahl. Siehe [Einheiten, Stationen und Zahlenformate](topic:units-and-stations).
2. **Länge** und **Endstation** werden für Sie berechnet.
3. Die Tabelle **PIs** listet für jeden PI den **Rechtswert** und den **Hochwert** sowie für jeden inneren PI einen **Radius**. Geben Sie einen neuen Wert ein und drücken Sie {{key:Enter}}.
   - Ein Radius von 0 erzeugt einen Knickpunkt ohne Bogen.
   - Der erste und der letzte PI erhalten nie einen Radius.
   - Das kleine x am Ende einer Zeile entfernt diesen PI (eine Trasse behält mindestens zwei).
4. Lesen Sie die Liste **Bögen**: für jeden Bogen die Stationen von PC und PT, den Radius R, die Richtungsänderung Δ und die Richtung (links oder rechts), die Länge L, die Tangente T, den Außenabstand E und die Sehne.
5. Die Zeile unter den Bögen gibt die Richtung der ersten Tangente an.

## Wenn ein Bogen nicht passt

Wenn Bögen mehr Tangente brauchen, als zwischen ihren PIs vorhanden ist, hat die Trasse keine Lösung. Sie wird nicht korrekt gezeichnet, bis Sie das beheben, und sie wird aus LandXML-Exporten ausgelassen. Ein rotes Feld nennt den Grund mit Zahlen und bietet an, was passen würde:

- „Die Bögen an PI 2 und PI 3 brauchen zusammen 240.00 ft Tangente (130.00 + 110.00), die PIs liegen aber 180.00 ft auseinander.“ Oder, wenn nur einer der beiden einen Bogen hat: „Der Bogen an PI 2 braucht 240.00 ft Tangente in Richtung PI 1 …“.
- Eine Schaltfläche je PI setzt dort **den größten passenden Radius**, wobei der andere Bogen unverändert bleibt (der Radius muss außerdem zur anderen Tangente des PI passen). Haben beide PIs Bögen, verkleinert **Beide** die beiden Radien anteilig, sodass sie sich gerade berühren.
- Ist ein einzelner Bogen länger als die Tangente, sagt das Feld, dass an dem anderen PI bei dieser Größe kein Bogen passt.
- Ein PI, der scharf umkehrt, kann keinen Bogen aufnehmen. Das Feld bietet dann **Kein Bogen an PI n** an.

Jede Schaltfläche ist ein Schritt: {{key:Mod+Z}} stellt die Radien wieder her. Angebotene Radien werden auf 0.01 abgerundet, damit sie immer passen.

### Ein Mindestradius für den Entwurf

Geben Sie einen **Mindestradius für den Entwurf** ein (zum Beispiel aus Ihrer Entwurfsgeschwindigkeit), damit jeder Bogen dagegen geprüft wird. Lassen Sie das Feld leer, wenn Sie keinen wollen. Ein Bogen darunter wird mit einer Schaltfläche für **den kleinsten Radius, der den Mindestwert erfüllt** aufgeführt, sofern dieser Radius passt. Passt er nicht, sagt das Feld das und nennt den größten Radius, den die Tangenten zulassen. So wissen Sie, dass Sie einen PI verschieben oder den Mindestwert senken müssen.

## PIs im Plan verschieben

1. Wählen Sie die Trasse mit aktivem {{ui:Wählen}} an. An ihren PIs erscheinen quadratische Griffe.
2. Ziehen Sie einen Griff. Trasse, Stationierung, Längsschnitt und Korridor folgen.
3. Lassen Sie los. Die Verschiebung ist ein Schritt, den Sie rückgängig machen können.

Einen PI zwischen zwei vorhandenen einzufügen ist noch nicht verfügbar. Entfernen Sie dazu die Trasse und zeichnen Sie sie neu, oder geben Sie für die vorhandenen PIs neue Koordinaten ein.

## Station und Versatz ablesen

Bewegen Sie den Zeiger über den Plan. Die Statusleiste zeigt die nächstgelegene Trasse (oder die ausgewählte) mit Station und Versatz, **L** oder **R** in Richtung steigender Station, zum Beispiel „Trasse 1: Sta 2+15.30, Versatz 18.42 R“. Jenseits eines Endes wird „(hinter dem Ende)“ ergänzt.

## Was gezeichnet wird

Im Plan, in DXF und in PDF: die Achse (Tangenten als Linien, Bögen als echte Kreisbögen), ein Strich alle 50 ft (20 m) mit einem längeren Strich und einer Stationsbeschriftung alle 100 Einheiten sowie PC- und PT-Striche mit ihren Stationen.

## Trasse löschen

Wählen Sie sie aus und drücken Sie {{key:Delete}}, oder klicken Sie in der Symbolleiste oder unten im rechten Bedienfeld auf {{ui:Löschen}}. Ihr Längsschnitt und Korridor werden mit entfernt. {{key:Mod+Z}} holt sie zurück.

:::mac
Auf einer Mac-Tastatur ist die Taste mit der Bezeichnung **delete** im Browser {{key:Backspace}}, und sie löscht keine Auswahl. Drücken Sie {{key:Delete}} (Fn und delete) oder verwenden Sie die Schaltfläche {{ui:Löschen}}.
:::

## Weiter

- [Einen vertikalen Längsschnitt entwerfen](topic:profile).

## Entwurfsgeschwindigkeit und Klasse

Unter den Eigenschaften der Trasse werden **Entwurfsgeschwindigkeit** (km/h oder mph) und **Entwurfsklasse** bei der Trasse gespeichert, im Projekt gesichert und in IFC geschrieben (Pset_RoadDesignCriteriaCommon). CivilCraft hat keine Tabelle, die eine Geschwindigkeit mit einem Mindestradius verknüpft. Daraus wird also nichts geprüft: Legen Sie den **Mindestradius** nach Ihrem eigenen Entwurfsstandard fest.

## Übergangsbögen

Ein Bogen kann an jedem Ende eine Klothoide als Übergangsbogen haben: Tangente, Übergang, Bogen, Übergang, Tangente. Geben Sie in der PI-Tabelle für einen PI mit Radius eine Länge bei **Übergang ein** und **Übergang aus** ein. Der PI bleibt, wo er ist. Der Bogen rückt ein, um Platz zu schaffen, sodass die Tangentenlänge um den Versatz des Übergangs wächst. Die beiden Längen dürfen verschieden sein. Ein PI mit nur einer Länge erhält nur an diesem Ende einen Übergang.

Die Bogenliste zeigt dann TS, SC, CS und ST (Tangente–Übergang, Übergang–Bogen, Bogen–Übergang, Übergang–Tangente) mit dem Übergangswinkel θs, den Tangentenlängen und dem Außenabstand. Stationen laufen wie überall entlang der Übergänge. Übergänge, die zusammen stärker drehen als der Bogen, werden mit dem genannten PI abgelehnt. Ein Übergang, der länger ist, als die Tangente zulässt, ist eine Überlappung, wie bei jedem Bogen. Die Überhöhung nutzt den Übergang als Auslaufstrecke (siehe [Korridor](topic:corridor)).
