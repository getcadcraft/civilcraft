---
title: Concevoir un profil en long
summary: Ouvrir la vue de profil, démarrer un profil en long projet depuis le terrain, ajouter et déplacer des PIV, régler les longueurs de raccordement vertical, et lire les pentes, les valeurs K et les points hauts et bas.
keywords: profil, tracé vertical, PIV, raccordement vertical, pente, valeur K, sommet, creux, BVC, EVC, vue de profil, profil en long projet, profil du terrain naturel, lignes caractéristiques dans le profil, croisements, projection, bordure, fossé, étiquettes
from: dbb1f32d
---

Chaque tracé a un profil en long projet : une liste de PIV (PK et altitude) reliés par des pentes droites, avec un raccordement vertical parabolique symétrique à tout PIV intérieur qui a une longueur. Le profil du terrain naturel est échantillonné automatiquement depuis la surface.

## Ouvrir la vue de profil

1. Sélectionnez le tracé (cliquez dessus avec {{ui:Sélectionner}}).
2. Appuyez sur {{key:R}}, ou cliquez sur {{ui:Profil}} dans la barre d'outils, ou sur {{ui:Vue de profil}} en bas du panneau de droite.
   La vue de profil s'ouvre sous le plan avec le terrain naturel le long du tracé. Avec deux tracés ou plus, choisissez-en un dans la liste à gauche de la barre de profil.

La vue commence par montrer tout le tracé et étire les altitudes pour remplir le panneau ; l'exagération est affichée dans l'angle inférieur gauche, par exemple « Exagération verticale 10× ».

## Zoom et panoramique sur le profil

- **Zoom :** tournez la molette de la souris (ou pincez sur un pavé tactile) ; la vue zoome autour du pointeur. Maintenez {{key:Shift}} pour zoomer sur les PK seulement, ou {{key:Alt}} pour zoomer sur les altitudes seulement (cela modifie l'exagération). Lorsque la vue de profil a le focus, les touches plus et moins zooment au centre.
- **Panoramique :** faites glisser avec le bouton droit ou central de la souris, ou balayez à deux doigts sur un pavé tactile.
- **Ajuster :** double-cliquez sur le profil ou appuyez sur {{key:F}} pour afficher de nouveau tout le tracé.

La modification d'un PIV conserve le zoom que vous avez choisi ; la vue ne revient pas à l'ajustement.

Déplacez le pointeur le long du profil : la barre affiche le PK, les altitudes du terrain et du projet, la pente, le déblai ou le remblai à cet endroit, et un point suit sur le tracé dans le plan.

## Démarrer le profil en long projet

1. Dans le panneau de droite, sous **Profil en long projet**, cliquez sur {{ui:Commencer depuis le terrain}}.
   Deux PIV sont placés sur le terrain aux deux extrémités du tracé, reliés par une pente droite. La barre d'état indique « Profil en long projet démarré sur le terrain aux deux extrémités. Activez Ajouter des PIV et cliquez pour ajouter des ruptures de pente ; donnez-leur une longueur de raccordement dans le tableau. »

Si le tracé ne croise pas la surface, vous obtenez « Ce tracé n'a pas de terrain sous lui pour démarrer. » Ajoutez alors des PIV par clics (section suivante).

## Ajouter des PIV

1. Appuyez sur {{key:I}}, ou cliquez sur {{ui:Ajouter des PIV}} dans la barre de profil. Le bouton reste enfoncé.
2. Cliquez dans le profil à l'endroit où vous voulez une rupture de pente. Un PIV est ajouté à ce PK et à cette altitude, arrondi à 0.01, et sélectionné.
3. Ajoutez autant de PIV que nécessaire, puis appuyez de nouveau sur {{key:I}} pour arrêter.

Un clic à un endroit où il existe déjà un PIV est refusé (« Il existe déjà un PIV à … »). Les PIV restent toujours dans l'ordre des PK.

## Accrochage pendant l'ajout ou le déplacement

Le bouton **Accrochage** de la barre de profil est activé au départ. Lorsqu'il est actif, un PIV que vous ajoutez ou déplacez se place sur le PIV le plus proche, un point du terrain, le PK d'un PIV ou la ligne du terrain ; une étiquette près du repère indique lequel. Maintenez {{key:Alt}} pour un point libre, n'importe où.

## Ajuster les PIV

- **Faites glisser** un PIV dans le profil pour le déplacer. Il ne peut pas dépasser ses voisins. Le déplacement constitue une étape d'annulation.
- **Saisissez** des valeurs exactes dans le tableau des PIV du panneau de droite : **PK**, **Altitude**, **Pente %** et **Longueur L de raccordement**. Appuyez sur {{key:Enter}} après chacune.
- **Choisissez** une valeur dans le profil : le petit bouton à côté du PK ou de l'altitude d'un PIV attend un clic dans la vue de profil et y inscrit la valeur. Le clic s'accroche comme pour Ajouter des PIV ; maintenez {{key:Alt}} pour un point libre ; {{key:Esc}} annule.
- **Pente %** est la pente de la tangente qui part de ce PIV et va jusqu'au suivant. La saisir déplace l'altitude du **PIV suivant** (son PK ne bouge jamais). Si le PIV suivant est verrouillé, c'est l'altitude du PIV précédent qui bouge.
- **Verrouillez** un PIV avec le cadenas à l'extrémité de sa ligne. Un PIV verrouillé n'est pas déplacé, et une modification de pente ne le déplace pas. Si les deux extrémités d'une tangente sont verrouillées, sa pente ne peut pas changer : la barre d'état l'indique, et il faut d'abord déverrouiller l'une des extrémités. Le verrou est enregistré dans le fichier.
- **Supprimez** un PIV avec la croix à l'extrémité de sa ligne, ou sélectionnez-le (cliquez dessus) et appuyez sur {{key:Delete}}. Lorsque la vue de profil a le focus, {{key:Backspace}} le supprime aussi.

Le premier et le dernier PIV ne reçoivent jamais de raccordement.

## Raccordements verticaux

1. Saisissez une longueur dans **Longueur L de raccordement** pour un PIV intérieur, par exemple 200.
2. Le raccordement est tracé centré sur le PIV. Le profil et le panneau de droite indiquent sa nature (sommet ou creux), L et K, les PK et altitudes du BVC et de l'EVC, et son point haut ou bas lorsqu'il s'y trouve un à l'intérieur du raccordement.

K se calcule à partir de L (K = L divisé par la différence algébrique des pentes, en pourcentage). Vous saisissez L ; saisir K directement n'est pas encore possible.

Si un raccordement vertical ne tient pas, un cadre rouge indique pourquoi : il remonte dans le PIV ou le raccordement précédent, ou dépasse le PIV suivant, et indique la place disponible de ce côté (un raccordement a besoin de la moitié de sa longueur de chaque côté de son PIV). Son bouton fixe **le plus long raccordement possible**, avec son K, en une seule étape ({{key:Mod+Z}} l'annule). Ou éloignez les PIV.

## Lire les données

Sous le tableau des PIV, une liste donne chaque pente en pourcentage (« Pente 1 : +1.25% ») et chaque raccordement, par exemple « Sommet au 2+00.00 : L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40) », puis « Point haut 1+62.40, 254.12 ».

Si les PIV n'atteignent pas les deux extrémités du tracé, une remarque l'indique. Un corridor n'est construit que là où le profil et le tracé se chevauchent.

## Lignes caractéristiques dans le profil

Les lignes caractéristiques s'affichent aussi dans la vue de profil, afin de voir une bordure, un fossé ou le sommet d'un mur par rapport au profil de la route.

- Là où une ligne caractéristique **croise** le tracé, le profil montre un petit losange à ce PK et cette altitude, avec le nom de la ligne et son altitude à cet endroit (l'altitude propre de la ligne, calculée le long du segment qui croise).
- Saisissez une distance dans {{ui:Le long du tracé, dans}} pour aussi afficher les lignes caractéristiques qui **longent** le tracé à cette distance, en tirets à leur propre altitude. Vide ou 0 n'affiche que les croisements.
- Les repères et étiquettes suivent chaque modification : déplacez un sommet, saisissez une pente ou relevez la ligne, et le profil affiche aussitôt les nouvelles altitudes.
- Cliquez sur le losange d'un croisement pour sélectionner cette ligne caractéristique ; la ligne sélectionnée est dessinée dans la couleur de surbrillance.
- {{ui:Lignes caractéristiques}} dans la barre de profil masque ou affiche toutes les lignes. Les deux réglages sont enregistrés avec le projet.

Voir [Lignes caractéristiques](topic:feature-lines).

## Suite

- [Balayer un corridor routier](topic:corridor) le long de ce tracé et de ce profil.
- Le profil est écrit en LandXML avec le tracé ; voir [Échange LandXML](topic:landxml).
