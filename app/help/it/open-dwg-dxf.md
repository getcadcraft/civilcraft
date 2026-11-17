---
title: Aprire un DWG o un DXF come linee
summary: Aprire le linee di un disegno sulla pianta, layer per layer, usarne le curve di livello, le polilinee 3D e i contorni chiusi per la superficie, e trasformare i suoi blocchi di punto in punti di rilievo.
keywords: verifica del rilievo, quote testuali, dwg, dxf, cad, disegno, linee, curve di livello, linee di discontinuità, contorno, polilinea, polilinea 3D, layer, mappa di base, topo, disegno di rilievo, blocchi, riferimenti a blocco, punti di rilievo da blocchi, attributi, blocchi di punto, punto di inserimento
from: da0f4c58
---

Un rilievo topografico arriva spesso come disegno: curve di livello come polilinee alla loro quota, linee di discontinuità come polilinee 3D, il contorno del sito come polilinea chiusa. CivilCraft apre lo **spazio modello** del disegno come layer sulla pianta, e può trasformare direttamente quelle linee in superficie.

## Aprire il disegno

1. Cliccare {{ui:Linee}} nel gruppo **Superficie** (oppure {{ui:Apri}}, o trascinare il file sulla pianta) e scegliere un file `.dwg` o `.dxf`. Il disegno viene letto su questo computer; nulla viene caricato. Vengono letti i DWG dal 2000 al 2018 e i DXF ASCII.
2. La finestra di dialogo **Linee** elenca i layer del disegno che contengono linee, forme chiuse o punti, e se hanno **quote**. I layer disattivati nel disegno partono deselezionati. Testo, tratteggi, quote e altri oggetti che non sono linee vengono conteggiati e omessi (la finestra indica quali).
3. Verificare **Unità del disegno**. Quando il disegno dichiara le sue unità, CivilCraft le converte in quelle del progetto (millimetri in metri, metri in piedi, pollici in piedi). Un disegno in piedi viene letto come piedi US survey senza scalatura: i due differiscono di 2 parti per milione, e scalare le coordinate State Plane di quella quantità le sposterebbe di piedi. Quando il disegno non dichiara le sue unità, i suoi numeri vengono letti nelle unità del progetto; scegliere le unità giuste nell'elenco se non lo sono.
4. In **Uso per la superficie**, scegliere che cosa dà ogni layer alla superficie (oppure lasciare **Mostra solo**). I layer con nomi da curve di livello (TOPO, CONT, CNTR) che hanno quote partono come linee di discontinuità.
5. Cliccare {{ui:Aggiungi}}. I layer compaiono sotto **Layer GIS** nel pannello di sinistra; ciascun uso viene inserito nella superficie. Ogni parte è un passo a sé: {{key:Mod+Z}} le annulla una alla volta.

## Che cosa può dare ogni tipo di layer

| Il layer contiene | Uso per la superficie |
|---|---|
| Curve di livello (polilinee a una quota) | Linee di discontinuità alla quota propria delle linee, oppure al campo ELEV |
| Polilinee 3D | Linee di discontinuità alle loro quote |
| Un contorno chiuso | Il contorno della superficie (la forma chiusa più grande, o quella selezionata) |
| Punti con una quota | Punti di rilievo, descritti con il nome del layer |
| Linee a quota 0 (disegno in pianta) | Nulla: resta sulla pianta come disegno di base |

Un disegno scritto da CivilCraft contiene le sue linee caratteristiche come polilinee 3D che ricordano i loro archi. La finestra mostra allora **Linee caratteristiche**: lasciarla selezionata per riportarle come linee caratteristiche con i loro archi e usi (un passo di annullamento), oppure deselezionarla per leggerle come linee, come qualsiasi altro layer.

Più tardi, usare {{ui:Uso per la superficie}} nel menu del layer sotto **Layer GIS** per fare lo stesso per un layer che si era solo mostrato.

## Punti di rilievo da blocchi

I disegni di rilievo portano spesso i loro punti come blocchi: un piccolo simbolo a ogni battuta, con attributi per il numero del punto, la descrizione e la quota. Quando il disegno ha riferimenti a blocco, la finestra mostra una sezione **Punti di rilievo da blocchi**:

1. Selezionare i blocchi da prendere (la tabella indica quanti riferimenti ha ciascuno, su quali layer e con quali attributi), oppure selezionare dei layer per prendere ogni riferimento a blocco su di essi.
2. Scegliere da dove vengono il **numero**, la **descrizione** e la **quota** di ciascun punto: un attributo, il nome del blocco o del layer, i numeri liberi successivi, oppure la Z del punto di inserimento. CivilCraft parte dagli attributi probabili (PT, DESC, ELEV e simili), e prende la quota da un attributo solo quando i blocchi si trovano a zero.
3. Deselezionare i layer delle linee se si vogliono solo i punti, quindi cliccare {{ui:Aggiungi}}.

Ogni riferimento diventa un punto di rilievo nel suo punto di inserimento. Contano solo i riferimenti collocati nello spazio modello; i blocchi annidati in altri blocchi no. I numeri già presenti nel progetto, o usati due volte nel disegno, ricevono nuovi numeri dopo il più alto, e un attributo di quota che non è un numero lascia quel punto senza quota; la riga di stato conta entrambi i casi. Il disegno non viene mai modificato, e ogni punto ricorda il suo blocco: le sue Proprietà mostrano **Da blocco** con il blocco, il layer e l'handle. Aggiungere i punti è un solo passo, quindi {{key:Mod+Z}} li rimuove tutti.

## Quote scritte come testo e verifica

Le quote puntuali scritte come testo (o in un attributo di blocco che non è un blocco di punto di rilievo) non sono linee. La sezione **Quote del rilievo e verifica** può prenderle come punti di rilievo, ed elenca ciò che sembra errato nel disegno: unità, sistema di coordinate, distanza dall'origine, curve di livello piatte, quote anomale, punti doppi. Vedere [Verificare un disegno di rilievo all'importazione](topic:survey-check).

## Come viene letto il disegno

- Archi, cerchi, ellissi, segmenti di polilinea con rigonfiamento e spline diventano brevi tratti rettilinei (ogni 5° al massimo).
- I riferimenti a blocco vengono disegnati dove sono collocati, anche quelli annidati; ciò che un blocco contiene sul layer 0 prende il layer del riferimento.
- Gli oggetti disegnati su un altro piano (una diversa direzione di estrusione) vengono collocati in coordinate mondiali.
- Ogni oggetto riceve tre campi: LAYER, TYPE (il tipo di oggetto) e ELEV (la sua quota quando tutti i suoi punti ne condividono una).
- Le coordinate vengono prese così come sono: il disegno deve usare le stesse coordinate del progetto (per esempio la stessa zona State Plane). I disegni collegati (xref) non vengono aperti: aprirli separatamente.

:::tip
Un disegno di curve di livello dà la superficie migliore con alcune quote puntuali su sommità e avvallamenti, dove le sole curve lasciano triangoli piatti. Aggiungerle come punti di rilievo, oppure da un layer di punti nel disegno.
:::
