---
title: Concevoir un profil en long
summary: Ouvrez la vue de profil, démarrez un profil en long de projet depuis le terrain, ajoutez et faites glisser des PIV, définissez les longueurs des courbes verticales et lisez les pentes, les valeurs K et les points haut et bas.
keywords: profil, tracé, piv, courbe verticale, pente, valeur k, crête, creux, dcv, fcv, vue de profil, profil fini, fg, profil du terrain existant, lignes caractéristiques dans le profil, croisements, projeté, bordure, fossé, étiquettes
from: e9182bfa
---

Chaque tracé a un profil en long de projet : une liste de PIV (point kilométrique et altitude) reliés par des pentes droites, avec une courbe verticale parabolique symétrique à chaque PIV intermédiaire qui a une longueur. Le profil du terrain existant est échantillonné automatiquement depuis la surface.

## Ouvrir la vue de profil

1. Sélectionnez le tracé (cliquez dessus avec {{ui:Sélectionner}}).
2. Appuyez sur {{key:R}}, ou cliquez sur {{ui:Profil}} dans la barre d'outils, ou sur {{ui:Vue de profil}} en bas du panneau de droite.
   La vue de profil s'ouvre sous le plan avec le terrain existant le long du tracé. Avec deux tracés ou plus, choisissez-en un dans la liste à gauche de la barre de profil.

La vue affiche toujours le tracé entier et étire les altitudes pour remplir le panneau ; l'exagération est indiquée dans le coin inférieur gauche, par exemple « Exagération verticale 10× ». Elle ne permet ni zoom ni panoramique.

Déplacez le pointeur le long du profil : la barre affiche le point kilométrique, les altitudes du terrain et du projet, la pente, le déblai ou le remblai à cet endroit, et un point suit le tracé sur le plan.

## Démarrer le profil en long de projet

1. Dans le panneau de droite, sous **Profil en long de projet**, cliquez sur {{ui:Commencer depuis le terrain}}.
   Deux PIV sont placés sur le terrain aux deux extrémités du tracé, reliés par une seule pente droite. La barre d'état indique « Profil en long de projet démarré sur le terrain aux deux extrémités. Activez Ajouter des PIV et cliquez pour ajouter des ruptures de pente ; donnez-leur une longueur de courbe dans le tableau. »

Si le tracé ne croise pas la surface, le message « Ce tracé n'a pas de terrain sous lui pour démarrer. » apparaît. Ajoutez alors des PIV en cliquant (section suivante).

## Ajouter des PIV

1. Appuyez sur {{key:I}}, ou cliquez sur {{ui:Ajouter des PIV}} dans la barre de profil. Le bouton reste enfoncé.
2. Cliquez dans le profil à l'endroit où vous voulez une rupture de pente. Un PIV est ajouté à ce point kilométrique et à cette altitude, arrondi à 0.01, et sélectionné.
3. Ajoutez-en autant que nécessaire, puis appuyez de nouveau sur {{key:I}} pour arrêter l'ajout.

Un clic sur un PIV existant est refusé (« Il existe déjà un PIV à … »). Les PIV restent toujours dans l'ordre des points kilométriques.

## Ajuster les PIV

- **Faites glisser** un PIV dans le profil pour le déplacer. Il ne peut pas dépasser ses voisins. Le déplacement forme une seule étape d'annulation.
- **Saisissez** des valeurs exactes dans le tableau des PIV du panneau de droite : **Point kilométrique**, **Altitude** et **Longueur L** (longueur de la courbe verticale). Appuyez sur {{key:Enter}} après chacune.
- **Supprimez** un PIV avec la croix en fin de ligne, ou sélectionnez-le (cliquez dessus) et appuyez sur {{key:Delete}}. Lorsque la vue de profil a le focus, {{key:Backspace}} le supprime aussi.

Le premier et le dernier PIV ne reçoivent jamais de courbe.

## Courbes verticales

1. Saisissez une longueur dans **Longueur L** pour un PIV intermédiaire, par exemple 200.
2. La courbe est dessinée centrée sur le PIV. Le profil et le panneau de droite affichent son type (crête ou creux), L et K, les points kilométriques et altitudes du DCV et du FCV, ainsi que son point haut ou bas lorsqu'il s'en trouve un dans la courbe.

K est calculé à partir de L (K = L divisé par la différence algébrique des pentes, en pourcentage). Vous saisissez L ; la saisie directe de K n'est pas encore disponible.

Si une courbe verticale ne tient pas, un cadre rouge indique la raison : elle empiète sur le PIV ou la courbe qui le précède, ou dépasse le PIV suivant, avec l'espace disponible de ce côté (une courbe a besoin de la moitié de sa longueur de chaque côté de son PIV). Son bouton règle **la plus longue courbe possible**, avec son K, en une seule étape ({{key:Mod+Z}} l'annule). Ou éloignez les PIV.

## Lire les données

Sous le tableau des PIV, une liste donne chaque pente en pourcentage (« Pente 1 : +1.25% ») et chaque courbe, par exemple « Crête au 2+00.00 : L 200.00, K 85.3, DCV 1+00.00 (253.10), FCV 3+00.00 (252.40) », puis « Point haut 1+62.40, 254.12 ».

Si les PIV n'atteignent pas les deux extrémités du tracé, une note le signale. Un corridor n'est construit que là où le profil et le tracé se recouvrent.

## Lignes caractéristiques dans le profil

Les lignes caractéristiques s'affichent aussi dans la vue de profil, pour voir une bordure, un fossé ou le haut d'un mur par rapport au profil de la route.

- Là où une ligne caractéristique **croise** le tracé, le profil affiche un petit losange à ce point kilométrique et à cette altitude, avec le nom de la ligne et son altitude à cet endroit (l'altitude propre à la ligne, calculée le long du segment qui croise).
- Saisissez une distance dans {{ui:Le long du tracé, dans}} pour dessiner aussi les lignes caractéristiques qui **longent** le tracé dans cette distance, en tirets à leur propre altitude. Vide ou 0 n'affiche que les croisements.
- Les repères et étiquettes suivent chaque modification : déplacez un sommet, saisissez une pente ou relevez la ligne, et le profil affiche aussitôt les nouvelles altitudes.
- Cliquez sur le losange d'un croisement pour sélectionner cette ligne caractéristique ; la ligne sélectionnée est dessinée dans la couleur de surbrillance.
- {{ui:Lignes caractéristiques}} dans la barre de profil les masque ou les affiche toutes. Les deux réglages sont enregistrés avec le projet.

Voir [Lignes caractéristiques](topic:feature-lines).

## Pour aller plus loin

- [Balayer un corridor routier](topic:corridor) le long du tracé et de ce profil.
- Le profil est écrit en LandXML avec le tracé ; voir [Échanger du LandXML](topic:landxml).
