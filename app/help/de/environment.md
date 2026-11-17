---
title: Schatten, Solarertrag und Außenkomfort
summary: Untersuchen Sie den Schatten Ihrer Baukörper über einen Tag oder eine Jahreszeit, sehen Sie eine Animation davon, berechnen Sie, wie viel Strom Solarmodule auf Dächern und Wänden in einem typischen Jahr erzeugen würden, sehen Sie, wie angenehm die Straße neben einem Gebäude ist (UTCI), und erhalten Sie eine orientierende Angabe zum Windkomfort für Fußgänger.
keywords: Schattenstudie, Schatten, Sonnenstunden, Animation, solar, PV, Photovoltaik, Module, Ertrag, kWh, EPW, Wetterdatei, UTCI, thermischer Komfort, Außenkomfort, Hitzestress, Wind
from: 96e7af4d
---

Der Bereich **Umgebung** steht unter **Sonnenstunden** in den **Eigenschaften** eines Baukörpers. Er verwendet die Baukörper, die Sie gezeichnet haben, als Gebäude.

## Wetterdatei laden

Wählen Sie eine Wetterdatei für ein typisches Jahr (**.epw**) für Ihre Stadt. Solche Dateien gibt es kostenlos bei der EnergyPlus-Wetterseite und bei climate.onebuilding.org. Die Datei bleibt für diesen Besuch in Ihrem Browser. Solarertrag und Komfortstudie brauchen sie; die Schattenstudie funktioniert ohne sie, wenn das Projekt ein Koordinatensystem hat.

## Schattenstudie

Wählen Sie ein Datum (oder kreuzen Sie **Zeitraum** an und geben Sie ein letztes Datum und einen Schritt in Tagen ein) und eine Zeitzone, dann **Schattenstudie starten**. Sie erhalten eine Karte der Stunden mit Sonne bzw. Schatten auf dem Boden um die Baukörper; eine Tabelle, wie viel des Bodens im Laufe des Tages verschattet ist; und eine Animation des Tages, die Sie abspielen oder Schritt für Schritt durchgehen können. **Karte speichern**, **Animationsbilder speichern** (alle Bilder auf einem Bild) und **Stunden speichern** (CSV) sichern die Ergebnisse.

Der Boden wird als eben auf der Höhe des niedrigsten Baukörpers angenommen. Für Schatten auf geneigtem Gelände verwenden Sie **Sonnenstunden**, das das Gelände auswertet.

## Solarertrag

Stellen Sie den Modulwirkungsgrad ein, wie viel jedes Dach und jede Wand bedeckt ist und die Systemverluste, dann **Solarertrag berechnen**. Für jedes Dach und jede Wand erhalten Sie den Strom, den ein Quadratmeter Modul in einem typischen Jahr erzeugen würde, wie viel davon die benachbarten Baukörper wegnehmen, und eine Summe für jeden Baukörper. Das Modell wird neben der Schaltfläche in einfachen Worten beschrieben: Es ist eine Planungsschätzung aus einem typischen Jahr, keine Garantie.

## Außenkomfort

**Komfort berechnen** ermittelt den Universellen Thermischen Klimaindex (UTCI) für eine stehende Person auf freiem Gelände und neben dem ersten Baukörper (Süd-, Nord-, Ost- und Westseite), mit dem Schatten jedes Baukörpers. Es zeigt, wie viel Himmel zu sehen ist, den mittleren UTCI am Tag und die Stunden über 32 (Hitzestress) und unter 0 (Kältestress).

## Wind (Orientierung)

**Windstudie berechnen** löst die Luftströmung um Ihre Baukörper einmal für jede Windrichtung, die in Ihrer Wetterdatei vorkommt (4, 8, 12 oder 16 Richtungen), über die Umgebung, die Sie wählen (offenes Land, Vorstadt oder Stadtzentrum), und summiert dann den stündlichen Wind des ganzen Jahres. Die Karte färbt den Boden nach Komfortklasse: von Grün (**sitzen**) über **stehen**, **flanieren** und **gehen** bis Rot (**unbehaglich**). Maßgeblich ist die Tätigkeit, deren Grenzgeschwindigkeit (4, 6, 8 und 10 m/s) in höchstens 5 % der Stunden überschritten wird. Eine zweite Tabelle gibt die Klasse nach NEN 8100 (A bis E) aus dem Anteil der Stunden, in denen der Wind 5 m/s überschreitet. Der Böenfaktor multipliziert den stündlichen Mittelwert zu einer wirksamen Böe.

So funktioniert es in einfachen Worten: ein Lattice-Boltzmann-Large-Eddy-Strömungslöser (eigener, in der Bibliothek `lib/wind`) in einem Kasten um die Gebäude, ein Windprofil, das mit der Höhe über der gewählten Rauheit ansteigt, und die Geschwindigkeit etwa 1.5 m über dem Boden im Vergleich zur Geschwindigkeit stromauf in 10 m. **Orientierend** ist schnell und grob; **Standard** verwendet mehr Zellen und läuft viel länger. Zeigt das Feld, dass das Gitter grob ist (unter 10 Zellen über dem höchsten Gebäude), oder dass sich die Strömung noch änderte, vertrauen Sie der Karte weniger.

**Was das nicht ist.** Der Löser wurde an Lehrbuchfällen geprüft (ein Kanal, eine deckelgetriebene Kavität) und an einem Würfel gerechnet, um zu sehen, ob Nachlauf und Beschleunigung an den Ecken richtig aussehen. Er wurde **nicht** an Windkanalmessungen an Gebäuden validiert, daher ist jedes Ergebnis als nicht validiert gekennzeichnet. Verwenden Sie ihn nicht für einen Bemessungswert, eine Windlast oder einen Planungsnachweis: Ein Windingenieur muss eine ordentliche Studie durchführen und bestätigen. Der ebene Boden, glatte Gebäudewände, die Rauheitsabkürzung der Wetterstation und die Schwellenwerttabelle sind Vereinfachungen; die Schwellenwerte können sich von den Kriterien unterscheiden, die Ihre Behörde verwendet.

## Wind mit OpenFOAM (Add-on)

Die oben beschriebene integrierte Windberechnung ist experimentell. Für einen richtigen Strömungslöser aktivieren Sie das Add-on **Fußgängerwind (OpenFOAM)** unter **Einstellungen > Add-ons** (es ist aus, bis Sie es einschalten). Es ist eigene Software unter der GPL, getrennt vom übrigen CadCraft, und enthält OpenFOAM nicht: Das installieren Sie selbst. Dann listet **Engine** im Windblock OpenFOAM auf.

Was Sie einmal einrichten:

1. **OpenFOAM installieren** (die ESI-v-Reihe von openfoam.com; das Add-on wird mit v2512 getestet). Unter Ubuntu oder Debian (auch innerhalb von WSL unter Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, dann `sudo apt install openfoam2512-default`. Es wird unter `/usr/lib/openfoam/openfoam2512` installiert. CadCraft benötigt `blockMesh`, `snappyHexMesh` und `simpleFoam` zum Ausführen. (Das ältere Paket `openfoam` 1912 aus dem eigenen Archiv von Ubuntu funktioniert auch, aber seine Function Objects stürzen ab; das Add-on liest dann die Ergebnisdateien selbst.)
2. **Den Helfer starten** aus dem Ordner `runner` des Add-ons mit Node.js: `node cc-openfoam-runner.mjs serve`. Ist OpenFOAM nicht im Suchpfad, geben Sie ihm eine kleine `runner.json` mit dem Pfad zu OpenFOAMs `etc/bashrc` (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) und starten Sie ihn mit `--config runner.json`. Der Helfer hört nur auf diesem Computer und gibt ein Token aus.
3. **Fügen Sie das Token** in die Felder des Add-ons im Windblock ein (die Adresse bleibt `http://127.0.0.1:8765`) und klicken Sie auf **Helfer prüfen**.

Danach führt **Windstudie berechnen** pro Windrichtung der Wetterdatei einen Fall aus: Ihre Baukörper werden zu einer Oberfläche (STL) in einem Kasten, dessen Größe der üblichen Richtlinie folgt (5 Gebäudehöhen rundum und darüber, 10 dahinter). Er wird mit blockMesh und snappyHexMesh vernetzt und als stationäre RANS-Rechnung mit k-epsilon und einem Zulauf mit atmosphärischer Grenzschicht über der gewählten Rauheit berechnet. Die Geschwindigkeit in 1.5 m wird ausgelesen und in dieselben Klassen nach Lawson und NEN 8100 eingeordnet. Nichts verlässt Ihren Computer.

**Was geprüft wurde.** Der Text über den Ergebnissen sagt das deutlich und ist Teil jeder gespeicherten CSV. Das Schreiben der Fälle, das Lesen der Ergebnisse und die ganze Kette des Add-ons sind ohne OpenFOAM getestet, und ein einzelner Würfel wurde mit echtem OpenFOAM bei drei Netzgrößen gerechnet (die Zahlen stehen in den Projektnotizen). Er wurde **nicht** an Windkanalmessungen an Gebäuden validiert. Es ist eine orientierende Angabe, kein Bemessungswert und kein Nachweis. Das Standard-k-epsilon-Modell überschätzt die Turbulenz vor Gebäuden, der Boden ist eben, Wände sind glatt, und es gibt weder Gelände noch Vegetation.
