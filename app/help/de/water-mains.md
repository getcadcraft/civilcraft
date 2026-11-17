---
title: Wasserleitungen: Drücke, Durchflüsse und Löschwasser
summary: Ein Drucknetz aus Knoten, Behältern, Tanks, Rohren, Pumpen und Druckminderventilen im Plan zeichnen; CivilCraft berechnet die Druckhöhen, Drücke und Durchflüsse (Hazen–Williams, vermaschte Netze), den für einen Brand verfügbaren Durchfluss und einen Bedarfstag. Ein Labor-Feature; jedes Ergebnis braucht die Prüfung durch einen Ingenieur.
keywords: Wasser, Wasserleitung, Wasserverteilung, Druckrohr, Druckleitung, vermaschtes Netz, hazen-williams, C-Faktor, Druckhöhenverlust, Restdruck, Löschwasser, Hydrant, Bedarf, Knoten, Behälter, Tank, Pumpe, Pumpenkennlinie, Druckminderventil, Rückschlagventil, erweiterte Zeitperiode, EPANET, inp, Geschwindigkeit
from: df46bf6d
---

Wasserleitungen sind die Druckseite eines Geländes: Rohre, die immer voll sind und durch einen Behälter, einen Tank oder eine Pumpe angetrieben werden. CivilCraft berechnet die Druckhöhe und den Druck an jedem Knoten sowie den Durchfluss in jedem Rohr, auch in vermaschten Netzen, in denen das Wasser mehr als einen Weg hat. Das Feature ist im Labor, während es geprüft wird.

**Nur eine Rechenhilfe.** Jede Zahl braucht die Prüfung durch einen qualifizierten Ingenieur: Das Ergebnis ist nur so gut wie die Bedarfe, Höhen, Rohrdurchmesser und Rauheitswerte, die Sie angegeben haben, und ein stationäres Modell weiß nichts über Wasserschlag, Wasserqualität oder das tatsächliche Verhalten einer Feuerlöschpumpe.

## Das Netz zeichnen

1. Wählen Sie unter **Geländemodell** › {{ui:Mehr}} {{ui:Wasserleitungen…}}. Das Fenster bleibt offen, während Sie am Plan arbeiten.
2. Wählen Sie {{ui:Behälter}} und klicken Sie im Plan auf die Stelle der Versorgung. Seine Druckhöhe liegt anfangs 100 ft (30 m) über dem Gelände; ändern Sie sie in den Eigenschaften.
3. Wählen Sie {{ui:Knoten}} und klicken Sie auf jede Stelle, an der Wasser entnommen wird oder Rohre zusammentreffen. Ein Knoten übernimmt seine Höhe vom Gelände; geben Sie in den Eigenschaften eine andere ein, um sie zu überschreiben.
4. Wählen Sie {{ui:Rohr}}, klicken Sie auf einen Knoten und dann auf den Knoten, mit dem er verbunden wird. Das Werkzeug bleibt für das nächste Rohr aktiv. Eine {{ui:Pumpe}} und ein {{ui:Druckminderventil}} werden genauso gezeichnet, vom Saug- (oder stromaufwärts liegenden) Knoten zum Druck- (oder stromabwärts liegenden) Knoten. Ein {{ui:Tank}} wird wie ein Knoten platziert.
5. Wählen Sie einen Knoten und geben Sie seinen {{ui:Bedarf}} ein (gpm oder L/s in einem Meter-Projekt). Wählen Sie ein Rohr und stellen Sie seinen {{ui:Durchmesser}} ein (in oder mm) und, wenn Sie ihn kennen, seinen Hazen–Williams-C-Wert.

Jede Änderung ist ein Schritt zum Rückgängigmachen. Delete entfernt den Knoten und die Rohre, die dort enden.

## Was jeder Teil bedeutet

- **Rohr.** Die Länge wird im Plan gemessen, sofern Sie keine eingeben. C ist der Hazen–Williams-Rauheitswert (zum Start 130; den Standardwert ändern Sie im Fenster). Ein Einzelverlustbeiwert K addiert die Verluste von Bögen und Formteilen. Setzen Sie den Haken bei **Rückschlagventil** für ein Rohr, das kein Wasser rückwärts führen darf; ein als **Geschlossen** markiertes Rohr führt nichts.
- **Behälter.** Eine Quelle mit fester Druckhöhe, dem Wasserstand, den sie über dem Bezugsniveau hält. Sie gibt ab oder nimmt auf, was das Netz braucht.
- **Tank.** Ein Wasserstand, der sich über einen Tag ändert. In den stationären Ergebnissen ist er eine Quelle auf seinem aktuellen Stand.
- **Pumpe.** Ein Auslegungspunkt (Durchfluss und Förderhöhe) ergibt die übliche Kennlinie durch ihn: Die Förderhöhe bei null Durchfluss beträgt 133 % der Auslegungsförderhöhe, und die Förderhöhe ist null beim doppelten Auslegungsdurchfluss. Eine Pumpe drückt das Wasser nie rückwärts.
- **Druckminderventil.** Hält den Druck, den Sie stromabwärts einstellen, solange die Versorgung höher ist. Wenn die Versorgung niedriger ist, ist es offen und hält dann nichts; würde das Wasser rückwärts laufen, schließt es sich.

## Die Ergebnisse lesen

Das Fenster zeigt die Druckhöhe und den Druck jedes Knotens sowie Durchfluss, Geschwindigkeit und Druckhöhenverlust je 1,000 ft (oder je km) jedes Rohrs. Die Knoten im Plan sind eingefärbt: Grün liegt zwischen Ihrem niedrigsten und höchsten Druck, Rot darunter, Bernstein darüber. Durchflusspfeile zeigen die Richtung. Wählen Sie einen Knoten oder ein Rohr aus, um seine Werte in den Eigenschaften zu lesen.

Unter den Tabellen steht eine Liste dessen, was Sie prüfen sollten: niedriger oder hoher Druck, ein Rohr, das schneller ist als Ihre Grenze, ein Knoten, der von jeder Quelle abgeschnitten ist, oder ein Löser, der nicht konvergiert hat. Dieselben Befunde stehen im Bereich Probleme. Legen Sie die Grenzen im Fenster fest (zum Start 20 psi, 100 psi und 10 ft/s; 140 kPa, 700 kPa und 3 m/s in einem Meter-Projekt).

## Löschwasser

{{ui:Löschwasser…}} zeichnet einen Durchfluss an einem Knoten und zeigt den Druck dort sowie den niedrigsten Druck irgendwo im Netz. Außerdem ermittelt es den an diesem Knoten verfügbaren Durchfluss, während der schwächste Knoten im Netz den von Ihnen angegebenen Restdruck einhält. Andere Bedarfe bleiben unverändert.

## Ein Bedarfstag

{{ui:Ein Bedarfstag…}} rechnet das Netz stundenweise durch. Geben Sie das Bedarfsmuster in den Einstellungen der Datei an (eine Liste von Faktoren, die sich wiederholt); Tanks füllen und leeren sich mit dem Zu- und Abfluss, und eine Pumpe kann einem Ein-/Aus-Muster folgen. Ein Tank, der seinen höchsten oder niedrigsten Stand erreicht, wird in der Liste genannt: CivilCraft schließt seinen Zu- oder Ablauf nicht für Sie, lesen Sie es also als „dieser Tank ist zu klein oder die Pumpe zu groß“.

## EPANET-Text

{{ui:Als EPANET-Text speichern (.inp)}} schreibt das Netz in dem einfachen Textformat, das viele Wasserprogramme lesen, und {{ui:EPANET-Text öffnen (.inp)…}} liest eines ein. Nur was CivilCraft modelliert, wird übernommen: Knoten, Behälter, Tanks, Rohre, Pumpen mit Förderkennlinie, Druckminderventile, Bedarfsmuster und die Zeiten. Andere Ventilarten, Pumpen mit Leistungsangabe und andere Verlustformeln werden benannt und weggelassen. Die Datei muss dieselben Einheiten verwenden wie das Projekt.

## Hydranten, Ventile und Formteile

Wählen Sie einen Knoten und setzen Sie den Haken bei **Hydrant**, um dort einen zu setzen; wählen Sie eine Hauptleitung und drücken Sie **In der Mitte hinzufügen**, um dort ein Ventil, ein Entlüftungsventil, eine Entleerung oder einen Zähler anzubringen. Sie sind Objekte des Netzes: Sie bewegen sich mit ihm, und ein Schritt zum Rückgängigmachen entfernt sie.

Das Layout legt außerdem Formteile nahe, und CivilCraft listet sie ohne Aufforderung auf: ein **T-Stück**, wo drei Hauptleitungen zusammentreffen, ein **Kreuz**, wo vier zusammentreffen, ein **Bogen** (mit seinem Winkel), wo zwei Hauptleitungen um 5° oder mehr abbiegen, ein **Reduzierstück**, wo zwei Dimensionen zusammentreffen, und eine **Kappe** an einem Sackende. {{ui:Formteilliste (CSV)}} zählt sie und die Hauptleitungen nach Dimension. Das ist, was das Layout nahelegt: eine Mengenermittlung, die Sie mit Ihren eigenen Details abgleichen müssen, keine Liste zum Bestellen.

Hauptleitungen liegen unter dem Gelände abzüglich einer Überdeckung (4 ft oder 1.2 m), damit sie in 3D gezeichnet und modelliert werden können; die Drücke oben hängen nie davon ab.

## Im Plan und in Dateien

Der Plan, die PDF und die DWG- oder DXF-Datei führen die Hauptleitungen auf **C-WATR-MAIN** mit ihren Dimensionen auf **C-WATR-TEXT**, Hydranten auf **C-WATR-HYDR**, Ventile auf **C-WATR-VALV** und die Formteile auf **C-WATR-FITT**. Der LandXML-Export schreibt ein Wasserrohrnetz (ein Bauwerk für jeden Knoten, ein Rohr für jede Hauptleitung, Hydranten benannt); der LandXML-Import liest eines zurück als Wasserleitungen, ohne Bedarfe, Pumpen oder Ventile, die LandXML nicht enthält. Der IFC-Export schreibt die Hauptleitungen als Rohrsegmente, Hydranten, Ventile und Formteile in einem Wassersystem. Diese Dateien wurden mit unserem eigenen Leser und Schreibern geprüft; probieren Sie sie in Ihren anderen Programmen aus und sagen Sie uns, was sie melden.

## Was noch nicht vorhanden ist

Wasserqualität und Wasseralter, Steuerungen und Regeln über das Ein-/Aus-Muster einer Pumpe hinaus, andere Ventilarten, Bedarf nach Druck, Rohre mit wechselndem Durchmesser und Abwasserströme über die Zeit. Siehe [Noch nicht umgesetzt](topic:not-built-yet). Schmutzwasser-Bemessungsabflüsse, eine andere Berechnung, stehen unter [Schmutzwasser-Bemessungsabflüsse](topic:sanitary-design).
