---
title: "Scenari climatici: alluvione, calore e incendio nel 2050 e nel 2080"
summary: In Indirizzo al sito, alza il livello di alluvione del sito per un clima futuro, valuta l'esposizione agli incendi e trasforma un file meteorologico, con il presente accanto al futuro, da un pacchetto di dati climatici (SSP2-4.5 e SSP5-8.5, 2050 e 2080).
keywords: clima, cambiamento climatico, futuro, 2050, 2080, ssp, cmip6, scenario, livello del mare, alluvione, quota di alluvione di base, bfe, fema, calore, file meteo, epw, morfing, incendio, incendio boschivo
from: b0d2ee38
---

I dati climatici provengono da un **pacchetto di dati**, non dall'app. Attivare l'add-on {{ui:Scenari climatici}} in Impostazioni › Add-on, oppure caricare un file di pacchetto proprio nel blocco {{ui:Clima futuro}}.

:::warning
Il pacchetto che viene con l'add-on è un **campione**: tre luoghi (Denver, Miami, Johannesburg), un modello climatico, cinque anni in ogni periodo di 20 anni. Serve a provare gli strumenti, **non per la progettazione**. Un pacchetto completo si costruisce con `tools/climate/build-pack.mjs` dai dati NEX-GDDP-CMIP6 della NASA.
:::

## Dove si trova

Superficie › Altro › Indirizzo al sito. Impostare il punto, aggiungere i livelli (un livello FEMA di alluvione fornisce la quota di alluvione di base) e premere il pulsante che legge il sito. Sotto le righe del sito c'è il blocco {{ui:Clima futuro}}: scegliere uno **Scenario** (SSP2-4.5 o SSP5-8.5) e un **Anno** (2050 = 2041-2060, 2080 = 2071-2090, entrambi rispetto a 1995-2014). Viene usato il luogo del pacchetto più vicino al punto, oppure quello scelto; se il punto è lontano da ogni luogo, si usano le variazioni medie globali e il pannello lo indica.

## Quota di alluvione di progetto

La quota attuale è la quota di alluvione di base di FEMA, quando il livello di alluvione ne aveva una (in piedi, NAVD 88); altrimenti digitare la propria. Scegliere il tipo di alluvione (costiera, fluviale o da pioggia intensa, o entrambe), la profondità di alluvione nel sito per la parte dovuta alla pioggia, e un franco di sicurezza se lo si vuole. {{ui:Alza il livello di alluvione}} mostra la quota attuale e quella futura affiancate, le parti dovute al livello del mare e alla pioggia, e le ipotesi: l'intero innalzamento del livello del mare viene aggiunto a una quota costiera; la portata fluviale cresce in proporzione uno a uno con la pioggia del giorno più piovoso, e la profondità segue la portata alla potenza 0.6 (Manning, canale largo); le parti si sommano.

:::warning
Una stima della variazione, non uno studio di alluvione. La quota di alluvione di progetto spetta all'ente competente o al proprio ingegnere.
:::

## Esposizione agli incendi (solo stima)

La vegetazione più vicina, la pendenza che sale da essa e la distanza danno una fascia da molto bassa a estrema, attuale e futura (la futura moltiplica per la variazione dell'indice meteo-incendi del pacchetto). **Solo stima:** una scala relativa interna, per capire se un sito richiede una vera valutazione del rischio di incendio; non è una classe di norma.

## Calore: un file meteo futuro

Scegliere un file `.epw` attuale e {{ui:Crea il file meteo futuro}}: viene trasformato con il metodo pubblicato di spostamento e allungamento (Belcher, Hacker and Powell 2005) e si confronta il calore (temperatura media e massima, temperature di progetto, ore oltre 30 °C e 35 °C, gradi-giorno). {{ui:Salva il file meteo futuro}} lo salva per il pannello Ambiente, per il controllo energetico di BimCraft o per i propri strumenti.

## Da dove vengono i numeri

NASA NEX-GDDP-CMIP6 (output di modelli CMIP6 ridimensionati, CC BY 4.0 per modello) per temperatura, umidità, insolazione, pioggia e meteo di incendio; la media globale IPCC AR6 per l'innalzamento del livello del mare, salvo che il pacchetto contenga dati locali. Il pannello mostra la fonte, la licenza e la data del pacchetto.
