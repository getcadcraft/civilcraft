---
title: Concevoir une voie ferrée
summary: Faire d'un tracé une voie ferrée : raccordements (clothoïde, parabole cubique, Bloss, Helmert, demi-onde sinusoïdale, sinus), dévers de chaque courbe avec son dévers d'équilibre, insuffisance et excès de dévers, limites de dévers et de géométrie de la voie en avertissements, appareils de voie et communications par point kilométrique, gabarit de dégagement balayé le long de la ligne, et une voie avec rails, traverses et couche de ballast construite comme corridor, en plan, en coupes, en profil, en 3D et en métrés.
keywords: voie ferrée, rail, chemin de fer, voie, métro, tramway, dévers, insuffisance de dévers, excès de dévers, dévers d'équilibre, raccordement, courbe de raccordement, clothoïde, parabole cubique, Bloss, Helmert, demi-onde sinusoïdale, cosinus, écartement, écartement normal, écartement large, écartement métrique, voie étroite, traverse, ballast, sous-couche, plateforme, accotement, entraxe des voies, 60E1, 54E1, UIC60, 115RE, 136RE, gradient de dévers, variation de dévers, aiguillage, appareil de voie, communication, cœur d'aiguillage, numéro de cœur, longueur d'aiguillage, courbe de déviation, vitesse en voie déviée, dégagement, gabarit de dégagement, gabarit de chargement, gabarit cinématique, quai, écart au quai, entraxe, déclivité, courbe verticale, rayon minimal, dévers LandXML
from: 99de9745
---

Tout tracé peut devenir une voie ferrée. Ses courbes reçoivent alors des raccordements et un dévers (le dévers des rails), et son corridor est construit comme une voie : des rails posés sur des traverses, sur une couche de ballast, et terrassés dans le terrain comme une route. Des appareils de voie et des communications s'y placent par point kilométrique, et un gabarit de dégagement peut être balayé le long de la ligne et vérifié par rapport à ce qui se trouve à côté de la voie.

Toutes les valeurs ci-dessous sont des **valeurs provisoires**, et non des normes. Les chemins de fer fixent leurs limites selon la vitesse de la ligne, le type de voie et le pays : définissez-les d'après la norme de votre propre réseau. CivilCraft ne fournit aucun tableau national.

## Faire du tracé une voie ferrée

1. Sélectionnez le tracé et repérez **Ferroviaire** dans les Propriétés.
2. Cochez **Ce tracé est une voie ferrée**. Chaque modification correspond à une étape d'annulation.
3. Définissez la **Vitesse de projet** en haut des Propriétés du tracé : c'est la vitesse de ligne à laquelle le dévers est vérifié. **Trains les plus lents** (dans le bloc Ferroviaire) est la vitesse à laquelle l'excès de dévers est vérifié.

## Raccordements

Donnez à chaque courbe une longueur de spirale à chaque extrémité dans le tableau des PI (**Spirale d'entrée**, **Spirale de sortie**), puis choisissez son type dans le tableau des courbes du bloc Ferroviaire, ou cliquez sur **Raccordement pour chaque courbe** :

| Type | Courbure le long du raccordement |
|---|---|
| Clothoïde | augmente régulièrement (la spirale routière) |
| Parabole cubique | y = x³ / (6·R·L), avec L mesuré le long de la tangente ; la courbe elle-même est un peu plus longue |
| Bloss | 3u² − 2u³ de la courbure totale (u = la part de la longueur) : départ et arrivée en douceur |
| Helmert | deux paraboles, 2u² puis 1 − 2(1 − u)² |
| Demi-onde sinusoïdale | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Tous sauf la parabole cubique tournent de L / 2R, comme la clothoïde. Les points kilométriques suivent la longueur réelle. Le LandXML conserve le type (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Dévers

Saisissez le **Dévers** de chaque courbe en millimètres. Le tableau affiche pour chaque courbe :

- le **dévers d'équilibre** = G·v² / (g·R), G étant la distance entre les centres des rails (**Entraxe des rails**, soit l'écartement plus la largeur de champignon du rail, sauf si vous la saisissez). Avec G = 1500 mm, cela donne la formule bien connue 11.8·V² / R (V en km/h, R en m).
- l'**insuffisance** = équilibre à la vitesse de ligne − dévers appliqué.
- l'**excès** = dévers appliqué − équilibre à la vitesse des trains les plus lents.
- la **Rampe** : le gradient de dévers le plus fort sur ses rampes, en millimètres par mètre.

Le dévers se développe sur chaque raccordement, selon la forme de sa courbure : linéaire pour une clothoïde ou une parabole cubique, en forme de Bloss pour Bloss, et ainsi de suite. Une extrémité de courbe sans raccordement reçoit sa rampe sur la droite qui la précède, sur la longueur que la limite de gradient de dévers exige, et le programme l'indique : le dévers change alors à un endroit où la courbure ne change pas.

**Dévers autour de** indique le rail qui reste sur le profil projet : **le rail bas** (le cas habituel), **le rail intérieur** ou **l'axe de la voie** (chaque rail se déplace de la moitié du dévers). Le profil projet correspond alors au dessus du rail.

Le **Diagramme de dévers** trace la hauteur de chaque rail au-dessus du profil, le long des points kilométriques ; la vue de profil et les planches plan et profil reçoivent la même représentation sous forme de bande sous le profil.

## Limites et avertissements de dévers

**Dévers appliqué maximal**, **Insuffisance de dévers maximale**, **Excès de dévers maximal**, **Gradient de dévers maximal** et **Variation de dévers la plus rapide** (le gradient à la vitesse de ligne, en mm/s) sont vérifiés sur chaque courbe. Une valeur qui dépasse une limite donne un avertissement dans le bloc Ferroviaire et dans le panneau Problèmes, avec la limite et la valeur trouvée. Sans vitesse de projet, l'insuffisance et la vitesse de variation ne sont pas vérifiées (une remarque l'indique).

## La voie

Définissez l'**Écartement** (préréglages normal 1435 mm, large, métrique ou étroit, ou valeur personnalisée), le **Profil de rail** (60E1, 54E1, 49E1, 115RE, 136RE : leurs seules dimensions publiées), le nombre de **Voies** et leurs **Entraxes des voies**, puis les **Traverses et ballast** : matériau, longueur, largeur, hauteur et espacement des traverses ; épaisseur du ballast sous la traverse (au rail bas), accotement, pente, et distance entre son sommet et celui des traverses ; épaisseur de la sous-couche, l'accotement au-delà du pied du ballast, et le devers transversal de la plateforme.

Cliquez sur **Construire la voie**. Cela agit sur le corridor du tracé, construit comme une voie le long du profil projet : les rails et les traverses s'inclinent avec le dévers, la plateforme non. Les talus de déblai et de remblai du corridor partent du bord de l'accotement, et la voie se raccorde au terrain projeté comme une route.

- **Plan** : les deux rails de chaque voie (calque C-RAIL-TRAK) et, avec plusieurs voies, l'axe de chaque voie (C-RAIL-CNTR), à l'écran, en DXF, DWG, PDF et dans les planches plan et profil.
- **Coupes** : les traverses, les rails, et les bases du ballast et de la sous-couche dans chaque coupe.
- **3D** : les rails, chaque traverse et la couche de ballast (Afficher › Voie), également en GLB, OBJ et USD.
- **Métrés** : longueur de voie, rail (les deux rails de chaque voie, le long de la ligne propre à chaque voie), traverses, couche de ballast et ballast hors traverses, et sous-couche, par la méthode de la moyenne des aires d'extrémité entre coupes.

## Vérifications de géométrie de la voie

Outre le dévers, le bloc Ferroviaire vérifie la ligne elle-même par rapport à six autres limites (toutes provisoires, toutes à définir par vous) :

- **Gradient le plus fort** du profil projet, en millimètres par mètre.
- **Rayon minimal des courbes verticales**, sous forme de facteur k dans R ≥ k·V² (R en mètres, V en km/h). Une courbe verticale parabolique de longueur L entre deux déclivités a pour rayon L divisé par la variation de déclivité.
- **Courbe verticale la plus courte**.
- **Rayon minimal des courbes** en plan (0 désactive la vérification).
- **Arc ou droite le plus court**, exprimé en secondes de parcours à la vitesse de ligne : un arc de cercle, ou la droite entre deux courbes, plus court que cette distance donne un avertissement. 1,8 s correspond à la règle courante « la moitié de la vitesse en km/h, en mètres ».
- **Vitesse de variation de l'insuffisance de dévers** le long de chaque raccordement, en mm/s à la vitesse de ligne.

**Géométrie de la voie** liste le gradient le plus fort trouvé et chaque courbe verticale, avec son rayon et le rayon qu'exige la vitesse de ligne. Une courbe verticale située sur un raccordement ou une rampe de dévers reçoit une remarque. Sans profil projet ou sans vitesse de projet, les vérifications qui en ont besoin sont ignorées et une remarque l'indique.

## Appareils de voie et communications

Sous **Appareils de voie et communications**, cliquez sur **Ajouter un appareil de voie**. L'appareil est placé sur la plus longue droite ; réglez-le dans le tableau :

- **Point kilométrique de la pointe d'aiguille** : là où l'appareil commence sur ce tracé.
- **Cœur** : le numéro de cœur N (1:N). L'angle du cœur est 2·atan(1 / 2N).
- **Côté** : gauche ou droite, en regardant dans le sens des points kilométriques croissants.
- **Espacement de la communication** en mètres : au-dessus de 0, l'appareil devient une communication vers une voie parallèle située à cette distance (deux appareils et la droite qui les relie).

Le tableau affiche la **Longueur d'aiguillage** (pointe d'aiguille jusqu'au cœur), le **Rayon** de la courbe de déviation, et la **Vitesse en voie déviée** que ce rayon permet avec votre limite d'insuffisance de dévers et sans dévers. **Créer sa voie** transforme la voie déviée en tracé propre (l'aiguille, la courbe de déviation, puis la ligne droite dans l'angle du cœur), avec les mêmes réglages ferroviaires, prêt à être allongé.

Le plan dessine les deux rails déviés de chaque appareil, son axe, un repère à la pointe d'aiguille et au cœur, et « 1:N » (calque C-RAIL-TURN), à l'écran et en DXF, DWG, PDF et planches. La vue 3D dessine les rails déviés au niveau de la voie principale.

La forme est **provisoire** : une aiguille droite et une courbe de déviation unique à partir du numéro de cœur. Un appareil réellement construit suit la norme du réseau et le plan du fabricant. Avertissements : un appareil qui sort du tracé, qui se trouve sur une courbe, un raccordement, un dévers ou une courbe verticale, ou qui chevauche un autre appareil ; et une remarque lorsque la vitesse de ligne dépasse sa vitesse en voie déviée.

## Gabarit de dégagement

Cochez **Balayer un gabarit de dégagement le long de cette voie**. Choisissez le **Contour** (deux formes provisoires, ou **Votre propre contour** saisi sous forme d'un point par ligne : décalage par rapport à l'axe de la voie, puis hauteur au-dessus du dessus du rail, en mètres), la **Longueur du véhicule** et les **Entraxes des bogies**, et, s'il y en a un, le **Bord de quai** (côté, distance par rapport à l'axe de la voie, hauteur au-dessus du rail).

À chaque point kilométrique, le contour est incliné avec le dévers autour du rail bas et élargi par la courbure : le milieu du véhicule se rapproche de b² / 8R, ses extrémités s'éloignent de (L² − b²) / 8R (b les entraxes des bogies, L la longueur du véhicule, R le rayon à cet endroit, selon le raccordement). Le bloc dessine la coupe en ligne droite et là où elle est la plus large, et liste :

- le **gabarit le plus large** et son emplacement,
- les **entraxes des voies** comparés aux entraxes que demandent deux gabarits voisins,
- la place restante au **bord de quai**, ou de combien il empiète,
- chaque ligne d'élément, ouvrage de canalisation et autre tracé ferroviaire trouvé **à l'intérieur du gabarit**.

Une ligne d'élément avec des altitudes est jugée par rapport au contour à sa hauteur au-dessus du rail ; sans profil projet, ou pour un point sans altitude, elle n'est jugée qu'en plan, et la liste l'indique. Le plan montre les deux bords du gabarit (calque C-RAIL-CLRN) avec une croix à chaque objet situé à l'intérieur.

Les contours proposés sont des **valeurs provisoires, et non le gabarit d'un réseau quelconque**. Saisissez le gabarit de chargement de votre réseau avant de vous fier à un résultat.

## Dans d'autres logiciels

- **LandXML** : un tracé ferroviaire est écrit avec ses raccordements (spiType) et un bloc `Cant` : l'écartement, le point de rotation, la vitesse de ligne, et un point kilométrique où chaque rampe de dévers commence et se termine, avec le dévers appliqué, le dévers d'équilibre et l'insuffisance. Ouvrir un fichier LandXML contenant un bloc `Cant` fait de ce tracé une voie ferrée avec ces dévers.
- **IFC** : le tracé avec ses segments de dévers, les rails, les traverses, le ballast et la sous-couche.

## Pas encore disponible

Les appareils de voie dans l'export IFC, les familles d'appareils au-delà de la courbe de déviation unique (aiguilles courbes, cœurs à aiguille mobile, traversées, traversées-jonctions), les règles de gabarit cinématique (le gabarit est un contour fixe avec débattement en courbe), les caténaires et la signalisation.

**Quelle norme.** Dans le bloc Ferroviaire, « Norme à citer » accepte Aucune ou Européenne (UIC et EN). Choisir Européenne indique les documents qu'un projet européen cite (EN 13803 pour les paramètres de tracé, EN 13232 pour les aiguillages et les croisements, EN 15273 pour les gabarits, EN 13848 pour la qualité de la géométrie de voie) et ajoute à chaque limite une case pour l'article dont elle provient. Aucun chiffre tiré d'une norme n'est intégré : les limites de dévers, d'insuffisance, d'excès, de gradient et de variation, la géométrie des appareils et le gabarit de chargement restent des valeurs provisoires, et la fenêtre l'indique. Un ingénieur ferroviaire vérifie chaque valeur dans le texte même de la norme, saisit l'article à côté, avant toute construction. L'Afrique du Sud et les tableaux AREMA ne sont pas inclus dans cette version.
