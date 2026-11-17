---
title: Riferimento della barra degli strumenti
summary: Ogni pulsante della barra degli strumenti di CivilCraft, cosa fa, il suo tasto, e quando è grigio o rifiuta l'azione.
keywords: barra degli strumenti, pulsanti, comandi, strumenti, file, esporta, superficie, progetto, modifica, vista, menu
from: 4c4352bc
---

La barra degli strumenti corre in alto nell'app in sette gruppi. Ogni pulsante mostra il suo suggerimento e il tasto quando si passa sopra con il mouse.

## File

| Pulsante | Tasto | Cosa fa |
|---|---|---|
| {{ui:Nuovo}} | nessuno | Avvia un progetto vuoto. Chiede prima se ci sono modifiche non salvate. |
| {{ui:Apri}} | {{key:Mod+O}} | Apre un file di punti (CSV, TXT), LandXML o un progetto CivilCraft. |
| {{ui:Salva}} | {{key:Mod+S}} | Scarica il progetto come `<name>.civilcraft.json`. |

## Esporta

| Pulsante | Tasto | Cosa fa |
|---|---|---|
| {{ui:LandXML}} | nessuno | Scarica `<name>.xml`: punti, superfici, tracciati, profili e la rete di tubazioni come LandXML 1.2. "Ancora nulla da esportare." quando il progetto è vuoto. |
| {{ui:DXF}} | nessuno | Scarica `<name>.dxf`: le linee della pianta come DXF R12. |
| {{ui:PDF}} | {{key:Mod+P}} | Apre **Stampa la pianta in PDF**. "Ancora nulla da stampare." quando il progetto è vuoto. |

## Superficie

| Pulsante | Tasto | Cosa fa |
|---|---|---|
| {{ui:Linea di discontinuità}} | {{key:B}} | Fare clic sui punti di rilievo in ordine, {{key:Enter}} per terminare. La linea di discontinuità prende le quote dei punti. |
| {{ui:Contorno}} | {{key:O}} | Fare clic sui vertici del contorno esterno, {{key:Enter}} per terminare. Sostituisce ogni contorno esistente. |

Entrambi dicono "Non c'è ancora una superficie: aprire prima i punti di rilievo." quando non c'è una superficie.

## Progetto

| Pulsante | Tasto | Cosa fa |
|---|---|---|
| {{ui:Tracciato}} | {{key:A}} | Fare clic sui PI in ordine, {{key:Enter}} per terminare. |
| {{ui:Piazzale}} | {{key:G}} | Fare clic sui vertici del piazzale, {{key:Enter}} per terminare. Come gli strumenti di superficie, avvisa quando non c'è una superficie: un piazzale si sistema solo su una superficie. |
| {{ui:Tubazioni}} | {{key:P}} | Fare clic sui manufatti da monte a valle (fare clic su uno esistente per agganciarlo), {{key:Enter}} per terminare. |
| {{ui:Profilo}} | {{key:R}} | Mostra o nasconde la vista del profilo sotto la pianta. |

## Modifica

| Pulsante | Tasto | Cosa fa |
|---|---|---|
| {{ui:Annulla}} | {{key:Mod+Z}} | Annulla l'ultima modifica (fino a 200). Grigio quando non c'è nulla da annullare. |
| {{ui:Ripristina}} | {{key:Mod+Y}} | Ripristina ciò che è stato annullato. Grigio quando non c'è nulla da ripristinare. |
| {{ui:Copia}} | {{key:Mod+C}} | Copia i punti di rilievo selezionati e li mette negli Appunti come righe di punti che un foglio di calcolo può accettare. Grigio finché non sono selezionati punti. |
| {{ui:Incolla}} | {{key:Mod+V}} | Incolla punti: seguono il puntatore, e un clic li posa con numeri che nessun altro punto ha. Anche le righe di punti copiate in un foglio di calcolo vengono incollate. |
| {{ui:Altro}} | nessuno | Apre il menu qui sotto. |

Il menu {{ui:Altro}}:

| Voce | Tasto | Cosa fa |
|---|---|---|
| {{ui:Taglia}} | {{key:Mod+X}} | Copia i punti selezionati e li elimina (un solo passo di annullamento). |
| {{ui:Copia}} | {{key:Mod+C}} | Come il pulsante {{ui:Copia}}. |
| {{ui:Incolla}} | {{key:Mod+V}} | Come il pulsante {{ui:Incolla}}. |
| {{ui:Incolla nella stessa posizione}} | {{key:Mod+Shift+V}} | Incolla i punti alle loro coordinate, con numeri che nessun altro punto ha. |
| {{ui:Duplica}} | {{key:Mod+D}} | Una copia dei punti selezionati segue il puntatore; fare clic dove deve andare. Gli Appunti restano invariati. |
| {{ui:Elimina}} | {{key:Delete}} | Elimina i punti di rilievo selezionati, oppure il tracciato, il piazzale, il manufatto (con le sue tubazioni), la tubazione o il PVI selezionato. |
| {{ui:Seleziona tutti i punti}} | {{key:Mod+A}} | Seleziona ogni punto di rilievo. |
| {{ui:Deseleziona tutto}} | {{key:Esc}} | Cancella la selezione. |

Una voce che non può agire in questo momento è grigia, e il suo suggerimento spiega il motivo. Dettagli: [Selezionare, copiare e incollare punti di rilievo](topic:copy-paste-points).

Annulla copre le modifiche al progetto, alle impostazioni della superficie e ai punti di rilievo (incolla, taglia, duplica, elimina). Non copre le impostazioni di visualizzazione, e l'apertura o l'importazione di un file qualsiasi la azzera.

## GIS

| Pulsante | Tasto | Cosa fa |
|---|---|---|
| {{ui:Coordinate}} | nessuno | Apre la finestra **Sistema di coordinate**: indicare quale sistema usa il progetto, oppure usare coordinate di terreno o locali. Vedere [Impostare il sistema di coordinate del progetto](topic:coordinate-systems) e [Coordinate di terreno e locali](topic:ground-and-local-coordinates). |
| {{ui:Importa}} | nessuno | Importa dati GIS: shapefile, GeoJSON, GeoPackage, griglie di quote e LiDAR. Vedere [Importare dati GIS](topic:gis-import). |
| {{ui:Esporta}} | nessuno | Esporta i dati come costruiti per un ufficio GIS. Vedere [Esportare i dati come costruiti per GIS](topic:gis-export). |
| {{ui:Analizza}} | nessuno | Apre il pannello di analisi GIS: buffer, sovrapposizione, join spaziale, selezione per attributo, misura. Vedere [Analizzare i layer GIS](topic:gis-analysis). |
| {{ui:Tabella degli attributi}} | nessuno | In Superficie › Altro. Apre la tabella degli attributi di un layer GIS: ordinare, filtrare, selezionare, modificare, aggiungere campi, calcolare, salvare come CSV. Vedere [Lavorare con la tabella degli attributi di un layer](topic:gis-table). |
| {{ui:Mappa}} | nessuno | Apre la finestra **Layer di mappa**: un'immagine georeferenziata, oppure server di mappe che si aggiungono, disegnati sotto la pianta. Vedere [Mostrare layer di mappa sotto la pianta](topic:map-layers). |

Gli strumenti GIS si caricano la prima volta che si usa uno di questi pulsanti, si apre un file GIS oppure un progetto con un sistema di coordinate o layer GIS.

## Vista

| Pulsante | Tasto | Cosa fa |
|---|---|---|
| {{ui:Seleziona}} | {{key:V}} o {{key:Esc}} | Fare clic per selezionare tracciati, piazzali, manufatti, tubazioni e punti ({{key:Shift}} e un clic o un trascinamento aggiunge punti); trascinare le grip per spostare i PI, gli angoli dei piazzali e i manufatti. |
| {{ui:Adatta}} | {{key:F}} | Adatta lo zoom della pianta per mostrare superficie, punti, tracciati e piazzali (nella vista 3D: mostra tutto). |
| {{ui:3D}} | {{key:D}} | Mostra il sito in 3D sopra la pianta, oppure torna alla pianta. La barra sopra la vista 3D imposta la vista, l'esagerazione, i colori e cosa mostrare, ed esporta GLB o OBJ. Vedere [Vedere il sito in 3D](topic:site-3d). |

## Pulsanti nei pannelli

| Pulsante | Dove | Cosa fa |
|---|---|---|
| {{ui:Apri il sito di esempio}} | La casella su una pianta vuota | Carica il rilievo di esempio (richiede una connessione, a meno che CivilCraft sia salvato per l'uso offline) |
| {{ui:Rimuovi il contorno}} | Pannello sinistro, Superficie | Elimina il contorno esterno |
| {{ui:Rimuovi le linee di discontinuità disegnate}} | Pannello sinistro, Superficie | Elimina ogni linea di discontinuità disegnata con lo strumento (non i gruppi di linee di discontinuità) |
| {{ui:Ricostruisci la superficie dai punti}} | Pannello sinistro, Superficie (solo superficie LandXML) | Elimina la TIN LandXML e costruisce dai punti; non può essere annullato |
| {{ui:Inizia dal terreno}} | Pannello destro, Tracciato | Avvia un profilo di progetto con un PVI sul terreno a ciascuna estremità |
| {{ui:Vista del profilo}} | Pannello destro, Tracciato | Apre la vista del profilo per questo tracciato |
| {{ui:Aggiungi PVI}} | Barra del profilo | Mentre è premuto, un clic nel profilo aggiunge un PVI |
| {{ui:Imposta tutte le quote di fondo dalle regole}} | Pannello destro, Rete di tubazioni | Imposta le quote di fondo di tutte le tubazioni dalle regole |
| {{ui:Imposta le sue quote di fondo dalle regole}} | Pannello destro, Tubazione | Imposta le quote di fondo di questa tubazione dalle regole |
