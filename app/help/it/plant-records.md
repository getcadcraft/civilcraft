---
title: Record delle piante, cultivar e misure fornite
summary: L'elenco di piante proprio del progetto come tabella: cultivar, misure fornite (contenitore, zolla, circonferenza, fusto libero), densità, note di specifica, CSV in entrata e in uscita; ogni pianta collocata indica una misura; simboli per scala e propri simboli e modelli 3D.
keywords: tabella piante, banca dati piante, cultivar, varietà, misura fornita, contenitore, zolla, zolla radicale, a radice nuda, circonferenza, fusto libero, densità, piante per metro quadro, specifica, note di specifica, simbolo della pianta, blocco, simbolo proprio, pianta 3D, livello di dettaglio, scala
from: 12251beb
---

Aprire {{ui:Tabella piante}} dal menu {{ui:Altro}} del gruppo Paesaggio, oppure dalla sezione Piante. Ogni riga è un record di pianta nell'elenco proprio di questo progetto (un record dell'elenco piante viene copiato quando lo si aggiunge). Ogni modifica viene verificata come un file importato, e costituisce un unico passo di annulla.

## Le colonne

- **Nome botanico**, **Nome comune**, **Tipo**, **Altezza** e **Larghezza** a maturità (metri).
- **Interasse** (da centro a centro) oppure **Densità** (piante per m²). Un'aiuola di un record con densità e senza interasse viene riempita a quella densità, secondo il proprio schema (triangolare o quadrato).
- **Misure fornite**: una voce per misura, separate da `;`. Ogni voce è un identificativo, un tipo (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) e poi uno qualsiasi di: un volume `10L`, un'altezza `h0.6`, una larghezza `s0.4`, una circonferenza `g14-16` (cm), un fusto libero `st1.8`. Esempio: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Cultivar**: nomi separati da `;`. Un cultivar mantiene le proprie misure e note quando il file importato le aveva.
- **Note di specifica**.

{{ui:Duplica}} copia una riga con una nuova chiave; {{ui:Salva come CSV}} e {{ui:Salva come file di piante}} scrivono l'elenco (le righe CSV dei cultivar stanno sotto la loro specie, con `cultivar_of`). Importare un CSV o un file di piante lo unisce all'elenco.

## Il proprio elenco di piante della Libreria

Accedere al proprio account CadCraft (Impostazioni, I tuoi add-on, Accedi) e la tabella delle piante può usare l'elenco che si conserva nella Libreria:

- {{ui:Dall'elenco della libreria}} porta i propri elementi pianta (anche quelli ancora in attesa di revisione). Una pianta già presente qui viene aggiornata dalla Libreria; i cultivar, le misure fornite, la densità e la specifica aggiunti qui vengono mantenuti.
- {{ui:Salva come elenco di piante}} salva ogni riga come proprio elemento pianta della Libreria, un elemento per specie: una nuova pianta diventa un nuovo elemento, una pianta modificata diventa una nuova versione, una invariata viene lasciata com'è. Selezionare prima la casella: salvando, le piante vengono rese pubbliche con licenza CC0. Un primo caricamento pubblico da una persona non ancora considerata affidabile viene verificato da una persona prima di comparire, come ogni caricamento.

La Libreria conserva il record di pianta di base. Cultivar, misure fornite, densità e note di specifica restano nel progetto e nel file di piante ({{ui:Salva come file di piante}}); la finestra indica ogni volta quante righe ne sono interessate.

## Una pianta collocata indica una misura

Selezionare una pianta, una siepe, o una riga di miscela di un'aiuola o di un'area piantumata: quando il record ha cultivar o misure fornite, {{ui:Cultivar e misura}} ne sceglie una. L'abaco delle piante conta allora per specie, cultivar e misura, e un'etichetta può mostrarle: `{botanical} '{cultivar}' {size}` oppure `{full}`.

## Simboli delle piante per scala

{{ui:Grafica delle piante}} (Paesaggio › Altro) imposta come le piante sono disegnate in planimetria: **automatico** (più grossolano di 1:500 un cerchio alla larghezza di chioma, tra 1:200 e 1:500 un contorno con il centro, più fine il simbolo dettagliato; entrambe le scale si possono modificare) oppure un solo livello per tutte le scale. La finestra Tavole ha il proprio **Dettaglio pianta in planimetria** per quel set.

Su un record nella sezione Piante, {{ui:Simbolo proprio…}} legge un SVG, oppure un blocco di un disegno DXF/DWG, e lo disegna alla larghezza di chioma della pianta al livello dettagliato. {{ui:Modello 3D proprio…}} legge un OBJ, STL o GLB; in Grafica delle piante scegliere **Modello proprio di ogni record** per vederlo in 3D. I file sono limitati (512 KB di SVG, 2000 forme, 50 000 triangoli) e conservati nel progetto. Le trasformazioni SVG non sono applicate (viene segnalato quando un file le contiene). Vedi [Grafica delle piante, propri simboli e piante 3D](topic:plant-graphics) per i livelli, i limiti e il contenuto ammesso di un GLB.
