---
title: Den IFC-Export gegen das IDS eines Auftraggebers prüfen
summary: Laden Sie die .ids-Datei, die Ihnen ein Auftraggeber oder eine Straßenbaubehörde gegeben hat, und sehen Sie unter Probleme jedes exportierte Element, das sie nicht erfüllt.
keywords: IDS, Information Delivery Specification, buildingSMART, Anforderungen, Lieferung, Prüfung, Validierung, QS, IFC-Export, IFC 4.3, Trasse, Straße, Vergabe
from: 183d9a0e
---

## Was Sie tun werden

Ein IDS (Information Delivery Specification, ein buildingSMART-Standard) ist die Liste dessen, was eine IFC-Datei enthalten muss. Öffentliche Vergaben schicken oft eines mit dem Auftrag. CivilCraft prüft die IFC-Datei, die dieses Projekt exportiert, in der IFC-Version, die Sie für den Export gewählt haben, dagegen und listet jedes Element auf, das nicht ausreicht.

## Schritte

1. Öffnen Sie Ihr Projekt.
2. Klicken Sie in der Gruppe **Exportieren** der Symbolleiste auf {{ui:IFC}}. Wählen Sie im Dialog die IFC-Version, die Sie liefern werden.
3. Klicken Sie auf {{ui:Mit IDS prüfen…}}.
4. Klicken Sie auf {{ui:.ids-Datei laden…}} und wählen Sie die Datei. Nichts wird hochgeladen.
5. Lesen Sie das Ergebnis: jede Spezifikation mit {{ui:Bestanden}} oder {{ui:Nicht bestanden}} und wie viele Elemente sie betrifft.
6. Öffnen Sie **Probleme** ({{key:Ctrl+Shift+M}}) und klicken Sie auf einen Fehler, um die Trasse, das Plateau, das Rohr, das Bauwerk oder den Baukörper auszuwählen, aus dem er stammt.

## Was Sie sehen sollten

- Eine Warnung je exportiertem Element und Anforderung, die es verfehlt, mit dem Namen der Spezifikation, dem, was das IDS verlangt, und dem, was der Export hat.
- Der Prüfbericht (unter Probleme) beginnt mit dem IDS: Titel, Version, Autor und die Zahlen jeder Spezifikation.

## Gut zu wissen

- Das IDS wird in der Projektdatei gespeichert, sodass es beim Öffnen des Projekts erneut geprüft wird. Laden oder Vergessen ist ein Schritt, den Sie rückgängig machen können.
- Jede Änderung wird kurz danach erneut geprüft. Große Geländemodelle brauchen länger zum Schreiben, daher wartet die Prüfung dann zwischen den Läufen etwas länger.
- Die Prüfung verwendet dieselbe Datei, die der Export {{ui:IFC}} schreibt, in der zuletzt dort gewählten Version (IFC 4.3, wenn Sie keine gewählt haben).
- Zahlen werden in SI-Einheiten verglichen. Ein Projekt in Fuß wird vorher in Meter umgerechnet.

- Muster im IDS werden als ganzer Wert gelesen. Ein `^` am Anfang und ein `$` am Ende gelten ebenfalls als „ganzer Wert“, wie es die meisten IDS-Dateien meinen.

## Weiter

- [IFC exportieren](topic:ifc)
