---
title: Lavorare con la tabella degli attributi di un layer
summary: Vedere ogni elemento di un layer GIS come tabella, ordinarla e filtrarla, selezionare righe ed elementi insieme, correggere valori, aggiungere campi, calcolare nuovi valori e salvare la tabella come CSV.
keywords: tabella degli attributi, tabella, campi, colonne, righe, ordina, filtro, espressione, seleziona, modifica, calcolatore di campo, calcola, aggiungi campo, rinomina campo, rimuovi campo, csv, esporta, gis, shapefile, geopackage, simbologia
from: fd9d6c11
---

Aprire la tabella di un layer dal suo menu a **tre puntini** nell'elenco dei layer GIS ({{ui:Tabella degli attributi…}}), da Superficie › Altro › {{ui:Tabella degli attributi}}, oppure digitando `ATTRIBUTES`, `ATTTABLE` o `TABLE`. La tabella si apre accanto alla pianta e resta aperta mentre si lavora. Vengono disegnate solo le righe visibili, quindi un layer con migliaia di elementi si apre e scorre rapidamente.

## Ordina, filtra e seleziona

- **Ordina:** fare clic su un titolo di colonna. Un secondo clic inverte l'ordine, un terzo ripristina l'ordine del file. I valori vuoti restano sempre in fondo. L'ordinamento cambia solo ciò che si vede, mai il layer.
- **Filtra:** digitare nella casella del filtro. Un'espressione come `AREA > 500 and USE = 'Res'` mantiene le righe in cui è vera (le stesse parole della scheda Seleziona di [Analizza i layer GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Ciò che non è un'espressione, come `oak maple`, cerca quelle parole in ogni colonna.
- **Seleziona righe:** fare clic su una riga. Ctrl+clic ne aggiunge o ne rimuove una, Shift+clic seleziona un intervallo, e {{ui:Seleziona le righe visualizzate}} prende ogni riga che supera il filtro. Gli elementi selezionati vengono disegnati sulla pianta, e un clic su un elemento della pianta seleziona qui la sua riga.
- Con righe selezionate è possibile fare {{ui:Zoom}} su di esse, creare un **layer dalla selezione**, e leggere l'area o la lunghezza totale nella riga di stato.

## Correggere valori

Fare doppio clic su una cella (oppure spostarsi con i tasti freccia e premere Invio), digitare il nuovo valore e premere Invio. Esc lo lascia com'era. Un valore deve essere adatto alla colonna: numeri come numeri, date come `YYYY-MM-DD`, sì/no come yes, no, true o false. Un valore non adatto viene rifiutato con una frase e nulla cambia. Una casella vuota rende il valore vuoto. Ogni modifica è un passo di annullamento: {{ui:Annulla}} e {{ui:Ripristina}} si trovano in fondo alla tabella, e Ctrl+Z funziona sulla pianta.

## Campi

Sotto **Campi** è possibile aggiungere un campo (testo, numero, data o sì/no), rinominarlo o rimuoverlo. Un nuovo campo parte vuoto. La rinomina si propaga: l'etichetta e lo [stile per attributo](topic:gis-symbology) del layer passano al nuovo nome, e rimuovere un campo elimina l'etichetta e lo stile che lo usavano. Ciascuna operazione è un passo di annullamento che riporta tutto com'era.

## Calcolatore di campo

Scrive un valore in ogni riga (oppure solo nelle righe selezionate) a partire dagli altri campi della riga, dalla sua geometria e da alcune funzioni. Scegliere un campo esistente oppure **Un nuovo campo…** e darne un nome e un tipo. Nulla viene eseguito come codice: l'espressione viene letta da un piccolo analizzatore con un elenco fisso di funzioni.

| Gruppo | Parole |
|---|---|
| Numeri | `+ - * /`, parentesi, `abs round(x, digits) floor ceil sqrt pow min max` |
| Testo | `upper lower trim len substr(text, from, count) left right replace concat` (il testo va tra 'apici singoli'; un nome di campo con spazi va tra "virgolette doppie" o [parentesi quadre]) |
| Scelta | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Date | `year month day` di un valore `YYYY-MM-DD` |
| Geometria | `$area $perimeter $length $x $y $vertices`, nelle unità del progetto |

Un risultato che non può essere memorizzato nel tipo del campo (testo in un campo numerico) viene lasciato vuoto e conteggiato nel messaggio. Dividere per zero dà un valore vuoto. Per esempio `round($area / 43560, 2)` scrive acri a partire da piedi quadrati.

## Esporta

{{ui:Esporta CSV}} salva le righe visibili (dopo filtro e ordinamento) come file CSV UTF-8 con i nomi dei campi nella prima riga. Un testo che inizia con `=`, `+`, `-` o `@` riceve un apostrofo iniziale, così un foglio di calcolo non lo esegue come formula. Per salvare il layer stesso, usare [Esporta dati come costruito per il GIS](topic:gis-export).

## Limiti

La tabella mostra il layer con un solo ordine di ordinamento e un filtro alla volta. Qui non si possono aggiungere né eliminare righe (creare un nuovo layer da una selezione), la geometria non è modificabile e il tipo di un campo non può essere cambiato dopo la creazione.
