---
title: Fichiers que vous pouvez ouvrir, enregistrer et exporter
summary: Fichiers de points, LandXML et projets CivilCraft à l'ouverture ; projets, LandXML, DXF et PDF à l'export ; ce que chacun conserve, où vont les fichiers et ce qui change hors ligne.
keywords: ouvrir, enregistrer, exporter, importer, formats de fichiers, csv, txt, landxml, xml, dxf, pdf, json, télécharger, fichier de projet
from: 82bff559
---

CivilCraft ouvre des fichiers depuis votre ordinateur et enregistre en téléchargeant les fichiers vers celui-ci. Rien n'est téléversé et rien n'est conservé sur un serveur. Voir aussi [Vos fichiers](common:your-files).

## Ce qu'il ouvre

Cliquez sur {{ui:Ouvrir}} (ou appuyez sur {{key:Mod+O}}) et choisissez un fichier, ou faites glisser le fichier depuis {{pick:mac=Finder|windows=l'Explorateur de fichiers|linux=votre gestionnaire de fichiers}} sur le plan. Un fichier à la fois ; les fichiers de plus de 200 Mo sont refusés. Un fichier LandXML ou de projet de plus de 32 Mo est lu par tranches d'environ 4 Mo, jamais comme un seul bloc de texte ; pendant l'ouverture d'un LandXML, prévoyez qu'il occupe environ 13 fois la taille du fichier en mémoire (un fichier de 69 Mo a occupé environ 0.9 Go lors de notre test).

| Type | Noms de fichiers | Ce qui se passe |
|---|---|---|
| Fichier de points | `.csv`, `.txt`, `.pnt`, `.xyz` (tout fichier texte) | La boîte de dialogue **Importer les points** s'ouvre. Les points remplacent ceux du projet ; les tracés, plateformes et canalisations restent. |
| LandXML | `.xml`, `.landxml` | Un **nouveau projet** est créé à partir du fichier (on vous demande d'abord confirmation si le projet actuel contient des modifications non enregistrées). |
| Projet CivilCraft | `.civilcraft.json` (tout `.json`) | Le projet s'ouvre tel qu'il a été enregistré (on vous demande d'abord confirmation si le projet actuel contient des modifications non enregistrées). |

CivilCraft décide d'après l'extension du fichier, puis d'après ses premiers caractères : un texte commençant par `{` est lu comme un projet, un texte commençant par `<` comme du LandXML, tout le reste comme un fichier de points. Un fichier que la boîte d'ouverture grise peut tout de même être déposé sur le plan.

:::note
Importer un fichier de points dans un projet qui contient déjà des points les remplace sans demande de confirmation, et efface l'historique d'annulation (ouvrir un fichier repart de zéro pour l'annulation). Si la surface provient d'un LandXML, importer des points la remplace par une surface construite à partir de ces points. Enregistrez d'abord si vous voulez peut-être retrouver les anciens points.
:::

Détails : [Formats de fichiers de points](topic:point-file-formats), [LandXML : ce qui est lu et écrit](topic:landxml-reference).

## Ce qu'il enregistre

{{ui:Enregistrer}} ({{key:Mod+S}}) écrit deux fichiers côte à côte, nommés d'après **Nom** dans le panneau de gauche : `<name>.civilcraft.json`, le projet que vous continuez de modifier, et `<name>.ifc`, le même projet au format IFC 4.3 pour les autres logiciels (voir [Export et import IFC](topic:ifc)). Chaque fichier mentionne l'autre, et l'IFC contient aussi une copie compressée du projet ; ainsi, un IFC envoyé seul se rouvre tout de même entièrement modifiable.

- **Dans Studio**, les deux fichiers sont écrits l'un à côté de l'autre, au même endroit.
- **Dans Chrome et Edge**, le premier enregistrement demande un dossier et y écrit les deux fichiers ; les enregistrements suivants vont dans le même dossier. Annulez la question du dossier pour télécharger les deux fichiers à la place.
- **Dans les autres navigateurs**, les deux fichiers sont téléchargés, le fichier de projet en premier.

Ouvrir l'un de ces fichiers recherche l'autre. Ouvrez les deux ensemble (ou déposez-les tous les deux), ou ouvrez-en un seul : dans Studio, l'autre est trouvé dans le même dossier ; dans un navigateur, CivilCraft vous demande de l'ajouter, ou de continuer avec celui que vous avez. Si l'IFC a été modifié par un autre logiciel après l'enregistrement par CivilCraft, ou si un fichier est plus ancien que l'autre, le projet s'ouvre à partir de la version la plus récente et le panneau Problèmes indique ce qui s'est passé, avec **Enregistrer maintenant** (réécrit les deux fichiers) et **Afficher la géométrie de l'IFC comme référence**. Un IFC seul modifié par un autre logiciel s'ouvre à partir de sa copie du projet, avec ce qui correspond encore : les tracés modifiés reprennent sa géométrie, les objets qu'il a supprimés sont exclus, et le reste de ses modifications est listé, sans être appliqué. Un fichier de projet antérieur à la version 0.7.1 s'ouvre comme avant.

Le fichier de projet conserve :

- chaque point (numéro, coordonnées, altitude, description) et le nom du fichier de points dont ils proviennent
- les réglages de surface : choix des groupes, lignes de rupture dessinées, limite, plus long bord extérieur, et un TIN lu depuis un LandXML
- les réglages d'affichage
- les tracés avec leurs PI, rayons et station de départ, leurs profils de projet (PVI et longueurs de courbe) et les réglages de corridor
- les plateformes et le réseau de canalisations avec ses règles

Il ne conserve pas l'historique d'annulation. Les surfaces, courbes de niveau, lignes de raccordement au terrain et volumes ne sont pas stockés ; ils sont reconstruits à partir des données enregistrées à l'ouverture du projet. Un fichier de projet provenant d'une version plus récente de CivilCraft est refusé, avec un message qui indique sa version.

## Ce qu'il exporte

| Bouton | Fichier | Contenu |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2 : points, terrain naturel (et surface terrassée lorsqu'elle existe) sous forme de surfaces TIN, tracés, profils du terrain et profils de projet, réseau de canalisations |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 des tracés du plan tels qu'affichés, sur des calques nommés |
| {{ui:DWG}} | `<name>.dwg` | Les mêmes tracés sous forme de dessin DWG, dans le format de votre choix (2000 à 2018) |
| {{ui:PDF}} | `<name>.pdf` | Un tracé vectoriel du plan sur une feuille, à l'échelle de votre choix |
| {{ui:GLB}} ou {{ui:OBJ}} (dans la barre de la vue 3D) | `<name>-3d.glb`, `<name>-3d.obj` | Ce que la vue 3D affiche sous forme de modèle 3D : en mètres, Y vers le haut, à l'échelle réelle, autour d'une origine locale enregistrée |

Ce que chacun omet : [Échange LandXML](topic:landxml), [Exporter le plan en DXF](topic:dxf-export) (DWG aussi), [Tracer le plan en PDF](topic:plot-pdf), [Exporter le site en 3D](topic:export-3d).

## Où vont les fichiers

Les fichiers enregistrés et exportés vont là où votre navigateur place les téléchargements, en général le dossier Téléchargements. Pour choisir un dossier à chaque fois :

:::chromium
Ouvrez les **Paramètres** du navigateur, puis **Téléchargements**, et activez **Demander où enregistrer chaque fichier avant de le télécharger**.
:::

:::firefox
Ouvrez **Paramètres**, puis **Général**, et sous **Fichiers et applications**, choisissez **Toujours demander où enregistrer les fichiers**.
:::

:::safari
Ouvrez **Safari > Réglages > Général** et réglez **Emplacement des téléchargements** sur **Demander pour chaque téléchargement**.
:::

Si vous enregistrez deux fois avec le même nom, le navigateur peut ajouter un numéro au second fichier, par exemple `Site (1).civilcraft.json`. Ouvrez le plus récent la prochaine fois.

## En ligne et hors ligne

Dans les deux cas, CivilCraft fonctionne uniquement sur votre ordinateur : l'ouverture lit le fichier dans le navigateur, l'enregistrement le télécharge. Pour ouvrir CivilCraft sans aucune connexion, enregistrez-le d'abord pour une utilisation hors ligne :

1. Pendant que vous êtes en ligne, cliquez sur {{ui:Enregistrer pour le hors ligne}} dans la barre d'application en haut.
2. Le bouton compte (« Enregistrement 12 sur 30 ») puis affiche {{ui:Prêt hors ligne}}. CivilCraft est petit (environ 0.6 Mo), donc cela prend un instant. La copie enregistrée inclut cette aide et le site d'exemple.
3. Sans connexion, ouvrez la même adresse (ou un favori vers elle). Tout fonctionne, y compris {{ui:Ouvrir le site d'exemple}}.

Les autres états du bouton :

- {{ui:Enregistrement impossible}} : certains fichiers n'ont pas été téléchargés. Vérifiez la connexion et cliquez dessus pour réessayer.
- {{ui:Hors ligne indisponible}} : cette fenêtre de navigateur ne peut pas conserver de copie hors ligne (les fenêtres privées et certains ordinateurs gérés le bloquent). Utilisez une fenêtre normale.

Cliquez sur {{ui:Prêt hors ligne}} pour voir quand la copie a été enregistrée, avec deux choix : {{ui:Enregistrer à nouveau (obtenir la version la plus récente)}} et {{ui:Supprimer la copie hors ligne}}. Enregistrez à nouveau avant une visite sur site, pour que la copie corresponde à la version la plus récente. Plus d'informations dans [Hors ligne](common:offline).

:::offline
Vous êtes actuellement hors ligne. Si CivilCraft a été enregistré pour une utilisation hors ligne, tout fonctionne, y compris le site d'exemple. Sinon, continuez à travailler dans cet onglet, mais ne le rechargez pas avant d'être de nouveau en ligne ; sans copie enregistrée, {{ui:Ouvrir le site d'exemple}} échoue avec « L'échantillon n'a pas pu être chargé ».
:::

:::tip
Pour une utilisation sur le terrain, enregistrez CivilCraft pour une utilisation hors ligne et apportez vos fichiers de points sur l'ordinateur portable lui-même. Les projets et exports sont enregistrés comme téléchargements sans connexion : vous pouvez donc importer les relevés d'une journée, vérifier la surface et enregistrer le projet sur site.
:::

L'enregistrement dans le cloud n'est pas encore disponible, et les versions de bureau ne sont pas encore publiées. Pour l'instant, les fichiers que vous enregistrez sont la seule copie : conservez-les à un endroit sauvegardé.

## Modules complémentaires utilisés par un fichier

Lorsque vous enregistrez un projet contenant des données d'un module complémentaire (les cases de réglementation du bâtiment, ou une source « Adresse vers chantier »), le fichier note les modules et leurs versions. Ouvert sur un ordinateur qui ne les possède pas, une barre au-dessus du plan le signale et propose de les ajouter depuis la liste de votre compte. Cette note n'est qu'une information : le fichier s'ouvre dans tous les cas.

## Annuler depuis Studio

Dans CadCraft Studio, chaque étape terminée dans CivilCraft est signalée à Studio, de sorte que son annulation au niveau du projet peut revenir sur la dernière étape, toutes applications confondues. Studio n'annule une étape que si la pile d'annulation de CivilCraft est exactement dans l'état laissé par cette étape ; après l'ouverture d'un autre fichier, Studio ignore cette fenêtre.

## Fermer avec des modifications non enregistrées

Lorsque le projet contient des modifications non enregistrées et que vous fermez l'onglet, rechargez la page ou quittez-la, le navigateur demande si vous voulez partir. Son libellé et son aspect dépendent du navigateur et ne peuvent pas être modifiés par CivilCraft. {{ui:Nouveau}}, ainsi que l'ouverture d'un fichier de projet ou LandXML, demandent plutôt dans la boîte **Modifications non enregistrées** propre à CivilCraft, avec {{ui:Annuler}}, {{ui:Ne pas enregistrer}} et {{ui:Enregistrer une copie}}.
