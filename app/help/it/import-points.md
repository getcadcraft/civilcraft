---
title: Importare i punti di rilievo
summary: Aprire un file di punti in CSV o testo, verificare l'ordine delle colonne nella finestra Importa punti, correggere le righe che non si possono leggere e ordinare i punti in gruppi.
keywords: importa punti, csv, txt, pnezd, penzd, file di punti, rilievo, punti cogo, gruppi di punti, colonne, nord est
from: ad33d88a
---

Un file di punti è un file di testo con un punto per riga: numero del punto, Nord, Est, quota e descrizione in un certo ordine, separati da virgole, tabulazioni, punti e virgola o spazi. CivilCraft lo legge nel browser e costruisce subito una superficie.

## Prima di iniziare

- Conoscere l'ordine delle colonne del file, se possibile (PNEZD e PENZD sembrano uguali per un computer).
- Conoscerne le unità. CivilCraft non converte: impostare **Unità** nel pannello di sinistra in modo che corrispondano al file (vedere [Unità, progressive e formati numerici](topic:units-and-stations)).
- Le coordinate possono essere grandi (Nord ed Est di un sistema di coordinate piane, nell'ordine dei milioni, vanno bene).

## Importare il file

1. Fare clic su {{ui:Open}} nella barra degli strumenti, oppure premere {{key:Mod+O}}, e scegliere il file. Si può anche trascinarlo sulla pianta.
   Si apre la finestra **Importa punti** con il nome del file, un elenco **Colonne** impostato su {{ui:Detect}}, una riga di riepilogo e i primi sei punti.
2. Leggere la riga di riepilogo. Indica quanti punti sono stati letti, con quale ordine di colonne, come è stato trovato quell'ordine e cosa separa le colonne. I tre modi in cui si trova l'ordine:
   - "dalla riga di intestazione": la prima riga indica le colonne (Punto, Nord, Est, Quota, Descrizione, oppure X, Y, Z …). È il metodo più sicuro.
   - "come scelto": si è scelto un ordine in **Colonne**.
   - "stimato dal numero di colonne e dall'impostazione delle righe di punti (PNEZD) — verificare che Nord ed Est non siano invertiti": non c'era un'intestazione utilizzabile. Se i file sono di solito con l'Est per primo, impostare **Righe di punti** su P, E, N, Z, D nelle [impostazioni di CivilCraft](topic:settings).
3. Controllare la tabella di anteprima. Le sue colonne sono sempre **Punto**, **Nord**, **Est**, **Quota**, **Descrizione**, qualunque sia l'ordine del file. Nord ed Est di un sito reale hanno di solito valori di grandezza chiaramente diversa: se sembrano invertiti, la stima era sbagliata.
4. Se l'ordine è sbagliato, scegliere quello giusto in **Colonne** (ad esempio {{ui:PENZD — point, easting, northing, elevation, description}}). Riepilogo e anteprima si aggiornano subito.
5. Sotto l'anteprima cercare **Righe non lette**. Ogni riga indica il numero di riga nel file, il motivo e l'inizio della riga. Vedere [Righe non lette](topic:import-points#rows-that-are-not-read).
6. Fare clic su {{ui:Import}}.
   I punti compaiono sulla pianta, la vista si adatta ad essi e la superficie viene costruita. La barra di stato indica, ad esempio, "Importati 276 punti da site.csv; superficie: 546 triangoli."

Se il progetto non aveva ancora un nome, prende quello del file.

## Verificare i gruppi

Ogni punto appartiene a un gruppo che prende il nome dalla **prima parola della sua descrizione**, in maiuscolo: "GRD", "FL 12" e "fl" appartengono ai gruppi GRD, FL e FL. I punti senza descrizione vanno in "(nessuna descrizione)".

1. Guardare la tabella sotto **Punti** nel pannello di sinistra: gruppo, numero di punti e una scelta di **Superficie**.
2. Ogni gruppo parte come {{ui:Points}}. Cambiare in {{ui:Breakline}} linee di impluvio, bordi della carreggiata, creste e piedi di scarpata, crinali e linee codificate simili. Impostare su {{ui:Left out}} i gruppi che non devono modellare il terreno (punti di controllo, cime degli alberi, pali dei servizi rilevati in cima).
3. Fare clic su un punto sulla pianta (con {{ui:Select}}) per vederne il numero, le coordinate, la quota, la descrizione e il gruppo nel pannello di destra.

:::warning
Un gruppo di linee di discontinuità unisce **tutti** i suoi punti in **una** sola linea, in ordine di numero di punto. Funziona quando ogni linea codificata è stata rilevata in ordine con il proprio codice. Due linee di impluvio separate, entrambe codificate "FL", diventano una sola linea a zigzag tra di esse. Se i codici sono condivisi, usare lo strumento {{ui:Breakline}} per fare clic sui punti di ogni linea (vedere [Costruire e perfezionare la superficie](topic:build-surface)).
:::

## Righe non lette

| Motivo indicato | Cosa significa | Cosa fare |
|---|---|---|
| "Nord o Est non è un numero" | Una colonna delle coordinate contiene testo | Verificare l'ordine delle colonne, oppure una riga di testo estranea nel mezzo del file |
| "la quota non è un numero" | La colonna della quota contiene testo | Ordine delle colonne sbagliato, oppure una descrizione nella colonna della quota |
| "nessun numero di punto" | La colonna del punto è vuota | Numerare il punto, oppure scegliere un ordine senza P (NEZD, NEZ …): i punti vengono allora numerati 1, 2, 3 … |
| "il punto 12 compare due volte (viene mantenuto il primo)" | Due righe hanno lo stesso numero | Rinumerare una delle due nel file, se entrambe sono rilievi reali |
| "3 colonne, previste 5 (PNEZD)" | La riga è corta | Una riga interrotta, oppure l'ordine delle colonne sbagliato |

Un punto con la quota vuota viene mantenuto, ma non viene usato nella superficie. I dati **Punti** indicano quanti punti hanno una quota.

Le righe che iniziano con `#`, `;` o `//` sono commenti e vengono saltate. Le righe vuote vengono saltate.

## Sostituire o aggiungere punti

Importare di nuovo **sostituisce** tutti i punti; non li aggiunge. Tracciati, piazzali, tubazioni, linee di discontinuità disegnate e perimetro restano. La cronologia di annullamento viene cancellata, quindi salvare prima il progetto se si potrebbe voler recuperare i vecchi punti. Per unire due file, unirli in un editor di testo o in un foglio di calcolo prima di importare (attenzione ai numeri di punto ripetuti).

I punti non possono ancora essere spostati, modificati o eliminati all'interno di CivilCraft. Correggerli nel file e importare di nuovo.

## Vedere anche

- [Formati dei file di punti](topic:point-file-formats): ogni ordine di colonne e come vengono riconosciute le intestazioni.
- [Costruire e perfezionare la superficie](topic:build-surface).
