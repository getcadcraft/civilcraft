---
title: Eigenes Layout anordnen und Setups speichern
summary: Wählen Sie, welcher Bereich den Projektbrowser, die Eigenschaften oder den eigenen Inhalt des Bereichs zeigt, wo die Werkzeugpalette steht und was die Leisten enthalten. Speichern Sie es als eigenes Layout, und bewahren Sie ganze Setups unter einem Namen auf, zwischen denen Sie wechseln können.
keywords: Layout, Arbeitsumgebung, anordnen, anpassen, mein Layout, eigenes Layout, Bereiche, Editoren, Projektbrowser, Eigenschaften, Werkzeugpalette, Schnellleiste, Infofeld, Arbeitsumgebung, Setup, Profil, Setup speichern, Setup wechseln, Setup exportieren, Setup importieren, ccenv
from: 6af528e0
---

Neben den drei eingebauten Layouts können Sie ein eigenes anordnen und Ihr gesamtes Setup unter einem Namen speichern, damit Sie mit einem Schritt dorthin zurückwechseln können.

## Eigenes Layout anordnen

1. Öffnen Sie {{ui:Einstellungen}} (das Zahnrad oder {{key:Mod+,}}), wählen Sie {{ui:Global}} und dann {{ui:Layout}}.
2. Wählen Sie {{ui:Eigenes Layout anordnen…}}. Der Dialog beginnt mit dem Layout, das Sie gerade verwenden.
3. Geben Sie ihm einen Namen und wählen Sie dann:
   - **Über der Zeichnung:** die Symbolleiste der App, ein Menüband oder keines von beiden; eine Titelleiste; ein Infofeld und welche Steuerelemente es enthält.
   - **Neben der Zeichnung:** die Werkzeugpalette links, rechts oder gar nicht, mit oder ohne {{ui:Eigene Werkzeuge}}; welcher Bereich die Paletten enthält, welcher oben liegt (zum Beispiel der Projektbrowser oder die Eigenschaften) und welche darunter als Registerkarten liegen.
   - **Der Zeichenbereich:** Ansichtsregisterkarten, eine Schnellleiste und eine Ansichtsleiste mit den Steuerelementen, die Sie ankreuzen, die Bearbeitungspalette und eine Statusleiste.
   - **Aussehen:** Größe, Schaltflächenrahmen und Registerkartenstil.
4. Wählen Sie {{ui:Dieses Layout verwenden}}. Die App wechselt sofort dorthin, und jede App mit Layouts verwendet es ebenfalls.

Angeboten wird nur, was diese App hat. Ihr Layout steht unter {{ui:Aus Add-ons und Dateien}}. {{ui:Dieses Layout exportieren}} speichert es als Datei, die Sie einem Kollegen geben können, und die Entfernen-Schaltfläche nimmt es weg. Die Bereiche, die es füllt, lassen sich weiterhin andocken, schweben lassen und in eigene Fenster verschieben, wie unter [Bereiche anordnen](common:arrange-panels) beschrieben.

## Ihr Setup als Arbeitsumgebung speichern

Eine Arbeitsumgebung ist Ihr gesamtes Setup für jede App in diesem Browser: das Layout, den Menüstil und Ihre Tastenkürzel, den Symbolleistenstil, die Bereiche und ihre Größen sowie {{ui:Eigene Werkzeuge}}. Design und Sprache gehören nicht dazu.

- **Speichern:** Geben Sie unter {{ui:Arbeitsumgebungen}} einen Namen ein und wählen Sie {{ui:Mein Setup speichern}}. Wenn Sie unter einem vorhandenen Namen speichern, wird dieses Setup ersetzt.
- **Wechseln:** Wählen Sie ein Setup in der Liste und wählen Sie {{ui:Dorthin wechseln}}. Die App lädt sich mit diesem Setup neu. Wenn Sie nicht gespeicherte Änderungen haben, fragt die App zuerst, wie bei jedem Neuladen.
- **Teilen:** {{ui:Exportieren}} speichert das gewählte Setup als Datei `.ccenv.json`; {{ui:Setup importieren…}} fügt eines aus einer Datei hinzu. Eine Datei setzt nur diese Einstellungen und nichts anderes.
- **Entfernen:** Wählen Sie ein Setup und wählen Sie {{ui:Entfernen}}.

Sie können bis zu zwölf Setups behalten.

Um ein Layout ohne den Dialog zu ändern (einen Block ziehen, mit der rechten Maustaste auf ein Werkzeug klicken), siehe [Layout am Bildschirm ändern](common:layout-edit). Um zuerst die eingebauten Anordnungen auszuprobieren, siehe [das Layout mit Werkzeugpalette und Infofeld](common:layout-toolbox), [das Layout mit Menüband und Projektbrowser](common:layout-ribbon) und [das Zeichnungs-Layout](common:layout-drafting).
