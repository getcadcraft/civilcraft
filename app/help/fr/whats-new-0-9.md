---
title: Nouveautés de la version 0.9 (antérieure)
summary: Gabarits de corridor et de terrain, accrochages et boutons de choix pendant le dessin, analyse SIG avec table attributaire, étude d'ombre, production solaire, confort et vent pour un site, vue 3D de rendu, et les modules complémentaires Nuages de points et WaterCraft.
keywords: nouveautés 0.9, version antérieure, nouveautés, 0.9, notes de version, gabarits de corridor, gabarits de terrain, éditeur de gabarits, profil type, plusieurs corridors, accrochage, accrochages, choix, déplacer, copier, pivoter, tangente, rendu, rendu 3D, analyse SIG, zone tampon, superposition, jointure spatiale, table attributaire, styliser par attribut, étude d'ombre, production solaire, UTCI, confort extérieur, étude du vent, OpenFOAM, nuages de points, LAS, LAZ, WaterCraft, débit incendie, poteau d'incendie, âge de l'eau, chlore, demandes, info-bulles, disposition, changelog, modifications, 0.8, 0.8.1, version, nouvelles fonctions, pluie, pluvial, ruissellement, débordement, terrassement, équilibre, déblai et remblai, transport, meilleur tracé, moindre coût, tracé, bassin de rétention, exutoire, vidange, revanche, avancement, levé, drone, stock, adresse vers site, parcelle, sol, inondation, stabilité des pentes, Bishop, tassement, carrefour, marquage, signalisation, distance de visibilité, compensation, moindres carrés, cheminement, mine à ciel ouvert, modèle de blocs, liaison radio, Fresnel, aiguillage, croisement, langues, problèmes, Live, DWG
from: 4664522c
---

Voici ce qui a changé dans CivilCraft 0.9, par rapport à 0.8.1. CivilCraft 0.9 fait partie de CadCraft Studio 0.9 et de ses huit applications. Les grands axes sont les gabarits de corridor et de terrain, les accrochages pendant le dessin, l'analyse SIG, les études du soleil, de la production solaire, du confort et du vent sur un site, et deux modules complémentaires : Nuages de points et WaterCraft.

## Nouveautés

### Gabarits de corridor et de terrain

- **Gabarits de corridor.** Ouvrez {{ui:Surface}} › {{ui:Plus}} › {{ui:Gabarits de corridor…}} (ou tapez {{cmd:TEMPLATES}}). Un gabarit est une petite coupe transversale avec ses composants, décalages, pentes, matériaux et codes de points. Conservez-les dans le projet, dans {{ui:Ma bibliothèque}} ou sous forme de fichier `.cctemplates.json`. L'éditeur de gabarits affiche un dessin à l'échelle réelle et signale les problèmes au fur et à mesure que vous saisissez.
- **Construction à partir de gabarits par PK.** Sélectionnez un tracé et activez {{ui:Construire à partir de gabarits par PK}} dans ses Propriétés. Chaque côté de chaque région a sa propre liste de chaussée et sa propre condition de fin. {{ui:Ajouter un corridor}} sous {{ui:Corridors sur ce tracé en plan}} place plusieurs corridors sur un même tracé.
- **Gabarits de terrain.** {{ui:Surface}} › {{ui:Plus}} › {{ui:Gabarits de terrain…}} (ou tapez {{cmd:TERRAINTEMPLATES}}) applique sur un terrain des matériaux en couches, comme la terre végétale ou la chaussée et sa fondation, avec la surface et le volume de chaque couche. Voir [Gabarits de corridor et gabarits de terrain](topic:corridor-templates).

### Dessin

- **Accrochages.** Les outils Tracé, Plateforme, Parcelle, Masse, Ligne caractéristique, Mesure, Limite et Bassin versant s'accrochent aux points topographiques, aux PI, aux angles, aux sommets et aux ouvrages, avec une étiquette près du repère. Maintenez {{key:Alt}} pour un point libre.
- **Boutons de choix, tangente, déplacement, copie, rotation.** Les angles de plateforme, de parcelle et de ligne caractéristique ont des champs Est et Nord saisissables et un bouton Pick à viseur. Les Propriétés proposent aussi {{ui:Tangente à partir de deux points}} pour les tracés et {{ui:Déplacer, copier et faire pivoter}} pour les tracés, plateformes, parcelles et lignes caractéristiques. Voir [Dessiner avec accrochages, angles choisis, et déplacement, copie, rotation](topic:draft-with-snaps).
- **Vue de rendu en 3D.** Le bouton {{ui:Rendu}} de la barre 3D dessine le terrain avec des couleurs naturelles, le ciel, la brume et des ombres douces. Il ne modifie pas le modèle. Le menu {{ui:Soleil}} comporte maintenant les boutons {{ui:Appliquer}} et {{ui:Fermer}}. Voir [Voir le site en 3D](topic:site-3d).
- **Panneaux ouverts une section à la fois.** Le panneau de gauche et le panneau Propriétés n'ouvrent qu'une section et ferment les autres ; les groupes du ruban Paysage qui contiennent plusieurs outils sont des boutons fractionnés.

### Analyse SIG

- **Analyser.** {{ui:Surface}} › {{ui:Plus}} › {{ui:Analyser}} propose la zone tampon, la superposition, la jointure spatiale, la sélection par attribut ou par forme, et la mesure. Chaque outil crée une nouvelle couche en une seule étape d'annulation.
- **Table attributaire.** Le menu à trois points d'une couche contient {{ui:Table attributaire…}} et {{ui:Styliser par attribut…}}. Voir [Analyser les couches SIG](topic:gis-analysis) et [Travailler avec la table attributaire d'une couche](topic:gis-table).

### Le site : soleil, production solaire, confort et vent

- **Section Environnement.** Sélectionnez une masse : la section {{ui:Environnement}} se trouve sous {{ui:Heures d'ensoleillement}} dans ses Propriétés. Elle comporte une étude d'ombre (carte, tableau, animation, CSV), la production solaire à partir d'un fichier météo d'année type (.epw) et le confort extérieur (UTCI).
- **Vent, à titre de tri seulement.** {{ui:Lancer l'étude du vent}} colore le sol, du confort assis jusqu'à l'inconfort, pour chaque direction de vent du fichier météo. Elle n'est pas validée et le panneau l'indique.
- **Module complémentaire Vent piéton (OpenFOAM).** Désactivé jusqu'à ce que vous l'activiez dans {{ui:Paramètres}} › {{ui:Modules complémentaires}}. OpenFOAM est un logiciel que vous installez vous-même. Voir [Ombre, production solaire et confort extérieur](topic:environment).

### Nuages de points (module complémentaire)

- Activez {{ui:Nuages de points}} dans {{ui:Paramètres}} › {{ui:Modules complémentaires}} ; un onglet Nuages de points apparaît dans le panneau de droite. Ouvrez un fichier LAS ou LAZ, nettoyez-le, classez-le en sol, végétation et bâtiments, calculez le sol, les courbes de niveau et les volumes, puis exportez en LAS ou LAZ. Voir [Nuages de points issus d'un drone ou d'un scanner](topic:point-clouds).

### WaterCraft (module complémentaire)

- Activez {{ui:WaterCraft (distribution d'eau)}} dans {{ui:Paramètres}} › {{ui:Modules complémentaires}} ; un onglet WaterCraft apparaît. Il propose les demandes des abonnés, le débit incendie à chaque poteau, la coupure de conduite la plus importante, et l'âge de l'eau et le chlore, chacun enregistré en CSV. Voir [WaterCraft : demandes, débit incendie, coupures et âge de l'eau](topic:watercraft).

### Travail à plusieurs

- Dans une session Live, vous voyez les curseurs et les noms des autres dans le plan. Plantes de la bibliothèque : CivilCraft Paysage démarre à partir de sa collection par défaut, {{ui:Paysage CivilCraft}}.

## Dans toutes les applications

- Les conseils s'affichent sous forme d'info-bulles Bootstrap, et le conseil de démarrage peut être fermé.
- La barre d'onglets d'un panneau qui ne tient pas défile au lieu d'être coupée.
- Les titres d'onglets du navigateur affichent `<document> - CivilCraft | CadCraft`.
- {{ui:Paramètres}} comporte une section Disposition, où les dispositions sont une liste déroulante de choix sur deux lignes.
- Les unités de poids et de température se trouvent dans {{ui:Paramètres}} › {{ui:Général}} › {{ui:Unités}}.
- La liste des langues affiche celles pour lesquelles la version contient des fichiers. Les langues autres que l'anglais sont des brouillons de traduction automatique.

## Corrigé

- Les modules complémentaires d'aide à l'adresse et de vérification EnergyPlus ne pouvaient pas être activés ; ils le peuvent maintenant.
- L'aide indique maintenant que le module Nuages de points écrit un nuage nettoyé en LAS 1.4 ou LAZ.
- Cliquer sur la poignée de l'objet sélectionné ne démarre plus de glissement de poignée qui arrêtait un Pick en attente.

## Limites reconnues

- Les gabarits de corridor d'exemple sont des valeurs provisoires sans norme ; un ingénieur doit les vérifier. Les gabarits de terrain n'ajoutent aucune surface et ne sont pas tracés en 3D ni dans la vue en travers. Le deuxième corridor sur un tracé n'est pas dans l'export IFC. Il n'existe pas de transition entre deux gabarits par PK.
- Les nuages de points ont été testés sur des fichiers fictifs, pas sur un vrai levé par drone. Seuls les LAS et LAZ sont lus.
- L'analyse SIG a été testée sur des couches fictives.
- L'ombre, la production solaire et le confort sont des estimations de planification ; le vent est un tri non validé. Rien de cela n'est une valeur de conception.
- WaterCraft est un outil de calcul vérifié sur des réseaux fictifs. Un ingénieur en eau décide de la valeur des chiffres.
- Les langues autres que l'anglais sont des brouillons de traduction automatique.
- Les programmes d'installation Windows ne sont pas signés numériquement, et l'image disque macOS n'est pas notarisée.

## Plus tôt : 0.8 et 0.8.1

Voici ce qui a changé dans CivilCraft 0.8 (2026-11-01) et 0.8.1 (2026-11-02), par rapport à 0.7. Les grandes nouveautés sont des outils qui testent votre terrassement et votre site (pluie, terrassements, itinéraires, bassins, avancement), et six fenêtres de calcul pour le sol, les routes, le levé, les mines, les liaisons et le ferroviaire.

### Nouveautés

**Testez votre terrassement**

- **Faire pleuvoir.** {{ui:Faire pleuvoir…}} (sous {{ui:Surface}}) fait tomber une averse sur le terrain aménagé. Vous voyez l'eau ruisseler depuis les plateformes, stagner dans les angles bas et déborder des bassins trop petits. Le calcul est animé et donne les volumes, le débit de pointe et un CSV de chaque bassin. La maille par défaut est grossière pour un premier aperçu rapide ; une maille plus fine est plus lente. Les bassins qui débordent apparaissent aussi dans le panneau Problèmes.
- **Équilibrage des terrassements.** {{ui:Équilibrage des terrassements…}} relève ou abaisse une plateforme jusqu'à ce que le déblai égale le remblai, et affiche le tableau de transport entre eux.
- **Meilleur tracé.** {{ui:Meilleur tracé…}} : choisissez un départ et une arrivée, et CivilCraft trouve le chemin le moins coûteux à travers le terrain qui respecte vos limites de pente et de courbure, puis crée un tracé à partir de lui.
- **Bassins de rétention.** {{ui:Bassins de rétention…}} calcule le niveau et le stockage à partir de votre terrain, accepte des dispositifs d'évacuation (orifice, déversoir, déversoir en V, déversoir de crue), fait transiter une crue dans le bassin et vérifie le débit retenu, le temps de vidange et la revanche.
- **Avancement d'après les levés.** {{ui:Avancement d'après les levés…}} compare des surfaces de drone ou de scan de différentes dates avec le terrain tel qu'il était et avec le projet : pourcentage achevé en volume, zones surcreusées et surremblayées, stocks, et date de fin des travaux à ce rythme (signalée comme estimation).

**Connaître le site**

- **Adresse vers site.** {{ui:Adresse vers site…}} réunit sur un même site les données ouvertes de parcelle, bâtiment, zonage, sol, inondation et relief. Vous pouvez garder le site dans le fichier de projet : l'adresse saisie, chaque source avec la date de récupération et sa licence, et ce qui est revenu. Rouvrez ou partagez le projet et le site est toujours là, sans rien récupérer à nouveau. Vous pouvez aussi l'enregistrer comme fichier de site ou l'envoyer vers BimCraft. Voir [Adresse vers site](topic:address-to-site).

**Sol, routes, levé, mines, liaisons et ferroviaire**

- **Sols et pentes.** {{ui:Sols et pentes…}} dessine le profil du sol entre les sondages que vous saisissez. La méthode de Bishop recherche ensuite le cercle critique sur votre terrain, avec une nappe, une surcharge et un coefficient sismique ; le tassement d'une semelle tient compte de la consolidation, du tassement immédiat et du temps.
- **Carrefours et marquage.** {{ui:Carrefours et marquage…}} assemble des branches avec des raccordements de bordure (un rayon par branche, ou des raccordements à trois centres), la distance de visibilité pour la vitesse de projet, une vérification des triangles de visibilité, des passages piétons, des lignes d'arrêt, des marquages et une signalisation avec un tableau des panneaux. Ils sont dessinés sur le plan et enregistrés en .dxf avec des calques nommés.
- **Compensation de levé.** {{ui:Compensation de levé…}} effectue une compensation aux moindres carrés d'un cheminement ou d'un réseau : coordonnées compensées, ellipses d'erreur, test du khi-deux et signalement de la mesure qui ne correspond pas. Les réseaux libres, la fermeture d'un cheminement par la règle de Bowditch et les fichiers de terrain RW5, GSI, JobXML ou CSV sont inclus, et les points compensés s'enregistrent en CSV.
- **Mines à ciel ouvert.** {{ui:Mines à ciel ouvert…}} transforme des échantillons de sondage en modèle de blocs et en fosse ultime dans votre angle de talus, avec le rapport de découverture, un tableau par gradin et une courbe teneur-tonnage. Des fosses imbriquées selon le facteur de revenu et un planning de production avec flux de trésorerie actualisés sont également inclus.
- **Liaisons radio.** {{ui:Liaisons radio…}} vérifie la visibilité directe sur votre terrain en tenant compte de la courbure terrestre, de la première zone de Fresnel, du bilan de liaison, de la marge d'évanouissement et de l'indisponibilité par trajets multiples, et indique la hauteur de mât qui dégagerait le trajet. Il établit aussi les bilans de pertes de fibre, les quantités de tracé et le vent sur un pylône.
- **Aiguillages ferroviaires.** {{ui:Aiguillages ferroviaires…}} construit un aiguillage à partir de son numéro de cœur, des croisements entre voies parallèles et un gabarit de structure incliné par le dévers et élargi en courbe. Un aiguillage peut se trouver à un PK d'un tracé.

Voir [Sols, carrefours, compensation de levé, mines, liaisons et aiguillages](topic:soils-roads-survey-mines-links).

### Dans toutes les applications

- **Langues.** 54 langues, dont dix nouvelles. Les langues autres que l'anglais sont des brouillons de traduction automatique jusqu'à relecture par un locuteur natif. Les rubriques d'aide restent en grande partie en anglais.
- **Lignes de la barre d'outils.** {{ui:Paramètres}} › {{ui:Général}} › {{ui:Lignes de la barre d'outils}} : Retour à la ligne (comme avant), 2 lignes ou 1 ligne. Le ruban de CivilCraft affiche l'outil le plus utilisé en grand, les suivants en petit, et les autres derrière la flèche du nom du groupe.
- **Périphériques de saisie.** Pavé tactile, stylet, souris 3D, manette et MIDI peuvent piloter les applications.
- **Problèmes.** Un panneau Problèmes qui avertit dans chaque application, avec des contrôles qui lisent les jeux de réglementation.
- **Live.** Une vue de qui est où dans une session Live.
- **Modules complémentaires.** Une liste de modules complémentaires, avec des modules d'éclairage.
- **Connectez votre IA.** Tout assistant que vous connectez peut piloter les outils de CivilCraft. Une note indique que la connexion en un clic dans CadCraft Studio et le connecteur hébergé ne sont pas encore prêts. Voir [Laisser un assistant IA travailler avec votre site](topic:assistants).

### Corrigé dans 0.8.1

- **Section des classes DWG.** Elle était lue comme le mauvais type (GitHub cadcraft#5). Corrigé dans CivilCraft, ainsi que dans CadCraft, BimCraft, ModelCraft et TakeoffCraft.
- **Changement de langue pendant l'exécution.** CadCraft Studio et les éditions empaquetées peuvent changer de langue à l'exécution. Elles n'étaient qu'en anglais auparavant. Pas encore testé sur toutes les plateformes : dites-nous si la langue ne change pas.

### Pas encore dans cette version

- **Ce sont des outils de calcul.** Chaque résultat des nouvelles fenêtres doit être vérifié par un ingénieur. Les résistances des sols partent de valeurs typiques du groupe de sol, et la fenêtre l'indique.
- **Faire pleuvoir.** Un calcul sur le site d'exemple peut prendre plus de deux minutes dans le navigateur à une maille fine. Il a été vérifié sur des cas manuels et un bassin versant en V, pas encore sur un site terrassé réel.
- **Adresse vers site.** Il lit les fichiers de données ouvertes que vous apportez, et n'a été testé que sur nos propres fichiers. Les arbres ne sont pas une source. La récupération des sources à votre place attend la formulation sur la vie privée.
- **Avancement d'après les levés.** Testé sur des levés fictifs seulement. L'avancement sur les feuilles et les annotations (MarkupCraft) et la comparaison scan-modèle (BimCraft) ne sont pas construits.
- **Sols et pentes.** Surfaces circulaires seulement : pas de recherche en coin ou en bloc, ni de fissure de traction.
- **Carrefours.** Un rayon par branche, pas de trajectoires de poids lourds, et ils n'entrent pas encore dans le corridor.
- **Fichiers de terrain.** Les lecteurs ont été écrits à partir de descriptions publiques des formats et essayés sur des fichiers que nous avons faits. Des fichiers d'instruments réels sont recherchés.
- **Liaisons et ferroviaire.** Liaisons radio : affaiblissement en espace libre et trajets multiples seulement (ni évanouissement par la pluie ni diagrammes d'antenne), et aucune norme ferroviaire : chaque limite ferroviaire est une valeur provisoire, avec des chiffres de brouillon qu'aucun ingénieur ferroviaire n'a vérifiés.
- **Windows et macOS.** 0.8 n'est pas signé numériquement. Windows peut avertir, et macOS demande un clic droit puis Ouvrir.

Tout le reste est dans [Pas encore disponible](topic:not-built-yet). Pour la version antérieure, voir [Nouveautés de la 0.7](topic:whats-new-0-7).
