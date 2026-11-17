---
title: Nuages de points issus d'un drone ou d'un scanner
summary: Avec le module complémentaire Nuages de points, ouvrez un fichier LAS ou LAZ de millions de points, examinez-le en entier, nettoyez-le, triez-le en sol, végétation et bâtiments, puis construisez à partir de lui le terrain, les courbes de niveau et les volumes.
keywords: nuage de points, las, laz, drone, photogrammétrie, recap, lidar, scan, sol, classer, bruit, tas, volume, déblai et remblai, courbes de niveau, ligne de rupture, eye-dome, orthomosaïque, ortho, plaquer, couche cartographique, exporter las, exporter laz, compresser
from: e4a4901f
---

La plupart des gens n'en ont jamais besoin, c'est pourquoi il s'agit d'un module complémentaire. Activez {{ui:Nuages de points}} dans {{ui:Paramètres}} › {{ui:Modules complémentaires}} ; un onglet {{ui:Nuages de points}} apparaît dans le panneau de droite. Le fichier est lu dans votre navigateur et découpé en tuiles conservées dans le stockage propre à votre navigateur (ou dans un dossier de votre choix). **Rien n'est téléversé.**

:::warning
Tout ce que cet onglet affiche est un nombre issu de vos données, et non une certification. Il a été testé sur un site fictif, pas encore sur un vrai relevé par drone : lisez les premiers résultats avec prudence et dites-nous ce que vous constatez. C'est le professionnel inscrit qui décide de la valeur du terrain, des courbes de niveau et des volumes.
:::

## Ouvrir un nuage

Sous {{ui:Ouvrir un nuage}}, choisissez un fichier LAS ou LAZ. L'onglet indique le nombre de points qu'il contient, son système de coordonnées et ses unités, ainsi que l'espace nécessaire à la construction ; appuyez sur {{ui:Construire le nuage}}. Une construction peut être arrêtée puis reprise avec {{ui:Reprendre}} (choisissez à nouveau le même fichier). Le fichier n'est jamais modifié. Un fichier de 100 millions de points se construit en quelques minutes sur une station de travail, avec un espace à peu près égal à la taille du fichier.

Sous {{ui:Nuages sur cet ordinateur}}, vous ouvrez ou supprimez un nuage. {{ui:Conserver les nuages dans un dossier…}} (Chrome, Edge et l'application Studio) enregistre les tuiles dans un dossier de votre choix, par exemple un dossier de nuages CadCraft dans Documents, afin qu'un nuage de 10 GB n'ait pas à tenir dans le stockage du navigateur ; les nuages construits auparavant restent là où ils ont été construits. Le navigateur demande à nouveau l'autorisation après un redémarrage : appuyez sur {{ui:Utiliser à nouveau le dossier …}}.

## Examiner le nuage

{{ui:Examiner en 3D}} dessine le nuage à partir de tuiles grossières et l'affine à mesure que vous vous rapprochez, sans jamais dépasser {{ui:Nombre maximal de points affichés}} à la fois (2.5 millions ; 500 000 sur un téléphone). Colorez selon la couleur propre au fichier, la hauteur, la classe, l'intensité ou le résidu. {{ui:Éclairage eye-dome}} ombre les arêtes selon la profondeur pour que la forme se lise sans normales (désactivé sur un téléphone) ; {{ui:Réduire les points avec la distance}} rend les points lointains plus petits et les points proches plus grands ; {{ui:Taille des points}} règle la taille. Le plan affiche le nuage sous forme de trame sous votre dessin et **s'affine lorsque vous zoomez** sur une partie de celui-ci.

## Nettoyer le nuage

Sous {{ui:Nettoyer}}, tracez un lasso, un rectangle ou un polygone dans le plan (ou en 3D depuis la vue de dessus : en 3D, le contour est projeté verticalement, il n'est donc exact que vu d'en haut). L'onglet indique combien de points se trouvent à l'intérieur **avant** que vous n'appliquiez : {{ui:Supprimer ces points}}, {{ui:Modifier leur classe}}, {{ui:Restaurer les points supprimés}} ou {{ui:Recadrer sur cette limite}}. {{ui:Annuler}} et {{ui:Rétablir}} parcourent le journal des modifications ; le fichier lui-même n'est jamais modifié. {{ui:Filtre de bruit…}} marque les points isolés comme points bas (classe 7) ou bruit haut (classe 18).

## Trier les points

{{ui:Détecter le sol}} travaille tuile par tuile et marque le sol (classe 2) et les points bas ; la tolérance est de 0.15 m, ou de 0.08 m avec le commutateur de précision topographique. Il signale les jonctions de tuiles qui ne concordent pas. {{ui:Classer la végétation et les bâtiments}} marque ensuite la végétation basse, moyenne et haute ainsi que les bâtiments, à partir de la hauteur au-dessus du sol et de la planéité des abords. Il n'y a pas d'apprentissage automatique : un abri à toit plat sous des arbres peut être mal classé. Vérifiez.

## Terrain, courbes de niveau, lignes de rupture

{{ui:Construire le terrain}} crée le terrain existant à partir des points du sol et l'ajoute au projet de la même manière qu'un import LAS (une seule étape d'annulation). Il compare ensuite les points avec ce terrain : la moyenne, le RMS, le 95e centile, la part comprise dans la tolérance, et les dix endroits qui diffèrent le plus, chacun avec {{ui:Aller là}}. Colorer par {{ui:Résidu}} montre où le terrain et le nuage ne concordent pas.

Une **ligne de rupture** (une bordure, un fossé ou une crête de talus) se choisit sur le nuage : {{ui:Choisir une ligne de rupture sur le nuage}} dans la vue 3D prend à chaque clic le point dessiné le plus proche, et {{ui:Choisir une ligne de rupture dans le plan}} prend à chaque clic le point du nuage le plus proche (le sol d'abord) ; un double-clic ou la touche {{key:Enter}} termine la ligne. Le prochain {{ui:Construire le terrain}} l'utilise. {{ui:Afficher les courbes de niveau}} dessine les courbes de niveau sur le nuage dans une petite image et règle l'équidistance du projet.

## Volumes

{{ui:Volume de tas…}} calcule le volume de la surface au-dessus d'une base, à l'intérieur d'une limite que vous tracez. Tracez la limite sur un sol plat autour du tas et choisissez la base : le point le plus bas de la limite, un plan, une base courbe lisse, une surface passant par la limite, ou un niveau que vous saisissez. Sur un terrain en pente ou courbe, utilisez le plan ou la base courbe ; le point le plus bas donne une valeur trop élevée. Les points de limite qui dépassent les autres (un arbre sur la ligne) sont exclus de la base. {{ui:D'un vol à l'autre}} donne le déblai et le remblai entre deux nuages. Les deux résultats peuvent être enregistrés en CSV.

## Orthomosaïque

Sous {{ui:Orthomosaïque (image vue du dessus)}}, choisissez l'orthomosaïque du drone avec son fichier de géoréférencement et son `.prj` lorsqu'il en possède : un GeoTIFF, ou un PNG ou un JPEG. Elle devient une **couche cartographique** du projet : le plan l'affiche sous votre dessin, et la vue 3D (couleur {{ui:Carte}}) la plaque sur le terrain construit ; construisez donc d'abord {{ui:Construire le terrain}}. L'onglet indique la part du nuage couverte par l'image et avertit lorsqu'elle n'en couvre aucune : la cause habituelle est un système de coordonnées différent ; fournissez donc le fichier `.prj` avec elle. Sans `.prj`, le programme demande où se trouvent les coordonnées. L'image est conservée dans le fichier de projet ; un GeoTIFF de plus de 200 MB est refusé et une très grande mosaïque est réduite à 16 mégapixels. Pour un grand relevé, découpez donc d'abord la mosaïque sur le site.

## Exporter

{{ui:Exporter}} écrit le nuage nettoyé et classé dans un nouveau fichier (tous les points, les classes nettoyées, ou seulement le sol). Sous {{ui:Type de fichier}}, choisissez :

- **LAS 1.4 (non compressé)** : format de point 6, ou 7 avec couleur.
- **LAZ (compressé)** : les mêmes points, compressés sans perte, de sorte que chaque point est restitué à l'identique. Il est écrit au format de point 0, ou 2 avec couleur, dans un fichier LAS 1.4. Sur le site fictif de 300 m, le LAZ faisait environ un cinquième de la taille du fichier LAS 1.4. Les formats LAZ 0 et 2 ne contiennent que les classes 0 à 31 : un point de classe supérieure est refusé avec un message ; exportez donc ce nuage en LAS 1.4.

Le LAZ est écrit par le compresseur propre à CadCraft, réalisé à partir de la spécification LAZ publiée. Nous avons vérifié que notre propre lecteur et deux lecteurs LAZ indépendants (laz-perf, que l'application utilise pour ouvrir les fichiers LAZ, et laspy avec lazrs) restituent chaque point à l'identique, et que les fichiers LAZ produits par laspy sont identiques octet pour octet lorsque nous réécrivons leurs points. Les autres logiciels n'ont pas encore été testés : si l'un d'eux n'ouvre pas un fichier, dites-nous lequel.

Lorsque le navigateur peut écrire un fichier au fur et à mesure, vous choisissez d'abord le fichier, et un très grand nuage y est écrit tuile par tuile au lieu d'être rassemblé en mémoire ; sinon, le fichier est rassemblé puis téléchargé, ce qui convient jusqu'à quelques centaines de mégaoctets.

## Ce qu'il ne fait pas

Il ne lit que les LAS et LAZ (E57, PLY et PCD ne sont pas encore reliés à cet onglet, et plusieurs fichiers d'un même vol ne sont pas assemblés), ne reprojette pas un nuage (le système du projet et le mètre sont supposés), ne lit pas les fichiers RCP ou RCS d'Autodesk, ne crée pas de surface à partir de photographies, et ne détecte pas seul les poteaux, bordures ou canalisations.
