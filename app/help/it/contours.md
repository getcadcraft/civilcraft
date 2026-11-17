---
title: Leggere curve di livello, quote e pendenze
summary: Impostare l'equidistanza e le curve direttrici, mostrare fasce di quota, frecce di pendenza e triangoli, e leggere le quote del terreno sotto il puntatore.
keywords: curve di livello, equidistanza, curve direttrici, etichette, fasce di quota, frecce di pendenza, triangoli, quota altimetrica, analisi della superficie, analisi delle quote, analisi delle pendenze
from: 585e500a
---

La superficie viene mostrata con curve di livello non appena esiste. Tutto ciò che riguarda questo argomento si imposta sotto **Visualizza** nel pannello di sinistra. Le impostazioni di visualizzazione cambiano solo ciò che si vede (e ciò che si esporta); non sono passi di annullamento.

## Impostare l'equidistanza

1. Sotto **Visualizza**, scegliere un valore in **Curve ogni**.
   - In piedi: 0.25, 0.5, 1, 2, 5, 10 o 20 ft.
   - In metri: 0.1, 0.25, 0.5, 1, 2, 5 o 10 m.
2. Scegliere **Direttrici ogni**: la 2ª, 4ª, 5ª o 10ª curva.
   Le curve direttrici sono disegnate più spesse ed etichettate con la loro quota. Cadono su multipli interi della spaziatura delle direttrici (con curve da 1 ft e una direttrice ogni 5: 245, 250, 255 …).
3. Disattivare {{ui:Contour labels}} se le etichette affollano una stampa ridotta.

Un nuovo progetto parte con 1 unità e una direttrice ogni 5 curve. Le curve di livello si piegano sulle linee di discontinuità; se attraversano in linea retta una linea di flusso o una cresta, quella linea non è ancora una linea di discontinuità (vedi [Costruire e rifinire la superficie](topic:build-surface)).

:::note
Le curve vengono disegnate solo se ci sono al massimo 2.000 livelli tra il punto più basso e quello più alto. Su un sito con molto dislivello e un intervallo molto piccolo, la pianta non mostra alcuna curva: scegliere un intervallo maggiore.
:::

## Smussare le curve di livello

Le curve sono tracciate come tratti rettilinei, uno attraverso ogni triangolo della superficie, quindi fanno un piccolo angolo a ogni lato di triangolo. **Smussatura delle curve** sotto **Visualizza** arrotonda questi angoli:

- **Nessuna (tratti rettilinei)**: le linee tracciate così come sono. È ciò che mostra un disegno nuovo o più vecchio.
- **Leggera**: angoli arrotondati un poco. Una linea non si sposta mai più del 10% della distanza verso la curva successiva, e mai più lontano dal suo tratto rettilineo di un sesto della lunghezza di quel tratto.
- **Forte**: una curva fluida. Una linea non si sposta mai più del 25% della distanza verso la curva successiva, e mai più lontano dal suo tratto rettilineo di un terzo della lunghezza di quel tratto.

Con una qualunque delle due scelte, una curva smussata attraversa ancora ogni lato di triangolo nello stesso punto di quella tracciata, resta dentro il triangolo attraversato da ogni tratto, e quindi non può mai incrociare o toccare un'altra curva. Dove una curva attraversa una linea di discontinuità o il confine, mantiene la sua piega netta. Le linee smussate sono quelle disegnate ed esportate (DXF, DWG, PDF, GIS e 3D), con più vertici di quelle tracciate.

Lo smussamento cambia solo le linee disegnate. Quote, volumi, profili e sezioni continuano a essere letti dalla superficie stessa. Una curva che passa esattamente per punti di rilievo (un punto a 250.00 sulla curva 250) mantiene un piccolo angolo in ogni punto del genere.

## Come viene costruita la superficie sotto le curve

Le curve seguono la superficie, e la superficie segue il **Metodo di tracciamento delle curve** sotto **Superficie** nel pannello di sinistra. Il valore predefinito, **Triangolazione con interpolazione lineare**, unisce i punti in triangoli e mantiene ogni punto e ogni linea di discontinuità esattamente. Gli altri metodi adattano prima una griglia regolare ai punti (kriging, curvatura minima, vicino naturale, distanza inversa e altri), il che dà curve più arrotondate tra i punti ma non passa esattamente per ogni punto; il rapporto sulla superficie sotto **Superficie** indica di quanto il risultato si discosta nei punti.

**ABOS (approssimazione basata su smoothing)** è uno dei metodi a griglia. Ha due impostazioni proprie: **Regolarità** (0.5 all'inizio; più basso è più liscio) e **Precisione** (1 all'inizio: la superficie viene portata entro l'1% dell'escursione altimetrica del sito nei punti; digitare un numero più piccolo per un adattamento più stretto). Se non riesce a raggiungere la precisione sulla griglia che ha, il rapporto sulla superficie lo segnala: digitare una **Spaziatura griglia** più piccola.

## Leggere una quota ovunque

Muovere il puntatore sulla pianta. La barra di stato mostra:

- **E** e **N** sotto il puntatore
- **Terreno** e la quota del terreno esistente in quel punto, interpolata sul triangolo sotto il puntatore
- **Sistemato** e la quota di progetto, dove un piazzale o un corridoio ha modificato il terreno
- "Fuori dalla superficie" al di fuori della superficie

Per leggere esattamente un punto di rilievo, scegliere {{ui:Select}} e fare clic sul punto: il pannello di destra mostra il suo numero, Est, Nord, quota, descrizione e gruppo.

## Mostrare le fasce di quota

1. Attivare {{ui:Elevation bands}}.
   La superficie viene riempita di colore dal basso (verde-azzurro) all'alto (ocra-marrone). Una legenda sotto le caselle elenca l'intervallo di quota di ogni fascia.
2. Scegliere quante fasce in **Fasce**: 5, 8, 10 o 12. Le fasce dividono l'intervallo dalla quota più bassa alla più alta in passi uguali.

Le fasce servono solo a guardare. Non vengono esportate in DXF né stampate in PDF.

## Mostrare le frecce di pendenza

Attivare {{ui:Slope arrows}}. Una freccia corta su ogni triangolo abbastanza grande da contenerla punta verso il basso. I triangoli piani non hanno freccia. Le frecce servono per un controllo rapido della direzione di drenaggio; il valore della pendenza non è ancora indicato.

## Mostrare triangoli, punti e spigoli

- {{ui:Triangles}} disegna gli spigoli del TIN. Attivarlo per verificare come la superficie collega i punti, soprattutto lungo le linee di discontinuità e sul perimetro esterno.
- {{ui:Points}} disegna ogni punto di rilievo; {{ui:Point labels}} aggiunge il suo numero, la quota e la descrizione (oppure meno: vedi **Etichette dei punti** in [Impostazioni di CivilCraft](topic:settings)).
- {{ui:Breaklines}} disegna le linee di discontinuità (e il confine) in arancione.
- {{ui:Surface edge}} disegna il contorno della superficie.

## Esistente o di progetto

Quando un piazzale o un corridoio è sistemato senza problemi, **Superficie** sotto **Visualizza** offre {{ui:Proposed (graded)}}. Curve, fasce e frecce mostrano allora la superficie sistemata, così si vedono il nuovo terreno e l'intersezione con il terreno attorno. Tornare su {{ui:Existing ground}} per vedere il rilievo.

## Cosa viene esportato

L'output DXF e PDF segue queste impostazioni: ciò che è stato disattivato non viene scritto, e le curve sono quelle della superficie mostrata. Le fasce di quota non vengono mai esportate.
