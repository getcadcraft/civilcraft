---
title: La liste des plantes
summary: Environ 420 plantes courantes des climats tempérés et méditerranéens, avec leurs dimensions, leur rusticité, leur ensoleillement et leur besoin en eau, recherchables dans n'importe quelle langue, plus votre propre liste enregistrée avec le projet.
keywords: liste de plantes, base de données de plantes, espèce, nom botanique, nom courant, palette de plantes, liste de pépinière, zone de rusticité, csv, importer des plantes, exporter des plantes, mes plantes, liste d'arbres, liste d'arbustes, plantes, bibliothèque de plantes
from: 7ed09e7e
---

La section **Plantes** du panneau de gauche liste toutes les plantes que vous pouvez placer. Cliquez sur une plante pour voir ses dimensions et en faire la plante qu'utilisent **Plante**, **Massif** et **Haie**.

## Recherche et filtres

Saisissez dans **Rechercher** : n'importe quel mot du nom d'une plante, dans n'importe quelle langue (anglais, espagnol, portugais), son nom botanique, son type ou un mot de ses remarques. Chaque mot saisi doit correspondre : `quercus evergreen` trouve donc les chênes à feuillage persistant. Les accents n'ont pas d'importance.

Affinez la liste avec **Type**, **Ensoleillement**, **Eau** et **Zone de rusticité** (la zone USDA de votre site : une plante est listée lorsque la zone se trouve dans sa plage).

## Ce que contient une plante

| Champ | Signification |
|---|---|
| Type | Arbre, arbuste, haie, graminée (pelouses comprises), vivace, couvre-sol ou grimpante |
| À maturité | Hauteur et étalement de la plante adulte, dans un jardin ou une rue, en mètres |
| À la plantation | La taille à laquelle elle est mise en place, et son contenant |
| Espacement | De centre à centre dans un massif ou le long d'une haie |
| Zone de rusticité | Les zones USDA dans lesquelles elle est généralement rustique |
| Ensoleillement, eau, sol | Ce dont elle a besoin |
| Remarques | Usages et précautions, comme les parties toxiques ou une plante qui se propage |

:::note
La liste intégrée a été rédigée pour CadCraft à partir de connaissances horticoles générales : tailles courantes, arrondies. Ce n'est pas le catalogue d'une pépinière. Vérifiez les tailles et la rusticité auprès d'une pépinière locale. Les plantes envahissantes les plus connues de la péninsule Ibérique et d'une grande partie des régions tempérées sont volontairement exclues, et quelques-unes qui sont envahissantes ailleurs portent une remarque.
:::

## Vos propres plantes

- **Ajouter à la liste de ce projet** copie une plante dans la liste propre au projet, où elle est enregistrée avec lui. Une plante de votre liste remplace la plante intégrée de même clé, ce qui vous permet de modifier ses dimensions pour votre région.
- **Importer une liste de plantes…** lit un CSV (ou un fichier de plantes). Le CSV doit comporter une colonne avec le nom botanique et, idéalement, le type, la hauteur et l'étalement ; les noms de colonnes dans vos propres mots sont acceptés (Latin, Nom courant, Hauteur, Étalement, Largeur, Zone). Les virgules, points-virgules ou tabulations, ainsi que les virgules décimales, sont lus. Les calibres de plantation, espacements et contenants vides prennent des valeurs par défaut adaptées au type.
- **Exporter en CSV** enregistre votre liste (ou, si elle est vide, les plantes affichées par la recherche) pour l'ouvrir dans un tableur.

Une liste de plantes est lue comme tout fichier venant de l'extérieur : ce qu'elle contient d'inutilisable est laissé de côté et compté.

## Plantes dans les autres applications

La liste de plantes est une seule bibliothèque pour toutes les applications CadCraft : BimCraft et ModelCraft portent la même liste, mais leur propre Placer depuis la bibliothèque ne propose pas encore de plantes. Aujourd'hui, les plantes atteignent une maquette BIM par l'IFC paysager de CivilCraft (chaque plante étant un `IfcGeographicElement`). Voir [Plantations](topic:planting#ifc).
