---
title: Regenabflüsse, Rohrdimensionen und die hydraulische Drucklinie berechnen
summary: Die Einzugsgebiete zeichnen, die in jedes Bauwerk entwässern, die Abflüsse im Netz mit der Rationalen Methode aufsummieren, die Rohre nach der Gleichung von Manning dimensionieren und feststellen, wo die hydraulische Drucklinie das Rohr vollfüllt oder die Oberfläche erreicht.
keywords: Regenwasserentwässerung, Einzugsgebiet, Entwässerungsfläche, Rationale Methode, Abflussbeiwert, Konzentrationszeit, Regenspende, IDF, Manning, Rohrdimensionierung, hydraulische Drucklinie, HGL, Energielinie, EGL, Überstau, Überflutung, Unterwasser
from: e44872ec
---

Die Regenwasserentwässerung baut auf dem [Rohrnetz](topic:pipe-network) auf: Zeichnen Sie zuerst das Netz, dann die Flächen, die hineinentwässern. Alles erscheint unter **Regenwasserentwässerung** im rechten Bereich, wenn nichts ausgewählt ist.

## Ein Einzugsgebiet zeichnen

1. Klicken Sie unter **Regenwasserentwässerung** auf **Einzugsgebiet zeichnen**.
2. Klicken Sie die Eckpunkte der Fläche an, die in ein Bauwerk entwässert. {{key:Enter}} oder ein Doppelklick beendet, {{key:Backspace}} nimmt den letzten Eckpunkt zurück, {{key:Esc}} bricht ab.
3. Das Einzugsgebiet entwässert in ein Bauwerk innerhalb der Fläche, andernfalls in das nächstgelegene. Seine **Eigenschaften** öffnen sich: Legen Sie den Namen, den **Abflussbeiwert C** (den Anteil des Regens, der abfließt, 0 bis 1), die **Konzentrationszeit** in Minuten und das Bauwerk fest, in das es **entwässert**.

**Weiteres Einzugsgebiet zeichnen** in dessen Eigenschaften beginnt das nächste. Klicken Sie im Plan in ein Einzugsgebiet, um es auszuwählen; {{key:Delete}} entfernt es. Jede Änderung ist ein Schritt: {{key:Mod+Z}} macht sie rückgängig.

## Den Bemessungsregen festlegen

Die Regenspende ist i = a ÷ (tc + b) hoch c, in Zoll pro Stunde bei einem Projekt in Fuß und in Millimeter pro Stunde bei einem Projekt in Metern. Passen Sie **Intensität a**, **b** und **c** an Ihre eigene Intensitäts-Dauer-Häufigkeits-Kurve für die Wiederkehrperiode an, für die Sie planen.

:::warning
Die anfängliche Intensitätskurve, Manning-n (0,013) und der Knotenverlust (0,5) sind Platzhalter, keine Norm. Legen Sie sie anhand Ihrer eigenen Niederschlagsdaten und Planungskriterien fest.
:::

- **Kürzeste Konzentrationszeit**: Kein Rohr wird mit einer kürzeren Zeit berechnet (zum Start 10 Minuten).
- **Manning-n**: die Rauheit der Rohre.
- **Knotenverlust**: der Druckverlust in jedem Bauwerk als Anteil der Geschwindigkeitshöhe V²/2g des abgehenden Rohrs.
- **Wasserstand am Auslass**: das Unterwasser, in dem das letzte Rohr mündet. Lassen Sie das Feld leer, wenn der Auslass frei abfließt.

## Wie sich die Abflüsse summieren

Jedes Rohr führt alle Einzugsgebiete oberhalb von ihm. Q = C × i × A, wobei C × A entlang des Netzes aufsummiert wird und i die Intensität bei der längsten Konzentrationszeit des ankommenden Wassers ist: die eigene Zeit des Einzugsgebiets oder die Zeit aus einem oberliegenden Einzugsgebiet plus die Fließzeit durch die Rohre (Länge ÷ Geschwindigkeit bei Vollfüllung). Q wird in Kubikfuß pro Sekunde angegeben (A in Acres) oder in Kubikmeter pro Sekunde (A in Hektar).

## Rohre dimensionieren

Die Tabelle unter **Abflüsse und Drucklinien** zeigt für jedes Rohr den Abfluss, was es bei Vollfüllung mit seinem Gefälle führt, die Geschwindigkeit, die hydraulische Drucklinie an seinem Anfang und Ende sowie die Fließtiefe.

**Rohre für diese Abflüsse dimensionieren** gibt jedem Rohr die kleinste Normnennweite, die seinen Abfluss bei seinem eigenen Gefälle führt (12 bis 72 in oder 300 bis 1800 mm). Es ist ein Schritt. Die Sohlen bleiben, wo sie sind: Ändern sich die Nennweiten, verwenden Sie **Jede Sohle nach den Regeln festlegen**, um die Überdeckung beizubehalten, und prüfen Sie danach die Tabelle erneut.

## Die Drucklinien lesen

Die hydraulische Drucklinie (HGL) wird vom Auslass aus flussaufwärts berechnet:

- Ein teilweise gefülltes Rohr hat seine HGL an der Wasseroberfläche: Sohle plus Normaltiefe.
- Liegt das Wasser darunter höher als der Scheitel oder führt das Rohr mehr, als es bei Vollfüllung kann, ist es vollgefüllt (überstaut), und seine HGL steigt um das Reibungsgefälle über seine Länge.
- An jedem Bauwerk ist die HGL die obere HGL des abgehenden Rohrs plus Knotenverlust.
- Die Energielinie (EGL) ist die HGL plus Geschwindigkeitshöhe.

Ein vollgefülltes Rohr wird aufgelistet, ebenso jedes Bauwerk, dessen HGL über dem Deckel liegt: Dort tritt Wasser an die Oberfläche, und das Bauwerk wird im Plan rot umrandet. Wählen Sie ein Rohr oder ein Bauwerk aus, um in seinen Eigenschaften Abfluss, Tiefe, Geschwindigkeit und beide Drucklinien zu sehen.

## Einen Regen durchrechnen

Die Rationale Methode ergibt einen Spitzenwert für jedes Rohr. **Regenereignis berechnen** (unter den Ergebnissen, in den Eigenschaften des Netzes) berechnet stattdessen den gesamten Regen: den Abfluss jedes Einzugsgebiets über die Zeit, weitergeleitet durch die Rohre mit ihrer Fließzeit und ihrem Speicher und dort addiert, wo sie zusammentreffen.

1. Lassen Sie **Regendauer** und **Regenspende** leer, um die längste Konzentrationszeit und die oben beschriebene Regenkurve zu verwenden, oder geben Sie Ihre eigenen Werte ein.
2. Drücken Sie **Regenereignis berechnen**. Die Tabelle listet für jedes Rohr den höchsten Zu- und Abfluss, wie viel niedriger der abgehende Spitzenwert ist, welcher Anteil der Vollfüllkapazität des Rohrs genutzt wird und zu welcher Minute der Spitzenwert auftritt.
3. Jeder Auslass erhält ein kleines Diagramm des Abflusses über die Zeit und **Ganglinie herunterladen (CSV)**.

Ein Einzugsgebiet gibt den über seine Konzentrationszeit gemittelten Regen ab, sodass ein Regen, der kürzer ist als diese Zeit, einen niedrigeren Spitzenwert erzeugt als C × i × A. Jedes Rohr wird mit der Methode Muskingum–Cunge berechnet, und zwar mit der Fließtiefe, die die Rationale Methode bereits ermittelt hat. Zwei Zweige mit unterschiedlichen Konzentrationszeiten erreichen ihre Spitzen nicht gleichzeitig, daher ist ihre Summe niedriger als die Summe ihrer Spitzenwerte.

Überstau, Rückstau, Speicherung in Bauwerken und Überflutung werden damit nicht modelliert. Ein Rohr, dessen berechneter Spitzenwert über seiner Vollfüllkapazität liegt, wird aufgelistet, und sein Wasser wird weitergegeben, als ob es hineinpasste. Verwenden Sie dies, um Zeitverlauf und Abflussdämpfung zu sehen, nicht um ein Rohr zu dimensionieren. Es ist ein Rechenhilfsmittel: Ein Ingenieur prüft das Ergebnis.

## Mit dem Projekt gespeichert

Einzugsgebiete und die Regeneinstellungen werden in der Projektdatei gespeichert. Sie sind noch nicht in der PDF-Ausgabe, im DWG oder DXF oder in LandXML enthalten: siehe [Noch nicht umgesetzt](topic:not-built-yet).
