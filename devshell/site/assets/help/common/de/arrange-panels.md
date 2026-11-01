---
title: Bereiche anordnen und einen zweiten Monitor verwenden
summary: Seitliche Bereiche links, rechts oder unten andocken, stapeln, als Reiter gruppieren, anheften oder ausblenden, über der Zeichnung schweben lassen, das Layout verdichten, die Anzahl der Zeilen der Symbolleiste wählen oder sie in ein eigenes Fenster auf einem anderen Bildschirm verschieben.
keywords: Bereiche, andocken, schweben, Bereich verschieben, ziehen, Layout, Reiter, Registerkarte gruppieren, stapeln, anheften, automatisch ausblenden, Bereich ausblenden, Bereich schließen, kompakt, Layoutdichte, dicht, Symbolleistenzeilen, umbrechen, 1 Zeile, 2 Zeilen, Symbolleistenreihen, zweiter Monitor, zwei Bildschirme, Dualmonitor, mehrere Monitore, Fenster, Pop-up, Layout zurücksetzen
from: 32a8dae2
---

Die Bereiche neben der Zeichnung lassen sich verschieben. Platzieren Sie sie dort, wo sie Ihnen passen, oder geben Sie ihnen ein eigenes Fenster auf einem zweiten Monitor, damit die Zeichnung den gesamten ersten Monitor nutzen kann.

:::note
Jeder Bereich hat eine Titelleiste: einen schmalen Balken mit dem Namen des Bereichs, einem {{ui:⋯}}-Menü, einer Anheftnadel und einer Schließen-Schaltfläche oben am Bereich. Versionen vor 0.7 haben nur den Namen und das {{ui:⋯}}-Menü.
:::

## Einen Bereich im Fenster verschieben

1. Ziehen Sie den Bereich an seinem Namen oben.
2. Während Sie ziehen, erscheinen umrandete Flächen links, rechts und unten an der Zeichnung. Lassen Sie den Bereich auf einer davon los, um ihn dort anzudocken. Die Fläche, über der Sie sich befinden, wird dunkel.
3. Lassen Sie ihn an einer anderen Stelle über der Zeichnung los, damit er schwebt.

Bereiche können sich eine Seite teilen: Sie werden gestapelt, und jede Linie zwischen zwei von ihnen lässt sich ziehen, um den Platz zu teilen (bei fokussierter Linie verschieben die Pfeiltasten sie, und ein Doppelklick darauf teilt den Platz gleichmäßig auf). Ziehen Sie den inneren Rand einer angedockten Seite, um sie breiter oder schmaler zu machen; ein Doppelklick auf den Rand stellt sie wieder her.

Ein schwebender Bereich bleibt über der Zeichnung. Verschieben Sie ihn an seinem Namen, und ändern Sie seine Größe, indem Sie an seiner unteren rechten Ecke ziehen (oder mit {{key:Tab}} zur Ecke gehen und die Pfeiltasten verwenden). Doppelklicken Sie auf seinen Namen, um ihn an der vorherigen Stelle wieder anzudocken.

:::touch
Ziehen Sie mit einem Finger am Namen des Bereichs. Ziehen Sie die untere rechte Ecke eines schwebenden Bereichs mit einem Finger, um ihn zu vergrößern, und die Ränder zwischen angedockten Bereichen auf die gleiche Weise. Um ohne Ziehen zu schweben oder anzudocken, verwenden Sie das {{ui:⋯}}-Menü.
:::

## Bereiche als Reiter gruppieren

Zwei Bereiche können sich einen Rahmen teilen und zeigen jeweils nur einen. Ziehen Sie einen Bereich an seinem Namen auf die Titelleiste eines anderen Bereichs (die Leiste ist umrandet, solange Sie darüber sind) und lassen Sie los: Der Rahmen hat nun für jeden Bereich einen Reiter in seiner Titelleiste. Klicken Sie auf einen Reiter, um diesen Bereich anzuzeigen. Wenn ein Reiter fokussiert ist, wechseln {{key:Left}} und {{key:Right}} die Reiter, und {{key:Home}} und {{key:End}} springen zum ersten bzw. zum letzten.

Um einen Bereich aus der Gruppe zu nehmen, wählen Sie im {{ui:⋯}}-Menü des Bereichs {{ui:Aus der Reitergruppe herausnehmen}} oder ziehen Sie ihn an eine andere Stelle. Wählen Sie {{ui:Als Reiter mit}} und den Namen eines Bereichs, um sie ohne Ziehen zu gruppieren.

## Anheften, ausblenden und zurückholen

- Die Anheftnadel in der Titelleiste eines Bereichs macht ihn **automatisch ausblenden**: Der Bereich verlässt seine Andockstelle und wird zu einem kleinen Reiter an dieser Kante. Zeigen Sie auf den Reiter, fokussieren oder klicken Sie ihn, und der Bereich gleitet über die Zeichnung heraus. Entfernen Sie den Zeiger (oder drücken Sie {{key:Esc}}), und er gleitet zurück. Drücken Sie die Anheftnadel erneut oder wählen Sie {{ui:Anheften aufheben}}, um ihn dauerhaft anzudocken.
- Die Schließen-Schaltfläche oder {{ui:Diesen Bereich ausblenden}} im Menü blendet den Bereich aus und schließt seine Andockstelle. Ein gestrichelter Reiter am Rand holt ihn zurück: Klicken Sie darauf, oder fokussieren Sie ihn und drücken Sie {{key:Enter}}.

## Das Layout verdichten

{{ui:Einstellungen}} › {{ui:Allgemein}} › {{ui:Layoutdichte}} hat zwei Auswahlmöglichkeiten. {{ui:Komfortabel}} ist die Voreinstellung. {{ui:Kompakt}} verringert die Zeilenhöhen, die Innenabstände der Bereiche, die Symbolleistenschaltflächen und den Text der Bereiche in dieser App, damit mehr auf den Bildschirm passt. Die Einstellung wird für jede App gespeichert. Ein Touchscreen behält in beiden Fällen seine großen Schaltflächen, und ein Telefon behält sein eigenes Layout. {{ui:Layout zurücksetzen}} lässt die Dichte so, wie Sie sie eingestellt haben.

## Die Anzahl der Zeilen der Symbolleiste wählen

{{ui:Einstellungen}} › {{ui:Allgemein}} › {{ui:Symbolleistenzeilen}} hat drei Auswahlmöglichkeiten. {{ui:Umbrechen}} ist die Voreinstellung: Jede Werkzeuggruppe wird angezeigt, auf so vielen Zeilen, wie sie braucht. {{ui:2 Zeilen}} hält die Symbolleiste auf zwei Zeilen und {{ui:1 Zeile}} auf einer, damit die Zeichnung mehr Höhe bekommt. Die Gruppen, die nicht hineinpassen, lassen sich innerhalb der Symbolleiste seitlich scrollen (mit dem Mausrad, mit einer Zwei-Finger-Wischbewegung oder mit {{key:Tab}} bis zu einem Werkzeug). Eine Symbolleiste, die schon in zwei Zeilen passt, bleibt bei {{ui:2 Zeilen}} unverändert, weil ein Raster sie nur höher machen würde. Die Auswahl wird für jede App gespeichert. Ein Touchscreen und ein Telefon behalten ihr eigenes Layout. CadCraft hat eine eigene Einstellung für seine Symbolleiste unter {{ui:Einstellungen}} › {{ui:CadCraft}}.

## Die Tastatur verwenden

Die {{ui:⋯}}-Schaltfläche jedes Bereichs öffnet ein Menü: {{ui:Links andocken}}, {{ui:Rechts andocken}}, {{ui:Unten andocken}}, {{ui:Über der Zeichnung schweben}}, {{ui:Am Rand anheften}}, {{ui:Diesen Bereich ausblenden}}, {{ui:Als Reiter mit}} einem anderen Bereich, {{ui:In ein neues Fenster verschieben}} und {{ui:Zurücksetzen}}. Gehen Sie mit {{key:Tab}} zur Schaltfläche, drücken Sie {{key:Enter}}, bewegen Sie sich mit den Pfeiltasten und drücken Sie erneut {{key:Enter}}. {{key:Esc}} schließt das Menü.

## Die Bereiche auf einem zweiten Monitor anzeigen

1. Wählen Sie {{ui:⋯}} an einem Bereich und dann {{ui:Alle Bereiche in ein neues Fenster verschieben}}. Sie können auch {{ui:Bereiche in ein neues Fenster verschieben}} in {{ui:Einstellungen}} wählen.
2. Es öffnet sich ein kleines Fenster mit den Bereichen darin. Ziehen Sie es auf Ihren anderen Monitor und machen Sie es so groß, wie Sie möchten.
3. Arbeiten Sie weiter: Die Bereiche wirken wie zuvor auf die Zeichnung, und die Zeichnung füllt das Hauptfenster aus.

Tastenkürzel funktionieren weiterhin, während das Bereichsfenster vorne ist: Tasten, die Sie dort drücken, gehen an die Zeichnung, außer wenn Sie in einem Feld tippen. Fragen und Dialoge, die die App stellt, öffnen sich weiterhin im Hauptfenster. Schauen Sie dort nach, wenn einer erscheint. Das Design und die Textgröße der Bereiche folgen dem Hauptfenster.

:::chromium
Chrome und Edge können das Fenster für Sie auf den anderen Bildschirm setzen. Wenn ein zweiter Bildschirm angeschlossen ist, wählen Sie im Bereichsfenster {{ui:Auf meinen anderen Bildschirm legen}} (oder {{ui:Bereiche auf meinen anderen Bildschirm legen}} im {{ui:⋯}}-Menü eines Bereichs). Der Browser fragt einmal, ob diese Website Ihre Bildschirme sehen darf. Nachdem Sie es erlaubt haben, öffnet sich das Bereichsfenster jedes Mal auf diesem Bildschirm.
:::

:::firefox safari
Ziehen Sie das Bereichsfenster selbst auf den anderen Monitor. Beim nächsten Mal öffnet es sich an derselben Stelle und in derselben Größe.
:::

## Mehr als ein Bereichsfenster

Jeder Bereich kann ein eigenes Fenster haben: bis zu vier Bereichsfenster, zum Beispiel eines pro Monitor.

- Im {{ui:⋯}}-Menü eines Bereichs öffnet {{ui:In ein neues Fenster verschieben}} ein weiteres Fenster für diesen Bereich. {{ui:In Bereichsfenster 2 verschieben}} (und so weiter) verschiebt ihn in ein bereits geöffnetes Fenster. Das zweite Fenster heißt „Bereiche 2“.
- Ziehen Sie einen Bereich an seinem Namen von einem Fenster in ein anderes: Lassen Sie ihn über dem Hauptfenster los, um ihn dort anzudocken (die umrandeten Flächen erscheinen, solange Sie darüber sind) oder um ihn schweben zu lassen. Über einem anderen Bereichsfenster lassen Sie ihn los, um ihn dorthin zu verschieben. Lassen Sie ihn an einer anderen Stelle los, bleibt er, wo er war.
- Ein Bereichsfenster ohne verbleibende Bereiche schließt sich von selbst.

Nach einem Neuladen bietet die App Ihnen Ihre Bereichsfenster wieder an. Browser öffnen pro Klick ein Fenster. Wählen Sie daher {{ui:Das nächste öffnen}} für jedes Fenster einmal.

## Einen Dialog verschieben

Jeder Dialog lässt sich aus dem Weg der Zeichnung verschieben: Drücken Sie auf seine Titelleiste und ziehen Sie. Der Dialog merkt sich, wo Sie ihn gelassen haben, jeder Dialog für sich, und kehrt beim nächsten Öffnen an diese Stelle zurück. Doppelklicken Sie auf die Titelleiste, um ihn wieder zu zentrieren.

Über die Tastatur drücken Sie bei Fokus im Dialog {{key:Alt}}+{{key:Shift}}+eine Pfeiltaste, um ihn jeweils 16 Pixel zu verschieben. Mit {{key:Ctrl}} sind es 64 Pixel. Ein Dialog, der nach einem kleineren Fenster oder Bildschirm außerhalb des sichtbaren Bereichs liegt, wird zurückgeholt.

Auf einem Telefon bleiben Dialogfelder vollbreite Ansichten und werden nicht verschoben.

In CadCraft Studio hat der Dialog {{ui:Als PDF plotten}} von CadCraft, den Sie beim Arbeiten geöffnet lassen können, in seiner Titelleiste eine Schaltfläche {{ui:In eigenem Fenster öffnen}}. Der Dialog wechselt in ein eigenes Fenster, das Sie auf einen anderen Monitor legen können. Wenn Sie den Dialog schließen, schließt sich das Fenster, und wenn Sie das Fenster schließen, schließt sich der Dialog.

## Die Bereiche zurücksetzen

- Wählen Sie im Bereichsfenster {{ui:Bereiche zurücksetzen}}, oder schließen Sie es einfach. Die Bereiche kehren an ihre vorherige Stelle zurück.
- Wenn Sie das Hauptfenster schließen oder neu laden, schließt sich auch das Bereichsfenster. Wenn die App wieder startet, teilt sie mit, dass Ihre Bereiche in einem eigenen Fenster waren. Wählen Sie {{ui:Öffnen}}, um das Fenster wiederherzustellen, oder {{ui:Hier behalten}}.
- {{ui:Einstellungen}} › {{ui:Allgemein}} › {{ui:Layout zurücksetzen}} stellt jeden Bereich an seinen ursprünglichen Platz zurück.

:::tip
Wenn beim Verschieben von Bereichen in ein neues Fenster nichts geöffnet wird, hat der Browser das Pop-up blockiert. Die App weist darauf hin und lässt die Bereiche, wo sie waren. Erlauben Sie Pop-ups für getcadcraft.com und versuchen Sie es erneut.
:::

Das Layout wird für jede App in diesem Browser zusammen mit Ihren anderen Einstellungen gespeichert.
