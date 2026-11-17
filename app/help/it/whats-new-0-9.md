---
title: Novità nella 0.9
summary: Modelli di corridoio e di terreno, agganci e pulsanti Scegli durante il disegno, analisi GIS con una tabella degli attributi, studi di ombra, resa solare, comfort e vento per un sito, una vista Render 3D, e gli add-on Nuvole di punti e WaterCraft.
keywords: novità, 0.9, note di rilascio, modelli di corridoio, modelli di terreno, editor dei modelli, sezione tipo, più corridoi, snap, agganci, scegli, sposta, copia, ruota, tangente, render, render 3D, analisi GIS, buffer, sovrapposizione, unione spaziale, tabella degli attributi, stile per attributo, studio dell'ombra, resa solare, utci, comfort all'aperto, studio del vento, openfoam, nuvole di punti, las, laz, watercraft, portata antincendio, idrante, età dell'acqua, cloro, consumi, suggerimenti, layout, note di rilascio, registro modifiche, modifiche, 0.8, 0.8.1, versione, nuove funzionalità, pioggia, acque meteoriche, ristagno, tracimazione, movimenti di terra, bilancio, sterro e riporto, trasporto, percorso migliore, costo minimo, tracciato, vasca di laminazione, scarico, svuotamento, franco, avanzamento, rilievo, drone, cumulo, indirizzo al sito, particella, suolo, alluvione, stabilità dei pendii, Bishop, cedimento, intersezione, segnaletica, segnali, distanza di visibilità, compensazione, minimi quadrati, poligonale, miniera a cielo aperto, modello a blocchi, collegamento radio, fresnel, scambio, deviatoio, incrocio, lingue, problemi, live, dwg
from: d7ac5b14
---

Ecco cosa è cambiato in CivilCraft 0.9, rispetto alla 0.8.1. CivilCraft 0.9 fa parte di CadCraft Studio 0.9 e delle sue otto app. Le parti principali sono i modelli di corridoio e di terreno, gli agganci durante il disegno, l'analisi GIS, gli studi di sole, resa solare, comfort e vento per un sito, e due add-on: Nuvole di punti e WaterCraft.

## Novità

### Modelli di corridoio e di terreno

- **Modelli di corridoio.** Aprire {{ui:Superficie}} › {{ui:Altro}} › {{ui:Modelli di corridoio…}} (oppure digitare {{cmd:TEMPLATES}}). Un modello è una piccola sezione trasversale con elementi, scostamenti, pendenze, materiali e codici dei punti. Conservarli nel progetto, in {{ui:Mia libreria}} oppure come file `.cctemplates.json`. L'editor dei modelli mostra un disegno in scala reale ed elenca i problemi mentre si digita.
- **Costruire da modelli per progressiva.** Selezionare un tracciato e attivare {{ui:Costruisci da modelli per progressiva}} nelle sue Proprietà. Ogni lato di ogni regione ha un proprio elenco di pavimentazione e una propria condizione di fine. {{ui:Aggiungi un corridoio}} sotto {{ui:Corridoi su questo allineamento}} mette più corridoi su un unico tracciato.
- **Modelli di terreno.** {{ui:Superficie}} › {{ui:Altro}} › {{ui:Modelli di terreno…}} (oppure digitare {{cmd:TERRAINTEMPLATES}}) applica sul terreno materiali a strati, come terreno vegetale o pavimentazione e fondazione, con area e volume per strato. Vedi [Modelli di corridoio e modelli di terreno](topic:corridor-templates).

### Disegno

- **Agganci.** Gli strumenti Tracciato, Piazzale, Particella, Volume, Linea caratteristica, Misura, Confine e Bacino si agganciano a punti di rilievo, PI, angoli, vertici e manufatti, con un'etichetta accanto al marcatore. Tenere premuto {{key:Alt}} per un punto libero.
- **Pulsanti Scegli, tangente e sposta, copia, ruota.** Gli angoli di piazzali, particelle e linee caratteristiche hanno campi digitabili di Est e Nord e un pulsante Scegli con mirino. Le Proprietà hanno anche {{ui:Tangente da due punti}} per i tracciati e {{ui:Sposta, copia e ruota}} per tracciati, piazzali, particelle e linee caratteristiche. Vedi [Disegnare con agganci, angoli scelti e sposta, copia, ruota](topic:draft-with-snaps).
- **Vista Render in 3D.** Il pulsante {{ui:Render}} nella barra 3D disegna il terreno con colori naturali, cielo, foschia e ombre morbide. Non modifica il modello. Il menu {{ui:Sole}} ora ha i pulsanti {{ui:Applica}} e {{ui:Chiudi}}. Vedi [Vedere il sito in 3D](topic:site-3d).
- **Pannelli che si aprono una sezione alla volta.** Il pannello sinistro e il pannello Proprietà aprono una sezione e chiudono le altre, e i riquadri della barra Paesaggio che contengono più strumenti sono pulsanti divisi.

### Analisi GIS

- **Analizza.** {{ui:Superficie}} › {{ui:Altro}} › {{ui:Analizza}} offre buffer, sovrapposizione, unione spaziale, selezione per attributo o forma, e misura. Ogni strumento crea un nuovo layer in un unico passo di annulla.
- **Tabella degli attributi.** Il menu a tre puntini di un layer ha {{ui:Tabella degli attributi…}} e {{ui:Stile per attributo…}}. Vedi [Analizzare i layer GIS](topic:gis-analysis) e [Lavorare con la tabella degli attributi di un layer](topic:gis-table).

### Il sito: sole, resa solare, comfort e vento

- **Sezione Ambiente.** Selezionare un volume: la sezione {{ui:Ambiente}} si trova sotto {{ui:Ore di sole}} nelle sue Proprietà. Contiene uno studio dell'ombra (mappa, tabella, animazione, CSV), resa solare da un file meteo di anno tipo (.epw) e comfort all'aperto (UTCI).
- **Vento, solo a titolo di screening.** {{ui:Avvia studio del vento}} colora il terreno dalla condizione di sosta a quella di disagio per ogni direzione del vento nel file meteo. Non è convalidato e il pannello lo dichiara.
- **Add-on Vento pedonale (OpenFOAM).** Disattivato finché non lo si attiva in {{ui:Impostazioni}} › {{ui:Add-on}}. OpenFOAM è un software che si installa da sé. Vedi [Ombra, resa solare e comfort all'aperto](topic:environment).

### Nuvole di punti (add-on)

- Attivare {{ui:Nuvole di punti}} in {{ui:Impostazioni}} › {{ui:Add-on}}; compare una scheda Nuvole di punti nel pannello di destra. Aprire un file LAS o LAZ, ripulirlo, suddividerlo in terreno, vegetazione ed edifici, costruire il terreno, le curve di livello e i volumi, ed esportare LAS o LAZ. Vedi [Nuvole di punti da drone o scanner](topic:point-clouds).

### WaterCraft (add-on)

- Attivare {{ui:WaterCraft (distribuzione idrica)}} in {{ui:Impostazioni}} › {{ui:Add-on}}; compare una scheda WaterCraft. Contiene i consumi dei clienti, la portata antincendio a ogni idrante, quale interruzione di condotta pesa di più, ed età dell'acqua e cloro, ciascuno salvabile come CSV. Vedi [WaterCraft: consumi, portata antincendio, interruzioni ed età dell'acqua](topic:watercraft).

### Lavorare insieme

- In una sessione Live si vedono a vicenda i cursori e i nomi nel piano. Piante della libreria: CivilCraft Paesaggio parte dalla sua raccolta predefinita di libreria, {{ui:CivilCraft Paesaggio}}.

## In ogni app

- I suggerimenti compaiono come tooltip Bootstrap, e il suggerimento di avvio si può chiudere.
- La barra delle schede di un pannello che non ci sta scorre invece di essere tagliata.
- I titoli delle schede del browser riportano `<documento> - CivilCraft | CadCraft`.
- {{ui:Impostazioni}} ha una sezione Layout in cui i layout sono un menu a discesa di scelte a due righe.
- Le unità di peso e temperatura si trovano in {{ui:Impostazioni}} › {{ui:Globali}} › {{ui:Unità}}.
- L'elenco delle lingue mostra le lingue per cui la build ha dei file. Le lingue diverse dall'inglese sono bozze automatiche.

## Corretto

- Gli add-on di ricerca dell'indirizzo e di controllo EnergyPlus non si potevano attivare; ora si possono.
- La guida ora indica che l'add-on Nuvole di punti scrive una nuvola ripulita come LAS 1.4 o LAZ.
- Fare clic sul proprio grip dell'oggetto selezionato non avvia più un trascinamento del grip che bloccava un Scegli in attesa.

## Limiti dichiarati

- I modelli di corridoio di esempio sono segnaposto che non derivano da alcuno standard; un ingegnere deve verificarli. I modelli di terreno non aggiungono alcuna superficie e non sono disegnati in 3D né nella vista delle sezioni. Il secondo corridoio di un tracciato non è nell'esportazione IFC. Non c'è alcuna transizione tra due modelli per progressiva.
- Le nuvole di punti sono state collaudate su file fittizi, non su un vero rilievo con drone. Vengono letti solo LAS e LAZ.
- L'analisi GIS è stata collaudata su layer fittizi.
- Ombra, resa solare e comfort sono stime di pianificazione; il vento è uno screening non convalidato. Nulla di tutto ciò è un valore di progetto.
- WaterCraft è uno strumento di calcolo verificato su reti fittizie. Un ingegnere idraulico decide quanto valgano i numeri.
- Le lingue diverse dall'inglese sono bozze automatiche.
- I programmi di installazione per Windows non sono firmati digitalmente, e l'immagine disco per macOS non è notarizzata.

## Precedenti: 0.8 e 0.8.1

Ecco cosa è cambiato in CivilCraft 0.8 (2026-11-01) e 0.8.1 (2026-11-02), rispetto alla 0.7. Le parti nuove più importanti sono strumenti che collaudano il proprio terreno e il proprio sito (pioggia, movimenti di terra, percorsi, vasche, avanzamento) e sei finestre di calcolo per terreno, strade, rilievo, miniere, collegamenti e ferrovie.

### Novità

**Collaudare la sistemazione**

- **Pioggia.** {{ui:Pioggia…}} (sotto {{ui:Superficie}}) fa cadere un temporale sul terreno sistemato. Si vede l'acqua scorrere dai piazzali, ristagnare negli angoli bassi e tracimare dalle vasche troppo piccole. La simulazione è animata e fornisce i volumi, la portata di picco in uscita e un CSV di ogni vasca. La cella predefinita è grossolana perché una prima occhiata sia rapida; una cella più fine è più lenta. Le vasche che tracimano compaiono anche nel pannello Problemi.
- **Bilanciatore dei movimenti di terra.** {{ui:Bilanciatore dei movimenti di terra…}} alza o abbassa un piazzale finché sterro e riporto sono uguali, e mostra la tabella dei trasporti tra i due.
- **Percorso migliore.** {{ui:Percorso migliore…}}: scegliere un inizio e una fine, e CivilCraft trova il percorso meno costoso attraverso il terreno che rispetta i propri limiti di pendenza e curvatura, poi ne ricava un tracciato.
- **Vasche di laminazione.** {{ui:Vasche di laminazione…}} calcola stadio e invaso dal proprio terreno, accetta dispositivi di scarico (orifizio, stramazzo, a V, sfioratore), fa passare un temporale attraverso la vasca e verifica la portata di picco trattenuta, il tempo di svuotamento e il franco.
- **Avanzamento dai rilievi.** {{ui:Avanzamento dai rilievi…}} confronta superfici da drone o scansione di date diverse con il terreno com'era e con il progetto: percentuale completata in volume, aree scavate in eccesso e riempite in eccesso, cumuli, e quando i lavori finiranno a questo ritmo (indicato come stima).

**Conoscere il sito**

- **Indirizzo al sito.** {{ui:Indirizzo al sito…}} mette in linea dati aperti su particelle, edifici, zonizzazione, suolo, alluvioni e terreno su un unico sito. Si può conservare il sito nel file di progetto: l'indirizzo digitato, ogni fonte con il giorno in cui è stata scaricata e la sua licenza, e ciò che è stato restituito. Riaprire o condividere il progetto e il sito è ancora lì, senza nuove richieste. Si può anche salvarlo come file di sito o inviarlo a BimCraft. Vedi [Indirizzo al sito](topic:address-to-site).

**Terreno, strade, rilievo, miniere, collegamenti e ferrovie**

- **Suoli e pendii.** {{ui:Suoli e pendii…}} disegna il profilo del suolo tra i sondaggi digitati. Il metodo di Bishop cerca poi il cerchio critico sul proprio terreno, con una falda, un sovraccarico e un coefficiente sismico; il cedimento di una fondazione tiene conto di consolidazione, cedimento immediato e tempo.
- **Intersezioni e segnaletica.** {{ui:Intersezioni e segnaletica…}} unisce i bracci con raccordi di cordolo (un raggio per braccio, oppure raccordi a tre centri), la distanza di visibilità per la velocità di progetto, una verifica dei triangoli di visibilità, attraversamenti pedonali, linee d'arresto, segnaletica orizzontale e segnali con un elenco dei segnali. Sono disegnati sul piano e salvati come .dxf con layer denominati.
- **Compensazione del rilievo.** {{ui:Compensazione del rilievo…}} esegue una compensazione ai minimi quadrati di una poligonale o di una rete: coordinate compensate, ellissi d'errore, la verifica chi-quadrato e un segnale sulla misura che non si adatta. Sono inclusi reti libere, chiusura di una poligonale con la regola di Bowditch e file di campagna RW5, GSI, JobXML o CSV, e i punti compensati si salvano come CSV.
- **Miniere a cielo aperto.** {{ui:Miniere a cielo aperto…}} trasforma i campioni di sondaggio in un modello a blocchi e nella fossa ultima entro il proprio angolo di scarpata, con il rapporto di sterile, una tabella per gradone e una curva di tenore e tonnellaggio. Ci sono anche fosse annidate per fattore di ricavo e un programma di produzione con flusso di cassa attualizzato.
- **Collegamenti radio.** {{ui:Collegamenti radio…}} verifica la visibilità sul proprio terreno tenendo conto del rigonfiamento terrestre, della prima zona di Fresnel, del bilancio del collegamento, del margine di attenuazione e dell'interruzione per multipath, e indica l'altezza del palo che libererebbe il percorso. Calcola anche i bilanci di perdita per fibra, le quantità del percorso e il vento su un traliccio.
- **Deviatoi ferroviari.** {{ui:Deviatoi ferroviari…}} crea un deviatoio dal suo numero di cuore, incroci tra binari paralleli e una sagoma limite tirata dal sovralzo e allargata in curva. Un deviatoio può trovarsi a una progressiva di un tracciato.

Vedi [Suoli, intersezioni, compensazione del rilievo, miniere, collegamenti radio e deviatoi](topic:soils-roads-survey-mines-links).

### In ogni app

- **Lingue.** 54 lingue, dieci delle quali nuove. Le lingue diverse dall'inglese sono bozze automatiche finché un madrelingua non le rilegge. Gli argomenti della guida sono ancora per lo più in inglese.
- **Righe della barra degli strumenti.** {{ui:Impostazioni}} › {{ui:Generali}} › {{ui:Righe della barra degli strumenti}}: A capo (come prima), 2 righe o 1 riga. La barra multifunzione di CivilCraft mostra in grande lo strumento più usato, i successivi in piccolo, e il resto dietro la freccia del nome del gruppo.
- **Dispositivi di input.** Trackpad, penna, mouse 3D, controller e MIDI possono comandare le app.
- **Problemi.** Un pannello Problemi che avvisa in ogni app, con verifiche che leggono i pacchetti di regolamenti.
- **Live.** Una vista di chi si trova dove in una sessione Live.
- **Add-on.** Un elenco degli add-on, con add-on di illuminazione.
- **Collegare la propria IA.** Ogni assistente collegato può comandare gli strumenti di CivilCraft. Viene fornito con una nota che indica che il collegamento con un clic dentro CadCraft Studio e il connettore ospitato non sono ancora pronti. Vedi [Far lavorare un assistente IA sul proprio sito](topic:assistants).

### Corretto nella 0.8.1

- **Sezione classi DWG.** Veniva letta come tipo sbagliato (GitHub cadcraft#5). Corretto in CivilCraft insieme a CadCraft, BimCraft, ModelCraft e TakeoffCraft.
- **Cambio di lingua durante l'esecuzione.** CadCraft Studio e le edizioni impacchettate possono cambiare lingua durante l'esecuzione. Prima erano solo in inglese. Non ancora collaudato su tutte le piattaforme: segnalare se la lingua non cambia.

### Non ancora in questa versione

- **Sono strumenti di calcolo.** Ogni risultato delle nuove finestre richiede la verifica di un ingegnere. Le resistenze del suolo partono da valori tipici per il gruppo di suolo, e la finestra lo indica.
- **Pioggia.** Una simulazione sul sito di esempio può richiedere più di due minuti nel browser con una cella fine. È stata verificata con casi calcolati a mano e con un bacino a V, non ancora su un vero sito sistemato.
- **Indirizzo al sito.** Legge i file di dati aperti forniti dall'utente ed è stato collaudato solo sui nostri file. Gli alberi non sono una fonte. Il recupero delle fonti al posto dell'utente attende la formulazione sulla privacy.
- **Avanzamento dai rilievi.** Collaudato solo su rilievi fittizi. L'avanzamento su tavole e annotazioni (MarkupCraft) e la scansione rispetto al modello (BimCraft) non sono realizzati.
- **Suoli e pendii.** Solo superfici circolari: nessuna ricerca a cuneo o a blocchi e nessuna fessura di trazione.
- **Intersezioni.** Un raggio per braccio, nessuna traiettoria di manovra dei mezzi pesanti, e non entrano ancora nel corridoio.
- **File di campagna.** I lettori sono stati scritti a partire da descrizioni pubbliche dei formati e provati su file creati da noi. Servono file di strumenti reali.
- **Collegamenti e ferrovie.** Collegamenti radio: solo perdita in spazio libero e multipath (nessuna attenuazione per pioggia né diagrammi d'antenna), e nessuno standard ferroviario: ogni limite ferroviario è un segnaposto, con valori di bozza che nessun ingegnere ferroviario ha verificato.
- **Windows e macOS.** La 0.8 non è firmata digitalmente. Windows può avvisare, e macOS chiede clic destro e poi Apri.

Il resto è in [Non ancora implementato](topic:not-built-yet). Per la versione precedente, vedi [Novità nella 0.7](topic:whats-new-0-7).
