---
title: Der Arbeitsbereich Landschaft
summary: Bepflanzungspläne, Geländemodellierung, Pflaster, Mauern, Stufen, Bewässerung und Landschaftsblätter auf demselben Gelände, mit denselben Oberflächen und derselben Datei wie die Tiefbauarbeiten.
keywords: Landschaft, Landschaftsarchitektur, Garten, Bepflanzung, Pflanzen, Bäume, Geländemodellierung, befestigte Flächen, Pflaster, Bewässerung, Sprinkler, Arbeitsbereich, Geländeplanung, Landschaftsplan
from: eea929d1
---

Der Arbeitsbereich Landschaft stellt Werkzeuge für die Landschaftsplanung auf das CivilCraft-Gelände, das Sie bereits haben: dieselben Vermessungspunkte, dasselbe vorhandene Gelände, dieselbe geplante Oberfläche und dieselbe Projektdatei.

## Öffnen

Wählen Sie {{ui:Geländemodell}} › {{ui:Mehr}} › {{ui:Arbeitsbereich Landschaft}}. Die Symbolleiste zeigt dann eine Auswahl **Arbeitsbereich** und eine Gruppe **Landschaft**, und die Gruppen Geländemodell, Entwurf und GIS treten zur Seite, um Platz zu machen. Wählen Sie unter **Arbeitsbereich** die Option **Civil**, um zurückzukehren. CivilCraft merkt sich den zuletzt verwendeten Arbeitsbereich auf diesem Computer.

Der linke Bereich erhält oben drei Abschnitte:

- **Pflanzen**: die Pflanzenliste, zum Suchen und Auswählen dessen, was Sie setzen. Siehe [Die Pflanzenliste](topic:plant-list).
- **Geländeprüfungen**: Neigungsanalyse, Fließpfeile und Wasserstau. Siehe [Geländemodellierung](topic:landscape-grading).
- **Bewässerung**: die Regner und Rohre, die Sie als Nächstes setzen, und die Einstellungen der Wasserversorgung. Siehe [Bewässerung](topic:irrigation).

## Was in der Gruppe Landschaft enthalten ist

| Werkzeug | Was es tut | Thema |
|---|---|---|
| **Pflanze**, **Beet**, **Hecke** | Einzelne Pflanzen, Pflanzbeete, im Pflanzabstand gefüllt, Hecken entlang einer Linie | [Bepflanzung](topic:planting) |
| **Gelände** | Plattformen, Erdwälle, Mulden, Geländebereiche mit Höhenpunkten und Höhenlinien, Prüfungen von Neigung und Abfluss | [Geländemodellierung](topic:landscape-grading) |
| **Befestigte Flächen** | Pflaster, Wege, Mauern, Bordsteine, Rampen und Stufen, die dem Gelände folgen | [Befestigte Flächen](topic:hardscape) |
| **Flächen** | Bepflanzte Flächen: Rasen, Beete, Wiesen und Bodendecker mit Aufbau, um befestigte Flächen herum zugeschnitten | [Bepflanzte Flächen](topic:planted-areas) |
| **Höhen** | Geländeänderungen in Reihenfolge mit Abtrag und Auftrag, Höhenpunkte, Gefällepfeile, Schnittlinien | [Geländeänderungen](topic:ground-modifiers), [Schnitte](topic:landscape-sections) |
| **Bewässerung** | Regner, Rohre, Ventile, Tropfleitungen, die Versorgung, Abdeckung und eine hydraulische Prüfung | [Bewässerung](topic:irrigation) |
| **Mehr** | Aus einer Linie (Objekte bleiben mit den Linien verknüpft), die Pflanzenliste, die Pflanzentabelle, Auswertungen, Pflanzendarstellung, Freiform-Objekte, Landschaftsblätter und der Veröffentlichungssatz, IFC-Export, Pflanzengröße und Beschriftungen | [Objekte aus Linien](topic:objects-from-lines), [Pflanzendatensätze](topic:plant-records), [Auswertungen](topic:worksheets), [Landschaftsblätter](topic:landscape-sheets), [Freiform-Objekte](topic:freeform-objects) |

Alles, was Sie hinzufügen, ist ein einzelner Rückgängig-Schritt, wird in der Projektdatei gespeichert und wird im Plan auf Layern mit den Namen `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` und `L-IRRG-…` gezeichnet, sodass auch die DXF-, DWG- und PDF-Exporte es enthalten.

## Eine Oberfläche für alles

Plattformen, Erdwälle, Mulden, Geländebereiche, Pflaster und Wege werden in die **geplante Oberfläche** eingearbeitet, dieselbe, die Korridore und Bauplätze verwenden. Das **vorhandene Gelände** ändert sich nie. Pflanzen stehen auf dem Gelände, das unter ihnen liegt, und bewegen sich daher, wenn sich die Geländemodellierung ändert. Erdarbeiten zählen die Geländemodellierung der Landschaft mit allem anderen.

:::tip
Neu hier? [Einen Garten entwerfen, von Anfang bis Ende](topic:landscape-walkthrough) führt Sie durch den ganzen Arbeitsbereich auf dem Beispielgelände.
:::
