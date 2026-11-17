---
title: Nouveautés de la version 0.9
summary: Gabarits de corridor et de terrain, accrochages et boutons Désigner pendant le dessin, analyse SIG avec une table attributaire, études d'ombre, de production solaire, de confort et de vent pour un site, une vue Rendu en 3D, et les modules complémentaires Nuages de points et WaterCraft.
keywords: nouveautés, 0.9, notes de version, gabarits de corridor, gabarits de terrain, éditeur de gabarits, section type, plusieurs corridors, accrochage, accrochages, désigner, déplacer, copier, pivoter, tangente, rendu, rendu 3D, analyse SIG, zone tampon, superposition, jointure spatiale, table attributaire, styliser par attribut, étude d'ombre, production solaire, UTCI, confort extérieur, étude du vent, OpenFOAM, nuages de points, las, laz, watercraft, débit incendie, poteau d'incendie, âge de l'eau, chlore, demandes, info-bulles, disposition, notes de version, journal des modifications, modifications, 0.8, 0.8.1, version, nouvelles fonctions, pluie, pluvial, stagnation, surverse, terrassement, équilibrage, déblai, remblai, transport de terre, meilleur tracé, moindre coût, bassin de rétention, exutoire, rabattement, revanche, avancement, levé, drone, stock, adresse vers site, parcelle, sol, inondation, stabilité des talus, bishop, tassement, carrefour, marquage, signalisation, distance de visibilité, compensation, moindres carrés, cheminement, mine à ciel ouvert, modèle de blocs, liaison radio, fresnel, aiguillage, traversée, langues, problèmes, live, dwg
from: d7ac5b14
---

Ceci décrit les changements de CivilCraft 0.9 par rapport à la 0.8.1. CivilCraft 0.9 fait partie de CadCraft Studio 0.9 et de ses huit applications. Les grandes nouveautés sont les gabarits de corridor et de terrain, les accrochages pendant le dessin, l'analyse SIG, les études d'ensoleillement, de production solaire, de confort et de vent d'un site, et deux modules complémentaires : Nuages de points et WaterCraft.

## Nouveautés

### Gabarits de corridor et de terrain

- **Gabarits de corridor.** Ouvrez {{ui:Surface}} › {{ui:Plus}} › {{ui:Gabarits de corridor…}} (ou tapez {{cmd:TEMPLATES}}). Un gabarit est une petite coupe transversale avec des composants, des décalages, des pentes, des matériaux et des codes de points. Conservez-les dans le projet, dans {{ui:Ma bibliothèque}} ou sous forme de fichier `.cctemplates.json`. L'éditeur de gabarits affiche un dessin à l'échelle réelle et signale les problèmes au fur et à mesure que vous saisissez.
- **Construire à partir de gabarits par PK.** Sélectionnez un tracé et activez {{ui:Construire à partir de gabarits par PK}} dans ses Propriétés. Chaque côté de chaque région a sa propre liste de chaussée et sa propre condition de fin. {{ui:Ajouter un corridor}} sous {{ui:Corridors sur ce tracé en plan}} place plusieurs corridors sur un même tracé.
- **Gabarits de terrain.** {{ui:Surface}} › {{ui:Plus}} › {{ui:Gabarits de terrain…}} (ou tapez {{cmd:TERRAINTEMPLATES}}) dispose sur un terrain des matériaux en couches, comme la terre végétale, un revêtement ou une assise, avec la surface et le volume de chaque couche. Voir [Gabarits de corridor et gabarits de terrain](topic:corridor-templates).

### Dessin

- **Accrochages.** Les outils Tracé en plan, Plateforme, Parcelle, Volume, Ligne caractéristique, Mesurer, Limite et Bassin versant s'accrochent aux points de levé, aux PI, aux angles, aux sommets et aux ouvrages, avec une étiquette près du repère. Maintenez {{key:Alt}} pour un point libre.
- **Désigner, tangente, déplacer, copier et pivoter.** Les angles de plateforme, de parcelle et de ligne caractéristique ont des cases Est et Nord saisissables et un bouton Désigner en forme de réticule. Les Propriétés proposent aussi {{ui:Tangente à partir de deux points}} pour les tracés, et {{ui:Déplacer, copier et faire pivoter}} pour les tracés, les plateformes, les parcelles et les lignes caractéristiques. Voir [Dessiner avec accrochages, angles désignés et déplacement, copie et rotation](topic:draft-with-snaps).
- **Vue Rendu en 3D.** Le bouton {{ui:Rendu}} de la barre 3D dessine le terrain avec des couleurs naturelles, le ciel, la brume et des ombres douces. Il ne modifie pas le modèle. Le menu {{ui:Soleil}} comporte maintenant les boutons {{ui:Appliquer}} et {{ui:Fermer}}. Voir [Voir le site en 3D](topic:site-3d).
- **Panneaux ouverts une section à la fois.** Le panneau de gauche et le panneau Propriétés ouvrent une section et ferment les autres, et les outils du ruban Paysage regroupés en plusieurs outils sont des boutons fractionnés.

### Analyse SIG

- **Analyser.** {{ui:Surface}} › {{ui:Plus}} › {{ui:Analyser}} propose la zone tampon, la superposition, la jointure spatiale, la sélection par attribut ou par forme, et la mesure. Chaque outil crée une nouvelle couche en une seule étape d'annulation.
- **Table attributaire.** Le menu à trois points d'une couche contient {{ui:Table attributaire…}} et {{ui:Styliser par attribut…}}. Voir [Analyser les couches SIG](topic:gis-analysis) et [Travailler avec la table attributaire d'une couche](topic:gis-table).

### Le site : soleil, production solaire, confort et vent

- **Section Environnement.** Sélectionnez un volume : la section {{ui:Environnement}} se trouve sous {{ui:Heures d'ensoleillement}} dans ses Propriétés. Elle propose une étude d'ombre (carte, tableau, animation, CSV), la production solaire à partir d'un fichier météo d'une année type (.epw) et le confort extérieur (UTCI).
- **Vent, à titre indicatif seulement.** {{ui:Lancer l'étude du vent}} colore le sol, de l'assise à l'inconfort, pour chaque direction de vent du fichier météo. Il n'est pas validé, et le panneau le précise.
- **Module complémentaire Vent piéton (OpenFOAM).** Désactivé tant que vous ne l'activez pas dans {{ui:Paramètres}} › {{ui:Modules complémentaires}}. OpenFOAM est un logiciel que vous installez vous-même. Voir [Ombre, production solaire et confort extérieur](topic:environment).

### Nuages de points (module complémentaire)

- Activez {{ui:Nuages de points}} dans {{ui:Paramètres}} › {{ui:Modules complémentaires}} ; un onglet Nuages de points apparaît dans le panneau de droite. Ouvrez un fichier LAS ou LAZ, nettoyez-le, triez-le en sol, végétation et bâtiments, construisez le sol, les courbes de niveau et les volumes, puis exportez en LAS ou LAZ. Voir [Nuages de points issus d'un drone ou d'un scanner](topic:point-clouds).

### WaterCraft (module complémentaire)

- Activez {{ui:WaterCraft (distribution d'eau)}} dans {{ui:Paramètres}} › {{ui:Modules complémentaires}} ; un onglet WaterCraft apparaît. Il propose les demandes des clients, le débit incendie à chaque poteau d'incendie, la coupure de conduite qui compte le plus, ainsi que l'âge de l'eau et le chlore, chacun enregistrable en CSV. Voir [WaterCraft : demandes, débit incendie, coupures et âge de l'eau](topic:watercraft).

### Travailler à plusieurs

- Dans une session Live, vous voyez les curseurs et les noms des autres sur le plan. Plantes de la bibliothèque : CivilCraft Paysage démarre à partir de sa collection par défaut, {{ui:Paysage CivilCraft}}.

## Dans toutes les applications

- Les indications s'affichent sous forme d'info-bulles Bootstrap, et l'astuce de démarrage peut être fermée.
- La barre d'onglets d'un panneau qui ne tient pas défile au lieu d'être coupée.
- Les titres des onglets du navigateur affichent `<document> - CivilCraft | CadCraft`.
- {{ui:Paramètres}} comporte une section Disposition, où les dispositions sont une liste déroulante de choix sur deux lignes.
- Les unités de poids et de température se trouvent dans {{ui:Paramètres}} › {{ui:Global}} › {{ui:Unités}}.
- La liste des langues affiche les langues pour lesquelles la version dispose de fichiers. Les langues autres que l'anglais sont des brouillons automatiques.

## Corrigé

- Les modules complémentaires de recherche d'adresse et de vérification EnergyPlus ne pouvaient pas être activés ; ils le peuvent maintenant.
- L'aide indique maintenant que le module Nuages de points écrit un nuage nettoyé en LAS 1.4 ou en LAZ.
- Cliquer sur la poignée propre à l'objet sélectionné ne lance plus un glissement de poignée qui arrêtait un Désigner en attente.

## Limites assumées

- Les gabarits de corridor d'exemple sont des espaces réservés sans norme ; un ingénieur doit les vérifier. Les gabarits de terrain n'ajoutent aucune surface et ne sont pas dessinés en 3D ni dans la vue de coupe. Le second corridor d'un tracé n'est pas dans l'export IFC. Il n'y a pas de transition progressive entre deux gabarits par PK.
- Les nuages de points ont été testés sur des fichiers fictifs, pas sur un relevé de drone réel. Seuls LAS et LAZ sont lus.
- L'analyse SIG a été testée sur des couches fictives.
- L'ombre, le solaire et le confort sont des estimations de planification ; le vent est un criblage non validé. Aucune de ces valeurs n'est une valeur de conception.
- WaterCraft est un outil d'aide au calcul vérifié sur des réseaux fictifs. Un ingénieur en eau décide de la valeur des chiffres.
- Les langues autres que l'anglais sont des brouillons automatiques tant qu'un locuteur natif ne les a pas relus.
- Les installateurs Windows ne sont pas signés numériquement, et l'image disque macOS n'est pas notarisée.

## Plus tôt : 0.8 et 0.8.1

Ceci décrit les changements de CivilCraft 0.8 (2026-11-01) et 0.8.1 (2026-11-02) par rapport à la 0.7. Les grandes nouveautés sont des outils qui testent votre terrassement et votre site (pluie, terrassement, tracés, bassins, avancement) et six fenêtres de calcul pour le sol, les routes, le levé, les mines, les liaisons et le rail.

### Nouveautés

**Tester votre terrassement**

- **Faire pleuvoir.** {{ui:Faire pleuvoir…}} (sous {{ui:Surface}}) fait tomber un orage sur le terrain aménagé. Vous voyez l'eau ruisseler depuis les plateformes, stagner dans les creux et déborder des bassins trop petits. Le calcul est animé et donne les volumes, le débit de pointe sortant et un CSV de chaque bassin. La cellule par défaut est grossière pour un premier aperçu rapide ; une cellule plus fine est plus lente. Les bassins qui débordent apparaissent aussi dans le panneau Problèmes.
- **Équilibrage des terrassements.** {{ui:Équilibrage des terrassements…}} élève ou abaisse une plateforme jusqu'à ce que le déblai égale le remblai, et affiche le tableau des transports de terre entre les deux.
- **Meilleur tracé.** {{ui:Meilleur tracé…}} : choisissez un départ et une arrivée, et CivilCraft trouve le chemin le moins coûteux à travers le terrain qui respecte vos limites de pente et de courbure, puis crée un tracé à partir de lui.
- **Bassins de rétention.** {{ui:Bassins de rétention…}} calcule la cote et le stockage à partir de votre terrain, prend des dispositifs d'évacuation (orifice, déversoir, déversoir en V, déversoir de crue), fait transiter un orage dans le bassin et vérifie le débit de pointe retenu, la durée de vidange et la revanche.
- **Avancement d'après les levés.** {{ui:Avancement d'après les levés…}} compare les surfaces de drone ou de scan à différentes dates, avec le terrain tel qu'il était et avec le projet : pourcentage d'achèvement en volume, zones surcreusées et surremblayées, stocks, et date d'achèvement à ce rythme (signalée comme estimation).

**Connaître le site**

- **Adresse vers site.** {{ui:De l'adresse au site…}} regroupe sur un seul site les données ouvertes de parcelles, bâtiments, zonage, sol, inondation et terrain. Vous pouvez conserver le site dans le fichier de projet : l'adresse saisie, chaque source avec la date de récupération et sa licence, et ce qui a été renvoyé. Rouvrez ou partagez le projet et le site est toujours là, sans rien récupérer à nouveau. Vous pouvez aussi l'enregistrer comme fichier de site ou l'envoyer à BimCraft. Voir [De l'adresse au site](topic:address-to-site).

**Sol, routes, levé, mines, liaisons et rail**

- **Sols et pentes.** {{ui:Sols et pentes…}} dessine le profil du sol entre les sondages que vous saisissez. La méthode de Bishop recherche ensuite le cercle critique sur votre terrain, avec une nappe, une surcharge et un coefficient sismique ; le tassement d'une semelle prend en compte la consolidation, le tassement immédiat et le temps.
- **Carrefours et marquage.** {{ui:Carrefours et marquage…}} assemble des branches avec des raccordements de bordure (un rayon par branche, ou des raccordements à trois centres), la distance de visibilité pour la vitesse de projet, une vérification des triangles de visibilité, des passages piétons, des lignes d'arrêt, des marquages et des panneaux avec un tableau des panneaux. Ils sont dessinés sur le plan et enregistrés en .dxf avec des calques nommés.
- **Compensation de levé.** {{ui:Compensation de levé…}} effectue une compensation par moindres carrés d'un cheminement ou d'un réseau : coordonnées compensées, ellipses d'erreur, test du khi-deux, et un signalement de la mesure qui ne s'accorde pas. Les réseaux libres, la fermeture d'un cheminement par la règle de la boussole, et RW5, GSI, JobXML ou les fichiers de terrain en CSV sont inclus, et les points compensés s'enregistrent en CSV.
- **Mines à ciel ouvert.** {{ui:Mines à ciel ouvert…}} transforme des échantillons de forage en modèle de blocs et en fosse ultime dans votre angle de talus, avec le ratio de découverture, un tableau par gradin et une courbe teneur-tonnage. Des fosses imbriquées selon le facteur de revenu et un planning de production avec flux de trésorerie actualisé sont aussi inclus.
- **Liaisons radio.** {{ui:Liaisons radio…}} vérifie la visibilité directe sur votre terrain en tenant compte de la courbure terrestre, de la première zone de Fresnel, du bilan de liaison, de la marge d'évanouissement et de la coupure par trajets multiples, et donne la hauteur de mât nécessaire pour dégager le trajet. Il établit aussi les bilans de pertes pour la fibre optique, les quantités du tracé et le vent sur un pylône.
- **Aiguillages ferroviaires.** {{ui:Aiguillages ferroviaires…}} crée un aiguillage à partir de son numéro de cœur, des communications entre voies parallèles, et un gabarit d'ouvrage incliné par le dévers et élargi en courbe. Un aiguillage peut se placer à un point kilométrique d'un tracé.

Voir [Sols, carrefours, compensation, mines, liaisons et aiguillages](topic:soils-roads-survey-mines-links).

### Dans toutes les applications

- **Langues.** 54 langues, dont dix nouvelles. Les langues autres que l'anglais sont des brouillons automatiques tant qu'un locuteur natif ne les a pas relus. Les rubriques d'aide sont encore principalement en anglais.
- **Lignes de la barre d'outils.** {{ui:Paramètres}} › {{ui:Général}} › {{ui:Lignes de la barre d'outils}} : Retour à la ligne (comme avant), 2 lignes ou 1 ligne. Le Ruban de CivilCraft affiche l'outil le plus utilisé en grand, les suivants en petit, et le reste derrière la flèche du nom du groupe.
- **Périphériques de saisie.** Pavé tactile, stylet, souris 3D, manette et MIDI peuvent piloter les applications.
- **Problèmes.** Un panneau Problèmes qui avertit dans chaque application, avec des contrôles qui lisent des lots de réglementation.
- **Live.** Une vue de la position de chacun dans une session Live.
- **Modules complémentaires.** Une liste de modules complémentaires, avec des modules d'éclairage.
- **Connectez votre IA.** Tout assistant que vous connectez peut piloter les outils de CivilCraft. Il est livré avec une remarque indiquant que la connexion en un clic dans CadCraft Studio et le connecteur hébergé ne sont pas encore prêts. Voir [Laisser un assistant IA travailler avec votre site](topic:assistants).

### Corrigé dans 0.8.1

- **Section des classes DWG.** Elle était lue avec le mauvais type (GitHub cadcraft#5). Corrigé dans CivilCraft, ainsi que dans CadCraft, BimCraft, ModelCraft et TakeoffCraft.
- **Changement de langue pendant l'exécution.** CadCraft Studio et les éditions empaquetées peuvent changer de langue à l'exécution. Elles étaient uniquement en anglais auparavant. Pas encore testé sur toutes les plateformes : dites-nous si la langue ne change pas.

### Pas encore disponible dans cette version

- **Ce sont des outils d'aide au calcul.** Chaque résultat des nouvelles fenêtres doit être vérifié par un ingénieur. Les résistances du sol partent de valeurs types pour le groupe de sol, et la fenêtre l'indique.
- **Faire pleuvoir.** Un calcul sur le site d'exemple peut prendre plus de deux minutes dans le navigateur avec une cellule fine. Il a été vérifié sur des cas calculés à la main et un bassin versant en V, pas encore sur un site terrassé réel.
- **Adresse vers site.** Il lit les fichiers de données ouvertes que vous apportez, et n'a été testé que sur nos propres fichiers. Les arbres ne sont pas une source. La récupération des sources à votre place attend la rédaction de la politique de confidentialité.
- **Avancement d'après les levés.** Testé sur des levés fictifs uniquement. L'avancement sur les feuilles et les annotations (MarkupCraft) et le comparatif scan-modèle (BimCraft) ne sont pas encore disponibles.
- **Sols et pentes.** Surfaces circulaires uniquement : ni recherche de coin ou de bloc, ni fissure de traction.
- **Carrefours.** Un rayon par branche, pas de trajectoires de camions, et ils ne vont pas encore dans le corridor.
- **Fichiers de terrain.** Les lecteurs ont été écrits à partir de descriptions publiques des formats et essayés sur des fichiers que nous avons faits. Des fichiers d'instruments réels sont attendus.
- **Liaisons et rail.** Liaisons radio : affaiblissement en espace libre et trajets multiples uniquement (ni évanouissement par la pluie, ni diagrammes d'antenne), et aucune norme ferroviaire : chaque limite ferroviaire est un espace réservé, avec des chiffres provisoires qu'aucun ingénieur ferroviaire n'a vérifiés.
- **Windows et macOS.** La 0.8 n'est pas signée numériquement. Windows peut afficher un avertissement, et macOS demande un clic droit puis Ouvrir.

Le reste figure dans [Pas encore disponible](topic:not-built-yet). Pour la version précédente, voir [Nouveautés de la version 0.7](topic:whats-new-0-7).
