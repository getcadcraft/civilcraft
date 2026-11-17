---
title: Ouvrir un DWG ou un DXF comme linéaires
summary: Ouvrez les linéaires d'un dessin sur le plan, couche par couche ; utilisez ses courbes de niveau, ses polylignes 3D et ses contours fermés pour la surface, et transformez ses blocs de points en points topographiques.
keywords: contrôle topographique, altitudes en texte, dwg, dxf, cao, dessin, linéaires, courbes de niveau, lignes de rupture, limite, polyligne, polyligne 3D, calques, fond de plan, topo, dessin topographique, blocs, références de blocs, points topographiques issus de blocs, attributs, blocs de points, point d'insertion
from: da0f4c58
---

Un levé topographique arrive souvent sous forme de dessin : des courbes de niveau en polylignes à leur altitude, des lignes de rupture en polylignes 3D, et la limite du site en polyligne fermée. CivilCraft ouvre l'**espace objet** du dessin sous forme de calques sur le plan, et peut transformer ces lignes directement en surface.

## Ouvrir le dessin

1. Cliquez sur {{ui:Linéaires}} dans le groupe **Surface** (ou sur {{ui:Ouvrir}}, ou déposez le fichier sur le plan) et choisissez un fichier `.dwg` ou `.dxf`. Le dessin est lu sur cet ordinateur ; rien n'est téléversé. Les DWG de 2000 à 2018 et les DXF ASCII sont lus.
2. La boîte de dialogue **Linéaires** liste les calques du dessin qui contiennent des lignes, des formes fermées ou des points, et indique s'ils ont des **altitudes**. Les calques désactivés dans le dessin démarrent décochés. Le texte, les hachures, les cotes et les autres objets qui ne sont pas des linéaires sont comptés et omis (la boîte de dialogue indique lesquels).
3. Vérifiez les **Unités du dessin**. Lorsque le dessin indique ses unités, CivilCraft les convertit dans celles du projet (millimètres en mètres, mètres en pieds, pouces en pieds). Un dessin en pieds est lu en pieds US survey sans mise à l'échelle : les deux diffèrent de 2 parties par million, et multiplier des coordonnées State Plane par ce facteur les décalerait de plusieurs pieds. Lorsque le dessin n'indique pas ses unités, ses nombres sont lus dans les unités du projet ; choisissez les bonnes unités dans la liste si ce n'est pas le cas.
4. Dans **Utiliser pour la surface**, choisissez ce que donne chaque calque à la surface (ou laissez **Seulement l'afficher**). Les calques dont le nom évoque des courbes de niveau (TOPO, CONT, CNTR) et qui ont des altitudes démarrent en lignes de rupture.
5. Cliquez sur {{ui:Ajouter}}. Les calques apparaissent sous **Calques SIG** dans le panneau de gauche ; chaque usage est intégré à la surface. Chaque partie est une étape distincte : {{key:Mod+Z}} les annule une à une.

## Ce que peut donner chaque type de calque

| Le calque contient | Utiliser pour la surface |
|---|---|
| Courbes de niveau (polylignes à une altitude) | Lignes de rupture à l'altitude propre des lignes, ou à celle du champ ELEV |
| Polylignes 3D | Lignes de rupture à leurs propres altitudes |
| Un contour fermé | La limite de la surface (la plus grande forme fermée, ou celle que vous avez choisie) |
| Points avec une altitude | Points topographiques, décrits avec le nom du calque |
| Lignes à l'altitude 0 (dessin en plan) | Rien : elles restent sur le plan comme dessin de base |

Un dessin écrit par CivilCraft contient ses lignes caractéristiques sous forme de polylignes 3D qui mémorisent leurs arcs. La boîte de dialogue affiche alors **Lignes caractéristiques** : laissez la case cochée pour les rétablir comme lignes caractéristiques avec leurs arcs et leurs usages (une seule étape d'annulation), ou décochez-la pour les lire comme des linéaires, comme les autres calques.

Plus tard, utilisez {{ui:Utiliser pour la surface}} dans le menu du calque, sous **Calques SIG**, pour faire de même avec un calque que vous aviez seulement affiché.

## Points topographiques à partir de blocs

Les levés portent souvent leurs points sous forme de blocs : un petit symbole à chaque visée, avec des attributs pour le numéro du point, la description et l'altitude. Lorsque le dessin contient des références de blocs, la boîte de dialogue comporte une section **Points topographiques à partir de blocs** :

1. Cochez les blocs à prendre (le tableau indique combien de références chacun a, sur quels calques et avec quels attributs), ou cochez des calques pour prendre toutes les références de blocs qu'ils portent.
2. Choisissez d'où viennent le **numéro**, la **description** et l'**altitude** de chaque point : un attribut, le nom du bloc ou du calque, les numéros libres suivants, ou la Z du point d'insertion. CivilCraft propose d'abord les attributs probables (PT, DESC, ELEV et similaires), et ne prend l'altitude d'un attribut que lorsque les blocs sont posés à zéro.
3. Décochez les calques de linéaires si vous ne voulez que les points, puis cliquez sur {{ui:Ajouter}}.

Chaque référence devient un point topographique à son point d'insertion. Seules les références placées dans l'espace objet comptent ; les blocs imbriqués dans d'autres blocs ne sont pas pris. Les numéros déjà présents dans le projet, ou utilisés deux fois dans le dessin, reçoivent de nouveaux numéros à la suite du plus élevé, et un attribut d'altitude qui n'est pas un nombre laisse ce point sans altitude ; la ligne d'état compte les deux cas. Le dessin n'est jamais modifié, et chaque point garde son bloc en mémoire : ses propriétés affichent **Depuis le bloc** avec le bloc, le calque et le handle. L'ajout des points est une seule étape, donc {{key:Mod+Z}} les retire tous.

## Altitudes écrites en texte, et contrôle

Les cotes d'altitude ponctuelles écrites en texte (ou dans un attribut de bloc qui n'est pas un bloc de point topographique) ne sont pas des linéaires. La section **Altitudes topographiques et contrôle** peut les prendre comme points topographiques, et liste ce qui semble anormal dans le dessin : unités, système de coordonnées, distance à zéro, courbes de niveau plates, altitudes incohérentes, points doublés. Voir [Contrôler un dessin topographique à l'import](topic:survey-check).

## Lecture du dessin

- Les arcs, cercles, ellipses, segments de polyligne bombés et splines deviennent de courts segments droits (au plus tous les 5°).
- Les références de blocs sont dessinées là où elles sont placées, les blocs imbriqués aussi ; ce qu'un bloc porte sur le calque 0 prend le calque de la référence.
- Les objets dessinés dans un autre plan (une direction d'extrusion différente) sont placés en coordonnées monde.
- Chaque objet reçoit trois champs : LAYER, TYPE (le type d'objet) et ELEV (son altitude lorsque tous ses points en partagent une).
- Les coordonnées sont prises telles quelles : le dessin doit utiliser les mêmes coordonnées que le projet (par exemple la même zone State Plane). Les dessins liés (xrefs) ne sont pas ouverts : ouvrez-les séparément.

:::tip
Un dessin de courbes de niveau donne la meilleure surface avec quelques cotes ponctuelles sur les sommets et dans les creux, là où les seules courbes laissent des triangles plats. Ajoutez-les comme points topographiques, ou depuis un calque de points du dessin.
:::
