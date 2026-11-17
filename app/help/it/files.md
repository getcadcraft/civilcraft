---
title: File che puoi aprire, salvare ed esportare
summary: Entrano file di punti, LandXML e progetti CivilCraft; escono progetti, LandXML, DXF e PDF; cosa conserva ciascun file, dove vanno i file e cosa cambia offline.
keywords: apri, salva, esporta, importa, formati file, csv, txt, landxml, xml, dxf, pdf, json, scarica, file di progetto
from: 82bff559
---

CivilCraft apre file dal computer e salva scaricando i file sul computer. Non viene caricato nulla e nulla viene conservato su un server. Vedi anche [I propri file](common:your-files).

## Cosa apre

Fare clic su {{ui:Apri}} (oppure premere {{key:Mod+O}}) e scegliere un file, oppure trascinare il file da {{pick:mac=Finder|windows=Esplora file|linux=il gestore di file}} sulla pianta. Un file alla volta; i file oltre 200 MB vengono rifiutati. Un file LandXML o di progetto oltre 32 MB viene letto a blocchi di circa 4 MB, mai come un unico blocco di testo; mentre un LandXML si apre, prevedere un uso di memoria di circa 13 volte la dimensione del file (un file da 69 MB ha usato circa 0.9 GB nel nostro test).

| Tipo | Nomi file | Cosa succede |
|---|---|---|
| File di punti | `.csv`, `.txt`, `.pnt`, `.xyz` (qualsiasi file di testo) | Si apre la finestra **Importa punti**. I punti sostituiscono i punti del progetto; allineamenti, piazzali e tubazioni restano. |
| LandXML | `.xml`, `.landxml` | Viene creato un **nuovo progetto** dal file (prima viene chiesto se quello corrente ha modifiche non salvate). |
| Progetto CivilCraft | `.civilcraft.json` (qualsiasi `.json`) | Il progetto si apre come era stato salvato (prima viene chiesto se quello corrente ha modifiche non salvate). |

CivilCraft decide in base alla fine del nome del file, poi in base ai primi caratteri: un testo che inizia con `{` viene letto come progetto, un testo che inizia con `<` come LandXML, tutto il resto come file di punti. Un file che la finestra di apertura rende grigio può comunque essere trascinato sulla pianta.

:::note
Importare un file di punti in un progetto che ha già dei punti li sostituisce senza chiedere e azzera la cronologia di annullamento (aprire un file qualsiasi è un nuovo inizio per l'annullamento). Se la superficie proveniva da LandXML, importare punti la riporta a una superficie costruita dai punti. Salvare prima se potrebbe servire recuperare i vecchi punti.
:::

Dettagli: [Formati dei file di punti](topic:point-file-formats), [LandXML: cosa viene letto e scritto](topic:landxml-reference).

## Cosa salva

{{ui:Salva}} ({{key:Mod+S}}) scrive due file affiancati, con il nome indicato in **Nome** nel pannello a sinistra: `<name>.civilcraft.json`, il progetto che si continua a modificare, e `<name>.ifc`, lo stesso disegno in IFC 4.3 per gli altri programmi (vedi [Esportazione e importazione IFC](topic:ifc)). Ogni file registra l'altro, e l'IFC contiene anche una copia compressa del progetto, così un IFC inviato da solo si riapre completamente modificabile.

- **In Studio** entrambi i file vengono scritti uno accanto all'altro, sul posto.
- **In Chrome ed Edge** il primo salvataggio chiede una cartella e vi scrive entrambi i file; i salvataggi successivi vanno nella stessa cartella. Annullare la domanda sulla cartella per scaricare invece entrambi i file.
- **In altri browser** entrambi i file vengono scaricati, prima il file di progetto.

Aprendo uno dei due file si cerca l'altro. Aprire entrambi insieme (o trascinarli insieme), oppure aprirne uno: in Studio l'altro viene trovato nella stessa cartella; in un browser CivilCraft chiede di aggiungerlo, oppure di proseguire con quello che si ha. Se l'IFC è stato modificato da un altro programma dopo il salvataggio da CivilCraft, o se un file è più vecchio dell'altro, il progetto si apre dal disegno più recente e il pannello Problemi spiega cosa è successo, con **Salva ora** (riscrive entrambi i file) e **Mostra la geometria dell'IFC come riferimento**. Un IFC da solo modificato da un altro programma si apre dalla sua copia del progetto con ciò che corrisponde ancora: gli allineamenti modificati assumono la sua geometria, gli oggetti rimossi vengono esclusi, e il resto delle modifiche viene elencato, non applicato. Un file di progetto anteriore alla 0.7.1 si apre come prima.

Il file di progetto conserva:

- ogni punto (numero, coordinate, quota, descrizione) e il nome del file di punti da cui provengono
- le impostazioni della superficie: scelte dei gruppi, linee di discontinuità disegnate, il contorno, il lato esterno più lungo e un TIN letto da LandXML
- le impostazioni di visualizzazione
- gli allineamenti con i loro PI, raggi e progressiva iniziale, i profili di progetto (PVI e lunghezze delle curve) e le impostazioni dei corridoi
- i piazzali e la rete di tubazioni con le sue regole

Non conserva la cronologia di annullamento. Superfici, curve di livello, linee di intersezione con il terreno e volumi non vengono memorizzati; vengono ricostruiti dai dati salvati all'apertura del progetto. Un file di progetto di una versione più recente di CivilCraft viene rifiutato con un messaggio che ne indica la versione.

## Cosa esporta

| Pulsante | File | Contenuto |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: punti, il terreno esistente (e la superficie di progetto quando presente) come superfici TIN, allineamenti, profili del terreno e di progetto, la rete di tubazioni |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 della linea della pianta come è visualizzata, su layer con nome |
| {{ui:DWG}} | `<name>.dwg` | La stessa linea come disegno DWG, nel formato scelto (dal 2000 al 2018) |
| {{ui:PDF}} | `<name>.pdf` | Stampa vettoriale della pianta su un foglio, a una scala scelta |
| {{ui:GLB}} oppure {{ui:OBJ}} (nella barra della vista 3D) | `<name>-3d.glb`, `<name>-3d.obj` | Ciò che la vista 3D mostra come modello 3D: metri, Y verso l'alto, scala reale, attorno a un'origine locale registrata |

Cosa lascia fuori ciascuno: [Scambio LandXML](topic:landxml), [Esporta la pianta in DXF](topic:dxf-export) (anche DWG), [Stampa la pianta in PDF](topic:plot-pdf), [Esporta il sito in 3D](topic:export-3d).

## Dove vanno i file

I file salvati ed esportati finiscono dove il browser mette i download, di solito nella cartella Download. Per scegliere una cartella ogni volta:

:::chromium
Aprire le **Impostazioni** del browser, poi **Download**, e attivare **Chiedi dove salvare ogni file prima di scaricarlo**.
:::

:::firefox
Aprire **Impostazioni**, poi **Generali**, e in **File e applicazioni** scegliere **Chiedi sempre dove salvare i file**.
:::

:::safari
Aprire **Safari > Impostazioni > Generali** e impostare **Posizione download file** su **Chiedi per ogni download**.
:::

Se si salva due volte con lo stesso nome, il browser può aggiungere un numero al secondo file, per esempio `Site (1).civilcraft.json`. La volta successiva aprire il più recente.

## Online e offline

CivilCraft funziona solo sul proprio computer in entrambi i casi: aprire legge il file nel browser, salvare lo scarica. Per aprire CivilCraft senza alcuna connessione, salvarlo prima per l'uso offline:

1. Con connessione, fare clic su {{ui:Salva per l'uso offline}} nella barra dell'app in alto.
2. Il pulsante conta in avanzamento ("Salvataggio 12 di 30") e poi mostra {{ui:Pronto per l'uso offline}}. CivilCraft è piccolo (circa 0.6 MB), quindi serve un momento. La copia salvata comprende questa guida e il sito di esempio.
3. Senza connessione, aprire lo stesso indirizzo (o un segnalibro). Tutto funziona, compreso {{ui:Apri il sito di esempio}}.

Gli altri stati del pulsante:

- {{ui:Salvataggio non riuscito}}: alcuni file non sono stati scaricati. Controllare la connessione e fare clic per riprovare.
- {{ui:Offline non disponibile}}: questa finestra del browser non può mantenere una copia offline (le finestre private e alcuni computer gestiti lo impediscono). Usare una finestra normale.

Fare clic su {{ui:Pronto per l'uso offline}} per vedere quando è stata salvata la copia, con due scelte: {{ui:Salva di nuovo (scarica la versione più recente)}} e {{ui:Rimuovi la copia offline}}. Salvare di nuovo prima di una visita al sito, così la copia corrisponde alla versione più recente. Altro in [Offline](common:offline).

:::offline
Al momento non c'è connessione. Se CivilCraft è stato salvato per l'uso offline, tutto funziona, compreso il sito di esempio. Se non lo è, continuare a lavorare in questa scheda, ma non ricaricarla finché non c'è di nuovo connessione; senza una copia salvata, {{ui:Apri il sito di esempio}} non riesce e mostra "Impossibile caricare l'esempio".
:::

:::tip
Per l'uso sul campo, salvare CivilCraft per l'uso offline e portare i file di punti sul computer portatile stesso. Progetti ed esportazioni si salvano come download anche senza connessione, così è possibile importare le misure di una giornata, controllare la superficie e salvare il progetto sul posto.
:::

Il salvataggio nel cloud non è ancora disponibile, e le versioni desktop non sono ancora pronte. Oggi i file salvati sono l'unica copia: conservarli in un posto con backup.

## Add-on usati da un file

Quando si salva un progetto che contiene dati di un add-on (le caselle delle normative edilizie, oppure una sorgente Da indirizzo a sito), il file registra quali add-on e quali versioni. Aprirlo su un computer che ne è privo mostra una barra sopra la pianta che lo segnala e offre di aggiungerlo dall'elenco del proprio account. La registrazione è solo una nota: il file si apre comunque.

## Annulla da Studio

In CadCraft Studio, ogni passo completato in CivilCraft viene comunicato a Studio, così il suo annullamento a livello di progetto può annullare l'ultimo passo tra le applicazioni. Studio annulla un passo solo quando la pila di annullamento di CivilCraft è esattamente com'era dopo quel passo; dopo aver aperto un altro file, salta questa finestra.

## Chiusura con modifiche non salvate

Quando il progetto ha modifiche non salvate e si chiude la scheda, si ricarica la pagina o si lascia la pagina, il browser chiede se si vuole uscire. Il suo testo e il suo aspetto sono del browser e CivilCraft non può cambiarli. {{ui:Nuovo}}, e l'apertura di un progetto o di un file LandXML, chiedono invece nella finestra **Modifiche non salvate** di CivilCraft, con {{ui:Annulla}}, {{ui:Non salvare}} e {{ui:Salva una copia}}.
