---
title: Nouveautés de la version 0.8 et 0.8.1
summary: CivilCraft 0.8 ajoute Faire pleuvoir (une averse sur votre terrassement), un équilibrage des terrassements, un chercheur de meilleur tracé, des bassins de rétention, l'avancement d'après les levés, un importeur d'adresse vers site qui garde le site dans le projet, et des fenêtres pour les sols et pentes, les carrefours et marquage, la compensation de levé, les mines à ciel ouvert, les liaisons radio et les aiguillages ferroviaires. 0.8.1 corrige la lecture des fichiers DWG.
keywords: nouveautés, quoi de neuf, notes de version, journal des modifications, modifications, 0.8, 0.8.1, version, nouvelles fonctions, pluie, averse, ruissellement, débordement, terrassement, équilibre, déblai, remblai, transport de terres, meilleur tracé, coût minimal, tracé, bassin de rétention, exutoire, vidange, revanche, avancement, levé, drone, stock, de l'adresse au site, parcelle, sol, crue, stabilité des talus, bishop, tassement, carrefour, marquage, signalisation, distance de visibilité, compensation, moindres carrés, cheminement, mine à ciel ouvert, modèle de blocs, liaison radio, fresnel, aiguillage, traversée, langues, problèmes, live, dwg
from: b0932cf0
---

Voici ce qui a changé dans CivilCraft 0.8 (2026-11-01) et 0.8.1 (2026-11-02), par rapport à la 0.7. Les grandes nouveautés sont des outils qui testent votre terrassement et votre site (pluie, terrassements, routes, bassins, avancement) et six fenêtres de calcul pour le terrain, les routes, les levés, les mines, les liaisons et les voies ferrées.

## Nouveau

### Testez votre terrassement

- **Faire pleuvoir.** {{ui:Make it rain…}} (sous {{ui:Surface}}) déverse un orage sur le terrain terrassé. Vous voyez l'eau ruisseler depuis les plateformes, stagner dans les creux et déborder des bassins trop petits. La simulation est animée et donne les volumes, le débit de pointe et un CSV de chaque bassin. La maille par défaut est grossière pour un premier aperçu rapide ; une maille plus fine est plus lente. Les bassins qui débordent apparaissent aussi dans le panneau Problèmes.
- **Équilibrage des terrassements.** {{ui:Earthwork balancer…}} élève ou abaisse une plateforme jusqu'à ce que le déblai égale le remblai, et affiche le tableau des transports entre les deux.
- **Meilleur tracé.** {{ui:Best route…}} : choisissez un départ et une arrivée, et CivilCraft trouve le chemin le moins coûteux à travers le terrain qui respecte vos limites de pente et de courbure, puis en fait un tracé en plan.
- **Bassins de rétention.** {{ui:Detention ponds…}} calcule la cote et le stockage à partir de votre terrain, prend des dispositifs de sortie (orifice, déversoir, déversoir en V, déversoir de crue), fait transiter une averse dans le bassin et vérifie le débit de pointe retenu, la durée de vidange et la revanche.
- **Avancement d'après les levés.** {{ui:Progress from surveys…}} compare des surfaces de drone ou de scan de dates différentes avec le terrain tel qu'il était et avec le projet : pourcentage d'avancement en volume, zones surcreusées et surcomblées, stocks, et date de fin des travaux à ce rythme (indiquée comme estimation).

### Connaître le site

- **De l'adresse au site.** {{ui:Address to site…}} rassemble sur un seul site les données ouvertes de parcelle, de bâtiment, de zonage, de sol, de crue et de terrain. Vous pouvez garder le site dans le fichier de projet : l'adresse saisie, chaque source avec la date de récupération et sa licence, et ce qui a été reçu. Rouvrez ou partagez le projet et le site est toujours là, sans rien récupérer à nouveau. Vous pouvez aussi l'enregistrer comme fichier de site ou l'envoyer à BimCraft. Voir [De l'adresse au site](topic:address-to-site).

### Terrain, routes, levés, mines, liaisons et voies ferrées

- **Sols et pentes.** {{ui:Soils and slopes…}} dessine le profil du sol entre les sondages que vous saisissez. La méthode de Bishop recherche ensuite le cercle critique sur votre terrain, avec une nappe phréatique, une surcharge et un coefficient sismique ; le tassement d'une semelle tient compte de la consolidation, du tassement immédiat et du temps.
- **Carrefours et marquage.** {{ui:Junctions and striping…}} raccorde des branches avec des raccords de bordure (un rayon par branche, ou raccords à trois centres), la distance de visibilité pour la vitesse de projet, une vérification des triangles de visibilité, des passages piétons, des lignes d'arrêt, des marquages et une signalisation avec un tableau des panneaux. Ils sont dessinés sur le plan et enregistrés en .dxf avec des calques nommés.
- **Compensation de levé.** {{ui:Survey adjustment…}} effectue une compensation par moindres carrés d'un cheminement ou d'un réseau : coordonnées compensées, ellipses d'erreur, test du khi-deux et signalement de la mesure qui ne s'accorde pas. Les réseaux libres, la fermeture d'un cheminement par la règle de la boussole, et les fichiers de terrain RW5, GSI, JobXML ou CSV sont inclus, et les points compensés s'enregistrent en CSV.
- **Mines à ciel ouvert.** {{ui:Open pits…}} transforme les échantillons de forage en modèle de blocs et en fosse ultime dans votre angle de talus, avec le ratio de découverte, un tableau par gradin et une courbe teneur-tonnage. Des fosses imbriquées selon le facteur de revenu et un planning de production avec flux de trésorerie actualisés sont aussi inclus.
- **Liaisons radio.** {{ui:Radio links…}} vérifie la visibilité directe sur votre terrain en tenant compte de la courbure terrestre, de la première zone de Fresnel, du bilan de liaison, de la marge d'évanouissement et de la coupure par trajets multiples, et donne la hauteur de mât qui dégagerait le trajet. Il fait aussi les bilans d'affaiblissement fibre, les quantités de routes et le vent sur un pylône.
- **Aiguillages ferroviaires.** {{ui:Rail turnouts…}} crée un aiguillage à partir de son numéro de cœur, des traversées entre voies parallèles et un gabarit d'obstacles incliné par le dévers et élargi en courbe. Un aiguillage peut se situer à un point kilométrique d'un tracé.

Voir [Sols, carrefours, compensation de levé, mines, liaisons radio et aiguillages](topic:soils-roads-survey-mines-links).

## Dans chaque application

- **Langues.** 54 langues, dont dix nouvelles. Les langues autres que l'anglais sont des brouillons automatiques tant qu'un locuteur natif ne les a pas relues. Les rubriques d'aide restent majoritairement en anglais.
- **Lignes de la barre d'outils.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}} : Retour à la ligne (comme avant), 2 lignes ou 1 ligne. Le ruban de CivilCraft affiche l'outil le plus utilisé en grand, les suivants en petit, et le reste derrière la flèche du nom du groupe.
- **Périphériques de saisie.** Le pavé tactile, le stylet, la souris 3D, la manette et MIDI peuvent piloter les applications.
- **Problèmes.** Un panneau Problèmes qui avertit dans chaque application, avec des contrôles qui lisent les jeux de règles réglementaires.
- **Live.** Une vue de qui est où dans une session Live.
- **Modules complémentaires.** Une liste des modules complémentaires, avec des modules d'éclairage.
- **Connectez votre IA.** Tout assistant que vous connectez peut piloter les outils de CivilCraft. Une remarque précise que la connexion en un clic dans CadCraft Studio et le connecteur hébergé ne sont pas encore prêts. Voir [Laisser un assistant IA travailler sur votre site](topic:assistants).

## Corrigé dans 0.8.1

- **Section des classes DWG.** Elle était lue comme le mauvais type (GitHub cadcraft#5). Corrigé dans CivilCraft, ainsi que dans CadCraft, BimCraft, ModelCraft et TakeoffCraft.
- **Changement de langue en cours d'exécution.** CadCraft Studio et les éditions empaquetées peuvent changer de langue pendant l'exécution. Auparavant, elles n'étaient qu'en anglais. Pas encore testé sur toutes les plateformes : dites-nous si la langue ne change pas.

## Pas encore disponible dans cette version

- **Ce sont des outils de calcul.** Chaque résultat des nouvelles fenêtres doit être vérifié par un ingénieur. Les résistances du sol partent de valeurs types pour le groupe de sol, et la fenêtre l'indique.
- **Faire pleuvoir.** Une simulation sur le site d'exemple peut prendre plus de deux minutes dans le navigateur avec une maille fine. Elle a été vérifiée sur des cas calculés à la main et un bassin versant en V, mais pas encore sur un site terrassé réel.
- **De l'adresse au site.** Lit les fichiers de données ouvertes que vous apportez, et n'a été testée que sur nos propres fichiers. Les arbres ne sont pas une source. La récupération automatique des sources attend la formulation sur la confidentialité.
- **Avancement d'après les levés.** Testé sur des levés fictifs uniquement. L'avancement sur les feuilles et les annotations (MarkupCraft) et la comparaison scan avec modèle (BimCraft) ne sont pas encore disponibles.
- **Sols et pentes.** Surfaces circulaires uniquement : pas de recherche par coin ou par bloc, ni de fissure de traction.
- **Carrefours.** Un rayon par branche, pas de trajectoires de camions, et ils ne passent pas encore dans le corridor.
- **Fichiers de terrain.** Les lecteurs ont été écrits à partir de descriptions publiques des formats et essayés sur des fichiers que nous avons créés. Des fichiers d'instruments réels sont recherchés.
- **Liaisons et voies ferrées.** Liaisons radio : affaiblissement en espace libre et trajets multiples seulement (ni évanouissement dû à la pluie ni diagrammes d'antenne), et aucune norme ferroviaire : chaque limite ferroviaire est un espace réservé, avec des valeurs provisoires qu'aucun ingénieur ferroviaire n'a vérifiées.
- **Windows et macOS.** La 0.8 n'est pas signée numériquement. Windows peut afficher un avertissement, et macOS demande de faire un clic droit puis Ouvrir.

Le reste figure dans [Pas encore disponible](topic:not-built-yet). Pour la version précédente, voir [Nouveautés de la version 0.7](topic:whats-new-0-7).
