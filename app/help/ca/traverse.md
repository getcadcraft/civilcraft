---
title: Introduir un itinerari i ajustar-lo per la regla de la brúixola
summary: Escriviu els angles de camp o els rumbs i les distàncies, comproveu el tancament angular i lineal i la precisió, ajusteu per la regla de la brúixola, i afegiu les estacions com a punts topogràfics o el bucle com a parcel·la.
keywords: itinerari, itinerari tancat, bucle, angles a la dreta, visual enrere, rumbs, distàncies, tancament, error de tancament, precisió, regla de la brúixola, Bowditch, ajust, topografia
from: 56ce5a8c
---

Un itinerari és una sèrie de trams mesurats: a cada estació hi ha un angle (o un rumb) i una distància fins a la següent. Feu clic a **Introdueix un itinerari** sota **Itinerari** al tauler de la dreta quan no hi hagi res seleccionat.

## On comença i acaba

1. **Comença al punt topogràfic**: el seu número. O escriviu una coordenada Y (nord) i una coordenada X (est).
2. **Trams com a**: **Angles a la dreta i distàncies**, o **Rumbs i distàncies**.
3. Amb angles, digueu d'on arrenquen: un **Punt topogràfic de visual enrere**, o **el seu azimut** (de la primera estació cap a la visual enrere, en sentit horari des del nord).
4. **Acaba**: **de nou al començament (un bucle)**, o **en un punt topogràfic** i el seu número (un itinerari obert entre punts coneguts).

## Escriviu els trams

Un tram per línia, després la distància, i després un nom per a l'estació a la qual arriba, si voleu:

- Angles a la dreta, girats en sentit horari a l'estació d'on surt el tram, des de l'estació de darrere fins a la següent: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` i `270.0028` també funcionen.
- Rumbs: `N 45°30'15" E 125.50 B`, o un azimut en una sola paraula: `AZ 45-30-15 125.50 B`.
- En un bucle amb angles, acabeu amb `close` i de nou l'angle del punt inicial, girat des de l'última estació fins a la segona: `close 270°00'05"`. Això és el que comprova els angles.

Les línies que no es puguin llegir es llisten amb els seus números de línia. "feet", les comes i les línies de comentari amb `#` són correctes.

## Llegiu el tancament

Mentre escriviu, el diàleg mostra:

- **Error de tancament angular**: quant s'allunyen els angles de tancar, i la part que correspon a cada angle. Sense angle de tancament els angles no es comproven, i qualsevol error en ells apareix en l'error de tancament lineal.
- **Error de tancament lineal**: quant s'allunya l'itinerari del lloc on hauria d'acabar, i en quina direcció.
- **Precisió**: la longitud de l'itinerari dividida per l'error de tancament lineal: 1 : 10,000 vol dir 1 ft en 10,000 ft.
- Les estacions després de l'ajust, i quant s'ha mogut cadascuna.

## L'ajust

Primer, l'error de tancament angular es reparteix per igual entre els angles. Després, l'error de tancament lineal es reparteix pels trams per la regla de la brúixola (Bowditch): cada estació es mou en contra de l'error en proporció a la longitud recorreguda per arribar-hi, de manera que l'itinerari acaba exactament on ha d'acabar.

:::note
La regla de la brúixola és un ajust estàndard, no de mínims quadrats, i no pondera els angles contra les distàncies. Si la precisió és prou bona ho han de decidir els vostres propis estàndards i la normativa de la vostra jurisdicció.
:::

## Useu el resultat

- **Afegeix com a punts topogràfics**: les estacions ajustades esdevenen punts topogràfics amb els noms que heu donat (o els números lliures següents), descripció `TRAV`, sense cota. La darrera estació d'un bucle és el seu inici, així que no s'afegeix dues vegades. Un sol pas: {{key:Mod+Z}} ho desfà.
- **Afegeix com a parcel·la** (bucles): les estacions ajustades esdevenen una [parcel·la](topic:parcels), amb les seves etiquetes i la descripció legal.
- **Informe (CSV)**: les línies de tancament, i després, per a cada estació, el rumb, la distància, les coordenades sense ajustar i ajustades, i les correccions.
