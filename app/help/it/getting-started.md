---
title: Primi passi con CivilCraft
summary: Che cosa fa CivilCraft, come aprirlo e i primi dieci minuti con il sito di esempio, dai punti alle curve di livello, a una strada e a un progetto salvato.
from: c9b6dd8e
keywords: inizio, primo avvio, sito di esempio, introduzione, avvio rapido, tutorial, iniziare, nuovo progetto
---

CivilCraft è l'app per il progetto civile e la sistemazione dei siti della famiglia CadCraft. Trasforma i punti di rilievo in una superficie (un TIN) con curve di livello, poi consente di tracciare tracciati con profili di progetto, di far scorrere un semplice corridoio stradale, di sistemare piazzali fino all'intersezione con il terreno, di verificare una rete di tubazioni a gravità rispetto alle proprie regole e di vedere i volumi di sterro e riporto. Legge e scrive LandXML, esporta la pianta in DXF e la stampa in PDF.

Chi ha usato Civil 3D ritroverà idee familiari: punti, gruppi di punti, linee di discontinuità, tracciati per PI, profili per PVI, corridoi, sistemazione del terreno, reti di tubazioni. Il modo di lavorare però è diverso, e molto più contenuto: non ci sono riga di comando, stili né file di disegno. Leggere una volta [Per chi viene da altri software civili](topic:coming-from) prima del primo lavoro vero.

## Che cosa serve

- Un browser per desktop recente: Chrome, Edge, Firefox o Safari. Vedere [Browser](common:browsers).
- Un mouse o un trackpad e una tastiera, oppure uno schermo tattile: per disegnare ci sono i pulsanti a schermo {{ui:Fine}}, {{ui:Annulla punto}} e {{ui:Annulla}} (vedere [Mouse, trackpad e tocco](topic:keyboard#mouse-trackpad-and-touch)).
- La pianta è disegnata in 2D con il canvas del browser. La [vista 3D](topic:site-3d) usa la grafica WebGL del browser; se non riesce ad avviarsi, la barra di stato ne indica il motivo e la pianta continua a funzionare.
- Nessun account e nessun caricamento. I file si aprono sul proprio computer e si salvano come download. Vedere [I file](common:your-files).

:::note
CivilCraft oggi è una versione iniziale per browser, ancora in sviluppo. Le versioni desktop non sono ancora disponibili e nemmeno il salvataggio nel cloud. Tutto ciò che si crea resta sul proprio computer finché non lo si salva o lo si esporta.
:::

## Aprire CivilCraft

1. Aprire CivilCraft nel browser.
2. Attendere che lo schermo si riempia: una barra degli strumenti in alto, un pannello a sinistra, la pianta al centro e un pannello **Proprietà** a destra.
3. In una pianta vuota compare un riquadro intitolato **Iniziare dai punti di rilievo**. Elenca i primi passi e contiene un link, {{ui:Apri il sito di esempio}}.

Per usare CivilCraft senza connessione in seguito, fare clic su {{ui:Salva per l'uso offline}} nella barra dell'app e attendere {{ui:Pronto per l'uso offline}}. Include questa guida, il sito di esempio e le librerie 3D e GIS. Vedere [Offline](common:offline). Premere {{key:F1}} o fare clic su {{ui:Guida}} in qualsiasi momento per aprire questa guida accanto all'app.

## I primi dieci minuti: il sito di esempio

Il sito di esempio è un piccolo rilievo in piedi USA: 276 punti su coordinate state plane, un crinale, un impluvio con una linea di thalweg e due cigli di sponda. È incluso nell'app, quindi si può seguire la guida senza un file proprio.

1. Fare clic su {{ui:Apri il sito di esempio}} nel riquadro sulla pianta.
   Si apre la finestra di dialogo **Importa punti**. Indica "276 punti letti come PNEZD (dalla riga di intestazione), separati da virgole." e mostra le prime righe.
2. Fare clic su {{ui:Importa}}.
   La pianta si riempie di punti, curve di livello e bordo della superficie. La barra di stato in basso indica che i punti sono stati importati e quanti triangoli ha la superficie (546).
3. Osservare il pannello a sinistra sotto **Punti**. I punti sono raggruppati in base alla prima parola della descrizione: CP, FL, GRD, RIDGE, TBN, TBS e TREE.
4. Nella colonna **Superficie** di quella tabella, impostare **FL**, **RIDGE**, **TBN** e **TBS** su {{ui:Linea di discontinuità}}.
   La superficie si ricostruisce subito. I dati di **Superficie** ora indicano "Linee di discontinuità: 4" e le curve di livello si piegano nettamente lungo il thalweg e il crinale invece di attraversarli.
5. Spostare il puntatore sulla pianta. La barra di stato mostra l'Est e il Nord sotto il puntatore e la quota del terreno in quel punto.
6. Sotto **Visualizzazione**, impostare {{ui:Curve di livello ogni}} su 0.5 ft e attivare {{ui:Fasce di quota}}. Compare una scala di colori con una legenda sotto le caselle. Disattivare di nuovo le fasce al termine.

A questo punto si ha una superficie del terreno esistente. Ora, una strada.

## Tracciare una breve strada

1. Premere {{key:A}} (oppure fare clic su {{ui:Tracciato}} nel gruppo **Progetto**).
2. Fare clic su tre punti del sito, uno dopo l'altro. Una linea rossa segue il puntatore e mostra la lunghezza e la direzione del rettifilo successivo.
3. Premere {{key:Enter}} per terminare.
   Il tracciato compare con le progressive. Il pannello a destra mostra **Tracciato**: la lunghezza, la tabella dei PI e la curva nel PI intermedio (raggio di 100 ft, o minore se 100 ft non è possibile).
4. Nel pannello a destra, sotto **Profilo di progetto**, fare clic su {{ui:Inizia dal terreno}}.
   La vista del profilo si apre sotto la pianta con il terreno esistente e una livelletta di progetto rettilinea da un capo all'altro.
5. Premere {{key:I}} per attivare {{ui:Aggiungi PVI}}, poi fare clic una volta nella vista del profilo, vicino al centro. Compare un PVI.
6. Nella tabella dei PVI a destra, digitare una lunghezza di curva (per esempio 100) nella casella **Curva L** del PVI intermedio e premere {{key:Enter}}. Il profilo ora ha una curva verticale, con il valore K indicato.
7. Sotto **Corridoio**, selezionare **Fa scorrere una sezione tipo lungo il profilo di progetto**.
   La strada viene sistemata nel terreno: corsie, banchine e scarpate fino all'intersezione con il terreno. Il blocco **Movimenti di terra** mostra sterro e riporto.

Non preoccuparsi dei valori esatti. Ogni numero si può modificare nel pannello a destra e {{key:Mod+Z}} annulla l'ultima modifica.

## Salvare il lavoro

1. Digitare un nome in **Nome** in cima al pannello a sinistra.
2. Premere {{key:Mod+S}} (oppure fare clic su {{ui:Salva}}).
   Il browser scarica un file con il nome del sito, che termina con `.civilcraft.json`. Contiene i punti, le impostazioni della superficie, i tracciati, i profili, i corridoi, i piazzali e le tubazioni.
3. Per continuare in seguito, fare clic su {{ui:Apri}} (oppure premere {{key:Mod+O}}) e scegliere quel file, oppure trascinarlo sulla pianta.

:::warning
Non c'è salvataggio automatico. Chiudendo la scheda con modifiche non salvate, il browser chiede se uscire; uscendo, le modifiche vanno perse. Salvare spesso.
:::

## Dove andare dopo

- [Importare i punti di rilievo](topic:import-points) dai propri file.
- [Costruire e rifinire la superficie](topic:build-surface) con linee di discontinuità e un contorno.
- [Lo schermo, parte per parte](topic:workspace).
- [Tasti e mouse](topic:keyboard).
