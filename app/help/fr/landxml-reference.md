---
title: LandXML : ce qui est lu et écrit
summary: Les éléments et attributs LandXML 1.2 que CivilCraft lit et écrit, élément par élément, et tout ce qu'il ignore.
keywords: landxml, xml, cgpoints, surface, tin, lignes de rupture, limite, tracé, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, canalisation, planfeatures, planfeature, ligne caractéristique, schéma
from: ca3cf359
---

CivilCraft écrit du LandXML 1.2 avec l'espace de noms officiel et l'emplacement officiel du schéma. Il lit tout fichier dont l'élément racine est `LandXML` et prend les éléments ci-dessous par leur nom (les préfixes d'espace de noms sont ignorés ; la version n'est pas vérifiée). Son lecteur XML n'accepte que les cinq entités standard et les références de caractères numériques ; il ne charge jamais de DTD ni de fichier externe. Pour les étapes, voir [Échanger du LandXML](topic:landxml).

LandXML écrit les coordonnées nord en premier : un point est « N E » ou « N E Z ».

## Écrit

| Élément | Ce que CivilCraft écrit |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, surfaces en pieds carrés, volumes en yards cubes, diamètres en pouces) ou `Metric` (mètre, mètre carré, mètre cube, millimètre) |
| `Project` | `name` = le nom du projet |
| `Application` | nom CivilCraft, fabricant CadCraft |
| `CgPoints` / `CgPoint` | `name` = numéro du point, `desc` = description, `code` = groupe ; texte « N E Z » (ou « N E » sans altitude) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ou ccw, `radius`, `length`, `staStart`, `chord`, `delta` (degrés), `tangent`, `external`, `midOrd` ; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | le terrain existant le long du tracé, sous forme de paires point kilométrique et altitude (`PntList2D`), coupé là où il quitte la surface |
| `Profile` / `ProfAlign` | le profil projeté (nommé « <tracé> design ») : `PVI` pour les extrémités et les points d'angle, `ParaCurve` avec `length` pour les courbes verticales |
| `Surfaces` / `Surface` | `name` et `desc` ; d'abord le terrain existant, puis « Projeté » lorsque des plateformes ou des corridors sont terrassés |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (terrain existant uniquement) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (terrain existant uniquement, lorsqu'il y en a un) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin` ; `Pnts` / `P` avec `id` ; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ou sanitary |
| `Struct` | `name`, `elevRim` (le bord retenu, fixé ou tiré de la surface), `elevSump` ; `Center` ; `CircStruct` avec `diameter` ; `Invert` avec `elev`, `flowDir` in ou out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope` ; `CircPipe` avec `diameter` |
| `PlanFeatures` / `PlanFeature` | une par ligne caractéristique : `name` ; `CoordGeom` avec `Line` (`length`, `Start`, `End`) et `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta` ; `Start` et `End` en « N E Z », `Center` en « N E ») ; `Feature` `code="CivilCraft"` avec `Property` avec `use` et `closed` |

Non écrits : les plateformes et les corridors en tant qu'objets (leur résultat est la surface « Projeté »), les tracés comportant des erreurs, les canalisations sans leurs deux radiers, et les règles de réseau.

## Lu

| Élément | Ce que CivilCraft retient |
|---|---|
| `Units` | `Imperial` ou `Metric` et leur `linearUnit` décident des pieds ou des mètres. Une unité inconnue est notée. |
| `Project` | `name` devient le nom du projet. |
| `CgPoints` / `CgPoint` (aussi imbriqués) | nom (ou `oID`), « N E » ou « N E Z », `desc` (ou `code`) comme description |
| `Surface` avec `Definition surfType="TIN"` | `Pnts` et `Faces` comme terrain existant (première surface seulement) ; les faces invisibles (`i="1"`) sont ignorées |
| `SourceData` / `Breaklines` | lignes de rupture 3D, conservées avec la surface |
| `SourceData` / `Boundaries` | la limite extérieure |
| `Alignment` / `CoordGeom` | éléments `Line` et `Curve` ; PI reconstruits à partir du `PI` de chaque courbe, ou à partir de son `Center` et de ses tangentes ; `staStart` |
| `Profile` / `ProfAlign` | `PVI` et `ParaCurve` (avec `length`) ; le premier profil projeté comportant au moins deux PVI |
| `PlanFeatures` / `PlanFeature` | chacun comme ligne caractéristique : `Line`, `Curve` (ses `Start`, `Center`, `End` et `rot`) et `IrregularLine` (`PntList3D` ou `PntList2D`) mis bout à bout (un écart est comblé par un segment droit et noté) ; fermé lorsqu'il revient à son point de départ ; use et closed issus du `Feature` propre à CivilCraft, sinon **Seulement dessiné**. Les points sans altitude prennent 0 (noté). |
| `Spiral` | clothoïdes accolées à une `Curve` (à l'entrée et à la sortie ; lues comme un PI avec un rayon et des longueurs de raccordement, réécrites avec `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | le premier réseau comportant des canalisations : `Struct` (`Center`, `elevRim`, `elevSump`, diamètre `CircStruct`, `Invert` par canalisation) et `Pipe` (`refStart`, `refEnd`, diamètre `CircPipe`) |

## Ignoré, et signalé dans les notes

- Les surfaces après la première, les surfaces en grille et les autres surfaces non TIN
- Les tracés contenant des éléments `IrregularLine` ou `Chain`, les spirales autres que les clothoïdes, une spirale entre deux courbes, ou les tracés sans géométrie
- Les profils projetés après le premier ; les courbes verticales `CircCurve` et `UnsymParaCurve` (leurs PVI sont conservés sans courbe)
- Les points qui ne font que renvoyer à d'autres points (`pntRef`), et les points sans coordonnées lisibles
- Les noms de points répétés (le premier est conservé)
- Les limites masquées, affichées et de découpe de données ; les lignes de rupture sans points 3D
- Les réseaux de canalisations après le premier ; les types de réseau autres que storm et sanitary (lus comme storm)
- Les regards rectangulaires, les avaloirs et les exutoires (lus comme ronds) ; les canalisations en œuf, elliptiques et en caisson (lues comme des canalisations rondes sans dimension)
- Les éléments `Spiral` dans les lignes caractéristiques
- `Parcels`, `Roadways`, `GradeModel` et `Survey`

Les profils de terrain (`ProfSurf`) présents dans un fichier ne sont pas utilisés : CivilCraft échantillonne le terrain à partir de la surface elle-même.

## Messages lorsqu'un fichier ne s'ouvre pas

| Message | Signification |
|---|---|
| « Ceci est du XML mais pas du LandXML (son élément racine est <…>). » | Le fichier est un autre type de XML. |
| « … ne contient ni points, ni surfaces TIN, ni tracés que CivilCraft peut lire. » | Tout le contenu du fichier figure dans la liste des éléments ignorés. Les notes qui suivent indiquent ce qui s'y trouvait. |
| « Balise de fin non concordante … », « Balise non fermée … », « Le fichier se termine au milieu de … » | Le fichier est endommagé ou tronqué. |
