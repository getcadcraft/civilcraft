---
title: Unità, progressive e formati dei numeri
summary: Progetti in piedi e in metri, come vengono scritti e digitati progressive, pendenze, scarpate, direzioni, aree, volumi e diametri delle tubazioni, e cosa comporta cambiare le unità.
keywords: digitare una lunghezza, aritmetica, calcolatrice, somma, frazione, piedi e pollici, 4+7/16, unità, piedi, US survey feet, metri, metrico, imperiale, formato progressiva, progressive, pendenza, percento, scarpata, h:v, direzione, yard cubi, diametro
from: 0b9b5b6b
---

## Unità del progetto

Un progetto è in **piedi USA** oppure in **metri** (**Unità** nel pannello sinistro). Ogni coordinata, quota, lunghezza e progressiva del progetto è in quella unità.

:::warning
Cambiare **Unità** modifica le etichette, il formato delle progressive, i valori predefiniti e il modo in cui vengono scritti i file. **Non** converte alcun numero. Un sito rilevato in piedi e passato a metri mantiene gli stessi numeri, ora letti come metri. La barra di stato indica "Le unità sono ora metri. Le coordinate non sono state convertite." Impostare le unità in base ai propri dati prima di progettare.
:::

Da cosa dipendono le unità:

| | Piedi USA | Metri |
|---|---|---|
| Formato progressiva | `12+34.56` (progressive da 100 ft) | `1+234.567` (progressive da 1000 m) |
| Equidistanze delle curve di livello disponibili | da 0.25 a 20 ft | da 0.1 a 10 m |
| Area | sq ft | m² |
| Volume | cu yd | m³ |
| Diametro di tubazioni e manufatti | pollici | millimetri |
| Raggio predefinito della curva | 100 ft | 30 m |
| Tacche delle progressive sul piano | ogni 50 ft, etichette ogni 100 ft | ogni 20 m, etichette ogni 100 m |
| Scale di stampa | da 1" = 5' a 1" = 1000' | da 1:50 a 1:10000 |
| Unità lineare LandXML | USSurveyFoot | meter |

Un nuovo progetto parte in piedi, oppure in metri se l'unità di lunghezza contrassegnata con la stella in {{ui:Impostazioni}} › {{ui:Generali}} › {{ui:Unità}} è metrica. L'elenco **Unità** mostra le unità attivate lì, e sempre quelle del progetto. Con un'unità di area o di volume contrassegnata lì (acri, ettari, acri-piede …), aree e volumi vengono riportati in quella unità al posto della colonna sopra. Vedere [Unità, valori digitati ed elenchi di unità](common:unit-lists).

Quando si apre un LandXML, il progetto assume le unità del file. Un file in piedi internazionali si apre come progetto in piedi; i numeri non vengono modificati.

## Digitare lunghezze e somme

Ogni casella che accetta una lunghezza o una quota legge più di un semplice numero: premere {{key:Enter}} e la casella mostra il risultato nelle unità del progetto.

| Si digita | In un progetto in piedi | In un progetto in metri |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | le stesse lunghezze in metri |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | in piedi | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, e gli altri in US survey feet | le stesse lunghezze in metri |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | la somma, in piedi | la somma, in metri |

Funziona ogni indicazione di lunghezza della tabella unità condivisa, con la sua esatta dimensione: i piedi di un progetto sono US survey feet, quindi `10 US ft` vale 10 e `3 ch` (la catena in piedi internazionali) vale 197.9996. Usare `+ - * /` e parentesi, oltre a `abs`, `round`, `ceil` e `floor`. Un trattino scritto in una lunghezza ne fa parte (`24'-6"`, `6-1/2`); con gli spazi attorno, sottrae (`24' - 6"` = 23.5 ft). Un numero semplice moltiplica o divide una lunghezza, e diventa una lunghezza nelle unità del progetto quando viene sommato a una. Se CivilCraft non riesce a leggere ciò che è stato digitato, la casella viene segnalata e la barra di stato indica dove.

Le progressive non sono somme: `10+00` in una casella progressiva è la progressiva 10+00. Le pendenze in percento, i numeri dei punti e le descrizioni vengono letti così come sono.

## Progressive

Una progressiva è una distanza lungo un tracciato, scritta con un segno più:

- Piedi: la parte prima del più sono centinaia di piedi. `12+34.56` vale 1,234.56 ft.
- Metri: la parte prima del più sono migliaia di metri. `1+234.567` vale 1,234.567 m.
- Le progressive negative mantengono il segno davanti: `-0+50.00`.

Ovunque si digiti una progressiva (**Progressiva iniziale**, **Progressiva** di un PVI), la si può digitare con il più (`12+34.56`) oppure come numero semplice (`1234.56`). Gli spazi vengono ignorati.

## Pendenze e scarpate

- Le **pendenze** (profili, tubazioni, scarpate di corsia e banchina) sono in percento: `+1.25%` sale nel senso delle progressive, `-0.50%` scende.
- Le **scarpate** (sterro e riporto della piazzola, sterro e riporto del corridoio) sono orizzontale su verticale: `3` vale 3 : 1, tre in orizzontale per uno in verticale.
- **K** per una curva verticale è la sua lunghezza divisa per la variazione di pendenza in percento.

## Direzioni e angoli

Le direzioni sono direzioni a quadranti in gradi, primi e secondi: `N 63°12'05" E`. Le deflessioni delle curve (Δ) usano gli stessi gradi, primi e secondi, con "sinistra" oppure "destra".

## Offset

Gli offset da un tracciato sono distanze perpendicolari ad esso, indicate con **L** (sinistra) o **R** (destra) guardando nel senso delle progressive crescenti.

## Visualizzazione dei numeri

- Coordinate e quote mostrano 2 decimali nei pannelli e nella barra di stato (3 per un punto di rilievo selezionato).
- Aree e volumi sono raggruppati per migliaia: `128,250 sq ft`, `454.9 cu yd`.
- Le coordinate non sono mai raggruppate, così possono essere copiate così come sono.

## Coordinate

CivilCraft lavora su un piano: Est verso destra, Nord verso l'alto. Il lavoro di progetto avviene sempre in coordinate proiettate (State Plane, UTM oppure una griglia locale). Si può indicare a CivilCraft quale sistema di coordinate si usa, e se si tratta di coordinate di griglia, di terreno o locali; in quel caso mostra latitudine e longitudine e posiziona i file GIS e i livelli cartografici, ma non cambia mai le unità né sposta le coordinate da sé. Vedere [Impostare il sistema di coordinate del progetto](topic:coordinate-systems) e [Coordinate del terreno e locali](topic:ground-and-local-coordinates). I valori State Plane molto grandi (milioni di piedi) vanno bene; CivilCraft lavora internamente in relazione al sito per mantenere la precisione.
