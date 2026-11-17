---
title: Impostazioni di CivilCraft
summary: Scegliere l'ordine delle colonne per le righe di punti copiate e incollate e per indovinare le colonne di un file, come vengono numerati i punti incollati, che cosa mostrano le etichette dei punti, l'indicatore d'angolo, l'esagerazione verticale 3D, come si mostrano latitudine e longitudine, e se i layer cartografici arrivano da internet.
keywords: impostazioni, preferenze, ordine delle colonne, righe dei punti, rinumerare, numeri dei punti, numero iniziale, etichette dei punti, etichette, descrizione, quota, cubo di navigazione, icona degli assi, indicatore d'angolo, bussola, esagerazione verticale, 3D, latitudine, longitudine, GMS, gradi decimali, layer cartografici, internet, privacy, pnezd, penzd
from: 64b9cb92
---

Aprire {{ui:Impostazioni}} con l'ingranaggio nella barra dell'app oppure con {{key:Mod+,}}. La prima scheda, {{ui:CivilCraft}}, contiene le impostazioni proprie di questa app; {{ui:Generali}} contiene quelle che condividono tutte le app di CadCraft (tema, barra degli strumenti, pannelli). Le impostazioni di CivilCraft valgono solo nell'app: si modificano qui, e questo browser le ricorda. {{ui:Ripristina impostazioni di CivilCraft}} riporta ogni impostazione al valore iniziale.

## Righe dei punti

**P, N, E, Z, D** (iniziale) o **P, E, N, Z, D**: punto, nord, est, quota, descrizione, oppure est prima di nord. Viene usata in tre punti:

- **Copia**: le righe che CivilCraft mette negli appunti di sistema per un foglio di calcolo.
- **Incolla**: righe incollate da un foglio di calcolo o da un file di testo senza riga di intestazione.
- **Importa**: l'ipotesi nella finestra **Importa punti** quando un file non ha riga di intestazione (un file con quattro colonne si legge come PENZ, con tre come ENZ). Vedere [Formati dei file di punti](topic:point-file-formats).

Una riga di intestazione che nomina le colonne prevale sempre, e così una scelta nell'elenco **Colonne** della finestra di importazione.

## Numeri per i punti incollati

- **Mantieni i numeri liberi** (iniziale): un punto incollato mantiene il suo numero quando nessun punto lo ha; solo i punti in conflitto ricevono nuovi numeri.
- **Sempre numeri nuovi**: ogni punto incollato riceve un nuovo numero, anche se il suo è libero.

**I nuovi numeri partono da**: lasciarlo vuoto per contare a partire da uno in più del numero più alto in uso. Digitare un numero, per esempio 5000, per assegnare ai nuovi punti numeri a partire da 5000; i numeri già in uso sono saltati. In entrambi i casi due punti non condividono mai un numero. Vedere [Selezionare, copiare e incollare punti di rilievo](topic:copy-paste-points#point-numbers-never-clash).

## Etichette dei punti

Che cosa mostra un'etichetta di punto quando {{ui:Etichette dei punti}} è attiva sotto **Visualizzazione**: **Numero**, **Numero e quota**, oppure **Numero, quota e descrizione** (iniziale). Le esportazioni DXF, DWG e PDF mostrano le stesse etichette dello schermo.

## Indicatore d'angolo

Che cosa sta nell'angolo della pianta e della vista 3D: **Cubo di navigazione** (iniziale), **Icona degli assi** oppure **Nessuno**.

- **Cubo di navigazione** (in alto a destra). In pianta mostra la vista dall'alto, con l'anello della bussola: N è il nord della griglia (in alto nella pianta). Fare clic su un altro lato, spigolo o vertice del cubo, oppure trascinarlo, e la [vista 3D](topic:site-3d) si apre guardando da lì. {{ui:Home}} sul cubo della pianta adatta la pianta alla finestra.
- Nella vista 3D il cubo ruota con la vista: fare clic su un lato, spigolo o vertice per guardare da lì, trascinare il cubo per l'orbita, trascinare l'anello della bussola per ruotare il sito attorno alla verticale, fare clic su una lettera per guardare da quel lato, e usare {{ui:Home}} per la vista isometrica dell'intero sito. Guardando direttamente un lato, le piccole frecce passano al lato successivo e le frecce curve ruotano la vista di un quarto di giro.
- **Icona degli assi** (in basso a sinistra): un piccolo indicatore X (est) e Y (nord) in pianta, X, Y e Z (in alto) in 3D.

## Esagerazione verticale 3D

Quanto la vista 3D allunga le quote: **1×**, **2×** (iniziale), **3×**, **5×** o **10×**. L'elenco nella barra della vista 3D è la stessa impostazione: cambiare l'uno cambia entrambi. Volumi, profili ed esportazioni 3D restano in scala vera.

## Latitudine e longitudine

Come la barra di stato mostra latitudine e longitudine del puntatore quando il progetto ha un sistema di coordinate: **gradi, minuti e secondi** (iniziale, per esempio `30°18′00.00″ N`) oppure **gradi decimali** (`30.300000° N`). Vedere [Impostare il sistema di coordinate del progetto](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Layer cartografici da internet

**Disattivato** (iniziale) oppure **Attivato**. Quando è attivo, CivilCraft chiede ai server cartografici che si aggiungono le immagini dell'area a schermo. Il disegno resta su questo computer; il server vede l'area e l'indirizzo internet. Finché è disattivato, nessun server cartografico viene interrogato, anche quando un progetto aperto ne indica uno; un'immagine georeferenziata da file funziona comunque. Vedere [Mostrare i layer cartografici sotto la pianta](topic:map-layers).

## Assistenti IA

**Consenti agli assistenti IA e agli script di usare CivilCraft** (disattivato all'inizio) permette a un assistente sul proprio computer di raggiungere il sito aperto tramite CadCraft Studio: **Leggi** descrive il sito e fornisce punti, quote delle superfici, progressive, profili, volumi e particelle; **Modifica** permette di selezionare e aggiungere punti di rilievo; **Salva** ed **Esporta** gli permettono di salvare il progetto e scrivere LandXML o DWG. **Cartelle utilizzabili** (in Studio) sono dove può salvare ed esportare. **Attività** elenca le sue chiamate. Vedere [Far lavorare un assistente IA con il proprio sito](topic:assistants).
