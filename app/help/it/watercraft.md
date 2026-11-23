---
title: WaterCraft: consumi, portata antincendio, interruzioni ed età dell'acqua
summary: Con il componente aggiuntivo WaterCraft, trasforma le utenze in consumi sulle condotte, verifica la portata disponibile a ogni idrante, vedi quale interruzione di condotta pesa di più e segui l'età dell'acqua e il cloro nel corso di una giornata.
keywords: watercraft, distribuzione idrica, consumi, utenze, coefficiente di punta, andamento dei consumi, portata antincendio, idrante, pressione residua, criticità, interruzione, tratto intercettato da valvole, età dell'acqua, cloro, residuo, tracciamento della sorgente, terminale cieco, csv, add-on
from: 066fb17a
---

WaterCraft è un componente aggiuntivo che lavora sulla rete idrica già disegnata con gli strumenti Condotte idriche. Aggiunge una scheda al pannello destro con quattro sezioni.

:::warning
Solo un ausilio di calcolo. È stato verificato con risultati a mano su reti fittizie, non su un modello reale di gestore. Un ingegnere idraulico deve verificare ogni risultato. Scenari, regole di controllo, valvole e letture sul campo hanno propri argomenti, "Scenari" e "Studi", nella guida del componente aggiuntivo WaterCraft.
:::

## Cosa si fa

- Inserire le utenze nella rete come consumi.
- Trovare gli idranti che non raggiungono la portata necessaria.
- Trovare le condotte la cui perdita pesa di più.
- Trovare acqua vecchia e cloro basso.

## Passaggi

1. Aprire {{ui:Impostazioni}} › {{ui:Add-on}} e attivare {{ui:WaterCraft (distribuzione idrica)}}. Compare una scheda {{ui:WaterCraft}} nel pannello destro.
2. Disegnare prima un serbatoio, nodi e tubazioni con gli strumenti Condotte idriche (vedi [Condotte idriche](topic:water-mains)). Senza una rete la scheda lo segnala.
3. Sotto {{ui:Consumi}}, incollare un'utenza per riga: id, x, y, tipo, quantità. Scegliere il {{ui:Coefficiente di punta}} e l'{{ui:Andamento orario}} (giorno residenziale, giorno commerciale, piatto, oppure mantenere l'andamento così com'è). Premere {{ui:Verifica}} per vedere dove cade ciascuna utenza (il nodo più vicino), poi {{ui:Inserisci nella rete}}. Annulla rimuove di nuovo i consumi.
4. Sotto {{ui:Portata antincendio}}, impostare la portata necessaria e la pressione residua, scegliere se la residua è mantenuta {{ui:Solo all'idrante}} oppure {{ui:Ovunque nel sistema (più severo)}}, e premere {{ui:Sviluppo}}. Ogni idrante è elencato a partire dal peggiore, come conforme o insufficiente.
5. Sotto {{ui:Condotta più importante}}, scegliere {{ui:una tubazione alla volta}} oppure {{ui:un tratto intercettato da valvole alla volta}} e premere {{ui:Sviluppo}}. Ogni interruzione mostra il consumo isolato, i nodi isolati, i nodi appena sotto la pressione minima e la pressione più bassa rimasta.
6. Sotto {{ui:Età dell'acqua e cloro}}, scegliere che cosa seguire (età dell'acqua, cloro o tracciamento della sorgente), impostare le ore da simulare e i limiti desiderati, e premere {{ui:Sviluppo}}. Sono elencati i nodi fuori dai limiti.
7. Premere {{ui:Salva come CSV}} sotto una qualsiasi tabella per conservarla.

## Note

- La portata antincendio necessaria e il consumo per abitazione o per ettaro sono valori iniziali, non standard. Usare i valori propri del gestore.
- Una tubazione intercettata in parte da una valvola viene chiusa per intero, quindi l'interruzione mostrata è leggermente peggiore di una reale.
- Far girare la sezione di qualità dell'acqua abbastanza a lungo perché l'andamento giornaliero si ripeta prima di leggere l'ultimo giorno.
- {{ui:Ferma}} termina in anticipo una simulazione lunga; l'elenco mostra allora solo ciò che è stato fatto.
- La rete resta in questo progetto e su questo computer. Non viene inviato nulla.
