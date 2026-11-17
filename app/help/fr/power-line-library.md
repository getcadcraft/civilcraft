---
title: Votre bibliothèque de lignes électriques
summary: Créez vos propres conducteurs, câbles souterrains, appuis, équipements et types de tranchée, dans des catégories que vous nommez, et partagez-les sous forme de fichiers.
keywords: bibliothèque, conducteur, câble, poteau, appui, traverse, isolateur, accessoire, hauban, haubanage, transformateur, armoire, jonction, tranchée, catégorie, csv, importer, exporter
from: 88733744
---

La section **Bibliothèque** de l'espace de travail Lignes électriques contient tous les éléments qu'une ligne ou un câble peut utiliser. Rien n'y est lié à un pays ni à un fabricant : vous créez les éléments avec lesquels vous travaillez.

## Trois types d'éléments

| Type | Où il se trouve | Pouvez-vous le modifier ? |
|---|---|---|
| **Exemples** | Fournis avec CivilCraft, avec des valeurs génériques calculées à partir des propriétés des matériaux | Non : {{ui:Copier dans ma bibliothèque}} d'abord |
| **Dans le projet** | Fourni avec le fichier de projet ouvert | Non : {{ui:Copier dans ma bibliothèque}} d'abord |
| **Les miens** | Vos propres éléments, conservés dans ce navigateur | Oui, et les modifications sont enregistrées immédiatement |

Chaque projet conserve une copie de chaque élément qu'il utilise, afin qu'un projet s'ouvre sur n'importe quel ordinateur avec ses propres conducteurs et poteaux.

:::warning
Les éléments d'exemple ne sont que des exemples : vérifiez chaque valeur par rapport aux données de votre fournisseur. Les câbles souterrains n'ont volontairement pas d'intensité admissible, car celle-ci dépend de la manière dont le câble est posé.
:::

## Créer un élément

1. Dans **Bibliothèque**, choisissez le **Type** (conducteurs aériens, câbles souterrains, appuis, équipements ou types de tranchée).
2. Cliquez sur {{ui:Nouvel élément}}, ou choisissez un exemple et cliquez sur {{ui:Copier dans ma bibliothèque}} ou {{ui:Dupliquer}}.
3. Renseignez ses champs. Les champs marqués `*` sont ceux qu'exigent les contrôles ; un élément qui en manque un est marqué `!` et listé sous **Contrôles** lorsqu'une ligne l'utilise.
4. Donnez-lui une **Catégorie**, avec `/` entre les niveaux : `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. L'arborescence suit vos catégories.

Ce dont chaque type a besoin :

| Type | Nécessaire aux contrôles |
|---|---|
| Conducteur aérien | section, diamètre, masse par mètre, charge de rupture, module d'élasticité, dilatation thermique |
| Câble souterrain | âmes, section, tension, diamètre, résistance, intensité admissible |
| Appui | longueur totale, charge nominale (prise en un point situé sous le sommet), profondeur dans le sol |
| Équipement | son type ; une charge nominale pour les traverses, les accessoires et les haubans ; espacement des phases et décalage vertical pour les traverses ; longueur pour les isolateurs ; l'angle pour les haubans |
| Type de tranchée | profondeur, largeur, recouvrement au-dessus des câbles |

## Partager

- {{ui:Enregistrer ma bibliothèque}} enregistre tous vos éléments dans un seul fichier `.cclines.json` ; {{ui:Ouvrir une bibliothèque…}} relit un tel fichier (les éléments ayant la même clé sont remplacés).
- {{ui:Enregistrer en CSV}} enregistre le type que vous consultez sous forme de tableur ; {{ui:Ouvrir une bibliothèque…}} relit un CSV de ce type. Les colonnes peuvent venir dans n'importe quel ordre ; un fichier séparé par des points-virgules peut utiliser une virgule décimale.
