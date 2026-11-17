---
title: Verificare l'esportazione IFC rispetto all'IDS di un committente
summary: Carica il file .ids fornito da un committente o da un ente stradale e vedi in Problemi ogni elemento esportato che non lo rispetta.
keywords: ids, information delivery specification, buildingsmart, requisiti, consegna, verifica, validazione, qa, esportazione ifc, ifc 4.3, tracciato, strada, appalti
from: 183d9a0e
---

## Cosa si fa

Un IDS (Information Delivery Specification, uno standard buildingSMART) è l'elenco di ciò che un IFC deve contenere. Gli appalti pubblici spesso ne inviano uno insieme alla commessa. CivilCraft verifica l'IFC che questo progetto esporta, nella versione IFC scelta per l'esportazione, rispetto a esso, ed elenca ogni elemento che non soddisfa il requisito.

## Passi

1. Aprire il proprio progetto.
2. Fare clic su {{ui:IFC}} nel gruppo Esporta della barra degli strumenti. Nella finestra di dialogo, scegliere la versione IFC da consegnare.
3. Fare clic su {{ui:Verifica rispetto a un IDS…}}.
4. Fare clic su {{ui:Carica un file .ids…}} e selezionare il file. Nulla viene caricato.
5. Leggere il risultato: ogni specifica con {{ui:Superata}} o {{ui:Non superata}} e quanti elementi riguarda.
6. Aprire Problemi ({{key:Ctrl+Shift+M}}) e fare clic su un errore per selezionare il tracciato, il piazzale, la tubazione, la struttura o il volume edilizio da cui proviene.

## Cosa si dovrebbe vedere

- Un avviso per ogni elemento esportato e requisito che non soddisfa, con il nome della specifica, ciò che l'IDS richiede e ciò che l'esportazione contiene.
- Il rapporto di verifica (in Problemi) inizia dall'IDS: il suo titolo, la versione, l'autore e i conteggi di ogni specifica.

## Da sapere

- L'IDS è salvato nel file di progetto, quindi viene verificato di nuovo quando si apre il progetto. Caricarlo o dimenticarlo è un solo passo annullabile.
- Ogni modifica viene verificata di nuovo poco dopo. Le superfici grandi richiedono più tempo per essere scritte, quindi la verifica attende un po' di più tra un'esecuzione e l'altra.
- La verifica usa lo stesso file che scrive l'esportazione {{ui:IFC}}, nella versione scelta per ultima lì (IFC 4.3 se non ne è stata scelta una).
- I numeri sono confrontati in unità SI: un progetto in piedi viene prima convertito in metri.

- I pattern nell'IDS sono letti come valore intero. Un `^` all'inizio e un `$` alla fine sono intesi anch'essi come "l'intero valore", come intendono la maggior parte dei file IDS.

## Successivo

- [Esportare IFC](topic:ifc)
