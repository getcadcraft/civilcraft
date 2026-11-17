---
title: Établir un rapport d'implantation
summary: Listez les piquets le long d'un tracé en plan, aux PK et décalages, ou les points topographiques proches, avec le PK, le décalage, le nord, l'est, les altitudes projet et terrain, et le déblai ou remblai, puis enregistrez le rapport en CSV ou en PDF.
keywords: implantation, piquetage, rapport de piquetage, fiche de déblai, fiche de terrassement, PK, décalage, déblai, remblai, tracé, implantation de chantier, récolement
from: d8a4e9f1
---

Sélectionnez un tracé en plan et cliquez sur **Rapport d'implantation** dans ses **Propriétés**.

## Piquets aux PK et aux décalages

1. **De** et **à** : les PK à piqueter (1+50 ou 150).
2. **Pas** : l'intervalle. Les piquets sont placés à chaque multiple de celui-ci, aux deux extrémités et, si la case est cochée, là où les courbes du tracé commencent et finissent.
3. **Décalages** : à gauche et à droite du tracé, en regardant dans le sens des PK croissants : `12 L, 0, 12 R`, `L12 CL R12` ou `-12, 0, 12` (gauche = moins). Un tracé avec un corridor commence par ses bords de chaussée et ses accotements.
4. **Numéroter à partir de** et **avec le préfixe** nomment les piquets : 1, 2, 3, ou S101, S102.

## Points topographiques proches du tracé

Choisissez **points topographiques proches du tracé** et la distance. Chaque point situé dans cette distance reçoit son PK et son décalage, le projet à cet endroit, et sa propre altitude comme terrain : un contrôle des points piquetés ou relevés en récolement.

## Contenu du rapport

| Colonne | Contenu |
|---|---|
| Point | Le nom du piquet, ou le numéro du point topographique |
| PK, décalage | Où il se trouve le long du tracé : L pour gauche, R pour droite |
| Nord, Est | Ses coordonnées |
| Altitude projet | La surface du corridor projeté à cet endroit (de ligne de terre à ligne de terre), sinon le profil projet sur l'axe |
| Altitude terrain | La surface existante à cet endroit, ou l'altitude propre du point topographique |
| Déblai/remblai | C quand le terrain est au-dessus du projet (à enlever), F quand il est en dessous (à remblayer), au centième |

Un piquet sans altitude projet (hors corridor, ou sur un tracé sans profil loin de l'axe) n'a pas de déblai ni de remblai ; la boîte de dialogue indique combien il y en a.

## Enregistrer

- **CSV** : une ligne de titre, puis les colonnes ci-dessus, plus le déblai ou le remblai sous forme de nombre signé (terrain moins projet), pour les tableurs et les carnets de terrain électroniques.
- **PDF** : pages de tableau sur le format de feuille choisi, un piquet par ligne, déblais en orange et remblais en vert, avec le cartouche des autres feuilles.

:::note
Les piquets sont calculés à partir du projet. Vérifiez-les par rapport aux plans approuvés avant toute réalisation.
:::
