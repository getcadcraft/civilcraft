---
title: Auswertungen: Listen, die mit den Objekten verknüpft sind
summary: Gespeicherte Auswertungen mit Zeilen aus Pflanzen, bepflanzten Flächen, Pflasterungen, Mauern, Stufen, Geländemodifikatoren oder allen Mengen; eigene Spalten und Formeln, Gruppen und Summen; CSV, XLSX und eine Tabelle auf den Blättern, immer aktuell.
keywords: auswertung, liste, pflanzenliste, liste befestigter flächen, mengen, spalten, formel, summe, summieren, zählen, gruppe, filter, csv, xlsx, tabellenkalkulation, tabelle auf blatt
from: 11bc1bac
---

{{ui:Auswertungen}} (Landschaft › Mehr) öffnet die Auswertungen dieses Projekts. Beim ersten Mal werden die **Pflanzenliste** und die **Liste der befestigten Flächen und Flächen** für Sie erstellt. Eine Auswertung wird jedes Mal aus den Objekten berechnet, wenn sie angezeigt, ausgegeben oder auf ein Blatt gesetzt wird: Ändern Sie ein Beet, ändern sich seine Anzahlen überall.

- **Zeilen aus**: Pflanzen (eine Zeile je Art, Sorte und Größe), bepflanzte Flächen, Pflasterungen, Mauern, Stufen, Geländemodifikatoren (Abtrag und Auftrag) oder alle Mengen.
- **Spalten**: ein Feld (`qty`, `area`, `botanical` oder ein Name in eckigen Klammern wie `[Net area]`) oder eine Formel: `+ - * / ^ %`, `&` zum Verbinden von Text, `= <> < <= > >=` sowie `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Eine Formel, die nicht berechnet werden kann, zeigt `#ERR` (oder `#DIV/0`) in ihrer Zelle. Formeln werden vom eigenen Parser von CadCraft gelesen; nichts darin wird als Code ausgeführt.
- **Summe** je Spalte (Summe, Anzahl, Mittelwert, kleinster, größter Wert), **Gruppieren nach** (Zwischensummen je Gruppe) und **Nur Zeilen, wo**.
- {{ui:Als CSV speichern}}, {{ui:Als XLSX speichern}}, und **Diese Auswertung auf die Blätter setzen** (Blätter › Auswertungen zeichnet sie als Tabelle, über so viele Blätter wie nötig).

Beschriftungen an Pflanzen und Flächen nutzen dieselben Feldnamen (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
