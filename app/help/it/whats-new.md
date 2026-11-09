---
title: Novità nelle versioni 0.8 e 0.8.1
summary: CivilCraft 0.8 aggiunge Fai piovere (una tempesta sulla sistemazione del terreno), un bilanciatore dei movimenti di terra, un ricercatore del percorso migliore, vasche di laminazione, avanzamento dai rilievi, un importatore dall'indirizzo al sito che mantiene il sito nel progetto, e finestre per suoli e pendii, intersezioni e segnaletica, compensazione del rilievo, cave a cielo aperto, ponti radio e deviatoi ferroviari. La 0.8.1 corregge la lettura dei file DWG.
keywords: novità, cosa c'è di nuovo, note di rilascio, registro delle modifiche, modifiche, 0.8, 0.8.1, versione, nuove funzioni, pioggia, tempesta, ristagno, tracimazione, movimenti di terra, bilancio, sterro, riporto, trasporto, percorso migliore, costo minimo, tracciato, vasca di laminazione, scarico, svuotamento, franco, avanzamento, rilievo, drone, cumulo, dall'indirizzo al sito, particella, suolo, alluvione, stabilità dei pendii, Bishop, cedimento, intersezione, segnaletica, segnali, distanza di visibilità, compensazione, minimi quadrati, poligonale, cava a cielo aperto, modello a blocchi, collegamento radio, Fresnel, deviatoio, scambio, lingue, problemi, live, DWG
from: b0932cf0
---

Ecco cosa è cambiato in CivilCraft 0.8 (2026-11-01) e 0.8.1 (2026-11-02), rispetto alla 0.7. Le parti principali sono strumenti che verificano la sistemazione del terreno e il sito (pioggia, movimenti di terra, percorsi, vasche, avanzamento) e sei finestre di calcolo per terreno, strade, rilievo, miniere, collegamenti e ferrovie.

## Novità

### Verifica la sistemazione del terreno

- **Fai piovere.** {{ui:Fai piovere…}} (sotto {{ui:Superficie}}) fa cadere una tempesta sul terreno sistemato. Si vede l'acqua scorrere dai piazzali, ristagnare negli angoli bassi e tracimare dalle vasche troppo piccole. L'esecuzione è animata e fornisce i volumi, la portata di picco in uscita e un CSV di ogni vasca. La cella predefinita è grossolana, così una prima verifica è rapida; una cella più fine è più lenta. Le vasche che tracimano compaiono anche nel pannello Problemi.
- **Bilanciatore dei movimenti di terra.** {{ui:Bilanciamento dei movimenti di terra…}} alza o abbassa un piazzale finché sterro e riporto sono uguali, e mostra la tabella del diagramma delle masse tra i due.
- **Percorso migliore.** {{ui:Percorso migliore…}}: indicare un punto di partenza e uno di arrivo, e CivilCraft trova il percorso meno costoso sul terreno che rispetta i limiti di pendenza e di curvatura, poi ne ricava un tracciato.
- **Vasche di laminazione.** {{ui:Vasche di laminazione…}} calcola quota e volume di invaso dal terreno, accetta dispositivi di scarico (orifizio, stramazzo, a V, sfioratore), fa passare una tempesta nella vasca e verifica la portata di picco trattenuta, il tempo di svuotamento e il franco.
- **Avanzamento dai rilievi.** {{ui:Avanzamento dai rilievi…}} confronta superfici da drone o da scansione di date diverse con il terreno com'era e con il progetto: percentuale completata in volume, aree scavate in eccesso e riempite in eccesso, cumuli, e quando i lavori finiranno a questo ritmo (indicato come stima).

### Conosci il sito

- **Dall'indirizzo al sito.** {{ui:Dall'indirizzo al sito…}} riunisce su un unico sito i dati aperti su particelle, edifici, zonizzazione, suolo, alluvioni e terreno. È possibile conservare il sito nel file di progetto: l'indirizzo digitato, ogni fonte con la data di acquisizione e la sua licenza, e ciò che è stato ottenuto. Riaprendo o condividendo il progetto il sito è ancora presente, senza nuovi download. Si può anche salvarlo come file di sito o inviarlo a BimCraft. Vedi [Dall'indirizzo al sito](topic:address-to-site).

### Terreno, strade, rilievo, miniere, collegamenti e ferrovie

- **{{ui:Suoli e pendii…}}** disegna il profilo del suolo tra i sondaggi che digiti. Il metodo di Bishop cerca poi la superficie di scorrimento critica sul terreno, con falda, sovraccarico e coefficiente sismico; il cedimento di una fondazione tiene conto di consolidazione, cedimento immediato e tempo.
- **{{ui:Intersezioni e segnaletica…}}** unisce i rami con raccordi di cordolo (un raggio per ramo, oppure raccordi a tre centri), la distanza di visibilità per la velocità di progetto, una verifica dei triangoli di visibilità, attraversamenti pedonali, linee di arresto, segnaletica orizzontale e segnali con un abaco dei segnali. Vengono disegnati sulla pianta e salvati come .dxf con layer denominati.
- **{{ui:Compensazione del rilievo…}}** esegue una compensazione ai minimi quadrati di una poligonale o di una rete: coordinate compensate, ellissi di errore, il test del chi quadrato e un segnale sulla misura che non si adatta. Sono inclusi reti libere, la chiusura di una poligonale con la regola di Bowditch e i file di campagna RW5, GSI, JobXML o CSV; i punti compensati si salvano come CSV.
- **{{ui:Cave a cielo aperto…}}** trasforma i campioni di perforazione in un modello a blocchi e nella cava finale entro l'angolo di scarpata, con il rapporto di sterile, una tabella per gradone e una curva di tenore e tonnellaggio. Ci sono anche cave annidate per fattore di ricavo e un programma di produzione con flusso di cassa scontato.
- **{{ui:Ponti radio…}}** verifica la visibilità diretta sul terreno tenendo conto della curvatura terrestre, della prima zona di Fresnel, del bilancio del collegamento, del margine di attenuazione e dell'interruzione per multipath, e indica l'altezza del palo che libererebbe il percorso. Calcola anche il bilancio delle perdite in fibra, le quantità del percorso e il vento su un traliccio.
- **{{ui:Deviatoi ferroviari…}}** crea un deviatoio dal numero del cuore, scambi di raccordo tra binari paralleli e una sagoma limite inclinata per la sopraelevazione e allargata in curva. Un deviatoio può trovarsi a una progressiva di un tracciato.

Vedi [Suoli, intersezioni, compensazione del rilievo, cave, ponti radio e deviatoi](topic:soils-roads-survey-mines-links).

## In tutte le app

- **Lingue.** 54 lingue, di cui dieci nuove. Le lingue diverse dall'inglese sono bozze automatiche finché un madrelingua non le rilegge. Gli argomenti della guida sono ancora per lo più in inglese.
- **{{ui:Righe della barra degli strumenti}}.** {{ui:Impostazioni}} › {{ui:Generali}} › {{ui:Righe della barra degli strumenti}}: A capo (come prima), 2 righe o 1 riga. La barra multifunzione di CivilCraft mostra lo strumento più usato in grande, i successivi in piccolo, e il resto dietro la freccia del nome del gruppo.
- **Dispositivi di input.** Trackpad, penna, mouse 3D, controller e MIDI possono comandare le app.
- **Problemi.** Un pannello Problemi che avvisa in ogni app, con verifiche che leggono i pacchetti di normativa.
- **Live.** Una vista di chi si trova dove in una sessione Live.
- **Add-on.** Un elenco di add-on, con add-on per l'illuminazione.
- **Collegare l'AI.** Qualsiasi assistente collegato può pilotare gli strumenti di CivilCraft. È fornito con una nota secondo cui il collegamento con un clic dentro CadCraft Studio e il connettore ospitato non sono ancora pronti. Vedi [Far lavorare un assistente AI sul sito](topic:assistants).

## Corretto nella 0.8.1

- **Sezione delle classi DWG.** Veniva letta come tipo errato (GitHub cadcraft#5). Corretto in CivilCraft insieme a CadCraft, BimCraft, ModelCraft e TakeoffCraft.
- **Cambio lingua durante l'esecuzione.** CadCraft Studio e le edizioni impacchettate possono cambiare lingua durante l'esecuzione. Prima erano solo in inglese. Non ancora provato su tutte le piattaforme: se la lingua non cambia, segnalarlo.

## Non ancora in questa versione

- **Sono strumenti di calcolo.** Ogni risultato delle nuove finestre richiede la verifica di un ingegnere. Le resistenze del terreno partono da valori tipici per il gruppo di suolo, e la finestra lo indica.
- **Fai piovere.** Un'esecuzione sul sito di esempio con cella fine può richiedere oltre due minuti nel browser. È stato verificato su casi di calcolo manuali e su un bacino a V, non ancora su un sito reale sistemato.
- **Dall'indirizzo al sito.** Legge file di dati aperti forniti dall'utente ed è stato provato solo sui nostri file. Gli alberi non sono una fonte. Il recupero automatico delle fonti attende la formulazione sulla privacy.
- **Avanzamento dai rilievi.** Provato solo su rilievi fittizi. L'avanzamento su tavole e annotazioni (MarkupCraft) e il confronto tra scansione e modello (BimCraft) non sono ancora implementati.
- **Suoli e pendii.** Solo superfici circolari: nessuna ricerca a cuneo o a blocco e nessuna fessura di trazione.
- **Intersezioni.** Un raggio per ramo, nessun percorso di spazzamento dei camion, e non entrano ancora nel corridoio.
- **File di campagna.** I lettori sono stati scritti a partire da descrizioni pubbliche dei formati e provati su file creati da noi. Servono file di strumenti reali.
- **Collegamenti e ferrovie.** Ponti radio: solo perdita in spazio libero e multipath (senza attenuazione per pioggia né diagrammi d'antenna). Nessuno standard ferroviario: ogni limite ferroviario è un segnaposto, con valori bozza che nessun ingegnere ferroviario ha verificato.
- **Windows e macOS.** 0.8 non è firmata digitalmente. Windows può mostrare un avviso, e macOS chiede di fare clic destro e poi Apri.

Tutto il resto è in [Non ancora implementato](topic:not-built-yet). Per la versione precedente, vedi [Novità nella 0.7](topic:whats-new-0-7).
