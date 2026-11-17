---
title: Tabelle, quantità, tavole e GIS delle linee elettriche
summary: Tabelle di tesatura e dei sostegni, quantità di materiali per un foglio di calcolo o TakeoffCraft, tavole di pianta e profilo con una relazione di studio in un unico PDF, e layer GIS con i dati di ogni elemento.
keywords: tabella di tesatura, tabella dei sostegni, quantità, distinta base, takeoffcraft, tavole, relazione, pdf, tavola del profilo, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Tutto ciò che segue si trova in {{ui:Altro}} nel gruppo Linee elettriche.

| Risultato | Cosa si ottiene |
|---|---|
| {{ui:Tabelle di tesatura…}} | Per sezione, la tensione orizzontale e la freccia di ogni campata a ogni temperatura; salvare come CSV. {{ui:Salva la tabella dei sostegni (CSV)}}: ruolo, elemento, terreno, attacco, carico massimo, nominale, OK, suggerimento, fondazione, oscillazione e sollevamento di ogni sostegno |
| {{ui:Quantità…}} | Conduttore (lunghezze di catenaria × conduttori × circuiti + 2 % per le derivazioni e gli amarri), sostegni e apparecchiature per elemento di libreria, cavo, trincea, scavo, condotti, giunti. CSV, Excel o un file di quantità per TakeoffCraft |
| {{ui:Tavole e relazione…}} | Un unico PDF: la pianta; una tavola del profilo per ogni linea con il conduttore alle ipotesi di carico scelte e una striscia di lunghezze di campata, frecce e distanze minime dal suolo; e una relazione di studio (regola, sezioni, tabelle di tesatura, sostegni, ogni verifica) |
| {{ui:Esporta in GIS…}} | Sostegni, campate, percorsi di cavo, apparecchiature e ostacoli come layer con i propri dati (altezze, carichi, frecce, distanze, ciò che non è conforme), in GeoPackage, shapefile, GeoJSON, KML o KMZ |

GeoJSON e KML richiedono il sistema di coordinate del progetto ([Sistemi di coordinate](topic:coordinate-systems)); senza di esso, GeoPackage e shapefile riportano i valori del progetto così come sono.
