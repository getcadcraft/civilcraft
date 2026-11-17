---
title: Dissenyar un traçat horitzontal
summary: Dibuixar un traçat pels seus PI, fixar els radis de les corbes i el PK inicial, moure els PI i llegir les dades de les corbes i el PK i el desplaçament.
keywords: traçat, sense solució, la corba no encaixa, radi més gran, radi més petit, radi mínim, velocitat de projecte, solapament, eix, PI, corba horitzontal, radi, replanteig per PK, tangent, crear traçat, disposició del traçat, pc, pt, PK, desplaçament
from: 8c5df4aa
---

Un traçat a CivilCraft és una cadena de tangents entre punts d'intersecció (PI), amb una corba circular a qualsevol PI interior que tingui radi. Es referencia per PK des d'un PK inicial que trieu. Un projecte pot contenir molts traçats.

## Dibuixa el traçat

1. Premeu {{key:A}}, o feu clic a {{ui:Traçat}} al grup **Disseny**.
   La indicació diu "Traçat: feu clic als PI en ordre. Enter o doble clic acaba, Backspace elimina l'últim, Esc cancel·la."
2. Feu clic al primer PI (l'inici del traçat).
3. Feu clic a cada PI següent en ordre. Una línia vermella segueix el punter i mostra la longitud i el rumb de la tangent que dibuixeu, per exemple "212.40 ft  N 63°12'05" E".
4. Feu clic a l'últim PI (el final del traçat).
5. Premeu {{key:Enter}}.
   El traçat es dibuixa amb PK i queda seleccionat. La barra d'estat diu, per exemple, "Traçat 1: 386.36 ft, corbes de radi 100 ft on encaixin. Edita els radis a Propietats; Perfil (R) per dissenyar-ne la pendent."

Mentre dibuixeu: {{key:Backspace}} elimina l'últim PI, {{key:Esc}} cancel·la, i arrossegar per un espai buit desplaça la vista sense afegir cap PI.

:::warning
Acabeu amb {{key:Enter}}. El doble clic també acaba, però en aquesta versió elimina el PI on heu fet doble clic. Feu clic una vegada a l'últim PI i després premeu {{key:Enter}}.
:::

Cada PI interior rep una corba de 100 ft (30 m en un projecte en metres), o el radi enter més gran que hi encaixa en la meitat de cada tangent si 100 ft no hi encaixa. Els PI molt aguts o els que van en línia recta no reben corba.

## Fixa radis i coordenades

Amb el traçat seleccionat, el panell dret mostra **Traçat**:

1. **Nom** i **PK inicial**. Escriviu un PK com `10+00` (peus) o `0+500` (metres), o com un número simple. Vegeu [Unitats, PK i formats de número](topic:units-and-stations).
2. **Longitud** i **PK final** es calculen per vosaltres.
3. La taula **PI** mostra la **X (est)** i la **Y (nord)** de cada PI, i un **Radi** per a cada PI interior. Escriviu un valor nou i premeu {{key:Enter}}.
   - Un radi de 0 fa un punt d'angle sense corba.
   - El primer i l'últim PI mai no tenen radi.
   - La petita x al final d'una fila elimina aquest PI (un traçat conserva com a mínim dos).
4. Llegiu la llista **Corbes**: per a cada corba, els seus PK de PC i PT, el radi R, la deflexió Δ i el sentit (esquerra o dreta), la longitud L, la tangent T, l'externa E i la corda.
5. La línia sota les corbes dona el rumb de la primera tangent.

## Quan una corba no encaixa

Si les corbes necessiten més tangent del que hi ha entre els seus PI, el traçat no té solució: no es dibuixa bé fins que el corregiu, i queda fora de les exportacions LandXML. Un quadre vermell explica el motiu, amb números, i ofereix el que encaixaria:

- "Les corbes als PI 2 i PI 3 necessiten 240.00 ft de tangent entre elles (130.00 + 110.00), però els PI són a 180.00 ft." — o, quan només una té corba, "La corba al PI 2 necessita 240.00 ft de tangent cap al PI 1 …".
- Un botó per a cada PI fixa **el radi més gran que hi encaixa** amb l'altra corba tal com està (també ha d'encaixar amb l'altra tangent del PI). Quan les dues tenen corba, **Tots dos** redueix els dos radis en proporció perquè just es toquin.
- Quan una sola corba és més llarga que la tangent, el quadre diu que cap corba de l'altre PI no pot encaixar mentre sigui tan gran.
- Un PI que gira en rectes enrere no pot tenir corba; el quadre ofereix **Sense corba al PI n**.

Cada botó és un pas: {{key:Mod+Z}} torna a posar els radis. Els radis que s'ofereixen s'arrodoneixen a la baixa a 0.01 perquè sempre hi encaixin.

### Un radi mínim de disseny

Escriviu un **Radi mínim de disseny** (per exemple segons la velocitat de projecte) perquè cada corba se'n comprovi; deixeu-lo buit si no en voleu cap. Una corba per sota es llista amb un botó per al **radi més petit que compleix el mínim**, quan aquest radi hi encaixa. Quan no hi encaixa, el quadre ho diu i dona el radi més gran que permeten les tangents, perquè sapigueu que cal moure un PI o baixar el mínim.

## Mou els PI al plànol

1. Amb {{ui:Selecciona}} activat, feu clic al traçat per seleccionar-lo. Apareixen nanses quadrades als seus PI.
2. Arrossegueu una nansa. El traçat, el seu PK, el perfil i el corredor se n'actualitzen.
3. En alliberar, el desplaçament és un sol pas per desfer.

Afegir un PI entre dos de ja existents encara no està disponible: elimineu el traçat i torneu-lo a dibuixar, o escriviu les noves coordenades dels PI que teniu.

## Llegeix el PK i el desplaçament

Mogueu el punter sobre el plànol. La barra d'estat mostra el traçat més proper (o el seleccionat) amb el PK i el desplaçament, **L** o **R** mirant cap al PK creixent, per exemple "Traçat 1: PK 2+15.30, desplaçament 18.42 R". Més enllà de qualsevol dels extrems hi afegeix "(més enllà del final)".

## Què es dibuixa

Al plànol, en DXF i en PDF: l'eix (les tangents com a línies, les corbes com a arcs reals), una marca cada 50 ft (20 m) amb una marca més llarga i una etiqueta de PK cada 100 unitats, i les marques de PC i PT etiquetades amb els seus PK.

## Elimina un traçat

Seleccioneu-lo i premeu {{key:Delete}}, o feu clic a {{ui:Elimina}} a la barra d'eines o a la part inferior del panell dret. El seu perfil i el seu corredor se n'aniran amb ell. {{key:Mod+Z}} el recupera.

:::mac
A un teclat de Mac, la tecla marcada **delete** és {{key:Backspace}} al navegador i no elimina una selecció. Premeu {{key:Delete}} (Fn i delete), o useu el botó {{ui:Elimina}}.
:::

## Següent

- [Dissenyar un perfil vertical](topic:profile).
## Velocitat de projecte i classe

A les propietats del traçat, la **Velocitat de projecte** (km/h o mph) i la **Classe de projecte** es guarden amb el traçat, es desen al projecte i s'escriuen a IFC (Pset_RoadDesignCriteriaCommon). CivilCraft no té cap taula que lligui una velocitat amb un radi mínim, de manera que no es comprova res a partir d'elles: fixeu el **Radi mínim** segons la vostra pròpia norma de disseny.

## Espirals

Una corba pot tenir una espiral clotoide a cada extrem: tangent, espiral, corba, espiral, tangent. A la taula de PI, escriviu una longitud a **Espiral d'entrada** i **Espiral de sortida** per a un PI que tingui radi. El PI es queda on és; la corba s'acosta per fer lloc, de manera que la distància de tangent creix amb el desplaçament de l'espiral. Les dues longituds poden ser diferents, i un PI amb una sola longitud rep una espiral només en aquest extrem.

La llista de corbes mostra llavors TS, SC, CS i ST (tangent a espiral, espiral a corba, corba a espiral, espiral a tangent) amb l'angle de l'espiral θs, les distàncies de tangent i la distància externa. Els PK avancen per les espirals com a tot arreu. Les espirals que junts giren més que la corba es rebutgen amb el PI indicat; una espiral més llarga del que permet la tangent és un solapament, com per a qualsevol corba. El peralt utilitza l'espiral com a zona de transició (vegeu [Corredor](topic:corridor)).
