---
title: Recinzioni
summary: Una recinzione lungo una linea, una particella o un piazzale: pali, correnti, pannelli o paletti, cancelli, inclinata o a gradini sul terreno, un abaco, simboli in pianta ed elementi IFC. Disponibile anche per un assistente.
keywords: recinzione, pali, correnti, pannelli, paletti, cancello, inclinata, a gradini, terreno, abaco, ifc, parapetto, confine
from: c0e7b84a
---

Creare una recinzione lungo una linea caratteristica, un tracciato, una particella o un piazzale, con i pali e i cancelli posizionati automaticamente.

## Creare una recinzione

1. Selezionare una linea, una particella o un piazzale.
2. Aprire **Superficie, Altro, Recinzioni...**
3. Scegliere lo stile (pannelli, correnti o paletti), inclinata o a gradini, l'altezza, l'interasse dei pali e la larghezza del cancello, quindi **Recinzione lungo la selezione**, oppure **Con cancello** per mettere un cancello al centro del tratto rettilineo più lungo.

I pali vanno alle estremità, a ogni angolo (un vertice che gira di 20 gradi o più), ai due lati di ogni cancello e a campate uguali in mezzo, nessuna più lunga dell'interasse. I pannelli **inclinati** seguono il terreno tra i propri pali. I pannelli **a gradini** restano orizzontali e fanno un gradino ai pali; lo spazio sotto un pannello è più ampio al palo a valle, e la finestra avvisa quando tale spazio supera il limite, o quando il terreno sale attraverso un pannello. I cancelli di 6 feet (1.8 m) e più larghi hanno due ante; la pianta mostra le ante aperte con la loro rotazione.

## Abaco e output

Ogni recinzione mostra la lunghezza, i pali per tipo, i pannelli, i cancelli e i gradini, con un abaco **CSV** di pali, pannelli, correnti, paletti e cancelli. La pianta ha i layer della recinzione (C-FENC, C-FENC-POST, C-FENC-GATE) per PDF, DXF e DWG. L'esportazione IFC contiene i pali (IfcMember, post), i pannelli (IfcRailing, user defined fence panel), i correnti (IfcMember) e i cancelli (IfcDoor, gate), un sistema per ogni recinzione.

## Dall'assistente

`fence_build` crea una recinzione (punti oppure una linea, particella o piazzale con nome, cancelli per progressiva) e `fence_list` elenca le recinzioni con il loro abaco.

## Cosa non è ancora implementato

Le dimensioni iniziali sono scelte usuali, non un codice. I tipi della Libreria sono riportati solo come nome. I cancelli devono trovarsi in un unico tratto rettilineo. BimCraft non ha ancora questo strumento.
