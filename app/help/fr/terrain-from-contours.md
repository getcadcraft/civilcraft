---
title: Créer le terrain à partir des courbes de niveau
summary: Construisez la surface du terrain à partir d'un plan de courbes de niveau : choisissez les calques de linéaires, indiquez d'où vient l'altitude de chaque ligne, contrôlez les croisements et les doublons, puis construisez. Les courbes deviennent des lignes de rupture, et les triangles plats sur les crêtes et les vallées sont corrigés. Un plan calé depuis une image ou un PDF peut être mis à l'échelle et placé par deux points connus.
keywords: courbes de niveau, terrain à partir des courbes de niveau, surface à partir des courbes de niveau, plan topographique, plan de levé, sans coordonnées, lignes de rupture, triangles plats, crête, vallée, sommet, croisement de courbes, courbes en double, équidistance, mettre à l'échelle un plan, deux points, placer un plan, DXF, DWG, shapefile
from: e6161653
---

Un géomètre vous envoie parfois un plan de courbes de niveau : des lignes avec des altitudes, mais pas de points. CivilCraft construit le terrain existant à partir de ces lignes.

## Importer les courbes

Ouvrez le plan en linéaires : un dessin DXF ou DWG, un shapefile ou un GeoJSON (**SIG** › {{ui:Importer}}, ou déposez le fichier sur le plan). Les lignes entrent comme **couches cartographiques**. Sous **Surface** › {{ui:Plus}}, choisissez {{ui:Terrain à partir de courbes de niveau}}.

## Indiquer d'où vient l'altitude

Cochez les calques qui contiennent des courbes, puis choisissez **Altitude à partir de** :

- {{ui:Les altitudes propres des lignes}} : une ligne dont tous les sommets ont la même altitude (une polyligne 3D, ou une polyligne avec une altitude). Une ligne à 0 est du tracé en plan et n'a pas d'altitude.
- Un **champ numérique** du calque (par exemple ELEV), quand le plan en fournit un.
- {{ui:Un départ et un intervalle, dans l'ordre où les lignes sont listées}} : pour les lignes sans aucune altitude. La première ligne listée reçoit l'**Altitude de la première ligne**, la suivante cette valeur plus l'**Équidistance**, et ainsi de suite. Listez les lignes de la plus basse à la plus haute (ou réordonnez-les dans le calque).

## Contrôler, puis construire

{{ui:Contrôler}} liste ce qui ne va pas, en mots, avant que quoi que ce soit ne change :

- une ligne **sans altitude** ou avec moins de deux points ;
- une ligne **en double** (la même forme deux fois, même dessinée dans l'autre sens) ;
- deux lignes qui se **croisent**, à des altitudes différentes ou à la même (une ligne qui se croise elle-même aussi), avec l'endroit ;
- une altitude qui **n'est pas sur l'intervalle** (une faute de frappe comme 105.5 sur un plan à 1 m).

Cochez {{ui:Écarter les lignes qui en croisent une autre}} pour retirer la ligne qui en croise le plus d'autres (puis la suivante, jusqu'à ce qu'aucune ne se croise) : une ligne parasite qui coupe chaque courbe est celle qui disparaît, pas les courbes. **Simplifier les lignes à moins de** supprime les sommets plus proches d'une ligne droite que cette distance.

{{ui:Construire le terrain}} ajoute les lignes à la surface existante comme lignes de rupture (une seule étape d'annulation), de sorte que la surface passe exactement par chaque courbe. Avec {{ui:Corriger les triangles plats sur les crêtes, les vallées et les sommets}} coché et un intervalle indiqué, CivilCraft ajoute aussi un point à l'intérieur de chaque triangle plat (un triangle dont les sommets sont tous sur une même courbe), à l'altitude que la pente voisine poursuit, et jamais à plus d'une demi-équidistance de la courbe. Sans cela, les crêtes, les fonds de vallée et les sommets apparaissent comme des plaques plates. Sur une colline d'essai, l'erreur par rapport à la surface réelle a baissé d'un quart ; sur une crête, de 40 %.

## Un plan sans coordonnées

Pour un plan de courbes calé depuis une image ou un PDF, ouvrez **Mettre à l'échelle et placer les calques à partir de deux points connus**. Donnez deux points sur le plan et leur position réelle ; les calques cochés sont mis à l'échelle, pivotés et déplacés pour s'ajuster (une seule étape d'annulation ; les altitudes ne changent pas). Les deux mêmes points donnent l'échelle (affichée dans le message) et la rotation.

La surface n'est pas plus précise que le plan : entre deux courbes elle est un plan, donc le terrain réel entre elles n'est pas connu. Vérifiez le résultat par rapport aux altitudes ponctuelles avant de vous y fier.
