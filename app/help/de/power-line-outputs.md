---
title: Freileitungstabellen, Mengen, Blätter und GIS
summary: Seilzug- und Mastentabellen, Materialmengen für eine Tabelle oder TakeoffCraft, Lage- und Längsschnittblätter mit einem Studienbericht als eine PDF sowie GIS-Ebenen mit den Daten jedes Bauteils.
keywords: Seilzugtabelle, Mastentabelle, Mengen, Stückliste, takeoffcraft, Blätter, Bericht, pdf, Längsschnittblatt, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Alles hier befindet sich unter {{ui:Mehr}} in der Gruppe Freileitungen.

| Ausgabe | Was Sie erhalten |
|---|---|
| {{ui:Seilzugtabellen…}} | Je Abschnitt die horizontale Zugkraft und der Durchhang jedes Feldes bei jeder Temperatur; als CSV speicherbar. {{ui:Mastentabelle speichern (CSV)}}: Rolle, Element, Gelände, Befestigung, größte Last, Nennlast, OK, Vorschlag, Fundament, Ausschwenkung und Abhebung jedes Mastes |
| {{ui:Mengen…}} | Leiter (Kettenlinienlängen × Leiter × Stromkreise + 2 % für Verbinder und Endabspannungen), Maste und Betriebsmittel nach Bibliothekselement, Kabel, Graben, Aushub, Leerrohre und Muffen. CSV, Excel oder eine TakeoffCraft-Mengendatei |
| {{ui:Blätter und Bericht…}} | Eine PDF: der Plan; ein Längsschnittblatt für jede Leitung mit dem Leiter bei den von Ihnen gewählten Lastfällen und einem Streifen mit Feldlängen, Durchhängen und geringsten Abständen; und ein Studienbericht (Regelwerk, Abschnitte, Seilzugtabellen, Maste, jede Prüfung) |
| {{ui:Nach GIS exportieren…}} | Maste, Felder, Kabeltrassen, Betriebsmittel und Hindernisse als Ebenen mit ihren Daten (Höhen, Lasten, Durchhänge, Abstände, was versagt), als GeoPackage, Shapefiles, GeoJSON, KML oder KMZ |

GeoJSON und KML benötigen das Koordinatensystem des Projekts ([Koordinatensysteme](topic:coordinate-systems)). Ohne dieses enthalten GeoPackage und Shapefiles die eigenen Zahlen des Projekts.
