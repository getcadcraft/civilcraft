---
title: Paviments, murs i escales
summary: Paviments amb pendents cap a un desguàs o una pendent transversal, un patró i la seva composició; camins que segueixen el terreny; murs de contenció i autoportants amb sabates escalonades; vorades; rampes i escales comprovades amb els seus límits; sortida IFC.
keywords: elements construïts, paviment, lloses, pati, terrassa, pendents, desguàs, pendent transversal, espina de peix, lligada, camí, passeig, mur de contenció, mur de jardí, sabata, coronament, vorada, vora, rampa, accessibilitat, escales, contrapetjades, petjades, replà
from: d34b4466
---

Els elements construïts es tornen a calcular a partir del terreny cada vegada, de manera que segueixen el relleu i es regeneren quan el terreny o la seva línia es mou. Arrossegueu els seus cantons al plànol com qualsevol altra línia. Obriu-lo des de {{ui:Paviments i elements construïts}} al grup Paisatgisme.

## Paviment

Cliqueu els cantons i premeu {{key:Enter}}. A les Propietats:

- **Cota**: buit = la mitjana del terreny que hi ha sota.
- **Pendents**: pla, una **pendent transversal** (un % cap a una direcció) o **cap a un desguàs**: CivilCraft us demana que cliqueu on va el desguàs, i després cada cantó puja des del desguàs amb la pendent. Les fletxes del plànol mostren les pendents.
- **Patró** (quadrícula, lligada, espina de peix) amb la mida de la unitat, la junta i l'angle; **Vora** amb l'amplada. En un plànol, les juntes més petites d'un mil·límetre s'exclouen.
- El paviment forma part de la superfície projectada. Les seves capes (lloses, llit, base) entren a l'IFC i a les quantitats.

## Camins

Cliqueu al llarg del camí i premeu {{key:Enter}}. Segueix el terreny, amb la seva **pendent transversal** cap al seu costat dret. Un camí més pronunciat que la **Pendent màxima permesa** queda marcat amb `!` al plànol on és, i les Propietats indiquen com de pronunciat es fa.

On un camí troba una carretera construïda per un corredor, s'atura a la vora exterior de la carretera, al nivell de la vorera o de l'arcen allà, a la superfície projectada i a la vista 3D. Un camí que creua una carretera es calcula i es mostra com dues peces, i un extrem dibuixat fins a dos cops l'amplada del camí més curt de la carretera es prolonga fins a la seva vora. El plànol encara mostra el camí tal com el vau dibuixar, i la seva longitud i àrea compten tota la línia. Vegeu [Crea un corredor de carretera](topic:corridor).

## Murs

Cliqueu al llarg del mur i premeu {{key:Enter}}. Un mur és **de contenció** o **autoportant**. Sense **Coronació**, s'aixeca la seva **Alçada** sobre el terreny en tota la seva llargada; escriviu una coronació per mantenir-lo nivellat. La seva **sabata** es troba a una profunditat fixa sota el terreny i baixa per passos sencers, de manera que és nivellada entre ells. Les Propietats indiquen la seva longitud, alçades, àrea de cara i passos de sabata; el plànol marca la part superior i inferior del mur (TW / BW) a cada extrem.

:::warning
Un mur de contenció més alt de 1.2 m (4 ft) queda marcat: un enginyer el dissenya.
:::

## Vorades

Cliqueu al llarg de la vorada i premeu {{key:Enter}}; definiu-ne l'amplada i l'alçada sobresortint.

## Rampes

Cliqueu des de la base fins a la part superior i premeu {{key:Enter}}. Les cotes vénen del terreny a cada extrem, tret que les escriviu. Una rampa rep un replà cada desnivell de 750 mm (2.5 ft) i es comprova amb la **Pendent màxima permesa** (1:12 per començar) i amb una amplada mínima; les Propietats indiquen quina longitud hauria de tenir.

## Escales

Cliqueu la vora frontal del primer esglaó, després on les escales arriben a dalt, i premeu {{key:Enter}}. El nombre de contrapetjades surt de l'alçada i de la **Contrapetjada més gran**; la petjada surt de la regla de confort 2R + G ≈ 630 mm, mai per sota de la **Petjada mínima**; un replà cada **Contrapetjades per tram com a màxim**. Les Propietats indiquen si hi caben entre els dos punts o quant més llargues han de ser.

:::note
Els límits per a rampes i escales són valors per defecte etiquetats. Definiu els que exigeixi el vostre codi de construcció.
:::

## Fora de CivilCraft

- Més › {{ui:Exporta IFC de paisatgisme}}: paviments i camins com a `IfcPavement`, murs com a `IfcWall` (els murs de contenció com a RETAININGWALL) amb les seves capes, vorades com a `IfcKerb`, rampes com a `IfcRamp`, i escales com a `IfcStair` amb les seves contrapetjades i petjades.
- L'**Envia a TakeoffCraft** de la taula de plantes porta les àrees de paviment i els volums de capes, les àrees de cara i les longituds dels murs, les longituds de vorada i el nombre de graons.
- El plànol de detalls dibuixa la secció de cada mur, la composició de cada paviment i cada tram d'escales. Vegeu [Plànols de paisatgisme](topic:landscape-sheets).
