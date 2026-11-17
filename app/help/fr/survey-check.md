---
title: Contrôler un plan de levé à l'import
summary: Lisez les altitudes écrites en texte ou dans les attributs de bloc comme points topographiques, et contrôlez un DWG ou un DXF (unités incorrectes, pas de système de coordonnées, origine lointaine, courbes plates, altitudes aberrantes, points en double) avant de construire un terrain à partir de lui.
keywords: contrôle du levé, contrôle à l'import, altitudes du levé, altitudes ponctuelles, altitudes en texte, attributs, unités, système de coordonnées, loin de l'origine, courbes à zéro, valeurs aberrantes, points en double, problèmes, architecte paysagiste, plan de levé
from: d46acd24
---

Un plan de levé peut paraître juste et pourtant être faux pour un terrain : ses unités peuvent être devinées, ses courbes peuvent être plates à l'altitude 0, ou ses altitudes peuvent être écrites en texte qui n'est pas du tout de la géométrie. La section **Altitudes du levé et contrôle** de la boîte de dialogue {{ui:Linéaires}} (voir [Ouvrir un DWG ou un DXF en linéaires](topic:open-dwg-dxf)) lit ces altitudes et vous signale ce qui semble faux avant que quoi que ce soit ne soit ajouté.

## Altitudes écrites en texte ou en attributs

Beaucoup de plans de levé donnent une altitude ponctuelle sous forme de petit texte à côté d'une croix, comme `104.37` ou `EL 104.37`, ou en attribut d'un point de bloc. Ce ne sont pas des lignes, donc le lecteur de linéaires les laisse de côté. La section indique combien il en a trouvé et vous permet de les prendre comme **points topographiques** :

1. Cochez **Prendre … altitudes comme points topographiques**. Elles sont décochées au départ, car tous les nombres d'un plan ne sont pas des hauteurs.
2. Le texte est lu lorsqu'il s'agit d'une altitude isolée : un nombre avec une partie décimale (`104.37`, `+104,37`, `-3.50`), ou un nombre après `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` ou `LEVEL`, suivi au besoin de `m`, `ft` ou `'`. Un nombre entier seul (`12`) est lu comme un numéro de lot ou de feuille, non comme une altitude ; un texte comme `GATE 3` ou une date n'est jamais lu. Les codes de mise en forme du texte sont ignorés.
3. Pour les attributs de bloc, choisissez **Attribut de bloc qui contient l'altitude**. CivilCraft trouve tout seul une balise nommée ELEV, Z, LEVEL, RL ou similaire ; choisissez-en une autre dans la liste si le plan utilise la sienne. Le choix est mémorisé pour ce nom de fichier sur cet ordinateur, donc le rouvrir repart sur la même balise. Une balise que vous choisissez accepte aussi les nombres entiers comme altitudes.
4. Cliquez sur {{ui:Ajouter}}. Les points sont numérotés à la suite du numéro le plus élevé du projet, chaque point est décrit avec son calque (ou son bloc), et les hauteurs sont converties dans les unités du projet comme le reste du dessin. Le tout est une seule étape : {{key:Mod+Z}} retire les points.

Le texte est placé à son propre point d'insertion (ou à son point d'alignement s'il en a un). Le texte à l'intérieur des blocs n'est pas lu, et le plan n'est jamais modifié.

## Le contrôle

Le contrôle porte sur ce que vous allez importer et liste ce qu'il trouve, une ligne par type de problème :

| Il indique | Ce que cela signifie |
|---|---|
| **Unités non indiquées** | Le plan ne précise pas ses unités ; ses nombres sont donc lus dans les unités du projet. Vérifiez une distance que vous connaissez. |
| **Unités converties** | Les unités du plan diffèrent de celles du projet et sont mises à l'échelle (une remarque, non une faute). |
| **Les données s'étendent sur … km** ou **… m** | L'étendue dépasse 200 km ou est inférieure à un demi-mètre, ce qui indique généralement une mauvaise unité (millimètres lus comme des mètres, ou l'inverse). |
| **Aucun système de coordonnées** | Le projet n'en a pas. C'est un avertissement quand les données sont loin de zéro, comme des coordonnées en projection nationale. Voir [Systèmes de coordonnées](topic:coordinate-systems). |
| **Loin de l'origine** | Les données se trouvent à plus de 100 km de zéro. Loin de zéro, les vues 3D et les exports perdent en précision et tremblent. |
| **La couche de courbes … n'a pas d'altitude** | Un calque au nom de courbes (TOPO, CONT, CNTR, CONTOUR) contient des lignes à l'altitude 0, donc un terrain construit à partir d'elles serait plat. |
| **Altitudes égales à 0** | Certaines altitudes valent 0 alors que l'altitude habituelle en est loin : probablement des hauteurs manquantes. |
| **Altitudes très éloignées des autres** | Quelques altitudes se trouvent très en dehors des autres (calculé par rapport au milieu de toutes les altitudes, donc un site en forte pente sur une grande plage n'est pas signalé), ou au-dessus de 9,000 m ou en dessous de -11,000 m. |
| **Points superposés à un autre point** | Deux points au même endroit avec la même altitude, ou avec des altitudes différentes. |

Après un clic sur {{ui:Ajouter}}, les mêmes lignes passent dans **Problèmes**, une par type, avec le nom du fichier, pour que vous puissiez y revenir. Le contrôle juge le plan ; il ne le modifie pas et ne vous empêche pas de l'utiliser.

:::tip
Quand le contrôle signale des courbes plates à 0 et des altitudes écrites en texte, prenez les altitudes comme points topographiques : elles portent souvent les vraies hauteurs qui manquent aux courbes.
:::

## Ce qui n'est pas contrôlé

Le contrôle ne compare pas le plan à un second levé, et il ne peut pas dire dans quel système de coordonnées est le plan : il indique seulement qu'aucun n'est défini.
