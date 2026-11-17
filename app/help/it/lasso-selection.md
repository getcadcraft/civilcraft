---
title: Selezione a lazo dei punti di rilievo
summary: Tenere premuto Shift e trascinare un contorno a mano libera intorno ai punti di rilievo per selezionarli, come finestra, intersezione o recinto; cambiare con Space mentre si trascina. Un trascinamento rettilineo disegna ancora un riquadro.
keywords: lazo, mano libera, seleziona punti, selezione, finestra, intersezione, recinto, space, poligono, selezione a riquadro, trascinamento con shift
from: 3dd4fcaa
---

## Che cosa si imparerà

Come selezionare i punti di rilievo disegnando intorno a loro, quando un riquadro prenderebbe punti non voluti.

## Disegnare un lazo

1. Fare clic su {{ui:Seleziona}} (oppure premere {{key:V}}).
2. Tenere premuto {{key:Shift}}, premere sulla pianta e trascinare **intorno** ai punti desiderati, spostandosi prima **a destra**.
3. Rilasciare.

I punti all'interno del contorno vengono aggiunti alla selezione. Un trascinamento che resta vicino a una linea retta disegna un riquadro, come prima; appena si piega allontanandosi da quella linea (più di circa 12 pixel) diventa un lazo.

## Finestra, intersezione e recinto

| Si trascina | Lazo | Seleziona |
|---|---|---|
| **A destra** prima | Finestra (contorno pieno) | I punti al suo interno |
| **A sinistra** prima | Intersezione (tratteggiato, verde) | I punti al suo interno, e i punti che il contorno tocca |
| Premere {{key:Space}} mentre si trascina | Finestra, poi intersezione, poi recinto | Recinto (un percorso tratteggiato arancione, non chiuso): i punti che il percorso attraversa |

La riga di stato indica il lazo mentre si trascina. {{key:Esc}} mentre si trascina lo annulla e non seleziona nulla.

:::tip
Un recinto è il modo rapido per scegliere i punti di rilievo lungo un cordolo o una linea di fosso: trascinare lungo di essi e rilasciare.
:::

## Vedere anche

- [Selezionare, copiare e incollare punti di rilievo](topic:copy-paste-points)
- [Tasti e mouse](topic:keyboard)
