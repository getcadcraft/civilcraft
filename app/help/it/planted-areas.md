---
title: Aree piantumate: prati, aiuole, prati fioriti, coperture del suolo
summary: Aree piantumate come oggetti con una stratificazione (terriccio, pacciame, telo, bordatura), una miscela di piante e una quota finita facoltativa; si ritagliano da sole attorno a pavimentazioni, muri e gradini, e forniscono area netta, volumi, lunghezza della bordatura e conteggi delle piante.
keywords: area piantumata, prato, tappeto erboso, aiuola, bordura, prato fiorito, copertura del suolo, terriccio, pacciame, telo, telo antierbe, bordatura, quota finita, quantità, area netta, ritaglio
from: 2617ec0e
---

{{ui:Aree}} nel gruppo Paesaggio disegna un **prato**, un'**aiuola piantumata**, un **prato fiorito** o una **copertura del suolo**: fare clic sui suoi angoli e premere {{key:Enter}}. Un'aiuola o una copertura del suolo inizia riempita con la pianta scelta nella sezione Piante; un prato non ha piante.

## Cosa contiene

- **Stratificazione**: spessore del terriccio, spessore del pacciame, un telo antierbe e una bordatura (acciaio, legno, mattoni, calcestruzzo, plastica o nessuna). Gli spessori tipici sono già compilati; impostare i propri.
- **Miscela**: specie (con cultivar e misura) e percentuali, riempite come un'aiuola secondo l'interasse o la densità.
- **Quota finita**: lasciarla vuota e l'area segue il terreno; indicarne una quota e l'area diventa un modificatore del terreno (vedi [Modificatori del terreno e quote](topic:ground-modifiers)).
- **Ritaglio attorno a pavimentazioni, muri e gradini** (attivo per impostazione predefinita): dove pavimentazione, percorso, muro, cordolo, rampa o gradini si sovrappongono all'area, quella parte viene esclusa. Nessuna pianta viene messa sotto di essi o entro mezzo interasse dal loro bordo.

## Quantità

Le Proprietà mostrano l'**area netta** (dopo il ritaglio, misurata con precisione), il perimetro, la **lunghezza della bordatura** (solo lungo il bordo proprio dell'area, non dove la pavimentazione la taglia), i volumi di terriccio e pacciame, l'area del telo e i conteggi delle piante per riga di miscela. L'abaco delle piante conta le piante dell'area; il file delle quantità per TakeoffCraft riceve area, terriccio, pacciame, telo e bordatura; l'IFC del paesaggio scrive un IfcGeographicElement con un insieme di quantità.
