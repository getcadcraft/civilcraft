---
title: Disegnare con snap, angoli scelti e spostare, copiare, ruotare
summary: Collocare tracciati, piazzali, particelle e linee caratteristiche esattamente su punti e angoli già esistenti, digitare o scegliere Est e Nord di un angolo, orientare una tangente verso due punti, e spostare, copiare o ruotare un oggetto per una distanza o un angolo.
keywords: snap, osnap, snap a punto, snap ad angolo, pi, vertice, angolo, scelta, mirino, est, nord, coordinate, coordinate digitate, tangente, direzione, sposta, copia, ruota, trasforma, copia ruotata, duplica, alt, punto libero, disegno
from: 49864dda
---

Novità nella versione 0.9: quando si disegna, il cursore si posa sui punti e sugli angoli già presenti nella pianta, e un angolo di piazzale, particella o linea caratteristica può essere digitato o scelto. Questo argomento illustra i tre strumenti.

## Cosa si farà

- Disegnare con snap, così un nuovo tracciato, piazzale, particella o linea inizia e finisce esattamente su qualcosa che esiste.
- Impostare Est e Nord di un angolo, digitandoli o scegliendo un punto nella pianta.
- Orientare una tangente di tracciato verso due punti scelti.
- Spostare, copiare o ruotare un intero oggetto.

## Passaggi

1. Scegliere uno strumento di disegno, per esempio {{ui:Alignment}}, {{ui:Pad}}, {{ui:Parcel}} o {{ui:Feature line}}. Portare il puntatore vicino a un punto di rilievo, a un PI di tracciato, a un angolo di piazzale, particella o massa, a un vertice di linea caratteristica o a un manufatto di acque meteoriche. Compare un indicatore con un'etichetta (PI, Angolo, Vertice, Manufatto o Punto con il suo numero) e l'Est e il Nord su cui cadrà. Fare clic per collocare il punto lì.
2. Per collocare un punto liberamente, tenere premuto {{key:Alt}} mentre si fa clic. Lo snap si disattiva.
3. Selezionare un piazzale, una particella o una linea caratteristica. Nelle Proprietà, il blocco {{ui:Corners}} elenca ogni angolo con una casella Est e una casella Nord. Digitare nuovi numeri, oppure premere il pulsante a mirino accanto a un angolo e fare clic su un punto della pianta. L'angolo assume quell'Est e quel Nord. Premere {{key:Esc}} per annullare una scelta. Il mirino funziona solo nella pianta: chiudere prima la vista 3D.
4. Per orientare una tangente, selezionare un tracciato. Nelle Proprietà, sotto {{ui:Tangent from two points}}, scegliere la tangente, premere {{ui:First point}} e fare clic nella pianta, premere {{ui:Second point}} e fare clic di nuovo, poi premere {{ui:Set direction}}. La tangente gira per andare dal primo punto verso il secondo e mantiene la sua lunghezza.
5. Per spostare, copiare o ruotare, selezionare un tracciato, un piazzale, una particella o una linea caratteristica. Nelle Proprietà, sotto {{ui:Move, copy and rotate}}, digitare {{ui:Move east}} e {{ui:Move north}} (i numeri negativi vanno a ovest e a sud) e premere {{ui:Move}} o {{ui:Copy}}. Oppure premere {{ui:Distance from two points}} e fare clic sul punto da cui spostare e sul punto in cui spostare.
6. Per ruotare, digitare l'angolo in {{ui:Rotate counter-clockwise}} (gradi), poi premere {{ui:Rotate}} o {{ui:Copy rotated}}. Ruota attorno al centro dei suoi angoli, a meno che non si scelga con il mirino accanto all'angolo un punto attorno a cui ruotare.

## Note

- Una copia lascia l'originale dove si trova ed è selezionata dopo.
- Ogni spostamento, copia, rotazione, angolo scelto e tangente orientata è un passo di Annulla.
- Gli snap raggiungono 10 pixel dello schermo dal cursore. Un indicatore di snap offre solo un punto; non si cambia nulla finché non si fa clic.
- Lo stesso mirino è sulle righe PI di un tracciato. Vedi [Tracciati](topic:alignment), [Particelle](topic:parcels) e [Linee caratteristiche](topic:feature-lines).
