---
title: Construir i refinar la superfície
summary: Com CivilCraft triangula el terreny existent, i com el modelar amb grups de línies de ruptura, línies de ruptura dibuixades, un contorn exterior i l'aresta exterior més llarga.
keywords: tin, superfície, triangulació, línia de ruptura, contorn, terreny existent, eg, crear superfície, delaunay, triangles, aresta màxima, contorn exterior
from: b9eea3f3
---

CivilCraft té una superfície de terreny existent per projecte. És una TIN (xarxa irregular triangulada) construïda a partir dels vostres punts, i es reconstrueix automàticament cada vegada que canvia una entrada. No hi ha cap ordre de "reconstruir" ni cap superfície desactualitzada.

## Què entra a la superfície

- Cada punt amb elevació en un grup configurat com a {{ui:Punts}}.
- Cada grup configurat com a {{ui:Línia de ruptura}}, unit en ordre de número de punt.
- Cada línia de ruptura que dibuixeu amb l'eina {{ui:Línia de ruptura}}.
- El contorn exterior, si n'en dibuixeu un.
- La configuració de l'**Aresta exterior més llarga**.

Els triangles no creuen mai una línia de ruptura: la superfície es força a seguir-la, i després es fa tan uniforme com sigui possible al seu voltant (Delaunay a la resta).

## Converteix les línies codificades en línies de ruptura

1. Al panell esquerre, sota **Punts**, trobeu el grup (per exemple FL).
2. Configureu la seva opció **Superfície** a {{ui:Línia de ruptura}}.
   La superfície es reconstrueix, la línia es dibuixa en taronja (amb {{ui:Línies de ruptura}} activat sota **Visualització**), i **Línies de ruptura** a les dades de la superfície puja en una.
3. Comproveu la línia al plànol. Ha d'anar de punt a punt en l'ordre en què es va mesurar. Si fa zigzag, el grup conté més d'una línia, o els punts no estan numerats en ordre: torneu el grup a {{ui:Punts}} i dibuixeu les línies a mà (secció següent).

## Dibuixa una línia de ruptura per punts

1. Premeu {{key:B}}, o feu clic a {{ui:Línia de ruptura}} al grup **Superfície**.
   La indicació diu "Línia de ruptura: feu clic als punts de topografia en ordre (en pren les elevacions). Enter acaba."
2. Porteu el punter a prop d'un punt. Un petit quadrat taronja marca el punt que prendrà.
3. Feu clic als punts de la línia un rere l'altre. Cada clic indica el punt i la seva elevació a la barra d'estat.
4. Premeu {{key:Enter}} per acabar.
   La barra d'estat diu "Línia de ruptura 1 afegida; la superfície s'ha reconstruït."

Els clics han de caure sobre un punt de topografia amb elevació; un clic en un altre lloc es rebutja amb "Feu clic a un punt de topografia amb elevació: una línia de ruptura pren les elevacions dels punts." {{key:Backspace}} elimina l'últim punt; {{key:Esc}} cancel·la tota la línia.

:::warning
Acabeu amb {{key:Enter}}. El doble clic també acaba, però en aquesta versió elimina el punt on heu fet doble clic. Feu clic una vegada al darrer punt i després premeu {{key:Enter}}.
:::

Per eliminar de cop totes les línies de ruptura dibuixades, feu clic a {{ui:Elimina les línies de ruptura dibuixades}} a la secció **Superfície**. Per eliminar només l'última, useu {{key:Mod+Z}}. Les línies de ruptura dibuixades encara no es poden seleccionar ni editar una per una.

## Dibuixa el contorn exterior

Un contorn retalla la superfície a l'àrea en què confieu, per exemple els límits de l'aixecament, de manera que els triangles llargs a través de racons no topografiats desapareixen.

1. Premeu {{key:O}}, o feu clic a {{ui:Contorn}}.
2. Feu clic als racons en ordre al voltant de l'àrea. Una línia discontínua mostra la forma.
3. Premeu {{key:Enter}}.
   La barra d'estat diu "Contorn definit; els triangles fora d'ell han desaparegut." **Contorn** a les dades de la superfície diu "Sí" i el nombre de racons.

Coses a saber:

- Només n'hi ha un. Dibuixar-ne un altre el substitueix. {{ui:Elimina el límit}} el treu.
- Només pot treure: un contorn que passa més enllà dels punts es retalla fins al seu perímetre, amb la nota "El contorn passa més enllà dels punts; s'ha retallat fins al seu perímetre."
- Els seus racons prenen les elevacions de la superfície, de manera que la vora segueix exactament el terreny.
- Els contorns ocults (interiors) encara no estan disponibles.

## Retalla els triangles exteriors llargs

Sense contorn, la superfície omple tot el perímetre dels punts, inclosos els triangles llargs i prims a través de vores còncaves.

1. A **Superfície**, escriviu una longitud a **Aresta exterior més llarga** i premeu {{key:Enter}}. Comenceu amb unes dues o tres vegades l'espaiament típic de les vostres mesures.
2. Es treuen els triangles exteriors la vora exterior dels quals és més llarga que això, avançant cap a dins fins que cada aresta exterior és prou curta. Una aresta que és una línia de ruptura mai no es retalla.
3. Escriviu 0 per tornar a conservar tots els triangles.

## Llegeix l'informe de la superfície

Sota les dades de la superfície, un quadre enumera el que ha fet el constructor. Amb una barra ocre a l'esquerra és informació; amb una barra vermella conté un error i no hi ha superfície.

| Missatge | Significat |
|---|---|
| "3 punts estaven al mateix lloc que un altre i s'hi han unit." | Els punts més a prop de 0.0001 en planta es converteixen en un únic vèrtex (es conserva el primer). |
| "2 llocs tenen dues elevacions diferents …" | Punts un sobre l'altre, o línies de ruptura que es creuen, no coincideixen en alçada. Guanya l'elevació de la línia de ruptura, i després la primera. |
| "1 tros de línia de ruptura no s'ha pogut forçar a la superfície." | Un tros de línia de ruptura molt curt o gairebé solapat no hi encaixava; reviseu aquell punt. |
| "Una superfície necessita almenys tres punts amb elevació." | Massa pocs punts: reviseu l'ordre de les columnes i els grups. |
| "Els punts estan tots en una sola línia: cap triangle." | Els punts no tenen amplada, per exemple una única línia de poligonal. |
| "El contorn no es solapa amb els punts." | El contorn és en un altre lloc, sovint per una barreja d'unitats o de coordenades. |
| "No queda cap triangle dins del contorn." | El contorn és massa petit o mal situat. |

## Una superfície llegida des de LandXML

Quan obriu LandXML, s'utilitza tal com és la seva primera superfície TIN: el títol **Superfície** diu "Superfície (des de LandXML)" i **Aresta exterior més llarga** queda en gris. Mentre aquesta superfície és en ús, els grups de línies de ruptura, les línies dibuixades i un contorn nou no la canvien. Per construir la superfície a partir dels punts del fitxer, feu clic a {{ui:Reconstrueix la superfície a partir dels punts}}. {{key:Mod+Z}} torna a posar la superfície de LandXML.

## Relacionats

- [Llegeix corbes de nivell, elevacions i pendents](topic:contours).
- [Importa punts de topografia](topic:import-points).
