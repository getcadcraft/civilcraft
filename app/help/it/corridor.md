---
title: Sweep di un corridoio stradale
summary: Attiva un corridoio per un tracciato, imposta i valori di corsia, banchina e scarpata, poi leggi le sezioni, le linee di intersezione con il terreno e i movimenti di terra che produce.
keywords: innesto, intersezione, strada che incontra strada, strada laterale, innesto a T, attraversamento, quota del piazzale, collegamento, aggancio, sopraelevazione, super, inclinazione in curva, transizione, tabella delle pendenze, pendenza trasversale, rotazione, corridoio, assieme, subassieme, sezione tipo, strada, corsia, banchina, scarpata, intersezione con il terreno, scavo, riporto, sezioni, obiettivo, obiettivi, obiettivo di larghezza, obiettivo di quota, obiettivo di offset, allargamento, margine della carreggiata, segui un altro corridoio
from: 6dcb92b3
---

Un corridoio fa scorrere una sezione tipo semplice (un assieme) lungo un tracciato e il suo profilo di progetto, la raccorda al terreno esistente e aggiunge il risultato alla superficie di progetto. Un tracciato può avere più corridoi su intervalli di progressiva diversi, e un corridoio può essere costruito da [Modelli di corridoio](topic:corridor-templates) riutilizzabili per progressiva. L'assieme semplice qui sotto è uguale su entrambi i lati; per dare a ciascun lato le proprie parti, vedi [Costruisci ogni lato da parti](topic:corridor#build-each-side-from-parts).

## L'assieme

Dall'asse verso l'esterno, su ciascun lato:

1. una **corsia** di una data larghezza, che scende dalla linea di colmo con la **pendenza della corsia**
2. una **banchina** di una data larghezza con la **pendenza della banchina**
3. una **scarpata** dal bordo della banchina fino al punto in cui incontra il terreno: la **scarpata di scavo** dove il terreno è più alto, la **scarpata di riporto** dove è più basso

I valori iniziali sono segnaposto, non uno standard di progetto:

| Valore | Piedi (USA) | Metri |
|---|---|---|
| Larghezza corsia | 12 ft | 3.6 m |
| Pendenza corsia | 2% | 2% |
| Larghezza banchina | 4 ft | 1.2 m |
| Pendenza banchina | 4% | 4% |
| Scarpata di scavo | 2 : 1 | 2 : 1 |
| Scarpata di riporto | 3 : 1 | 3 : 1 |
| Sezione ogni | 10 ft | 5 m |

Le pendenze delle scarpate sono orizzontali su verticali (O:V): 3 : 1 significa 3 in orizzontale per 1 in verticale.

## Costruisci il corridoio

Serve un tracciato senza errori e un profilo di progetto con almeno due PVI e senza errori.

1. Selezionare il tracciato.
2. Nel pannello destro, sotto **Corridoio**, spuntare **Sweep di una sezione tipo lungo il profilo di progetto**. Compaiono i campi e il corridoio viene costruito subito. La pianta mostra i bordi di corsia e banchina e le linee di intersezione con il terreno; con {{ui:Di progetto (sistemato)}} scelto sotto **Visualizzazione**, le curve di livello mostrano il nuovo terreno.
3. Modificare un valore qualsiasi: **Larghezza corsia**, **Pendenza corsia**, **Larghezza banchina**, **Pendenza banchina**, **Scarpata di scavo**, **Scarpata di riporto**, **Sezione ogni**. Premere {{key:Enter}} dopo ciascuno. Scavo, riporto e spaziatura delle sezioni devono essere maggiori di 0.
4. Leggere la riga sotto i campi, per esempio "39 sezioni da 0+00.00 a 3+86.36; scavo 240.2 cu yd, riporto 556.0 cu yd."

Le sezioni sono tagliate a ogni passo di **Sezione ogni**, alle estremità e all'inizio e alla fine di ogni curva orizzontale e verticale. Ogni sezione e le linee che la attraversano (asse, bordi di corsia e banchina, intersezione con il terreno) diventano linee di discontinuità della superficie di progetto.

Per disattivare il corridoio, togliere la spunta dalla casella. I suoi valori vengono conservati per la volta successiva.

## Quando non viene costruito

Un riquadro rosso sotto i campi indica il motivo:

| Messaggio | Cosa fare |
|---|---|
| "Il corridoio richiede un profilo di progetto senza errori." | Aggiungere PVI oppure correggere le curve verticali che si sovrappongono (vedi [Progetta un profilo longitudinale](topic:profile)). |
| "Il profilo di progetto non si sovrappone al tracciato." | Spostare i PVI nell'intervallo di progressive del tracciato. |
| "Il corridoio richiede almeno due sezioni sulla superficie." | Gran parte del corridoio è fuori dal terreno esistente. |
| "4 scarpate escono dalla superficie prima di incontrare il terreno." | Vicino al bordo della superficie la scarpata non può raggiungere il terreno. Allontanare la strada dal bordo, oppure ridurre l'altezza del riporto o dello scavo in quel punto. |
| "Le linee di intersezione con il terreno del corridoio si incrociano (le sezioni si sovrappongono, per esempio sul lato interno di una curva stretta). Usare un raggio maggiore o un assieme più stretto." | Le sezioni sul lato interno di una curva stretta si sovrappongono. Aumentare il raggio o restringere l'assieme. |

Un corridoio con un problema non viene integrato nel terreno e non entra nel computo dei movimenti di terra.

## Corridoi e piazzali insieme

La superficie di progetto viene costruita in ordine: prima tutti i corridoi, poi tutti i piazzali. Dove la sistemazione di un piazzale si sovrappone a un corridoio, prevale il piazzale. Dove un elemento successivo si sovrappone a una strada, viene sostituita solo la parte della strada entro la linea di intersezione con il terreno dell'elemento successivo; il resto della strada e le eventuali linee di discontinuità del terreno che la strada attraversa mantengono la propria forma. I volumi sono calcolati insieme entro tutte le linee di intersezione con il terreno; vedi [Volumi di movimento terra](topic:volumes).

## Sopraelevazione

In curva la strada può inclinarsi verso l'interno, così il traffico è spinto meno verso l'esterno. Spuntare **Sopraelevare le curve** sotto **Sopraelevazione** nelle **Proprietà** del tracciato:

- Ogni curva circolare prende un valore **e** di inclinazione dalla tabella: la prima riga il cui raggio è raggiunto dalla curva (una riga con il valore vuoto mantiene la bombatura normale). La tabella e la **Pendenza relativa massima** (0.5 % come punto di partenza) sono segnaposto, non uno standard: impostarli secondo i criteri di progetto propri. Aggiungere o rimuovere righe secondo necessità.
- Le corsie ruotano attorno all'asse. Prima della curva la corsia esterna si spiana lungo la **transizione iniziale** (bombatura normale ÷ e × transizione); poi, lungo la **transizione** (larghezza della corsia × e ÷ la pendenza massima), la corsia esterna continua a ruotare finché tutta la strada ha pendenza e verso l'interno. Due terzi della transizione stanno prima della curva e un terzo sulla curva. Dopo la curva avviene lo stesso in senso inverso.
- Una banchina sul lato basso non è mai più piatta della sua corsia; sul lato alto mantiene la propria pendenza (si ribalta).
- La tabella sotto elenca raggio, valore, transizione e transizione iniziale di ogni curva, e dove inizia e finisce la sopraelevazione piena. Il **diagramma della sopraelevazione** disegna le pendenze trasversali di entrambe le corsie lungo le progressive (corsia sinistra continua, destra tratteggiata).
- Una curva troppo corta per raggiungere la sopraelevazione piena, oppure due curve le cui transizioni si sovrappongono, viene segnalata in un riquadro sopra la tabella.

Sezioni, volumi, vista 3D e tavole mostrano tutti la strada inclinata. Ogni modifica è un solo passo: {{key:Mod+Z}} la annulla.

## Obiettivi

Un obiettivo sposta un punto di un lato della strada su una linea: il **Margine della carreggiata** o il **Bordo della banchina**, sul lato **Sinistro** o **Destro**. Ogni sezione incontra la linea perpendicolarmente all'asse, procedendo solo su quel lato: un obiettivo a destra non sposta mai il lato sinistro.

| Imposta | Cosa succede dove una sezione incontra la linea |
|---|---|
| **Larghezza** | Il punto si posiziona sulla linea: la corsia (o la banchina) si allarga o si restringe fino a essa, mantenendo la propria pendenza trasversale. |
| **Quota** | Il punto assume la quota della linea in quel punto, alla propria distanza (offset) dall'asse: la pendenza trasversale della corsia (o della banchina) ne segue l'andamento. |

La linea può essere una linea caratteristica (qualunque sia il suo **Uso**) oppure una linea di un altro corridoio: il suo asse, i margini della carreggiata, i bordi delle banchine o le linee di intersezione con il terreno. La linea di un corridoio segue quel corridoio: se si cambia l'altra strada, anche questa segue. CivilCraft costruisce prima l'altro corridoio; due corridoi che si puntino a vicenda in un ciclo vengono rifiutati da un lato, e la tabella indica quale.

1. Selezionare il tracciato e attivare il suo corridoio.
2. Sotto **Obiettivi**, fare clic su {{ui:Aggiungi un obiettivo}}.
3. Scegliere il **Lato**, il **Punto**, che cosa **Imposta** e **Alla linea**. Ogni modifica costituisce un solo passo di annullamento.

**Risultato** indica in quante sezioni la linea è stata raggiunta. Le sezioni che non la raggiungono (oltre le sue estremità, o dove si trova dietro l'asse) mantengono i valori dell'assieme. Una linea eliminata lascia il corridoio com'era prima dell'obiettivo, e la tabella lo indica. Un lato può avere un obiettivo di larghezza e uno di quota per ciascun punto.

## Costruisci ogni lato da parti

Attivare **Costruisci ogni lato da parti** nelle impostazioni del corridoio. Ogni lato ha allora un proprio elenco, dall'asse verso l'esterno: corsie, una banchina, una cunetta, un cordolo, una fascia verde, un marciapiede e, per ultima, la scarpata fino al terreno (con i propri rapporti di scavo e riporto). Partire da {{ui:Strada extraurbana}} o {{ui:Strada urbana}}, aggiungere e rimuovere parti, spostarle con le frecce e {{ui:Copia}} un lato sull'altro. Ogni modifica è un solo passo di annullamento.

La pendenza trasversale è la discesa che si allontana dalla strada, quindi un marciapiede che scarica verso la strada è negativo. Un cordolo è una faccia dell'altezza indicata, un piano superiore della larghezza indicata e un eventuale ribassamento sul retro. La sopraelevazione ruota tutte le corsie della prima riga; cunetta, cordolo, fascia e marciapiede dipendono dal bordo delle corsie così come costruite. Gli obiettivi spostano ancora la fine delle corsie e l'ultima parte. Le sezioni trasversali indicano il fondo della cunetta, la sommità e il retro del cordolo, e il resto. In curva con clotoidi, la transizione è la clotoide: bombatura piana al TS, sopraelevazione piena allo SC.

## Strati della pavimentazione

Una corsia, una banchina, una cunetta, una fascia verde o un marciapiede possono avere la propria stratigrafia: sotto la parte, {{ui:Aggiungi uno strato}} aggiunge uno strato con un nome, un materiale, uno spessore e il suo tipo (usura, collegamento, base, sottobase, bonifica o altro), dall'alto verso il basso. Gli strati non spostano la superficie della strada (la sua sommità è la superficie di progetto); ciascuno si trova sotto la sua parte, con la profondità misurata verticalmente. Le sezioni trasversali disegnano il fondo di ogni strato con una linea tratteggiata, e {{ui:Strati della pavimentazione: quantità}} elenca l'area in pianta e il volume di ogni strato (area lungo il corridoio dalle sue sezioni, volume = area × spessore). L'esportazione IFC scrive ogni strato come elemento proprio con il suo spessore e materiale (vedi [Esportazione e importazione IFC](topic:ifc)). Lo spessore digitato è quello indicato dall'utente: CivilCraft non dimensiona le pavimentazioni.

## Dove le strade incontrano strade, piazzali e percorsi

Con {{ui:Collega le strade e i piazzali con cui si incontra}} attivo (lo è per ogni corridoio), CivilCraft collega un corridoio a ciò che incontra in pianta:

- **Una strada che termina su un'altra strada** (la fine del suo tracciato giace sull'altra strada, o entro circa metà della larghezza della propria carreggiata dal bordo di quella strada) è la strada laterale di un innesto. La strada incontrata apre il proprio bordo per la carreggiata della strada laterale: attraverso l'imbocco, banchina, cordolo, fascia e marciapiede sono posati con la pendenza trasversale della corsia e disegnati come pavimentazione. La strada laterale è posata sulla superficie della strada principale dove le due si sovrappongono, e raccordata verso l'alto o verso il basso lungo l'avvicinamento.
- **Due strade che si incrociano** sono collegate allo stesso modo su entrambi i lati. La strada elencata per prima sotto **Tracciati** è la strada passante; l'altra segue la sua superficie attraverso l'incrocio.
- **Una strada che termina su un piazzale** (al suo interno, o entro circa metà della larghezza della carreggiata dal suo bordo) raggiunge la quota del piazzale ed è raccordata ad essa lungo l'avvicinamento.
- **Un percorso** (Paesaggio › Superfici dure) si ferma al bordo esterno di una strada, alla quota del marciapiede o della banchina in quel punto, invece di sovrapporsi alla strada. Un percorso che attraversa una strada diventa due tratti. Una fine tracciata un po' corta rispetto alla strada (entro il doppio della larghezza del percorso) viene prolungata fino al suo bordo.

Le **Proprietà** indicano che cosa ha collegato ogni corridoio, di quanto è stato alzato o abbassato in quel punto e per quale lunghezza. Tale lunghezza è il maggiore tra 10 m (30 ft) e venti volte la variazione, e non supera mai il 45% del corridoio. **Il profilo di progetto non viene modificato**: la vista del profilo mostra ancora la linea di livelletta disegnata, mentre le sezioni, la superficie di progetto, i volumi e la vista 3D mostrano la strada come collegata. Per rendere il collegamento esatto in fase di progetto, spostare l'ultimo PVI alla quota indicata nelle Proprietà.

Disattivare l'interruttore su un corridoio per lasciarlo esattamente come indicano il suo profilo e il suo assieme; in tal caso non partecipa a nessun innesto, né come strada laterale né come strada passante. Le strade che si incontrano quasi allineate (sotto circa 20°) non vengono modificate, così come le piste.

Ciò che un innesto non fa ancora: non ci sono raccordi di cordolo (gli angoli sono squadrati), né corsie di svolta o isole; la fine della strada laterale è tagliata a squadra rispetto al proprio tracciato; e un corridoio costruito da modelli apre il proprio bordo nello stesso modo semplice (un fosso o un muro nella sua condizione finale viene livellato attraverso l'imbocco, senza tombino). Per i raccordi di cordolo in pianta, i triangoli di visibilità e la segnaletica orizzontale, vedi [Terreni, strade, rilievo, miniere e collegamenti](topic:soils-roads-survey-mines-links).

## Non ancora implementato

Gli obiettivi per la scarpata fino al terreno non sono ancora disponibili. Per un corridoio che cambia lungo la strada, con sinistra e destra separate, usare [Modelli di corridoio](topic:corridor-templates). Vedi [Non ancora implementato](topic:not-built-yet).
