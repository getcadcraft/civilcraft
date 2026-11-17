---
title: Cavi interrati
summary: Percorsi dei cavi in trincea tra supporti e apparecchiature, copertura e attraversamenti, giunzioni in base alla lunghezza della bobina, e quantità di trincea e di cavo.
keywords: cavo interrato, percorso del cavo, trincea, canalizzazione, copertura, attraversamento, attraversamento di tubazione, giunzione, bobina, armadio, trasformatore, sorgente, caduta di tensione
from: adfd2717
---

## Disegnare un percorso del cavo

1. Posizionare prima l'apparecchiatura se il cavo termina su un armadio, un trasformatore o una giunzione: {{ui:Apparecchiatura}}, poi fare clic.
2. Fare clic su {{ui:Cavo}} e fare clic sul percorso; l'inizio e la fine su un supporto o su un'apparecchiatura si collegano ad essi. Invio termina.

Nelle Proprietà scegliere il **Cavo**, il **Tipo di trincea**, quanti **cavi affiancati** e l'**eccedenza** (%). Il percorso mostra la sua lunghezza, dove inizia e finisce, e la corrente che trasporta.

## Cosa viene verificato

- **Copertura**: la parte superiore del cavo, lungo il percorso, deve trovarsi sotto il terreno con la copertura del tipo di trincea (oppure con la copertura minima del set di regole).
- **Attraversamenti**: dove il percorso incrocia una tubazione di CivilCraft o un altro cavo, la distanza tra i due viene confrontata con una regola di distanza: la **Distanza minima all'attraversamento** del percorso stesso (nelle sue Proprietà) se se ne sceglie una, altrimenti la regola **Attraversamenti interrati** del set di regole (i set di esempio usano *Attraversamento interrato*, 0.3 m), altrimenti la distanza dagli altri servizi del tipo di trincea. Per due cavi che si incrociano si mantiene la maggiore delle due. Una linea aerea attraversata viene elencata a titolo informativo, e il cavo compare nel profilo di quella linea.
- **Giunzioni**: una ogni lunghezza di bobina del cavo (con eccedenza), quando la voce del cavo fornisce una lunghezza di bobina.

## Apparecchiatura

L'apparecchiatura ha una voce di libreria, un **carico** (kW) con il suo **fattore di potenza**, e può essere **una sorgente**: la rete è alimentata da lì. La tensione di una sorgente proviene dalla sua voce di libreria, oppure dalla linea o dal cavo che alimenta.

## Quantità

{{ui:Altro}} › {{ui:Quantità…}} conta il cavo (lunghezza del percorso × (1 + eccedenza) × cavi affiancati + il dislivello a ciascuna estremità), la trincea per tipo, i volumi di scavo, di letto di posa e di rinterro, le canalizzazioni e le giunzioni, con i conduttori, i supporti e le apparecchiature delle linee aeree.
