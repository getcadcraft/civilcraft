---
title: Indirizzo al sito
summary: Trasforma un indirizzo in ciò che un sito deve sapere: la particella, gli edifici circostanti, la zonizzazione, il suolo e la zona di alluvione, da dati aperti richiesti con un pulsante o forniti come file, e invia gli elementi a BimCraft come suggerimenti.
keywords: indirizzo, geocodifica, sito, particella, edifici, zonizzazione, suolo, alluvione, dati aperti, openstreetmap, fema, ssurgo, usgs, contesto, ccsite, bimcraft
from: 125d848a
---

## Cosa fa

Superficie › Altro › Indirizzo al sito indica, per un punto: in quale particella si trova, quali edifici lo circondano, la zonizzazione, il suolo e la zona di alluvione. I dati sono aperti: file che si aggiungono (GeoJSON, shapefile, KML, GeoPackage) e, quando si attivano gli add-on, pulsanti che interrogano ciascuno un servizio aperto.

## Come si usa

1. Digitare un indirizzo e premere il pulsante di ricerca dell'indirizzo (l'add-on "Ricerca indirizzo"), oppure digitare latitudine e longitudine.
2. Aggiungere livelli: file con "Aggiungi file", oppure gli altri pulsanti di origine (zona di alluvione, edifici, suolo, altezza del terreno, particelle catastali locali). Un servizio viene interrogato solo quando si preme il suo pulsante; nulla viene scaricato all'avvio.
3. Premere il pulsante di esecuzione per ottenere la risposta in parole, con un CSV.
4. "Salva il sito come file" oppure "Invia a BimCraft come suggerimenti" consegna i contorni a BimCraft o a ModelCraft; questi li elencano e aggiungono solo ciò che è selezionato.

## Da sapere

- La ricerca dell'indirizzo passa da getcadcraft.com, che interroga per conto dell'utente Nominatim di OpenStreetMap (al massimo una richiesta al secondo; risposte conservate per 90 giorni, così lo stesso indirizzo non viene mai richiesto due volte; viene memorizzato solo un hash dell'indirizzo, mai chi l'ha richiesto). Gli altri pulsanti vanno direttamente dal browser al rispettivo servizio.
- Ogni fonte ha la propria licenza (OpenStreetMap è ODbL: mantenere la riga di attribuzione).
- I livelli sono buoni quanto i dati aperti del proprio territorio. Verificare ciò che conta con un rilievo.
