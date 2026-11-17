---
title: Pflanzendatensätze, Sorten und Liefergrößen
summary: Die eigene Pflanzenliste Ihres Projekts als Tabelle: Sorten, Liefergrößen (Behälter, Wurzelballen, Stammumfang, Stammhöhe), Dichte, Spezifikationshinweise, CSV ein und aus; jede gesetzte Pflanze gibt eine Größe an; Pflanzenzeichen nach Maßstab sowie eigene Zeichen und 3D-Modelle.
keywords: Pflanzentabelle, Pflanzendatenbank, Sorte, Varietät, Liefergröße, Behälter, Ballen, Wurzelballen, wurzelnackt, Stammumfang, Stammhöhe, Dichte, Pflanzen pro Quadratmeter, Spezifikation, Spezifikationshinweise, Pflanzenzeichen, Block, eigenes Zeichen, 3D-Pflanze, Detailstufe, Maßstab
from: 12251beb
---

Öffnen Sie {{ui:Pflanzentabelle}} aus dem Menü {{ui:Mehr}} der Gruppe Landschaft oder aus dem Bereich Pflanzen. Jede Zeile ist ein Pflanzendatensatz in der eigenen Liste dieses Projekts (ein Datensatz aus der Pflanzenliste wird beim Hinzufügen kopiert). Jede Bearbeitung wird wie eine importierte Datei geprüft und ist ein Schritt für Rückgängig.

## Die Spalten

- **Botanischer Name**, **Deutscher Name**, **Typ**, **Höhe** und **Breite** im ausgewachsenen Zustand (Meter).
- **Abstand** (Mitte zu Mitte) oder **Dichte** (Pflanzen pro m²). Ein Beet eines Datensatzes mit Dichte und ohne Abstand wird mit dieser Dichte gefüllt, nach dessen eigenem Muster (dreieckig oder quadratisch).
- **Liefergrößen**: ein Eintrag pro Größe, getrennt durch `;`. Jeder Eintrag ist eine Kennung, eine Art (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) und dann beliebige dieser Angaben: ein Volumen `10L`, eine Höhe `h0.6`, eine Breite `s0.4`, ein Stammumfang `g14-16` (cm), eine Stammhöhe `st1.8`. Beispiel: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Sorten**: Namen, getrennt durch `;`. Eine Sorte behält ihre eigenen Größen und Hinweise, wenn die importierte Datei sie hatte.
- **Spezifikationshinweise**.

{{ui:Duplizieren}} kopiert eine Zeile unter einem neuen Schlüssel; {{ui:Als CSV speichern}} und {{ui:Als Pflanzendatei speichern}} schreiben die Liste heraus (CSV-Zeilen für Sorten stehen unter ihrer Art, mit `cultivar_of`). Das Importieren einer CSV- oder Pflanzendatei führt sie zusammen.

## Ihre eigene Bibliotheks-Pflanzenliste

Melden Sie sich bei Ihrem CadCraft-Konto an (Einstellungen, Ihre Add-ons, Anmelden). Dann kann die Pflanzentabelle die Liste nutzen, die Sie in der Bibliothek führen:

- {{ui:Aus meiner Bibliotheksliste}} übernimmt Ihre eigenen Pflanzenelemente (auch solche, die noch auf Prüfung warten). Eine Pflanze, die Sie hier schon haben, wird aus der Bibliothek aktualisiert; die Sorten, Liefergrößen, Dichte und Spezifikation, die Sie hier ergänzt haben, bleiben erhalten.
- {{ui:Als Pflanzenliste speichern}} speichert jede Zeile als eigenes Pflanzenelement der Bibliothek, ein Element pro Art: Eine neue Pflanze ist ein neues Element, eine geänderte Pflanze eine neue Version, eine unveränderte bleibt unberührt. Setzen Sie zuerst das Häkchen: Beim Speichern werden die Pflanzen unter CC0 veröffentlicht. Ein erster öffentlicher Upload von einer noch nicht vertrauenswürdigen Person wird vor dem Erscheinen von einer Person geprüft, wie jeder Upload auch.

Die Bibliothek speichert den Grunddatensatz der Pflanze. Sorten, Liefergrößen, Dichte und Spezifikationshinweise bleiben im Projekt und in der Pflanzendatei ({{ui:Als Pflanzendatei speichern}}); der Dialog sagt bei jedem Speichern, wie viele Zeilen davon betroffen sind.

## Eine gesetzte Pflanze gibt eine Größe an

Wählen Sie eine Pflanze, eine Hecke oder eine Mischzeile eines Beets oder einer bepflanzten Fläche: Hat der Datensatz Sorten oder Liefergrößen, wählt {{ui:Sorte und Größe}} eine aus. Die Pflanzenliste zählt dann nach Art, Sorte und Größe, und eine Beschriftung kann sie anzeigen: `{botanical} '{cultivar}' {size}` oder `{full}`.

## Pflanzenzeichen nach Maßstab

{{ui:Pflanzendarstellung}} (Landschaft › Mehr) legt fest, wie Pflanzen im Plan gezeichnet werden: **automatisch** (gröber als 1:500 ein Kreis mit der Breite, zwischen 1:200 und 1:500 ein Umriss mit Mittelpunkt, feiner das detaillierte Zeichen; beide Maßstäbe lassen sich ändern) oder eine Stufe für alle Maßstäbe. Der Dialog Blätter hat dafür einen eigenen **Detailgrad der Pflanzen im Plan**.

Auf einem Datensatz im Bereich Pflanzen liest {{ui:Eigenes Zeichen…}} eine SVG oder einen Block einer DXF- bzw. DWG-Zeichnung und zeichnet ihn mit der Breite der Pflanze in der detaillierten Stufe. {{ui:Eigenes 3D-Modell…}} liest eine OBJ, STL oder GLB; unter Pflanzendarstellung wählen Sie **Eigenes Modell jedes Datensatzes**, um es in 3D zu sehen. Dateien sind begrenzt (512 KB SVG, 2000 Formen, 50 000 Dreiecke) und werden im Projekt gespeichert. SVG-Transformationen werden nicht angewendet (Sie erhalten eine Meldung, wenn eine Datei welche enthält). Siehe [Pflanzendarstellung, eigene Zeichen und 3D-Pflanzen](topic:plant-graphics) für die Stufen, die Grenzen und was eine GLB-Datei enthalten darf.
