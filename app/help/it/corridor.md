---
title: Creare un corridoio stradale per sweep
summary: Attivare un corridoio per un tracciato, impostare i valori di corsia, banchina e scarpata, e leggere le sezioni, le linee di intersezione e i movimenti di terra che produce.
keywords: sopraelevazione, super, inclinazione in curva, rampa di transizione, rampa di uscita, tabella delle aliquote, pendenza trasversale, rotazione, corridoio, assieme, sottoassieme, sezione tipo, strada, corsia, banchina, pendenza trasversale, scarpata laterale, intersezione con il terreno, sterro, riporto, sezioni, obiettivo, obiettivi, obiettivo di larghezza, obiettivo di quota, obiettivo di scostamento, allargamento, margine della carreggiata, seguire un altro corridoio
from: 91303189
---

Un corridoio fa scorrere una sezione tipo semplice (un assieme) lungo un tracciato e il suo profilo di progetto, la raccorda con il terreno esistente e aggiunge il risultato alla superficie di progetto. Un tracciato può portare più corridoi su intervalli di progressive diversi, e un corridoio può essere costruito da modelli riutilizzabili per progressiva ([Modelli di corridoio](topic:corridor-templates)). L'assieme semplice qui sotto è uguale su entrambi i lati; per dare a ogni lato le sue parti, vedi [Costruire ogni lato da parti](topic:corridor#build-each-side-from-parts).

## L'assieme

Dall'asse verso l'esterno, su ogni lato:

1. una **corsia** di una data larghezza, che scende dalla cresta alla **pendenza della corsia**
2. una **banchina** di una data larghezza alla **pendenza della banchina**
3. una **scarpata laterale** dal bordo della banchina fino al punto in cui incontra il terreno: la **scarpata di sterro** dove il terreno è sopra, la **scarpata di riporto** dove è sotto

I valori di partenza sono segnaposto, non uno standard di progetto:

| Valore | Piedi US | Metri |
|---|---|---|
| Larghezza corsia | 12 ft | 3.6 m |
| Pendenza corsia | 2% | 2% |
| Larghezza banchina | 4 ft | 1.2 m |
| Pendenza banchina | 4% | 4% |
| Scarpata di sterro | 2 : 1 | 2 : 1 |
| Scarpata di riporto | 3 : 1 | 3 : 1 |
| Sezione ogni | 10 ft | 5 m |

Le pendenze delle scarpate sono orizzontali su verticali (H:V): 3 : 1 significa 3 in orizzontale per 1 in verticale.

## Costruire il corridoio

Servono un tracciato senza errori e un profilo di progetto con almeno due PVI e senza errori.

1. Selezionare il tracciato.
2. Nel pannello di destra, sotto **Corridoio**, spuntare **Creare uno sweep di un assieme lungo il profilo di progetto**. I campi compaiono e il corridoio è costruito subito. La pianta mostra i bordi di corsia e banchina e le linee di intersezione; con {{ui:Proposed (graded)}} scelto sotto **Visualizza**, le curve mostrano il nuovo terreno.
3. Cambiare un valore qualsiasi: **Larghezza corsia**, **Pendenza corsia**, **Larghezza banchina**, **Pendenza banchina**, **Scarpata di sterro**, **Scarpata di riporto**, **Sezione ogni**. Premere {{key:Enter}} dopo ciascuno. Sterro, riporto e spaziatura delle sezioni devono essere maggiori di 0.
4. Leggere la riga sotto i campi, per esempio "39 sezioni da 0+00.00 a 3+86.36; sterro 240.2 cu yd, riporto 556.0 cu yd."

Le sezioni sono tagliate a ogni passo di **Sezione ogni**, alle estremità, e all'inizio e alla fine di ogni curva orizzontale e verticale. Ogni sezione e le linee che la attraversano (asse, bordi di corsia e banchina, intersezione) diventano linee di discontinuità della superficie di progetto.

Per disattivare il corridoio, togliere la spunta. I suoi valori restano per la prossima volta.

## Quando non si costruisce

Un riquadro rosso sotto i campi dice perché:

| Messaggio | Cosa fare |
|---|---|
| "Il corridoio richiede un profilo di progetto senza errori." | Aggiungere PVI, oppure correggere le curve verticali sovrapposte (vedi [Progettare un profilo verticale](topic:profile)). |
| "Il profilo di progetto non si sovrappone al tracciato." | Spostare i PVI sull'intervallo di progressive del tracciato. |
| "Il corridoio richiede almeno due sezioni sulla superficie." | Gran parte del corridoio è fuori dal terreno esistente. |
| "4 scarpate laterali escono dalla superficie prima di incontrare il terreno." | Vicino al bordo della superficie la scarpata non può raggiungere il terreno. Tenere la strada lontana dal bordo, oppure abbassare l'altezza di riporto o di sterro in quel punto. |
| "Le linee di intersezione del corridoio si incrociano (le sezioni si sovrappongono, per esempio sulla parte interna di una curva stretta). Usare un raggio maggiore o un assieme più stretto." | Le sezioni sulla parte interna di una curva stretta si sovrappongono. Aumentare il raggio o restringere l'assieme. |

Un corridoio con un problema non viene sistemato nel terreno e non conta nei movimenti di terra.

## Corridoi e piazzali insieme

La superficie di progetto è costruita in ordine: prima ogni corridoio, poi ogni piazzale. Dove la sistemazione di un piazzale si sovrappone a un corridoio, vince il piazzale. I volumi sono calcolati dentro tutte le linee di intersezione insieme; vedi [Volumi di movimento di terra](topic:volumes).

## Sopraelevazione

In curva la strada può inclinarsi verso l'interno, così il traffico è spinto meno verso l'esterno. Spuntare **Sopraelevare le curve** sotto **Sopraelevazione** nelle **Proprietà** del tracciato:

- Ogni curva circolare prende un'aliquota **e** dalla tabella: la prima riga il cui raggio la curva raggiunge (una riga con aliquota vuota mantiene la cresta normale). La tabella e la **Pendenza relativa massima** (0.5 % all'inizio) sono segnaposto, non uno standard: impostarli secondo i propri criteri di progetto. Aggiungere o togliere righe secondo necessità.
- Le corsie ruotano attorno all'asse. Prima della curva la corsia esterna si appiana lungo la **rampa di uscita** (cresta normale ÷ e × transizione), poi lungo il **tratto di transizione** (larghezza corsia × e ÷ la pendenza) la corsia esterna continua a ruotare finché tutta la strada scende di e verso l'interno; due terzi della transizione stanno prima della curva e un terzo sulla curva. Dopo la curva accade lo stesso, al contrario.
- Una banchina sul lato basso non è mai più piatta della sua corsia; sul lato alto mantiene la propria pendenza (si ribalta).
- La tabella sotto elenca il raggio, l'aliquota, la transizione e la rampa di uscita di ogni curva, e dove inizia e finisce la sopraelevazione piena. Il **diagramma della sopraelevazione** disegna le pendenze trasversali di entrambe le corsie lungo le progressive (la corsia sinistra continua, quella destra tratteggiata).
- Una curva troppo corta per raggiungere la sopraelevazione piena, o due curve le cui transizioni si sovrappongono, viene segnalata in un riquadro sopra la tabella.

Sezioni, movimenti di terra, vista 3D e tavole mostrano tutti la strada inclinata. Ogni modifica è un passo: {{key:Mod+Z}} lo annulla.

## Obiettivi

Un obiettivo sposta un punto di un lato della strada su una linea: il **Margine della carreggiata** o il **Bordo della banchina**, sul **Sinistro** o sul **Destro**. Ogni sezione incontra la linea ad angolo retto rispetto all'asse, andando verso l'esterno solo su quel lato, così un obiettivo a destra non sposta mai il lato sinistro.

| Imposta | Cosa succede dove una sezione incontra la linea |
|---|---|
| **Larghezza** | Il punto sta sulla linea: la corsia (o la banchina) si allarga o si restringe fino ad essa, mantenendo la sua pendenza trasversale. |
| **Quota** | Il punto prende la quota della linea lì, al proprio scostamento: la pendenza trasversale della corsia (o della banchina) segue. |

La linea può essere una linea caratteristica (qualunque sia il suo **Uso**) oppure una linea di un altro corridoio: la sua mezzeria, i margini della carreggiata, i bordi della banchina o le linee di intersezione. La linea di un corridoio segue quel corridoio: cambiare l'altra strada e questa segue. CivilCraft costruisce prima l'altro corridoio; due corridoi che si puntano a vicenda in un circolo vengono rifiutati da un lato, e la tabella dice quale.

1. Selezionare il tracciato e attivare il suo corridoio.
2. Sotto **Obiettivi**, fare clic su {{ui:Add a target}}.
3. Scegliere il **Lato**, il **Punto**, cosa **Imposta** e **Alla linea**. Ogni modifica è un passo di Annulla.

**Risultato** dice in quante sezioni la linea è stata raggiunta. Le sezioni che non la raggiungono (oltre le sue estremità, o dove si trova dietro la mezzeria) mantengono i valori dell'assieme. Una linea eliminata lascia il corridoio com'era prima dell'obiettivo, e la tabella lo dice. Un lato può avere un obiettivo di larghezza e un obiettivo di quota per ogni punto.

## Costruire ogni lato da parti

Attivare **Costruire ogni lato da parti** sotto le impostazioni del corridoio. Ogni lato ha allora la propria lista, dall'asse verso l'esterno: corsie, una banchina, una cunetta, un cordolo, una striscia alberata, un marciapiede e, per ultima, la scarpata laterale fino al terreno (con le proprie aliquote di sterro e di riporto). Partire da {{ui:Rural road}} o {{ui:Urban street}}, aggiungere e togliere parti, spostarle con le frecce, e {{ui:Copy}} un lato sull'altro. Ogni modifica è un passo di Annulla.

Una pendenza trasversale è la discesa allontanandosi dalla strada, quindi un marciapiede che scarica verso la strada è negativo. Un cordolo è una faccia dell'altezza indicata, una sommità della larghezza indicata e un eventuale salto sul retro. La sopraelevazione ruota ogni corsia nella prima riga; la cunetta, il cordolo, la striscia e il marciapiede dipendono dal bordo delle corsie così come costruite. Gli obiettivi spostano ancora la fine delle corsie e l'ultima parte. Le sezioni trasversali segnano la linea di fondo della cunetta, la sommità e il retro del cordolo, e il resto. Su una curva con clotoidi la transizione è la clotoide: cresta livellata al TS, sopraelevazione piena allo SC.

## Strati della pavimentazione

Una corsia, una banchina, una cunetta, una striscia alberata o un marciapiede possono portare la propria stratigrafia: sotto la parte, {{ui:Add a course}} aggiunge uno strato con un nome, un materiale, uno spessore e il suo tipo (usura, binder, base, sottofondazione, bonifica o altro), dall'alto in basso. Gli strati non spostano la superficie della strada (la sua sommità è la superficie di progetto); ognuno giace sotto la sua parte, con la profondità misurata dritto in giù. Le sezioni trasversali disegnano la base di ogni strato come linea tratteggiata, e {{ui:Pavement courses: quantities}} elenca l'area in pianta e il volume di ogni strato (area lungo il corridoio dalle sue sezioni, volume = area × spessore). L'esportazione IFC scrive ogni strato come elemento proprio con il suo spessore e materiale (vedi [Esportazione e importazione IFC](topic:ifc)). Lo spessore che si digita è di chi lo digita: CivilCraft non dimensiona le pavimentazioni.

## Cosa non è ancora costruito

Gli obiettivi per l'intersezione con il terreno non sono ancora disponibili. Per un corridoio che cambia lungo la strada, con sinistra e destra separate, usare [Modelli di corridoio](topic:corridor-templates). Vedi [Non ancora implementato](topic:not-built-yet).
