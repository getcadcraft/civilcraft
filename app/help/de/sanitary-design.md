---
title: Schmutzwasser-Bemessungsabflüsse berechnen und den Kanal prüfen
summary: Geben Sie die Einwohner und die Fläche ein, die an jedem Schacht eines Schmutzwassernetzes zufließen. CivilCraft summiert sie das Netz hinab, berechnet den Spitzenabfluss mit einem Spitzenfaktor und Fremdwasser und prüft die Kapazität und Geschwindigkeit jedes Rohrs.
keywords: Schmutzwasser, Kanal, Schmutzwasserkanal, Abwasser, Bemessungsabfluss, Spitzenabfluss, Spitzenfaktor, Harmon, Babbitt, Fremdwasser, Einwohner, je Einwohner, Füllungsgrad, Selbstreinigung, Geschwindigkeit, Rohrdimensionierung, Bemessungsblatt
from: 73ba197a
---

Schmutzwasser-Bemessungsabflüsse arbeiten auf dem [Rohrnetz](topic:pipe-network), wenn dessen {{ui:Type}} {{ui:Sanitary}} ist. Ohne Auswahl zeigt das rechte Panel dann **Schmutzwasser-Bemessungsabflüsse**, wo ein Regenwassernetz die Regenwasserentwässerung zeigt.

## Zufluss eingeben

1. Einen Schacht wählen. Unter **Schmutzwasser-Bemessungsabflüsse** die {{ui:People entering here}} und die {{ui:Area entering here}} eingeben (Hektar in einem metrischen Projekt, Acres in einem Projekt in Fuß).
2. Für Läden, Büros oder Industrie die gleichwertigen Einwohner eingeben: die Fläche mal die Einwohner je Hektar (oder Acre), die Ihre Behörde verwendet. Die Fläche zählt in beiden Fällen für das Fremdwasser.
3. Für jeden Schacht wiederholen, an dem eine Straße oder ein Grundstück anschließt. Ein Schacht, an dem nichts anschließt, bleibt bei beiden Werten auf 0.

Jedes Rohr führt alles, was an seinem oberen Schacht und darüber zufließt. Wählen Sie einen Schacht, um zu sehen, was durch ihn hindurchfließt.

## Die Einstellungen

| Einstellung | Bedeutung |
|---|---|
| {{ui:Flow per person}} | der durchschnittliche Abfluss einer Person am Tag: Liter (metrisches Projekt) oder US-Gallonen (Projekt in Fuß) |
| {{ui:Infiltration}} | Grundwasser, das einsickert: Liter pro Sekunde je Hektar oder Gallonen am Tag je Acre |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), oder Babbitt, 5 / P^0.2, mit P der Einwohnerzahl in Tausend |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | der Faktor wird zwischen diesen beiden Werten gehalten |
| {{ui:Manning n}} | für Kapazität und Geschwindigkeit |
| {{ui:Least velocity}} / {{ui:Most velocity}} | bei der eigenen Tiefe des Spitzenabflusses im Rohr |
| {{ui:Most of full capacity}} | wie voll ein Rohr beim Spitzenabfluss laufen darf, als Prozent dessen, was es vollfließend führt |

Die Startwerte sind Platzhalter, keine Norm. Verwenden Sie die Werte, die Ihre Behörde veröffentlicht.

## Was berechnet wird

Für jedes Rohr, in Fließreihenfolge:

- Spitzenabfluss = Einwohner × Abfluss je Einwohner × Spitzenfaktor + Fläche × Fremdwasser
- Kapazität vollfließend (Manningsche Gleichung mit dem Gefälle des Rohrs) und wie voll der Spitzenabfluss es macht
- die Normaltiefe des Spitzenabflusses und die Geschwindigkeit dort

Die Tabelle **Schmutzwasser-Ergebnisse** listet je Rohr Einwohner, Spitzenfaktor, Spitzenabfluss (L/s oder gpm und Kubikfuß je Sekunde), Füllungsgrad und Geschwindigkeit auf. Darunter stehen die Probleme: ein Rohr, das voller ist als die Grenze, langsamer als die Mindestgeschwindigkeit (es reinigt sich unter Umständen nicht selbst), schneller als die Höchstgeschwindigkeit oder ohne Gefälle. {{ui:Size the pipes for these flows}} wählt für jedes Rohr die kleinste Normgröße (200 mm oder 8 Zoll und größer), die seinen Spitzenabfluss innerhalb der Grenze führt. Ein {{key:Mod+Z}} macht es rückgängig.

:::note
Dies ist der stationäre Spitzenabfluss, wie ihn ein Bemessungsblatt berechnet, geprüft gegen ein veröffentlichtes Bemessungsblatt bis zu dessen gedruckter Rundung. Es ist kein Modell des Kanals über die Zeit: keine Ganglinien, kein Speicher, keine Pumpen oder Überläufe. Siehe [Noch nicht umgesetzt](topic:not-built-yet).
:::

Geschwindigkeiten nutzen die Manningsche Gleichung mit demselben n in jeder Tiefe. Manche Behörden lassen n mit der Tiefe variieren; das ergibt bei einem Rohr, das zu 60 bis 70 Prozent gefüllt ist, eine etwas niedrigere Geschwindigkeit (etwa 3 Prozent weniger).
