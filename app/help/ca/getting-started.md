---
title: Primers passos amb CivilCraft
summary: Què fa CivilCraft, com s'obre i els primers deu minuts amb el lloc d'exemple, des dels punts fins a les corbes de nivell, una carretera i un projecte desat.
keywords: inici, primera execució, lloc d'exemple, introducció, inici ràpid, tutorial, començar, projecte nou
from: c9b6dd8e
---

CivilCraft és l'aplicació de disseny civil i d'obra de la família CadCraft. Pren punts topogràfics i els converteix en una superfície (una TIN) amb corbes de nivell; després permet dissenyar traçats amb perfils de projecte, desplaçar un corredor de carretera simple, explanar plataformes d'edificació fins a l'enllaç amb el terreny, comprovar una xarxa de tubs per gravetat amb les vostres regles i veure els volums de desmunt i terraplè. Llegeix i escriu LandXML, exporta el plànol a DXF i el traça a PDF.

Si heu fet servir Civil 3D, les idees us resultaran familiars: punts, grups de punts, línies de ruptura, traçats per PI, perfils per PVI, corredors, explanacions, xarxes de tubs. La manera de treballar és diferent, i molt més senzilla: no hi ha línia d'ordres, ni estils, ni fitxer de dibuix. Llegiu [Venint d'altre programari civil](topic:coming-from) una vegada abans de la primera feina real.

## Què necessiteu

- Un navegador d'escriptori recent: Chrome, Edge, Firefox o Safari. Vegeu [Navegadors](common:browsers).
- Un ratolí, un trackpad i un teclat, o una pantalla tàctil: el dibuix té als botons en pantalla {{ui:Acaba}}, {{ui:Desfés punt}} i {{ui:Cancel·la}} (vegeu [Ratolí, trackpad i pantalla tàctil](topic:keyboard#mouse-trackpad-and-touch)).
- El plànol es dibuixa en 2D amb el llenç del navegador. La [vista 3D](topic:site-3d) fa servir els gràfics WebGL del navegador; si no pot arrencar, la barra d'estat n'explica el motiu i el plànol continua funcionant.
- Sense compte ni pujada. Els fitxers s'obren al vostre ordinador i es desen com a baixades. Vegeu [Els vostres fitxers](common:your-files).

:::note
CivilCraft funciona avui com una versió inicial per al navegador que encara s'està fent. Les versions d'escriptori encara no estan disponibles, i el desament al núvol tampoc. Tot el que feu es queda al vostre ordinador fins que el deseu o l'exporteu.
:::

## Obriu CivilCraft

1. Obriu CivilCraft al navegador.
2. Espereu que la pantalla s'ompli: una barra d'eines a dalt, un tauler a l'esquerra, el plànol al mig i un tauler **Propietats** a la dreta.
3. En un plànol buit veureu una caixa titulada **Comença amb punts topogràfics**. Llista els primers passos i té un enllaç, {{ui:Obre el lloc d'exemple}}.

Per usar CivilCraft sense connexió més tard, feu clic a {{ui:Desa per fer-lo servir sense connexió}} a la barra d'aplicació i espereu {{ui:Disponible sense connexió}}. Inclou aquesta ajuda, el lloc d'exemple, i les biblioteques 3D i GIS. Vegeu [Sense connexió](common:offline). Premeu {{key:F1}} o feu clic a {{ui:Ajuda}} en qualsevol moment per obrir aquesta ajuda al costat de l'aplicació.

## Els primers deu minuts: el lloc d'exemple

El lloc d'exemple és un petit topogràfic en peus d'enquesta dels EUA: 276 punts en coordenades State Plane, un carener, una rigola amb una línia de flux i dues parts superiors de la riba. Ve amb l'aplicació, així que podeu seguir-lo sense cap fitxer propi.

1. Feu clic a {{ui:Obre el lloc d'exemple}} a la caixa del plànol.
   S'obre el diàleg **Importa punts**. Diu "276 punts llegits com a PNEZD (de la fila de capçalera), separats per comes." i mostra les primeres files.
2. Feu clic a {{ui:Importa}}.
   El plànol s'omple de punts, corbes de nivell i l'aresta de la superfície. La barra d'estat de baix diu que els punts s'han importat i quants triangles té la superfície (546).
3. Mireu el tauler esquerre sota **Punts**. Els punts s'agrupen per la primera paraula de la descripció: CP, FL, GRD, RIDGE, TBN, TBS i TREE.
4. A la columna **Superfície** d'aquella taula, poseu **FL**, **RIDGE**, **TBN** i **TBS** en {{ui:Línia de ruptura}}.
   La superfície es reconstrueix de seguida. Les dades de **Superfície** ara diuen "Línies de ruptura: 4", i les corbes es doblen bruscament al llarg de la línia de flux i del carener en lloc de travessar-los.
5. Moveu el punter sobre el plànol. La barra d'estat mostra la coordenada X (est) i la Y (nord) sota el punter, i la cota del terreny allà.
6. Sota **Visualització**, poseu {{ui:Corbes de nivell cada}} a 0.5 ft i activeu {{ui:Bandes d'elevació}}. Apareix una rampa de colors amb una llegenda sota les caselles. Desactiveu les bandes de nou quan hàgiu acabat.

Ara teniu una superfície de terreny existent. Després, una carretera.

## Traçar una carretera curta

1. Premeu {{key:A}} (o feu clic a {{ui:Traçat}} al grup **Disseny**).
2. Feu clic a tres punts creuant el lloc, un darrere l'altre. Una línia vermella segueix el punter i mostra la longitud i el rumb de la següent tangent.
3. Premeu {{key:Enter}} per acabar.
   El traçat apareix amb el numerat de punts quilomètrics. El tauler dret mostra **Traçat**: la seva longitud, la taula de PI i la corba del PI del mig (radi de 100 ft, o més petit si 100 ft no hi cap).
4. Al tauler dret, sota **Perfil de projecte**, feu clic a {{ui:Comença des del terreny}}.
   La vista de perfil s'obre sota el plànol amb el terreny existent i una pendent de projecte recta d'un extrem a l'altre.
5. Premeu {{key:I}} per activar {{ui:Afegeix PVI}}, i després feu clic una vegada a la vista de perfil prop del mig. Apareix un PVI.
6. A la taula de PVI de la dreta, escriviu una longitud de corba (per exemple 100) a la casella **Corba L** del PVI del mig i premeu {{key:Enter}}. El perfil ara té una corba vertical, amb el seu valor K etiquetat.
7. Sota **Corredor**, marqueu **Escombra un conjunt al llarg del perfil de disseny**.
   La carretera s'explana dins del terreny: carrils, vores i talussos fins a l'enllaç amb el terreny. El bloc **Moviment de terres** mostra el desmunt i el terraplè.

No us preocupeu pels valors exactes. Cada número es pot canviar al tauler dret, i {{key:Mod+Z}} desfà l'últim canvi.

## Desa el vostre treball

1. Escriviu un nom a **Nom** a dalt del tauler esquerre.
2. Premeu {{key:Mod+S}} (o feu clic a {{ui:Desa}}).
   El navegador baixa un fitxer amb el nom del lloc i acabat en `.civilcraft.json`. Conté els punts, la configuració de la superfície, els traçats, els perfils, els corredors, les plataformes i els tubs.
3. Per continuar més tard, feu clic a {{ui:Obre}} (o premeu {{key:Mod+O}}) i trieu aquest fitxer, o deixeu-lo anar sobre el plànol.

:::warning
No hi ha desament automàtic. Si tanqueu la pestanya amb canvis sense desar, el navegador pregunta si voleu sortir; si en sortiu, els canvis es perden. Deseu sovint.
:::

## On anar després

- [Importeu punts topogràfics](topic:import-points) amb els vostres propis fitxers.
- [Construïu i refineu la superfície](topic:build-surface) amb línies de ruptura i un contorn.
- [La pantalla, part per part](topic:workspace).
- [Tecles i ratolí](topic:keyboard).
