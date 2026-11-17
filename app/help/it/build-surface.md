---
title: Costruire e rifinire la superficie
summary: Come CivilCraft triangola il terreno esistente e come modellarlo con gruppi di linee di discontinuità, linee di discontinuità disegnate, un contorno esterno e il lato esterno più lungo.
keywords: tin, superficie, triangolazione, linea di discontinuità, contorno, terreno esistente, eg, crea superficie, delaunay, triangoli, lato massimo, contorno esterno
from: b9eea3f3
---

CivilCraft ha una sola superficie del terreno esistente per progetto. È un TIN (rete irregolare triangolata) costruito dai propri punti, e si ricostruisce automaticamente ogni volta che cambia un dato in ingresso. Non esiste un comando "ricostruisci" né una superficie non aggiornata.

## Cosa entra nella superficie

- Ogni punto con una quota in un gruppo impostato su {{ui:Punti}}.
- Ogni gruppo impostato su {{ui:Linea di discontinuità}}, unito in ordine di numero di punto.
- Ogni linea di discontinuità disegnata con lo strumento {{ui:Linea di discontinuità}}.
- Il contorno esterno, se ne è disegnato uno.
- L'impostazione **Lato esterno più lungo**.

I triangoli non attraversano mai una linea di discontinuità: la superficie è costretta a seguirla, poi resa il più regolare possibile intorno a essa (Delaunay altrove).

## Rendere le linee codificate in linee di discontinuità

1. Nel pannello sinistro, sotto **Punti**, trovare il gruppo (per esempio FL).
2. Impostare la sua scelta **Superficie** su {{ui:Linea di discontinuità}}.
   La superficie si ricostruisce, la linea è disegnata in arancione (con {{ui:Linee di discontinuità}} attivo sotto **Visualizza**), e **Linee di discontinuità** nei dati della superficie aumenta di uno.
3. Controllare la linea sulla pianta. Deve passare punto per punto, nell'ordine in cui è stata rilevata. Se fa zig-zag, il gruppo contiene più di una linea, oppure i punti non sono numerati in ordine: riportare il gruppo su {{ui:Punti}} e disegnare le linee a mano (sezione seguente).

## Disegnare una linea di discontinuità tra punti

1. Premere {{key:B}}, oppure fare clic su {{ui:Linea di discontinuità}} nel gruppo **Superficie**.
   Il suggerimento dice "Linea di discontinuità: fare clic sui punti di rilievo in ordine (ne prende le quote). Invio termina."
2. Spostare il puntatore vicino a un punto. Un piccolo quadrato arancione segna il punto che verrà preso.
3. Fare clic sui punti della linea, uno dopo l'altro. Ogni clic indica il punto e la sua quota nella barra di stato.
4. Premere {{key:Enter}} per terminare.
   La barra di stato dice "Linea di discontinuità 1 aggiunta; la superficie è stata ricostruita."

I clic devono cadere su un punto di rilievo che ha una quota; un clic altrove viene rifiutato con "Fare clic su un punto di rilievo con una quota: una linea di discontinuità prende le quote dei punti." {{key:Backspace}} elimina l'ultimo punto; {{key:Esc}} annulla l'intera linea.

:::warning
Terminare con {{key:Enter}}. Anche il doppio clic termina, ma in questa versione elimina il punto su cui si è fatto doppio clic. Fare clic una sola volta sull'ultimo punto, poi premere {{key:Enter}}.
:::

Per rimuovere in una volta tutte le linee di discontinuità disegnate, fare clic su {{ui:Rimuovi le linee di discontinuità disegnate}} nella sezione **Superficie**. Per rimuovere solo l'ultima, usare {{key:Mod+Z}}. Le linee disegnate non possono ancora essere selezionate o modificate una per una.

## Disegnare il contorno esterno

Un contorno ritaglia la superficie sull'area di cui ci si fida, per esempio i limiti del rilievo, così che i lunghi triangoli sugli angoli non rilevati scompaiano.

1. Premere {{key:O}}, oppure fare clic su {{ui:Contorno}}.
2. Fare clic sugli angoli in ordine, attorno all'area. Una linea tratteggiata mostra la forma.
3. Premere {{key:Enter}}.
   La barra di stato dice "Contorno impostato; i triangoli fuori di esso sono stati eliminati." **Contorno** nei dati della superficie indica "Sì" e il numero di angoli.

Da sapere:

- C'è un solo contorno. Disegnarne un altro lo sostituisce. {{ui:Rimuovi il contorno}} lo elimina.
- Può solo togliere: un contorno che supera i punti viene riportato al loro perimetro, con la nota "Il contorno supera i punti; è stato riportato al loro perimetro."
- I suoi angoli prendono le quote dalla superficie, così il bordo segue esattamente il terreno.
- I contorni interni nascosti non sono ancora disponibili.

## Tagliare i triangoli esterni lunghi

Senza un contorno, la superficie riempie l'intero perimetro dei punti, compresi i lunghi triangoli sottili attraverso i bordi concavi.

1. In **Superficie**, digitare una lunghezza in **Lato esterno più lungo** e premere {{key:Enter}}. Iniziare con circa due o tre volte la distanza tipica tra i punti rilevati.
2. I triangoli esterni il cui lato esterno è più lungo di questo valore vengono rimossi, procedendo verso l'interno finché ogni lato esterno è abbastanza corto. Un lato che è una linea di discontinuità non viene mai asportato.
3. Digitare 0 per conservare di nuovo ogni triangolo.

## Leggere il rapporto della superficie

Sotto i dati della superficie, un riquadro elenca ciò che ha fatto il costruttore. Con una barra ocra a sinistra è un'informazione; con una barra rossa contiene un errore e non c'è superficie.

| Messaggio | Significato |
|---|---|
| "3 punti si trovavano nello stesso punto di un altro e si sono uniti a esso." | I punti più vicini di 0,0001 in pianta sono diventati un unico vertice (viene mantenuto il primo). |
| "2 punti hanno due quote diverse …" | Punti sovrapposti, o linee di discontinuità che si incrociano, hanno altezze discordanti. Vince la quota della linea di discontinuità, poi la prima. |
| "1 tratto di linea di discontinuità non è stato possibile inserirlo nella superficie." | Un tratto molto corto o quasi sovrapposto non è entrato; verificare quel punto. |
| "Una superficie richiede almeno tre punti con quota." | Troppo pochi punti: controllare l'ordine delle colonne e i gruppi. |
| "I punti sono tutti su una linea: nessun triangolo." | I punti non hanno larghezza, per esempio una sola linea di poligonale. |
| "Il contorno non si sovrappone ai punti." | Il contorno è altrove, spesso per uno scambio di unità o di sistema di coordinate. |
| "Non rimangono triangoli all'interno del contorno." | Il contorno è troppo piccolo o mal posizionato. |

## Una superficie letta da LandXML

Quando si apre un LandXML, la sua prima superficie TIN viene usata così com'è: l'intestazione **Superficie** indica "Superficie (da LandXML)" e **Lato esterno più lungo** è in grigio. Finché quella superficie è in uso, i gruppi di linee di discontinuità, le linee disegnate e un nuovo contorno non la modificano. Per costruire la superficie dai punti del file, fare clic su {{ui:Ricostruisci la superficie dai punti}}. {{key:Mod+Z}} riporta la superficie LandXML.

## Correlati

- [Leggere le curve di livello, le quote e le pendenze](topic:contours).
- [Importare punti di rilievo](topic:import-points).
