---
title: Crea un corredor de carretera
summary: Activa un corredor per a un traçat, defineix els valors de carril, arcen i talús lateral, i llegeix les seccions, les línies de tall amb el terreny i el moviment de terres que produeix.
keywords: cruïlla, intersecció, carretera que troba carretera, carrer lateral, forquilla en T, encreuament, nivell de plataforma, unió, connexió, peralt, peraltar, transició de peralt, sortida del peralt, taula de taxes, pendent transversal, rotació, corredor, conjunt, subconjunt, secció tipus, carretera, carril, arcen, pendent transversal, talús lateral, línia de tall, desmunt, terraplè, seccions, objectiu, objectius, objectiu d'amplada, objectiu d'elevació, objectiu de desplaçament, eixamplament, vora de la calçada, seguir un altre corredor
from: 6dcb92b3
---

Un corredor fa passar una secció tipus senzilla (un conjunt) al llarg d'un traçat i del seu perfil longitudinal de disseny, la nivella amb el terreny actual i n'afegeix el resultat a la superfície projectada. Un traçat pot tenir diversos corredors en intervals de PK diferents, i un corredor es pot construir a partir de plantilles reutilitzables per PK ([Plantilles de corredor](topic:corridor-templates)). El conjunt simple de sota és igual a ambdós costats; per donar a cada costat les seves pròpies parts, vegeu [Construeix cada costat a partir de parts](topic:corridor#build-each-side-from-parts).

## El conjunt

Des de l'eix cap enfora, a cada costat:

1. un **carril** d'una amplada determinada, que baixa des del bombament amb la **pendent del carril**
2. un **arcen** d'una amplada determinada amb la **pendent de l'arcen**
3. un **talús lateral** des de la vora de l'arcen fins a on troba el terreny: el **talús de desmunt** quan el terreny és per sobre, el **talús de terraplè** quan és per sota

Els valors inicials són marcadors de posició, no una norma de disseny:

| Valor | Peus EUA | Metres |
|---|---|---|
| Amplada del carril | 12 ft | 3.6 m |
| Pendent del carril | 2% | 2% |
| Amplada de l'arcen | 4 ft | 1.2 m |
| Pendent de l'arcen | 4% | 4% |
| Talús de desmunt | 2 : 1 | 2 : 1 |
| Talús de terraplè | 3 : 1 | 3 : 1 |
| Secció cada | 10 ft | 5 m |

Els pendents dels talussos laterals són horitzontal a vertical (H:V): 3 : 1 vol dir 3 en horitzontal per 1 en vertical.

## Construeix el corredor

Necessiteu un traçat sense errors i un perfil de disseny amb almenys dos PVI i sense errors.

1. Seleccioneu el traçat.
2. A la fitxa dreta, sota **Corredor**, marqueu **Fer passar un conjunt al llarg del perfil de disseny**.
   Apareixen els camps i el corredor es construeix de seguida. El plànol mostra les vores del carril i de l'arcen i les línies de tall amb el terreny; amb {{ui:Proposed (graded)}} triat a **Visualització**, les corbes de nivell mostren el terreny nou.
3. Canvieu qualsevol valor: **Amplada del carril**, **Pendent del carril**, **Amplada de l'arcen**, **Pendent de l'arcen**, **Talús de desmunt**, **Talús de terraplè**, **Secció cada**. Premeu {{key:Enter}} després de cada un. El talús de desmunt, el de terraplè i l'espaiat de seccions han de ser més grans que 0.
4. Llegiu la línia sota els camps, per exemple «39 seccions de 0+00.00 a 3+86.36; desmunt 240.2 cu yd, terraplè 556.0 cu yd».

Les seccions es fan a cada pas de **Secció cada**, als extrems, i a l'inici i al final de cada corba horitzontal i vertical. Cada secció i les línies que hi passen (eix, vores del carril i de l'arcen, línia de tall) esdevenen línies de ruptura de la superfície projectada.

Per desactivar el corredor, desmarqueu la casella. Els seus valors es guarden per a la propera vegada.

## Quan no es construeix

Un requadre vermell sota els camps explica el motiu:

| Missatge | Què cal fer |
|---|---|
| "El corredor necessita un perfil de disseny sense errors." | Afegiu PVI o corregiu les corbes verticals que se solapen (vegeu [Dissenyar un perfil vertical](topic:profile)). |
| "El perfil de disseny no se solapa amb el traçat." | Moveu els PVI al rang de PK del traçat. |
| "El corredor necessita almenys dues seccions a la superfície." | La major part del corredor queda fora del terreny actual. |
| "4 talussos laterals surten de la superfície abans de trobar el terreny." | A la vora de la superfície el talús no arriba al terreny. Mantingueu la carretera lluny de la vora, o rebaixeu l'alçada del terraplè o del desmunt en aquell punt. |
| "Les línies de tall del corredor s'encreuen (les seccions se superposen, per exemple a l'interior d'una corba tancada). Useu un radi més gran o un conjunt més estret." | Les seccions a l'interior d'una corba tancada se superposen. Augmenteu el radi o estreneu el conjunt. |

Un corredor amb problemes no es nivella ni compta en el moviment de terres.

## Corredors i plataformes junts

La superfície projectada es construeix en ordre: primer tots els corredors, després totes les plataformes. On la nivellació d'una plataforma se solapa amb un corredor, guanya la plataforma. On un element posterior se solapa amb una carretera, només es reemplaça la part de la carretera dins de la línia de tall de l'element posterior; la resta de la carretera, i qualsevol línia de ruptura del terreny que la carretera creua, manté la seva forma. Els volums es calculen dins de totes les línies de tall alhora; vegeu [Volums de moviment de terres](topic:volumes).

## Peralt

En una corba la carretera pot inclinar-se cap a l'interior, de manera que el trànsit és empès menys cap a l'exterior. Marqueu **Aplica el peralt a les corbes** sota **Peralt** a les **Propietats** del traçat:

- Cada corba circular pren una taxa **e** de la taula de taxes: la primera fila el radi de la qual la corba assoleix (una fila amb la taxa buida manté el bombament normal). La taula i la **Pendent relativa màxima** (0.5 % per començar) són marcadors de posició, no una norma: definiu-los segons els vostres criteris de disseny. Afegiu o traieu files segons calgui.
- Els carrils roten al voltant de l'eix. Abans de la corba, el carril exterior s'aplana durant la **sortida del peralt** (bombament normal ÷ e × transició), i després durant la **transició de peralt** (amplada del carril × e ÷ la pendent) el carril exterior continua girant fins que tota la carretera té pendent e cap a l'interior; dos terços de la transició són abans de la corba i un terç sobre ella. Després de la corba succeeix el mateix a la inversa.
- Un arcen del costat baix mai no és més pla que el seu carril; al costat alt manté la seva pròpia pendent (es gira).
- La taula de sota llista el radi, la taxa, la transició i la sortida de cada corba, i on comencen i acaben el peralt complet. El **diagrama de peralt** dibuixa les pendents transversals dels dos carrils al llarg dels PK (el carril esquerre amb línia contínua, el dret amb línia discontínua).
- Una corba massa curta per arribar al peralt complet, o dues corbes les transicions de les quals se solapen, s'indica en un requadre sobre la taula.

Les seccions, els volums, la vista 3D i els plànols mostren la carretera inclinada. Cada canvi és un sol pas: {{key:Mod+Z}} el desfà.

## Objectius

Un objectiu mou un punt d'un costat de la carretera fins a una línia: la **Vora de la calçada** o la **Vora de l'arcen**, a l'**Esquerra** o a la **Dreta**. Cada secció troba la línia en angle recte respecte a l'eix, i avança només cap a aquell costat; un objectiu a la dreta mai no mou el costat esquerre.

| Estableix | Què passa on una secció troba la línia |
|---|---|
| **Amplada** | El punt queda sobre la línia: el carril (o l'arcen) s'eixampla o s'estreny fins a ella, mantenint la seva pendent transversal. |
| **Elevació** | El punt pren l'elevació de la línia allà, a la seva pròpia distància; la pendent transversal del carril (o de l'arcen) en segueix. |

La línia pot ser una línia característica (sigui quin sigui el seu **Ús**) o una línia d'un altre corredor: el seu eix, les vores de la calçada, les vores de l'arcen o les línies de tall. La línia d'un corredor segueix aquell corredor: si canvieu l'altra carretera, aquesta en seguirà. CivilCraft construeix primer l'altre corredor; dos corredors que es fixessin objectius mutus en bucle es refusen per un costat, i la taula indica quin.

1. Seleccioneu el traçat i activeu-ne el corredor.
2. Sota **Objectius**, cliqueu {{ui:Afegeix un objectiu}}.
3. Trieu el **Costat**, el **Punt**, el que **Estableix** i **A la línia**. Cada canvi és un pas per desfer.

**Resultat** indica en quantes seccions s'ha assolit la línia. Les seccions que no l'assoleixen (més enllà dels seus extrems, o on és darrere de l'eix) mantenen els valors del conjunt. Si una línia s'esborra, el corredor torna a ser com era abans de l'objectiu, i la taula ho indica. Un costat pot tenir una amplada i una elevació d'objectiu per a cada punt.

## Construeix cada costat a partir de parts

Activeu **Construeix cada costat a partir de parts** a la configuració del corredor. Cada costat llavors té la seva pròpia llista, des de l'eix cap enfora: carrils, un arcen, una cuneta, una vorada, una franja enjardinada, una vorera i, al final, el talús lateral fins al terreny (amb les seves pròpies relacions de desmunt i de terraplè). Comenceu des de {{ui:Carretera rural}} o {{ui:Carrer urbà}}, afegiu i traieu parts, mogueu-les amb les fletxes i useu {{ui:Copia}} per copiar un costat a l'altre. Cada canvi és un pas per desfer.

Una pendent transversal és la caiguda allunyant-se de la carretera; per tant, una vorera que desguassa cap a la carretera té valor negatiu. Una vorada és una cara de l'alçada que indiqueu, una part superior de l'amplada que indiqueu i una caiguda opcional a la part posterior. El peralt gira tots els carrils de la primera fila; la cuneta, la vorada, la franja i la vorera pengen de la vora dels carrils tal com es construeixen. Els objectius encara mouen l'extrem dels carrils i l'última part. Les seccions transversals marquen la línia de fons de la cuneta, la part superior i posterior de la vorada, i la resta. En una corba amb espirals, la transició és l'espiral: bombament pla al TS, peralt complet al SC.

## Capes de paviment

Un carril, un arcen, una cuneta, una franja enjardinada o una vorera poden portar la seva composició: sota la part, {{ui:Afegeix una capa}} afegeix una capa amb un nom, un material, un gruix i el seu tipus (superfície, lligant, base, subbase, coronament o altre), de dalt a baix. Les capes no mouen la superfície de la carretera (la seva part superior és la superfície de disseny); cada capa queda sota la seva part, i la seva profunditat es mesura verticalment cap avall. Les seccions transversals dibuixen la base de cada capa com una línia discontínua, i {{ui:Capes de paviment: quantitats}} llista l'àrea en planta i el volum de cada capa (l'àrea al llarg del corredor a partir de les seves seccions; volum = àrea × gruix). L'exportació IFC escriu cada capa com el seu propi element, amb el seu gruix i material (vegeu [Exportació i importació IFC](topic:ifc)). El gruix que escriviu és el vostre: CivilCraft no dimensiona els paviments.

## On les carreteres es troben amb carreteres, plataformes i camins

Amb {{ui:Uneix les carreteres i les plataformes que trobi}} activat (ho està per a tots els corredors), CivilCraft uneix un corredor amb el que troba en planta:

- **Una carretera que acaba en una altra carretera** (el final del seu traçat és sobre l'altra carretera, o a menys de la meitat aproximada de l'amplada de la seva pròpia calçada de la vora d'aquella carretera) és el carrer lateral d'una cruïlla. La carretera que es troba obre la seva vora per a la calçada del carrer lateral: a través de la boca, l'arcen, la vorada, la franja i la vorera es disposen amb la pendent transversal del carril i es dibuixen com a calçada. El carrer lateral es posa sobre la superfície de la carretera principal on es solapen, i s'hi suavitza en pujada o baixada durant l'aproximació.
- **Dues carreteres que s'encreuen** s'uneixen de la mateixa manera en tots dos costats. La carretera que apareix primer als Traçats és la carretera principal; l'altra segueix la seva superfície a través de l'encreuament.
- **Una carretera que acaba en una plataforma** (dins d'ella, o a menys de la meitat aproximada de l'amplada de la seva calçada de la vora) arriba al nivell de la plataforma i s'hi suavitza durant l'aproximació.
- **Un camí** (Paisatgisme › Paviments i elements construïts) s'atura a la vora exterior d'una carretera, al nivell de la vorera o de l'arcen allà, en lloc d'estar sobre la carretera. Un camí que creua una carretera esdevé dues peces. Un extrem dibuixat una mica curt d'una carretera (dins del doble de l'amplada del camí) es prolonga fins a la seva vora.

Les Propietats indiquen què ha unit cada corredor, quant s'ha pujat o baixat allà i en quina longitud. Aquesta longitud és el més gran entre 10 m (30 ft) i vint vegades el canvi, i mai no supera el 45% del corredor. **El perfil de disseny no es modifica**: la vista del perfil encara mostra la línia de pendent que heu dibuixat, i les seccions, la superfície projectada, els volums i la vista 3D mostren la carretera tal com s'ha unit. Per fer la unió exacta per disseny, moveu l'últim PVI al nivell que indiquen les Propietats.

Desactiveu el commutador en un corredor per deixar-lo exactament tal com indiquen el seu perfil i el seu conjunt; llavors no participa en cap unió, ni com a carrer lateral ni com a carretera principal. Les carreteres que es troben gairebé en línia (menys de 20° aproximadament) es deixen sense tocar, i també les pistes.

El que una unió encara no fa: no hi ha retorns de vorada (els cantons són quadrats), no hi ha carrils de gir ni illetes, el final del carrer lateral es talla en angle recte respecte al seu propi traçat, i un corredor construït des de plantilles obre la seva vora de la mateixa manera simple (una cuneta o un mur a la seva condició final es nivella a través de la boca, sense drenatge transversal). Per als retorns de vorada en planta, els triangles de visibilitat i la senyalització horitzontal, vegeu [Sòls, carreteres, topografia, mines i enllaços](topic:soils-roads-survey-mines-links).

## Què encara no està implementat

Els objectius per a la pendent de la línia de tall encara no estan disponibles. Per a un corredor que canvia al llarg de la carretera, amb esquerra i dreta separades, useu [Plantilles de corredor](topic:corridor-templates). Vegeu [Encara no implementat](topic:not-built-yet).
