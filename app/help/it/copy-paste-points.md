---
title: Selezionare, copiare e incollare punti di rilievo
summary: Selezionare punti di rilievo con un clic, con Shift e con un riquadro, o tutti insieme; copiare, tagliare, incollare, incollare nella stessa posizione, duplicare ed eliminare i punti con nuovi numeri che non entrano mai in conflitto; incollare righe di punti da e verso un foglio di calcolo.
keywords: copia, incolla, taglia, duplica, elimina punti, seleziona punti, seleziona tutto, selezione a riquadro, finestra, appunti, foglio di calcolo, csv, rinumera, numeri di punto, incolla nella stessa posizione, clona, picchettamento
from: 78a6aea7
---

I punti di rilievo si possono copiare e incollare all'interno di un progetto, tra progetti in due schede del browser, e da e verso un foglio di calcolo. Ogni modifica è un solo passo di Annulla, e la superficie si ricostruisce subito dai nuovi punti.

## Selezionare i punti

Con {{ui:Select}} ({{key:V}}):

- **Fare clic** su un punto per selezionarlo (solo lui). I suoi numeri compaiono in **Proprietà**.
- {{key:Shift}} e **clic** aggiunge un punto alla selezione, oppure lo toglie.
- {{key:Shift}} e **trascinamento** disegnano un riquadro: i punti al suo interno vengono aggiunti alla selezione. Trascinare intorno ai punti invece crea un lazo; vedi [Selezione a lazo dei punti di rilievo](topic:lasso-selection). Un trascinamento senza {{key:Shift}} sposta la vista, come sempre.
- {{key:Mod+A}} (o {{ui:More}} › {{ui:Select all points}}) seleziona ogni punto.
- {{key:Esc}} (o {{ui:More}} › {{ui:Select none}}) annulla la selezione.

I punti selezionati hanno un anello. Con più di uno selezionato, **Proprietà** mostra quanti sono, i loro numeri, l'intervallo di quota e i loro gruppi.

## Copiare, tagliare ed eliminare

- {{ui:Copy}} o {{key:Mod+C}} copia i punti selezionati. CivilCraft conserva la copia e la mette anche negli Appunti di sistema come righe di punti, così si può incollarla direttamente in un foglio di calcolo o in un file di testo.
- {{ui:More}} › {{ui:Cut}} o {{key:Mod+X}} li copia e li elimina, in un solo passo.
- {{ui:More}} › {{ui:Delete}} o {{key:Delete}} li elimina. {{key:Mod+Z}} li riporta indietro.

Le righe sono: punto, nord, est, quota, descrizione (P,N,E,Z,D), separate da virgole, con tre decimali. Per avere l'est prima del nord, impostare **Righe dei punti** in [Impostazioni di CivilCraft](topic:settings). Una descrizione che un foglio di calcolo tratterebbe come formula (che inizia con =, +, - o @) riceve un apostrofo davanti, così resta testo.

## Incollare

1. Premere {{key:Mod+V}} o fare clic su {{ui:Paste}}. I punti seguono il puntatore come piccole croci, con una linea tratteggiata che riconduce al punto di origine.
2. Fare clic dove devono andare. Il centro dei punti copiati cade sul clic.
3. Oppure premere {{key:Enter}} per metterli alle loro coordinate, o {{key:Esc}} per annullare.

{{ui:More}} › {{ui:Paste in place}} o {{key:Mod+Shift+V}} incolla subito alle coordinate proprie dei punti. I punti incollati vengono poi selezionati, così si possono copiare, spostare o eliminare di nuovo.

:::note
Fare clic su {{ui:Paste}} nella barra degli strumenti legge gli Appunti di sistema. La prima volta, il browser può chiedere se CivilCraft può vedere gli appunti. Se si rifiuta, il pulsante della barra incolla solo la copia propria di CivilCraft; {{key:Mod+V}} incolla comunque le righe da un foglio di calcolo senza chiedere.
:::

## I numeri dei punti non entrano in conflitto

Due punti non condividono mai un numero. Quando si incolla:

- Un punto incollato conserva il suo numero quando nessun punto del progetto lo ha. Quindi dopo **Taglia** i punti tornano con i loro numeri, e i punti copiati da un altro progetto mantengono i loro dove sono liberi.
- Un punto incollato il cui numero è occupato riceve un nuovo numero intero: uno in più del numero più alto in uso, contando in avanti.
- La barra di stato dice cosa è successo, per esempio "1 ha conservato il numero; 9 hanno ricevuto nuovi numeri: 10–18 sono diventati 277–285".

In [Impostazioni di CivilCraft](topic:settings) si può scegliere **Sempre numeri nuovi**, e un numero da cui far partire i nuovi, per esempio 5000 per i punti di progetto.

:::warning
I gruppi di punti che costruiscono la superficie come **Linea di discontinuità** uniscono i loro punti in ordine di numero. Le copie incollate di punti di discontinuità (per esempio rilievi FL) ricevono numeri nuovi, più alti, e si uniscono in fondo a quella linea di discontinuità, eventualmente con un lungo salto. Controllare la pianta dopo aver incollato tali punti, oppure impostare il loro gruppo su {{ui:Points}}.
:::

## Duplicare

{{ui:More}} › {{ui:Duplicate}} o {{key:Mod+D}} crea una copia dei punti selezionati che segue il puntatore: fare clic dove deve andare. Le copie ricevono sempre numeri nuovi, e gli Appunti di CivilCraft restano come erano.

## Da un foglio di calcolo o un file di testo

Selezionare righe di punti in un foglio di calcolo (punto, nord, est, quota, descrizione) e copiarle. In CivilCraft premere {{key:Mod+V}} e fare clic dove devono andare, oppure premere {{key:Mod+Shift+V}} per metterle alle loro coordinate, che di solito è ciò che si vuole per dati di rilievo reali.

Le righe vengono lette esattamente come un [file di punti](topic:point-file-formats): virgole, tabulazioni o spazi, una riga di intestazione se c'è. Senza intestazione, l'ordine delle colonne deriva da **Righe dei punti** in [Impostazioni di CivilCraft](topic:settings).

Quando ci sono entrambi, CivilCraft decide in base a cosa è più recente: le righe negli Appunti di sistema che differiscono dall'ultima copia di CivilCraft sono state copiate dopo, quindi vengono incollate. Il testo che non contiene punti viene ignorato, e viene incollata la copia propria di CivilCraft.

## Tra progetti e schede

La copia viene conservata in questo browser, quindi una seconda scheda di CivilCraft può incollarla, anche dopo che la prima si è chiusa. I punti copiati in un progetto in metri e incollati in un progetto in piedi mantengono i loro numeri così come sono: nulla viene convertito, e la barra di stato lo dice.

## Cosa non viene copiato

Per ora vengono copiati solo i punti di rilievo. Tracciati, piazzali, reti di tubazioni, linee di discontinuità e confini non possono ancora essere copiati o incollati. Incollare non può spostare punti esistenti: usare {{ui:Cut}} e incollare, oppure spostare un punto alla volta ([Modificare un punto di rilievo](topic:edit-points)).
