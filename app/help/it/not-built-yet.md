---
title: Non ancora implementato
summary: Che cosa questa versione di CivilCraft non fa ancora, e che cosa fare oggi invece.
keywords: mancante, limitazioni, roadmap, non disponibile, clotoidi, allargamenti, dwg, dxf, caditoie, laminazione, sezioni trasversali, in arrivo, limiti
from: b91588d4
---

CivilCraft è nella fase iniziale. Questa pagina elenca ciò che la versione attuale non fa, così non lo si cerca. Nulla di quanto segue è promesso con una data.

## Punti

| Non ancora implementato | Invece, oggi |
|---|---|
| Aggiungere un secondo file di punti al primo | Unire prima i file in un editor di testo o in un foglio di calcolo |
| Esportare un file di testo dei punti | Esportare LandXML (i punti vengono esportati come CgPoints), usare {{ui:Esporta}} GIS (punti con campi P, N, E, Z e D), oppure {{ui:Copia}} i punti in un foglio di calcolo |
| Stili delle etichette dei punti, simboli per chiave di descrizione, curve (archi) da codici di linea, un file di chiavi di descrizione da condividere tra progetti | Le etichette mostrano il numero, la quota e la descrizione, o meno ([Impostazioni di CivilCraft](topic:settings)); le chiavi sono conservate nel file di progetto |
| Conversione delle unità | Convertire il file prima dell'importazione; **Unità** cambia solo l'etichetta |

## Superfici

| Non ancora implementato | Invece, oggi |
|---|---|
| Più di una superficie costruita da punti | Un progetto per superficie |
| Nascondere i confini (interni) | Usare **Bordo esterno più lungo** oppure un confine esterno |
| Selezionare o modificare una linea di discontinuità disegnata | {{key:Mod+Z}}, oppure {{ui:Rimuovi le linee di discontinuità disegnate}} e ridisegnare |
| Modificare una superficie letta da LandXML (linee di discontinuità, confine) | {{ui:Ricostruisci la superficie dai punti}} |
| Modificare una superficie ricavata da una griglia di quote | Importare di nuovo la griglia con altre scelte |
| Convertire una superficie letta da LandXML quando cambia il sistema di coordinate | {{ui:Ricostruisci la superficie dai punti}} prima |
| Quote puntuali e valori di pendenza con etichetta | Leggerli nella barra di stato, oppure colorare la superficie per pendenza con **Analisi della pendenza** nell'area di lavoro Paesaggio ([Sistemazione del terreno per il paesaggio](topic:landscape-grading#grading-checks)) |

## Tracciati e profili

| Non ancora implementato | Invece, oggi |
|---|---|
| Clotoidi diverse dalla clotoide; una clotoide tra due curve (transizioni composte) | Le clotoidi alle estremità di una curva sono disponibili; le altre vengono denominate e saltate nell'importazione LandXML |
| Inserire un PI tra altri due | Ridisegnare il tracciato, oppure digitare di nuovo le coordinate dei PI |
| Tracciati da oggetti, offset, allargamenti | Disegnare con i PI |
| Digitare K per una curva verticale | Digitare L (K viene mostrato) |
| Curve verticali circolari e asimmetriche | Solo curve paraboliche simmetriche |
| Più di un profilo di progetto per tracciato | Un tracciato per variante |
| Zoom sulla vista del profilo, fasce di profilo sotto il profilo | La vista del profilo adatta l'intero tracciato; stamparla sulle [tavole di pianta e profilo](topic:plan-profile-sheets) |
| Sezioni in DWG o LandXML | Tavole delle sezioni in PDF; {{ui:CSV}} delle aree e dei volumi |
| Linee di campionamento inclinate, oppure di larghezze diverse lungo la strada | Una larghezza per ciascun lato per l'intero tracciato |

## Corridoi

| Non ancora implementato | Invece, oggi |
|---|---|
| Spartitraffico, barriere e una sopraelevazione che ruota i modelli | Disegnarli come modelli ([Modelli di corridoio](topic:corridor-templates)); i modelli per progressiva non prendono ancora la sopraelevazione |
| Un cambiamento graduale tra i modelli di due zone (transizioni, restringimenti) | Cambiare il modello a una progressiva, oppure dare a un punto un obiettivo di larghezza verso una linea disegnata come restringimento |
| Rotazione attorno a un bordo, sopraelevazione in LandXML | La sopraelevazione ruota attorno all'asse nelle curve circolari; allargare una corsia con un obiettivo di larghezza verso una linea caratteristica |
| Obiettivi per le scarpate (intersezione con il terreno verso una linea o una superficie), superfici proprie dei corridoi | Gli obiettivi spostano i margini della carreggiata e le banchine ([Corridoi](topic:corridor)); il corridoio viene sistemato nella superficie di progetto |
| Raccordi di cordolo, corsie di svolta e isole sistemati in un innesto; la fine di una strada laterale tagliata al bordo della strada principale su un'obliqua; un percorso collegato a una strada in pianta, nella sua lunghezza e area | Le strade che si incontrano sono collegate a squadra, con il bordo della strada principale aperto e la strada laterale raccordata ad esso ([Dove le strade incontrano strade](topic:corridor#where-roads-meet-roads-pads-and-paths)); un percorso si ferma al bordo della strada nella superficie di progetto e in 3D |
| Corridoi esportati come strade LandXML; un secondo corridoio su un tracciato nell'esportazione IFC | Viene esportata la superficie di progetto |
| Modelli del terreno che modificano la superficie di progetto, in 3D o nelle sezioni | Forniscono aree e volumi di ciascuno strato ([Modelli del terreno](topic:corridor-templates#terrain-templates)) |
| Traiettorie di sterzata con velocità, slittamento degli pneumatici, tempo di sterzo, rimorchi o ingombro della carrozzeria; una libreria di veicoli standard di progetto; una traiettoria disegnata trascinando il veicolo | Traiettorie di sterzata a bassa velocità lungo una linea caratteristica o un tracciato, con le dimensioni di propri veicoli ([Traiettorie di sterzata dei veicoli](topic:swept-paths)) |

## Sistemazione del terreno e volumi

| Non ancora implementato | Invece, oggi |
|---|---|
| Gradoni, linee caratteristiche aperte sistemate nel progetto, sistemazione fino a una linea caratteristica di un altro punto | Chiudere la linea caratteristica ([Linee caratteristiche](topic:feature-lines)), oppure usarla come linea di discontinuità del terreno esistente |
| Inserire o rimuovere un vertice di linea caratteristica | Ridisegnare la linea, oppure farne un offset a gradini |
| Archi nelle linee di discontinuità disegnate (passanti per i punti di rilievo), clotoidi nelle linee caratteristiche | Disegnare una linea caratteristica con archi e usarla come linea di discontinuità del terreno esistente |
| Sistemazione fino a una distanza, una quota o un'altra superficie | Solo intersezione con il terreno esistente |
| Aggiungere o rimuovere un angolo di piazzale | Eliminare il piazzale e ridisegnarlo |
| Volumi TIN-a-TIN (prismi), scelta della dimensione della cella di griglia | Metodo a griglia, con dimensione della cella scelta automaticamente |
| Rigonfiamento e ritiro, terreno vegetale, spessori della pavimentazione | Applicare da sé i fattori ai valori riportati |
| Costi di trasporto libero e di sovratrasporto, trasporto tra tracciati diversi, cave di prestito e discariche collocate in pianta | Il diagramma delle masse con punti di equilibrio, volumi spostati e distanze medie di trasporto |

## Reti di tubazioni

| Non ancora implementato | Invece, oggi |
|---|---|
| Più di una rete per progetto | Progetti separati per acque meteoriche e acque nere |
| Condotte idriche: qualità e età dell'acqua, controlli basati su regole, altri tipi di valvole (di regolazione della portata, di strozzamento, di mantenimento), pompe definite dalla potenza, consumi che dipendono dalla pressione, un'opzione Darcy–Weisbach, un catalogo di tubazioni con spessori di parete e classi di pressione. Il resto delle reti in pressione è in fase di prova: [Condotte idriche](topic:water-mains) | Verificarle in un software di distribuzione idrica; le portate di progetto per le acque nere sono in [Portate di progetto per acque nere](topic:sanitary-design) |
| Portate fognarie nel tempo (idrogrammi, propagazione dinamica, invasi, pompe, sfioratori) | [Portate di progetto per acque nere](topic:sanitary-design) fornisce la portata di punta a regime usata da una tavola di progetto |
| Capacità delle caditoie, spandimento in cunetta, propagazione in laminazione, idrogrammi, perdite di energia diverse da un unico coefficiente di confluenza | Verificarle in altro software; portate, dimensioni e linee piezometriche sono in [Drenaggio delle acque meteoriche](topic:storm-drainage) |
| Bacini nella stampa PDF, DWG, DXF o LandXML; bacini ricavati dalla superficie (spartiacque) | Disegnare i bacini a mano; sono salvati nel file di progetto |
| Cataloghi di tubazioni, tubazioni non circolari, manufatti che non sono scatole o cilindri verticali (coni, gradini, banchine), una categoria di drenaggio nella libreria | Tipi di manufatto da parametri ([Rete di tubazioni](topic:pipe-network)); tubazioni con diametro |
| Tubazioni nella vista del profilo, tubazioni curve | Leggere le quote di fondo e la copertura nel pannello destro |

## Particelle

| Non ancora implementato | Invece, oggi |
|---|---|
| Suddivisione in lotti per superficie o fronte, particelle dalle linee che le circondano, diritto di passaggio | Disegnare ogni particella dai suoi angoli, oppure inserire le sue misure |
| Tabelle delle curve e tabelle delle linee in pianta; etichette spostate a mano | Ogni lato è etichettato lungo se stesso |
| Particelle in LandXML | Le particelle sono salvate nel file di progetto e vanno in PDF, DWG e DXF |

## Poligonali

| Non ancora implementato | Invece, oggi |
|---|---|
| Compensazione ai minimi quadrati, regola del transito, pesatura degli angoli rispetto alle distanze | La regola della bussola |
| Angoli di deviazione, angoli zenitali e distanze inclinate, quote per livellazione trigonometrica | Ridurre correttamente a distanze e angoli orizzontali, oppure usare le direzioni |
| Battute laterali, file di dati grezzi dai collettori dati | Importare i punti come file di punti |

## Picchettamento

| Non ancora implementato | Invece, oggi |
|---|---|
| Picchetti di offset (punti di riferimento arretrati rispetto al picchetto), picchetti di scarpata al punto di intersezione | Picchettare agli offset necessari, anche oltre la banchina |
| Invio diretto dei picchetti nel formato proprio di un collettore dati | Il CSV si apre nel software d'ufficio della maggior parte dei collettori dati |
| Picchettamento di tubazioni, piazzali e particelle | Usare punti di rilievo vicino a un tracciato, oppure i lati della particella |

## File e uscite

| Non ancora implementato | Invece, oggi |
|---|---|
| Testo, tratteggi e quote da DWG o DXF; spazio carta; disegni collegati (riferimenti esterni); DXF binario | Si aprono i tratti dallo spazio modello ([Aprire un DWG o DXF come tratti](topic:open-dwg-dxf)); aprire i disegni collegati separatamente |
| Spostare più punti insieme trascinandoli | Tagliarli e incollarli, oppure modificarli uno alla volta |
| Tavole in verticale, cartigli propri, viewport disposte a piacere, tavole di pianta e profilo in DWG | Una tavola di pianta orizzontale per PDF, oppure tavole di pianta e profilo lungo un tracciato (PDF) |
| Stampa delle fasce di quota e dei profili | Le fasce sono solo a schermo; fare uno screenshot se servono |
| Modificare nomi dei layer, colori o stili delle etichette | Modificarli in un programma CAD dopo l'esportazione DXF |
| Salvataggio nel cloud e cronologia delle versioni | Salvare i file `.civilcraft.json` e tenerli sottoposti a backup; per lavorare insieme su un progetto usare una sessione live in CadCraft Studio ([Progettare insieme un sito, in tempo reale](topic:work-live)) |
| CadCraft Studio per iPad e iPhone, e da Google Play | Usare CivilCraft nel browser sul dispositivo; su Android, CadCraft Studio si installa dal suo APK su getcadcraft.com/download |
| Aprire più file di punti o di progetto contemporaneamente | Un file alla volta per ciascuna apertura (i file GIS che appartengono insieme, come le parti di uno shapefile, si aprono insieme) |

## Paesaggio

| Non ancora implementato | Invece, oggi |
|---|---|
| Teste e ugelli dei produttori | Teste generiche, oppure aggiungere le proprie teste da un file; i dati dei produttori arrivano man mano che concedono l'autorizzazione |
| Lunghezze laterali massime per le linee a goccia, portate nel tempo, pompe, reti di tubazioni ad anello | Mantenere i tratti a goccia entro la lunghezza pubblicata dal produttore; la verifica richiede una rete ramificata |
| Il contorno esatto di un oggetto a forma libera concavo; il suo volume sotto terra misurato esattamente | Si sistema l'inviluppo convesso e il volume sotto terra è una stima (indicato nelle Proprietà) |
| Piante nel comando Posiziona da libreria proprio di BimCraft e ModelCraft | Esportare l'IFC del paesaggio e aprirlo in BimCraft accanto all'edificio |
| Modelli dettagliati delle piante (foglie, rami, stagioni) nella vista 3D; oggetti a forma libera e irrigazione nella vista 3D | Le piante appaiono in 3D come forme semplici dimensionate dall'elenco delle piante ([Vedere il sito in 3D](topic:site-3d)); lo scatter di ModelCraft crea immagini di piantumazione |
| Muri di superfici dure che trattengono un livello sistemato alle loro spalle in superficie | Dare a una piattaforma o a un piazzale lati verticali: sono muri di sostegno in superficie ([Sistemazione del terreno](topic:grading)) |
| Trasformazioni SVG nei propri simboli; texture e colori dei propri modelli GLB di piante; geometria GLB compressa | Scomporre prima le trasformazioni nel programma di disegno; i modelli sono disegnati con il colore della pianta; esportare il GLB senza compressione ([Grafica delle piante](topic:plant-graphics)) |
| Il proprio elenco di piante conservato nel proprio account Libreria (modificato nell'app) | Modificare l'elenco del progetto nella tabella delle piante e salvarlo come file di piante |
| Gli strumenti di paesaggio per gli assistenti senza la finestra (il server di file e la riga di comando) | Funzionano con la finestra di CivilCraft aperta ([Far lavorare un assistente IA con il proprio sito](topic:assistants)) |

## Linee elettriche

| Non ancora implementato | Invece, oggi |
|---|---|
| Uno standard nazionale integrato (ipotesi di carico, distanze di sicurezza, coefficienti) | Impostare i valori del proprio standard in {{ui:Ipotesi di carico e limiti…}} e salvarli, con la propria libreria, come pacchetto da riutilizzare e condividere ([Pacchetti](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| La distanza laterale da un conduttore alla chioma di un albero o a un muro accanto alla linea | La distanza verticale sopra piante e muri che la linea attraversa ([Verifiche della linea elettrica](topic:power-line-checks#clearances)) |
| Scorrimento del conduttore e allungamento di un conduttore nuovo | Tenerne conto attraverso le temperature nella tabella di tesatura |
| Portata termica dei cavi interrati (portata di corrente in base alla posa) | Inserire la portata di corrente indicata dal fornitore nella voce del cavo |
| Studi di corto circuito, protezione e messa a terra | Usare un programma elettrico dedicato; CivilCraft fornisce le lunghezze della rete e i cavi |
| Tralicci reticolari progettati asta per asta, e ancoraggi dei tiranti nel terreno | I sostegni sono verificati per il carico nominale; i tiranti per il carico nominale |
| Un file di studio `.DON` verificato nel programma che lo legge | Verificare il file in quel programma; inviarci un esempio per fare prove su un file reale |
| Linee elettriche nella vista 3D e in IFC | La pianta, il profilo della linea, le tavole e i layer GIS |
| Gli strumenti per linee elettriche per gli assistenti senza la finestra | Funzionano con la finestra di CivilCraft aperta ([Far lavorare un assistente IA con il proprio sito](topic:assistants)) |

## Volumi edilizi

| Non ancora implementato | Invece, oggi |
|---|---|
| Una libreria di codici urbanistici o delle regole di qualsiasi città | Digitare i limiti dalla propria normativa ([Limiti urbanistici](topic:zoning-limits)) |
| Luce del cielo sulle pareti (luce diurna di facciata), vento | [Ore di sole](topic:sun-hours) conta solo il sole diretto |
| Ombra di alberi, piante o di qualsiasi cosa non disegnata come volume | Disegnare gli edifici vicini come volumi |
| Forme di copertura sui volumi | Volumi con copertura piana |
| Aperture, coperture e tipi di muro quando un volume viene sviluppato in BimCraft | BimCraft costruisce muri esterni semplici su ogni piano e un solaio; aggiungere il resto lì |

## GIS e sistemi di coordinate

| Non ancora implementato | Invece, oggi |
|---|---|
| File Geodatabase; stili KML, icone, sovrapposizioni al suolo e collegamenti di rete | Convertire prima in GeoPackage, shapefile o GeoJSON; i segnaposti KML sono letti senza i loro stili |
| Modificare elementi GIS o i loro attributi | Modificarli in un programma GIS e importare di nuovo. Il pannello Analizza crea nuovi layer (buffer, sovrapposizione, unione, selezione) e aggiunge campi di area e lunghezza, ma non modifica un elemento sul posto |
| Analisi di rete e raster, buffer con estremità piatte o squadrate e buffer unilaterali, aggiunta o eliminazione di righe e modifica del tipo di un campo nella tabella degli attributi, colori manuali delle classi, una legenda degli stili nelle stampe | Usare Seleziona per scegliere gli elementi e creare un layer da essi; le estremità piatte non sono offerte. La colorazione per attributo e la tabella degli attributi sono implementate: vedi [Stilizzare un layer per attributo](topic:gis-symbology) e [Lavorare con la tabella degli attributi di un layer](topic:gis-table) |
| Stili delle etichette (dimensione, posizione) ed etichette che evitano le altre | Le etichette hanno una sola dimensione e possono sovrapporsi dove gli elementi sono fitti |
| Sistemi altimetrici di riferimento e modelli di geoide | Le quote sono usate come le fornisce il file; verificare il datum altimetrico da sé |
| Spostamenti di griglia diversi da NAD27 verso NAD83 suggeriti per area (OSTN15, NTv2 per altri datum funzionano quando si aggiunge il file), più griglie insieme, griglie verticali | Aggiungere il file della griglia per il proprio datum; una griglia per progetto |
| Layer cartografici nei DXF o nelle esportazioni 3D | I layer cartografici vanno nella stampa PDF, e accanto al DWG come immagine |
| Server di mappe che richiedono accesso, chiave o token | Usare servizi pubblici, oppure un file immagine georeferenziato |
| Scrivere file LAS o LAZ da una superficie, dal modello del terreno o dagli strumenti di griglia di quote e LiDAR | Esportare le superfici come griglia di quote GeoTIFF. Il componente aggiuntivo [Nuvole di punti](topic:point-clouds) scrive una nuvola ripulita come LAS 1.4 o LAZ |
| Intensità, colore e ritorni LiDAR; griglie di quote con più bande; file di griglia o LiDAR oltre 200 MB | Il LiDAR è filtrato solo per classe, le griglie usano la prima banda; tagliare prima i file grandi in riquadri |

## Input

| Non ancora implementato | Invece, oggi |
|---|---|
| Selezione a riquadro al tocco (richiede {{key:Shift}}) | Tenere premuto su ogni punto di rilievo per aggiungerlo |
| Coordinate o distanze digitate durante il disegno | Disegnare in modo approssimativo, poi digitare le coordinate esatte dei PI nella tabella dei PI del tracciato |
| Digitare le coordinate per gli angoli dei piazzali e per i manufatti | Trascinare i loro grip; ingrandire per la precisione e controllare E e N nella barra di stato |
| Aggancio agli oggetti (diverso dai punti di rilievo per le linee di discontinuità) | Ingrandire e controllare la barra di stato |

## Vista 3D

| Non ancora implementato | Invece, oggi |
|---|---|
| Disegnare o modificare nella vista 3D | Disegnare e modificare in pianta; la vista 3D segue ogni modifica |
| Selezionare linee caratteristiche di corridoio o elementi GIS facendo clic in 3D | Farci clic in pianta |
| Esportare la vista esagerata o in ft | Le esportazioni sono in scala reale in metri; vedi [Esportare il sito in 3D](topic:export-3d) |
| Etichette nelle esportazioni GLB o OBJ, dimensioni e stili delle etichette in 3D | Le etichette compaiono solo nella vista 3D, a una sola dimensione; vedi [Vedere il sito in 3D](topic:site-3d) |
| Texture da fotografie, registrazione di un percorso come video, ombre da oltre il sito, ore di sole mostrate nella vista 3D | Layer cartografici drappeggiati sulle superfici; percorrere e vedere la posizione del sole in un dato momento; [ore di sole](topic:sun-hours) per un giorno o una stagione in pianta |
