---
title: Lavorare nel layout a casella degli strumenti e riquadro informazioni
summary: Passare l'app a una colonna di strumenti a sinistra con spazi per i propri, un riquadro informazioni in alto che segue lo strumento in esecuzione o ciò che si è selezionato, un navigatore a destra, una scheda per ogni vista, opzioni rapide e una tavolozza di modifica, e tornare al layout classico quando si desidera.
keywords: layout, area di lavoro, casella degli strumenti, colonna degli strumenti, riquadro informazioni, barra informazioni, navigatore, mappa di progetto, barra rapida, opzioni rapide, tavolozza di modifica, pet palette, strumenti personali, strumenti preferiti, schede delle viste, finestra della casella degli strumenti, layout classico, cambia layout, passa layout
from: ec341666
---

**Casella degli strumenti e riquadro informazioni** è uno dei tre layout di area di lavoro dell'app. Gli strumenti di disegno stanno in colonna a sinistra, un riquadro informazioni in alto mostra ciò che richiede lo strumento in esecuzione o ciò che si è selezionato, ogni vista ha una scheda, e una barra rapida sotto il disegno raccoglie alcune opzioni di uso quotidiano. Gli strumenti sono quelli dell'app: tutto ciò che si può fare nel layout classico funziona anche qui, e il disegno, lo stile dei menu e i tasti restano come sono.

## Sceglierlo

1. Aprire {{ui:Impostazioni}} (l'ingranaggio, oppure {{key:Mod+,}}).
2. Scegliere la scheda {{ui:Globali}}, poi andare a {{ui:Layout}} › {{ui:Area di lavoro}}.
3. Scegliere {{ui:Casella degli strumenti e riquadro informazioni}}.

Il layout cambia subito. La scelta vale per ogni app in questo browser: ciascuna app si apre in esso da quel momento, ed è già attivo prima che la pagina venga disegnata, così non si vede mai prima il layout classico.

## Che cosa c'è dove

- **Barra degli strumenti:** la barra propria dell'app resta in alto nell'area del disegno, con i suoi menu.
- **Riquadro informazioni:** sotto la barra degli strumenti. Mentre uno strumento è in esecuzione mostra lo strumento e ciò che richiede. Quando si sceglie qualcosa, mostra le sue impostazioni principali (per un muro: tipo, spessore, lunghezza, linea di posizione e altezza), che si possono modificare lì direttamente: una modifica lì equivale a quella in Proprietà, e {{key:Mod+Z}} la annulla. Senza nulla di selezionato mostra "Nessun oggetto selezionato.". Ogni app aggiunge qui i propri riquadri, come il layer corrente o il livello corrente, oppure il documento aperto.
- **Casella degli strumenti:** la colonna a sinistra, con gli strumenti dell'app in gruppi. Fare clic sul nome di un gruppo per comprimerlo o aprirlo di nuovo. Lo strumento in esecuzione è evidenziato.
- **Strumenti personali:** il primo gruppo della casella degli strumenti, con otto spazi vuoti per gli strumenti più usati. Fare clic su uno spazio vuoto per scegliere un qualsiasi strumento o comando dell'app; oppure fare clic destro su uno strumento nella casella e scegliere {{ui:Aggiungi a Strumenti personali}}; oppure trascinare uno strumento su uno spazio. Fare clic destro su uno spazio per cambiarlo o svuotarlo. Gli spazi sono conservati per ciascuna app in questo browser.
- **Navigatore:** il pannello di destra. In cima sta il browser di progetto dell'app (piante, sezioni, prospetti, viste 3D, abachi, tavole, come l'app li prevede): fare clic su uno di essi per aprirlo. Sotto, {{ui:Proprietà}} e una scheda con gli altri contenuti del pannello di destra.
- **Schede delle viste:** una scheda per ogni vista del file aperto (una tavola, una pianta, una scena…), sopra il disegno.
- **Barra rapida:** sotto il disegno, le impostazioni della vista e le opzioni di uso quotidiano che l'app offre, come la scala, il livello di dettaglio, l'intervallo di vista, adatta, pianta, dividi o 3D, snap e unità.
- **Tavolozza di modifica:** fare clic su qualcosa nel disegno e accanto al puntatore compare una piccola tavolozza con i comandi di modifica dell'app per quell'elemento, come sposta, copia, ruota, specchio, duplica o elimina, oppure {{ui:Proprietà}}. {{key:Esc}}, la rotella del mouse, un altro clic o il suo pulsante di chiusura la fanno sparire.

Uno strumento che non può funzionare in questo momento è in grigio, e il suo suggerimento spiega perché. Fare clic su di esso, o premere {{key:Enter}} su di esso, per leggere il motivo in una casella.

{{key:Esc}} termina prima lo strumento in esecuzione, come nel layout classico, e ogni scorciatoia e {{key:Ctrl+Shift+F}} (modalità schermo) funzionano come prima.

## Dare alla casella degli strumenti una finestra propria

Il pulsante {{ui:Sposta la casella degli strumenti}} in cima alla casella ha {{ui:Sposta in una nuova finestra}}: la casella si apre in una finestra stretta propria, che si può mettere accanto all'app o su un secondo monitor. I tasti premuti lì raggiungono l'app. {{ui:Riporta la casella degli strumenti al suo posto}}, oppure chiudere quella finestra, la riporta a casa.

Le impostazioni della barra degli strumenti valgono anche per la casella: {{ui:Impostazioni}} › {{ui:Globali}} › {{ui:Barra degli strumenti}} › {{ui:Icone ed etichette}}, {{ui:Solo icone}} oppure {{ui:Solo etichette}}, e {{ui:Mostra i nomi dei gruppi (File, Disegna, …)}}.

## I pannelli conservano il loro comportamento

I pannelli di sinistra e di destra conservano tutto quanto descritto in [Disponi i pannelli](common:arrange-panels): ancoraggio, mobilità, fissaggio, nascondimento, schede, {{ui:Sposta in una nuova finestra}} e {{ui:Reimposta layout}}.

## Tornare al layout classico

Aprire {{ui:Impostazioni}} › {{ui:Globali}} › {{ui:Layout}} › {{ui:Area di lavoro}} e scegliere {{ui:CadCraft classico}}. Ogni barra, scheda e pannello torna dov'era.

:::note
Su un telefono, o in una finestra larga 760 pixel o meno, l'app usa il layout per telefono qualunque sia la scelta. Una finestra più larga ripristina il proprio layout.
:::

Per provare un'altra disposizione, vedere [il layout a barra multifunzione e browser di progetto](common:layout-ribbon).

Per cambiare che cosa mostra questo layout, vedere [Cambiare un layout sullo schermo](common:layout-edit); per una disposizione scura con barra dei menu e barra multifunzione, vedere [il layout Disegno](common:layout-drafting).
