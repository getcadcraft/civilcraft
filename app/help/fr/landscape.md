---
title: L'espace de travail Paysage
summary: Plans de plantation, terrassement, revêtements, murs, marches, irrigation et feuilles du paysage sur le même site, avec les mêmes surfaces et le même fichier que les travaux de génie civil.
keywords: paysage, architecture paysagère, jardin, plantation, plantes, arbres, terrassement, aménagements durs, revêtement, irrigation, arroseurs, espace de travail, aménagement de site, plan paysager
from: eea929d1
---

L'espace de travail Paysage ajoute des outils de conception paysagère au site CivilCraft que vous avez déjà : mêmes points de relevé, même terrain existant, même surface projetée et même fichier de projet.

## Ouvrir

Choisissez {{ui:Surface}} › {{ui:Plus}} › {{ui:Espace de travail Paysage}}. La barre d'outils affiche alors un choix **Espace de travail** et un groupe **Paysage**, et les groupes Surface, Conception et SIG s'effacent pour faire place. Choisissez **Civil** sous Espace de travail pour revenir. CivilCraft retient l'espace de travail utilisé en dernier sur cet ordinateur.

Le panneau de gauche reçoit trois sections en haut :

- **Plantes** : la liste des plantes, pour rechercher et choisir ce que vous placez. Voir [La liste des plantes](topic:plant-list).
- **Contrôles du terrassement** : analyse des pentes, flèches d'écoulement et stagnation. Voir [Terrassement](topic:landscape-grading).
- **Irrigation** : les asperseurs et canalisations que vous placez ensuite, et les réglages de l'alimentation en eau. Voir [Irrigation](topic:irrigation).

## Ce qu'il y a dans le groupe Paysage

| Outil | Ce qu'il fait | Rubrique |
|---|---|---|
| **Plante**, **Massif**, **Haie** | Plantes isolées, massifs plantés remplis à l'espacement des plantes, haies le long d'une ligne | [Plantation](topic:planting) |
| **Terrasser** | Plateformes, merlons, noues, zones de terrassement avec cotes de niveau et courbes de niveau, contrôles de pente et d'écoulement | [Terrassement](topic:landscape-grading) |
| **Aménagements durs** | Revêtements, chemins, murs, bordures, rampes et marches qui suivent le terrain | [Aménagements durs](topic:hardscape) |
| **Zones** | Zones plantées : pelouses, massifs, prairies et couvre-sols avec une composition de couches, découpées autour des aménagements durs | [Zones plantées](topic:planted-areas) |
| **Niveaux** | Modificateurs de terrain dans l'ordre, avec déblai et remblai, cotes de niveau, flèches de pente, traits de coupe | [Modificateurs de terrain](topic:ground-modifiers), [Coupes](topic:landscape-sections) |
| **Irrigation** | Asperseurs, canalisations, vannes, lignes goutte-à-goutte, alimentation, couverture et contrôle hydraulique | [Irrigation](topic:irrigation) |
| **Plus** | Depuis une ligne (objets gardés liés aux traits), nomenclature des plantes, tableau des plantes, tableaux, représentation des plantes, objets libres, feuilles du paysage et jeu à publier, export IFC, taille et étiquettes des plantes | [Objets issus des traits](topic:objects-from-lines), [Fiches de plantes](topic:plant-records), [Tableaux](topic:worksheets), [Feuilles du paysage](topic:landscape-sheets), [Objets libres](topic:freeform-objects) |

Tout ce que vous ajoutez forme une seule étape d'annulation, est enregistré dans le fichier du projet et se dessine sur le plan, sur des calques nommés `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` et `L-IRRG-…`, de sorte que les exports DXF, DWG et PDF les incluent aussi.

## Une seule surface pour tout

Plateformes, merlons, noues, zones de terrassement, revêtements et chemins sont terrassés dans la **surface projetée**, celle qu'utilisent aussi les corridors et les plateformes. Le **terrain existant** ne change jamais. Les plantes reposent sur le terrain qui se trouve dessous, donc elles se déplacent lorsque le terrassement change. Les terrassements paysagers sont comptés avec tous les autres.

:::tip
Vous débutez ? [Concevoir un jardin, de bout en bout](topic:landscape-walkthrough) parcourt tout l'espace de travail sur le site d'exemple.
:::
