---
title: Flèche et tension
summary: Vos cas de charge (température, vent, givre) et vos limites de tension, la manière dont CivilCraft calcule la tension de chaque portée, et les tableaux de pose.
keywords: flèche, tension, cas de charge, température, vent, givre, givre dissymétrique, portée de référence, portée équivalente, changement d'état, caténaire, tableau de pose, charge de rupture, contrainte d'exploitation
from: f8876c35
---

## Cas de charge et limites

{{ui:More}} › {{ui:Load cases and limits…}} modifie les règles que suit chaque ligne du projet.

- **Cas de charge** : une température, une pression de vent sur le conducteur (Pa), et du givre radial (mm, avec sa masse volumique). Le premier cas est la référence.
- **Limites de tension** : une part de la charge de rupture du conducteur, sur la tension horizontale ou sur la plus grande tension à un support, dans un cas de charge. Ou bien donnez vous-même la tension horizontale.
- **Garde** : la distance que le conducteur conserve au-dessus du sol, d'une route, d'un bâtiment et ainsi de suite. Ajoutez, renommez et supprimez-les : elles sont à vous. Sous elles, choisissez les règles pour **Végétaux sous une ligne**, **Murs sous une ligne** et **Croisements souterrains**.
- **Cas utilisés par les vérifications** : celui qui donne la plus grande flèche (chaud), le débattement de chaîne d'isolateurs (vent), le givre, et le givre d'un seul côté d'un support.
- **Coefficients** : coefficient d'écartement entre phases k, plus grand débattement de chaîne d'isolateurs, coefficient sur les charges des supports et des ferrures, angles de déviation qui font les supports d'angle et d'ancrage, la couverture minimale des câbles enterrés, et la plus grande chute de tension.

## Paquets : règles et bibliothèque pour un pays

Aucune règle nationale n'est intégrée à CivilCraft. Un **paquet** (pack) regroupe un jeu de règles et une bibliothèque dans un seul fichier (`.cclinepack.json`), pour un pays, un exploitant de réseau ou une entreprise :

- **Enregistrer comme paquet…** dans {{ui:Load cases and limits…}} écrit le jeu de règles affiché et votre bibliothèque (ou, si votre bibliothèque est vide, les éléments utilisés par ce projet). Saisissez d'abord **Pays ou région**.
- **Ouvrir un jeu de règles ou un paquet…** lit un paquet, un fichier de règles ou un fichier de bibliothèque. Les règles d'un paquet s'affichent dans la boîte de dialogue (cliquez sur **Appliquer** pour les utiliser), et ses éléments entrent dans votre bibliothèque.
- Les paquets partagés par d'autres figurent sur la page des modules complémentaires, sous **Paquets de lignes électriques**. Deux paquets d'exemple montrent le format ; ce ne sont les règles d'aucun pays.

Chaque paquet est vérifié à l'ouverture, comme tout fichier. Vérifiez chaque valeur dans la norme applicable avant toute construction.

Deux jeux de règles d'exemple servent de point de départ : **Exemple : climat froid** et **Exemple : climat tempéré**. Leurs chiffres ne proviennent d'aucune norme : saisissez les valeurs de votre norme. {{ui:Save rules}} et {{ui:Open rules…}} partagent un jeu de règles sous forme de fichier.

## Calcul de la tension

Pour chaque section comprise entre deux supports d'ancrage :

1. La **portée de référence** est √(ΣL³ ÷ ΣL) de ses portées.
2. Chaque limite est convertie en tension horizontale dans le cas de référence, par l'**équation de changement d'état** appliquée à la portée de référence : H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. La plus contraignante fixe la tension.
3. La tension de chaque cas de charge en découle, et la forme de chaque portée est la **caténaire** exacte passant par ses deux points d'attache (y compris les portées en pente) : flèche depuis la corde, longueur et tension à chaque extrémité.

La charge par mètre dans un cas : le poids plus le givre (aire de givre × masse volumique × g) verticalement ; la pression du vent × le diamètre givré horizontalement.

## Tableaux de pose

{{ui:More}} › {{ui:Stringing tables…}} liste, pour chaque section, la tension horizontale et la flèche de chaque portée à chaque température du jeu de règles (de −5 °C à 40 °C par pas de 5 °C pour commencer), par temps calme. Enregistrez-les, ainsi que le tableau des supports, au format CSV.

Non pris en compte : le fluage du conducteur au fil des années, et l'allongement d'un conducteur neuf. Ajoutez-les par les températures auxquelles vous effectuez la pose.
