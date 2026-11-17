---
title: Verifiche delle linee elettriche
summary: Cosa CivilCraft verifica su ogni linea e cavo, sempre aggiornato: distanze di sicurezza, interassi, oscillazione, sollevamento, carichi sui sostegni e dimensionamento, accessori, tiranti, fondazioni, dati mancanti, collegamenti, sovraccarichi e caduta di tensione.
keywords: verifiche, distanza di sicurezza, ostacolo, attraversamento, interasse delle fasi, oscillazione dell'isolatore, sollevamento, carico sul sostegno, carico nominale, dimensionamento, fondazione, tirante, strallo, accessorio, mensola, caduta di tensione, sovraccarico, dati mancanti, scollegato
from: e6a0da47
---

**Verifiche** nella sezione Linee elettriche elenca ogni problema: in rosso ciò che non è conforme, in ambra gli avvisi. Fare clic su una voce per selezionare la linea, il sostegno, il cavo o l'apparecchiatura a cui si riferisce; mentre l'area di lavoro è aperta, i sostegni e le campate non conformi sono cerchiati in rosso nella pianta.

:::warning
Uno strumento di progettazione: queste sono verifiche del progetto secondo le proprie regole, non una certificazione.
:::

## Distanze di sicurezza

La fase più bassa del conduttore viene seguita lungo ogni campata e in ogni ipotesi di carico. La sua distanza minima dal suolo deve raggiungere la **Regola di distanza** della linea. Dove una campata attraversa un **ostacolo** (disegnato con {{ui:Ostacolo}}: un punto o una linea, con la sua altezza sopra il suolo e una propria regola di distanza), la distanza sopra la sommità dell'ostacolo viene verificata allo stesso modo.

**Anche ciò che l'area di lavoro Paesaggio colloca sopra il suolo conta.** Piante singole (con la chioma alla dimensione adulta e in altezza), siepi e aiuole (la specie più alta tra quelle presenti) e muri (la loro sommità) sono ostacoli sotto una linea, senza doverli disegnare di nuovo. Mantengono le regole impostate in {{ui:Ipotesi di carico e limiti…}}: **Piante del paesaggio sotto una linea** (gli insiemi di esempio usano *Alberi e piante*, 3 m) e **Muri del paesaggio sotto una linea** (*Edificio*); scegliere **Non verificato** per escluderli. La distanza si misura in verticale dalla sommità della pianta o del muro al conduttore nel punto in cui la campata lo attraversa; la distanza laterale da una chioma accanto alla linea non viene verificata. Spostare un albero o alzare un muro modifica subito le verifiche.

Le regole di distanza sono personali: aprirle con **Regole…** accanto a una **Regola di distanza** (oppure da {{ui:Ipotesi di carico e limiti…}}) per aggiungerle, rinominarle, modificarle o rimuoverle.

## Interassi e oscillazione

- **Interasse delle fasi** richiesto: k·√(freccia + lunghezza dell'isolatore) + U/150, con la freccia dell'ipotesi a caldo e la tensione U in kV (una forma comune; k è quello della propria regola). Confrontato con l'interasse delle fasi della mensola.
- **Oscillazione dell'isolatore** sui sostegni di sospensione, nell'ipotesi di vento: atan(carico trasversale ÷ carico verticale), rispetto alla massima oscillazione della regola.
- **Sollevamento**: un sostegno di sospensione più basso dei suoi vicini può essere sollevato dal freddo; viene segnalato.

## Carichi sui sostegni e dimensionamento

Per ogni sostegno e ipotesi di carico, con tutti i conduttori della linea:

- **Trasversale**: vento al metro × campata del vento (metà delle due campate), più 2·H·sin(angolo ÷ 2) in corrispondenza di una deviazione.
- **Longitudinale**: la differenza delle tensioni dei due lati in un amarro o in un angolo; su un sostegno di sospensione solo con ghiaccio su un lato (ogni campata calcolata separatamente, con un margine a favore della sicurezza).
- **Verticale**: carico verticale al metro × campata di peso (tra i punti più bassi da entrambi i lati) più le apparecchiature.

Il carico orizzontale è riportato al punto nominale del sostegno (carico equivalente = carico × altezza di attacco ÷ altezza del punto nominale) e confrontato con il suo **carico nominale** × il fattore della regola. Quando è insufficiente, viene suggerito il sostegno più piccolo dello stesso materiale presente nella libreria che lo sopporta. Un sostegno con uno **strallo** trasferisce il carico orizzontale allo strallo, che sopporta carico ÷ sin(angolo dello strallo) e viene verificato rispetto alla propria portata.

Gli accessori (morsetti, isolatori, mensole) sono verificati rispetto alla loro portata: un accessorio di amarro sopporta la tensione del conduttore, un accessorio di sospensione la sua quota del carico verticale e trasversale. La **fondazione** indicata è la profondità del sostegno nel terreno e uno scavo leggermente più largo della sua base.

## Dati, collegamenti e corrente

- Un elemento con un campo richiesto vuoto, oppure una chiave che non è presente nella libreria.
- Un estremo di un percorso di cavo, o un'apparecchiatura, non collegato a nulla.
- **Caduta di tensione** e **corrente** da ogni sorgente (apparecchiatura indicata come sorgente) ai carichi (kW e fattore di potenza sull'apparecchiatura), lungo campate aeree e cavi: √3·I·L·(R cos φ + X sin φ), con R a 20 °C. Una corrente superiore alla portata del cavo, oppure una caduta maggiore di quella consentita dalla regola, viene segnalata.
