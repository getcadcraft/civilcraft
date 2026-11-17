---
title: Oggetti a forma libera
summary: Portare sul sito una forma creata in un'altra app (STL, OBJ o un elemento della libreria); poggia sul terreno oppure viene inserita in esso, e il suo volume, la sua area e la sua impronta sono conteggiati come il resto.
keywords: forma libera, oggetto personalizzato, scultura, fioriera, panchina, mesh, stl, obj, elemento della libreria, consapevole del terreno, segue il terreno, scavo nel terreno, quantità, volume, ifc
from: ec835f33
---

Un elemento unico (una fioriera, un muretto con panchina, una scultura, una collinetta da gioco) può essere creato in ModelCraft o PartCraft e posizionato qui, così si trova nello stesso modello e negli stessi abachi di tutto il resto.

1. Paesaggio › Altro › {{ui:Oggetto a forma libera…}} e scegliere un file **STL** o **OBJ** (nelle unità del progetto: piedi in un progetto in piedi, metri in un progetto in metri) oppure un **elemento della libreria** CadCraft (`.json`) con un corpo a mesh.
2. Fare clic nel punto in cui va posizionato.

## La sua base

- **Segue il terreno**: il suo punto più basso poggia sul terreno più basso sotto la sua impronta, quindi nulla resta sospeso. Le Proprietà stimano quanta parte di esso si trova sotto il terreno.
- **Scava il terreno**: la sua base è impostata a una quota e il terreno all'interno della sua impronta viene modellato fino a essa con scarpate di intersezione con il terreno, conteggiate in Movimenti di terra come una piattaforma.

Ruotarlo con **Rotazione**, trascinarlo sulla pianta per spostarlo.

## Conteggio

Le Proprietà riportano il suo **volume** (per un solido chiuso), la **superficie**, l'**impronta** e l'**altezza**, misurati dalla mesh. L'esportazione IFC lo scrive con la **classe IFC** scelta e queste quantità.

:::note
L'impronta è l'inviluppo convesso del contorno: una forma concava (una fioriera a L) viene modellata come se fosse piena.
:::
