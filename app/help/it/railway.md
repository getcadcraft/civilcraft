---
title: Progettare un binario ferroviario
summary: Rendere un tracciato una ferrovia: curve di transizione (clotoide, parabola cubica, Bloss, Helmert, semionda sinusoidale, sinusoide), sopraelevazione di ogni curva con la sua sopraelevazione di equilibrio, insufficienza ed eccesso, limiti di sopraelevazione e di geometria del binario come avvisi, deviatoi e comunicazioni per progressiva, un inviluppo di sagoma percorso lungo la linea, e un binario con rotaie, traverse e massicciata costruito come corridoio, in pianta, sezioni, profilo, 3D e quantità.
keywords: ferrovia, rotaia, binario, metropolitana, tram, sopraelevazione, insufficienza di sopraelevazione, eccesso di sopraelevazione, sopraelevazione di equilibrio, transizione, curva di transizione, clotoide, parabola cubica, bloss, helmert, semionda sinusoidale, coseno, scartamento, scartamento normale, scartamento largo, scartamento metrico, scartamento ridotto, traversa, traversina, massicciata, sottomassicciata, piano di posa, banchina, interasse dei binari, 60E1, 54E1, UIC60, 115RE, 136RE, pendenza della sopraelevazione, variazione della sopraelevazione, deviatoio, scambio, comunicazione, cuore, numero del cuore, sviluppo, curva di chiusura, velocità di deviazione, sagoma di ingombro, sagoma limite, inviluppo cinematico, marciapiede, vuoto di marciapiede, interasse binari, pendenza, curva verticale, raggio minimo, sopraelevazione LandXML
from: 99de9745
---

Qualsiasi tracciato può diventare un binario ferroviario. Le sue curve ricevono allora le transizioni ferroviarie e una sopraelevazione (la sopraelevazione delle rotaie), e il suo corridoio viene costruito come binario: rotaie su traverse, su una massicciata, sistemate nel terreno come una strada. Deviatoi e comunicazioni si collocano sul tracciato per progressiva, e un inviluppo di sagoma può essere percorso lungo la linea e verificato rispetto a ciò che sorge accanto al binario.

Ogni numero riportato di seguito è un **valore segnaposto**, non una norma. Le ferrovie fissano i propri limiti in base alla velocità di linea, al tipo di binario e al paese: impostarli secondo la norma della propria ferrovia. CivilCraft non include alcuna tabella nazionale.

## Rendere il tracciato una ferrovia

1. Selezionare il tracciato e trovare **Ferrovia** nelle Proprietà.
2. Selezionare la casella **Questo tracciato è un binario ferroviario**. Ogni modifica è un passo di annulla.
3. Impostare la **Velocità di progetto** in cima alle Proprietà del tracciato: è la velocità di linea con cui si verifica la sopraelevazione. **Treni più lenti** (nel blocco Ferrovia) è la velocità con cui si verifica l'eccesso di sopraelevazione.

## Transizioni

Assegnare a ciascuna curva una lunghezza di spirale a entrambe le estremità nella tabella dei PI (**Spirale in entrata**, **Spirale in uscita**), poi scegliere il suo tipo nella tabella delle curve del blocco Ferrovia, oppure **Transizione per ogni curva**:

| Tipo | Curvatura lungo la transizione |
|---|---|
| Clotoide | cresce in modo uniforme (la spirale stradale) |
| Parabola cubica | y = x³ / (6·R·L), con L misurata lungo il rettifilo; la curva risulta un po' più lunga |
| Bloss | 3u² − 2u³ della curvatura completa (u = la quota della lunghezza): inizia e finisce dolcemente |
| Helmert | due parabole, 2u² e poi 1 − 2(1 − u)² |
| Semionda sinusoidale | (1 − cos πu) / 2 |
| Sinusoide | u − sin(2πu) / 2π |

Tutte tranne la parabola cubica deviano di L / 2R, come la clotoide. Le progressive seguono la lunghezza reale. LandXML conserva il tipo (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Sopraelevazione

Digitare la **Sopraelevazione** di ogni curva in millimetri. La tabella mostra per ciascuna curva:

- **Sopraelevazione di equilibrio** = G·v² / (g·R), dove G è la distanza tra gli assi delle rotaie (**Interasse rotaie**, lo scartamento più la larghezza del fungo della rotaia, salvo digitazione diversa). Con G = 1500 mm si ottiene la nota formula 11.8·V² / R (V in km/h, R in m).
- **Insufficienza** = sopraelevazione di equilibrio alla velocità di linea − sopraelevazione applicata.
- **Eccesso** = sopraelevazione applicata − sopraelevazione di equilibrio alla velocità dei treni più lenti.
- **Rampa**: la pendenza massima della sopraelevazione lungo le sue rampe, in millimetri per metro.

La sopraelevazione sale lungo ogni transizione, con la forma della sua curvatura: rettilinea per la clotoide o la parabola cubica, a forma di Bloss per Bloss, e così via. Un'estremità di curva senza transizione sale sul rettifilo che la precede, per la lunghezza richiesta dal limite di pendenza della sopraelevazione, e lo segnala: in quel caso la sopraelevazione cambia dove non cambia la curvatura.

**Ruota attorno a** indica quale rotaia resta sul profilo di progetto: **la rotaia bassa** (la scelta usuale), **la rotaia interna** oppure **l'asse del binario** (ciascuna rotaia si sposta di metà sopraelevazione). Il profilo di progetto è in quel punto il piano superiore della rotaia.

Il **Diagramma della sopraelevazione** disegna l'altezza di ciascuna rotaia sul profilo lungo le progressive; la vista del profilo e le tavole di pianta e profilo ricevono lo stesso dato come fascia sotto il profilo.

## Limiti e avvisi di sopraelevazione

**Massima sopraelevazione applicata**, **Massima insufficienza di sopraelevazione**, **Massimo eccesso di sopraelevazione**, **Pendenza massima della sopraelevazione** e **Variazione più rapida della sopraelevazione** (la pendenza alla velocità di linea, in mm/s) sono verificati su ogni curva. Un valore oltre un limite genera un avviso nel blocco Ferrovia e nel pannello Problemi, con il limite e il valore riscontrato. Senza velocità di progetto, insufficienza e variazione non vengono verificate (una nota lo indica).

## Il binario

Impostare lo **Scartamento** (predefiniti normale, largo, metrico o ridotto, oppure valore personalizzato, normalmente 1435 mm), il **Profilo della rotaia** (60E1, 54E1, 49E1, 115RE, 136RE: solo le loro dimensioni pubblicate), il numero di **Binari** e i loro **Interassi dei binari**, poi **Traverse e massicciata**: materiale delle traverse, lunghezza, larghezza, altezza e interasse; spessore della massicciata sotto la traversa (sulla rotaia bassa), banchina, scarpata, quanto la sua sommità si trova sotto le traverse; spessore del sottofondo della massicciata, la banchina oltre il piede della massicciata e la pendenza trasversale del piano di posa.

Premere **Costruisci il binario**. Il comando agisce sul corridoio del tracciato, costruito come binario lungo il profilo di progetto: rotaie e traverse si inclinano con la sopraelevazione, il piano di posa no. Le scarpate di raccordo con il terreno partono dal bordo della banchina alle scarpate di scavo e di riporto del corridoio, e il binario si raccorda alla superficie di progetto come una strada.

- **Pianta**: entrambe le rotaie di ciascun binario (layer C-RAIL-TRAK) e, con più binari, l'asse di ciascun binario (C-RAIL-CNTR), a schermo, in DXF, DWG, PDF e nelle tavole di pianta e profilo.
- **Sezioni**: le traverse, le rotaie, la base della massicciata e del sottofondo in ogni sezione.
- **3D**: le rotaie, ogni traversa e la massicciata (Mostra › Binario), anche in GLB, OBJ e USD.
- **Quantità**: lunghezza del binario, rotaie (entrambe le rotaie di ogni binario, lungo la linea propria di ciascun binario), traverse, massicciata e massicciata meno le traverse, e sottofondo, con il metodo delle aree medie tra le sezioni.

## Verifiche della geometria del binario

Oltre alla sopraelevazione, il blocco Ferrovia verifica la linea stessa rispetto a sei altri limiti (tutti segnaposto, tutti da impostare):

- **Pendenza massima** del profilo di progetto, in millimetri per metro.
- **Raggio minimo della curva verticale**, come fattore k in R ≥ k·V² (R in metri, V in km/h). Una curva verticale parabolica di lunghezza L tra due pendenze ha un raggio pari a L diviso la variazione di pendenza.
- **Curva verticale più corta**.
- **Raggio minimo di curva** in pianta (0 disattiva la verifica).
- **Arco o rettifilo più corto**, espressi in secondi di percorrenza alla velocità di linea: un arco circolare, o il rettifilo tra due curve, più corto di tale distanza genera un avviso. 1.8 s corrisponde al noto "metà della velocità in km/h, in metri".
- **Variazione dell'insufficienza di sopraelevazione** lungo ogni transizione, in mm/s alla velocità di linea.

**Geometria del binario** elenca la pendenza massima riscontrata e ogni curva verticale con il suo raggio e il raggio richiesto dalla velocità di linea. Una curva verticale che cade su una transizione o su una rampa di sopraelevazione riceve una nota. Senza profilo di progetto o senza velocità di progetto, le verifiche che ne hanno bisogno vengono saltate e una nota lo indica.

## Deviatoi e comunicazioni

In **Deviatoi e comunicazioni**, premere **Aggiungi un deviatoio**. Il deviatoio viene collocato sul rettifilo più lungo; impostarlo nella tabella:

- **Progressiva della punta dello scambio**: dove il deviatoio inizia su questo tracciato.
- **Cuore**: il numero del cuore N (1:N). L'angolo del cuore è 2·atan(1 / 2N).
- **Lato**: sinistra o destra, guardando in direzione delle progressive crescenti.
- **Interasse della comunicazione** in metri: se maggiore di 0, il deviatoio diventa una comunicazione verso un binario parallelo a quella distanza (due deviatoi e il rettifilo tra essi).

La tabella mostra lo **Sviluppo** (punta dello scambio al cuore), il **Raggio** della curva di chiusura e la **Velocità di deviazione** che quel raggio consente con il limite di insufficienza di sopraelevazione impostato e senza sopraelevazione. **Crea il suo binario** trasforma il tracciato deviato in un tracciato proprio (lo scambio, la curva di chiusura, poi dritto all'angolo del cuore) con le stesse impostazioni ferroviarie, pronto per essere allungato.

La pianta disegna i due binari deviati di ciascun deviatoio, il suo asse, un segno alla punta dello scambio e al cuore, e "1:N" (layer C-RAIL-TURN), a schermo e in DXF, DWG, PDF e tavole. La vista 3D disegna i binari deviati alla quota del binario principale.

La forma è un **segnaposto**: uno scambio rettilineo e una curva di chiusura derivata dal numero del cuore. Un deviatoio costruito segue la norma della ferrovia e il disegno del costruttore. Avvisi: un deviatoio che esce dal tracciato, che cade su una curva, una transizione, una sopraelevazione o una curva verticale, oppure che si sovrappone a un altro; e una nota quando la velocità di linea supera la sua velocità di deviazione.

## Inviluppo di sagoma

Selezionare **Percorri questo binario con un inviluppo di sagoma**. Scegliere il **Contorno** (due forme segnaposto, oppure **Contorno personalizzato** digitato come un punto per riga: distanza dall'asse del binario, poi altezza sopra il piano superiore della rotaia, in metri), la **Lunghezza del veicolo** e gli **Interassi dei carrelli** e, se presente, il **Bordo del marciapiede** (lato, distanza dall'asse del binario, altezza sopra la rotaia).

In ogni progressiva il contorno viene inclinato con la sopraelevazione attorno alla rotaia bassa e allargato dalla curva: la parte centrale del veicolo rientra di b² / 8R, le estremità escono di (L² − b²) / 8R (b gli interassi dei carrelli, L la lunghezza del veicolo, R il raggio in quel punto, seguendo la transizione). Il blocco disegna la sezione sul rettifilo e dove è più larga, ed elenca:

- l'**inviluppo più largo** e dove si trova,
- gli **interassi dei binari** confrontati con quelli richiesti da due inviluppi vicini,
- lo spazio libero al **bordo del marciapiede**, oppure di quanto il marciapiede è all'interno,
- ogni linea caratteristica, manufatto o tubazione e ogni altro tracciato ferroviario trovato **all'interno dell'inviluppo**.

Una linea caratteristica con quote viene giudicata rispetto al contorno alla sua altezza sopra la rotaia; senza profilo di progetto, o per un punto senza quota, viene giudicata solo in pianta e l'elenco lo indica. La pianta mostra i due bordi dell'inviluppo (layer C-RAIL-CLRN) con una croce su ciascun elemento all'interno.

I contorni proposti sono **segnaposto, non lo scartamento di alcuna ferrovia**. Digitare la sagoma limite della propria ferrovia prima di fare affidamento su un risultato.

## In altri programmi

- **LandXML**: un tracciato ferroviario viene scritto con le sue transizioni (spiType) e un blocco `Cant`: lo scartamento, il punto di rotazione, la velocità di linea, e una progressiva dove ogni rampa di sopraelevazione inizia e finisce, con la sopraelevazione applicata, quella di equilibrio e l'insufficienza. Aprire un file LandXML con un blocco `Cant` rende ferroviario quel tracciato con quelle sopraelevazioni.
- **IFC**: il tracciato con i suoi segmenti di sopraelevazione, le rotaie, le traverse, la massicciata e il sottofondo.

## Non ancora implementato

Deviatoi nell'esportazione IFC, famiglie di deviatoi oltre la singola curva di chiusura (scambi curvi, cuori a punta mobile, traversate, incroci), regole di sagoma cinematica (l'inviluppo è un contorno fisso con l'inclinazione in curva), linee aeree e segnalamento.

**Quale norma.** Nel blocco Ferrovia, "Norma da citare" accetta Nessuna oppure Europea (UIC ed EN). Scegliere Europea indica i documenti che un progetto europeo cita (EN 13803 per i parametri di tracciato, EN 13232 per scambi e incroci, EN 15273 per le sagome, EN 13848 per la qualità della geometria del binario) e assegna a ogni limite un campo per il punto della norma da cui deriva. Nessun numero di alcuna norma è incorporato: i limiti di sopraelevazione, insufficienza, eccesso, pendenza e variazione, la geometria dei deviatoi e la sagoma limite restano tutti segnaposto, e la finestra lo indica. Un ingegnere ferroviario verifica ogni valore sul testo della norma e digita accanto il punto di riferimento prima che qualsiasi cosa venga costruita. Le tabelle sudafricane e AREMA non sono incluse in questa versione.
