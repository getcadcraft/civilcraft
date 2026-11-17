---
title: Échanger du LandXML
summary: Ouvrir du LandXML provenant d'autres logiciels de génie civil comme nouveau projet, exporter points, surfaces, tracés, profils et réseau de canalisations en LandXML 1.2, et savoir ce qui ne passe pas.
keywords: landxml, xml, import, export, échange, tin, surface, tracé, profil, réseau de canalisations, interopérabilité, échange de données
from: 870d5ece
---

LandXML est le format d'échange ouvert que la plupart des logiciels de génie civil lisent et écrivent. CivilCraft lit et écrit du LandXML 1.2. Si vous avez utilisé Civil 3D, ses boîtes de dialogue d'import et d'export LandXML sont l'équivalent le plus proche ; ici, il n'y a aucun choix à faire, et les notes vous indiquent ce qui a été laissé de côté.

## Ouvrir un fichier LandXML

1. Cliquez sur {{ui:Ouvrir}} (ou appuyez sur {{key:Mod+O}}) et choisissez le fichier `.xml` ou `.landxml`, ou déposez-le sur le plan.
2. Si le projet actuel comporte des modifications non enregistrées, CivilCraft demande d'abord. Choisissez {{ui:Enregistrer une copie}}, {{ui:Ne pas enregistrer}} ou {{ui:Annuler}}.
3. Un **nouveau projet** est créé. La barre d'état indique ce qui a été lu, par exemple : « site.xml ouvert : 412 points, 2 surfaces, 3 tracés. »
4. Regardez la zone sous les informations de **Surface**. Elle liste tout ce qui a été ignoré ou modifié, par exemple :
   - « Seule la première surface (« EG ») a été ouverte ; le fichier en contient 1 de plus. »
   - « Le tracé « Ramp A » comporte des éléments que CivilCraft ne peut pas encore dessiner (ni lignes, ni arcs, ni clothoïdes) ; il a été ignoré. »
   - « Les règles du réseau de canalisations ne figuraient pas dans le fichier ; des valeurs provisoires sont utilisées. Définissez les vôtres sous Projet. »

Ce qui devient quoi :

| Dans le fichier | Dans CivilCraft |
|---|---|
| Unités (Imperial ou Metric) | Les **Unités** du projet (pieds ou mètres) |
| Nom du projet | Le **Nom** du projet |
| CgPoints | Les points du projet ; la description (ou le code) donne le groupe |
| La première surface TIN | Le terrain existant, utilisé tel quel (« Surface (depuis LandXML) ») |
| Chaque tracé de lignes, d'arcs et de clothoïdes | Un tracé avec ses PI, rayons et longueurs de raccordement reconstruits à partir des courbes |
| Le premier profil projeté de chaque tracé | Son profil projeté, avec des courbes verticales paraboliques |
| Le premier réseau de canalisations | Le réseau, avec ses bords, puisards et radiers |
| Lignes et arcs des éléments de plan | Lignes caractéristiques, arcs conservés ; venant d'un autre logiciel, elles commencent en **Seulement dessiné** |

La liste complète des éléments et attributs figure dans [LandXML : ce qui est lu et écrit](topic:landxml-reference).

:::note
Une surface lue depuis LandXML n'est pas reconstruite lorsque vous modifiez les groupes de points ou dessinez des lignes de rupture. Cliquez sur {{ui:Reconstruire la surface à partir des points}} dans la section **Surface** pour la construire à partir des points à la place ({{key:Mod+Z}} ramène la surface LandXML).
:::

## Exporter du LandXML

1. Cliquez sur {{ui:LandXML}} dans le groupe **Exporter**.
2. Le navigateur télécharge `<nom>.xml`. La barre d'état indique ce qui a été inclus, par exemple : « LandXML 1.2 exporté : 276 points, 2 surfaces, 1 tracé, le réseau de canalisations. Les plateformes ne font pas partie du LandXML ici ; la surface terrassée, si. »

Le fichier contient :

- **Unités** : pieds de l'arpentage américain ou mètres.
- **CgPoints** : chaque point avec son numéro comme nom, sa description et son groupe comme code.
- **Surfaces** : le terrain existant sous forme de TIN, avec ses lignes de rupture et sa limite extérieure en données source ; et, lorsque des plateformes ou des corridors sont terrassés, une seconde surface TIN nommée « Projeté ».
- **Tracés** : lignes, arcs et clothoïdes avec leurs points kilométriques, chacun avec un profil contenant le terrain existant échantillonné le long de lui et le profil projeté (PVI et courbes paraboliques) lorsqu'il comporte au moins deux PVI.
- **PipeNetworks** : regards avec leurs bords, puisards et radier par canalisation, et canalisations avec diamètre, longueur et pente.
- **PlanFeatures** : chaque ligne caractéristique sous forme de lignes et d'arcs, avec l'altitude à chaque extrémité, et son usage.

## Ce qui ne passe pas

- Les plateformes et les corridors en tant qu'objets. Leur résultat figure dans la surface « Projeté ».
- Les tracés comportant des erreurs (par exemple des courbes qui se chevauchent) : ils sont laissés de côté et comptés dans le message d'état.
- Les canalisations sans leurs deux radiers, et les réseaux comportant moins de deux regards.
- Un bord pris sur la surface est écrit comme bord fixe. Rouvert, le regard conserve ce chiffre même si la surface change.
- Les règles de réseau (pente minimale, couverture, chute) : LandXML n'a pas d'emplacement pour elles.
- Les réglages d'affichage et les choix de surface des groupes de points : enregistrez un projet CivilCraft pour cela.

À l'ouverture, CivilCraft ne lit pas les spirales autres que les clothoïdes, les surfaces en grille, les points qui ne font que renvoyer à d'autres points, les parcelles, les spirales dans les éléments de plan, les chaussées ou les données d'arpentage. Chacun est signalé dans les notes, jamais deviné.

## Allers-retours

Pour confier un travail à quelqu'un qui utilise d'autres logiciels de génie civil et le récupérer ensuite, exportez du LandXML, laissez-le le modifier, puis ouvrez son LandXML comme nouveau projet. Conservez aussi votre propre `.civilcraft.json` : c'est le seul fichier qui garde tout ce que CivilCraft connaît.
