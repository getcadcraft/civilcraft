---
title: Der Arbeitsbereich Freileitungen
summary: Freileitungen und Erdkabel auf Ihrem Gelände, mit Ihren eigenen Bibliotheken, Durchhang und Zugkraft unter Ihren Lastfällen, Abstands- und Festigkeitsprüfungen, Seilzugtabellen, Mengen, Blättern und GIS-Export.
keywords: Freileitung, Stromleitung, Elektro, Verteilung, Maste, Leiter, Durchhang, Zugkraft, Seilzug, Abstand, Erdkabel, Graben, Arbeitsbereich, Versorger
from: 638dd856
---

Der Arbeitsbereich Freileitungen bringt Freileitungen und Erdkabel auf das CivilCraft-Gelände, das Sie bereits haben: dieselben Vermessungspunkte, dasselbe Gelände, dieselbe Projektdatei.

:::warning
Ein Entwurfshilfsmittel. Der Arbeitsbereich berechnet Durchhang, Zugkraft, Abstände und Lasten aus **Ihren** Lastfällen und Grenzwerten. Eine Norm eines Landes ist nicht eingebaut. Ein Ingenieur prüft jedes Ergebnis gegen die geltende Norm, bevor etwas gebaut wird.
:::

## Öffnen

Wählen Sie {{ui:Geländemodell}} › {{ui:Mehr}} › {{ui:Arbeitsbereich Freileitungen}} oder **Freileitungen** unter Arbeitsbereich. Die Symbolleiste zeigt dann eine Gruppe **Freileitungen**; die Gruppen Entwurf und GIS treten zurück. Wählen Sie **Civil** unter Arbeitsbereich, um zurückzukehren. CivilCraft merkt sich den zuletzt verwendeten Arbeitsbereich auf diesem Computer.

Der linke Bereich erhält oben zwei Abschnitte:

- **Freileitungen**: Ihre Lastfälle und Grenzwerte, die Leitungen und Kabel im Projekt sowie **Prüfungen**, immer aktuell. Klicken Sie auf eine Prüfung, um das auszuwählen, worum es geht.
- **Bibliothek**: Ihre eigenen Leiter, Kabel, Maste, Betriebsmittel und Grabentypen. Siehe [Ihre Freileitungsbibliothek](topic:power-line-library).

## Was in der Gruppe Freileitungen ist

| Werkzeug | Was es tut | Thema |
|---|---|---|
| **Leitung** | Eine Freileitung: Klicken Sie jeden Mast an | [Eine Freileitung zeichnen](topic:overhead-line) |
| **Mast** | Einen Mast auf einem Feld hinzufügen | [Eine Freileitung zeichnen](topic:overhead-line) |
| **Kabel** | Eine Erdkabeltrasse in einem Graben | [Erdkabel](topic:underground-cables) |
| **Betriebsmittel** | Einen Schrank, einen Transformator, eine Muffe oder die Quelle, aus der das Netz gespeist wird | [Erdkabel](topic:underground-cables) |
| **Hindernis** | Etwas, das eine Leitung kreuzt: eine Straße, ein Gebäude, eine andere Leitung | [Prüfungen](topic:power-line-checks) |
| **Längsschnitt** | Das Leitungsprofil: Gelände, Maste und Leiter bei jedem Lastfall | [Eine Freileitung zeichnen](topic:overhead-line#the-line-profile) |
| **Mehr** | Lastfälle und Grenzwerte, Seilzugtabellen, Mengen, Blätter und Bericht, GIS, Studiendateien | [Durchhang und Zugkraft](topic:sag-and-tension), [Ausgaben](topic:power-line-outputs), [Studiendateien](topic:power-line-study-file) |

Alles, was Sie hinzufügen, ist ein Schritt zum Rückgängigmachen, wird in der Projektdatei gespeichert und wird im Plan auf Layern mit dem Namen `C-POWR-…` gezeichnet. Dadurch enthalten auch die DXF-, DWG- und PDF-Exporte es.
