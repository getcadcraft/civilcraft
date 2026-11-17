---
title: Línies característiques
summary: Dibuixeu línies 3D que pendentegeu vèrtex per vèrtex, en feu desfasaments escalonats i useu-les com a línies de ruptura del terreny o com a plataformes inclinades en el projecte.
keywords: arc, corba, radi, arc 3D, hèlix, vorada corbada, superposició de pendent, superposició d'elevació, fletxes de pendent, línia característica, pendent, elevació, desfasament escalonat, desfasament, línia de ruptura, vorada, cuneta, banqueta, plataforma inclinada, talús, polilínia 3D
from: d55b25fb
---

Una línia característica és una línia amb una elevació a cada vèrtex: una vorada, la línia de flux d'una cuneta, la coronació d'una banqueta, la vora d'una plataforma inclinada. Hi poseu les elevacions amb un número o per pendent, la copieu lateralment amb un graó cap amunt o avall, i trieu què fan les superfícies amb ella.

## Dibuixeu-ne una

1. Trieu **Superfície** › {{ui:Més}} › {{ui:Línia característica}}, o premeu {{key:L}}.
2. Feu clic als seus vèrtexs al plànol. Un clic sobre un punt topogràfic pren el lloc i l'elevació del punt; en qualsevol altre lloc, el vèrtex pren l'elevació del terreny existent en aquell punt.
3. Premeu {{key:Enter}} per acabar una línia oberta, o feu clic de nou al primer vèrtex per tancar-la.

La nova línia es selecciona i comença com una línia de ruptura del terreny existent, situada sobre el terreny.

## Arcs

Un segment pot ser un arc en planta els extrems del qual estan a elevacions diferents: un retorn de vorada, una cuneta corbada, una rampa que gira. El seu pendent corre de manera uniforme al llarg de l'arc, i la seva longitud es mesura al llarg de la corba.

- **Mentre dibuixeu:** premeu {{key:C}} (en una pantalla tàctil, {{ui:Arc}} a la barra sobre el plànol) per activar els arcs. Després d'un vèrtex, feu clic en un punt de la corba i després on acaba l'arc. Premeu {{key:C}} de nou per als segments rectes. {{key:Backspace}} elimina primer el punt de la corba.
- **Després:** a **Propietats**, escriviu un radi i el sentit del gir a la casella **Arc** del vèrtex, per exemple `50 L` o `50 R` (esquerra o dreta segons camineu per la línia), i premeu {{key:Enter}}. Buideu la casella per tornar el segment recte. Es rebutja un radi més petit que la meitat del segment.

La línia seleccionada mostra el radi de cada arc al costat del seu pendent. La **Longitud** és al llarg dels arcs en planta; la **Longitud 3D** compta també la pujada i la baixada. Els desfasaments escalonats conserven els arcs: un arc a l'exterior d'una corba creix, un a l'interior es redueix, i es rebutja un desfasament que passi del centre d'un arc.

Les superfícies, la vista 3D, el DXF i el DWG prenen cada arc com a trossos rectes curts que es mantenen dins de 0.01 de la corba. El LandXML els conserva com a arcs (vegeu **Arcs en altres fitxers** més avall).

## Definiu elevacions i pendents

**Propietats** llista els vèrtexs amb la seva distància al llarg de la línia, la seva **Cota** i el **Pendent fins al següent** (en percentatge). Escriviu-ne qualsevol i premeu {{key:Enter}}:

- Una cota només mou aquell vèrtex.
- Un pendent fixa l'elevació a l'extrem llunyà del seu segment; els vèrtexs següents es queden on són, de manera que el pendent del segment següent canvia.

També a **Propietats**:

| Acció | Què fa |
|---|---|
| **Puja o baixa tot en** | Afegeix l'altura que escriviu a cada vèrtex. |
| {{ui:Cotes del terreny}} | Torna a posar cada vèrtex sobre el terreny existent (els vèrtexs fora de la superfície mantenen les seves, i se'n fa llista). |
| {{ui:Un sol pendent, del primer a l'últim}} | Manté la primera i l'última elevació i posa els vèrtexs del mig en un pendent uniforme. |

La línia seleccionada mostra les seves cotes als vèrtexs i els seus pendents al llarg dels segments al plànol. Arrossegueu un vèrtex amb {{ui:Selecciona}} per moure'l; la seva cota es manté.

## Desfasaments escalonats

Sota **Desfasament escalonat**, escriviu una **Distància** (positiva a la dreta de la direcció de la línia, negativa a l'esquerra), després una altura (amunt o avall en) o un pendent en percentatge, i feu clic a {{ui:Crea la línia desfasada}}. La còpia és una nova línia característica: per exemple, el darrere d'una vorada a 0.5 ft al costat i 0.5 ft més alta, o una vora de cuneta a 6 ft cap a fora amb un 2 %. Es rebutja una distància que faria que la còpia es doblegués sobre ella mateixa en un revolt tancat.

## Pendents i elevacions a la pantalla

Premeu {{key:E}}, o marqueu **Pendents i elevacions de les línies característiques** a **Visualització**, per veure el pendent de cada línia característica al llarg de cada segment (amb una petita fletxa que apunta cap avall) i la seva elevació als vèrtexs. Es mostren només a la pantalla: no s'afegeix res al dibuix, i el PDF, el DXF i el DWG es mantenen igual. Els segments curts i els vèrtexs amuntegats no tenen etiqueta fins que feu zoom. La línia seleccionada sempre mostra els seus propis pendents i elevacions.

## A la vista de perfil

Una línia característica que creua un eix d'alineació es mostra a la vista de perfil d'aquell eix, amb el seu nom i la seva elevació al creuament; les línies que hi van al costat també es poden mostrar. Vegeu [Dissenyeu un perfil vertical](topic:profile).

## Què fan les superfícies amb la línia

Trieu **Ús**:

| Ús | Què passa |
|---|---|
| Línia de ruptura del terreny existent | El terreny existent passa per la línia a les seves elevacions, com una línia de ruptura dibuixada. |
| Explanada al projecte | Una línia **tancada** es converteix en una plataforma inclinada: la superfície projectada que hi ha dins s'explana fins a la seva vora. Activeu **Talussos fins al terreny** per fer córrer talussos de desmunt i de terraplè (horitzontal a 1 vertical) des de la seva vora fins al terreny, com ho fa una plataforma; cada talús comença a l'elevació pròpia de la vora en aquell punt. |
| Només dibuixada | Es queda al plànol i surt en el DXF, el DWG i el PDF (capa C-GRAD-FEAT, polilínies 3D), però les superfícies l'ignoren. |

Els volums, les seccions i la vista 3D inclouen les línies característiques explanades al projecte, com les plataformes. Cada canvi és un sol pas: {{key:Mod+Z}} el desfà.

## Compartiu línies amb el vostre equip

En un dibuix obert des dels vostres fitxers al núvol a CadCraft Studio, en un pla d'equip, les **Propietats** del projecte (sense res seleccionat) tenen una secció **Equip** amb {{ui:Línies de l'equip…}}: les línies que el vostre equip ha compartit, cadascuna amb la seva revisió, sense haver de seleccionar primer una línia característica. Seleccioneu una línia per compartir-la, pugeu una revisió nova, baixeu la de l'equip o deixeu de compartir-la. Fora d'aquesta configuració, la secció indica què necessita.

## Arcs en altres fitxers

| Fitxer | Què passa amb una línia característica amb arcs |
|---|---|
| Projecte de CivilCraft | Es manté exactament. |
| LandXML | S'escriu com a element de planta amb línies i arcs amb les seves elevacions, i es llegeix de nou amb els seus arcs. Una línia característica d'un altre programa arriba com a **Només dibuixada**: trieu el seu **Ús** per posar-la en una superfície. |
| DWG i DXF | Una polilínia 3D no pot contenir un arc, de manera que la línia s'escriu com a trossos curts dins de 0.01 de cada arc. CivilCraft també anota al dibuix quins trossos eren arcs: quan obriu el dibuix com a línies, {{ui:Línies característiques}} torna a portar les línies com a línies característiques amb els seus arcs. Els altres programes veuen una polilínia 3D normal. |
