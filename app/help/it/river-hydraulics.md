---
title: Profili del pelo libero dei fiumi
summary: Modellare un fiume dal piano di campagna e calcolare i profili del pelo libero in moto permanente con il metodo del passo standard: livelli dell'acqua, energia, velocità, numeri di Froude ed estensione dell'allagamento in pianta. Funzione sperimentale; ogni risultato richiede la revisione di un ingegnere.
keywords: argine, area di flusso inefficace, editor delle sezioni, fiume, idraulica, profilo del pelo libero, rigurgito, passo standard, moto permanente, 1d, sezioni trasversali, manning, scabrezza, capacità di deflusso, altezza critica, altezza di moto uniforme, froude, linea dell'energia, estensione dell'allagamento, golena, allagamento, sponde, lunghezze dei tronchi, contrazione, espansione, subcritico, supercritico, regime misto, risalto idraulico
from: fb8bf425
---

CivilCraft calcola profili del pelo libero stazionari e unidimensionali lungo un fiume: per ogni portata data, il livello dell'acqua in ogni sezione trasversale, dal bilancio energetico tra sezioni vicine (il metodo del passo standard). È ancora in fase sperimentale mentre viene verificata.

**Solo strumento di supporto alla progettazione.** I livelli dell'acqua richiedono la revisione di un ingegnere qualificato prima che qualcuno vi faccia affidamento: un modello 1D vale quanto le sue sezioni, i suoi valori di scabrezza, le lunghezze dei tronchi e i contorni, e non conosce ponti, tombini né il deflusso fuori dall'alveo.

## Disegnare il fiume

1. Costruire prima il terreno esistente (punti, linee di discontinuità o un TIN aperto).
2. In **Superficie** › {{ui:Altro}}, scegliere {{ui:Fiume}}.
3. Fare clic lungo la mezzeria del fiume **da monte a valle**, poi premere {{key:Enter}} o fare doppio clic.

CivilCraft taglia una sezione perpendicolare alla mezzeria ogni 50 m (200 ft), 100 m (300 ft) per lato, dal terreno. Le progressive del fiume si misurano dall'estremità di valle, quindi crescono verso monte. Le sponde partono come stima a 10 m (30 ft) per parte dal punto più basso di ogni sezione.

Per aggiungere una sezione dove il fiume si restringe o c'è un'opera, selezionare il fiume, fare clic su {{ui:Aggiungi una sezione}} e tracciare una linea di taglio attraverso di esso (in entrambi i sensi: viene orientata da sinistra a destra guardando verso valle).

## Impostare il fiume

Selezionare il fiume per vederlo in **Proprietà**:

- **Regime di flusso**: subcritico (il caso usuale: calcolato da monte a partire dalla condizione di valle), supercritico (calcolato da valle a partire dalla condizione di monte) o misto (entrambi, poi quello con la forza specifica maggiore in ogni sezione; un'anteprima).
- **Profili di portata**: un nome e una portata per ciascuno (per esempio una portata con tempo di ritorno di 10 anni e una di 100 anni), e la condizione al contorno a valle (e a monte quando il regime non è subcritico): **Altezza di moto uniforme** con una cadente (la pendenza del fondo è una prima stima), una **Quota nota del pelo libero**, oppure **Altezza critica**.
- **Sezioni dal terreno**: la spaziatura, quanto a sinistra e a destra, la stima delle sponde e i due valori di n di Manning; {{ui:Ricava di nuovo le sezioni}} sostituisce le sezioni (un passo di annullamento).
- **Tabella delle sezioni**: per ogni sezione, gli scostamenti delle sponde sinistra e destra, n dell'alveo e n della golena, le lunghezze dei tronchi fino alla sezione successiva a valle (golena sinistra, alveo, golena destra; misurate in pianta a partire) e i coefficienti di contrazione ed espansione (0.1 e 0.3 per iniziare: transizioni graduali). {{ui:Modifica}} apre l'editor delle sezioni (sotto); un punto dopo di esso indica che la sezione ha un argine o un'area inefficace.

Ogni modifica è un passo di annullamento ({{key:Mod+Z}}).

## Modificare una sezione: sponde, argini e aree inefficaci

{{ui:Modifica}} su una sezione ne disegna il terreno e permette di trascinare ciò che il risolutore legge: la **sponda sinistra e destra** (dividono la sezione in golena sinistra, alveo principale e golena destra), un **argine** su ciascun lato e le **aree di flusso inefficace**. Ogni maniglia si può anche spostare con i tasti freccia, e ogni numero si può digitare accanto al grafico. {{ui:Applica}} è un passo di annullamento.

- Un **argine** ha una posizione (scostamento) e una quota del coronamento. Il terreno oltre di esso, lontano dal fiume, è escluso dal fiume finché il pelo libero sta sotto il coronamento: la sua area, il perimetro bagnato e la capacità di deflusso sono esclusi. Sopra il coronamento tutta la sezione torna a contare. Un argine sta fuori dalla sponda che protegge; uno all'interno delle sponde viene segnalato.
- Un'**area di flusso inefficace** trattiene acqua ma non porta portata (una sacca dietro un rilevato, acqua ferma accanto all'accesso a un ponte). Indicare i suoi due scostamenti e, se si vuole, un livello dell'acqua sotto il quale è inefficace ({{ui:sempre}} se vuoto): sopra quel livello scorre come il resto. Un'area che copre parte dell'alveo principale viene segnalata.
- Tra due sezioni l'estensione dell'allagamento lascia asciutto il terreno dietro un argine comune alle due sezioni, mentre il pelo libero è sotto il coronamento (la linea tra i due coronamenti è retta).

## Calcolare e leggere i risultati

Fare clic su {{ui:Profili del pelo libero}}. Per il profilo scelto si ottiene:

- un **grafico** lungo il fiume (portata da sinistra a destra): fondo dell'alveo, sponde, pelo libero, linea dell'energia e pelo libero critico; le sezioni tenute ad altezza critica sono cerchiate;
- una **tabella** per sezione: progressiva del fiume, portata, fondo dell'alveo, pelo libero, pelo libero critico, linea dell'energia, altezza, velocità nell'alveo e complessiva, numero di Froude dell'alveo, area bagnata, larghezza al pelo, la portata in ciascuna golena e nell'alveo, la cadente, e gli avvisi;
- **avvisi** in parole semplici, per esempio una sezione impostata ad altezza critica, acqua oltre le estremità di una sezione, o una forte variazione della capacità di deflusso tra due sezioni (aggiungere sezioni in mezzo).

{{ui:Tabella (CSV)}}, {{ui:Relazione}} (testo semplice con il metodo, i contorni e ogni tabella) e {{ui:Grafico (SVG)}} salvano nei download. Ciascuno riporta la riga di revisione.

Spuntare {{ui:Mostra l'estensione dell'allagamento}} in **Proprietà** per colorare l'area bagnata in pianta per il profilo scelto, con la linea d'acqua tracciata dove la profondità è zero. Tra le sezioni il pelo libero è orizzontale attraverso il fiume e cambia linearmente con la progressiva. Il terreno dietro un argine resta asciutto mentre l'acqua è sotto il suo coronamento. Altre zone basse nel corridoio del fiume che l'acqua non può raggiungere (dietro un rilevato stradale, per esempio) sono comunque colorate: verificarle.

## Nel disegno e in Problemi

Le linee del fiume vanno in pianta, nel PDF e nel DWG nei propri layer: **C-WATR-CNTR** (la mezzeria), **C-WATR-SCTN** (ogni linea di taglio, con la sua progressiva) e **C-WATR-FLOD** (la linea d'acqua dell'estensione dell'allagamento, quando {{ui:Mostra l'estensione dell'allagamento}} è spuntato per un profilo). Gli avvisi del fiume (una sezione ad altezza critica, acqua oltre le estremità di una sezione, una variazione della capacità di deflusso che richiede altre sezioni, un bilancio energetico non chiuso, un argine all'interno delle sponde) vanno anche nel pannello **Problemi**, riferiti al fiume e posti nella sezione da cui provengono.

## Come si calcola

- Energia tra due sezioni: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Capacità di deflusso per suddivisione: ogni golena è divisa dove cambia il suo n, K = Σ (1/n)·A·R^(2/3) (1.486/n in unità statunitensi); l'alveo è un unico pezzo, con un n composito quando cambia il suo n. α deriva da come si ripartisce la capacità di deflusso.
- Cadente d'attrito con capacità di deflusso media, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², sulla lunghezza del tronco pesata sulla portata.
- Coefficiente di contrazione quando il flusso accelera verso valle, di espansione quando rallenta.
- Altezza critica = energia specifica minima. Ogni livello dell'acqua è risolto su un intervallo, quindi non passa mai dalla parte sbagliata del critico; quando non esiste una risposta è posto all'altezza critica e segnalato.

Il programma è verificato con l'altezza di moto uniforme di Manning, l'altezza critica in un canale rettangolare e l'esempio di rigurgito di Chow (*Open-Channel Hydraulics*, 1959, capitolo 10) integrato in modo indipendente. Lo stesso metodo è usato dai comuni programmi 1D per fiumi, quindi un calcolo a mano o gli appunti di uno studente sono trasferibili.

## Tombini e ponti

Nelle **Proprietà** del fiume, sotto **Tombini e ponti**, {{ui:Aggiungi un tombino}} o {{ui:Aggiungi un ponte}} ne inserisce uno tra due sezioni (ogni tronco conserva almeno due sezioni). Il profilo sotto di esso non cambia; il pelo libero appena a monte deriva dalla struttura, e il profilo prosegue a monte da lì. **Risultati** aggiunge una tabella per ogni struttura: livello di valle, livello di monte, quale controllo governa, la portata attraverso l'apertura e la portata sopra la strada o l'impalcato. Solo per il moto subcritico.

- **Tombino** (a scatolare o circolare, una o più canne uguali). Il controllo all'imbocco è di stramazzo finché l'imbocco è libero e di efflusso da orifizio una volta sommerso, miscelati tra un livello di monte di uno e uno e mezzo volte l'altezza. Il controllo all'uscita è il bilancio energetico: perdita all'imbocco, attrito e carico cinetico di uscita, sopra il maggiore tra il livello di valle e la metà altezza dell'altezza critica e la generatrice superiore, meno la caduta lungo la canna. Il livello di monte è il maggiore dei due. Spuntare **L'acqua può passare sopra la strada** e lo stramazzo della strada ripartisce la portata con le canne.
- **Ponte.** L'apertura è la sezione sotto il ponte, tagliata alle spalle, con ogni pila come un'area che non porta portata. Il pelo libero nell'apertura deriva dalla sezione a valle (coefficiente di espansione), e la sezione a monte dall'apertura (coefficiente di contrazione). Se l'apertura non può far passare la portata a quel livello di valle, scorre ad altezza critica e il ponte è segnalato come in ostruzione. Se l'acqua raggiunge l'intradosso, il flusso è in pressione (tipo a luce sotto battente finché il livello di valle è sotto l'intradosso, sommerso sopra di esso), e l'acqua sopra l'impalcato aggiunge uno stramazzo; il livello di monte è quello per cui i contributi sommati danno la portata.

I coefficienti (portata, perdita all'imbocco, stramazzo) sono valori predefiniti arrotondati. Cambiarli per il proprio progetto. Non sono le curve di progetto dei manuali sui tombini, quindi considerare il livello di monte di un tombino vicino al suo limite come una stima. L'acqua sopra una strada o un impalcato, un imbocco sommerso, un'apertura in ostruzione e una corrente veloce in una canna sono mostrati in **Problemi**.

## Moto vario

{{ui:Moto vario…}} nelle **Proprietà** del fiume instrada un idrogramma di piena lungo le sezioni. Digitare l'afflusso come ore e portate, una coppia per riga, la pendenza di valle (altezza di moto uniforme) e per quanto tempo eseguire. Parte dal pelo libero permanente alla prima portata e risolve le equazioni monodimensionali complete (lo schema implicito a quattro punti, ponderato 0.6 nel tempo). Si ottengono il livello massimo dell'acqua e la portata massima in ogni sezione con l'ora in cui ciascuna si verifica, un grafico della portata alle due estremità e la verifica dei volumi (entrata, uscita e variazione immagazzinata). Viene verificato che il moto permanente resti permanente, che un gradino dell'afflusso termini sul profilo permanente della nuova portata, che i volumi tornino e la velocità dell'onda di piena rispetto all'onda cinematica. Moto subcritico, un solo tronco, nessun afflusso laterale, né tombini né ponti durante la simulazione.

## Confluenze

Tronchi che convergono in un'unica uscita: le portate si sommano, e il pelo libero alla testa del tronco di valle è riportato fino alle estremità dei tronchi che vi confluiscono (stesso pelo libero alla confluenza, metodo semplice: nessun angolo, nessuna quantità di moto, quindi adatto a bassi numeri di Froude). Il modello e i test sono presenti (`river-structures.js`); un pannello per unire due fiumi in pianta non è ancora implementato.

## Non ancora implementato

Stramazzi e paratoie come strutture proprie, un pannello per le confluenze, strutture all'interno di una simulazione in moto vario e il moto vario supercritico. Una simulazione a regime misto segnala un risalto idraulico tra due sezioni ma non lo colloca.

**Dove confluiscono i fiumi.** Nelle Proprietà di un fiume, "Confluisce in" indica il fiume in cui sfocia. I fiumi che confluiscono sono risolti insieme: il fiume in cui sfociano porta la somma delle loro portate, e ciascuno termina al pelo libero della prima sezione di quel fiume (il metodo del pelo libero uguale; trascura l'angolo e la quantità di moto delle portate). Per unire un fiume principale e un torrente, disegnare un breve fiume sotto la confluenza e far confluire entrambi in esso. I risultati mostrano una tabella della confluenza. I valori predefiniti di questi risultati (contrazione 0.1, espansione 0.3, alveo in un unico pezzo con scabrezza composita, regime misto per forza specifica) restano finché un ingegnere non li verifica, e i Risultati lo indicano.
