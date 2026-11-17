---
title: Afficher des couches cartographiques sous le plan
summary: Placez une image géoréférencée, des tuiles de carte, un serveur WMS ou WMTS ou un service cartographique sous le plan comme contexte du site, avec le réglage Internet, l'opacité, l'ordre et la mention de source.
keywords: couches cartographiques, couche cartographique, fond de plan, fond cartographique, arrière-plan, aérienne, orthophoto, imagerie, satellite, raster, world file, pgw, jgw, tfw, wld, geotiff, image géoréférencée, xyz, tuiles, carte en tuiles, wms, wmts, getcapabilities, service cartographique, rest, mapserver, imageserver, usgs, national map, attribution, opacité
from: 32d7718e
---

Les couches cartographiques sont des images dessinées sous votre projet : une photo aérienne avec son world file, ou des cartes provenant de serveurs sur Internet. Elles ne servent que de contexte de site à l'écran : elles **ne figurent pas** dans les tracés PDF, les exports DXF ou DWG, ni dans la vue 3D.

Choisissez {{ui:Carte}} dans le groupe {{ui:SIG}}. La boîte de dialogue **Couches cartographiques** liste les couches du projet et en ajoute de nouvelles. Les couches cartographiques ont besoin du système de coordonnées du projet ([Définir le système de coordonnées du projet](topic:coordinate-systems)), sauf une image dont le world file utilise les coordonnées propres du projet.

## Le réglage Internet

CivilCraft ne demande jamais rien à un serveur cartographique tant que vous ne l'y autorisez pas : {{ui:Paramètres}}, {{ui:CivilCraft}}, **Couches cartographiques depuis Internet** : **Désactivé** (au départ) ou **Activé**.

:::note
Lorsqu'il est activé, CivilCraft demande aux serveurs cartographiques que vous ajoutez les images de la zone affichée à l'écran. Votre dessin reste sur cet ordinateur ; le serveur voit la zone et votre adresse Internet.
:::

Tant que le réglage est désactivé, les couches Internet sont listées dans la boîte de dialogue mais grisées, avec la raison, et rien n'est dessiné ni demandé. L'ouverture d'un projet qui nomme des serveurs cartographiques ne les contacte pas non plus. Une image provenant d'un fichier fonctionne dans les deux cas. Le bouton {{ui:Ouvrir les Paramètres}} de la boîte de dialogue vous y conduit.

## Une image géoréférencée (fonctionne hors ligne)

1. Dans **Ajouter une couche**, gardez **Image géoréférencée** et choisissez les fichiers : l'image (PNG ou JPEG) **accompagnée de** son world file (`.pgw` pour PNG, `.jgw` pour JPEG, ou `.wld`) et, s'il y en a un, son `.prj`. Vous pouvez aussi les déposer ensemble sur le plan.
2. Sans `.prj`, CivilCraft demande quel système utilise le world file : {{ui:Le système du projet}} (le plus courant), {{ui:Choisir un système…}}, ou, dans un projet sans système, **Coordonnées du projet**.
3. L'image apparaît sous le plan, et {{ui:Ajuster}} l'inclut.

Un GeoTIFF RVB (une photo aérienne enregistrée en GeoTIFF) porte son propre placement et son propre système : ouvrez-le seul. L'image est conservée **dans le fichier du projet** (jusqu'à 25 Mo) ; une image plus grande est refusée avec sa taille, donc enregistrez une copie plus petite (moins de pixels, ou en JPEG).

## Tuiles, WMS, WMTS et services cartographiques

Activez d'abord **Couches cartographiques depuis Internet**. Puis, dans **Ajouter une couche** :

| Source | Ce qu'il faut coller | Ce que fait CivilCraft |
|---|---|---|
| URL de tuiles | Un modèle avec `{z}`, `{x}` et `{y}` (ou `{-y}`), et `{s}` pour une lettre de serveur, par exemple `https://tile.example.org/{z}/{x}/{y}.png`. Donnez-lui un nom et sa mention de source. | Tuiles en Web Mercator pour la zone et le zoom affichés à l'écran. |
| Serveur WMS | L'adresse du serveur, ou son lien GetCapabilities. Choisissez {{ui:Obtenir les couches}}, puis la couche. | Une seule image de la zone affichée, demandée dans le code EPSG du projet lorsque le serveur le propose, sinon en Web Mercator ou WGS 84. |
| Serveur WMTS | L'adresse du serveur, ou son `WMTSCapabilities.xml`. Choisissez {{ui:Obtenir les couches}}, puis la couche et l'ensemble de matrices de tuiles. | Tuiles de l'ensemble dans le système du projet lorsqu'il y en a un, sinon en Web Mercator. |
| Service cartographique ArcGIS (REST) | Une URL se terminant par `/MapServer` ou `/ImageServer`. Choisissez {{ui:Lire le service}}. | Les services en Web Mercator mis en cache sont dessinés à partir de leurs tuiles ; les autres sont sollicités pour une seule image de la zone affichée. |

Aucun serveur n'est préconfiguré. Exemples publics, tous issus de l'USGS National Map (domaine public) :

- WMS : `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS : `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Service cartographique : `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (aussi `USGSImageryOnly` pour les photos aériennes)

De nombreux services SIG de villes et de comtés publient leurs propres WMS ou services cartographiques ; leurs pages SIG donnent l'adresse. Un serveur qui demande une connexion ou une clé ne fonctionne pas : CivilCraft n'envoie ni noms d'utilisateur, ni mots de passe, ni clés.

## Comment les couches sont dessinées

- Les images dans un autre système que celui du projet sont déformées pour s'y inscrire : l'image est découpée en morceaux, chacun placé à moins d'un quart de pixel d'écran de l'endroit où une conversion exacte le met.
- Les tuiles sont choisies pour la zone affichée et le zoom : jamais plus de 64 pour une vue, 6 à la fois. Lorsque vous faites un panoramique ou un zoom, les demandes pour l'ancienne vue sont annulées. Environ 200 tuiles sont gardées en mémoire (rien n'est stocké sur le disque).
- Une image WMS ou de service cartographique est demandée une fois la vue immobile ; en attendant, la précédente reste en place.
- L'attribution de chaque couche s'affiche en petit, en bas à droite du plan.

## Modifier, ordonner et retirer des couches

Dans la boîte de dialogue, chaque couche a une case à cocher pour l'afficher ou la masquer, un curseur **Opacité**, des flèches pour la dessiner plus tôt (dessous) ou plus tard (dessus), un bouton de zoom (images) et un bouton de suppression. La première couche de la liste est dessinée en bas. Chaque modification correspond à une étape d'annulation.

## Quand une couche n'affiche rien

La raison apparaît une fois dans la ligne d'état et reste sous le nom de la couche dans la boîte de dialogue :

| Message | Que faire |
|---|---|
| Désactivé : les couches cartographiques depuis Internet sont désactivées dans les Paramètres. | Activez **Couches cartographiques depuis Internet**. |
| Le système de coordonnées du projet est requis | Définissez-le sous {{ui:Coordonnées}}. |
| Le serveur n'a pas autorisé cette page à utiliser ses images (CORS), ou n'a pas pu être joint. | Le serveur ne laisse pas les pages web utiliser ses images, ou il est en panne. Après quatre refus, CivilCraft cesse de demander ; masquez puis affichez la couche pour réessayer. |
| Le serveur a répondu 404 … / Le serveur a envoyé text/xml, et non une image : … | L'URL, la couche ou le style est incorrect, ou le message du serveur indique ce qu'il attend. |
| Cette couche n'est pas proposée dans le système du projet, en Web Mercator ou en WGS 84 | Le serveur ne peut pas dessiner là où CivilCraft peut la placer. |

## Ce qui a été vérifié

- Les numéros de tuiles ont été contrôlés par rapport au pavage Web Mercator standard. Les réponses WMS 1.1.1 et 1.3.0, WMTS et services cartographiques ont été lues à partir de fichiers écrits à la main et de réponses réelles enregistrées auprès des serveurs USGS National Map et terrestris OpenStreetMap. Les requêtes WMS 1.3.0 placent la latitude en premier pour EPSG:4326, comme le prévoit la norme.
- La déformation a été comparée à une conversion exacte pixel par pixel, à partir des valeurs de PROJ : à 0.13 px près pour les tuiles, les images WMS et une image à l'échelle d'un comté, à l'échelle du site comme en zoom arrière.
- Une image avec son world file, et un GeoTIFF RVB écrit par GDAL (via rasterio), ont été dessinés là où indique leur placement, vérifiés pixel par pixel dans le navigateur.
- Dans le navigateur, face à un serveur de substitution sur l'ordinateur de test : les tuiles tombent dans la tuile où PROJ place chaque point, une image WMS tombe à 2 px près, au plus 6 requêtes s'exécutent à la fois, et lorsque le réglage est désactivé, aucune requête ne quitte la page. Le service cartographique USGS National Map ci-dessus a aussi été lu et dessiné en direct dans le navigateur, une fois (ses tuiles sont arrivées et ont été dessinées, avec son texte de droit d'auteur) ; les autres serveurs publics n'ont été lus qu'à partir de réponses enregistrées.
