---
title: Tabulations et profils en travers
summary: Couper des profils en travers d'équerre sur un tracé, voir le terrain, le projet et le déblai et le remblai à chaque PK, et obtenir les volumes par la méthode des aires moyennes.
keywords: diagramme des mouvements de terres, Bruckner, point de compensation, retrait, foisonnement, distance de transport, emprunt, décharge, feuilles de profils en travers, profils en travers PDF, profils, profils en travers, tabulations, vue en travers, déblai, remblai, aires, aire moyenne, volumes par aires moyennes, terrassement, PK, décalage, CSV
from: 09639ce2
---

Une coupe transversale montre la route telle qu'elle sera construite : en travers du tracé, à un PK, le terrain naturel, le projet (le corridor ou la plateforme terrassée) et le déblai et le remblai entre les deux.

## Ajouter des tabulations

1. Sélectionnez un tracé. Dans **Propriétés**, sous **Tabulations**, cliquez sur {{ui:Ajouter des tabulations}}.
2. Réglez **Espacement** (l'intervalle : 50 ft ou 20 m au départ), **Largeur gauche** et **Largeur droite** (la portée de chaque coupe depuis l'axe).
3. Pour couper un profil à un PK particulier, saisissez-le dans **Ajouter un PK** (par exemple `2+35`) et appuyez sur {{key:Enter}}.

Les coupes sont réalisées à chaque multiple entier de l'espacement, aux deux extrémités du tracé, au début et à la fin de chaque courbe (PC et PT), et aux PK que vous ajoutez. Les tabulations s'affichent sur le plan en gris, en travers du tracé ; elles sont aussi exportées en DXF, DWG et PDF sur le calque C-ROAD-SCTN. Chaque modification constitue une étape : {{key:Mod+Z}} l'annule.

## La vue en travers

Ouvrez-la avec {{ui:Vue en travers}} dans les **Propriétés** du tracé, {{ui:Profils en travers}} sous **Surface** › {{ui:Plus}}, ou {{key:X}}. Elle prend la place de la vue de profil sous le plan.

- Parcourez les coupes avec les flèches de sa barre, la liste des PK, ou {{key:Left}} et {{key:Right}} lorsque la vue en travers a le focus ({{key:Home}} et {{key:End}} pour la première et la dernière).
- La ligne grise est le terrain naturel, la ligne rouge le projet. Le déblai est coloré en orange, le remblai en vert. Les points du corridor sont repérés : CL (axe), EOP (bord de chaussée), SH (accotement) et DL (entrée en terre).
- L'en-tête donne le PK, les aires de déblai et de remblai de cette coupe et l'exagération verticale. **Ajuster** remplit le panneau ; choisissez 1× pour voir la coupe à l'échelle réelle.
- Le trait épais du plan indique quelle coupe est à l'écran.
- **Zoom et panoramique :** la molette zoome autour du pointeur, et glisser déplace la vue. {{ui:Ajuster}} (ou {{key:F}}, ou un double-clic) ajuste de nouveau toute la coupe.

## Mesurer dans une coupe

1. Cliquez sur {{ui:Mesurer}} dans la barre de coupe, ou appuyez sur {{key:M}}. L'indication dit « Cliquez sur le premier point, puis sur le second. »
2. Cliquez sur deux points. Chacun s'accroche à l'extrémité d'une ligne ou à un point du corridor (CL, EOP, SH, DL) ; maintenez {{key:Alt}} pour un point libre.
3. La lecture donne la distance horizontale (ΔH), la distance verticale (ΔV), la pente en pourcentage avec son rapport, et la longueur droite, dans les unités du projet.

Cliquez à nouveau pour commencer une nouvelle mesure. {{key:Esc}} l'efface, et {{key:M}} désactive Mesurer.

## Feuilles de profils en travers

{{ui:Feuilles de profils en travers (PDF)}} sous **Tabulations** place chaque coupe sur des pages PDF, en lignes de gauche à droite et de haut en bas, dans l'ordre des PK. Choisissez le **Papier**, l'**Échelle en plan** (l'échelle horizontale des coupes) et l'**Exagération du profil** (1×, 2×, 5× ou 10×) ; la boîte de dialogue indique combien de coupes tiennent sur une page et combien de pages cela fait.

Chaque coupe affiche une grille avec décalages et altitudes, le terrain (en tirets), le projet, le déblai et le remblai colorés (orange et vert), les points du corridor, et en dessous son PK et ses aires de déblai et de remblai. Toutes les coupes des feuilles sont dessinées à la même taille, assez hautes pour la plus grande ; lorsque cela ne tient pas sur la page avec votre exagération, CivilCraft utilise la plus grande qui tient et le signale. Le cartouche indique le tracé, les PK de la page, les échelles et « Feuille 1 sur 3 ».

## À quoi le déblai et le remblai sont-ils mesurés

Un corridor peut avoir des couches sous la chaussée : couches de chaussée, composants de gabarit, piste. Dans la barre de coupe, le choix **Volumes mesurés jusqu'à** définit jusqu'où vont le déblai et le remblai :

- **Surface inférieure** (au départ) : jusqu'au bas de ces composants, de sorte que le déblai inclut l'épaisseur de la structure de chaussée.
- **Surface supérieure** : seulement jusqu'au haut du projet, comme auparavant, lorsque les composants n'étaient pas comptés.

Les aires de l'en-tête, les volumes ci-dessous, le CSV et le diagramme des mouvements de terres suivent ce choix, qui est enregistré avec le projet.

## Volumes par aires moyennes

Entre deux coupes voisines, le volume est la moyenne de leurs deux aires multipliée par la distance entre leurs PK. La barre indique les totaux du tracé, et {{ui:CSV}} télécharge les aires et volumes de chaque coupe avec les cumuls (yards cubes pour les projets en pieds, mètres cubes pour les projets métriques).

**Propriétés** affiche les mêmes totaux à côté des volumes par la méthode des mailles de [Volumes de terrassement](topic:volumes). Les deux sont des approximations différentes : des coupes plus rapprochées les rapprochent, et sur une route droite en terrain plat elles sont identiques.

:::note
Le déblai et le remblai ne sont comptés que dans les zones terrassées (les entrées en terre d'un corridor ou d'une plateforme), comme le fait la méthode des mailles. Sans corridor ni plateforme, le projet est le terrain : une coupe n'affiche donc ni déblai ni remblai.
:::

## Diagramme des mouvements de terres

**Diagramme des mouvements de terres** sous **Tabulations** trace le diagramme à partir des mêmes volumes par aires moyennes : le long des PK, le cumul du déblai moins le remblai.

- **Retrait (−) ou foisonnement (+) du déblai** indique ce que donne un mètre cube de déblai une fois mis en remblai : −10 % (la valeur de départ, provisoire) signifie qu'il se réduit à 0.9 ; un rocher qui foisonne peut être à +5 %. Utilisez le chiffre de votre rapport géotechnique.
- Là où la courbe monte, la route est en déblai ; là où elle descend, en remblai. Au-dessus de zéro (orange), la terre se déplace vers l'amont ; en dessous de zéro (vert), vers l'aval.
- Les **points de compensation** sont les endroits où la courbe coupe zéro : entre deux d'entre eux, le déblai et le remblai s'équilibrent. Le tableau liste chaque tronçon équilibré, le volume déplacé (son point le plus haut ou le plus bas) et la distance moyenne de transport (l'aire colorée divisée par ce volume).
- Là où la courbe se termine hors de zéro, le reste est un **excédent** (au-dessus) ou un **emprunt** (en dessous). Dans ce dernier tronçon, seule la terre au-delà du niveau où la courbe se termine compte comme déplacée.

**CSV** enregistre l'ordonnée de masse à chaque coupe, les tronçons et le coefficient de foisonnement.
