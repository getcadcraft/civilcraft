---
title: Escombra un corredor de carretera
summary: Activeu un corredor per a un traçat, definiu els valors de carril, arcen i talús lateral, i llegiu les seccions, les línies de connexió amb el terreny i el moviment de terres que produeix.
keywords: peralt, super, peralt, transició, sortida, taula de peralts, pendent transversal, rotació, corredor, muntatge, subconjunt, secció tipus, carretera, carril, arcen, pendent transversal, talús lateral, connexió amb el terreny, desmunt, terraplè, seccions, objectiu, objectius, objectiu d'amplada, objectiu d'elevació, objectiu de desplaçament, eixamplament, vora del paviment, seguir un altre corredor
from: 91303189
---

Un corredor escombra una secció tipus simple (un muntatge) al llarg d'un traçat i del seu perfil de projecte, l'ajusta al terreny existent i afegeix el resultat a la superfície projectada. Un traçat pot tenir diversos corredors en rangs de PK diferents, i un corredor es pot construir a partir de plantilles reutilitzables per PK ([Plantilles de corredor](topic:corridor-templates)). El muntatge simple de sota és el mateix a tots dos costats; per donar a cada costat les seves pròpies parts, vegeu [Construeix cada costat amb peces](topic:corridor#build-each-side-from-parts).

## El muntatge

Des de l'eix cap enfora, a cada costat:

1. un **carril** d'una amplada donada, que baixa des de la coronació amb el **pendent del carril**
2. un **arcen** d'una amplada donada amb el **pendent de l'arcen**
3. un **talús lateral** des del cantell de l'arcen fins a on troba el terreny: el **pendent de desmunt** on el terreny és per sobre, i el **pendent de terraplè** on és per sota

Els valors inicials són marcadors, no una norma de disseny:

| Valor | US feet | Metres |
|---|---|---|
| Amplada del carril | 12 ft | 3.6 m |
| Pendent del carril | 2% | 2% |
| Amplada de l'arcen | 4 ft | 1.2 m |
| Pendent de l'arcen | 4% | 4% |
| Pendent de desmunt | 2 : 1 | 2 : 1 |
| Pendent de terraplè | 3 : 1 | 3 : 1 |
| Secció cada | 10 ft | 5 m |

Els pendents dels talussos laterals són horitzontals a vertical (H:V): 3 : 1 vol dir 3 en horitzontal per cada 1 en vertical.

## Construeix el corredor

Necessiteu un traçat sense errors i un perfil de projecte amb almenys dos PVI i sense errors.

1. Seleccioneu el traçat.
2. Al tauler dret, sota **Corredor**, marqueu **Escombra un muntatge al llarg del perfil de projecte**.
   Els camps apareixen i el corredor es construeix de seguida. El plànol mostra les vores del carril i de l'arcen i les línies de connexió amb el terreny; amb {{ui:Projectat (explanat)}} triat a **Visualització**, les corbes de nivell mostren el terreny nou.
3. Canvieu qualsevol valor: **Amplada del carril**, **Pendent del carril**, **Amplada de l'arcen**, **Pendent de l'arcen**, **Pendent de desmunt**, **Pendent de terraplè**, **Secció cada**. Premeu {{key:Enter}} després de cada un. El desmunt, el terraplè i l'espaiat de seccions han de ser més grans que 0.
4. Llegiu la línia sota els camps, per exemple "39 seccions des de 0+00.00 fins a 3+86.36; desmunt 240.2 cu yd, terraplè 556.0 cu yd."

Les seccions es tallen a cada pas de **Secció cada**, als extrems, i a l'inici i al final de cada corba horitzontal i vertical. Cada secció i les línies que hi passen (l'eix, les vores de carril i d'arcen, la connexió amb el terreny) esdevenen línies de ruptura de la superfície projectada.

Per desactivar el corredor, desmarqueu la casella. Els seus valors es conserven per a la propera vegada.

## Quan no es construeix

Una caixa vermella sota els camps diu per què:

| Missatge | Què fer |
|---|---|
| "El corredor necessita un perfil de projecte sense errors." | Afegiu PVI, o corregiu les corbes verticals que se solapen (vegeu [Dissenya un perfil vertical](topic:profile)). |
| "El perfil de projecte no se solapa amb el traçat." | Mogueu els PVI al rang de PK del traçat. |
| "El corredor necessita almenys dues seccions a la superfície." | La major part del corredor és fora del terreny existent. |
| "4 talussos laterals surten de la superfície abans de trobar el terreny." | Prop de la vora de la superfície el talús no pot arribar al terreny. Mantingueu la carretera lluny de la vora, o baixeu l'alçada de terraplè o de desmunt en aquell punt. |
| Les línies de connexió amb el terreny del corredor es creuen (les seccions se solapen, per exemple a la cara interior d'una corba tancada). Useu un radi més gran o un muntatge més estret. | Les seccions a la cara interior d'una corba tancada se solapen. Augmenteu el radi o estreteu el muntatge. |

Un corredor amb un problema no s'explana i no compta al moviment de terres.

## Corredors i plataformes junts

La superfície projectada es construeix en ordre: primer tots els corredors, i després totes les plataformes. Quan l'explanació d'una plataforma se solapa amb un corredor, guanya la plataforma. Els volums es calculen dins de totes les línies de connexió amb el terreny alhora; vegeu [Volums de moviment de terres](topic:volumes).

## Peralt

En una corba la carretera pot inclinar-se cap a l'interior, de manera que el trànsit és empès menys cap a l'exterior. Marqueu **Aplica el peralt a les corbes** sota **Peralt** a les **Propietats** del traçat:

- Cada corba circular pren una taxa **e** de la taula de peralts: la primera fila el radi de la qual la corba assoleix (una fila amb la taxa buida manté la pendent normal de coronació). La taula i el **Pendent relatiu màxim** (0.5 % per començar) són marcadors, no una norma: definiu-los segons els vostres criteris de disseny. Afegiu o traieu files segons calgui.
- Els carrils roten al voltant de l'eix. Abans de la corba, el carril exterior s'aplana durant la **sortida** (pendent normal de coronació ÷ e × transició), i després durant la **transició** (amplada del carril × e ÷ el gradient) el carril exterior segueix girant fins que tota la carretera baixa amb e cap a l'interior; dues terceres parts de la transició es troben abans de la corba i una terça part sobre ella. Després de la corba passa el mateix però a l'inrevés.
- Un arcen del costat baix mai no és més pla que el seu carril; al costat alt manté el seu propi pendent (es gira).
- La taula que hi ha a sota enumera el radi, la taxa, la transició i la sortida de cada corba i on comença i acaba el peralt complet. El **diagrama de peralt** dibuixa els pendents transversals dels dos carrils al llarg dels PK (l'esquerre sòlid, el dret discontinu).
- Una corba massa curta per arribar al peralt complet, o dues corbes les transicions de les quals se solapen, s'indica en una caixa sobre la taula.

Les seccions, els volums, la vista 3D i els plànols mostren la carretera inclinada. Cada canvi és un pas: {{key:Mod+Z}} el desfà.

## Objectius

Un objectiu mou un punt d'un costat de la carretera fins a una línia: la **Vora del paviment** o la **Vora de l'arcen**, a l'**Esquerra** o a la **Dreta**. Cada secció troba la línia en angle recte respecte de l'eix, sortint només cap a aquell costat, de manera que un objectiu a la dreta mai no mou el costat esquerre.

| Estableix | Què passa on una secció troba la línia |
|---|---|
| **Amplada** | El punt queda sobre la línia: el carril (o l'arcen) s'eixampla o s'estreny fins a ella, mantenint el seu pendent transversal. |
| **Elevació** | El punt pren l'elevació de la línia en aquell punt, a la seva pròpia distància: el pendent transversal del carril (o de l'arcen) segueix. |

La línia pot ser una línia característica (sigui quin sigui el seu **Ús**) o una línia d'un altre corredor: el seu eix, les vores del paviment, les vores de l'arcen o les línies de connexió amb el terreny. La línia d'un corredor segueix aquell corredor: si canvieu l'altra carretera, aquesta la segueix. CivilCraft construeix primer l'altre corredor; dos corredors que es posarien objectius l'un a l'altre en bucle es rebutgen per un costat, i la taula ho indica.

1. Seleccioneu el traçat i activeu el seu corredor.
2. Sota **Objectius**, feu clic a {{ui:Afegeix un objectiu}}.
3. Trieu el **Costat**, el **Punt**, què **Estableix** i **Fins a la línia**. Cada canvi és un pas de desfer.

**Resultat** indica en quantes seccions s'ha arribat a la línia. Les seccions que no hi arriben (més enllà dels seus extrems, o on és darrere de l'eix) mantenen els valors del muntatge. Si una línia se suprimeix, el corredor queda com estava abans de l'objectiu, i la taula ho diu. Un costat pot tenir un objectiu d'amplada i un d'elevació per a cada punt.

## Construeix cada costat amb peces

Activeu **Construeix cada costat amb peces** a la configuració del corredor. Cada costat té llavors la seva pròpia llista, des de l'eix cap enfora: carrils, un arcen, una cuneta, una vorada, una franja plantada, una vorera i, al final, el talús lateral fins al terreny (amb les seves pròpies relacions de desmunt i terraplè). Comenceu amb {{ui:Carretera rural}} o {{ui:Carrer urbà}}, afegiu i traieu peces, mogueu-les amb les fletxes, i useu {{ui:Copia}} per passar un costat a l'altre. Cada canvi és un pas de desfer.

Un pendent transversal és la caiguda allunyant-se de la carretera, de manera que una vorera que desguassa cap a la carretera és negatiu. Una vorada és una cara de l'alçada que indiqueu, una part superior de l'amplada que indiqueu i una caiguda opcional a la part posterior. El peralt gira tots els carrils de la primera fila; la cuneta, la vorada, la franja i la vorera pengen de la vora dels carrils tal com estan construïts. Els objectius continuen movent l'extrem dels carrils i l'última peça. Les seccions transversals marquen la línia de desguàs de la cuneta, la part superior i posterior de la vorada, i la resta. En una corba amb espirals la transició és l'espiral: coronació nivellada al TS, peralt complet al SC.

## Capes de paviment

Un carril, un arcen, una cuneta, una franja plantada o una vorera poden portar la seva estructura de capes: sota la peça, {{ui:Afegeix una capa}} n'afegeix una amb un nom, un material, un gruix i el seu tipus (superfície, lligant, base, subbase, coronament o altre), de dalt a baix. Les capes no mouen la superfície de la carretera (la seva part superior és la superfície de projecte); cada una és sota la seva peça, i la seva profunditat es mesura en vertical cap avall. Les seccions transversals dibuixen la base de cada capa com una línia discontínua, i {{ui:Capes de paviment: quantitats}} enumera l'àrea en planta i el volum de cada capa (àrea al llarg del corredor a partir de les seves seccions, volum = àrea × gruix). L'exportació IFC escriu cada capa com el seu propi element amb el seu gruix i el seu material (vegeu [Exportació i importació IFC](topic:ifc)). El gruix que escriviu és vostre: CivilCraft no dimensiona els paviments.

## Què no es construeix encara

Els objectius per al talús de connexió amb el terreny no estan disponibles encara. Per a un corredor que canvia al llarg de la carretera, amb l'esquerra i la dreta separades, useu [Plantilles de corredor](topic:corridor-templates). Vegeu [Encara no implementat](topic:not-built-yet).
