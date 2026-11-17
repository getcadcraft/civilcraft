---
title: Boden- und lokale Koordinaten
summary: Mit Bodenkoordinaten arbeiten, die aus dem Gitter mit einem kombinierten Maßstabsfaktor skaliert werden, den Sie eingeben oder an einem Punkt berechnen, oder in einem angenommenen Baustellenraster, das über zwei Passpunkte an das System gebunden wird.
keywords: bodenkoordinaten, oberflächenkoordinaten, gitter zu boden, kombinierter maßstabsfaktor, csf, kombinierter faktor, gitterfaktor, höhenfaktor, meeresspiegelfaktor, meridiankonvergenz, abbildungswinkel, maßstabsfaktor, angenommene koordinaten, lokale koordinaten, baustellenraster, 5000 5000, passpunkte, lokalisierung, kalibrierung, zwei punkte, schlussfehler
from: 3d7453de
---

State-Plane- und UTM-Koordinaten sind **Gitter**koordinaten: Eine Kartenprojektion dehnt oder staucht Strecken ein wenig (zehn ppm und mehr), und je höher der Standort liegt, desto mehr weicht eine gemessene Bodenstrecke von der Gitterstrecke ab. Viele Vermessungen übergeben daher **Boden**koordinaten, skaliert, sodass Strecken im Plan den am Boden gemessenen Strecken entsprechen, oder ein **angenommenes** Baustellenraster (5000, 5000 an einem Passpunkt). CivilCraft behält Ihre Zahlen unverändert und hält fest, wie sie sich zum Gitter verhalten, damit Breiten- und Längengrade, GIS-Dateien und Kartenlayer dennoch am richtigen Ort landen.

Öffnen Sie {{ui:Koordinaten}} in der Gruppe {{ui:GIS}}, wählen Sie das System (oder behalten Sie es), und wählen Sie dann unter **Gitter-, Boden- oder lokale Koordinaten**:

| Auswahl | Ihre Koordinaten sind | Wie sie sich zum Gitter verhalten |
|---|---|---|
| {{ui:Gitter}} | Die eigenen des Systems (der Ausgangspunkt) | Dieselben Zahlen |
| {{ui:Boden}} | Auf Bodenstrecken skaliert | Gitter = Basis + kombinierter Faktor × (Boden − Basis) |
| {{ui:Lokal}} | Ein angenommenes Baustellenraster | Durch zwei Passpunkte verschoben, gedreht und auf das Gitter skaliert |

Die Auswahl wird mit dem Projekt gespeichert und ist ein Schritt für Rückgängig; nichts bewegt sich.

## Bodenkoordinaten

1. Wählen Sie {{ui:Boden}}.
2. Geben Sie den **kombinierten Maßstabsfaktor** aus der Vermessung ein (zum Beispiel `0.99987`), oder berechnen Sie ihn:
   1. Unter **Faktor an einem Punkt berechnen** beginnt der Punkt in der Mitte des Projekts. Wählen Sie {{ui:Einen Punkt im Lageplan wählen}} und klicken Sie die Stelle an (ein Klick nahe einem Vermessungspunkt übernimmt diesen Punkt), oder geben Sie E und N ein.
   2. Die Höhe stammt aus dem Gelände dort; geben Sie eine andere ein, wenn Sie sie brauchen.
   3. Wählen Sie {{ui:Berechnen}}. CivilCraft zeigt:
      - **Gitter-Maßstabsfaktor k**: wie stark die Kartenprojektion dort Strecken dehnt.
      - **Höhenfaktor**: wie viel kürzer Strecken am Ellipsoid sind als in dieser Höhe.
      - **Kombinierter Faktor** = k × Höhenfaktor: Gitterstrecke = Bodenstrecke × dieser Faktor.
      - **Meridiankonvergenz**: der Winkel von Gitter-Nord zu wahrem Nord dort (geodätisches Azimut = Gitterazimut + Konvergenz).
   4. Wählen Sie die Schaltfläche {{ui:Verwendung}} unter den Zahlen, um den kombinierten Faktor in das Feld zu übernehmen.
3. Legen Sie den **Basispunkt** fest, an dem Boden- und Gitterkoordinaten gleich sind. Er beginnt bei 0, 0: Die meisten Behörden, die Bodenkoordinaten veröffentlichen, skalieren um den Ursprung, sodass Bodenkoordinaten erkennbar nahe an den Gitterkoordinaten bleiben. Manche Vermessungen skalieren um den Passpunkt des Projekts: Verwenden Sie, was die Vermessung angibt.
4. Wählen Sie {{ui:Übernehmen}}.

:::warning
Die Höhe wird als Höhe über dem Ellipsoid genommen. CivilCraft hat kein Geoidmodell; liegt das Geoid 30 m (100 ft) unter oder über dem Ellipsoid, ist der Höhenfaktor um etwa 5 ppm falsch. Wenn die Vermessung ihren kombinierten Faktor angibt, geben Sie diesen ein.
:::

## Lokale (angenommene) Koordinaten

1. Wählen Sie {{ui:Lokal}}.
2. Für **Passpunkt 1** geben Sie die Nummer des Vermessungspunkts ein (oder wählen Sie {{ui:Wählen}} und klicken Sie ihn im Plan an). Seine lokalen Koordinaten werden daneben angezeigt.
3. Geben Sie seine **Gitter**-E- und -N-Werte ein oder seine Breite und Länge im dritten Feld (zum Beispiel `30.2672, -97.7431`).
4. Verfahren Sie ebenso für **Passpunkt 2**, so weit wie möglich vom ersten entfernt.
5. CivilCraft zeigt den gefundenen **Maßstab** und die **Drehung** und erinnert Sie: **Zwei Punkte passen immer genau — prüfen Sie einen dritten.**
6. Geben Sie einen **Kontrollpunkt** auf dieselbe Weise an. CivilCraft zeigt, wie weit die Anpassung ihn von den Gitterkoordinaten entfernt, die Sie eingegeben haben (sein Schlussfehler, in Projekteinheiten und ppm). Ein großer Schlussfehler bedeutet einen falschen Punkt, einen Tippfehler oder Koordinaten in einer anderen Einheit.
7. Wählen Sie {{ui:Übernehmen}}.

Ein Maßstab weit von 1 (über 0,5 bis 2 hinaus) wird abgelehnt: Prüfen Sie die Punkte und ihre Einheiten.

## Was geprüft wurde

- Der Maßstabsfaktor und die Konvergenz stimmen mit PROJ überein (pyproj 3.7.1 mit PROJ 9.5.1), der Koordinatenbibliothek, die die meisten GIS-Programme verwenden, auf 1 Teil in einer Milliarde über mehr als 300 winkeltreue Systeme (State Plane, UTM, transversale Mercator-Projektion, Lambert-Kegelprojektion) und im Browser an einem im Plan gewählten Punkt.
- Boden- und lokale Schritte rechnen hin und zurück auf 1 Teil in einer Milliarde um; zwei Passpunkte geben den Maßstab und die Drehung zurück, mit denen sie erzeugt wurden; ein Kontrollpunkt, 0,05 ft daneben, zeigt einen Schlussfehler von 0,05 ft.
