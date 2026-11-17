---
title: Esportare il sito 3D in USD
summary: Scrivere la vista 3D del sito (superfici, linee, tracciati, tubazioni e punti di rilievo) in USD, in scala reale e con coordinate reali.
keywords: usd, usda, usdc, usdz, openusd, esportazione, 3d, sito, superficie, tracciato, punti di rilievo, coordinate, assemblaggio di scena
from: e7be08ec
---

Nella vista 3D, {{ui:USD}} accanto a {{ui:GLB}} e {{ui:OBJ}} scrive ciò che la vista mostra in formato USD.

1. Aprire la vista 3D e scegliere cosa mostrare.
2. Aprire {{ui:USD}} e scegliere {{ui:Testo (.usda)}}, {{ui:Binario (.usdc)}} oppure {{ui:Pacchetto (.usdz)}}.

Il file è in scala reale (l'esagerazione verticale viene annullata), in metri con Z verso l'alto. Il sito si trova alle sue coordinate Est, Nord e alle sue quote di progetto, e indica il proprio sistema di coordinate quando il progetto ne ha uno. Superfici, tubazioni e manufatti sono mesh con i rispettivi colori; curve di livello, linee di discontinuità e linee di corridoio sono linee; ogni tracciato è una linea propria con il suo nome; i punti di rilievo mantengono i loro numeri.
