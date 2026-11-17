---
title: Vérifier les volumes par rapport aux limites de zonage que vous saisissez
summary: Saisissez les reculs d'un lot ligne par ligne, une limite de hauteur, un plan d'exposition au ciel, un coefficient d'occupation des sols et une emprise au sol, visualisez l'enveloppe constructible sur le plan, et lisez quels volumes dépassent quelle limite.
keywords: zonage, recul, reculs, avant, latéral, arrière, enveloppe, surface constructible, limite de hauteur, plan d'exposition au ciel, COS, FAR, emprise, lot, parcelle, règlement, contrôle réglementaire
from: 3e267b31
---

**CivilCraft ne contient aucun code de zonage.** Il ne connaît les règles d'aucune ville et n'en livre aucune bibliothèque. Chaque valeur de cette page est celle que vous saisissez, tirée de votre propre règlement, et chaque résultat indique qu'il est mesuré par rapport aux limites que vous avez saisies. C'est un moyen de voir comment les limites d'un lot façonnent un bâtiment, et non une décision sur le fait qu'un projet soit autorisé.

## Saisir les limites

Dans **Propriétés**, sous **Volumes bâtis**, choisissez une **Parcelle** (ou sélectionnez un volume : les limites de sa parcelle s'affichent dessous). Remplissez ensuite ce qui s'applique ; laissez une case vide pour « aucune limite » :

- **Alignement sur rue** : la limite de lot sur la rue. Le **Recul avant** s'applique à elle, le **Recul arrière** à la limite la plus opposée, et le **Recul latéral** aux autres.
- **Limite de hauteur**.
- **Plan d'exposition au ciel** : il part d'une hauteur à la limite de lot et monte de la valeur que vous saisissez pour chaque unité de recul vers l'intérieur, mesuré depuis l'alignement sur rue ou depuis chaque limite de lot (2 signifie 2 pour 1). La hauteur autorisée au-dessus d'un point est la plus basse entre le plan et la limite de hauteur.
- **Coefficient d'occupation des sols** (surface de plancher brute des volumes du lot divisée par la surface du lot) et **Emprise au sol** (leurs emprises divisées par la surface du lot, saisie en pourcentage).

## L'enveloppe

Cochez **Afficher l'enveloppe sur le plan** pour la dessiner sur le calque `A-MASS-ENVL`. L'enveloppe est le lot réduit depuis chaque limite de lot de son propre recul, les lignes décalées se rejoignant en angles d'onglet. Une limite de lot faite d'une courbe est remplacée par de courtes cordes à moins de 0.01 de la courbe. Les lots convexes et concaves fonctionnent tous deux. Si les reculs se replient sur eux-mêmes (un recul profond sur un lot étroit ou très concave), il n'y a pas d'enveloppe, et les Propriétés l'indiquent ; essayez des distances plus petites.

## Le résultat

Sous les cases, chaque volume et chaque limite reçoit une ligne, avec une coche ou une croix :

- **reculs** : la surface du volume située hors de l'enveloppe ;
- **hauteur** : la hauteur du volume comparée à la plus grande hauteur autorisée sur son emprise (un prisme d'une seule hauteur est limité par la plus basse hauteur autorisée à l'un quelconque de ses angles) ;
- **coefficient d'occupation des sols** et **emprise au sol** : tous les volumes de la parcelle additionnés.
