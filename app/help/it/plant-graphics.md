---
title: Grafica delle piante per scala, simboli propri e piante 3D
summary: Come le piante sono disegnate in planimetria a ogni scala di disegno e livello di dettaglio, e come un record di pianta riceve il proprio simbolo (SVG, oppure blocco DXF/DWG) e il proprio modello 3D (OBJ, STL o GLB).
keywords: grafica delle piante, simbolo della pianta, simbolo per scala, livello di dettaglio, dettaglio, cerchio semplice, contorno, simbolo dettagliato, simbolo proprio, blocco, svg, dxf, dwg, pianta 3D, modello 3D proprio, obj, stl, glb, gltf, modello di albero, piante in 3D
from: 875837d9
---

## Simboli in planimetria per scala

Paesaggio › {{ui:Altro}} › {{ui:Grafica delle piante}} imposta come sono disegnate le piante in planimetria. **Automatico, per scala** sceglie uno dei tre livelli in base alla scala di disegno:

- **Cerchio semplice** (più grossolano di 1:500): un cerchio alla larghezza di chioma della pianta.
- **Contorno con centro** (da 1:500 a 1:200): il cerchio e una piccola croce al centro.
- **Simbolo dettagliato** (più fine di 1:200): il simbolo proprio del record, se ne ha uno, altrimenti il simbolo integrato.

Modificare le due scale con **Semplice da 1:** e **Contorno da 1:**, oppure scegliere un solo livello per tutte le scale. Ogni set di tavole nella finestra Tavole ha il proprio **Dettaglio pianta in planimetria**, quindi una planimetria del sito a 1:500 e una planimetria di impianto a 1:100 possono differire. Le impostazioni sono salvate con il progetto.

## Il proprio simbolo

Selezionare una pianta nella sezione Piante e premere {{ui:Simbolo proprio…}}. Legge un SVG, oppure un blocco di un disegno DXF o DWG (se il disegno contiene più blocchi, se ne sceglie uno). Il simbolo è adattato alla larghezza di chioma della pianta e disegnato al livello dettagliato. È conservato nel progetto, quindi il file lo accompagna.

- Da un SVG vengono lette linee, polilinee, poligoni, rettangoli, cerchi, ellissi e percorsi. Script, stili, collegamenti e immagini al suo interno non vengono mai esaminati. Le trasformazioni non sono applicate: viene segnalato quando il file le contiene, quindi conviene appiattirle prima nel programma di disegno.
- Limiti: 512 KB di SVG e 2000 forme. Un file più grande viene rifiutato, con il motivo.

## La propria pianta 3D

{{ui:Modello 3D proprio…}} sullo stesso record legge un file **OBJ**, **STL** o **GLB**. Poi, in Grafica delle piante, impostare **Piante in 3D** su **Modello proprio di ogni record**: ogni pianta di quel record mostra il proprio modello, scalato alla sua altezza e alla sua larghezza di chioma. I record senza un modello proprio mantengono le forme integrate. Scegliere **Masse semplici** per viste rapide di siti estesi.

Un GLB viene letto solo per la forma:

- Tutto ciò di cui il modello ha bisogno deve trovarsi all'interno del file .glb. Un modello che rimanda ad altri file (un .bin separato, o immagini tramite indirizzo) viene rifiutato: non viene scaricato nulla.
- La geometria compressa o impacchettata (Draco, meshopt, posizioni quantizzate) non viene letta. Esportare senza compressione.
- Texture e colori nel file non vengono usati: il modello è disegnato con il colore della pianta. Le texture sono comunque verificate, e una texture più grande di 4096 pixel per lato viene rifiutata.
- Limiti: un file di 32 MB, 50 000 triangoli (contando ogni copia di una parte collocata più volte), 64 immagini e 16 MB di immagini.

Ogni limite rifiuta il file con il motivo; nulla di parzialmente letto viene conservato. Il caricamento del simbolo o del modello è un unico passo di annulla, e {{ui:Rimuovi simbolo proprio}} o {{ui:Rimuovi modello 3D proprio}} lo eliminano di nuovo.

Vedi [Record delle piante](topic:plant-records) per il record stesso, e [Visualizzare il sito in 3D](topic:site-3d).
