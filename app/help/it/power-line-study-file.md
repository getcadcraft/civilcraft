---
title: File di studio per un altro programma di linee (.DON)
summary: Salvare una linea aerea come file di studio .DON, oppure leggere i sostegni di un file in una nuova linea. Non testato con il programma che li legge.
keywords: don, .don, file di studio, xml, esporta, importa, programma per linee aeree, tesatura, canton
from: 1abc4d07
---

Alcuni programmi per linee aeree conservano uno studio in un file `.DON` (testo XML). CivilCraft può scrivere una linea in tale file e leggere i sostegni di un file di questo tipo.

:::warning
**Non testato.** Lo abbiamo realizzato a partire da un elenco dei nomi dei campi del formato condiviso da un utente, non da un file reale, e non abbiamo ancora aperto i nostri file nel programma che li legge. Aprire il file in quel programma e verificare ogni valore prima di farvi affidamento. Se è possibile condividere un file `.DON` (senza i dati del cliente), ci aiuta a correggere il tutto.
:::

## Salvare un file di studio

1. Assegnare alla linea un conduttore e verificare che abbia dei risultati (nessun "non calcolato" nelle sue Proprietà).
2. {{ui:Altro}} › {{ui:Salva un file di studio (.DON)…}}, scegliere la linea, aggiungere una descrizione e un numero di commessa.
3. {{ui:Salva il file di studio}}.

Il file contiene i sostegni della linea (coordinate, terreno, altezze, ruoli, mensola, il sostegno mantenuto o suggerito, carichi per ipotesi di carico, fondazione), una sezione per ogni tratto tra gli amarri (conduttore, tensione, campata equivalente, campate, tensione e parametro di catenaria, la tensione massima per ipotesi di carico) e le tabelle di tesatura. Le lunghezze sono in metri e le forze in daN; il testo è scritto in Latin-1, quindi un carattere che ne è fuori diventa `?`.

## Leggere un file di studio

{{ui:Altro}} › {{ui:Apri un file di studio (.DON)…}} legge i sostegni in una nuova linea. Il conduttore, i sostegni e le mensole vengono abbinati alla libreria in base al nome; ciò che non viene trovato resta da scegliere nelle Proprietà.
