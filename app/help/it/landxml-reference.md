---
title: LandXML: cosa viene letto e scritto
summary: Gli elementi e gli attributi LandXML 1.2 che CivilCraft legge e scrive, elemento per elemento, e tutto ciò che salta.
keywords: landxml, xml, cgpoints, superficie, tin, linee di discontinuità, confine, tracciato, coordgeom, profilo, profalign, pvi, paracurve, pipenetworks, struct, tubazione, planfeatures, planfeature, linea caratteristica, schema
from: ca3cf359
---

CivilCraft scrive LandXML 1.2 con lo spazio dei nomi e la posizione dello schema ufficiali. Legge qualsiasi file la cui radice sia `LandXML` e prende per nome gli elementi sotto indicati (i prefissi dello spazio dei nomi sono ignorati; la versione non viene verificata). Il suo lettore XML accetta solo le cinque entità standard e i riferimenti numerici ai caratteri; non carica mai un DTD o un file esterno. Per i passi, vedere [Scambiare LandXML](topic:landxml).

LandXML scrive le coordinate prima il Nord: un punto è "N E" oppure "N E Z".

## Scritti

| Elemento | Che cosa scrive CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, aree in piedi quadrati, volumi in iarde cubiche, diametri in pollici) oppure `Metric` (meter, metro quadrato, metro cubo, millimetro) |
| `Project` | `name` = il nome del progetto |
| `Application` | nome CivilCraft, produttore CadCraft |
| `CgPoints` / `CgPoint` | `name` = numero del punto, `desc` = descrizione, `code` = gruppo; testo "N E Z" (oppure "N E" senza quota) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw o ccw, `radius`, `length`, `staStart`, `chord`, `delta` (gradi), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | il terreno esistente lungo il tracciato, come coppie progressiva e quota (`PntList2D`), diviso dove esce dalla superficie |
| `Profile` / `ProfAlign` | il profilo di progetto (denominato "<alignment> design"): `PVI` per estremi e punti angolari, `ParaCurve` con `length` per le curve verticali |
| `Surfaces` / `Surface` | `name` e `desc`; prima il terreno esistente, poi "Proposed" quando piazzali o corridoi sistemano il terreno |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (solo terreno esistente) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (solo terreno esistente, quando c'è) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` con `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm o sanitary |
| `Struct` | `name`, `elevRim` (il chiusino usato, impostato o preso dalla superficie), `elevSump` (pozzetto); `Center`; `CircStruct` con `diameter`; `Invert` con `elev`, `flowDir` in o out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` con `diameter` |
| `PlanFeatures` / `PlanFeature` | una per linea caratteristica: `name`; `CoordGeom` con `Line` (`length`, `Start`, `End`) e `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` e `End` come "N E Z", `Center` come "N E"); `Feature` `code="CivilCraft"` con `Property` use e closed |

Non scritti: piazzali e corridoi come oggetti (il loro risultato è la superficie "Proposed"), tracciati con errori, tubazioni senza entrambi i fondi, regole della rete.

## Letti

| Elemento | Che cosa prende CivilCraft |
|---|---|
| `Units` | `Imperial` o `Metric` e il loro `linearUnit` decidono piedi o metri. Un'unità sconosciuta viene annotata. |
| `Project` | `name` diventa il nome del progetto. |
| `CgPoints` / `CgPoint` (anche annidati) | nome (o `oID`), "N E" o "N E Z", `desc` (o `code`) come descrizione |
| `Surface` con `Definition surfType="TIN"` | `Pnts` e `Faces` come terreno esistente (solo la prima superficie); le facce invisibili (`i="1"`) sono escluse |
| `SourceData` / `Breaklines` | linee di discontinuità 3D, mantenute con la superficie |
| `SourceData` / `Boundaries` | il confine esterno |
| `Alignment` / `CoordGeom` | elementi `Line` e `Curve`; PI ricostruiti da ogni `PI` della curva, oppure dal suo `Center` e dalle tangenti; `staStart` |
| `Profile` / `ProfAlign` | `PVI` e `ParaCurve` (con `length`); il primo profilo di progetto con almeno due PVI |
| `PlanFeatures` / `PlanFeature` | ciascuna come linea caratteristica: `Line`, `Curve` (suoi `Start`, `Center`, `End` e `rot`) e `IrregularLine` (`PntList3D` o `PntList2D`) uniti di seguito (una lacuna viene unita con un segmento retto e annotata); chiusa quando termina dove è iniziata; uso e chiusura dal `Feature` proprio di CivilCraft, altrimenti **Solo disegnata**. I punti senza quota ricevono 0 (annotato). |
| `Spiral` | clotoidi accanto a una `Curve` (in entrata e in uscita; lette come PI con un raggio e lunghezze di raccordo, riscritte con `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | la prima rete che ha tubazioni: `Struct` (`Center`, `elevRim`, `elevSump`, diametro `CircStruct`, `Invert` per tubazione) e `Pipe` (`refStart`, `refEnd`, diametro `CircPipe`) |

## Saltati, e annotati nelle note

- Superfici dopo la prima, superfici a griglia e altre superfici non TIN
- Tracciati che contengono elementi `IrregularLine` o `Chain`, spirali diverse dalla clotoide, una spirale tra due curve, o che non hanno geometria
- Profili di progetto dopo il primo; curve verticali `CircCurve` e `UnsymParaCurve` (i loro PVI sono mantenuti senza curva)
- Punti che si limitano a riferirsi ad altri punti (`pntRef`) e punti senza coordinate leggibili
- Nomi di punti ripetuti (si mantiene il primo)
- Confini nascosti, visibili e di data clip; linee di discontinuità senza punti 3D
- Reti di tubazioni dopo la prima; tipi di rete diversi da storm e sanitary (letti come storm)
- Strutture rettangolari, di ingresso e di uscita (lette come tonde); tubazioni e canali ovoidali, ellittici e a cassone (letti come tubazioni tonde di dimensione nulla)
- Elementi `Spiral` nelle linee caratteristiche
- `Parcels`, `Roadways`, `GradeModel` e `Survey`

I profili del terreno (`ProfSurf`) nel file non vengono usati: CivilCraft campiona il terreno dalla superficie stessa.

## Messaggi quando un file non si apre

| Messaggio | Significato |
|---|---|
| "Questo è XML ma non LandXML (il suo elemento radice è <…>)." | Il file è un altro tipo di XML. |
| "… non ha punti, superfici TIN o tracciati che CivilCraft può leggere." | Tutto nel file è nell'elenco dei saltati. Le note che seguono dicono che cosa c'era. |
| "Tag di chiusura non corrispondente …", "Tag non chiuso …", "Il file termina dentro …" | Il file è danneggiato o troncato. |
