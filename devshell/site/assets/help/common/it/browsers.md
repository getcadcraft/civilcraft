---
title: Browser e computer
summary: In quali browser girano le app, che cosa cambia da uno all'altro e di che cosa ha bisogno il computer.
keywords: chrome, edge, firefox, safari, brave, browser, mac, windows, linux, ipad, tablet, webgl, requisiti, memoria
from: a11b09b1
---

Le app girano all'interno di un browser web. Svolgono il lavoro sul computer: i file vengono aperti lì e non ci vengono mai inviati (vedere [Dove vanno i file](common:your-files)).

## Quale browser

Usare una versione aggiornata di uno di questi:

| Browser | Motore | Note |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Il più completo: selezione di cartelle, salvataggio per l'uso offline, gestione dei file. |
| Firefox | Gecko | Funziona. L'apertura di un'intera cartella usa un selettore più semplice. Il salvataggio offline può non funzionare nelle finestre private. |
| Safari | WebKit | Funziona su Mac e iPad. L'apertura di un'intera cartella usa un selettore più semplice. Safari può eliminare una copia offline non usata da alcune settimane. |

Tutti e tre i motori vanno bene per il lavoro di ogni giorno. Dove un'app si comporta in modo diverso in uno di essi, la sua guida mostra i passaggi per il browser in uso.

## Che cosa cambia da un browser all'altro

- **Aprire una cartella.** I browser Chromium mostrano un vero selettore di cartelle e possono leggere direttamente la cartella. Firefox e Safari chiedono di scegliere una cartella e poi leggono ogni file al suo interno, il che richiede più tempo per le cartelle di progetto grandi; trascinare la cartella sull'app funziona in tutti e tre.
- **Salvare.** Le app salvano scaricando un file. È il browser a decidere dove vanno i download e se chiedere prima.

:::chromium
In Chrome o Edge, attivare "Chiedi dove salvare ogni file prima di scaricare" (in Impostazioni, sotto Download) per scegliere ogni volta una cartella.
:::

:::firefox
In Firefox, aprire Impostazioni, poi Generale, poi File e applicazioni, e scegliere "Chiedi sempre dove salvare i file" per scegliere ogni volta una cartella.
:::

:::safari
In Safari, aprire Impostazioni, poi Generali, e impostare "Posizione dei file scaricati" su "Chiedi per ogni download" per scegliere ogni volta una cartella.
:::

## Mac, Windows e Linux

Le app sono uguali su ogni computer. Cambia la tastiera: le scorciatoie vengono scritte automaticamente per il computer in uso. Vedere [Tasti, mouse e trackpad](common:keys).

## Tablet e touch screen

Alcune app accettano il tocco (un dito disegna o seleziona, due dita con il gesto di pizzico eseguono zoom e pan). La guida di ogni app indica se lo prevede. Su iPad usare Safari o Chrome. Una tastiera è utile con le app che usano comandi digitati.

## Il browser e il sistema più vecchi

Questi dati sono ricavati dal codice delle app 0.7, non da una stima: ogni file è stato analizzato e ogni funzione del linguaggio usata è stata cercata nei dati di compatibilità pubblicati dei browser. Al di sotto di queste versioni le app non riescono nemmeno ad avviarsi, perché il browser non comprende il codice.

| | Versione più vecchia in grado di avviare le app |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS e iOS 16.4) |

CadCraft Studio porta con sé un proprio motore web su Windows, quindi richiede Windows 10 o 11; su Mac usa quello del sistema, quindi richiede macOS 13.3 o successivo. Impostazioni › Aggiornamenti in Studio mostra su che cosa gira la propria copia.

Questa è la versione più vecchia che *si avvia*, ricavata dal codice. Non è un elenco di vecchi browser in cui abbiamo provato le app, quindi un browser più vecchio che si avvia può comunque non avere una funzione.

## Di che cosa ha bisogno il computer

Questi sono minimi previsti per le app, non requisiti misurati:

- 8 GB di memoria (16 GB consigliati per grandi modelli federati).
- Una scheda grafica con WebGL 2 per le app 3D. Se una vista 3D resta vuota, verificare che l'accelerazione hardware sia attiva nelle impostazioni del browser.
- Uno schermo largo almeno 1280 pixel per le barre degli strumenti complete; gli schermi più piccoli le dispongono su più righe.

I file molto grandi (grandi set di tavole, grandi modelli) usano molta memoria in una scheda del browser. Chiudere le altre schede pesanti se un'app rallenta.
