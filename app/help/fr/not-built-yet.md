---
title: Pas encore disponible
summary: Ce que cette version de CivilCraft ne fait pas encore, et ce qu'il faut faire à la place aujourd'hui.
keywords: manquant, limitations, feuille de route, non disponible, spirales, élargissement, dwg, dxf, avaloirs, rétention, profils en travers, à venir, limites
from: b91588d4
---

CivilCraft en est à ses débuts. Cette page liste ce que la version actuelle ne fait pas, afin que vous ne le cherchiez pas. Rien ici n'est promis à une date.

## Points

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Ajouter un second fichier de points au premier | Assemblez d'abord les fichiers dans un éditeur de texte ou un tableur |
| Exporter un fichier texte de points | Exportez en LandXML (les points sortent sous forme de CgPoints), utilisez {{ui:Exporter}} du SIG (points avec les champs P, N, E, Z et D), ou {{ui:Copier}} les points dans un tableur |
| Styles d'étiquettes de points, symboles par clé de description, courbes (arcs) à partir de codes de ligne, un fichier de clés de description à partager entre projets | Les étiquettes affichent le numéro, l'altitude et la description, ou moins ([Réglages de CivilCraft](topic:settings)) ; les clés sont conservées dans le fichier de projet |
| Conversion d'unités | Convertissez le fichier avant l'import ; **Unités** ne fait que changer l'étiquette |

## Surfaces

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Plus d'une surface construite à partir de points | Un projet par surface |
| Masquer les limites (intérieures) | Utilisez **Plus long bord extérieur** ou une limite extérieure |
| Sélectionner ou modifier une ligne de rupture tracée | {{key:Mod+Z}}, ou {{ui:Retirer les lignes de rupture dessinées}} puis redessinez-la |
| Modifier une surface lue depuis du LandXML (lignes de rupture, limite) | {{ui:Reconstruire la surface à partir des points}} |
| Modifier une surface faite d'une grille d'altitudes | Réimportez la grille avec d'autres choix |
| Convertir une surface lue depuis du LandXML lorsque le système de coordonnées change | {{ui:Reconstruire la surface à partir des points}} d'abord |
| Altitudes ponctuelles cotées et valeurs de pente | Lisez-les dans la barre d'état, ou colorez la surface selon la pente avec **Analyse de pente** dans l'espace de travail Paysage ([Terrassement pour le paysage](topic:landscape-grading#grading-checks)) |

## Tracés et profils

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Spirales autres que les clothoïdes ; une spirale entre deux courbes (transitions composées) | Les clothoïdes aux extrémités d'une courbe sont disponibles ; les autres sont nommées et ignorées à l'import LandXML |
| Insérer un PI entre deux autres | Redessinez le tracé, ou ressaisissez les coordonnées des PI |
| Tracés à partir d'objets, décalages, élargissements | Dessinez par PI |
| Saisir K pour un raccordement vertical | Saisissez L (K est affiché) |
| Raccordements verticaux circulaires et dissymétriques | Raccordements paraboliques symétriques seulement |
| Plus d'un profil en long projet par tracé | Un tracé par variante |
| Zoom sur la vue de profil, bandes de profil sous le profil | La vue de profil s'ajuste à tout le tracé ; imprimez-la sur les [feuilles de plan et de profil](topic:plan-profile-sheets) |
| Coupes en DWG ou LandXML | Feuilles de coupes en PDF ; {{ui:CSV}} des surfaces et volumes |
| Tabulations inclinées, ou de largeurs différentes le long de la route | Une largeur de chaque côté pour tout le tracé |

## Corridors

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Terre-pleins centraux, barrières et un dévers qui fait pivoter les gabarits | Dessinez-les comme gabarits ([Gabarits de corridor](topic:corridor-templates)) ; les gabarits par PK ne prennent pas encore le dévers |
| Une variation progressive entre les gabarits de deux régions (transitions, effilements) | Changez le gabarit à un PK, ou donnez à un point une cible de largeur vers une ligne dessinée comme effilement |
| Rotation autour d'un bord, dévers dans le LandXML | Le dévers fait tourner autour de l'axe dans les courbes circulaires ; élargissez une voie avec une cible de largeur vers une ligne caractéristique |
| Cibles pour les talus (entrée en terre vers une ligne ou une surface), surfaces de corridor qui leur sont propres | Les cibles déplacent les bords de chaussée et les accotements ([Corridors](topic:corridor)) ; le corridor est terrassé dans la surface projet |
| Raccords de bordure, voies de tourne-à-gauche et îlots terrassés dans un carrefour ; fin d'une route latérale coupée sur le bord de la route principale en biais ; chemin raccordé à une route en plan, dans sa longueur et sa surface | Les routes qui se rejoignent sont raccordées d'équerre, le bord de la route principale est ouvert et la route latérale y est adoucie ([Où les routes se rencontrent](topic:corridor#where-roads-meet-roads-pads-and-paths)) ; un chemin s'arrête au bord de la route dans la surface projet et en 3D |
| Corridors exportés comme chaussées en LandXML ; un second corridor sur un tracé dans l'export IFC | La surface projet est exportée |
| Gabarits de terrain qui modifient la surface projet, en 3D ou dans les coupes | Ils donnent les surfaces et volumes de chaque couche ([Gabarits de terrain](topic:corridor-templates#terrain-templates)) |
| Trajectoires de giration avec vitesse, glissement des pneus, temps de braquage, remorques articulées ou dégagement de carrosserie ; une bibliothèque de véhicules de référence ; une trajectoire tracée en faisant glisser le véhicule | Trajectoires de giration à faible vitesse le long d'une ligne caractéristique ou d'un tracé, avec vos propres dimensions de véhicules ([Trajectoires de véhicules](topic:swept-paths)) |

## Terrassement et volumes

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Banquettes, lignes caractéristiques ouvertes terrassées dans le projet, terrassement jusqu'à une ligne caractéristique venue d'ailleurs | Fermez la ligne caractéristique ([Lignes caractéristiques](topic:feature-lines)), ou utilisez-la comme ligne de rupture du terrain naturel |
| Insérer ou supprimer un sommet de ligne caractéristique | Redessinez la ligne, ou faites-en un décalage en gradins |
| Arcs dans les lignes de rupture dessinées (par des points topographiques), spirales dans les lignes caractéristiques | Dessinez une ligne caractéristique avec des arcs et utilisez-la comme ligne de rupture du terrain naturel |
| Terrassement jusqu'à une distance, une altitude ou une autre surface | Entrée en terre vers le terrain naturel uniquement |
| Ajouter ou supprimer un angle de plateforme | Supprimez la plateforme et redessinez-la |
| Volumes TIN à TIN (prismes), choix de la taille de maille | Méthode par maille, taille de maille choisie pour vous |
| Foisonnement et retrait, terre végétale, épaisseurs de chaussée | Appliquez vous-même les coefficients aux chiffres indiqués |
| Coûts de transport libre et de surtransport, transport entre tracés différents, emprunts et décharges placés sur le plan | Le diagramme des mouvements de terres avec points de compensation, volumes déplacés et distances moyennes de transport |

## Réseaux de canalisations

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Plus d'un réseau par projet | Projets séparés pour le pluvial et les eaux usées |
| Conduites d'eau : qualité et âge de l'eau, commandes par règles, autres types de vannes (régulation de débit, étranglement, maintien de pression), pompes définies par leur puissance, demande qui dépend de la pression, option Darcy–Weisbach, catalogue de canalisations avec épaisseurs de paroi et classes de pression. Le reste des réseaux sous pression est en cours d'essai : [Conduites d'eau](topic:water-mains) | Vérifiez-les dans un logiciel de distribution d'eau ; les débits de projet pour les eaux usées figurent dans [Débits de projet d'assainissement](topic:sanitary-design) |
| Débits d'égout dans le temps (hydrogrammes, acheminement dynamique, stockage, pompes, déversoirs) | [Débits de projet d'assainissement](topic:sanitary-design) donne le débit de pointe permanent qu'utilise une feuille de projet |
| Capacité des avaloirs, étalement dans le caniveau, acheminement dans les bassins de rétention, hydrogrammes, pertes de charge autres qu'un coefficient de jonction | Vérifiez-les dans un autre logiciel ; débits, dimensions et lignes de charge figurent dans [Assainissement pluvial](topic:storm-drainage) |
| Bassins versants dans le plan PDF, DWG, DXF ou LandXML ; bassins versants issus de la surface (lignes de partage des eaux) | Dessinez les bassins à la main ; ils sont enregistrés dans le fichier de projet |
| Catalogues de canalisations, canalisations non circulaires, ouvrages qui ne sont pas des boîtes ou des cylindres droits (cônes, marches, cunettes) ; une catégorie d'assainissement dans la bibliothèque | Types d'ouvrages à partir de paramètres ([Réseau de canalisations](topic:pipe-network)) ; canalisations avec un diamètre |
| Canalisations dans la vue de profil, canalisations courbes | Lisez les radiers et les recouvrements dans le panneau de droite |

## Parcelles

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Découpage de lots par surface ou façade, parcelles à partir des lignes qui les entourent, emprise de passage | Dessinez chaque parcelle par ses angles, ou saisissez ses données de bornage |
| Tableaux de courbes et de lignes sur le plan ; étiquettes déplacées à la main | Chaque tronçon est étiqueté le long de lui-même |
| Parcelles dans le LandXML | Les parcelles sont enregistrées dans le fichier de projet et vont vers le PDF, le DWG et le DXF |

## Cheminements

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Compensation aux moindres carrés, règle du transit, pondération des angles par les distances | La règle de Bowditch |
| Angles de déviation, angles zénithaux et distances inclinées, altitudes par nivellement trigonométrique | Réduisez en distances et angles horizontaux, ou en gisements |
| Visées latérales, fichiers de données brutes des carnets de terrain | Importez les points comme fichier de points |

## Implantation

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Piquets décalés (points de référence reculés du piquet), piquets de talus au point de chute | Implantez aux décalages dont vous avez besoin, y compris au-delà de l'accotement |
| Envoyer les piquets directement au format propre d'un carnet de terrain | Le CSV s'ouvre dans le logiciel de bureau de la plupart des carnets de terrain |
| Implantation de canalisations, de plateformes et de parcelles | Utilisez les points topographiques près d'un tracé, ou les tronçons de la parcelle |

## Fichiers et sorties

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Textes, hachures et cotes issus d'un DWG ou DXF ; espace papier ; références externes ; DXF binaire | Les tracés de l'espace objet s'ouvrent ([Ouvrir un DWG ou DXF comme tracé](topic:open-dwg-dxf)) ; ouvrez les références externes à part |
| Déplacer plusieurs points à la fois par glissement | Couper et coller, ou les modifier un par un |
| Feuilles en portrait, cartouches personnalisés, fenêtres de présentation que vous disposez, feuilles de plan et de profil en DWG | Une feuille de plan en paysage par PDF, ou des feuilles de plan et de profil le long d'un tracé (PDF) |
| Tracer des bandes d'altitude et des profils | Les bandes ne sont visibles qu'à l'écran ; faites une capture d'écran si vous en avez besoin |
| Modifier les noms, couleurs ou styles d'étiquettes des calques | Modifiez-les dans un logiciel de CAO après l'export DXF |
| Enregistrement dans le cloud et historique des versions | Enregistrez les fichiers `.civilcraft.json` et gardez-les sauvegardés ; pour travailler à plusieurs sur un projet, utilisez une session Live dans CadCraft Studio ([Concevoir un site à plusieurs, en direct](topic:work-live)) |
| CadCraft Studio pour iPad et iPhone, et depuis Google Play | Utilisez CivilCraft dans le navigateur sur l'appareil ; sur Android, CadCraft Studio s'installe à partir de son APK sur getcadcraft.com/download |
| Ouvrir plusieurs fichiers de points ou de projet à la fois | Un fichier par ouverture (les fichiers SIG qui vont ensemble, comme les parties d'un shapefile, s'ouvrent ensemble) |

## Paysage

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Têtes et buses des fabricants | Têtes génériques, ou ajoutez vos propres têtes à partir d'un fichier ; les données des fabricants arrivent au fur et à mesure qu'ils donnent leur autorisation |
| Longueurs latérales maximales pour les lignes de goutte-à-goutte, débits dans le temps, pompes, réseaux de canalisations bouclés | Gardez les lignes de goutte-à-goutte à la longueur publiée par le fabricant ; la vérification nécessite un réseau ramifié |
| Contour exact d'un objet en forme libre concave ; son volume sous le sol mesuré exactement | L'enveloppe convexe est terrassée et le volume sous le sol est une estimation (indiquée dans les Propriétés) |
| Plantes dans la fonction « Placer depuis la bibliothèque » de BimCraft et de ModelCraft | Exportez l'IFC du paysage et ouvrez-le dans BimCraft à côté du bâtiment |
| Modèles de plantes détaillés (feuilles, branches, saisons) dans la vue 3D ; objets en forme libre et irrigation dans la vue 3D | Les plantes apparaissent en 3D sous forme de formes simples dimensionnées d'après la liste des plantes ([Voir le site en 3D](topic:site-3d)) ; la dispersion de ModelCraft crée des visuels de plantation |
| Murs de soutènement de terrain aménagé sur la surface | Donnez à une plateforme ou à un terre-plein des côtés verticaux : ce sont des murs de soutènement sur la surface ([Terrassement](topic:grading)) |
| Transformations SVG dans vos propres symboles ; textures et couleurs de vos propres modèles GLB de plantes ; géométrie GLB compressée | Aplatissez les transformations dans votre logiciel de dessin d'abord ; les modèles sont dessinés dans la couleur de la plante ; exportez le GLB sans compression ([Graphiques des plantes](topic:plant-graphics)) |
| Votre propre liste de plantes conservée dans votre compte de bibliothèque (modifiée dans l'application) | Modifiez la liste propre au projet dans le tableau des plantes et enregistrez-la comme fichier de plantes |
| Les outils paysagers pour les assistants sans la fenêtre (le serveur de fichiers et la ligne de commande) | Ils fonctionnent lorsque la fenêtre CivilCraft est ouverte ([Laisser un assistant IA travailler avec votre site](topic:assistants)) |

## Lignes électriques

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Un référentiel national intégré (cas de charge, dégagements, coefficients) | Réglez les valeurs de votre référentiel dans {{ui:Hypothèses et limites…}} et enregistrez-les, avec votre bibliothèque, comme un jeu à réutiliser et partager ([Jeux de paramètres](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| La distance horizontale d'un conducteur à la cime d'un arbre ou à un mur voisin de la ligne | Le dégagement vertical au-dessus des plantes et des murs que la ligne croise ([Vérifications des lignes](topic:power-line-checks#clearances)) |
| Fluage des conducteurs et allongement d'un conducteur neuf | Tenez-en compte dans les températures du tableau de tension |
| Capacité thermique des câbles enterrés (courant admissible selon leur pose) | Saisissez la capacité de votre fournisseur sur l'élément câble |
| Études de court-circuit, de protection et de mise à la terre | Utilisez un logiciel électrique dédié ; CivilCraft donne les longueurs du réseau et les câbles |
| Pylônes en treillis calculés barre par barre, et haubans d'ancrage dans le sol | Les supports sont vérifiés par leur charge nominale ; les haubans par leur charge admissible |
| Un fichier d'étude `.DON` vérifié dans le logiciel qui le lit | Vérifiez le fichier là-bas ; envoyez-nous un échantillon pour tester avec un vrai fichier |
| Lignes électriques dans la vue 3D et en IFC | Le plan, le profil de ligne, les feuilles et les couches SIG |
| Les outils de lignes électriques pour les assistants sans la fenêtre | Ils fonctionnent lorsque la fenêtre CivilCraft est ouverte ([Laisser un assistant IA travailler avec votre site](topic:assistants)) |

## Volumes bâtis

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Une bibliothèque de règles de zonage ou les règles d'une ville quelconque | Saisissez les limites de votre propre règlement ([Limites de zonage](topic:zoning-limits)) |
| Lumière du ciel sur les murs (ensoleillement des façades), vent | [Heures d'ensoleillement](topic:sun-hours) ne compte que le soleil direct |
| Ombre portée par des arbres, des plantes ou tout ce qui n'est pas dessiné comme une masse | Dessinez les bâtiments voisins comme des masses |
| Formes de toiture sur les masses | Masses à toit plat |
| Ouvertures, toitures et types de murs lorsqu'une masse est développée dans BimCraft | BimCraft construit des murs extérieurs simples sur chaque niveau et un plancher ; ajoutez le reste là-bas |

## SIG et systèmes de coordonnées

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| File Geodatabase ; styles KML, icônes, superpositions au sol et liens réseau | Convertissez d'abord en GeoPackage, shapefile ou GeoJSON ; les repères KML sont lus sans leurs styles |
| Modifier des entités SIG ou leurs attributs | Modifiez-les dans un logiciel SIG et réimportez. Le panneau Analyser crée de nouvelles couches (zone tampon, superposition, jointure, sélection) et ajoute des champs de surface et de longueur, mais il ne modifie pas une entité sur place |
| Analyse de réseau et raster, zones tampons à extrémités plates ou unilatérales, ajout ou suppression de lignes et changement de type de champ dans la table attributaire, couleurs de classes manuelles, légende de style dans les tracés | Utilisez Sélectionner pour choisir des entités et créer une couche à partir d'elles ; les extrémités plates ne sont pas proposées. La coloration par attribut et la table attributaire sont disponibles : voir [Styliser une couche par attribut](topic:gis-symbology) et [Travailler avec la table attributaire d'une couche](topic:gis-table) |
| Styles d'étiquettes (taille, placement) et étiquettes qui évitent les autres | Les étiquettes ont une taille unique et peuvent se chevaucher là où les entités sont denses |
| Systèmes altimétriques et modèles de géoïde | Les altitudes sont utilisées telles que le fichier les donne ; vérifiez vous-même le système altimétrique |
| Grilles de décalage autres que NAD27 vers NAD83 proposées par zone (OSTN15, NTv2 pour d'autres référentiels fonctionnent lorsque vous ajoutez le fichier), plusieurs grilles à la fois, grilles verticales | Ajoutez vous-même le fichier de grille de votre référentiel ; une grille par projet |
| Couches cartographiques dans le DXF ou dans les exports 3D | Les couches cartographiques vont dans le tracé PDF, et à côté du DWG sous forme d'image |
| Serveurs cartographiques qui demandent une connexion, une clé ou un jeton | Utilisez des services publics, ou un fichier image géoréférencé |
| Écriture de fichiers LAS ou LAZ à partir d'une surface, du modèle de terrain, ou des outils de grille d'altitudes et de LiDAR | Exportez les surfaces en grille d'altitudes GeoTIFF. Le module complémentaire [Nuages de points](topic:point-clouds) écrit un nuage nettoyé en LAS 1.4 ou LAZ |
| Intensité, couleur et retours LiDAR ; grilles d'altitudes à plusieurs bandes ; fichiers de grille ou LiDAR de plus de 200 Mo | Le LiDAR est filtré par classe seulement, les grilles utilisent leur première bande ; découpez d'abord les gros fichiers en tuiles |

## Saisie

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Sélection par cadre au tactile (elle nécessite {{key:Shift}}) | Appuyez longuement sur chaque point topographique pour l'ajouter |
| Coordonnées ou distances saisies pendant le dessin | Dessinez grossièrement, puis saisissez les coordonnées exactes des PI dans le tableau des PI du tracé |
| Saisir les coordonnées des angles de plateforme ou des ouvrages | Faites glisser leurs poignées ; zoomez pour la précision et surveillez E et N dans la barre d'état |
| Accrochage aux objets (autres que les points topographiques pour les lignes de rupture) | Zoomez et surveillez la barre d'état |

## Vue 3D

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Dessiner ou modifier dans la vue 3D | Dessinez et modifiez dans le plan ; la vue 3D suit chaque modification |
| Sélectionner des lignes caractéristiques de corridor ou des entités SIG en cliquant en 3D | Cliquez dessus dans le plan |
| Exporter la vue exagérée ou en pieds | Les exports sont à l'échelle réelle en mètres ; voir [Exporter le site en 3D](topic:export-3d) |
| Étiquettes dans les exports GLB ou OBJ, tailles et styles d'étiquettes en 3D | Les étiquettes n'apparaissent que dans la vue 3D, à une taille unique ; voir [Voir le site en 3D](topic:site-3d) |
| Textures issues de photos, enregistrement d'un parcours en vidéo, ombres provenant de l'extérieur du site, heures d'ensoleillement dans la vue 3D | Couches cartographiques drapées sur les surfaces ; conduite et position du soleil à un instant donné ; [heures d'ensoleillement](topic:sun-hours) pour un jour ou une saison sur le plan |
