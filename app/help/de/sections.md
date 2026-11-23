---
title: Schnittlinien und Querprofile
summary: Querprofile rechtwinklig zu einer Trasse schneiden, das Gelände, die Planung sowie Abtrag und Auftrag an jeder Station ansehen und Volumen nach der Methode der mittleren Endflächen erhalten.
keywords: Massenförderdiagramm, Massenlinie, Ausgleichspunkt, Schwund, Auflockerung, Förderweite, Entnahme, Deponie, Querprofilblätter, Querprofile PDF, Querprofile, Schnittlinien, Querprofilansicht, Abtrag, Auftrag, Flächen, mittlere Endflächen, Erdmassen, Station, Versatz, CSV
from: 09639ce2
---

Ein Querprofil zeigt die Straße so, wie sie gebaut wird: quer zur Trasse an einer Station, das bestehende Gelände, die Planung (der Korridor oder Bauplatz, modelliert) und den Abtrag und Auftrag dazwischen.

## Schnittlinien hinzufügen

1. Wählen Sie eine Trasse. Klicken Sie in den **Eigenschaften** unter **Schnittlinien** auf {{ui:Schnittlinien hinzufügen}}.
2. Setzen Sie **Abstand** (der Abstand: zum Start 50 ft oder 20 m), **Breite links** und **Breite rechts** (wie weit jedes Querprofil von der Achse reicht).
3. Um an einer bestimmten Station zu schneiden, geben Sie sie in **Station hinzufügen** ein (zum Beispiel `2+35`) und drücken Sie {{key:Enter}}.

Querprofile werden bei jedem ganzen Vielfachen des Abstands, an beiden Enden der Trasse, am Anfang und am Ende jeder Kurve (PC und PT) und an den Stationen, die Sie hinzufügen, geschnitten. Die Schnittlinien erscheinen im Plan als graue Linien quer zur Trasse; sie gehen auch in DXF, DWG und PDF auf den Layer C-ROAD-SCTN. Jede Änderung ist ein Schritt: {{key:Mod+Z}} macht sie rückgängig.

## Die Querprofilansicht

Öffnen Sie sie mit {{ui:Querprofilansicht}} in den **Eigenschaften** der Trasse, mit {{ui:Querprofile}} unter **Geländemodell** › {{ui:Mehr}} oder mit {{key:X}}. Sie nimmt den Platz der Längsschnittansicht unter dem Plan ein.

- Blättern Sie mit den Pfeilen in ihrer Leiste, in der Stationsliste oder mit {{key:Left}} und {{key:Right}}, wenn die Querprofilansicht den Fokus hat ({{key:Home}} und {{key:End}} für das erste und das letzte).
- Die graue Linie ist das bestehende Gelände, die rote Linie die Planung. Abtrag ist orange, Auftrag grün schattiert. Korridorpunkte sind markiert: CL (Achse), EOP (Fahrbahnkante), SH (Bankett) und DL (Böschungslinie).
- Die Kopfzeile nennt die Station, die Abtrags- und Auftragsflächen dieses Querprofils und die vertikale Überhöhung. **Einpassen** füllt das Feld; wählen Sie 1×, um das Querprofil im wahren Maßstab zu sehen.
- Die dicke Linie im Plan zeigt, welches Querprofil auf dem Bildschirm ist.
- **Zoomen und verschieben:** Das Rad zoomt um den Zeiger, und Ziehen verschiebt die Ansicht. {{ui:Einpassen}} (oder {{key:F}}, oder ein Doppelklick) passt das ganze Querprofil wieder ein.

## Im Querprofil messen

1. Klicken Sie in der Querprofilleiste auf {{ui:Messen}} oder drücken Sie {{key:M}}. Der Hinweis sagt: „Ersten Punkt anklicken, dann zweiten.“
2. Klicken Sie zwei Punkte an. Jeder rastet am Ende einer Linie oder an einem Korridorpunkt (CL, EOP, SH, DL) ein; halten Sie {{key:Alt}} für einen freien Punkt.
3. Die Anzeige gibt die horizontale Strecke (ΔH), den vertikalen Abstand (ΔV), die Neigung in Prozent mit ihrem Verhältnis und die gerade Länge, in den Projekteinheiten.

Klicken Sie erneut, um eine neue Messung zu beginnen. {{key:Esc}} löscht sie, und {{key:M}} schaltet Messen aus.

## Querprofilblätter

{{ui:Querprofilblätter (PDF)}} unter **Schnittlinien** legt jedes Querprofil auf PDF-Seiten, in Reihen von links nach rechts und von oben nach unten in Stationsreihenfolge. Wählen Sie das **Papier**, den **Planmaßstab** (den horizontalen Maßstab der Querprofile) und die **Profilüberhöhung** (1×, 2×, 5× oder 10×); der Dialog sagt, wie viele Querprofile auf eine Seite passen und wie viele Seiten das ergibt.

Jedes Querprofil zeigt ein Raster mit Versätzen und Höhen, das Gelände (gestrichelt), die Planung, Abtrag und Auftrag (orange und grün schattiert), die Korridorpunkte und darunter seine Station sowie seine Abtrags- und Auftragsflächen. Alle Querprofile auf den Blättern werden gleich groß gezeichnet, hoch genug für das größte. Passt das bei Ihrer Überhöhung nicht auf die Seite, verwendet CivilCraft das größte, das passt, und sagt es. Der Titelstreifen nennt die Trasse, die Stationen auf dieser Seite, die Maßstäbe und „Blatt 1 von 3“.

## Worauf Abtrag und Auftrag gemessen werden

Ein Korridor kann Schichten unter der Fahrbahn haben: Fahrbahnschichten, Komponenten einer Vorlage, Gleis. Die Auswahl **Volumen gemessen bis** in der Querprofilleiste bestimmt, bis wohin Abtrag und Auftrag reichen:

- **Untere Fläche** (der Start): bis zur Unterseite dieser Komponenten, sodass der Abtrag die Tiefe des Fahrbahnaufbaus einschließt.
- **Obere Fläche**: nur bis zur Oberkante der Planung, wie früher, bevor Komponenten mitgezählt wurden.

Die Flächen in der Kopfzeile, die Volumen darunter, die CSV und die Massenförderung folgen dieser Wahl, und sie wird mit dem Projekt gespeichert.

## Volumen nach mittleren Endflächen

Zwischen zwei benachbarten Querprofilen ist das Volumen der Mittelwert ihrer beiden Flächen mal dem Abstand ihrer Stationen. Die Leiste zeigt die Summen für die Trasse, und {{ui:CSV}} lädt die Flächen und Volumen jedes Querprofils mit laufenden Summen (Kubikyards bei Fuß-Projekten, Kubikmeter bei metrischen).

**Eigenschaften** zeigt dieselben Summen neben den Volumen nach dem Rasterverfahren aus [Erdmassen](topic:volumes). Die beiden sind verschiedene Näherungen: Engere Querprofile bringen sie näher zusammen, und auf einer geraden Straße in flachem Gelände sind sie gleich.

:::note
Abtrag und Auftrag werden nur innerhalb der modellierten Bereiche (die Böschungslinien eines Korridors oder Bauplatzes) gezählt, wie beim Rasterverfahren. Ohne Korridor oder Bauplatz ist die Planung das Gelände, sodass ein Querprofil keinen Abtrag oder Auftrag zeigt.
:::

## Massenförderung

**Massenförderung** unter **Schnittlinien** zeichnet das Massenförderdiagramm aus denselben Endflächen-Volumen: entlang der Stationen die laufende Summe von Abtrag minus Auftrag.

- **Schwund (−) oder Auflockerung (+) des Abtrags** gibt an, was ein Kubikyard Abtrag ergibt, sobald er als Auftrag eingebaut ist: −10 % (der Startwert, ein Platzhalter) bedeutet, dass er auf 0.9 schrumpft; Fels, der aufquillt, könnte +5 % haben. Verwenden Sie den Wert aus Ihrem Baugrundgutachten.
- Wo die Linie steigt, liegt die Straße im Abtrag; wo sie fällt, im Auftrag. Über null (orange schattiert) bewegt sich Erde in Stationsrichtung aufwärts; unter null (grün) abwärts.
- **Ausgleichspunkte** sind dort, wo die Linie null schneidet: Zwischen zwei davon gleichen sich Abtrag und Auftrag aus. Die Tabelle listet jeden ausgeglichenen Abschnitt, das bewegte Volumen (sein höchster oder tiefster Punkt) und die mittlere Förderweite (die schattierte Fläche geteilt durch dieses Volumen).
- Endet die Linie nicht auf null, ist der Rest **Deponie** (oben) oder **Entnahme** (unten). Auf diesem letzten Abschnitt zählt nur die Erde jenseits des Niveaus, auf dem sie endet, als bewegt.

**CSV** speichert die Massenordinate an jedem Querprofil, die Abschnitte und den Faktor.
