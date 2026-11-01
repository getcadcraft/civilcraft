---
title: Im Layout mit Menüband und Projektbrowser arbeiten
summary: Die App auf ein Menüband aus Registerkarten über der Zeichnung umstellen, mit Eigenschaften und einem Projektbrowser links und einem Reiter für jede geöffnete Ansicht, und jederzeit zum klassischen Layout zurückwechseln.
keywords: Layout, Arbeitsbereich, Menüband, Registerkarten des Menübands, Projektbrowser, Browser, Paletten, Eigenschaftenpalette, Ansichtsreiter, Statusleiste, Schnellzugriff, Menüband einklappen, Menüband minimieren, Menüband-Fenster, klassisches Layout, Layout wechseln, Layout umschalten, angedockt
from: c1a6eccc
---

**Menüband und Projektbrowser** ist eines der drei Arbeitsbereichslayouts der App. Ein Menüband aus Registerkarten läuft oben quer, Eigenschaften und ein Projektbrowser teilen sich den linken Bereich, jede geöffnete Ansicht bekommt einen Reiter über der Zeichnung, und unten sitzt eine Statusleiste. Die Werkzeuge sind die der App: Alles, was Sie im klassischen Layout tun können, geht auch hier, und Ihre Zeichnung, Ihr Menüstil und Ihre Tasten bleiben, wie sie sind.

## Auswählen

1. {{ui:Einstellungen}} öffnen (das Zahnrad oder {{key:Mod+,}}).
2. Die Registerkarte {{ui:Global}} wählen und dann zu {{ui:Layout}} › {{ui:Arbeitsbereich}} gehen.
3. {{ui:Menüband und Projektbrowser}} wählen.

Das Layout ändert sich sofort. Die Wahl gilt für jede App in diesem Browser: Jede App öffnet sich von da an darin, und es steht bereit, bevor die Seite zeichnet, Sie sehen also nie zuerst das klassische Layout.

## Was wo ist

- **Titelleiste:** der Name der App, Schnellzugriffsschaltflächen (Öffnen, Speichern, Rückgängig, Wiederholen), der Name der geöffneten Datei, {{ui:Was jedes Werkzeug hier tut}} (eine Liste aller Werkzeuge mit Suchfeld, die sagt, welche jetzt bereit sind und warum die anderen es nicht sind), Vollbild, {{ui:Hilfe}} und {{ui:Einstellungen}}. In diesem Layout ersetzt die Titelleiste die App-Leiste.
- **Menüband:** die Werkzeuge der App in Registerkarten, jede Registerkarte in Gruppen. {{ui:Datei}} ganz links öffnet, speichert und so weiter. Manche Apps fügen eine eigene Registerkarte hinzu, solange Sie in einem bestimmten Modus oder Arbeitsbereich arbeiten. Sie leuchtet, solange sie gilt, und verschwindet danach.
- **Optionsleiste:** unter dem Menüband, was das laufende Werkzeug von Ihnen braucht oder was gewählt ist.
- **Linker Bereich:** {{ui:Eigenschaften}} oben und darunter die Paletten (der Projektbrowser und der eigene Inhalt des Bereichs) als Reiter. Die Linie dazwischen ziehen, um den Platz aufzuteilen.
- **Ansichtsreiter:** ein Reiter pro geöffneter Ansicht (ein Blatt, ein Grundriss, eine Szene …). Mit seiner Schaltfläche zum Schließen schließen Sie einen. Die Datei bleibt geöffnet.
- **Ansichtsleiste und Statusleiste:** unter der Zeichnung die eigenen Bedienelemente der Ansicht (Maßstab, Zoom), unten die Meldungen der App.

Ein Werkzeug, das gerade nicht laufen kann, ist grau, und sein Tooltip sagt warum (zum Beispiel „Zuerst eine Datei öffnen“ oder dass die App dieses Werkzeug noch nicht hat). Klicken Sie es an oder drücken Sie {{key:Enter}} darauf, um den Grund in einem Feld zu lesen.

## Das Menüband mit der Tastatur benutzen

Bei fokussierter Registerkarte des Menübands wechseln {{key:Left}} und {{key:Right}} zwischen den Registerkarten, und {{key:Home}} und {{key:End}} gehen zur ersten und zur letzten. {{key:Esc}} beendet zuerst das laufende Werkzeug, wie im klassischen Layout, und jedes Tastenkürzel sowie {{key:Ctrl+Shift+F}} (Bildschirmmodi) funktionieren wie zuvor.

## Das Menüband einklappen oder in ein eigenes Fenster setzen

- Eine Registerkarte des Menübands doppelklicken, um das Menüband auf seine Registerkarten einzuklappen. Ein Klick auf eine Registerkarte zeigt dann ihre Werkzeuge, bis Sie weitergehen. Erneut doppelklicken, um es geöffnet zu halten. Die Schaltfläche {{ui:Menüband verschieben}} am rechten Ende des Menübands hat auch {{ui:Menüband einklappen}} und {{ui:Menüband geöffnet halten}}. Jede App merkt es sich.
- {{ui:Menüband verschieben}} › {{ui:In ein neues Fenster verschieben}} setzt das Menüband in ein eigenes Fenster, zum Beispiel auf einen zweiten Monitor. Dort gedrückte Tasten erreichen die App. {{ui:Menüband zurücksetzen}} oder das Schließen dieses Fensters bringt es zurück.

Die Einstellungen der Symbolleiste gelten für das Menüband: {{ui:Einstellungen}} › {{ui:Global}} › {{ui:Symbolleiste}} › {{ui:Symbole und Beschriftungen}}, {{ui:Nur Symbole}} (das Menüband zeigt dann zwei Reihen kleiner Symbole pro Gruppe) oder {{ui:Nur Beschriftungen}}, und {{ui:Gruppennamen anzeigen (Datei, Zeichnen, …)}}.

## Ihre Bereiche bleiben Ihre

Der linke und der rechte Bereich behalten alles, was unter [Bereiche anordnen](common:arrange-panels) beschrieben ist: andocken, schweben lassen, anheften, ausblenden, Reiter, {{ui:In ein neues Fenster verschieben}} und {{ui:Layout zurücksetzen}}.

## Zum klassischen Layout zurückkehren

{{ui:Einstellungen}} › {{ui:Global}} › {{ui:Layout}} › {{ui:Arbeitsbereich}} öffnen und {{ui:CadCraft klassisch}} wählen. Jede Symbolleiste, jede Registerkarte und jeder Bereich geht dorthin zurück, wo er war.

:::note
Auf einem Telefon oder in einem Fenster von 760 Pixel Breite oder schmaler benutzt die App ihr Telefonlayout, egal was Sie gewählt haben. Ein breiteres Fenster bringt Ihr Layout zurück.
:::

Um eine andere Anordnung auszuprobieren, siehe [das Layout mit Werkzeugpalette und Infofeld](common:layout-toolbox).
