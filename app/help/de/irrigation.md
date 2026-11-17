---
title: Bewässerungsplanung
summary: Eine Berechnungshilfe, kein beglaubigter Entwurf: Köpfe, Verteilleitungen, Hauptleitung, Ventile und Tropfleitungen auf dem Grundstück; Zonen aus den Rohren ermittelt; Druckverlust nach Hazen–Williams, ungünstigster Kopf, Durchfluss und Druck gegen die Versorgung, Niederschlagsraten, Laufzeiten, Abdeckung und eine Stückliste.
keywords: Bewässerung, Regner, Sprinkler, Sprühdüse, Rotor, Rotordüse, Sprudler, Tropf, Tropfleitung, Tropfer, Ventil, Zone, Station, Steuergerät, Hauptleitung, Verteilleitung, Anschlusspunkt, Wasserversorgung, Druck, psi, kPa, Durchfluss, gpm, Reibungsverlust, Hazen–Williams, Niederschlagsrate, Laufzeit, Abdeckung, Kopf an Kopf, Stückliste
from: 7d6342c1
---

:::warning
Dies ist eine Berechnungshilfe, kein beglaubigter Entwurf: Ein Bewässerungsplaner prüft jedes Ergebnis, bevor etwas gebaut wird.
:::

## Das System anlegen

1. Wählen Sie im Bereich **Bewässerung** links den **Kopf**, seinen **Sektor** und wo der Sektor beginnt, sowie die Rohrdurchmesser für Verteilleitungen und die Hauptleitung.
2. {{ui:Irrigation}} › {{ui:Point of connection}}: Klicken Sie, wo die Wasserversorgung anschließt. Stellen Sie in den Eigenschaften den **Druck**, den **verfügbaren Durchfluss** sowie den Verlust durch Zähler und Rückflussverhinderer ein.
3. {{ui:Irrigation}} › {{ui:Valve}}: Klicken Sie, wo das Ventil jeder Zone hinkommt. Ein Ventil beginnt eine Zone.
4. {{ui:Irrigation}} › {{ui:Head}}: Klicken Sie, um Köpfe zu setzen; jeder Klick setzt einen.
5. {{ui:Irrigation}} › {{ui:Lateral pipe}}: Klicken Sie von einem Ventil über seine Köpfe und drücken Sie {{key:Enter}}. {{ui:Mainline}}: von dem Anschlusspunkt zu jedem Ventil.

Rohrenden rasten an Köpfen, Ventilen, der Versorgung und anderen Rohrenden ein, sodass das Netz zusammenhängt. Eine Zone ist alles, was von ihrem Ventil über Verteilleitungen erreicht wird; die Hauptleitung führt jeweils eine Zone.

## Tropf

{{ui:Irrigation}} › {{ui:Drip line}}: Klicken Sie entlang der Leitung, beginnend dort, wo sie gespeist wird (ein Verteilleitungsende oder ein Ventil). Stellen Sie den **Tropferdurchfluss** und den **Abstand** in den Eigenschaften ein; ihr Durchfluss ergibt sich aus den Tropfern entlang ihr.

## Die Prüfung

{{ui:Irrigation}} › {{ui:Check the system…}} listet jede Zone auf:

| Spalte | So wird sie berechnet |
|---|---|
| Durchfluss | Die Durchflüsse der Köpfe (und der Tropfleitungen) addiert |
| Am Ventil | Der Betriebsdruck des ungünstigsten Kopfes plus die Rohrverluste bis dorthin (Hazen–Williams, Innendurchmesser des Rohrs, Höhenunterschied) und der Verlust durch das Ventil |
| An der Versorgung | Dasselbe plus der Verlust der Hauptleitung, die diese Zone führt, sowie der Verlust durch Zähler und Rückflussverhinderer |
| Niederschlag | Der Durchfluss der Köpfe über die Fläche, die sie bei Kopf-an-Kopf-Abstand bewässern |
| Minuten pro Woche | Zur Anwendung der Einstellung **Wasser pro Woche** |
| Probleme | Geschwindigkeit über dem Grenzwert, ein Kopf außerhalb seines Druckbereichs, Sprühdüsen und Rotoren an einem Ventil, zu wenig Druck oder Durchfluss an der Versorgung, Köpfe ohne Zone, Schleifen |

Wählen Sie ein Ventil, um die Werte seiner Zone und seinen ungünstigsten Kopf im Plan eingekreist zu sehen. Die Stückliste zählt Köpfe nach Art und Sektor, Rohre nach Durchmesser, Ventile, Tropfleitung und Tropfer sowie die Stationen des Steuergeräts. **Als CSV speichern** sichert beide.

Einstellungen im Bereich **Bewässerung**: **Hazen–Williams-C** (150 für neue Kunststoffrohre), die **höchste Fließgeschwindigkeit** im Rohr (1.5 m/s), der **Verlust durch ein Ventil** und **Wasser pro Woche**. Sie sind als Standardwerte gekennzeichnet.

## Abdeckung

{{ui:Irrigation}} › {{ui:Show coverage}} zeigt, wie viel der Fläche die Köpfe unbewässert lassen, wie viel von zwei oder mehr Köpfen bewässert wird und welche Köpfe keinen Nachbarn erreichen (Abstand Kopf an Kopf).

## Köpfe

Die aufgelisteten Köpfe sind **allgemeine** Arten, die CadCraft aus Bemessungs-Niederschlagsraten erstellt hat (feste Sprühdüsen, Rotordüsen, Zahnradrotoren, Sprudler, Mikrosprüher, Tropfer), keine Produkte eines Herstellers. **Köpfe aus einer Datei hinzufügen…** liest Ihre eigenen Köpfe (eine JSON-Liste mit Wurfweite, Durchfluss oder Niederschlagsrate und Druckbereich je Kopf); sie werden mit dem Projekt gespeichert. Veröffentlichte Daten eines Herstellers kommen nur mit dessen nachweislicher Genehmigung hinein.

Unter den allgemeinen Köpfen enthält die Liste **typische Köpfe** (ihre Namen enden auf "typical values"): Düsengrößen fester Sprühdüsen, Rotordüsen und Zahnradrotoren, Mikrosprüher, Sprudler und Tropfer, mit Radius, Durchfluss und Druckbereich. CadCraft berechnet sie aus veröffentlichter Mathematik (die Ausflussgleichung für den Durchfluss, die Skalierung der Strahlweite für den Radius) und aus nominalen Durchflussklassen, nur aus offenen Quellen; keine Tabelle eines Herstellers wird übernommen. Wählen Sie einen aus; die Auswahl zeigt dann seine Grundlage und Lizenz. Ein Projekt, das einen verwendet, speichert den Kopf und seine Quelle in der Projektdatei. Sie dienen der Planung: Prüfen Sie vor dem Bau die eigenen Daten des tatsächlichen Kopfes.
