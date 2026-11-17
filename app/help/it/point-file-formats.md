---
title: Formati dei file di punti
summary: L'ordine delle colonne che CivilCraft legge, come individua il separatore e la riga di intestazione, quali nomi di intestazione riconosce e come vengono verificate le righe.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, formato file di punti, colonne, intestazione, separatore
from: 84fab42e
---

Un file di punti è testo semplice, un punto per riga. CivilCraft lo legge nel browser; non viene caricato nulla.

## Ordini delle colonne

Le lettere indicano le colonne da sinistra a destra: **P** numero o nome del punto, **N** nord, **E** est, **Z** quota, **D** descrizione.

| Ordine | Colonne | Riga di esempio |
|---|---|---|
| PNEZD | punto, nord, est, quota, descrizione | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punto, est, nord, quota, descrizione | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punto, nord, est, quota | `101,2080000.00,6150000.00,250.00` |
| PENZ | punto, est, nord, quota | `101,6150000.00,2080000.00,250.00` |
| NEZD | nord, est, quota, descrizione | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | est, nord, quota, descrizione | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | nord, est, quota | `2080000.00 6150000.00 250.00` |
| ENZ | est, nord, quota | `6150000.00 2080000.00 250.00` |

Gli ordini senza P numerano i punti 1, 2, 3 … nell'ordine del file. X è l'est e Y è il nord.

## Separatori

CivilCraft esamina le prime 20 righe e sceglie il primo di questi che compare in almeno il 60% di esse: virgola, tabulazione, punto e virgola. Altrimenti divide sulle sequenze di spazi.

- Nei file con virgola, tabulazione e punto e virgola, un campo tra virgolette doppie può contenere il separatore (`"FL, NORTH"`), e `""` dentro le virgolette è un solo segno di virgoletta.
- Nei file separati da spazi, una descrizione alla fine della riga può contenere spazi: tutto ciò che segue l'ultima colonna di coordinate è la descrizione.
- Le righe che iniziano con `#`, `;` o `//`, e le righe vuote, vengono saltate.
- Il marcatore BOM (byte-order mark) all'inizio del file viene ignorato.

## Riga di intestazione

La prima riga è trattata come intestazione quando meno di due dei suoi campi sono numeri. Se ogni campo dell'intestazione è un nome riconosciuto da CivilCraft, l'ordine delle colonne deriva da esso ("dalla riga di intestazione"). I nomi vengono confrontati senza distinguere maiuscole e minuscole, spazi, punti, trattini bassi, trattini e parentesi:

| Colonna | Nomi riconosciuti |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Se un nome di intestazione non è riconosciuto, o i nomi non formano uno degli otto ordini, l'intestazione viene saltata e l'ordine è dedotto dal numero di colonne.

:::warning
Un'intestazione che indica sia una colonna di latitudine (`lat`, `latitude`) sia una colonna di longitudine (`lon`, `long`, `longitude`) viene letta come gradi, non come nord ed est. In {{ui:Importa}} i punti vengono convertiti tramite il sistema di coordinate del progetto, e un progetto senza sistema chiede di sceglierlo prima. Le righe fuori da ±90° di latitudine o ±180° di longitudine vengono rifiutate. Vedere [Importare dati GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Deduzione dal numero di colonne

Senza un'intestazione utilizzabile e con **Colonne** lasciato su {{ui:Rileva}}:

- 5 o più colonne: PNEZD.
- 4 colonne: PNEZ quando la prima colonna è un numero intero in ogni riga campionata e la quarta è un numero; altrimenti NEZD.
- 3 colonne: NEZ.

PNEZD e PENZD non si distinguono dai numeri. La deduzione segue **Righe dei punti** in [Impostazioni di CivilCraft](topic:settings): P, N, E, Z, D all'inizio, oppure P, E, N, Z, D (in tal caso quattro colonne sono lette come PENZ e tre come ENZ). La finestra riporta "dedotto dal numero di colonne: verificare che nord ed est non siano scambiati". Scegliere l'ordine corretto in **Colonne** se l'anteprima appare errata.

## Verifica delle righe

- Una riga può non avere la descrizione.
- Nord ed est devono essere numeri. La quota può essere vuota (il punto viene mantenuto ma non usato nella superficie).
- Il numero del punto può essere un testo qualsiasi (anche lettere, come `CP1`), ma non può essere vuoto.
- Se un numero di punto si ripete, viene mantenuta la prima riga e le altre sono elencate come non lette.
- Le descrizioni vengono conservate fino a 200 caratteri; i caratteri di controllo diventano spazi.
- Fino a 200 righe non lette vengono conservate per la finestra (ne vengono mostrate 25), e tutte vengono contate.

## Gruppi di punti

Il gruppo di un punto è la prima parola della sua descrizione in maiuscolo. "GRD", "grd shot" e "Grd" appartengono tutti al gruppo GRD. Un punto senza descrizione è nel gruppo "(nessuna descrizione)". Vedere [Importare punti di rilievo](topic:import-points).

## Scrittura dei punti

CivilCraft non esporta ancora un file di testo di punti. I punti vengono esportati in LandXML (come CgPoints), nel file di progetto e tramite {{ui:Esporta in GIS…}} come shapefile, GeoPackage o GeoJSON con i campi P, N, E, Z e D ([Esportare dati come costruito per GIS](topic:gis-export)). Vedere [Non ancora implementato](topic:not-built-yet).
