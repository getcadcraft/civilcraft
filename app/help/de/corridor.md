---
title: Einen Straßenkorridor entlang der Trasse aufbauen
summary: Einen Korridor für eine Trasse einschalten, Werte für Fahrstreifen, Bankett und Böschungsneigung festlegen und die daraus entstehenden Querschnitte, Böschungslinien und Erdarbeiten ablesen.
keywords: Querneigung, Überhöhung, Kurvenneigung, Verwindung, Auslauf, Neigungstabelle, Korridor, Assembly, Subassembly, typischer Querschnitt, Straße, Fahrstreifen, Bankett, Böschungsneigung, Böschung, Abtrag, Auftrag, Querschnitte, Ziel, Ziele, Breitenziel, Höhenziel, Versatzziel, Verbreiterung, Fahrbahnkante, anderem Korridor folgen
from: 91303189
---

Ein Korridor führt einen einfachen typischen Querschnitt (ein Assembly) entlang einer Trasse und ihres Entwurfslängsschnitts, bindet ihn in das bestehende Gelände ein und fügt das Ergebnis dem geplanten Geländemodell hinzu. Eine Trasse kann mehrere Korridore auf verschiedenen Stationsbereichen tragen, und ein Korridor kann nach Station aus wiederverwendbaren Vorlagen aufgebaut werden ([Korridorvorlagen](topic:corridor-templates)). Das einfache Assembly unten ist auf beiden Seiten gleich. Um jeder Seite eigene Teile zu geben, siehe [Jede Seite aus Teilen aufbauen](topic:corridor#build-each-side-from-parts).

## Das Assembly

Von der Achse nach außen, auf jeder Seite:

1. ein **Fahrstreifen** einer festgelegten Breite, der vom Scheitel mit der **Fahrstreifenneigung** abfällt
2. ein **Bankett** einer festgelegten Breite mit der **Banketteneigung**
3. eine **Böschung** von der Bankettkante bis zur Stelle, wo sie das Gelände trifft: die **Abtragsneigung**, wo das Gelände darüber liegt, und die **Auftragsneigung**, wo es darunter liegt

Die Startwerte sind Platzhalter, keine Entwurfsnorm:

| Wert | US feet | Meter |
|---|---|---|
| Fahrstreifenbreite | 12 ft | 3.6 m |
| Fahrstreifenneigung | 2% | 2% |
| Bankettbreite | 4 ft | 1.2 m |
| Banketteneigung | 4% | 4% |
| Abtragsneigung | 2 : 1 | 2 : 1 |
| Auftragsneigung | 3 : 1 | 3 : 1 |
| Querschnitt alle | 10 ft | 5 m |

Böschungsneigungen sind horizontal zu vertikal (H:V): 3 : 1 bedeutet 3 waagerecht auf 1 senkrecht.

## Den Korridor aufbauen

Sie brauchen eine fehlerfreie Trasse und einen Entwurfslängsschnitt mit mindestens zwei PVIs und ohne Fehler.

1. Wählen Sie die Trasse aus.
2. Aktivieren Sie im rechten Bereich unter **Korridor** die Option **Assembly entlang des Entwurfslängsschnitts führen**.
   Die Felder erscheinen, und der Korridor wird sofort aufgebaut. Der Plan zeigt die Kanten von Fahrstreifen und Bankett sowie die Böschungslinien. Wenn unter **Anzeige** {{ui:Geplant (modelliert)}} gewählt ist, zeigen die Höhenlinien das neue Gelände.
3. Ändern Sie einen beliebigen Wert: **Fahrstreifenbreite**, **Fahrstreifenneigung**, **Bankettbreite**, **Banketteneigung**, **Abtragsneigung**, **Auftragsneigung**, **Querschnitt alle**. Drücken Sie nach jedem {{key:Enter}}. Abtrag, Auftrag und Querschnittsabstand müssen größer als 0 sein.
4. Lesen Sie die Zeile unter den Feldern, zum Beispiel „39 Querschnitte von 0+00.00 bis 3+86.36; Abtrag 240.2 cu yd, Auftrag 556.0 cu yd.“

Querschnitte werden in jedem Schritt von **Querschnitt alle** geschnitten, an den Enden sowie am Anfang und Ende jedes horizontalen und vertikalen Bogens. Jeder Querschnitt und die Linien durch ihn (Achse, Kanten von Fahrstreifen und Bankett, Böschungen) werden zu Bruchkanten des geplanten Geländemodells.

Um den Korridor auszuschalten, deaktivieren Sie das Feld. Seine Werte bleiben für das nächste Mal erhalten.

## Wenn er nicht aufgebaut wird

Ein rotes Feld unter den Feldern sagt, warum:

| Meldung | Was zu tun ist |
|---|---|
| „Der Korridor braucht einen Entwurfslängsschnitt ohne Fehler.“ | PVIs hinzufügen oder sich überschneidende Vertikalbögen korrigieren (siehe [Einen Entwurfslängsschnitt erstellen](topic:profile)). |
| „Der Entwurfslängsschnitt überschneidet die Trasse nicht.“ | Verschieben Sie die PVIs auf den Stationsbereich der Trasse. |
| „Der Korridor braucht mindestens zwei Querschnitte auf dem Geländemodell.“ | Der größte Teil des Korridors liegt außerhalb des Bestandsgeländes. |
| „4 Böschungen laufen vom Geländemodell ab, bevor sie das Gelände treffen.“ | Nahe am Rand des Geländemodells erreicht die Böschung das Gelände nicht. Halten Sie die Straße vom Rand fern oder senken Sie dort die Auftrags- oder Abtragshöhe. |
| „Die Böschungslinien des Korridors kreuzen sich (Querschnitte überlappen, zum Beispiel an der Innenseite einer engen Kurve). Verwenden Sie einen größeren Radius oder ein schmaleres Assembly.“ | Querschnitte an der Innenseite einer scharfen Kurve überlappen. Vergrößern Sie den Radius oder verengen Sie das Assembly. |

Ein Korridor mit einem Problem wird nicht eingemodelliert und zählt nicht zu den Erdarbeiten.

## Korridore und Plateaus zusammen

Das geplante Geländemodell wird der Reihe nach aufgebaut: zuerst alle Korridore, dann alle Plateaus. Wo die Modellierung eines Plateaus einen Korridor überschneidet, gewinnt das Plateau. Volumen werden innerhalb aller Böschungslinien zusammen berechnet; siehe [Erdarbeitsvolumen](topic:volumes).

## Querneigung

In einer Kurve kann die Straße zur Innenseite geneigt werden, damit der Verkehr nach außen weniger gedrückt wird. Aktivieren Sie in den **Eigenschaften** der Trasse unter **Querneigung** die Option **Kurven mit Querneigung versehen**:

- Jeder Kreisbogen erhält eine Neigung **e** aus der Neigungstabelle: die erste Zeile, deren Radius der Bogen erreicht (eine Zeile mit leerer Neigung behält den normalen Scheitel). Die Tabelle und die **maximale relative Steigung** (anfangs 0.5 %) sind Platzhalter, keine Norm. Legen Sie sie anhand Ihrer eigenen Entwurfskriterien fest. Fügen Sie Zeilen hinzu oder entfernen Sie sie nach Bedarf.
- Die Fahrstreifen drehen sich um die Achse. Vor dem Bogen wird der äußere Fahrstreifen über den **Auslauf** eingeebnet (normaler Scheitel ÷ e × Verwindungslänge). Danach wird er über die **Verwindungslänge** (Fahrstreifenbreite × e ÷ Steigung) weiter gedreht, bis die ganze Straße mit e zur Innenseite geneigt ist. Zwei Drittel der Verwindungslänge liegen vor dem Bogen, ein Drittel auf dem Bogen. Nach dem Bogen geschieht dasselbe in umgekehrter Reihenfolge.
- Ein Bankett auf der tiefen Seite ist nie flacher als sein Fahrstreifen. Auf der hohen Seite behält es seine eigene Neigung (es kippt ab).
- Die Tabelle darunter listet für jeden Bogen Radius, Neigung e, Verwindungslänge und Auslauf sowie den Beginn und das Ende der vollen Querneigung auf. Das **Querneigungsdiagramm** zeichnet die Querneigungen beider Fahrstreifen entlang der Stationen (der linke Fahrstreifen durchgezogen, der rechte gestrichelt).
- Ein Bogen, der zu kurz für die volle Querneigung ist, oder zwei Bögen, deren Verwindungslängen sich überschneiden, werden in einem Feld über der Tabelle gemeldet.

Querschnitte, Volumen, die 3D-Ansicht und die Blätter zeigen alle die geneigte Straße. Jede Änderung ist ein Schritt: {{key:Mod+Z}} macht sie rückgängig.

## Ziele

Ein Ziel verschiebt einen Punkt einer Straßenseite auf eine Linie: die **Fahrbahnkante** oder die **Bankettkante**, auf der **linken** oder der **rechten** Seite. Jeder Querschnitt trifft die Linie rechtwinklig zur Achse und geht nur auf dieser Seite hinaus. Ein Ziel rechts verschiebt deshalb nie die linke Seite.

| Legt fest | Was geschieht, wo ein Querschnitt die Linie trifft |
|---|---|
| **Breite** | Der Punkt liegt auf der Linie: Der Fahrstreifen (oder das Bankett) wird auf sie hin breiter oder schmaler und behält seine Querneigung. |
| **Höhe** | Der Punkt übernimmt dort die Höhe der Linie bei seinem eigenen Versatz: Die Querneigung des Fahrstreifens (oder Banketts) folgt. |

Die Linie kann eine Feature-Linie (unabhängig von ihrer **Verwendung**) oder eine Linie eines anderen Korridors sein: dessen Achse, Fahrbahnkanten, Bankettkanten oder Böschungslinien. Die Linie eines Korridors folgt diesem Korridor: Ändern Sie die andere Straße, folgt diese. CivilCraft baut den anderen Korridor zuerst. Zwei Korridore, die sich in einer Schleife gegenseitig als Ziel hätten, werden auf einer Seite abgelehnt, und die Tabelle sagt, welche.

1. Wählen Sie die Trasse aus und schalten Sie ihren Korridor ein.
2. Klicken Sie unter **Ziele** auf {{ui:Ziel hinzufügen}}.
3. Wählen Sie die **Seite**, den **Punkt**, was er **festlegt** und **zur Linie**. Jede Änderung ist ein Schritt für Rückgängig.

**Ergebnis** sagt, an wie vielen Querschnitten die Linie erreicht wurde. Querschnitte, die sie nicht erreichen (hinter ihren Enden oder hinter der Achse), behalten die Werte des Assemblys. Wird eine Linie gelöscht, bleibt der Korridor so, wie er vor dem Ziel war, und die Tabelle sagt das. Eine Seite kann für jeden Punkt ein Breitenziel und ein Höhenziel haben.

## Jede Seite aus Teilen aufbauen

Aktivieren Sie unter den Einstellungen des Korridors **Jede Seite aus Teilen aufbauen**. Jede Seite hat dann ihre eigene Liste von der Achse nach außen: Fahrstreifen, ein Bankett, eine Rinne, einen Bordstein, einen Begrünungsstreifen, einen Gehweg und zuletzt die Böschung bis zum Gelände (mit eigenen Abtrags- und Auftragsverhältnissen). Beginnen Sie mit {{ui:Landstraße}} oder {{ui:Innerortsstraße}}, fügen Sie Teile hinzu und entfernen Sie sie, verschieben Sie sie mit den Pfeilen, und {{ui:Kopieren}} Sie eine Seite auf die andere. Jede Änderung ist ein Schritt für Rückgängig.

Eine Querneigung ist das Gefälle von der Straße weg, daher ist ein Gehweg, der zur Straße entwässert, negativ. Ein Bordstein ist eine Fläche mit der Höhe, die Sie angeben, eine Oberkante mit der Breite, die Sie angeben, und einem optionalen Versatz nach hinten. Die Querneigung dreht jeden Fahrstreifen in der ersten Zeile. Rinne, Bordstein, Streifen und Gehweg hängen an der Kante der gebauten Fahrstreifen. Ziele verschieben weiterhin das Ende der Fahrstreifen und des letzten Teils. Querschnitte markieren die Rinnensohle, Oberkante und Rückseite des Bordsteins und das Übrige. Bei einer Kurve mit Klothoiden ist der Übergang die Klothoide: ebener Scheitel am TS, volle Querneigung am SC.

## Befestigungsschichten

Ein Fahrstreifen, ein Bankett, eine Rinne, ein Begrünungsstreifen oder ein Gehweg kann seinen Aufbau tragen. Unter dem Teil fügt {{ui:Schicht hinzufügen}} eine Schicht mit Name, Material, Stärke und Art hinzu (Deckschicht, Binderschicht, Tragschicht, Frostschutzschicht, Planumsschutz oder andere), von oben nach unten. Die Schichten verschieben die Oberfläche der Straße nicht: Ihre Oberseite ist die Entwurfsfläche. Jede liegt unter ihrem Teil, und ihre Tiefe wird senkrecht nach unten gemessen. Querschnitte zeichnen die Unterkante jeder Schicht als gestrichelte Linie. {{ui:Fahrbahnschichten: Mengen}} listet Planfläche und Volumen jeder Schicht auf (Fläche entlang des Korridors aus den Querschnitten, Volumen = Fläche × Stärke). Der IFC-Export schreibt jede Schicht als eigenes Element mit Stärke und Material (siehe [IFC-Export und -Import](topic:ifc)). Die eingegebene Stärke liegt in Ihrer Verantwortung: CivilCraft bemisst keine Befestigungen.

## Noch nicht umgesetzt

Ziele für die Böschungsneigung sind noch nicht verfügbar. Für einen Korridor, der sich entlang der Straße ändert, mit getrennten linken und rechten Seiten, verwenden Sie die [Korridorvorlagen](topic:corridor-templates). Siehe [Noch nicht umgesetzt](topic:not-built-yet).
