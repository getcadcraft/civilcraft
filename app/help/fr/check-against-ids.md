---
title: Contrôler l'export IFC selon l'IDS d'un client
summary: Charger le fichier .ids que vous a remis un client ou une autorité routière, et voir dans Problèmes chaque élément exporté qui ne le respecte pas.
keywords: ids, information delivery specification, buildingsmart, exigences, livraison, contrôle, validation, assurance qualité, export ifc, ifc 4.3, tracé, route, marchés publics
from: 183d9a0e
---

## Ce que vous allez faire

Un IDS (Information Delivery Specification, une norme de buildingSMART) est la liste de ce qu'un IFC doit contenir. Les marchés publics en envoient souvent un avec le chantier. CivilCraft contrôle l'IFC que ce projet exporte, dans la version IFC que vous avez choisie pour l'export, par rapport à lui, et liste chaque élément qui n'est pas conforme.

## Étapes

1. Ouvrez votre projet.
2. Cliquez sur {{ui:IFC}} dans le groupe Export de la barre d'outils. Dans la boîte de dialogue, choisissez la version IFC que vous livrerez.
3. Cliquez sur {{ui:Contrôler selon un IDS…}}.
4. Cliquez sur {{ui:Charger un fichier .ids…}} et choisissez le fichier. Rien n'est téléversé.
5. Lisez le résultat : chaque spécification avec {{ui:Conforme}} ou {{ui:Échec}} et le nombre d'éléments auxquels elle s'applique.
6. Ouvrez Problèmes ({{key:Ctrl+Shift+M}}) et cliquez sur un échec pour sélectionner le tracé, la plateforme, la canalisation, le regard ou le volume de bâtiment dont il provient.

## Ce que vous devriez voir

- Un avertissement par élément exporté et par exigence qu'il ne respecte pas, avec le nom de la spécification, ce que l'IDS demande et ce que l'export contient.
- Le rapport de contrôle (dans Problèmes) commence par l'IDS : son titre, sa version, son auteur et le décompte de chaque spécification.

## Bon à savoir

- L'IDS est enregistré dans le fichier de projet, donc il est contrôlé à nouveau à l'ouverture du projet. Le charger ou l'oublier est une étape que vous pouvez annuler.
- Chaque modification est recontrôlée un instant plus tard. Les grandes surfaces prennent plus de temps à écrire, si bien que le contrôle attend alors un peu plus longtemps entre deux passages.
- Le contrôle utilise le même fichier que celui qu'écrit l'export {{ui:IFC}}, dans la version choisie en dernier là-bas (IFC 4.3 si vous n'en avez pas choisi).
- Les nombres sont comparés en unités SI : un projet en pieds est d'abord converti en mètres.

- Les motifs de l'IDS sont lus comme la valeur entière. Un `^` au début et un `$` à la fin sont aussi pris pour « la valeur entière », comme le veulent la plupart des fichiers IDS.

## Suite

- [Exporter en IFC](topic:ifc)
