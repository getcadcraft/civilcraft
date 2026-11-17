---
title: Réseaux d'eau potable : pressions, débits et débit incendie
summary: Dessinez sur le plan un réseau sous pression de nœuds, réservoirs, cuves, canalisations, pompes et réducteurs de pression ; CivilCraft calcule les charges, les pressions et les débits (Hazen–Williams, réseaux maillés), le débit disponible pour un incendie et une journée de consommation. Fonction expérimentale ; chaque résultat doit être vérifié par un ingénieur.
keywords: eau, réseau d'eau potable, distribution d'eau, réseau sous pression, canalisation sous pression, réseau maillé, hazen-williams, coefficient C, perte de charge, pression résiduelle, débit incendie, bouche d'incendie, consommation, nœud, réservoir, cuve, pompe, courbe de pompe, réducteur de pression, prv, clapet anti-retour, période étendue, epanet, inp, vitesse
from: df46bf6d
---

Les réseaux d'eau potable forment la partie sous pression d'un site : des canalisations toujours pleines, dans lesquelles l'eau est poussée par un réservoir, une cuve ou une pompe. CivilCraft calcule la charge et la pression à chaque nœud et le débit dans chaque canalisation, y compris dans les réseaux maillés où l'eau peut emprunter plusieurs chemins. Cette fonction reste en laboratoire pendant sa vérification.

**Simple aide au calcul.** Chaque nombre doit être vérifié par un ingénieur qualifié : le résultat ne vaut que ce que valent les consommations, les altitudes, les diamètres et les rugosités que vous avez saisis, et un modèle en régime permanent ignore les coups de bélier, la qualité de l'eau et le fonctionnement réel d'une pompe incendie.

## Dessiner le réseau

1. Sous **Surface** › {{ui:Plus}}, choisissez {{ui:Réseaux d'eau potable…}}. La fenêtre reste ouverte pendant que vous travaillez sur le plan.
2. Choisissez {{ui:Réservoir}} et cliquez sur le plan à l'emplacement de l'alimentation. Sa charge démarre à 100 ft (30 m) au-dessus du terrain ; modifiez-la dans Propriétés.
3. Choisissez {{ui:Nœud}} et cliquez à chaque endroit où l'eau est prélevée ou où des canalisations se rejoignent. Un nœud prend son altitude du terrain ; saisissez-en une autre dans Propriétés pour la remplacer.
4. Choisissez {{ui:Canalisation}}, cliquez sur un nœud, puis sur le nœud qu'elle rejoint. L'outil reste actif pour la canalisation suivante. Une {{ui:Pompe}} et un {{ui:Réducteur de pression}} se dessinent de la même façon, du nœud d'aspiration (ou amont) vers le nœud de refoulement (ou aval). Une {{ui:Cuve}} se place comme un nœud.
5. Sélectionnez un nœud et saisissez sa {{ui:Consommation}} (gpm, ou L/s dans un projet en mètres). Sélectionnez une canalisation et réglez son {{ui:Diamètre}} (pouces, ou mm) et, si vous le connaissez, son coefficient C de Hazen–Williams.

Chaque modification correspond à une seule étape d'annulation. Suppr supprime le nœud et les canalisations qui s'y terminent.

## Signification des éléments

- **Canalisation.** La longueur est mesurée sur le plan, sauf si vous en saisissez une. C est la rugosité de Hazen–Williams (130 par défaut, modifiable dans la fenêtre). Un coefficient de pertes singulières K ajoute les pertes des coudes et raccords. Cochez **Clapet anti-retour** pour une canalisation qui ne doit pas laisser remonter l'eau ; une canalisation **Fermée** ne transporte rien.
- **Réservoir.** Une source à charge fixe, c'est-à-dire le niveau d'eau qu'il maintient au-dessus du plan de référence. Il fournit ou prélève ce dont le réseau a besoin.
- **Cuve.** Un niveau qui varie au cours de la journée. Dans les résultats en régime permanent, c'est une source à son niveau actuel.
- **Pompe.** Un point de fonctionnement (débit et charge) définit la courbe usuelle qui passe par lui : la charge à débit nul vaut 133 % de la charge de fonctionnement, et la charge est nulle au double du débit de fonctionnement. Une pompe ne fait jamais remonter l'eau.
- **Réducteur de pression.** Maintient la pression que vous réglez en aval lorsque l'alimentation est plus élevée. Lorsque l'alimentation est plus basse, il est ouvert et ne maintient rien ; si l'eau devait remonter, il se ferme.

## Lire les résultats

La fenêtre affiche la charge et la pression de chaque nœud, ainsi que le débit, la vitesse et la perte de charge de chaque liaison par 1,000 ft (ou par km), les nœuds étant colorés sur le plan : vert entre votre pression minimale et maximale, rouge en dessous, orange au-dessus. Les flèches de débit indiquent le sens. Sélectionnez un nœud ou une canalisation pour lire ses valeurs dans Propriétés.

Sous les tableaux figure une liste des points à examiner : pression basse ou haute, canalisation plus rapide que votre limite, nœud isolé de toute source, ou calcul qui n'a pas convergé. Les mêmes constats figurent dans le panneau Problèmes. Réglez les limites dans la fenêtre (20 psi, 100 psi et 10 ft/s par défaut ; 140 kPa, 700 kPa et 3 m/s dans un projet en mètres).

## Débit incendie

{{ui:Débit incendie…}} applique un débit à un nœud et affiche la pression à cet endroit ainsi que la pression la plus basse dans tout le réseau. Il calcule aussi le débit disponible à ce nœud tandis que le nœud le plus faible du réseau conserve la pression résiduelle que vous indiquez. Les autres consommations restent inchangées.

## Une journée de consommation

{{ui:Une journée de consommation…}} simule le réseau heure par heure. Indiquez le profil de consommation dans les paramètres du fichier (une liste de coefficients multiplicateurs qui se répète) ; les cuves se remplissent et se vident selon les débits entrants et sortants, et une pompe peut suivre un profil marche/arrêt. Une cuve qui atteint son niveau le plus haut ou le plus bas est citée dans la liste : CivilCraft ne ferme pas son entrée ni sa sortie à votre place, lisez donc cela comme « cette cuve est trop petite ou la pompe trop puissante ».

## Texte EPANET

{{ui:Enregistrer en texte EPANET (.inp)}} écrit le réseau dans le format texte que lisent de nombreux logiciels d'eau, et {{ui:Ouvrir un texte EPANET (.inp)…}} en lit un. Seuls les éléments modélisés par CivilCraft sont transférés : nœuds, réservoirs, cuves, canalisations, pompes avec courbe de charge, réducteurs de pression, profils de consommation et durées. Les autres types de vannes, les pompes définies par puissance et les autres formules de perte de charge sont signalés et laissés de côté. Le fichier doit utiliser les mêmes unités que le projet.

## Bouches d'incendie, vannes et raccords

Sélectionnez un nœud et cochez **Bouche d'incendie** pour en placer une ; sélectionnez une conduite et appuyez sur **Ajouter au milieu** pour y placer une vanne, une ventouse, une purge ou un compteur. Ce sont des objets du réseau : ils se déplacent avec lui, et une seule étape d'annulation les supprime.

Le tracé implique aussi des raccords, que CivilCraft liste sans qu'on le lui demande : un **té** là où trois conduites se rencontrent, une **croix** là où quatre se rencontrent, un **coude** (avec son angle) là où deux conduites tournent d'au moins 5°, un **réducteur** là où deux diamètres se rencontrent, et un **bouchon** en extrémité d'impasse. {{ui:Nomenclature des raccords (CSV)}} les compte ainsi que les conduites par diamètre. Il s'agit de ce que le tracé implique, un métré à vérifier avec vos propres détails, et non d'une liste de commande.

Les conduites sont posées à l'altitude du terrain diminuée d'un recouvrement (4 ft ou 1.2 m) pour pouvoir être dessinées et modélisées en 3D ; les pressions ci-dessus n'en dépendent jamais.

## Sur le plan et dans les fichiers

Le plan, le PDF et le DWG ou DXF portent les conduites sur **C-WATR-MAIN**, avec leurs diamètres sur **C-WATR-TEXT**, les bouches d'incendie sur **C-WATR-HYDR**, les vannes sur **C-WATR-VALV** et les raccords sur **C-WATR-FITT**. L'export LandXML écrit un réseau de canalisations d'eau (un ouvrage pour chaque nœud, une canalisation pour chaque conduite, bouches d'incendie nommées) ; l'import LandXML le relit comme conduites d'eau, sans consommations, pompes ni vannes, que LandXML ne transporte pas. L'export IFC écrit les conduites sous forme de segments de canalisation, de bouches d'incendie, de vannes et de raccords dans un seul système d'eau. Ces fichiers ont été vérifiés avec nos propres lecteurs et écrivains ; essayez-les dans vos autres logiciels et dites-nous ce qu'ils en disent.

## Ce qui n'est pas encore disponible

La qualité et l'âge de l'eau, les commandes et règles au-delà du profil marche/arrêt d'une pompe, les autres types de vannes, la consommation selon la pression, les canalisations à diamètre variable, et les débits d'égout dans le temps. Voir [Pas encore disponible](topic:not-built-yet). Les débits de dimensionnement de l'assainissement, qui relèvent d'un autre calcul, figurent dans [Débits de dimensionnement de l'assainissement](topic:sanitary-design).
