---
title: CivilCraft-Einstellungen
summary: Die Spaltenreihenfolge für kopierte und eingefügte Punktzeilen sowie für das Erraten der Spalten einer Datei wählen, festlegen, wie eingefügte Punkte nummeriert werden, was Punktbeschriftungen zeigen, die Eckanzeige, die Höhenüberhöhung in 3D, die Anzeige von Breiten- und Längengrad und ob Kartenlayer aus dem Internet kommen.
keywords: Einstellungen, Voreinstellungen, PNEZD, PENZD, Spaltenreihenfolge, Punktzeilen, Umnummerierung, Punktnummern, Startnummer, Punktbeschriftung, Beschriftungen, Beschreibung, Höhe, ViewCube, Achsensymbol, Eckanzeige, Kompass, Höhenüberhöhung, 3D, Breitengrad, Längengrad, Grad-Minuten-Sekunden, Dezimalgrad, Kartenlayer, Internet, Datenschutz
from: 64b9cb92
---

Öffnen Sie {{ui:Settings}} über das Zahnrad in der App-Leiste oder mit {{key:Mod+,}}. Der erste Reiter, {{ui:CivilCraft}}, enthält die Einstellungen, die zu dieser App gehören. {{ui:General}} enthält die, die alle CadCraft-Apps teilen (Design, Symbolleiste, Panels). Die Einstellungen von CivilCraft gelten nur in der App: Sie ändern sie hier, und dieser Browser merkt sie sich. {{ui:Reset CivilCraft settings}} setzt jede Einstellung auf ihren Startwert zurück.

## Punktzeilen

**P, N, E, Z, D** (der Start) oder **P, E, N, Z, D**: Punkt, Hochwert (N), Rechtswert (E), Höhe (Z), Beschreibung (D), oder Rechtswert vor Hochwert. Sie wird an drei Stellen verwendet:

- **Kopieren**: die Zeilen, die CivilCraft für eine Tabellenkalkulation in die Zwischenablage legt.
- **Einfügen**: Zeilen, die aus einer Tabellenkalkulation oder Textdatei ohne Kopfzeile eingefügt werden.
- **Importieren**: die Vermutung im Dialog **Punkte importieren**, wenn eine Datei keine Kopfzeile hat (eine Datei mit vier Spalten wird als PENZ gelesen, eine mit drei als ENZ). Siehe [Formate von Punktdateien](topic:point-file-formats).

Eine Kopfzeile, die ihre Spalten benennt, hat immer Vorrang, ebenso eine Auswahl in der Liste **Spalten** des Importdialogs.

## Nummern für eingefügte Punkte

- **Freie Nummern behalten** (der Start): Ein eingefügter Punkt behält seine Nummer, wenn kein Punkt sie hat; nur kollidierende Punkte bekommen neue Nummern.
- **Immer neue Nummern**: Jeder eingefügte Punkt bekommt eine neue Nummer, auch wenn seine eigene frei ist.

**Neue Nummern beginnen bei**: leer lassen, um ab einer Nummer über der höchsten verwendeten zu zählen. Geben Sie eine Nummer ein, zum Beispiel 5000, um neuen Punkten Nummern ab 5000 zu geben; bereits verwendete Nummern werden übersprungen. Zwei Punkte teilen sich in beiden Fällen nie eine Nummer. Siehe [Vermessungspunkte auswählen, kopieren und einfügen](topic:copy-paste-points#point-numbers-never-clash).

## Punktbeschriftungen

Was eine Punktbeschriftung zeigt, wenn {{ui:Point labels}} unter **Anzeige** eingeschaltet ist: **Nummer**, **Nummer und Höhe** oder **Nummer, Höhe und Beschreibung** (der Start). Die Exporte DXF, DWG und PDF zeigen dieselben Beschriftungen wie der Bildschirm.

## Eckanzeige

Was in der Ecke des Lageplans und der 3D-Ansicht steht: **ViewCube** (der Start), **Achsensymbol** oder **Keine**.

- **ViewCube** (oben rechts). Im Lageplan zeigt er die Oberseite mit dem Kompassring: N ist Rasternord (oben im Plan). Klicken Sie auf eine andere Seite, Kante oder Ecke des Würfels oder ziehen Sie ihn, dann öffnet sich die [3D-Ansicht](topic:site-3d) mit Blick von dort. {{ui:Home}} auf dem Würfel des Plans passt den Plan ein.
- In der 3D-Ansicht dreht sich der Würfel mit der Ansicht: Klicken Sie auf eine Seite, Kante oder Ecke, um von dort zu blicken. Ziehen Sie den Würfel, um zu kreisen, und den Kompassring, um um die Vertikale zu drehen. Klicken Sie auf einen Buchstaben, um von dieser Seite zu blicken, und nutzen Sie {{ui:Home}} für die Isoansicht der ganzen Baustelle. Blicken Sie gerade auf eine Seite, führen kleine Pfeile zur nächsten Seite, gebogene Pfeile drehen die Ansicht um eine Viertelumdrehung.
- **Achsensymbol** (unten links): eine kleine Markierung mit X (Ost) und Y (Nord) im Plan, X, Y und Z (oben) in 3D.

## 3D-Höhenüberhöhung

Wie stark die 3D-Ansicht die Höhen streckt: **1×**, **2×** (der Start), **3×**, **5×** oder **10×**. Die Liste in der Leiste der 3D-Ansicht ist dieselbe Einstellung, daher ändert jede Auswahl beides. Volumen, Längsschnitte und 3D-Exporte bleiben im wahren Maßstab.

## Breiten- und Längengrad

Wie die Statusleiste Breiten- und Längengrad des Zeigers anzeigt, wenn das Projekt ein Koordinatensystem hat: **Grad, Minuten und Sekunden** (der Start, zum Beispiel `30°18′00.00″ N`) oder **Dezimalgrad** (`30.300000° N`). Siehe [Koordinatensystem des Projekts festlegen](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Kartenlayer aus dem Internet

**Aus** (der Start) oder **Ein**. Ist es eingeschaltet, fragt CivilCraft die Kartenserver, die Sie hinzufügen, nach Bildern des Bereichs auf dem Bildschirm. Ihre Zeichnung bleibt auf diesem Computer; der Server sieht den Bereich und Ihre Internetadresse. Solange es aus ist, wird kein Kartenserver nach irgendetwas gefragt, auch wenn ein geöffnetes Projekt einen nennt. Ein georeferenziertes Bild aus einer Datei funktioniert in beiden Fällen. Siehe [Kartenlayer unter dem Plan anzeigen](topic:map-layers).

## KI-Assistenten

**Freigeben, dass KI-Assistenten und Skripte CivilCraft verwenden** (am Anfang ausgeschaltet) lässt einen Assistenten auf Ihrem Computer über CadCraft Studio die geöffnete Baustelle erreichen: **Lesen** beschreibt die Baustelle und liefert Punkte, Geländehöhen, Stationen, Längsschnitte, Volumen und Grundstücke; **Bearbeiten** lässt ihn Vermessungspunkte auswählen und hinzufügen; **Speichern** und **Exportieren** lassen ihn das Projekt speichern und LandXML oder DWG schreiben. **Ordner, die er verwenden darf** (in Studio) sind die Orte, an denen er speichern und exportieren darf. **Aktivität** listet seine Aufrufe. Siehe [Einen KI-Assistenten mit Ihrer Baustelle arbeiten lassen](topic:assistants).
