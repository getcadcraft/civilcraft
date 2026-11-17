---
title: Calcolare le portate di progetto delle acque nere e verificare la fognatura
summary: Inserire le persone e la superficie che entrano in ogni pozzetto di una rete di acque nere; CivilCraft le somma lungo la rete, calcola la portata di punta con un coefficiente di punta e le infiltrazioni, e verifica la capacità e la velocità di ogni tubazione.
keywords: acque nere, fognatura, fognatura nera, acque reflue, portata di progetto, portata di punta, coefficiente di punta, harmon, babbitt, infiltrazioni, popolazione, per abitante, percentuale di riempimento, autopulente, velocità, dimensionamento delle tubazioni, foglio di progetto
from: 73ba197a
---

Le portate di progetto delle acque nere lavorano sulla [rete di tubazioni](topic:pipe-network) quando il suo {{ui:Tipo}} è {{ui:Acque nere}}. Senza nulla selezionato, il pannello destro mostra allora **Portate di progetto delle acque nere**, dove una rete meteorica mostra lo smaltimento delle acque meteoriche.

## Inserire ciò che arriva

1. Selezionare un pozzetto. In **Portate di progetto delle acque nere**, digitare {{ui:Persone che entrano qui}} e {{ui:Superficie che entra qui}} (ettari nei progetti metrici, acri in quelli in piedi).
2. Per negozi, uffici o industrie, digitare le persone equivalenti: la superficie per le persone per ettaro (o per acro) usate dal proprio ente. La superficie conta comunque per le infiltrazioni.
3. Ripetere per ogni pozzetto a cui si collega una strada o un lotto. Un pozzetto a cui nulla si collega resta a 0 per entrambi.

Ogni tubazione porta tutto ciò che entra nel suo pozzetto superiore e a monte di esso. Selezionare un pozzetto per vedere che cosa vi passa.

## Le impostazioni

| Impostazione | Significato |
|---|---|
| {{ui:Portata per persona}} | la portata media di una persona al giorno: litri (progetto metrico) o galloni USA (progetto in piedi) |
| {{ui:Infiltrazioni}} | acqua di falda che filtra: litri al secondo per ettaro, o galloni al giorno per acro |
| {{ui:Coefficiente di punta}} | Harmon, 1 + 14 / (4 + √P), oppure Babbitt, 5 / P^0.2, con P la popolazione in migliaia |
| {{ui:Coefficiente di punta minimo}} / {{ui:Coefficiente di punta massimo}} | il coefficiente è mantenuto tra questi due valori |
| {{ui:n di Manning}} | per capacità e velocità |
| {{ui:Velocità minima}} / {{ui:Velocità massima}} | alla profondità propria della portata di punta nella tubazione |
| {{ui:Massimo della capacità piena}} | quanto può essere riempita una tubazione alla punta, in percentuale di ciò che porta a piena |

I valori iniziali sono valori provvisori, non una norma. Usare i valori pubblicati dal proprio ente.

## Che cosa calcola

Per ogni tubazione, nell'ordine di flusso:

- portata di punta = persone × portata per persona × coefficiente di punta + superficie × infiltrazioni
- capacità a piena (equazione di Manning alla pendenza della tubazione) e quanto la punta la riempie
- altezza normale della portata di punta e la velocità in quella sezione

La tabella **Risultati acque nere** elenca per ogni tubazione le persone, il coefficiente di punta, la portata di punta (L/s, oppure gpm e piedi cubi al secondo), la percentuale di riempimento e la velocità. I problemi sono elencati sotto: una tubazione più piena del limite, più lenta della velocità minima (potrebbe non autopulirsi), più veloce della massima, o senza pendenza. {{ui:Dimensiona le tubazioni per queste portate}} sceglie per ogni tubazione la dimensione standard più piccola (da 200 mm o 8 pollici in su) che porta la sua punta entro il limite; un {{key:Mod+Z}} lo annulla.

:::note
Questa è la portata di punta stazionaria che calcola un foglio di progetto, verificata su un foglio di progetto pubblicato fino ai suoi arrotondamenti stampati. Non è un modello della fognatura nel tempo: nessun idrogramma, accumulo, pompa o troppopieno. Vedere [Non ancora implementato](topic:not-built-yet).
:::

Le velocità usano l'equazione di Manning con lo stesso n a ogni profondità. Alcuni enti usano diagrammi di riempimento parziale in cui n varia con la profondità, il che dà una velocità leggermente inferiore in una tubazione riempita al 60-70 per cento (circa il 3 per cento in meno).
