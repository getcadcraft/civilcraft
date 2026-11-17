---
title: Esporta il sito in 3D
summary: Salvare ciò che mostra la vista 3D come file GLB o OBJ per altri programmi 3D, in metri con Y verso l'alto, attorno a un'origine locale registrata nel file.
keywords: glb, gltf, obj, esportazione 3d, esporta 3d, esportazione modello, motore di gioco, visualizzazione, visualizzatore 3d, metri, y verso l'alto, origine, origine locale, state plane
from: 07d23992
---

La vista 3D esporta ciò che mostra come modello 3D che un altro programma può aprire: un visualizzatore 3D, un programma di modellazione, un motore di gioco o uno strumento di visualizzazione.

## Esportazione

1. Aprire la vista 3D ({{key:D}}) e scegliere cosa mostrare con {{ui:Mostra}}. Ciò che è nascosto non viene esportato.
2. Fare clic su {{ui:GLB}} o {{ui:OBJ}} nella barra.
   Il file viene scaricato come "*nome progetto*-3d.glb" oppure "-3d.obj", e la barra di stato indica l'origine.

## Cosa contengono i file

| | GLB | OBJ |
|---|---|---|
| Superfici | Mesh con normali e i colori delle fasce o delle superfici | Mesh con normali (senza colori) |
| Tubazioni e manufatti | Mesh tonde, quelle con problemi in rosso | Mesh tonde |
| Curve di livello, linee di discontinuità, tracciati, tacche, linee del corridoio e del piazzale | Linee, ciascun insieme nel proprio colore | Record di linea (`l`) |
| Punti di rilievo | Punti | Record di punto (`p`) |

Ogni insieme mantiene il proprio nome ("Terreno esistente", "Tubazioni", "Curve di livello principali" e così via), così è possibile nasconderlo o modificarne lo stile nell'altro programma.

## Unità, assi e origine

- **Metri.** Un progetto in piedi viene convertito dai piedi US survey (1 ft = 1200/3937 m).
- **Y verso l'alto**, la convenzione usuale per questi formati: l'est diventa +X, la quota +Y e il nord −Z.
- **Scala reale.** L'esagerazione verticale della vista non viene applicata.
- **Un'origine locale.** Le coordinate state plane sono nell'ordine dei milioni di piedi, troppo grandi per i numeri in precisione singola che questi formati memorizzano; per questo il file viene scritto rispetto a un'origine vicina: l'origine propria del terreno esistente per est e nord, e la sua quota più bassa arrotondata per difetto. L'origine, nelle unità del progetto, è registrata nel file: in un GLB come `extras` sulla scena e sul suo nodo principale, in un OBJ come riga di commento vicino all'inizio (`# origin easting … northing … elevation …`). Per riportare il modello nelle coordinate del progetto, sommare l'origine (dopo aver riconvertito i metri in piedi su un progetto in piedi).

## Non ancora implementato

- Esportazione della vista con esagerazione, o esportazione nelle unità del progetto invece che in metri.
- Texture, un file dei materiali per OBJ (.mtl) e proprietà per oggetto (i nomi di tubazioni e manufatti sono presenti solo in CivilCraft).
- Esportazione del corridoio come solidi separati, o della vista del profilo in 3D.
