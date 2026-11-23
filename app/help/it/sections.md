---
title: Linee di campionamento e sezioni trasversali
summary: Tagliare sezioni perpendicolari a un tracciato, vedere terreno, progetto e scavo e riporto a ogni progressiva, e ottenere i volumi con il metodo delle aree medie di estremità.
keywords: diagramma delle masse, diagramma di compenso, punto di equilibrio, ritiro, rigonfiamento, distanza di trasporto, prestito, scarico, tavole delle sezioni, tavole delle sezioni trasversali, sezioni pdf, sezioni, sezioni trasversali, linee di campionamento, vista delle sezioni, scavo, riporto, aree, area media di estremità, volumi ad area di estremità, movimenti di terra, progressiva, offset, csv
from: 09639ce2
---

Una sezione trasversale mostra la strada come sarà costruita: attraverso il tracciato a una progressiva, il terreno esistente, il progetto (il corridoio o il piazzale sistemati) e lo scavo e il riporto tra di essi.

## Aggiungere linee di campionamento

1. Selezionare un tracciato. Nelle **Proprietà**, sotto **Linee di campionamento**, fare clic su {{ui:Aggiungi linee di campionamento}}.
2. Impostare **Ogni** (la spaziatura: 50 ft oppure 20 m come punto di partenza), **Larghezza sinistra** e **Larghezza destra** (quanto ogni sezione si estende dall'asse).
3. Per tagliare una sezione a una progressiva precisa, digitarla in **Aggiungi una progressiva** (per esempio `2+35`) e premere {{key:Enter}}.

Le sezioni sono tagliate a ogni multiplo intero della spaziatura, alle due estremità del tracciato, all'inizio e alla fine di ogni curva (PC e PT), e alle progressive aggiunte. Le linee di campionamento compaiono in pianta come linee grigie attraverso il tracciato; vanno anche in DXF, DWG e PDF sul layer C-ROAD-SCTN. Ogni modifica è un solo passo: {{key:Mod+Z}} la annulla.

## La vista delle sezioni

Aprirla con {{ui:Vista delle sezioni}} nelle **Proprietà** del tracciato, con {{ui:Sezioni}} sotto **Superficie** › {{ui:Altro}}, oppure con {{key:X}}. Prende il posto della vista del profilo sotto la pianta.

- Scorrere le sezioni con le frecce nella sua barra, con l'elenco delle progressive, oppure con {{key:Left}} e {{key:Right}} a vista delle sezioni attiva ({{key:Home}} e {{key:End}} per la prima e l'ultima).
- La linea grigia è il terreno esistente, la linea rossa il progetto. Lo scavo è campito in arancio, il riporto in verde. I punti del corridoio sono contrassegnati: CL (asse), EOP (margine della carreggiata), SH (banchina) e DL (intersezione con il terreno).
- L'intestazione riporta la progressiva, le aree di scavo e riporto di questa sezione e l'esagerazione verticale. **Adatta** riempie il pannello; scegliere 1× per vedere la sezione in scala reale.
- La linea spessa in pianta mostra quale sezione è a schermo.
- **Zoom e spostamento:** la rotella ingrandisce attorno al puntatore, e il trascinamento sposta la vista. {{ui:Adatta}} (oppure {{key:F}}, o un doppio clic) adatta di nuovo l'intera sezione.

## Misurare in una sezione

1. Fare clic su {{ui:Misura}} nella barra della sezione, oppure premere {{key:M}}. Il suggerimento dice "Fare clic sul primo punto, poi sul secondo."
2. Fare clic su due punti. Ciascuno si aggancia alla fine di una linea o a un punto del corridoio (CL, EOP, SH, DL); tenere premuto {{key:Alt}} per un punto libero.
3. La lettura riporta la distanza orizzontale (ΔH), la distanza verticale (ΔV), la pendenza in percentuale con il suo rapporto e la lunghezza retta, nelle unità del progetto.

Fare di nuovo clic per iniziare una nuova misura. {{key:Esc}} la cancella, e {{key:M}} disattiva Misura.

## Tavole delle sezioni

{{ui:Tavole delle sezioni (PDF)}} sotto **Linee di campionamento** mette ogni sezione su pagine PDF, in righe da sinistra a destra e dall'alto in basso in ordine di progressiva. Scegliere la **Carta**, la **Scala di pianta** (la scala orizzontale delle sezioni) e l'**Esagerazione del profilo** (1×, 2×, 5× o 10×); la finestra indica quante sezioni entrano in una pagina e quante pagine ne risultano.

Ogni sezione mostra una griglia con offset e quote, il terreno (tratteggiato), il progetto, lo scavo e il riporto campiti (arancio e verde), i punti del corridoio e, sotto di essa, la sua progressiva e le sue aree di scavo e riporto. Ogni sezione sulle tavole è disegnata della stessa dimensione, abbastanza alta per la più grande; quando ciò non entra nella pagina con l'esagerazione scelta, CivilCraft usa la più grande che entra e lo indica. La fascia del titolo riporta il tracciato, le progressive di quella pagina, le scale e "Tavola 1 di 3".

## A cosa sono misurati scavo e riporto

Un corridoio può avere strati sotto la pavimentazione: strati della pavimentazione, componenti dei modelli, massicciata. Il selettore **Volumi misurati fino a** nella barra della sezione sceglie fino a che cosa arrivano scavo e riporto:

- **Superficie inferiore** (l'impostazione iniziale): fino al fondo di quei componenti, così lo scavo include lo spessore della stratigrafia della pavimentazione.
- **Superficie superiore**: solo fino alla sommità del progetto, come prima che i componenti venissero conteggiati.

Le aree nell'intestazione, i volumi sotto, il CSV e il diagramma delle masse seguono tutti questa scelta, che è salvata con il progetto.

## Volumi con il metodo delle aree medie di estremità

Tra due sezioni vicine, il volume è la media delle loro due aree per la distanza tra le progressive. La barra mostra i totali del tracciato, e {{ui:CSV}} scarica le aree e i volumi di ogni sezione con i totali progressivi (yard cubi per i progetti in piedi, metri cubi per quelli metrici).

Le **Proprietà** mostrano gli stessi totali accanto ai volumi con il metodo a griglia di [Volumi di movimento terra](topic:volumes). I due sono approssimazioni diverse: sezioni più vicine li avvicinano, e su una strada rettilinea in piano coincidono.

:::note
Scavo e riporto sono conteggiati solo entro le aree sistemate (le linee di intersezione con il terreno di un corridoio o di un piazzale), come nel metodo a griglia. Senza un corridoio o un piazzale il progetto coincide con il terreno, quindi una sezione non mostra scavo né riporto.
:::

## Diagramma delle masse

**Diagramma delle masse** sotto **Linee di campionamento** disegna il diagramma delle masse dagli stessi volumi di area di estremità: lungo le progressive, il totale progressivo dello scavo meno il riporto.

- **Ritiro (−) o rigonfiamento (+) dello scavo** indica che cosa diventa un yard cubo di scavo una volta posto come riporto: −10 % (il valore iniziale, segnaposto) significa che si riduce a 0.9; una roccia che rigonfia potrebbe essere +5 %. Usare il dato della relazione geotecnica.
- Dove la linea sale la strada è in scavo; dove scende, in riporto. Sopra lo zero (campito in arancio) la terra si sposta verso le progressive crescenti; sotto lo zero (verde), verso quelle decrescenti.
- I **punti di equilibrio** sono dove la linea attraversa lo zero: tra due di essi scavo e riporto si bilanciano. La tabella elenca ogni tratto in equilibrio, il volume spostato (il suo punto più alto o più basso) e la distanza media di trasporto (l'area campita divisa per quel volume).
- Dove la linea termina fuori dallo zero, ciò che avanza è **materiale di scarto** (sopra) o **materiale di prestito** (sotto). In quell'ultimo tratto conta come spostata solo la terra oltre il livello su cui termina.

**CSV** salva l'ordinata delle masse a ogni sezione, i tratti e il fattore.
