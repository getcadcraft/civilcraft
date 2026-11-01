---
title: Eigenes Layout anordnen und Setups speichern
summary: Wählen, welcher Bereich den Projektbrowser, die Eigenschaften oder seinen eigenen Inhalt zeigt, wohin die Werkzeugpalette kommt und was die Leisten enthalten, als eigenes Layout speichern und ganze Setups unter einem Namen aufbewahren, um zwischen ihnen zu wechseln.
keywords: Layout, Arbeitsbereich, anordnen, anpassen, mein Layout, eigenes Layout, Bereiche, Editoren, Projektbrowser, Eigenschaften, Werkzeugpalette, Schnellleiste, Infofeld, Arbeitsumgebung, Setup, Profil, Setup speichern, Setup wechseln, Setup exportieren, Setup importieren, ccenv
from: 2a71af43
---

Neben den drei eingebauten Layouts können Sie ein eigenes anordnen und Ihr ganzes Setup unter einem Namen speichern, um mit einem Schritt dorthin zurückzuwechseln.

## Eigenes Layout anordnen

1. {{ui:Einstellungen}} öffnen (das Zahnrad oder {{key:Mod+,}}), {{ui:Global}} wählen, dann {{ui:Layout}}.
2. {{ui:Eigenes Layout anordnen…}} wählen. Das Dialogfeld beginnt mit dem Layout, das Sie gerade benutzen.
3. Einen Namen vergeben und dann wählen:
   - **Über der Zeichnung:** die Symbolleiste der App, ein Menüband oder keines von beiden; eine Titelleiste; ein Infofeld und welche Bedienelemente es enthält.
   - **Neben der Zeichnung:** die Werkzeugpalette links, rechts oder gar nicht, mit oder ohne {{ui:Eigene Werkzeuge}}; welcher Bereich die Paletten enthält, welche oben liegt (zum Beispiel der Projektbrowser oder die Eigenschaften) und welche als Reiter darunter stehen.
   - **Der Zeichenbereich:** Ansichtsreiter, eine Schnellleiste und eine Ansichtsleiste mit den Bedienelementen, die Sie ankreuzen, die Bearbeitungspalette, eine Statusleiste.
   - **Aussehen:** Größe, Schaltflächenumrisse und Reiterstil.
4. {{ui:Dieses Layout verwenden}} wählen. Die App wechselt sofort dazu, und jede App mit Layouts benutzt es ebenfalls.

Angeboten wird nur, was diese App hat. Ihr Layout steht unter {{ui:Aus Add-ons und Dateien}}. {{ui:Dieses Layout exportieren}} speichert es als Datei, die Sie an Kolleginnen und Kollegen weitergeben können, und die Schaltfläche zum Entfernen nimmt es weg. Die Bereiche, die es füllt, lassen sich weiterhin andocken, schweben lassen und in eigene Fenster verschieben, wie unter [Bereiche anordnen](common:arrange-panels).

## Ihr Setup als Arbeitsumgebung speichern

Eine Arbeitsumgebung ist Ihr ganzes Setup für jede App in diesem Browser: das Layout, der Menüstil und Ihre Tasten, der Symbolleistenstil, die Bereiche und ihre Größen sowie {{ui:Eigene Werkzeuge}}. Das Design und die Sprache gehören nicht dazu.

- **Speichern:** Unter {{ui:Arbeitsumgebungen}} einen Namen tippen und {{ui:Mein Setup speichern}} wählen. Wer unter einem vorhandenen Namen speichert, ersetzt dieses Setup.
- **Wechseln:** Ein Setup in der Liste wählen und {{ui:Dorthin wechseln}} wählen. Die App lädt in diesem Setup neu. Bei nicht gespeicherter Arbeit fragt die App zuerst nach, wie bei jedem Neuladen.
- **Teilen:** {{ui:Exportieren}} speichert das gewählte Setup als Datei `.ccenv.json`. {{ui:Setup importieren…}} fügt eines aus einer Datei hinzu. Eine Datei setzt immer nur diese Auswahlen, nichts sonst.
- **Entfernen:** Ein Setup wählen und {{ui:Entfernen}} wählen.

Sie können bis zu zwölf Setups behalten.

Um zuerst die eingebauten Anordnungen auszuprobieren, siehe [das Layout mit Werkzeugpalette und Infofeld](common:layout-toolbox) und [das Layout mit Menüband und Projektbrowser](common:layout-ribbon).
