---
title: Progettazione dell'irrigazione
summary: Uno strumento di calcolo, non un progetto timbrato: irrigatori, derivazioni, linea principale, valvole e ali gocciolanti nel sito; settori ricavati dalle tubazioni; perdite di carico con Hazen–Williams, pressione critica, portata e pressione rispetto all'alimentazione, intensità di precipitazione, tempi di funzionamento, copertura e distinta base.
keywords: irrigazione, irrigatore, irrigatori, getto fisso, rotore, ugello rotante, bubbler, goccia a goccia, ala gocciolante, gocciolatore, valvola, settore, stazione, centralina, linea principale, derivazione, punto di allacciamento, alimentazione idrica, pressione, psi, kpa, portata, gpm, perdita di carico, hazen williams, intensità di precipitazione, tempo di funzionamento, copertura, da irrigatore a irrigatore, distinta base
from: 7d6342c1
---

:::warning
Questo è uno strumento di calcolo, non un progetto timbrato: un progettista di irrigazione verifica ogni risultato prima che qualsiasi cosa venga costruita.
:::

## Disposizione dell'impianto

1. Nella sezione **Irrigazione** a sinistra, scegliere l'**Irrigatore**, il suo **Arco** e da dove parte l'arco, e i diametri delle tubazioni per le derivazioni e la linea principale.
2. {{ui:Irrigation}} › {{ui:Point of connection}}: fare clic dove si collega l'alimentazione idrica. Impostarne la **pressione**, la **portata disponibile** e la perdita del contatore e della valvola di non ritorno in Proprietà.
3. {{ui:Irrigation}} › {{ui:Valve}}: fare clic dove va la valvola di ciascun settore. Una valvola avvia un settore.
4. {{ui:Irrigation}} › {{ui:Head}}: fare clic per posizionare gli irrigatori; ogni clic ne posiziona uno.
5. {{ui:Irrigation}} › {{ui:Lateral pipe}}: fare clic da una valvola attraverso i suoi irrigatori e premere {{key:Enter}}. {{ui:Mainline}}: dal punto di allacciamento a ciascuna valvola.

Le estremità delle tubazioni si agganciano agli irrigatori, alle valvole, all'alimentazione e alle altre estremità, così la rete si collega. Un settore è tutto ciò che si raggiunge dalla sua valvola lungo le derivazioni; la linea principale porta un solo settore alla volta.

## Goccia a goccia

{{ui:Irrigation}} › {{ui:Drip line}}: fare clic lungo la linea, partendo da dove è alimentata (un'estremità di derivazione o una valvola). Impostare la **portata del gocciolatore** e la **spaziatura** in Proprietà; la sua portata è quella dei gocciolatori lungo di essa.

## La verifica

{{ui:Irrigation}} › {{ui:Check the system…}} elenca ogni settore:

| Colonna | Come viene calcolata |
|---|---|
| Portata | La somma delle portate degli irrigatori (e delle ali gocciolanti) |
| Alla valvola | La pressione di esercizio dell'irrigatore critico più le perdite di carico delle tubazioni fino ad esso (Hazen–Williams, il diametro interno della tubazione, la variazione di quota) e la perdita attraverso la valvola |
| All'alimentazione | Lo stesso, più la perdita della linea principale che porta quel settore, e la perdita del contatore e della valvola di non ritorno |
| Precipitazione | La portata degli irrigatori divisa per l'area che bagnano con la spaziatura da irrigatore a irrigatore |
| Minuti a settimana | Per applicare l'impostazione **Acqua a settimana** |
| Problemi | Velocità oltre il limite, un irrigatore fuori dal suo campo di pressione, getti e rotori su una stessa valvola, pressione o portata insufficienti all'alimentazione, irrigatori fuori da ogni settore, anelli |

Selezionare una valvola per vedere i dati del suo settore e il suo irrigatore critico cerchiato sulla pianta. La distinta base conta gli irrigatori per tipo e arco, le tubazioni per diametro, le valvole, l'ala gocciolante e i gocciolatori, e le stazioni della centralina. **Salva come CSV** conserva entrambe.

Impostazioni nella sezione Irrigazione: **C di Hazen–Williams** (150 per le tubazioni in plastica nuove), la **portata massima** in una tubazione (1,5 m/s), la **perdita attraverso una valvola**, e **acqua a settimana**. Sono valori predefiniti indicati come tali.

## Copertura

{{ui:Irrigation}} › {{ui:Show coverage}} indica quanta area gli irrigatori lasciano asciutta, quanta è bagnata da due o più irrigatori, e quali irrigatori non raggiungono un vicino (spaziatura da irrigatore a irrigatore).

## Irrigatori

Gli irrigatori elencati sono tipi **generici** redatti da CadCraft a partire dalle intensità di precipitazione di progetto (getti fissi, ugelli rotanti, rotori a ingranaggi, bubbler, micro-getti, gocciolatori), non prodotti di alcun costruttore. **Aggiungi irrigatori da un file…** legge i propri irrigatori (un elenco JSON con la gittata, la portata o l'intensità di precipitazione di ciascuno, e il suo campo di pressione); vengono salvati con il progetto. I dati pubblicati di un costruttore vengono inseriti solo con il permesso registrato di quel costruttore.

Sotto gli irrigatori generici, l'elenco contiene gli **irrigatori tipici** (il loro nome termina con "valori tipici"): diametri degli ugelli di getti fissi, ugelli rotanti e rotori a ingranaggi, micro-getti, bubbler e gocciolatori, con un raggio, una portata e un campo di pressione. Sono calcolati da CadCraft a partire da formule pubblicate (l'equazione dell'orifizio per la portata, il ridimensionamento della gittata del getto per il raggio) e da classi di portata nominali, solo da fonti aperte; nessuna tabella di un costruttore è copiata. Scegliendone uno, il selettore mostra la sua base e la sua licenza. Un progetto che ne usa uno conserva l'irrigatore e la sua fonte nel file di progetto. Sono per la pianificazione: verificare i dati dell'irrigatore reale prima di costruire.
