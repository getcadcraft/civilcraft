---
title: Plan-Layer
summary: Die festen Layernamen, Farben und Linienstärken, die CivilCraft auf dem Bildschirm, in DXF und in PDF verwendet, und welche Anzeigeeinstellung jeweils steuert.
keywords: Layer, Layernamen, ncs, Farben, aci, Linienstärken, DXF-Layer, PDF, Anzeigeeinstellungen, Linienführung
from: c2aa8475
---

Alles im Plan gehört zu einem Layer. Die Namen folgen dem üblichen Schema für Tiefbau-Layer (Fachbereich, Hauptgruppe, Untergruppe). Die Layer sind in dieser Version fest vorgegeben: Sie können sie nicht umbenennen, ihre Farben nicht ändern und keine eigenen hinzufügen. In DXF hat jeder Layer die angegebene Farbnummer; in PDF mit {{ui:Layerfarben}} werden dieselben Farben verwendet, und mit {{ui:Schwarz}} wird alles schwarz gedruckt.

| Layer | Enthält | Farbe (DXF-Nummer) | Angezeigt, wenn |
|---|---|---|---|
| C-TOPO-MINR | Nebenhöhenlinien | Grau (8) | {{ui:Höhenlinien}} |
| C-TOPO-MAJR | Haupthöhenlinien | Weiß oder Schwarz (7) | {{ui:Höhenlinien}} |
| C-TOPO-TEXT | Höhenlinienbeschriftung | Weiß oder Schwarz (7) | {{ui:Höhenlinien}} und {{ui:Höhenlinienbeschriftung}} |
| C-TOPO-TINN | Dreieckskanten | Grau (8) | {{ui:Dreiecke}} |
| C-TOPO-BRKL | Bruchkanten und Begrenzung | Orange (30) | {{ui:Bruchkanten}} |
| C-TOPO-BNDY | Geländemodellrand | Weiß oder Schwarz (7) | {{ui:Geländemodellrand}} |
| C-TOPO-SLOP | Gefällepfeile | Cyan (4) | {{ui:Gefällepfeile}} |
| V-NODE | Vermessungspunkte | Grün (3) | {{ui:Punkte}} |
| V-NODE-TEXT | Punktbeschriftungen: Nummer, Höhe, Beschreibung | Grün (3) | {{ui:Punkte}} und {{ui:Punktbeschriftung}} |
| V-NODE-LINE | Linien aus Linienschlüsseln (Gruppen, die keine Bruchkanten sind) | Grün (3) | {{ui:Punkte}} |
| C-ROAD-CNTR | Trassenachsen | Rot (1) | Immer |
| C-ROAD-STAN | Stationsmarkierungen und -beschriftungen, PC und PT | Rot (1) | Immer |
| C-ROAD-CORR | Korridorränder | Gelb (2) | Immer |
| C-ROAD-SCTN | Schnittlinien (wo Querprofile geschnitten werden) | Grau (8) | Wenn die Trasse Schnittlinien hat |
| C-GRAD-PADS | Bauplatzumrisse | Blau (5) | Immer |
| C-GRAD-DAYL | Böschungsschnittlinien | Magenta (6) | Immer |
| C-GRAD-SLOP | Gefällelinien der Geländemodellierung | Magenta (6) | Immer |
| C-GRAD-FEAT | Feature-Linien (3D) | Grün (3) | Immer |
| C-ROAD-SWPT | Schleppkurven: Umriss, äußerste Radspuren, Name | Orange (30) | Immer |
| C-STRM-PIPE | Rohre | Blau (5) | {{ui:Rohre}} |
| C-STRM-STRC | Bauwerke | Blau (5) | {{ui:Rohre}} |
| C-STRM-TEXT | Rohr- und Bauwerksbeschriftungen | Blau (5) | {{ui:Rohre}} |
| C-STRM-PROB | Rohre und Bauwerke mit Problemen | Rot (1) | {{ui:Rohre}} |

Bruchkanten werden nur gezeichnet, solange unter **Anzeige** bei **Oberfläche** {{ui:Bestandsgelände}} eingestellt ist; die Begrenzung wird bei beiden Oberflächen gezeichnet.

## Linienstärken im PDF

| Stärke | Layer |
|---|---|
| 0.50 mm | Trassenachsen, Bauplatzumrisse, Rohre, problematische Rohre |
| 0.35 mm | Haupthöhenlinien, Böschungsschnittlinien, Bauwerke |
| 0.25 mm | Bruchkanten |
| 0.13 mm | Nebenhöhenlinien |
| 0.09 mm | Dreieckskanten, Gefällelinien der Geländemodellierung |
| 0.18 mm | Alles Übrige |

DXF-Dateien enthalten keine Linienstärken; legen Sie sie in Ihrem CAD-Programm nach Layer fest.

## Beschriftungsgrößen

Beschriftungen werden auf dem Papier in diesen Größen ausgegeben: Höhenlinienbeschriftung 2.0 mm, Stationsbeschriftung 1.8 mm, PC- und PT-Beschriftung sowie Rohr- und Bauwerksbeschriftung 1.6 mm, Punktbeschriftung 1.5 mm. Rohrbeschriftungen geben Name, Durchmesser und Gefälle an; Bauwerksbeschriftungen geben Name und Deckelhöhe an. Auf dem Bildschirm bleiben sie beim Zoomen gleich groß. In DXF werden sie für den Maßstab skaliert, der in der Exportmeldung genannt wird; siehe [Den Plan nach DXF exportieren](topic:dxf-export).

## Auf keinem Layer dargestellt

Höhenbänder werden nur auf dem Bildschirm unter der Linienführung gezeichnet. Die Profilansicht gehört nicht zum Plan.
