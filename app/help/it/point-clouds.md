---
title: Nuvole di punti da drone o scanner
summary: Con il componente aggiuntivo Nuvole di punti si apre un file LAS o LAZ con milioni di punti, lo si osserva per intero, lo si pulisce, lo si suddivide in terreno, vegetazione ed edifici, e da esso si costruiscono terreno, curve di livello e volumi.
keywords: nuvola di punti, las, laz, drone, fotogrammetria, recap, lidar, scansione, terreno, classifica, rumore, cumulo, volume, sterro e riporto, curve di livello, linea di discontinuita, eye-dome, ortomosaico, ortho, proiezione, layer cartografico, esporta las, esporta laz, comprimi
from: e4a4901f
---

La maggior parte delle persone non ne ha mai bisogno, quindi è un add-on. Attivare {{ui:Nuvole di punti}} in Impostazioni › Add-on: nel pannello di destra compare una scheda {{ui:Nuvole di punti}}. Il file viene letto nel browser e suddiviso in tile, conservati nella memoria del browser (o in una cartella scelta). **Non viene caricato nulla.**

:::warning
Tutto ciò che questa scheda riporta è un numero ricavato dai dati, non una certificazione. È stata provata su un cantiere fittizio, non ancora su un rilievo reale con drone: leggere con attenzione i primi risultati e segnalare cosa si riscontra. Spetta al professionista abilitato stabilire il valore di terreno, curve di livello e volumi.
:::

## Apri una nuvola

In {{ui:Apri una nuvola}} scegliere un file LAS o LAZ. La scheda indica quanti punti contiene, il suo sistema di coordinate e le unità, e quanto spazio serve per la costruzione; premere {{ui:Costruisci la nuvola}}. Una costruzione può essere interrotta e si riprende con {{ui:Riprendi}} (scegliere di nuovo lo stesso file). Il file non viene mai modificato. Un file da 100 milioni di punti si costruisce in pochi minuti su una workstation e occupa circa lo stesso spazio del file.

In {{ui:Nuvole su questo computer}} si aprono o si rimuovono le nuvole. {{ui:Conserva le nuvole in una cartella…}} (Chrome, Edge e l'app Studio) conserva i tile in una cartella scelta, per esempio una cartella delle nuvole di CadCraft in Documenti, così una nuvola da 10 GB non deve entrare nella memoria del browser; le nuvole costruite in precedenza restano dove sono state costruite. Dopo un riavvio il browser chiede di nuovo il permesso: premere {{ui:Usa di nuovo la cartella …}}.

## Visualizzarla

{{ui:Visualizza in 3D}} disegna la nuvola a partire da tile grossolani e la affina man mano che ci si avvicina, senza mai superare {{ui:Punti massimi disegnati}} alla volta (2.5 milioni; 500 mila su un telefono). Colorare per colore del file, altezza, classe, intensità o residuo. {{ui:Illuminazione eye-dome}} ombreggia i bordi in base alla profondità, così la forma si legge senza normali (disattivata su un telefono); {{ui:I punti si riducono con la distanza}} rende più piccoli i punti lontani e più grandi quelli vicini; {{ui:Dimensione punto}} imposta la dimensione. La pianta mostra la nuvola come raster sotto il disegno e **si affina quando si fa zoom** su una sua parte.

## Pulire

In {{ui:Pulisci}} disegnare un lazo, un riquadro o un poligono nella pianta (oppure in 3D dalla vista dall'alto: in 3D il contorno viene proiettato verticalmente, quindi è esatto solo dall'alto). La scheda mostra quanti punti sono all'interno **prima** di applicare: {{ui:Elimina questi punti}}, {{ui:Cambia la loro classe}}, {{ui:Ripristina i punti eliminati}} oppure {{ui:Ritaglia su questo contorno}}. {{ui:Annulla}} e {{ui:Ripristina}} scorrono il registro delle modifiche; il file in sé non viene mai modificato. {{ui:Filtro rumore…}} contrassegna i punti isolati come punti bassi (classe 7) o rumore alto (classe 18).

## Classificare

{{ui:Trova il terreno}} lavora tile per tile e contrassegna il terreno (classe 2) e i punti bassi; la tolleranza è 0.15 m, oppure 0.08 m con l'interruttore di qualità rilievo. Segnala le giunzioni tra tile che non concordano. {{ui:Classifica vegetazione ed edifici}} contrassegna poi vegetazione bassa, media e alta ed edifici in base all'altezza sopra il terreno e alla planarità dell'intorno. Non c'è apprendimento automatico, quindi una tettoia a tetto piano sotto gli alberi può essere sbagliata: controllare.

## Terreno, curve di livello, linee di discontinuità

{{ui:Costruisci terreno}} crea il terreno esistente a partire dai punti a terra e lo aggiunge al progetto nello stesso modo di un'importazione LAS (un solo passo di annullamento). Poi confronta i punti con esso: la media, RMS, il 95° percentile, la quota entro la tolleranza e i dieci punti che differiscono di più, ciascuno con {{ui:Vai lì}}. Colorare per {{ui:Residuo}} mostra dove il terreno e la nuvola non concordano.

Una **linea di discontinuità** (un cordolo, un fossato o il ciglio di una scarpata) si sceglie sulla nuvola: {{ui:Scegli una linea di discontinuità sulla nuvola}} nella vista 3D prende il punto disegnato più vicino a ogni clic, e {{ui:Scegli una linea di discontinuità nella pianta}} prende il punto della nuvola più vicino (prima il terreno) sotto ogni clic; doppio clic o Invio termina la linea. La successiva {{ui:Costruisci terreno}} la utilizza. {{ui:Mostra curve di livello}} disegna le curve di livello sopra la nuvola in una piccola immagine e imposta l'intervallo del progetto.

## Volumi

{{ui:Volume di cumulo…}} calcola il volume della superficie sopra una base, all'interno di un contorno disegnato. Disegnare il contorno su terreno pianeggiante intorno al cumulo e scegliere la base: il punto più basso del contorno, un piano, una base curva liscia, una superficie passante per il contorno, oppure una quota digitata. Su terreno inclinato o curvo usare il piano o la base curva; il punto più basso dà un valore troppo alto. I punti del contorno che sporgono rispetto agli altri (un albero sulla linea) sono esclusi dalla base. {{ui:Da volo a volo}} fornisce sterro e riporto tra due nuvole. Entrambi possono essere salvati in CSV.

## Ortomosaico

In {{ui:Ortomosaico (immagine dall'alto)}} scegliere l'ortomosaico del drone insieme al suo file di georeferenziazione e al file `.prj`, quando sono disponibili: un GeoTIFF, oppure un PNG o un JPEG. Diventa un **layer cartografico** del progetto, quindi la pianta lo mostra sotto il disegno, e la vista 3D (colore {{ui:Mappa}}) lo applica sul terreno costruito; quindi prima {{ui:Costruisci terreno}}. La scheda indica quanta parte della nuvola è coperta dall'immagine e avvisa quando non ne copre nessuna: la causa più frequente è un sistema di coordinate diverso, quindi allegare con essa il file `.prj`. Se manca il `.prj`, il programma chiede dove si trovano le coordinate. L'immagine viene conservata nel file di progetto; un GeoTIFF oltre 200 MB viene rifiutato e un mosaico molto grande viene ridotto a 16 megapixel, quindi per un rilievo ampio conviene ritagliare prima il mosaico sul cantiere.

## Esporta

{{ui:Esporta}} scrive la nuvola pulita e classificata come nuovo file (tutti i punti, solo le classi pulite, oppure solo il terreno). In {{ui:Tipo di file}} scegliere:

- **LAS 1.4 (non compresso)**: formato punto 6, oppure 7 con colore.
- **LAZ (compresso)**: gli stessi punti compressi senza perdite, quindi ogni punto viene recuperato esattamente. Viene scritto come formato punto 0, oppure 2 con colore, in un file LAS 1.4. Sul cantiere fittizio di 300 m il LAZ era circa un quinto delle dimensioni del file LAS 1.4. I formati LAZ 0 e 2 contengono solo le classi da 0 a 31: un punto con classe superiore viene rifiutato con un messaggio, quindi esportare quella nuvola come LAS 1.4.

Il LAZ è scritto dal compressore di CadCraft, realizzato a partire dalla specifica LAZ pubblicata. Abbiamo verificato che il nostro lettore e due lettori LAZ indipendenti (laz-perf, che l'app usa per aprire i file LAZ, e laspy con lazrs) rileggono ogni punto in modo esatto, e che i file LAZ prodotti da laspy risultano identici byte per byte quando se ne riscrivono i punti. Altri programmi non sono ancora stati provati: se uno non apre un file, indicarci quale.

Dove il browser può scrivere un file man mano, si sceglie prima il file e una nuvola molto grande viene scritta tile per tile invece di essere raccolta in memoria; altrimenti il file viene raccolto e scaricato, il che va bene fino a qualche centinaio di megabyte.

## Cosa non fa

Legge solo LAS e LAZ (E57, PLY e PCD non sono ancora collegati a questa scheda, e più file di uno stesso volo non vengono uniti), non riproietta una nuvola (si assume il sistema e le unità metriche del progetto), non legge i file RCP o RCS di Autodesk, non crea una superficie da fotografie e non individua da sola pali, cordoli o tubazioni.
