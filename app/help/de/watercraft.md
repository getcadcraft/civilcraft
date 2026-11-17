---
title: WaterCraft: Bedarfe, Löschwasser, Ausfälle und Wasseralter
summary: Mit dem WaterCraft-Add-on machen Sie Kunden zu Bedarfen an Ihren Wasserleitungen, prüfen den verfügbaren Durchfluss an jedem Hydranten, sehen, welcher Leitungsausfall am stärksten wirkt, und verfolgen Wasseralter und Chlor über einen Tag.
keywords: watercraft, Wasserverteilung, Bedarfe, Kunden, Spitzenfaktor, Bedarfsmuster, Löschwasser, Hydrant, Restdruck, Kritikalität, Ausfall, Absperrabschnitt, Wasseralter, Chlor, Rest, Quellenverfolgung, Sackgasse, csv, Add-on
from: 76809f01
---

WaterCraft ist ein Add-on, das auf dem Wassernetz arbeitet, das Sie bereits mit den Werkzeugen für Wasserleitungen gezeichnet haben. Es fügt dem rechten Bereich eine Registerkarte mit vier Abschnitten hinzu.

:::warning
Nur eine Berechnungshilfe. Sie wurde an erfundenen Netzen gegen Handrechnungen geprüft, nicht an einem echten Versorgungsmodell. Ein Wasserbau-Ingenieur muss jedes Ergebnis prüfen. Es gibt noch keine Druckerhöhungsanlagen, keinen Zerfall zweiter Ordnung und keine Szenarien.
:::

## Was Sie tun

- Kunden als Bedarfe in das Netz setzen.
- Die Hydranten finden, die den benötigten Durchfluss nicht erreichen.
- Die Leitungen finden, deren Ausfall am stärksten ins Gewicht fällt.
- Altes Wasser und niedrigen Chlorgehalt finden.

## Schritte

1. Öffnen Sie {{ui:Einstellungen}} › {{ui:Add-ons}} und schalten Sie {{ui:WaterCraft (Wasserverteilung)}} ein. Eine Registerkarte {{ui:WaterCraft}} erscheint im rechten Bereich.
2. Zeichnen Sie zuerst einen Hochbehälter, Knotenpunkte und Leitungen mit den Werkzeugen für [Wasserleitungen](topic:water-mains). Ohne Netz weist Sie die Registerkarte darauf hin.
3. Fügen Sie unter {{ui:Bedarfe}} je Kunde eine Zeile ein: ID, x, y, Art, Menge. Wählen Sie den {{ui:Spitzenfaktor}} und das {{ui:Stundenmuster}} (Wohntag, Gewerbetag, gleichbleibend oder das Muster beibehalten). Drücken Sie {{ui:Prüfen}}, um zu sehen, wo jeder Kunde liegt (der nächste Knotenpunkt), und dann {{ui:In das Netz übernehmen}}. Mit {{ui:Rückgängig}} nehmen Sie die Bedarfe wieder zurück.
4. Stellen Sie unter {{ui:Löschwasser}} den benötigten Durchfluss und den Restdruck ein, wählen Sie, ob der Restdruck {{ui:Nur am Hydranten}} oder {{ui:Überall im System (strenger)}} gehalten wird, und drücken Sie {{ui:Lauflänge}}. Jeder Hydrant wird mit dem schlechtesten zuerst als erfüllt oder unterschritten aufgelistet.
5. Wählen Sie unter {{ui:Welche Leitung am wichtigsten ist}} entweder {{ui:eine Leitung nach der anderen}} oder {{ui:einen Absperrabschnitt nach dem anderen}} und drücken Sie {{ui:Lauflänge}}. Jeder Ausfall zeigt den abgeschnittenen Bedarf, die abgeschnittenen Knotenpunkte, die Knotenpunkte, die neu unter den Mindestdruck fallen, und den niedrigsten verbleibenden Druck.
6. Wählen Sie unter {{ui:Wasseralter und Chlor}}, was verfolgt werden soll (Wasseralter, Chlor oder eine Quellenverfolgung), stellen Sie die Stunden und die gewünschten Grenzwerte ein und drücken Sie {{ui:Lauflänge}}. Knotenpunkte außerhalb Ihrer Grenzwerte werden aufgelistet.
7. Drücken Sie unter jeder Tabelle {{ui:Als CSV speichern}}, um sie zu behalten.

## Hinweise

- Der benötigte Löschwasserdurchfluss sowie der Verbrauch je Haushalt oder je Acre sind Startwerte, keine Normen. Verwenden Sie die eigenen Angaben Ihres Versorgers.
- Eine Leitung, die teilweise von einem Absperrschieber erfasst wird, gilt als ganz geschlossen. Der angezeigte Ausfall ist daher etwas schlechter als ein realer.
- Lassen Sie den Abschnitt Wasserqualität lange genug laufen, bis sich das Tagesmuster wiederholt, bevor Sie den letzten Tag lesen.
- {{ui:Stopp}} beendet einen langen Lauf vorzeitig; die Liste zeigt dann nur, was erledigt wurde.
- Ihr Netz bleibt in diesem Projekt und auf diesem Computer. Nichts wird irgendwohin gesendet.
