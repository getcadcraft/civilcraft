---
title: GIS-Layer analysieren
summary: GIS-Layer eines Projekts puffern, überlagern (Schnittmenge, Vereinigung, Löschen, Auflösen), räumlich verknüpfen, nach Attribut auswählen und messen, jeweils als neuer Layer, den Sie rückgängig machen können.
keywords: gis, analyse, puffer, überlagerung, schnittmenge, vereinigung, löschen, zuschneiden, auflösen, räumliche verknüpfung, verknüpfen, nach attribut auswählen, abfrage, where, ausdruck, statistik, fläche, länge, umfang, messen, flurstücke, grunddienstbarkeit, abstandsfläche, shapefile, geopackage, attributtabelle
from: a6b2d3f9
---

Sobald ein Projekt GIS-Layer hat (siehe [GIS-Daten importieren](topic:gis-import)), öffnet die Schaltfläche **Analysieren** in der Gruppe GIS (Befehl `GISANALYSIS`, `ANALYZE` oder `BUFFER`) ein Panel mit fünf Registerkarten. Es bleibt neben dem Plan geöffnet, sodass das, was Sie auswählen, im Plan angezeigt wird, während Sie arbeiten.

Jedes Werkzeug, das etwas erzeugt, **fügt einen neuen Layer hinzu** und lässt die gelesenen Layer genau so, wie sie waren. Jeder Vorgang ist ein Schritt für {{ui:Rückgängig}}: {{ui:Rückgängig}} im Panel (oder Ctrl+Z) entfernt den neuen Layer. Exportieren Sie das Ergebnis wie jeden Layer mit [GIS-Ist-Daten exportieren](topic:gis-export) als Shapefile, GeoJSON oder GeoPackage.

Die vollständige Tabelle eines Layers mit Sortierung, Bearbeitung und Feldrechner steht in [Mit der Attributtabelle eines Layers arbeiten](topic:gis-table); das Einfärben nach einem Feld steht in [Einen Layer nach einem Attribut gestalten](topic:gis-symbology).

Alles wird im Plan bearbeitet, in den Einheiten des Projekts (Fuß oder Meter). Ein Projekt liegt immer in einem projizierten oder lokalen System, daher bedeutet eine Strecke von 50 entweder 50 Fuß oder 50 Meter, niemals Grad. Höhen (z) werden in den Ergebnissen nicht beibehalten.

## Puffer

Zeichnet um jedes Objekt eine Zone mit einem festen Abstand als neuen Polygon-Layer. Punkte werden zu Kreisen, Linien zu Korridoren mit abgerundeten Enden, Polygone werden größer. Ein **negativer** Abstand verkleinert Polygone (ein Quadrat von 100 mal 100, um 5 verkleinert, ist 90 mal 90; um 60 verkleinert bleibt nichts übrig, und das Panel meldet das). Nehmen Sie den Abstand aus einem Zahlenfeld, um jedem Objekt einen eigenen zu geben, oder aktivieren Sie **Alle Puffer zu einer Form verschmelzen**, um sie aufzulösen.

Die gerundeten Teile bestehen aus geraden Stücken innerhalb des echten Bogens; daher ist ein Puffer etwas kleiner als der exakte Kreis: etwa 0,6 % in der Fläche bei der normalen Einstellung, 0,16 % bei Fein. Verwenden Sie Fein für alles, was Sie messen wollen.

## Überlagerung

| Werkzeug | Was Sie erhalten |
|---|---|
| Schnittmenge | Die Teile, in denen der Eingabe-Layer die Überlagerungspolygone trifft, jeweils mit den Feldern beider. Linien und Punkte werden auf die Polygone zugeschnitten. |
| Vereinigung | Beide Polygon-Layer entlang der Kanten des jeweils anderen zerschnitten: Gemeinsame Teile tragen die Felder beider Layer, der Rest trägt die Felder eines Layers (die Felder des anderen sind leer). |
| Löschen | Die Eingabepolygone ohne die Überlagerungspolygone. Die Felder bleiben beim Eingabe-Layer. Ein vollständig gelöschtes Objekt wird weggelassen (das Panel zählt sie). |
| Auflösen | Verschmilzt Polygone, die sich berühren oder überlappen, alle zusammen oder eine Form für jeden Wert eines Feldes. Fügt `COUNT` und `AREA` hinzu. |

Ein Feldname, den beide Layer haben, wird für den ersten Layer beibehalten, und der des zweiten Layers wird mit `_2` geschrieben. Objekte innerhalb eines Layers sollten sich nicht gegenseitig überlappen: Wo sie es tun, zählt eine Vereinigung die Überlappung in beiden.

## Verknüpfung

Eine räumliche Verknüpfung kopiert Attribute von einem **Quell**-Layer auf jedes **Ziel**-Objekt, das ihn trifft, und ergibt einen neuen Layer mit den Formen des Ziels. Wählen Sie, wann sie sich treffen: berühren oder überlappen, das Ziel liegt innerhalb eines Quellpolygons, das Ziel enthält das Quellobjekt, das nächste Quellobjekt (optional mit Grenze) oder ein beliebiges Quellobjekt innerhalb eines Abstands.

Wenn mehrere Quellobjekte passen, übernehmen Sie die Attribute des ersten (bei Verknüpfungen mit dem nächsten Objekt oder nach Abstand das nächste; `DISTANCE` wird hinzugefügt), oder **zählen Sie sie und summieren ihre Zahlenfelder**: `COUNT` sowie `SUM_`, `MEAN_`, `MIN_`, `MAX_` für jedes Zahlenfeld. Entfernen Sie den Haken bei **Zielobjekte ohne Treffer behalten**, um diese wegzulassen. Verknüpfte Felder sind leer, wo nichts passte, und das Panel zählt die nicht zugeordneten.

## Auswahl

Geben Sie eine Frage zu den Attributen oder zur Form ein, drücken Sie **Wählen**, und die Objekte werden im Plan mit ihrer Anzahl, einer Tabelle und der Gesamtfläche, -länge oder -anzahl angezeigt. Dann machen Sie daraus einen eigenen Layer, zoomen darauf oder heben die Auswahl auf.

| Sie können schreiben | Beispiel |
|---|---|
| Ein Feld beim Namen; "Anführungszeichen" oder [Klammern], wenn der Name Leerzeichen hat | `VALUE`, `"Lot Number"` |
| Zahlen, 'Text', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (Text ohne Beachtung der Groß- und Kleinschreibung; bei `like` steht `%` für beliebig viele Zeichen und `_` für einen Buchstaben) | `Notes contains 'corner'` |
| `is null`, `is not null` (ein leerer Wert zählt als null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` und Klammern | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Formwerte `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Eine Frage, die unvollständig ist oder ein Feld nennt, das der Layer nicht hat, wird mit einem Satz abgelehnt, der sagt, wo das Problem liegt.

## Messen

Zeigt die Gesamtfläche und den Umfang, die Länge bzw. die Anzahl des Layers und **fügt Felder** hinzu: `AREA` und `PERIMETER` für Polygone, `LENGTH` für Linien (die Länge im Plan), `X` und `Y` für Punkte. Ein bereits vorhandenes Feld wird nie überschrieben: Das neue heißt `AREA_2`. Dies ist ein Schritt für {{ui:Rückgängig}}. **Statistik** liefert Anzahl, Summe, Mittelwert, Minimum und Maximum eines Zahlenfeldes, optional für jeden Wert eines anderen Feldes.

:::note
Die Prüfungen hinter diesen Werkzeugen werden im Test von Hand durchgeführt (`node bin/test-civilcraft-gisanalysis.mjs`): Parzellen von 100 mal 100 unter einer Zone von 100 mal 80 ergeben zum Beispiel eine Schnittmenge von 3.000 plus 3.000, und eine 100 Meter lange Linie, mit 10 gepuffert, ergibt 2.000 plus einen Kreis.
:::
