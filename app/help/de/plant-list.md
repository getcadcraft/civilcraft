---
title: Die Pflanzenliste
summary: Rund 420 häufige gemäßigte und mediterrane Pflanzen mit ihren Größen, Winterhärte, Licht- und Wasseransprüchen, durchsuchbar in jeder Sprache, dazu Ihre eigene Liste, die mit dem Projekt gespeichert wird.
keywords: Pflanzenliste, Pflanzendatenbank, Art, botanischer Name, deutscher Name, Pflanzenpalette, Baumschulliste, Winterhärtezone, CSV, Pflanzen importieren, Pflanzen exportieren, meine Pflanzen, Baumliste, Strauchliste, Pflanzenverzeichnis
from: 7ed09e7e
---

Der Bereich **Pflanzen** im linken Bereich listet jede Pflanze auf, die Sie setzen können. Klicken Sie auf eine, um ihre Größen zu sehen und sie zur Pflanze zu machen, die **Pflanze**, **Beet** und **Hecke** verwenden.

## Suchen und filtern

Geben Sie in **Suche** ein: jedes Wort eines Pflanzennamens in jeder Sprache (Englisch, Spanisch, Portugiesisch), den botanischen Namen, den Typ oder ein Wort in den Hinweisen. Jedes eingegebene Wort muss passen, sodass `quercus evergreen` die immergrünen Eichen findet. Akzente spielen keine Rolle.

Engen Sie die Liste mit **Typ**, **Licht**, **Wasser** und **Winterhärtezone** ein (die USDA-Zone Ihres Geländes: Eine Pflanze wird aufgeführt, wenn die Zone in ihrem Bereich liegt).

## Was eine Pflanze enthält

| Feld | Bedeutung |
|---|---|
| Typ | Baum, Strauch, Hecke, Gras (einschließlich Rasen), Staude, Bodendecker oder Kletterpflanze |
| Ausgewachsen | Höhe und Breite der Pflanze, wie sie in einem Garten oder an einer Straße wächst, in Metern |
| Bei der Pflanzung | Die Größe, in der sie gesetzt wird, und ihr Behälter |
| Abstand | Von Mitte zu Mitte in einem Beet oder entlang einer Hecke |
| Winterhärtezone | Die USDA-Zonen, in denen sie meist winterhart ist |
| Licht, Wasser, Boden | Was sie braucht |
| Hinweise | Verwendung und Vorsichtshinweise, etwa giftige Teile oder eine Pflanze, die sich ausbreitet |

:::note
Die eingebaute Liste wurde für CadCraft aus allgemeinem gärtnerischem Wissen erstellt: übliche, gerundete Größen. Sie ist kein Katalog einer Baumschule. Prüfen Sie Größen und Winterhärte bei einer Baumschule vor Ort. Die bekanntesten invasiven Pflanzen der Iberischen Halbinsel und großer Teile der gemäßigten Zonen sind absichtlich nicht aufgeführt; einige, die andernorts invasiv sind, tragen einen Hinweis.
:::

## Ihre eigenen Pflanzen

- **Zur Liste dieses Projekts hinzufügen** kopiert eine Pflanze in die eigene Liste des Projekts, wo sie mit dem Projekt gespeichert wird. Eine Pflanze in Ihrer Liste ersetzt die eingebaute mit demselben Schlüssel, sodass Sie ihre Größen für Ihre Region ändern können.
- **Pflanzenliste importieren…** liest eine CSV-Datei (oder eine Pflanzendatei). Die CSV braucht eine Spalte mit dem botanischen Namen und idealerweise Typ, Höhe und Breite; Spaltennamen in Ihren eigenen Worten funktionieren (etwa Latin, Common name, Height, Spread, Width, Zone). Kommas, Semikolons oder Tabulatoren sowie Dezimalkommas werden gelesen. Leere Pflanzgrößen, Abstände und Behälter erhalten für den Typ sinnvolle Standardwerte.
- **Als CSV exportieren** speichert Ihre Liste (oder, ohne eigene Einträge, die Pflanzen, die die Suche zeigt), um sie in einer Tabellenkalkulation zu öffnen.

Eine Pflanzenliste wird wie jede Datei von außen gelesen: Was sie nicht verwenden kann, wird ausgelassen und gezählt.

## Pflanzen in anderen Apps

Die Pflanzenliste ist eine Bibliothek für jede CadCraft-App: BimCraft und ModelCraft führen dieselbe Liste, aber ihr eigenes Aus Bibliothek platzieren bietet Pflanzen noch nicht an. Heute gelangen Pflanzen über die Landschafts-IFC von CivilCraft in ein BIM-Modell (jede Pflanze als `IfcGeographicElement`). Siehe [Pflanzpläne und Pflanzenlisten](topic:planting#ifc).
