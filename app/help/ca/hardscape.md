---
title: Paviments, murs i graons
summary: Paviment amb pendents cap a un desguàs o un pendent transversal, un aparell i la seva composició; camins que segueixen el terreny; murs de contenció i independents amb sabates escalonades; vores; rampes i graons comprovats amb els seus límits; exportació IFC.
keywords: paviments i elements construïts, paviment, peces de paviment, pati, terrassa, pendents, desguàs, pendent transversal, espina de peix, aparell de soga, camí, passadís, mur de contenció, mur de jardí, sabata, coronament, vora, rampa, accessibilitat, graons, escala, contrapetjades, petjades, replà
from: 51475877
---

Els paviments es tornen a calcular a partir del terreny cada cop, de manera que segueixen el relleu i es regeneren quan es mou el terreny o la seva línia. Arrossegueu-ne els cantons al pla com qualsevol línia. Obriu-lo des de {{ui:Paviments i elements construïts}} al grup Paisatgisme.

## Paviment

Feu clic als cantons i premeu {{key:Enter}}. A Propietats:

- **Cota**: buida = la cota mitjana del terreny que hi ha sota.
- **Pendents**: cota, un **pendent transversal** (un % cap a una direcció) o **cap a un desguàs**: CivilCraft us demana que feu clic on va el desguàs, i després cada cantó puja des del desguàs amb el pendent. Les fletxes del pla mostren els pendents.
- **Aparell** (quadrícula, soga, espina de peix) amb la mida de la peça, la junta i l'angle; **Amplada de la vora**. En un full, les juntes de menys d'1 mm es deixen fora.
- El paviment forma part de la superfície projectada. Les seves capes (peces, llit, base) van a l'IFC i als amidaments.

## Camins

Feu clic al llarg del camí i premeu {{key:Enter}}. Segueix el terreny, amb el seu **Pendent transversal** cap al costat dret. Un camí més dret que el **Pendent màxim permès** es marca amb `!` al pla on és, i Propietats indica com de dret arriba a ser.

## Murs

Feu clic al llarg del mur i premeu {{key:Enter}}. Un mur és **de contenció** o **independent**. Sense **Cim**, s'aixeca la seva **Alçada** sobre el terreny tot al llarg; si escriviu un cim, es manté a nivell. La seva **sabata** es troba a una profunditat fixa sota el terreny i baixa per passos sencers, de manera que és a nivell entre ells. Propietats indiquen la longitud, les alçades, l'àrea de la cara i els passos de la sabata; el pla indica el cim i la base del mur (TW / BW) a cada extrem.

:::warning
Un mur de contenció més alt d'1.2 m (4 ft) queda marcat: l'ha de dissenyar un enginyer.
:::

## Vores

Feu clic al llarg de la vora i premeu {{key:Enter}}; definiu-ne l'amplada i l'alçada sobresortint.

## Rampes

Feu clic de baix a dalt i premeu {{key:Enter}}. Les cotes surten del terreny a cada extrem, tret que les escriviu. Una rampa rep un replà cada desnivell de 750 mm (2.5 ft) i es comprova contra el **Pendent màxim permès** (1:12 com a punt de partida) i una amplada mínima; Propietats indiquen quina longitud hauria de tenir.

## Graons

Feu clic a la vora frontal del primer graó, després on els graons arriben a dalt, i premeu {{key:Enter}}. El nombre de contrapetjades surt de l'alçada i de la **Contrapetjada més gran**; la petjada surt de la regla de confort 2R + G ≈ 630 mm, sense baixar mai de la **Petjada més petita**; i hi ha un replà en cada tram de fins a **Contrapetjades per tram com a màxim**. Propietats indiquen si hi caben entre els dos punts o quant més llargs han de ser.

:::note
Els límits de rampes i graons són valors per defecte marcats. Definiu els que us exigeixi el codi d'edificació que us aplica.
:::

## Fora de CivilCraft

- {{ui:Més}} › {{ui:Exporta IFC de paisatgisme}}: paviments i camins com a `IfcPavement`, murs com a `IfcWall` (els de contenció com a RETAININGWALL) amb les seves capes, vores com a `IfcKerb`, rampes com a `IfcRamp`, i graons com a `IfcStair` amb les seves contrapetjades i petjades.
- L'**Envia a TakeoffCraft** del quadre de plantes porta les àrees de paviment i els volums de capes, les àrees de cara i les longituds dels murs, les longituds de les vores i el nombre de graons.
- El full de detalls dibuixa la secció de cada mur, la composició de cada paviment i cada tram de graons. Vegeu [Plànols de paisatgisme](topic:landscape-sheets).
