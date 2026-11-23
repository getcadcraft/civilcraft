---
title: Balayer un corridor routier
summary: Activer un corridor pour un tracé en plan, régler les valeurs de voie, d'accotement et de talus, puis lire les profils en travers, les entrées en terre et les terrassements qu'il produit.
keywords: jonction, intersection, route qui en rejoint une autre, route latérale, té, croisement, niveau de plateforme, raccordement, dévers, super, inclinaison, transition de dévers, amorce de dévers, tableau des taux de dévers, pente transversale, rotation, corridor, assemblage, sous-assemblage, profil type, route, voie, accotement, talus, entrée en terre, déblai, remblai, profils, cible, cibles, cible de largeur, cible d'altitude, cible de décalage, élargissement, bord de chaussée, suivre un autre corridor
from: 6dcb92b3
---

Un corridor balaie un profil type simple (un assemblage) le long d'un tracé en plan et de son profil en long projet, le raccorde au terrain naturel et ajoute le résultat à la surface projet. Un tracé peut porter plusieurs corridors sur des plages de PK différentes, et un corridor peut être construit à partir de gabarits réutilisables par PK ([Gabarits de corridor](topic:corridor-templates)). L'assemblage simple ci-dessous est identique des deux côtés ; pour donner à chaque côté ses propres éléments, voir [Construire chaque côté à partir d'éléments](topic:corridor#build-each-side-from-parts).

## L'assemblage

Depuis l'axe vers l'extérieur, de chaque côté :

1. une **voie** d'une largeur donnée, qui descend depuis le bombement selon la **pente de voie**
2. un **accotement** d'une largeur donnée, à la **pente d'accotement**
3. un **talus** depuis le bord de l'accotement jusqu'au point où il rejoint le terrain : le **talus de déblai** là où le terrain est au-dessus, le **talus de remblai** là où il est en dessous

Les valeurs de départ sont des valeurs provisoires, pas une norme de conception :

| Valeur | Pieds US | Mètres |
|---|---|---|
| Largeur de voie | 12 ft | 3.6 m |
| Pente de voie | 2% | 2% |
| Largeur d'accotement | 4 ft | 1.2 m |
| Pente d'accotement | 4% | 4% |
| Talus de déblai | 2 : 1 | 2 : 1 |
| Talus de remblai | 3 : 1 | 3 : 1 |
| Coupe tous les | 10 ft | 5 m |

Les pentes des talus s'expriment horizontal sur vertical (H:V) : 3 : 1 signifie 3 en horizontal pour 1 en vertical.

## Construire le corridor

Il faut un tracé en plan sans erreur et un profil en long projet comportant au moins deux PIV, sans erreur.

1. Sélectionnez le tracé.
2. Dans le panneau de droite, sous **Corridor**, cochez **Balayer un assemblage le long du profil en long projet**.
   Les champs apparaissent et le corridor est construit immédiatement. Le plan montre les bords de voie et d'accotement ainsi que les entrées en terre ; avec {{ui:Projet (terrassé)}} choisi sous **Affichage**, les courbes de niveau montrent le nouveau terrain.
3. Modifiez une valeur quelconque : **Largeur de voie**, **Pente de voie**, **Largeur d'accotement**, **Pente d'accotement**, **Talus de déblai**, **Talus de remblai**, **Coupe tous les**. Appuyez sur {{key:Enter}} après chaque valeur. Les talus de déblai et de remblai et l'espacement des coupes doivent être supérieurs à 0.
4. Lisez la ligne sous les champs, par exemple « 39 coupes de 0+00.00 à 3+86.36 ; déblai 240.2 cu yd, remblai 556.0 cu yd. »

Les coupes sont réalisées à chaque pas de **Coupe tous les**, aux extrémités, et au début et à la fin de chaque courbe horizontale et verticale. Chaque coupe et les lignes qui la traversent (axe, bords de voie et d'accotement, entrée en terre) deviennent des lignes de rupture de la surface projet.

Pour désactiver le corridor, décochez la case. Ses valeurs sont conservées pour la prochaine fois.

## Quand il ne se construit pas

Un cadre rouge sous les champs indique la raison :

| Message | Que faire |
|---|---|
| « Le corridor a besoin d'un profil en long projet sans erreur. » | Ajoutez des PIV, ou corrigez les raccordements verticaux qui se chevauchent (voir [Concevoir un profil en long](topic:profile)). |
| « Le profil en long projet ne chevauche pas le tracé en plan. » | Déplacez les PIV sur la plage de PK du tracé. |
| « Le corridor a besoin d'au moins deux coupes sur la surface. » | La plus grande partie du corridor est hors du terrain naturel. |
| « 4 talus sortent de la surface avant de rejoindre le terrain. » | Près du bord de la surface, le talus ne peut pas atteindre le terrain. Éloignez la route du bord, ou abaissez la hauteur de remblai ou de déblai à cet endroit. |
| « Les entrées en terre du corridor se croisent (des coupes se chevauchent, par exemple à l'intérieur d'une courbe serrée). Utilisez un rayon plus grand ou un assemblage plus étroit. » | Les coupes à l'intérieur d'une courbe prononcée se chevauchent. Augmentez le rayon ou rétrécissez l'assemblage. |

Un corridor présentant un problème n'est pas raccordé au terrain et n'est pas compté dans les terrassements.

## Corridors et plateformes ensemble

La surface projet est construite dans l'ordre : d'abord tous les corridors, puis toutes les plateformes. Là où le terrassement d'une plateforme chevauche un corridor, la plateforme l'emporte. Lorsqu'un élément ultérieur chevauche une route, seule la partie de la route située dans l'entrée en terre de cet élément est remplacée ; le reste de la route, ainsi que toute ligne de rupture du terrain que la route traverse, conserve sa forme. Les volumes sont calculés à l'intérieur de l'ensemble des entrées en terre ; voir [Volumes de terrassement](topic:volumes).

## Dévers

Dans une courbe, la route peut s'incliner vers l'intérieur, de sorte que les véhicules sont moins poussés vers l'extérieur. Cochez **Donner un dévers aux courbes** sous **Dévers**, dans les **Propriétés** du tracé :

- Chaque courbe circulaire prend un taux **e** dans le tableau des taux : la première ligne dont le rayon est atteint par la courbe (une ligne sans taux conserve le bombement normal). Le tableau et la **Pente relative maximale** (0.5 % au départ) sont des valeurs provisoires, pas une norme : réglez-les selon vos propres critères de conception. Ajoutez ou supprimez des lignes selon vos besoins.
- Les voies tournent autour de l'axe. Avant la courbe, la voie extérieure s'aplanit sur l'**amorce de dévers** (bombement normal ÷ e × longueur de transition), puis sur la **transition de dévers** (largeur de voie × e ÷ la pente) elle continue à tourner jusqu'à ce que toute la route soit inclinée à e vers l'intérieur ; les deux tiers de la transition se trouvent avant la courbe et un tiers sur celle-ci. Après la courbe, le processus se déroule à l'inverse.
- Un accotement du côté bas n'est jamais plus plat que sa voie ; du côté haut, il conserve sa propre pente (il se retourne).
- Le tableau situé dessous donne pour chaque courbe son rayon, son taux, sa transition et son amorce, ainsi que les PK où le dévers complet commence et finit. Le **diagramme de dévers** trace les pentes transversales des deux voies le long des PK (voie gauche en trait plein, voie droite en tirets).
- Une courbe trop courte pour atteindre le dévers complet, ou deux courbes dont les transitions se chevauchent, est signalée dans un cadre au-dessus du tableau.

Les coupes, les volumes, la vue 3D et les plans montrent tous la route inclinée. Chaque modification constitue une étape : {{key:Mod+Z}} l'annule.

## Cibles

Une cible déplace un point d'un côté de la route vers une ligne : le **Bord de chaussée** ou le **Bord d'accotement**, à **Gauche** ou à **Droite**. Chaque coupe rejoint la ligne perpendiculairement à l'axe, en allant vers l'extérieur de ce seul côté ; une cible à droite ne déplace donc jamais le côté gauche.

| Définit | Ce qui se passe à l'endroit où une coupe rencontre la ligne |
|---|---|
| **Largeur** | Le point se place sur la ligne : la voie (ou l'accotement) s'élargit ou se rétrécit jusqu'à elle, en conservant sa pente transversale. |
| **Altitude** | Le point prend l'altitude de la ligne à cet endroit, à son propre décalage : la pente transversale de la voie (ou de l'accotement) suit. |

La ligne peut être une ligne caractéristique (quel que soit son **Usage**) ou une ligne d'un autre corridor : son axe, ses bords de chaussée, ses bords d'accotement ou ses entrées en terre. La ligne d'un corridor suit ce corridor : si vous modifiez l'autre route, celle-ci suit. CivilCraft construit d'abord l'autre corridor ; deux corridors qui se cibleraient mutuellement en boucle sont refusés d'un côté, et le tableau indique lequel.

1. Sélectionnez le tracé et activez son corridor.
2. Sous **Cibles**, cliquez sur {{ui:Ajouter une cible}}.
3. Choisissez le **Côté**, le **Point**, ce qu'il **Définit** et la ligne **Jusqu'à la ligne**. Chaque modification constitue une étape d'annulation.

**Résultat** indique à combien de coupes la ligne a été atteinte. Les coupes qui ne l'atteignent pas (au-delà de ses extrémités, ou là où elle se trouve derrière l'axe) conservent les valeurs de l'assemblage. Une ligne supprimée laisse le corridor tel qu'il était avant la cible, et le tableau l'indique. Un côté peut avoir une cible de largeur et une cible d'altitude pour chaque point.

## Construire chaque côté à partir d'éléments

Activez **Construire chaque côté à partir d'éléments** dans les réglages du corridor. Chaque côté possède alors sa propre liste, de l'axe vers l'extérieur : voies, un accotement, un caniveau, une bordure, une bande plantée, un trottoir et, en dernier, le talus jusqu'au terrain (avec ses propres rapports de déblai et de remblai). Partez de {{ui:Route rurale}} ou de {{ui:Rue urbaine}}, ajoutez et supprimez des éléments, déplacez-les avec les flèches, et cliquez sur {{ui:Copier}} pour copier un côté vers l'autre. Chaque modification constitue une étape d'annulation.

Une pente transversale est la pente qui s'éloigne de la route : un trottoir qui s'écoule vers la route est donc négatif. Une bordure est une face de la hauteur que vous donnez, un dessus de la largeur que vous donnez et un retrait optionnel à l'arrière. Le dévers s'applique à toutes les voies de la première ligne ; le caniveau, la bordure, la bande et le trottoir s'accrochent au bord des voies telles que construites. Les cibles déplacent toujours l'extrémité des voies et le dernier élément. Les coupes transversales indiquent la ligne de fil d'eau du caniveau, le dessus et l'arrière de la bordure, et le reste. Dans une courbe avec des clothoïdes, la transition est la clothoïde : bombement plat au TS, dévers complet au SC.

## Couches de chaussée

Une voie, un accotement, un caniveau, une bande plantée ou un trottoir peut porter sa structure : sous l'élément, {{ui:Ajouter une couche}} ajoute une couche avec un nom, un matériau, une épaisseur et son type (roulement, couche de liaison, couche de base, couche de fondation, couche de forme ou autre), de haut en bas. Les couches ne modifient pas la surface de la route (son dessus est la surface projet) ; chacune se trouve sous son élément, sa profondeur mesurée verticalement vers le bas. Les coupes transversales tracent le bas de chaque couche en pointillés, et {{ui:Couches de chaussée : quantités}} liste la surface en plan et le volume de chaque couche (surface le long du corridor à partir de ses coupes, volume = surface × épaisseur). L'export IFC écrit chaque couche comme son propre élément avec son épaisseur et son matériau (voir [Export et import IFC](topic:ifc)). L'épaisseur que vous saisissez est la vôtre : CivilCraft ne dimensionne pas les chaussées.

## Où les routes rencontrent des routes, des plateformes et des chemins

Avec {{ui:Raccorder les routes et les plateformes qu'elle rencontre}} activé (il l'est pour chaque corridor), CivilCraft raccorde un corridor à ce qu'il rencontre en plan :

- **Une route qui se termine sur une autre route** (son extrémité se trouve sur l'autre route, ou à moins d'environ la moitié de la largeur de sa propre chaussée du bord de cette route) est la route latérale d'un carrefour. La route rencontrée ouvre son bord pour la chaussée de la route latérale : à l'embouchure, l'accotement, la bordure, la bande et le trottoir sont posés selon la pente transversale de la voie et tracés comme chaussée. La route latérale est posée sur la surface de la route principale là où les deux se chevauchent, et elle est adoucie vers le haut ou vers le bas jusqu'à elle sur l'approche.
- **Deux routes qui se croisent** sont raccordées de la même façon des deux côtés. La route citée en premier sous **Tracés en plan** est la route prioritaire ; l'autre suit sa surface à travers le croisement.
- **Une route qui se termine sur une plateforme** (à l'intérieur, ou à moins d'environ la moitié de sa largeur de chaussée de son bord) arrive au niveau de la plateforme et y est adoucie sur l'approche.
- **Un chemin** (Paysage › Aménagements durs) s'arrête au bord extérieur d'une route, au niveau du trottoir ou de l'accotement à cet endroit, au lieu de passer sur la route. Un chemin qui traverse une route devient deux tronçons. Une extrémité tracée un peu en deçà d'une route (à moins de deux fois la largeur du chemin) est prolongée jusqu'à son bord.

**Propriétés** indique ce que chaque corridor a raccordé, de combien il a été relevé ou abaissé à cet endroit et sur quelle longueur. Cette longueur est la plus grande valeur entre 10 m (30 ft) et vingt fois la variation, et ne dépasse jamais 45 % du corridor. **Le profil en long projet n'est pas modifié** : la vue de profil montre toujours la ligne de terrain que vous avez tracée, tandis que les coupes, la surface projet, les volumes et la vue 3D montrent la route telle qu'elle est raccordée. Pour que la jonction soit exacte par conception, déplacez le dernier PIV à l'altitude indiquée par Propriétés.

Désactivez l'interrupteur sur un corridor pour le laisser exactement tel que son profil et son assemblage le décrivent ; il ne prend alors part à aucune jonction, ni comme route latérale ni comme route principale. Les routes qui se rejoignent presque dans l'alignement (à moins d'environ 20°) sont laissées telles quelles, ainsi que les pistes.

Ce qu'un carrefour ne fait pas encore : il n'y a pas de raccords de bordure en plan (les angles sont droits), pas de voies de tourne-à-gauche ni d'îlots, la fin de la route latérale est coupée d'équerre par rapport à son propre tracé, et un corridor construit à partir de gabarits ouvre son bord de la même façon simple (un fossé ou un mur dans sa condition de fin est mis à niveau à travers l'embouchure, sans buse). Pour les raccords de bordure en plan, les triangles de visibilité et le marquage, voir [Sols, routes, levé, mines et liaisons](topic:soils-roads-survey-mines-links).

## Ce qui n'est pas encore disponible

Les cibles de pente d'entrée en terre ne sont pas encore disponibles. Pour un corridor qui change le long de la route, avec la gauche et la droite séparées, utilisez [Gabarits de corridor](topic:corridor-templates). Voir [Pas encore disponible](topic:not-built-yet).
