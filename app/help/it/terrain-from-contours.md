---
title: Terreno dalle curve di livello
summary: Costruire la superficie del terreno da una carta delle curve di livello: scegliere i layer delle linee, indicare da dove viene la quota di ciascuna linea, verificare incroci e duplicati, e costruire. Le curve diventano linee di discontinuità, con i triangoli piatti su crinali e valli corretti. Una carta ricavata da un'immagine o da un PDF può essere scalata e posizionata con due punti noti.
keywords: curve di livello, linee di livello, terreno dalle curve di livello, superficie dalle curve di livello, carta topografica, carta di rilievo, senza coordinate, linee di discontinuità, triangoli piatti, crinale, valle, cima, curve che si incrociano, curve duplicate, equidistanza, scalare una carta, due punti, posizionare una carta, DXF, DWG, shapefile
from: e6161653
---

Un topografo a volte invia una carta delle curve di livello: linee con quote, ma senza punti. CivilCraft costruisce il terreno esistente da quelle linee.

## Portare le curve di livello

Aprire la carta come linee: un disegno DXF o DWG, uno shapefile o un GeoJSON (**GIS** › {{ui:Importa}}, oppure trascinare il file sulla pianta). Le linee entrano come **layer di mappa**. In **Superficie** › {{ui:Altro}}, scegliere {{ui:Terreno dalle curve di livello}}.

## Indicare da dove viene ogni quota

Spuntare i layer che contengono curve di livello, poi scegliere **Quota da**:

- {{ui:Le quote proprie delle linee}}: una linea i cui vertici hanno tutti la stessa quota (una polilinea 3D, oppure una polilinea con una quota). Una linea a 0 è disegno in pianta e non ha quota.
- Un **campo numerico** del layer (per esempio ELEV), quando la carta ne ha uno.
- {{ui:Una partenza e un intervallo, nell'ordine in cui le linee sono elencate}}: per le linee senza alcuna quota. La prima linea elencata riceve la **Quota della prima linea**, la successiva quella più l'**Equidistanza**, e così via. Elencare le linee dalla più bassa in su (o riordinarle nel layer).

## Verificare, poi costruire

{{ui:Verifica}} elenca ciò che non va, a parole, prima che cambi qualcosa:

- una linea **senza quota** o con meno di due punti;
- una linea **duplicata** (la stessa forma due volte, anche disegnata nell'altro verso);
- due linee che **si incrociano**, a quote diverse o alla stessa quota (anche una linea che incrocia se stessa), con il punto;
- una quota che **non è sull'equidistanza** (un errore di battitura come 105.5 su una carta a 1 m).

Spuntare {{ui:Escludi le linee che ne attraversano un'altra}} per eliminare la linea che incrocia più altre (poi la successiva, finché nessuna incrocia): a sparire è la linea errante che taglia ogni curva, non le curve. **Semplifica le linee entro** riduce i vertici più vicini a un tratto rettilineo di quella distanza.

{{ui:Costruisci il terreno}} aggiunge le linee al terreno esistente come linee di discontinuità (un solo passo di annullamento), così la superficie passa esattamente per ogni curva. Con {{ui:Correggi i triangoli piatti su crinali, impluvi e cime}} spuntato e un'equidistanza indicata, CivilCraft aggiunge anche un punto all'interno di ogni triangolo piatto (un triangolo i cui vertici giacciono tutti su una stessa curva), alla quota a cui continua la pendenza accanto, e mai più di mezza equidistanza lontano dalla curva. Senza questo, le sommità dei crinali, i fondi delle valli e le cime risultano come lastre piatte. Su una collina di prova l'errore rispetto alla superficie reale è sceso di un quarto; su un crinale del 40 %.

## Una carta senza coordinate

Per una carta delle curve ricavata da un'immagine o da un PDF, aprire **Scala e posiziona i layer con due punti noti**. Indicare due punti sulla carta e dove si trovano davvero; i layer spuntati vengono scalati, ruotati e spostati per adattarsi (un solo passo di annullamento; le altezze non cambiano). Gli stessi due punti danno la scala (mostrata nel messaggio) e la rotazione.

La superficie è buona quanto la carta: tra due curve è un piano, quindi il terreno reale tra di esse non è noto. Verificare il risultato rispetto alle quote puntuali prima di affidarsi a esso.
