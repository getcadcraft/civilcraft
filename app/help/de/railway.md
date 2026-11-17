---
title: Eisenbahngleis entwerfen
summary: Eine Trasse zur Eisenbahn machen: Übergangsbögen (Klothoide, kubische Parabel, Bloss, Helmert, Sinus-Halbwelle, Sinus), Überhöhung an jedem Bogen mit ihrer Ausgleichsüberhöhung, Fehlbetrag und Überschuss, Grenzwerte für Überhöhung und Gleisgeometrie als Warnungen, Weichen und Gleisverbindungen nach Station, eine entlang der Trasse geführte Lichtraumhüllkurve sowie ein Gleis mit Schienen, Schwellen und Schotterbett, als Korridor gebaut, im Lageplan, in Schnitten, im Längsschnitt, in 3D und in den Mengen.
keywords: Eisenbahn, Schiene, Bahn, Gleis, Zug, U-Bahn, Straßenbahn, Überhöhung, Querneigung, Überhöhungsfehlbetrag, Überhöhungsüberschuss, Ausgleichsüberhöhung, Übergang, Übergangsbogen, Klothoide, kubische Parabel, Bloss, Helmert, Sinus-Halbwelle, Kosinus, Spurweite, Normalspur, Breitspur, Meterspur, Schmalspur, Schwelle, Schwelle, Schwelle, Schotter, Unterschotter, Planum, Randstreifen, Gleisabstand, 60E1, 54E1, UIC60, 115RE, 136RE, Überhöhungsneigung, Überhöhungsänderung, Weiche, Weichenzunge, Weiche, Gleisverbindung, Herzstück, Herzstücknummer, Weichenlänge, Abzweigbogen, Abzweiggeschwindigkeit, Lichtraum, Lichtraumhüllkurve, Lichtraumprofil, Lichtraumprofil, Bewegungshüllkurve, Bahnsteig, Bahnsteigspalt, Gleisabstand, Gefälle, Ausrundung, Mindestradius, LandXML Überhöhung
from: 99de9745
---

Jede Trasse kann ein Eisenbahngleis sein. Ihre Bögen erhalten dann Übergangsbögen und eine Überhöhung (die Querneigung der Schienen), und ihr Korridor wird als Gleis gebaut: Schienen auf Schwellen auf einem Schotterbett, ins Gelände modelliert wie eine Straße. Weichen und Gleisverbindungen werden nach Station gesetzt, und eine Lichtraumhüllkurve kann entlang der Trasse geführt und gegen die Objekte neben dem Gleis geprüft werden.

Alle Zahlen unten sind **Platzhalter**, keine Norm. Bahnen legen ihre Grenzwerte nach Liniengeschwindigkeit, Gleisart und Land fest; setzen Sie sie nach der Norm Ihrer Bahn. CivilCraft enthält keine nationale Tabelle.

## Trasse zur Eisenbahn machen

1. Wählen Sie die Trasse aus und suchen Sie **Eisenbahn** in den Eigenschaften.
2. Aktivieren Sie **Diese Trasse ist ein Eisenbahngleis**. Jede Änderung ist ein Schritt für Rückgängig.
3. Legen Sie die **Entwurfsgeschwindigkeit** oben in den Eigenschaften der Trasse fest: Sie ist die Liniengeschwindigkeit, gegen die die Überhöhung geprüft wird. **Langsamste Züge** (im Block Eisenbahn) ist die Geschwindigkeit, gegen die der Überhöhungsüberschuss geprüft wird.

## Übergangsbögen

Geben Sie jedem Bogen an beiden Enden eine Übergangslänge in der PI-Tabelle (**Einlaufender Übergang**, **Auslaufender Übergang**) und wählen Sie dann seine Art in der Bogentabelle des Blocks Eisenbahn oder **Übergang für jeden Bogen**:

| Art | Krümmung entlang des Übergangs |
|---|---|
| Klothoide | wächst gleichmäßig (die Straßenklothoide) |
| Kubische Parabel | y = x³ / (6·R·L), mit L entlang der Tangente gemessen; der Bogen selbst ist etwas länger |
| Bloss | 3u² − 2u³ der vollen Krümmung (u = Anteil der Länge): beginnt und endet sanft |
| Helmert | zwei Parabeln, 2u² dann 1 − 2(1 − u)² |
| Sinus-Halbwelle | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Alle außer der kubischen Parabel drehen sich um L / 2R, wie die Klothoide. Die Stationierung läuft entlang der wahren Länge. LandXML behält die Art (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Überhöhung

Geben Sie die **Überhöhung** jedes Bogens in Millimetern ein. Die Tabelle zeigt für jeden Bogen:

- **Ausgleichsüberhöhung** = G·v² / (g·R), wobei G der Abstand der Schienenmitten ist (**Schienenmittenabstand**, die Spurweite plus die Schienenkopfbreite, sofern Sie nichts eingeben). Mit G = 1500 mm ergibt sich die bekannte Formel 11.8·V² / R (V in km/h, R in m).
- **Fehlbetrag** = Ausgleichsüberhöhung bei der Liniengeschwindigkeit − eingestellte Überhöhung.
- **Überschuss** = eingestellte Überhöhung − Ausgleichsüberhöhung bei der Geschwindigkeit der langsamsten Züge.
- **Rampe**: das steilste Überhöhungsgefälle entlang ihrer Rampen, in Millimetern pro Meter.

Die Überhöhung steigt über jeden Übergang an, geformt wie ihre Krümmung: gerade bei einer Klothoide oder einer kubischen Parabel, nach Bloss bei Bloss usw. Ein Bogenende ohne Übergang rampt auf der davor liegenden Geraden, so lang wie die Grenze des Überhöhungsgefälles es verlangt, und das wird angezeigt: Die Überhöhung ändert sich dann dort, wo sich die Krümmung nicht ändert.

**Überhöhung dreht um** legt fest, welche Schiene auf dem Entwurfslängsschnitt bleibt: **die tiefe Schiene** (üblich), **die innere Schiene** oder **die Gleismitte** (jede Schiene bewegt sich um die halbe Überhöhung). Der Entwurfslängsschnitt ist dort die Schienenoberkante.

Das **Überhöhungsdiagramm** zeichnet die Höhe jeder Schiene über dem Längsschnitt entlang der Stationen; die Längsschnittansicht sowie die Lageplan- und Längsschnittblätter erhalten dasselbe als Band unter dem Längsschnitt.

## Überhöhungsgrenzen und Warnungen

**Größte eingestellte Überhöhung**, **Größter Überhöhungsfehlbetrag**, **Größter Überhöhungsüberschuss**, **Steilstes Überhöhungsgefälle** und **Schnellste Überhöhungsänderung** (das Gefälle bei Liniengeschwindigkeit, mm/s) werden an jedem Bogen geprüft. Ein Wert über einer Grenze ist eine Warnung im Block Eisenbahn und im Bereich Probleme, mit Grenze und gefundenem Wert. Ohne Entwurfsgeschwindigkeit werden Fehlbetrag und Änderungsgeschwindigkeit nicht geprüft (ein Hinweis sagt das).

## Das Gleis

Legen Sie die **Spurweite** fest (Voreinstellungen Normalspur 1435 mm, Breitspur, Meterspur oder Schmalspur, oder eigene Werte), das **Schienenprofil** (60E1, 54E1, 49E1, 115RE, 136RE: nur deren veröffentlichte Maße), die Anzahl der **Gleise** und deren **Gleisabstände**, danach **Schwellen und Schotter**: Schwellenmaterial, Länge, Breite, Höhe und Abstand; Schotterhöhe unter der Schwelle (an der tiefen Schiene), Schotterbankett, Böschung, wie weit seine Oberkante unter den Schwellen liegt; Unterschotterhöhe, der Randstreifen hinter dem Schotterfuß und die Querneigung des Planums.

Drücken Sie **Gleis erzeugen**. Es schaltet den Korridor der Trasse ein, gebaut als Gleis entlang des Entwurfslängsschnitts: Schienen und Schwellen kippen mit der Überhöhung, das Planum nicht. Die Böschungen laufen vom Rand des Randstreifens bis zu den Einschnitts- und Dammböschungen des Korridors, und das Gleis geht wie eine Straße in die geplante Oberfläche über.

- **Lageplan**: beide Schienen jedes Gleises (Ebene C-RAIL-TRAK) und bei mehr als einem Gleis die Mitte jedes Gleises (C-RAIL-CNTR), auf dem Bildschirm, in DXF, DWG, PDF sowie in Lageplan- und Längsschnittblättern.
- **Schnitte**: die Schwellen, Schienen sowie die Unterkanten von Schotter und Unterschotter in jedem Schnitt.
- **3D**: die Schienen, jede Schwelle und das Schotterbett (Anzeigen › Gleis), auch in GLB, OBJ und USD.
- **Mengen**: Gleislänge, Schiene (beide Schienen jedes Gleises, entlang der eigenen Linie jedes Gleises), Schwellen, Schotterbett und Schotter ohne Schwellen sowie Unterschotter, nach der Methode der mittleren Endflächen zwischen Schnitten.

## Prüfung der Gleisgeometrie

Neben der Überhöhung prüft der Block Eisenbahn die Linie selbst gegen sechs weitere Grenzwerte (alle Platzhalter, alle von Ihnen festzulegen):

- **Steilstes Gefälle** des Entwurfslängsschnitts, in Millimetern pro Meter.
- **Kleinster Ausrundungsradius** als Faktor k in R ≥ k·V² (R in Metern, V in km/h). Eine parabelförmige Ausrundung der Länge L zwischen zwei Gefällen hat einen Radius von L geteilt durch die Gefällsänderung.
- **Kürzeste Ausrundung**.
- **Kleinster Bogenradius** im Lageplan (0 schaltet die Prüfung aus).
- **Kürzester Bogen oder Gerade**, als Sekunden Fahrzeit bei Liniengeschwindigkeit: ein Kreisbogen oder die Gerade zwischen zwei Bögen, die kürzer als diese Strecke ist, wird gewarnt. 1.8 s ist die bekannte Faustregel „halbe Geschwindigkeit in km/h, in Metern“.
- **Änderungsgeschwindigkeit des Überhöhungsfehlbetrags** entlang jedes Übergangs, in mm/s bei Liniengeschwindigkeit.

**Gleisgeometrie** listet das gefundene steilste Gefälle und jede Ausrundung mit ihrem Radius sowie den Radius, den die Liniengeschwindigkeit verlangt. Eine Ausrundung, die auf einem Übergang oder einer Überhöhungsrampe liegt, erhält einen Hinweis. Ohne Entwurfslängsschnitt oder ohne Entwurfsgeschwindigkeit werden die Prüfungen, die sie brauchen, übersprungen, und ein Hinweis sagt das.

## Weichen und Gleisverbindungen

Drücken Sie unter **Weichen und Gleisverbindungen** auf **Weiche hinzufügen**. Sie wird auf die längste Gerade gesetzt; legen Sie in der Tabelle fest:

- **Weichenspitze Station**: wo die Weiche auf dieser Trasse beginnt.
- **Herzstück**: die Herzstücknummer N (1:N). Der Herzstückwinkel ist 2·atan(1 / 2N).
- **Seite**: links oder rechts, in Richtung steigender Station gesehen.
- **Abstand Gleisverbindung** in Metern: über 0 wird die Weiche zu einer Gleisverbindung zu einem parallelen Gleis in dieser Entfernung (zwei Weichen und die Gerade dazwischen).

Die Tabelle zeigt die **Weichenlänge** (Weichenspitze bis Herzstück), den **Radius** des Abzweigbogens und die **Abzweiggeschwindigkeit**, die dieser Radius bei Ihrer Grenze für den Überhöhungsfehlbetrag und ohne Überhöhung zulässt. **Gleis daraus erzeugen** macht aus dem abzweigenden Fahrweg eine eigene Trasse (die Weiche, den Abzweigbogen, dann geradeaus im Herzstückwinkel) mit denselben Eisenbahneinstellungen, bereit zum Verlängern.

Der Lageplan zeichnet für jede Weiche die beiden abzweigenden Schienen, ihre Mittellinie, eine Markierung an der Weichenspitze und am Herzstück sowie „1:N“ (Ebene C-RAIL-TURN), auf dem Bildschirm und in DXF, DWG, PDF und Blättern. Die 3D-Ansicht zeichnet die abzweigenden Schienen auf Höhe des Hauptgleises.

Die Form ist ein **Platzhalter**: eine gerade Weichenzunge und ein Abzweigbogen aus der Herzstücknummer. Eine gebaute Weiche folgt der Norm der Bahn und der Zeichnung des Herstellers. Warnungen: eine Weiche, die von der Trasse abläuft, auf einem Bogen, einem Übergang, einer Überhöhung oder einer Ausrundung liegt oder eine andere überlappt; sowie ein Hinweis, wenn die Liniengeschwindigkeit über ihrer Abzweiggeschwindigkeit liegt.

## Lichtraumhüllkurve

Aktivieren Sie **Lichtraumhüllkurve entlang dieses Gleises führen**. Wählen Sie den **Umriss** (zwei Platzhalterformen, oder **Eigener Umriss**, eingegeben als ein Punkt pro Zeile: Versatz zur Gleismitte, dann Höhe über Schienenoberkante, in Metern), die **Fahrzeuglänge** und die **Drehgestellabstände** und, falls vorhanden, eine **Bahnsteigkante** (Seite, Abstand zur Gleismitte, Höhe über der Schiene).

An jeder Station wird der Umriss mit der Überhöhung um die tiefe Schiene geneigt und durch den Bogen verbreitert: die Fahrzeugmitte rückt um b² / 8R nach innen, seine Enden um (L² − b²) / 8R nach außen (b die Drehgestellabstände, L die Fahrzeuglänge, R der dortige Radius, dem Übergang folgend). Der Block zeichnet den Schnitt auf der Geraden und dort, wo er am breitesten ist, und listet auf:

- die **breiteste Hüllkurve** und wo,
- die **Gleisabstände**, gegenübergestellt den Abständen, die zwei benachbarte Hüllkurven brauchen,
- den Raum, der an der **Bahnsteigkante** bleibt, oder wie weit sie hineinragt,
- jede Feature-Linie, Rohrleitung und andere Eisenbahntrasse, die **innerhalb der Hüllkurve** liegt.

Eine Feature-Linie mit Höhen wird am Umriss in ihrer Höhe über der Schiene beurteilt; ohne Entwurfslängsschnitt oder für einen Punkt ohne Höhe wird nur im Lageplan beurteilt, und die Liste sagt das. Der Lageplan zeigt die beiden Kanten der Hüllkurve (Ebene C-RAIL-CLRN) mit einem Kreuz bei jedem Objekt innerhalb.

Die angebotenen Umrisse sind **Platzhalter, keine Spurweite einer Bahn**. Geben Sie das Lichtraumprofil Ihrer Bahn ein, bevor Sie sich auf ein Ergebnis verlassen.

## In anderen Programmen

- **LandXML**: eine Eisenbahntrasse wird mit ihren Übergängen (spiType) und einem `Cant`-Block geschrieben: die Spurweite, der Drehpunkt, die Liniengeschwindigkeit und eine Station, an der jede Überhöhungsrampe beginnt und endet, mit eingestellter Überhöhung, Ausgleichsüberhöhung und Fehlbetrag. Das Öffnen einer LandXML-Datei mit einem `Cant`-Block macht diese Trasse mit diesen Überhöhungen zu einem Eisenbahngleis.
- **IFC**: die Trasse mit ihren Überhöhungssegmenten, den Schienen, Schwellen, dem Schotter und dem Unterschotter.

## Noch nicht umgesetzt

Weichen im IFC-Export, Weichenfamilien über den einzelnen Abzweigbogen hinaus (Bogenweichen, Herzstücke mit beweglicher Spitze, Doppelweichen, Kreuzungen), Regeln für das Lichtraumprofil nach Bewegung (die Hüllkurve ist ein fester Umriss mit Bogenausschlag), Oberleitungen und Signaltechnik.

**Welche Norm.** Im Block Eisenbahn nimmt „Zu nennende Norm“ die Werte Keine oder Europäisch (UIC und EN) an. Mit Europäisch werden die Dokumente genannt, die ein europäisches Projekt zitiert (EN 13803 für die Trassenparameter, EN 13232 für Weichen und Kreuzungen, EN 15273 für Lichtraumprofile, EN 13848 für die Qualität der Gleisgeometrie), und jede Grenze erhält ein Feld für die Stelle, aus der sie stammt. Keine Zahl aus einer Norm ist eingebaut: die Grenzwerte für Überhöhung, Fehlbetrag, Überschuss, Gefälle und Änderung, die Weichengeometrie und das Lichtraumprofil sind alle noch Platzhalter, und das Fenster sagt das. Ein Bahningenieur prüft jeden Wert am Normtext selbst und trägt die Stelle daneben ein, bevor etwas gebaut wird. Südafrika und die AREMA-Tabellen sind in dieser Version nicht enthalten.
