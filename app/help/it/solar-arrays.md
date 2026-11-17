---
title: Disporre un campo fotovoltaico a terra
summary: Collocare tavoli fotovoltaici a terra dentro una particella o un piazzale, con le file distanziate in base al terreno su cui sorge ciascuna, lasciando vuoto il terreno ripido, calcolando l'energia dell'anno e mostrando i tavoli in pianta e in 3D.
keywords: solare, fotovoltaico, pv, campo, montaggio a terra, tavoli, file, interasse delle file, ombra, terreno, pendenza, pali, produzione, kWp, energia, orizzonte
from: 95593fd6
---

## Cosa imparerai

Come disporre un campo di tavoli fotovoltaici su un sito non pianeggiante, e cosa significano i valori. Si apre da Superficie › Altro › Campi fotovoltaici.

## Disporre i tavoli

1. Scegliere **Dove**: una particella o un piazzale del progetto, oppure digitare i vertici di un'area. Spuntare i piazzali o le particelle che devono restare **vuoti** (un edificio, uno stagno).
2. Digitare la **latitudine e la longitudine** del sito. Il sole dipende da esse; nulla viene stimato. Se il progetto ha un sistema di coordinate, premere **Posiziona dal sistema di coordinate** per compilarle.
3. Impostare l'inclinazione, l'orientamento (vuoto significa verso l'equatore), quanti moduli compongono un tavolo e la potenza e le dimensioni del modulo. I valori del modulo partono da valori generici e sono etichettati come tali; digitare i propri.
4. Premere **Disponi i tavoli**. La finestra indica il numero di tavoli e di moduli, la dimensione in kWp e la distanza da fila a fila.

Ogni tavolo è una colonna nell'area, posizionata a partire dal fronte e spostata all'indietro. Un tavolo viene collocato solo dove il terreno sotto di esso rientra nel limite di pendenza, dentro l'area e il distacco dal confine, e dove i pali di cui ha bisogno non sono più alti del limite impostato. I punti che non superano la verifica restano vuoti, e la finestra indica quanti sono e perché.

## Le file sono distanziate in base al terreno

Su terreno piano le file stanno distanziate secondo la regola usuale di assenza d'ombra: l'ombra di una fila a mezzogiorno del solstizio d'inverno non deve raggiungere il bordo inferiore della fila successiva. Su una pendenza CivilCraft applica la stessa regola al terreno su cui sorge realmente la fila successiva. Dove il terreno sale dietro un tavolo, le file possono stare più vicine; dove scende, stanno più distanziate. La finestra mostra la distanza minima, massima e media accanto a quella su terreno piano, così si vede che effetto ha avuto il terreno.

Il piano di ciascun tavolo viene sollevato su pali finché ogni campione sotto di esso supera il terreno del franco impostato. Il palo più alto compare nel risultato.

## L'energia annua

**Energia annua** calcola la luce sul piano inclinato per un giorno rappresentativo di ogni mese, la temperatura delle celle, le perdite digitate, l'ombreggiamento reciproco dei tavoli e le colline all'orizzonte, che tolgono il sole che nascondono. Il cielo è sereno, quindi il risultato è un limite superiore; il tempo reale dà di meno. È una stima preliminare di progetto, non un rapporto di produzione.

## Conservare

**Salva nel progetto** conserva i dati di input e i risultati nel file di progetto; i tavoli vengono ricalcolati dal terreno all'apertura del file, quindi una superficie modificata li sposta. Compaiono in pianta e in 3D (Mostra › Campi fotovoltaici). L'elenco dei tavoli si scarica in CSV. Un passo di annullamento rimuove o ripristina un campo.

## Non ancora implementato

Dati meteo al posto del cielo sereno, tavoli che seguono il terreno in direzione est-ovest, inseguitori e il progetto elettrico (stringhe, cavi, inverter) in CivilCraft. Il pannello Solar PV di BimCraft gestisce stringhe e schema unifilare per i tetti.
