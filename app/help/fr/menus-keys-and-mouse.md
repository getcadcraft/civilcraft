---
title: Menus, touches et souris
summary: Choisissez un style de menus qui correspond à votre façon de travailler, donnez votre propre touche à n'importe quelle commande, déplacez les commandes entre les onglets du ruban, et réglez l'action de la molette et des boutons de la souris sur le plan et en 3D.
keywords: style de menus, menus, ruban, ruban civil, barre d'outils, ligne de commande, dessin classique, raccourcis clavier, touches de raccourci, touches, personnaliser, réattribuer, souris, molette, inverser, sens du zoom, bouton central, bouton droit, panoramique, orbite, exporter, importer, changer, habitudes
from: 07ac73a0
---

Les commandes de CivilCraft sont les mêmes quelle que soit la manière de les atteindre. Un **style de menus** détermine seulement où elles se trouvent à l'écran, comment elles s'appellent et quelles touches les lancent, afin que vous puissiez garder vos habitudes. Choisissez-en un dans {{ui:Paramètres}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menus, touches et souris}} ; le changement est immédiat et ce navigateur le mémorise.

## Les trois styles

| Style | Ce que vous obtenez |
|---|---|
| {{ui:CivilCraft}} | La barre d'outils propre à CivilCraft (Fichier, Exporter, Surface, Conception, Modifier, SIG, Affichage) et des touches simples : {{key:A}} alignement, {{key:G}} plateforme, {{key:P}} canalisations, {{key:B}} ligne de rupture, {{key:O}} limite, {{key:L}} ligne caractéristique, {{key:R}} profil, {{key:X}} coupes, {{key:E}} terrassement, {{key:D}} 3D, {{key:F}} ajuster, {{key:V}} sélectionner. Le point de départ. |
| {{ui:Dessin classique}} | Un petit ruban ({{ui:Accueil}}, {{ui:Insertion}}, {{ui:Sortie}}) et une ligne de commande, pour ceux qui saisissent les commandes : ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (annuler), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Saisissez n'importe où et les lettres vont à la ligne de commande ; {{key:Enter}} lance la commande, {{key:Enter}} sans rien saisi répète la dernière commande, {{key:Esc}} l'efface. Le bouton central fait un panoramique. |
| {{ui:Ruban civil}} | Des onglets de gros boutons, comme les logiciels de conception civile regroupent leurs outils : {{ui:Accueil}} (données de terrain, création de la conception, vues de profil et de coupe), {{ui:Surfaces}}, {{ui:Modifier}}, {{ui:Géolocalisation}}, {{ui:Affichage}} et {{ui:Sortie}}, avec un menu {{ui:Fichier}} et des boutons rapides à droite. Les touches simples restent actives. Le bouton central fait un panoramique du plan ; en 3D, le bouton central fait un panoramique et {{key:Shift}} avec le bouton central fait tourner la vue. |

Tous les styles conservent les touches {{key:Mod}} : {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Une touche qui appartient à la disposition propre à CivilCraft, mais que votre style a donnée à une autre commande, ne fait rien ; la ligne d'état indique où est passée sa commande (« Dans Mes touches, Plateforme est Ctrl+Alt+G »). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} et les flèches gardent toujours leur sens, et pendant le tracé d'une ligne ses points conservent leurs touches ({{key:Backspace}}, {{key:Enter}}).
:::

## Votre propre configuration

1. Choisissez le style le plus proche de ce que vous voulez, puis cliquez sur {{ui:Personnaliser…}}.
2. Dans {{ui:Touches et menus}}, trouvez une commande (la zone de recherche aide). Cliquez sur {{ui:Ajouter une clé}} puis appuyez sur la touche, ou sur deux touches à la suite pour une touche à deux lettres. Cliquez sur une touche pour la retirer.
3. Avec un ruban, {{ui:Emplacement}} déplace la commande vers un autre onglet et un autre panneau, vers le menu {{ui:Fichier}}, ou vers {{ui:Touches seulement}}.
4. Dans {{ui:Souris}}, réglez la molette, les boutons qui font le panoramique du plan, et ce que fait chaque bouton dans la vue 3D.
5. Donnez-lui un nom et cliquez sur {{ui:Enregistrer}}.

Enregistrer un style intégré crée votre propre copie (« Mon ruban civil ») ; le style intégré ne change jamais. Une touche donnée à deux commandes, ou une touche qui lancerait une commande avant qu'une touche à deux lettres puisse être saisie, s'affiche en rouge et doit être corrigée avant l'enregistrement.

## Souris

- **Molette de la souris** : {{ui:Faire défiler vers le haut zoome en avant}} (le point de départ) ou {{ui:Faire défiler vers le haut zoome en arrière}}, ainsi que la vitesse, sur le plan et en 3D. Le pincement sur pavé tactile zoome toujours dans le sens du mouvement de vos doigts.
- **Panoramique du plan avec** : le bouton central, le bouton droit, ou les deux. {{key:Space}} et le glissement font aussi un panoramique. Le bouton gauche sert toujours à désigner et à dessiner.
- **Glisser dans la vue 3D** : {{ui:Propre à chaque vue}} conserve les boutons de CivilCraft (gauche fait tourner, droit fait un panoramique). Vous pouvez aussi régler chaque bouton sur rotation, panoramique, zoom ou rien ; {{key:Shift}} avec le bouton inverse la rotation et le panoramique. Un clic sans glisser désigne quand même.

## Emporter votre configuration

{{ui:Exporter}} enregistre le style utilisé dans un petit fichier `.ccinput.json` ; {{ui:Importer…}} en ajoute un, venant d'un autre ordinateur ou d'un collègue. Un fichier importé ne peut désigner que les commandes propres à CivilCraft : le reste est omis et compté dans la ligne d'état. {{ui:Supprimer ce style}} supprime l'un de vos propres styles.

:::note
Ces réglages restent dans ce navigateur. {{ui:Utiliser ce style dans toutes les applications}}, sous les cartes de style, fait s'ouvrir chaque application dans le style correspondant (sa propre barre d'outils, un ruban ou Dessin classique), avec les modifications que vous avez faites dans chaque application. CivilCraft n'a pas de style à barre de menus : lorsque la barre de menus d'une autre application est choisie pour toutes les applications, CivilCraft garde sa propre barre d'outils.
:::

Voir aussi : [Clavier et souris](topic:keyboard) · [Paramètres de CivilCraft](topic:settings) · [Venir d'autres logiciels de génie civil](topic:coming-from)
