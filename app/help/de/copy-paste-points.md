---
title: Vermessungspunkte auswählen, kopieren und einfügen
summary: Vermessungspunkte per Klick, mit Shift und Rechteck oder alle auf einmal auswählen; kopieren, ausschneiden, einfügen, an gleicher Position einfügen, duplizieren und löschen, mit neuen Punktnummern, die nie kollidieren; Punktzeilen in eine Tabellenkalkulation und aus ihr einfügen.
keywords: kopieren, einfügen, ausschneiden, duplizieren, Punkte löschen, Punkte auswählen, alle auswählen, Rechteckauswahl, Fenster, Zwischenablage, Tabellenkalkulation, CSV, umnummerieren, Punktnummern, an gleicher Position einfügen, klonen, Absteckung
from: 78a6aea7
---

Vermessungspunkte lassen sich innerhalb eines Projekts kopieren und einfügen, zwischen Projekten in zwei Browser-Registerkarten sowie in eine Tabellenkalkulation und aus ihr. Jede Änderung ist ein Schritt für Rückgängig, und das Geländemodell wird sofort aus den neuen Punkten neu aufgebaut.

## Punkte auswählen

Mit {{ui:Wählen}} ({{key:V}}):

- **Klicken** Sie auf einen Punkt, um ihn auszuwählen (und nur ihn). Seine Nummern werden unter **Eigenschaften** angezeigt.
- {{key:Shift}} und **Klick** fügt einen Punkt der Auswahl hinzu oder nimmt ihn heraus.
- {{key:Shift}} und **Ziehen** zieht ein Rechteck: Die Punkte darin werden der Auswahl hinzugefügt. Ziehen Sie stattdessen um die Punkte herum, wird daraus ein Lasso; siehe [Lasso-Auswahl von Vermessungspunkten](topic:lasso-selection). Ein Ziehen ohne {{key:Shift}} verschiebt den Ausschnitt wie gewohnt.
- {{key:Mod+A}} (oder {{ui:Mehr}} › {{ui:Alle Punkte auswählen}}) wählt alle Punkte aus.
- {{key:Esc}} (oder {{ui:Mehr}} › {{ui:Auswahl aufheben}}) hebt die Auswahl auf.

Ausgewählte Punkte haben einen Ring. Bei mehr als einem ausgewählten Punkt zeigen die **Eigenschaften** an, wie viele es sind, ihre Nummern, ihren Höhenbereich und ihre Gruppen.

## Kopieren, Ausschneiden und Löschen

- {{ui:Kopieren}} oder {{key:Mod+C}} kopiert die ausgewählten Punkte. CivilCraft behält die Kopie und legt sie zusätzlich als Punktzeilen in die Zwischenablage des Systems, sodass Sie sie direkt in eine Tabellenkalkulation oder eine Textdatei einfügen können.
- {{ui:Mehr}} › {{ui:Ausschneiden}} oder {{key:Mod+X}} kopiert sie und löscht sie in einem Schritt.
- {{ui:Mehr}} › {{ui:Löschen}} oder {{key:Delete}} löscht sie. {{key:Mod+Z}} holt sie zurück.

Die Zeilen enthalten Punkt, Hochwert, Rechtswert, Höhe und Beschreibung (P,N,E,Z,D), durch Kommas getrennt, mit drei Nachkommastellen. Damit der Rechtswert vor dem Hochwert steht, stellen Sie **Punktzeilen** in den [CivilCraft-Einstellungen](topic:settings) ein. Eine Beschreibung, die eine Tabellenkalkulation als Formel behandeln würde (beginnend mit =, +, - oder @), erhält vorne einen Apostroph, damit sie Text bleibt.

## Einfügen

1. Drücken Sie {{key:Mod+V}} oder klicken Sie auf {{ui:Einfügen}}. Die Punkte folgen dem Zeiger als kleine Kreuze, mit einer gepunkteten Linie zurück zu der Stelle, von der sie stammen.
2. Klicken Sie an die Stelle, an die sie sollen. Die Mitte der kopierten Punkte landet auf dem Klick.
3. Oder drücken Sie {{key:Enter}}, um sie an ihre eigenen Koordinaten zu setzen, oder {{key:Esc}}, um abzubrechen.

{{ui:Mehr}} › {{ui:An gleicher Position einfügen}} oder {{key:Mod+Shift+V}} fügt die Punkte sofort an ihren eigenen Koordinaten ein. Die eingefügten Punkte bleiben danach ausgewählt, sodass Sie sie erneut kopieren, verschieben oder löschen können.

:::note
Ein Klick auf {{ui:Einfügen}} in der Symbolleiste liest die Zwischenablage des Systems. Beim ersten Mal fragt der Browser möglicherweise, ob CivilCraft die Zwischenablage sehen darf. Lehnen Sie ab, fügt die Schaltfläche der Symbolleiste nur die eigene Kopie von CivilCraft ein. {{key:Mod+V}} fügt weiterhin Zeilen aus einer Tabellenkalkulation ohne Nachfrage ein.
:::

## Punktnummern kollidieren nie

Zwei Punkte teilen sich nie eine Nummer. Beim Einfügen gilt:

- Ein eingefügter Punkt behält seine Nummer, wenn kein Punkt im Projekt sie hat. Nach **Ausschneiden** werden die Punkte also mit ihren eigenen Nummern zurückgefügt, und Punkte aus einem anderen Projekt behalten ihre Nummern, wo diese frei sind.
- Ein eingefügter Punkt, dessen Nummer belegt ist, erhält eine neue ganze Zahl: eins mehr als die höchste verwendete Nummer, aufsteigend.
- Die Statusleiste sagt, was geschehen ist, zum Beispiel „1 behielt ihre Nummer; 9 erhielten neue Nummern: 10–18 wurden 277–285“.

In den [CivilCraft-Einstellungen](topic:settings) können Sie **Immer neue Nummern** wählen und eine Nummer, ab der neue Nummern beginnen, zum Beispiel 5000 für Entwurfspunkte.

:::warning
Punktgruppen, die die Fläche als **Bruchkante** aufbauen, verbinden ihre Punkte in der Nummernfolge. Eingefügte Kopien von Bruchkantenpunkten (zum Beispiel FL-Messungen) erhalten neue, höhere Nummern und hängen sich ans Ende dieser Bruchkante, unter Umständen mit einem langen Sprung. Prüfen Sie den Plan nach dem Einfügen solcher Punkte, oder stellen Sie ihre Gruppe auf {{ui:Punkte}}.
:::

## Duplizieren

{{ui:Mehr}} › {{ui:Duplizieren}} oder {{key:Mod+D}} erstellt eine Kopie der ausgewählten Punkte, die dem Zeiger folgt: Klicken Sie, wo sie hin soll. Die Kopien erhalten immer neue Nummern, und die Zwischenablage von CivilCraft bleibt unverändert.

## Aus einer Tabellenkalkulation oder Textdatei

Markieren Sie Zeilen mit Punkten in einer Tabellenkalkulation (Punkt, Hochwert, Rechtswert, Höhe, Beschreibung) und kopieren Sie sie. Drücken Sie in CivilCraft {{key:Mod+V}} und klicken Sie, wo sie hin sollen, oder drücken Sie {{key:Mod+Shift+V}}, um sie an ihre eigenen Koordinaten zu setzen. Das ist bei echten Vermessungsdaten meist das Richtige.

Die Zeilen werden genau wie eine [Punktdatei](topic:point-file-formats) gelesen: Kommas, Tabulatoren oder Leerzeichen, eine Kopfzeile, falls vorhanden. Ohne Kopfzeile kommt die Spaltenfolge aus **Punktzeilen** in den [CivilCraft-Einstellungen](topic:settings).

Sind beide vorhanden, entscheidet CivilCraft nach dem Neueren: Zeilen in der Zwischenablage des Systems, die sich von der letzten Kopie von CivilCraft unterscheiden, wurden später kopiert und werden daher eingefügt. Text ohne Punkte wird ignoriert, und stattdessen wird die eigene Kopie von CivilCraft eingefügt.

## Zwischen Projekten und Registerkarten

Die Kopie wird in diesem Browser gespeichert, sodass eine zweite Registerkarte von CivilCraft sie einfügen kann, auch nachdem die erste geschlossen wurde. Punkte, die in einem Meter-Projekt kopiert und in ein Fuß-Projekt eingefügt werden, behalten ihre Nummern unverändert: Nichts wird umgerechnet, und die Statusleiste sagt das.

## Was nicht kopiert wird

Vorerst werden nur Vermessungspunkte kopiert. Trassen, Plateaus, Rohrnetze, Bruchkanten und Begrenzungen lassen sich noch nicht kopieren oder einfügen. Einfügen kann bestehende Punkte nicht verschieben: Verwenden Sie {{ui:Ausschneiden}} und Einfügen oder verschieben Sie jeweils einen Punkt ([Vermessungspunkt bearbeiten](topic:edit-points)).
