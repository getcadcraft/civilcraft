---
title: Paramètres de CivilCraft
summary: Choisir l'ordre des colonnes pour les lignes de points copiées et collées et pour deviner les colonnes d'un fichier, la numérotation des points collés, ce qu'affichent les libellés de points, l'indicateur de coin, l'exagération verticale en 3D, l'affichage de la latitude et de la longitude, et si les couches cartographiques viennent d'internet.
keywords: paramètres, préférences, pnezd, penzd, ordre des colonnes, lignes de points, renuméroter, numéros de points, numéro de départ, libellés de points, étiquettes, description, altitude, viewcube, icône des axes, indicateur de coin, boussole, exagération verticale, 3d, latitude, longitude, dms, degrés décimaux, couches cartographiques, internet, confidentialité
from: 64b9cb92
---

Ouvrez {{ui:Paramètres}} avec l'engrenage de la barre d'application ou avec {{key:Mod+,}}. Le premier onglet, {{ui:CivilCraft}}, regroupe les paramètres propres à cette application ; {{ui:General}} regroupe ceux que partagent toutes les applications CadCraft (thème, barre d'outils, panneaux). Les paramètres de CivilCraft n'existent que dans l'application : vous les modifiez ici, et ce navigateur s'en souvient. {{ui:Réinitialiser les paramètres de CivilCraft}} remet chaque paramètre à sa valeur de départ.

## Lignes de points

**P, N, E, Z, D** (au départ) ou **P, E, N, Z, D** : point, nord, est, altitude, description, ou est avant nord. Il sert à trois endroits :

- **Copier** : les lignes que CivilCraft place dans le presse-papiers du système pour un tableur.
- **Coller** : les lignes collées depuis un tableur ou un fichier texte qui n'ont pas de ligne d'en-tête.
- **Importer** : la supposition de la boîte de dialogue **Importer des points** lorsqu'un fichier n'a pas de ligne d'en-tête (un fichier à quatre colonnes se lit PENZ, à trois colonnes ENZ). Voir [Formats de fichiers de points](topic:point-file-formats).

Une ligne d'en-tête qui nomme ses colonnes l'emporte toujours, de même qu'un choix dans la liste **Colonnes** de la boîte de dialogue d'importation.

## Numéros des points collés

- **Garder les numéros libres** (au départ) : un point collé garde son numéro lorsqu'aucun point ne l'utilise ; seuls les points en conflit reçoivent un nouveau numéro.
- **Toujours de nouveaux numéros** : chaque point collé reçoit un nouveau numéro, même si le sien est libre.

**Les nouveaux numéros commencent à** : laissez vide pour compter à partir d'un de plus que le plus grand numéro utilisé. Saisissez un numéro, par exemple 5000, pour donner aux nouveaux points des numéros à partir de 5000 ; les numéros déjà utilisés sont sautés. Deux points ne partagent jamais un même numéro dans les deux cas. Voir [Sélectionner, copier et coller des points topographiques](topic:copy-paste-points#point-numbers-never-clash).

## Libellés de points

Ce qu'affiche un libellé de point lorsque {{ui:Libellés de points}} est activé sous **Affichage** : **Numéro**, **Numéro et altitude**, ou **Numéro, altitude et description** (au départ). Les exports DXF, DWG et PDF affichent les mêmes libellés que l'écran.

## Indicateur de coin

Ce qui apparaît dans le coin du plan et de la vue 3D : **ViewCube** (au départ), **Icône des axes** ou **Aucun**.

- **ViewCube** (en haut à droite). Sur le plan, il montre le dessus, avec l'anneau de la boussole : N est le nord de la grille (vers le haut du plan). Cliquez sur une autre face, arête ou un autre coin du cube, ou faites-le glisser, et la [vue 3D](topic:site-3d) s'ouvre en regardant depuis ce côté. {{ui:Accueil}} sur le cube du plan ajuste le plan.
- Dans la vue 3D, le cube tourne avec la vue : cliquez sur une face, une arête ou un coin pour regarder depuis là, faites glisser le cube pour orbiter, faites glisser l'anneau de la boussole pour tourner autour de la verticale, cliquez sur une lettre pour regarder depuis ce côté, et utilisez {{ui:Accueil}} pour la vue iso de tout le site. Lorsque vous regardez droit une face, de petites flèches passent à la face suivante et les flèches courbes tournent la vue d'un quart de tour.
- **Icône des axes** (en bas à gauche) : un petit repère X (est) et Y (nord) sur le plan, X, Y et Z (vers le haut) en 3D.

## Exagération verticale en 3D

De combien la vue 3D étire les altitudes : **1×**, **2×** (au départ), **3×**, **5×** ou **10×**. La liste de la barre de la vue 3D est le même paramètre : modifier l'un modifie l'autre. Les volumes, les profils et les exports 3D restent à l'échelle réelle.

## Latitude et longitude

Comment la barre d'état affiche la latitude et la longitude du pointeur lorsque le projet a un système de coordonnées : **degrés, minutes et secondes** (au départ, par exemple `30°18′00.00″ N`) ou **degrés décimaux** (`30.300000° N`). Voir [Définir le système de coordonnées du projet](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Couches cartographiques depuis internet

**Désactivé** (au départ) ou **Activé**. Lorsqu'il est activé, CivilCraft demande aux serveurs cartographiques que vous ajoutez des images de la zone affichée à l'écran. Votre dessin reste sur cet ordinateur ; le serveur voit la zone et votre adresse internet. Tant que ce paramètre est désactivé, aucun serveur cartographique n'est sollicité, même lorsqu'un projet ouvert en nomme un ; une image géoréférencée issue d'un fichier fonctionne dans les deux cas. Voir [Afficher des couches cartographiques sous le plan](topic:map-layers).

## Assistants

**Autoriser les assistants IA et les scripts à utiliser CivilCraft** (désactivé au départ) permet à un assistant de votre ordinateur d'accéder au site ouvert via CadCraft Studio : **Lire** décrit le site et fournit des points, des altitudes de surface, des PK, des profils, des volumes et des parcelles ; **Modifier** lui permet de sélectionner et d'ajouter des points topographiques ; **Enregistrer** et **Exporter** lui permettent d'enregistrer le projet et d'écrire un LandXML ou un DWG. **Dossiers autorisés** (dans Studio) désignent les emplacements où il peut enregistrer et exporter. **Activité** liste ses appels. Voir [Laisser un assistant IA travailler avec votre site](topic:assistants).
