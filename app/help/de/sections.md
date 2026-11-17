---
title: Schnittlinien und Querprofile
summary: Querprofile rechtwinklig zu einer Trasse schneiden, das Gelände, den Entwurf sowie den Ab- und Auftrag an jeder Station sehen und Volumen nach der Methode der mittleren Querschnittsflächen erhalten.
keywords: Massenlinie, Massendiagramm, Ausgleichspunkt, Schwund, Quellung, Transportweite, Entnahme, Deponie, Querprofilblätter, Querprofile PDF, Querprofile, Schnittlinien, Querprofilansicht, Abtrag, Auftrag, Flächen, Methode der mittleren Querschnittsflächen, Erdmassen, Erdarbeiten, Station, Abstand, CSV
from: 5060173c
---

Ein Querprofil zeigt die Straße so, wie sie gebaut wird: quer zur Trasse an einer Station das bestehende Gelände, den Entwurf (der Korridor oder das Plateau, eingeplant) und den Ab- und Auftrag dazwischen.

## Schnittlinien hinzufügen

1. Eine Trasse wählen. Klicken Sie in den **Eigenschaften** unter **Schnittlinien** auf {{ui:Add sample lines}}.
2. **Abstand** (der Rhythmus: zum Start 50 ft oder 20 m), **Breite links** und **Breite rechts** festlegen (wie weit jedes Querprofil von der Achse reicht).
3. Um an einer bestimmten Station zu schneiden, diese in **Station hinzufügen** eingeben (zum Beispiel `2+35`) und {{key:Enter}} drücken.

Querprofile werden an jedem ganzzahligen Vielfachen des Abstands geschnitten, an beiden Enden der Trasse, am Anfang und Ende jedes Bogens (PC und PT) und an den Stationen, die Sie hinzufügen. Die Schnittlinien erscheinen im Lageplan als graue Linien quer zur Trasse; sie gehen auch in DXF, DWG und PDF auf die Ebene C-ROAD-SCTN. Jede Änderung ist ein Schritt: {{key:Mod+Z}} macht sie rückgängig.

## Die Querprofilansicht

Öffnen Sie sie mit {{ui:Section view}} in den **Eigenschaften** der Trasse, mit {{ui:Sections}} unter **Oberfläche** › {{ui:More}} oder mit {{key:X}}. Sie ersetzt die Längsschnittansicht unter dem Lageplan.

- Blättern Sie mit den Pfeilen in ihrer Leiste, der Stationsliste oder mit {{key:Left}} und {{key:Right}}, wenn die Querprofilansicht den Fokus hat ({{key:Home}} und {{key:End}} für das erste und letzte).
- Die graue Linie ist das bestehende Gelände, die rote Linie der Entwurf. Der Abtrag ist orange, der Auftrag grün eingefärbt. Korridorpunkte sind markiert: CL (Achse), EOP (Fahrbahnrand), SH (Bankett) und DL (Böschungsschnittpunkt).
- Die Kopfzeile nennt die Station, die Ab- und Auftragsflächen dieses Querprofils und die Höhenüberhöhung. **Einpassen** füllt das Feld; wählen Sie 1×, um das Querprofil maßstabsgetreu zu sehen.
- Die dicke Linie im Lageplan zeigt, welches Querprofil gerade auf dem Bildschirm ist.

## Querprofilblätter

{{ui:Section sheets (PDF)}} unter **Schnittlinien** legt jedes Querprofil auf PDF-Seiten, in Reihen von links nach rechts und von oben nach unten in Stationsreihenfolge. Wählen Sie das **Papier**, den **Planmaßstab** (den waagerechten Maßstab der Querprofile) und die **Längsüberhöhung** (1×, 2×, 5× oder 10×). Der Dialog sagt, wie viele Querprofile auf eine Seite passen und wie viele Seiten das ergibt.

Jedes Querprofil zeigt ein Raster mit Abständen und Höhen, das Gelände (gestrichelt), den Entwurf, den Ab- und Auftrag eingefärbt (orange und grün), die Korridorpunkte und darunter seine Station sowie seine Ab- und Auftragsflächen. Alle Querprofile auf den Blättern sind gleich groß gezeichnet, hoch genug für das größte. Passt das bei Ihrer Überhöhung nicht auf die Seite, nimmt CivilCraft das größte, das passt, und sagt das. Der Titelstreifen nennt die Trasse, die Stationen auf dieser Seite, die Maßstäbe und „Blatt 1 von 3“.

## Volumen nach der Methode der mittleren Querschnittsflächen

Zwischen zwei benachbarten Querprofilen ist das Volumen der Mittelwert ihrer beiden Flächen mal dem Abstand ihrer Stationen. Die Leiste zeigt die Summen für die Trasse, und {{ui:CSV}} lädt die Flächen und Volumen jedes Querprofils mit laufenden Summen herunter (Kubikyard in Projekten in Fuß, Kubikmeter in metrischen).

**Eigenschaften** zeigt dieselben Summen neben den Volumen der Rastermethode aus [Erdmassenvolumen](topic:volumes). Die beiden sind verschiedene Näherungen: Näher liegende Querprofile bringen sie zusammen, und auf einer geraden Straße im flachen Gelände sind sie gleich.

:::note
Ab- und Auftrag zählen nur innerhalb der bearbeiteten Flächen (die Böschungsschnittlinien eines Korridors oder Plateaus), wie bei der Rastermethode. Ohne Korridor oder Plateau ist der Entwurf das Gelände, daher zeigt ein Querprofil keinen Ab- oder Auftrag.
:::

## Massenlinie

**Massenlinie** unter **Schnittlinien** zeichnet das Massendiagramm aus denselben Volumen nach der Methode der mittleren Querschnittsflächen: entlang der Stationen die laufende Summe von Abtrag minus Auftrag.

- **Schwund (−) oder Quellung (+) des Abtrags** gibt an, was ein Kubikyard Abtrag ergibt, sobald er als Auftrag eingebaut ist: −10 % (der Startwert, ein Platzhalter) heißt, er schwindet auf 0.9; Fels, der quillt, kann +5 % haben. Verwenden Sie die Angabe Ihres Baugrundgutachtens.
- Wo die Linie steigt, liegt die Straße im Abtrag; wo sie fällt, im Auftrag. Über null (orange eingefärbt) wird Erde stationsaufwärts bewegt; unter null (grün) stationsabwärts.
- **Ausgleichspunkte** sind die Stellen, an denen die Linie die Null schneidet: Zwischen zweien gleichen sich Ab- und Auftrag aus. Die Tabelle listet jeden ausgeglichenen Abschnitt, das bewegte Volumen (sein höchster oder tiefster Punkt) und die mittlere Transportweite (die eingefärbte Fläche geteilt durch dieses Volumen).
- Endet die Linie nicht auf null, ist der Rest **Deponie** (oben) oder **Entnahme** (unten). Im letzten Abschnitt zählt nur die Erde jenseits des Niveaus, auf dem sie endet, als bewegt.

**CSV** speichert die Massenordinate an jedem Querprofil, die Abschnitte und den Faktor.
