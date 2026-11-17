---
title: Tracer un réseau de canalisations gravitaire
summary: Dessinez des tronçons d'eaux pluviales ou d'eaux usées regard par regard, réglez vos règles de pente, de recouvrement et de chute, laissez CivilCraft fixer les fils d'eau, et corrigez les problèmes qu'il liste.
keywords: constructeur de regard, type de regard, regard rectangulaire, avaloir, cadre, recouvrement, épaisseur de paroi, élément de bibliothèque, réseau de canalisations, eaux pluviales, eaux usées, égout, regards, avaloirs, fils d'eau, pente, chute, tampon, puisard, canalisations gravitaires
from: 10a3c14d
---

Un projet contient un seul réseau de canalisations gravitaire, eaux pluviales ou eaux usées. Il est formé de regards (regards de visite, avaloirs) et de canalisations droites entre eux. L'écoulement suit le sens dans lequel vous dessinez. CivilCraft vérifie chaque canalisation et chaque regard selon trois règles que vous définissez, et peut fixer tous les fils d'eau à partir de ces règles.

## Dessiner un tronçon

Vous pouvez dessiner des canalisations sans surface, mais les tampons, le recouvrement et les fils d'eau automatiques en nécessitent une.

1. Appuyez sur {{key:P}}, ou cliquez sur {{ui:Canalisations}} dans le groupe **Conception**.
   L'aide indique : « Canalisations : cliquez les regards de l'amont vers l'aval (cliquez un regard existant pour le raccorder). Entrée termine. »
2. Cliquez à l'emplacement du regard amont. Un regard est placé.
3. Cliquez chaque regard suivant vers l'aval. Pour vous raccorder à un regard existant, cliquez dessus : la barre d'état indique « Raccordé à S3. »
4. Appuyez sur {{key:Enter}}.
   Les canalisations sont dessinées, leurs fils d'eau fixés selon les règles, et la barre d'état indique par exemple « 3 canalisations dessinées, 12 fils d'eau fixés selon les règles ; tous les contrôles sont validés. »

Les nouveaux regards sont nommés S1, S2 … avec un diamètre de 48 in (1200 mm). Les nouvelles canalisations sont nommées P1, P2 … avec un diamètre de 12 in (300 mm). Les diamètres sont exprimés en pouces dans un projet en pieds, et en millimètres dans un projet en mètres.

Terminez avec {{key:Enter}}. Le double-clic fonctionne aussi, mais si vous double-cliquez sur un regard existant pour terminer le tronçon à cet endroit, le raccordement est annulé : cliquez-le une fois, puis appuyez sur {{key:Enter}}.

## Régler vos règles

Sans rien sélectionner, le panneau de droite (**Projet**) comporte un bloc **Réseau de canalisations** :

| Réglage | Valeur de départ | Signification |
|---|---|---|
| Type | Eaux pluviales | {{ui:Eaux pluviales}} ou {{ui:Eaux usées}} ; écrit dans le LandXML |
| Pente minimale | 0.50% | Chaque canalisation doit descendre d'au moins cette valeur |
| Recouvrement minimal | 2 ft (0.6 m) | Du sol à la génératrice supérieure, sur toute la longueur de la canalisation |
| Chute dans les regards | 0.10 ft (0.03 m) | Le fil d'eau de sortie doit être au moins aussi bas que cette valeur sous chaque fil d'eau d'entrée |

**Ces valeurs de départ sont des valeurs provisoires, pas une norme.** Saisissez les valeurs qu'exige votre organisme ou votre projet. Le recouvrement se mesure du sol à la génératrice supérieure (fil d'eau plus diamètre intérieur) ; l'épaisseur de paroi n'est pas comptée. Lorsque des plateformes ou des corridors sont terrassés, la surface terrassée fait office de sol.

## Laisser CivilCraft fixer les fils d'eau

- {{ui:Fixer chaque fil d'eau selon les règles}} (dans le bloc **Réseau de canalisations**) traite toutes les canalisations.
- {{ui:Fixer ses fils d'eau selon les règles}} (avec une canalisation sélectionnée) ne traite que celle-ci.

En remontant vers l'aval, chaque tronçon commence au moins au recouvrement minimal à son regard amont, descend d'au moins la pente minimale, descend d'au moins la chute à travers chaque regard, et s'enfonce davantage là où le terrain le long de la canalisation laisserait un recouvrement inférieur au minimum. Les fils d'eau sont arrondis par défaut à 0.01, jamais par excès. La barre d'état indique « Fils d'eau fixés : recouvrement minimal en tête de chaque tronçon, pente minimale au moins, chute minimale dans chaque regard. », ou nomme ce qu'elle n'a pas pu faire.

## Modifier regards et canalisations

Cliquez sur un regard ou une canalisation avec {{ui:Sélectionner}} pour le voir dans le panneau de droite.

**Regard** : **Nom**, **Tampon**, **Profondeur du puisard**, **Diamètre**, puis **Tampon utilisé**, **Puisard**, **Est** et **Nord**, et les canalisations entrantes et sortantes avec leurs fils d'eau.

- Laissez **Tampon** vide pour le prendre dans la surface ; la case affiche alors la valeur de la surface en gris. Saisissez une valeur pour fixer le tampon.
- Faites glisser la poignée du regard sur le plan pour le déplacer. Ses canalisations suivent ; leurs fils d'eau restent tels quels, donc vérifiez les problèmes ensuite.

**Type** : choisissez l'un des types de regard du réseau (ci-dessous), ou aucun pour un regard rond de son propre diamètre.

**Canalisation** : **Nom**, les regards qu'elle relie, **Diamètre**, **Fil d'eau amont**, **Fil d'eau aval**, puis **Longueur**, **Pente** et **Recouvrement minimal**.

Appuyez sur {{key:Enter}} après chaque valeur.

## Lire et corriger les problèmes

Le bloc **Réseau de canalisations** liste chaque problème (jusqu'à 40) ; cliquez-en un pour sélectionner la canalisation ou le regard. Une canalisation ou un regard sélectionné liste les siens. Si rien n'est sélectionné, il indique « Toutes les canalisations et tous les regards respectent les règles. »

| Message (exemples) | Quoi faire |
|---|---|
| « P2 remonte (-0.40%). » ou « … est plat … » | Inversez les fils d'eau, ou fixez-les selon les règles. |
| « P2 à 0.30% est plus plat que le minimum de 0.50%. » | Abaissez le fil d'eau aval ou relevez l'amont. |
| « P3 a 1.40 de recouvrement sur sa longueur, moins que le minimum de 2. » | Abaissez la canalisation ; fixez ses fils d'eau selon les règles. |
| « Dans S3, P4 part à 245.20, moins de 0.1 sous P3 qui arrive à 245.25. » | Abaissez le fil d'eau supérieur de la canalisation de sortie. |
| « La génératrice supérieure de P1 est au-dessus du tampon de S1. » | La canalisation est trop haute pour le regard. |
| « S2 a 2 canalisations qui en sortent ; un réseau gravitaire devrait avoir une seule sortie par regard. » | Supprimez une canalisation sortante, ou redessinez-la dans le bon sens. |
| « Les canalisations forment une boucle ; l'écoulement doit aboutir à un exutoire. » | Un tronçon a été dessiné en revenant sur lui-même ; supprimez une canalisation. |
| « S5 est hors de la surface et n'a pas de cote de tampon. » | Saisissez un tampon, ou déplacez le regard sur la surface. |
| « P6 passe partiellement hors de la surface ; le recouvrement y est inconnu. » | Étendez la surface, ou admettez que le recouvrement n'y est pas contrôlé. |
| « P7 n'a pas encore de fils d'eau. » | Saisissez-les, ou fixez-les selon les règles. |

Les canalisations et regards en problème sont aussi marqués en rouge sur le plan.

## Types de regard

Un type de regard est un regard construit à partir de ses paramètres : un regard de visite, un avaloir, une boîte de jonction ou une sortie, **rond** (diamètre intérieur) ou **rectangulaire** (largeur et longueur intérieures), avec son **épaisseur de paroi**, sa **dalle de fond**, un **puisard** sous la canalisation la plus basse et un **cadre et tampon** (ouverture ronde ou rectangulaire, hauteur du cadre). Les types appartiennent au réseau, sous **Types de regard** dans les propriétés du projet.

1. Cliquez sur {{ui:Nouveau type de regard}}. La boîte de dialogue dessine le regard en plan et en coupe au fur et à mesure de votre saisie.
2. Cliquez sur {{ui:Ajouter le type}}.
3. Sélectionnez un regard et choisissez le type sous **Type**. Il prend la taille et le puisard du type ; son propre puisard reste modifiable.

Modifiez un type, et chaque regard de ce type suit ses dimensions. Supprimez un type, et ses regards restent des regards ronds de même largeur. Chaque modification est une étape : {{key:Mod+Z}} l'annule.

Un regard rectangulaire est dessiné sur le plan, en DXF, DWG et PDF, et en 3D sous forme de rectangle dont la longueur suit sa canalisation de sortie ; les canalisations partent de sa paroi. Le LandXML l'écrit comme un regard rectangulaire (`RectStruct`) avec son épaisseur de paroi, et relit ces regards comme des types.

### Partager un type via la bibliothèque

{{ui:Enregistrer comme élément de bibliothèque}} écrit le type comme élément de bibliothèque CadCraft (fichier `.json`) : son symbole en plan, un volume 3D jusqu'à une profondeur type, et toutes les dimensions. Téléversez-le dans la bibliothèque pour le partager. {{ui:Ouvrir un élément de bibliothèque}} relit un regard enregistré ainsi dans le réseau, converti dans les unités du projet. Les éléments de bibliothèque qui ne sont pas des regards créés dans CivilCraft sont refusés, avec la raison.

## Supprimer

Sélectionnez une canalisation et appuyez sur {{key:Delete}} pour la supprimer. Supprimer un regard supprime aussi les canalisations qui s'y rattachent. Sur Mac, appuyez sur Fn puis {{key:Delete}}, ou cliquez sur {{ui:Supprimer}}.

## Pas encore disponible

Les débits, les diamètres de canalisation et la ligne de charge hydraulique sont traités dans [Drainage pluvial](topic:storm-drainage). Les catalogues de canalisations, les canalisations non circulaires, les canalisations dans la vue de profil, les canalisations courbes et plus d'un réseau par projet ne sont pas encore disponibles. Voir [Pas encore disponible](topic:not-built-yet).
