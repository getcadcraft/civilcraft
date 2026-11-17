---
title: Lageplan- und Längsschnittblätter
summary: Eine Trasse als Satz von Lageplan- und Längsschnittblättern in einer PDF plotten, mit Anschlusslinien zwischen den Blättern.
keywords: Lageplan und Längsschnitt, Blätter, plotten, PDF, Anschlusslinie, Planerstellung, Straßenpläne, Längsschnittplot, Überhöhung, vertikale Überhöhung, Blattsatz
from: 34b4ec78
---

Lageplan- und Längsschnittblätter sind die übliche Darstellung für Straßenpläne: Jedes Blatt zeigt einen Abschnitt der Straße zweimal, den Lageplan oben und den Längsschnitt unten, im gleichen horizontalen Maßstab, sodass eine Station in beiden an derselben Stelle liegt.

## Blätter erstellen

1. Wählen Sie die Trasse. Klicken Sie unter **Eigenschaften** auf {{ui:Lageplan- und Längsschnittblätter}}.
2. Wählen Sie das **Papier**, den **Planmaßstab** und die **Profilüberhöhung** (wie viel mal höher der Längsschnitt gezeichnet wird, als er lang ist; zum Start 10×). Der Dialog zeigt, wie viele Blätter daraus entstehen und wie viel der Trasse jedes Blatt zeigt.
3. Um nur einen Teil der Trasse zu plotten, ändern Sie **Von Station** und **Bis Station**.
4. Klicken Sie auf {{ui:PDF herunterladen}}. Die PDF hat eine Seite pro Blatt.

## Was auf einem Blatt zu sehen ist

| Teil | Was er zeigt |
|---|---|
| Lageplan | Alles im Plan (Höhenlinien, Vermessungspunkte, Trasse mit Stationierung, Korridore, Bauplätze, Feature-Linien, Rohre, Schnittlinien), so gedreht, dass dieser Abschnitt quer über das Blatt verläuft, mit einem Nordpfeil, der passend gedreht ist |
| Anschlusslinien | Eine Strich-Punkt-Linie rechtwinklig zur Trasse an jedem Ende, das auf einem anderen Blatt weitergeht, beschriftet mit „Anschlusslinie Station 5+50.00, siehe Blatt 2“ |
| Längsschnitt | Das Bestandsgelände (gestrichelt), der Planungslängsschnitt (rot), das Gefälle jeder Geraden und PVI, Höhe, L und K jeder Ausrundung; Stationen unten, Höhen auf beiden Seiten |
| Schriftfeld | Projektname, Trasse und ihr Stationsbereich, „Blatt 1 von 3“, der horizontale und vertikale Maßstab und die Überhöhung |

Der Abschnitt pro Blatt ist so lang, wie das Planfenster im Maßstab zulässt, abgerundet auf ganze 50 ft (20 m) bei langen Abschnitten oder ganze 10 ft (5 m) bei kurzen.

:::note
Passen die Höhen des Längsschnitts bei der gewählten Überhöhung nicht, zeichnet CivilCraft jedes Blatt mit der größten Überhöhung aus 10×, 5×, 4×, 2× und 1×, die passt, und die Statusleiste meldet das. Eine gekrümmte Trasse wird um die Richtung vom Anfang bis zum Ende jedes Abschnitts gedreht, sodass die Straße auf dem Blatt leicht steigen oder fallen kann.
:::
