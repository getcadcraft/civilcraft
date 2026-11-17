---
title: Durchhang und Zugspannung
summary: Ihre Lastfälle (Temperatur, Wind, Eis) und Zuggrenzen, wie CivilCraft die Zugspannung jedes Abschnitts berechnet und die Seilzugtabellen.
keywords: Durchhang, Zugspannung, Lastfall, Temperatur, Wind, Eis, einseitige Vereisung, Regelspannweite, Ersatzspannweite, Zustandsänderung, Kettenlinie, Seilzugtabelle, Bruchkraft, Alltagsspannung
from: f8876c35
---

## Lastfälle und Grenzwerte

{{ui:More}} › {{ui:Load cases and limits…}} bearbeitet die Regeln, denen jede Leitung im Projekt folgt.

- **Lastfälle**: eine Temperatur, ein Winddruck auf den Leiter (Pa) und radiales Eis (mm, mit seiner Dichte). Der erste Fall ist der Bezugsfall.
- **Zuggrenzen**: ein Anteil der Bruchkraft des Leiters, auf die horizontale Zugkraft oder auf die größte Zugkraft an einer Stütze, in einem Lastfall. Oder geben Sie die horizontale Zugkraft selbst vor.
- **Abstände**: der Abstand, den der Leiter über dem Gelände, einer Straße, einem Gebäude usw. einhält. Fügen Sie sie hinzu, benennen Sie sie um oder entfernen Sie sie; sie gehören Ihnen. Darunter wählen Sie die Regeln für **Bepflanzung unter einer Leitung**, **Landschaftsmauern unter einer Leitung** und **Unterirdische Kreuzungen**.
- **Fälle für die Prüfungen**: welcher Fall den größten Durchhang ergibt (heiß), das Pendeln des Isolators (Wind), Eis und Eis auf einer Seite einer Stütze.
- **Faktoren**: Phasenabstandsfaktor k, größtes Pendeln des Isolators, ein Faktor auf die Lasten an Stützen und Armaturen, die Winkel, die Winkel- und Abspannstützen bestimmen, die geringste Überdeckung über erdverlegten Kabeln, der größte Spannungsabfall.

## Pakete: Regeln und eine Bibliothek für ein Land

In CivilCraft sind keine Regeln eines Landes eingebaut. Ein **Paket** hält einen Regelsatz und eine Bibliothek in einer Datei (`.cclinepack.json`) zusammen, für ein Land, einen Netzbetreiber oder ein Unternehmen:

- **Als Paket speichern…** in {{ui:Load cases and limits…}} schreibt den angezeigten Regelsatz und Ihre Bibliothek (oder, wenn Ihre Bibliothek noch leer ist, die Elemente, die dieses Projekt verwendet). Geben Sie zuerst das **Land oder die Region** ein.
- **Regelsatz oder Paket öffnen…** liest ein Paket, eine Regeldatei oder eine Bibliotheksdatei. Die Regeln eines Pakets werden im Dialog angezeigt (klicken Sie auf **Übernehmen**, um sie zu verwenden), und seine Elemente gehen in Ihre Bibliothek.
- Von anderen geteilte Pakete sind auf der Add-on-Seite unter **Freileitungspakete** aufgelistet. Zwei Beispielpakete zeigen das Format; sie sind nicht die Regeln irgendeines Landes.

Jedes Paket wird beim Öffnen geprüft, wie jede andere Datei. Prüfen Sie jeden Wert gegen die geltende Norm, bevor etwas gebaut wird.

Zwei Beispielregelsätze stehen zum Start bereit: **Beispiel: kaltes Klima** und **Beispiel: mildes Klima**. Ihre Zahlen stammen aus keiner Norm: Setzen Sie die Werte, die Ihre Norm vorgibt. {{ui:Save rules}} und {{ui:Open rules…}} teilen einen Regelsatz als Datei.

## So wird die Zugkraft berechnet

Für jeden Abschnitt zwischen Abspannstützen:

1. Die **Regelspannweite** ist √(ΣL³ ÷ ΣL) seiner Spannweiten.
2. Jede Grenze wird über die **Zustandsänderungsgleichung** an der Regelspannweite in eine horizontale Zugkraft im Bezugsfall umgerechnet: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Die einschränkendste bestimmt die Zugkraft.
3. Die Zugkraft jedes Lastfalls folgt aus dieser, und die Form jedes Feldes ist die genaue **Kettenlinie** durch seine beiden Aufhängepunkte (auch Felder am Hang): Durchhang aus der Sehne, Länge und die Zugkraft an jedem Ende.

Die Last je Meter in einem Fall: Eigengewicht plus Eis (Eisfläche × Dichte × g) senkrecht; Winddruck × der vereiste Durchmesser waagerecht.

## Seilzugtabellen

{{ui:More}} › {{ui:Stringing tables…}} listet für jeden Abschnitt die horizontale Zugkraft und den Durchhang jedes Feldes bei jeder Temperatur des Regelsatzes auf (zum Start −5 °C bis 40 °C in 5-°C-Schritten), bei Windstille. Speichern Sie sie und die Stützentabelle als CSV.

Nicht berücksichtigt: das Kriechen des Leiters über die Jahre und die Dehnung eines neuen Leiters. Fügen Sie sie über die Temperaturen hinzu, bei denen Sie montieren.
