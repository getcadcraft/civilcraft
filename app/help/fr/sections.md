---
title: Lignes d'échantillonnage et profils en travers
summary: Coupez des profils perpendiculairement à un tracé, voyez le terrain, le projet et le déblai et remblai à chaque PK, et obtenez les volumes par la méthode des aires moyennes.
keywords: diagramme des mouvements de terres, diagramme de Bruckner, point d'équilibre, foisonnement, retrait, distance de transport, emprunt, excédent, feuilles de profils, feuilles de profils en travers, pdf des profils, profils, profils en travers, lignes d'échantillonnage, vue en travers, déblai, remblai, surfaces, aire moyenne, volumes par aires moyennes, terrassement, PK, décalage, csv
from: 5060173c
---

Un profil en travers montre la route telle qu'elle sera construite : en travers du tracé, à un PK, le terrain existant, le projet (le corridor ou la plateforme terrassés) et le déblai et remblai entre les deux.

## Ajouter des lignes d'échantillonnage

1. Sélectionnez un tracé. Dans **Propriétés**, sous **Lignes d'échantillonnage**, cliquez sur {{ui:Ajouter des lignes d'échantillonnage}}.
2. Réglez **Chaque** (l'espacement : 50 ft ou 20 m pour commencer), **Largeur gauche** et **Largeur droite** (la distance atteinte par chaque profil depuis l'axe).
3. Pour couper un profil à un PK précis, saisissez-le dans **Ajouter un PK** (par exemple `2+35`) et appuyez sur {{key:Enter}}.

Les profils sont coupés à chaque multiple entier de l'espacement, aux deux extrémités du tracé, au début et à la fin de chaque courbe (PC et PT), et aux PK que vous ajoutez. Les lignes d'échantillonnage s'affichent sur le plan en gris, à travers le tracé ; elles sont aussi exportées en DXF, DWG et PDF sur le calque C-ROAD-SCTN. Chaque modification est une étape : {{key:Mod+Z}} l'annule.

## La vue en travers

Ouvrez-la avec {{ui:Vue en travers}} dans les **Propriétés** du tracé, {{ui:Profils en travers}} sous **Surface** › {{ui:More}}, ou avec {{key:X}}. Elle prend la place de la vue de profil sous le plan.

- Parcourez les profils avec les flèches de sa barre, la liste des PK, ou {{key:Left}} et {{key:Right}} lorsque la vue en travers a le focus ({{key:Home}} et {{key:End}} pour le premier et le dernier).
- La ligne grise est le terrain existant, la ligne rouge le projet. Le déblai est ombré en orange, le remblai en vert. Les points du corridor sont repérés : CL (axe), EOP (bord de chaussée), SH (accotement) et DL (raccordement au terrain).
- L'en-tête donne le PK, les aires de déblai et de remblai de ce profil et l'exagération verticale. **Ajuster** remplit le panneau ; choisissez 1× pour voir le profil à l'échelle réelle.
- Le trait épais sur le plan indique quel profil est à l'écran.

## Feuilles de profils

{{ui:Feuilles de profils en travers (PDF)}} sous **Lignes d'échantillonnage** place chaque profil sur des pages PDF, en lignes de gauche à droite puis de haut en bas, dans l'ordre des PK. Choisissez le **Papier**, l'**Échelle en plan** (l'échelle horizontale des profils) et l'**Exagération du profil** (1×, 2×, 5× ou 10×) ; la boîte de dialogue indique combien de profils tiennent sur une page et combien de pages en résultent.

Chaque profil affiche une grille avec les décalages et les altitudes, le terrain (en tirets), le projet, le déblai et le remblai ombrés (orange et vert), les points du corridor, et en dessous son PK et ses aires de déblai et de remblai. Tous les profils des feuilles ont la même taille, assez haute pour le plus grand ; lorsque cela ne tient pas sur la page à votre exagération, CivilCraft utilise le plus grand qui tient et le signale. Le cartouche indique le tracé, les PK de la page, les échelles et « Feuille 1 sur 3 ».

## Volumes par aires moyennes

Entre deux profils voisins, le volume est la moyenne de leurs deux aires multipliée par la distance entre leurs PK. La barre affiche les totaux du tracé, et {{ui:CSV}} télécharge les aires et volumes de chaque profil avec les totaux cumulés (verges cubes pour les projets en pieds, mètres cubes pour les projets métriques).

Les **Propriétés** affichent les mêmes totaux à côté des volumes par la méthode des mailles issus de [Volumes de terrassement](topic:volumes). Les deux sont des approximations différentes : des profils plus rapprochés les rapprochent, et sur une route droite en terrain plat elles sont identiques.

:::note
Le déblai et le remblai ne sont comptés que dans les zones terrassées (les lignes de raccordement au terrain d'un corridor ou d'une plateforme), comme le fait la méthode des mailles. Sans corridor ni plateforme, le projet est le terrain, donc un profil n'affiche ni déblai ni remblai.
:::

## Diagramme des mouvements de terres

**Diagramme des mouvements de terres** sous **Lignes d'échantillonnage** trace le diagramme à partir des mêmes volumes par aires moyennes : le long des PK, le cumul du déblai moins le remblai.

- **Retrait (−) ou foisonnement (+) du déblai** indique ce que donne un mètre cube de déblai une fois mis en remblai : −10 % (valeur de départ, indicative) signifie qu'il se réduit à 0,9 ; une roche qui foisonne peut être à +5 %. Utilisez la valeur de votre rapport géotechnique.
- Là où la courbe monte, la route est en déblai ; là où elle descend, en remblai. Au-dessus de zéro (ombré en orange), la terre se déplace vers les PK croissants ; en dessous de zéro (vert), vers les PK décroissants.
- Les **points d'équilibre** sont les endroits où la courbe coupe zéro : entre deux d'entre eux, déblai et remblai s'équilibrent. Le tableau liste chaque tronçon équilibré, le volume transporté (son point le plus haut ou le plus bas) et la distance moyenne de transport (l'aire ombrée divisée par ce volume).
- Lorsque la courbe se termine hors de zéro, ce qui reste est un **excédent** (au-dessus) ou un **emprunt** (au-dessous). Sur ce dernier tronçon, seule la terre au-delà du niveau où elle se termine compte comme transportée.

**CSV** enregistre l'ordonnée de masse à chaque profil, les tronçons et le coefficient.
