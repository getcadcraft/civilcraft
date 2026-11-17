---
title: Linee caratteristiche
summary: Disegnare linee 3D di cui si definisce la pendenza vertice per vertice, creare offset a gradini di queste linee e usarle come linee di discontinuità del terreno o come piazzali in pendenza nel progetto.
keywords: arco, curva, raggio, arco 3d, elica, cordolo curvo, sovrapposizione pendenza, sovrapposizione quota, frecce di pendenza, linea caratteristica, pendenza, quota, offset a gradini, offset, linea di discontinuità, cordolo, fosso, berma, piazzale in pendenza, intersezione con il terreno, modellazione del terreno, polilinea 3d
from: d55b25fb
---

Una linea caratteristica è una linea con una quota in ogni vertice: un cordolo, una linea di flusso di un fosso, il ciglio di una berma, il bordo di un piazzale in pendenza. Si impostano le quote per valore o per pendenza, la si copia lateralmente con un gradino verso l'alto o verso il basso, e si sceglie cosa fanno le superfici con essa.

## Disegnare una linea

1. Scegliere **Superficie** › {{ui:Altro}} › {{ui:Linea caratteristica}}, oppure premere {{key:L}}.
2. Fare clic sui vertici nella pianta. Un clic su un punto di rilievo ne assume posizione e quota; in ogni altro punto il vertice assume la quota del terreno esistente in quel punto.
3. Premere {{key:Enter}} per completare una linea aperta, oppure fare clic di nuovo sul primo vertice per chiuderla.

La nuova linea viene selezionata e inizia come linea di discontinuità del terreno esistente, appoggiata sul terreno.

## Archi

Un segmento può essere un arco in pianta le cui estremità si trovano a quote diverse: un raccordo di cordolo, un fosso curvo, una rampa che gira. La pendenza procede in modo uniforme lungo l'arco, e la sua lunghezza è misurata lungo la curva.

- **Durante il disegno:** premere {{key:C}} (su schermo touch, {{ui:Arco}} nella barra sopra la pianta) per attivare gli archi. Dopo un vertice, fare clic su un punto della curva, poi fare clic dove termina l'arco. Premere di nuovo {{key:C}} per i segmenti rettilinei. {{key:Backspace}} elimina prima il punto sulla curva.
- **In seguito:** in **Proprietà**, digitare un raggio e il verso di curvatura nel campo **Arco** del vertice, per esempio `50 L` o `50 R` (sinistra o destra percorrendo la linea), e premere {{key:Enter}}. Svuotare il campo per rendere di nuovo rettilineo il segmento. Un raggio inferiore alla metà del segmento viene rifiutato.

La linea selezionata mostra il raggio di ogni arco accanto alla sua pendenza. **Lunghezza** è misurata lungo gli archi in pianta; **Lunghezza 3D** conta anche salita e discesa. Gli offset a gradini mantengono gli archi: un arco all'esterno di una curva si allunga, uno all'interno si accorcia, e un offset oltre il centro di un arco viene rifiutato.

Le superfici, la vista 3D, DXF e DWG rappresentano ogni arco con brevi tratti rettilinei che restano entro 0.01 dalla curva. LandXML li mantiene come archi (vedi **Archi in altri file** più sotto).

## Impostare quote e pendenze

**Proprietà** elenca i vertici con la loro distanza lungo la linea, la loro **Quota** e la **Pendenza al successivo** (in percentuale). Digitare l'uno o l'altro e premere {{key:Enter}}:

- Una quota sposta solo quel vertice.
- Una pendenza imposta la quota all'estremità opposta del suo segmento; i vertici successivi restano dove sono, quindi cambia la pendenza del segmento successivo.

Sempre in **Proprietà**:

| Azione | Cosa fa |
|---|---|
| **Alza o abbassa tutto di** | Aggiunge l'altezza digitata a ogni vertice. |
| {{ui:Quote dal terreno}} | Riporta ogni vertice sul terreno esistente (i vertici fuori dalla superficie mantengono la propria quota e vengono elencati). |
| {{ui:Una sola pendenza, dal primo all'ultimo}} | Mantiene le quote del primo e dell'ultimo vertice e porta i vertici intermedi su un'unica pendenza uniforme. |

La linea selezionata mostra le sue quote ai vertici e le sue pendenze lungo i segmenti sulla pianta. Trascinare un vertice con {{ui:Seleziona}} per spostarlo; la sua quota resta invariata.

## Offset a gradini

In **Offset a gradini**, digitare una **Distanza** (positiva a destra della direzione della linea, negativa a sinistra), poi un'altezza (di quanto salire o scendere) o una pendenza in percentuale, e fare clic su {{ui:Crea la linea di offset}}. La copia è una nuova linea caratteristica: per esempio il retro di un cordolo a 0.5 ft di lato e 0.5 ft più alto, oppure il bordo di un fosso a 6 ft con pendenza del 2 %. Una distanza che porterebbe la copia a ripiegarsi su se stessa in una curva stretta viene rifiutata.

## Pendenze e quote a schermo

Premere {{key:E}}, oppure selezionare **Pendenze e quote sulle linee caratteristiche** in **Visualizza**, per vedere la pendenza di ogni linea caratteristica lungo ogni segmento (con una piccola freccia rivolta verso il basso) e la sua quota ai vertici. Vengono mostrate solo a schermo: nulla viene aggiunto al disegno, e PDF, DXF e DWG restano invariati. I segmenti brevi e i vertici affollati restano senza etichetta finché non si ingrandisce. La linea selezionata mostra sempre le proprie pendenze e quote.

## Nella vista del profilo

Una linea caratteristica che attraversa un tracciato compare nella vista del profilo di quel tracciato, con il suo nome e la sua quota all'intersezione; possono essere mostrate anche le linee che corrono accanto ad essa. Vedi [Progetta un profilo verticale](topic:profile).

## Cosa fanno le superfici

Scegliere **Uso**:

| Uso | Cosa succede |
|---|---|
| Linea di discontinuità del terreno esistente | Il terreno esistente passa per la linea alle sue quote, come una linea di discontinuità disegnata. |
| Modellata nel progetto | Una linea **chiusa** diventa un piazzale in pendenza: la superficie di progetto al suo interno viene modellata fino al bordo. Attivare **Intersezione con il terreno** per tracciare scarpate di scavo e riporto (orizzontale a 1 verticale) dal suo bordo al terreno, come fa un piazzale; ogni scarpata parte dalla quota propria del bordo in quel punto. |
| Solo disegnata | Resta sulla pianta ed è esportata in DXF, DWG e PDF (layer C-GRAD-FEAT, polilinee 3D), ma le superfici la ignorano. |

Volumi, sezioni e vista 3D includono le linee caratteristiche modellate nel progetto, come i piazzali. Ogni modifica è un'unica operazione: {{key:Mod+Z}} la annulla.

## Condividere le linee con il team

In un disegno aperto dai file cloud in CadCraft Studio, con piano team, le **Proprietà** del progetto (con nulla selezionato) contengono una sezione **Team** con {{ui:Linee del team…}}: le linee che il team ha condiviso, ciascuna con la sua revisione, senza dover prima selezionare una linea caratteristica. Selezionare una linea per condividerla, inviare una nuova revisione, ricevere quella del team, o interrompere la condivisione. Fuori da questa impostazione la sezione indica cosa serve.

## Archi in altri file

| File | Cosa succede a una linea caratteristica con archi |
|---|---|
| Progetto CivilCraft | Mantenuta esattamente. |
| LandXML | Scritta come elemento di pianta con linee e archi con le loro quote, e riletta con i suoi archi. Una linea caratteristica proveniente da un altro programma viene importata come **Solo disegnata**: scegliere il suo **Uso** per inserirla in una superficie. |
| DWG e DXF | Una polilinea 3D non può contenere un arco, quindi la linea viene scritta come brevi tratti entro 0.01 da ciascun arco. CivilCraft annota inoltre nel disegno quali tratti erano archi: quando si apre il disegno come linee, {{ui:Linee caratteristiche}} riporta le linee come linee caratteristiche con i loro archi. Gli altri programmi vedono una normale polilinea 3D. |
