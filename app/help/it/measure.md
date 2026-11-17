---
title: Misurare distanze, aree e pendenze
summary: Misurare sulla pianta cliccando i punti — lunghezza e direzione di ogni lato, il totale progressivo, la lunghezza lungo il terreno, la pendenza, e l'area e il perimetro di una forma chiusa — e tra due punti sul profilo di una linea elettrica.
keywords: misura, misurare, distanza, lunghezza, area, perimetro, direzione, pendenza, livelletta, righello, nastro, lungo il terreno, profilo, differenza di altezza
from: d614eb25
---

{{ui:Superficie}} › {{ui:Altro}} › {{ui:Misura}} (anche nel menu {{ui:Altro}} dell'area di lavoro Linee elettriche, oppure premere {{key:M}}) misura senza aggiungere nulla al progetto.

## Sulla pianta

1. Scegliere {{ui:Misura}}, quindi cliccare i punti. Un clic vicino a un punto di rilievo ne prende la posizione e la quota.
2. La riga di stato mostra il numero di punti e la lunghezza totale, la lunghezza e la direzione dell'ultimo lato, la sua pendenza dove il terreno è noto a entrambe le estremità, e la lunghezza lungo il terreno. Accanto al puntatore, il lato in corso di disegno e il totale progressivo.
3. Cliccare di nuovo il primo punto per chiudere la forma: la riga di stato aggiunge **area** e **perimetro**. Il clic successivo inizia una nuova misura.
4. {{key:Enter}} termina la misura e mantiene i suoi valori nella riga di stato; {{key:Backspace}} annulla l'ultimo punto; {{key:Esc}} la cancella, e {{key:Esc}} di nuovo torna a {{ui:Seleziona}}.

Le lunghezze sono nell'unità del progetto e le aree nella sua unità quadrata. La pendenza e la lunghezza lungo il terreno usano la superficie di progetto dove esiste, altrimenti il terreno esistente; fuori dalla superficie vengono omesse.

## Sul profilo di una linea elettrica

Nel [profilo della linea](topic:overhead-line#the-line-profile), {{ui:Misura}} nella barra del profilo richiede due clic e legge la distanza in orizzontale, la differenza di altezza, la distanza in linea retta e la pendenza tra di essi. Un clic vicino al terreno, al conduttore o alla sommità di un sostegno vi si aggancia. Cliccare di nuovo {{ui:Misura}} per fermarsi.
