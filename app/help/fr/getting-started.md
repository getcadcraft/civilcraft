---
title: Premiers pas avec CivilCraft
summary: Ce que fait CivilCraft, comment l'ouvrir, et vos dix premières minutes avec le site exemple, des points aux courbes de niveau, d'une route à un projet enregistré.
keywords: démarrer, premier lancement, site exemple, introduction, démarrage rapide, tutoriel, commencer, nouveau projet
from: c9b6dd8e
---

CivilCraft est l'application de conception de génie civil et de sites de la famille CadCraft. À partir de points topographiques, elle construit une surface (un TIN) avec ses courbes de niveau, puis vous permet de dessiner des tracés en plan avec leurs profils en long de projet, de balayer un corridor routier simple, de terrasser des plateformes jusqu'aux talus de raccordement, de vérifier un réseau de canalisations gravitaires par rapport à vos règles et de voir les volumes de déblai et de remblai. Elle lit et écrit du LandXML, exporte le plan en DXF et le trace en PDF.

Si vous avez déjà utilisé Civil 3D, les notions vous seront familières : points, groupes de points, lignes de rupture, tracés en plan par PI, profils en long par PIV, corridors, terrassement, réseaux de canalisations. La façon de travailler est différente, et bien plus légère : pas de ligne de commande, pas de styles et pas de fichier de dessin. Lisez une fois [Venir d'un autre logiciel de génie civil](topic:coming-from) avant votre premier vrai chantier.

## Ce qu'il vous faut

- Un navigateur de bureau récent : Chrome, Edge, Firefox ou Safari. Voir [Navigateurs](common:browsers).
- Une souris ou un pavé tactile et un clavier, ou un écran tactile : le dessin y dispose de boutons à l'écran {{ui:Terminer}}, {{ui:Annuler le point}} et {{ui:Annuler}} (voir [Souris, pavé tactile et écran tactile](topic:keyboard#mouse-trackpad-and-touch)).
- Le plan est dessiné en 2D avec le canvas du navigateur. La [vue 3D](topic:site-3d) utilise les graphismes WebGL du navigateur ; si elle ne peut pas démarrer, la barre d'état en donne la raison et le plan fonctionne quand même.
- Pas de compte et pas de téléversement. Les fichiers s'ouvrent sur votre ordinateur et s'enregistrent sous forme de téléchargements. Voir [Vos fichiers](common:your-files).

:::note
CivilCraft fonctionne aujourd'hui comme une version navigateur préliminaire, encore en cours de développement. Les versions de bureau ne sont pas encore disponibles, et l'enregistrement dans le cloud non plus. Tout ce que vous faites reste sur votre ordinateur jusqu'à ce que vous l'enregistriez ou l'exportiez.
:::

## Ouvrir CivilCraft

1. Ouvrez CivilCraft dans votre navigateur.
2. Attendez que l'écran se remplisse : une barre d'outils en haut, un panneau à gauche, le plan au milieu et un panneau **Propriétés** à droite.
3. Sur un plan vide, vous voyez un cadre intitulé **Commencez par des points topographiques**. Il énumère les premières étapes et contient un lien, {{ui:Ouvrir le site exemple}}.

Pour utiliser CivilCraft plus tard sans connexion, cliquez sur {{ui:Enregistrer pour le hors ligne}} dans la barre d'application et attendez {{ui:Prêt hors ligne}}. Cela inclut cette aide, le site exemple et les bibliothèques 3D et SIG. Voir [Hors ligne](common:offline). Appuyez sur {{key:F1}} ou cliquez sur {{ui:Aide}} à tout moment pour ouvrir cette aide à côté de l'application.

## Vos dix premières minutes : le site exemple

Le site exemple est un petit levé en pieds US : 276 points en coordonnées plan d'État, une crête, un talweg avec une ligne d'écoulement et deux hauts de berge. Il est fourni avec l'application, vous pouvez donc suivre sans fichier à vous.

1. Cliquez sur {{ui:Ouvrir le site exemple}} dans le cadre du plan.
   La boîte de dialogue **Importer des points** s'ouvre. Elle indique « 276 points lus au format PNEZD (d'après la ligne d'en-tête), séparés par des virgules. » et affiche les premières lignes.
2. Cliquez sur {{ui:Importer}}.
   Le plan se remplit de points, de courbes de niveau et du bord de la surface. La barre d'état en bas indique que les points ont été importés et combien de triangles compte la surface (546).
3. Regardez le panneau de gauche sous **Points**. Les points sont regroupés selon le premier mot de leur description : CP, FL, GRD, RIDGE, TBN, TBS et TREE.
4. Dans la colonne **Surface** de ce tableau, réglez **FL**, **RIDGE**, **TBN** et **TBS** sur {{ui:Ligne de rupture}}.
   La surface se reconstruit aussitôt. Les données de **Surface** indiquent maintenant « Lignes de rupture : 4 », et les courbes de niveau s'infléchissent nettement le long de la ligne d'écoulement et de la crête au lieu de les couper.
5. Déplacez le pointeur sur le plan. La barre d'état affiche l'abscisse (Est) et l'ordonnée (Nord) sous le pointeur, ainsi que l'altitude du terrain à cet endroit.
6. Sous **Affichage**, réglez {{ui:Courbes tous les}} sur 0.5 ft et activez {{ui:Tranches d'altitude}}. Un dégradé de couleurs apparaît avec une légende sous les cases à cocher. Désactivez les tranches quand vous avez terminé.

Vous avez maintenant une surface de terrain existant. Passons à une route.

## Tracer une courte route

1. Appuyez sur {{key:A}} (ou cliquez sur {{ui:Tracé}} dans le groupe **Conception**).
2. Cliquez sur trois points à travers le site, l'un après l'autre. Une ligne rouge suit le pointeur et indique la longueur et le gisement de l'alignement droit suivant.
3. Appuyez sur {{key:Enter}} pour terminer.
   Le tracé en plan apparaît avec ses points kilométriques. Le panneau de droite affiche **Tracé en plan** : sa longueur, le tableau des PI et la courbe au PI central (rayon de 100 ft, ou plus petit si 100 ft ne convient pas).
4. Dans le panneau de droite, sous **Profil en long de projet**, cliquez sur {{ui:Commencer depuis le terrain}}.
   La vue en profil s'ouvre sous le plan avec le terrain existant et une pente de projet rectiligne d'un bout à l'autre.
5. Appuyez sur {{key:I}} pour activer {{ui:Ajouter des PIV}}, puis cliquez une fois dans la vue en profil près du milieu. Un PIV apparaît.
6. Dans le tableau des PIV à droite, saisissez une longueur de courbe (par exemple 100) dans la case **Long. courbe** du PIV central et appuyez sur {{key:Enter}}. Le profil comporte maintenant une courbe verticale, avec sa valeur K indiquée.
7. Sous **Corridor**, cochez **Balayer un assemblage le long du profil de projet**.
   La route est terrassée dans le terrain : voies, accotements et talus jusqu'au raccordement. Le bloc **Mouvements de terres** indique le déblai et le remblai.

Ne vous souciez pas des valeurs exactes. Chaque nombre peut être modifié dans le panneau de droite, et {{key:Mod+Z}} annule la dernière modification.

## Enregistrer votre travail

1. Saisissez un nom dans **Nom** en haut du panneau de gauche.
2. Appuyez sur {{key:Mod+S}} (ou cliquez sur {{ui:Enregistrer}}).
   Le navigateur télécharge un fichier portant le nom du site et se terminant par `.civilcraft.json`. Il contient les points, les paramètres de surface, les tracés en plan, les profils, les corridors, les plateformes et les canalisations.
3. Pour continuer plus tard, cliquez sur {{ui:Ouvrir}} (ou appuyez sur {{key:Mod+O}}) et choisissez ce fichier, ou déposez-le sur le plan.

:::warning
Il n'y a pas d'enregistrement automatique. Si vous fermez l'onglet avec des modifications non enregistrées, le navigateur demande si vous voulez quitter ; si vous quittez, les modifications sont perdues. Enregistrez souvent.
:::

## Pour continuer

- [Importer des points topographiques](topic:import-points) avec vos propres fichiers.
- [Construire et affiner la surface](topic:build-surface) avec des lignes de rupture et un contour.
- [L'écran, partie par partie](topic:workspace).
- [Touches et souris](topic:keyboard).
