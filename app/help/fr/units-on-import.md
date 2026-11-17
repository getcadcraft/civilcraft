---
title: Unités à l'import : un fichier indique ses unités, ou l'on vous demande d'abord
summary: Lorsqu'un dessin ou un maillage que vous importez dans un projet indique ses unités, CivilCraft le convertit et le signale. Sinon, CivilCraft demande avant de le lire et mémorise votre réponse pour ce fichier.
keywords: unités, import, DWG, DXF, STL, OBJ, levé, pieds, pieds US d'arpentage, mètres, millimètres, échelle, mauvaise taille, trop grand, trop petit, demander, mémorisé, INSUNITS, unités du dessin
from: 60921963
---

## Ce que vous allez faire

Importez un fichier dans un projet et assurez-vous qu'il entre à la bonne taille.

## Étapes

1. Ouvrez le fichier comme d'habitude : {{ui:Ouvrir}}, déposez-le sur le plan, ou utilisez la commande de dessin CAO.
2. Si le fichier indique ses unités, rien n'est demandé : la boîte de dialogue d'import les affiche comme **Selon le dessin**.
3. Sinon, une boîte de dialogue demande **Unités de** pour le fichier, avant l'ouverture de la boîte d'import. Choisissez ce que représente une unité dans le fichier, puis cliquez sur {{ui:Utiliser ces unités}}.
4. {{ui:Annuler}} (ou {{key:Esc}}) ignore le fichier. Rien de son contenu n'est lu dans le projet.

## Quels fichiers indiquent leurs unités

- **DWG et DXF** : les unités d'insertion du dessin (`$INSUNITS`). Un fichier qui n'en comporte pas fait l'objet d'une question. La liste **Unités du dessin** de la boîte d'import part de votre réponse et peut encore être modifiée.
- **STL et OBJ** (formes libres du terrain) : n'indiquent jamais d'unités. On vous les demande.
- **Listes de points** (CSV, TXT) et listes de relevés d'avancement : une liste qui indique son unité dans ses premières lignes est convertie, et la ligne d'état le signale. Une liste qui n'en indique aucune fait l'objet d'une question lorsque vous appuyez sur {{ui:Importer}}, avant l'entrée des points. Les colonnes latitude et longitude passent à la place par le système de coordonnées.
- **Le module complémentaire Nuages de points** : demande lorsque vous construisez un nuage dont le fichier n'indique aucune unité, et étiquette les nombres du nuage dans l'unité qu'il porte.
- **IFC et LandXML** : indiquent leurs unités ; ils sont convertis dans les unités du projet.
- **LAS, LAZ et rasters d'altitude** : placés selon leur système de coordonnées ; la boîte de dialogue du terrain demande l'unité d'altitude lorsque le fichier ne l'indique pas.

## Bon à savoir

- La réponse est mémorisée pour ce fichier sur cet ordinateur, dans toutes les applications CadCraft. La prochaine fois qu'il est importé, la question ne vous est pas posée.
- Pour être à nouveau interrogé : la palette de commandes ({{key:Mod+K}}) › **Demander à nouveau les unités des fichiers importés**.
- L'unité indiquée par une liste est lue dans ses huit premières lignes : une ligne telle que `units: ft`, ou des en-têtes de colonnes portant tous la même unité entre parenthèses, comme `Elevation (m)`.
