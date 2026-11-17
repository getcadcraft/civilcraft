---
title: Das Baufeld in 3D exportieren
summary: Speichern Sie, was die 3D-Ansicht zeigt, als GLB- oder OBJ-Datei für andere 3D-Programme, in Metern mit Y nach oben, um einen lokalen Ursprung, den die Datei speichert.
keywords: glb, gltf, obj, 3D-Export, 3D exportieren, Modellexport, Spiel-Engine, Visualisierung, 3D-Betrachter, Meter, Y nach oben, Ursprung, lokaler Ursprung, State Plane
from: 07d23992
---

Die 3D-Ansicht exportiert, was sie zeigt, als 3D-Modell, das ein anderes Programm öffnen kann: einen 3D-Betrachter, einen Modellierer, eine Spiel-Engine oder ein Visualisierungswerkzeug.

## Exportieren

1. Öffnen Sie die 3D-Ansicht ({{key:D}}) und wählen Sie mit {{ui:Anzeigen}}, was angezeigt wird. Was ausgeblendet ist, wird nicht exportiert.
2. Klicken Sie in der Leiste auf {{ui:GLB}} oder {{ui:OBJ}}.
   Die Datei wird als „*Projektname*-3d.glb“ bzw. „-3d.obj“ heruntergeladen, und die Statusleiste nennt den Ursprung.

## Was die Dateien enthalten

| | GLB | OBJ |
|---|---|---|
| Flächen | Netze mit Normalen und den Farben der Höhenbänder oder Flächen | Netze mit Normalen (ohne Farben) |
| Rohre und Bauwerke | Runde Netze, fehlerhafte in Rot | Runde Netze |
| Höhenlinien, Bruchkanten, Trassen, Stationierungsstriche, Korridor- und Bauplatzlinien | Linien, je Satz in seiner Farbe | Linien-Einträge (`l`) |
| Vermessungspunkte | Punkte | Punkt-Einträge (`p`) |

Jeder Satz behält seinen Namen („Bestehendes Gelände“, „Rohre“, „Haupt-Höhenlinien“ und so weiter), damit Sie ihn im anderen Programm ausblenden oder gestalten können.

## Einheiten, Achsen und Ursprung

- **Meter.** Ein Projekt in Fuß wird aus US-Vermessungsfuß umgerechnet (1 ft = 1200/3937 m).
- **Y nach oben**, die übliche Konvention für diese Formate: Der Rechtswert wird +X, die Höhe +Y und der Hochwert −Z.
- **Wahrer Maßstab.** Die Überhöhung der Ansicht wird nicht angewendet.
- **Ein lokaler Ursprung.** State-Plane-Koordinaten sind Millionen Fuß, zu groß für die Zahlen mit einfacher Genauigkeit, die diese Formate speichern. Daher wird die Datei relativ zu einem nahen Ursprung geschrieben: dem eigenen Ursprung des bestehenden Geländes für Rechts- und Hochwert und seiner niedrigsten Höhe, abgerundet. Der Ursprung in Projekteinheiten wird in der Datei festgehalten: in einer GLB als `extras` an der Szene und ihrem obersten Knoten, in einer OBJ als Kommentarzeile nahe dem Anfang (`# origin easting … northing … elevation …`). Um das Modell zurück in die Projektkoordinaten zu setzen, addieren Sie den Ursprung (nach dem Umrechnen von Metern zurück in Fuß bei einem Fuß-Projekt).

## Noch nicht umgesetzt

- Export der überhöhten Ansicht oder Export in Projekteinheiten statt in Metern.
- Texturen, eine Materialdatei für OBJ (.mtl) und Eigenschaften je Objekt (Namen von Rohren und Bauwerken gibt es nur in CivilCraft).
- Export des Korridors als getrennte Körper oder der Profilansicht in 3D.
