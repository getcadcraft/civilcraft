---
title: Laisser un assistant IA travailler avec votre site
summary: Activer les assistants dans Paramètres pour qu'un assistant sur votre ordinateur puisse lire le site ouvert (points, surfaces, volumes, profils, parcelles), ajouter des points de levé, enregistrer et exporter en LandXML ou DWG, par l'intermédiaire de CadCraft Studio. Désactivé tant que vous ne l'activez pas.
keywords: ia, assistant, mcp, script, automatisation, studio, points, altitude, station, décalage, tracé, volume, déblai, remblai, profil, parcelle, landxml, dwg, usd, dossiers, autorisations, déconnexion, activité
from: d0356582
---

## Ce que vous allez apprendre

Comment laisser un assistant IA (tout assistant qui parle MCP) travailler avec le site que vous avez ouvert, ce qu'il peut et ne peut pas faire, et comment l'arrêter.

## Ce qu'un assistant peut faire dans CivilCraft

| Il demande | Ce qu'il obtient | Droit nécessaire |
|---|---|---|
| Le site | Nom, unités, système de coordonnées, groupes de points, tracés, surfaces, plateformes, parcelles et canalisations | Lecture |
| Points de levé | Numéro, Est, Nord, altitude et description, par groupe, par description ou à l'intérieur d'un rectangle | Lecture |
| Altitudes de surface | Le terrain existant (ou la surface terrassée) aux points qu'il nomme | Lecture |
| Stations et décalages | La station et le décalage de points le long d'un tracé, ou les coordonnées et l'altitude du terrain aux stations | Lecture |
| Un profil | Altitudes du terrain, du profil projet et de la surface terrassée le long d'un tracé, tous les tant de pieds ou de mètres | Lecture |
| Déblai et remblai | Volumes entre le terrain existant et la surface terrassée (chaque plateforme et chaque corridor aussi), ou entre le terrain et un niveau | Lecture |
| Parcelles | Angles, surface (en acres ou en hectares), périmètre et description légale | Lecture |
| Une sélection | Les points qu'il nomme sont sélectionnés sur le plan, comme si vous les aviez choisis | Modification |
| Nouveaux points de levé | Points ajoutés avec les numéros qu'il donne, ou les prochains libres. Chaque appel est une étape que vous pouvez annuler | Modification |
| Enregistrement | {{ui:Enregistrer}} de CivilCraft lui-même | Enregistrer |
| LandXML ou DWG | Les mêmes fichiers que les boutons {{ui:LandXML}} et {{ui:DWG}} | Export |
| Le site en 3D | OpenUSD (.usdz, .usda ou .usdc) du terrain, de la surface terrassée, des plateformes et des canalisations, tel que l'exporte la vue 3D | Export |
| Plantes et tableau des plantations | Plantes trouvées dans la liste des plantes sous n'importe quel nom, et les décomptes du tableau des plantations | Lecture |
| Plantation et terrassement | Plantes, massif ou haie placés, ou plateforme, merlon, noue ou zone de terrassement ajoutés, chacun en une étape annulable, avec son déblai et son remblai | Modification |
| Contrôle d'arrosage | Débit de chaque zone, pression nécessaire à sa vanne et à l'alimentation, charge au pire cas, durées de fonctionnement, problèmes et nomenclature, comme aide au calcul que contrôle un concepteur d'arrosage | Lecture |

Il fonctionne avec le site ouvert. Dans Studio, il peut aussi enregistrer et exporter dans les dossiers que vous choisissez (ci-dessous) ; sans dossier, ses fichiers sont téléchargés comme le font les boutons.

## Activer

Les assistants atteignent CivilCraft via CadCraft Studio sur votre ordinateur ; le navigateur seul n'a pas d'accès.

1. Ouvrez {{ui:Paramètres}} et choisissez l'onglet **CivilCraft**.
2. Sous **Assistants**, cochez **Autoriser les assistants IA et les scripts à utiliser CivilCraft**.
3. **Lecture** est cochée pour vous. Cochez **Modification**, **Enregistrer** ou **Export** seulement lorsque l'assistant en a besoin.
4. Pour lui permettre d'enregistrer et d'exporter dans un dossier, choisissez {{ui:Ajouter un dossier…}} sous **Dossiers qu'il peut utiliser**, puis choisissez le dossier dans la boîte de dialogue de Studio. {{ui:Supprimer}} le retire immédiatement ; tout autre chemin est refusé.
5. Connectez l'assistant dans Studio (Studio affiche l'adresse et les paramètres à coller dans l'assistant).

## Pendant qu'un assistant est connecté

Une note en haut du panneau de droite indique quel assistant est connecté et ce qu'il peut faire. Cliquez sur {{ui:Déconnecter}} pour mettre fin à sa session immédiatement ; il devra se reconnecter pour continuer.

**Activité**, sous **Assistants** dans les Paramètres, liste chaque appel fait par l'assistant, du plus récent au plus ancien, en indiquant s'il a réussi.

:::tip
Demandez en mots simples, par exemple « quelle est l'altitude du terrain tous les 50 pieds le long de Main Street ? », « combien de déblai et de remblai faut-il pour les plateformes ? » ou « ajoute un point de contrôle à ces coordonnées ». L'assistant lit le site et répond, ou fait la modification en une seule étape que vous pouvez annuler.
:::

## Sans ouvrir CivilCraft

Le serveur de fichiers CadCraft pour les assistants (`npx @getcadcraft/mcp`) et la ligne de commande `cadcraft` ouvrent les projets CivilCraft enregistrés (`.civilcraft.json`) et les fichiers de points avec le code propre de CivilCraft, sans fenêtre : les mêmes outils de lecture, l'ajout de points, l'enregistrement du projet, LandXML et le site en 3D au format OpenUSD. `cadcraft convert site.civilcraft.json site.xml` écrit du LandXML depuis la ligne de commande. L'ouverture de LandXML, l'export DWG et les outils de l'espace de travail Paysage exigent encore la fenêtre de CivilCraft.

## Désactiver

Décochez **Autoriser les assistants IA et les scripts à utiliser CivilCraft**. Chaque assistant est déconnecté immédiatement, et le réglage est conservé pour la prochaine fois.

## Voir aussi

- [Recettes pour les assistants IA](common:assistants-recipes) : exemples détaillés, chacun avec les outils qu'il appelle.
- [Dessiner un tracé en plan horizontal](topic:alignment)
- [Construire et affiner la surface](topic:build-surface)
- [Sélectionner, copier et coller des points de levé](topic:copy-paste-points)
- [Paramètres de CivilCraft](topic:settings)
