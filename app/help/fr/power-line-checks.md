---
title: Contrôles des lignes électriques
summary: Ce que CivilCraft contrôle sur chaque ligne et chaque câble, toujours à jour : dégagements, espacements, débattement, soulèvement, charges sur les appuis et dimensionnement, accessoires, haubans, fondations, données manquantes, raccordements, surcharges et chute de tension.
keywords: contrôles, dégagement, dégagement au sol, obstacle, croisement, espacement des phases, débattement d'isolateur, soulèvement, charge sur appui, charge nominale, dimensionnement, fondation, hauban, haubanage, accessoire, traverse, chute de tension, surcharge, données manquantes, déconnecté
from: e6a0da47
---

**Contrôles** dans la section Lignes électriques liste chaque problème, en rouge pour ce qui échoue et en ambre pour les avertissements. Cliquez sur l'un d'eux pour sélectionner la ligne, l'appui, le câble ou l'équipement concerné ; les appuis et portées en échec sont entourés de rouge sur le plan tant que l'espace de travail est ouvert.

:::warning
Un outil d'aide à la conception : ces contrôles comparent votre projet à vos propres règles, ils ne constituent pas une certification.
:::

## Dégagements

La phase la plus basse du conducteur est suivie sur chaque portée et pour chaque cas de charge. Son dégagement minimal au-dessus du sol doit atteindre la **règle de dégagement** de la ligne. Lorsqu'une portée croise un **obstacle** (dessiné avec {{ui:Obstacle}} : un point ou une ligne, avec sa hauteur au-dessus du sol et sa propre règle de dégagement), le dégagement au-dessus du sommet de l'obstacle est contrôlé de la même façon.

**Ce que l'espace de travail Paysage place au-dessus du sol compte aussi.** Les plantes isolées (leur couronne à taille adulte et à hauteur adulte), les haies et massifs (l'espèce la plus haute qu'ils contiennent) et les murs (leur sommet) sont des obstacles sous une ligne, sans avoir à les redessiner. Ils gardent les règles définies dans {{ui:Hypothèses et limites…}} : **Plantes paysagères sous une ligne** (les jeux d'exemple utilisent *Arbres et plantes*, 3 m) et **Murs paysagers sous une ligne** (*Bâtiment*) ; choisissez **Non contrôlé** pour les exclure. Le dégagement se mesure verticalement depuis le sommet de la plante ou du mur jusqu'au conducteur à l'endroit où la portée le croise ; la distance latérale à une couronne au bord de la ligne n'est pas contrôlée. Déplacer un arbre ou relever un mur modifie les contrôles immédiatement.

Vos règles de dégagement vous appartiennent : ouvrez-les avec **Règles…** à côté de n'importe quelle **Règle de dégagement** (ou dans {{ui:Hypothèses et limites…}}) pour en ajouter, renommer, modifier ou supprimer.

## Espacement et débattement

- **Espacement des phases** requis : k·√(flèche + longueur d'isolateur) + U/150, avec la flèche du cas à chaud et la tension U en kV (forme courante ; k provient de votre jeu de règles). Comparé à l'espacement des phases de la traverse.
- **Débattement des isolateurs** sur les appuis de suspension, sous le cas de vent : atan(charge transversale ÷ charge verticale), comparé au débattement maximal du jeu de règles.
- **Soulèvement** : un appui de suspension plus bas que ses voisins peut être soulevé par le froid ; il est signalé.

## Charges sur les appuis et dimensionnement

Pour chaque appui et chaque cas de charge, avec chaque conducteur de la ligne :

- **Transversale** : vent par mètre × portée de vent (moitié des deux portées), plus 2·H·sin(déviation ÷ 2) à une déviation.
- **Dans l'axe de la ligne** : la différence des tensions des deux côtés à un arrêt ou à un angle ; à un appui de suspension, uniquement sous givre d'un seul côté (chaque portée étant traitée séparément, ce qui reste du côté de la sécurité).
- **Verticale** : charge verticale par mètre × portée de poids (entre les points les plus bas de chaque côté) plus l'équipement.

La charge horizontale est ramenée au point nominal de l'appui (charge équivalente = charge × hauteur d'attache ÷ hauteur du point nominal) et comparée à sa **charge nominale** × le coefficient du jeu de règles. Si elle est insuffisante, le plus petit appui du même matériau de votre bibliothèque qui la supporte est suggéré. Un appui équipé d'un **hauban** transmet la charge horizontale au hauban, qui porte charge ÷ sin(angle du hauban) et est contrôlé par rapport à sa propre résistance.

Les accessoires (pinces, isolateurs, traverses) sont contrôlés par rapport à leur charge nominale : un accessoire d'ancrage porte la tension du conducteur, un accessoire de suspension sa part des charges verticale et transversale. La **fondation** affichée correspond à la profondeur de l'appui dans le sol et à un trou un peu plus large que son pied.

## Données, raccordements et courant

- Un élément dont un champ nécessaire est vide, ou une clé absente de la bibliothèque.
- Une extrémité de tracé de câble, ou un équipement, qui n'est raccordé à rien.
- **Chute de tension** et **courant** depuis chaque source (équipement marqué comme source) jusqu'aux charges (kW et facteur de puissance sur les équipements), le long des portées aériennes et des câbles : √3·I·L·(R cos φ + X sin φ), avec R à 20 °C. Un courant supérieur à l'intensité admissible du câble, ou une chute supérieure à celle que permet le jeu de règles, est signalé.
