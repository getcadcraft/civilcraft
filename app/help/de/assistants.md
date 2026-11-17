---
title: Einen KI-Assistenten mit Ihrem Gelände arbeiten lassen
summary: Schalten Sie Assistenten in den Einstellungen ein, damit ein Assistent auf Ihrem Computer das geöffnete Gelände lesen kann (Punkte, Oberflächen, Volumen, Längsschnitte, Parzellen), Vermessungspunkte hinzufügt, Projekte speichert und LandXML oder DWG exportiert, über CadCraft Studio. Bis Sie es einschalten, ist es ausgeschaltet.
keywords: KI, Assistent, MCP, Skript, Automatisierung, Studio, Punkte, Höhe, Station, Versatz, Trasse, Volumen, Abtrag, Auftrag, Längsschnitt, Parzelle, LandXML, DWG, USD, Ordner, Berechtigungen, Trennen, Aktivität
from: d0356582
---

## Was Sie lernen

Wie Sie einen KI-Assistenten (jeden Assistenten, der MCP spricht) mit dem geöffneten Gelände arbeiten lassen, was er darf und was nicht, und wie Sie ihn stoppen.

## Was ein Assistent in CivilCraft tun kann

| Er fragt nach | Was er bekommt | Benötigt |
|---|---|---|
| Das Gelände | Name, Einheiten, Koordinatensystem, Punktgruppen, Trassen, Geländemodelle, Plateaus, Parzellen und Rohre | Lesen |
| Vermessungspunkte | Nummer, Rechtswert, Hochwert, Höhe und Beschreibung, nach Gruppe, nach Beschreibung oder innerhalb eines Rechtecks | Lesen |
| Geländehöhen | Das bestehende Gelände (oder die geplante Oberfläche) an beliebigen Punkten, die er nennt | Lesen |
| Stationen und Versatz | Station und Versatz von Punkten entlang einer Trasse oder die Koordinaten und Geländehöhe von Stationen | Lesen |
| Ein Längsschnitt | Höhen von Gelände, Entwurf und geplanter Oberfläche entlang einer Trasse, in festen Abständen in ft oder m | Lesen |
| Abtrag und Auftrag | Volumen zwischen dem bestehenden Gelände und der geplanten Oberfläche (auch je Plateau und Korridor) oder zwischen dem Gelände und einer Ebene | Lesen |
| Parzellen | Ecken, Fläche (in acres oder hectares), Umfang und die rechtliche Beschreibung | Lesen |
| Eine Auswahl | Die Punkte, die er nennt, werden im Plan ausgewählt, als hätten Sie sie angeklickt | Bearbeiten |
| Neue Vermessungspunkte | Punkte, die mit den Nummern hinzugefügt werden, die er angibt, oder mit den nächsten freien. Jeder Aufruf ist ein Schritt, den Sie rückgängig machen können | Bearbeiten |
| Speichern | Das eigene {{ui:Speichern}} von CivilCraft | Speichern |
| LandXML oder DWG | Dieselben Dateien wie die Schaltflächen {{ui:LandXML}} und {{ui:DWG}} | Exportieren |
| Das Gelände in 3D | OpenUSD (.usdz, .usda oder .usdc) von Gelände, geplanter Oberfläche, Plateaus und Rohren, so wie die 3D-Ansicht sie exportiert | Exportieren |
| Pflanzen und Pflanzenliste | Pflanzen aus der Pflanzenliste, unter welchem Namen auch immer, und die Mengen der Pflanzenliste | Lesen |
| Bepflanzung und Geländemodellierung | Pflanzen, ein Beet oder eine Hecke gesetzt oder eine Plattform, ein Erdwall, eine Mulde oder ein Geländebereich hinzugefügt, jeweils ein Schritt, den Sie rückgängig machen können, mit seinem Abtrag und Auftrag | Bearbeiten |
| Bewässerungsprüfung | Durchfluss je Zone, der Druck an ihrem Ventil und an der Versorgung, die ungünstigste Förderhöhe, Laufzeiten, Probleme und die Stückliste. Das ist eine Rechenhilfe, die ein Bewässerungsplaner prüft | Lesen |

Er arbeitet mit dem geöffneten Gelände. In Studio kann er auch in Ordner speichern und exportieren, die Sie wählen (siehe unten). Ohne Ordner werden seine Dateien wie bei den Schaltflächen heruntergeladen.

## Einschalten

Assistenten erreichen CivilCraft über CadCraft Studio auf Ihrem Computer. Der reine Browser hat keinen Zugang.

1. Öffnen Sie {{ui:Einstellungen}} und wählen Sie die Registerkarte **CivilCraft**.
2. Setzen Sie unter **Assistenten** das Häkchen bei **KI-Assistenten und Skripte dürfen CivilCraft verwenden**.
3. **Lesen** ist für Sie angekreuzt. Setzen Sie das Häkchen bei **Bearbeiten**, **Speichern** oder **Exportieren** nur, wenn der Assistent sie braucht.
4. Damit er in einen Ordner speichern und exportieren darf, wählen Sie unter **Ordner, die er verwenden darf** {{ui:Einen Ordner hinzufügen…}} und wählen den Ordner im Dialog von Studio. {{ui:Entfernen}} nimmt ihn sofort zurück. Jeder andere Pfad wird abgelehnt.
5. Verbinden Sie den Assistenten in Studio. Studio zeigt die Adresse und die Einstellungen, die Sie dort einfügen müssen.

## Während ein Assistent verbunden ist

Ein Hinweis oben im rechten Bedienfeld zeigt, welcher Assistent verbunden ist und was er tun kann. Klicken Sie auf {{ui:Trennen}}, um seine Sitzung sofort zu beenden. Er muss sich neu verbinden, um weiterzumachen.

**Aktivität** unter **Assistenten** in den Einstellungen listet jeden Aufruf des Assistenten auf, den neuesten zuerst, mit der Angabe, ob er funktioniert hat.

:::tip
Fragen Sie in einfachen Worten, zum Beispiel „Wie hoch liegt das Gelände alle 50 ft entlang der Main Street?“, „Wie viel Abtrag und Auftrag brauchen die Plateaus?“ oder „Fügen Sie einen Festpunkt an diesen Koordinaten hinzu“. Der Assistent liest das Gelände und antwortet oder nimmt die Änderung als einen Schritt vor, den Sie rückgängig machen können.
:::

## Ohne CivilCraft zu öffnen

Der CadCraft-Dateiserver für Assistenten (`npx @getcadcraft/mcp`) und die Befehlszeile `cadcraft` öffnen gespeicherte CivilCraft-Projekte (`.civilcraft.json`) und Punktdateien mit dem eigenen Code von CivilCraft, ohne Fenster. Dazu gehören dieselben Lesewerkzeuge, das Hinzufügen von Punkten, das Speichern des Projekts, LandXML und das Gelände in 3D als OpenUSD. `cadcraft convert site.civilcraft.json site.xml` schreibt LandXML über die Befehlszeile. Das Öffnen von LandXML, der DWG-Export und die Werkzeuge des Arbeitsbereichs Landschaft brauchen weiterhin das CivilCraft-Fenster.

## Ausschalten

Entfernen Sie das Häkchen bei **KI-Assistenten und Skripte dürfen CivilCraft verwenden**. Jeder Assistent wird sofort getrennt, und die Einstellung bleibt für das nächste Mal erhalten.

## Siehe auch

- [Rezepte für KI-Assistenten](common:assistants-recipes): Beispiele, jeweils mit den Werkzeugen, die sie aufrufen.
- [Horizontale Trasse anlegen](topic:alignment)
- [Geländemodell aufbauen und verfeinern](topic:build-surface)
- [Vermessungspunkte auswählen, kopieren und einfügen](topic:copy-paste-points)
- [Einstellungen von CivilCraft](topic:settings)
