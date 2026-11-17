---
title: Adresse zum Grundstück
summary: Macht aus einer Adresse die Angaben, die ein Grundstück braucht: das Flurstück, die umliegenden Gebäude, die Bauleitplanung, Boden und Hochwasserzone. Die Daten stammen aus offenen Quellen, die Sie per Schaltfläche abrufen oder als Dateien mitbringen, und werden als Vorschläge an BimCraft übergeben.
keywords: Adresse, Geocodierung, Grundstück, Flurstück, Gebäude, Bauleitplanung, Boden, Hochwasser, offene Daten, OpenStreetMap, FEMA, SSURGO, USGS, Kontext, ccsite, BimCraft
from: 125d848a
---

## Funktion

Geländemodell › Mehr › Adresse zum Grundstück beantwortet für einen Punkt: in welchem Flurstück er liegt, welche Gebäude ihn umgeben, die Bauleitplanung, der Boden und die Hochwasserzone. Die Daten sind offen: Dateien, die Sie hinzufügen (GeoJSON, Shapefile, KML, GeoPackage), und, wenn Sie die Add-ons einschalten, Schaltflächen, die jeweils einen offenen Dienst abfragen.

## Verwendung

1. Geben Sie eine Adresse ein und drücken Sie die Schaltfläche Adresssuche (das Add-on „Adresssuche“), oder geben Sie Breiten- und Längengrad ein.
2. Fügen Sie Ebenen hinzu: Dateien mit „Dateien hinzufügen“ oder über die anderen Quellen-Schaltflächen (Hochwasserzone, Gebäude, Boden, Geländehöhe, Flurstücke des Landkreises). Ein Dienst wird nur abgefragt, wenn Sie seine Schaltfläche drücken. Beim Start wird nichts abgerufen.
3. Drücken Sie die Schaltfläche Ausführen für die Antwort in Worten und mit einer CSV-Datei.
4. „Grundstück als Datei speichern“ oder „An BimCraft als Vorschläge senden“ übergibt die Umrisse an BimCraft oder ModelCraft. Dort werden sie aufgelistet, und es werden nur die übernommen, die Sie ankreuzen.

## Wissenswertes

- Die Adresssuche läuft über getcadcraft.com, das für Sie bei Nominatim von OpenStreetMap anfragt (höchstens eine Anfrage pro Sekunde). Antworten werden 90 Tage gespeichert, damit dieselbe Adresse nie zweimal angefragt wird. Gespeichert wird nur ein Hashwert der Adresse, nie, wer gefragt hat. Die anderen Schaltflächen gehen direkt von Ihrem Browser zu ihrem Dienst.
- Jede Quelle hat ihre eigene Lizenz (OpenStreetMap steht unter der ODbL: Quellenhinweis beibehalten).
- Die Ebenen sind so gut wie die offenen Daten an Ihrem Ort. Prüfen Sie, was wichtig ist, anhand einer Vermessung.
