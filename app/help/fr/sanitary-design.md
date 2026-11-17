---
title: Calculer les débits de dimensionnement des eaux usées et vérifier le collecteur
summary: Saisissez les habitants et la surface qui se raccordent à chaque regard d'un réseau d'eaux usées ; CivilCraft les cumule en aval du réseau, calcule le débit de pointe avec un coefficient de pointe et l'infiltration, et vérifie la capacité et la vitesse de chaque canalisation.
keywords: eaux usées, assainissement, collecteur, collecteur d'eaux usées, eaux résiduaires, débit de dimensionnement, débit de pointe, coefficient de pointe, harmon, babbitt, infiltration, population, par habitant, taux de remplissage, autocurage, vitesse, dimensionnement des canalisations, feuille de calcul
from: 73ba197a
---

Les débits de dimensionnement des eaux usées s'appliquent au [réseau de canalisations](topic:pipe-network) lorsque son {{ui:Type}} est {{ui:Eaux usées}}. Sans sélection, le panneau de droite affiche alors **Débits de dimensionnement eaux usées** là où un réseau pluvial affiche l'évacuation des eaux pluviales.

## Saisir ce qui arrive

1. Sélectionnez un regard. Sous **Débits de dimensionnement eaux usées**, saisissez les {{ui:Habitants qui entrent ici}} et la {{ui:Surface qui entre ici}} (hectares dans un projet en mètres, acres dans un projet en pieds).
2. Pour les commerces, bureaux ou industries, saisissez des habitants équivalents : la surface multipliée par le nombre d'habitants par hectare (ou par acre) qu'utilise votre organisme. La surface compte dans l'infiltration dans les deux cas.
3. Répétez pour chaque regard où une rue ou un lot se raccorde. Un regard où rien ne se raccorde garde ces deux valeurs à 0.

Chaque canalisation transporte tout ce qui entre à son regard amont et au-dessus de celui-ci. Sélectionnez un regard pour voir ce qui le traverse.

## Les paramètres

| Paramètre | Signification |
|---|---|
| {{ui:Débit par habitant}} | le débit moyen d'une personne par jour : litres (projet en mètres) ou gallons US (projet en pieds) |
| {{ui:Infiltration}} | eau souterraine qui s'infiltre : litres par seconde et par hectare, ou gallons par jour et par acre |
| {{ui:Coefficient de pointe}} | Harmon, 1 + 14 / (4 + √P), ou Babbitt, 5 / P^0.2, avec P la population en milliers |
| {{ui:Coefficient de pointe au moins}} / {{ui:Coefficient de pointe au plus}} | le coefficient reste compris entre ces deux valeurs |
| {{ui:n de Manning}} | pour la capacité et la vitesse |
| {{ui:Vitesse minimale}} / {{ui:Vitesse maximale}} | à la hauteur d'écoulement propre au débit de pointe dans la canalisation |
| {{ui:Remplissage maximal}} | le taux de remplissage admis d'une canalisation au débit de pointe, en pourcentage de ce qu'elle transporte à pleine section |

Les valeurs de départ sont des valeurs indicatives, et non une norme. Utilisez les valeurs que publie votre organisme.

## Ce qui est calculé

Pour chaque canalisation, dans l'ordre d'écoulement :

- débit de pointe = habitants × débit par habitant × coefficient de pointe + surface × infiltration
- capacité à pleine section (équation de Manning à la pente de la canalisation), et taux de remplissage atteint au débit de pointe
- la hauteur normale du débit de pointe et la vitesse à cette hauteur

Le tableau **Résultats eaux usées** liste pour chaque canalisation ses habitants, son coefficient de pointe, son débit de pointe (L/s, ou gpm et pieds cubes par seconde), son taux de remplissage et sa vitesse. Les problèmes sont listés dessous : une canalisation plus remplie que la limite, plus lente que la vitesse minimale (elle risque de ne pas se nettoyer seule), plus rapide que la vitesse maximale, ou sans pente. {{ui:Dimensionner les canalisations pour ces débits}} choisit pour chaque canalisation le plus petit diamètre normalisé (200 mm ou 8 pouces et plus) qui transporte son débit de pointe dans la limite ; un {{key:Mod+Z}} l'annule.

:::note
Il s'agit du débit de pointe permanent qu'une feuille de calcul détermine, vérifié contre une feuille de calcul publiée à son arrondi imprimé près. Ce n'est pas un modèle du collecteur dans le temps : ni hydrogrammes, ni stockage, ni pompes, ni déversoirs. Voir [Pas encore disponible](topic:not-built-yet).
:::

Les vitesses utilisent l'équation de Manning avec le même n à toutes les hauteurs. Certains organismes utilisent des abaques de section partiellement remplie où n varie avec la hauteur, ce qui donne une vitesse un peu plus faible dans une canalisation remplie à 60 à 70 % (environ 3 % de moins).
