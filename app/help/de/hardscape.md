---
title: Pflaster, Mauern und Stufen
summary: Pflaster mit Gefälle zu einem Ablauf oder einem Quergefälle, ein Muster und sein Aufbau; Wege, die dem Gelände folgen; Stütz- und freistehende Mauern mit gestuften Fundamenten; Bordsteine; Rampen und Stufen, geprüft gegen ihre Grenzwerte; IFC-Export.
keywords: befestigte Flächen, Pflaster, Pflastersteine, Terrasse, Sitzplatz, Gefälle, Ablauf, Quergefälle, Fischgrät, Läuferverband, Weg, Gehweg, Stützmauer, Gartenmauer, Fundament, Mauerabdeckung, Bordstein, Randstein, Randeinfassung, Rampe, Barrierefreiheit, Stufen, Treppe, Setzstufen, Trittstufen, Podest
from: 51475877
---

Befestigte Flächen werden jedes Mal aus dem Gelände neu berechnet, folgen daher dem Gelände und werden neu erzeugt, wenn sich das Gelände oder seine Linie verschiebt. Ziehen Sie die Ecken im Plan wie jede Linie. Öffnen Sie sie über {{ui:Hardscape}} in der Gruppe Landschaft.

## Pflaster

Klicken Sie die Ecken und drücken Sie {{key:Enter}}. In den Eigenschaften:

- **Höhe**: leer = mittlere Geländehöhe darunter.
- **Gefälle**: Höhe, ein **Quergefälle** (ein % in eine Richtung) oder **zu einem Ablauf**: CivilCraft fragt, wo der Ablauf liegt; klicken Sie ihn an, dann steigt jede Ecke vom Ablauf mit dem Gefälle an. Pfeile im Plan zeigen die Gefälle.
- **Muster** (Raster, Läuferverband, Fischgrät) mit der Steingröße, der Fuge und dem Winkel; **Randeinfassung** mit Breite. Auf einem Blatt werden Fugen, die enger als ein Millimeter sind, weggelassen.
- Das Pflaster ist Teil der geplanten Oberfläche. Seine Schichten (Pflastersteine, Bettung, Unterbau) gehen in den IFC-Export und die Mengen ein.

## Wege

Klicken Sie entlang des Weges und drücken Sie {{key:Enter}}. Er folgt dem Gelände, mit seinem **Quergefälle** zur rechten Seite. Ein Weg, der steiler als die **Größte zulässige Neigung** ist, wird dort im Plan mit `!` markiert, und die Eigenschaften sagen, wie steil er wird.

## Mauern

Klicken Sie entlang der Mauer und drücken Sie {{key:Enter}}. Eine Mauer ist eine **Stützmauer** oder **freistehend**. Ohne **Oberkante** steht sie überall um ihre **Höhe** über dem Gelände; geben Sie eine Oberkante ein, um sie waagerecht zu halten. Ihr **Fundament** liegt eine festgelegte Tiefe unter dem Gelände und wird in ganzen Stufen abgetreppt, sodass es dazwischen waagerecht bleibt. Die Eigenschaften nennen Länge, Höhen, Ansichtsfläche und Fundamentstufen; der Plan beschriftet Oberkante und Unterkante der Mauer (TW / BW) an jedem Ende.

:::warning
Eine Stützmauer, die höher als 1.2 m (4 ft) ist, wird markiert: Ein Ingenieur plant sie.
:::

## Bordsteine

Klicken Sie entlang des Bordsteins und drücken Sie {{key:Enter}}; legen Sie Breite und Aufkantung fest.

## Rampen

Klicken Sie vom Fuß zur Oberkante und drücken Sie {{key:Enter}}. Die Höhen kommen vom Gelände an jedem Ende, sofern Sie sie nicht eingeben. Eine Rampe erhält alle 750 mm (2.5 ft) Höhenunterschied ein Podest und wird gegen die **Größte zulässige Neigung** (anfangs 1:12) und eine Mindestbreite geprüft; die Eigenschaften sagen, wie lang sie sein müsste.

## Stufen

Klicken Sie die Vorderkante der untersten Stufe, dann die Stelle, an der die Stufen oben ankommen, und drücken Sie {{key:Enter}}. Die Anzahl der Setzstufen ergibt sich aus der Höhe und der **Größten Setzstufe**; der Auftritt aus der Komfortregel 2 × Setzstufe + Auftritt ≈ 630 mm, nie unter dem **Kleinsten Auftritt**; ein Podest an jedem Lauf mit höchstens **Setzstufen pro Lauf**. Die Eigenschaften sagen, ob sie zwischen den beiden Punkten passen oder wie viel länger sie sein müssten.

:::note
Die Grenzwerte für Rampen und Stufen sind als Standardwerte gekennzeichnet. Setzen Sie die, die Ihre Bauordnung verlangt.
:::

## Aus CivilCraft exportieren

- Mehr › {{ui:Export landscape IFC}}: Pflaster und Wege als `IfcPavement`, Mauern als `IfcWall` (Stützmauern als RETAININGWALL) mit ihren Schichten, Bordsteine als `IfcKerb`, Rampen als `IfcRamp`, Stufen als `IfcStair` mit ihren Setzstufen und Trittstufen.
- Mit **An TakeoffCraft senden** in der Pflanzenliste gehen die Pflasterflächen und Schichtvolumen, Mauer-Ansichtsflächen und -längen, Bordsteinlängen und Stufenzahlen mit.
- Das Detailblatt zeichnet den Schnitt jeder Mauer, den Aufbau jedes Pflasters und jeden Treppenlauf. Siehe [Landschaftsblätter](topic:landscape-sheets).
