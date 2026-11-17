---
title: Da altri software per l'ingegneria civile
summary: Come i flussi di lavoro familiari della progettazione civile corrispondono a CivilCraft, e le differenze che disorientano gli utenti esperti nella prima ora.
keywords: passaggio, migrazione, familiare, differenze, flusso di lavoro, comandi, corrispondenza, cogo, corridoio, sistemazione, rete di tubazioni, stili, riga di comando
from: feae37d6
---

Se si è usato Civil 3D, si conoscono già le idee di CivilCraft: punti e gruppi di punti, superfici TIN con linee di discontinuità e contorni, tracciati per PI, profili per PVI, sezioni tipo assemblate in corridoi, sistemazione fino al terreno esistente, reti di tubazioni a gravità, LandXML. Ciò che è diverso è quasi tutto ciò che sta intorno: non c'è un file di disegno, non c'è una riga di comando (a meno di scegliere lo stile di menu {{ui:Disegno classico}}), non ci sono stili, nessun Prospector e nessuna finestra di impostazioni. CivilCraft è uno strumento piccolo e mirato, in un browser, e in questa versione fa una frazione di ciò che fa un pacchetto civile completo. Questa pagina associa ciò che si conosce a ciò che c'è qui.

:::tip
Se si preferisce la barra multifunzione di Civil 3D, scegliere lo stile di menu {{ui:Barra civile}} in {{ui:Impostazioni}} › {{ui:CivilCraft}} › {{ui:Menu, tasti e mouse}}: schede Home, Superfici, Modifica, Geolocalizzazione, Vista e Output; il pulsante centrale sposta la vista, e {{key:Shift}} con il pulsante centrale fa orbitare la vista 3D. Se si digitano comandi, {{ui:Disegno classico}} aggiunge una riga di comando (ALIGNMENT, PAD, PROFILE, ZOOM …). Vedi [Menu, tasti e mouse](topic:menus-keys-and-mouse).
:::

## Mappa dei flussi di lavoro

| Cosa si vuole fare | Modo familiare | In CivilCraft |
|---|---|---|
| Importare punti di rilievo | Importare punti con un formato di file di punti | {{ui:Apri}}, poi controllare l'ordine delle colonne in **Importa punti** ([Importare punti di rilievo](topic:import-points)) |
| Ordinare i punti | Gruppi di punti, chiavi di descrizione | Gruppi automatici in base alla prima parola della descrizione; nessuna chiave di descrizione |
| Modificare un punto | Editor dei punti, maniglie | Fare clic e digitare nelle Proprietà, oppure trascinarlo ([Modificare un punto di rilievo](topic:edit-points)) |
| Costruire il terreno esistente | Creare una superficie, aggiungere gruppi di punti come dati | Automatico: la superficie si ricostruisce ogni volta che cambiano i suoi dati in ingresso |
| Aggiungere linee di discontinuità | Aggiungere linee di discontinuità da polilinee o linee caratteristiche | Impostare un gruppo di punti su {{ui:Linea di discontinuità}}, oppure fare clic sui punti con lo strumento {{ui:Linea di discontinuità}} ({{key:B}}) |
| Ritagliare la superficie | Contorno esterno, contorno nascosto, lunghezza massima del triangolo | {{ui:Contorno}} ({{key:O}}, solo esterno) e **Lato esterno più lungo** |
| Mostrare le curve di livello | Stile della superficie | **Visualizza** nel pannello sinistro: intervallo, maggiore ogni, etichette, fasce, frecce di pendenza |
| Impostare la mezzeria | Strumenti di creazione tracciati, impostazioni di curve e clotoidi | {{ui:Tracciato}} ({{key:A}}): fare clic sui PI, {{key:Enter}}; raggi e lunghezze delle clotoidi nella tabella dei PI |
| Creare una vista del profilo | Procedura guidata della vista del profilo, fasce | {{ui:Profilo}} ({{key:R}}): una vista del profilo sotto la pianta, sempre adattata |
| Progettare la pendenza | Strumenti di progettazione del profilo | {{ui:Inizia dal terreno}}, {{ui:Aggiungi PVI}} ({{key:I}}), trascinare i PVI, digitare **Curva L** |
| Costruire una strada | Assemblaggio, subassemblaggi, corridoio, obiettivi, regioni | Spuntare **Sweep di un assemblaggio lungo il profilo di progetto** sotto il tracciato; una corsia, una banchina e una scarpata per lato, oppure ogni lato costruito con parti (cunetta, cordolo, marciapiede …) |
| Sistemare un piazzale | Linee caratteristiche, gruppi di sistemazione, criteri di sistemazione | {{ui:Piazzale}} ({{key:G}}): un piazzale piano con scarpate di sterro e riporto fino al terreno |
| Calcolare i movimenti di terra | Superfici di volume, cruscotto dei volumi | **Movimenti di terra** nel pannello destro, con metodo a griglia, si aggiorna in tempo reale |
| Progettare acque meteoriche o nere | Rete di tubazioni con elenco parti, regole | {{ui:Tubazioni}} ({{key:P}}): fare clic sui manufatti a valle; tre regole da impostare; quote di fondo automatiche |
| Scambiare con altri | Importazione ed esportazione LandXML | {{ui:Apri}} un file LandXML; {{ui:LandXML}} per esportare ([Scambiare LandXML](topic:landxml)) |
| Inviare il tracciato al CAD | Esportazione in DWG | {{ui:DWG}} (formato dal 2000 al 2018) oppure {{ui:DXF}} (R12) |
| Stampare | Layout, viewport, set di tavole | {{ui:PDF}}: un foglio orizzontale della pianta a una scala scelta; fogli di pianta, di profilo e di sezione in PDF |
| Condividere lavoro tra file | Collegamenti dati, riferimenti | Non disponibile: un progetto per file |
| Annullare | Annulla | {{key:Mod+Z}} e {{key:Mod+Y}}, 200 passi; le impostazioni di visualizzazione non sono passi di annullamento |

## Differenze che disorientano

**Non c'è una riga di comando** a meno di scegliere lo stile di menu {{ui:Disegno classico}}. Gli strumenti sono pulsanti della barra degli strumenti e lettere singole: {{key:A}} tracciato, {{key:G}} piazzale, {{key:P}} tubazioni, {{key:B}} linea di discontinuità, {{key:O}} contorno, {{key:R}} profilo, {{key:I}} aggiungi PVI, {{key:V}} seleziona, {{key:F}} adatta. Negli altri stili di menu, digitare un nome di comando non fa nulla. Vedi [Tasti e mouse](topic:keyboard).

**Invio termina; il doppio clic è rischioso.** Fare clic una sola volta sull'ultimo punto, poi premere {{key:Enter}}. In questa versione anche un doppio clic termina, ma elimina il punto su cui si è fatto doppio clic. Il clic destro non termina né ripete; sposta la vista solo quando lo si trascina.

**Tutto è dinamico, sempre.** Modificando un gruppo di punti, un raggio, un PVI o una pendenza di piazzale, la superficie, le curve di livello, il corridoio, le linee di intersezione con il terreno e i volumi si aggiornano subito. Non c'è nulla da ricostruire e nulla va fuori data.

**Nulla è un oggetto di disegno.** La pianta è una vista del progetto, non un disegno che si modifica con i comandi CAD. Non si possono aggiungere linee o testi propri, cambiare il colore di un layer o esplodere qualcosa. Esportare in DXF e completare il disegno in un programma CAD.

**Nessuno stile.** Colori, spessori di linea, dimensioni delle etichette e nomi dei layer sono fissi (vedi [Layer della pianta](topic:plan-layers)). Carta e Modello nella barra dell'app passano tra uno schermo chiaro e uno scuro.

**Una sola per tipo.** Una superficie del terreno esistente, una risultante sistemata, una rete di tubazioni per progetto. Molti tracciati e piazzali sono ammessi.

**Le unità sono etichette.** Scegliere {{ui:Piedi USA}} o {{ui:Metri}} non converte nulla. Non esiste una scala di disegno. Un sistema di coordinate è facoltativo: impostarlo in {{ui:Coordinate}} e non si sposta nulla, indica solo il significato dei numeri (vedi [Impostare il sistema di coordinate del progetto](topic:coordinate-systems)). I piedi sono scritti come piedi USA di rilievo quando si esporta in LandXML.

**I gruppi di linee di discontinuità si uniscono in ordine di numero di punto.** Un gruppo impostato su {{ui:Linea di discontinuità}} diventa una linea unica che passa per tutti i suoi punti, in ordine di numero. I codici condivisi (due linee di flusso codificate entrambe "FL") fanno una sola linea a zig-zag; disegnarle a mano.

**Le progressive sono uguali, i metri differiscono.** I piedi usano progressive da 100 ft (12+34.56); i metri usano progressive da 1000 m (1+234.567).

**Canc su Mac.** Il tasto Mac etichettato delete corrisponde a Backspace nel browser. Usare Fn e delete, oppure il pulsante {{ui:Elimina}}, per eliminare una selezione.

**I file sono download.** {{ui:Salva}} scarica un file `.civilcraft.json` ogni volta; non esiste un "salva sul file aperto". Una copia di ripristino del lavoro non salvato è conservata in questo browser ([Recuperare il lavoro non salvato](common:recover)). Aprire un file di punti sostituisce i punti senza chiedere. Vedi [File che si possono aprire, salvare ed esportare](topic:files).

**Le regole sono proprie.** Le regole della rete di tubazioni e l'assemblaggio del corridoio partono con valori segnaposto che non sono uno standard. Impostare i propri prima di fidarsi di una verifica.

**I volumi sono su griglia.** Sterro e riporto derivano da una griglia fine tra le due superfici, dentro le linee di intersezione con il terreno, senza rigonfiamento né ritiro. Sono vicini a, ma non uguali a, un volume TIN-a-TIN.

## Cosa manca

Spirali diverse dalla clotoide, assemblaggi che cambiano lungo la strada, piazzali inclinati, capacità delle caditoie e laminazione, cataloghi di parti, tubazioni nel profilo, layout delle particelle e dimensionamento dei lotti, compensazione ai minimi quadrati e banche dati di rilievo, apertura di DWG, e altro. L'elenco completo, con ciò che si può fare invece oggi, è in [Non ancora implementato](topic:not-built-yet).
