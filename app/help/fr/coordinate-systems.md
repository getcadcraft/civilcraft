---
title: Définir le système de coordonnées du projet
summary: Indiquez dans quel système de coordonnées se trouve le levé, pour que CivilCraft affiche la latitude et la longitude, place les fichiers SIG et les couches cartographiques, et écrive les fichiers .prj. Choisissez par code, par nom, d'après les coordonnées elles-mêmes ou à partir d'un fichier .prj.
keywords: système de coordonnées, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projection, prj, wkt, datum, latitude, longitude, lat long, géographique, grille, géoréférencement, géoréférencer, attribuer un système de coordonnées
from: 964250e2
---

Les coordonnées d'un projet ne sont que des nombres tant que vous n'indiquez pas ce qu'ils représentent. Définir le système de coordonnées **ne déplace jamais rien** : il indique à CivilCraft que, par exemple, E 6,150,000 N 2,080,000 sont des coordonnées state plane de la zone 6 de Californie, en pieds US survey. Une fois ce point connu :

- la barre d'état affiche la latitude et la longitude du pointeur,
- les fichiers SIG dans d'autres systèmes (shapefiles, GeoJSON, GeoPackage, grilles d'altitude, LiDAR) sont convertis dans le projet à leur ouverture,
- des couches cartographiques peuvent être dessinées sous le plan ([Afficher des couches cartographiques sous le plan](topic:map-layers)),
- les exports vers des formats SIG portent le système (un `.prj` pour les shapefiles, le code EPSG pour GeoPackage et GeoTIFF).

## Choisir le système

1. Choisissez {{ui:Coordonnées}} dans le groupe {{ui:SIG}} de la barre d'outils. La boîte de dialogue **Système de coordonnées** s'ouvre. En haut, elle indique dans quel système le projet se trouve actuellement, ou **Aucun — les coordonnées ne sont que des nombres**.
2. Trouvez le système de l'une de ces façons :
   - **Recherche** : saisissez le code EPSG (`2277`, `EPSG:2277`) ou des mots du nom (`texas central`, `utm 14n`, `lambert-93`). Les codes sont listés à partir de ce que vous avez saisi ; les mots listent les systèmes dont le nom contient tous ces mots.
   - {{ui:Systèmes auxquels ces coordonnées correspondent}} (lorsque le projet contient des points ou une surface) : CivilCraft lit le centre de votre projet dans chaque système de la même famille d'unités et liste ceux dont la zone d'utilisation le contient. Les coordonnées state plane ne correspondent généralement qu'à quelques zones : un projet au Texas à E 3,115,000 N 10,070,000 pieds US survey correspond aux quatre variantes Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Chaque entrée indique où se situerait le centre de votre projet.
   - **Près de (lat, long)** et {{ui:Suggérer}} : saisissez l'emplacement du site, par exemple `30.27, -97.74` ou `30°16′N 97°44′W`, et CivilCraft liste les systèmes projetés dont la zone le contient, en commençant par les grilles nationales et d'État.
   - {{ui:Lire un fichier .prj…}} : ouvrez le `.prj` fourni avec un shapefile ou un dessin. CivilCraft le fait correspondre à sa liste d'après les calculs de projection (ainsi, un `.prj` qui nomme un datum différemment trouve tout de même le bon système) et indique lequel c'est ; si rien ne correspond exactement, la description propre au fichier est utilisée. Vous pouvez aussi déposer un `.prj` sur la boîte de dialogue, ou l'ouvrir ou le déposer directement sur le plan.
3. Cliquez sur un système dans la liste. Sous **Choisi**, il affiche le nom, le code EPSG, l'unité, la qualité du lien de son datum avec WGS 84, sa zone d'utilisation en latitude et longitude, et l'endroit où se situe le centre de votre projet.
4. Laissez **Grille** sélectionné (pour la plupart des projets ; voir [Coordonnées du terrain et coordonnées locales](topic:ground-and-local-coordinates) pour les autres cas) et choisissez {{ui:Appliquer}}.

La barre d'état affiche désormais la latitude et la longitude du pointeur à côté de E et N. Définir le système est une seule étape d'annulation : {{key:Mod+Z}} l'annule.

:::note
Les unités doivent correspondre : un projet en pieds accepte des systèmes en pieds US survey ou en pieds internationaux, un projet en mètres accepte des systèmes en mètres. CivilCraft explique un refus (« Le projet est en pieds, mais ce système est en mètres… »). Un projet en pieds avec un système en pied US survey utilise les pieds survey : le « ft » du projet désigne le pied du système. Les systèmes géographiques (latitude et longitude, comme WGS 84 lui-même) ne peuvent pas être le système d'un projet : les dessins ont besoin de coordonnées E et N.
:::

## Changer ou retirer le système

Ouvrez à nouveau {{ui:Coordonnées}}, choisissez un autre système et choisissez {{ui:Appliquer}}. Lorsque le projet contient des points ou un tracé, CivilCraft demande **Les coordonnées sont-elles déjà en … ?**

- {{ui:Oui — rien ne bouge}} : les nombres restent tels quels et seule leur signification change. Utilisez cette option si l'ancien système avait été choisi par erreur.
- {{ui:Non — les convertir}} : chaque point topographique, ligne de rupture, limite, PI de tracé, angle de plateforme et regard est converti de l'ancien système vers le nouveau, en une seule étape d'annulation. Une surface lue depuis LandXML sous forme de triangles ne peut pas être convertie ; reconstruisez-la d'abord à partir des points.

{{ui:Retirer le système}} retire le système (rien ne bouge). Les couches SIG déjà présentes dans le projet restent à leur place.

## Latitude et longitude dans la barre d'état

Tant que le projet a un système, la barre d'état affiche la latitude et la longitude du pointeur sur WGS 84, par exemple `30°18′00.00″ N  97°42′00.00″ W`. Pour afficher des degrés décimaux, choisissez-les sous {{ui:Paramètres}}, {{ui:CivilCraft}}, **Latitude et longitude** ([Paramètres de CivilCraft](topic:settings)). Avec des coordonnées du terrain ou locales, l'affichage passe d'abord par cette étape, de sorte qu'il est juste pour le point sous le pointeur.

## Qualité du décalage de datum

La latitude, la longitude, le GeoJSON et les couches cartographiques sont tous en WGS 84. Le lien de chaque système avec WGS 84 est indiqué dans la boîte de dialogue :

| Ce qu'affiche la boîte de dialogue | Ce que cela signifie |
|---|---|
| WGS 84 lui-même | Aucun décalage du tout. |
| NAD83 est pris pour WGS 84 | Les deux diffèrent d'un mètre ou deux sur la plus grande partie de l'Amérique du Nord, quelques mètres au plus. Suffisant pour les couches cartographiques et le contexte du site ; pas pour un canevas topographique. |
| Connu à environ *n* m près (valeur EPSG) | Un décalage publié ; les couches cartographiques et le GeoJSON peuvent être décalés d'environ cette valeur. |
| Non connu pour ce datum | Aucun décalage publié sans fichier de grille : les couches cartographiques et le GeoJSON peuvent être décalés de plusieurs centaines de mètres. |
| Depuis le fichier de grille de décalage … | Un fichier de grille de décalage est utilisé (ci-dessous) : à environ 10 cm du NAD83 à l'intérieur de la grille. |

Les coordonnées propres à votre projet ne subissent jamais de décalage de datum : seul ce qui est converti vers ou depuis la latitude et la longitude l'est. Les datums verticaux et les modèles de géoïde ne sont pas gérés (les altitudes ne sont jamais converties). Lorsque le meilleur décalage nécessite un fichier de grille, la liste indique un décalage publié moins précis, et la boîte de dialogue affiche sa précision (les systèmes NAD27, par exemple, environ 20 m), jusqu'à ce que vous ajoutiez la grille.

## Fichiers de grille de décalage

Pour un système NAD27, **Fichier de grille de décalage** dans la boîte de dialogue du système de coordonnées ramène la latitude, la longitude, les fichiers SIG et les couches cartographiques à environ 10 cm du NAD83, au lieu d'environ 20 m :

- **Télécharger** la grille proposée pour la zone du système (NADCON5 pour les États-Unis contigus, NADCON pour l'Alaska, NTv2 pour le Canada) depuis cdn.proj.org, le serveur public de grilles de PROJ. Seul le nom du fichier de la grille est envoyé.
- Ou **Ajouter un fichier de grille…** si vous en possédez déjà un : NTv2 (`.gsb`) ou grille GeoTIFF PROJ (`.tif`), jusqu'à 20 Mo.

La grille est enregistrée dans le fichier du projet, elle voyage donc avec lui. La boîte de dialogue indique si le centre du projet se trouve dans la grille : hors de celle-ci, aucun décalage n'est appliqué, utilisez donc une grille qui couvre le site. **Arrêter d'utiliser la grille** revient au décalage approximatif. Chaque modification est une étape : {{key:Mod+Z}} l'annule.

Les couches SIG déjà présentes dans le projet restent en place lorsque la grille change ; importez-les à nouveau pour les placer via la grille. Les coordonnées propres au projet ne bougent jamais.

## Ce qui a été vérifié

- Chaque conversion a été comparée à PROJ (pyproj 3.7.1 avec PROJ 9.5.1), la bibliothèque de coordonnées que la plupart des programmes SIG utilisent, sur plus de 330 systèmes : state plane en pieds US survey et en pieds, UTM nord et sud, Lambert-93, British National Grid, GDA2020 MGA, Transverse Mercator de Nouvelle-Zélande et Mercator web, entre autres. Les E et N concordent à 1 cm près avec le même décalage de datum (la plupart à moins de 1 mm), et les calculs de projection concordent avec les définitions de PROJ à 1 cm près.
- Les fichiers `.prj` écrits par PROJ sous ses deux formes courantes (ESRI et OGC) ont été relus pour 105 systèmes : 208 des 210 correspondaient à leur code EPSG exact, et les deux autres à un système utilisant les mêmes calculs sur le même ellipsoïde. Les fichiers `.prj` écrits par CivilCraft sont lus par PROJ comme le même système. Les fichiers `.prj` ESRI des systèmes stéréographiques polaires (UPS, polaire de l'Alaska) ne peuvent pas être lus ; choisissez ces systèmes par code.
- La latitude et la longitude de la barre d'état concordaient avec PROJ à 0.01″ près dans le navigateur.
