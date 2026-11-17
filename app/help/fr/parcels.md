---
title: Dessiner des parcelles et rédiger leurs descriptions juridiques
summary: Dessinez une parcelle par ses coins ou saisissez les segments d'un titre de propriété, vérifiez la fermeture des segments, indiquez les gisements et distances sur le plan, transformez un segment en courbe et copiez un brouillon de description juridique.
keywords: parcelles, lots, limites de propriété, limite, titre de propriété, plan cadastral, bornage, gisement, distance, fermeture, erreur de fermeture, précision, description juridique, point de départ, courbe, rayon, surface, acres
from: 6793d6ce
---

Les parcelles figurent sur le plan avec le gisement et la distance le long de chaque segment droit (une courbe affiche son rayon, sa longueur et son angle au centre), ainsi que leur nom et leur surface au centre. Elles sont incluses dans le tracé PDF et dans les exports DWG et DXF, sur les calques `V-PROP` (lignes) et `V-PROP-TEXT` (étiquettes). Tout se trouve sous **Parcelles** dans le panneau de droite lorsque rien n'est sélectionné.

## Dessiner une parcelle

1. Cliquez sur **Dessiner une parcelle**.
2. Cliquez sur les coins, en commençant par le point de départ. Un clic près d'un point topographique reprend exactement la position de ce point.
3. Cliquez à nouveau sur le premier coin, ou appuyez sur {{key:Enter}}, pour terminer. {{key:Backspace}} annule le dernier coin ; {{key:Esc}} supprime les coins déjà placés ; appuyez à nouveau dessus pour quitter l'outil.

## Saisir les segments d'un titre de propriété

1. Cliquez sur **Saisir les segments du titre**.
2. Indiquez où commencent les segments : le numéro d'un point topographique, ou une coordonnée nord et une coordonnée est.
3. Saisissez ou collez les segments, un par ligne :
   - une droite : un gisement et une distance, par exemple `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` et les azimuts (`AZ 45°30'15"`) fonctionnent aussi, et « thence », les virgules et « feet » sont ignorés.
   - une courbe : `C R 300 L 52.36 right` (rayon et longueur d'arc) ou `C R 300 D 10°00'00" left` (rayon et angle au centre). Une courbe fait suite au segment qui la précède ; sinon, ajoutez son gisement de corde : `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` commence une ligne de commentaire.
4. Pendant la saisie, la boîte de dialogue affiche la longueur des segments, l'**erreur de fermeture** (l'écart entre le point d'arrivée et le point de départ, et sa direction), la **précision** (la longueur divisée par l'erreur de fermeture, 1 : 10,000 et ainsi de suite) et la surface. Les lignes qu'elle ne peut pas lire sont listées avec leur numéro.
5. **Ajouter la parcelle**. Si les segments ne se referment pas, la parcelle est fermée par un segment droit à travers l'écart : vérifiez les segments par rapport au titre. Pour répartir l'erreur d'un cheminement de terrain sur ses segments, ajustez-le d'abord.

## Courbes

Dans les **Propriétés** d'une parcelle, chaque segment a un **Rayon**. Saisissez-en un pour transformer ce segment en courbe passant par les deux mêmes coins (un rayon inférieur à la moitié de la distance entre les coins ne peut pas être atteint, il est donc refusé), puis choisissez **Droite** ou **Gauche** dans **Courbes** : une courbe à droite a son centre à droite du sens de parcours, comme dans un titre. Effacez le rayon pour rendre le segment à nouveau droit. Chaque modification correspond à une étape : {{key:Mod+Z}} l'annule.

## La description juridique

Les **Propriétés** d'une parcelle se terminent par sa description juridique, rédigée à partir du dessin :

- « Commençant à » le **Point de départ** que vous saisissez (par exemple « le coin nord-est du lot 4 »), sinon la coordonnée nord et est du premier coin, ou le point topographique d'où partaient les segments.
- « puis » pour chaque segment : un gisement et une distance, ou une courbe avec son rayon, sa longueur d'arc, son angle au centre, ainsi que son gisement et sa distance de corde.
- « Contenant » sa surface en pieds carrés et en acres (mètres carrés et hectares dans un projet en mètres).

**Copier** place la description dans le presse-papiers ; **Télécharger en texte** l'enregistre dans un fichier `.txt`.

:::warning
La description juridique est un brouillon issu du dessin, et non un levé. Un géomètre-expert agréé doit la vérifier par rapport aux documents de référence et la signer avant que quiconque s'y fie.
:::

Cliquez à l'intérieur d'une parcelle sur le plan pour la sélectionner ; {{key:Delete}} la supprime. Les parcelles sont enregistrées dans le fichier de projet.
