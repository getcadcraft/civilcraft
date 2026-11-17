---
title: Analizza i layer GIS
summary: Buffer, sovrapposizione (interseca, unione, cancella, dissolvi), join spaziale, selezione per attributo e misura dei layer GIS di un progetto, ciascuno come nuovo layer annullabile.
keywords: gis, analisi, buffer, sovrapposizione, interseca, unione, cancella, ritaglia, dissolvi, join spaziale, join, seleziona per attributo, interrogazione, where, espressione, statistiche, area, lunghezza, perimetro, misura, particelle, servitù, arretramento, shapefile, geopackage, tabella degli attributi
from: a6b2d3f9
---

Una volta che un progetto ha dei layer GIS (vedi [Importa dati GIS](topic:gis-import)), il pulsante **Analizza** nel gruppo GIS (digitare `GISANALYSIS`, `ANALYZE` o `BUFFER`) apre un pannello con cinque schede. Il pannello resta aperto accanto alla pianta, quindi ciò che si seleziona viene disegnato sulla pianta mentre si lavora.

Ogni strumento che crea qualcosa **aggiunge un nuovo layer** e lascia i layer da cui legge esattamente come erano. Ogni operazione è un singolo passo di annullamento: {{ui:Annulla}} nel pannello (o Ctrl+Z) rimuove il nuovo layer. Esportare il risultato come qualsiasi layer con [Esporta dati come costruito per il GIS](topic:gis-export), come shapefile, GeoJSON o GeoPackage.

La tabella completa di un layer, con ordinamento, modifica e calcolatore di campo, è in [Lavorare con la tabella degli attributi di un layer](topic:gis-table); la colorazione in base a un campo è in [Assegnare lo stile a un layer in base a un attributo](topic:gis-symbology).

Tutto viene lavorato sulla pianta, nelle unità del progetto (piedi o metri). Un progetto è sempre in un sistema proiettato o locale, quindi una distanza di 50 significa 50 piedi o 50 metri, mai gradi. Le altezze (z) non vengono mantenute nei risultati.

## Buffer

Disegna una zona a distanza prefissata attorno a ogni elemento, come nuovo layer di poligoni. I punti diventano cerchi, le linee diventano corridoi con estremità arrotondate, i poligoni si ingrandiscono. Una distanza **negativa** riduce i poligoni (un quadrato di 100 per 100 ridotto di 5 diventa 90 per 90; ridotto di 60 non resta nulla, e il pannello lo segnala). Ricavare la distanza da un campo numerico per dare a ogni elemento la propria, oppure spuntare **Unisci tutti i buffer in un'unica forma** per dissolverli.

Le parti arrotondate sono tratti rettilinei disegnati all'interno della curva vera, quindi un buffer è un poco più piccolo del cerchio esatto: circa 0.6 % in area all'impostazione normale, 0.16 % con Fine. Usare Fine per tutto ciò che si misurerà.

## Sovrapposizione

| Strumento | Cosa si ottiene |
|---|---|
| Interseca | I pezzi dove il layer di input incontra i poligoni di sovrapposizione, ciascuno con i campi di entrambi. Le linee e i punti vengono ritagliati sui poligoni. |
| Unione | Entrambi i layer di poligoni tagliati lungo i reciproci bordi: i pezzi in comune hanno i campi di entrambi i layer, gli altri quelli di un solo layer (i campi dell'altro sono vuoti). |
| Cancella | I poligoni di input con i poligoni di sovrapposizione sottratti. I campi restano quelli dell'input. Un elemento cancellato del tutto viene escluso (il pannello li conta). |
| Dissolvi | Unisce i poligoni che si toccano o si sovrappongono, tutti insieme oppure una forma per ogni valore di un campo. Aggiunge `COUNT` e `AREA`. |

Un nome di campo presente in entrambi i layer viene mantenuto per il primo layer, e quello del secondo layer viene scritto con `_2`. Gli elementi all'interno di un layer non dovrebbero sovrapporsi tra loro: dove succede, un'Unione conta la sovrapposizione in entrambi.

## Join

Un join spaziale copia gli attributi da un layer **sorgente** su ciascun elemento **target** che lo incontra, e produce un nuovo layer con le forme del target. Scegliere quando si incontrano: toccandosi o sovrapponendosi, il target dentro un poligono sorgente, il target che contiene l'elemento sorgente, l'elemento sorgente più vicino (con un limite facoltativo), oppure un qualsiasi elemento sorgente entro una distanza.

Quando corrispondono più elementi sorgente si prendono gli attributi del primo (il più vicino, per i join al più vicino e per distanza; viene aggiunto `DISTANCE`), oppure **contarli e sommare i loro campi numerici**: `COUNT`, e `SUM_`, `MEAN_`, `MIN_`, `MAX_` per ogni campo numerico. Deselezionare **Mantieni gli elementi target che non hanno trovato corrispondenza** per escluderli. I campi uniti sono vuoti dove non c'è corrispondenza, e il pannello conta quelli senza corrispondenza.

## Seleziona

Scrivere una domanda sugli attributi o sulla forma, premere **Seleziona**, e gli elementi vengono disegnati sulla pianta con il loro numero, una tabella e l'area, la lunghezza o il numero totale. Poi è possibile crearne un layer dedicato, eseguire lo zoom su di essi o deselezionare tutto.

| Si può scrivere | Esempio |
|---|---|
| Un campo per nome; usare "virgolette" o [parentesi quadre] se il nome contiene spazi | `VALUE`, `"Lot Number"` |
| Numeri, 'testo', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (il testo ignora maiuscole e minuscole; in `like`, `%` indica una sequenza qualsiasi e `_` una lettera) | `Notes contains 'corner'` |
| `is null`, `is not null` (un valore vuoto conta come null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` e parentesi | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Valori di forma `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Una domanda incompleta, o che nomina un campo che il layer non ha, viene rifiutata con una frase che indica dove.

## Misura

Mostra l'area totale e il perimetro, la lunghezza o il numero del layer, e **aggiunge campi** al layer: `AREA` e `PERIMETER` per i poligoni, `LENGTH` per le linee (lunghezza sulla pianta), `X` e `Y` per i punti. Un campo già esistente non viene mai sovrascritto: il nuovo si chiama `AREA_2`. È un singolo passo di annullamento. **Statistiche** fornisce il conteggio, la somma, la media, il minimo e il massimo di un campo numerico, facoltativamente per ogni valore di un altro campo.

:::note
I controlli dietro questi strumenti sono eseguiti a mano nel test (`node bin/test-civilcraft-gisanalysis.mjs`): per esempio particelle di 100 per 100 sotto una zona di 100 per 80 si intersecano in 3,000 più 3,000, e una linea lunga 100 con buffer di 10 misura 2,000 più un cerchio.
:::
