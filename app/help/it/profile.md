---
title: Progetta un profilo longitudinale
summary: Apri la vista del profilo, avvia un profilo di progetto dal terreno, aggiungi e trascina i PVI, imposta le lunghezze delle curve verticali e leggi pendenze, valori K e punti alti e bassi.
keywords: profilo, allineamento verticale, pvi, curva verticale, pendenza, valore k, cresta, sacca, bvc, evc, vista del profilo, quota di progetto, fg, profilo del terreno esistente, linee caratteristiche nel profilo, attraversamenti, proiettato, cordolo, fosso, etichette
from: dbb1f32d
---

Ogni tracciato ha un solo profilo di progetto: un elenco di PVI (progressiva e quota) uniti da livellette rettilinee, con una curva verticale parabolica simmetrica in ogni PVI interno che abbia una lunghezza. Il profilo del terreno esistente viene campionato dalla superficie automaticamente.

## Aprire la vista del profilo

1. Selezionare il tracciato (fare clic con {{ui:Seleziona}}).
2. Premere {{key:R}}, oppure fare clic su {{ui:Profilo}} nella barra degli strumenti, oppure su {{ui:Vista del profilo}} in fondo al pannello destro.
   La vista del profilo si apre sotto la pianta con il terreno esistente lungo il tracciato. Con due o più tracciati, sceglierne uno nell'elenco a sinistra della barra del profilo.

La vista inizia mostrando l'intero tracciato e allungando le quote per riempire il pannello; l'esagerazione è riportata nell'angolo in basso a sinistra, per esempio "Esagerazione verticale 10×".

## Zoom e spostamento del profilo

- **Zoom:** girare la rotella del mouse (oppure pizzicare sul trackpad) e la vista ingrandisce attorno al puntatore. Tenere premuto {{key:Shift}} per ingrandire solo le progressive, oppure {{key:Alt}} per ingrandire solo le quote (ciò cambia l'esagerazione). Con la vista del profilo attiva, i tasti più e meno ingrandiscono dal centro.
- **Spostamento:** trascinare con il pulsante destro o centrale del mouse, oppure scorrere con due dita sul trackpad.
- **Adatta:** fare doppio clic sul profilo o premere {{key:F}} per mostrare di nuovo l'intero tracciato.

Modificare un PVI mantiene lo zoom scelto; la vista non torna ad adattarsi.

Spostare il puntatore lungo il profilo: la barra mostra la progressiva, le quote del terreno e di progetto, la pendenza e lo scavo o il riporto in quel punto, e un punto segue il tracciato in pianta.

## Avviare il profilo di progetto

1. Nel pannello destro, sotto **Profilo di progetto**, fare clic su {{ui:Inizia dal terreno}}.
   Due PVI vengono posti sul terreno alle due estremità del tracciato, uniti da un'unica livelletta rettilinea. La barra di stato indica "Profilo di progetto avviato sul terreno ad entrambe le estremità. Attivare Aggiungi PVI e fare clic per aggiungere cambi di pendenza; assegnare loro una lunghezza di curva nella tabella."

Se il tracciato non attraversa la superficie, compare "Questo tracciato non ha terreno sotto cui partire." In tal caso aggiungere i PVI facendo clic (sezione successiva).

## Aggiungere PVI

1. Premere {{key:I}}, oppure fare clic su {{ui:Aggiungi PVI}} nella barra del profilo. Resta premuto.
2. Fare clic nel profilo dove si vuole un cambio di pendenza. Un PVI viene aggiunto a quella progressiva e quota, arrotondato a 0.01, e selezionato.
3. Aggiungere quanti ne servono, poi premere di nuovo {{key:I}} per interrompere l'aggiunta.

Un clic dove c'è già un PVI viene rifiutato ("Esiste già un PVI a …"). I PVI restano sempre in ordine di progressiva.

## Aggancio durante l'aggiunta o il trascinamento

Il pulsante **Aggancio** nella barra del profilo è attivo all'inizio. Finché è attivo, un PVI aggiunto o trascinato si posa sul PVI più vicino, sul punto del terreno, sulla progressiva di un PVI o sulla linea del terreno, e un'etichetta accanto al simbolo indica quale. Tenere premuto {{key:Alt}} per un punto libero, ovunque.

## Regolare i PVI

- **Trascinare** un PVI nel profilo per spostarlo. Non può superare i suoi vicini. Lo spostamento è un solo passo di annullamento.
- **Digitare** valori esatti nella tabella dei PVI del pannello destro: **Progressiva**, **Quota**, **Pendenza %** e **Curva L** (lunghezza della curva verticale). Premere {{key:Enter}} dopo ciascuno.
- **Scegliere** un valore dal profilo: il piccolo pulsante accanto alla progressiva o alla quota di un PVI attende un clic nella vista del profilo e inserisce quel valore. Il clic si aggancia come in Aggiungi PVI; tenere premuto {{key:Alt}} per un punto libero; {{key:Esc}} annulla.
- **Pendenza %** è la pendenza della tangente che parte da quel PVI e arriva al successivo. Digitandola si sposta la quota del **PVI successivo** (la sua progressiva non si sposta mai). Se il PVI successivo è bloccato, si sposta invece la quota del PVI precedente.
- **Bloccare** un PVI con il lucchetto alla fine della sua riga. Un PVI bloccato non viene trascinato, e una modifica di pendenza non lo sposta. Se entrambe le estremità di una tangente sono bloccate, la sua pendenza non può cambiare: la barra di stato lo segnala, e occorre prima sbloccare un'estremità. Il blocco è salvato nel file.
- **Rimuovere** un PVI con la x alla fine della sua riga, oppure selezionarlo (fare clic) e premere {{key:Delete}}. Quando la vista del profilo ha il fuoco, anche {{key:Backspace}} lo rimuove.

Il primo e l'ultimo PVI non ricevono mai una curva.

## Curve verticali

1. Digitare una lunghezza in **Curva L** per un PVI interno, per esempio 200.
2. La curva è disegnata centrata sul PVI. Il profilo e il pannello destro ne mostrano il tipo (cresta o sacca), L e K, le progressive e le quote di BVC ed EVC, e il suo punto alto o basso quando ne ha uno all'interno della curva.

K è calcolato da L (K = L diviso la differenza algebrica delle pendenze, in percentuale). Si digita L; digitare K direttamente non è ancora disponibile.

Se una curva verticale non entra, un riquadro rosso indica il motivo: invade il PVI o la curva che la precede, oppure supera il PVI successivo, e quanto spazio c'è da quel lato (una curva richiede metà della sua lunghezza da ciascun lato del suo PVI). Il suo pulsante imposta **la curva più lunga che entra**, con il suo K, come un solo passo ({{key:Mod+Z}} lo annulla). Oppure allontanare i PVI.

## Leggere i dati

Sotto la tabella dei PVI, un elenco riporta ogni pendenza in percentuale ("Pendenza 1: +1.25%") e ogni curva, per esempio "Cresta a 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", poi "Punto alto 1+62.40, 254.12".

Se i PVI non raggiungono entrambe le estremità del tracciato, una nota lo segnala. Un corridoio viene costruito solo dove profilo e tracciato si sovrappongono.

## Linee caratteristiche nel profilo

Le linee caratteristiche compaiono anche nella vista del profilo, così si vede un cordolo, un fosso o la sommità di un muro rispetto al profilo della strada.

- Dove una linea caratteristica **attraversa** il tracciato, il profilo mostra un piccolo rombo a quella progressiva e quota, con l'etichetta del nome della linea e la sua quota in quel punto (la quota propria della linea, calcolata lungo il tratto che attraversa).
- Digitare una distanza in {{ui:Lungo il tracciato entro}} per disegnare anche le linee caratteristiche che **corrono accanto** al tracciato entro quella distanza, come linee tratteggiate alle loro quote. Vuoto o 0 mostra solo gli attraversamenti.
- I segni e le etichette seguono ogni modifica: spostare un vertice, digitare una pendenza o alzare la linea, e il profilo mostra subito le nuove quote.
- Fare clic sul rombo di un attraversamento per selezionare quella linea caratteristica; la linea selezionata è disegnata con il colore di evidenziazione.
- {{ui:Linee caratteristiche}} nella barra del profilo nasconde o mostra tutte. Entrambe le impostazioni sono salvate con il progetto.

Vedi [Linee caratteristiche](topic:feature-lines).

## Prossimi passi

- [Sweep di un corridoio stradale](topic:corridor) lungo il tracciato e questo profilo.
- Il profilo viene scritto in LandXML insieme al tracciato; vedi [Scambio LandXML](topic:landxml).
