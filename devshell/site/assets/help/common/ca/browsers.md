---
title: Navegadors i ordinadors
summary: En quins navegadors funcionen les aplicacions, en què es diferencien i què necessita el vostre ordinador.
keywords: chrome, edge, firefox, safari, brave, navegador, mac, windows, linux, ipad, tauleta, webgl, requisits, memòria
from: a11b09b1
---

Les aplicacions s'executen dins d'un navegador web. Fan la feina al vostre propi ordinador: els vostres fitxers s'obren allà i mai no els enviem (consulteu [On van els vostres fitxers](common:your-files)).

## Quin navegador

Useu una versió actualitzada d'un d'aquests:

| Navegador | Motor | Notes |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | El més complet: triar una carpeta, desar per fer-lo servir fora de línia, gestió de fitxers. |
| Firefox | Gecko | Funciona. Obrir una carpeta sencera fa servir un selector més simple. El desament fora de línia pot no funcionar en finestres privades. |
| Safari | WebKit | Funciona en Mac i iPad. Obrir una carpeta sencera fa servir un selector més simple. Safari pot esborrar una còpia fora de línia que no hagueu fet servir durant unes setmanes. |

Els tres motors són adequats per al treball del dia a dia. Quan una aplicació fa alguna cosa de manera diferent en un d'ells, la seva ajuda mostra els passos per al vostre navegador.

## En què es diferencien els navegadors

- **Obrir una carpeta.** Els navegadors Chromium mostren un selector de carpetes real i poden llegir la carpeta directament. Firefox i Safari us demanen que trieu una carpeta i després llegeixen cada fitxer que hi ha, cosa que triga més amb carpetes de projectes grans; arrossegar la carpeta a l'aplicació funciona en els tres.
- **Desament.** Les aplicacions desen baixant un fitxer. El navegador decideix on van les baixades i si primer pregunta.

:::chromium
A Chrome o Edge, activeu "Pregunta on desar cada fitxer abans de baixar-lo" (a Configuració, dins de Descàrregues) per triar una carpeta cada vegada.
:::

:::firefox
A Firefox, obriu Configuració, després General, després Descàrregues, i trieu "Pregunta sempre on desar els fitxers" per triar una carpeta cada vegada.
:::

:::safari
A Safari, obriu Configuració, després General, i poseu "Ubicació de descàrrega de fitxers" a "Pregunta per a cada descàrrega" per triar una carpeta cada vegada.
:::

## Mac, Windows i Linux

Les aplicacions són les mateixes en cada ordinador. El que canvia és el teclat: les dreceres s'escriuen automàticament per al vostre ordinador. Consulteu [Tecles, ratolins i trackpads](common:keys).

## Tauletes i pantalles tàctils

Algunes aplicacions accepten el tàctil (un dit dibuixa o selecciona, dos dits fan pessigada per fer zoom i desplaçar-se). L'ajuda de cada aplicació indica si ho fa. En un iPad, feu servir Safari o Chrome. Un teclat ajuda amb les aplicacions que fan servir ordres escrites.

## El navegador i el sistema més antics

Ho hem llegit del codi de les aplicacions 0.7, no ho hem endevinat: cada fitxer s'ha analitzat i cada característica del llenguatge que fa servir s'ha cercat a les dades de compatibilitat publicades dels navegadors. Per sota d'aquestes versions, les aplicacions ni tan sols es poden iniciar, perquè el navegador no entén el codi.

| | Versió més antiga que pot iniciar les aplicacions |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS and iOS 16.4) |

CadCraft Studio porta el seu propi motor web a Windows, així que necessita Windows 10 o 11; en un Mac fa servir el del sistema, així que necessita macOS 13.3 o posterior. Configuració › Actualitzacions a Studio mostra en quin sistema funciona la vostra còpia.

Aquesta és la versió més antiga que *s'inicia*, llegida del codi. No és una llista de navegadors antics en què hàgim executat les aplicacions, així que una versió més antiga que s'inicia pot encara no tenir alguna característica.

## Què necessita el vostre ordinador

Són els mínims previstos per a les aplicacions, no requisits mesurats:

- 8 GB de memòria (es recomanen 16 GB per a models federats grans).
- Un xip gràfic amb WebGL 2 per a les aplicacions 3D. Si una vista 3D es queda en blanc, comproveu que l'acceleració per maquinari estigui activada a la configuració del navegador.
- Una pantalla d'almenys 1280 píxels d'amplada per a les barres d'eines completes; les pantalles més petites les ajusten.

Els fitxers molt grans (conjunts de plànols grans, models grans) fan servir molta memòria en una pestanya del navegador. Tanqueu les altres pestanyes pesades si una aplicació va lenta.
