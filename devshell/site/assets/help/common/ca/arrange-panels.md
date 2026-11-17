---
title: Disposició dels taulers i ús d'un segon monitor
summary: Acobleu els taulers laterals a l'esquerra, a la dreta o a la part inferior, apileu-los, agrupeu-los com a pestanyes, fixeu-los o amagueu-los, deixeu-los flotant sobre el dibuix, feu la disposició més densa, trieu quantes línies fa servir la barra d'eines o mogueu-los a la seva pròpia finestra en una altra pantalla.
keywords: taulers, acobla, flotant, mou tauler, arrossega, disposició, pestanyes, grup de pestanyes, apila, fixa, amagament automàtic, amaga tauler, tanca tauler, compacta, densitat de la disposició, dens, files de la barra d'eines, ajusta, 1 fila, 2 files, línies de la barra d'eines, segon monitor, dues pantalles, monitor dual, diversos monitors, finestra, finestra emergent, restableix la disposició
from: 49530239
---

Els taulers que hi ha al costat del dibuix es poden moure. Poseu-los on us convingui, o doneu-los una finestra pròpia en un segon monitor perquè el dibuix ocupi tot el primer.

:::note
Cada tauler té una barra de títol: una barra estreta amb el nom del tauler, un menú {{ui:⋯}}, un botó per fixar i un botó de tancar a la part superior del tauler. Les versions anteriors a la 0.7 només tenen el nom i el menú {{ui:⋯}}.
:::

## Mou un tauler a la finestra

1. Arrossegueu el tauler pel seu nom, a la part superior.
2. Mentre arrossegueu, apareixen àrees amb contorn a l'esquerra, a la dreta i a la part inferior del dibuix. Deixeu el tauler sobre una d'aquestes àrees per acoblar-lo allà. L'àrea sobre la qual sou s'enfosqueix.
3. Deixeu-lo en qualsevol altre punt sobre el dibuix per fer-lo flotant.

Els taulers poden compartir un mateix costat: s'apilen, i cada línia entre dos d'ells s'arrossega per repartir l'espai (amb una línia enfocada, les tecles de fletxa la mouen, i fer doble clic sobre ella reparteix l'espai per igual). Arrossegueu la vora interior d'un costat acoblat per fer-lo més ample o més estret; feu doble clic sobre la vora per tornar-la al seu lloc.

Un tauler flotant es queda sobre el dibuix. Mogueu-lo pel seu nom, i redimensioneu-lo arrossegant la cantonada inferior dreta (o porteu el tabulador fins a la cantonada i useu les tecles de fletxa). Feu doble clic sobre el seu nom per acoblar-lo de nou on era.

:::touch
Arrossegueu amb un dit pel nom del tauler. Arrossegueu amb un dit la cantonada inferior dreta d'un tauler flotant per redimensionar-lo, i les vores entre taulers acoblats de la mateixa manera. Per fer-lo flotar o acoblar-lo sense arrossegar, useu el menú {{ui:⋯}}.
:::

## Agrupa els taulers com a pestanyes

Dos taulers poden compartir un mateix marc i mostrar-ne un cada vegada. Arrossegueu un tauler pel seu nom sobre la barra de títol d'un altre tauler (la barra té contorn mentre hi sou a sobre) i deixeu-lo anar: el marc ara té una pestanya per a cada tauler, a la seva barra de títol. Feu clic en una pestanya per mostrar aquell tauler. Amb una pestanya enfocada, {{key:Left}} i {{key:Right}} canvien de pestanya, i {{key:Home}} i {{key:End}} van a la primera i a l'última.

Per treure un tauler del grup, trieu {{ui:Surt del grup de pestanyes}} al seu menú {{ui:⋯}}, o arrossegueu-lo a un altre lloc. Trieu {{ui:Pestanya amb}} i el nom d'un tauler per agrupar-los sense arrossegar.

## Fixa, amaga i recupera

- El botó per fixar de la barra de títol d'un tauler el fa **amagar-se automàticament**: el tauler surt del seu acoblament i es converteix en una petita pestanya a aquella vora. Apunteu la pestanya, enfoqueu-la o feu-hi clic, i el tauler llisca sobre el dibuix; quan us allunyeu (o premeu {{key:Esc}}), torna a amagar-se. Premeu de nou el botó per fixar, o trieu {{ui:Desfixa}}, per acoblar-lo de manera definitiva.
- El botó de tancar, o {{ui:Amaga aquest tauler}} al menú, amaga el tauler i tanca l'espai del seu acoblament. Una pestanya de traç discontinu a la vora el recupera: feu-hi clic, o enfoqueu-la i premeu {{key:Enter}}.

## Fes la disposició més densa

{{ui:Configuració}} › {{ui:General}} › {{ui:Densitat de la disposició}} té dues opcions. {{ui:Còmoda}} és la predeterminada. {{ui:Compacta}} ajusta l'alçada de les files, el marge dels taulers, els botons de la barra d'eines i el text dels taulers d'aquella aplicació, perquè hi càpiga més a la pantalla. Es desa per a cada aplicació. Una pantalla tàctil manté els seus botons grans en totes dues, i un telèfon manté la seva pròpia disposició. {{ui:Restableix la disposició}} no canvia la densitat que heu triat.

## Tria quantes línies fa servir la barra d'eines

{{ui:Configuració}} › {{ui:General}} › {{ui:Files de la barra d'eines}} té tres opcions. {{ui:Ajusta}} és la predeterminada: es mostra cada grup d'eines, en tantes línies com calgui. {{ui:2 files}} manté la barra d'eines en dues línies i {{ui:1 fila}} en una, perquè el dibuix tingui més alçada; els grups que no hi caben es desplacen lateralment dins de la barra d'eines (useu la roda del ratolí, un lliscament amb dos dits, o {{key:Tab}} fins a una eina). Una barra d'eines que ja hi cap en dues línies es queda com està amb {{ui:2 files}}, perquè una graella només la faria més alta. L'opció es desa per a cada aplicació. Una pantalla tàctil i un telèfon mantenen la seva pròpia disposició. CadCraft té la seva pròpia configuració per a la barra d'eines, a {{ui:Configuració}} › {{ui:CadCraft}}.

## Fes servir el teclat

El botó {{ui:⋯}} de cada tauler obre un menú: {{ui:Acobla a l'esquerra}}, {{ui:Acobla a la dreta}}, {{ui:Acobla a la part inferior}}, {{ui:Deixa flotant sobre el dibuix}}, {{ui:Fixa a la vora}}, {{ui:Amaga aquest tauler}}, {{ui:Pestanya amb}} un altre tauler, {{ui:Mou a una finestra nova}} i {{ui:Torna'l a posar}}. Porteu el tabulador fins al botó, premeu {{key:Enter}}, mogueu-vos amb les tecles de fletxa i premeu {{key:Enter}} de nou. {{key:Esc}} tanca el menú.

## Posa els taulers en un segon monitor

1. Trieu {{ui:⋯}} en un tauler i, després, {{ui:Mou tots els taulers a una finestra nova}}. També podeu triar {{ui:Mou els taulers a una finestra nova}} a {{ui:Configuració}}.
2. S'obre una finestra petita amb els taulers. Arrossegueu-la al vostre altre monitor i feu-la tan gran com vulgueu.
3. Continueu treballant: els taulers actuen sobre el dibuix com abans, i el dibuix omple la finestra principal.

Les dreceres continuen funcionant mentre la finestra de taulers és davant: les tecles que hi premeu, excepte escriure en una caixa, van al dibuix. Les preguntes i els diàlegs que demana l'aplicació s'obren encara a la finestra principal, així que mireu-hi quan n'aparegui un. El tema i la mida del text dels taulers segueixen la finestra principal.

:::chromium
Chrome i Edge poden col·locar la finestra a l'altra pantalla per vosaltres. Amb una segona pantalla connectada, trieu {{ui:Posa-la a la meva altra pantalla}} a la finestra de taulers (o {{ui:Posa els taulers a la meva altra pantalla}} al menú {{ui:⋯}} d'un tauler). El navegador pregunta una vegada si aquest lloc pot veure les vostres pantalles; després de permetre-ho, la finestra de taulers s'obre en aquella pantalla cada vegada.
:::

:::firefox safari
Arrossegueu vosaltres mateixos la finestra de taulers fins a l'altre monitor. La propera vegada s'obrirà al mateix lloc i amb la mateixa mida.
:::

## Més d'una finestra de taulers

Cada tauler pot tenir una finestra pròpia: fins a quatre finestres de taulers, per exemple una per monitor.

- Al menú {{ui:⋯}} d'un tauler, {{ui:Mou a una finestra nova}} obre una altra finestra per a aquell tauler, i {{ui:Mou a la finestra de taulers 2}} (i així successivament) el mou a una que ja estigui oberta. La segona finestra es diu "taulers 2".
- Arrossegueu un tauler pel seu nom d'una finestra a una altra: deixeu-lo anar sobre la finestra principal per acoblar-lo allà (les àrees amb contorn es mostren mentre hi sou a sobre) o per fer-lo flotant, o sobre una altra finestra de taulers per moure'l-hi. Si el deixeu anar en qualsevol altre lloc, es queda on era.
- Una finestra de taulers que ja no té cap tauler es tanca sola.

Després de recarregar, l'aplicació us ofereix de nou les finestres de taulers. Els navegadors obren una finestra per cada clic, així que trieu {{ui:Obre la següent}} una vegada per a cada finestra.

## El mateix per a totes les parts d'una disposició

La cinta, la caixa d'eines, les files d'eines i la barra d'estat es poden treure en una finestra pròpia de la mateixa manera que un tauler: obriu el menú {{ui:⋯}} de la part i trieu {{ui:Mou a una finestra nova}}; {{ui:Torna'l a posar}} (o tancar la finestra) la torna a casa. Les tecles que hi premeu arriben a l'aplicació, com passa des de la finestra de taulers. Cada part té un únic menú d'aquest tipus.

## Mou un diàleg

Cada diàleg es pot moure perquè no tapi el dibuix: premeu i arrossegueu la seva barra de títol. El diàleg recorda on l'heu deixat, cada diàleg pel seu compte, i torna a aquell lloc la propera vegada que s'obre. Feu doble clic sobre la barra de títol per centrar-lo de nou.

Des del teclat, amb el focus dins del diàleg, premeu {{key:Alt}}+{{key:Shift}} i una tecla de fletxa per moure'l 16 píxels cada vegada; afegiu {{key:Ctrl}} per moure'l 64. Un diàleg que queda fora de la pantalla (després d'una finestra o una pantalla més petita) es torna a portar a dins.

En un telèfon, els diàlegs es mantenen com a fulls d'amplada completa i no es mouen.

A CadCraft Studio, el diàleg {{ui:Traça a PDF}} de CadCraft, que podeu deixar obert mentre treballeu, té un botó a la barra de títol, {{ui:Obre en una finestra pròpia}}. El diàleg passa a una finestra pròpia que podeu posar en un altre monitor. Tancar el diàleg tanca la finestra, i tancar la finestra tanca el diàleg.

## Torna a posar els taulers

- Trieu {{ui:Torna a posar els taulers}} a la finestra de taulers, o simplement tanqueu-la. Els taulers tornen on eren.
- Si tanqueu o recarregueu la finestra principal, la finestra de taulers es tanca també. Quan l'aplicació torna a obrir-se, diu que els vostres taulers eren en una finestra pròpia; trieu {{ui:Obre-la}} per tornar-la a obrir, o {{ui:Mantén-los aquí}}.
- {{ui:Configuració}} › {{ui:General}} › {{ui:Restableix la disposició}} torna cada tauler al lloc on havia començat.

:::tip
Si no s'obre res en moure els taulers a una finestra nova, el navegador ha bloquejat la finestra emergent. L'aplicació ho diu i manté els taulers on eren. Permeteu les finestres emergents per a getcadcraft.com i torneu-ho a provar.
:::

La disposició es desa per a cada aplicació en aquest navegador, juntament amb la resta de la configuració.
