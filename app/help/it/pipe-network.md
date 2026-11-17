---
title: Disegnare una rete di tubazioni a gravità
summary: Disegnare tratti di tubazione di acque meteoriche o nere manufatto per manufatto, impostare le regole di pendenza, copertura e salto, far impostare le quote di fondo a CivilCraft e correggere i problemi che elenca.
keywords: costruttore di manufatti, tipo di manufatto, manufatto rettangolare, pozzetto stradale, telaio, copertura, spessore della parete, elemento di libreria, rete di tubazioni, acque meteoriche, acque nere, fognatura, manufatti, pozzetti, caditoie, quote di fondo, copertura, pendenza, salto, chiusino, pozzetto di raccolta, tubazioni a gravità
from: 10a3c14d
---

Un progetto contiene una sola rete di tubazioni a gravità, di acque meteoriche o nere. È composta da manufatti (pozzetti, caditoie) e da tubi rettilinei tra di essi. Il flusso va nel verso in cui si disegna. CivilCraft verifica ogni tubo e ogni manufatto rispetto a tre regole che si impostano, e può impostare tutte le quote di fondo a partire da quelle regole.

## Disegnare un tratto

Si possono disegnare tubi senza una superficie, ma chiusini, copertura e quote automatiche ne richiedono una.

1. Premere {{key:P}}, oppure cliccare {{ui:Tubazioni}} nel gruppo **Progettazione**.
   Il suggerimento dice "Tubazioni: cliccare i manufatti dalla parte alta del tratto verso il basso (cliccare uno esistente per collegarlo). Invio termina."
2. Cliccare dove va il manufatto a monte. Il manufatto viene posizionato.
3. Cliccare ciascun manufatto successivo a valle. Per collegarsi a un manufatto già esistente, cliccarci sopra: la barra di stato dice "Collegato S3."
4. Premere {{key:Enter}}.
   I tubi vengono disegnati, le loro quote di fondo sono impostate dalle regole, e la barra di stato dice, per esempio, "3 tubi disegnati, 12 quote di fondo impostate dalle regole; tutte le verifiche superate."

I nuovi manufatti vengono chiamati S1, S2 … con un diametro di 48 in (1200 mm). I nuovi tubi vengono chiamati P1, P2 … con un diametro di 12 in (300 mm). I diametri sono in pollici in un progetto in piedi e in millimetri in un progetto in metri.

Terminare con {{key:Enter}}. Anche il doppio clic funziona, ma facendo doppio clic su un manufatto esistente per terminare lì il tratto, il collegamento viene scartato: cliccarlo una volta, poi premere {{key:Enter}}.

## Impostare le regole

Senza nulla selezionato, il pannello destro (**Progetto**) ha un blocco **Rete di tubazioni**:

| Impostazione | Valore iniziale | Significato |
|---|---|---|
| Tipo | Acque meteoriche | {{ui:Acque meteoriche}} oppure {{ui:Acque nere}}; scritto in LandXML |
| Pendenza minima | 0.50% | Ogni tubo deve scendere almeno di questa quantità |
| Copertura minima | 2 ft (0.6 m) | Dal terreno all'estradosso del tubo, lungo tutto il tubo |
| Salto nei manufatti | 0.10 ft (0.03 m) | La quota di fondo di uscita deve essere almeno così tanto più bassa di ogni quota di fondo di entrata |

**Questi valori iniziali sono segnaposto, non una norma.** Impostare i valori richiesti dal proprio ente o progetto. La copertura si misura dal terreno all'estradosso (quota di fondo più diametro interno); lo spessore della parete non viene conteggiato. Dove piazzali o corridoi sono livellati, la superficie livellata è il terreno.

## Lasciare che CivilCraft imposti le quote di fondo

- {{ui:Imposta tutte le quote di fondo dalle regole}} (nel blocco **Rete di tubazioni**) imposta tutti i tubi.
- {{ui:Imposta le sue quote di fondo dalle regole}} (con un tubo selezionato) imposta solo quel tubo.

Procedendo verso valle, ogni tratto parte con almeno la copertura al suo manufatto di monte, scende di almeno la pendenza minima, scende di almeno il salto attraverso ogni manufatto, e va più in profondità ovunque il terreno lungo il tubo lascerebbe una copertura inferiore a quella minima. Le quote di fondo vengono arrotondate per difetto a 0.01, mai per eccesso. La barra di stato dice "Quote di fondo impostate: copertura minima alla sommità di ogni tratto, almeno la pendenza minima, almeno il salto in ogni manufatto." oppure indica che cosa non è stato possibile fare.

## Modificare manufatti e tubi

Cliccare un manufatto o un tubo con {{ui:Seleziona}} per vederlo nel pannello destro.

**Manufatto**: **Nome**, **Chiusino**, **Profondità del pozzetto**, **Diametro**, poi **Chiusino usato**, **Pozzetto**, **Est** e **Nord**, e i tubi in entrata e in uscita con le loro quote di fondo.

- Lasciare **Chiusino** vuoto per prenderlo dalla superficie; la casella mostra allora il valore della superficie in grigio. Digitare un valore per fissare il chiusino.
- Trascinare il grip del manufatto sulla pianta per spostarlo. I suoi tubi lo seguono; le loro quote di fondo restano com'erano, quindi verificare i problemi dopo.

**Tipo**: scegliere uno dei tipi di manufatto della rete (sotto), oppure nessuno per un manufatto rotondo del proprio diametro.

**Tubo**: **Nome**, i manufatti tra cui corre, **Diametro**, **Quota di fondo superiore**, **Quota di fondo inferiore**, poi **Lunghezza**, **Pendenza** e **Copertura minima**.

Premere {{key:Enter}} dopo ciascun valore.

## Leggere e correggere i problemi

Il blocco **Rete di tubazioni** elenca ogni problema (fino a 40); cliccarne uno per selezionare il tubo o il manufatto. Un tubo o un manufatto selezionato elenca i propri. Quando nulla è selezionato, dice "Ogni tubo e manufatto supera le regole."

| Messaggio (esempi) | Cosa fare |
|---|---|
| "P2 scorre in salita (-0.40%)." oppure "… scorre in piano …" | Scambiare le quote di fondo, oppure impostarle dalle regole. |
| "P2 con 0.30% è più piatto della pendenza minima 0.50%." | Abbassare la quota di fondo a valle o alzare quella a monte. |
| "P3 ha 1.40 di copertura lungo il suo percorso, meno del minimo 2." | Abbassare il tubo; impostare le sue quote di fondo dalle regole. |
| "In S3, P4 esce a 245.20, meno di 0.1 sotto P3 che entra a 245.25." | Abbassare la quota di fondo superiore del tubo in uscita. |
| "L'estradosso di P1 è sopra il chiusino di S1." | Il tubo è troppo alto per il manufatto. |
| "S2 ha 2 tubi che ne escono; una rete a gravità dovrebbe avere una sola uscita da ogni manufatto." | Rimuovere un tubo in uscita, oppure ridisegnarlo nella direzione giusta. |
| "I tubi formano un anello; il flusso deve terminare in uno sbocco." | Un tratto è stato ridisegnato su se stesso; eliminare un tubo. |
| "S5 è fuori dalla superficie e non ha quota di chiusino." | Digitare un chiusino, oppure spostare il manufatto sulla superficie. |
| "P6 corre in parte fuori dalla superficie; la copertura lì non è nota." | Estendere la superficie, oppure accettare che la copertura non venga verificata lì. |
| "P7 non ha ancora quote di fondo." | Digitarle, oppure impostarle dalle regole. |

Tubi e manufatti problematici sono anche segnati in rosso sulla pianta.

## Tipi di manufatto

Un tipo di manufatto è un manufatto costruito dai suoi parametri: un pozzetto, una caditoia, un pozzetto di giunzione o uno sbocco, **rotondo** (diametro interno) o **rettangolare** (larghezza e lunghezza interne), con il suo **spessore della parete**, la **soletta di fondo**, un **pozzetto di raccolta** sotto il tubo più basso e un **telaio e coperchio** (apertura rotonda o rettangolare, altezza del telaio). I tipi appartengono alla rete, sotto **Tipi di manufatto** nelle Proprietà del progetto.

1. Cliccare {{ui:Nuovo tipo di manufatto}}. La finestra disegna il manufatto in pianta e in sezione mentre si digita.
2. Cliccare {{ui:Aggiungi il tipo}}.
3. Selezionare un manufatto e scegliere il tipo sotto **Tipo**. Prende le dimensioni e il pozzetto di raccolta del tipo; il suo pozzetto può essere ancora modificato.

Modificare un tipo e ogni manufatto di quel tipo ne segue le dimensioni. Rimuovere un tipo e i suoi manufatti restano come manufatti rotondi della stessa larghezza. Ogni modifica è un passo: {{key:Mod+Z}} la annulla.

Un manufatto rettangolare viene disegnato sulla pianta, in DXF, DWG e PDF, e in 3D come rettangolo con la sua lunghezza lungo il tubo di uscita; i tubi partono dalla sua parete. LandXML lo scrive come manufatto rettangolare (`RectStruct`) con il suo spessore di parete, e rilegge tali manufatti come tipi.

### Condividere un tipo tramite la libreria

{{ui:Salva come elemento della libreria}} scrive il tipo come elemento della libreria CadCraft (un file `.json`): il suo simbolo in pianta, un corpo 3D fino a una profondità tipica e tutte le dimensioni. Caricarlo nella libreria per condividerlo. {{ui:Apri un elemento della libreria}} legge un manufatto salvato così e lo riporta nella rete, convertito nelle unità del progetto. Gli elementi della libreria che non sono manufatti creati in CivilCraft vengono rifiutati, con il motivo.

## Eliminare

Selezionare un tubo e premere {{key:Delete}} per rimuoverlo. Eliminare un manufatto rimuove anche i tubi a esso collegati. Su Mac, premere Fn e {{key:Delete}}, oppure cliccare {{ui:Elimina}}.

## Non ancora implementato

Portate, dimensioni dei tubi e linea piezometrica sono in [Drenaggio delle acque meteoriche](topic:storm-drainage). Cataloghi di tubi, tubi non circolari, tubi nella vista del profilo, tubi curvi e più di una rete per progetto non sono ancora disponibili. Vedere [Non ancora implementato](topic:not-built-yet).
