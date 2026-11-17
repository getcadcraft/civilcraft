---
title: Exporter le plan en DXF
summary: Écrire les tracés du plan en DXF R12 sur des calques nommés, avec les courbes de niveau à leur altitude et les lignes de rupture en 3D, pour tout logiciel de CAO.
keywords: dxf, dwg, cao, exportation, tracés, r12, 2000, 2004, 2007, 2010, 2013, 2018, calques, courbes de niveau, échange de dessins, fond de plan, arrière-plan
from: f2d8ede9
---

{{ui:DXF}} écrit ce que le plan affiche dans un fichier DXF au format R12, la version que tous les logiciels de CAO ouvrent. Si vous avez utilisé AutoCAD ou Civil 3D, ouvrez-le ou insérez-le comme n'importe quel fichier DXF.

## Exporter

1. Réglez le plan comme vous le souhaitez pour le dessin : sous **Affichage**, choisissez la surface (terrain naturel ou projet), l'équidistance des courbes de niveau et les éléments activés (courbes de niveau, étiquettes, points, étiquettes de points, triangles, lignes de rupture, bordure de surface, canalisations, flèches de pente).
2. Cliquez sur {{ui:DWG/DXF}} dans le groupe **Exporter**, choisissez {{ui:DXF (R12, texte) — le fichier d'échange simple}}, puis {{ui:Télécharger}}.
3. Le navigateur télécharge `<name>.dxf`. La barre d'état indique par exemple : « Exporté en DXF R12 : 2,140 objets ; étiquettes dimensionnées pour 1" = 40'. Les bandes ne sont pas exportées. »

Les coordonnées sont écrites dans les unités de votre projet, à leurs valeurs réelles (les coordonnées State Plane restent telles quelles). Rien n'est mis à l'échelle ni déplacé.

## Contenu du fichier

| Élément | Entité DXF | Calque |
|---|---|---|
| Courbes de niveau mineures et majeures | Polylignes 2D à leur altitude | C-TOPO-MINR, C-TOPO-MAJR |
| Étiquettes de courbes de niveau | Texte | C-TOPO-TEXT |
| Triangles | Polylignes | C-TOPO-TINN |
| Lignes de rupture et limite | Polylignes 3D | C-TOPO-BRKL |
| Bordure de surface | Polylignes | C-TOPO-BNDY |
| Flèches de pente | Polylignes | C-TOPO-SLOP |
| Points topographiques et leurs étiquettes | Points (avec altitude), texte | V-NODE, V-NODE-TEXT |
| Lignes issues des codes de ligne | Polylignes 3D | V-NODE-LINE |
| Axes des tracés en plan | Lignes et arcs | C-ROAD-CNTR |
| Repères de points kilométriques et étiquettes | Polylignes, texte | C-ROAD-STAN |
| Bords de corridor | Polylignes | C-ROAD-CORR |
| Lignes d'échantillonnage | Polylignes | C-ROAD-SCTN |
| Plateformes, lignes de raccordement au terrain, lignes de pente | Polylignes | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Lignes caractéristiques | Polylignes 3D (arcs en segments à 0.01 près ; voir [Lignes caractéristiques](topic:feature-lines)) | C-GRAD-FEAT |
| Trajectoires de giration | Polylignes, texte | C-ROAD-SWPT |
| Canalisations, regards et étiquettes | Polylignes, texte | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Canalisations et regards posant problème | Polylignes | C-STRM-PROB |

Chaque calque a une couleur. La liste complète se trouve dans [Calques du plan](topic:plan-layers).

## Taille des étiquettes

Le texte doit avoir une taille en unités de dessin. CivilCraft dimensionne les étiquettes pour l'échelle à laquelle le plan entier tient sur une feuille Tabloid (pieds) ou sur une feuille A3 (mètres), et indique l'échelle dans le message d'état. Si vous tracez à une autre échelle dans votre logiciel de CAO, mettez le texte à l'échelle à cet endroit.

## Ce qui n'est pas exporté

- Bandes d'altitude (écran seulement).
- La vue de profil. Les profils sortent en LandXML, pas en dessin.
- La surface elle-même en objet 3D. Utilisez LandXML pour le TIN, ou activez {{ui:Triangles}} pour obtenir ses arêtes sous forme de tracés.
- Tout ce que vous avez désactivé sous **Affichage**.

## DWG

{{ui:DWG/DXF}} écrit aussi les mêmes tracés dans un dessin DWG. Sa boîte de dialogue demande le format : DXF, ou DWG de 2000, 2004, 2007, 2010, 2013 ou 2018. Le format 2000 s'ouvre dans presque tous les logiciels de CAO, anciens et récents ; choisissez un format plus récent lorsque la personne qui reçoit le dessin le demande. Votre choix est mémorisé dans ce navigateur.

1. Cliquez sur {{ui:DWG}} dans le groupe **Exporter**.
2. Choisissez le **Format** et cliquez sur **Télécharger le DWG**.
3. Le navigateur télécharge `<name>.dwg`. La barre d'état indique ce qui a été écrit, par exemple « Exporté au format DWG (2018) : 12 polylignes, 40 étiquettes sur 9 calques ».

Le DWG contient les mêmes calques, couleurs, courbes de niveau (en polylignes à leur altitude), lignes de rupture 3D, étiquettes et points que le DXF, dans les mêmes coordonnées. Les noms de calques qu'un DWG ne peut pas contenir sont modifiés, et le message d'état l'indique. CivilCraft écrit le DWG avec son propre code : rien ne quitte votre ordinateur.

### Calques de carte dans le DWG

Un dessin DWG ne peut pas contenir d'image à l'intérieur : les logiciels de CAO affichent une image placée à côté du dessin. Lorsque des calques de carte sont affichés, la boîte de dialogue propose **Calques de carte sous forme d'image à côté du dessin**. Si vous la cochez, le téléchargement est un fichier `.zip` contenant `<name>.dwg`, `<name>-map.png` (les calques de carte sur tout le dessin, jusqu'à 4,096 pixels de large) et `<name>-map.pgw` (son fichier de géoréférencement, pour les logiciels SIG). Le dessin affiche l'image comme une image sur le calque G-MAP-IMAG, à sa place. Décompressez les fichiers dans un même dossier et gardez-les ensemble.
