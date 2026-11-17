---
title: Progettare un profilo verticale
summary: Aprire la vista del profilo, avviare un profilo di progetto dal terreno, aggiungere e trascinare i PVI, impostare le lunghezze delle curve verticali e leggere pendenze, valori K e punti alti e bassi.
keywords: profilo, tracciato verticale, pvi, curva verticale, pendenza, valore k, convessa, concava, bvc, evc, vista del profilo, quota di progetto, fg, profilo del terreno esistente, linee caratteristiche nel profilo, attraversamenti, proiettato, cordolo, fossato, etichette
from: e9182bfa
---

Ogni tracciato ha un profilo di progetto: un elenco di PVI (progressiva e quota) uniti da pendenze rettilinee, con una curva verticale parabolica simmetrica in corrispondenza di ogni PVI interno che abbia una lunghezza. Il profilo del terreno esistente viene campionato automaticamente dalla superficie.

## Aprire la vista del profilo

1. Selezionare il tracciato (fare clic su di esso con {{ui:Seleziona}}).
2. Premere {{key:R}}, oppure fare clic su {{ui:Profilo}} nella barra degli strumenti, oppure su {{ui:Vista del profilo}} in basso nel pannello destro.
   La vista del profilo si apre sotto la pianta con il terreno esistente lungo il tracciato. Con due o più tracciati, scegliere uno nell'elenco a sinistra della barra del profilo.

La vista mostra sempre l'intero tracciato e allunga le quote per riempire il pannello; l'esagerazione è riportata nell'angolo in basso a sinistra, per esempio "Esagerazione verticale 10×". Non ha zoom né pan.

Spostare il puntatore lungo il profilo: la barra mostra la progressiva, le quote del terreno e di progetto, la pendenza e lo sterro o riporto in quel punto, e un punto segue il tracciato nella pianta.

## Avviare il profilo di progetto

1. Nel pannello destro sotto **Profilo di progetto**, fare clic su {{ui:Inizia dal terreno}}.
   Due PVI vengono posti sul terreno alle due estremità del tracciato, uniti da una sola pendenza rettilinea. La barra di stato indica "Profilo di progetto avviato dal terreno alle due estremità. Attivare Aggiungi PVI e fare clic per aggiungere cambi di pendenza; assegnare loro una lunghezza di curva nella tabella."

Se il tracciato non interseca la superficie, compare "Questo tracciato non ha terreno sotto cui partire." In tal caso aggiungere i PVI facendo clic (sezione successiva).

## Aggiungere PVI

1. Premere {{key:I}}, oppure fare clic su {{ui:Aggiungi PVI}} nella barra del profilo. Il pulsante resta premuto.
2. Fare clic nel profilo dove si vuole un cambio di pendenza. Un PVI viene aggiunto a quella progressiva e quota, arrotondato a 0.01, e selezionato.
3. Aggiungere quanti ne servono, poi premere di nuovo {{key:I}} per smettere di aggiungere.

Un clic dove esiste già un PVI viene rifiutato ("Esiste già un PVI in …"). I PVI restano sempre in ordine di progressiva.

## Modificare i PVI

- **Trascinare** un PVI nel profilo per spostarlo. Non può superare i vicini. Lo spostamento è un solo passo di annullamento.
- **Digitare** valori esatti nella tabella dei PVI nel pannello destro: **Progressiva**, **Quota** e **Curva L** (lunghezza della curva verticale). Premere {{key:Enter}} dopo ciascuno.
- **Rimuovere** un PVI con la x alla fine della sua riga, oppure selezionarlo (fare clic) e premere {{key:Delete}}. Quando la vista del profilo ha il fuoco, anche {{key:Backspace}} lo rimuove.

Il primo e l'ultimo PVI non ricevono mai una curva.

## Curve verticali

1. Digitare una lunghezza in **Curva L** per un PVI interno, per esempio 200.
2. La curva viene disegnata centrata sul PVI. Il profilo e il pannello destro mostrano il suo tipo (convessa o concava), L e K, le progressive e le quote di BVC ed EVC, e il suo punto alto o basso quando è contenuto nella curva.

K è calcolato da L (K = L diviso la differenza algebrica delle pendenze, in percento). Si digita L; non è ancora possibile digitare K direttamente.

Se una curva verticale non entra, un riquadro rosso spiega perché: invade il PVI o la curva che la precede, oppure supera il PVI successivo, e quanto spazio c'è da quel lato (una curva richiede metà della sua lunghezza su ciascun lato del proprio PVI). Il suo pulsante imposta **la curva più lunga che entra**, con il suo K, come un solo passo ({{key:Mod+Z}} lo annulla). Oppure allontanare i PVI.

## Leggere i dati

Sotto la tabella dei PVI, un elenco riporta ogni pendenza in percento ("Pendenza 1: +1.25%") e ogni curva, per esempio "Convessa a 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", poi "Punto alto 1+62.40, 254.12".

Se i PVI non raggiungono entrambe le estremità del tracciato, una nota lo segnala. Un corridoio viene costruito solo dove il profilo e il tracciato si sovrappongono.

## Linee caratteristiche nel profilo

Le linee caratteristiche compaiono anche nella vista del profilo, così si può vedere un cordolo, un fossato o la sommità di un muro rispetto al profilo della strada.

- Dove una linea caratteristica **attraversa** il tracciato, il profilo mostra un piccolo rombo a quella progressiva e quota, etichettato con il nome della linea e la sua quota in quel punto (la quota della linea stessa, calcolata lungo il tratto che attraversa).
- Digitare una distanza in {{ui:Lungo il tracciato entro}} per disegnare anche le linee caratteristiche che **corrono accanto** al tracciato entro quella distanza, come linee tratteggiate alle proprie quote. Se vuoto o 0, mostra solo gli attraversamenti.
- Segni ed etichette seguono ogni modifica: spostare un vertice, digitare una pendenza o alzare la linea, e il profilo mostra subito le nuove quote.
- Fare clic sul rombo di un attraversamento per selezionare quella linea caratteristica; la linea selezionata viene disegnata con il colore di evidenziazione.
- {{ui:Linee caratteristiche}} nella barra del profilo nasconde o mostra tutte. Entrambe le impostazioni vengono salvate con il progetto.

Vedere [Linee caratteristiche](topic:feature-lines).

## Prossimi passi

- [Creare un corridoio stradale](topic:corridor) lungo il tracciato e questo profilo.
- Il profilo viene scritto in LandXML insieme al tracciato; vedere [Scambio LandXML](topic:landxml).
