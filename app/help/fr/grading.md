---
title: Terrasser une plateforme de bâtiment
summary: Dessiner une plateforme plane, définir son altitude et ses talus de déblai et de remblai, et laisser CivilCraft la raccorder au terrain naturel et l'ajouter à la surface projet.
keywords: mur de soutènement, murs de soutènement, côté vertical, mur au lieu d'un talus, pente par côté, remblai, terrassement, plateforme, plateforme de bâtiment, raccordement, ligne caractéristique, groupe Terrassements, talus de déblai, talus de remblai, surface finie, surface projet, terrassement de site
from: 482319a6
---

Une plateforme est une zone plane à une seule altitude. Depuis son bord, CivilCraft prolonge la plateforme vers l'extérieur avec votre pente de déblai là où le terrain est plus haut que la plateforme, et avec votre pente de remblai là où il est plus bas, jusqu'à ce que la pente rejoigne le terrain naturel. Cette ligne de rencontre est la ligne de raccordement. La plateforme et ses talus remplacent le terrain naturel à l'intérieur de la ligne de raccordement pour former la surface projet.

## Dessiner la plateforme

Il vous faut d'abord une surface de terrain existante.

1. Appuyez sur {{key:G}}, ou cliquez sur {{ui:Pad}} dans le groupe **Conception**.
   L'indication affiche : « Plateforme : cliquez sur ses angles. Entrée ou double-clic termine, Retour arrière supprime le dernier, Échap annule. »
2. Cliquez sur les angles de la plateforme dans l'ordre, dans un sens ou dans l'autre. Un contour bleu suit le pointeur.
3. Appuyez sur {{key:Enter}} après le dernier angle (trois au minimum).
   La plateforme est dessinée et sélectionnée. Elle démarre à l'altitude du terrain en son milieu, arrondie à 0.1, avec une pente de déblai de 2 : 1 et une pente de remblai de 3 : 1. La barre d'état indique par exemple : « Plateforme 1 à l'altitude 254.3 (le terrain en son milieu), déblai 2:1, remblai 3:1. Modifiez-les dans Propriétés. »

:::warning
Terminez avec {{key:Enter}}. Le double-clic termine aussi, mais dans cette version il supprime l'angle sur lequel vous double-cliquez. Cliquez une fois sur le dernier angle, puis appuyez sur {{key:Enter}}.
:::

Le contour de la plateforme ne doit pas se croiser lui-même (« Le contour de la plateforme se croise lui-même. »).

## Définir l'altitude et les pentes

Plateforme sélectionnée, le panneau de droite affiche **Plateforme** :

1. **Nom**.
2. **Altitude** : l'altitude plane de la plateforme.
3. **Pente de déblai** et **Pente de remblai**, en H:V (2 signifie 2 : 1). Les deux doivent être supérieures à 0.
4. **Surface de la plateforme** et **Angles** sont affichés à titre indicatif.

Appuyez sur {{key:Enter}} après chaque valeur. La ligne de raccordement, la surface projet et les volumes se mettent à jour immédiatement.

Sous les champs, une ligne indique par exemple « Ligne de raccordement : 48 lignes de pente (20 en déblai, 28 en remblai), la plus éloignée à 31.20 ft. » Le plan affiche la ligne de raccordement et les lignes de pente en magenta.

## Comment le raccordement est trouvé

- Les lignes de pente partent de chaque bord, perpendiculairement à lui, environ tous les vingtièmes de la taille de la plateforme.
- Aux angles saillants, elles s'éventaillent tous les 10°, pour que la pente contourne l'angle.
- Aux angles rentrants, une ligne suit la bissectrice, là où les pentes des deux côtés se rencontrent.
- Chaque ligne monte à la pente de déblai ou descend à la pente de remblai jusqu'à atteindre le terrain.

## Pentes par côté et murs de soutènement

Sous **Côtés et murs de soutènement** dans les Propriétés d'une plateforme, d'une banquette ou d'un merlon, chaque côté peut être terrassé à sa façon. Le côté 1 va du premier angle cliqué au second, le côté 2 du second au troisième, et ainsi de suite.

- **Tous les côtés** : **En pente** utilise les pentes de déblai et de remblai ci-dessus sur chaque côté ; **Vertical : murs de soutènement** place un mur sur chaque côté.
- Par côté : **Pentes ci-dessus**, **Ses propres pentes** (saisissez une pente de déblai et une pente de remblai pour ce côté) ou **Vertical (mur de soutènement)**.
- Saisissez une pente sous la forme `3` ou `3:1` (horizontal pour 1 vertical), `33%` ou `18.4°` ; elle s'affiche en H:1. La **Pente de déblai** et la **Pente de remblai** de la plateforme acceptent les mêmes formes.
- Un côté vertical n'a pas de talus : un mur de soutènement longe le bord, depuis la plateforme jusqu'au terrain naturel (en remblai), ou depuis le terrain jusqu'à la plateforme (en déblai). L'**Épaisseur du mur** (0.3 m ou 1 ft au départ) correspond au décrochement entre le bord de la plateforme et le terrain naturel. Les volumes de déblai et de remblai ne comptent pas le talus que ce côté n'a plus.
- Là où un mur rencontre un côté en pente, la pente contourne l'extrémité du mur ; deux murs se rejoignent en onglet.
- Sous les champs : la longueur des murs, la face exposée (hauteur × longueur), la hauteur la plus grande et la hauteur moyenne.

Le plan dessine la face extérieure de chaque mur avec de courts traits transversaux, ainsi que sa hauteur aux deux extrémités et à son point le plus haut (sur la couche des murs de soutènement, qui passe aussi dans le DXF et le DWG). La vue 3D montre les murs en solides (Afficher › Murs de soutènement), et les exports GLB, OBJ et USD les incluent. Les coupes à travers le bord montrent le décrochement.

**Avertissements** (dans Propriétés et dans le panneau Problèmes) : un mur plus haut que **Signaler au-dessus d'une hauteur de mur de** (1.0 m ou 3.3 ft au départ) « peut nécessiter un mur calculé ou un permis ; vérifiez les règles locales », et, lorsque vous saisissez la **Pente la plus raide que tient le sol**, tout côté dont la pente de déblai ou de remblai est plus raide que cette valeur. Ce sont des avertissements : le terrassement se construit quand même. Chaque modification est une étape pour {{key:Mod+Z}}.

## Déplacer les angles

Sélectionnez la plateforme, puis faites glisser une poignée carrée sur un angle. Chaque glissement est une étape d'annulation. L'ajout ou la suppression d'un angle n'est pas encore disponible : supprimez la plateforme et redessinez-la.

## Quand le terrassement ne se fait pas

Une case rouge sous **Terrassements** nomme la plateforme et le problème :

| Message | Que faire |
|---|---|
| « 3 lignes de pente sortent de la surface avant de la rejoindre : la plateforme est trop près du bord de la surface, ou trop haute ou trop basse. » | Éloignez la plateforme du bord de la surface, ou rapprochez son altitude du terrain. |
| « La ligne de raccordement se croise elle-même (des pentes issues de côtés différents de la plateforme se rencontrent). Remodelez la plateforme ou changez les pentes. » | Typique des plateformes étroites ou en L, en déblai profond ou en remblai élevé. Élargissez la plateforme, réduisez l'écart d'altitude, ou rendez les pentes plus raides. |
| « Le contour de la plateforme se croise lui-même. » | Redessinez les angles dans l'ordre autour de la plateforme. |

Une plateforme en erreur est exclue de la surface projet et des volumes tant qu'elle n'est pas corrigée.

## Voir le résultat

1. Sous **Affichage**, réglez **Surface** sur {{ui:Proposed (graded)}}.
   Les courbes de niveau sont désormais planes sur la plateforme, et suivent les pentes jusqu'à la ligne de raccordement.
2. Placez le pointeur sur la plateforme : la barre d'état affiche les altitudes **Sol** et **Terrassé**.
3. Lisez le déblai et le remblai sous **Terrassements** ; voir [Volumes de terrassement](topic:volumes).

Les plateformes sont terrassées après les corridors, dans l'ordre où elles ont été dessinées. Une plateforme postérieure remplace tout ce qui la précède à l'intérieur de sa propre ligne de raccordement.

## Supprimer une plateforme

Sélectionnez-la et appuyez sur {{key:Delete}} (sur Mac, Fn et Suppr), ou cliquez sur {{ui:Delete}}.

## Pas encore disponible

Les plateformes sont planes : les plateformes en pente, les lignes caractéristiques à pente variable, les banquettes, et le terrassement vers une distance ou une altitude cible ne sont pas encore disponibles. Voir [Pas encore disponible](topic:not-built-yet).
