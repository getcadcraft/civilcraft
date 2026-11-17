---
title: Assegna lo stile a un layer in base a un attributo
summary: Colorare gli elementi di un layer GIS in base ai valori di un campo (un colore per valore, oppure per intervalli numerici), dimensionare i punti con un numero, tinteggiare i poligoni e mostrare una legenda sulla pianta.
keywords: simbologia, stile, colore, categorizzato, graduato, valori unici, intervallo uguale, quantile, interruzioni naturali, jenks, rampa, daltonismo, legenda, dimensione, punti, coropleti, classi, gis
from: a3a69add
---

Aprire il menu a **tre puntini** del layer nell'elenco dei layer GIS e scegliere {{ui:Stile per attributo…}}.

## Tre stili

- **Simbolo singolo:** il colore del layer, come prima.
- **Categorizzato:** un colore per ogni valore distinto di un campo qualsiasi. Fino a otto valori ricevono gli otto colori Okabe-Ito (scelti per restare distinguibili nei tipi più comuni di daltonismo); con più valori i sette più frequenti ricevono un colore ciascuno e i restanti condividono una classe grigia **Altro**. Gli elementi senza valore sono grigi.
- **Graduato:** un campo numerico viene suddiviso in da 2 a 9 intervalli, ciascuno con un colore di una rampa. Un valore su un limite finisce nell'intervallo inferiore.

## Come vengono tagliati gli intervalli

| Metodo | Limiti |
|---|---|
| Intervallo uguale | L'intervallo dal valore più piccolo al più grande diviso in ampiezze uguali. Valori da 0 a 30 in tre intervalli: 0, 10, 20, 30. |
| Quantile | Circa lo stesso numero di elementi in ogni intervallo. I limiti vengono letti dai valori ordinati con la solita interpolazione lineare: per 1–10 in due intervalli il limite è 5.5. |
| Interruzioni naturali (Jenks) | I tagli che lasciano la minima dispersione all'interno di ogni intervallo, così i gruppi di valori simili restano uniti. Con più di 1,500 valori lavora su 1,500 valori equidistanti e lo dichiara. |

## Colori

Viridis e Cividis vanno dallo scuro al chiaro con un cambiamento costante di luminosità, quindi l'ordine degli intervalli si legge anche in scala di grigi o con daltonismo. Blues va dal chiaro allo scuro. Rosso–blu è una rampa bidirezionale per valori intorno a un valore medio. **Inverti i colori** inverte qualsiasi di esse. Il dialogo elenca gli intervalli e il numero di elementi in ciascuno prima di applicare.

## Dimensione, riempimento e legenda

- **Dimensione punto in base a** un campo numerico rende il quadrato di ogni punto più grande quanto più è grande il valore, tra le due dimensioni indicate (metà del lato, in millimetri su carta).
- **Tinteggia l'interno dei poligoni** riempie ogni poligono con il colore della sua classe (i fori restano vuoti). La tinta è a schermo; PDF e DXF/DWG mostrano i contorni colorati.
- **Mostra una legenda sulla pianta** disegna le classi, i loro conteggi e l'intervallo di dimensioni in basso a sinistra della pianta. La legenda è a schermo; non compare in una stampa.
- Per etichettare gli elementi con un campo, usare **Etichetta con** nello stesso menu.

Lo stile viene salvato nel file di progetto. Una versione che non conosce gli stili apre il file con il colore del layer. PDF, DXF e DWG portano le classi come layer separati denominati con il nome del layer e della classe, nel più vicino dei nove colori CAD di base. Un layer con più di 200,000 elementi viene disegnato in un solo colore.
