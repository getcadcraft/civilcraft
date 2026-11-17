---
title: Coordinate di terreno e locali
summary: Lavorare in coordinate di terreno (superficie) scalate dalla griglia con un fattore di scala combinato che si digita o si calcola in un punto, oppure in una griglia di sito assunta collegata al sistema tramite due punti di controllo.
keywords: coordinate di terreno, coordinate di superficie, da griglia a terreno, fattore di scala combinato, csf, fattore combinato, fattore di griglia, fattore di quota, fattore del livello del mare, convergenza, angolo di mappa, fattore di scala, coordinate assunte, coordinate locali, griglia di sito, 5000 5000, punti di controllo, localizzazione, calibrazione, due punti, errore di chiusura
from: 3d7453de
---

Le coordinate state plane e UTM sono coordinate di **griglia**: una proiezione cartografica allunga o accorcia un po' le distanze (decine di parti per milione), e più alto è il sito, più una distanza misurata a terra differisce da quella di griglia. Molti rilievi quindi consegnano coordinate di **terreno**, scalate in modo che le distanze in pianta siano uguali a quelle misurate a terra, oppure una griglia di sito **assunta** (5000, 5000 in un punto di controllo). CivilCraft mantiene i numeri così come sono e registra come sono collegati alla griglia, così latitudine e longitudine, file GIS e layer cartografici finiscono comunque nel posto giusto.

Aprire {{ui:Coordinate}} nel gruppo {{ui:GIS}}, scegliere (o mantenere) il sistema, poi scegliere sotto **Coordinate di griglia, di terreno o locali**:

| Scelta | Le coordinate sono | Come sono collegate alla griglia |
|---|---|---|
| {{ui:Griglia}} | Quelle proprie del sistema (il punto di partenza) | Gli stessi numeri |
| {{ui:Terreno}} | Scalate alle distanze a terra | griglia = base + fattore combinato × (terreno − base) |
| {{ui:Locale}} | Una griglia di sito assunta | Spostate, ruotate e scalate sulla griglia tramite due punti di controllo |

Qualunque scelta si faccia viene salvata nel progetto ed è un passo di annullamento; nulla si sposta.

## Coordinate di terreno

1. Scegliere {{ui:Terreno}}.
2. Digitare il **Fattore di scala combinato** del rilievo (per esempio `0.99987`), oppure calcolarlo:
   1. Sotto **Calcola il fattore in un punto**, il punto parte dal centro del progetto. Scegliere {{ui:Scegli un punto nella pianta}} e fare clic sul punto (un clic vicino a un punto di rilievo prende quel punto), oppure digitare E e N.
   2. La quota viene presa dalla superficie in quel punto; digitarne un'altra se serve.
   3. Scegliere {{ui:Calcola}}. CivilCraft mostra:
      - **Fattore di scala di griglia k**: quanto la proiezione cartografica allunga le distanze in quel punto.
      - **Fattore di quota**: quanto le distanze sono più corte sull'ellissoide che a quella quota.
      - **Fattore combinato** = k × fattore di quota: distanza di griglia = distanza a terra × questo.
      - **Convergenza**: l'angolo tra il nord di griglia e il nord vero in quel punto (azimut geodetico = azimut di griglia + convergenza).
   4. Scegliere il pulsante {{ui:Uso}} sotto i numeri per inserire il fattore combinato nella casella.
3. Impostare il **Punto base**, dove le coordinate di terreno e di griglia coincidono. Parte da 0, 0: la maggior parte delle giurisdizioni che pubblicano coordinate di terreno scala rispetto all'origine, così le coordinate di terreno restano riconoscibilmente vicine a quelle di griglia. Alcuni rilievi scalano invece rispetto al punto di controllo del progetto: usare ciò che dice il rilievo.
4. Scegliere {{ui:Applica}}.

:::warning
La quota viene presa come altezza sull'ellissoide. CivilCraft non ha un modello del geoide, quindi dove il geoide è 30 m (100 ft) sotto o sopra l'ellissoide il fattore di quota è sbagliato di circa 5 ppm. Quando il rilievo dichiara il suo fattore combinato, digitare quello.
:::

## Coordinate locali (assunte)

1. Scegliere {{ui:Locale}}.
2. Per il **Punto di controllo 1**, digitare il numero del punto di rilievo (oppure scegliere {{ui:Scegli}} e fare clic sul punto nella pianta). Le sue coordinate locali compaiono accanto.
3. Digitare le sue **E** e **N** di griglia, oppure la sua latitudine e longitudine nella terza casella (per esempio `30.2672, -97.7431`).
4. Fare lo stesso per il **Punto di controllo 2**, il più lontano possibile dal primo.
5. CivilCraft mostra la **Scala** e la **Rotazione** trovate, e ricorda: **Due punti si adattano sempre esattamente: verificarne un terzo.**
6. Inserire un **Punto di verifica** allo stesso modo. CivilCraft mostra quanto l'adattamento lo colloca lontano dalle coordinate di griglia digitate (il suo errore di chiusura, nelle unità del progetto e in parti per milione). Un errore di chiusura grande indica un punto sbagliato, un errore di battitura, oppure coordinate in un'altra unità.
7. Scegliere {{ui:Applica}}.

Una scala molto lontana da 1 (oltre da 0.5 a 2) viene rifiutata: verificare i punti e le loro unità.

## Cosa è stato verificato

- Il fattore di scala e la convergenza corrispondono a PROJ (pyproj 3.7.1 con PROJ 9.5.1), la libreria di coordinate usata dalla maggior parte dei programmi GIS, entro 1 parte su un miliardo su oltre 300 sistemi con proiezioni conformi (state plane, UTM, Mercatore trasverso, conica conforme di Lambert), e nel browser in un punto scelto sulla pianta.
- I passaggi di terreno e locali si convertono avanti e indietro entro 1 parte su un miliardo; due punti di controllo restituiscono la scala e la rotazione con cui sono stati creati; un punto di verifica distante 0.05 ft mostra un errore di chiusura di 0.05 ft.
