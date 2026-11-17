---
title: Depuis un autre logiciel de génie civil
summary: Comment les méthodes de conception civile déjà connues correspondent à CivilCraft, et les différences qui déroutent les utilisateurs expérimentés dès la première heure.
keywords: changement, migration, familier, différences, méthode de travail, commandes, correspondance, cogo, corridor, terrassement, réseau de canalisations, styles, ligne de commande
from: feae37d6
---

Si vous avez utilisé Civil 3D, vous connaissez déjà les idées de CivilCraft : points et groupes de points, surfaces TIN avec lignes de rupture et contours, tracés par PI, profils par PIV, assemblages balayés en corridors, terrassement jusqu'au terrain naturel, réseaux de canalisations gravitaires, LandXML. Ce qui diffère, c'est presque tout ce qui les entoure : il n'y a pas de fichier de dessin, pas de ligne de commande (sauf si vous choisissez le style de menu {{ui:Dessin classique}}), pas de styles, pas de Prospector et pas de boîtes de dialogue de paramètres. CivilCraft est un outil petit et ciblé dans un navigateur, et dans cette version il fait une fraction de ce que fait un logiciel civil complet. Cette page met en correspondance ce que vous connaissez avec ce qui existe ici.

:::tip
Si vous aimez le ruban de Civil 3D, choisissez le style de menu {{ui:Ruban civil}} dans {{ui:Paramètres}} › {{ui:CivilCraft}} › {{ui:Menus, touches et souris}} : onglets Accueil, Surfaces, Modifier, Géolocalisation, Vue et Sortie, le bouton central fait un panoramique, et {{key:Shift}} avec le bouton central fait tourner la vue 3D. Si vous tapez des commandes, {{ui:Dessin classique}} ajoute une ligne de commande (ALIGNMENT, PAD, PROFILE, ZOOM …). Voir [Menus, touches et souris](topic:menus-keys-and-mouse).
:::

## Correspondance des méthodes

| Ce que vous voulez faire | Méthode habituelle | Dans CivilCraft |
|---|---|---|
| Importer des points de levé | Importer des points avec un format de fichier de points | {{ui:Ouvrir}}, puis vérifiez l'ordre des colonnes dans **Importer des points** ([Importer des points de levé](topic:import-points)) |
| Trier les points | Groupes de points, clés de description | Groupes automatiques selon le premier mot de la description ; pas de clés de description |
| Modifier un point | Éditeur de points, poignées | Cliquez dessus et saisissez dans Propriétés, ou faites-le glisser ([Modifier un point de levé](topic:edit-points)) |
| Construire le terrain existant | Créer une surface, ajouter des groupes de points comme données | Automatique : la surface se reconstruit dès que ses entrées changent |
| Ajouter des lignes de rupture | Ajouter des lignes de rupture depuis des polylignes ou des lignes caractéristiques | Réglez un groupe de points sur {{ui:Ligne de rupture}}, ou cliquez sur des points avec l'outil {{ui:Ligne de rupture}} ({{key:B}}) |
| Découper la surface | Contour extérieur, contour masqué, longueur maximale de triangle | {{ui:Contour}} ({{key:O}}, extérieur seulement) et **Plus longue arête extérieure** |
| Afficher les courbes de niveau | Style de surface | **Affichage** dans le panneau de gauche : intervalle, majeure tous les, étiquettes, bandes, flèches de pente |
| Tracer un axe | Outils de création de tracé, réglages de courbe et de spirale | {{ui:Tracé en plan}} ({{key:A}}) : cliquez les PI, {{key:Enter}} ; rayons et longueurs de spirale dans le tableau des PI |
| Créer une vue de profil | Assistant de vue de profil, bandes | {{ui:Profil}} ({{key:R}}) : une vue de profil sous le plan, toujours ajustée |
| Concevoir le profil en long | Outils de tracé de profil | {{ui:Commencer depuis le terrain}}, {{ui:Ajouter des PIV}} ({{key:I}}), faire glisser les PIV, saisir **Courbe L** |
| Construire une route | Assemblage, sous-assemblages, corridor, cibles, régions | Cochez **Balayer un assemblage le long du profil projet** sous le tracé ; une voie, un accotement et une pente de talus de chaque côté, ou chaque côté construit à partir d'éléments (caniveau, bordure, trottoir …) |
| Terrasser une plateforme | Lignes caractéristiques, groupes de terrassement, critères | {{ui:Plateforme}} ({{key:G}}) : une plateforme plane avec des talus de déblai et de remblai jusqu'au terrain naturel |
| Calculer les terrassements | Surfaces de volume, tableau de bord des volumes | **Terrassement** dans le panneau de droite, méthode par grille, mise à jour en direct |
| Concevoir un réseau pluvial ou d'eaux usées | Réseau de canalisations avec liste de pièces, règles | {{ui:Canalisations}} ({{key:P}}) : cliquez les regards en aval ; trois règles que vous définissez ; cotes de radier automatiques |
| Échanger avec d'autres | Import et export LandXML | {{ui:Ouvrir}} un fichier LandXML ; {{ui:LandXML}} pour exporter ([Échanger du LandXML](topic:landxml)) |
| Envoyer le tracé vers la CAO | Export DWG | {{ui:DWG}} (format 2000 à 2018) ou {{ui:DXF}} (R12) |
| Tracer | Présentations, fenêtres de présentation, jeux de feuilles | {{ui:PDF}} : une feuille paysage du plan à une échelle choisie ; feuilles de plan et de profil et feuilles de coupe en PDF |
| Partager le travail entre fichiers | Raccourcis de données, références | Non disponible : un projet par fichier |
| Annuler | Annuler | {{key:Mod+Z}} et {{key:Mod+Y}}, 200 étapes ; les réglages d'affichage ne sont pas des étapes d'annulation |

## Différences qui piègent

**Il n'y a pas de ligne de commande** sauf si vous choisissez le style de menu {{ui:Dessin classique}}. Les outils sont des boutons de la barre d'outils et des lettres seules : {{key:A}} tracé, {{key:G}} plateforme, {{key:P}} canalisations, {{key:B}} ligne de rupture, {{key:O}} contour, {{key:R}} profil, {{key:I}} ajouter des PIV, {{key:V}} sélection, {{key:F}} ajuster. Dans les autres styles de menu, taper un nom de commande ne fait rien. Voir [Touches et souris](topic:keyboard).

**Entrée termine ; le double-clic est risqué.** Cliquez une fois sur le dernier point, puis appuyez sur {{key:Enter}}. Dans cette version, un double-clic termine aussi, mais il supprime le point sur lequel vous double-cliquez. Le clic droit ne termine ni ne répète ; il ne sert qu'à faire un panoramique lorsque vous le faites glisser.

**Tout est dynamique, en permanence.** Modifiez un groupe de points, un rayon, un PIV ou une pente de plateforme, et la surface, les courbes de niveau, le corridor, les lignes de raccordement au terrain et les volumes se mettent à jour immédiatement. Il n'y a rien à reconstruire et rien ne devient périmé.

**Rien n'est un objet de dessin.** Le plan est une vue du projet, pas un dessin modifiable avec des commandes de CAO. Vous ne pouvez pas ajouter vos propres lignes ou textes, changer la couleur d'un calque ou décomposer quoi que ce soit. Exportez en DXF et terminez le dessin dans un logiciel de CAO.

**Pas de styles.** Les couleurs, épaisseurs de trait, tailles d'étiquettes et noms de calques sont fixes (voir [Calques du plan](topic:plan-layers)). Papier et Objet dans la barre d'application basculent entre un écran clair et un écran sombre.

**Un de chaque.** Une surface de terrain existant, un résultat terrassé, un réseau de canalisations par projet. Plusieurs tracés et plateformes sont permis.

**Les unités sont des étiquettes.** Choisir {{ui:pieds US}} ou {{ui:Mètres}} ne convertit rien. Il n'y a pas d'échelle de dessin. Un système de coordonnées est facultatif : définissez-le sous {{ui:Coordonnées}} et rien ne bouge ; il indique seulement ce que signifient les nombres (voir [Définir le système de coordonnées du projet](topic:coordinate-systems)). Les pieds sont traités comme des pieds US d'arpentage lors de l'écriture en LandXML.

**Les groupes de lignes de rupture se joignent dans l'ordre des numéros de points.** Un groupe réglé sur {{ui:Ligne de rupture}} devient une seule ligne passant par tous ses points, dans l'ordre des numéros. Des codes communs (deux lignes d'écoulement codées « FL ») forment une seule ligne en zigzag ; dessinez-les à la main.

**Les stations ont le même aspect, les mètres diffèrent.** Les pieds utilisent des stations de 100 ft (12+34.56) ; les mètres utilisent des stations de 1000 m (1+234.567).

**Suppression sur Mac.** La touche Mac libellée delete correspond à {{key:Backspace}} pour le navigateur. Utilisez Fn et {{key:Delete}}, ou le bouton {{ui:Supprimer}}, pour supprimer une sélection.

**Les fichiers sont des téléchargements.** {{ui:Enregistrer}} télécharge un fichier `.civilcraft.json` à chaque fois ; il n'existe pas d'enregistrement par-dessus le fichier ouvert. Une copie de récupération du travail non enregistré est conservée dans ce navigateur ([Récupérer un travail non enregistré](common:recover)). Ouvrir un fichier de points remplace les points sans demander. Voir [Fichiers que vous pouvez ouvrir, enregistrer et exporter](topic:files).

**Les règles vous appartiennent.** Les règles du réseau de canalisations et l'assemblage du corridor commencent avec des valeurs provisoires qui ne sont pas une norme. Définissez les vôtres avant de vous fier à un contrôle.

**Les volumes sont calculés sur grille.** Déblai et remblai proviennent d'une grille fine entre les deux surfaces, à l'intérieur des lignes de raccordement, sans foisonnement ni retrait. Ils sont proches de, mais pas identiques à, un volume TIN à TIN.

## Ce qui manque

Les spirales autres que la clothoïde, les assemblages qui changent le long de la route, les plateformes en pente, la capacité des avaloirs et la rétention, les catalogues d'éléments, les canalisations en profil, les dispositions de parcelles et le dimensionnement des lots, l'ajustement par moindres carrés et les bases de données de levé, l'ouverture de DWG, et bien d'autres. La liste complète, avec ce qu'il faut faire en attendant, se trouve dans [Pas encore disponible](topic:not-built-yet).
