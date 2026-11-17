---
title: Esportazione e importazione IFC
summary: Salvare l'intero progetto in un unico file IFC in IFC 4.3, IFC4 o IFC2x3 (tracciati, strade, movimenti di terra, superfici, muri, tubazioni), e aprire file IFC per i loro tracciati e le superfici.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, tracciato, ifcalignment, strada, ifcroad, movimenti di terra, tin, consegna, approvvigionamento, esporta ifc, importa ifc
from: 6b998bcf
---

IFC è il formato di scambio aperto che molti committenti pubblici richiedono come elaborato da consegnare. CivilCraft scrive l'intero progetto in un unico file IFC e legge da file IFC i tracciati e le superfici.

## Esportazione

1. Fare clic su {{ui:IFC}} nel gruppo **Esporta** (negli stili della barra multifunzione: {{ui:Output}} › {{ui:Export}} › {{ui:IFC}}).
2. Scegliere lo schema. **IFC 4.3 ADD2** è il primo e il predefinito: è l'edizione con tracciati, strade e movimenti di terra. Scegliere IFC4 o IFC2x3 solo quando il software del destinatario non legge la 4.3.
3. La finestra di dialogo indica cosa conterrà il file e cosa lascia fuori lo schema scelto. Fare clic su {{ui:Export IFC}}.
   Il file viene scaricato come "*nome progetto*-ifc4x3.ifc", "-ifc4.ifc" o "-ifc2x3.ifc". CivilCraft ricorda l'ultimo schema scelto.

## Cosa contiene ciascuno schema

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Tracciati | IfcAlignment con i suoi sviluppi planimetrici (rettifili, archi circolari, clotoidi) e altimetrici (pendenze, curve paraboliche), le sue curve (IfcCompositeCurve, IfcGradientCurve), la progressiva iniziale e gli eventi di sopraelevazione | Una polilinea 3D su un elemento civile | Una polilinea 3D su un proxy |
| Corridoi | IfcRoad con le parti di strada; corsie, banchine, cunette e marciapiedi come IfcPavement, cordoli come IfcKerb, fasce alberate; ogni strato della pavimentazione come IfcCourse con spessore, materiale e volume; le scarpate come IfcEarthworksCut e IfcEarthworksFill con i volumi di sterro e riporto; la velocità di progetto e la classe | Elementi civili denominati per ciò che sono, raggruppati per strada | Proxy, raggruppati per strada |
| Superfici | IfcGeographicElement TERRAIN con una rete irregolare triangolata | Insiemi di facce triangolate | Modelli di superficie basati su facce (file più grandi) |
| Piazzali e muri | La sommità del piazzale, le sue scarpate come movimenti di terra, i muri di sostegno come IfcWall RETAININGWALL | Lo stesso, con il muro come tipo di muro definito dall'utente | Lo stesso, con il tipo del muro in ObjectType |
| Reti di tubazioni | IfcPipeSegment e IfcDistributionChamberElement in un IfcDistributionSystem | Lo stesso | IfcFlowSegment e pozzetti in un IfcSystem |
| Georeferenziazione | IfcProjectedCRS e IfcMapConversion | Lo stesso | ePSet_ProjectedCRS e ePSet_MapConversion sul sito |

Una **ferrovia** (un tracciato con Ferrovia attiva) va in IFC 4.3 come IfcRailway: le sue transizioni come tipi propri (clotoide, parabola cubica, Bloss, Helmert, semionda sinusoidale come curva coseno, sinusoide), la sua sopraelevazione come IfcAlignmentCant, e il suo binario come rotaie, traverse e massicciata, con la sottomassicciata sotto. IFC4 e IFC2x3 ricevono le stesse parti come elementi civili o proxy. Aprendo una ferrovia IFC 4.3 si recuperano le sue transizioni e la sua sopraelevazione.

Ogni file contiene anche le particelle (impronte), le piante e le superfici dure dello spazio di lavoro Paesaggio, e le masse degli edifici (ciascuna un IfcBuilding con i suoi piani), tutto in un unico sito. I set di proprietà riportano ciò che è stato progettato: progressive, sezione tipo, scarpate di sterro e riporto, larghezza e numero delle corsie, quote di fondo, chiusini, altezze dei muri; le quantità (lunghezze, aree, volumi) sono set di IfcElementQuantity.

## Unità e coordinate

Il file è nell'unità di lunghezza del progetto (metri, oppure piedi US survey); aree e volumi sono in metri quadrati e cubi. Con un sistema di coordinate (GIS › Coordinate) il file viene collocato sulla mappa: le coordinate Est e Nord della sua origine, e la rotazione e la scala di un sistema locale del terreno, sono nella conversione cartografica. Senza di esso, il file registra la sua origine locale in un set di proprietà e non viene collocato su una mappa.

## Importazione

Aprire un file .ifc con {{ui:Open}} oppure trascinarlo sulla pianta. La finestra di dialogo di importazione indica cosa contiene il file:

- I **tracciati** dalla IFC 4.3 (gli sviluppi planimetrici e altimetrici) e le curve di tracciato IFC 4x1 diventano tracciati CivilCraft con i loro PI, raggi, lunghezze delle clotoidi e PVI. Un tracciato che il modello PI di CivilCraft non può contenere (curve composte, clotoidi tra due curve, uno che inizia o finisce in una curva) non viene importato, e la finestra di dialogo ne spiega il motivo.
- **Superfici**: scegliere quella che diventa il terreno esistente, oppure mantenere quella del progetto.
- **Tutto il resto** (e le altre superfici) può essere mostrato nella vista 3D come riferimento. Gli elementi di riferimento restano finché il progetto è aperto; non vengono salvati nel file di progetto.

Un file scritto da CivilCraft in IFC4 o IFC2x3 recupera i suoi tracciati esattamente dai loro set di proprietà.

## Non ancora implementato

- La sopraelevazione di una strada viene scritta come eventi di sopraelevazione e nelle superfici stradali (la sopraelevazione in senso ferroviario è per le ferrovie).
- Il salvataggio degli elementi di riferimento nel file di progetto, e l'importazione di reti di tubazioni o piazzali da IFC come oggetti modificabili.
