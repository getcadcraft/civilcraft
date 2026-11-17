---
title: Scambiare LandXML
summary: Aprire LandXML da altri programmi civili come nuovo progetto, esportare punti, superfici, tracciati, profili e la rete di tubazioni come LandXML 1.2, e sapere che cosa non viaggia.
keywords: landxml, xml, importazione, esportazione, scambio, tin, superficie, tracciato, profilo, rete di tubazioni, interoperabilità, scambio dati
from: 870d5ece
---

LandXML è il formato di scambio aperto che la maggior parte dei programmi civili legge e scrive. CivilCraft legge e scrive LandXML 1.2. Se si è usato Civil 3D, le sue finestre di importazione ed esportazione LandXML sono l'equivalente più vicino; qui non ci sono scelte da fare, e le note indicano che cosa è stato lasciato fuori.

## Aprire un file LandXML

1. Fare clic su {{ui:Apri}} (oppure premere {{key:Mod+O}}) e scegliere il file `.xml` o `.landxml`, oppure trascinarlo sulla pianta.
2. Se il progetto corrente ha modifiche non salvate, CivilCraft lo chiede prima. Scegliere {{ui:Salva una copia}}, {{ui:Non salvare}} oppure {{ui:Annulla}}.
3. Viene creato un **nuovo progetto**. La barra di stato indica che cosa è stato letto, per esempio "Aperto site.xml: 412 punti, 2 superfici, 3 tracciati."
4. Guardare il riquadro sotto i dati della **Superficie**. Elenca tutto ciò che è stato saltato o cambiato, per esempio:
   - "È stata aperta solo la prima superficie ("EG"); il file ne ha 1 in più."
   - "Il tracciato "Ramp A" ha elementi che CivilCraft non sa ancora disegnare (non linee, archi o clotoidi); è stato saltato."
   - "Le regole della rete di tubazioni non erano nel file; sono in uso i segnaposto — impostare le proprie in Progetto."

Che cosa diventa che cosa:

| Nel file | In CivilCraft |
|---|---|
| Units (Imperial o Metric) | Le **Unità** del progetto (piedi o metri) |
| Nome del progetto | Il **Nome** del progetto |
| CgPoints | I punti del progetto; la descrizione (o il codice) indica il gruppo |
| La prima superficie TIN | Il terreno esistente, usato così com'è ("Superficie (da LandXML)") |
| Ogni tracciato di linee, archi e clotoidi | Un tracciato con i suoi PI, raggi e lunghezze di raccordo, ricostruiti dalle curve |
| Il primo profilo di progetto di ogni tracciato | Il suo profilo di progetto, con curve verticali paraboliche |
| La prima rete di tubazioni | La rete di tubazioni, con i suoi chiusini, pozzetti e fondi |
| Linee caratteristiche di linee e archi | Linee caratteristiche, archi mantenuti; da un altro programma iniziano come **Solo disegnata** |

L'elenco completo di elementi e attributi è in [LandXML: cosa viene letto e scritto](topic:landxml-reference).

:::note
Una superficie letta da LandXML non viene ricostruita quando si cambiano i gruppi di punti o si disegnano linee di discontinuità. Fare clic su {{ui:Ricostruisci la superficie dai punti}} nella sezione **Superficie** per costruirla invece dai punti ({{key:Mod+Z}} riporta la superficie LandXML).
:::

## Esportare LandXML

1. Fare clic su {{ui:LandXML}} nel gruppo **Esporta**.
2. Il browser scarica `<name>.xml`. La barra di stato indica che cosa è stato incluso, per esempio "Esportato LandXML 1.2: 276 punti, 2 superfici, 1 tracciato, la rete di tubazioni. I piazzali non fanno parte di LandXML in questo caso; lo è la superficie sistemata."

Il file contiene:

- **Unità**: piedi di rilievo USA o metri.
- **CgPoints**: ogni punto con il suo numero come nome, la sua descrizione e il suo gruppo come codice.
- **Superfici**: il terreno esistente come TIN, con le sue linee di discontinuità e il confine esterno come dati di origine; e, quando piazzali o corridoi sistemano il terreno, una seconda superficie TIN denominata "Proposed".
- **Tracciati**: linee, archi e clotoidi con le loro progressive, ciascuno con un profilo che contiene il terreno esistente campionato lungo di esso e il profilo di progetto (PVI e curve paraboliche) quando ha almeno due PVI.
- **PipeNetworks**: strutture con i loro chiusini, pozzetti e fondo per ogni tubazione, e le tubazioni con diametro, lunghezza e pendenza.
- **PlanFeatures**: ogni linea caratteristica come linee e archi, con la quota a ciascun estremo e a che cosa serve.

## Che cosa non viaggia

- Piazzali e corridoi come oggetti. Il loro risultato è nella superficie "Proposed".
- Tracciati con errori (per esempio curve sovrapposte): esclusi e conteggiati nel messaggio di stato.
- Tubazioni senza entrambi i fondi, e reti con meno di due strutture.
- Un chiusino preso dalla superficie viene scritto come chiusino fisso. Riaperto, la struttura conserva quel numero anche se la superficie cambia.
- Regole della rete (pendenza minima, copertura, salto): LandXML non ha un posto per esse.
- Impostazioni di visualizzazione e scelte di superficie dei gruppi di punti: salvare un progetto CivilCraft per quelli.

Quando si apre, CivilCraft non legge spirali diverse dalla clotoide, superfici a griglia, punti che si limitano a riferirsi ad altri punti, particelle catastali, spirali nelle linee caratteristiche, strade o dati di rilievo. Ciascuno è indicato nelle note, mai ipotizzato.

## Andate e ritorni

Per consegnare il lavoro a chi usa altri programmi civili e riaverlo indietro, esportare LandXML, lasciare che lo modifichi, e aprire il suo LandXML come nuovo progetto. Conservare anche il proprio `.civilcraft.json`: è l'unico file che conserva tutto ciò che CivilCraft sa.
