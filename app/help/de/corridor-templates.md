---
title: Korridorvorlagen und Geländevorlagen
summary: Kleine, wiederverwendbare Vorlagen erstellen (Bordstein und Rinne, Gehweg, Stützwand, Graben), daraus nach Station einen Korridor mit getrennten linken und rechten Seiten aufbauen, eine Trasse auf mehrere Korridore aufteilen und geschichtete Materialien auf einem Gelände verteilen.
keywords: Vorlage, Vorlagen, Vorlagenbibliothek, Vorlagenerstellung, typischer Querschnitt, Assembly, Subassembly, Komponenten, Punktcodes, Endbedingung, Böschung, Graben, Stützwand, Bordstein, Rinne, Gehweg, Bereiche, Stationsbereich, mehrere Korridore, links und rechts, Geländevorlage, Oberboden, Befestigung, Unterbau, Auftragen, Materialien, Mengen
from: ce70e58b
---

Eine **Vorlage** ist ein kleiner Querschnitt, den Sie einmal zeichnen und wiederverwenden: Punkte mit Versätzen, Neigungen und Punktcodes sowie Komponenten mit Materialien. Ein Korridor kann nach Station aus Vorlagen aufgebaut werden, jede Seite mit eigenen Befestigungsvorlagen und eigener Endbedingung. Dieselben Vorlagen lassen sich außerdem über ein Gelände legen.

:::warning
Die Beispielvorlagen sind Platzhalter als Ausgangspunkt. Ihre Werte stammen aus keiner Norm und keiner Behörde. Ein Ingenieur muss jede Vorlage und jeden Wert, den Sie eingeben, prüfen, bevor sie für einen Entwurf verwendet werden.
:::

## Vorlagen öffnen

Öffnen Sie {{ui:Geländemodell}} › {{ui:Mehr}} › {{ui:Korridorvorlagen…}} (oder geben Sie {{cmd:TEMPLATES}} ein). Das Fenster hat drei Listen:

- **In diesem Projekt**: die Vorlagen, die die Korridore und Geländevorlagen dieses Projekts verwenden. Sie werden in der Projektdatei gespeichert.
- **Meine Bibliothek**: Vorlagen, die in diesem Browser gespeichert sind und in jedem Projekt angeboten werden. Verwenden Sie {{ui:In Meiner Bibliothek speichern}} bei einer Projektvorlage, um sie zu behalten.
- **Beispiele**: zwei Fahrstreifen mit Schichten, Bordstein und Rinne, Gehweg, Böschung, Graben, Stützwand, Oberboden unter dem Gelände und Befestigung auf dem Gelände. Jede ist mit „Zur Prüfung durch einen Ingenieur“ markiert.

{{ui:In diesem Projekt verwenden}} kopiert eine Bibliotheks- oder Beispielvorlage in das Projekt. {{ui:Vorlagen dieses Projekts exportieren}} speichert sie als Datei `.cctemplates.json`, und {{ui:Datei importieren}} liest eine davon in das Projekt und in Meine Bibliothek ein. Mit der Datei teilen Sie Vorlagen oder bringen sie auf einen anderen Computer.

## Eine Vorlage erstellen

{{ui:Neue Vorlage}} (oder {{ui:Bearbeiten}} bei einer Projektvorlage) öffnet den Vorlageneditor. Zeichnen Sie die rechte Seite, nach außen vom Punkt 0,0 der Vorlage aus. Die linke Seite verwendet dieselbe Vorlage nach außen nach links.

1. Geben Sie einen Namen und eine Art an: **Befestigung** (die nächste Vorlage schließt an ihrem Ende an), **Endbedingung** (sie trifft auf das Gelände) oder **Geländevorlage**.
2. Fügen Sie **Werte** hinzu: benannte Zahlen wie eine Breite `w` oder eine Neigung `s`. Ein Zahlenfeld an beliebiger Stelle der Vorlage nimmt eine Zahl oder den Namen eines Werts an; `-t` ist der Wert `t`, negativ gemacht. Ein Korridor kann jeder Verwendung der Vorlage eigene Werte geben, sodass eine Bordsteinvorlage jede Bordsteinhöhe bedient.
3. Fügen Sie **Punkte** der Reihe nach hinzu. Jeder wird von einem früheren Punkt (oder vom Punkt 0,0 aus) nach seiner Bedingung platziert:

| Bedingung | Platziert den Punkt |
|---|---|
| Versatz bei einer Neigung | Ein Versatz nach außen und eine Neigung (Steigung je Lauf; −0.02 fällt um 2 %) |
| Versatz und Höhendifferenz | Ein Versatz und eine Höhendifferenz |
| Gerade nach oben oder unten | Nur eine Höhendifferenz |
| Böschung bis zum Gelände | Vom Punkt aus bis zum Gelände, mit dem Abtragsverhältnis, wo das Gelände darüber liegt, und dem Auftragsverhältnis, wo es darunter liegt |
| Bis zum Gelände | Ein Versatz, dann gerade nach oben oder unten bis zum Gelände |
| Stützwand | Eine Wand der angegebenen Stärke: Im Abtrag trifft ihre Oberkante das Gelände an der Fahrbahnkante, im Auftrag verläuft die Fahrbahn darüber und ihre Außenseite fällt bis zum Gelände |

   Aktivieren Sie **Oberkante** für die Punkte, durch die die fertige Fläche verläuft. Der letzte Oberkantenpunkt ist der Beginn der nächsten Vorlage auf dieser Seite. Ein **Ziel** erlaubt es einem Korridor, den Punkt zu verschieben: Sein Versatz oder seine Höhe kommt aus einer Linie.
4. Fügen Sie **Komponenten** hinzu: geschlossene Formen über Punktcodes (`0` ist der Punkt 0,0), jeweils mit Namen, Material und Art. Ihre Flächen ergeben die Volumen.

Die Zeichnung folgt jeder Änderung im wahren Maßstab. Die Liste darunter sagt, was falsch ist (ein Punkt, der vor dem Ende auf das Gelände trifft, ein Wert, den die Vorlage nicht hat, eine Komponente ohne Fläche). {{ui:Zu diesem Projekt hinzufügen}} oder {{ui:Speichern}} behält sie als einen Schritt für Rückgängig.

## Einen Korridor aus Vorlagen aufbauen

Wählen Sie eine Trasse mit einem Korridor aus und aktivieren Sie in ihren Eigenschaften {{ui:Aus Vorlagen nach Station erstellen}}. Der Korridor beginnt beidseitig mit den Beispielen für zwei Fahrstreifen und Böschung.

- **Bereiche.** Jeder Bereich beginnt bei einer Station und reicht bis zum Beginn des nächsten Bereichs. {{ui:Bereich hinzufügen}} fügt einen hinzu; ändern Sie seine Anfangsstation in seinem Feld.
- **Links und rechts getrennt.** Jede Seite jedes Bereichs hat eine eigene Liste **Befestigung**, von der Achse nach außen, und eine eigene **Endbedingung**: Böschung, einen Graben, eine Wand oder eine beliebige Vorlage, die das Gelände trifft. Ohne Endbedingung endet die Seite an den Abtrags- und Auftragsböschungen des Korridors. {{ui:Von links nach rechts kopieren}} kopiert eine Seite.
- **Werte und Ziele.** Unter jeder Vorlage einer Seite gibt es ein Feld je Wert (leer = der eigene Wert der Vorlage) und, für einen Punkt mit Ziel, die Feature-Linie oder die Linie eines anderen Korridors, die ihn verschiebt.
- **Von** und **Bis** begrenzen den Korridor auf einen Teil der Trasse.

Die Querschnitte, die Planlinien für jeden Punktcode, das geplante Geländemodell, die Absteckung und die Erdarbeiten folgen alle. Die **Eigenschaften** listen das Volumen jeder Komponente je Seite und Bereich (mittlere Endflächen entlang der Achse). Querneigung und die Randziele des Korridors werden nicht verwendet, solange der Korridor aus Vorlagen aufgebaut wird.

## Mehrere Korridore auf einer Trasse

Unter **Korridore auf dieser Trasse** fügt {{ui:Korridor hinzufügen}} einen Korridor auf dem Rest der Trasse hinzu. Der erste Korridor erhält eine Endstation in der Mitte (oder behält seine eigene), und der neue beginnt dort mit dem letzten Bereich der Vorlagen des ersten. Jeder Korridor hat seinen eigenen Namen, Stationsbereich, Vorlagen und seine Erdarbeiten. Schalten Sie einen mit seinem Feld {{ui:Ein}} aus. Wo sich zwei Bereiche überschneiden, modelliert der spätere Korridor über den früheren.

## Geländevorlagen

Eine Geländevorlage legt die Schichten einer Vorlage ab dem Punkt 0,0 über ein Gelände: Eine Schicht unter dem Punkt 0,0 geht in das Gelände (Oberboden zum Abtragen), eine Schicht darüber liegt auf dem Gelände (Unterbau und Befestigung auf einem Parkplatz). Breiten und Neigungen spielen keine Rolle, nur die Tiefe jeder Komponente über oder unter dem Punkt 0,0.

Öffnen Sie {{ui:Geländemodell}} › {{ui:Mehr}} › {{ui:Geländevorlagen…}} (oder geben Sie {{cmd:TERRAINTEMPLATES}} ein). Der Block steht auch in den Eigenschaften des Projekts. {{ui:Geländevorlage hinzufügen}} fügt eine mit dem Beispiel Oberboden hinzu. Wählen Sie für jede:

- die **Vorlage** (ihre Werte lassen sich für diese eine ändern),
- das **Gelände**: das Bestandsgelände oder das geplante Geländemodell,
- die **Form**, die sie begrenzt: das ganze Gelände, ein Flurstück, ein Plateau oder eine geschlossene Feature-Linie. Mehrere Geländevorlagen können auf demselben Gelände unterschiedliche Formen verwenden.

Jede Schicht zeigt ihre Stärke, Planfläche und ihr Volumen. Das Volumen ist die Planfläche mal die Stärke, wobei die Stärke senkrecht nach unten gemessen wird. Die Fläche wird auf einem Raster gemessen, und die aufgelegte (geneigte) Fläche wird ebenfalls angegeben. Die Formen werden im Plan auf dem Layer C-TOPO-TMPL gezeichnet. Geländevorlagen ändern das geplante Geländemodell nicht.

## Materialien und Mengen

Der Block Erdarbeiten des Projekts listet **Materialien aus Vorlagen**: jede Komponente eines Korridors und jede Schicht einer Geländevorlage mit ihrem Volumen. {{ui:An TakeoffCraft senden}} schreibt sie nach Abtrag und Auftrag in die Mengendatei, jeweils als eine Position, in Kubikyard (Projekte in Fuß) oder Kubikmetern.

## Dateien

Vorlagen, Bereiche, die zusätzlichen Korridore und die Geländevorlagen werden in der Projektdatei gespeichert. Ein Projekt, das keines davon nutzt, wird genau wie zuvor gespeichert. Ältere Versionen von CivilCraft öffnen ein Projekt, das sie nutzt (sie ignorieren die Vorlagen und bauen den eigenen Querschnitt des Korridors auf).
