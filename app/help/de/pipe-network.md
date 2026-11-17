---
title: Ein Freispiegel-Rohrnetz anlegen
summary: Regenwasser- oder Schmutzwasserleitungen Bauwerk für Bauwerk zeichnen, Ihr Gefälle, Ihre Überdeckung und Absturzregeln festlegen, CivilCraft die Sohlen setzen lassen und die gemeldeten Probleme beheben.
keywords: Bauwerkserstellung, Bauwerkstyp, rechteckiges Bauwerk, Straßenablauf, Rahmen, Überdeckung, Wandstärke, Bibliothekselement, Rohrnetz, Regenwasser, Schmutzwasser, Kanal, Bauwerke, Schächte, Einläufe, Sohlen, Gefälle, Absturz, Deckelhöhe, Sumpf, Freispiegelrohre
from: 10a3c14d
---

Ein Projekt enthält ein Freispiegel-Rohrnetz, Regenwasser oder Schmutzwasser. Es besteht aus Bauwerken (Schächte, Einläufe) und geraden Rohren zwischen ihnen. Der Abfluss läuft in die Richtung, in der Sie zeichnen. CivilCraft prüft jedes Rohr und jedes Bauwerk anhand von drei Regeln, die Sie festlegen, und kann alle Sohlen aus diesen Regeln setzen.

## Eine Strecke zeichnen

Sie können Rohre ohne Geländemodell zeichnen, aber Deckelhöhen, Überdeckung und automatische Sohlen brauchen eins.

1. Drücken Sie {{key:P}} oder klicken Sie in der Gruppe **Entwurf** auf {{ui:Rohre}}. Der Hinweis lautet: „Rohre: Bauwerke vom Anfang der Strecke nach unten anklicken (ein bestehendes anklicken, um anzuschließen). Enter beendet.“
2. Klicken Sie an die Stelle, an der das stromaufwärts gelegene Bauwerk liegt. Ein Bauwerk wird gesetzt.
3. Klicken Sie jedes nächste Bauwerk stromabwärts an. Um an ein bestehendes Bauwerk anzuschließen, klicken Sie darauf: Die Statusleiste zeigt „S3 angeschlossen.“
4. Drücken Sie {{key:Enter}}. Die Rohre werden gezeichnet, ihre Sohlen nach den Regeln gesetzt, und die Statusleiste meldet zum Beispiel „3 Rohre gezeichnet, 12 Sohlen nach den Regeln gesetzt; alle Prüfungen bestanden.“

Neue Bauwerke heißen S1, S2 … mit einem Durchmesser von 48 in (1200 mm). Neue Rohre heißen P1, P2 … mit einem Durchmesser von 12 in (300 mm). Durchmesser stehen in Zoll bei einem Projekt in Fuß und in Millimetern bei einem Projekt in Metern.

Beenden Sie mit {{key:Enter}}. Ein Doppelklick funktioniert auch, aber wenn Sie auf ein bestehendes Bauwerk doppelklicken, um die Strecke dort zu beenden, wird der Anschluss verworfen: Klicken Sie einmal darauf und drücken Sie dann {{key:Enter}}.

## Regeln festlegen

Ohne Auswahl enthält der rechte Bereich (**Projekt**) einen Block **Rohrnetz**:

| Einstellung | Startwert | Bedeutung |
|---|---|---|
| Typ | Regenwasser | {{ui:Regenwasser}} oder {{ui:Schmutzwasser}}; wird in LandXML geschrieben |
| Mindestgefälle | 0.50% | Jedes Rohr muss mindestens so stark fallen |
| Mindestüberdeckung | 2 ft (0.6 m) | Vom Gelände bis zum Rohrscheitel, auf der ganzen Länge des Rohrs |
| Absturz in Bauwerken | 0.10 ft (0.03 m) | Die Sohle des Auslaufs muss mindestens so weit unter jeder Einlaufsohle liegen |

**Diese Startwerte sind Platzhalter, keine Norm.** Setzen Sie die Werte, die Ihre Behörde oder Ihr Projekt verlangt. Die Überdeckung wird vom Gelände bis zum Scheitel gemessen (Sohle plus lichter Durchmesser); die Wandstärke zählt nicht mit. Wo Bauplätze oder Korridore modelliert sind, gilt das modellierte Gelände als Gelände.

## CivilCraft die Sohlen setzen lassen

- {{ui:Jede Sohle nach den Regeln festlegen}} (im Block **Rohrnetz**) setzt alle Rohre.
- {{ui:Seine Sohlen nach den Regeln festlegen}} (bei einem ausgewählten Rohr) setzt nur dieses Rohr.

Stromabwärts arbeitend beginnt jede Strecke mit mindestens der Überdeckung an ihrem oberen Bauwerk, fällt mindestens um das Mindestgefälle, verliert mindestens den Absturz durch jedes Bauwerk und liegt tiefer, wo das Gelände entlang des Rohrs weniger als die Mindestüberdeckung ließe. Sohlen werden auf 0.01 abgerundet, nie aufgerundet. Die Statusleiste meldet „Sohlen gesetzt: Mindestüberdeckung am oberen Ende jeder Strecke, mindestens das Mindestgefälle, mindestens der Absturz in jedem Bauwerk.“ oder nennt, was nicht möglich war.

## Bauwerke und Rohre bearbeiten

Klicken Sie ein Bauwerk oder Rohr mit {{ui:Wählen}} an, um es im rechten Bereich zu sehen.

**Bauwerk**: **Name**, **Deckelhöhe**, **Sumpftiefe**, **Durchmesser**, dann **Verwendete Deckelhöhe**, **Sumpf**, **Rechtswert** und **Hochwert**, sowie die ein- und ausgehenden Rohre mit ihren Sohlen.

- Lassen Sie **Deckelhöhe** leer, um sie aus dem Gelände zu übernehmen; das Feld zeigt dann den Geländewert in Grau. Geben Sie einen Wert ein, um die Deckelhöhe festzulegen.
- Ziehen Sie den Griff des Bauwerks auf dem Plan, um es zu verschieben. Seine Rohre folgen; ihre Sohlen bleiben, wie sie waren, daher prüfen Sie die Probleme danach.

**Typ**: wählen Sie einen Bauwerkstyp des Netzes (unten) oder keinen für ein rundes Bauwerk mit eigenem Durchmesser.

**Rohr**: **Name**, die Bauwerke, zwischen denen es verläuft, **Durchmesser**, **Obere Sohle**, **Untere Sohle**, dann **Länge**, **Gefälle** und **Mindestüberdeckung**.

Drücken Sie nach jedem Wert {{key:Enter}}.

## Probleme lesen und beheben

Der Block **Rohrnetz** listet jedes Problem auf (bis zu 40); klicken Sie eines an, um das Rohr oder Bauwerk auszuwählen. Ein ausgewähltes Rohr oder Bauwerk listet seine eigenen Probleme. Ohne Auswahl heißt es: „Alle Rohre und Bauwerke bestehen die Regeln.“

| Meldung (Beispiele) | Was zu tun ist |
|---|---|
| „P2 läuft bergauf (-0.40%).“ oder „… läuft flach …“ | Tauschen Sie die Sohlen, oder setzen Sie sie nach den Regeln. |
| „P2 mit 0.30% ist flacher als das Mindestgefälle von 0.50%.“ | Senken Sie die untere Sohle oder heben Sie die obere an. |
| „P3 hat 1.40 Überdeckung 35 entlang seiner Länge, weniger als das Minimum 2.“ | Senken Sie das Rohr; setzen Sie seine Sohlen nach den Regeln. |
| „In S3 verlässt P4 mit 245.20, weniger als 0.1 unter P3, die mit 245.25 ankommt.“ | Senken Sie die obere Sohle des Auslaufrohrs. |
| „Der Scheitel von P1 liegt über der Deckelhöhe von S1.“ | Das Rohr ist für das Bauwerk zu hoch. |
| „S2 hat 2 abgehende Rohre; ein Freispiegelnetz sollte aus jedem Bauwerk einen Ausgang haben.“ | Entfernen Sie ein abgehendes Rohr, oder zeichnen Sie es in die richtige Richtung neu. |
| „Die Rohre bilden eine Schleife; der Abfluss muss an einem Auslauf enden.“ | Eine Strecke wurde in sich selbst zurückgezeichnet; löschen Sie ein Rohr. |
| „S5 liegt außerhalb der Oberfläche und hat keine Deckelhöhe.“ | Geben Sie eine Deckelhöhe ein, oder verschieben Sie das Bauwerk auf die Oberfläche. |
| „P6 verläuft teilweise außerhalb der Oberfläche; die Überdeckung dort ist unbekannt.“ | Erweitern Sie das Geländemodell, oder akzeptieren Sie, dass die Überdeckung dort nicht geprüft wird. |
| „P7 hat noch keine Sohlen.“ | Geben Sie sie ein, oder setzen Sie sie nach den Regeln. |

Problemrohre und Problembauwerke sind auch auf dem Plan rot markiert.

## Bauwerkstypen

Ein Bauwerkstyp ist ein Bauwerk, das aus seinen Parametern aufgebaut ist: ein Schacht, Einlauf, Kontrollschacht oder Auslauf, **rund** (lichter Durchmesser) oder **rechteckig** (lichte Breite und Länge), mit seiner **Wandstärke**, **Bodenplatte**, einem **Sumpf** unter dem tiefsten Rohr und einem **Rahmen und Deckel** (rund oder rechteckig, Rahmenhöhe). Typen gehören zum Netz, unter **Bauwerkstypen** in den Eigenschaften des Projekts.

1. Klicken Sie auf {{ui:Neuer Bauwerkstyp}}. Das Dialogfeld zeichnet das Bauwerk im Plan und im Schnitt, während Sie tippen.
2. Klicken Sie auf {{ui:Den Typ hinzufügen}}.
3. Wählen Sie ein Bauwerk und wählen Sie den Typ unter **Typ**. Es übernimmt die Größe und den Sumpf des Typs; sein eigener Sumpf kann weiterhin geändert werden.

Bearbeiten Sie einen Typ, folgt jedes Bauwerk dieses Typs seinen Maßen. Entfernen Sie einen Typ, bleiben seine Bauwerke als runde Bauwerke mit derselben Breite bestehen. Jede Änderung ist ein Schritt: {{key:Mod+Z}} macht sie rückgängig.

Ein rechteckiges Bauwerk wird im Plan, in DXF, DWG und PDF gezeichnet und in 3D als Rechteck mit seiner Länge entlang seines Auslaufrohrs; Rohre beginnen an seiner Wand. LandXML schreibt es als rechteckiges Bauwerk (`RectStruct`) mit seiner Wandstärke und liest solche Bauwerke als Typen zurück.

### Einen Typ über die Bibliothek teilen

{{ui:Als Bibliothekselement speichern}} schreibt den Typ als CadCraft-Bibliothekselement (eine `.json`-Datei): sein Plansymbol, einen 3D-Körper bis zu einer üblichen Tiefe und alle Maße. Laden Sie es in die Bibliothek hoch, um es zu teilen. {{ui:Ein Bibliothekselement öffnen}} liest so gespeicherte Bauwerke zurück in das Netz, umgerechnet in die Einheiten des Projekts. Bibliothekselemente, die keine in CivilCraft erstellten Bauwerke sind, werden mit dem Grund abgelehnt.

## Löschen

Wählen Sie ein Rohr und drücken Sie {{key:Delete}}, um es zu entfernen. Das Löschen eines Bauwerks entfernt auch die daran angeschlossenen Rohre. Auf einem Mac drücken Sie Fn und Delete, oder klicken Sie auf {{ui:Löschen}}.

## Noch nicht umgesetzt

Abflüsse, Rohrdimensionen und die Drucklinie stehen in [Regenwasserentwässerung](topic:storm-drainage). Rohrkataloge, nicht runde Rohre, Rohre in der Längsschnittansicht, gekrümmte Rohre und mehr als ein Netz je Projekt sind noch nicht verfügbar. Siehe [Noch nicht umgesetzt](topic:not-built-yet).
