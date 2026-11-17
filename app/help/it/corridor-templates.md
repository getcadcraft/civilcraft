---
title: Modelli di corridoio e modelli di terreno
summary: Creare piccoli modelli riutilizzabili (cordolo e canaletta, marciapiede, muro, fosso), costruire un corridoio da essi per progressiva con sinistra e destra separate, dividere un tracciato in più corridoi, e distendere materiali a strati su un terreno.
keywords: modello, modelli, libreria di modelli, creazione di modelli, sezione tipo, assieme, sottoassieme, componenti, codici di punto, condizione finale, intersezione con il terreno, fosso, muro di sostegno, cordolo, canaletta, marciapiede, regioni, intervallo di progressive, più corridoi, sinistra e destra, modello di terreno, terreno vegetale, pavimentazione, base, distendere, materiali, quantità
from: ce70e58b
---

Un **modello** è una piccola sezione trasversale che si disegna una sola volta e si riusa: punti con scostamenti, pendenze e codici di punto, e componenti con materiali. Un corridoio può essere costruito da modelli per progressiva, con ogni lato che ha i propri modelli di pavimentazione e la propria condizione finale, e gli stessi modelli possono essere distesi su un terreno.

:::warning
I modelli di esempio sono segnaposto da cui partire. I loro numeri non sono presi da alcuna norma o ente. Un ingegnere deve verificare ogni modello, e ogni valore che gli si assegna, prima di usarlo per un progetto.
:::

## Aprire i modelli

Aprire {{ui:Surface}} › {{ui:More}} › {{ui:Corridor templates…}} (oppure digitare {{cmd:TEMPLATES}}). La finestra ha tre elenchi:

- **In questo progetto**: i modelli che usano i corridoi e i modelli di terreno di questo progetto. Sono salvati nel file di progetto.
- **Mia libreria**: modelli conservati in questo browser e offerti in ogni progetto. Usare {{ui:Save to My library}} su un modello di progetto per conservarlo.
- **Esempi**: due corsie con strati, cordolo e canaletta, marciapiede, intersezione con il terreno, fosso, muro di sostegno, terreno vegetale sotto il terreno, e pavimentazione sul terreno. Ognuno è contrassegnato come "Da verificare da un ingegnere".

{{ui:Use in this project}} copia un modello della libreria o di esempio nel progetto. {{ui:Export this project's templates}} li salva come file `.cctemplates.json`, e {{ui:Import a file}} ne legge uno nel progetto e in Mia libreria. Usare il file per condividere modelli o trasferirli su un altro computer.

## Creare un modello

{{ui:New template}} (o {{ui:Edit}} su un modello di progetto) apre l'editor dei modelli. Disegnare il lato destro, verso l'esterno a partire dal punto 0,0 del modello; il lato sinistro usa lo stesso modello verso l'esterno a sinistra.

1. Dargli un nome e un tipo: **Pavimentazione** (il modello successivo si attacca alla sua fine), **Condizione finale** (incontra il terreno) o **Modello di terreno**.
2. Aggiungere **valori**: numeri con nome, come una larghezza `w` o una pendenza `s`. Una casella numerica ovunque nel modello accetta un numero o il nome di un valore; `-t` è il valore `t` reso negativo. Un corridoio può dare a ogni uso del modello i propri valori, così un solo modello di cordolo serve ogni altezza di cordolo.
3. Aggiungere **punti** in ordine. Ognuno è collocato a partire da un punto precedente (o dal punto 0,0) secondo il suo vincolo:

| Vincolo | Colloca il punto |
|---|---|
| Scostamento con pendenza | uno scostamento verso l'esterno e una pendenza (dislivello per tratto orizzontale; −0.02 scende del 2%) |
| Scostamento e dislivello | uno scostamento e un dislivello |
| Dritto in su o in giù | solo un dislivello |
| Scarpata laterale fino al terreno | verso l'esterno dal suo punto fino al terreno, al rapporto di sterro dove il terreno è sopra e al rapporto di riporto dove è sotto |
| Fino al terreno | uno scostamento, poi dritto in su o in giù fino al terreno |
| Muro di sostegno | un muro dello spessore indicato: in sterro la sua sommità incontra il terreno al bordo della strada; in riporto la strada passa sopra di esso e la sua faccia esterna scende fino al terreno |

   Spuntare **Superiore** per i punti che la superficie finita attraversa. L'ultimo punto superiore è dove inizia il modello successivo su quel lato. Un **Obiettivo** permette a un corridoio di spostare il punto: il suo scostamento o la sua quota vengono da una linea.

4. Aggiungere **componenti**: forme chiuse attraverso codici di punto (`0` è il punto 0,0), ciascuna con un nome, un materiale e un tipo. Le loro aree danno i volumi.

Il disegno segue ogni modifica in scala reale, e l'elenco sotto dice cosa non va (un punto che incontra il terreno prima della fine, un valore che il modello non ha, un componente senza area). {{ui:Add to this project}} o {{ui:Save}} lo conserva, come un solo passo di Annulla.

## Costruire un corridoio da modelli

Selezionare un tracciato con un corridoio e, nelle sue Proprietà, attivare {{ui:Build from templates by station}}. Il corridoio parte con gli esempi di due corsie e di intersezione con il terreno su entrambi i lati.

- **Regioni.** Ogni regione inizia a una progressiva e arriva fino a quella della regione successiva. {{ui:Add a region}} ne aggiunge una; cambiare la sua progressiva di inizio nella sua casella.
- **Sinistra e destra separate.** Ogni lato di ogni regione ha una propria lista di **Pavimentazione**, dall'asse verso l'esterno, e la propria **Condizione finale**: intersezione con il terreno, un fosso, un muro, o un modello qualsiasi che incontri il terreno. Senza condizione finale il lato si raccorda alle scarpate di sterro e di riporto del corridoio. {{ui:Copy left to right}} copia un lato.
- **Valori e obiettivi.** Sotto ogni modello su un lato, una casella per valore (vuota = il valore del modello) e, per un punto che accetta un obiettivo, la linea caratteristica o la linea di un altro corridoio che lo sposta.
- **Da e A** limitano il corridoio a una parte del tracciato.

Le sezioni, le linee in pianta per ogni codice di punto, la superficie di progetto, il picchettamento e i movimenti di terra seguono tutti. Le Proprietà elencano il volume di ogni componente per lato e per regione (aree medie d'estremità lungo la mezzeria). La sopraelevazione e gli obiettivi di bordo del corridoio non vengono usati mentre il corridoio è costruito da modelli.

## Più corridoi su un tracciato

Sotto **Corridoi su questo tracciato**, {{ui:Add a corridor}} aggiunge un corridoio sul resto del tracciato: il primo corridoio riceve una progressiva finale a metà (oppure mantiene la propria), e il nuovo inizia lì con l'ultima regione di modelli del primo. Ogni corridoio ha il proprio nome, intervallo di progressive, modelli e movimenti di terra. Disattivarne uno con la sua casella {{ui:On}}. Dove due intervalli si sovrappongono, il corridoio successivo sistema il terreno sopra il precedente.

## Modelli di terreno

Un modello di terreno distende gli strati di un modello su un terreno a partire dal suo punto 0,0: uno strato sotto il punto 0,0 entra nel terreno (terreno vegetale da asportare), uno strato sopra vi si appoggia (base e pavimentazione su un parcheggio). Larghezze e pendenze non contano; conta solo la profondità di ciascun componente sopra o sotto il punto 0,0.

Aprire {{ui:Surface}} › {{ui:More}} › {{ui:Terrain templates…}} (oppure digitare {{cmd:TERRAINTEMPLATES}}); il blocco è anche nelle Proprietà del progetto. {{ui:Add a terrain template}} ne aggiunge uno con l'esempio di terreno vegetale. Per ognuno scegliere:

- il **modello** (i suoi valori possono essere cambiati per questo caso),
- il **terreno**: il terreno esistente o la superficie di progetto,
- la **forma** che lo ritaglia: tutto il terreno, una particella, un piazzale o una linea caratteristica chiusa. Più modelli di terreno possono usare forme diverse sullo stesso terreno.

Ogni strato elenca il suo spessore, l'area in pianta e il volume. Il volume è l'area in pianta per lo spessore, misurato dritto in giù; l'area è misurata su una griglia, e viene data anche l'area distesa (inclinata). Le forme sono disegnate in pianta sul layer C-TOPO-TMPL. I modelli di terreno non modificano la superficie di progetto.

## Materiali e quantità

Il blocco Movimenti di terra del progetto elenca i **Materiali dai modelli**: ogni componente del corridoio e ogni strato di modello di terreno con il suo volume. {{ui:Send to TakeoffCraft}} li scrive nel file delle quantità dopo sterro e riporto, una voce per ciascuno, in yard cubi (progetti in piedi) o metri cubi.

## File

I modelli, le regioni, i corridoi extra e i modelli di terreno vengono salvati nel file di progetto. Un progetto che non ne usa nessuno viene salvato esattamente come prima, e le versioni più vecchie di CivilCraft aprono un progetto che li usa (ignorano i modelli e costruiscono la sezione tipo propria del corridoio).
