---
title: Saisir un cheminement et le compenser par la règle de la boussole
summary: Saisissez les angles ou gisements de terrain et les distances, vérifiez la fermeture angulaire et linéaire ainsi que la précision, compensez par la règle de la boussole, puis ajoutez les stations comme points topographiques ou la boucle comme parcelle.
keywords: cheminement, cheminement fermé, boucle, angles à droite, visée arrière, gisements, distances, fermeture, écart de fermeture, précision, règle de la boussole, bowditch, compensation, levé
from: 56ce5a8c
---

Un cheminement est une suite de côtés mesurés : à chaque station, un angle (ou un gisement) et une distance jusqu'à la station suivante. Cliquez sur **Saisir un cheminement** sous **Cheminement** dans le panneau de droite lorsque rien n'est sélectionné.

## Où il commence et où il finit

1. **Départ au point topographique** : son numéro. Ou saisissez une coordonnée Nord et une coordonnée Est.
2. **Côtés sous forme de** : **Angles à droite et distances**, ou **Gisements et distances**.
3. Avec des angles, indiquez leur origine : un **Point topographique de visée arrière**, ou **son azimut** (depuis la première station vers la visée arrière, dans le sens horaire à partir du nord).
4. **Fin** : **retour au départ (boucle)**, ou **sur point topographique** et son numéro (cheminement ouvert entre des points connus).

## Saisir les côtés

Un côté par ligne, puis la distance, puis un nom pour la station qu'il atteint, si vous le souhaitez :

- Angles à droite, mesurés dans le sens horaire à la station que quitte le côté, de la station arrière vers la suivante : `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` et `270.0028` fonctionnent aussi.
- Gisements : `N 45°30'15" E 125.50 B`, ou un azimut en un seul mot : `AZ 45-30-15 125.50 B`.
- Sur une boucle à angles, terminez par `close` et l'angle au départ, à nouveau, mesuré depuis la dernière station vers la deuxième : `close 270°00'05"`. C'est ce qui contrôle les angles.

Les lignes illisibles sont listées avec leur numéro de ligne. Les mots « feet », les virgules et les lignes de commentaire `#` sont acceptés.

## Lire la fermeture

Au fur et à mesure de la saisie, la boîte de dialogue affiche :

- **Écart angulaire** : l'écart des angles par rapport à la fermeture, et la part que prend chaque angle. Sans angle de fermeture, les angles ne sont pas contrôlés, et toute erreur sur eux apparaît dans l'écart linéaire.
- **Écart linéaire** : à quelle distance du point d'arrivée prévu le cheminement se termine, et dans quelle direction.
- **Précision** : la longueur du cheminement divisée par l'écart linéaire : 1 : 10,000 signifie 1 ft pour 10,000 ft.
- Les stations après compensation, et la distance dont chacune s'est déplacée.

## La compensation

D'abord, l'écart angulaire est réparti également entre les angles. Puis l'écart linéaire est réparti sur les côtés par la règle de la boussole (Bowditch) : chaque station se déplace à l'inverse de l'écart, proportionnellement à la longueur parcourue pour l'atteindre, de sorte que le cheminement se termine exactement là où il doit.

:::note
La règle de la boussole est une compensation standard, et non une compensation par moindres carrés ; elle ne pondère pas les angles par rapport aux distances. Savoir si la précision est suffisante relève de vos propres normes et de celles de votre juridiction.
:::

## Utiliser le résultat

- **Ajouter comme points topographiques** : les stations compensées deviennent des points topographiques avec les noms que vous avez donnés (sinon les prochains numéros libres), description `TRAV`, sans altitude. La dernière station d'une boucle est son point de départ, elle n'est donc pas ajoutée deux fois. Une seule étape : {{key:Mod+Z}} l'annule.
- **Ajouter comme parcelle** (boucles) : les stations compensées deviennent une [parcelle](topic:parcels), avec ses libellés et sa description légale.
- **Rapport (CSV)** : les lignes de fermeture, puis pour chaque station la direction, la distance, les coordonnées non compensées et compensées, et les corrections.
