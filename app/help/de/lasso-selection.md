---
title: Vermessungspunkte mit dem Lasso auswählen
summary: Shift halten und einen freihändigen Umriss um Vermessungspunkte ziehen, um sie als Fenster, Kreuzung oder Zaun auszuwählen; mit Space während des Ziehens umschalten. Ein gerader Zug zeichnet weiterhin ein Rechteck.
keywords: Lasso, Freihand, Punkte auswählen, Auswahl, Fenster, Kreuzung, Zaun, Space, Polygon, Rechteckauswahl, Shift ziehen
from: 3dd4fcaa
---

## Was Sie lernen

Wie Sie Vermessungspunkte auswählen, indem Sie sie umzeichnen, wenn ein Rechteck Punkte erfassen würde, die Sie nicht wollen.

## Ein Lasso zeichnen

1. Klicken Sie auf {{ui:Wählen}} (oder drücken Sie {{key:V}}).
2. Halten Sie {{key:Shift}}, drücken Sie auf dem Plan und ziehen Sie **um** die gewünschten Punkte herum, zuerst **nach rechts**.
3. Lassen Sie los.

Die Punkte innerhalb des Umrisses werden zur Auswahl hinzugefügt. Ein Zug, der nahe an einer geraden Linie bleibt, zeichnet wie bisher ein Rechteck; sobald er von dieser Linie abweicht (mehr als etwa 12 Pixel), wird er zu einem Lasso.

## Fenster, Kreuzung und Zaun

| Sie ziehen | Lasso | Wählt aus |
|---|---|---|
| Zuerst nach rechts | Fenster (durchgezogener Umriss) | Die Punkte innerhalb davon |
| Zuerst nach links | Kreuzung (gestrichelt, grün) | Die Punkte innerhalb davon und die Punkte, die der Umriss berührt |
| {{key:Space}} während des Ziehens drücken | Fenster, dann Kreuzung, dann Zaun | Zaun (ein gestrichelter oranger Pfad, nicht geschlossen): die Punkte, über die der Pfad führt |

Die Statusleiste nennt das Lasso, während Sie ziehen. {{key:Esc}} während des Ziehens bricht es ab und wählt nichts aus.

:::tip
Ein Zaun ist der schnelle Weg, die Messpunkte entlang eines Bordsteins oder einer Grabenlinie zu wählen: Ziehen Sie entlang davon und lassen Sie los.
:::

## Siehe auch

- [Vermessungspunkte auswählen, kopieren und einfügen](topic:copy-paste-points)
- [Tasten und Maus](topic:keyboard)
