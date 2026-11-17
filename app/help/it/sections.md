---
title: Linee di campionamento e sezioni trasversali
summary: Tagliare sezioni perpendicolari a un tracciato, vedere il terreno, il progetto e lo sterro e riporto in ogni progressiva, e ottenere i volumi per media delle aree di estremità.
keywords: diagramma delle masse, punto di compensazione, contrazione, rigonfiamento, distanza di trasporto, prestito, scarto, tavole delle sezioni, tavole delle sezioni trasversali, sezioni pdf, sezioni, sezioni trasversali, linee di campionamento, vista delle sezioni, sterro, riporto, aree, media delle aree di estremità, volumi per media delle aree, movimento terra, progressiva, offset, csv
from: 5060173c
---

Una sezione trasversale mostra la strada come sarà costruita: perpendicolarmente al tracciato in una progressiva, il terreno esistente, il progetto (il corridoio o il piazzale sistemati) e lo sterro e il riporto tra di essi.

## Aggiungere linee di campionamento

1. Selezionare un tracciato. In **Proprietà**, sotto **Linee di campionamento**, fare clic su {{ui:Aggiungi linee di campionamento}}.
2. Impostare **Ogni** (la spaziatura: 50 ft o 20 m per iniziare), **Larghezza a sinistra** e **Larghezza a destra** (quanto ogni sezione si estende dalla mezzeria).
3. Per tagliare una sezione in una certa progressiva, digitarla in **Aggiungi una progressiva** (per esempio `2+35`) e premere {{key:Enter}}.

Le sezioni sono tagliate a ogni multiplo intero della spaziatura, alle due estremità del tracciato, all'inizio e alla fine di ogni curva (PC e PT), e nelle progressive aggiunte. Le linee di campionamento compaiono in pianta come linee grigie attraverso il tracciato; vanno anche in DXF, DWG e PDF sul layer C-ROAD-SCTN. Ogni modifica è un passo: {{key:Mod+Z}} la annulla.

## La vista delle sezioni

Aprirla con {{ui:Vista delle sezioni}} nelle **Proprietà** del tracciato, con {{ui:Sezioni}} sotto **Superficie** › {{ui:Altro}}, oppure con {{key:X}}. Sostituisce la vista del profilo sotto la pianta.

- Scorrere le sezioni con le frecce nella sua barra, nell'elenco delle progressive, oppure con {{key:Left}} e {{key:Right}} con la vista delle sezioni a fuoco ({{key:Home}} e {{key:End}} per la prima e l'ultima).
- La linea grigia è il terreno esistente, la linea rossa il progetto. Lo sterro è campito in arancione, il riporto in verde. I punti del corridoio sono indicati: CL (asse), EOP (margine della carreggiata), SH (banchina) e DL (intersezione con il terreno).
- L'intestazione riporta la progressiva, le aree di sterro e riporto di questa sezione e l'esagerazione verticale. **Adatta** riempie il pannello; scegliere 1× per vedere la sezione in scala vera.
- La linea spessa sulla pianta mostra quale sezione è a schermo.

## Tavole delle sezioni

{{ui:Tavole delle sezioni (PDF)}} sotto **Linee di campionamento** mette ogni sezione su pagine PDF, in righe da sinistra a destra e dall'alto in basso nell'ordine delle progressive. Scegliere il **Formato carta**, la **Scala in pianta** (la scala orizzontale delle sezioni) e l'**Esagerazione del profilo** (1×, 2×, 5× o 10×); la finestra indica quante sezioni entrano in una pagina e quante pagine ne risultano.

Ogni sezione mostra una griglia con scostamenti e quote, il terreno (tratteggiato), il progetto, sterro e riporto campiti (arancione e verde), i punti del corridoio, e sotto di essa la sua progressiva e le sue aree di sterro e riporto. Ogni sezione nelle tavole è disegnata della stessa dimensione, abbastanza alta per la più grande; quando non entra nella pagina con l'esagerazione scelta, CivilCraft usa la più grande che entra e lo indica. La fascia del titolo riporta il nome del tracciato, le progressive di quella pagina, le scale e "Tavola 1 di 3".

## Volumi per media delle aree di estremità

Tra due sezioni vicine il volume è la media delle loro due aree per la distanza tra le progressive. La barra mostra i totali del tracciato, e {{ui:CSV}} scarica le aree e i volumi di ogni sezione con i totali progressivi (iarde cubiche per i progetti in piedi, metri cubi per quelli metrici).

**Proprietà** mostra gli stessi totali accanto ai volumi con il metodo a griglia da [Volumi di sterro e riporto](topic:volumes). I due sono approssimazioni diverse: sezioni più vicine li avvicinano, e su una strada rettilinea in piano coincidono.

:::note
Sterro e riporto sono contati solo dentro le aree sistemate (le linee di intersezione con il terreno di un corridoio o di un piazzale), come fa il metodo a griglia. Senza corridoio o piazzale il progetto è il terreno, quindi una sezione non mostra sterro né riporto.
:::

## Diagramma delle masse

**Diagramma delle masse** sotto **Linee di campionamento** disegna il diagramma delle masse dagli stessi volumi per media delle aree: lungo le progressive, il totale progressivo di sterro meno riporto.

- **Contrazione (−) o rigonfiamento (+) dello sterro** indica che cosa diventa un metro cubo di sterro una volta posto come riporto: −10 % (il valore iniziale, un valore provvisorio) significa che si riduce a 0.9; una roccia che rigonfia potrebbe essere +5 %. Usare il dato della propria relazione geotecnica.
- Dove la linea sale la strada è in sterro; dove scende, in riporto. Sopra lo zero (campito in arancione) la terra si sposta verso la progressiva crescente; sotto lo zero (verde), verso quella decrescente.
- I **punti di compensazione** sono dove la linea attraversa lo zero: tra due di essi sterro e riporto si compensano. La tabella elenca ogni tratto compensato, il volume spostato (il suo punto più alto o più basso) e la distanza media di trasporto (l'area campita divisa per quel volume).
- Dove la linea termina fuori zero, ciò che avanza è **scarto** (sopra) o **prestito** (sotto). In quell'ultimo tratto conta come spostata solo la terra oltre il livello su cui termina.

**CSV** salva l'ordinata di massa in ogni sezione, i tratti e il coefficiente.
