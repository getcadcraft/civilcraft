---
title: Browser und Rechner
summary: In welchen Browsern die Apps laufen, was sich zwischen ihnen unterscheidet und was Ihr Rechner braucht.
keywords: chrome, edge, firefox, safari, brave, Browser, mac, windows, linux, ipad, Tablet, webgl, Anforderungen, Arbeitsspeicher
from: a11b09b1
---

Die Apps laufen in einem Webbrowser. Sie erledigen die Arbeit auf Ihrem eigenen Rechner: Ihre Dateien werden dort geöffnet und nie an uns gesendet (siehe [Wohin Ihre Dateien gehen](common:your-files)).

## Welcher Browser

Benutzen Sie eine aktuelle Version von einem dieser Browser:

| Browser | Engine | Hinweise |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Der vollständigste: Ordnerauswahl, Speichern für die Offline-Nutzung, Dateiverknüpfung. |
| Firefox | Gecko | Funktioniert. Einen ganzen Ordner zu öffnen läuft über eine einfachere Auswahl. Das Offline-Speichern geht in privaten Fenstern unter Umständen nicht. |
| Safari | WebKit | Funktioniert auf Mac und iPad. Einen ganzen Ordner zu öffnen läuft über eine einfachere Auswahl. Safari löscht unter Umständen eine Offline-Kopie, die Sie einige Wochen nicht benutzt haben. |

Alle drei Engines sind für die tägliche Arbeit in Ordnung. Wo eine App in einer von ihnen etwas anders macht, zeigt ihre Hilfe die Schritte für Ihren Browser.

## Was sich zwischen Browsern unterscheidet

- **Einen Ordner öffnen.** Chromium-Browser zeigen eine echte Ordnerauswahl und können den Ordner direkt lesen. Firefox und Safari lassen Sie einen Ordner wählen und lesen dann jede Datei darin, was bei großen Projektordnern länger dauert. Den Ordner auf die App zu ziehen funktioniert in allen dreien.
- **Speichern.** Die Apps speichern durch das Herunterladen einer Datei. Ihr Browser entscheidet, wohin Downloads gehen und ob er vorher fragt.

:::chromium
In Chrome oder Edge schalten Sie „Vor dem Herunterladen immer nach dem Speicherort für jede Datei fragen“ ein (unter Einstellungen, Downloads), um jedes Mal einen Ordner zu wählen.
:::

:::firefox
In Firefox öffnen Sie Einstellungen, dann Allgemein, dann Downloads und wählen „Immer nachfragen, wo Dateien gespeichert werden sollen“, um jedes Mal einen Ordner zu wählen.
:::

:::safari
In Safari öffnen Sie Einstellungen, dann Allgemein, und stellen „Speicherort für geladene Dateien“ auf „Für jeden Download nachfragen“, um jedes Mal einen Ordner zu wählen.
:::

## Mac, Windows und Linux

Die Apps sind auf jedem Rechner gleich. Was sich ändert, ist die Tastatur: Tastenkürzel werden automatisch für Ihren Rechner geschrieben. Siehe [Tasten, Mäuse und Trackpads](common:keys).

## Tablets und Touchscreens

Manche Apps nehmen Touch an (ein Finger zeichnet oder wählt, zwei Finger zoomen durch Zusammenziehen und verschieben). Die Hilfe jeder App sagt, ob sie das tut. Benutzen Sie auf einem iPad Safari oder Chrome. Eine Tastatur hilft bei Apps, die getippte Befehle benutzen.

## Der älteste Browser und das älteste System

Wir lesen diese Angaben aus dem Code der Apps der Version 0.7, nicht aus einer Schätzung: Jede Datei wurde geparst, und jedes darin benutzte Sprachfeature wurde in den veröffentlichten Kompatibilitätsdaten der Browser nachgeschlagen. Unterhalb dieser Versionen können die Apps nicht einmal starten, weil der Browser den Code nicht versteht.

| | Älteste Version, die die Apps starten kann |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS und iOS 16.4) |

CadCraft Studio bringt unter Windows seine eigene Web-Engine mit und braucht daher Windows 10 oder 11. Auf einem Mac benutzt es die des Systems und braucht daher macOS 13.3 oder neuer. Einstellungen › Updates in Studio zeigt, worauf Ihre Kopie läuft.

Das ist die älteste Version, die *startet*, aus dem Code gelesen. Es ist keine Liste alter Browser, in denen wir die Apps ausgeführt haben. Ein älterer Browser, der startet, kann deshalb trotzdem ein Feature vermissen.

## Was Ihr Rechner braucht

Das sind geplante Mindestwerte für die Apps, keine gemessenen Anforderungen:

- 8 GB Arbeitsspeicher (16 GB werden für große föderierte Modelle empfohlen).
- Ein Grafikchip mit WebGL 2 für die 3D-Apps. Wenn eine 3D-Ansicht leer bleibt, prüfen Sie, ob die Hardwarebeschleunigung in den Einstellungen Ihres Browsers eingeschaltet ist.
- Ein Bildschirm von mindestens 1280 Pixel Breite für die vollständigen Symbolleisten. Auf kleineren Bildschirmen brechen sie um.

Sehr große Dateien (große Plansätze, große Modelle) brauchen in einem Browsertab viel Arbeitsspeicher. Schließen Sie andere aufwendige Tabs, wenn eine App langsamer wird.
