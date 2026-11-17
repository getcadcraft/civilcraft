---
title: Bereiche anordnen und einen zweiten Bildschirm verwenden
summary: Seitliche Bereiche links, rechts oder unten andocken, stapeln, als Registerkarten gruppieren, anheften oder ausblenden, über der Zeichnung schweben lassen, das Layout verdichten, die Anzahl der Zeilen der Symbolleiste wählen oder sie in ein eigenes Fenster auf einem anderen Bildschirm verschieben.
keywords: Bereiche, andocken, schweben, Bereich verschieben, ziehen, Layout, Registerkarten, Registerkartengruppe, stapeln, anheften, automatisch ausblenden, Bereich ausblenden, Bereich schließen, kompakt, Layoutdichte, dicht, Symbolleistenzeilen, Umbrechen, 1 Zeile, 2 Zeilen, Symbolleistenreihen, zweiter Bildschirm, zwei Bildschirme, Dual-Monitor, mehrere Bildschirme, Fenster, Popup, Layout zurücksetzen
from: 49530239
---

Die Bereiche neben der Zeichnung lassen sich verschieben. Ordnen Sie sie an, wie es Ihnen passt, oder geben Sie ihnen ein eigenes Fenster auf einem zweiten Bildschirm, damit die Zeichnung den gesamten ersten Bildschirm nutzen kann.

:::note
Jeder Bereich hat eine Titelleiste: eine schmale Leiste mit dem Namen des Bereichs, einem {{ui:⋯}}-Menü, einer Anheftnadel und einer Schaltfläche zum Schließen oben am Bereich. Versionen vor 0.7 haben nur den Namen und das {{ui:⋯}}-Menü.
:::

## Einen Bereich im Fenster verschieben

1. Ziehen Sie den Bereich an seinem Namen oben.
2. Während Sie ziehen, erscheinen umrandete Flächen links, rechts und unten an der Zeichnung. Legen Sie den Bereich auf einer davon ab, um ihn dort anzudocken. Die Fläche, über der Sie sich befinden, wird dunkler.
3. Legen Sie ihn irgendwo anders über der Zeichnung ab, damit er schwebt.

Bereiche können sich eine Seite teilen: Sie werden gestapelt, und jede Linie zwischen zwei von ihnen lässt sich ziehen, um den Platz aufzuteilen (wenn eine Linie fokussiert ist, verschieben die Pfeiltasten sie, und ein Doppelklick auf sie teilt den Platz gleichmäßig auf). Ziehen Sie den inneren Rand einer angedockten Seite, um sie breiter oder schmaler zu machen; ein Doppelklick auf den Rand stellt sie zurück.

Ein schwebender Bereich bleibt über der Zeichnung. Verschieben Sie ihn über seinen Namen, und ändern Sie seine Größe, indem Sie die untere rechte Ecke ziehen (oder mit {{key:Tab}} zur Ecke wechseln und die Pfeiltasten verwenden). Ein Doppelklick auf seinen Namen dockt ihn wieder dort an, wo er vorher war.

:::touch
Ziehen Sie mit einem Finger am Namen des Bereichs. Ziehen Sie die untere rechte Ecke eines schwebenden Bereichs mit einem Finger, um ihn in der Größe zu ändern, und die Ränder zwischen angedockten Bereichen auf die gleiche Weise. Um ohne Ziehen zu schweben oder anzudocken, verwenden Sie das {{ui:⋯}}-Menü.
:::

## Bereiche als Registerkarten gruppieren

Zwei Bereiche können sich einen Rahmen teilen und zeigen jeweils einen. Ziehen Sie einen Bereich an seinem Namen auf die Titelleiste eines anderen Bereichs (die Leiste ist umrandet, während Sie darüber sind), und lassen Sie los: Der Rahmen hat nun für jeden Bereich eine Registerkarte in seiner Titelleiste. Klicken Sie auf eine Registerkarte, um den Bereich anzuzeigen. Mit einer fokussierten Registerkarte wechseln {{key:Left}} und {{key:Right}} die Registerkarten, und {{key:Home}} und {{key:End}} gehen zur ersten bzw. zur letzten.

Um einen Bereich aus der Gruppe herauszunehmen, wählen Sie {{ui:Aus der Reitergruppe herausnehmen}} in seinem {{ui:⋯}}-Menü, oder ziehen Sie ihn woanders hin. Wählen Sie {{ui:Mit Reiter gruppieren}} und den Namen eines Bereichs, um sie ohne Ziehen zu gruppieren.

## Anheften, ausblenden und zurückholen

- Die Anheftnadel in der Titelleiste eines Bereichs macht ihn **automatisch ausblendend**: Der Bereich verlässt sein Andockfeld und wird zu einer kleinen Registerkarte an diesem Rand. Zeigen Sie auf die Registerkarte, fokussieren Sie sie oder klicken Sie darauf, und der Bereich gleitet über die Zeichnung heraus; bewegen Sie sich weg (oder drücken Sie {{key:Esc}}), und er gleitet zurück. Drücken Sie die Anheftnadel erneut oder wählen Sie {{ui:Anheften lösen}}, um ihn dauerhaft anzudocken.
- Die Schaltfläche zum Schließen oder {{ui:Diesen Bereich ausblenden}} im Menü blendet den Bereich aus und schließt die Lücke in seinem Andockfeld. Eine gestrichelte Registerkarte am Rand holt ihn zurück: Klicken Sie darauf, oder fokussieren Sie sie und drücken Sie {{key:Enter}}.

## Das Layout verdichten

{{ui:Einstellungen}} › {{ui:Allgemein}} › {{ui:Layoutdichte}} hat zwei Optionen. {{ui:Komfortabel}} ist der Standard. {{ui:Kompakt}} verringert die Zeilenhöhen, den Innenabstand der Bereiche, die Symbolleisten-Schaltflächen und den Bereichstext dieser App, damit mehr auf den Bildschirm passt. Die Einstellung wird für jede App gespeichert. Ein Touchscreen behält in beiden Fällen seine großen Schaltflächen, und ein Telefon behält sein eigenes Layout. {{ui:Layout zurücksetzen}} lässt die Dichte so, wie Sie sie eingestellt haben.

## Die Anzahl der Zeilen der Symbolleiste wählen

{{ui:Einstellungen}} › {{ui:Allgemein}} › {{ui:Symbolleistenzeilen}} hat drei Optionen. {{ui:Umbrechen}} ist der Standard: Jede Werkzeuggruppe wird angezeigt, und zwar in so vielen Zeilen, wie sie braucht. {{ui:2 Zeilen}} hält die Symbolleiste auf zwei Zeilen und {{ui:1 Zeile}} auf einer, damit die Zeichnung mehr Höhe bekommt; die Gruppen, die nicht hineinpassen, scrollen seitlich innerhalb der Symbolleiste (mit dem Mausrad, einer Zwei-Finger-Wischbewegung oder mit {{key:Tab}} zu einem Werkzeug). Eine Symbolleiste, die bereits in zwei Zeilen passt, bleibt bei {{ui:2 Zeilen}} unverändert, weil ein Raster sie nur höher machen würde. Die Einstellung wird für jede App gespeichert. Ein Touchscreen und ein Telefon behalten ihr eigenes Layout. CadCraft hat eine eigene Einstellung für seine Symbolleiste unter {{ui:Einstellungen}} › {{ui:CadCraft}}.

## Die Tastatur verwenden

Die Schaltfläche {{ui:⋯}} jedes Bereichs öffnet ein Menü: {{ui:Links andocken}}, {{ui:Rechts andocken}}, {{ui:Unten andocken}}, {{ui:Über der Zeichnung schweben}}, {{ui:Am Rand anheften}}, {{ui:Diesen Bereich ausblenden}}, {{ui:Mit Reiter gruppieren}} (mit einem anderen Bereich), {{ui:In ein neues Fenster verschieben}} und {{ui:Zurücksetzen}}. Wechseln Sie mit {{key:Tab}} zur Schaltfläche, drücken Sie {{key:Enter}}, bewegen Sie sich mit den Pfeiltasten und drücken Sie erneut {{key:Enter}}. {{key:Esc}} schließt das Menü.

## Die Bereiche auf einen zweiten Bildschirm legen

1. Wählen Sie {{ui:⋯}} an einem Bereich und dann {{ui:Alle Bereiche in ein neues Fenster verschieben}}. Sie können auch {{ui:Bereiche in ein neues Fenster verschieben}} in {{ui:Einstellungen}} wählen.
2. Ein kleines Fenster öffnet sich mit den Bereichen darin. Ziehen Sie es auf Ihren anderen Bildschirm und machen Sie es so groß, wie Sie möchten.
3. Arbeiten Sie weiter: Die Bereiche wirken wie zuvor auf die Zeichnung, und die Zeichnung füllt das Hauptfenster.

Tastenkürzel funktionieren weiterhin, während das Bereichsfenster vorne liegt: Tasten, die Sie dort drücken, gehen an die Zeichnung, außer wenn Sie in einem Feld schreiben. Fragen und Dialoge der App öffnen sich weiterhin im Hauptfenster, schauen Sie also dort nach, wenn einer erscheint. Design und Textgröße der Bereiche folgen dem Hauptfenster.

:::chromium
Chrome und Edge können das Fenster für Sie auf den anderen Bildschirm setzen. Wenn ein zweiter Bildschirm angeschlossen ist, wählen Sie im Bereichsfenster {{ui:Auf meinen anderen Bildschirm legen}} (oder {{ui:Bereiche auf meinen anderen Bildschirm legen}} im {{ui:⋯}}-Menü eines Bereichs). Der Browser fragt einmal, ob diese Website Ihre Bildschirme sehen darf. Nachdem Sie es erlaubt haben, öffnet sich das Bereichsfenster jedes Mal auf diesem Bildschirm.
:::

:::firefox safari
Ziehen Sie das Bereichsfenster selbst auf den anderen Bildschirm. Es öffnet sich beim nächsten Mal an derselben Stelle und in derselben Größe.
:::

## Mehr als ein Bereichsfenster

Jeder Bereich kann ein eigenes Fenster haben: bis zu vier Bereichsfenster, zum Beispiel eines pro Bildschirm.

- Im {{ui:⋯}}-Menü eines Bereichs öffnet {{ui:In ein neues Fenster verschieben}} ein weiteres Fenster für diesen Bereich, und {{ui:In Bereichsfenster 2 verschieben}} (und so weiter) verschiebt ihn in ein bereits geöffnetes Fenster. Das zweite Fenster heißt „Bereiche 2“.
- Ziehen Sie einen Bereich an seinem Namen von einem Fenster in ein anderes: Lassen Sie ihn über dem Hauptfenster los, um ihn dort anzudocken (die umrandeten Flächen zeigen sich, während Sie darüber sind) oder um ihn schweben zu lassen, und über einem anderen Bereichsfenster, um ihn dort einzufügen. Lassen Sie ihn anderswo los, bleibt er, wo er war.
- Ein Bereichsfenster ohne verbleibende Bereiche schließt sich von selbst.

Nach einem Neuladen bietet die App Ihnen Ihre Bereichsfenster wieder an. Browser öffnen pro Klick ein Fenster, also wählen Sie {{ui:Nächstes öffnen}} einmal für jedes Fenster.

## Dasselbe Vorgehen für jeden Teil eines Layouts

Das Menüband, die Werkzeugpalette, die Werkzeugzeilen und die Statusleiste wechseln auf dieselbe Weise wie ein Bereich in ein eigenes Fenster: Öffnen Sie das {{ui:⋯}}-Menü des Teils und wählen Sie {{ui:In ein neues Fenster verschieben}}. {{ui:Zurücksetzen}} (oder das Schließen des Fensters) bringt ihn zurück. Tasten, die Sie in diesem Fenster drücken, erreichen die App, wie aus dem Bereichsfenster. Jeder Teil hat ein solches Menü.

## Einen Dialog verschieben

Jeder Dialog lässt sich aus dem Weg der Zeichnung verschieben: Drücken Sie seine Titelleiste und ziehen Sie. Der Dialog merkt sich, wo Sie ihn gelassen haben, jeder Dialog für sich, und kehrt beim nächsten Öffnen an diese Stelle zurück. Ein Doppelklick auf die Titelleiste zentriert ihn wieder.

Von der Tastatur aus drücken Sie {{key:Alt}}+{{key:Shift}} und eine Pfeiltaste, während der Fokus im Dialog liegt, um ihn 16 Pixel auf einmal zu bewegen; fügen Sie {{key:Ctrl}} hinzu, um 64 Pixel zu bewegen. Ein Dialog, der nach einem kleineren Fenster oder Bildschirm außerhalb des sichtbaren Bereichs liegt, wird zurückgeholt.

Auf einem Telefon bleiben Dialoge vollflächige Blätter und werden nicht verschoben.

In CadCraft Studio hat der Dialog {{ui:Als PDF plotten}} von CadCraft, den Sie während der Arbeit geöffnet lassen dürfen, in seiner Titelleiste eine Schaltfläche {{ui:In eigenem Fenster öffnen}}. Der Dialog wechselt in ein eigenes Fenster, das Sie auf einen anderen Bildschirm legen können. Das Schließen des Dialogs schließt das Fenster, und das Schließen des Fensters schließt den Dialog.

## Bereiche zurücksetzen

- Wählen Sie im Bereichsfenster {{ui:Bereiche zurücksetzen}}, oder schließen Sie es einfach. Die Bereiche gehen dorthin zurück, wo sie waren.
- Wenn Sie das Hauptfenster schließen oder neu laden, schließt sich auch das Bereichsfenster. Wenn die App wieder öffnet, meldet sie, dass Ihre Bereiche in einem eigenen Fenster waren. Wählen Sie {{ui:Öffnen}}, um das Fenster zurückzuholen, oder {{ui:Hier behalten}}.
- {{ui:Einstellungen}} › {{ui:Allgemein}} › {{ui:Layout zurücksetzen}} stellt jeden Bereich dorthin zurück, wo er am Anfang war.

:::tip
Wenn sich beim Verschieben von Bereichen in ein neues Fenster nichts öffnet, hat der Browser das Popup blockiert. Die App sagt das und lässt die Bereiche, wo sie waren. Erlauben Sie Popups für getcadcraft.com und versuchen Sie es erneut.
:::

Das Layout wird für jede App in diesem Browser gespeichert, zusammen mit Ihren anderen Einstellungen.
