---
title: File che puoi aprire, salvare ed esportare
summary: Importa file di punti, LandXML e progetti CivilCraft; esporta progetti, LandXML, DXF e PDF; cosa conserva ciascuno, dove vanno i file e cosa cambia offline.
keywords: apri, salva, esporta, importa, formati file, csv, txt, landxml, xml, dxf, pdf, json, scarica, file di progetto
from: a7debb61
---

CivilCraft apre file dal proprio computer e salva scaricando i file sul computer. Non si carica nulla e nulla viene conservato su un server. Vedi anche [I tuoi file](common:your-files).

## Cosa apre

Fare clic su {{ui:Apri}} (oppure premere {{key:Mod+O}}) e scegliere un file, oppure trascinare il file da {{pick:mac=Finder|windows=Esplora file|linux=il gestore di file}} sulla pianta. Un file alla volta; i file oltre 200 MB vengono rifiutati.

| Tipo | Nomi dei file | Cosa succede |
|---|---|---|
| File di punti | `.csv`, `.txt`, `.pnt`, `.xyz` (qualsiasi file di testo) | Si apre la finestra **Importa punti**. I punti sostituiscono quelli del progetto; tracciati, piazzali e tubazioni restano. |
| LandXML | `.xml`, `.landxml` | Dal file viene creato un **nuovo progetto** (prima viene chiesta conferma se quello attuale ha modifiche non salvate). |
| Progetto CivilCraft | `.civilcraft.json` (qualsiasi `.json`) | Il progetto si apre come era stato salvato (prima viene chiesta conferma se quello attuale ha modifiche non salvate). |

CivilCraft decide in base all'estensione del file e poi ai primi caratteri: il testo che inizia con `{` è letto come progetto, quello che inizia con `<` come LandXML, tutto il resto come file di punti. Un file che la finestra di apertura rende grigio può comunque essere trascinato sulla pianta.

:::note
Importare un file di punti in un progetto che ha già dei punti li sostituisce senza chiedere conferma e cancella la cronologia degli annullamenti (aprire un file qualsiasi fa ripartire da zero gli annullamenti). Se la superficie proveniva da LandXML, importare i punti la riporta a una superficie costruita dai punti. Salvare prima se si potrebbero voler recuperare i vecchi punti.
:::

Dettagli: [Formati dei file di punti](topic:point-file-formats), [LandXML: cosa viene letto e scritto](topic:landxml-reference).

## Cosa salva

{{ui:Salva}} ({{key:Mod+S}}) scrive due file affiancati, con il nome indicato in **Nome** nel pannello a sinistra: `<name>.civilcraft.json`, il progetto che si continua a modificare, e `<name>.ifc`, lo stesso progetto come IFC 4.3 per gli altri programmi (vedi [Esportazione e importazione IFC](topic:ifc)). Ciascun file registra l'altro, e l'IFC contiene anche una copia compressa del progetto, quindi un IFC inviato da solo può essere riaperto completamente modificabile.

- **In Studio** entrambi i file vengono scritti uno accanto all'altro, nello stesso posto.
- **In Chrome e Edge** al primo salvataggio viene chiesta una cartella e vi vengono scritti entrambi; i salvataggi successivi vanno nella stessa cartella. Annullare la richiesta della cartella per scaricare invece entrambi.
- **In altri browser** entrambi i file vengono scaricati, prima il file di progetto.

Aprendo uno dei due file si cerca l'altro. Aprire entrambi insieme (o trascinarli entrambi), oppure aprirne uno: in Studio l'altro viene trovato nella stessa cartella; in un browser CivilCraft chiede di aggiungerlo, oppure di proseguire con quello che si ha. Se l'IFC è stato modificato da un altro programma dopo il salvataggio di CivilCraft, oppure uno dei due file è più vecchio dell'altro, il progetto si apre dal modello più recente e il pannello **Problemi** spiega cosa è successo, con **Salva ora** (riscrive entrambi i file) e **Mostra la geometria dell'IFC come riferimento**. Un IFC da solo, modificato da un altro programma, si apre dalla sua copia del progetto con ciò che ancora corrisponde: i tracciati che ha modificato assumono la sua geometria, gli oggetti che ha rimosso vengono esclusi, e le altre modifiche sono elencate ma non applicate. Un file di progetto anteriore alla versione 0.7.1 si apre come prima.

Il file di progetto conserva:

- ogni punto (numero, coordinate, quota, descrizione) e il nome del file di punti da cui provengono
- le impostazioni della superficie: scelte dei gruppi, linee di discontinuità disegnate, il contorno, il bordo esterno più lungo e un TIN letto da LandXML
- le impostazioni di visualizzazione
- i tracciati con i loro PI, raggi e progressiva iniziale, i loro profili di progetto (PVI e lunghezze delle curve) e le impostazioni del corridoio
- i piazzali e la rete di tubazioni con le sue regole

Non conserva la cronologia degli annullamenti. Superfici, curve di livello, linee di intersezione con il terreno e volumi non vengono memorizzati; vengono ricostruiti dagli input salvati quando il progetto si apre. Un file di progetto di una versione più recente di CivilCraft viene rifiutato con un messaggio che indica la sua versione.

## Cosa esporta

| Pulsante | File | Contenuto |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: punti, il terreno esistente (e la superficie di progetto quando presente) come superfici TIN, tracciati, profili del terreno e di progetto, la rete di tubazioni |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 della pianta così come è visualizzata, su layer con nome |
| {{ui:DWG}} | `<name>.dwg` | Gli stessi tratti come disegno DWG, nel formato scelto (dal 2000 al 2018) |
| {{ui:PDF}} | `<name>.pdf` | Un plot vettoriale della pianta su un foglio, alla scala scelta |
| {{ui:GLB}} o {{ui:OBJ}} (sulla barra della vista 3D) | `<name>-3d.glb`, `<name>-3d.obj` | Ciò che la vista 3D mostra come modello 3D: metri, asse Y verso l'alto, scala reale, attorno a un'origine locale registrata |

Cosa esclude ciascuno: [Scambio LandXML](topic:landxml), [Esporta la pianta in DXF](topic:dxf-export) (anche DWG), [Stampa la pianta in PDF](topic:plot-pdf), [Esporta il sito in 3D](topic:export-3d).

## Dove vanno i file

I file salvati ed esportati finiscono dove il browser mette i download, di solito nella cartella Download. Per scegliere una cartella ogni volta:

:::chromium
Aprire le **Impostazioni** del browser, poi **Download**, e attivare **Chiedi dove salvare ogni file prima di scaricarlo**.
:::

:::firefox
Aprire **Impostazioni**, poi **Generali**, e in **File e applicazioni** scegliere **Chiedi sempre dove salvare i file**.
:::

:::safari
Aprire **Safari > Impostazioni > Generali** e impostare **Posizione download dei file** su **Chiedi per ogni download**.
:::

Se si salva due volte con lo stesso nome, il browser può aggiungere un numero al secondo file, per esempio `Site (1).civilcraft.json`. La volta successiva, aprire il più recente.

## Online e offline

CivilCraft funziona solo sul proprio computer in entrambi i casi: aprire legge il file nel browser, salvare lo scarica. Per aprire CivilCraft senza alcuna connessione, salvarlo prima per l'uso offline:

1. Mentre si è online, fare clic su {{ui:Salva per l'uso offline}} nella barra dell'app in alto.
2. Il pulsante conta ("Salvataggio 12 di 30") e poi mostra {{ui:Pronto per l'uso offline}}. CivilCraft è piccolo (circa 0.6 MB), quindi occorre un momento. La copia salvata include questa guida e il sito di esempio.
3. Senza connessione, aprire lo stesso indirizzo (o un segnalibro di esso). Tutto funziona, incluso {{ui:Apri il sito di esempio}}.

Gli altri stati del pulsante:

- {{ui:Salvataggio non riuscito}}: alcuni file non sono stati scaricati. Controllare la connessione e fare clic per riprovare.
- {{ui:Offline non disponibile}}: questa finestra del browser non può conservare una copia offline (le finestre private e alcuni computer gestiti lo impediscono). Usare una finestra normale.

Fare clic su {{ui:Pronto per l'uso offline}} per vedere quando la copia è stata salvata, con due scelte: {{ui:Salva di nuovo (scarica la versione più recente)}} e {{ui:Rimuovi la copia offline}}. Salvare di nuovo prima di una visita in cantiere, così la copia corrisponde all'ultima versione. Altro in [Offline](common:offline).

:::offline
Ora si è offline. Se CivilCraft è stato salvato per l'uso offline, tutto funziona, incluso il sito di esempio. Se non lo è, continuare a lavorare in questa scheda, ma non ricaricarla finché non si torna online; senza una copia salvata, {{ui:Apri il sito di esempio}} non funziona e mostra "Impossibile caricare il sito di esempio".
:::

:::tip
Per l'uso sul campo, salvare CivilCraft per l'uso offline e portare i file di punti direttamente sul computer portatile. Progetti ed esportazioni si salvano come download anche senza connessione, quindi è possibile importare le misurazioni di una giornata, controllare la superficie e salvare il progetto in cantiere.
:::

Il salvataggio su cloud non è ancora disponibile e le versioni desktop non sono ancora pronte. Per ora i file salvati sono l'unica copia: conservarli in un luogo di cui viene fatto il backup.

## Add-on usati da un file

Quando si salva un progetto che contiene dati di un add-on (le spunte di Normativa edilizia, o una fonte Da indirizzo a sito), il file registra quali add-on e quali versioni. Se lo si apre su un computer che non ne ha uno, una barra sopra la pianta lo segnala e offre di aggiungerlo dall'elenco del proprio account. La registrazione è solo una nota: il file si apre in ogni caso.

## Annulla da Studio

In CadCraft Studio, ogni passaggio completato in CivilCraft viene comunicato a Studio, così il suo annullamento a livello di progetto può riportare indietro l'ultimo passaggio tra le app. Studio annulla un passaggio solo quando la pila di annullamenti di CivilCraft è esattamente com'era dopo quel passaggio; dopo aver aperto un altro file, questa finestra viene saltata.

## Chiusura con modifiche non salvate

Quando il progetto ha modifiche non salvate e si chiude la scheda, si ricarica la pagina o si lascia la pagina, il browser chiede se si vuole uscire. Il suo testo e il suo aspetto appartengono al browser e non possono essere modificati da CivilCraft. {{ui:Nuovo}}, e l'apertura di un progetto o di un file LandXML, chiedono invece nella finestra **Modifiche non salvate** di CivilCraft, con {{ui:Annulla}}, {{ui:Non salvare}} e {{ui:Salva una copia}}.
