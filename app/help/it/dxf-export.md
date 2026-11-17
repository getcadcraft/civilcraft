---
title: Esporta la pianta in DXF
summary: Scrive le linee della pianta come DXF R12 su layer con nome, con curve di livello alle loro quote e linee di discontinuità in 3D, per qualsiasi programma CAD.
keywords: dxf, dwg, cad, esporta, linee, r12, 2000, 2004, 2007, 2010, 2013, 2018, layer, curve di livello, scambio di disegni, mappa di base, sfondo
from: f2d8ede9
---

{{ui:DXF}} scrive ciò che mostra la pianta come file DXF nel formato R12, la versione che ogni programma CAD apre. Se si è già usato AutoCAD o Civil 3D, aprirlo o inserirlo come si fa con qualsiasi altro DXF.

## Esportazione

1. Impostare la pianta come si desidera per il disegno: in **Visualizza**, scegliere la superficie (esistente o di progetto), l'intervallo delle curve di livello e quali elementi sono attivi (curve di livello, etichette, punti, etichette dei punti, triangoli, linee di discontinuità, bordo della superficie, tubazioni, frecce di pendenza).
2. Fare clic su {{ui:DWG/DXF}} nel gruppo **Esporta** e scegliere {{ui:DXF (R12, testo) — il file di scambio semplice}}, quindi {{ui:Scarica}}.
3. Il browser scarica `<name>.dxf`. La barra di stato indica, ad esempio, "Esportato DXF R12: 2,140 oggetti; etichette dimensionate per 1" = 40'. Le fasce non vengono esportate."

Le coordinate vengono scritte nelle unità del progetto, con i loro valori reali (le coordinate state plane restano invariate). Nulla viene scalato o spostato.

## Cosa contiene il file

| Elemento | Entità DXF | Layer |
|---|---|---|
| Curve di livello secondarie e principali | Polilinee 2D alla loro quota | C-TOPO-MINR, C-TOPO-MAJR |
| Etichette delle curve di livello | Testo | C-TOPO-TEXT |
| Triangoli | Polilinee | C-TOPO-TINN |
| Linee di discontinuità e perimetro | Polilinee 3D | C-TOPO-BRKL |
| Bordo della superficie | Polilinee | C-TOPO-BNDY |
| Frecce di pendenza | Polilinee | C-TOPO-SLOP |
| Punti di rilievo e relative etichette | Punti (con quota), testo | V-NODE, V-NODE-TEXT |
| Linee da codici linea | Polilinee 3D | V-NODE-LINE |
| Assi dei tracciati | Linee e archi | C-ROAD-CNTR |
| Tacche e etichette delle progressive | Polilinee, testo | C-ROAD-STAN |
| Bordi del corridoio | Polilinee | C-ROAD-CORR |
| Linee di campionamento | Polilinee | C-ROAD-SCTN |
| Piazzali, linee di intersezione con il terreno, linee di scarpata | Polilinee | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Linee caratteristiche | Polilinee 3D (archi come tratti entro 0.01; vedi [Linee caratteristiche](topic:feature-lines)) | C-GRAD-FEAT |
| Percorsi di manovra | Polilinee, testo | C-ROAD-SWPT |
| Tubazioni, manufatti, etichette | Polilinee, testo | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Tubazioni e manufatti con problemi | Polilinee | C-STRM-PROB |

Ogni layer ha un colore. L'elenco completo è in [Layer della pianta](topic:plan-layers).

## Dimensione delle etichette

Il testo deve avere una dimensione nelle unità del disegno. CivilCraft dimensiona le etichette per la scala alla quale l'intera pianta entra in un foglio Tabloid (piedi) o in un foglio A3 (metri), e indica la scala nel messaggio di stato. Se si stampa a un'altra scala nel programma CAD, scalare il testo in quel punto.

## Cosa non viene esportato

- Fasce di quota (solo a schermo).
- La vista del profilo. I profili vengono esportati in LandXML, non come disegno.
- La superficie stessa come oggetto 3D. Per il TIN usare LandXML, oppure attivare {{ui:Triangoli}} per ottenerne i bordi come linee.
- Qualsiasi elemento disattivato in **Visualizza**.

## DWG

{{ui:DWG/DXF}} scrive anche le stesse linee come disegno DWG. La finestra di dialogo chiede il formato: DXF, oppure DWG 2000, 2004, 2007, 2010, 2013 o 2018. Il 2000 si apre in quasi tutti i programmi CAD, vecchi e nuovi; scegliere una versione più recente quando lo richiede chi riceve il disegno. La scelta viene ricordata in questo browser.

1. Fare clic su {{ui:DWG}} nel gruppo **Esporta**.
2. Scegliere il **Formato** e fare clic su **Scarica DWG**.
3. Il browser scarica `<name>.dwg`. La barra di stato indica cosa è stato inserito, ad esempio "Esportato DWG (formato 2018): 12 polilinee, 40 etichette su 9 layer".

Il DWG ha gli stessi layer, colori, curve di livello (come polilinee alla loro quota), linee di discontinuità 3D, etichette e punti del DXF, nelle stesse coordinate. I nomi dei layer che un DWG non può contenere vengono modificati, e il messaggio di stato lo indica. CivilCraft scrive il DWG con un proprio codice, quindi nulla lascia il computer.

### Layer cartografici nel DWG

Un disegno DWG non può contenere un'immagine al proprio interno: i programmi CAD mostrano un'immagine accanto al disegno. Quando i layer cartografici sono visibili, la finestra di dialogo propone **Layer cartografici come immagine accanto al disegno**. Con questa opzione selezionata, il download è un `.zip` che contiene `<name>.dwg`, `<name>-map.png` (i layer cartografici sull'intero disegno, fino a 4,096 pixel di larghezza) e `<name>-map.pgw` (il file di georeferenziazione, per i programmi GIS). Il disegno mostra l'immagine come immagine sul layer G-MAP-IMAG, nella posizione corretta. Estrarre i file in un'unica cartella e tenerli insieme.
