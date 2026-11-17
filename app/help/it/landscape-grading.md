---
title: Sistemazione del terreno per il paesaggio
summary: Piattaforme, terrapieni, fossette drenanti e sistemazione libera con quote puntuali e curve di livello che si trascinano, con sterro e riporto in tempo reale, analisi delle pendenze, frecce di deflusso e ristagni — tutto nella superficie di progetto di CivilCraft.
keywords: muro di sostegno, muri di sostegno, lato verticale, muro invece di scarpata, scarpata per lato, rilevato, sistemazione, sistemazione del paesaggio, piattaforma, terrazza, piazzale, terrapieno, dosso, fossetta drenante, quota puntuale, quota, curve di livello, modifica curve di livello, sterro e riporto, movimenti di terra, analisi delle pendenze, pendenze elevate, frecce di deflusso, drenaggio, ristagno, pozzanghere
from: e1559eb9
---

Tutto ciò che è qui viene sistemato nella **superficie di progetto** con la stessa sistemazione di piazzali e corridoi. Il **terreno esistente** non viene mai modificato, e i movimenti di terra lo contano tutto. Il menu Sistemazione si trova nel gruppo Paesaggio.

## Piattaforme

{{ui:Grade}} › {{ui:Platform}}, poi fare clic sui vertici e premere {{key:Enter}}. La piattaforma parte dalla quota media del terreno sotto di essa; inserire una **Quota** per impostarla, oppure lasciarla vuota per tornare a seguire il terreno. Una **Pendenza** in % e una **Pendenza verso** in gradi (0 = est, 90 = nord) la inclinano. I suoi lati sono sistemati fino al terreno con la **Scarpata di sterro** e la **Scarpata di riporto** (orizzontale a 1).

## Scarpate per lato e muri di sostegno

Sotto **Lati e muri di sostegno** nelle Proprietà di un piazzale, di una piattaforma o di un terrapieno, ogni lato può essere sistemato in un modo proprio. Il lato 1 va dal primo vertice cliccato al secondo, il lato 2 dal secondo al terzo, e così via.

- **Tutti i lati**: **Inclinato** usa le scarpate di sterro e di riporto sopra su ogni lato; **Verticali: muri di sostegno** mette un muro su ogni lato.
- Per lato: **Scarpate sopra**, **Scarpate proprie** (inserire una scarpata di sterro e una di riporto per quel lato) oppure **Verticale (muro di sostegno)**.
- Inserire una scarpata come `3` o `3:1` (orizzontale a 1 verticale), `33%` o `18.4°`; viene mostrata come H:1. La **Scarpata di sterro** e la **Scarpata di riporto** del piazzale accettano lo stesso formato.
- Un lato verticale non ha rilevato: un muro di sostegno corre lungo il bordo, dal piazzale giù fino al terreno esistente (in riporto) oppure dal terreno giù fino al piazzale (in sterro). Lo **Spessore del muro** (0,3 m o 1 ft come valore iniziale) è di quanto il terreno si sposta dal bordo del piazzale al terreno esistente. I volumi di sterro e riporto escludono il rilevato che quel lato non ha più.
- Dove un muro incontra un lato inclinato, la scarpata gira intorno all'estremità del muro; due muri si incontrano in un giunto a 45 gradi.
- Sotto i campi: la lunghezza dei muri, la faccia esposta (altezza × lunghezza), l'altezza massima e quella media.

La pianta disegna la faccia esterna di ciascun muro con brevi tratti trasversali, e la sua altezza alle due estremità e nel punto più alto (sul livello dei muri di sostegno, che entra anche in DXF e DWG). La vista 3D mostra i muri come solidi (Mostra › Muri di sostegno), e le esportazioni GLB, OBJ e USD li includono. Le sezioni attraverso il bordo mostrano il gradino.

**Avvisi** (nelle Proprietà e nel pannello Problemi): un muro più alto di **Avvisa sopra un'altezza di muro di** (1,0 m oppure 3,3 ft come valore iniziale) "potrebbe richiedere un muro progettato da un ingegnere o un permesso; verificare le norme locali", e, quando si inserisce la **Pendenza massima che il terreno regge**, qualsiasi lato la cui scarpata di sterro o di riporto è più ripida di quella. Sono avvisi: la sistemazione viene costruita comunque. Ogni modifica è un solo passo per {{key:Mod+Z}}.

## Terrapieni

{{ui:Grade}} › {{ui:Berm}}: un dosso la cui sommità è la sua **Altezza** sopra il terreno medio sotto di esso, con i lati sistemati fino al terreno.

## Fossette drenanti

{{ui:Grade}} › {{ui:Swale}}, poi fare clic lungo la fossetta **nel verso in cui scorre l'acqua** e premere {{key:Enter}}. Impostare la sua **Profondità**, la **Larghezza di fondo** (0 per una V) e la **Scarpata laterale**. Senza una **Pendenza**, il suo fondo segue il terreno, alla sua profondità sotto di esso, e non risale mai; inserire una pendenza per darle una pendenza costante a partire dal suo inizio.

## Quote puntuali e curve di livello

1. {{ui:Grade}} › {{ui:Grading area}}: fare clic sul contorno dell'area da modellare.
2. {{ui:Grade}} › {{ui:Spot elevation}}: fare clic dentro l'area. Inserire la sua quota in Proprietà, oppure usare i pulsanti ▲ ▼.
3. {{ui:Grade}} › {{ui:Edit a contour}}: fare clic su una curva di livello dentro l'area per prenderla come linea da rimodellare.

Selezionare una quota o una curva di livello e **trascinarla** (o i suoi punti) sulla pianta: la superficie segue quando si rilascia, come un solo passo di annullamento. Dentro l'area il terreno viene ricostruito a partire dal suo bordo (dove incontra il terreno esistente), dalle quote puntuali e dalle curve di livello modificate.

## Sterro e riporto in tempo reale

Le Proprietà di ogni oggetto di sistemazione mostrano il suo **Sterro** e il **Riporto** e quelli dell'intero sito, con il metodo a griglia usato da Movimenti di terra, mentre si modifica. I problemi (fuori dalla superficie, un contorno che si incrocia da sé) vi sono elencati.

## Verifiche della sistemazione

Nella sezione **Verifiche della sistemazione** a sinistra:

- **Analisi delle pendenze** colora la superficie per gradiente: fino al limite dolce, tra i due, e più ripida del limite ripido (5 % e 33,3 % come valori iniziali: il consueto 1:20 per i percorsi accessibili e 1:3 per lo sfalcio). La legenda indica quanta area ricade in ciascuna classe. Le aree ripide vengono stampate anche sulle tavole.
- **Frecce di deflusso e ristagni** disegna la direzione in cui scorre l'acqua e contrassegna ogni punto in cui ristagnerebbe, con la sua profondità; la sezione indica quanti punti sono, il più profondo e quanta acqua contengono.

Le verifiche leggono la superficie di progetto quando qualcosa è stato sistemato, altrimenti il terreno esistente.
