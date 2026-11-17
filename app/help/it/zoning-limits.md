---
title: Verificare i volumi rispetto ai limiti urbanistici che si digitano
summary: Digitare gli arretramenti di un lotto riga per riga, un limite di altezza, un piano di esposizione del cielo, un indice di utilizzazione fondiaria e una copertura, vedere l'inviluppo edificabile sul piano e leggere quali volumi superano quali limiti.
keywords: zonizzazione, arretramento, arretramenti, fronte, lato, retro, inviluppo, area edificabile, limite di altezza, piano di esposizione del cielo, indice di utilizzazione fondiaria, IUF, copertura, lotto, particella, regolamento, verifica normativa
from: 3e267b31
---

**CivilCraft non contiene alcun regolamento edilizio.** Non conosce le regole di nessuna città e non ne include una raccolta. Ogni numero di questa pagina è uno che si digita dal proprio regolamento urbanistico, e ogni risultato indica che è misurato rispetto ai limiti digitati. È un modo per vedere come i limiti di un lotto condizionano un edificio, non una decisione su se un progetto sia consentito.

## Digitare i limiti

Nelle **Proprietà**, sotto **Volumi degli edifici**, scegliere una **Particella** (oppure selezionare un volume: i limiti della sua particella compaiono sotto di esso). Poi compilare ciò che si applica; lasciare vuota una casella per "nessun limite":

- **Linea stradale**: il confine del lotto sulla strada. L'**Arretramento frontale** si applica a essa, l'**Arretramento posteriore** alla linea più opposta, e l'**Arretramento laterale** alle altre.
- **Limite di altezza**.
- **Piano del cielo**: parte da un'altezza sul confine del lotto e sale della quantità digitata per ogni 1 di profondità verso l'interno, misurato dalla linea stradale o da ogni confine del lotto (2 significa 2 a 1). L'altezza consentita su un punto è la più bassa tra il piano e il limite di altezza.
- **Indice di utilizzazione fondiaria** (superficie lorda di pavimento dei volumi sul lotto divisa per l'area del lotto) e **Copertura** (le loro impronte divise per l'area del lotto, digitata in percentuale).

## L'inviluppo

Attivare **Mostra l'inviluppo sul piano** per disegnarlo sul layer `A-MASS-ENVL`. L'inviluppo è il lotto ristretto da ciascun confine dal proprio arretramento, con le linee di offset che si incontrano negli angoli smussati. Un confine di lotto fatto di una curva è sostituito da corde brevi entro 0.01 dalla curva. Funzionano sia lotti convessi sia concavi. Se gli arretramenti si sovrappongono (un arretramento profondo su un lotto stretto o molto concavo) non c'è inviluppo, e le Proprietà lo indicano; provare distanze minori.

## Il risultato

Sotto le caselle, ogni volume e ogni limite ha una riga, con un segno di spunta o una croce:

- **arretramenti**: l'area del volume che cade fuori dall'inviluppo;
- **altezza**: l'altezza del volume rispetto alla massima consentita sulla sua impronta (un prisma di altezza unica è limitato dall'altezza consentita più bassa in uno qualsiasi dei suoi angoli);
- **indice di utilizzazione fondiaria** e **copertura**: tutti i volumi sulla particella sommati.
