---
title: "Klimazukunft: 2050 und 2080 Hochwasser, Hitze und Waldbrand"
summary: Unter Adresse zum Grundstück den Hochwasserstand des Grundstücks für ein künftiges Klima anheben, die Waldbrandgefährdung prüfen und eine Wetterdatei umrechnen. Gegenwart und Zukunft stehen nebeneinander, aus einem Klimadatenpaket (SSP2-4.5 und SSP5-8.5, 2050 und 2080).
keywords: Klima, Klimawandel, Zukunft, 2050, 2080, SSP, CMIP6, Szenario, Meeresspiegel, Hochwasser, Bemessungshochwasserstand, BFE, FEMA, Hitze, Wetterdatei, EPW, Morphing, Waldbrand, Buschfeuer
from: b0d2ee38
---

Die Klimawerte stammen aus einem **Datenpaket**, nicht aus der App. Schalten Sie das Add-on {{ui:Klimazukunft}} unter {{ui:Einstellungen}} › Add-ons ein, oder laden Sie eine eigene Paketdatei im Block {{ui:Klimazukunft}}.

:::warning
Das Paket, das dem Add-on beiliegt, ist ein **Beispiel**: drei Orte (Denver, Miami, Johannesburg), ein Klimamodell und fünf Jahre in jeder 20-Jahres-Periode. Es dient dazu, die Werkzeuge auszuprobieren, **nicht für den Entwurf**. Ein vollständiges Paket wird mit `tools/climate/build-pack.mjs` aus den NEX-GDDP-CMIP6-Daten der NASA erstellt.
:::

## Wo Sie es finden

Geländemodell › Mehr › Adresse zum Grundstück. Legen Sie den Punkt fest, fügen Sie die Ebenen hinzu (eine FEMA-Hochwasserebene liefert den Bemessungshochwasserstand) und drücken Sie die Schaltfläche, die das Grundstück liest. Unter den Zeilen des Grundstücks steht der Block {{ui:Klimazukunft}}: Wählen Sie ein **Szenario** (SSP2-4.5 oder SSP5-8.5) und ein **Jahr** (2050 = 2041–2060, 2080 = 2071–2090, jeweils gegenüber 1995–2014). Verwendet wird der Ort des Pakets, der dem Punkt am nächsten liegt, oder der, den Sie wählen. Liegt der Punkt weit von jedem Ort entfernt, werden die globalen Mittelwerte der Änderungen verwendet, und das Feld sagt das.

## Bemessungshochwasserstand

Der heutige Stand ist der Bemessungshochwasserstand von FEMA, wenn die Hochwasserebene einen hatte (ft, NAVD 88). Sonst geben Sie Ihren eigenen ein. Wählen Sie die Hochwasserart (Küste, Fluss oder Starkregen oder beides), die Wassertiefe am Standort für den Regenanteil und ein Freibord, falls gewünscht. {{ui:Hochwasserstand anheben}} zeigt den heutigen und den künftigen Stand nebeneinander, die Anteile durch Meeresspiegel und Regen sowie die Annahmen. Der gesamte Meeresspiegelanstieg wird zu einem Küstenstand addiert. Der Flussabfluss steigt eins zu eins mit dem Niederschlag des nassesten Tages, und die Tiefe folgt dem Abfluss hoch 0.6 (Manning, breites Gerinne). Die Anteile werden addiert.

:::warning
Eine Abschätzung der Veränderung, keine Hochwasserstudie. Der Bemessungshochwasserstand ist Sache der Behörde oder Ihres Ingenieurs.
:::

## Waldbrandgefährdung (nur Abschätzung)

Die nächste Vegetation, der Hang bis zu ihr und die Entfernung ergeben eine Stufe von sehr niedrig bis extrem, heute und künftig. Die künftige Stufe multipliziert sich mit der Änderung des Waldbrand-Witterungsindexes im Paket. **Nur Abschätzung:** Das ist unsere eigene relative Skala, um zu erkennen, ob ein Grundstück eine richtige Waldbrandbewertung braucht. Es ist keine Normbewertung.

## Hitze: eine zukünftige Wetterdatei

Wählen Sie eine heutige `.epw`-Datei und klicken Sie auf {{ui:Zukünftige Wetterdatei erstellen}}. Sie wird mit dem veröffentlichten Verschiebungs- und Streckungsverfahren (Belcher, Hacker and Powell 2005) umgerechnet, und die Hitze wird verglichen: mittlere und höchste Temperatur, Auslegungstemperaturen, Stunden über 30 °C und 35 °C, Gradtage. {{ui:Zukünftige Wetterdatei speichern}} speichert sie für das Bedienfeld Umgebung, die Energieprüfung von BimCraft oder Ihre eigenen Werkzeuge.

## Woher die Zahlen stammen

NASA NEX-GDDP-CMIP6 (herunterskalierte CMIP6-Modellausgaben, CC BY 4.0 je Modell) für Temperatur, Luftfeuchte, Sonnenschein, Regen und Feuerwetter. Der globale Mittelwert des IPCC AR6 gilt für den Meeresspiegelanstieg, sofern das Paket keine lokalen Werte enthält. Das Feld zeigt Quelle, Lizenz und Datum des Pakets.
