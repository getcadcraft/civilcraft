---
title: Pflaster, Mauern und Stufen
summary: Pflaster mit Gefälle zu einem Ablauf oder mit Quergefälle, einem Muster und seinem Aufbau; Wege, die dem Gelände folgen; Stütz- und freistehende Mauern mit gestuften Fundamenten; Bordsteine; Rampen und Stufen, geprüft gegen ihre Grenzwerte; IFC-Export.
keywords: Befestigte Flächen, Pflaster, Pflastersteine, Terrasse, Gefälle, Ablauf, Quergefälle, Fischgrätverband, Läuferverband, Weg, Gehweg, Stützmauer, Gartenmauer, Fundament, Mauerabdeckung, Bordstein, Randeinfassung, Rampe, Barrierefreiheit, Stufen, Treppe, Setzstufen, Trittstufen, Podest
from: d34b4466
---

Befestigte Flächen werden bei jeder Berechnung neu aus dem Gelände ermittelt; sie folgen daher dem Gelände und werden neu erstellt, wenn sich das Gelände oder seine Linie verschiebt. Ziehen Sie ihre Ecken im Plan wie jede andere Linie. Öffnen Sie sie über {{ui:Befestigte Flächen}} in der Gruppe Landschaft.

## Pflaster

Klicken Sie die Ecken an und drücken Sie {{key:Enter}}. In den Eigenschaften:

- **Höhe**: leer = der mittlere Geländewert darunter.
- **Gefälle**: eben, ein **Quergefälle** (ein % in eine Richtung) oder **zu einem Ablauf**: CivilCraft fragt, wo der Ablauf liegt; klicken Sie ihn an, dann steigt jede Ecke vom Ablauf mit dem Gefälle an. Pfeile im Plan zeigen die Gefälle.
- **Muster** (Raster, Läuferverband, Fischgrätverband) mit der Steingröße, der Fuge und dem Winkel; **Breite der Randeinfassung**. Auf einem Blatt werden Fugen, die enger als ein Millimeter sind, weggelassen.
- Das Pflaster ist Teil des neuen Geländemodells. Seine Schichten (Pflastersteine, Bettung, Tragschicht) gehen in den IFC-Export und die Mengen ein.

## Wege

Klicken Sie entlang des Weges und drücken Sie {{key:Enter}}. Er folgt dem Gelände, mit seinem **Quergefälle** zu seiner rechten Seite. Ein Weg, der steiler ist als die **Größte zulässige Neigung**, wird dort im Plan mit `!` markiert, und die Eigenschaften sagen, wie steil er wird.

Wo ein Weg auf eine Straße trifft, die von einem Korridor gebaut wurde, endet er an der äußeren Kante der Straße, auf der Höhe des Gehwegs oder Banketts dort, im neuen Geländemodell und in der 3D-Ansicht. Ein Weg, der eine Straße kreuzt, wird modelliert und als zwei Teile gezeigt, und ein Ende, das bis zum Doppelten der Wegbreite knapp vor der Straße gezeichnet ist, wird bis zu deren Kante weitergeführt. Der Plan zeigt den Weg weiterhin so, wie Sie ihn gezeichnet haben, und seine Länge und Fläche zählen die ganze Linie. Siehe [Einen Straßenkorridor aufziehen](topic:corridor).

## Mauern

Klicken Sie entlang der Mauer und drücken Sie {{key:Enter}}. Eine Mauer ist **Stützmauer** oder **freistehend**. Ohne **Oberkante** steht sie überall ihre **Höhe** über dem Gelände; geben Sie eine Oberkante ein, um sie waagerecht zu halten. Ihr **Fundament** liegt eine festgelegte Tiefe unter dem Gelände und springt in ganzen Stufen ab, sodass es zwischen den Stufen waagerecht bleibt. Die Eigenschaften geben Länge, Höhen, Ansichtsfläche und Fundamentstufen; der Plan beschriftet an jedem Ende die Oberkante und die Unterkante der Mauer (TW / BW).

:::warning
Eine Stützmauer, die höher als 1.2 m (4 ft) ist, wird markiert: Sie muss von einem Ingenieur bemessen werden.
:::

## Bordsteine

Klicken Sie entlang des Bordsteins und drücken Sie {{key:Enter}}; legen Sie seine Breite und seine Bordhöhe fest.

## Rampen

Klicken Sie vom unteren zum oberen Ende und drücken Sie {{key:Enter}}. Die Höhen kommen aus dem Gelände an jedem Ende, sofern Sie sie nicht eingeben. Eine Rampe erhält alle 750 mm (2.5 ft) Steigung ein Podest und wird gegen die **Größte zulässige Neigung** (zum Start 1:12) und eine Mindestbreite geprüft; die Eigenschaften sagen, wie lang sie sein müsste.

## Stufen

Klicken Sie die Vorderkante der untersten Stufe an, dann dort, wo die Stufen oben ankommen, und drücken Sie {{key:Enter}}. Die Anzahl der Setzstufen ergibt sich aus der Höhe und der **Größten Setzstufe**; der Auftritt aus der Komfortregel 2R + G ≈ 630 mm, nie unter dem **Kleinsten Auftritt**; ein Podest nach höchstens **Setzstufen je Lauf**. Die Eigenschaften sagen, ob sie zwischen den beiden Punkten passen oder wie viel länger sie sein müssten.

:::note
Die Grenzwerte für Rampen und Stufen sind gekennzeichnete Standardwerte. Setzen Sie die, die Ihre Bauordnung verlangt.
:::

## Außerhalb von CivilCraft

- Mehr › {{ui:Landschafts-IFC exportieren}}: Pflaster und Wege als `IfcPavement`, Mauern als `IfcWall` (Stützmauern als RETAININGWALL) mit ihren Schichten, Bordsteine als `IfcKerb`, Rampen als `IfcRamp`, Stufen als `IfcStair` mit ihren Setz- und Trittstufen.
- **An TakeoffCraft senden** in der Pflanzenliste übergibt die Pflasterflächen und Schichtvolumen, die Ansichtsflächen und -längen der Mauern, die Bordsteinlängen und die Anzahl der Stufen.
- Das Detailblatt zeichnet den Schnitt jeder Mauer, den Aufbau jedes Pflasters und jeden Treppenlauf. Siehe [Landschaftsblätter](topic:landscape-sheets).
