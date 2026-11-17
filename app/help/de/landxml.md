---
title: LandXML austauschen
summary: LandXML aus anderer Tiefbau-Software als neues Projekt öffnen, Punkte, Oberflächen, Trassen, Profile und das Rohrnetz als LandXML 1.2 exportieren und wissen, was nicht übertragen wird.
keywords: landxml, xml, importieren, exportieren, austausch, tin, Oberfläche, Trasse, Profil, Rohrnetz, Interoperabilität, Datenaustausch
from: 870d5ece
---

LandXML ist das offene Austauschformat, das die meisten Tiefbauprogramme lesen und schreiben. CivilCraft liest und schreibt LandXML 1.2. Wenn Sie Civil 3D verwendet haben, kommen dessen Dialogfelder für LandXML-Import und -Export am nächsten; hier gibt es keine Auswahl zu treffen, und die Hinweise sagen Ihnen, was weggelassen wurde.

## Eine LandXML-Datei öffnen

1. Klicken Sie auf {{ui:Öffnen}} (oder drücken Sie {{key:Mod+O}}) und wählen Sie die Datei `.xml` oder `.landxml`, oder ziehen Sie sie auf den Plan.
2. Hat das aktuelle Projekt nicht gespeicherte Änderungen, fragt CivilCraft zuerst nach. Wählen Sie {{ui:Kopie speichern}}, {{ui:Nicht speichern}} oder {{ui:Abbrechen}}.
3. Ein **neues Projekt** wird erstellt. Die Statusleiste zeigt an, was gelesen wurde, zum Beispiel „site.xml geöffnet: 412 Punkte, 2 Oberflächen, 3 Trassen.“
4. Sehen Sie sich das Feld unter den Angaben zur **Oberfläche** an. Es listet alles auf, was übersprungen oder geändert wurde, zum Beispiel:
   - „Nur die erste Oberfläche („EG“) wurde geöffnet; die Datei hat noch 1.“
   - „Trasse „Ramp A“ hat Elemente, die CivilCraft noch nicht zeichnen kann (keine Linien, Bögen oder Klothoiden); sie wurde übersprungen.“
   - „Die Regeln des Rohrnetzes waren nicht in der Datei; die Platzhalter sind in Gebrauch – legen Sie Ihre unter Projekt fest.“

Was woraus wird:

| In der Datei | In CivilCraft |
|---|---|
| Einheiten (Imperial oder Metric) | Die **Einheiten** des Projekts (Fuß oder Meter) |
| Projektname | Der **Name** des Projekts |
| CgPoints | Die Punkte des Projekts; die Beschreibung (oder der Code) bestimmt die Gruppe |
| Die erste TIN-Oberfläche | Das vorhandene Gelände, unverändert übernommen („Oberfläche (aus LandXML)“) |
| Jede Trasse aus Linien, Bögen und Klothoiden | Eine Trasse mit ihren PIs, Radien und Spirallängen, aus den Kurven neu aufgebaut |
| Das erste Entwurfsprofil jeder Trasse | Ihr Entwurfsprofil mit parabelförmigen Vertikalkurven |
| Das erste Rohrnetz | Das Rohrnetz mit seinen Deckeln, Sümpfen und Sohlen |
| Plan-Features aus Linien und Bögen | Feature-Linien; Bögen bleiben erhalten; aus einem anderen Programm beginnen sie als **Nur gezeichnet** |

Die vollständige Liste der Elemente und Attribute finden Sie unter [LandXML: was gelesen und geschrieben wird](topic:landxml-reference).

:::note
Eine aus LandXML gelesene Oberfläche wird nicht neu aufgebaut, wenn Sie Punktgruppen ändern oder Bruchkanten zeichnen. Klicken Sie im Abschnitt **Geländemodell** auf {{ui:Geländemodell aus den Punkten neu erstellen}}, um sie stattdessen aus den Punkten aufzubauen ({{key:Mod+Z}} stellt die LandXML-Oberfläche wieder her).
:::

## LandXML exportieren

1. Klicken Sie in der Gruppe **Exportieren** auf {{ui:LandXML}}.
2. Der Browser lädt `<name>.xml` herunter. Die Statusleiste zeigt, was enthalten ist, zum Beispiel „LandXML 1.2 exportiert: 276 Punkte, 2 Oberflächen, 1 Trasse, das Rohrnetz. Bauplätze sind hier nicht Teil von LandXML; die geplante Oberfläche ist es.“

Die Datei enthält:

- **Einheiten**: US-Survey-Fuß oder Meter.
- **CgPoints**: jeder Punkt mit seiner Nummer als Name, seiner Beschreibung und seiner Gruppe als Code.
- **Oberflächen**: das vorhandene Gelände als TIN, mit seinen Bruchkanten und seiner äußeren Grenze als Quelldaten; und, wenn Bauplätze oder Korridore die Geländemodellierung ändern, eine zweite TIN-Oberfläche namens „Proposed“.
- **Trassen**: Linien, Bögen und Klothoiden mit ihren Stationen, jeweils mit einem Profil, das das entlang der Trasse abgetastete vorhandene Gelände enthält, und dem Entwurfsprofil (PVIs und Parabelkurven), wenn es mindestens zwei PVIs hat.
- **PipeNetworks**: Bauwerke mit ihren Deckeln, Sümpfen und der Sohle je Rohr sowie die Rohre mit Durchmesser, Länge und Gefälle.
- **PlanFeatures**: jede Feature-Linie als Linien und Bögen mit der Höhe an jedem Ende und dem Zweck, für den sie verwendet wird.

## Was nicht übertragen wird

- Bauplätze und Korridore als Objekte. Ihr Ergebnis steckt in der Oberfläche „Proposed“.
- Trassen mit Fehlern (zum Beispiel sich überschneidende Kurven): weggelassen und in der Statusmeldung gezählt.
- Rohre ohne beide Sohlen und Netze mit weniger als zwei Bauwerken.
- Ein aus der Oberfläche übernommener Deckel wird als fester Deckel geschrieben. Beim erneuten Öffnen behält das Bauwerk diesen Wert, auch wenn sich die Oberfläche ändert.
- Netzregeln (kleinstes Gefälle, Überdeckung, Absturz): LandXML hat dafür keinen Platz.
- Anzeigeeinstellungen und die Oberflächenauswahl der Punktgruppen: Speichern Sie dafür ein CivilCraft-Projekt.

Beim Öffnen liest CivilCraft keine anderen Spiralen als Klothoiden, keine Rasteroberflächen, keine Punkte, die nur auf andere Punkte verweisen, keine Flurstücke, keine Spiralen in Feature-Linien, keine Fahrbahnen und keine Vermessungsdaten. Jedes wird in den Hinweisen genannt, nie geraten.

## Hin und zurück

Um Arbeit an jemanden mit anderer Tiefbau-Software zu übergeben und zurückzuerhalten, exportieren Sie LandXML, lassen Sie es bearbeiten und öffnen Sie deren LandXML als neues Projekt. Bewahren Sie außerdem Ihre eigene `.civilcraft.json` auf: Sie ist die einzige Datei, die alles behält, was CivilCraft weiß.
