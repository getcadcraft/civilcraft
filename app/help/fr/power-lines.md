---
title: L'espace de travail Lignes électriques
summary: Lignes aériennes et câbles souterrains sur votre site, avec vos propres bibliothèques, flèche et tension selon vos cas de charge, contrôles de dégagement et de résistance, tableaux de pose, quantités, feuilles et export SIG.
keywords: ligne électrique, ligne aérienne, électrique, distribution, poteaux, appuis, conducteur, flèche, tension, pose, dégagement, câble souterrain, tranchée, espace de travail, réseau
from: 638dd856
---

L'espace de travail Lignes électriques place les lignes aériennes et les câbles souterrains sur le site CivilCraft que vous avez déjà : mêmes points topographiques, même terrain, même fichier de projet.

:::warning
Un outil d'aide à la conception. L'espace de travail calcule la flèche, la tension, les dégagements et les charges à partir de **vos** cas de charge et de vos limites ; aucune norme d'un pays n'est intégrée. Un ingénieur vérifie chaque résultat par rapport à la norme applicable avant toute réalisation.
:::

## Ouvrir l'espace de travail

Choisissez {{ui:Surface}} › {{ui:Plus}} › {{ui:Espace de travail Lignes électriques}}, ou **Lignes électriques** sous Espace de travail. La barre d'outils affiche alors un groupe **Lignes électriques** ; les groupes Conception et SIG s'effacent. Choisissez **Civil** sous Espace de travail pour revenir. CivilCraft se souvient de l'espace de travail utilisé en dernier sur cet ordinateur.

Le panneau de gauche gagne deux sections en haut :

- **Lignes électriques** : vos hypothèses et limites, les lignes et câbles du projet, et **Contrôles**, toujours à jour. Cliquez sur un contrôle pour sélectionner l'élément concerné.
- **Bibliothèque** : vos propres conducteurs, câbles, appuis, équipements et types de tranchée. Voir [Votre bibliothèque de lignes électriques](topic:power-line-library).

## Contenu du groupe Lignes électriques

| Outil | Ce qu'il fait | Rubrique |
|---|---|---|
| **Ligne** | Une ligne aérienne : cliquez sur chaque appui | [Dessiner une ligne aérienne](topic:overhead-line) |
| **Appui** | Ajoute un appui sur une portée | [Dessiner une ligne aérienne](topic:overhead-line) |
| **Câble** | Un tracé de câble souterrain dans une tranchée | [Câbles souterrains](topic:underground-cables) |
| **Équipement** | Une armoire, un transformateur, une jonction, ou la source qui alimente le réseau | [Câbles souterrains](topic:underground-cables) |
| **Obstacle** | Un élément croisé par une ligne : une route, un bâtiment, une autre ligne | [Contrôles](topic:power-line-checks) |
| **Profil** | Le profil de la ligne : terrain, appuis et conducteur pour chaque cas de charge | [Dessiner une ligne aérienne](topic:overhead-line#the-line-profile) |
| **Plus** | Hypothèses et limites, tableaux de pose, quantités, feuilles et rapport, SIG, fichiers d'étude | [Flèche et tension](topic:sag-and-tension), [Sorties](topic:power-line-outputs), [Fichiers d'étude](topic:power-line-study-file) |

Tout ce que vous ajoutez forme une seule étape d'annulation, est enregistré dans le fichier de projet et se dessine sur le plan, sur des calques nommés `C-POWR-…` ; les exports DXF, DWG et PDF le contiennent donc aussi.
