---
title: L'area di lavoro Paesaggio
summary: Planimetrie di impianto, sistemazione, pavimentazioni, muri, gradini, irrigazione e tavole del paesaggio sullo stesso sito, sulle stesse superfici e nello stesso file dei lavori civili.
keywords: paesaggio, architettura del paesaggio, giardino, piantumazione, piante, alberi, sistemazione, superfici dure, pavimentazione, irrigazione, irrigatori, area di lavoro, progettazione del sito, planimetria del paesaggio
from: eea929d1
---

L'area di lavoro Paesaggio aggiunge gli strumenti di progettazione del paesaggio al sito CivilCraft che si ha già: gli stessi punti di rilievo, lo stesso terreno esistente, la stessa superficie di progetto e lo stesso file di progetto.

## Aprirla

Scegliere {{ui:Superficie}} › {{ui:Altro}} › {{ui:Area di lavoro Paesaggio}}. La barra degli strumenti mostra allora una scelta **Area di lavoro** e un gruppo **Paesaggio**, e i gruppi Superficie, Progettazione e GIS si fanno da parte per fare posto. Scegliere **Civil** sotto Area di lavoro per tornare indietro. CivilCraft ricorda l'area di lavoro usata per ultima su questo computer.

Il pannello di sinistra acquista tre sezioni in alto:

- **Piante**: l'elenco delle piante, per cercare e scegliere ciò che si posiziona. Vedere [L'elenco delle piante](topic:plant-list).
- **Verifiche della sistemazione**: analisi delle pendenze, frecce di deflusso e ristagno. Vedere [Sistemazione](topic:landscape-grading).
- **Irrigazione**: gli erogatori e le tubazioni da posizionare dopo, le impostazioni dell'alimentazione idrica. Vedere [Irrigazione](topic:irrigation).

## Che cosa c'è nel gruppo Paesaggio

| Strumento | Che cosa fa | Argomento |
|---|---|---|
| **Pianta**, **Aiuola**, **Siepe** | Singole piante, aiuole piantumate riempite alla spaziatura delle piante, siepi lungo una linea | [Piantumazione](topic:planting) |
| **Sistemazione** | Piattaforme, terrapieni, fossette drenanti, aree di sistemazione con quote puntuali e curve di livello, verifiche di pendenza e deflusso | [Sistemazione](topic:landscape-grading) |
| **Superfici dure** | Pavimentazioni, sentieri, muri, cordoli, rampe e gradini che seguono il terreno | [Superfici dure](topic:hardscape) |
| **Aree** | Aree piantumate: prati, aiuole, prati fioriti e copriterra con una stratigrafia, ritagliate intorno alle superfici dure | [Aree piantumate](topic:planted-areas) |
| **Quote** | Modificatori del terreno in ordine con sterro e riporto, quote puntuali, frecce di pendenza, linee di sezione | [Modificatori del terreno](topic:ground-modifiers), [Sezioni](topic:landscape-sections) |
| **Irrigazione** | Erogatori, tubazioni, valvole, linee a goccia, l'alimentazione, la copertura e una verifica idraulica | [Irrigazione](topic:irrigation) |
| **Altro** | Da una linea (oggetti collegati alle linee), l'abaco delle piante, la tabella piante, gli abachi, la grafica delle piante, oggetti a forma libera, tavole del paesaggio e set di pubblicazione, esportazione IFC, dimensione ed etichette delle piante | [Oggetti dalle linee](topic:objects-from-lines), [Schede delle piante](topic:plant-records), [Abachi](topic:worksheets), [Tavole del paesaggio](topic:landscape-sheets), [Oggetti a forma libera](topic:freeform-objects) |

Tutto ciò che si aggiunge è un solo passo di annullamento, viene salvato nel file di progetto e si disegna in pianta sui layer denominati `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` e `L-IRRG-…`, quindi anche le esportazioni DXF, DWG e PDF li includono.

## Una sola superficie per tutto

Piattaforme, terrapieni, fossette drenanti, aree di sistemazione, pavimentazioni e sentieri vengono sistemati nella **superficie di progetto**, la stessa usata da corridoi e piazzali. Il **terreno esistente** non cambia mai. Le piante stanno sul terreno sottostante, quindi si spostano quando cambia la sistemazione. I movimenti di terra contano la sistemazione del paesaggio insieme a tutto il resto.

:::tip
Prima volta? [Progettare un giardino, dall'inizio alla fine](topic:landscape-walkthrough) percorre l'intera area di lavoro sul sito di esempio.
:::
