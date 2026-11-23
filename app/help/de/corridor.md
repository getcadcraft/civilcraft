---
title: Einen Straßenkorridor aufziehen
summary: Einen Korridor für eine Trasse einschalten, Werte für Fahrstreifen, Bankett und Böschungen setzen und die Querprofile, Böschungslinien und Erdmassen lesen, die er erzeugt.
keywords: Kreuzung, Einmündung, Straße trifft Straße, Nebenstraße, T-Kreuzung, Querung, Planumshöhe, verbinden, anschließen, Überhöhung, Verwindung, Verwindungslänge, Raten-Tabelle, Querneigung, Drehung, Korridor, Regelquerschnitt, Teilquerschnitt, Regelprofil, Straße, Fahrstreifen, Bankett, Böschungsneigung, Böschungslinie, Einschnitt, Auftrag, Querprofile, Ziel, Ziele, Breitenvorgabe, Höhenvorgabe, Versatzvorgabe, Verbreiterung, Fahrbahnrand, einem anderen Korridor folgen
from: 6dcb92b3
---

Ein Korridor zieht einen einfachen Regelquerschnitt (eine Baugruppe) entlang einer Trasse und ihres Entwurfslängsschnitts, modelliert ihn in das Gelände ein und fügt das Ergebnis dem neuen Geländemodell hinzu. Eine Trasse kann mehrere Korridore auf unterschiedlichen Stationsbereichen tragen, und ein Korridor kann aus wiederverwendbaren Vorlagen nach Station erstellt werden ([Korridorvorlagen](topic:corridor-templates)). Der einfache Regelquerschnitt unten ist auf beiden Seiten gleich; um jeder Seite eigene Teile zu geben, siehe [Jede Seite aus Teilen aufbauen](topic:corridor#build-each-side-from-parts).

## Der Regelquerschnitt

Von der Achse nach außen, auf jeder Seite:

1. ein **Fahrstreifen** mit gegebener Breite, der von der Fahrbahnmitte mit der **Fahrstreifenneigung** abfällt
2. ein **Bankett** mit gegebener Breite bei der **Banketneigung**
3. eine **Böschung** von der Bankettkante bis zum Gelände: die **Einschnittsböschung**, wo das Gelände darüber liegt, die **Auftragsböschung**, wo es darunter liegt

Die Startwerte sind Platzhalter, keine Entwurfsnorm:

| Wert | US-Fuß | Meter |
|---|---|---|
| Fahrstreifenbreite | 12 ft | 3.6 m |
| Fahrstreifenneigung | 2% | 2% |
| Banketbreite | 4 ft | 1.2 m |
| Banketneigung | 4% | 4% |
| Einschnittsböschung | 2 : 1 | 2 : 1 |
| Auftragsböschung | 3 : 1 | 3 : 1 |
| Querprofil alle | 10 ft | 5 m |

Böschungsneigungen werden horizontal zu vertikal (H:V) angegeben: 3 : 1 heißt 3 horizontal für 1 vertikal.

## Korridor erstellen

Sie brauchen eine Trasse ohne Fehler und einen Entwurfslängsschnitt mit mindestens zwei PVIs ohne Fehler.

1. Wählen Sie die Trasse.
2. Setzen Sie im rechten Bereich unter **Korridor** den Haken bei **Regelquerschnitt entlang des Entwurfslängsschnitts ziehen**.
   Die Felder erscheinen und der Korridor wird sofort erstellt. Der Plan zeigt die Kanten von Fahrstreifen und Bankett sowie die Böschungslinien; mit {{ui:Geplant (modelliert)}} unter **Anzeige** zeigen die Höhenlinien das neue Gelände.
3. Ändern Sie einen beliebigen Wert: **Fahrstreifenbreite**, **Fahrstreifenneigung**, **Banketbreite**, **Banketneigung**, **Einschnittsböschung**, **Auftragsböschung**, **Querprofil alle**. Drücken Sie nach jedem Wert {{key:Enter}}. Einschnitt, Auftrag und Querprofilabstand müssen größer als 0 sein.
4. Lesen Sie die Zeile unter den Feldern, zum Beispiel „39 Querprofile von 0+00.00 bis 3+86.36; Einschnitt 240.2 cu yd, Auftrag 556.0 cu yd.“

Querprofile werden bei jedem Schritt von **Querprofil alle**, an den Enden sowie am Anfang und am Ende jedes horizontalen und vertikalen Bogens geschnitten. Jedes Querprofil und die Linien durch es (Achse, Kanten von Fahrstreifen und Bankett, Böschungslinie) werden zu Bruchkanten des neuen Geländemodells.

Zum Ausschalten des Korridors entfernen Sie den Haken. Seine Werte bleiben für das nächste Mal erhalten.

## Wenn er nicht erstellt wird

Ein rotes Feld unter den Feldern sagt, warum:

| Meldung | Was zu tun ist |
|---|---|
| „Der Korridor braucht einen Entwurfslängsschnitt ohne Fehler.“ | PVIs hinzufügen oder überlappende vertikale Ausrundungen beheben (siehe [Einen Entwurfslängsschnitt gestalten](topic:profile)). |
| „Der Entwurfslängsschnitt überlappt die Trasse nicht.“ | Die PVIs in den Stationsbereich der Trasse verschieben. |
| „Der Korridor braucht mindestens zwei Querprofile auf dem Geländemodell.“ | Der größte Teil des Korridors liegt außerhalb des bestehenden Geländes. |
| „4 Böschungen laufen vom Geländemodell ab, bevor sie das Gelände erreichen.“ | Nahe am Rand des Geländemodells kann die Böschung das Gelände nicht erreichen. Halten Sie die Straße vom Rand fern oder senken Sie dort die Auftrags- oder Einschnittshöhe. |
| „Die Böschungslinien des Korridors kreuzen sich (Querprofile überlappen, zum Beispiel auf der Innenseite einer engen Kurve). Verwenden Sie einen größeren Radius oder einen schmaleren Regelquerschnitt.“ | Querprofile auf der Innenseite einer scharfen Kurve überlappen sich. Vergrößern Sie den Radius oder verschmälern Sie den Regelquerschnitt. |

Ein Korridor mit einem Problem wird nicht eingemodelliert und zählt nicht zu den Erdmassen.

## Korridore und Bauplätze zusammen

Das neue Geländemodell entsteht in dieser Reihenfolge: zuerst jeder Korridor, dann jeder Bauplatz. Wo die Modellierung eines Bauplatzes einen Korridor überlappt, gewinnt der Bauplatz. Wo ein späteres Element eine Straße überlappt, wird nur der Teil der Straße innerhalb der Böschungslinie des späteren Elements ersetzt; der Rest der Straße und jede Geländebruchkante, die die Straße kreuzt, behält seine Form. Volumen werden innerhalb aller Böschungslinien zusammen berechnet; siehe [Erdmassen](topic:volumes).

## Überhöhung

In einer Kurve kann die Straße zur Innenseite geneigt werden, damit der Verkehr weniger nach außen gedrückt wird. Setzen Sie unter **Überhöhung** in den **Eigenschaften** der Trasse den Haken bei **Kurven überhöhen**:

- Jeder Kreisbogen erhält eine Rate **e** aus der Raten-Tabelle: die erste Zeile, deren Radius der Bogen erreicht (eine Zeile mit leerer Rate behält die normale Dachneigung). Die Tabelle und die **Maximale relative Steigung** (zum Start 0.5 %) sind Platzhalter, keine Norm; setzen Sie sie nach Ihren eigenen Entwurfskriterien. Fügen Sie Zeilen hinzu oder entfernen Sie sie nach Bedarf.
- Die Fahrstreifen drehen sich um die Achse. Vor dem Bogen wird der äußere Fahrstreifen über den **Auslauf** (normale Dachneigung ÷ e × Verwindungslänge) eingeebnet, dann über die **Verwindungslänge** (Fahrstreifenbreite × e ÷ Steigung) dreht sich der äußere Fahrstreifen weiter, bis die ganze Straße mit e zur Innenseite geneigt ist; zwei Drittel der Verwindungslänge liegen vor dem Bogen und ein Drittel auf dem Bogen. Nach dem Bogen geschieht dasselbe in umgekehrter Reihenfolge.
- Ein Bankett auf der tiefen Seite ist nie flacher als sein Fahrstreifen; auf der hohen Seite behält es seine eigene Neigung (es kippt mit).
- Die Tabelle darunter listet Radius, Rate, Verwindungslänge und Auslauf jedes Bogens sowie die Stellen, an denen die volle Überhöhung beginnt und endet. Das **Überhöhungsdiagramm** zeigt die Querneigungen beider Fahrstreifen über die Stationen (der linke Fahrstreifen durchgezogen, der rechte gestrichelt).
- Ein Bogen, der für die volle Überhöhung zu kurz ist, oder zwei Bögen, deren Übergänge sich überlappen, wird in einem Kasten über der Tabelle gemeldet.

Querprofile, Volumen, die 3D-Ansicht und die Blätter zeigen die geneigte Straße. Jede Änderung ist ein Schritt: {{key:Mod+Z}} macht sie rückgängig.

## Ziele

Ein Ziel bewegt einen Punkt einer Seite der Straße auf eine Linie: die **Fahrbahnkante** oder die **Bankettkante**, auf der **Links**- oder **Rechts**seite. Jedes Querprofil trifft die Linie rechtwinklig zur Achse und geht nur auf dieser Seite hinaus, sodass ein Ziel rechts nie die linke Seite verschiebt.

| Setzt | Was an einem Querprofil passiert, wo es die Linie trifft |
|---|---|
| **Breite** | Der Punkt liegt auf der Linie: der Fahrstreifen (oder das Bankett) wird auf sie verbreitert oder verschmälert und behält seine Querneigung. |
| **Höhe** | Der Punkt übernimmt dort die Höhe der Linie an seinem eigenen Versatz; die Querneigung des Fahrstreifens (oder Banketts) folgt. |

Die Linie kann eine Feature-Linie (mit beliebiger **Verwendung**) oder eine Linie eines anderen Korridors sein: dessen Achse, Fahrbahnkanten, Bankettkanten oder Böschungslinien. Die Linie eines Korridors folgt diesem Korridor: Ändern Sie die andere Straße, folgt diese. CivilCraft erstellt den anderen Korridor zuerst; zwei Korridore, die sich in einer Schleife gegenseitig als Ziel hätten, werden auf einer Seite abgelehnt, und die Tabelle sagt, welche.

1. Wählen Sie die Trasse und schalten Sie ihren Korridor ein.
2. Klicken Sie unter **Ziele** auf {{ui:Ziel hinzufügen}}.
3. Wählen Sie die **Seite**, den **Punkt**, was er **setzt** und **zur Linie**. Jede Änderung ist ein Schritt für Rückgängig.

**Ergebnis** nennt, an wie vielen Querprofilen die Linie erreicht wurde. Querprofile, die sie nicht erreichen (hinter ihren Enden oder wo sie hinter der Achse liegt), behalten die Werte des Regelquerschnitts. Eine gelöschte Linie lässt den Korridor so, wie er vor dem Ziel war, und die Tabelle sagt es. Eine Seite kann je Punkt eine Breitenvorgabe und eine Höhenvorgabe haben.

## Jede Seite aus Teilen aufbauen

Setzen Sie in den Einstellungen des Korridors den Haken bei **Jede Seite aus Teilen aufbauen**. Jede Seite hat dann ihre eigene Liste, von der Achse nach außen: Fahrstreifen, ein Bankett, eine Rinne, einen Bordstein, einen Grünstreifen, einen Gehweg und zuletzt die Böschung zum Gelände (mit eigenen Einschnitts- und Auftragsverhältnissen). Beginnen Sie mit {{ui:Landstraße}} oder {{ui:Innerortsstraße}}, fügen Sie Teile hinzu und entfernen Sie sie, verschieben Sie sie mit den Pfeilen und {{ui:Kopieren}} eine Seite auf die andere. Jede Änderung ist ein Schritt für Rückgängig.

Eine Querneigung ist das Gefälle von der Straße weg, daher ist ein Gehweg, der zur Straße entwässert, negativ. Ein Bordstein ist eine Fläche mit der von Ihnen angegebenen Höhe, einer Oberkante mit der angegebenen Breite und einem optionalen Absatz an der Rückseite. Die Überhöhung dreht jeden Fahrstreifen in der ersten Zeile; Rinne, Bordstein, Streifen und Gehweg hängen an der Kante der gebauten Fahrstreifen. Ziele verschieben weiterhin das Ende der Fahrstreifen und das letzte Teil. Querprofile markieren die Rinnensohle, die Oberkante und die Rückseite des Bordsteins und das Übrige. Auf einer Kurve mit Übergangsbögen ist die Verwindung der Übergangsbogen selbst: Kronenneigung eben am TS, volle Überhöhung am SC.

## Fahrbahnschichten

Ein Fahrstreifen, ein Bankett, eine Rinne, ein Grünstreifen oder ein Gehweg kann seinen Aufbau tragen: Unter dem Teil fügt {{ui:Schicht hinzufügen}} eine Schicht mit Name, Material, Dicke und Art (Deckschicht, Binderschicht, Tragschicht, Frostschutzschicht, Unterbau oder Sonstige) hinzu, von oben nach unten. Die Schichten verändern die Oberfläche der Straße nicht (ihre Oberkante ist die Entwurfsfläche); jede liegt unter ihrem Teil, und ihre Tiefe wird senkrecht nach unten gemessen. Querprofile zeichnen die Unterseite jeder Schicht als gestrichelte Linie, und {{ui:Fahrbahnschichten: Mengen}} listet die Grundfläche und das Volumen jeder Schicht auf (Fläche entlang des Korridors aus seinen Querprofilen, Volumen = Fläche × Dicke). Der IFC-Export schreibt jede Schicht als eigenes Element mit ihrer Dicke und ihrem Material (siehe [IFC-Export und -Import](topic:ifc)). Die Dicke, die Sie eingeben, ist Ihre eigene: CivilCraft dimensioniert keine Fahrbahnen.

## Wo Straßen auf Straßen, Bauplätze und Wege treffen

Mit eingeschaltetem {{ui:Die Straßen und Bauplätze verbinden, auf die er trifft}} (es ist für jeden Korridor eingeschaltet) verbindet CivilCraft einen Korridor im Plan mit dem, worauf er trifft:

- **Eine Straße, die auf einer anderen Straße endet** (das Ende ihrer Trasse liegt auf der anderen Straße oder innerhalb von etwa der halben eigenen Fahrbahnbreite von deren Kante) ist die Nebenstraße einer Einmündung. Die Straße, auf die sie trifft, öffnet ihre Kante für die Fahrbahn der Nebenstraße: Über die Mündung werden Bankett, Bordstein, Streifen und Gehweg auf der Querneigung des Fahrstreifens angelegt und als Fahrbahn gezeichnet. Die Nebenstraße wird dort, wo sich beide überlappen, auf die Oberfläche der Hauptstraße gelegt und über die Zufahrt auf sie hinauf- oder hinuntergeführt.
- **Zwei Straßen, die sich kreuzen**, werden auf beiden Seiten gleich verbunden. Die unter Trassen zuerst aufgeführte Straße ist die Durchgangsstraße; die andere folgt ihrer Oberfläche über die Kreuzung.
- **Eine Straße, die an einem Bauplatz endet** (innerhalb davon oder innerhalb von etwa der halben Fahrbahnbreite seines Randes), erreicht die Höhe des Bauplatzes und wird über die Zufahrt auf sie geführt.
- **Ein Weg** (Landschaft › Befestigte Flächen) endet an der äußeren Kante einer Straße, auf der Höhe des Gehwegs oder Banketts dort, statt über der Straße zu liegen. Ein Weg, der eine Straße kreuzt, wird zu zwei Teilen. Ein Ende, das knapp vor einer Straße gezeichnet ist (innerhalb des Doppelten der Wegbreite), wird bis zu deren Kante weitergeführt.

Die **Eigenschaften** zeigen, was jeder Korridor verbunden hat, um wie viel dort angehoben oder abgesenkt wurde und über welche Länge. Diese Länge ist der größere Wert von 10 m (30 ft) und dem Zwanzigfachen der Änderung, und nie mehr als 45 % des Korridors. **Der Entwurfslängsschnitt wird nicht verändert**: Die Längsschnittansicht zeigt weiterhin die Gradiente, die Sie gezeichnet haben, während Querprofile, das neue Geländemodell, die Volumen und die 3D-Ansicht die verbundene Straße zeigen. Um die Verbindung entwurfsgemäß exakt zu machen, verschieben Sie den letzten PVI auf die Höhe, die die Eigenschaften melden.

Schalten Sie den Schalter eines Korridors aus, um ihn genau so zu belassen, wie es sein Längsschnitt und sein Regelquerschnitt vorgeben; er nimmt dann an keiner Verbindung teil, weder als Nebenstraße noch als Durchgangsstraße. Straßen, die fast in einer Linie zusammentreffen (unter etwa 20°), bleiben unberührt, ebenso Wege.

Was eine Verbindung noch nicht tut: Es gibt keine Bordsteinrundungen (Ecken sind rechtwinklig), keine Abbiegespuren oder Inseln, das Ende der Nebenstraße ist rechtwinklig zu ihrer eigenen Trasse abgeschnitten, und ein Korridor aus Vorlagen öffnet seine Kante auf die gleiche einfache Weise (ein Graben oder eine Wand an seinem Endzustand wird über der Mündung eingeebnet, ohne Durchlass). Für Bordsteinrundungen im Plan, Sichtdreiecke und Markierungen siehe [Böden, Straßen, Vermessung, Bergbau und Verbindungen](topic:soils-roads-survey-mines-links).

## Was noch nicht umgesetzt ist

Ziele für die Böschungslinie sind noch nicht verfügbar. Für einen Korridor, der sich entlang der Straße ändert, mit Links und Rechts getrennt, verwenden Sie [Korridorvorlagen](topic:corridor-templates). Siehe [Noch nicht umgesetzt](topic:not-built-yet).
