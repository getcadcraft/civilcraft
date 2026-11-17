---
title: L'area di lavoro Linee elettriche
summary: Linee aeree e cavi interrati sul proprio cantiere, con proprie librerie, freccia e tensione secondo le proprie ipotesi di carico, verifiche di distanza e resistenza, tabelle di tesatura, quantità, tavole ed esportazione GIS.
keywords: linea elettrica, linea aerea, elettrico, distribuzione, pali, sostegni, conduttore, freccia, tensione, tesatura, distanza di sicurezza, cavo interrato, trincea, area di lavoro, gestore di rete
from: 638dd856
---

L'area di lavoro Linee elettriche colloca linee aeree e cavi interrati sul cantiere CivilCraft che si ha già: gli stessi punti di rilievo, lo stesso terreno, lo stesso file di progetto.

:::warning
Uno strumento di progettazione. L'area di lavoro calcola freccia, tensione, distanze e carichi a partire dalle **proprie** ipotesi di carico e dai propri limiti; non è integrata alcuna norma di alcun paese. Un ingegnere verifica ogni risultato rispetto alla norma applicabile prima di costruire.
:::

## Aprirla

Scegliere {{ui:Superficie}} › {{ui:Altro}} › {{ui:Area di lavoro Linee elettriche}}, oppure **Linee elettriche** sotto Area di lavoro. La barra degli strumenti mostra quindi un gruppo **Linee elettriche**; i gruppi Progettazione e GIS vengono nascosti. Scegliere **Civil** sotto Area di lavoro per tornare indietro. CivilCraft ricorda l'area di lavoro usata per ultima su questo computer.

Il pannello sinistro acquisisce in alto due sezioni:

- **Linee elettriche**: le proprie ipotesi di carico e limiti, le linee e i cavi del progetto, e **Verifiche**, sempre aggiornate. Fare clic su una verifica per selezionare ciò a cui si riferisce.
- **Libreria**: i propri conduttori, cavi, sostegni, apparecchiature e tipi di trincea. Vedere [La propria libreria di linee elettriche](topic:power-line-library).

## Cosa contiene il gruppo Linee elettriche

| Strumento | Funzione | Argomento |
|---|---|---|
| **Linea** | Una linea aerea: fare clic su ogni sostegno | [Disegnare una linea aerea](topic:overhead-line) |
| **Sostegno** | Aggiunge un sostegno su una campata | [Disegnare una linea aerea](topic:overhead-line) |
| **Cavo** | Un percorso di cavo interrato in una trincea | [Cavi interrati](topic:underground-cables) |
| **Apparecchiatura** | Un armadio, un trasformatore, un giunto, oppure la sorgente da cui è alimentata la rete | [Cavi interrati](topic:underground-cables) |
| **Ostacolo** | Qualcosa che una linea attraversa: una strada, un edificio, un'altra linea | [Verifiche](topic:power-line-checks) |
| **Profilo** | Il profilo della linea: terreno, sostegni e conduttore a ogni ipotesi di carico | [Disegnare una linea aerea](topic:overhead-line#the-line-profile) |
| **Altro** | Ipotesi di carico e limiti, tabelle di tesatura, quantità, tavole e relazione, GIS, file di studio | [Freccia e tensione](topic:sag-and-tension), [Risultati](topic:power-line-outputs), [File di studio](topic:power-line-study-file) |

Ogni elemento aggiunto costituisce un solo passo di annullamento, viene salvato nel file di progetto e viene disegnato nella pianta sui layer denominati `C-POWR-…`, quindi anche le esportazioni DXF, DWG e PDF lo includono.
