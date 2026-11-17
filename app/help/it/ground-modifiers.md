---
title: Modificatori del terreno e quote in tempo reale
summary: Tutto ciò che modella il terreno di progetto in un unico elenco ordinato (vince il successivo dove si sovrappongono), sterro e riporto per ogni modificatore, verifiche dei raccordi nel pannello Problemi, e quote puntuali e frecce di pendenza che leggono il terreno in tempo reale.
keywords: modificatori del terreno, pila, ordine, terreno di progetto, terreno esistente, sovrapposizione, sterro e riporto, raccordo, muro di sostegno, bordo della pavimentazione, quota di posa, pianerottolo del gradino, quota puntuale, quota, freccia di pendenza, etichetta di pendenza, pendenze
from: 3998a5b0
---

Terreno di progetto = terreno esistente + i modificatori, in ordine. Il terreno esistente non viene mai modificato.

## L'elenco

{{ui:Levels}} › {{ui:Ground modifiers…}} elenca ogni oggetto che modella il terreno: piattaforme, terrapieni, fossette drenanti, aree di sistemazione, pavimentazioni e percorsi, aree piantumate con una quota di finitura, e gradini e rampe la cui casella **Modella il terreno** è spuntata (con le relative quote di base e di sommità). Dove due oggetti si sovrappongono, vince quello **successivo**. Trascinare una riga, oppure usare le frecce, per cambiare l'ordine; il terreno viene ricalcolato subito. Ogni riga mostra il proprio sterro e riporto (ciò che modella dopo quelli sopra), con il totale sotto l'elenco.

## Verifiche dei raccordi

Il pannello Problemi elenca, con **vai a**:

- un muro il cui lato alto è sopra la sua sommità (terra sopra il muro), oppure il cui lato basso mostra il suo plinto;
- un'area piantumata la cui quota di finitura è sopra il bordo della pavimentazione con cui confina, o più di 150 mm sotto di esso;
- gradini la cui base o sommità non si raccorda con la pavimentazione su cui atterrano;
- due modificatori che si sovrappongono (in quel punto vince il successivo).

Un muro di sostegno può avere la sommità che segue il lato alto del terreno: la sua altezza viene ricalcolata ogni volta che il terreno cambia.

## Un muro di sostegno che modella il terreno

Selezionare un muro di sostegno e spuntare **Modella il terreno**. La fascia sotto il muro (larga quanto lo spessore del muro) entra nell'elenco come modificatore:

- il bordo sul **lato alto** è mantenuto al terreno in quel punto, stazione per stazione, così la sommità del muro segue il lato alto (con il cordolo di coronamento sopra). Inserire una quota **Sommità** mantiene invece il lato alto a quella quota, meno il cordolo di coronamento;
- il bordo sul **lato basso** è mantenuto alla quota **Terreno mantenuto sul lato basso** che si inserisce, oppure, se lasciata vuota, al terreno in quel punto;
- il lato alto è quello il cui terreno è più alto su tutto il muro, quindi non si inverte mai lungo il muro;
- il terreno oltre la fascia non viene modificato, e il terreno esistente non viene mai modificato.

Come ogni modificatore, il muro compare nell'elenco, e un modificatore successivo a esso vince dove si sovrappongono. Un muro la cui quota mantenuta a un'estremità si discosta più di 150 mm tipici dal terreno esistente in quel punto genera un avviso nel pannello Problemi (con **vai a**). Un muro isolato non modella il terreno. La casella è disattivata nei file delle versioni precedenti, che quindi si aprono come erano.

## Quote puntuali e frecce di pendenza

{{ui:Spot level}} (un clic) e {{ui:Gradient arrow}} (due clic) leggono il terreno ogni volta che vengono disegnati: spostando o riportando in quota un oggetto, le etichette lo seguono. In Proprietà scegliere se un'etichetta legge il terreno di progetto o quello esistente; le etichette sul terreno esistente sono mostrate tra parentesi. Le frecce puntano verso il basso e riportano `1:20 (5.0 %)`.
