---
title: Visualitza el lloc en 3D
summary: Obriu la vista 3D, orbiteu-la, desplaceu-la i feu zoom, definiu l'exageració vertical i el color, trieu què es mostra i feu clic als traçats, plataformes, línies característiques, línies de ruptura, tubs, estructures i punts per seleccionar-los.
keywords: etiquetes, etiquetes 3d, etiquetes que sempre miren la càmera, etiquetes de punts quilomètrics, etiquetes de corbes de nivell, etiquetes de punts, projecció, aeri, capes de mapa sobre la superfície, 3d, tres dimensions, vista 3d, cub de vista, brúixola, òrbita, perspectiva, paral·lela, isomètrica, iso, exageració vertical, terreny, model, model del lloc, sobrevolar, visualitzar, renderitzat, tubs en 3d, estructures, pous de registre, corredor en 3d, carretera en 3d, superfície de la carretera, carrils, vorades, voreres, plantes en 3d, arbres en 3d, arbustos, setos, paisatgisme en 3d, rampes en 3d, graons, murs, paviments, elements construïts en 3d
from: a16bafe1
---

La vista 3D mostra el lloc com un sol model: el terreny existent i la superfície projectada, les corbes de nivell projectades sobre elles, les línies de ruptura i la vora de la superfície, cada traçat sobre el seu perfil de projecte amb marques de punts quilomètrics, les línies característiques del corredor i la carretera mateixa (carrils, espatlles, cunetes, vorades, franges i voreres en els seus propis colors), les plataformes amb les seves línies d'intersecció amb el terreny, la xarxa de tubs amb tubs i estructures a les seves cotes reals, i des de l'espai de treball de paisatgisme, les plantes, els paviments, els camins, els murs, les vorades, les rampes i els graons. Llegeix el mateix projecte que el plànol, de manera que cada edició es veu en tots dos.

## Obre la vista 3D

1. Obriu punts topogràfics (o un fitxer LandXML o de projecte) perquè hi hagi una superfície. Les plantes, els paviments o les rampes sols també basten per obrir-la.
2. Premeu {{key:D}}, o feu clic a {{ui:3D}} al grup {{ui:Visualització}} de la barra d'eines.
   La vista 3D s'obre sobre el plànol, mirant tot el lloc des del sud-est. La primera vegada, triga un moment a carregar-se.
3. Premeu {{key:D}} de nou, o feu clic de nou a {{ui:3D}}, per tornar al plànol. Triar una eina de dibuix com {{ui:Traçat}} o {{ui:Plataforma}} també torna al plànol, ja que el dibuix es fa allà.

## Desplaçament

| Per a | Feu això |
|---|---|
| Orbita | Arrossegueu amb el botó esquerre o el del mig |
| Desplaça | Arrossegueu amb el botó dret, o amb {{key:Shift}} i arrossegueu |
| Zoom | Gireu la roda; fa zoom cap al punter |
| Orbita al ratolí tàctil | Lliscou amb dos dits ({{key:Shift}} i lliscar desplaça) |
| Zoom al ratolí tàctil | Pinça |
| Tàctil | Un dit orbita; dos dits pinçen per fer zoom i es mouen per desplaçar |
| Tecles (la vista té el focus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbiten, amb {{key:Shift}} desplacen; {{key:Plus}} i {{key:Minus}} fan zoom |

La barra sobre la vista conté la resta:

- La llista de vistes: **Iso**, **Superior**, **Inferior**, **Frontal** (mirant al nord), **Posterior**, **Esquerra**, **Dreta**.
- {{ui:Perspectiva}}: premuda és una vista en perspectiva; feu-hi clic per a una projecció paral·lela (sense escurçament).
- {{ui:Extensió}}: torna a mostrar-ho tot. {{key:F}} fa el mateix mentre la vista 3D és oberta.

## El cub de vista

El cub de vista de la cantonada superior dreta gira amb la vista. Feu clic a una cara, aresta o cantonada per mirar el lloc des d'allí (la càmera gira suaument tret que el sistema demani moviment reduït). Arrossegueu el cub per orbitar. L'anell de la brúixola que hi ha sota mostra el nord (nord de la graella, +Y): arrossegueu l'anell per girar el lloc al voltant de la vertical, o feu clic a N, E, S o O per mirar des d'aquella cara. {{ui:Inici}}, la petita casa a la cantonada superior esquerra, torna a la vista isomètrica de tot el lloc. Amb el teclat: {{key:Tab}} fins al cub, les fletxes trien una cara, aresta o cantonada, {{key:Enter}} mira des d'allí.

Al plànol el mateix cub mostra la part superior. Feu clic a qualsevol altra cara, aresta o cantonada (o arrossegueu-lo) per obrir la vista 3D mirant des d'allí: és la manera més ràpida d'entrar en 3D des d'una direcció determinada. Per canviar el cub per una petita icona d'eixos, o per amagar-lo, vegeu **Indicador de cantonada** a [Configuració de CivilCraft](topic:settings).

## Exagera les cotes

Els llocs solen ser molt més amples que alts, de manera que les cotes s'estiren **2×** a l'inici. Trieu **1×**, **2×**, **3×**, **5×** o **10×** a la llista de la barra, o a **Exageració vertical 3D** dins de [Configuració de CivilCraft](topic:settings) (les dues són una sola opció). Només canvia la vista: els volums, els perfils i les exportacions es mantenen a escala real.

## Acoloreix les superfícies

- **Franges de cota**: les mateixes franges i colors que les franges de cota del plànol (el nombre de franges es defineix a **Visualització** al panell de l'esquerra). Cada vora de franja es talla exactament a la seva cota.
- **Un color**: el terreny existent i la superfície projectada, cadascun d'un color pla.
- **Capes de mapa**: les capes de mapa que es mostren sota el plànol (una imatge georeferenciada, rajoles de mapa o un servei de mapes; vegeu [Capes de mapa](topic:map-layers)) posades sobre les superfícies com un full, de manera que una fotografia aèria es veu sobre els turons. Les imatges que encara arriben s'omplen a mesura que ho fan. Sense cap capa de mapa visible, les superfícies mantenen les seves franges de cota i la vista ho indica. La imatge és només per a la pantalla: les exportacions GLB i OBJ no la inclouen.

Quan es mostren les dues superfícies, el terreny existent és transparent sobre la superfície projectada, de manera que es veu el desmunt (terreny per sobre del projecte) i el terraplè.

## Trieu què es mostra

Feu clic a {{ui:Mostra}} a la barra i marqueu o desmarqueu:

| Element | Què és |
|---|---|
| Terreny existent | La superfície construïda a partir dels punts topogràfics (o llegida d'un LandXML) |
| Superfície projectada | El terreny existent amb els corredors i les plataformes ajustats (només quan n'hi ha) |
| Arestes dels triangles | Cada aresta del TIN, en forma de línies |
| Corbes de nivell | Les corbes de nivell secundàries i principals de cada superfície mostrada, a l'interval del plànol |
| Vora de la superfície | La vora exterior de cada superfície mostrada, a les seves cotes |
| Línies de ruptura | Cada línia de ruptura, a les seves cotes |
| Traçats i punts quilomètrics | Cada traçat sobre el seu perfil de projecte (sobre el terreny quan no n'hi ha), amb marques cada 50 ft o 20 m |
| Línies característiques del corredor | Vora del ferm, espatlla i intersecció amb el terreny a tots dos costats |
| Superfícies de carretera | La carretera que construeix cada corredor, segons la seva secció tipus: carrils, espatlles, cunetes, vorades, franges i voreres, cadascun en el seu color, sobre la superfície projectada |
| Plantes | Cada planta, i les plantes en parterres i setos, com a formes senzilles dimensionades segons la llista de plantes: un arbre és un tronc i una capçada rodona (un con per a una conífera, un plomall sobre un tronc alt per a una palmera), els arbustos, les plantes de seto, les perennes i els cobridors són cúpules, les herbes són mates, les enfiladisses són columnes primes. Estan sobre la superfície projectada (o el terreny existent) a la mida que mostra el plànol: madura, o en plantar |
| Elements construïts | Paviments i camins amb les seves pendents, murs, vorades, graons, i rampes que pugen per trams amb replans horitzontals entre ells |
| Plataformes i intersecció amb el terreny | El perímetre de cada plataforma a la seva cota i la seva línia d'intersecció amb el terreny |
| Tubs i estructures | Tubs com a tubs circulars entre les seves cotes de solera, estructures des de la boca fins al pou de decantació |
| Punts topogràfics | Un punt a cada punt amb una cota (desactivat a l'inici) |
| Capes GIS | Les capes GIS que es mostren al plànol, en els seus colors: línies i contorns amb les seves pròpies cotes a aquelles cotes, les altres sobre el terreny existent (el segueixen exactament); els punts com a petites creus. Les formes sense cotes fora de la superfície s'omet, i la vista indica quantes |
| Etiquetes | Noms i valors que sempre us miren de cara: el nom de cada traçat al seu inici i els seus punts quilomètrics cada 100 ft (o 100 m), la cota de cada corba de nivell principal, les plataformes, les línies característiques i les estructures pel seu nom, i amb **Punts topogràfics** marcat, el número i la cota de cada punt |

Les etiquetes mantenen la mida i la posició vertical sigui quin sigui el gir o el zoom, i un turó davant d'una etiqueta l'amaga. Quan es traurien a empènyer-se, les més importants es mostren i la resta espera que feu zoom: primer els traçats, després les estructures, les plataformes, les línies característiques, els punts quilomètrics, les corbes de nivell i els punts, els més propers primer. Només són a la pantalla; les exportacions i els plànols no les inclouen.

Les vostres opcions, l'exageració i els colors es recorden en aquest navegador.

Una carretera es construeix sobre el terreny existent. Amb un traçat i un corredor però sense punts topogràfics ni superfície encara, la carretera es dibuixa de moment sobre un terreny pla substitutiu: a la cota mitjana del seu perfil de projecte, o a nivell 0 quan tampoc no hi ha perfil. Un avís a la part inferior de la vista 3D i a les propietats del corredor ho indica. És només una imatge: no en surten volums ni seccions. Obriu punts topogràfics o una superfície i la carretera es mou sola sobre el terreny real.

L'exageració vertical estira el terreny, no les plantes: aquestes estan sobre el terreny exagerat a la seva alçada real i extensió, de manera que un arbre sembla un arbre amb qualsevol configuració. Les plantes són formes senzilles, no models detallats: milers d'elles continuen sent ràpides per girar i fer zoom.

## Tubs i estructures

- Un tub es dibuixa amb la seva part inferior interior a les cotes de solera que definiu i la part superior interior (la clau) un diàmetre interior més amunt. Els diàmetres són en polzades en un projecte en peus i en mil·límetres en un projecte mètric, com al panell de la dreta.
- Una estructura va des de la seva boca (escrita, o des de la superfície) fins al seu pou de decantació (la solera més baixa menys la profunditat del pou). Sense cap solera, es dibuixa amb 5 ft (1.5 m) de fondària.
- Els tubs i les estructures amb algun problema (vegeu la comprovació de la xarxa al panell de la dreta) es dibuixen en vermell.
- Un tub sense soleres no es dibuixa; una nota a la part inferior de la vista indica quants són.

## Seleccioneu des de la vista 3D

Feu clic a un traçat (o a la seva carretera), una plataforma, una línia característica, un tub, una estructura, un punt topogràfic, una planta, una rampa o un altre element construït. Queda seleccionat exactament com si haguéssiu fet clic al plànol: les seves propietats s'obren al panell de la dreta, on les podeu editar, i es dibuixa amb el color de selecció per sobre de tot en 3D. Tot el que seleccioneu al plànol també es ressalta en 3D. Un consell al costat del punter indica el nom del que heu clicat amb la seva coordenada est, nord i cota. Els tubs i les estructures es poden clicar fins i tot quan són sota terra; una línia amagada darrere d'un turó no es pot clicar a través seu.

Feu clic en una línia de ruptura per veure'n la identitat: es ressalta, i la barra d'estat en dona el nom (les línies de ruptura no tenen propietats pròpies).

Feu clic al terreny per llegir-hi l'est, el nord i la cota al consell.

## Condueix al llarg d'un traçat

Feu clic a **Condueix** a la barra 3D i trieu un traçat. La vista es mou a un seient de conductor: 3.5 ft (1.07 m) per sobre de la carretera, sobre el seu perfil de projecte (sobre el terreny existent al llarg de l'eix quan encara no en té), mirant endavant al llarg d'ell.

- **Reprodueix** o {{key:Space}} condueix a la velocitat que trieu (de 10 a 65 mph, o de 15 a 100 km/h); {{key:Space}} de nou atura. S'atura al final; **Reprodueix** aleshores torna a començar des del principi.
- El control lliscant salta a qualsevol punt quilomètric; {{key:Left}} i {{key:Right}} avancen o retrocedeixen 10 ft (5 m).
- Arrossegar a la vista atura i us deixa mirar al voltant.
- **Atura** o {{key:Esc}} torna la vista a on era.

L'exageració vertical també s'aplica mentre es condueix: poseu-la a 1× per veure la carretera tal com serà.

## Llum del sol

Obriu **Sol** a la barra 3D i marqueu **Llum del sol**. Doneu una data, una hora i el seu fus horari (la diferència respecte a UTC: a l'estiu, la de l'horari d'estiu), i la latitud i la longitud del lloc. Quan el projecte té un sistema de coordenades, s'omplen a partir d'ell.

El lloc s'il·lumina aleshores des d'on és el sol, amb **Ombres** sobre el terreny, el corredor i les plataformes; el menú indica l'azimut del sol i l'altura, o que és sota l'horitzó. Les posicions surten de les equacions solars de la NOAA. Les ombres cauen bé amb qualsevol exageració, però s'aturen a la vora del lloc: els turons i els edificis més enllà no en projecten cap.

## Exporta la vista 3D

Feu clic a {{ui:GLB}} o {{ui:OBJ}} a la barra. El que mostra la vista es desa a escala real (sense exageració), en metres, amb la Y cap amunt. Detalls: [Exportació del lloc en 3D](topic:export-3d).
