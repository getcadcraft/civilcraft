---
title: "Climat futur : inondation, chaleur et feux de forêt en 2050 et 2080"
summary: Dans Adresse vers le site, relever le niveau d'inondation du site pour un climat futur, évaluer l'exposition aux feux de forêt et transformer un fichier météo, à partir d'un jeu de données climatiques (SSP2-4.5 et SSP5-8.5, 2050 et 2080).
keywords: climat, changement climatique, futur, 2050, 2080, ssp, cmip6, scénario, niveau de la mer, inondation, cote de crue de référence, bfe, fema, chaleur, fichier météo, epw, transformation, feux de forêt, feu de brousse
from: b0d2ee38
---

Les chiffres climatiques proviennent d'un **jeu de données**, et non de l'application. Activez le module complémentaire {{ui:Climat futur}} dans Paramètres › Modules complémentaires, ou chargez un fichier de jeu de données à vous dans le bloc {{ui:Climat futur}}.

:::warning
Le jeu livré avec le module complémentaire est un **échantillon** : trois lieux (Denver, Miami, Johannesburg), un modèle climatique, cinq années dans chaque période de 20 ans. Il sert à essayer les outils, **pas pour la conception**. Un jeu complet est construit avec `tools/climate/build-pack.mjs` à partir des données NEX-GDDP-CMIP6 de la NASA.
:::

## Où la trouver

Surface › Plus › Adresse vers le site. Placez le point, ajoutez les couches (une couche FEMA d'inondation fournit la cote de crue de référence) et appuyez sur le bouton qui lit le site. Sous les lignes du site se trouve le bloc {{ui:Climat futur}} : choisissez un **Scénario** (SSP2-4.5 ou SSP5-8.5) et une **Année** (2050 = 2041-2060, 2080 = 2071-2090, les deux par rapport à 1995-2014). Le lieu du jeu le plus proche du point est utilisé, ou celui que vous choisissez ; loin de tous les lieux, les variations moyennes mondiales sont utilisées et le panneau l'indique.

## Niveau de crue de conception

Le niveau actuel est la cote de crue de référence de la FEMA lorsque la couche d'inondation en comportait une (en pieds, NAVD 88), sinon saisissez le vôtre. Choisissez le type de crue (côtière, fluviale ou pluies intenses, ou les deux), la hauteur de submersion au site pour la part pluviale, et une revanche si vous en voulez une. {{ui:Relever le niveau de crue}} affiche côte à côte le niveau actuel et le niveau futur, les parts dues au niveau de la mer et aux pluies, et les hypothèses : toute la hausse du niveau de la mer s'ajoute à un niveau côtier ; le débit d'un cours d'eau augmente à parts égales avec la pluie du jour le plus pluvieux, et la hauteur suit le débit à la puissance 0.6 (Manning, lit large) ; les parts s'additionnent.

:::warning
Un criblage de l'évolution, pas une étude d'inondation. Le niveau de crue de conception relève de l'autorité ou de votre ingénieur.
:::

## Exposition aux feux de forêt (criblage seulement)

La végétation la plus proche, la pente qui y monte et la distance donnent une classe allant de très faible à extrême, actuelle et future (la future multiplie par la variation de l'indice météorologique d'incendie du jeu). **Criblage seulement :** notre propre échelle relative pour savoir si un site a besoin d'une véritable évaluation du risque d'incendie ; ce n'est pas une notation réglementaire.

## Chaleur : un fichier météo futur

Choisissez un fichier `.epw` actuel et {{ui:Créer le fichier météo futur}} : il est transformé avec la méthode publiée de décalage et d'étirement (Belcher, Hacker et Powell 2005), et la chaleur est comparée (température moyenne et maximale, températures de conception, heures au-dessus de 30 °C et de 35 °C, degrés-jours). {{ui:Enregistrer le fichier météo futur}} l'enregistre pour le panneau Environnement, le contrôle énergétique de BimCraft ou vos propres outils.

## D'où viennent les chiffres

NASA NEX-GDDP-CMIP6 (sorties de modèles CMIP6 régionalisées, CC BY 4.0 par modèle) pour la température, l'humidité, l'ensoleillement, la pluie et les conditions d'incendie ; la moyenne mondiale du GIEC AR6 pour la hausse du niveau de la mer, sauf si le jeu comporte des chiffres locaux. Le panneau affiche la source, la licence et la date du jeu.
