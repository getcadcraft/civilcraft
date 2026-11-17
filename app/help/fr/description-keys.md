---
title: Clés de description et codes de ligne
summary: Transformer les codes de relevé en groupes de points avec descriptions, et relier les points codés en lignes (début, fin, fermeture) qui deviennent des lignes de rupture.
keywords: clés de description, codes de relevé, codes de ligne, figures, tracés linéaires, début, fin, fermeture, groupes de points, codes, codes topographiques, carnet de terrain, lignes de rupture, bordure, bord de chaussée
from: b3d1af8d
---

Les équipes de relevé codent chaque visée sur le terrain : `EP` pour bord de chaussée, `TC` pour haut de bordure, `BLDG` pour un angle de bâtiment. Le code est le premier mot de la description du point. CivilCraft regroupe les points par ce code et transforme en lignes les codes de ligne qui le suivent.

## Codes de ligne

Un code de ligne est le mot placé juste après le code de relevé :

| Description | Signification |
|---|---|
| `EP B` | Commence une nouvelle ligne de bord de chaussée à ce point |
| `EP` | Poursuit la ligne EP en cours |
| `EP E` | Termine la ligne EP en cours à ce point |
| `BLDG C` | Ferme le bâtiment : relie ce point au premier point de la ligne |

Les points ayant le même code sont reliés dans l'ordre des numéros de point. Des codes différents donnent des lignes différentes, même dans un même groupe : `EP1` et `EP2` donnent donc deux bords à la fois. Un code qui n'utilise jamais de code de ligne est relié à travers tous ses points, comme dans les versions précédentes.

Les lignes d'un groupe utilisé comme **Ligne de rupture** deviennent des lignes de rupture, une par ligne, de sorte qu'une bordure avec une interruption n'est pas étirée au-dessus de cette interruption. Les lignes des autres groupes sont dessinées sur le plan (calque V-NODE-LINE) et sortent en DXF, DWG et PDF.

Les mots pour le début, la fin et la fermeture sont `B`, `BEG`, `START` ; `E`, `END` ; et `C`, `CLO`, `CLOSE`. Modifiez-les, ou désactivez les codes de ligne, dans la boîte de dialogue ci-dessous.

## Clés de description

Une clé de description transforme un code en groupe de points, en usage et en description détaillée.

1. Sous **Points**, cliquez sur {{ui:Clés de description et codes de ligne}}.
2. Cliquez sur {{ui:Ajouter une clé}} et remplissez la ligne :
   - **Code** : le code de relevé à reconnaître. `*` remplace n'importe quels caractères et `?` un seul caractère, donc `EP*` capte EP, EP1 et EP12.
   - **Groupe** : le groupe de points auquel ces points se rattachent (vide = le code lui-même). `EP*` avec le groupe `EP` met EP1 et EP2 dans un même groupe tout en gardant des lignes distinctes.
   - **Usage** : Points, Ligne de rupture ou Exclu, lorsque le groupe apparaît pour la première fois (ou laissez-le au tableau **Points**).
   - **Description** : le nom détaillé, affiché dans les **Propriétés** d'un point.
3. La colonne **Points** compte les points que chaque clé capte pendant que vous saisissez. La première clé qui correspond à un code l'emporte.
4. Cliquez sur {{ui:Appliquer}}. Les groupes, la surface et le plan suivent en une seule étape : {{key:Mod+Z}} l'annule.

Un groupe conserve l'usage que vous lui avez donné dans le tableau **Points** ; l'usage d'une clé ne s'applique qu'à un groupe nouveau. Les clés et les codes de ligne sont enregistrés dans le fichier du projet.
