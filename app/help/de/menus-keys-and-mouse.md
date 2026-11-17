---
title: Menüs, Tasten und Maus
summary: Wählen Sie einen Menüstil, der zu Ihrer gewohnten Arbeitsweise passt, weisen Sie jedem Befehl eine eigene Taste zu, verschieben Sie Befehle zwischen den Registerkarten des Menübands und legen Sie fest, was das Mausrad und die Maustasten im Plan und in 3D tun.
keywords: Menüstil, Menüs, Menüband, Tiefbau-Menüband, Symbolleiste, Befehlszeile, Klassisches Zeichnen, Tastenkürzel, Hotkeys, Tasten, anpassen, neu belegen, Maus, Rad, Zoomrichtung umkehren, mittlere Taste, rechte Taste, Pan, Orbit, Exportieren, Importieren, Wechseln, vertraut
from: 07ac73a0
---

Die Befehle von CivilCraft funktionieren immer gleich, egal wie Sie sie aufrufen. Ein **Menüstil** legt nur fest, wo sie auf dem Bildschirm stehen, wie sie dort heißen und mit welchen Tasten sie ausgeführt werden, sodass Sie Ihre gewohnten Arbeitsweisen beibehalten können. Wählen Sie einen Stil in {{ui:Einstellungen}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menüs, Tasten und Maus}}; die Änderung wirkt sofort, und dieser Browser merkt sie sich.

## Die drei Stile

| Stil | Was Sie erhalten |
|---|---|
| {{ui:CivilCraft}} | Die eigene Symbolleiste von CivilCraft (Datei, Exportieren, Geländemodell, Entwurf, Bearbeiten, GIS, Ansicht) und Einzeltasten: {{key:A}} Trasse, {{key:G}} Bauplatz, {{key:P}} Rohre, {{key:B}} Bruchkante, {{key:O}} Grenze, {{key:L}} Feature-Linie, {{key:R}} Längsschnitt, {{key:X}} Schnitte, {{key:E}} Gefälle, {{key:D}} 3D, {{key:F}} Einpassen, {{key:V}} Wählen. Der Ausgangsstil. |
| {{ui:Klassisches Zeichnen}} | Ein kleines Menüband ({{ui:Start}}, {{ui:Einfügen}}, {{ui:Ausgabe}}) und eine Befehlszeile, für Personen, die Befehle eintippen: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (Rückgängig), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Schreiben Sie überall los, dann gehen die Buchstaben in die Befehlszeile; {{key:Enter}} führt aus, {{key:Enter}} ohne Eingabe wiederholt den letzten Befehl, {{key:Esc}} löscht sie. Die mittlere Taste verschiebt den Plan (Pan). |
| {{ui:Tiefbau-Menüband}} | Registerkarten mit großen Schaltflächen, so wie Tiefbauprogramme ihre Werkzeuge gruppieren: {{ui:Start}} (Geländedaten, Entwurf erstellen, Längsschnitt- und Schnittansichten), {{ui:Geländemodelle}}, {{ui:Ändern}}, {{ui:Geolokalisierung}}, {{ui:Ansicht}} und {{ui:Ausgabe}}, mit einem Menü {{ui:Datei}} und Schnellschaltflächen rechts. Die Einzeltasten bleiben erhalten. Die mittlere Taste verschiebt den Plan; in 3D verschiebt die mittlere Taste, und {{key:Shift}} mit der mittleren Taste dreht die Ansicht (Orbit). |

Jeder Stil behält die {{key:Mod}}-Tasten bei: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Eine Taste, die zum eigenen Layout von CivilCraft gehört, Ihrem Stil aber einem anderen Befehl zugewiesen hat, tut nichts, und die Statusleiste zeigt, wohin ihr Befehl gewandert ist („In Meine Tasten ist Bauplatz Ctrl+Alt+G“). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} und die Pfeiltasten behalten immer ihre Bedeutung, und während Sie eine Linie zeichnen, behalten ihre Punkte ihre Tasten ({{key:Backspace}}, {{key:Enter}}).
:::

## Eigene Anpassung

1. Wählen Sie den Stil, der Ihren Wünschen am nächsten kommt, und klicken Sie dann auf {{ui:Anpassen…}}.
2. Suchen Sie unter {{ui:Tasten und Menüs}} einen Befehl (das Suchfeld hilft). Klicken Sie auf {{ui:Schlüssel hinzufügen}} und drücken Sie die Taste, oder zwei Tasten nacheinander für ein Zweibuchstaben-Kürzel. Klicken Sie auf eine Taste, um sie zu entfernen.
3. Bei einem Menüband verschiebt {{ui:Wo er steht}} den Befehl in eine andere Registerkarte oder einen anderen Bereich, in das Menü {{ui:Datei}} oder zu {{ui:Nur Tasten}}.
4. Unter {{ui:Maus}} legen Sie das Rad, die Tasten, mit denen der Plan verschoben wird, und die Funktion jeder Taste in der 3D-Ansicht fest.
5. Geben Sie dem Stil einen Namen und klicken Sie auf {{ui:Speichern}}.

Wenn Sie einen eingebauten Stil speichern, entsteht Ihre eigene Kopie („Mein Tiefbau-Menüband“); der eingebaute Stil ändert sich nie. Eine Taste, die zwei Befehlen zugewiesen ist, oder eine, die ausgeführt würde, bevor sich ein Zweibuchstaben-Kürzel eingeben lässt, wird rot angezeigt und muss vor dem Speichern behoben werden.

## Maus

- **Mausrad**: {{ui:Nach oben scrollen vergrößert}} (der Ausgangsstil) oder {{ui:Nach oben scrollen verkleinert}}, sowie wie schnell, im Plan und in 3D. Eine Trackpad-Zoomgeste (Pinch) zoomt immer in die Richtung, in die sich Ihre Finger bewegen.
- **Plan verschieben mit**: der mittleren Taste, der rechten Taste oder beiden. {{key:Space}} und Ziehen verschiebt ebenfalls. Die linke Taste wählt und zeichnet immer.
- **Ziehen in der 3D-Ansicht**: {{ui:Eigene je Ansicht}} behält die Tasten von CivilCraft bei (links drehen, rechts verschieben). Oder stellen Sie jede Taste auf Orbit, Pan, Zoom oder nichts; {{key:Shift}} mit der Taste tauscht Orbit und Pan. Ein Klick ohne Ziehen wählt weiterhin.

## Mitnehmen

{{ui:Exportieren}} speichert den verwendeten Stil als kleine `.ccinput.json`-Datei; {{ui:Importieren…}} fügt eine solche Datei hinzu, etwa von einem anderen Computer oder aus dem Team. Eine importierte Datei kann nur auf Befehle von CivilCraft verweisen: Alles andere wird weggelassen und in der Statusleiste gezählt. {{ui:Diesen Stil löschen}} entfernt einen eigenen Stil.

:::note
Diese Einstellungen bleiben in diesem Browser. {{ui:Diesen Stil in jeder App verwenden}} unter den Stilkarten sorgt dafür, dass jede App im passenden Stil öffnet (mit eigener Symbolleiste, einem Menüband oder Klassischem Zeichnen), mit den Änderungen, die Sie in jeder App vorgenommen haben. CivilCraft hat keinen Menüleisten-Stil: Wird für alle Apps die Menüleiste einer anderen App gewählt, behält CivilCraft seine eigene Symbolleiste.
:::

Siehe auch: [Tastatur und Maus](topic:keyboard) · [Einstellungen von CivilCraft](topic:settings) · [Umstieg von anderer Tiefbau-Software](topic:coming-from)
