---
title: Selecciona, copia i enganxa punts topogràfics
summary: Seleccioneu punts topogràfics amb un clic, amb Shift i un rectangle, o tots de cop; copieu, retalleu, enganxeu, enganxeu al mateix lloc, dupliqueu i suprimiu'ls amb números de punt nous que mai no xoquen; enganxeu files de punts des d'un full de càlcul i cap a un full de càlcul.
keywords: copia, enganxa, retalla, duplica, suprimeix punts, selecciona punts, selecciona-ho tot, selecció per rectangle, finestra, porta-retalls, full de càlcul, csv, renumera, números de punt, enganxa al mateix lloc, clona, replanteig
from: 78a6aea7
---

Els punts topogràfics es poden copiar i enganxar dins d'un projecte, entre projectes en dues pestanyes del navegador, i des d'un full de càlcul i cap a ell. Cada canvi és un pas de desfer, i la superfície es reconstrueix de seguida a partir dels punts nous.

## Selecciona punts

Amb {{ui:Selecciona}} ({{key:V}}):

- **Feu clic** en un punt per seleccionar-lo (i només ell). Els seus números es mostren a **Propietats**.
- {{key:Shift}} i **clic** afegeix un punt a la selecció, o el treu.
- {{key:Shift}} i **arrossegueu** dibuixen un rectangle: els punts que hi ha dins s'afegeixen a la selecció. Si arrossegueu al voltant dels punts, esdevé un llaç; vegeu [Selecció de punts topogràfics amb llaç](topic:lasso-selection). Un arrossegament sense {{key:Shift}} desplaça la vista, com sempre.
- {{key:Mod+A}} (o {{ui:Més}} › {{ui:Selecciona-ho tot}}) selecciona tots els punts.
- {{key:Esc}} (o {{ui:Més}} › {{ui:Neteja la selecció}}) buida la selecció.

Els punts seleccionats tenen un anell. Quan n'hi ha més d'un, **Propietats** mostra quants són, els seus números, el rang d'elevació i els seus grups.

## Copia, retalla i suprimeix

- {{ui:Copia}} o {{key:Mod+C}} copia els punts seleccionats. CivilCraft guarda la còpia i també la posa al porta-retalls del sistema com a files de punts, perquè la pugueu enganxar directament en un full de càlcul o un fitxer de text.
- {{ui:Més}} › {{ui:Retalla}} o {{key:Mod+X}} els copia i els suprimeix, en un sol pas.
- {{ui:Més}} › {{ui:Suprimeix}} o {{key:Delete}} els suprimeix. {{key:Mod+Z}} els torna.

Les files són punt, nord, est, elevació, descripció (P,N,E,Z,D), separades per comes, amb tres decimals. Per tenir l'est abans que el nord, definiu **Files de punts** a [Configuració de CivilCraft](topic:settings). Una descripció que un full de càlcul trataria com una fórmula (que comença per =, +, - o @) rep un apòstrof davant, perquè es quedi com a text.

## Enganxa

1. Premeu {{key:Mod+V}} o feu clic a {{ui:Enganxa}}. Els punts segueixen el punter com a petites creus, amb una línia de punts que els uneix amb on eren.
2. Feu clic on han d'anar. El centre dels punts copiats cau sobre el clic.
3. O premeu {{key:Enter}} per posar-los a les seves pròpies coordenades, o {{key:Esc}} per cancel·lar.

{{ui:Més}} › {{ui:Enganxa al mateix lloc}} o {{key:Mod+Shift+V}} els enganxa a les coordenades pròpies dels punts de seguida. Els punts enganxats queden seleccionats després, de manera que els podeu copiar, moure o suprimir de nou.

:::note
Fer clic a {{ui:Enganxa}} de la barra d'eines llegeix el porta-retalls del sistema. La primera vegada, el navegador pot preguntar si CivilCraft pot veure el porta-retalls. Si ho refuseu, el botó de la barra d'eines només enganxa la còpia pròpia de CivilCraft; {{key:Mod+V}} encara enganxa files d'un full de càlcul sense preguntar.
:::

## Els números de punt mai no xoquen

Dos punts mai no comparteixen número. Quan enganxeu:

- Un punt enganxat conserva el seu número quan cap punt del projecte no el té. Així, després de **Retalla**, els punts s'enganxen de nou amb els seus propis números, i els punts copiats d'un altre projecte conserven els seus allà on estiguin lliures.
- Un punt enganxat el número del qual està ocupat rep un número nou enter: un més que el número més alt en ús, comptant amunt.
- La barra d'estat diu què ha passat, per exemple "1 ha conservat el seu número; 9 han rebut números nous: 10–18 s'han convertit en 277–285".

A [Configuració de CivilCraft](topic:settings) podeu triar **Sempre números nous**, i un número des del qual comencin els números nous, per exemple 5000 per als punts de disseny.

:::warning
Els grups de punts que construeixen la superfície com a **línia de ruptura** uneixen els seus punts en ordre de número. Les còpies enganxades de punts de línia de ruptura (per exemple, mesures FL) reben números nous, més alts, i s'uneixen al final d'aquella línia de ruptura, possiblement amb un salt llarg. Comproveu el plànol després d'enganxar aquests punts, o establiu el seu grup a {{ui:Punts}}.
:::

## Duplica

{{ui:Més}} › {{ui:Duplica}} o {{key:Mod+D}} fa una còpia dels punts seleccionats que segueix el punter: feu clic on ha d'anar. Les còpies sempre reben números nous, i el porta-retalls de CivilCraft es queda com estava.

## Des d'un full de càlcul o un fitxer de text

Seleccioneu files de punts en un full de càlcul (punt, nord, est, elevació, descripció) i copieu-les. A CivilCraft premeu {{key:Mod+V}} i feu clic on han d'anar, o premeu {{key:Mod+Shift+V}} per posar-les a les seves pròpies coordenades, que normalment és el que voleu per a dades reals d'aixecament.

Les files es llegeixen exactament com un [fitxer de punts](topic:point-file-formats): comes, tabuladors o espais, i una fila de capçalera si n'hi ha una. Sense capçalera, l'ordre de les columnes el determina **Files de punts** a [Configuració de CivilCraft](topic:settings).

Quan hi ha les dues coses, CivilCraft decideix per la més recent: les files del porta-retalls del sistema que difereixen de l'última còpia de CivilCraft es van copiar després, de manera que s'enganxen. El text que no conté punts s'ignora, i en lloc seu s'enganxa la còpia de CivilCraft.

## Entre projectes i pestanyes

La còpia es guarda en aquest navegador, de manera que una segona pestanya de CivilCraft la pot enganxar, fins i tot després que la primera es tanqui. Els punts copiats en un projecte en metres i enganxats en un projecte en peus conserven els seus números tal com són: no es converteix res, i la barra d'estat ho diu.

## Què no es copia

Només es copien per ara els punts topogràfics. Els traçats, les plataformes, les xarxes de tuberies, les línies de ruptura i els límits no es poden copiar ni enganxar encara. Enganxar no pot moure punts existents: useu {{ui:Retalla}} i enganxeu, o moveu un punt cada vegada ([Edita un punt topogràfic](topic:edit-points)).
