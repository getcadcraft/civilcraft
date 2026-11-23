---
title: Novità della versione 0.9 (precedenti)
summary: Modelli di corridoio e del terreno, agganci e pulsanti Scegli durante il disegno, analisi GIS con tabella degli attributi, studi di ombra, resa solare, comfort e vento per un sito, una vista Render 3D e i componenti aggiuntivi Nuvole di punti e WaterCraft.
keywords: novità 0.9, versione precedente, novità, 0.9, note di rilascio, modelli di corridoio, modelli del terreno, editor dei modelli, sezione tipo, più corridoi, aggancio, agganci, scegli, sposta, copia, ruota, tangente, render, render 3d, analisi gis, buffer, sovrapposizione, unione spaziale, tabella degli attributi, stile per attributo, studio d'ombra, resa solare, utci, comfort esterno, studio del vento, openfoam, nuvole di punti, las, laz, watercraft, portata antincendio, idrante, età dell'acqua, cloro, consumi, suggerimenti, layout, novità, changelog, modifiche, 0.8, 0.8.1, versione, nuove funzioni, pioggia, temporale, ristagno, tracimazione, movimenti di terra, bilanciamento, scavo e riporto, trasporto, percorso migliore, costo minimo, tracciato, vasca di laminazione, scarico, svaso, franco, avanzamento, rilievo, drone, cumulo, dall'indirizzo al sito, particella, suolo, alluvione, stabilità dei pendii, bishop, cedimento, innesto, segnaletica, segnali, visibilità, compensazione, minimi quadrati, poligonale, cava a cielo aperto, modello a blocchi, ponte radio, fresnel, deviatoio, scambio, lingue, problemi, live, dwg
from: 4664522c
---

Questo è ciò che è cambiato in CivilCraft 0.9, rispetto alla 0.8.1. CivilCraft 0.9 fa parte di CadCraft Studio 0.9 e delle sue otto app. Le parti principali sono modelli di corridoio e del terreno, agganci durante il disegno, analisi GIS, studi del sole, della resa solare, del comfort e del vento di un sito, e due componenti aggiuntivi: Nuvole di punti e WaterCraft.

## Novità

### Modelli di corridoio e del terreno

- **Modelli di corridoio.** Aprire {{ui:Superficie}} › {{ui:Altro}} › {{ui:Modelli di corridoio…}} (oppure digitare {{cmd:TEMPLATES}}). Un modello è una piccola sezione trasversale con componenti, offset, pendenze, materiali e codici dei punti. Conservarli nel progetto, in {{ui:Mia libreria}} oppure come file `.cctemplates.json`. L'editor dei modelli mostra un disegno in scala reale ed elenca i problemi mentre si digita.
- **Costruire da modelli per progressiva.** Selezionare un tracciato e attivare {{ui:Costruisci da modelli per progressiva}} nelle sue Proprietà. Ogni lato di ogni zona ha un proprio elenco di pavimentazione e una propria condizione finale. {{ui:Aggiungi un corridoio}} sotto {{ui:Corridoi su questo allineamento}} mette più corridoi su un tracciato.
- **Modelli del terreno.** {{ui:Superficie}} › {{ui:Altro}} › {{ui:Modelli del terreno…}} (oppure digitare {{cmd:TERRAINTEMPLATES}}) drappeggia su un terreno materiali stratificati come terreno vegetale oppure pavimentazione e base, con area e volume per strato. Vedi [Modelli di corridoio e modelli del terreno](topic:corridor-templates).

### Disegno

- **Agganci.** Gli strumenti Tracciato, Piazzale, Particella, Volume, Linea caratteristica, Misura, Confine e Bacino si agganciano a punti di rilievo, PI, angoli, vertici e manufatti, con un'etichetta accanto al simbolo. Tenere premuto {{key:Alt}} per un punto libero.
- **Pulsanti Scegli, tangente e sposta, copia, ruota.** Gli angoli di piazzali, particelle e linee caratteristiche hanno campi digitabili per Est e Nord e un pulsante Scegli a mirino. Le Proprietà hanno anche {{ui:Tangente da due punti}} per i tracciati e {{ui:Sposta, copia e ruota}} per tracciati, piazzali, particelle e linee caratteristiche. Vedi [Disegnare con agganci, angoli scelti e sposta, copia, ruota](topic:draft-with-snaps).
- **Vista Render in 3D.** Il pulsante {{ui:Render}} nella barra 3D disegna il terreno con colori naturali, cielo, foschia e ombre morbide. Non modifica il modello. Il menu {{ui:Sole}} ora ha i pulsanti {{ui:Applica}} e {{ui:Chiudi}}. Vedi [Vedere il sito in 3D](topic:site-3d).
- **I pannelli si aprono una sezione alla volta.** Il pannello sinistro e quello delle Proprietà aprono una sezione e chiudono le altre, e le tessere della barra multifunzione Paesaggio che contengono più strumenti sono pulsanti divisi.

### Analisi GIS

- **Analizza.** {{ui:Superficie}} › {{ui:Altro}} › {{ui:Analizza}} offre buffer, sovrapposizione, unione spaziale, selezione per attributo o forma, e misura. Ogni strumento crea un nuovo layer in un solo passo di annullamento.
- **Tabella degli attributi.** Il menu a tre punti di un layer ha {{ui:Tabella degli attributi…}} e {{ui:Stile per attributo…}}. Vedi [Analizzare i layer GIS](topic:gis-analysis) e [Lavorare con la tabella degli attributi di un layer](topic:gis-table).

### Il sito: sole, solare, comfort e vento

- **Sezione Ambiente.** Selezionare un volume: la sezione {{ui:Ambiente}} si trova sotto {{ui:Ore di sole}} nelle sue Proprietà. Ha uno studio d'ombra (mappa, tabella, animazione, CSV), la resa solare da un file meteo di anno tipo (.epw) e il comfort all'aperto (UTCI).
- **Vento, solo come screening.** {{ui:Esegui studio del vento}} colora il terreno da seduto a scomodo per ogni direzione del vento nel file meteo. Non è convalidato, e il pannello lo indica.
- **Componente aggiuntivo vento pedonale (OpenFOAM).** Disattivato finché non lo si attiva in {{ui:Impostazioni}} › {{ui:Add-on}}. OpenFOAM è un software da installare autonomamente. Vedi [Ombra, resa solare e comfort all'aperto](topic:environment).

### Nuvole di punti (componente aggiuntivo)

- Attivare {{ui:Nuvole di punti}} in {{ui:Impostazioni}} › {{ui:Add-on}}; compare una scheda Nuvole di punti nel pannello destro. Aprire un file LAS o LAZ, ripulirlo, suddividerlo in terreno, vegetazione ed edifici, costruire il terreno, le curve di livello e i volumi, ed esportare LAS o LAZ. Vedi [Nuvole di punti da drone o scanner](topic:point-clouds).

### WaterCraft (componente aggiuntivo)

- Attivare {{ui:WaterCraft (distribuzione idrica)}} in {{ui:Impostazioni}} › {{ui:Add-on}}; compare una scheda WaterCraft. Include i consumi delle utenze, la portata antincendio a ogni idrante, quale interruzione di condotta pesa di più, e l'età dell'acqua e il cloro, ciascuno salvato come CSV. Vedi [WaterCraft: consumi, portata antincendio, interruzioni ed età dell'acqua](topic:watercraft).

### Lavorare insieme

- In una sessione Live si vedono i cursori e i nomi degli altri nella pianta. Piante di libreria: CivilCraft Paesaggio parte dalla sua raccolta predefinita della Libreria, {{ui:CivilCraft paesaggio}}.

## In ogni app

- I suggerimenti compaiono come descrizioni comandi (tooltip) Bootstrap, e il suggerimento iniziale può essere chiuso.
- La barra delle schede di un pannello che non entra scorre invece di essere tagliata.
- I titoli delle schede del browser riportano `<documento> - CivilCraft | CadCraft`.
- {{ui:Impostazioni}} ha una sezione Layout in cui i layout sono un menu a discesa di scelte su due righe.
- Le unità di peso e temperatura sono in {{ui:Impostazioni}} › {{ui:Globali}} › {{ui:Unità}}.
- L'elenco delle lingue mostra le lingue per cui la versione ha dei file. Le lingue diverse dall'inglese sono bozze automatiche.

## Corretti

- I componenti aggiuntivi di ricerca indirizzi e verifica EnergyPlus non potevano essere attivati; ora sì.
- La guida ora indica che il componente Nuvole di punti scrive una nuvola ripulita come LAS 1.4 o LAZ.
- Fare clic sul grip dell'oggetto selezionato non avvia più un trascinamento del grip che interrompeva un Scegli in attesa.

## Limiti dichiarati

- I modelli di corridoio di esempio sono segnaposto senza uno standard; un ingegnere deve verificarli. I modelli del terreno non aggiungono una superficie e non sono disegnati in 3D né nella vista delle sezioni. Il secondo corridoio su un tracciato non è nell'esportazione IFC. Non esiste un restringimento tra due modelli per progressiva.
- Le nuvole di punti sono state provate su file fittizi, non su un vero rilievo con drone. Vengono letti solo LAS e LAZ.
- L'analisi GIS è stata provata su layer fittizi.
- Ombra, resa solare e comfort sono stime di pianificazione; il vento è uno screening non convalidato. Nessuno di questi è un valore di progetto.
- WaterCraft è un ausilio di calcolo verificato su reti fittizie. Un ingegnere idraulico stabilisce il valore dei numeri.
- Le lingue oltre l'inglese sono bozze automatiche.
- Gli installer per Windows non sono firmati digitalmente, e l'immagine disco per macOS non è notarizzata.

## Precedenti: 0.8 e 0.8.1

Questo è ciò che è cambiato in CivilCraft 0.8 (2026-11-01) e 0.8.1 (2026-11-02), rispetto alla 0.7. Le parti nuove principali sono strumenti che verificano la sistemazione e il sito (pioggia, movimenti di terra, percorsi, vasche, avanzamento) e sei finestre di calcolo per terreno, strade, rilievo, miniere, collegamenti e ferrovie.

### Novità

**Verificare la sistemazione**

- **Fai piovere.** {{ui:Fai piovere…}} (sotto {{ui:Superficie}}) fa cadere un temporale sul terreno sistemato. Si osserva l'acqua scorrere dai piazzali, ristagnare negli angoli bassi e tracimare dalle vasche troppo piccole. La simulazione è animata e fornisce i volumi, la portata di colmo in uscita e un CSV di ogni vasca. La cella predefinita è grossolana così un primo sguardo è rapido; una cella più fine è più lenta. Le vasche che tracimano compaiono anche nel pannello Problemi.
- **Bilanciatore dei movimenti di terra.** {{ui:Bilanciamento dei movimenti di terra…}} alza o abbassa un piazzale finché scavo e riporto sono uguali, e mostra la tabella dei trasporti tra di essi.
- **Percorso migliore.** {{ui:Percorso migliore…}}: scegliere un inizio e una fine, e CivilCraft trova il percorso più economico attraverso il terreno che rispetta i limiti di pendenza e di curvatura, poi ne ricava un tracciato.
- **Vasche di laminazione.** {{ui:Vasche di laminazione…}} calcola livello e invaso dal terreno, accetta dispositivi di scarico (orifizio, stramazzo, a V, sfioratore), fa propagare un temporale nella vasca e verifica la portata di colmo trattenuta, il tempo di svaso e il franco.
- **Avanzamento dai rilievi.** {{ui:Avanzamento dai rilievi…}} confronta superfici da drone o scansione di date diverse con il terreno com'era e con il progetto: percentuale completata in volume, aree scavate in eccesso e riportate in eccesso, cumuli, e quando i lavori finiscono a questo ritmo (indicato come stima).

**Conoscere il sito**

- **Dall'indirizzo al sito.** {{ui:Dall'indirizzo al sito…}} riunisce i dati aperti su particelle, edifici, zonizzazione, suolo, alluvioni e terreno su un unico sito. Il sito può essere conservato nel file di progetto: l'indirizzo digitato, ciascuna fonte con il giorno in cui è stata recuperata e la sua licenza, e ciò che è stato restituito. Riaprendo o condividendo il progetto il sito è ancora lì, senza nuovo recupero. Può anche essere salvato come file di sito o inviato a BimCraft. Vedi [Dall'indirizzo al sito](topic:address-to-site).

**Terreno, strade, rilievo, miniere, collegamenti e ferrovie**

- **Suoli e pendii.** {{ui:Suoli e pendii…}} disegna il profilo del suolo tra i sondaggi digitati. Il metodo di Bishop cerca poi la superficie di scorrimento critica sul terreno, con falda, sovraccarico e coefficiente sismico; il cedimento di un plinto include consolidazione, cedimento immediato e tempo.
- **Intersezioni e segnaletica.** {{ui:Intersezioni e segnaletica…}} unisce i rami con raccordi di cordolo (un raggio per ramo, oppure raccordi a tre centri), la visibilità per la velocità di progetto, una verifica dei triangoli di visibilità, attraversamenti pedonali, linee d'arresto, segnaletica orizzontale e segnali con un abaco dei segnali. Sono disegnati in pianta e salvati come .dxf con layer denominati.
- **Compensazione del rilievo.** {{ui:Compensazione del rilievo…}} esegue una compensazione ai minimi quadrati di una poligonale o di una rete: coordinate compensate, ellissi di errore, il test chi-quadrato e un segnale sulla misura che non torna. Sono inclusi reti libere, chiusura di una poligonale con la regola della bussola e file di campagna RW5, GSI, JobXML o CSV, e i punti compensati si salvano come CSV.
- **Cave a cielo aperto.** {{ui:Cave a cielo aperto…}} trasforma i campioni di sondaggio in un modello a blocchi e nella cava ultima entro l'angolo di scarpata, con il rapporto di sterile, una tabella per gradone e una curva di tenore e tonnellaggio. Sono disponibili anche cave annidate per fattore di ricavo e un programma di produzione con flusso di cassa attualizzato.
- **Ponti radio.** {{ui:Ponti radio…}} verifica la visibilità diretta sul terreno con la curvatura terrestre, la prima zona di Fresnel, il bilancio del collegamento, il margine di attenuazione e l'interruzione per multipercorso, e indica l'altezza del palo che libererebbe il percorso. Calcola anche i bilanci delle perdite in fibra, le quantità del percorso e il vento su un traliccio.
- **Deviatoi ferroviari.** {{ui:Deviatoi ferroviari…}} crea un deviatoio dal suo numero di cuore, scambi tra binari paralleli e una sagoma limite inclinata dalla sopraelevazione e allargata in curva. Un deviatoio può trovarsi a una progressiva di un tracciato.

Vedi [Suoli, intersezioni, compensazione del rilievo, cave, ponti radio e deviatoi](topic:soils-roads-survey-mines-links).

### In ogni app

- **Lingue.** 54 lingue, dieci delle quali nuove. Le lingue diverse dall'inglese sono bozze automatiche finché un madrelingua non le legge. Gli argomenti della guida sono per lo più ancora in inglese.
- **Righe della barra degli strumenti.** {{ui:Impostazioni}} › {{ui:Generali}} › {{ui:Righe della barra degli strumenti}}: a capo (come prima), 2 righe o 1 riga. La barra multifunzione di CivilCraft mostra lo strumento più usato in grande, i successivi in piccolo, e il resto dietro la freccia del nome del gruppo.
- **Dispositivi di input.** Trackpad, penna, mouse 3D, controller e MIDI possono comandare le app.
- **Problemi.** Un pannello Problemi che avvisa in ogni app, con verifiche che leggono i pacchetti normativi.
- **Live.** Una vista di chi è dove in una sessione Live.
- **Componenti aggiuntivi.** Un elenco dei componenti aggiuntivi, con quelli di illuminazione.
- **Collega la propria IA.** Ogni assistente collegato può usare gli strumenti di CivilCraft. Include una nota secondo cui il collegamento con un clic dentro CadCraft Studio e il connettore ospitato non sono ancora pronti. Vedi [Far lavorare un assistente IA con il proprio sito](topic:assistants).

### Corretti nella 0.8.1

- **Sezione delle classi DWG.** Veniva letta con il tipo sbagliato (GitHub cadcraft#5). Corretta in CivilCraft insieme a CadCraft, BimCraft, ModelCraft e TakeoffCraft.
- **Cambio di lingua durante l'esecuzione.** CadCraft Studio e le edizioni impacchettate possono cambiare lingua a runtime. Prima erano solo in inglese. Non ancora provato su ogni piattaforma: segnalare se la lingua non cambia.

### Non ancora in questa versione

- **Sono ausili di calcolo.** Ogni risultato delle nuove finestre richiede la verifica di un ingegnere. Le resistenze del suolo partono da valori tipici per il gruppo di suolo, e la finestra lo indica.
- **Fai piovere.** Una simulazione sul sito di esempio può richiedere più di due minuti nel browser con una cella fine. È stata verificata con casi a mano e un bacino a V, non ancora su un vero sito sistemato.
- **Dall'indirizzo al sito.** Legge i file di dati aperti che si forniscono, ed è stato provato solo sui nostri file. Gli alberi non sono una fonte. Il recupero automatico delle fonti attende la formulazione della privacy.
- **Avanzamento dai rilievi.** Provato solo su rilievi fittizi. Non sono implementati l'avanzamento su tavole e annotazioni (MarkupCraft) e il confronto scansione-modello (BimCraft).
- **Suoli e pendii.** Solo superfici circolari: nessuna ricerca a cuneo o a blocchi e nessuna fessura di trazione.
- **Innesti.** Un raggio per ramo, nessuna traiettoria di sterzata di autocarri, e per ora non entrano nel corridoio.
- **File di campagna.** I lettori sono stati scritti da descrizioni pubbliche dei formati e provati su file creati da noi. Servono file reali degli strumenti.
- **Collegamenti e ferrovie.** Ponti radio: solo perdita in spazio libero e multipercorso (nessuna attenuazione da pioggia né diagrammi d'antenna), e nessuno standard ferroviario: ogni limite ferroviario è un segnaposto, con valori di bozza che nessun ingegnere ferroviario ha verificato.
- **Windows e macOS.** La 0.8 non è firmata digitalmente. Windows può mostrare avvisi, e macOS chiede di fare clic destro e poi Apri.

Tutto il resto è in [Non ancora implementato](topic:not-built-yet). Per la versione precedente, vedi [Novità della versione 0.7](topic:whats-new-0-7).
