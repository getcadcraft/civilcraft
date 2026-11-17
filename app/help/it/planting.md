---
title: Piani di piantumazione e abachi
summary: Collocare singole piante, aiuole di piantumazione riempite all'interasse delle piante con piante miste per percentuale, e siepi; etichettarle; contarle in un abaco delle piante per un foglio di calcolo o per TakeoffCraft.
keywords: piano di piantumazione, abaco delle piante, aiuola, piantumazione di massa, siepe, albero, arbusto, copertura del suolo, interasse, interasse triangolare, conteggio piante, quantità, etichette, chioma, simboli delle piante, ifc, computo
from: ab49eab5
---

## Collocare le piante

1. Scegliere una pianta in **Piante** a sinistra.
2. Fare clic su {{ui:Pianta}}, poi fare clic sulla planimetria: ogni clic colloca una pianta. Premere {{key:Esc}} per fermarsi.

Il simbolo di una pianta è disegnato alla larghezza di chioma a maturità; Altro › {{ui:Mostra alla dimensione di impianto}} disegna ogni pianta alla dimensione con cui viene messa a dimora. Gli alberi poggiano sul terreno sotto di essi: quando in seguito si sistema il sito, seguono il terreno. Per fissare una pianta a una quota, digitarla in **Quota** nelle Proprietà.

## Aiuole di piantumazione

1. Scegliere la pianta principale, fare clic su {{ui:Aiuola}} e fare clic sugli angoli dell'aiuola. Premere {{key:Enter}} (o fare di nuovo clic sul primo angolo) per chiuderla.
2. L'aiuola si riempie con quella pianta alla sua interasse, con uno schema **triangolare** (quello usuale: ogni pianta è alla stessa distanza da altre sei), a mezzo interasse dal bordo.
3. Nelle Proprietà, **Aggiungi una pianta** mescola la pianta scelta a sinistra. Impostare la **Quota %** di ciascuna pianta: l'aiuola ne prende esattamente quella percentuale, distribuita su tutta l'area. **Mescola di nuovo** rimescola la loro posizione.

Con **Interasse** vuoto si usa l'interasse proprio delle piante (ponderato con le loro quote); inserirne uno per usarlo per tutte le piante. **Schema** può essere quadrato, e **Righe a** ruota le file.

## Siepi

Scegliere la pianta della siepe, fare clic su {{ui:Siepe}}, fare clic lungo la siepe e premere {{key:Enter}}. Le piante vanno lungo la linea al loro interasse, centrate in modo che entrambe le estremità abbiano lo stesso margine. Una siepe può essere **su due file, sfalsata**, a una distanza stabilita.

## Etichette

Le singole piante sono etichettate con l'impostazione delle etichette (`{name}` per impostazione predefinita); digitare un'etichetta propria per una pianta nelle Proprietà. Le aiuole sono etichettate con il conteggio di ciascuna pianta, le siepi con il loro. Altro › {{ui:Etichette delle piante}} attiva e disattiva le etichette. Campi delle etichette: `{name}`, `{botanical}`, `{size}` (il contenitore), `{qty}`, `{height}`, `{spread}`, `{container}`.

## L'abaco delle piante

Altro › {{ui:Abaco delle piante…}} conta ogni pianta per specie, dalle piante singole, aiuole e siepi insieme, con la sua dimensione di impianto. Salvarlo come **CSV** o **XLSX**, oppure **Invia a TakeoffCraft**: un file delle quantità che TakeoffCraft apre per prezzare le piante (con le quantità di pavimentazioni e irrigazione accanto).

## IFC

Altro › {{ui:Esporta IFC del paesaggio}} salva il paesaggio come file IFC (IFC 4.3) che un modello BIM può contenere: ogni pianta è un `IfcGeographicElement` di tipo VEGETATION, tipizzata per specie con le proprietà della pianta (nome botanico, dimensioni, rusticità, acqua, luce), ogni aiuola e siepe è un unico elemento con i suoi conteggi, nel sito. BimCraft lo apre accanto all'edificio.
