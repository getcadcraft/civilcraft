---
title: WaterCraft: Bedarfe, Löschwasser, Ausfälle und Wasseralter
summary: Mit dem WaterCraft-Add-on Kunden in Bedarfe an Ihren Wasserleitungen umwandeln, den an jedem Hydranten verfügbaren Durchfluss prüfen, sehen, welcher Leitungsausfall am meisten schadet, und Wasseralter und Chlor über einen Tag verfolgen.
keywords: watercraft, Wasserverteilung, Bedarfe, Kunden, Spitzenfaktor, Bedarfsganglinie, Löschwasser, Hydrant, Restdruck, Kritikalität, Ausfall, abgesperrter Abschnitt, Wasseralter, Chlor, Restchlor, Herkunftsverfolgung, Sackgasse, csv, Add-on
from: 066fb17a
---

WaterCraft ist ein Add-on, das mit dem Wassernetz arbeitet, das Sie bereits mit den Werkzeugen für Wasserleitungen gezeichnet haben. Es fügt dem rechten Bereich einen Reiter mit vier Abschnitten hinzu.

:::warning
Nur eine Berechnungshilfe. Sie wurde an selbst erdachten Netzen gegen Handrechnungen geprüft, nicht an einem echten Versorgungsmodell. Ein Wasseringenieur muss jedes Ergebnis prüfen. Szenarien, Steuerregeln, Ventile und Feldmessungen haben eigene Themen, „Szenarien“ und „Untersuchungen“, in der Hilfe des WaterCraft-Add-ons.
:::

## Was Sie tun werden

- Kunden als Bedarfe in das Netz setzen.
- Die Hydranten finden, die unter dem nötigen Durchfluss liegen.
- Die Leitungen finden, deren Ausfall am meisten ins Gewicht fällt.
- Altes Wasser und niedriges Chlor finden.

## Schritte

1. Öffnen Sie {{ui:Einstellungen}} › {{ui:Add-ons}} und schalten Sie {{ui:WaterCraft (Wasserverteilung)}} ein. Ein Reiter {{ui:WaterCraft}} erscheint im rechten Bereich.
2. Zeichnen Sie zuerst einen Hochbehälter, Knoten und Rohre mit den Werkzeugen für Wasserleitungen (siehe [Wasserleitungen](topic:water-mains)). Ohne Netz sagt Ihnen der Reiter, dass Sie das tun müssen.
3. Fügen Sie unter {{ui:Bedarfe}} einen Kunden pro Zeile ein: ID, x, y, Art, Menge. Wählen Sie den {{ui:Spitzenfaktor}} und das {{ui:Stundenmuster}} (Wohntag, Gewerbetag, gleichmäßig oder das Muster unverändert lassen). Drücken Sie {{ui:Prüfen}}, um zu sehen, wo jeder Kunde liegt (der nächste Knoten), dann {{ui:In das Netz übernehmen}}. Rückgängig nimmt die Bedarfe wieder zurück.
4. Stellen Sie unter {{ui:Löschwasser}} den benötigten Durchfluss und den Restdruck ein, wählen Sie, ob der Restdruck {{ui:Nur am Hydranten}} oder {{ui:Im gesamten System (strenger)}} gehalten wird, und drücken Sie {{ui:Lauflänge}}. Jeder Hydrant wird mit dem schlechtesten zuerst aufgelistet, als erfüllt oder unterschritten.
5. Wählen Sie unter {{ui:Welche Hauptleitung am meisten zählt}} {{ui:eine Leitung nach der anderen}} oder {{ui:ein Ventilabschnitt nach dem anderen}} und drücken Sie {{ui:Lauflänge}}. Jeder Ausfall zeigt den abgeschnittenen Bedarf, die abgeschnittenen Knoten, die Knoten, die neu unter den Mindestdruck fallen, und den niedrigsten verbleibenden Druck.
6. Wählen Sie unter {{ui:Wasseralter und Chlor}}, was verfolgt wird (Wasseralter, Chlor oder eine Herkunftsverfolgung), stellen Sie die Stunden und die gewünschten Grenzwerte ein und drücken Sie {{ui:Lauflänge}}. Knoten außerhalb Ihrer Grenzen werden aufgelistet.
7. Drücken Sie unter jeder Tabelle {{ui:Als CSV speichern}}, um sie zu behalten.

## Hinweise

- Der benötigte Löschwasserdurchfluss und der Verbrauch je Haushalt oder je acre sind Startwerte, keine Normen. Verwenden Sie die eigenen Angaben Ihres Versorgers.
- Eine Leitung, die teilweise von einem Ventil erfasst wird, wird ganz geschlossen, daher ist der gezeigte Ausfall etwas schlechter als ein echter.
- Lassen Sie den Wasserqualitätsabschnitt lange genug laufen, bis sich das Tagesmuster wiederholt, bevor Sie den letzten Tag lesen.
- {{ui:Stopp}} beendet einen langen Lauf früh; die Liste zeigt dann nur, was erledigt wurde.
- Ihr Netz bleibt in diesem Projekt und auf diesem Computer. Nichts wird irgendwohin gesendet.
