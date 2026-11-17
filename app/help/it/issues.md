---
title: Segnalazioni e BCF
summary: Fissa un problema sulla pianta, su una progressiva del tracciato, su un punto della superficie o su una tubazione, assegnagli uno stato e dei commenti, e scambia le segnalazioni come file BCF 2.1 insieme al file LandXML.
keywords: segnalazione, segnalazioni, bcf, commento, annotazione, anomalia, difetto, cantiere, segnaposto, stato, aperta, risolta, chiusa, formato di collaborazione BIM, landxml, problemi
from: e44153b1
---

Una segnalazione è una nota fissata a un punto del disegno CivilCraft, con un titolo, uno stato e dei commenti. Serve a indicare al personale di cantiere o a un altro programma che cosa controllare, e a leggere le risposte.

## Aggiungere una segnalazione

1. Aprire **Superficie, Altro, Segnalazioni (BCF)...**
2. Digitare un titolo e la descrizione del problema.
3. Scegliere dove fissarla: il centro della vista in pianta, il punto della superficie al centro, una progressiva del tracciato selezionato (digitare la progressiva e un offset; la destra è positiva), oppure la tubazione, il manufatto o la linea caratteristica selezionati.
4. Premere **Aggiungi segnalazione**. Il segnaposto compare sulla pianta come un piccolo rombo con il suo numero.

Fare clic sul titolo di una segnalazione per ingrandire la vista su di essa, cambiarne lo stato nell'elenco (Aperta, Attiva, Risolta, Chiusa) e aggiungere commenti. Ogni modifica è un passo di annulla e le segnalazioni sono salvate nel file di progetto.

## Scambiarle come BCF

- **Esporta BCF** scrive un file BCF 2.1 con un argomento per ogni segnalazione: titolo, stato, commenti e una vista con una telecamera ortogonale in pianta e il segnaposto.
- **Importa BCF** legge un file BCF (i file 2.0 e 3.0 sono letti nella misura in cui corrispondono alla 2.1). Un argomento con un guid già presente aggiorna quella segnalazione (stato, nuovi commenti) invece di aggiungerne una seconda.
- **Da Problemi** crea una segnalazione da ogni voce aperta nel pannello Problemi che indica dove si trova.

Il BCF riporta le misure in metri nelle coordinate proprie di questo progetto, senza spostamenti. L'altro programma deve usare lo stesso sistema di coordinate del file LandXML perché i segnaposto cadano nel punto giusto. L'elemento a cui punta un segnaposto (tracciato, progressiva, offset, tubazione) viene trasferito come etichette che iniziano con "cc:", che CivilCraft legge di nuovo.

## Cosa non è verificato

I segnaposto e le viste sono stati provati solo scrivendo un file e rileggendolo in CivilCraft. Nessun altro programma BIM lo ha ancora aperto, e se il "view to world scale" del BCF indichi l'altezza intera o la metà dell'altezza della vista varia da programma a programma: CivilCraft scrive l'altezza intera.
