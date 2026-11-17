---
title: Calculer les débits pluviaux, les dimensions des canalisations et la ligne piézométrique
summary: Dessinez les bassins versants qui se déversent dans chaque regard, cumulez les débits du réseau par la méthode rationnelle, dimensionnez les canalisations par la formule de Manning, et voyez où la ligne piézométrique atteint le plein ou la surface.
keywords: assainissement pluvial, bassin versant, méthode rationnelle, coefficient de ruissellement, temps de concentration, intensité de pluie, idf, manning, dimensionnement des canalisations, ligne piézométrique, hgl, ligne d'énergie, egl, mise en charge, inondation, niveau aval
from: e44872ec
---

**Assainissement pluvial** s'appuie sur le [réseau de canalisations](topic:pipe-network) : dessinez d'abord le réseau, puis les zones qui s'y déversent. Tout apparaît sous **Assainissement pluvial** dans le panneau de droite quand rien n'est sélectionné.

## Dessiner un bassin versant

1. Cliquez sur **Dessiner un bassin versant** sous **Assainissement pluvial**.
2. Cliquez sur les angles de la zone qui se déverse dans un regard. {{key:Enter}} ou un double-clic termine ; {{key:Backspace}} reprend le dernier angle, {{key:Esc}} arrête.
3. Le bassin versant se déverse dans le regard qui se trouve à l'intérieur, sinon dans le plus proche. Ses **Propriétés** s'ouvrent : réglez son nom, le **Coefficient de ruissellement C** (la part de la pluie qui ruisselle, de 0 à 1), le **Temps de concentration** en minutes, et le regard où il **Se déverse dans**.

**Dessiner un autre bassin versant**, dans ses Propriétés, lance le suivant. Cliquez à l'intérieur d'un bassin versant sur le plan pour le sélectionner ; {{key:Delete}} le supprime. Chaque modification est une étape : {{key:Mod+Z}} l'annule.

## Régler la pluie de projet

L'intensité de pluie est i = a ÷ (tc + b) puissance c, en pouces par heure pour un projet en pieds et en millimètres par heure pour un projet en mètres. Ajustez **Intensité a**, **b** et **c** à votre propre courbe intensité-durée-fréquence pour la période de retour retenue.

:::warning
La courbe d'intensité de départ, le n de Manning (0.013) et la perte au regard (0.5) sont des valeurs provisoires, pas une norme. Réglez-les à partir de vos propres données pluviométriques et de vos critères de projet.
:::

- **Temps de concentration le plus court** : aucune canalisation n'est calculée pour un temps plus court (10 minutes au départ).
- **Manning n** : la rugosité des canalisations.
- **Perte au regard** : la charge perdue dans chaque regard, en part de la hauteur cinétique V²/2g de la canalisation qui en sort.
- **Niveau d'eau à l'exutoire** : le niveau aval, là où la dernière canalisation se vide. Laissez-le vide quand l'exutoire est libre.

## Comment les débits s'additionnent

Chaque canalisation transporte tous les bassins versants situés en amont. Q = C × i × A, où C × A est cumulé dans le réseau et i est l'intensité au plus long temps de concentration de l'eau qui arrive : le temps propre d'un bassin versant, ou le temps depuis un bassin amont plus le temps de parcours dans les canalisations (longueur ÷ vitesse à pleine section). Q est en pieds cubes par seconde (A en acres) ou en mètres cubes par seconde (A en hectares).

## Dimensionner les canalisations

Le tableau sous **Débits et lignes de charge** indique, pour chaque canalisation, le débit, ce qu'elle transporte à pleine section à sa pente, la vitesse, la charge hydraulique en tête et en pied, et la hauteur d'écoulement.

{{ui:Dimensionner les canalisations pour ces débits}} donne à chaque canalisation le plus petit diamètre normalisé qui transporte son débit à sa propre pente (de 12 à 72 in, ou de 300 à 1800 mm). C'est une seule étape. Les fils d'eau restent en place : si les diamètres changent, utilisez {{ui:Fixer chaque fil d'eau selon les règles}} pour conserver la couverture, puis contrôlez à nouveau le tableau.

## Lire les lignes de charge

La ligne piézométrique (HGL) se calcule depuis l'exutoire vers l'amont :

- Une canalisation qui coule partiellement plein a sa HGL à la surface de l'eau : le fil d'eau plus la hauteur normale.
- Quand l'eau en aval est plus haute que sa génératrice supérieure, ou qu'elle transporte plus que sa pleine section, elle coule en charge (mise en charge) et sa HGL monte de la pente de frottement sur sa longueur.
- À chaque regard, la HGL est la HGL en tête de la canalisation sortante plus la perte au regard.
- La ligne d'énergie (EGL) est la HGL plus la hauteur cinétique.

Une canalisation en charge est listée, de même que tout regard où la HGL dépasse le tampon : l'eau atteint la surface à cet endroit, et le regard est entouré de rouge sur le plan. Sélectionnez une canalisation ou un regard pour voir son débit, sa hauteur, sa vitesse et ses deux lignes dans ses Propriétés.

## Propager une pluie

La méthode rationnelle donne un seul débit de pointe pour chaque canalisation. {{ui:Propager la pluie}} (sous les résultats, dans les Propriétés du réseau) calcule toute la pluie à la place : le ruissellement de chaque bassin versant dans le temps, transporté dans les canalisations avec leur temps de parcours et leur stockage, et additionné aux confluences.

1. Laissez {{ui:Durée de la pluie}} et {{ui:Intensité de la pluie}} vides pour utiliser le plus long temps de concentration et la courbe de pluie ci-dessus, ou saisissez les vôtres.
2. Appuyez sur {{ui:Propager la pluie}}. Le tableau indique, pour chaque canalisation, le débit maximal entrant et sortant, de combien le pic sortant est réduit, quelle part de sa capacité à pleine section elle utilise, et la minute du pic.
3. Chaque exutoire reçoit un petit graphique débit-temps et {{ui:Télécharger l'hydrogramme (CSV)}}.

Un bassin versant envoie la pluie moyennée sur son temps de concentration ; une averse plus courte que ce temps a donc un pic plus faible que C × i × A. Chaque canalisation est propagée par la méthode de Muskingum–Cunge, à partir de la hauteur d'écoulement déjà trouvée par la méthode rationnelle. Deux branches aux temps de concentration différents ne culminent pas ensemble, donc leur somme est inférieure à la somme de leurs pics.

Ceci ne modélise pas la mise en charge, le remous, le stockage dans les regards ni les inondations. Une canalisation dont le pic propagé dépasse sa pleine capacité est listée, et son eau est transmise comme si elle passait. Utilisez-le pour voir le calage dans le temps et l'écrêtement, pas pour dimensionner la canalisation. C'est un outil de calcul : un ingénieur le vérifie.

## Enregistré avec le projet

Les bassins versants et les réglages de pluie sont enregistrés dans le fichier du projet. Ils ne figurent pas encore dans le tracé PDF, le DWG ou le DXF, ni dans le LandXML : voir [Pas encore disponible](topic:not-built-yet).
