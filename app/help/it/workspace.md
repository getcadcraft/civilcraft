---
title: Lo schermo, parte per parte
summary: Un giro di ogni barra e pannello di CivilCraft con il nome che ha sullo schermo, dalla barra degli strumenti alla barra di stato.
from: 76272010
keywords: interfaccia, schermo, barra degli strumenti, pannelli, proprietà, barra di stato, vista del profilo, disposizione, giro, ui
---

CivilCraft ha un solo schermo. Non ci sono schede né layout. I pannelli laterali si possono spostare, rendere mobili o portare in una finestra propria: vedere [Disporre i pannelli e usare un secondo monitor](common:arrange-panels). Dall'alto in basso e da sinistra a destra:

- la **barra dell'app** (marchio CadCraft, nome dell'app, versione, Informazioni, modalità schermo, Guida, Salva per l'uso offline, Carta e Modello)
- la **barra degli strumenti** con sette gruppi di pulsanti
- il **pannello a sinistra**: Sito, Punti, Superficie, Visualizzazione e, dopo averne importati, Layer GIS
- la **pianta** al centro, con sotto la **vista del profilo** quando è aperta
- il **pannello a destra**: Proprietà di ciò che è selezionato
- la **barra di stato** lungo il bordo inferiore

## Barra dell'app

La barra sottile in cima appartiene al sito di CadCraft, non a CivilCraft.

- Il menu della versione mostra quale build è in uso.
- {{ui:Informazioni su CivilCraft}} apre la pagina dell'app sul sito.
- {{ui:Schermo intero}} passa in rassegna le modalità dello schermo: schermo intero, poi schermo intero con le barre nascoste, poi di nuovo normale. {{key:Ctrl+Shift+F}} fa lo stesso su ogni piattaforma, Mac compreso (lì è il tasto Control, non Cmd). Con le barre nascoste, spostare il puntatore sul bordo superiore per farle riapparire.
- {{ui:Guida}} (o {{key:F1}}) apre questa guida in un pannello laterale; {{key:F1}} o {{key:Esc}} la chiude.
- {{ui:Salva per l'uso offline}} conserva CivilCraft in questo browser in modo che si apra senza connessione; poi mostra {{ui:Pronto per l'uso offline}}. Vedere [File che si possono aprire, salvare ed esportare](topic:files#online-and-offline).
- {{ui:Carta}} e {{ui:Modello}} passano da un tema chiaro a uno scuro. La pianta e il profilo seguono il tema; i PDF si stampano sempre su bianco.

## Barra degli strumenti

Ogni gruppo ha una piccola etichetta sopra i suoi pulsanti. Passare il puntatore su un pulsante per vedere il suggerimento e il tasto.

| Gruppo | Pulsanti | Funzione |
|---|---|---|
| File | {{ui:Nuovo}}, {{ui:Apri}}, {{ui:Salva}} | Ricominciare, aprire un file di punti, LandXML o un progetto, salvare il progetto come download |
| Esporta | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Scrivere LandXML 1.2, un DXF R12 o un DWG della pianta, oppure stampare la pianta in PDF |
| Superficie | {{ui:Linea di discontinuità}}, {{ui:Contorno}} | Disegnare una linea di discontinuità attraverso i punti di rilievo; disegnare il contorno esterno |
| Progetto | {{ui:Tracciato}}, {{ui:Piazzale}}, {{ui:Tubazioni}}, {{ui:Profilo}} | Disegnare un tracciato, un piazzale, una linea di tubazioni; mostrare o nascondere la vista del profilo |
| Modifica | {{ui:Annulla}}, {{ui:Ripristina}}, {{ui:Copia}}, {{ui:Incolla}}, {{ui:Altro}} | Annullare, ripristinare, copiare e incollare punti di rilievo; {{ui:Altro}} contiene Taglia, Incolla nella stessa posizione, Duplica, Elimina, Seleziona tutti i punti e Deseleziona tutto |
| GIS | {{ui:Coordinate}}, {{ui:Importa}}, {{ui:Esporta}}, {{ui:Mappa}} | Impostare il sistema di coordinate, importare ed esportare file GIS, mostrare i layer della mappa sotto la pianta |
| Vista | {{ui:Seleziona}}, {{ui:Adatta}}, {{ui:3D}} | Scegliere e spostare gli oggetti; zoom per mostrare tutto; mostrare il sito in 3D ([Vedere il sito in 3D](topic:site-3d)) |

Uno strumento di disegno resta premuto finché è attivo. Facendo di nuovo clic su di esso, premendo {{key:Esc}} o premendo {{key:V}} si torna a {{ui:Seleziona}}. {{ui:Annulla}}, {{ui:Ripristina}}, {{ui:Copia}} e le voci di {{ui:Altro}} sono disattivati quando non possono agire; il suggerimento ne dice il motivo (per esempio "Selezionare prima i punti di rilievo"). Ogni pulsante è elencato in [Riferimento della barra degli strumenti](topic:toolbar).

In una finestra stretta la barra degli strumenti scorre lateralmente.

## Pannello a sinistra

### Sito

- **Nome**: il nome del progetto. Dà il nome a ogni file salvato o esportato ed è stampato nel cartiglio del PDF.
- **Unità**: {{ui:Piedi USA}} o {{ui:Metri}}. Indica che cosa significano i numeri. Cambiarla **non** converte le coordinate; vedere [Unità, progressive e formati numerici](topic:units-and-stations).

### Punti

Se è vuoto, spiega come aprire un file di punti. Con i punti mostra il nome del file, il numero di punti e quanti hanno una quota, poi una tabella di **gruppi di punti**: una riga per ogni prima parola della descrizione (GRD, FL, TBS …), con un conteggio e una scelta **Superficie**:

- {{ui:Punti}}: i punti entrano nella superficie (è l'impostazione predefinita per ogni gruppo).
- {{ui:Linea di discontinuità}}: i punti del gruppo sono uniti, in ordine di numero di punto, in un'unica linea di discontinuità.
- {{ui:Esclusi}}: il gruppo non interviene sulla superficie.

### Superficie

Dati sul terreno esistente: punti, triangoli, quota minima e massima, quota media, area 2D e 3D, linee di discontinuità e presenza di un contorno. Sotto i dati, un riquadro elenca tutto ciò che il generatore della superficie ha dovuto correggere o non ha potuto fare. Poi:

- **Lato esterno più lungo**: 0 mantiene ogni triangolo esterno; un numero elimina dall'esterno i triangoli lunghi e sottili.
- Link che compaiono quando servono: {{ui:Rimuovi il contorno}}, {{ui:Rimuovi le linee di discontinuità disegnate}} e, per una superficie letta da LandXML, {{ui:Ricostruisci la superficie dai punti}}.

### Visualizzazione

- **Superficie**: {{ui:Terreno esistente}} o {{ui:Di progetto (sistemato)}}. La seconda è disponibile quando un piazzale o un corridoio sistema il terreno senza problemi.
- **Curve di livello ogni**, **Principali ogni** e **Fasce** (il numero di fasce di colore).
- Caselle: {{ui:Curve di livello}}, {{ui:Etichette delle curve di livello}}, {{ui:Triangoli}}, {{ui:Fasce di quota}}, {{ui:Frecce di pendenza}}, {{ui:Punti}}, {{ui:Etichette dei punti}}, {{ui:Linee di discontinuità}}, {{ui:Bordo della superficie}}, {{ui:Tubazioni}}.
- Una legenda delle quote delle fasce compare quando le fasce sono attive.

Le impostazioni di visualizzazione sono salvate con il progetto ma non sono passaggi annullabili: {{key:Mod+Z}} non riporta mai indietro una casella.

## Pianta

La pianta mostra i punti, la superficie e tutto ciò che si progetta, in vista in pianta con il nord in alto. Con la rotellina si ingrandisce sul puntatore, trascinando lo spazio vuoto si fa il pan. L'elenco completo è in [Tasti e mouse](topic:keyboard).

- In un progetto vuoto un riquadro intitolato **Iniziare dai punti di rilievo** elenca i primi passi e propone {{ui:Apri il sito di esempio}}.
- Mentre uno strumento di disegno è attivo, un suggerimento in cima alla pianta dice dove fare clic e come terminare.
- Trascinando un file sulla pianta compare "Trascinare un file di punti, LandXML o progetto".
- Gli oggetti selezionati sono evidenziati. Un tracciato o un piazzale selezionato mostra grip quadrati sui suoi PI o angoli; un manufatto selezionato mostra un solo grip. Trascinare un grip per spostarlo.
- I punti di rilievo selezionati hanno un anello. {{key:Shift}} e un clic aggiungono o tolgono un punto; {{key:Shift}} e un trascinamento disegnano un riquadro (o, trascinando attorno, un lazo) che aggiunge i punti al suo interno. Vedere [Selezionare, copiare e incollare punti di rilievo](topic:copy-paste-points).

## Vista del profilo

Premere {{key:R}} o fare clic su {{ui:Profilo}} per aprirla sotto la pianta. La sua barra contiene:

- un elenco dei tracciati (attivo quando i tracciati sono due o più)
- {{ui:Aggiungi PVI}}: finché è premuto, un clic nel profilo aggiunge un PVI ({{key:I}} lo attiva e disattiva)
- una lettura di progressiva, terreno, quota di progetto, pendenza e sterro o riporto sotto il puntatore
- un pulsante di chiusura

Il profilo mostra il terreno esistente, il profilo di progetto, le pendenze di ogni rettifilo, la progressiva e la quota di ogni PVI, L e K di ogni curva verticale con BVC ed EVC, i punti alti e bassi e l'esagerazione verticale. Si adatta sempre all'intero tracciato: non fa zoom né pan. Spostando il puntatore lungo il profilo compare un punto sul tracciato nella pianta.

## Pannello a destra: Proprietà

Il titolo dice che cosa mostra.

- **Progetto** (nulla selezionato): i tracciati e i piazzali come link, il blocco **Movimenti di terra** e il blocco **Rete di tubazioni** con le sue regole e i suoi problemi.
- **Tracciato**: nome, progressiva iniziale, lunghezza, la tabella dei PI, le curve, la tabella dei PVI del profilo di progetto con i suoi dati e le impostazioni del **Corridoio**.
- **Piazzale**: nome, quota, pendenze di sterro e riporto, area, dati dell'intersezione con il terreno e movimenti di terra.
- **Manufatto** o **Tubazione**: dimensioni, quote del chiusino, quote di fondo, pendenza, copertura ed eventuali problemi.
- **Punto** e il suo numero: coordinate, quota, descrizione e gruppo del punto (sola lettura).

I campi hanno effetto premendo {{key:Enter}} o lasciando il campo. Un valore non accettato viene segnalato come non valido e non cambia nulla.

## Barra di stato

- **E** e **N**: Est e Nord sotto il puntatore.
- La quota del **Terreno** in quel punto (e **Progetto** dove un piazzale o un corridoio l'ha modificata), oppure "Fuori dalla superficie".
- Il tracciato più vicino (o quello selezionato) con la **Prog.** e lo scostamento (**L** o **R**) sotto il puntatore.
- A destra, i messaggi: che cosa è appena successo, o perché qualcosa è stato rifiutato. Un messaggio scompare da solo dopo alcuni secondi.

## Finestre di dialogo

- **Importa punti**: si apre con ogni file di punti. Vedere [Importare i punti di rilievo](topic:import-points).
- **Stampa la pianta in PDF**: vedere [Stampare la pianta in PDF](topic:plot-pdf).
- **Modifiche non salvate**: chiede conferma prima che {{ui:Nuovo}} o l'apertura di un progetto o di un file LandXML scarti il lavoro non salvato. {{ui:Salva una copia}} scarica prima il progetto.

## Schermi piccoli

Fino a 760 pixel di larghezza, come su un telefono, la pianta occupa lo schermo: la barra degli strumenti è una sola riga che scorre lateralmente e i pannelli si aprono come fogli da una barra in basso. {{ui:Strumenti}} nasconde la barra degli strumenti e {{ui:Sposta}} la porta in basso.
