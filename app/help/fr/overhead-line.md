---
title: Dessiner une ligne électrique aérienne
summary: Placez les supports sur le plan, laissez CivilCraft déterminer le rôle de chaque support et les sections entre arrêts, et déplacez les supports sur le plan ou sur le profil de la ligne.
keywords: ligne aérienne, support, poteau, portée, section, arrêt, angle, suspension, profil, hauteur, bras, hauban, tirant
from: b8e5e272
---

## Dessiner la ligne

1. Il faut une surface : le terrain sous la ligne vient de celle-ci ([Construire une surface](topic:build-surface)). Un support sans terrain dessous est listé sous **Contrôles** ; saisissez plutôt son **Niveau du terrain** dans les propriétés.
2. Cliquez sur {{ui:Ligne}} dans le groupe Lignes électriques, puis cliquez chaque support sur le plan.
3. Double-cliquez sur le dernier, ou appuyez sur {{key:Enter}}.

La ligne reçoit le conducteur, le support et l'équipement que vous avez utilisés en dernier sur cet ordinateur (la première fois : des exemples de la bibliothèque). Modifiez-les dans les propriétés.

## La ligne dans les propriétés

Sélectionnez la ligne (cliquez sur une portée) pour régler son **Conducteur**, ses **Conducteurs par circuit**, ses **Circuits**, sa **Tension nominale**, la **Règle de dégagement** qu'elle doit respecter au-dessus du sol, et l'équipement **Sur chaque support** (un bras, des isolateurs, des accessoires). Le tableau liste ses **sections** avec, pour chacune, sa portée de référence, sa tension de service et le cas de charge qui la régit.

## Supports

Cliquez sur un support pour le sélectionner. Dans les propriétés :

- **Support** : son élément de bibliothèque. S'il est trop faible, {{ui:Utiliser …}} met le plus petit support du même matériau de votre bibliothèque qui supporte la charge.
- **Rôle** : Automatique, Suspension, Angle ou Arrêt. Automatique signifie : le premier et le dernier supports sont des arrêts ; un virage au-delà de l'angle du jeu de règles fait un support d'angle ; un virage plus grand fait un arrêt.
- **Hauteur au-dessus du sol** : vide prend la valeur de l'élément de bibliothèque (sa longueur moins la profondeur dans le sol).
- **Sur ce support aussi** : équipement supplémentaire, comme un **hauban**. Un support haubané transmet la traction de la ligne à son hauban.
- **Support existant** : il est contrôlé comme les autres, mais exclu des quantités.

{{ui:Support}} ajoute un support sur la portée la plus proche de votre clic. Faites glisser un support sur le plan pour le déplacer. {{ui:Supprimer}} le retire (une ligne garde au moins deux supports).

Les sections vont d'arrêt en arrêt : à l'intérieur d'une section, le conducteur glisse librement dans les pinces de suspension, donc une seule tension vaut pour toute la section.

## Le profil de la ligne

Cliquez sur {{ui:Profil}} (ou **Profil** dans les propriétés de la ligne). Le panneau sous le plan montre le terrain le long de la ligne, chaque support du sol à son sommet, la phase la plus basse du conducteur au **Cas de charge** que vous choisissez, et le dégagement que la ligne doit respecter, en trait pointillé. Une portée en échec est rouge ; le nombre sous chaque portée est son dégagement minimal.

- **Ligne** choisit la ligne aérienne à afficher. Sélectionner une autre ligne, ou l'un de ses supports, sur le plan fait basculer le profil sur celle-ci.
- Passez le pointeur sur le profil : une ligne de repérage le suit, et l'étiquette indique la distance le long de la ligne, le terrain, le conducteur et le dégagement à cet endroit (et signale quand le dégagement est inférieur à la règle de la ligne).
- {{ui:Mesurer}} dans la barre du profil : cliquez deux points pour obtenir la distance horizontale, la différence de hauteur, la distance droite et la pente entre eux. Un clic près du terrain, du conducteur ou du sommet d'un support s'y accroche. Recliquez sur {{ui:Mesurer}} pour arrêter.
- Les obstacles que traverse la ligne se dressent depuis le sol : ceux dessinés, en barres ; les végétaux de l'aménagement paysager, par leur houppier ; les murs, en barres (voir [Contrôles des lignes électriques](topic:power-line-checks#clearances)). Les tracés de câbles et les canalisations traversés sont marqués sous le sol, à leur sommet, avec leur nom.

- Faites glisser un support latéralement pour le déplacer le long de la ligne.
- Faites glisser son sommet vers le haut ou vers le bas pour régler sa hauteur au-dessus du sol.
