---
title: Chiavi di descrizione e codici di linea
summary: Trasformare i codici di rilievo in gruppi di punti con descrizioni, e unire i punti codificati in linee (inizio, fine, chiusura) che diventano linee di discontinuità.
keywords: chiavi di descrizione, codici di rilievo, codici di linea, figure, disegno lineare, inizio, fine, chiusura, gruppi di punti, codici, codici di rilievo, raccoglitore dati, linee di discontinuità, cordolo, margine della carreggiata
from: b3d1af8d
---

Le squadre di rilievo codificano ogni battuta sul campo: `EP` per il margine della carreggiata, `TC` per la sommità del cordolo, `BLDG` per uno spigolo di edificio. Il codice è la prima parola della descrizione del punto. CivilCraft raggruppa i punti in base ad esso, e trasforma in linee i codici di linea che lo seguono.

## Codici di linea

Un codice di linea è la parola subito dopo il codice di rilievo:

| Descrizione | Significato |
|---|---|
| `EP B` | Inizia una nuova linea di margine della carreggiata da questo punto |
| `EP` | Continua la linea EP corrente |
| `EP E` | Termina la linea EP corrente in questo punto |
| `BLDG C` | Chiude l'edificio: unisce questo punto al primo punto della linea |

Punti con lo stesso codice sono uniti in ordine di numero di punto. Codici diversi sono linee diverse anche quando condividono un gruppo, quindi `EP1` e `EP2` danno due margini insieme. Un codice che non usa mai un codice di linea viene unito attraverso tutti i suoi punti, come nelle versioni precedenti.

Le linee di un gruppo usato come **Linea di discontinuità** diventano linee di discontinuità, una per linea, così un cordolo con un'interruzione non viene tirato attraverso l'interruzione. Le linee negli altri gruppi sono disegnate in pianta (layer V-NODE-LINE) ed escono in DXF, DWG e PDF.

Le parole per inizio, fine e chiusura sono `B`, `BEG`, `START`; `E`, `END`; e `C`, `CLO`, `CLOSE`. Cambiarle, o disattivare i codici di linea, nella finestra di dialogo qui sotto.

## Chiavi di descrizione

Una chiave di descrizione trasforma un codice in un gruppo di punti, un uso e una descrizione lunga.

1. Sotto **Punti**, fare clic su {{ui:Description keys and line codes}}.
2. Fare clic su {{ui:Add a key}} e compilare la riga:
   - **Codice**: il codice di rilievo da riconoscere. `*` sta per qualsiasi carattere e `?` per uno, quindi `EP*` riconosce EP, EP1 ed EP12.
   - **Gruppo**: il gruppo di punti in cui questi punti entrano (vuoto = il codice stesso). `EP*` con gruppo `EP` mette EP1 e EP2 in un solo gruppo pur restando linee separate.
   - **Uso**: Punti, Linea di discontinuità o Escluso, per quando il gruppo compare per la prima volta (oppure lasciarlo alla tabella **Punti**).
   - **Descrizione**: il nome lungo, mostrato nelle **Proprietà** di un punto.
3. La colonna **Punti** conta i punti che ogni chiave riconosce mentre si digita. Vince la prima chiave che corrisponde a un codice.
4. Fare clic su {{ui:Apply}}. I gruppi, la superficie e la pianta seguono in un solo passo: {{key:Mod+Z}} lo annulla.

Un gruppo conserva l'uso che gli si è dato nella tabella **Punti**; l'uso di una chiave lo imposta solo per un gruppo nuovo. Le chiavi e i codici di linea sono salvati nel file di progetto.
