---
title: Risoluzione dei problemi
summary: Sintomi, cause e soluzioni dei problemi riscontrati in CivilCraft, con i messaggi esatti mostrati dall'applicazione.
keywords: problemi, errori, non funziona, soluzione, guida, messaggi, risoluzione, rifiutato, mancante, errato, scambiato, curve di livello mancanti
from: a9f7dedc
---

I messaggi compaiono nella barra di stato in basso a destra, in riquadri nei pannelli sinistro e destro, e nelle finestre di dialogo. Sono riportati qui come li mostra l'applicazione.

## Apertura dei file

**"Il file supera 200 MB; CivilCraft non apre ancora file così grandi."**
Dividere il file dei punti, o ridurre i dati prima di aprirlo.

**"Impossibile aprire site.json: non è un file di progetto CivilCraft."**
Il file termina con `.json` oppure inizia con `{`, ma non è un progetto CivilCraft. I file di punti non devono iniziare con `{`.

**"Impossibile aprire … Questo file di progetto proviene da una versione più recente di CivilCraft (versione 2)."**
Il progetto è stato salvato con una build più recente. Aprirlo lì, oppure esportarlo in LandXML.

**"Impossibile aprire … È un XML ma non LandXML (il suo elemento radice è <…>)."**
Il file è un altro tipo di XML. Esportare LandXML dall'altro programma.

**"… non contiene punti, superfici TIN né tracciati che CivilCraft può leggere."**
Tutto ciò che è nel file è qualcosa che CivilCraft ignora (ad esempio solo superfici a griglia, o solo tracciati a spirale). Il resto del messaggio indica cosa c'era. Vedere [LandXML: cosa viene letto e scritto](topic:landxml-reference).

**"Impossibile caricare il campione: …"**
{{ui:Apri il sito di esempio}} legge un file dal sito di CadCraft. Senza connessione funziona solo se CivilCraft è stato salvato per l'uso offline (il pulsante nella barra dell'applicazione mostra {{ui:Pronto per l'uso offline}}). Passare online, fare clic su {{ui:Salva per l'uso offline}}, e da quel momento funziona offline. Vedere [Uso offline](common:offline).

**{{ui:Salva per l'uso offline}} mostra {{ui:Salvataggio non riuscito}}.**
Alcuni file non sono stati scaricati. Controllare la connessione e fare di nuovo clic sul pulsante.

**{{ui:Salva per l'uso offline}} mostra {{ui:Offline non disponibile}}.**
Questa finestra del browser non può conservare una copia offline, di solito perché è una finestra privata oppure il computer è gestito. Aprire CivilCraft in una finestra normale.

**Offline, l'applicazione non si apre affatto.**
Non è stata salvata per l'uso offline in questo browser, oppure il browser ha cancellato i dati del sito (Safari lo fa per i siti non visitati per diverse settimane). Passare online, aprire CivilCraft e fare clic su {{ui:Salva per l'uso offline}}.

**La copia offline è una build meno recente.**
Fare clic su {{ui:Pronto per l'uso offline}}, poi su {{ui:Salva di nuovo (scarica la versione più recente)}} mentre si è online.

**Un file è in grigio nella finestra di apertura.**
La finestra elenca solo file di punti, LandXML e file di progetto, in base alle loro estensioni. Trascinare invece il file sul piano, oppure rinominarlo con estensione `.txt`.

## Importazione dei punti

**"Impossibile leggere punti da questo file."**
Scegliere a mano l'ordine delle colonne in **Colonne**. Se nulla funziona, aprire il file in un editor di testo e verificare che ci sia un punto per riga, con dei numeri.

**Il rilievo appare specchiato, ruotato o allungato in una linea.**
Nord ed Est sono invertiti. Il riepilogo diceva "stimato dal numero di colonne". Scegliere PENZD invece di PNEZD (o viceversa) in **Colonne**, oppure importare di nuovo.

**Punti molto lontani dagli altri, e il piano ridotto a un puntino.**
Una riga contiene un errore di battitura in una coordinata, oppure il file mescola sistemi di coordinate. Trovare il punto (fare clic per vederne il numero) e correggere il file.

**Righe elencate sotto "Righe non lette".**
Vedere la tabella in [Importare punti di rilievo](topic:import-points#rows-that-are-not-read).

**I punti precedenti sono spariti.**
Importare un file di punti sostituisce tutti i punti e azzera l'annullamento. Aprire il progetto salvato per recuperarli.

## La superficie

**"Superficie: non ancora costruita" con un riquadro rosso.**
Il riquadro indica il motivo: "Una superficie richiede almeno tre punti con quota.", "I punti sono tutti su una linea: nessun triangolo.", "Nessun punto con quota.", "Il contorno non si sovrappone ai punti." oppure "Non restano triangoli all'interno del contorno." Verificare l'ordine delle colonne, i gruppi di punti (sono {{ui:Esclusi}}?) e il contorno.

**Le curve di livello tagliano di traverso un fosso o una cresta.**
Quella linea non è una linea di discontinuità. Impostare il suo gruppo su {{ui:Linea di discontinuità}}, oppure disegnarla con lo strumento {{ui:Linea di discontinuità}}. Vedere [Costruire e affinare la superficie](topic:build-surface).

**Un gruppo di linee di discontinuità disegna uno zig-zag.**
Il gruppo contiene più di una linea, oppure i suoi punti non sono numerati lungo la linea. Riportare il gruppo su {{ui:Punti}} e disegnare ciascuna linea con lo strumento {{ui:Linea di discontinuità}}.

**Lunghi triangoli sottili lungo il perimetro.**
Disegnare un contorno ({{key:O}}) oppure impostare **Lato esterno più lungo**.

**Nessuna curva di livello, anche se la superficie è costruita.**
Oppure {{ui:Curve di livello}} è disattivato in **Visualizzazione**, oppure l'intervallo è così piccolo che ci sarebbero più di 2.000 livelli di curve. Scegliere un intervallo maggiore.

**Linee di discontinuità o contorno non cambiano nulla.**
La superficie proviene da LandXML ("Superficie (da LandXML)"). Viene usata così com'è. Fare clic su {{ui:Ricostruisci la superficie dai punti}} per costruirla invece dai punti.

**"Non c'è ancora una superficie: aprire prima i punti di rilievo."**
Linea di discontinuità, contorno e piazzola richiedono una superficie del terreno già esistente. Importare prima i punti.

**"Fare clic su un punto di rilievo con quota: una linea di discontinuità prende le quote dei punti."**
Lo strumento {{ui:Linea di discontinuità}} seleziona solo punti di rilievo. Ingrandire e fare clic su un punto (un quadrato arancione indica quello che verrà preso).

## Disegno

**Il mio ultimo punto è scomparso quando ho fatto doppio clic per terminare.**
In questa build, il doppio clic termina il tracciato, la piazzola, la linea di discontinuità o il contorno, ma elimina il punto su cui si fa doppio clic. Fare clic una volta sull'ultimo punto e premere {{key:Enter}}. Se è già successo, usare {{key:Mod+Z}} e poi disegnare di nuovo.

**Non è possibile completare un disegno su un tablet.**
Per completare serve {{key:Enter}}; non c'è ancora un pulsante a schermo. Collegare una tastiera. Vedere [Mouse, trackpad e tocco](topic:keyboard#mouse-trackpad-and-touch).

**Trascinare per posizionare un punto sposta invece la vista.**
Un trascinamento di più di pochi pixel sposta il piano in tutti gli strumenti. Fare clic senza muovere.

**"Un tracciato richiede almeno due punti." / "Una piazzola richiede almeno tre angoli." / "Una tratta di tubazione richiede almeno due manufatti."**
È stato premuto {{key:Enter}} troppo presto. Il disegno viene scartato; ricominciare.

**Tasti come A o G non hanno effetto.**
Una casella di testo o un elenco in un pannello ha ancora il fuoco, quindi le lettere vanno lì. Fare clic una volta sul piano, poi premere il tasto. Su Mac, il tasto Delete corrisponde a Backspace per il browser: per eliminare una selezione usare Fn e Delete.

## Tracciati e profili

**"Le curve in PI 2 e PI 3 si sovrappongono: … Usare raggi più piccoli."**
Due curve richiedono più tangente di quella disponibile tra i rispettivi PI. Ridurre uno o entrambi i raggi nella tabella dei PI, oppure allontanare i PI.

**"Il PI 3 inverte direzione; non può avere una curva."**
Il tracciato torna su se stesso in quel PI. Spostare o rimuovere il PI.

**"Questo tracciato non ha terreno sotto di sé da cui partire."**
Il tracciato è fuori dalla superficie. Spostarlo sulla superficie, oppure aggiungere PVI facendo clic con {{ui:Aggiungi PVI}} attivo.

**"La curva verticale nel PVI 3 (L = …) inizia prima che finisca la curva o il PVI precedente." / "… supera il PVI successivo."**
Accorciare la lunghezza della curva oppure allontanare i PVI.

**"Esiste già un PVI in …"**
Esiste già un PVI in quella progressiva. Fare clic altrove, oppure trascinare quello esistente.

**La vista del profilo è vuota: "Disegnare un tracciato per vedere il suo profilo."**
Non c'è un tracciato, oppure quello selezionato contiene errori.

## Corridoi e piazzole

**"Il corridoio richiede un profilo di progetto senza errori."**
Avviare un profilo di progetto ({{ui:Inizia dal terreno}}) e risolvere eventuali sovrapposizioni di curve.

**"… le scarpate escono dalla superficie prima di incontrare il terreno." / "… le linee di scarpata escono dalla superficie prima di incontrarlo …"**
La sistemazione raggiunge il bordo della superficie prima di incontrare il terreno. Spostare il progetto verso l'interno rispetto al bordo, oppure avvicinarlo al terreno. Una nuova piazzola disegnata in parte fuori dalla superficie può partire dalla quota 0: digitare una quota reale.

**"Le linee di intersezione con il terreno del corridoio si incrociano …" / "La linea di intersezione con il terreno attraversa sé stessa …"**
Scarpate da lati diversi si incontrano: curve strette, piazzole strette, scavi profondi o riporti alti. Usare un raggio maggiore, un assieme più stretto, una piazzola più larga o scarpate più ripide.

**"Nessun volume ancora: una piazzola deve essere sistemata senza problemi."**
Risolvere i problemi elencati nel riquadro rosso sopra.

**{{ui:Di progetto (sistemato)}} è in grigio.**
Nessuna piazzola o corridoio è ancora sistemato.

## Tubazioni

**"P2 non ha ancora quote di fondo."**
Fare clic su {{ui:Imposta le sue quote di fondo dalle regole}} oppure digitare le quote di fondo.

**"P1: nessun terreno in S1 da cui partire."**
Il manufatto a monte è fuori dalla superficie e non ha bordo. Digitare un bordo per il manufatto.

**Ogni tubazione è segnalata dopo aver spostato un manufatto.**
Spostare un manufatto non cambia le quote di fondo. Fare clic su {{ui:Imposta tutte le quote di fondo dalle regole}}.

Tutti i messaggi della rete sono spiegati in [Disporre una rete di tubazioni a gravità](topic:pipe-network#read-and-fix-problems).

## Salvataggio ed esportazione

**"Nulla da esportare ancora." / "Nulla da stampare ancora."**
Il progetto è vuoto. Importare prima i punti.

**Non si trova il file salvato.**
È nei download del browser (di solito nella cartella Download). Vedere [File che si possono aprire, salvare ed esportare](topic:files#where-the-files-go).

**La scala del PDF sulla carta è sbagliata.**
Stampare al 100% o in dimensioni reali, non "Adatta alla pagina".

**Punti interrogativi nel testo del PDF.**
Nomi o descrizioni usano caratteri fuori dal set dell'Europa occidentale. Il messaggio di stato li conta. Rinominare con caratteri semplici.

**La stampa è tagliata ai bordi.**
La scala è troppo grande per il foglio. Scegliere la scala indicata come "(si adatta)", un foglio più grande, oppure {{ui:Ciò che è sullo schermo}}.

**{{key:Mod+P}} ha aperto la finestra di stampa del browser.**
La pagina non aveva il fuoco. Chiudere la finestra, fare clic sul piano e premere di nuovo {{key:Mod+P}}, oppure fare clic su {{ui:PDF}}.

## L'applicazione

**La schermata è vuota o la barra degli strumenti non fa nulla.**
Usare una versione aggiornata di Chrome, Edge, Firefox o Safari, e ricaricare la pagina. Vedere [Browser](common:browsers).

**L'applicazione è lenta con un file di punti grande.**
Disattivare {{ui:Triangoli}}, {{ui:Etichette dei punti}} e {{ui:Fasce di quota}}, e usare un intervallo maggiore per le curve di livello. Le superfici molto grandi richiedono un momento per ricostruirsi dopo ogni modifica.

**Il browser chiede "Lasciare questo sito?"**
Il progetto ha modifiche non salvate. Restare sulla pagina, salvare con {{key:Mod+S}}, poi uscire.
