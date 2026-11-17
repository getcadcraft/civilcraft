---
title: Plateformes de maisons sur terrains en pente
summary: Terrasser une plateforme sur une colline : murs de soutènement en bord de plateforme, carte déblai-remblai ombrée selon la profondeur avec cotes de niveau (plan et 3D), coupe tracée n'importe où à travers le terrain et le projet, et rampes ou plateformes inclinées pour les allées.
keywords: plateforme, plateforme de maison, terrain en pente, colline, mur de soutènement, déblai et remblai, carte déblai-remblai, cotes de niveau, coupe libre, ligne de coupe, dossiers d'urbanisme, allée, rampe, plateforme inclinée, terrasser, coefficient de foisonnement, terrassement
from: daa08a3f
---

Une plateforme de maison est une **plateforme** (Conception › {{ui:Plateforme}}) : un polygone plat à un seul niveau, terrassé dans le terrain. Quatre éléments aident sur une pente.

## Murs de soutènement en bord de plateforme

Sélectionnez la plateforme et réglez un côté sur {{ui:Vertical (mur de soutènement)}} au lieu d'une pente (**Propriétés** › {{ui:Côtés et murs de soutènement}}, ou {{ui:Vertical : murs de soutènement}} pour tous les côtés à la fois). La hauteur du mur est lue sur le terrain le long de lui : sommet au niveau du terrain, pied au niveau de la plateforme. Elle est indiquée aux deux extrémités et à son point le plus haut sur le plan, avec un avertissement lorsqu'il dépasse la limite que vous avez fixée. Murs et pentes peuvent être combinés côte à côte.

## La carte déblai-remblai

Cochez {{ui:Carte déblai-remblai}} sous **Afficher**. Le plan est ombré selon la profondeur du déblai ou du remblai, par paliers égaux (déblai en teintes chaudes, remblai en bleu, presque plat en teinte pâle), avec une légende. Des **cotes de niveau** sont imprimées sur la plateforme : la variation de niveau aux points d'une grille, ainsi que le déblai le plus profond et le remblai le plus haut, marqués ▲. Les cellules sont celles qu'utilisent les volumes de terrassement : la carte et les chiffres concordent donc toujours.

Dans la vue 3D, choisissez **Déblai et remblai** dans la liste des couleurs pour superposer les mêmes couleurs sur le terrain et le projet.

Un coefficient de foisonnement ou de retrait se règle dans l'outil de diagramme des mouvements de terre (Conception › {{ui:Diagramme de Bruckner}}) ; il n'est pas appliqué aux volumes d'une plateforme.

## Une coupe libre

Sous **Surface** › {{ui:Plus}}, choisissez {{ui:Coupe libre}}, cliquez les points de la ligne de coupe où vous voulez (elle peut être sinueuse) puis appuyez sur {{key:Enter}}. Une boîte de dialogue trace la coupe : le terrain naturel, le projet terrassé (en pointillés) et le déblai et remblai entre les deux, ombrés, avec leurs surfaces (le projet ne compte qu'à l'intérieur des plateformes et des routes). {{ui:Exagération verticale}} vaut par défaut la valeur qui ajuste le dessin ; {{ui:Enregistrer en SVG}} et {{ui:Enregistrer en CSV}} vous donnent un dessin pour la mairie et les chiffres.

## Rampes et plateformes inclinées

Sous **Surface** › {{ui:Plus}}, choisissez {{ui:Rampe ou plateforme inclinée}}, cliquez l'extrémité basse puis l'extrémité haute, appuyez sur {{key:Enter}}, et indiquez la largeur, le niveau à l'extrémité basse et la pente. La plateforme est une bande dont les angles portent ces niveaux (l'arête entre deux angles suit une pente constante), et elle se terrasse dans le terrain comme toute plateforme. Les angles de n'importe quelle plateforme peuvent aussi porter leurs propres niveaux : une allée, une rampe ou une terrasse inclinée est donc une plateforme avec un niveau sur chaque angle.
