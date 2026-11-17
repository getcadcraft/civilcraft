---
title: Terrassement pour le paysage
summary: Plateformes, merlons, noues et terrassement libre avec cotes de niveau et courbes de niveau que vous faites glisser, déblai et remblai en direct, analyse des pentes, flèches d'écoulement et stagnation d'eau, le tout dans la surface projetée de CivilCraft.
keywords: mur de soutènement, murs de soutènement, côté vertical, mur au lieu d'une pente, pente par côté, talus, terrassement, terrassement paysager, plateforme, terrasse, merlon, butte, noue, cote de niveau, courbes de niveau, modifier les courbes de niveau, déblai et remblai, analyse des pentes, accessibilité, pentes raides, flèches d'écoulement, drainage, stagnation, flaques
from: e1559eb9
---

Tout est terrassé dans la **surface projetée**, avec le même terrassement que les plateformes et les corridors. Le **terrain naturel** n'est jamais modifié, et l'outil Terrassements compte tout. Le menu Terrassement se trouve dans le groupe Paysage.

## Plateformes

{{ui:Terrassement}} › {{ui:Plateforme}}, puis cliquez les angles et appuyez sur {{key:Enter}}. La plateforme part du niveau moyen du terrain situé dessous ; saisissez une **Cote** pour la fixer, ou videz le champ pour qu'elle suive à nouveau le terrain. Une **Pente** en % et une **Direction de pente** en degrés (0 = est, 90 = nord) l'inclinent. Ses côtés sont raccordés au terrain selon la **Pente de déblai** et la **Pente de remblai** (horizontale pour 1).

## Pentes par côté et murs de soutènement

Sous **Côtés et murs de soutènement** dans les Propriétés d'une plateforme, d'une terrasse ou d'un merlon, chaque côté peut être terrassé à sa façon. Le côté 1 va du premier angle cliqué au deuxième, le côté 2 du deuxième au troisième, et ainsi de suite.

- **Tous les côtés** : **En pente** utilise les pentes de déblai et de remblai ci-dessus sur chaque côté ; **Vertical : murs de soutènement** pose un mur sur chaque côté.
- Par côté : **Pentes ci-dessus**, **Ses propres pentes** (saisissez une pente de déblai et une pente de remblai pour ce côté) ou **Vertical (mur de soutènement)**.
- Saisissez une pente sous la forme `3` ou `3:1` (horizontale pour 1 verticale), `33%` ou `18.4°` ; elle s'affiche en H:1. Les champs **Pente de déblai** et **Pente de remblai** de la plateforme acceptent la même écriture.
- Un côté vertical n'a pas de talus : un mur de soutènement longe le bord, de la plateforme jusqu'au terrain naturel (en remblai) ou du terrain jusqu'à la plateforme (en déblai). **Épaisseur du mur** (0.3 m ou 1 ft par défaut) est la distance dont le terrain se décale du bord de la plateforme jusqu'au terrain naturel. Les volumes de déblai et de remblai omettent le talus que ce côté n'a plus.
- Là où un mur rencontre un côté en pente, la pente s'enroule autour de l'extrémité du mur ; deux murs se rejoignent en onglet.
- Sous les champs : la longueur des murs, la surface de face exposée (hauteur × longueur), la hauteur la plus grande et la hauteur moyenne.

Le plan trace la face extérieure de chaque mur avec de courts traits perpendiculaires, et sa hauteur aux deux extrémités et à son point le plus haut (sur le calque des murs de soutènement, qui passe aussi dans DXF et DWG). La vue 3D affiche les murs en volumes (Afficher › Murs de soutènement), et les exports GLB, OBJ et USD les incluent. Les coupes à travers le bord montrent le décrochement.

**Avertissements** (dans Propriétés, et dans le panneau Problèmes) : un mur plus haut que **Avertir au-delà d'une hauteur de mur de** (1.0 m ou 3.3 ft par défaut) « peut nécessiter un mur calculé par un ingénieur ou un permis ; vérifiez les règles locales », et, lorsque vous saisissez la **Pente maximale que tient le sol**, tout côté dont la pente de déblai ou de remblai est plus raide que cette valeur. Ce sont des avertissements : le terrassement se construit quand même. Chaque modification est une seule étape pour {{key:Mod+Z}}.

## Merlons

{{ui:Terrassement}} › {{ui:Merlon}} : une butte dont le sommet se trouve à sa **Hauteur** au-dessus du niveau moyen du terrain situé dessous, ses côtés étant raccordés.

## Noues

{{ui:Terrassement}} › {{ui:Noue}}, puis cliquez le long de la noue **dans le sens où coule l'eau** et appuyez sur {{key:Enter}}. Réglez sa **Profondeur**, sa **Largeur de fond** (0 pour un V) et sa **Pente latérale**. Sans **Pente**, son fond suit le terrain, à sa profondeur en dessous, et ne remonte jamais ; saisissez une pente pour lui donner une pente régulière depuis son origine.

## Cotes de niveau et courbes de niveau

1. {{ui:Terrassement}} › {{ui:Zone de terrassement}} : cliquez le contour de la zone à façonner.
2. {{ui:Terrassement}} › {{ui:Cote de niveau}} : cliquez à l'intérieur de la zone. Saisissez sa cote dans Propriétés, ou utilisez les boutons ▲ ▼.
3. {{ui:Terrassement}} › {{ui:Modifier une courbe de niveau}} : cliquez une courbe de niveau à l'intérieur de la zone pour la prendre comme ligne que vous pouvez remodeler.

Sélectionnez une cote ou une courbe et **faites-la glisser** (ou ses points) sur le plan : la surface suit lorsque vous relâchez, en une seule étape d'annulation. À l'intérieur de la zone, le terrain est reconstruit à partir de son bord (là où il rejoint le terrain naturel), des cotes de niveau et des courbes de niveau modifiées.

## Déblai et remblai, en direct

Les Propriétés de chaque objet de terrassement affichent son **Déblai** et son **Remblai**, ainsi que ceux de tout le site, selon la méthode par grille qu'utilise Terrassements, et se mettent à jour à mesure que vous modifiez. Les problèmes (hors de la surface, contour qui se croise lui-même) y sont listés.

## Contrôles du terrassement

Dans la section **Contrôles du terrassement** à gauche :

- **Analyse des pentes** colore la surface selon sa pente : jusqu'à la limite douce, entre les deux, et plus raide que la limite forte (5 % et 33.3 % par défaut : le 1:20 habituel pour les cheminements accessibles et 1:3 pour la tonte). La légende indique la part de la surface dans chaque classe. Les zones raides s'impriment aussi sur les feuilles.
- **Flèches d'écoulement et stagnation** trace le sens d'écoulement de l'eau et entoure chaque endroit où elle stagnerait, avec sa profondeur ; la section indique le nombre de lieux, le plus profond et le volume d'eau qu'ils retiennent.

Les contrôles lisent la surface projetée lorsqu'un terrassement existe, sinon le terrain naturel.
