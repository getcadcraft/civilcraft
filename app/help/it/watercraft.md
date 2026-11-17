---
title: WaterCraft: consumi, portata antincendio, interruzioni ed età dell'acqua
summary: Con l'add-on WaterCraft: clienti trasformati in consumi sulle condotte idriche, portata disponibile a ogni idrante, condotta la cui interruzione pesa di più, ed età dell'acqua e cloro nell'arco di una giornata.
keywords: watercraft, distribuzione idrica, consumi, clienti, coefficiente di punta, profilo di consumo, portata antincendio, idrante, pressione residua, criticità, interruzione, tratto intercettabile, età dell'acqua, cloro, residuo, tracciamento della sorgente, estremità cieca, csv, add-on
from: 76809f01
---

WaterCraft è un add-on che lavora sulla rete idrica già disegnata con gli strumenti Condotte idriche. Aggiunge una scheda al pannello di destra con quattro sezioni.

:::warning
Solo uno strumento di calcolo. È stato verificato con risultati di calcolo manuale su reti fittizie, non su un modello reale di gestore. Un ingegnere idraulico deve controllare ogni risultato. Non sono ancora previste stazioni di rilancio, decadimento del secondo ordine né scenari.
:::

## Cosa si farà

- Inserire i clienti nella rete come consumi.
- Trovare gli idranti che non raggiungono la portata necessaria.
- Trovare le condotte la cui interruzione pesa di più.
- Trovare acqua vecchia e cloro basso.

## Passaggi

1. Aprire {{ui:Impostazioni}} › {{ui:Add-on}} e attivare {{ui:WaterCraft (distribuzione idrica)}}. Nel pannello di destra compare una scheda {{ui:WaterCraft}}.
2. Disegnare prima un serbatoio, nodi e tubazioni con gli strumenti Condotte idriche (vedi [Condotte idriche](topic:water-mains)). Senza una rete, la scheda lo segnala.
3. Sotto {{ui:Consumi}}, incollare un cliente per riga: id, x, y, tipo, quantità. Scegliere il {{ui:Coefficiente di punta}} e il {{ui:Profilo orario}} (giorno residenziale, giorno commerciale, costante, oppure lasciare il profilo così com'è). Premere {{ui:Verifica}} per vedere dove cade ogni cliente (il nodo più vicino), poi {{ui:Inserisci nella rete}}. Annulla riporta indietro i consumi.
4. Sotto {{ui:Portata antincendio}}, impostare la portata necessaria e la pressione residua, scegliere se la pressione residua è mantenuta {{ui:Solo all'idrante}} oppure {{ui:In tutta la rete (più severo)}}, e premere {{ui:Sviluppo}}. Ogni idrante è elencato dal peggiore, come adeguato o insufficiente.
5. Sotto {{ui:Condotta più critica}}, scegliere {{ui:una tubazione alla volta}} oppure {{ui:un tratto intercettabile alla volta}} e premere {{ui:Sviluppo}}. Ogni interruzione mostra il consumo tagliato fuori, i nodi tagliati fuori, i nodi che scendono sotto la pressione minima e la pressione più bassa rimasta.
6. Sotto {{ui:Età dell'acqua e cloro}}, scegliere cosa seguire (età dell'acqua, cloro o tracciamento della sorgente), impostare le ore di simulazione e i limiti desiderati, e premere {{ui:Sviluppo}}. Sono elencati i nodi fuori dai limiti.
7. Premere {{ui:Salva come CSV}} sotto una qualsiasi tabella per conservarla.

## Note

- La portata antincendio necessaria e il consumo per abitazione o per ettaro sono valori di partenza, non norme. Usare i dati propri del gestore.
- Una tubazione tagliata solo in parte da una valvola viene considerata chiusa per intero, quindi l'interruzione mostrata è leggermente peggiore di una reale.
- Eseguire la sezione qualità dell'acqua abbastanza a lungo perché il profilo giornaliero si ripeta prima di leggere l'ultimo giorno.
- {{ui:Ferma}} termina in anticipo una simulazione lunga; l'elenco mostra allora solo ciò che è stato fatto.
- La rete resta in questo progetto e su questo computer. Non viene inviato nulla.
