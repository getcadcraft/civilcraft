---
title: Eine Freileitung zeichnen
summary: Masten auf dem Plan setzen, CivilCraft die Rolle jedes Mastes und die Abschnitte zwischen den Abspannmasten ermitteln lassen und Masten auf dem Plan oder im Leitungsprofil verschieben.
keywords: Freileitung, Mast, Stange, Feld, Abschnitt, Abspannmast, Winkel, Tragmast, Profil, Höhe, Traverse, Abspannung, Seil
from: b8e5e272
---

## Zeichnen

1. Sie brauchen ein Geländemodell: Das Gelände unter der Leitung kommt daraus ([Geländemodell erstellen](topic:build-surface)). Ein Mast ohne Gelände darunter wird unter **Prüfungen** aufgeführt; geben Sie stattdessen seine **Geländehöhe** in den Eigenschaften ein.
2. Klicken Sie in der Gruppe Freileitungen auf {{ui:Leitung}} und dann auf jeden Mast auf dem Plan.
3. Doppelklicken Sie den letzten Mast oder drücken Sie {{key:Enter}}.

Die Leitung erhält das Leiterseil, den Mast und die Ausrüstung, die Sie zuletzt auf diesem Computer verwendet haben (beim ersten Mal: Beispiele aus der Bibliothek). Ändern Sie sie in den Eigenschaften.

## Die Leitung in den Eigenschaften

Wählen Sie die Leitung (klicken Sie auf ein Feld), um ihr **Leiterseil**, **Leiterseile je Stromkreis**, **Stromkreise**, **Spannung**, die **Abstandsregel**, die sie über dem Gelände einhalten muss, und die Ausrüstung **An jedem Mast** (eine Traverse, Isolatoren, Armaturen) festzulegen. Die Tabelle listet ihre **Abschnitte** mit jeweils ihrer Regelspannweite, der Betriebsspannung und dem Lastfall, der maßgebend ist.

## Masten

Klicken Sie einen Mast an, um ihn auszuwählen. In den Eigenschaften:

- **Mast**: sein Bibliothekselement. Ist er zu schwach, legt {{ui:Verwenden …}} den kleinsten Mast desselben Materials aus Ihrer Bibliothek ein, der die Last trägt.
- **Rolle**: Automatisch, Tragmast, Winkelmast oder Abspannmast. Automatisch heißt: Der erste und der letzte Mast sind Abspannmasten; eine Richtungsänderung über dem Winkel der Regel macht einen Winkelmast, eine größere einen Abspannmast.
- **Höhe über Gelände**: leer übernimmt sie vom Bibliothekselement (seine Länge abzüglich der Tiefe im Boden).
- **Auch an diesem Mast**: zusätzliche Ausrüstung, etwa eine **Abspannung** (Seil). Ein abgespannter Mast leitet den Zug der Leitung an seine Abspannung weiter.
- **Bestehender Mast**: Er wird wie die anderen geprüft, aber aus den Mengen herausgelassen.

{{ui:Mast}} fügt einen Mast auf dem Feld hinzu, das Ihrem Klick am nächsten liegt. Ziehen Sie einen Mast auf dem Plan, um ihn zu verschieben. Delete entfernt ihn (eine Leitung behält mindestens zwei).

Abschnitte verlaufen zwischen Abspannmasten: Innerhalb eines Abschnitts läuft das Leiterseil frei durch die Tragklemmen, sodass eine Spannung für den ganzen Abschnitt gilt.

## Das Leitungsprofil

Klicken Sie auf {{ui:Längsschnitt}} (oder auf **Längsschnitt** in den Eigenschaften der Leitung). Das Feld unter dem Plan zeigt das Gelände entlang der Leitung, jeden Mast vom Gelände bis zu seiner Spitze, das tiefste Phasenseil beim **Lastfall**, den Sie wählen, und den Abstand, den die Leitung einhalten muss, als gestrichelte Linie. Ein Feld, das nicht besteht, ist rot; die Zahl unter jedem Feld ist sein kleinster Abstand.

- **Leitung** wählt die anzuzeigende Freileitung. Wenn Sie auf dem Plan eine andere Leitung oder einen ihrer Masten auswählen, wechselt das Profil zu ihr.
- Bewegen Sie den Zeiger über das Profil: Eine Hilfslinie folgt ihm, und die Beschriftung zeigt den Abstand entlang der Leitung, das Gelände, das Leiterseil und den Abstand dort (und sagt, wenn der Abstand unter der Regel der Leitung liegt).
- {{ui:Messen}} in der Leiste des Profils: Klicken Sie zwei Punkte an, um den seitlichen Abstand, den Höhenunterschied, die direkte Entfernung und die Neigung zwischen ihnen zu erhalten. Ein Klick nahe dem Gelände, dem Leiterseil oder einer Mastspitze rastet dort ein. Klicken Sie erneut auf {{ui:Messen}}, um zu beenden.
- Hindernisse, die die Leitung kreuzt, stehen über dem Gelände: gezeichnete als Balken, Landschaftspflanzen als Krone, Wände als Balken (siehe [Freileitungsprüfungen](topic:power-line-checks#clearances)). Kabeltrassen und Rohre, die die Leitung kreuzt, werden unter dem Gelände an ihrer Oberseite mit ihrem Namen markiert.

- Ziehen Sie einen Mast seitlich, um ihn entlang der Leitung zu verschieben.
- Ziehen Sie seine Spitze nach oben oder unten, um seine Höhe über dem Gelände festzulegen.
