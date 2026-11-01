---
title: Im Layout mit Werkzeugpalette und Infofeld arbeiten
summary: Die App auf eine Werkzeugspalte links mit Plätzen für eigene Werkzeuge umstellen, mit einem Infofeld quer oben, das dem laufenden Werkzeug oder Ihrer Auswahl folgt, einem Navigator rechts, einem Reiter für jede Ansicht, Schnelloptionen und einer Bearbeitungspalette, und jederzeit zum klassischen Layout zurückwechseln.
keywords: Layout, Arbeitsbereich, Werkzeugpalette, Werkzeugspalte, Infofeld, Infoleiste, Navigator, Projektübersicht, Schnellleiste, Schnelloptionen, Bearbeitungspalette, Eigene Werkzeuge, Lieblingswerkzeuge, Ansichtsreiter, Werkzeugpalette-Fenster, klassisches Layout, Layout wechseln, Layout umschalten
from: 2f807c9c
---

**Werkzeugpalette und Infofeld** ist eines der drei Arbeitsbereichslayouts der App. Die Zeichenwerkzeuge stehen in einer Spalte links, ein Infofeld quer oben zeigt, was das laufende Werkzeug braucht oder was Sie gewählt haben, jede Ansicht hat einen Reiter, und eine Schnellleiste unter der Zeichnung enthält ein paar alltägliche Optionen. Die Werkzeuge sind die der App: Alles, was Sie im klassischen Layout tun können, geht auch hier, und Ihre Zeichnung, Ihr Menüstil und Ihre Tasten bleiben, wie sie sind.

## Auswählen

1. {{ui:Einstellungen}} öffnen (das Zahnrad oder {{key:Mod+,}}).
2. Die Registerkarte {{ui:Global}} wählen und dann zu {{ui:Layout}} › {{ui:Arbeitsbereich}} gehen.
3. {{ui:Werkzeugpalette und Infofeld}} wählen.

Das Layout ändert sich sofort. Die Wahl gilt für jede App in diesem Browser: Jede App öffnet sich von da an darin, und es steht bereit, bevor die Seite zeichnet, Sie sehen also nie zuerst das klassische Layout.

## Was wo ist

- **Symbolleiste:** Die eigene Symbolleiste der App bleibt oben im Zeichenbereich, mit ihren Menüs.
- **Infofeld:** unter der Symbolleiste. Während ein Werkzeug läuft, zeigt es das Werkzeug und was es verlangt. Wenn Sie etwas wählen, zeigt es dessen wichtigste Einstellungen (bei einer Wand: Typ, Dicke, Länge, Ortungslinie und Höhe), und Sie können sie direkt dort ändern: Eine Änderung dort ist dasselbe wie in den Eigenschaften, und {{key:Mod+Z}} nimmt sie zurück. Ist nichts gewählt, steht dort „Nichts ausgewählt“. Jede App fügt hier eigene Felder hinzu, etwa den aktuellen Layer oder das Geschoss oder das geöffnete Dokument.
- **Werkzeugpalette:** die Spalte links, die Werkzeuge der App in Gruppen. Auf den Namen einer Gruppe klicken, um sie ein- oder wieder auszuklappen. Das laufende Werkzeug leuchtet.
- **Eigene Werkzeuge:** die erste Gruppe der Werkzeugpalette, acht leere Plätze für die Werkzeuge, die Sie am meisten benutzen. Auf einen leeren Platz klicken, um ein beliebiges Werkzeug oder einen beliebigen Befehl der App zu wählen; oder in der Werkzeugpalette ein Werkzeug rechtsklicken und {{ui:Zu Eigene Werkzeuge hinzufügen}} wählen; oder ein Werkzeug auf einen Platz ziehen. Einen Platz rechtsklicken, um ihn zu ändern oder zu leeren. Ihre Plätze werden pro App in diesem Browser gespeichert.
- **Navigator:** der rechte Bereich. Oben steht der Projektbrowser der App (Grundrisse, Schnitte, Ansichten, 3D-Ansichten, Listen, Blätter, je nachdem, was die App hat): Einen anklicken, um ihn zu öffnen. Darunter {{ui:Eigenschaften}} und ein Reiter mit dem übrigen Inhalt des rechten Bereichs.
- **Ansichtsreiter:** ein Reiter für jede Ansicht der geöffneten Datei (ein Blatt, ein Grundriss, eine Szene …), über der Zeichnung.
- **Schnellleiste:** unter der Zeichnung die Ansichtseinstellungen und alltäglichen Optionen, die die App hat, etwa Maßstab, Detailgrad, Ansichtsbereich, Einpassen, Grundriss, Geteilt oder 3D, Fänge und Einheiten.
- **Bearbeitungspalette:** Wenn Sie etwas in der Zeichnung anklicken, erscheint eine kleine Palette am Zeiger mit den Bearbeitungsbefehlen der App dafür, etwa Verschieben, Kopieren, Drehen, Spiegeln, Duplizieren oder Löschen, und {{ui:Eigenschaften}}. {{key:Esc}}, das Mausrad, ein weiterer Klick oder ihre Schaltfläche zum Schließen legen sie weg.

Ein Werkzeug, das gerade nicht laufen kann, ist grau, und sein Tooltip sagt warum. Klicken Sie es an oder drücken Sie {{key:Enter}} darauf, um den Grund in einem Feld zu lesen.

{{key:Esc}} beendet zuerst das laufende Werkzeug, wie im klassischen Layout, und jedes Tastenkürzel sowie {{key:Ctrl+Shift+F}} (Bildschirmmodi) funktionieren wie zuvor.

## Der Werkzeugpalette ein eigenes Fenster geben

Die Schaltfläche {{ui:Werkzeugpalette verschieben}} oben in der Werkzeugpalette hat {{ui:In ein neues Fenster verschieben}}: Die Werkzeugpalette öffnet sich in einem eigenen schmalen Fenster, das Sie neben die App oder auf einen zweiten Monitor setzen können. Dort gedrückte Tasten erreichen die App. {{ui:Werkzeugpalette zurücksetzen}} oder das Schließen dieses Fensters bringt sie zurück.

Die Einstellungen der Symbolleiste gelten auch für die Werkzeugpalette: {{ui:Einstellungen}} › {{ui:Global}} › {{ui:Symbolleiste}} › {{ui:Symbole und Beschriftungen}}, {{ui:Nur Symbole}} oder {{ui:Nur Beschriftungen}}, und {{ui:Gruppennamen anzeigen (Datei, Zeichnen, …)}}.

## Ihre Bereiche bleiben Ihre

Der linke und der rechte Bereich behalten alles, was unter [Bereiche anordnen](common:arrange-panels) beschrieben ist: andocken, schweben lassen, anheften, ausblenden, Reiter, {{ui:In ein neues Fenster verschieben}} und {{ui:Layout zurücksetzen}}.

## Zum klassischen Layout zurückkehren

{{ui:Einstellungen}} › {{ui:Global}} › {{ui:Layout}} › {{ui:Arbeitsbereich}} öffnen und {{ui:CadCraft klassisch}} wählen. Jede Symbolleiste, jede Registerkarte und jeder Bereich geht dorthin zurück, wo er war.

:::note
Auf einem Telefon oder in einem Fenster von 760 Pixel Breite oder schmaler benutzt die App ihr Telefonlayout, egal was Sie gewählt haben. Ein breiteres Fenster bringt Ihr Layout zurück.
:::

Um eine andere Anordnung auszuprobieren, siehe [das Layout mit Menüband und Projektbrowser](common:layout-ribbon).
