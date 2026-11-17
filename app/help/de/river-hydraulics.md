---
title: Wasserspiegellagen eines Flusses
summary: Einen Fluss aus der Geländeoberfläche modellieren und stationäre Wasserspiegellagen nach dem Standardschrittverfahren berechnen: Wasserstände, Energie, Geschwindigkeiten, Froude-Zahlen und die Überflutungsfläche im Lageplan. Eine im Labor erprobte Funktion; jedes Ergebnis braucht die Prüfung durch einen Ingenieur.
keywords: Deich, unwirksame Fließfläche, Querprofil-Editor, Fluss, Hydraulik, Wasserspiegellage, Rückstau, Standardschrittverfahren, stationäre Strömung, 1D, Querprofile, Manning, Rauheit, Schluckfähigkeit, Grenztiefe, Normaltiefe, Froude, Energielinie, Überflutungsfläche, Überschwemmungsgebiet, Uferstationen, Streckenlängen, Einengung, Aufweitung, strömend, schießend, gemischter Zustand, Wechselsprung
from: fb8bf425
---

CivilCraft berechnet stationäre, eindimensionale Wasserspiegellagen entlang eines Flusses: für jeden Abfluss, den Sie angeben, den Wasserstand an jedem Querprofil, aus der Energiebilanz zwischen benachbarten Querprofilen (das Standardschrittverfahren). Die Funktion ist noch im Labor, während sie geprüft wird.

**Nur als Entwurfshilfe.** Die Wasserstände brauchen die Prüfung durch einen qualifizierten Ingenieur, bevor sich jemand darauf verlässt: Ein eindimensionales Modell ist nur so gut wie seine Querprofile, Rauheitswerte, Streckenlängen und Randbedingungen, und es kennt weder Brücken, Durchlässe noch Wasser, das den Fluss verlässt.

## Den Fluss zeichnen

1. Zuerst die bestehende Geländeoberfläche erstellen (Punkte, Bruchkanten oder ein geöffnetes TIN).
2. Unter **Oberfläche** › {{ui:More}} {{ui:River}} wählen.
3. Entlang der Flussachse **von oben nach unten** klicken, dann {{key:Enter}} drücken oder doppelklicken.

CivilCraft schneidet alle 50 m (200 ft) ein Querprofil rechtwinklig zur Flussachse, 100 m (300 ft) zu jeder Seite, aus dem Gelände. Flusstationen werden vom unteren Ende aus gemessen, sodass sie flussaufwärts wachsen. Die Ufer beginnen als Schätzung 10 m (30 ft) beidseits des tiefsten Punkts jedes Querprofils.

Um ein Querprofil dort hinzuzufügen, wo sich der Fluss verengt oder ein Bauwerk steht, den Fluss wählen, {{ui:Add a section}} klicken und eine Schnittlinie quer darüber ziehen (in beliebiger Richtung: Sie wird so gedreht, dass sie flussabwärts blickend von links nach rechts verläuft).

## Den Fluss einrichten

Den Fluss wählen, um ihn in **Eigenschaften** zu sehen:

- **Fließzustand**: strömend (der übliche Fall: vom unteren Rand aus flussaufwärts berechnet), schießend (vom oberen Rand aus flussabwärts berechnet) oder gemischt (beides; dann gilt an jedem Querprofil dasjenige mit der größeren spezifischen Kraft; eine Vorschau).
- **Abflussprofile**: ein Name und ein Abfluss für jedes (zum Beispiel ein 10-jährlicher und ein 100-jährlicher Abfluss), und die Randbedingung am unteren Ende (und am oberen Ende, wenn der Zustand nicht strömend ist): **Normaltiefe** mit einem Energiegefälle (das Sohlgefälle ist eine erste Schätzung), eine **bekannte Wasserspiegelhöhe** oder **Grenztiefe**.
- **Querprofile aus dem Gelände**: der Abstand, wie weit links und rechts, die Schätzung der Ufer und die beiden Manning-n-Werte. {{ui:Cut sections again}} ersetzt die Querprofile (ein Schritt für Rückgängig).
- **Die Querprofiltabelle**: für jedes Querprofil die Abstände des linken und rechten Ufers, das n des Gerinnes und das n des Vorlands, die Streckenlängen zum nächsten Querprofil flussabwärts (linkes Vorland, Gerinne, rechtes Vorland; im Lageplan gemessen, um zu beginnen) und die Einengungs- und Aufweitungsbeiwerte (zum Start 0.1 und 0.3: allmähliche Übergänge). {{ui:Edit}} öffnet den Querprofil-Editor (als Nächstes); ein Punkt dahinter bedeutet, dass das Querprofil einen Deich oder eine unwirksame Fläche hat.

Jede Änderung ist ein Schritt für Rückgängig ({{key:Mod+Z}}).

## Ein Querprofil bearbeiten: Ufer, Deiche und unwirksame Flächen

{{ui:Edit}} an einem Querprofil zeichnet dessen Gelände und lässt Sie das ziehen, was der Löser liest: das **linke und rechte Ufer** (sie teilen das Querprofil in das linke Vorland, das Hauptgerinne und das rechte Vorland), einen **Deich** auf jeder Seite und **unwirksame Fließflächen**. Jeder Griff lässt sich auch mit den Pfeiltasten verschieben, und jede Zahl lässt sich neben dem Diagramm eintragen. {{ui:Apply}} ist ein Schritt für Rückgängig.

- Ein **Deich** hat eine Lage (Abstand) und eine Kronenhöhe. Das Gelände hinter ihm, vom Fluss weg, ist vom Fluss abgeschnitten, solange der Wasserspiegel unter der Krone liegt: Seine Fläche, sein benetzter Umfang und seine Schluckfähigkeit fallen weg. Über der Krone zählt das gesamte Querprofil wieder. Ein Deich steht außerhalb des Ufers, das er schützt; einer innerhalb der Ufer wird markiert.
- Eine **unwirksame Fließfläche** hält Wasser, führt aber keinen Abfluss (eine Mulde hinter einem Damm, totes Wasser neben einer Brückenrampe). Geben Sie ihre beiden Abstände an und, falls gewünscht, einen Wasserstand, unterhalb dessen sie unwirksam ist ({{ui:always}}, wenn leer): Über diesem Stand fließt sie wie der Rest. Eine, die einen Teil des Hauptgerinnes bedeckt, wird markiert.
- Zwischen zwei Querprofilen lässt die Überflutungsfläche das Gelände hinter einem Deich trocken, den beide Querprofile haben, solange der Wasserspiegel dort unter der Krone liegt (die Linie zwischen den beiden Kronen ist gerade).

## Berechnen und die Ergebnisse lesen

Auf {{ui:Water surface profiles}} klicken. Für das gewählte Abflussprofil erhalten Sie:

- einen **Plot** entlang des Flusses (Abfluss von links nach rechts): Gerinnesohle, Ufer, Wasserspiegel, Energielinie und kritischer Wasserspiegel. Querprofile, die auf Grenztiefe gehalten werden, sind eingekreist;
- eine **Tabelle** je Querprofil: Flussstation, Abfluss, Gerinnesohle, Wasserspiegel, kritischer Wasserspiegel, Energielinie, Tiefe, Geschwindigkeit im Gerinne und insgesamt, die Froude-Zahl im Gerinne, Fließfläche, Wasserspiegelbreite, der Abfluss in jedem Vorland und im Gerinne, das Energiegefälle und die Warnungen;
- **Warnungen** in einfachen Worten, zum Beispiel ein Querprofil auf Grenztiefe, Wasser über den Enden eines Querprofils oder eine große Änderung der Schluckfähigkeit zwischen zwei Querprofilen (dazwischen weitere Querprofile einfügen).

{{ui:Table (CSV)}}, {{ui:Report}} (Klartext mit dem Verfahren, den Randbedingungen und jeder Tabelle) und {{ui:Plot (SVG)}} speichern in Ihre Downloads. Jede Datei enthält den Prüfvermerk.

Haken Sie in **Eigenschaften** {{ui:Show the flood extent}} an, um die nasse Fläche für das gewählte Abflussprofil im Lageplan einzufärben; die Wasserlinie wird dort gezeichnet, wo die Tiefe null ist. Zwischen Querprofilen liegt der Wasserspiegel quer über den Fluss waagerecht und ändert sich linear mit der Flussstation. Gelände hinter einem Deich bleibt trocken, solange das Wasser unter dessen Krone liegt. Anderes tief liegendes Gelände im Korridor des Flusses, das das Wasser nicht erreichen kann (etwa hinter einem Straßendamm), wird trotzdem eingefärbt: Prüfen Sie das.

## Im Plan und in Probleme

Die Linien des Flusses gehen auf eigene Ebenen im Lageplan, im PDF und in der DWG: **C-WATR-CNTR** (die Achse), **C-WATR-SCTN** (jede Schnittlinie mit ihrer Flussstation) und **C-WATR-FLOD** (die Wasserlinie der Überflutungsfläche, wenn {{ui:Show the flood extent}} für ein Abflussprofil angehakt ist). Die Warnungen des Flusses (ein Querprofil auf Grenztiefe, Wasser über den Querprofilenden, eine Änderung der Schluckfähigkeit, die mehr Querprofile verlangt, eine Energiebilanz, die nicht schloss, ein Deich innerhalb der Ufer) gehen ebenfalls in das Panel **Probleme**, bezogen auf den Fluss und dort platziert, wo das Querprofil liegt.

## So wird berechnet

- Energie zwischen zwei Querprofilen: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Schluckfähigkeit nach Unterteilung: Jedes Vorland wird dort geteilt, wo sich sein n ändert, K = Σ (1/n)·A·R^(2/3) (1.486/n in US-Einheiten); das Gerinne ist ein Stück, mit einem zusammengesetzten n, wenn sich sein n ändert. α ergibt sich aus der Aufteilung der Schluckfähigkeit.
- Reibungsgefälle nach mittlerer Schluckfähigkeit, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², über die abflussgewichtete Streckenlänge.
- Einengungsbeiwert, wenn die Strömung flussabwärts beschleunigt, Aufweitungsbeiwert, wenn sie verlangsamt.
- Grenztiefe = kleinste spezifische Energie. Jeder Wasserstand wird in einem eingeschlossenen Intervall gelöst, sodass er nie auf die falsche Seite der Grenztiefe springt; gibt es keine Lösung, wird er auf Grenztiefe gesetzt und markiert.

Die Funktion ist gegen die Normaltiefe nach Manning, die Grenztiefe in einem Rechteckgerinne und Chows Rückstau-Beispiel (*Open-Channel Hydraulics*, 1959, Kapitel 10) geprüft, das unabhängig integriert wurde. Dasselbe Verfahren verwenden die gängigen eindimensionalen Flussprogramme, daher lassen sich eine Handrechnung oder die Notizen eines Studierenden übernehmen.

## Durchlässe und Brücken

Unter **Durchlässe und Brücken** in den **Eigenschaften** des Flusses setzt {{ui:Add a culvert}} oder {{ui:Add a bridge}} ein Bauwerk zwischen zwei Querprofile (jeder Abschnitt behält mindestens zwei). Das Profil darunter bleibt unverändert; der Wasserspiegel direkt oberhalb ergibt sich aus dem Bauwerk, und das Profil läuft von dort aus flussaufwärts weiter. **Ergebnisse** fügt eine Tabelle für jedes Bauwerk hinzu: Unterwasser, Oberwasserstand, welche Steuerung maßgeblich ist, der Abfluss durch die Öffnung und der Abfluss über Straße oder Überbau. Nur strömender Abfluss.

- **Durchlass** (Kasten oder rund, ein oder mehrere gleiche Rohre). Die Einlaufsteuerung ist Wehrabfluss, solange der Einlauf frei ist, und Blendenabfluss, sobald er überstaut ist; dazwischen wird überblendet, zwischen einem Oberwasser von dem Einfachen und dem Eineinhalbfachen der Höhe. Die Auslaufsteuerung ist die Energiebilanz: Einlaufverlust, Reibung und Austrittsgeschwindigkeitshöhe, über dem höheren Wert aus Unterwasser und der Mitte der Grenztiefe sowie dem Scheitel, abzüglich des Gefälles entlang des Rohrs. Das Oberwasser ist das größere der beiden. Setzen Sie den Haken bei **Wasser darf über die Straße fließen**, dann teilt sich der Wehrabfluss über die Straße den Abfluss mit den Rohren.
- **Brücke.** Die Öffnung ist das Querprofil unterhalb der Brücke, an den Widerlagern abgeschnitten, mit jedem Pfeiler als Fläche, die keinen Abfluss führt. Der Wasserspiegel in der Öffnung ergibt sich aus dem Querprofil darunter (Aufweitungsbeiwert), und das Querprofil darüber aus der Öffnung (Einengungsbeiwert). Kann die Öffnung den Abfluss bei diesem Unterwasser nicht abführen, läuft sie auf Grenztiefe, und die Brücke wird als abschnürend markiert. Erreicht das Wasser die Unterkante des Überbaus, ist der Abfluss Druckabfluss (Schützenart, solange das Unterwasser unter der Unterkante liegt, überstaut darüber). Wasser über dem Überbau fügt Wehrabfluss hinzu; der Oberwasserstand ist derjenige, bei dem sich beides zum Abfluss addiert.

Die Beiwerte (Durchfluss, Einlaufverlust, Wehr) sind runde Standardwerte. Ändern Sie sie für Ihren Entwurf. Sie entsprechen nicht den angepassten Diagrammen, die Durchlass-Handbücher drucken; behandeln Sie das Oberwasser eines Durchlasses nahe seiner Grenze daher als Schätzung. Wasser über Straße oder Überbau, ein überstauter Einlauf, eine abgeschnürte Öffnung und schnelle Strömung im Rohr werden in **Probleme** angezeigt.

## Instationärer Abfluss

{{ui:Unsteady flow…}} in den **Eigenschaften** des Flusses leitet eine Hochwasserganglinie durch die Querprofile. Geben Sie den Zufluss als Stunden und Abflüsse ein, ein Paar je Zeile, das Gefälle flussabwärts (Normaltiefe) und wie lange gerechnet werden soll. Die Berechnung startet vom stationären Wasserspiegel beim ersten Abfluss und löst die vollständigen eindimensionalen Gleichungen (das implizite Vier-Punkt-Schema, zeitlich mit 0.6 gewichtet). Sie erhalten den höchsten Wasserstand und Abfluss an jedem Querprofil mit der Stunde, zu der jeder eintritt, ein Diagramm des Abflusses an den beiden Enden und die Volumenprüfung (hinein, heraus und die gespeicherte Änderung). Geprüft wird, ob stationäre Strömung stationär bleibt, ob ein Sprung im Zufluss im stationären Profil des neuen Abflusses endet, ob das Volumen aufgeht, und die Geschwindigkeit der Hochwasserwelle gegen die kinematische Welle. Strömender Abfluss, eine Strecke, kein seitlicher Zufluss und keine Durchlässe oder Brücken innerhalb des Laufs.

## Zusammenflüsse

Strecken, die ihren Abfluss in einen gemeinsamen Auslauf führen: Die Abflüsse addieren sich, und der Wasserspiegel am Kopf der unteren Strecke wird bis zu den Enden der einmündenden Strecken hochgerechnet (derselbe Wasserspiegel an der Einmündung, das einfache Verfahren: kein Winkel, kein Impuls, daher geeignet für kleine Froude-Zahlen). Das Modell und die Tests sind vorhanden (`river-structures.js`); ein Panel zum Verbinden zweier Flüsse im Lageplan ist noch nicht umgesetzt.

## Noch nicht umgesetzt

Wehre und Schützen als eigene Bauwerke, ein Panel für Zusammenflüsse, Bauwerke innerhalb eines instationären Laufs und instationärer schießender Abfluss. Ein Lauf im gemischten Zustand markiert einen Wechselsprung zwischen zwei Querprofilen, platziert ihn aber nicht.

**Wo Flüsse zusammenkommen.** In den Eigenschaften eines Flusses nennt „Mündet in“ den Fluss, in den er mündet. Die Flüsse, die zusammentreffen, werden gemeinsam gelöst: Der Fluss, in den sie münden, trägt die Summe ihrer Abflüsse, und jeder von ihnen endet am Wasserspiegel am ersten Querprofil dieses Flusses (das Verfahren gleicher Wasserspiegel; es lässt Winkel und Impuls der Abflüsse weg). Um einen Hauptfluss und einen Bach zu verbinden, zeichnen Sie einen kurzen Fluss unterhalb der Einmündung und lassen beide in ihn münden. Die Ergebnisse zeigen eine Tabelle der Zusammenflüsse. Die Standardwerte in diesen Ergebnissen (Einengung 0.1, Aufweitung 0.3, ein Gerinne aus einem Stück mit zusammengesetzter Rauheit, der gemischte Zustand nach spezifischer Kraft) bleiben, bis ein Ingenieur sie prüft, und die Ergebnisse weisen darauf hin.
