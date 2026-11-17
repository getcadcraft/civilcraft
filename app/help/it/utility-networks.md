---
title: Reti di servizi e OpenStreetMap
summary: Tracciati di acqua, fognatura, acque meteoriche, gas, energia e telecomunicazioni con materiale, diametro, copertura e proprietario; dati OpenStreetMap da un file JSON di Overpass; attraversamenti, sezioni di scavo e volumi; layer dei servizi in DWG, DXF e PDF; segmenti IFC di tubazioni e cavi.
keywords: rete, reti, servizio, osm, openstreetmap, overpass, tubazione, cavo, gas, fognatura, acque meteoriche, telecomunicazioni, energia, acqua, idrante, pozzetto, scavo, attraversamento, distanza libera, copertura, profondità, dwg, ifc, georeferenziato, layer
from: 8a85dace
---

Disegna i servizi interrati di un'area come una rete per ogni servizio, verifica dove si incrociano e inviali come layer di disegno e come IFC.

## Crea i tracciati

Apri **Superficie, Altro, Reti di servizi...**

- **Crea un tracciato dalla selezione** trasforma l'allineamento, la linea caratteristica o la tubazione selezionati in un tracciato del servizio scelto. Poi compila nella tabella materiale, diametro (mm), copertura (la profondità fino alla sommità della tubazione o del cavo) e proprietario.
- **Leggi dati OpenStreetMap** legge un file JSON di Overpass salvato (una query con `out geom;`). Il progetto richiede prima un sistema di coordinate, perché le posizioni di OpenStreetMap sono in latitudine e longitudine. Vengono letti: condotte (per sostanza), cavi interrati di energia e di telecomunicazione, idranti, pozzetti e caditoie. Tutto il resto viene conteggiato come escluso e segnalato nel messaggio. Le linee aeree sono escluse.
- **Aggiungi la mappa OpenStreetMap** aggiunge la mappa OpenStreetMap sotto la planimetria. Viene disegnata solo se i layer cartografici da internet sono attivi nelle Impostazioni.

## Verifiche e risultati

- **Attraversamenti**: i tracciati di servizi diversi che si incrociano in pianta sono elencati con la distanza libera in altezza tra loro, dove esiste una superficie del terreno; il minimo è un valore segnaposto da impostare, non il valore di una norma.
- **Scavo**: ogni tracciato ottiene uno scavo (diametro della tubazione più distanza libera per lato, scarpata laterale, letto di posa) con un volume. Il totale è mostrato nella finestra e nel CSV.
- **Disegno**: tracciati e punti sono nei layer dei servizi (per esempio U-WATR-RUN, U-POWR-RUN), quindi passano in PDF, DXF e DWG.
- **IFC**: i tracciati entrano nell'esportazione IFC come segmenti di tubazione e segmenti di cavo, con idranti, valvole e camere, un sistema per servizio, nel sistema di coordinate del progetto.

## Dati OpenStreetMap

I dati OpenStreetMap sono protetti da copyright dei contributori di OpenStreetMap e concessi in licenza ODbL. L'attribuzione è aggiunta al disegno, al CSV e all'IFC. Se si condivide un file che contiene dati OpenStreetMap, mantenere l'attribuzione e rispettare le condizioni di condivisione con la stessa licenza previste dalla licenza.

## Cosa non è ancora implementato

I tracciati non vengono ancora disegnati punto per punto in pianta con uno strumento, e gli attraversamenti non sono ancora disegnati nella vista del profilo (il calcolo è pronto). Profondità, diametri e distanze libere sono inizialmente segnaposto: usare i valori della propria norma.
