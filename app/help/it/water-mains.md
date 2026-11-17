---
title: Acquedotti: pressioni, portate e portata antincendio
summary: Disegnare sul piano una rete in pressione di nodi, serbatoi di carico, vasche, tubazioni, pompe e valvole riduttrici di pressione; CivilCraft calcola carichi, pressioni e portate (Hazen–Williams, reti magliate), la portata disponibile per un incendio e una giornata di domanda. Funzione sperimentale; ogni risultato richiede la verifica di un ingegnere.
keywords: acqua, acquedotto, distribuzione idrica, rete in pressione, tubazione in pressione, rete magliata, hazen-williams, fattore C, perdita di carico, pressione residua, portata antincendio, idrante, domanda, nodo, serbatoio di carico, vasca, pompa, curva della pompa, valvola riduttrice di pressione, prv, valvola di ritegno, periodo esteso, epanet, inp, velocità
from: df46bf6d
---

Gli acquedotti sono la parte in pressione di un sito: tubazioni sempre piene, con l'acqua spinta da un serbatoio di carico, una vasca o una pompa. CivilCraft calcola il carico e la pressione in ogni nodo e la portata in ogni tubazione, incluse le reti magliate in cui l'acqua ha più di un percorso. È in fase di verifica e per ora è disponibile in forma sperimentale.

**Solo uno strumento di calcolo.** Ogni valore richiede la verifica di un ingegnere abilitato: il risultato è buono quanto le domande, le quote, i diametri delle tubazioni e i valori di scabrezza che sono stati forniti, e un modello a regime non tiene conto del colpo d'ariete, della qualità dell'acqua o del comportamento reale di una pompa antincendio.

## Disegnare la rete

1. Sotto **Superficie** › {{ui:Altro}}, scegliere {{ui:Acquedotti…}}. La finestra resta aperta mentre si lavora sul piano.
2. Scegliere {{ui:Serbatoio di carico}} e fare clic sul piano nel punto della fonte. Il suo carico parte da 100 ft (30 m) sopra il terreno; modificarlo in **Proprietà**.
3. Scegliere {{ui:Nodo}} e fare clic in ogni punto in cui l'acqua viene prelevata o le tubazioni si incontrano. Un nodo prende la sua quota dal terreno; digitare una quota diversa nelle Proprietà per sostituirla.
4. Scegliere {{ui:Tubazione}}, fare clic su un nodo, poi sul nodo che collega. Lo strumento resta attivo per la tubazione successiva. Una {{ui:Pompa}} e una {{ui:Valvola riduttrice di pressione}} si disegnano allo stesso modo, dal nodo di aspirazione (o di monte) al nodo di mandata (o di valle). Una {{ui:Vasca}} si posiziona come un nodo.
5. Selezionare un nodo e digitare la sua {{ui:Domanda}} (gpm, oppure L/s in un progetto in metri). Selezionare una tubazione e impostare il suo {{ui:Diametro}} (in, oppure mm) e, se lo si conosce, il suo coefficiente C di Hazen–Williams.

Ogni modifica è un unico passo di annullamento. Delete elimina il nodo e le tubazioni che vi terminano.

## Significato di ciascun elemento

- **Tubazione.** La lunghezza è misurata lungo il piano, a meno che non se ne digiti una. C è la scabrezza di Hazen–Williams (130 come valore iniziale; il valore predefinito si cambia nella finestra). Un coefficiente di perdita localizzata K somma le perdite di curve e raccordi. Selezionare **Valvola di ritegno** per una tubazione che non deve far passare acqua all'indietro; una tubazione **Chiusa** non trasporta nulla.
- **Serbatoio di carico.** Una sorgente a carico fisso, il livello dell'acqua che mantiene sopra il piano di riferimento. Fornisce o assorbe ciò di cui la rete ha bisogno.
- **Vasca.** Un livello che varia nel corso della giornata. Nei risultati a regime è una sorgente al suo livello attuale.
- **Pompa.** Un punto di progetto (portata e prevalenza) definisce la curva consueta che vi passa: la prevalenza a portata nulla è il 133 % di quella di progetto, e la prevalenza è nulla a una portata doppia di quella di progetto. Una pompa non spinge mai l'acqua all'indietro.
- **Valvola riduttrice di pressione.** Mantiene la pressione impostata a valle quando l'alimentazione è più alta. Quando l'alimentazione è più bassa è aperta e non mantiene nulla; se l'acqua andrebbe all'indietro, si chiude.

## Leggere i risultati

La finestra mostra il carico e la pressione di ogni nodo e la portata, la velocità e la perdita di carico per 1,000 ft (oppure per km) di ogni collegamento, con i nodi colorati sul piano: verde tra la pressione minima e quella massima impostate, rosso sotto, ambra sopra. Le frecce di flusso mostrano la direzione. Selezionare un nodo o una tubazione per leggerne i valori nelle Proprietà.

Sotto le tabelle c'è un elenco di cosa controllare: pressione bassa o alta, una tubazione più veloce del limite impostato, un nodo isolato da ogni sorgente, oppure un solutore che non ha raggiunto la convergenza. Le stesse segnalazioni compaiono nel pannello Problemi. I limiti si impostano nella finestra (20 psi, 100 psi e 10 ft/s come valori iniziali; 140 kPa, 700 kPa e 3 m/s in un progetto in metri).

## Portata antincendio

{{ui:Portata antincendio…}} disegna una portata in un nodo e mostra la pressione lì e la pressione minima ovunque nella rete. Calcola anche la portata disponibile in quel nodo mantenendo la pressione residua indicata sul nodo più debole della rete. Le altre domande restano invariate.

## Una giornata di domanda

{{ui:Una giornata di domanda…}} esegue la rete ora per ora. Fornire il profilo di domanda nelle impostazioni del file (un elenco di moltiplicatori che si ripete); le vasche si riempiono e si svuotano con la portata in entrata e in uscita, e una pompa può seguire un profilo di accensione e spegnimento. Una vasca che raggiunge il suo livello massimo o minimo viene indicata nell'elenco: CivilCraft non chiude per conto proprio il suo ingresso o la sua uscita, quindi va letto come "questa vasca è troppo piccola oppure la pompa troppo grande".

## Testo EPANET

{{ui:Salva come testo EPANET (.inp)}} scrive la rete nel formato di testo semplice che molti programmi per l'acqua leggono, e {{ui:Apri testo EPANET (.inp)…}} ne legge uno. Passa solo ciò che CivilCraft modella: nodi, serbatoi di carico, vasche, tubazioni, pompe con curva di prevalenza, valvole riduttrici di pressione, profili di domanda e tempi. Gli altri tipi di valvola, le pompe definite per potenza e le altre formule di perdita di carico vengono indicati per nome ed esclusi. Il file deve usare le stesse unità del progetto.

## Idranti, valvole e raccordi

Selezionare un nodo e spuntare **Idrante** per inserirvene uno; selezionare una condotta e premere **Aggiungi a metà** per inserirvi una valvola, una valvola d'aria, uno scarico o un contatore. Sono oggetti della rete: si spostano con essa e un unico passo di annullamento li rimuove.

Il layout implica anche dei raccordi, che CivilCraft elenca senza che venga richiesto: un raccordo a T dove si incontrano tre condotte, una croce dove ne incontrano quattro, una curva (con il suo angolo) dove due condotte deviano di 5° o più, un riduttore dove si incontrano due diametri e un tappo a un'estremità cieca. {{ui:Abaco dei raccordi (CSV)}} li conta, insieme alle condotte per diametro. Si tratta di ciò che il layout implica, una computazione da verificare con i propri dettagli, non di un elenco da ordinare.

Le condotte sono posate a terreno meno una copertura (4 ft oppure 1.2 m) in modo da poterle disegnare e modellare in 3D; le pressioni sopra non dipendono mai da essa.

## Sul piano e nei file

Il piano, il PDF e il DWG o DXF riportano le condotte sul layer **C-WATR-MAIN** con i loro diametri sul layer **C-WATR-TEXT**, gli idranti sul layer **C-WATR-HYDR**, le valvole sul layer **C-WATR-VALV** e i raccordi sul layer **C-WATR-FITT**. Il LandXML in uscita scrive una rete di tubazioni (un manufatto per ogni nodo, una tubazione per ogni condotta, idranti con nome); il LandXML in entrata la rilegge come condotte, senza domande, pompe o valvole, che LandXML non contiene. L'esportazione IFC scrive le condotte come segmenti di tubazione, idranti, valvole e raccordi in un unico sistema idrico. Questi file sono stati verificati con i nostri lettori e scrittori; provarli negli altri programmi e comunicarci cosa risulta.

## Cosa non è ancora disponibile

Qualità e età dell'acqua, controlli e regole oltre l'accensione e lo spegnimento di una pompa, altri tipi di valvola, domanda in funzione della pressione, tubazioni con diametro variabile, e portate fognarie nel tempo. Vedere [Non ancora implementato](topic:not-built-yet). Le portate di progetto per acque nere, che sono un calcolo diverso, sono in [Portate di progetto per acque nere](topic:sanitary-design).
