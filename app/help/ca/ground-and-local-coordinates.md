---
title: Coordenades de terreny i locals
summary: Treballa amb coordenades de terreny (superfície) escalades des de la quadrícula amb un factor d'escala combinat que escrius o calcules en un punt, o en una quadrícula de lloc assumida lligada al sistema per dos punts de control.
keywords: coordenades de terreny, coordenades de superfície, quadrícula a terreny, factor d'escala combinat, csf, factor combinat, factor de quadrícula, factor d'elevació, factor de nivell del mar, convergència, angle de representació, factor d'escala, coordenades assumides, coordenades locals, quadrícula de lloc, 5000 5000, punts de control, localització, calibratge, dos punts, error de tancament
from: 3d7453de
---

Les coordenades de projecció estatal (state plane) i UTM són coordenades de **quadrícula**: una projecció cartogràfica estira o encongeix les distàncies una mica (desenes de parts per milió), i com més alt és el lloc, més difereix una distància mesurada sobre el terreny de la de la quadrícula. Per això moltes topografies lliuren coordenades de **terreny**, escalades perquè les distàncies al plànol siguin iguals a les mesurades sobre el terreny, o una quadrícula de lloc **assumida** (5000, 5000 en un punt de control). CivilCraft manté els vostres números tal com són i registra com es relacionen amb la quadrícula, de manera que la latitud i la longitud, els fitxers SIG i les capes de mapes encara cauen al lloc correcte.

Obriu {{ui:Coordenades}} al grup {{ui:SIG}}, trieu (o mantingueu) el sistema, i després trieu sota **Coordenades de quadrícula, de terreny o locals**:

| Opció | Les vostres coordenades són | Com es relacionen amb la quadrícula |
|---|---|---|
| {{ui:Quadrícula}} | Les del sistema (el punt de partida) | Els mateixos números |
| {{ui:Terreny}} | Escalades a distàncies sobre el terreny | quadrícula = base + factor combinat × (terreny − base) |
| {{ui:Local}} | Una quadrícula de lloc assumida | Desplaçada, girada i escalada sobre la quadrícula per dos punts de control |

Qualsevol cosa que trieu es desa amb el projecte i és un pas de desfer; no es mou res.

## Coordenades de terreny

1. Trieu {{ui:Terreny}}.
2. Escriviu el **Factor d'escala combinat** de la topografia (per exemple `0.99987`), o calculeu-lo:
   1. Sota **Calcula el factor en un punt**, el punt comença al centre del projecte. Trieu {{ui:Tria un punt al plànol}} i feu clic al lloc (un clic prop d'un punt topogràfic pren aquell punt), o escriviu E i N.
   2. L'elevació surt de la superfície en aquell lloc; escriviu-ne una altra si cal.
   3. Trieu {{ui:Calcula}}. CivilCraft mostra:
      - **Factor d'escala de quadrícula k**: quant estira la projecció cartogràfica les distàncies en aquell lloc.
      - **Factor d'elevació**: quant són més curtes les distàncies a l'elipsoide que a aquella alçada.
      - **Factor combinat** = k × factor d'elevació: distància de quadrícula = distància sobre el terreny × això.
      - **Convergència**: l'angle entre el nord de quadrícula i el nord vertader en aquell lloc (azimut geodèsic = azimut de quadrícula + convergència).
   4. Trieu el botó {{ui:Ús}} sota els números per posar el factor combinat a la casella.
3. Definiu el **Punt base**, on les coordenades de terreny i de quadrícula són iguals. Comença a 0, 0: la majoria de jurisdiccions que publiquen coordenades de terreny escalen des de l'origen, de manera que les coordenades de terreny segueixen sent reconeixiblement properes a les de quadrícula. Algunes topografies escalen des del punt de control del projecte: useu el que digui la topografia.
4. Trieu {{ui:Aplica}}.

:::warning
L'elevació es pren com a alçada sobre l'elipsoide. CivilCraft no té model de geoide, de manera que on el geoide és 30 m (100 ft) per sota o per sobre de l'elipsoide, el factor d'elevació erra uns 5 ppm. Quan la topografia indica el seu factor combinat, escriviu aquest.
:::

## Coordenades locals (assumides)

1. Trieu {{ui:Local}}.
2. Per al **Punt de control 1**, escriviu el número del punt topogràfic (o trieu {{ui:Tria}} i feu-hi clic al plànol). Les seves coordenades locals es mostren al costat.
3. Escriviu la seva E i N de **quadrícula**, o la seva latitud i longitud a la tercera casella (per exemple `30.2672, -97.7431`).
4. Feu el mateix per al **Punt de control 2**, tan lluny del primer com pugueu.
5. CivilCraft mostra l'**Escala** i la **Rotació** trobades, i recorda: **Dos punts sempre encaixen exactament: comproveu-ne un tercer.**
6. Doneu un **Punt de comprovació** de la mateixa manera. CivilCraft mostra a quina distància l'ajust el posa de les coordenades de quadrícula que heu escrit (el seu error de tancament, en unitats del projecte i en parts per milió). Un error de tancament gran vol dir un punt equivocat, un error d'escriptura o coordenades en una altra unitat.
7. Trieu {{ui:Aplica}}.

Una escala molt diferent de 1 (més enllà de 0.5 a 2) es refusa: comproveu els punts i les seves unitats.

## Què s'ha comprovat

- El factor d'escala i la convergència coincideixen amb PROJ (pyproj 3.7.1 amb PROJ 9.5.1), la biblioteca de coordenades que usen la majoria de programes SIG, a 1 part en mil milions en més de 300 sistemes amb projeccions conformes (state plane, UTM, Mercator transversal, cònica conforme de Lambert), i al navegador en un punt triat al plànol.
- Els passos de terreny i locals es converteixen d'anada i tornada a 1 part en mil milions; dos punts de control retornen l'escala i la rotació amb què es van fer; un punt de comprovació desviat 0.05 ft mostra un error de tancament de 0.05 ft.
