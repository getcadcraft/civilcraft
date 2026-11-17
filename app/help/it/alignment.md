---
title: Disegnare un tracciato orizzontale
summary: Disegna un tracciato con i suoi PI, imposta i raggi delle curve e la progressiva iniziale, sposta i PI e leggi i dati delle curve, la progressiva e l'offset.
keywords: tracciato, nessuna soluzione, curva non entra, raggio massimo, raggio minimo, raggio minimo di progetto, velocità di progetto, sovrapposizione, mezzeria, pi, curva orizzontale, raggio, progressive, rettifilo, crea tracciato, impostazione tracciato, pc, pt, progressiva offset
from: 8c5df4aa
---

Un tracciato in CivilCraft è una catena di rettifili che passano per i punti di intersezione (PI), con una curva circolare in ogni PI interno che ha un raggio. È posto a progressive a partire da una progressiva iniziale scelta. Un progetto può contenere molti tracciati.

## Disegnare il tracciato

1. Premere {{key:A}}, oppure fare clic su {{ui:Tracciato}} nel gruppo **Progetto**.
   Il suggerimento dice "Tracciato: fare clic sui PI in ordine. Invio o doppio clic termina, Backspace elimina l'ultimo, Esc annulla."
2. Fare clic sul primo PI (l'inizio del tracciato).
3. Fare clic su ciascun PI successivo, in ordine. Una linea rossa segue il puntatore e mostra la lunghezza e la direzione del rettifilo che si sta disegnando, per esempio "212.40 ft  N 63°12'05" E".
4. Fare clic sull'ultimo PI (la fine del tracciato).
5. Premere {{key:Enter}}.
   Il tracciato viene disegnato con le progressive ed è selezionato. La barra di stato indica, per esempio, "Tracciato 1: 386.36 ft, curve di raggio 100 ft dove entrano. Modificare i raggi in Proprietà; Profilo (R) per progettarne la pendenza."

Durante il disegno: {{key:Backspace}} rimuove l'ultimo PI, {{key:Esc}} annulla, e trascinare su uno spazio vuoto sposta la vista senza aggiungere un PI.

:::warning
Terminare con {{key:Enter}}. Anche il doppio clic termina, ma in questa versione elimina il PI su cui si è fatto doppio clic. Fare clic una sola volta sull'ultimo PI, poi premere {{key:Enter}}.
:::

Ogni PI interno riceve una curva di 100 ft (30 m in un progetto in metri), oppure il raggio intero più grande che entra nella metà di ogni rettifilo, se 100 ft non entrano. I PI molto acuti o in linea retta non ricevono alcuna curva.

## Impostare raggi e coordinate

Con il tracciato selezionato, il pannello destro mostra **Tracciato**:

1. **Nome** e **Progressiva iniziale**. Digitare una progressiva come `10+00` (piedi) o `0+500` (metri), oppure come numero semplice. Vedi [Unità, progressive e formati dei numeri](topic:units-and-stations).
2. **Lunghezza** e **Progressiva finale** sono calcolate automaticamente.
3. La tabella **PI** elenca **Est** e **Nord** di ogni PI e un **Raggio** per ogni PI interno. Digitare un nuovo valore e premere {{key:Enter}}.
   - Un raggio di 0 crea un vertice angolare senza curva.
   - Il primo e l'ultimo PI non hanno mai un raggio.
   - La piccola x alla fine di una riga rimuove quel PI (un tracciato mantiene almeno due PI).
4. Leggere l'elenco **Curve**: per ogni curva, le progressive di PC e PT, il raggio R, la deflessione Δ e il verso (sinistra o destra), la lunghezza L, la tangente T, la distanza esterna E e la corda.
5. La riga sotto le curve indica la direzione del primo rettifilo.

## Quando una curva non entra

Se le curve richiedono più rettifilo di quanto ce ne sia tra i rispettivi PI, il tracciato non ha soluzione: non viene disegnato correttamente finché non si correggono, ed è escluso dalle esportazioni LandXML. Un riquadro rosso spiega il motivo, con i numeri, e propone ciò che entrerebbe:

- "Le curve al PI 2 e al PI 3 richiedono 240.00 ft di rettifilo tra loro (130.00 + 110.00), ma i PI distano 180.00 ft." — oppure, quando solo una delle due ha una curva, "La curva al PI 2 richiede 240.00 ft di rettifilo verso il PI 1 …".
- Un pulsante per ogni PI imposta **il raggio massimo che entra** in quel punto, lasciando invariata l'altra curva (deve entrare anche nell'altro rettifilo del PI). Quando entrambi i PI hanno una curva, **Entrambi** riduce i due raggi in proporzione, in modo che si tocchino appena.
- Quando una sola curva è più lunga del rettifilo, il riquadro segnala che nessuna curva all'altro PI può entrare finché è così grande.
- Un PI che torna indietro di colpo non può avere una curva; il riquadro propone **Nessuna curva al PI n**.

Ogni pulsante è un solo passo: {{key:Mod+Z}} ripristina i raggi. I raggi proposti sono arrotondati per difetto a 0.01, così entrano sempre.

### Un raggio minimo di progetto

Digitare un **Raggio minimo di progetto** (per esempio ricavato dalla velocità di progetto) per far verificare ogni curva; lasciarlo vuoto per non verificare nulla. Una curva inferiore è elencata con un pulsante per **il raggio più piccolo che rispetta il minimo**, quando quel raggio entra. Quando non entra, il riquadro lo dice e indica il raggio massimo consentito dai rettifili, così si sa che occorre spostare un PI o abbassare il minimo.

## Spostare i PI sulla pianta

1. Con {{ui:Seleziona}} attivo, fare clic sul tracciato per selezionarlo. Compaiono maniglie quadrate sui suoi PI.
2. Trascinare una maniglia. Il tracciato, le sue progressive, il profilo e il corridoio seguono.
3. Rilasciare. Lo spostamento è un solo passo di annullamento.

Aggiungere un PI tra due esistenti non è ancora disponibile: eliminare il tracciato e disegnarlo di nuovo, oppure digitare le nuove coordinate dei PI esistenti.

## Leggere progressiva e offset

Spostare il puntatore sulla pianta. La barra di stato mostra il tracciato più vicino (o quello selezionato) con la progressiva e l'offset, **L** o **R** guardando verso le progressive crescenti, per esempio "Tracciato 1: Prog. 2+15.30, offset 18.42 R". Oltre una delle estremità aggiunge "(oltre la fine)".

## Cosa viene disegnato

Sulla pianta, in DXF e in PDF: la mezzeria (rettifili come linee, curve come veri archi), una tacca ogni 50 ft (20 m) con una tacca più lunga e un'etichetta di progressiva ogni 100 unità, e le tacche PC e PT etichettate con le rispettive progressive.

## Eliminare un tracciato

Selezionarlo e premere {{key:Delete}}, oppure fare clic su {{ui:Elimina}} nella barra degli strumenti o in fondo al pannello destro. Il suo profilo e il suo corridoio vengono eliminati con esso. {{key:Mod+Z}} lo riporta.

:::mac
Su una tastiera Mac, il tasto etichettato **delete** corrisponde a {{key:Backspace}} nel browser e non elimina una selezione. Premere {{key:Delete}} (Fn e delete), oppure usare il pulsante {{ui:Elimina}}.
:::

## Successivo

- [Progettare un profilo verticale](topic:profile).

## Velocità e classe di progetto

Nelle Proprietà del tracciato, **Velocità di progetto** (km/h o mph) e **Classe di progetto** sono mantenute con il tracciato, salvate nel progetto e scritte nell'IFC (Pset_RoadDesignCriteriaCommon). CivilCraft non ha una tabella che collega una velocità a un raggio minimo, quindi da questi valori non si verifica nulla: impostare **Raggio minimo** secondo la propria norma di progetto.

## Clotoidi

Una curva può avere una clotoide a ciascuna estremità: rettifilo, clotoide, curva, clotoide, rettifilo. Nella tabella dei PI, digitare una lunghezza in **Clotoide in entrata** e **Clotoide in uscita** per un PI che ha un raggio. Il PI resta dov'è; la curva si sposta verso l'interno per fare posto, quindi la distanza di tangente cresce dell'offset della clotoide. Le due lunghezze possono differire, e un PI con una sola lunghezza riceve la clotoide solo da quell'estremità.

L'elenco delle curve riporta quindi TS, SC, CS e ST (rettifilo a clotoide, clotoide a curva, curva a clotoide, clotoide a rettifilo) con l'angolo della clotoide θs, le distanze di tangente e la distanza esterna. Le progressive scorrono lungo le clotoidi come ovunque. Le clotoidi che insieme deviano più della curva vengono rifiutate, con indicazione del PI; una clotoide più lunga di quanto consenta il rettifilo è una sovrapposizione, come per qualsiasi curva. La sopraelevazione usa la clotoide come tratto di transizione (vedi [Corridoio](topic:corridor)).
