---
title: Balayer un corridor routier
summary: Activer un corridor pour un tracé en plan, régler les valeurs de voie, d'accotement et de talus, et lire les profils en travers, les lignes de raccordement et les terrassements qu'il produit.
keywords: dévers, super, relèvement, transition de dévers, longueur de sortie, table des taux, pente transversale, rotation, corridor, profil type, sous-profil, route, voie, accotement, talus, raccordement au terrain, déblai, remblai, profils en travers, cible, cibles, cible de largeur, cible d'altitude, cible de décalage, élargissement, bord de chaussée, suivre un autre corridor
from: 91303189
---

Un corridor balaie un profil type simple le long d'un tracé en plan et de son profil en long de projet, le raccorde au terrain existant et ajoute le résultat à la surface projetée. Un tracé peut porter plusieurs corridors sur des plages de PK différentes, et un corridor peut être construit à partir de gabarits réutilisables par PK ([Gabarits de corridor](topic:corridor-templates)). Le profil type simple ci-dessous est identique des deux côtés ; pour donner à chaque côté ses propres éléments, voir [Construire chaque côté à partir d'éléments](topic:corridor#build-each-side-from-parts).

## Le profil type

Depuis le plan d'axe vers l'extérieur, de chaque côté :

1. une **voie** d'une largeur donnée, descendant depuis le bombement à la **pente de voie**
2. un **accotement** d'une largeur donnée à la **pente d'accotement**
3. un **talus** depuis le bord de l'accotement jusqu'à la rencontre avec le terrain : la **pente de déblai** là où le terrain est au-dessus, la **pente de remblai** là où il est en dessous

Les valeurs de départ sont des valeurs provisoires, et non une norme de conception :

| Valeur | Pieds US | Mètres |
|---|---|---|
| Largeur de voie | 12 ft | 3.6 m |
| Pente de voie | 2% | 2% |
| Largeur d'accotement | 4 ft | 1.2 m |
| Pente d'accotement | 4% | 4% |
| Pente de déblai | 2 : 1 | 2 : 1 |
| Pente de remblai | 3 : 1 | 3 : 1 |
| Profil en travers tous les | 10 ft | 5 m |

Les pentes de talus sont horizontales sur verticales (H:V) : 3 : 1 signifie 3 en travers pour 1 en profondeur.

## Construire le corridor

Il faut un tracé sans erreur et un profil en long de projet comportant au moins deux PVI, sans erreur.

1. Sélectionnez le tracé.
2. Dans le panneau de droite, sous **Corridor**, cochez **Balayer un profil type le long du profil en long de projet**.
   Les champs apparaissent et le corridor est construit aussitôt. Le plan montre les bords de voie et d'accotement et les lignes de raccordement ; avec {{ui:Projet (terrassé)}} choisi sous **Affichage**, les courbes montrent le nouveau terrain.
3. Modifiez une valeur : **Largeur de voie**, **Pente de voie**, **Largeur d'accotement**, **Pente d'accotement**, **Pente de déblai**, **Pente de remblai**, **Profil en travers tous les**. Appuyez sur {{key:Enter}} après chaque saisie. Les pentes de déblai et de remblai et l'espacement des profils doivent être supérieurs à 0.
4. Lisez la ligne sous les champs, par exemple « 39 profils de 0+00.00 à 3+86.36 ; déblai 240.2 cu yd, remblai 556.0 cu yd. »

Les profils sont coupés à chaque pas de **Profil en travers tous les**, aux extrémités, et au début et à la fin de chaque courbe horizontale et verticale. Chaque profil, ainsi que les lignes qui le traversent (axe, bords de voie et d'accotement, raccordement au terrain), devient une ligne de rupture de la surface projetée.

Pour désactiver le corridor, décochez la case. Ses valeurs sont conservées pour la prochaine fois.

## Lorsqu'il ne se construit pas

Une case rouge sous les champs indique la raison :

| Message | Que faire |
|---|---|
| « Le corridor a besoin d'un profil en long de projet sans erreur. » | Ajoutez des PVI, ou corrigez les courbes verticales qui se chevauchent (voir [Concevoir un profil en long](topic:profile)). |
| « Le profil en long de projet ne recouvre pas le tracé. » | Déplacez les PVI dans la plage de PK du tracé. |
| « Le corridor a besoin d'au moins deux profils sur la surface. » | La plus grande partie du corridor est hors du terrain existant. |
| « 4 talus sortent de la surface avant de rencontrer le terrain. » | Près du bord de la surface, le talus ne peut pas atteindre le terrain. Éloignez la route du bord, ou abaissez à cet endroit la hauteur de remblai ou de déblai. |
| « Les lignes de raccordement du corridor se croisent (des profils se chevauchent, par exemple à l'intérieur d'une courbe serrée). Utilisez un rayon plus grand ou un profil type plus étroit. » | Les profils à l'intérieur d'une courbe prononcée se chevauchent. Augmentez le rayon ou rétrécissez le profil type. |

Un corridor présentant un problème n'est pas intégré au terrain et ne compte pas dans les terrassements.

## Corridors et plateformes ensemble

La surface projetée est construite dans l'ordre : d'abord chaque corridor, puis chaque plateforme. Là où le terrassement d'une plateforme recouvre un corridor, la plateforme l'emporte. Les volumes sont calculés à l'intérieur de l'ensemble des lignes de raccordement ; voir [Volumes de terrassement](topic:volumes).

## Dévers

Dans une courbe, la route peut s'incliner vers l'intérieur, de sorte que la circulation est moins poussée vers l'extérieur. Cochez **Dévers des courbes** sous **Dévers** dans les **Propriétés** du tracé :

- Chaque courbe circulaire reçoit un taux **e** de la table des taux : la première ligne dont le rayon est atteint par la courbe (une ligne sans taux conserve le bombement normal). La table et la **Pente relative maximale** (0.5 % pour commencer) sont provisoires, et non une norme : fixez-les d'après vos propres critères de conception. Ajoutez ou retirez des lignes selon vos besoins.
- Les voies tournent autour de l'axe. Avant la courbe, la voie extérieure s'aplatit sur la **longueur de sortie** (bombement normal ÷ e × transition), puis sur la **transition** (largeur de voie × e ÷ la pente relative) la voie extérieure continue de tourner jusqu'à ce que toute la route penche à e vers l'intérieur ; deux tiers de la transition se trouvent avant la courbe et un tiers dans la courbe. Après la courbe, le même phénomène se produit à l'envers.
- Un accotement du côté bas n'est jamais plus plat que sa voie ; du côté haut, il conserve sa propre pente (il roule).
- Le tableau situé dessous liste le rayon, le taux, la transition et la sortie de chaque courbe, ainsi que les emplacements où le dévers complet commence et finit. Le **diagramme de dévers** trace les pentes transversales des deux voies le long des PK (voie gauche en trait plein, voie droite en tirets).
- Une courbe trop courte pour atteindre le dévers complet, ou deux courbes dont les transitions se chevauchent, est signalée dans une case au-dessus du tableau.

Les profils, les volumes, la vue 3D et les feuilles montrent la route inclinée. Chaque modification est une étape : {{key:Mod+Z}} l'annule.

## Cibles

Une cible déplace un point d'un côté de la route vers une ligne : le **bord de chaussée** ou le **bord d'accotement**, à **gauche** ou à **droite**. Chaque profil rencontre la ligne d'équerre à l'axe, en allant vers l'extérieur de ce seul côté ; une cible à droite ne déplace donc jamais le côté gauche.

| Définit | Ce qui se passe là où un profil rencontre la ligne |
|---|---|
| **Largeur** | Le point se place sur la ligne : la voie (ou l'accotement) s'élargit ou se rétrécit jusqu'à elle, en conservant sa pente transversale. |
| **Altitude** | Le point prend l'altitude de la ligne à cet endroit, à son propre décalage : la pente transversale de la voie (ou de l'accotement) s'ajuste. |

La ligne peut être une ligne caractéristique (quel que soit son **Usage**) ou une ligne d'un autre corridor : son axe, ses bords de chaussée, ses bords d'accotement ou ses lignes de raccordement. La ligne d'un corridor suit ce corridor : si vous modifiez l'autre route, celle-ci suit. CivilCraft construit d'abord l'autre corridor ; deux corridors qui se ciblaient mutuellement en boucle sont refusés d'un côté, et le tableau indique lequel.

1. Sélectionnez le tracé et activez son corridor.
2. Sous **Cibles**, cliquez sur {{ui:Ajouter une cible}}.
3. Choisissez le **Côté**, le **Point**, ce qu'il **Définit** et **La ligne**. Chaque modification est une étape d'annulation.

**Résultat** indique à combien de profils la ligne a été atteinte. Les profils qui ne l'atteignent pas (au-delà de ses extrémités, ou là où elle se trouve derrière l'axe) conservent les valeurs du profil type. Une ligne supprimée laisse le corridor tel qu'il était avant la cible, et le tableau l'indique. Un côté peut avoir une cible de largeur et une cible d'altitude pour chaque point.

## Construire chaque côté à partir d'éléments

Activez **Construire chaque côté à partir d'éléments** dans les réglages du corridor. Chaque côté dispose alors de sa propre liste, du plan d'axe vers l'extérieur : voies, accotement, caniveau, bordure, bande plantée, trottoir et, en dernier, le talus jusqu'au terrain (avec ses propres rapports de déblai et de remblai). Partez de {{ui:Route rurale}} ou de {{ui:Rue urbaine}}, ajoutez et retirez des éléments, déplacez-les avec les flèches, et {{ui:Copier}} un côté vers l'autre. Chaque modification est une étape d'annulation.

Une pente transversale est la pente qui s'éloigne de la route : un trottoir qui s'écoule vers la route est donc négatif. Une bordure est une face de la hauteur indiquée, un dessus de la largeur indiquée et un retrait facultatif à l'arrière. Le dévers s'applique à toutes les voies de la première rangée ; le caniveau, la bordure, la bande et le trottoir se raccordent au bord des voies telles que construites. Les cibles continuent de déplacer l'extrémité des voies et le dernier élément. Les profils en travers marquent la ligne d'eau du caniveau, le dessus et l'arrière de la bordure, et le reste. Dans une courbe avec des clothoïdes, la transition est la clothoïde : bombement nul au TS, dévers complet au SC.

## Couches de chaussée

Une voie, un accotement, un caniveau, une bande plantée ou un trottoir peut porter sa structure : sous l'élément, {{ui:Ajouter une couche}} ajoute une couche avec un nom, un matériau, une épaisseur et son type (surface, liaison, fondation, sous-fondation, couche de forme ou autre), de haut en bas. Les couches ne déplacent pas la surface de la route (son dessus est la surface projetée) ; chacune se trouve sous son élément, sa profondeur étant mesurée verticalement. Les profils en travers tracent le bas de chaque couche en pointillés, et {{ui:Couches de chaussée : quantités}} liste la surface en plan et le volume de chaque couche (surface le long du corridor à partir de ses profils, volume = surface × épaisseur). L'export IFC écrit chaque couche comme un élément distinct avec son épaisseur et son matériau (voir [Export et import IFC](topic:ifc)). L'épaisseur que vous saisissez est la vôtre : CivilCraft ne dimensionne pas les chaussées.

## Ce qui n'est pas encore construit

Les cibles pour la pente de raccordement au terrain ne sont pas encore disponibles. Pour un corridor qui varie le long de la route, avec gauche et droite séparées, utilisez [Gabarits de corridor](topic:corridor-templates). Voir [Pas encore disponible](topic:not-built-yet).
