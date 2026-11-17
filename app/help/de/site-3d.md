---
title: Die Baustelle in 3D betrachten
summary: Die 3D-Ansicht öffnen, drehen, verschieben und zoomen, die Höhenüberhöhung und die Einfärbung einstellen, wählen, was angezeigt wird, und Trassen, Plateaus, Feature-Linien, Bruchkanten, Rohre, Bauwerke und Punkte anklicken, um sie auszuwählen.
keywords: Beschriftungen, 3D-Beschriftungen, Schild, zur Kamera ausgerichtete Beschriftungen, Stationsbeschriftungen, Höhenlinienbeschriftungen, Punktbeschriftungen, Überlagerung, Luftbild, Kartenlayer auf der Oberfläche, 3D, dreidimensional, 3D-Ansicht, ViewCube, Kompass, Kreisen, Perspektive, Parallelprojektion, isometrisch, Iso, Höhenüberhöhung, Gelände, Modell, Baustellenmodell, herumfliegen, visualisieren, rendern, Rohre in 3D, Bauwerke, Schächte, Korridor in 3D, Straße in 3D, Fahrbahnoberfläche, Fahrstreifen, Bordsteine, Gehwege, Pflanzen in 3D, Bäume in 3D, Sträucher, Hecken, Landschaft 3D, Rampen in 3D, Stufen, Mauern, Pflasterung, Hartflächen 3D
from: a16bafe1
---

Die 3D-Ansicht zeigt die Baustelle als ein Modell: das bestehende Gelände und die geplante Oberfläche, Höhenlinien darüber gelegt, Bruchkanten und der Rand der Oberfläche, jede Trasse auf ihrem Entwurfsprofil mit Stationsmarken, die Korridor-Feature-Linien und die Straße selbst (Fahrstreifen, Bankette, Rinnen, Bordsteine, Streifen und Gehwege, jeweils in eigenen Farben), Plateaus mit ihren Böschungslinien, das Rohrnetz mit Rohren und Bauwerken auf ihren echten Höhen und, aus dem Arbeitsbereich Landschaft, die Pflanzen, Pflaster, Wege, Mauern, Bordsteine, Rampen und Stufen. Sie liest dasselbe Projekt wie der Plan, daher erscheint jede Änderung in beiden.

## Die 3D-Ansicht öffnen

1. Vermessungspunkte (oder eine LandXML- oder Projektdatei) öffnen, damit es eine Oberfläche gibt. Pflanzen, Pflaster oder Rampen allein reichen ebenfalls, um sie zu öffnen.
2. {{key:D}} drücken oder in der Gruppe {{ui:View}} der Symbolleiste auf {{ui:3D}} klicken.
   Die 3D-Ansicht öffnet sich über dem Plan und betrachtet die ganze Baustelle von Südosten. Beim ersten Mal dauert das Laden einen Moment.
3. {{key:D}} erneut drücken oder erneut auf {{ui:3D}} klicken, um zurück zum Plan zu gehen. Ein Zeichenwerkzeug wie {{ui:Alignment}} oder {{ui:Pad}} zu wählen führt ebenfalls zurück zum Plan, da Zeichnen dort geschieht.

## Sich bewegen

| Ziel | So geht es |
|---|---|
| Kreisen | Mit der linken oder mittleren Taste ziehen |
| Verschieben | Mit der rechten Taste ziehen oder {{key:Shift}} halten und ziehen |
| Zoomen | Am Rad drehen; es zoomt zum Zeiger hin |
| Kreisen auf dem Trackpad | Mit zwei Fingern wischen ({{key:Shift}} und Wischen verschiebt) |
| Zoomen auf dem Trackpad | Zusammenziehen |
| Touch | Ein Finger kreist; zwei Finger zoomen durch Zusammenziehen und verschieben durch Bewegen |
| Tasten (die Ansicht hat den Fokus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} kreisen, mit {{key:Shift}} verschieben; {{key:Plus}} und {{key:Minus}} zoomen |

Die Leiste über der Ansicht hat den Rest:

- Die Liste der Ansichten: **Iso**, **Oben**, **Unten**, **Vorne** (Blick nach Norden), **Hinten**, **Links**, **Rechts**.
- {{ui:Perspective}}: gedrückt ist eine Perspektivansicht; klicken Sie darauf für eine Parallelprojektion (ohne Verkürzung).
- {{ui:Extents}}: zeigt wieder alles. {{key:F}} tut dasselbe, während die 3D-Ansicht offen ist.

## Der ViewCube

Der ViewCube oben rechts dreht sich mit der Ansicht. Klicken Sie auf eine Seite, eine Kante oder eine Ecke, um die Baustelle von dort zu betrachten (die Kamera dreht sich sanft, außer Ihr System verlangt reduzierte Bewegung). Ziehen Sie den Würfel, um zu kreisen. Der Kompassring darunter zeigt Norden (Rasternord, +Y): Ziehen Sie den Ring, um die Baustelle um die Vertikale zu drehen, oder klicken Sie auf N, O, S oder W, um von dieser Seite zu blicken. {{ui:Home}}, das kleine Haus oben links, führt zurück zur Isoansicht der ganzen Baustelle. Mit der Tastatur: {{key:Tab}} zum Würfel, Pfeile wählen eine Seite, Kante oder Ecke, {{key:Enter}} blickt von dort.

Auf dem Plan zeigt derselbe Würfel die Oberseite. Klicken Sie auf eine andere Seite, Kante oder Ecke (oder ziehen Sie ihn), um die 3D-Ansicht mit Blick von dort zu öffnen: Das ist der schnellste Weg in 3D aus einer bestimmten Richtung. Um den Würfel gegen ein kleines Achsensymbol zu tauschen oder ihn auszublenden, siehe **Eckanzeige** in den [CivilCraft-Einstellungen](topic:settings).

## Höhen überhöhen

Baustellen sind meist viel breiter als hoch, daher werden die Höhen zum Start um **2×** gestreckt. Wählen Sie **1×**, **2×**, **3×**, **5×** oder **10×** in der Liste der Leiste oder unter **3D-Höhenüberhöhung** in den [CivilCraft-Einstellungen](topic:settings); beides ist eine Einstellung. Nur die Ansicht ändert sich: Volumen, Längsschnitte und Exporte bleiben im wahren Maßstab.

## Oberflächen einfärben

- **Höhenbänder**: dieselben Bänder und Farben wie die Höhenbänder des Plans (die Anzahl der Bänder stellen Sie unter **Anzeige** im linken Panel ein). Jede Bandkante wird genau bei ihrer Höhe geschnitten.
- **Eine Farbe**: das bestehende Gelände und die geplante Oberfläche jeweils in einer einfarbigen Farbe.
- **Kartenlayer**: die Kartenlayer, die unter dem Plan angezeigt werden (ein georeferenziertes Bild, Kartenkacheln oder ein Kartendienst; siehe [Kartenlayer](topic:map-layers)), werden wie eine Folie über die Oberflächen gelegt, sodass ein Luftbild auf den Hügeln erscheint. Bilder, die noch eintreffen, füllen sich nach und nach. Ist kein Kartenlayer sichtbar, behalten die Oberflächen ihre Höhenbänder, und die Ansicht sagt das. Das Bild ist für den Bildschirm gedacht: GLB- und OBJ-Exporte enthalten es nicht.

Sind beide Oberflächen sichtbar, ist das bestehende Gelände über der geplanten Oberfläche durchsichtig, sodass Sie den Abtrag (Gelände über dem Entwurf) und den Auftrag sehen.

## Wählen, was angezeigt wird

Klicken Sie in der Leiste auf {{ui:Show}} und haken Sie an oder ab:

| Element | Was es ist |
|---|---|
| Bestandsgelände | Die Oberfläche aus den Vermessungspunkten (oder aus LandXML gelesen) |
| Geplante Oberfläche | Das bestehende Gelände mit den eingeplanten Korridoren und Plateaus (nur wenn welche vorhanden sind) |
| Dreieckskanten | Jede TIN-Kante als Linie |
| Höhenlinien | Haupt- und Nebenhöhenlinien jeder angezeigten Oberfläche im Intervall des Plans |
| Rand der Oberfläche | Der äußere Rand jeder angezeigten Oberfläche auf seinen Höhen |
| Bruchkanten | Jede Bruchkante auf ihren Höhen |
| Trassen und Stationen | Jede Trasse auf ihrem Entwurfsprofil (auf dem Gelände, wo keines vorhanden ist), mit Markierungen alle 50 ft oder 20 m |
| Korridor-Feature-Linien | Fahrbahnrand, Bankett und Böschungsschnittpunkt auf beiden Seiten |
| Fahrbahnoberflächen | Die Straße, die jeder Korridor aus seinem Regelquerschnitt baut: Fahrstreifen, Bankette, Rinnen, Bordsteine, Streifen und Gehwege, jeweils in eigener Farbe, auf der geplanten Oberfläche |
| Pflanzen | Jede Pflanze sowie die Pflanzen in Beeten und Hecken, als einfache Formen nach der Pflanzenliste: Ein Baum ist ein Stamm mit einer runden Krone (ein Kegel bei einem Nadelbaum, ein Schopf auf hohem Stamm bei einer Palme). Sträucher, Heckenpflanzen, Stauden und Bodendecker sind Kuppeln, Gräser Büschel, Kletterpflanzen dünne Säulen. Sie stehen auf der geplanten Oberfläche (oder dem bestehenden Gelände) in der Größe, die der Plan zeigt: ausgewachsen oder bei der Pflanzung |
| Befestigte Flächen | Pflaster und Wege mit ihrem Gefälle, Mauern, Bordsteine, Stufen und Rampen, die in Läufen mit ebenen Podesten dazwischen ansteigen |
| Plateaus und Böschungsschnittpunkte | Der Umriss jedes Plateaus auf seiner Höhe und seine Böschungslinie |
| Rohre und Bauwerke | Rohre als runde Rohre zwischen ihren Sohlen, Bauwerke vom Deckel bis zum Sumpf |
| Vermessungspunkte | Ein Punkt mit Höhe an jedem Punkt (zunächst aus) |
| GIS-Layer | Die GIS-Layer, die im Plan angezeigt werden, in ihren Farben: Linien und Umrisse mit eigenen Höhen auf diesen Höhen, andere auf dem bestehenden Gelände verlegt (sie folgen ihm genau); Punkte als kleine Kreuze. Formen ohne Höhen außerhalb der Oberfläche werden weggelassen, und die Ansicht sagt, wie viele |
| Beschriftungen | Namen und Werte, die immer zu Ihnen zeigen: der Name jeder Trasse an ihrem Anfang und ihre Stationen alle 100 ft (oder 100 m), die Höhe jeder Hauptlinie, Plateaus, Feature-Linien und Bauwerke mit Namen, und mit angehakten **Vermessungspunkten** die Nummer und Höhe jedes Punktes |

Beschriftungen bleiben gleich groß und aufrecht, wie Sie auch drehen oder zoomen, und ein Hügel vor einer Beschriftung verdeckt sie. Wo sie sich drängen würden, erscheint das Wichtigste, und der Rest wartet, bis Sie hineinzoomen: zuerst Trassen, dann Bauwerke, Plateaus, Feature-Linien, Stationen, Höhenlinien und Punkte, näher liegende zuerst. Sie sind nur auf dem Bildschirm; Exporte und Pläne lassen sie weg.

Ihre Auswahl, die Überhöhung und die Einfärbung werden in diesem Browser gespeichert.

Eine Straße wird auf dem bestehenden Gelände gebaut. Mit einer Trasse und einem Korridor, aber ohne Vermessungspunkte oder Oberfläche, wird die Straße auf vorläufigem ebenem Gelände gezeichnet: auf der mittleren Höhe ihres Entwurfsprofils oder eben auf Höhe 0, wenn es auch kein Profil gibt. Eine Warnung unten in der 3D-Ansicht und in den Eigenschaften des Korridors sagt das. Es ist nur ein Bild: Daraus entstehen keine Volumen oder Querprofile. Öffnen Sie Vermessungspunkte oder eine Oberfläche, und die Straße wandert von selbst auf das echte Gelände.

Die Höhenüberhöhung streckt das Gelände, nicht die Pflanzen: Sie stehen auf dem überhöhten Gelände in ihrer wahren Höhe und Ausbreitung, sodass ein Baum bei jeder Einstellung wie ein Baum aussieht. Pflanzen sind einfache Formen, keine detaillierten Modelle; Tausende davon bleiben beim Drehen und Zoomen schnell.

## Rohre und Bauwerke

- Ein Rohr wird mit seiner Unterkante innen auf den Sohlen gezeichnet, die Sie festlegen, und seiner Oberkante (dem Scheitel) innen eine lichte Weite höher. Durchmesser sind in Zoll bei einem Projekt in Fuß und in Millimetern bei einem metrischen Projekt, wie im rechten Panel.
- Ein Bauwerk reicht vom Deckel (eingegeben oder aus der Oberfläche) bis zum Sumpf (die tiefste Sohle minus die Sumpftiefe). Ohne jede Sohle wird es 5 ft (1.5 m) tief gezeichnet.
- Rohre und Bauwerke mit einem Problem (siehe die Netzprüfung im rechten Panel) werden rot gezeichnet.
- Ein Rohr ohne Sohlen wird nicht gezeichnet; ein Hinweis unten in der Ansicht sagt, wie viele es sind.

## Aus der 3D-Ansicht auswählen

Klicken Sie auf eine Trasse (oder ihre Straße), ein Plateau, eine Feature-Linie, ein Rohr, ein Bauwerk, einen Vermessungspunkt, eine Pflanze, eine Rampe oder andere Hartflächen. Sie wird genauso ausgewählt, als hätten Sie im Plan geklickt: Ihre Eigenschaften öffnen sich im rechten Panel, wo Sie sie bearbeiten können, und sie wird in der Auswahlfarbe über allem in 3D gezeichnet. Was Sie im Plan auswählen, wird auch in 3D hervorgehoben. Ein Hinweis neben dem Zeiger nennt, was Sie angeklickt haben, mit Rechtswert, Hochwert und Höhe. Rohre und Bauwerke lassen sich auch dort anklicken, wo sie unter der Erde liegen; eine Linie, die hinter einem Hügel verborgen ist, lässt sich nicht durch ihn hindurch anklicken.

Klicken Sie auf eine Bruchkante, um zu sehen, welche es ist: Sie wird hervorgehoben, und die Statusleiste nennt sie (Bruchkanten haben keine eigenen Eigenschaften).

Klicken Sie auf das Gelände, um im Hinweis Rechtswert, Hochwert und Höhe dort abzulesen.

## Entlang einer Trasse fahren

Klicken Sie in der 3D-Leiste auf **Fahren** und wählen Sie eine Trasse. Die Ansicht wechselt auf einen Fahrersitz: 3.5 ft (1.07 m) über der Straße, auf ihrem Entwurfsprofil (auf dem bestehenden Gelände entlang der Achse, solange sie noch kein Profil hat), mit Blick nach vorn entlang der Trasse.

- **Abspielen** oder {{key:Space}} fährt mit der Geschwindigkeit, die Sie wählen (10 bis 65 mph oder 15 bis 100 km/h); {{key:Space}} erneut hält an. Am Ende stoppt es; **Abspielen** startet dann wieder am Anfang.
- Der Schieberegler springt zu jeder Station; {{key:Left}} und {{key:Right}} gehen 10 ft (5 m) zurück beziehungsweise vor.
- Ziehen in der Ansicht hält an und lässt Sie sich umsehen.
- **Stopp** oder {{key:Esc}} setzt die Ansicht dorthin zurück, wo sie war.

Die Höhenüberhöhung gilt auch beim Fahren: Stellen Sie 1× ein, um die Straße so zu sehen, wie sie gebaut wird.

## Licht von der Sonne

Öffnen Sie **Sonne** in der 3D-Leiste und haken Sie **Licht von der Sonne** an. Geben Sie ein Datum, eine Uhrzeit und ihre Zeitzone (die Abweichung von UTC: im Sommer die Sommerzeit) sowie Breiten- und Längengrad der Baustelle an. Hat das Projekt ein Koordinatensystem, werden sie daraus ausgefüllt.

Die Baustelle wird dann von der Sonne her beleuchtet, mit **Schatten** über Gelände, Korridor und Plateaus. Das Menü nennt den Sonnenazimut und wie hoch sie steht, oder dass sie unter dem Horizont liegt. Die Positionen stammen aus den Sonnengleichungen der NOAA. Schatten fallen bei jeder Überhöhung richtig, aber sie enden am Rand der Baustelle: Hügel und Gebäude jenseits davon werfen keine.

## 3D-Ansicht exportieren

Klicken Sie in der Leiste auf {{ui:GLB}} oder {{ui:OBJ}}. Was die Ansicht zeigt, wird im wahren Maßstab gespeichert (ohne Überhöhung), in Metern, mit Y nach oben. Details: [Baustelle in 3D exportieren](topic:export-3d).
