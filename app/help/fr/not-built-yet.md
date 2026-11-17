---
title: Pas encore disponible
summary: Ce que cette version de CivilCraft ne fait pas encore, et ce qu'il faut faire à la place aujourd'hui.
keywords: manquant, limites, feuille de route, non disponible, spirales, élargissement, dwg, dxf, avaloirs, rétention, coupes en travers, à venir, limites
from: a2d970ef
---

CivilCraft est en cours de développement. Cette page liste ce que la version actuelle ne fait pas, afin que vous ne le cherchiez pas. Rien ici n'est promis à une date.

## Points

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Ajouter un second fichier de points au premier | Réunissez d'abord les fichiers dans un éditeur de texte ou un tableur |
| Exporter un fichier texte de points | Exportez en LandXML (les points sortent en CgPoints), utilisez {{ui:Exporter}} du SIG (points avec les champs P, N, E, Z et D), ou {{ui:Copier}} les points dans un tableur |
| Styles d'étiquettes de points, symboles par clé de description, courbes (arcs) issues de codes de ligne, un fichier de clés de description à partager entre projets | Les étiquettes affichent le numéro, l'altitude et la description, ou moins ([Paramètres de CivilCraft](topic:settings)) ; les clés sont conservées dans le fichier du projet |
| Conversion d'unités | Convertissez le fichier avant l'import ; **Unités** ne fait que changer l'étiquette |

## Surfaces

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Plus d'une surface construite à partir de points | Un projet par surface |
| Masquer les limites (intérieures) | Utilisez **Plus long bord extérieur** ou une limite extérieure |
| Sélectionner ou modifier une ligne de rupture dessinée | {{key:Mod+Z}}, ou {{ui:Retirer les lignes de rupture dessinées}} puis redessinez |
| Modifier une surface lue depuis un LandXML (lignes de rupture, limite) | {{ui:Reconstruire la surface à partir des points}} |
| Modifier une surface faite d'une grille d'altitudes | Réimportez la grille avec d'autres choix |
| Convertir une surface lue depuis un LandXML lorsque le système de coordonnées change | {{ui:Reconstruire la surface à partir des points}} d'abord |
| Cotes d'altitude ponctuelles étiquetées et valeurs de pente | Lisez-les dans la barre d'état, ou colorez la surface par pente avec **Analyse des pentes** dans l'espace Aménagement paysager ([Terrassement pour l'aménagement](topic:landscape-grading#grading-checks)) |

## Tracés et profils

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Spirales autres que les clothoïdes ; une spirale entre deux courbes (raccordements composés) | Les spirales en clothoïde aux extrémités d'une courbe sont disponibles ; les autres sont nommées et ignorées à l'import LandXML |
| Insérer un PI entre deux autres | Redessinez le tracé, ou ressaisissez les coordonnées des PI |
| Tracés issus d'objets, décalages, élargissements | Dessinez par PI |
| Saisir K pour une courbe verticale | Saisissez L (K s'affiche) |
| Courbes verticales circulaires et dissymétriques | Courbes paraboliques symétriques uniquement |
| Plus d'un profil de projet par tracé | Un tracé par variante |
| Zoom sur la vue de profil, bandes de profil sous le profil | La vue de profil s'ajuste à tout le tracé ; tracez-la sur les [feuilles plan et profil](topic:plan-profile-sheets) |
| Coupes en DWG ou LandXML | Feuilles de coupes en PDF ; {{ui:CSV}} des surfaces et volumes |
| Lignes d'échantillonnage en biais, ou de largeurs différentes le long de la route | Une largeur de chaque côté pour tout le tracé |

## Corridors

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Terre-pleins centraux, barrières, et un dévers qui fait tourner les gabarits | Dessinez-les comme gabarits ([Gabarits de corridor](topic:corridor-templates)) ; les gabarits par point kilométrique ne prennent pas encore le dévers |
| Un changement progressif entre les gabarits de deux zones (transitions, biseaux) | Changez le gabarit à un point kilométrique, ou donnez à un point une cible de largeur sur une ligne tracée comme biseau |
| Rotation autour d'un bord, dévers dans LandXML | Le dévers tourne autour de l'axe sur les courbes circulaires ; élargissez une voie avec une cible de largeur sur une ligne caractéristique |
| Cibles pour les talus latéraux (raccordement au terrain sur une ligne ou une surface), surfaces de corridor propres | Les cibles déplacent les bords de chaussée et d'accotements ([Corridors](topic:corridor)) ; le corridor est terrassé dans la surface projetée |
| Corridors exportés en chaussées LandXML ; un second corridor sur un tracé dans l'export IFC | La surface projetée est exportée |
| Gabarits de terrain qui modifient la surface projetée, en 3D ou dans les coupes | Ils donnent les surfaces et volumes de chaque couche ([Gabarits de terrain](topic:corridor-templates#terrain-templates)) |
| Trajectoires de giration avec vitesse, glissement des pneus, temps de braquage, remorques ou dégagement de carrosserie ; une bibliothèque de véhicules de référence ; une trajectoire tracée en faisant glisser le véhicule | Trajectoires de giration à faible vitesse le long d'une ligne caractéristique ou d'un tracé, avec vos propres dimensions de véhicule ([Trajectoires de véhicules](topic:swept-paths)) |

## Terrassement et volumes

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Banquettes, lignes caractéristiques ouvertes terrassées dans le projet, terrassement jusqu'à une ligne caractéristique venant d'ailleurs | Fermez la ligne caractéristique ([Lignes caractéristiques](topic:feature-lines)), ou utilisez-la comme ligne de rupture du terrain existant |
| Insérer ou retirer un sommet de ligne caractéristique | Redessinez la ligne, ou faites-en un décalage en escalier |
| Arcs dans les lignes de rupture dessinées (à travers des points topographiques), spirales dans les lignes caractéristiques | Dessinez une ligne caractéristique avec des arcs et utilisez-la comme ligne de rupture du terrain existant |
| Terrassement jusqu'à une distance, une altitude ou une autre surface | Raccordement au terrain existant uniquement |
| Ajouter ou retirer un angle de plateforme | Supprimez la plateforme et redessinez-la |
| Volumes TIN à TIN (prismes), choix de la taille de maille | Méthode par maille, taille de maille choisie pour vous |
| Foisonnement et retrait, terre végétale, épaisseurs de chaussée | Appliquez vous-même les coefficients aux chiffres obtenus |
| Coûts de transport libre et de surtransport, transport entre tracés différents, emprunts et décharges placés sur le plan | Le diagramme des mouvements de terres (Bruckner) avec les points d'équilibre, les volumes déplacés et les distances moyennes de transport |

## Réseaux de canalisations

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Plus d'un réseau par projet | Projets séparés pour les eaux pluviales et les eaux usées |
| Conduites d'eau : qualité et âge de l'eau, commandes par règles, autres types de vannes (régulation de débit, étranglement, maintien), pompes données par puissance, demande dépendant de la pression, option Darcy–Weisbach, catalogue de canalisations avec épaisseurs de paroi et classes de pression. Le reste des réseaux sous pression est en laboratoire : [Conduites d'eau](topic:water-mains) | Vérifiez-les dans un logiciel de distribution d'eau ; les débits de projet d'assainissement sont dans [Débits de projet d'eaux usées](topic:sanitary-design) |
| Débits d'égout dans le temps (hydrogrammes, propagation dynamique, stockage, pompes, déversoirs d'orage) | [Débits de projet d'eaux usées](topic:sanitary-design) donne le débit de pointe permanent qu'utilise une feuille de calcul |
| Capacité des avaloirs, largeur d'écoulement au caniveau, propagation avec rétention, hydrogrammes, pertes de charge autres qu'un coefficient de jonction | Vérifiez-les dans d'autres logiciels ; débits, dimensions et lignes de charge sont dans [Drainage pluvial](topic:storm-drainage) |
| Bassins versants dans le plot PDF, DWG, DXF ou LandXML ; bassins versants depuis la surface (lignes de partage des eaux) | Dessinez les bassins versants à la main ; ils sont enregistrés dans le fichier du projet |
| Catalogues de canalisations, canalisations non circulaires, regards qui ne sont pas des boîtes ou des cylindres verticaux (cônes, marches, cunettes), une catégorie de drainage dans la bibliothèque | Types de regard à partir de paramètres ([Réseau de canalisations](topic:pipe-network)) ; canalisations avec un diamètre |
| Canalisations dans la vue de profil, canalisations courbes | Lisez les fils d'eau et le recouvrement dans le panneau de droite |

## Parcelles

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Découpage de lots par surface ou façade, parcelles à partir des lignes qui les entourent, emprise de voie | Dessinez chaque parcelle par ses angles, ou saisissez ses relevés |
| Tableaux de courbes et tableaux de lignes sur le plan ; étiquettes déplacées à la main | Chaque segment est étiqueté le long de lui-même |
| Parcelles en LandXML | Les parcelles sont enregistrées dans le fichier du projet et vont au PDF, au DWG et au DXF |

## Cheminements

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Compensation par moindres carrés, règle du transit, pondération des angles par les distances | La règle de la boussole |
| Angles de déviation, angles zénithaux et distances inclinées, altitudes par nivellement trigonométrique | Ramenez-les correctement aux distances et angles horizontaux, ou aux gisements |
| Visées latérales, fichiers de données brutes des carnets de terrain | Importez les points comme fichier de points |

## Implantation

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Piquets décalés (points de référence reculés par rapport au piquet), piquets de talus au point de raccordement | Implantez aux décalages dont vous avez besoin, y compris au-delà de l'accotement |
| Envoi direct des piquets au format propre à un carnet de terrain | Le CSV s'ouvre dans le logiciel de bureau de la plupart des carnets de terrain |
| Implantation de canalisations, de plateformes et de parcelles | Utilisez les points topographiques près d'un tracé, ou les segments de la parcelle |

## Fichiers et sorties

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Texte, hachures et cotes issus du DWG ou du DXF ; espace papier ; références externes (xrefs) ; DXF binaire | Les linéaires de l'espace objet s'ouvrent ([Ouvrir un DWG ou un DXF comme linéaires](topic:open-dwg-dxf)) ; ouvrez les références externes séparément |
| Déplacer plusieurs points à la fois en les faisant glisser | Couper et coller, ou modifiez-les un par un |
| Feuilles en portrait, cartouches propres, fenêtres de présentation que vous disposez, feuilles plan et profil en DWG | Une feuille de plan en paysage par PDF, ou des feuilles plan et profil le long d'un tracé (PDF) |
| Tracer les bandes d'altitude et les profils | Les bandes ne sont qu'à l'écran ; faites une capture d'écran si vous en avez besoin |
| Modifier les noms, couleurs ou styles d'étiquettes des calques | Modifiez-les dans un logiciel de CAO après l'export DXF |
| Enregistrement dans le cloud et historique des versions | Enregistrez les fichiers `.civilcraft.json` et sauvegardez-les ; pour travailler à plusieurs sur un projet, utilisez une session Live dans CadCraft Studio ([Concevoir un site à plusieurs, en direct](topic:work-live)) |
| CadCraft Studio pour iPad et iPhone, et depuis Google Play | Utilisez CivilCraft dans le navigateur de l'appareil ; sur Android, CadCraft Studio s'installe à partir de son APK sur getcadcraft.com/download |
| Ouvrir plusieurs fichiers de points ou de projets à la fois | Un fichier ouvert à la fois (les fichiers SIG qui vont ensemble, comme les parties d'un shapefile, s'ouvrent ensemble) |

## Aménagement paysager

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Têtes et buses des fabricants | Têtes génériques, ou ajoutez vos propres têtes depuis un fichier ; les données des fabricants arrivent au fur et à mesure qu'ils en donnent l'autorisation |
| Longueurs latérales maximales pour les lignes de goutte-à-goutte, débits dans le temps, pompes, réseaux de canalisations en boucle | Limitez les lignes de goutte-à-goutte à la longueur publiée par le fabricant ; le contrôle nécessite un réseau ramifié |
| Contour exact d'un objet libre concave ; son volume sous le sol mesuré exactement | L'enveloppe convexe est terrassée, et le volume sous le sol est une estimation (indiquée dans les Propriétés) |
| Végétaux de la bibliothèque **Placer** de BimCraft et de ModelCraft | Exportez l'IFC d'aménagement et ouvrez-le dans BimCraft à côté du bâtiment |
| Modèles détaillés de végétaux (feuilles, branches, saisons) en 3D ; objets libres et irrigation en 3D | Les végétaux s'affichent en 3D sous forme de formes simples dimensionnées d'après la liste des végétaux ([Voir le site en 3D](topic:site-3d)) ; le semis de ModelCraft crée des images de plantation |
| Murs de soutènement en dur qui retiennent un niveau terrassé derrière eux sur la surface | Donnez à une plateforme des côtés verticaux : ce sont des murs de soutènement sur la surface ([Terrassement](topic:grading)) |
| Transformations SVG dans vos propres symboles ; textures et couleurs de vos propres modèles GLB de végétaux ; géométrie GLB compressée | Aplatissez d'abord les transformations dans votre logiciel de dessin ; les modèles prennent la couleur du végétal ; exportez le GLB sans compression ([Graphisme des végétaux](topic:plant-graphics)) |
| Votre propre liste de végétaux conservée dans votre compte Bibliothèque (modifiée dans l'application) | Modifiez la liste propre au projet dans le tableau des végétaux et enregistrez-la comme fichier de végétaux |
| Les outils d'aménagement pour les assistants sans la fenêtre (le serveur de fichiers et la ligne de commande) | Ils fonctionnent lorsque la fenêtre de CivilCraft est ouverte ([Laisser un assistant IA travailler sur votre site](topic:assistants)) |

## Lignes électriques

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Un référentiel national intégré (cas de charge, dégagements, coefficients) | Saisissez les valeurs de votre référentiel dans {{ui:Hypothèses et limites…}} et enregistrez-les, avec votre bibliothèque, comme un jeu à réutiliser et à partager ([Jeux de paramètres](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| La distance latérale d'un conducteur à la couronne d'un arbre ou à un mur au bord de la ligne | Le dégagement à la verticale au-dessus des végétaux et des murs que traverse la ligne ([Contrôles des lignes électriques](topic:power-line-checks#clearances)) |
| Fluage du conducteur et allongement d'un conducteur neuf | Tenez-en compte à travers les températures du tableau de tirage |
| Capacité thermique des câbles enterrés (courant admissible selon leur pose) | Saisissez le courant admissible de votre fournisseur sur l'élément câble |
| Études de court-circuit, de protection et de mise à la terre | Utilisez un logiciel électrique dédié ; CivilCraft donne les longueurs et les câbles du réseau |
| Pylônes treillis calculés barre par barre, et haubans ancrés dans le sol | Les supports sont contrôlés par leur charge nominale ; les haubans par leur charge admissible |
| Un fichier d'étude `.DON` contrôlé dans le logiciel qui le lit | Contrôlez le fichier là-bas ; envoyez-nous un échantillon pour que nous testions sur un vrai fichier |
| Lignes électriques dans la vue 3D et en IFC | Le plan, le profil de ligne, les feuilles et les couches SIG |
| Les outils de lignes électriques pour les assistants sans la fenêtre | Ils fonctionnent lorsque la fenêtre de CivilCraft est ouverte ([Laisser un assistant IA travailler sur votre site](topic:assistants)) |

## Volumes de construction

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Une bibliothèque de codes d'urbanisme ou des règles d'une ville | Saisissez les limites de votre propre règlement ([Limites d'urbanisme](topic:zoning-limits)) |
| Lumière du ciel sur les murs (éclairement des façades), vent | [Heures d'ensoleillement](topic:sun-hours) ne compte que le soleil direct |
| Ombre des arbres, des végétaux ou de tout ce qui n'est pas dessiné comme un volume | Dessinez les bâtiments voisins comme des volumes |
| Formes de toits sur les volumes | Volumes à toit plat |
| Ouvertures, toitures et types de murs lorsqu'un volume est développé dans BimCraft | BimCraft construit des murs extérieurs simples à chaque niveau et un plancher ; ajoutez le reste là-bas |

## SIG et systèmes de coordonnées

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| File Geodatabase ; styles KML, icônes, superpositions au sol et liens réseau | Convertissez d'abord en GeoPackage, shapefile ou GeoJSON ; les repères KML sont lus sans leurs styles |
| Modifier les entités SIG ou leurs attributs | Modifiez-les dans un logiciel SIG et réimportez. Le panneau Analyser crée de nouveaux calques (zone tampon, superposition, jointure, sélection) et ajoute des champs de surface et de longueur, mais ne modifie pas une entité sur place |
| Analyse de réseau et raster, zones tampons à extrémités plates ou carrées et zones tampons unilatérales, ajout ou suppression de lignes et changement de type de champ dans la table attributaire, couleurs de classes manuelles, légende de style dans les plots | Utilisez Sélectionner pour choisir des entités et créer un calque à partir d'elles ; les extrémités plates ne sont pas proposées. La coloration par attribut et la table attributaire sont disponibles : voir [Styler un calque par un attribut](topic:gis-symbology) et [Travailler avec la table attributaire d'un calque](topic:gis-table) |
| Styles d'étiquettes (taille, placement) et étiquettes qui évitent les unes les autres | Les étiquettes ont une seule taille et peuvent se chevaucher là où les entités sont denses |
| Datums verticaux et modèles de géoïde | Les altitudes sont utilisées telles que le fichier les donne ; vérifiez vous-même le datum vertical |
| Décalages de grille autres que NAD83 depuis NAD27 proposés par zone (OSTN15 ; NTv2 pour les autres datums fonctionne quand vous ajoutez le fichier), plusieurs grilles à la fois, grilles verticales | Ajoutez vous-même le fichier de grille de votre datum ; une grille par projet |
| Calques cartographiques dans le DXF ou dans les exports 3D | Les calques cartographiques vont dans le plot PDF, et à côté du DWG sous forme d'image |
| Serveurs cartographiques qui demandent une connexion, une clé ou un jeton | Utilisez des services publics, ou un fichier image géoréférencé |
| Écriture de fichiers LAS ou LAZ depuis une surface, le modèle de terrain ou les outils de grille d'altitudes et LiDAR | Exportez les surfaces en grille d'altitudes GeoTIFF. Le module [Nuages de points](topic:point-clouds) écrit un nuage nettoyé en LAS 1.4 ou LAZ |
| Intensité, couleur et retours LiDAR ; grilles d'altitudes à plusieurs bandes ; fichiers de grille ou LiDAR de plus de 200 Mo | Le LiDAR est filtré par classe seulement, et les grilles utilisent leur première bande ; découpez d'abord les gros fichiers en tuiles |

## Saisie

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Sélection par fenêtre au tactile (elle nécessite {{key:Shift}}) | Appui prolongé sur chaque point topographique pour l'ajouter |
| Coordonnées ou distances saisies pendant le tracé | Dessinez approximativement, puis saisissez les coordonnées exactes des PI dans le tableau des PI du tracé |
| Saisie de coordonnées pour les angles de plateforme et les regards | Faites glisser leurs poignées ; zoomez pour la précision et surveillez E et N dans la barre d'état |
| Accrochage aux objets (autres que les points topographiques pour les lignes de rupture) | Zoomez et surveillez la barre d'état |

## Vue 3D

| Pas encore disponible | En attendant, aujourd'hui |
|---|---|
| Dessiner ou modifier dans la vue 3D | Dessinez et modifiez sur le plan ; la vue 3D suit chaque modification |
| Sélectionner par clic en 3D les lignes caractéristiques de corridor ou les entités SIG | Cliquez-les sur le plan |
| Exporter la vue exagérée, ou en pieds | Les exports sont à l'échelle réelle en mètres ; voir [Exporter le site en 3D](topic:export-3d) |
| Étiquettes dans les exports GLB ou OBJ, tailles et styles d'étiquettes en 3D | Les étiquettes ne s'affichent qu'en vue 3D, à une seule taille ; voir [Voir le site en 3D](topic:site-3d) |
| Textures à partir de photos, enregistrement d'un trajet en vidéo, ombres venant de au-delà du site, heures d'ensoleillement affichées en 3D | Calques cartographiques posés sur les surfaces ; trajet et position du soleil à un instant donné ; [heures d'ensoleillement](topic:sun-hours) pour un jour ou une saison sur le plan |
