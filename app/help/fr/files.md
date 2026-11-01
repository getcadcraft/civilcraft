---
title: Fichiers que vous pouvez ouvrir, enregistrer et exporter
summary: Fichiers de points, LandXML et projets CivilCraft en entrée ; projets, LandXML, DXF et PDF en sortie ; ce que chaque fichier conserve, où il est placé et ce qui change hors ligne.
keywords: ouvrir, enregistrer, exporter, importer, formats de fichiers, csv, txt, landxml, xml, dxf, pdf, json, télécharger, fichier de projet
from: a7debb61
---

CivilCraft ouvre des fichiers depuis votre ordinateur et enregistre en les téléchargeant sur celui-ci. Rien n'est téléversé et rien n'est conservé sur un serveur. Voir aussi [Vos fichiers](common:your-files).

## Ce qu'il ouvre

Cliquez sur {{ui:Ouvrir}} (ou appuyez sur {{key:Mod+O}}) et choisissez un fichier, ou faites glisser le fichier depuis {{pick:mac=Finder|windows=Explorateur de fichiers|linux=votre gestionnaire de fichiers}} sur le plan. Un fichier à la fois ; les fichiers de plus de 200 MB sont refusés.

| Type | Noms de fichiers | Ce qui se passe |
|---|---|---|
| Fichier de points | `.csv`, `.txt`, `.pnt`, `.xyz` (tout fichier texte) | La boîte de dialogue **Importer des points** s'ouvre. Les points remplacent les points du projet ; les tracés en plan, les plateformes et les canalisations restent. |
| LandXML | `.xml`, `.landxml` | Un **nouveau projet** est créé à partir du fichier (on vous demande d'abord confirmation si le projet actuel contient des modifications non enregistrées). |
| Projet CivilCraft | `.civilcraft.json` (tout `.json`) | Le projet s'ouvre tel qu'il a été enregistré (on vous demande d'abord confirmation si le projet actuel contient des modifications non enregistrées). |

CivilCraft décide d'après l'extension du fichier, puis d'après ses premiers caractères : un texte commençant par `{` est lu comme un projet, un texte commençant par `<` comme du LandXML, tout le reste comme un fichier de points. Un fichier grisé dans la boîte d'ouverture peut tout de même être déposé sur le plan.

:::note
Importer un fichier de points dans un projet qui contient déjà des points les remplace sans demande de confirmation, et efface l'historique d'annulation (l'ouverture de tout fichier repart de zéro pour l'annulation). Si la surface provient d'un LandXML, l'importation de points la repasse en surface construite à partir des points. Enregistrez d'abord si vous pourriez vouloir retrouver les anciens points.
:::

Détails : [Formats des fichiers de points](topic:point-file-formats), [LandXML : ce qui est lu et écrit](topic:landxml-reference).

## Ce qu'il enregistre

{{ui:Enregistrer}} ({{key:Mod+S}}) écrit deux fichiers côte à côte, nommés d'après le **Nom** du panneau de gauche : `<name>.civilcraft.json`, le projet que vous continuez à modifier, et `<name>.ifc`, la même conception au format IFC 4.3 pour les autres logiciels (voir [Export et import IFC](topic:ifc)). Chaque fichier mentionne l'autre, et l'IFC contient aussi une copie compressée du projet : un IFC envoyé seul se rouvre donc entièrement modifiable.

- **Dans Studio**, les deux fichiers sont écrits côte à côte, à leur emplacement.
- **Dans Chrome et Edge**, le premier enregistrement demande un dossier et y écrit les deux fichiers ; les enregistrements suivants vont dans le même dossier. Annulez la question du dossier pour télécharger les deux fichiers à la place.
- **Dans les autres navigateurs**, les deux fichiers sont téléchargés, le fichier de projet en premier.

Ouvrir l'un des deux fichiers cherche l'autre. Ouvrez les deux ensemble (ou déposez-les ensemble), ou ouvrez-en un seul : dans Studio, l'autre est retrouvé dans le même dossier ; dans un navigateur, CivilCraft vous demande de l'ajouter, ou de continuer avec celui que vous avez. Si l'IFC a été modifié par un autre logiciel après l'enregistrement par CivilCraft, ou si l'un des deux fichiers est plus ancien que l'autre, le projet s'ouvre à partir de la conception la plus récente et le panneau **Problèmes** indique ce qui s'est passé, avec **Enregistrer maintenant** (réécrit les deux fichiers) et **Afficher la géométrie de l'IFC comme référence**. Un IFC seul modifié par un autre logiciel s'ouvre à partir de sa copie du projet, avec ce qui correspond encore : les tracés qu'il a modifiés prennent sa géométrie, les objets qu'il a supprimés sont exclus, et le reste de ses modifications est listé sans être appliqué. Un fichier de projet antérieur à la version 0.7.1 s'ouvre comme avant.

Le fichier de projet conserve :

- chaque point (numéro, coordonnées, altitude, description) et le nom du fichier de points d'origine
- les réglages de surface : choix de groupes, lignes de rupture dessinées, limite, plus long bord extérieur, et un TIN lu depuis LandXML
- les réglages d'affichage
- les tracés avec leurs PI, rayons et station de départ, leurs profils de projet (PVI et longueurs de courbe) et les réglages de corridor
- les plateformes et le réseau de canalisations avec ses règles

Il ne conserve pas l'historique d'annulation. Les surfaces, les courbes de niveau, les lignes de raccordement au terrain et les volumes ne sont pas enregistrés ; ils sont reconstruits à partir des données enregistrées à l'ouverture du projet. Un fichier de projet provenant d'une version plus récente de CivilCraft est refusé, avec un message qui indique sa version.

## Ce qu'il exporte

| Bouton | Fichier | Contenu |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2 : points, terrain existant (et surface terrassée lorsqu'elle existe) sous forme de surfaces TIN, tracés en plan, profils du terrain et profils de projet, réseau de canalisations |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 des tracés du plan tels qu'ils sont affichés, sur des calques nommés |
| {{ui:DWG}} | `<name>.dwg` | Les mêmes tracés sous forme de dessin DWG, dans le format de votre choix (2000 à 2018) |
| {{ui:PDF}} | `<name>.pdf` | Un tracé vectoriel du plan sur une feuille, à l'échelle de votre choix |
| {{ui:GLB}} ou {{ui:OBJ}} (dans la barre de la vue 3D) | `<name>-3d.glb`, `<name>-3d.obj` | Ce que la vue 3D affiche sous forme de modèle 3D : mètres, Y vers le haut, échelle réelle, autour d'une origine locale enregistrée |

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
Ouvrez **Safari > Paramètres > Général** et réglez **Emplacement de téléchargement des fichiers** sur **Demander pour chaque téléchargement**.
:::

Si vous enregistrez deux fois avec le même nom, le navigateur peut ajouter un numéro au second fichier, par exemple `Site (1).civilcraft.json`. Ouvrez le plus récent la fois suivante.

## En ligne et hors ligne

CivilCraft fonctionne uniquement sur votre ordinateur dans tous les cas : l'ouverture lit le fichier dans le navigateur, l'enregistrement le télécharge. Pour ouvrir CivilCraft sans aucune connexion, enregistrez-le d'abord pour un usage hors ligne :

1. Lorsque vous êtes en ligne, cliquez sur {{ui:Enregistrer pour le hors ligne}} dans la barre d'application en haut.
2. Le bouton affiche un compteur (« Enregistrement : 12 sur 30 ») puis affiche {{ui:Prêt hors ligne}}. CivilCraft est petit (environ 0.6 MB), l'opération prend donc un moment. La copie enregistrée comprend cette aide et le site exemple.
3. Sans connexion, ouvrez la même adresse (ou un favori de celle-ci). Tout fonctionne, y compris {{ui:Ouvrir le site exemple}}.

Les autres états du bouton :

- {{ui:Enregistrement impossible}} : certains fichiers n'ont pas été téléchargés. Vérifiez la connexion et cliquez dessus pour réessayer.
- {{ui:Hors ligne indisponible}} : cette fenêtre du navigateur ne peut pas conserver de copie hors ligne (les fenêtres privées et certains ordinateurs gérés le bloquent). Utilisez une fenêtre normale.

Cliquez sur {{ui:Prêt hors ligne}} pour voir à quel moment la copie a été enregistrée, avec deux choix : {{ui:Enregistrer à nouveau (obtenir la version la plus récente)}} et {{ui:Supprimer la copie hors ligne}}. Enregistrez à nouveau avant une visite sur site pour que la copie corresponde à la version la plus récente. Plus d'informations dans [Hors ligne](common:offline).

:::offline
Vous êtes actuellement hors ligne. Si CivilCraft a été enregistré pour un usage hors ligne, tout fonctionne, y compris le site exemple. Sinon, continuez à travailler dans cet onglet, mais ne le rechargez pas avant d'être de nouveau en ligne ; sans copie enregistrée, {{ui:Ouvrir le site exemple}} échoue avec « Impossible de charger l'exemple ».
:::

:::tip
Pour une utilisation sur le terrain, enregistrez CivilCraft pour un usage hors ligne et apportez vos fichiers de points sur l'ordinateur portable lui-même. Les projets et exports s'enregistrent comme téléchargements sans connexion : vous pouvez donc importer les relevés d'une journée, vérifier la surface et enregistrer le projet sur le site.
:::

L'enregistrement dans le cloud n'est pas encore disponible, et les versions de bureau ne sont pas encore sorties. Pour l'instant, les fichiers que vous enregistrez sont la seule copie : conservez-les à un endroit sauvegardé.

## Modules complémentaires utilisés par un fichier

Lorsque vous enregistrez un projet qui contient des données d'un module complémentaire (les cases de réglementation du bâtiment, ou une source Adresse vers site), le fichier enregistre les modules et leurs versions. Ouvert sur un ordinateur qui n'en possède pas, une barre au-dessus du plan l'indique et propose de l'ajouter depuis la liste de votre compte. Cet enregistrement n'est qu'une note : le fichier s'ouvre dans tous les cas.

## Annuler depuis Studio

Dans CadCraft Studio, chaque étape que vous terminez dans CivilCraft est signalée à Studio, afin que son annulation au niveau du projet puisse reprendre la dernière étape à travers les applications. Studio n'annule une étape que si la pile d'annulation de CivilCraft se trouve exactement dans l'état laissé par cette étape ; après l'ouverture d'un autre fichier, il ignore cette fenêtre.

## Fermer avec des modifications non enregistrées

Lorsque le projet contient des modifications non enregistrées et que vous fermez l'onglet, rechargez la page ou quittez-la, le navigateur demande si vous voulez partir. Son libellé et son apparence relèvent du navigateur et ne peuvent pas être modifiés par CivilCraft. {{ui:Nouveau}}, ainsi que l'ouverture d'un projet ou d'un fichier LandXML, demandent plutôt dans la boîte propre à CivilCraft **Modifications non enregistrées**, avec {{ui:Annuler}}, {{ui:Ne pas enregistrer}} et {{ui:Enregistrer une copie}}.
