---
title: Volumes de terrassement
summary: Lisez les volumes de déblai, de remblai et net entre le terrain existant et la surface projetée, par plateforme et par corridor et au total, et comprenez la méthode par grille qui les sous-tend.
keywords: volumes, terrassement, déblai, remblai, net, déblai et remblai, quantitatifs, méthode par grille, comparaison de surfaces, surface de volume, verges cubes, mètres cubes
from: 299d7bc7
---

Dès qu'une plateforme ou un corridor se terrasse sans problème, CivilCraft compare la surface projetée au terrain existant et indique le déblai et le remblai. Les chiffres se mettent à jour à chaque modification.

## Où les lire

- **Terrassement** dans le panneau de droite sans rien de sélectionné (la vue **Projet**), lorsqu'il existe au moins une plateforme ou un corridor.
- **Terrassement** dans le panneau de droite lorsqu'une plateforme est sélectionnée (mêmes totaux pour tout le projet).
- La ligne sous les réglages d'un corridor, avec le déblai et le remblai propres à ce corridor.

Le bloc **Terrassement** affiche :

- **Déblai**, **Remblai** et **Net** (avec « remblai » ou « déblai » après, selon le plus grand)
- une ligne par élément lorsqu'il y en a plusieurs, par exemple « Plateforme 1 : déblai 120.4 cu yd, remblai 310.2 cu yd »
- la ligne de méthode : « Méthode par grille : terrain existant et surface terrassée, échantillonnés tous les 0.5 ft à l'intérieur des lignes de raccordement (92,891 cellules). Aucun foisonnement ni retrait appliqué. »

Les volumes sont exprimés en verges cubes dans un projet en pieds et en mètres cubes dans un projet en mètres.

## Les envoyer vers TakeoffCraft

Pour chiffrer le terrassement, choisissez {{ui:Envoyer à TakeoffCraft}} au pied du bloc **Terrassement**. CivilCraft enregistre un fichier de quantitatifs (`<site>.quantities.json`) avec deux quantités : déblai et remblai, en verges cubes (projet en pieds) ou en mètres cubes (projet en mètres), mêmes nombres que le bloc, au centième près. Ouvrez-le dans TakeoffCraft avec **Ouvrir le métré**, ou déposez-le dans l'application : il devient deux postes que vous pouvez chiffrer ([Déblai et remblai depuis CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Renvoyez après une modification et ouvrez le nouveau fichier : les mêmes postes reprennent les nouveaux nombres.

Seuls les totaux sont envoyés, si bien que rien n'est compté deux fois ; la note du fichier liste le déblai et le remblai propres à chaque plateforme et à chaque corridor.

## Comment ils sont calculés

CivilCraft utilise la **méthode par grille** :

1. Une grille de cellules carrées est posée sur la zone à l'intérieur de chaque ligne de raccordement.
2. Au centre de chaque cellule, les deux surfaces sont échantillonnées.
3. Chaque cellule compte comme un prisme : la différence d'altitude multipliée par la surface de la cellule. Là où la surface projetée est plus basse, c'est du déblai ; plus haute, du remblai.
4. Les cellules sont additionnées.

La taille des cellules est choisie automatiquement pour que le rectangle autour des zones terrassées contienne environ 250,000 cellules, arrondie à une valeur simple (1, 2 ou 5 fois une puissance de dix). Vous ne pouvez pas la définir vous-même pour l'instant. La ligne de méthode indique la taille et le nombre de cellules. Des cellules plus petites sont plus précises le long des bords ; sur des cellules entières entre des plans plats, le résultat est exact.

## À savoir

- Seule la zone à l'intérieur des lignes de raccordement est comptée. Le terrain situé à l'extérieur reste inchangé.
- Une plateforme ou un corridor présentant un problème n'est pas pris en compte et n'ajoute rien. Si le bloc indique « Pas encore de volumes : une plateforme doit se terrasser sans problème. », cherchez un cadre rouge au-dessus.
- Lorsque des éléments se chevauchent, le dernier a remplacé le précédent à l'intérieur de sa ligne de raccordement, et le chevauchement n'est compté qu'une fois.
- Aucun coefficient de foisonnement ou de retrait n'est appliqué. Multipliez vous-même les résultats si vous avez besoin de volumes en place, foisonnés ou compactés.
- Le décapage de la terre végétale, les épaisseurs de chaussée et de couche de forme, et les volumes par prismes TIN à TIN ne sont pas encore disponibles.

## Vérifier un résultat

- Activez {{ui:Projet (terrassé)}} sous **Affichage** et regardez les courbes de niveau à l'intérieur des lignes de raccordement.
- Déplacez le pointeur sur la zone terrassée : la barre d'état affiche **Terrain** et **Terrassé**. La différence correspond à la profondeur de déblai ou de remblai à cet endroit.
- Pour un corridor, la lecture de la vue de profil indique le déblai ou le remblai sur l'axe à chaque station.
