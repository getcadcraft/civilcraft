---
title: Voir le site en 3D
summary: Ouvrir la vue 3D, orbiter, faire un panoramique et un zoom, régler l'exagération verticale et les couleurs, choisir ce qui s'affiche, et cliquer sur les tracés, plateformes, lignes caractéristiques, lignes de rupture, canalisations, ouvrages et points pour les sélectionner.
keywords: étiquettes, étiquettes 3d, étiquettes orientées vers la caméra, étiquettes de PK, étiquettes de courbes de niveau, libellés de points, projeter, aérien, couches cartographiques sur la surface, 3d, trois dimensions, vue 3d, viewcube, boussole, orbite, perspective, parallèle, isométrique, iso, exagération verticale, terrain, modèle, modèle de site, survol, visualiser, rendu, canalisations en 3d, ouvrages, regards, corridor en 3d, route en 3d, surface de chaussée, voies, bordures, trottoirs, végétaux en 3d, arbres en 3d, arbustes, haies, paysage en 3d, rampes en 3d, marches, murs, revêtements, aménagements en 3d
from: a16bafe1
---

La vue 3D montre le site comme un seul modèle : le terrain existant et la surface terrassée, les courbes de niveau projetées sur eux, les lignes de rupture et le bord de surface, chaque tracé sur son profil projet avec des repères de PK, les lignes caractéristiques du corridor et la route elle-même (voies, accotements, caniveaux, bordures, bandes et trottoirs, chacun dans sa couleur), les plateformes avec leurs lignes de raccordement au terrain, le réseau de canalisations avec leurs canalisations et ouvrages à leurs altitudes réelles, et, depuis l'espace Paysage, les végétaux, revêtements, chemins, murs, bordures, rampes et marches. Elle lit le même projet que le plan : chaque modification apparaît dans les deux.

## Ouvrir la vue 3D

1. Ouvrez des points topographiques (ou un fichier LandXML ou de projet) pour disposer d'une surface. Des végétaux, revêtements ou rampes suffisent aussi à l'ouvrir.
2. Appuyez sur {{key:D}}, ou cliquez sur {{ui:3D}} dans le groupe {{ui:Affichage}} de la barre d'outils.
   La vue 3D s'ouvre par-dessus le plan, en regardant tout le site depuis le sud-est. La première fois, le chargement prend un moment.
3. Appuyez de nouveau sur {{key:D}}, ou cliquez de nouveau sur {{ui:3D}}, pour revenir au plan. Choisir un outil de dessin tel que {{ui:Tracé en plan}} ou {{ui:Plateforme}} revient aussi au plan, puisque le dessin se fait là.

## Se déplacer

| Pour | Faites ceci |
|---|---|
| Orbiter | Glissez avec le bouton gauche ou le bouton du milieu |
| Faire un panoramique | Glissez avec le bouton droit, ou {{key:Shift}} et glissez |
| Zoomer | Tournez la molette ; le zoom se fait vers le pointeur |
| Orbiter sur un pavé tactile | Balayez avec deux doigts ({{key:Shift}} et balayer fait un panoramique) |
| Zoomer sur un pavé tactile | Pincez |
| Tactile | Un doigt orbite ; deux doigts pincent pour zoomer et glissent pour le panoramique |
| Touches (la vue a le focus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbitent, avec {{key:Shift}} elles font un panoramique ; {{key:Plus}} et {{key:Minus}} zooment |

La barre au-dessus de la vue contient le reste :

- La liste des vues : **Iso**, **Dessus**, **Dessous**, **Face** (regard vers le nord), **Arrière**, **Gauche**, **Droite**.
- {{ui:Perspective}} : enfoncé, c'est une vue en perspective ; cliquez pour une projection parallèle (sans raccourcissement).
- {{ui:Étendue}} : affiche de nouveau tout. {{key:F}} fait la même chose lorsque la vue 3D est ouverte.

## Le ViewCube

Le ViewCube dans le coin supérieur droit tourne avec la vue. Cliquez sur une face, une arête ou un coin pour regarder le site depuis là (la caméra tourne en douceur, sauf si votre système demande une animation réduite). Faites glisser le cube pour orbiter. L'anneau de la boussole situé dessous indique le nord (nord de la grille, +Y) : faites glisser l'anneau pour tourner le site autour de la verticale, ou cliquez sur N, E, S ou O pour regarder depuis ce côté. {{ui:Accueil}}, la petite maison en haut à gauche, revient à la vue iso de tout le site. Au clavier : {{key:Tab}} pour aller au cube, les flèches choisissent une face, une arête ou un coin, {{key:Enter}} regarde depuis là.

Sur le plan, le même cube montre le dessus. Cliquez sur une autre face, arête ou un autre coin (ou faites-le glisser) pour ouvrir la vue 3D en regardant depuis là : c'est le moyen le plus rapide d'entrer en 3D depuis une direction donnée. Pour remplacer le cube par une petite icône d'axes, ou le masquer, voir **Indicateur de coin** dans [Paramètres de CivilCraft](topic:settings).

## Exagérer les altitudes

Les sites sont généralement bien plus larges qu'ils ne sont hauts, donc les altitudes sont étirées de **2×** au départ. Choisissez **1×**, **2×**, **3×**, **5×** ou **10×** dans la liste de la barre, ou sous **Exagération verticale en 3D** dans [Paramètres de CivilCraft](topic:settings) (les deux sont un seul paramètre). Seule la vue change : les volumes, les profils et les exports restent à l'échelle réelle.

## Colorer les surfaces

- **Bandes d'altitude** : les mêmes bandes et couleurs que les bandes d'altitude du plan (le nombre de bandes se règle sous **Affichage** dans le panneau de gauche). Chaque limite de bande est coupée exactement à son altitude.
- **Une couleur** : le terrain existant et la surface terrassée, chacun dans une couleur unie.
- **Couches cartographiques** : les couches affichées sous le plan (une image géoréférencée, des tuiles cartographiques ou un service de cartes ; voir [Couches cartographiques](topic:map-layers)) posées sur les surfaces comme une feuille, de sorte qu'une photo aérienne apparaît sur les collines. Les images encore en cours de réception se complètent au fur et à mesure. Si aucune couche cartographique n'est affichée, les surfaces gardent leurs bandes d'altitude et la vue le signale. L'image est pour l'écran : les exports GLB et OBJ ne la contiennent pas.

Lorsque les deux surfaces sont affichées, le terrain existant est transparent par-dessus la surface terrassée, de sorte que vous voyez le déblai (terrain au-dessus du projet) et le remblai.

## Choisir ce qui s'affiche

Cliquez sur {{ui:Afficher}} dans la barre et cochez ou décochez :

| Élément | Ce que c'est |
|---|---|
| Terrain existant | La surface construite à partir des points topographiques (ou lue depuis un LandXML) |
| Surface terrassée | Le terrain existant avec les corridors et plateformes terrassés (seulement lorsqu'il y en a) |
| Arêtes des triangles | Chaque arête du TIN, en traits |
| Courbes de niveau | Courbes de niveau mineures et majeures de chaque surface affichée, à l'équidistance du plan |
| Bord de surface | Le bord extérieur de chaque surface affichée, à ses altitudes |
| Lignes de rupture | Chaque ligne de rupture, à ses altitudes |
| Tracés et PK | Chaque tracé sur son profil projet (sur le terrain lorsqu'il n'y a pas de profil), avec des repères tous les 50 ft ou 20 m |
| Lignes caractéristiques du corridor | Bord de chaussée, accotement et raccordement au terrain des deux côtés |
| Surfaces de chaussée | La route que construit chaque corridor, d'après son profil type : voies, accotements, caniveaux, bordures, bandes et trottoirs, chacun dans sa couleur, sur la surface terrassée |
| Végétaux | Chaque végétal, et les végétaux en massifs et haies, sous forme de formes simples dimensionnées d'après la liste des végétaux : un arbre est un tronc et une couronne ronde (un cône pour un conifère, une touffe sur un tronc élancé pour un palmier), les arbustes, plantes de haie, vivaces et couvre-sols sont des dômes, les graminées des touffes, les grimpantes de fines colonnes. Ils se tiennent sur la surface terrassée (ou le terrain existant) à la taille affichée sur le plan : adulte, ou à la plantation |
| Aménagements durs | Revêtements et chemins avec leurs pentes, murs, bordures, marches, et rampes qui montent par volées avec des paliers entre elles |
| Plateformes et raccordements | Le contour de chaque plateforme à son altitude et sa ligne de raccordement au terrain |
| Canalisations et ouvrages | Canalisations en tuyaux ronds entre leurs radiers, ouvrages du tampon au puisard |
| Points topographiques | Un point à chaque point avec une altitude (désactivé au départ) |
| Couches SIG | Les couches SIG affichées sur le plan, dans leurs couleurs : lignes et contours à leurs propres altitudes, à ces altitudes, les autres posées sur le terrain existant (elles le suivent exactement) ; points sous forme de petites croix. Les formes sans altitude hors de la surface sont omises, et la vue indique combien |
| Étiquettes | Noms et valeurs toujours orientés vers vous : le nom de chaque tracé à son début et ses PK tous les 100 ft (ou 100 m), l'altitude de chaque courbe de niveau majeure, les plateformes, lignes caractéristiques et ouvrages par leur nom, et avec **Points topographiques** cochée, le numéro et l'altitude de chaque point |

Les étiquettes gardent la même taille et restent droites quelle que soit la rotation ou le zoom, et une colline devant une étiquette la masque. Lorsqu'elles seraient trop serrées, les plus importantes s'affichent et les autres attendent que vous zoomiez : les tracés d'abord, puis les ouvrages, plateformes, lignes caractéristiques, PK, courbes de niveau et points, les plus proches d'abord. Elles ne sont qu'à l'écran ; les exports et les tracés les omettent.

Vos choix, l'exagération et les couleurs sont mémorisés dans ce navigateur.

Une route est construite sur le terrain existant. Avec un tracé et un corridor mais sans points topographiques ni surface, la route est dessinée sur un terrain fictif plat : à l'altitude moyenne de son profil projet, ou à niveau 0 lorsqu'il n'y a pas non plus de profil. Un avertissement en bas de la vue 3D et dans les propriétés du corridor le précise. Ce n'est qu'une image : aucun volume ni profil n'en découle. Ouvrez des points topographiques ou une surface, et la route passe d'elle-même sur le terrain réel.

L'exagération verticale étire le terrain, pas les végétaux : ceux-ci se tiennent sur le terrain exagéré à leur hauteur réelle et leur étalement réel, de sorte qu'un arbre reste un arbre à tout réglage. Les végétaux sont des formes simples, non des modèles détaillés : des milliers d'entre eux restent rapides à tourner et à zoomer.

## Canalisations et ouvrages

- Une canalisation est dessinée avec son fond à l'intérieur des radiers que vous avez saisis, et son sommet (la clé de voûte) à un diamètre intérieur au-dessus. Les diamètres sont en pouces dans un projet en pieds et en millimètres dans un projet en mètres, comme dans le panneau de droite.
- Un ouvrage va de son tampon (saisi, ou issu de la surface) jusqu'à son puisard (le radier le plus bas moins la profondeur de puisard). Sans aucun radier, il est dessiné profond de 5 ft (1,5 m).
- Les canalisations et ouvrages présentant un problème (voir la vérification du réseau dans le panneau de droite) sont dessinés en rouge.
- Une canalisation sans radiers n'est pas dessinée ; une remarque en bas de la vue indique combien.

## Sélectionner depuis la vue 3D

Cliquez sur un tracé (ou sa route), une plateforme, une ligne caractéristique, une canalisation, un ouvrage, un point topographique, un végétal, une rampe ou un autre aménagement dur. Il est sélectionné exactement comme si vous l'aviez cliqué sur le plan : ses propriétés s'ouvrent dans le panneau de droite, où vous pouvez les modifier, et il est dessiné dans la couleur de sélection au-dessus de tout en 3D. Ce que vous sélectionnez sur le plan est aussi mis en évidence en 3D. Une info-bulle près du pointeur indique ce que vous avez cliqué, avec son est, son nord et son altitude. Les canalisations et ouvrages peuvent être cliqués même lorsqu'ils sont sous le terrain ; une ligne cachée derrière une colline ne peut pas être cliquée à travers elle.

Cliquez sur une ligne de rupture pour voir laquelle c'est : elle est mise en évidence, et la barre d'état la nomme (les lignes de rupture n'ont pas de propriétés propres).

Cliquez sur le terrain pour lire l'est, le nord et l'altitude à cet endroit dans l'info-bulle.

## Rouler le long d'un tracé

Cliquez sur **Conduire** dans la barre 3D et choisissez un tracé. La vue se place au poste de conduite : 3,5 ft (1,07 m) au-dessus de la route, sur son profil projet (sur le terrain existant le long de l'axe lorsqu'il n'en a pas encore), en regardant devant le long du tracé.

- **Lecture** ou {{key:Space}} roule à la vitesse que vous choisissez (10 à 65 mph, ou 15 à 100 km/h) ; {{key:Space}} de nouveau met en pause. Le parcours s'arrête à la fin ; **Lecture** repart alors du début.
- Le curseur va à n'importe quel PK ; {{key:Left}} et {{key:Right}} avancent ou reculent de 10 ft (5 m).
- Faire glisser dans la vue met en pause et vous laisse regarder autour.
- **Arrêter** ou {{key:Esc}} remet la vue là où elle était.

L'exagération verticale s'applique aussi pendant la conduite : réglez-la sur 1× pour voir la route telle qu'elle sera.

## Lumière du soleil

Ouvrez **Soleil** dans la barre 3D et cochez **Éclairage solaire**. Donnez une date, une heure et son fuseau horaire (le décalage par rapport à UTC : en été, celui de l'heure d'été), ainsi que la latitude et la longitude du site. Lorsque le projet a un système de coordonnées, elles sont remplies à partir de lui.

Le site est alors éclairé depuis la position du soleil, avec des **Ombres** portées sur le terrain, le corridor et les plateformes ; le menu indique l'azimut du soleil et sa hauteur, ou qu'il est sous l'horizon. Les positions proviennent des équations solaires de la NOAA. Les ombres tombent dans le bon sens à toute exagération, mais elles s'arrêtent au bord du site : collines et bâtiments situés au-delà n'en projettent aucune.

## Exporter la vue 3D

Cliquez sur {{ui:GLB}} ou {{ui:OBJ}} dans la barre. Ce que la vue affiche est enregistré à l'échelle réelle (sans exagération), en mètres, avec Y vers le haut. Détails : [Exporter le site en 3D](topic:export-3d).
