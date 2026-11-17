---
title: Ihre Freileitungsbibliothek
summary: Erstellen Sie eigene Leiter, Erdkabel, Maste, Betriebsmittel und Grabentypen in Kategorien, die Sie benennen, und teilen Sie sie als Dateien.
keywords: Bibliothek, Leiter, Erdkabel, Mast, Traverse, Isolator, Armatur, Abspannung, Abspannseil, Transformator, Schrank, Muffe, Graben, Kategorie, csv, importieren, exportieren
from: 88733744
---

Der Bereich **Bibliothek** im Arbeitsbereich Freileitungen enthält jedes Element, das eine Leitung oder ein Kabel verwenden kann. Nichts darin ist an ein Land oder einen Hersteller gebunden: Sie erstellen die Elemente, mit denen Sie arbeiten.

## Drei Arten von Elementen

| Art | Wo es liegt | Können Sie es ändern? |
|---|---|---|
| **Beispiele** | Mit CivilCraft ausgeliefert, mit allgemeinen Werten, die wir aus Materialeigenschaften ermittelt haben | Nein: Kopieren Sie es zuerst mit {{ui:In meine Bibliothek kopieren}} |
| **Im Projekt** | Kam mit der Projektdatei, die Sie geöffnet haben | Nein: Kopieren Sie es zuerst mit {{ui:In meine Bibliothek kopieren}} |
| **Meine** | Ihre eigenen Elemente, in diesem Browser gespeichert | Ja, Änderungen werden sofort gespeichert |

Jedes Projekt behält eine Kopie jedes Elements, das es verwendet. Dadurch öffnet sich ein Projekt auf jedem Computer mit seinen eigenen Leitern und Masten.

:::warning
Die Beispielelemente sind nur Beispiele: Prüfen Sie jede Zahl anhand der Daten Ihres Lieferanten. Die Erdkabel haben absichtlich keine Strombelastbarkeit, weil sie davon abhängt, wie das Kabel verlegt wird.
:::

## Ein Element erstellen

1. Wählen Sie in **Bibliothek** die **Art** (Freileitungsleiter, Erdkabel, Maste, Betriebsmittel oder Grabentypen).
2. Klicken Sie auf {{ui:Neues Element}}, oder wählen Sie ein Beispiel und klicken Sie auf {{ui:In meine Bibliothek kopieren}} oder {{ui:Duplizieren}}.
3. Füllen Sie seine Felder aus. Felder mit `*` sind diejenigen, die die Prüfungen benötigen. Ein Element, dem eines davon fehlt, wird mit `!` markiert und unter **Prüfungen** aufgeführt, sobald eine Leitung es verwendet.
4. Geben Sie ihm eine **Kategorie**, mit `/` zwischen den Ebenen: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. Der Baum folgt Ihren Kategorien.

Was jede Art benötigt:

| Art | Für die Prüfungen nötig |
|---|---|
| Freileitungsleiter | Querschnitt, Durchmesser, Masse je Meter, Bruchlast, Elastizitätsmodul, Wärmeausdehnung |
| Erdkabel | Adern, Querschnitt, Spannung, Durchmesser, Widerstand, Strombelastbarkeit |
| Mast | Gesamtlänge, Nennlast (gemessen an einem Punkt unterhalb der Spitze), Tiefe im Boden |
| Betriebsmittel | sein Typ; eine Nennlast für Traversen, Armaturen und Abspannungen; Phasenabstand und Höhenversatz für Traversen; Länge für Isolatoren; der Winkel für Abspannungen |
| Grabentyp | Tiefe, Breite, Überdeckung über den Kabeln |

## Teilen

- {{ui:Meine Bibliothek speichern}} speichert jedes Ihrer Elemente als eine `.cclines.json`-Datei. {{ui:Bibliothek öffnen…}} liest eine solche Datei wieder ein (Elemente mit demselben Schlüssel werden ersetzt).
- {{ui:Als CSV speichern}} speichert die Art, die Sie gerade sehen, als Tabelle. {{ui:Bibliothek öffnen…}} liest eine CSV-Datei dieser Art wieder ein. Die Spalten dürfen in beliebiger Reihenfolge stehen. Eine semikolongetrennte Datei darf ein Dezimalkomma verwenden.
