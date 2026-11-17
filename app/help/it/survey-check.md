---
title: Verificare un disegno di rilievo all'importazione
summary: Leggere le quote scritte come testo o negli attributi di blocco come punti di rilievo, e verificare un DWG o DXF per unità errate, assenza di sistema di coordinate, origine lontana, curve di livello piatte, quote anomale e punti doppi prima di costruire il terreno.
keywords: verifica del rilievo, verifica all'importazione, quote di rilievo, quote puntuali, quote come testo, attributi, unità, sistema di coordinate, lontano dall'origine, curve a zero, valori anomali, punti doppi, problemi, architetto paesaggista, disegno di rilievo
from: d46acd24
---

Un disegno di rilievo può sembrare corretto ed essere sbagliato per un terreno: le sue unità possono essere state indovinate, le sue curve di livello possono trovarsi piatte a quota 0, oppure le sue quote possono essere scritte come testo che non è affatto geometria. La sezione **Quote di rilievo e verifica** della finestra di dialogo {{ui:Linee}} (vedere [Aprire un DWG o DXF come linee](topic:open-dwg-dxf)) legge quelle quote e indica cosa sembra errato prima che qualsiasi cosa venga aggiunta.

## Quote scritte come testo o negli attributi

Molti disegni di rilievo riportano una quota puntuale come un piccolo testo accanto a una croce, come `104.37` o `EL 104.37`, oppure come attributo di un blocco di punto. Non sono linee, quindi il lettore di linee le lascia fuori. La sezione elenca quante ne ha trovate e permette di prenderle come **punti di rilievo**:

1. Spuntare **Prendi … quote come punti di rilievo**. Sono non spuntate all'inizio, perché non ogni numero di un disegno è un'altezza.
2. Il testo viene letto quando è una quota da solo: un numero con parte decimale (`104.37`, `+104,37`, `-3.50`), oppure un numero dopo `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` o `LEVEL`, con un eventuale `m`, `ft` o `'` dopo. Un numero intero da solo (`12`) è letto come numero di lotto o di tavola, non come quota; un testo come `GATE 3` o una data non viene mai letto. I codici di formattazione del testo sono ignorati.
3. Per gli attributi di blocco, scegliere **Attributo di blocco che contiene la quota**. CivilCraft trova da sé un tag chiamato ELEV, Z, LEVEL, RL o simili; scegliere un altro dall'elenco se il disegno usa un proprio. La scelta viene ricordata per quel nome di file su questo computer, quindi riaprendolo parte dallo stesso tag. Un tag scelto accetta anche i numeri interi come quote.
4. Fare clic su {{ui:Aggiungi}}. I punti sono numerati dopo il numero più alto del progetto, ogni punto è descritto con il suo layer (o il suo blocco), e le altezze sono convertite nelle unità del progetto come il resto del disegno. Tutto è un solo passo: {{key:Mod+Z}} elimina i punti.

Il testo si trova nel proprio punto di inserimento (o nel punto di allineamento, se ne ha uno). Il testo dentro i blocchi non viene letto, e il disegno non viene mai modificato.

## La verifica

La verifica lavora su ciò che si sta per importare ed elenca ciò che trova, una riga per ogni tipo di problema:

| Messaggio | Significato |
|---|---|
| **Unità non dichiarate** | Il disegno non dichiara le proprie unità, quindi i suoi numeri sono letti come unità del progetto. Verificare una distanza nota. |
| **Unità convertite** | Le unità del disegno differiscono da quelle del progetto e vengono scalate (una nota, non un difetto). |
| **I dati si estendono per … km** oppure **… m** | L'estensione è maggiore di 200 km o minore di mezzo metro, il che di solito indica l'unità sbagliata (millimetri letti come metri, o viceversa). |
| **Nessun sistema di coordinate** | Il progetto non ne ha. È un avviso quando i dati si trovano lontano da zero, come le coordinate di sistema piano o di reticolato nazionale. Vedere [Sistemi di coordinate](topic:coordinate-systems). |
| **Lontano dall'origine** | I dati si trovano a più di 100 km da zero. Lontano da zero, le viste 3D e le esportazioni perdono precisione e oscillano. |
| **Il layer delle curve di livello … non ha quota** | Un layer con nome da curve di livello (TOPO, CONT, CNTR, CONTOUR) contiene linee a altezza 0, quindi un terreno costruito da esse sarebbe piatto. |
| **Quote esattamente 0** | Alcune quote sono 0 mentre la quota tipica è molto lontana da zero: probabilmente altezze mancanti. |
| **Quote lontane dalle altre** | Alcune quote si trovano molto fuori dalle altre (rispetto al centro di tutte le quote, quindi un sito ripido con un ampio intervallo non viene segnalato), oppure sopra 9,000 m o sotto -11,000 m. |
| **Punti sopra un altro punto** | Due punti nello stesso posto con la stessa quota, o con quote diverse. |

Dopo aver fatto clic su {{ui:Aggiungi}}, le stesse righe vanno in **Problemi**, una per tipo, con il nome del file, così si può tornare a esse. La verifica giudica il disegno; non ci cambia nulla e non impedisce di usarlo.

:::tip
Quando la verifica dice che le curve sono piatte a 0 e ci sono quote scritte come testo, prenderle come punti di rilievo: spesso contengono le altezze reali che alle curve mancano.
:::

## Cosa non viene verificato

La verifica non confronta il disegno con un secondo rilievo, e non può stabilire in quale sistema di coordinate sia il disegno: segnala soltanto che nessuno è impostato.
