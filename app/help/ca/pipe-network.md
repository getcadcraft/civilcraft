---
title: Traça una xarxa de canonades per gravetat
summary: Dibuixeu trams de canonades pluvials o residuals estructura per estructura, definiu les regles de pendent, recobriment i caiguda, deixeu que CivilCraft fixi les cotes de solera, i corregiu els problemes que enumera.
keywords: constructor d'estructures, tipus d'estructura, estructura rectangular, pou de registre, marc, recobriment, gruix de paret, element de biblioteca, xarxa de canonades, pluvial, residual, clavegueram, estructures, pous de registre, embornals, cotes de solera, recobriment, pendent, caiguda, brocal, pou de decantació, canonades per gravetat
from: 10a3c14d
---

Un projecte conté una xarxa de canonades per gravetat, pluvial o residual. Es compon d'estructures (pous de registre, embornals) i de canonades rectes entre elles. El flux va en la direcció en què les dibuixeu. CivilCraft comprova cada canonada i cada estructura amb tres regles que definiu, i pot fixar totes les cotes de solera a partir d'aquestes regles.

## Dibuixa un tram

Podeu dibuixar canonades sense superfície, però els brocals, el recobriment i les cotes de solera automàtiques en necessiten una.

1. Premeu {{key:P}}, o feu clic a {{ui:Canonades}} al grup **Disseny**.
   La indicació diu "Canonades: feu clic a les estructures des de la part alta del tram cap avall (feu clic a una d'existent per unir-s'hi). Enter n'acaba."
2. Feu clic on va l'estructura aigües amunt. S'hi col·loca una estructura.
3. Feu clic a cada estructura següent aigües avall. Per connectar-vos a una estructura que ja existeix, feu-hi clic: la barra d'estat diu "S'ha unit S3."
4. Premeu {{key:Enter}}. Les canonades es dibuixen, les seves cotes de solera es fixen segons les regles, i la barra d'estat diu, per exemple, "3 canonades dibuixades, 12 cotes de solera fixades segons les regles; totes les comprovacions superades."

Les noves estructures es diuen S1, S2 … amb un diàmetre de 48 in (1200 mm). Les noves canonades es diuen P1, P2 … amb un diàmetre de 12 in (300 mm). Els diàmetres són en polzades en un projecte en peus i en mil·límetres en un projecte en metres.

Acabeu amb {{key:Enter}}. El doble clic també funciona, però quan feu doble clic sobre una estructura existent per acabar el tram allà, la unió es descarta: feu-hi clic una vegada, i després premeu {{key:Enter}}.

## Definiu les regles

Sense res seleccionat, el panell de la dreta (**Projecte**) té un bloc **Xarxa de canonades**:

| Paràmetre | Valor inicial | Significat |
|---|---|---|
| Tipus | Pluvial | {{ui:Pluvial}} o {{ui:Residual}}; s'escriu a LandXML |
| Pendent mínim | 0.50% | Cada canonada ha de caure almenys aquest valor |
| Recobriment mínim | 2 ft (0.6 m) | Del terreny a la clau de la canonada, al llarg de tota la canonada |
| Caiguda a les estructures | 0.10 ft (0.03 m) | La cota de solera de sortida ha d'estar almenys aquesta distància per sota de cada cota de solera d'entrada |

**Aquests valors inicials són marcadors de posició, no una norma.** Definiu els valors que exigeix la vostra agència o projecte. El recobriment es mesura del terreny a la clau (cota de solera més diàmetre interior); el gruix de paret no es compta. Quan es graden plataformes o corredors, la superfície explanada és el terreny.

## Deixeu que CivilCraft fixi les cotes de solera

- {{ui:Estableix totes les cotes de solera segons les regles}} (al bloc **Xarxa de canonades**) fixa totes les canonades.
- {{ui:Estableix-ne les cotes de solera segons les regles}} (amb una canonada seleccionada) fixa només aquella canonada.

Treballant aigües avall, cada tram comença amb almenys el recobriment mínim a la seva estructura superior, cau almenys el pendent mínim, baixa almenys la caiguda a través de cada estructura, i s'enfonsa més on el terreny al llarg de la canonada deixaria menys recobriment que el mínim. Les cotes de solera s'arrodoneixen per defecte a 0.01, mai cap amunt. La barra d'estat diu "Cotes de solera fixades: recobriment mínim a la part alta de cada tram, almenys el pendent mínim, almenys la caiguda a cada estructura." o indica què no ha pogut fer.

## Edita estructures i canonades

Feu clic a una estructura o canonada amb {{ui:Selecciona}} per veure-la al panell de la dreta.

**Estructura**: **Nom**, **Brocal**, **Profunditat del pou de decantació**, **Diàmetre**, després **Brocal usat**, **Pou de decantació**, **Est** i **Nord**, i les canonades d'entrada i de sortida amb les seves cotes de solera.

- Deixeu **Brocal** buit per prendre'l de la superfície; la casella mostra aleshores el valor de la superfície en gris. Escriviu un valor per fixar el brocal.
- Arrossegueu la nansa de l'estructura al plànol per moure-la. Les seves canonades la segueixen; les seves cotes de solera es mantenen com eren, de manera que caldrà comprovar els problemes després.

**Tipus**: trieu un dels tipus d'estructura de la xarxa (a continuació), o cap per a una estructura rodona del seu propi diàmetre.

**Canonada**: **Nom**, les estructures entre les quals va, **Diàmetre**, **Cota de solera superior**, **Cota de solera inferior**, després **Longitud**, **Pendent** i **Recobriment mínim**.

Premeu {{key:Enter}} després de cada valor.

## Llegiu i corregiu els problemes

El bloc **Xarxa de canonades** enumera cada problema (fins a 40); feu clic a un per seleccionar la canonada o l'estructura. Una canonada o estructura seleccionada en llista els seus propis. Sense res seleccionat, diu "Totes les canonades i estructures compleixen les regles."

| Missatge (exemples) | Què fer |
|---|---|
| "P2 va amunt (-0.40%)." o "… és pla …" | Intercanvieu les cotes de solera, o fixeu-les segons les regles. |
| "P2 al 0.30% és més pla que el mínim 0.50%." | Baixeu la cota de solera aigües avall o pugeu l'aigües amunt. |
| "P3 té 1.40 de recobriment al llarg de 35, menys que el mínim 2." | Baixeu la canonada; fixeu-ne les cotes de solera segons les regles. |
| "A S3, P4 surt a 245.20, menys que 0.1 per sota de P3 que entra a 245.25." | Baixeu la cota de solera superior de la canonada de sortida. |
| "La clau de P1 és per sobre del brocal de S1." | La canonada és massa alta per a l'estructura. |
| "S2 té 2 canonades que en surten; una xarxa per gravetat hauria de tenir una sortida de cada estructura." | Elimineu una canonada de sortida, o torneu-la a dibuixar en la direcció correcta. |
| "Les canonades formen un bucle; el flux ha d'acabar en una sortida." | Un tram s'ha dibuixat tornant sobre si mateix; suprimiu una canonada. |
| "S5 és fora de la superfície i no té cota de brocal." | Escriviu un brocal, o mogueu l'estructura sobre la superfície. |
| "P6 va en part fora de la superfície; el recobriment allà és desconegut." | Amplieu la superfície, o accepteu que el recobriment no es comprova allà. |
| "P7 encara no té cotes de solera." | Escriviu-les, o fixeu-les segons les regles. |

Les canonades i estructures amb problemes també es marquen en vermell al plànol.

## Tipus d'estructura

Un tipus d'estructura és una estructura construïda a partir dels seus paràmetres: un pou de registre, un embornal, una caixa de connexió o una sortida, **rodona** (diàmetre interior) o **rectangular** (amplada i llargada interiors), amb el seu **gruix de paret**, la **llosa de sòl**, un **pou de decantació** sota la canonada més baixa i un **marc i tapa** (obertura rodona o rectangular, alçada del marc). Els tipus pertanyen a la xarxa, sota **Tipus d'estructura** a les Propietats del projecte.

1. Feu clic a {{ui:Nou tipus d'estructura}}. El diàleg dibuixa l'estructura en planta i en secció mentre escriviu.
2. Feu clic a {{ui:Afegeix el tipus}}.
3. Seleccioneu una estructura i trieu el tipus a **Tipus**. Pren la mida i el pou de decantació del tipus; el seu propi pou encara es pot canviar.

Editeu un tipus i totes les estructures d'aquell tipus segueixen les seves mides. Si suprimiu un tipus, les seves estructures es queden com a estructures rodones de la mateixa amplada. Cada canvi és un pas: {{key:Mod+Z}} el desfà.

Una estructura rectangular es dibuixa al plànol, en DXF, DWG i PDF, i en 3D com un rectangle amb la seva llargada al llarg de la canonada de sortida; les canonades comencen a la seva paret. LandXML l'escriu com una estructura rectangular (`RectStruct`) amb el seu gruix de paret, i en llegeix aquestes estructures com a tipus.

### Comparteix un tipus a través de la biblioteca

{{ui:Desa com a element de biblioteca}} escriu el tipus com a element de biblioteca de CadCraft (un fitxer `.json`): el seu símbol de planta, un cos 3D fins a una profunditat típica, i totes les mides. Pugeu-lo a la biblioteca per compartir-lo. {{ui:Obre un element de la biblioteca}} llegeix una estructura desada així de nou a la xarxa, convertida a les unitats del projecte. Els elements de biblioteca que no són estructures fetes a CivilCraft es rebutgen, amb el motiu.

## Suprimeix

Seleccioneu una canonada i premeu {{key:Delete}} per eliminar-la. Suprimir una estructura elimina també les canonades connectades a ella. En un Mac, premeu Fn i suprimeix, o feu clic a {{ui:Suprimeix}}.

## Encara no implementat

Els cabals, les mides de canonada i la línia de gradient hidràulic són a [Drenatge pluvial](topic:storm-drainage). Els catàlegs de canonades, les canonades no circulars, les canonades a la vista de perfil, les canonades corbades i més d'una xarxa per projecte no estan disponibles encara. Vegeu [Encara no implementat](topic:not-built-yet).
