---
title: Dessiner un tracé en plan horizontal
summary: Dessiner un tracé à partir de ses PI, définir les rayons des courbes et la station de départ, déplacer les PI, et lire les données de courbe ainsi que la station et le décalage.
keywords: tracé, pas de solution, courbe ne tient pas, plus grand rayon, plus petit rayon, rayon minimal, vitesse de projet, chevauchement, axe, pi, courbe horizontale, rayon, stationnement, tangente, créer un tracé, implantation du tracé, pc, pt, station décalage
from: 8c5df4aa
---

Un tracé dans CivilCraft est une chaîne de tangentes passant par des points d'intersection (PI), avec une courbe circulaire à chaque PI intérieur qui a un rayon. Il est repéré en stations à partir d'une station de départ que vous choisissez. Un projet peut contenir plusieurs tracés.

## Dessiner le tracé

1. Appuyez sur {{key:A}}, ou cliquez sur {{ui:Tracé en plan}} dans le groupe **Conception**.
   L'indication dit « Tracé : cliquez les PI dans l'ordre. Entrée ou double-clic termine, Retour arrière retire le dernier, Échap annule. »
2. Cliquez sur le premier PI (le début du tracé).
3. Cliquez sur chaque PI suivant, dans l'ordre. Une ligne rouge suit le pointeur et affiche la longueur et le gisement de la tangente que vous dessinez, par exemple « 212.40 ft  N 63°12'05" E ».
4. Cliquez sur le dernier PI (la fin du tracé).
5. Appuyez sur {{key:Enter}}.
   Le tracé est dessiné avec son stationnement et il est sélectionné. La barre d'état indique par exemple « Tracé 1 : 386.36 ft, courbes de rayon 100 ft là où elles tiennent. Modifiez les rayons dans Propriétés ; Profil (R) pour concevoir sa pente. »

Pendant le dessin : {{key:Backspace}} supprime le dernier PI, {{key:Esc}} annule, et faire glisser sur un espace vide déplace la vue sans ajouter de PI.

:::warning
Terminez avec {{key:Enter}}. Le double-clic termine aussi, mais dans cette version il supprime le PI sur lequel vous double-cliquez. Cliquez une fois sur le dernier PI, puis appuyez sur {{key:Enter}}.
:::

Chaque PI intérieur reçoit une courbe de 100 ft (30 m dans un projet en mètres), ou le plus grand rayon entier qui tient dans la moitié de chaque tangente si 100 ft ne tient pas. Les PI très aigus ou en ligne droite ne reçoivent pas de courbe.

## Définir les rayons et les coordonnées

Le tracé étant sélectionné, le panneau de droite affiche **Tracé en plan** :

1. **Nom** et **Station de départ**. Saisissez une station sous la forme `10+00` (pieds) ou `0+500` (mètres), ou un simple nombre. Voir [Unités, stations et formats de nombres](topic:units-and-stations).
2. **Longueur** et **Station de fin** sont calculées pour vous.
3. Le tableau **PI** indique l'**Est** et le **Nord** de chaque PI, et un **Rayon** pour chaque PI intérieur. Saisissez une nouvelle valeur et appuyez sur {{key:Enter}}.
   - Un rayon de 0 crée un point d'angle sans courbe.
   - Le premier et le dernier PI n'ont jamais de rayon.
   - Le petit x à la fin d'une ligne supprime ce PI (un tracé garde au moins deux PI).
4. Lisez la liste **Courbes** : pour chaque courbe, ses stations PC et PT, le rayon R, la déviation Δ et le sens (gauche ou droite), la longueur L, la tangente T, l'externe E et la corde.
5. La ligne sous les courbes donne le gisement de la première tangente.

## Quand une courbe ne tient pas

Si des courbes demandent plus de tangente qu'il n'y en a entre leurs PI, le tracé n'a pas de solution : il n'est pas dessiné correctement tant que vous ne le corrigez pas, et il est exclu des exports LandXML. Un cadre rouge indique la raison, en chiffres, et propose ce qui tiendrait :

- « Les courbes aux PI 2 et PI 3 demandent 240.00 ft de tangente entre elles (130.00 + 110.00), mais les PI sont distants de 180.00 ft. » — ou, si une seule a une courbe, « La courbe au PI 2 demande 240.00 ft de tangente vers le PI 1 … ».
- Un bouton par PI fixe **le plus grand rayon qui tient** à cet endroit, l'autre courbe restant inchangée (il doit aussi tenir sur l'autre tangente du PI). Si les deux PI ont des courbes, **Les deux** réduit les deux rayons proportionnellement pour qu'ils se rejoignent juste.
- Lorsqu'une seule courbe est plus longue que la tangente, le cadre indique qu'aucune courbe à l'autre PI ne peut tenir tant qu'elle est aussi grande.
- Un PI qui repart en arrière ne peut pas recevoir de courbe ; le cadre propose **Pas de courbe au PI n**.

Chaque bouton est une seule étape : {{key:Mod+Z}} rétablit les rayons. Les rayons proposés sont arrondis par défaut à 0.01, afin de toujours tenir.

### Un rayon minimal de conception

Saisissez un **Rayon minimal de conception** (par exemple d'après votre vitesse de projet) pour que chaque courbe soit contrôlée par rapport à lui ; laissez-le vide pour aucun. Une courbe plus petite est listée avec un bouton pour **le plus petit rayon qui respecte le minimum**, lorsque ce rayon tient. Lorsqu'il ne tient pas, le cadre le signale et donne le plus grand rayon que permettent les tangentes, pour que vous sachiez déplacer un PI ou abaisser le minimum.

## Déplacer les PI sur le plan

1. Avec {{ui:Sélectionner}} actif, cliquez sur le tracé pour le sélectionner. Des poignées carrées apparaissent à ses PI.
2. Faites glisser une poignée. Le tracé, son stationnement, son profil et son corridor suivent.
3. Relâchez. Le déplacement constitue une seule étape d'annulation.

Ajouter un PI entre deux PI existants n'est pas encore disponible : supprimez le tracé et redessinez-le, ou saisissez de nouvelles coordonnées pour les PI que vous avez.

## Lire la station et le décalage

Placez le pointeur sur le plan. La barre d'état indique le tracé le plus proche (ou celui qui est sélectionné) avec la station et le décalage, **G** ou **D** dans le sens des stations croissantes, par exemple « Tracé 1 : Sta 2+15.30, décalage 18.42 D ». Au-delà de l'une ou l'autre extrémité, elle ajoute « (au-delà de l'extrémité) ».

## Ce qui est dessiné

Sur le plan, dans le DXF et dans le PDF : l'axe (tangentes en lignes, courbes en arcs exacts), une marque tous les 50 ft (20 m) avec une marque plus longue et une étiquette de station toutes les 100 unités, et les marques PC et PT étiquetées avec leurs stations.

## Supprimer un tracé

Sélectionnez-le puis appuyez sur {{key:Delete}}, ou cliquez sur {{ui:Supprimer}} dans la barre d'outils ou en bas du panneau de droite. Son profil et son corridor disparaissent avec lui. {{key:Mod+Z}} le rétablit.

:::mac
Sur un clavier Mac, la touche libellée **delete** correspond à {{key:Backspace}} pour le navigateur et ne supprime pas une sélection. Appuyez sur {{key:Delete}} (Fn et Suppr), ou utilisez le bouton {{ui:Supprimer}}.
:::

## Suite

- [Concevoir un profil vertical](topic:profile).
## Vitesse de projet et classe

Sous les propriétés du tracé, **Vitesse de projet** (km/h ou mph) et **Classe de projet** sont conservées avec le tracé, enregistrées dans le projet et écrites dans l'IFC (Pset_RoadDesignCriteriaCommon). CivilCraft n'a pas de table qui relie une vitesse à un rayon minimal : rien n'est contrôlé à partir d'elles. Réglez le **Rayon minimal** selon votre propre norme de conception.

## Spirales

Une courbe peut avoir une clothoïde à chacune de ses extrémités : tangente, spirale, courbe, spirale, tangente. Dans le tableau des PI, saisissez une longueur dans **Spirale d'entrée** et **Spirale de sortie** pour un PI qui a un rayon. Le PI reste à sa place ; la courbe se rapproche pour faire de la place, si bien que la distance de tangente augmente du décalage de la spirale. Les deux longueurs peuvent différer, et un PI avec une seule longueur ne reçoit une spirale qu'à cette extrémité.

La liste des courbes affiche alors TS, SC, CS et ST (tangente vers spirale, spirale vers courbe, courbe vers spirale, spirale vers tangente) avec l'angle de spirale θs, les distances de tangente et la distance externe. Les stations suivent les spirales comme partout ailleurs. Les spirales qui, ensemble, tournent plus que la courbe sont refusées avec le PI nommé ; une spirale plus longue que ne le permet la tangente est un chevauchement, comme pour toute courbe. Le dévers utilise la spirale comme zone de transition (voir [Corridor](topic:corridor)).
