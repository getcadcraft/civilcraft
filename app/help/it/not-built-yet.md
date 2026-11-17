---
title: Non ancora implementato
summary: Ciò che questa versione di CivilCraft non fa ancora e cosa fare invece oggi.
keywords: mancante, limitazioni, roadmap, non disponibile, spirali, allargamenti, dwg, dxf, caditoie, detenzione, sezioni trasversali, in arrivo, limiti
from: a2d970ef
---

CivilCraft è in fase iniziale. Questa pagina elenca ciò che la versione attuale non fa, perché non lo si cerchi. Nulla qui è promesso per una data.

## Punti

| Non ancora implementato | Invece, oggi |
|---|---|
| Aggiungere un secondo file di punti al primo | Unire i file in un editor di testo o in un foglio di calcolo prima |
| Esportare un file di testo dei punti | Esportare LandXML (i punti escono come CgPoints), usare {{ui:Esporta}} GIS (punti con i campi P, N, E, Z e D), oppure {{ui:Copia}} i punti in un foglio di calcolo |
| Stili di etichetta dei punti, simboli per chiave di descrizione, curve (archi) da codici di linea, un file di chiavi di descrizione da condividere tra progetti | Le etichette mostrano il numero, la quota e la descrizione, o meno ([Impostazioni di CivilCraft](topic:settings)); le chiavi sono conservate nel file di progetto |
| Conversione delle unità | Convertire il file prima di importarlo; **Unità** si limita a cambiare l'etichetta |

## Superfici

| Non ancora implementato | Invece, oggi |
|---|---|
| Più di una superficie costruita da punti | Un progetto per superficie |
| Nascondere i contorni (interni) | Usare **Bordo esterno più lungo** oppure un contorno esterno |
| Selezionare o modificare una linea di discontinuità disegnata | {{key:Mod+Z}}, oppure {{ui:Rimuovi le linee di discontinuità disegnate}} e ridisegnare |
| Modificare una superficie letta da LandXML (linee di discontinuità, contorno) | {{ui:Ricostruisci la superficie dai punti}} |
| Modificare una superficie ricavata da una griglia di quote | Importare di nuovo la griglia con altre scelte |
| Convertire una superficie letta da LandXML quando cambia il sistema di coordinate | Prima {{ui:Ricostruisci la superficie dai punti}} |
| Quote puntuali etichettate e valori di pendenza | Leggerli nella barra di stato, oppure colorare la superficie per pendenza con **Analisi delle pendenze** nell'area di lavoro Paesaggio ([Livellamento per il paesaggio](topic:landscape-grading#grading-checks)) |

## Tracciati e profili

| Non ancora implementato | Invece, oggi |
|---|---|
| Spirali diverse dalla clotoide; una spirale tra due curve (transizioni composte) | Le spirali di clotoide alle estremità di una curva sono disponibili; le altre vengono nominate e saltate nell'importazione da LandXML |
| Inserire un PI tra altri due | Ridisegnare il tracciato, oppure riscrivere le coordinate del PI |
| Tracciati da oggetti, offset, allargamenti | Disegnare con i PI |
| Digitare K per una curva verticale | Digitare L (K è mostrato) |
| Curve verticali circolari e asimmetriche | Solo curve paraboliche simmetriche |
| Più di un profilo di progetto per tracciato | Un tracciato per variante |
| Zoom sulla vista del profilo, fasce di profilo sotto il profilo | La vista del profilo si adatta all'intero tracciato; stamparla sulle [tavole di pianta e profilo](topic:plan-profile-sheets) |
| Sezioni in DWG o LandXML | Tavole delle sezioni in PDF; {{ui:CSV}} di aree e volumi |
| Linee di campionamento inclinate o di larghezze diverse lungo la strada | Una larghezza per lato per l'intero tracciato |

## Corridoi

| Non ancora implementato | Invece, oggi |
|---|---|
| Spartitraffico, barriere e una sopraelevazione che ruota le sagome | Disegnarle come sagome ([Sagome del corridoio](topic:corridor-templates)); le sagome per progressiva non tengono ancora conto della sopraelevazione |
| Un cambio graduale tra le sagome di due tratti (transizioni, rastremazioni) | Cambiare la sagoma in una progressiva, oppure assegnare a un punto un obiettivo di larghezza su una linea disegnata come rastremazione |
| Rotazione attorno a un bordo, sopraelevazione in LandXML | La sopraelevazione ruota attorno all'asse nelle curve circolari; allargare una corsia con un obiettivo di larghezza su una linea caratteristica |
| Obiettivi per le scarpate (intersezione con il terreno fino a una linea o una superficie), superfici proprie dei corridoi | Gli obiettivi spostano i bordi di carreggiata e banchine ([Corridoi](topic:corridor)); il corridoio è livellato nella superficie di progetto |
| Corridoi esportati come strade LandXML; un secondo corridoio su un tracciato nell'esportazione IFC | Viene esportata la superficie di progetto |
| Sagome del terreno che modificano la superficie di progetto, in 3D o nelle sezioni | Forniscono aree e volumi di ciascuno strato ([Sagome del terreno](topic:corridor-templates#terrain-templates)) |
| Traiettorie di ingombro con velocità, slittamento dei pneumatici, tempo di sterzata, rimorchi o ingombro della carrozzeria; una libreria di veicoli di progetto standard; una traiettoria disegnata trascinando il veicolo | Traiettorie di ingombro a bassa velocità lungo una linea caratteristica o un tracciato, con le dimensioni di veicoli propri ([Traiettorie di ingombro dei veicoli](topic:swept-paths)) |

## Livellamento e volumi

| Non ancora implementato | Invece, oggi |
|---|---|
| Gradini, linee caratteristiche aperte livellate nel progetto, livellamento fino a una linea caratteristica di altrove | Chiudere la linea caratteristica ([Linee caratteristiche](topic:feature-lines)), oppure usarla come linea di discontinuità del terreno esistente |
| Inserire o rimuovere un vertice di una linea caratteristica | Ridisegnare la linea, oppure farne un offset a gradini |
| Archi nelle linee di discontinuità disegnate (passanti per i punti di rilievo), spirali nelle linee caratteristiche | Disegnare una linea caratteristica con archi e usarla come linea di discontinuità del terreno esistente |
| Livellamento fino a una distanza, a una quota o a un'altra superficie | Scarpate solo fino al terreno esistente |
| Aggiungere o rimuovere un angolo di piazzale | Eliminare il piazzale e ridisegnarlo |
| Volumi TIN-a-TIN (prismi), scelta della dimensione della cella della griglia | Metodo a griglia, con dimensione della cella scelta automaticamente |
| Rigonfiamento e ritiro, terreno vegetale, spessori della pavimentazione | Applicare i fattori ai valori riportati manualmente |
| Costi di trasporto libero e di trasporto oltre la distanza, trasporto tra tracciati diversi, cave di prestito e discariche collocate sulla pianta | Il diagramma delle masse con punti di compensazione, volumi movimentati e distanze medie di trasporto |

## Reti di tubazioni

| Non ancora implementato | Invece, oggi |
|---|---|
| Più di una rete per progetto | Progetti separati per acque meteoriche e acque nere |
| Condotte idriche: qualità e età dell'acqua, controlli basati su regole, altri tipi di valvola (di regolazione del flusso, di strozzamento, di mantenimento), pompe definite dalla potenza, domanda che dipende dalla pressione, un'opzione Darcy–Weisbach, un catalogo di tubi con spessori e classi di pressione. Il resto delle reti in pressione è in fase di sperimentazione: [Condotte idriche](topic:water-mains) | Verificare con un software di distribuzione idrica; le portate di progetto delle fognature sono in [Portate di progetto delle acque nere](topic:sanitary-design) |
| Portate di fognatura nel tempo (idrogrammi, propagazione dinamica, invasi, pompe, sfioratori) | [Portate di progetto delle acque nere](topic:sanitary-design) fornisce la portata di punta costante usata da un foglio di progetto |
| Capacità delle caditoie, espansione della cunetta, propagazione in invaso, idrogrammi, perdite di energia diverse da un unico coefficiente di confluenza | Verificarle in altro software; portate, dimensioni e linee piezometriche sono in [Drenaggio delle acque meteoriche](topic:storm-drainage) |
| Bacini scolanti nella stampa PDF, DWG, DXF o LandXML; bacini scolanti dalla superficie (spartiacque) | Disegnare i bacini a mano; sono salvati nel file di progetto |
| Cataloghi di tubi, tubi non circolari, manufatti che non sono scatole o cilindri verticali (coni, gradini, banchine), una categoria di drenaggio nella libreria | Tipi di manufatto da parametri ([Rete di tubazioni](topic:pipe-network)); tubi con un diametro |
| Tubi nella vista del profilo, tubi curvi | Leggere le quote di fondo e la copertura nel pannello destro |

## Particelle

| Non ancora implementato | Invece, oggi |
|---|---|
| Tracciamento di lotti per area o fronte, particelle dalle linee che le circondano, diritto di passaggio | Disegnare ogni particella dai suoi vertici, oppure inserire le sue chiamate |
| Tabelle delle curve e tabelle delle linee sulla pianta; etichette spostate a mano | Ogni tratto è etichettato lungo se stesso |
| Particelle in LandXML | Le particelle sono salvate nel file di progetto e vanno in PDF, DWG e DXF |

## Poligonali

| Non ancora implementato | Invece, oggi |
|---|---|
| Compensazione ai minimi quadrati, regola del transito, pesatura degli angoli rispetto alle distanze | La compensazione con la regola di Bowditch |
| Angoli di deviazione, angoli zenitali e distanze inclinate, quote per livellazione trigonometrica | Ridurre correttamente alle distanze e agli angoli orizzontali, oppure alle direzioni |
| Battute laterali, file di dati grezzi dai registratori di campagna | Importare i punti come file di punti |

## Picchettamento

| Non ancora implementato | Invece, oggi |
|---|---|
| Picchetti di offset (punti di riferimento arretrati dal picchetto), picchetti di scarpata al punto di intersezione | Picchettare agli offset necessari, anche oltre la banchina |
| Invio dei picchetti direttamente nel formato proprio di un registratore di campagna | Il CSV si apre nel software d'ufficio della maggior parte dei registratori di campagna |
| Picchettamento di tubi, piazzali e particelle | Usare i punti di rilievo vicini a un tracciato, oppure i tratti della particella |

## File e output

| Non ancora implementato | Invece, oggi |
|---|---|
| Testi, tratteggi e quote da DWG o DXF; spazio carta; disegni collegati (xref); DXF binario | Si aprono le linee dello spazio modello ([Aprire un DWG o DXF come linee](topic:open-dwg-dxf)); aprire i disegni collegati separatamente |
| Spostare più punti in una volta sola trascinandoli | Tagliare e incollarli, oppure modificarli uno alla volta |
| Tavole in verticale, cartigli propri, viewport disposte a piacere, tavole di pianta e profilo in DWG | Una tavola di pianta orizzontale per PDF, oppure tavole di pianta e profilo lungo un tracciato (PDF) |
| Stampa di fasce di quota e profili | Le fasce sono solo a video; fare uno screenshot se servono |
| Modificare nomi, colori o stili di etichetta dei layer | Cambiarli in un programma CAD dopo l'esportazione DXF |
| Salvataggio in cloud e cronologia delle versioni | Salvare i file `.civilcraft.json` e mantenerne il backup; per lavorare insieme su un progetto, usare una sessione live in CadCraft Studio ([Progettare insieme un sito, in tempo reale](topic:work-live)) |
| CadCraft Studio per iPad e iPhone, e da Google Play | Usare CivilCraft nel browser del dispositivo; su Android, CadCraft Studio si installa dal suo APK su getcadcraft.com/download |
| Apertura di più file di punti o di progetto insieme | Un file per volta (i file GIS che appartengono insieme, come le parti di uno shapefile, si aprono insieme) |

## Paesaggio

| Non ancora implementato | Invece, oggi |
|---|---|
| Testate e ugelli dei produttori | Testate e ugelli generici, oppure aggiungere le proprie da un file; i dati dei produttori vengono inseriti quando danno il permesso |
| Lunghezze laterali massime per le linee di gocciolamento, portate nel tempo, pompe, reti di tubazioni ad anello | Mantenere i tratti a goccia entro la lunghezza pubblicata dal produttore; la verifica richiede una rete ramificata |
| Il contorno esatto di un oggetto a forma libera concavo; il suo volume sotto terra misurato con esattezza | L'inviluppo convesso viene livellato e il volume sotto terra è una stima (indicato nelle Proprietà) |
| Piante nel proprio Posiziona dalla libreria di BimCraft e ModelCraft | Esportare il paesaggio in IFC e aprirlo in BimCraft accanto all'edificio |
| Modelli dettagliati di piante (foglie, rami, stagioni) nella vista 3D; oggetti a forma libera e irrigazione nella vista 3D | Le piante si vedono in 3D come forme semplici dimensionate dall'elenco delle piante ([Vedere il sito in 3D](topic:site-3d)); lo scatter di ModelCraft realizza immagini di piantumazione |
| Muri di hardscape che trattengono un livello livellato alle loro spalle sulla superficie | Dare a una piattaforma o un piazzale lati verticali: sono muri di sostegno sulla superficie ([Livellamento](topic:grading)) |
| Trasformazioni SVG nei propri simboli; texture e colori dei propri modelli GLB di piante; geometria GLB compressa | Applicare le trasformazioni nel programma di disegno prima; i modelli sono disegnati con il colore della pianta; esportare il GLB senza compressione ([Grafica delle piante](topic:plant-graphics)) |
| Il proprio elenco di piante conservato nell'account della Libreria (modificato nell'app) | Modificare l'elenco del progetto nella tabella delle piante e salvarlo come file piante |
| Gli strumenti di paesaggio per gli assistenti senza la finestra (il server di file e la riga di comando) | Funzionano con la finestra di CivilCraft aperta ([Far lavorare un assistente IA sul proprio sito](topic:assistants)) |

## Linee elettriche

| Non ancora implementato | Invece, oggi |
|---|---|
| Una norma nazionale integrata (ipotesi di carico, distanze, fattori) | Impostare i valori della propria norma in {{ui:Ipotesi di carico e limiti…}} e salvarli, con la propria libreria, come pacchetto da riutilizzare e condividere ([Pacchetti](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| La distanza laterale da un conduttore alla chioma di un albero o a un muro accanto alla linea | La distanza verticale libera sopra piante e muri che la linea attraversa ([Verifiche della linea elettrica](topic:power-line-checks#clearances)) |
| Scorrimento del conduttore e allungamento di un conduttore nuovo | Tenerne conto attraverso le temperature nella tabella di tesatura |
| Portata termica dei cavi interrati (portata di corrente in base alla posa) | Inserire la portata di corrente del fornitore nell'elemento cavo |
| Studi di cortocircuito, protezione e messa a terra | Usare un programma elettrico dedicato; CivilCraft fornisce le lunghezze della rete e dei cavi |
| Tralicci reticolari progettati asta per asta, e ancoraggi dei tiranti nel terreno | I sostegni sono verificati con il loro carico nominale; i tiranti con il loro carico di esercizio |
| Un file di studio `.DON` verificato nel programma che lo legge | Verificare il file lì; inviarci un campione per testare su uno reale |
| Linee elettriche nella vista 3D e in IFC | La pianta, il profilo della linea, le tavole e i livelli GIS |
| Gli strumenti per le linee elettriche per gli assistenti senza la finestra | Funzionano con la finestra di CivilCraft aperta ([Far lavorare un assistente IA sul proprio sito](topic:assistants)) |

## Volumi edilizi

| Non ancora implementato | Invece, oggi |
|---|---|
| Una libreria di norme urbanistiche o le regole di una città | Inserire i limiti dal proprio regolamento ([Limiti urbanistici](topic:zoning-limits)) |
| Luce del cielo sulle pareti (luce diurna della facciata), vento | [Ore di sole](topic:sun-hours) conta solo il sole diretto |
| Ombra di alberi, piante o qualsiasi cosa non disegnata come volume | Disegnare gli edifici vicini come volumi |
| Forme di copertura sui volumi | Volumi con copertura piana |
| Aperture, coperture e tipi di muro quando un volume è sviluppato in BimCraft | BimCraft costruisce muri esterni semplici su ogni livello e un solaio; aggiungere il resto lì |

## GIS e sistemi di coordinate

| Non ancora implementato | Invece, oggi |
|---|---|
| File Geodatabase; stili KML, icone, sovrapposizioni al suolo e collegamenti di rete | Convertire prima in GeoPackage, shapefile o GeoJSON; i segnaposto KML vengono letti senza i loro stili |
| Modifica degli elementi GIS o dei loro attributi | Modificarli in un programma GIS e importare di nuovo. Il pannello Analizza crea nuovi livelli (buffer, sovrapposizione, unione, selezione) e aggiunge campi di area e lunghezza, ma non modifica un elemento sul posto |
| Analisi di rete e raster, buffer con estremità piatte o quadrate e buffer unilaterali, aggiunta o eliminazione di righe e modifica del tipo di un campo nella tabella degli attributi, colori di classe manuali, una legenda di stile nelle stampe | Usare {{ui:Seleziona}} per scegliere gli elementi e creare un livello da essi; le estremità piatte non sono offerte. La colorazione per attributo e la tabella degli attributi sono realizzate: vedere [Stilizzare un livello per attributo](topic:gis-symbology) e [Lavorare con la tabella degli attributi di un livello](topic:gis-table) |
| Stili di etichetta (dimensione, posizionamento) ed etichette che si evitano a vicenda | Le etichette hanno una sola dimensione e possono sovrapporsi dove gli elementi sono fitti |
| Datum verticali e modelli del geoide | Le quote sono usate come le fornisce il file; verificare il datum verticale da sé |
| Spostamenti di griglia diversi da NAD27 verso NAD83 suggeriti per area (OSTN15; NTv2 per altri datum funziona quando si aggiunge il file), più griglie insieme, griglie verticali | Aggiungere il file della griglia per il proprio datum; una griglia per progetto |
| Livelli cartografici nelle esportazioni DXF o 3D | I livelli cartografici vanno nella stampa PDF, e accanto al DWG come immagine |
| Server cartografici che richiedono accesso, chiave o token | Usare servizi pubblici, oppure un file immagine georeferenziato |
| Scrittura di file LAS o LAZ da una superficie, dal modello del terreno o dagli strumenti di griglia di quote e LiDAR | Esportare le superfici come griglia di quote GeoTIFF. L'add-on [Nuvole di punti](topic:point-clouds) scrive una nuvola ripulita come LAS 1.4 o LAZ |
| Intensità, colore e ritorni LiDAR; griglie di quote con più bande; file di griglia o LiDAR oltre 200 MB | Il LiDAR è filtrato solo per classe, le griglie usano la prima banda; tagliare prima i file grandi in riquadri |

## Input

| Non ancora implementato | Invece, oggi |
|---|---|
| Selezione a riquadro al tocco (richiede {{key:Shift}}) | Tenere premuto su ogni punto di rilievo per aggiungerlo |
| Coordinate o distanze digitate durante il disegno | Disegnare a grandi linee, poi digitare le coordinate esatte dei PI nella tabella dei PI del tracciato |
| Digitazione di coordinate per gli angoli dei piazzali e i manufatti | Trascinare i loro grip; ingrandire per la precisione e controllare E e N nella barra di stato |
| Aggancio agli oggetti (diverso dai punti di rilievo per le linee di discontinuità) | Ingrandire e controllare la barra di stato |

## Vista 3D

| Non ancora implementato | Invece, oggi |
|---|---|
| Disegno o modifica nella vista 3D | Disegnare e modificare nella pianta; la vista 3D segue ogni modifica |
| Selezione di linee caratteristiche del corridoio o elementi GIS cliccando in 3D | Cliccarli nella pianta |
| Esportazione della vista esagerata o in piedi | Le esportazioni sono in scala reale in metri; vedere [Esportare il sito in 3D](topic:export-3d) |
| Etichette nelle esportazioni GLB o OBJ, dimensioni e stili delle etichette in 3D | Le etichette compaiono solo nella vista 3D, con una dimensione; vedere [Vedere il sito in 3D](topic:site-3d) |
| Texture da foto, registrazione di un percorso come video, ombre da oltre il sito, ore di sole mostrate nella vista 3D | Livelli cartografici drappeggiati sulle superfici; percorrere il progetto e la posizione del sole in un dato momento; [ore di sole](topic:sun-hours) per un giorno o una stagione nella pianta |
