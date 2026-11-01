---
title: Organitzar els taulers i fer servir un segon monitor
summary: Acoblar els taulers laterals a l'esquerra, a la dreta o a la part inferior, apilar-los, agrupar-los com a pestanyes, fixar-los o amagar-los, deixar-los flotant sobre el dibuix, fer la disposició més densa, triar quantes línies fa servir la barra d'eines o moure'ls a la seva pròpia finestra en una altra pantalla.
keywords: taulers, acobla, deixa flotant, mou tauler, arrossega, disposició, pestanyes, grup de pestanyes, apila, fixa, amagat automàticament, amaga tauler, tanca tauler, compacta, densitat de la disposició, densa, files de la barra d'eines, ajusta, 1 fila, 2 files, línies de la barra d'eines, segon monitor, dues pantalles, doble monitor, diversos monitors, finestra, finestra emergent, restableix la disposició
from: 32a8dae2
---

Els taulers al costat del dibuix es poden moure. Col·loqueu-los on us vagin bé, o doneu-los una finestra pròpia en un segon monitor perquè el dibuix ocupi tot el primer.

:::note
Cada tauler té una barra de títol: una barra estreta amb el nom del tauler, un menú {{ui:⋯}}, un fixador i un botó de tancament a la part superior del tauler. Les versions anteriors a la 0.7 només tenen el nom i el menú {{ui:⋯}}.
:::

## Moure un tauler a la finestra

1. Arrossegueu el tauler pel seu nom, a la part superior.
2. Mentre arrossegueu, apareixen àrees amb contorn a l'esquerra, a la dreta i a la part inferior del dibuix. Deixeu anar el tauler sobre una d'elles per acoblar-lo allà. L'àrea sobre la qual sou s'enfosqueix.
3. Deixeu-lo anar en qualsevol altre punt sobre el dibuix perquè quedi flotant.

Els taulers poden compartir un costat: s'apilen, i cada línia entre dos d'ells s'arrossega per repartir l'espai (amb la línia enfocada, les tecles de fletxa la mouen, i fer doble clic hi reparteix l'espai per igual). Arrossegueu la vora interior d'un costat acoblat per fer-lo més ample o més estret; feu doble clic a la vora per restablir-la.

Un tauler flotant es queda sobre el dibuix. Mogueu-lo pel seu nom i canvieu-ne la mida arrossegant la cantonada inferior dreta (o aneu amb el tabulador fins a la cantonada i feu servir les tecles de fletxa). Feu doble clic al seu nom per tornar-lo a acoblar on era.

:::touch
Arrossegueu amb un dit pel nom del tauler. Arrossegueu la cantonada inferior dreta d'un tauler flotant amb un dit per canviar-ne la mida, i les vores entre taulers acoblats de la mateixa manera. Per fer-lo flotar o acoblar-lo sense arrossegar, feu servir el menú {{ui:⋯}}.
:::

## Agrupar els taulers com a pestanyes

Dos taulers poden compartir un mateix marc i mostrar-ne un cada vegada. Arrossegueu un tauler pel seu nom sobre la barra de títol d'un altre tauler (la barra té contorn mentre hi sou a sobre) i deixeu-lo anar: el marc ara té una pestanya per a cada tauler, a la seva barra de títol. Feu clic en una pestanya per mostrar aquell tauler. Amb una pestanya enfocada, {{key:Left}} i {{key:Right}} canvien de pestanya, i {{key:Home}} i {{key:End}} van a la primera i a l'última.

Per treure un tauler del grup, trieu {{ui:Surt del grup de pestanyes}} al seu menú {{ui:⋯}}, o arrossegueu-lo a un altre lloc. Trieu {{ui:Posa en pestanya amb}} i el nom d'un tauler per agrupar-los sense arrossegar.

## Fixar, amagar i recuperar

- El fixador de la barra de títol d'un tauler el fa **amagat automàticament**: el tauler surt del seu acoblament i es converteix en una petita pestanya a aquella vora. Apunteu la pestanya, enfoqueu-la o feu-hi clic, i el tauler llisca per sobre del dibuix; allunyeu-vos (o premeu {{key:Esc}}) i torna a amagar-se. Torneu a prémer el fixador, o trieu {{ui:Desfixa}}, per acoblar-lo de manera permanent.
- El botó de tancament, o {{ui:Amaga aquest tauler}} al menú, amaga el tauler i tanca el seu acoblament. Una pestanya de traços a la vora el torna a mostrar: feu-hi clic, o enfoqueu-la i premeu {{key:Enter}}.

## Fer la disposició més densa

{{ui:Configuració}} › {{ui:General}} › {{ui:Densitat de la disposició}} té dues opcions. {{ui:Còmoda}} és la predeterminada. {{ui:Compacta}} redueix l'alçada de les files, el marge dels taulers, els botons de la barra d'eines i el text dels taulers d'aquella aplicació perquè càpiga més a la pantalla. Es guarda per a cada aplicació. Una pantalla tàctil manté els botons grans en totes dues, i un telèfon manté la seva pròpia disposició. {{ui:Restableix la disposició}} no canvia la densitat que heu triat.

## Triar quantes línies fa servir la barra d'eines

{{ui:Configuració}} › {{ui:General}} › {{ui:Files de la barra d'eines}} té tres opcions. {{ui:Ajusta}} és la predeterminada: es mostra cada grup d'eines, en tantes línies com calgui. {{ui:2 files}} manté la barra d'eines en dues línies i {{ui:1 fila}} en una, perquè el dibuix guanyi alçada; els grups que no hi caben es desplacen lateralment dins de la barra d'eines (feu servir la roda del ratolí, un lliscament amb dos dits o {{key:Tab}} fins a una eina). Una barra d'eines que ja hi cap en dues línies es queda igual amb {{ui:2 files}}, perquè una graella només la faria més alta. La tria es guarda per a cada aplicació. Una pantalla tàctil i un telèfon mantenen la seva pròpia disposició. CadCraft té la seva pròpia configuració per a la barra d'eines, a {{ui:Configuració}} › {{ui:CadCraft}}.

## Fer servir el teclat

Cada botó {{ui:⋯}} d'un tauler obre un menú: {{ui:Acobla a l'esquerra}}, {{ui:Acobla a la dreta}}, {{ui:Acobla a la part inferior}}, {{ui:Deixa flotant sobre el dibuix}}, {{ui:Fixa a la vora}}, {{ui:Amaga aquest tauler}}, {{ui:Posa en pestanya amb}} un altre tauler, {{ui:Mou a una finestra nova}} i {{ui:Torna'l a posar}}. Aneu amb el tabulador fins al botó, premeu {{key:Enter}}, mogueu-vos amb les tecles de fletxa i premeu {{key:Enter}} de nou. {{key:Esc}} tanca el menú.

## Posar els taulers en un segon monitor

1. Trieu {{ui:⋯}} en un tauler, i després {{ui:Mou tots els taulers a una finestra nova}}. També podeu triar {{ui:Mou els taulers a una finestra nova}} a {{ui:Configuració}}.
2. S'obre una finestra petita amb els taulers a dins. Arrossegueu-la fins a l'altre monitor i feu-la tan gran com vulgueu.
3. Continueu treballant: els taulers actuen sobre el dibuix com abans, i el dibuix ocupa la finestra principal.

Les dreceres segueixen funcionant mentre la finestra de taulers és al davant: les tecles que hi premeu, excepte escriure en un quadre, van al dibuix. Les preguntes i els diàlegs que demana l'aplicació s'obren encara a la finestra principal, així que mireu-hi quan n'aparegui un. El tema i la mida del text dels taulers segueixen la finestra principal.

:::chromium
Chrome i Edge poden col·locar la finestra a l'altra pantalla per a vosaltres. Amb una segona pantalla connectada, trieu {{ui:Posa-la a la meva altra pantalla}} a la finestra de taulers (o {{ui:Posa els taulers a la meva altra pantalla}} al menú {{ui:⋯}} d'un tauler). El navegador pregunta una vegada si aquest lloc pot veure les vostres pantalles; després de permetre-ho, la finestra de taulers s'obre sempre en aquella pantalla.
:::

:::firefox safari
Arrossegueu vosaltres mateixos la finestra de taulers a l'altre monitor. La propera vegada s'obrirà al mateix lloc i amb la mateixa mida.
:::

## Més d'una finestra de taulers

Cada tauler pot tenir una finestra pròpia: fins a quatre finestres de taulers, per exemple una per monitor.

- Al menú {{ui:⋯}} d'un tauler, {{ui:Mou a una finestra nova}} obre una altra finestra per a aquell tauler, i {{ui:Mou a la finestra de taulers 2}} (i així successivament) el mou a una que ja estigui oberta. La segona finestra es diu "taulers 2".
- Arrossegueu un tauler pel seu nom d'una finestra a una altra: deixeu-lo anar sobre la finestra principal per acoblar-lo allà (les àrees amb contorn es mostren mentre hi sou a sobre) o per fer-lo flotar, i sobre una altra finestra de taulers per moure'l-hi. Si el deixeu anar en qualsevol altre lloc, es queda on era.
- Una finestra de taulers que es queda sense taulers es tanca sola.

Després de recarregar, l'aplicació us ofereix de nou les finestres de taulers. Els navegadors obren una finestra per clic, així que trieu {{ui:Obre la següent}} una vegada per a cada finestra.

## Moure un diàleg

Qualsevol diàleg es pot apartar del dibuix: premeu i arrossegueu la seva barra de títol. El diàleg recorda on l'heu deixat, cadascun per separat, i torna a aquell lloc la propera vegada que s'obri. Feu doble clic a la barra de títol per tornar-lo a centrar.

Des del teclat, premeu {{key:Alt}}+{{key:Shift}}+una tecla de fletxa amb el focus dins del diàleg per moure'l 16 píxels cada vegada; afegiu {{key:Ctrl}} per moure'l 64 píxels cada vegada. Un diàleg que quedi fora de la pantalla (després d'una finestra o pantalla més petites) es torna a portar a la vista.

En un telèfon, els diàlegs es mantenen com a fulls d'amplada completa i no es mouen.

A CadCraft Studio, el diàleg {{ui:Traça a PDF}} de CadCraft, que podeu deixar obert mentre treballeu, té un botó a la barra de títol, {{ui:Obre en una finestra pròpia}}. El diàleg es mou a una finestra pròpia que podeu posar en un altre monitor. Tancar el diàleg tanca la finestra, i tancar la finestra tanca el diàleg.

## Tornar a posar els taulers al seu lloc

- Trieu {{ui:Torna a posar els taulers}} a la finestra de taulers, o simplement tanqueu-la. Els taulers tornen on eren.
- Tancar o recarregar la finestra principal també tanca la finestra de taulers. Quan l'aplicació es torna a obrir, us diu que els vostres taulers eren en una finestra pròpia; trieu {{ui:Obre-la}} per recuperar la finestra, o {{ui:Mantén-los aquí}}.
- {{ui:Configuració}} › {{ui:General}} › {{ui:Restableix la disposició}} torna cada tauler al lloc on havia començat.

:::tip
Si no s'obre res en moure els taulers a una finestra nova, el navegador ha bloquejat la finestra emergent. L'aplicació ho indica i deixa els taulers on eren. Permeteu les finestres emergents per a getcadcraft.com i torneu-ho a provar.
:::

La disposició es guarda per a cada aplicació en aquest navegador, juntament amb la resta de la configuració.
