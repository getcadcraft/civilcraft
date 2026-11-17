---
title: Concevoir un jardin, de bout en bout
summary: Les dix étapes de l'architecte paysagiste, du relevé au jeu publié, avec ce que fait aujourd'hui l'espace de travail Paysage pour chacune et ce qu'il ne fait pas encore.
keywords: tutoriel, pas à pas, comment faire, conception paysagère, conception de jardin, prise en main, exemple, échantillon, étape par étape, relevé, traits, terrain, plantation, nomenclature, feuilles, publier, un seul projet
from: 87900bf5
---

Une conception paysagère tourne en boucle : relevé, esquisse, traits, terrain, zones, niveaux, plantation, nomenclatures, feuilles, puis retour au début. Voici les dix étapes, avec ce qui existe pour chacune. Lorsqu'une étape présente un manque, celui-ci est signalé sous **Pas encore disponible**, à la fin, et non masqué dans l'étape.

Vous pouvez suivre sur le site d'exemple, ou sur votre propre dessin de relevé. Avec le vôtre, commencez à l'étape 1.

## 1. Importer le relevé

{{ui:Surface}} › {{ui:Traits depuis un dessin…}}, choisissez le dessin de relevé (DWG 2000–2018 ou DXF). Vérifiez les unités, prenez les courbes de niveau, les polylignes 3D et la limite pour la surface, et les blocs de points comme points du relevé. La section **Niveaux du relevé et contrôle** lit les niveaux écrits en texte ou en attribut, et liste ce qui semble incorrect (unités, système de coordonnées, distance à zéro, courbes de niveau plates, niveaux étranges, points doublés) avant que vous n'ajoutiez quoi que ce soit. Voir [Vérifier un dessin de relevé à l'import](topic:survey-check) et [Ouvrir un DWG ou DXF comme traits](topic:open-dwg-dxf). Réglez le système de coordonnées avec {{ui:Système de coordonnées…}}.

## 2. Croquis à la main

Une feuille sur papier, comme un ancien relevé ou un tirage annoté, est importée avec {{ui:Numériser…}} (Démarrer depuis un scan) : elle est placée à l'échelle ou sur des coordonnées connues sous le plan, et peut être tracée en traits. ModelCraft lit une photo de croquis à la main (Fichier › Importer une photo de croquis…). CivilCraft lui-même n'a pas d'outil pour un croquis à la main : placez la feuille sous le plan et dessinez par-dessus.

## 3. Du croquis aux traits

Dessinez les lignes caractéristiques et les contours sur le relevé dans CivilCraft, ou dessinez-les dans le dessin 2D. Paysage › Plus › {{ui:Depuis une ligne}} transforme une ligne en revêtement, zone plantée, mur, marches, ligne caractéristique et plus, en gardant le lien : si vous déplacez la ligne, l'objet la suit. Voir [Objets issus des traits](topic:objects-from-lines). Dans SuperCad Studio, ouvrez le site, le dessin et le modèle du bâtiment dans un seul projet : l'espace de travail **Paysage** réunit les outils de tous, et une ligne choisie dans le dessin 2D peut devenir un objet paysager qui la suit (Ctrl+K, {{ui:Objet paysager depuis la ligne du dessin choisie}}).

## 4. Le terrain projeté

Ouvrez {{ui:Surface}} › {{ui:Plus}} › {{ui:Espace de travail Paysage}}. Construisez le terrain projeté avec {{ui:Plateforme}}, {{ui:Merlon}}, {{ui:Noue}} et les zones de terrassement, avec cotes de niveau et courbes de niveau ; les revêtements, chemins, murs, rampes et marches que vous ajoutez se raccordent à la même surface projetée. Le terrain existant ne change jamais. {{ui:Niveaux}} › {{ui:Modificateurs de terrain…}} liste tout ce qui façonne le terrain dans un seul ordre, avec le déblai et le remblai de chacun. Voir [Terrassement](topic:landscape-grading) et [Modificateurs de terrain et niveaux dynamiques](topic:ground-modifiers).

## 5. Revêtements et zones plantées

{{ui:Aménagements durs}} › {{ui:Revêtement}}, {{ui:Chemin}}, {{ui:Mur}}, {{ui:Bordure}}, {{ui:Rampe}} et {{ui:Marches}}. {{ui:Zones}} dessine une pelouse, un massif, une prairie ou un couvre-sol avec sa composition de couches ; elle se découpe toute seule autour des revêtements, des murs et des marches. {{ui:Massif}} remplit une zone à l'espacement des plantes, à partir d'un mélange de plantes. Voir [Aménagements durs](topic:hardscape), [Zones plantées](topic:planted-areas) et [Plantation](topic:planting).

## 6. Niveaux, pentes et raccords

Sous **Contrôles du terrassement**, cochez **Analyse des pentes** et **Flèches d'écoulement et stagnation**. Si l'eau stagne contre une terrasse, ajoutez une {{ui:Noue}} tout autour. Les propriétés indiquent combien de contremarches les marches demandent et si elles s'ajustent, ainsi que l'endroit où un chemin est plus raide que sa limite. Le panneau Problèmes liste les endroits où les objets se rencontrent mal : un mur trop haut, un massif au-dessus du revêtement, des marches qui ne rejoignent pas leur palier. {{ui:Cote de niveau}} et {{ui:Flèche de pente}} annotent le terrain et se mettent à jour d'elles-mêmes.

## 7. Plantation

Dans **Plantes**, recherchez dans la liste des plantes (quelques centaines d'espèces, ou votre propre liste), choisissez-en une, puis {{ui:Plante}}, {{ui:Massif}} ou {{ui:Haie}}. Réglez la taille et les étiquettes de la plante depuis Plus. Plus › {{ui:Tableau des plantes}} modifie vos propres fiches : cultivars, tailles fournies, densité, notes de spécification. Chaque fiche peut porter votre propre symbole et votre propre modèle 3D (OBJ, STL ou GLB), et Plus › {{ui:Représentation des plantes}} dessine les plantes plus simplement aux échelles réduites. Voir [La liste des plantes](topic:plant-list), [Fiches de plantes](topic:plant-records) et [Représentation des plantes](topic:plant-graphics).

## 8. Quantitatifs et nomenclatures

Plus › {{ui:Tableaux}} : les nomenclatures des plantes et des aménagements durs, et les vôtres, restent liées aux objets ; enregistrez-les en CSV ou XLSX, ou placez-les sur les feuilles (voir [Tableaux](topic:worksheets)). Plus › {{ui:Nomenclature des plantes…}} envoie les quantités à TakeoffCraft. Les quantités des aménagements durs se trouvent dans les propriétés des revêtements, des murs et des marches. L'irrigation a sa propre liste de matériaux : {{ui:Irrigation}} › **Vérifier le système…**. Voir [Irrigation](topic:irrigation).

## 9. Dessins et feuilles

Plus › {{ui:Feuilles de paysage…}} : plans de plantation, de terrassement et d'irrigation, avec les détails. {{ui:Niveaux}} › {{ui:Trait de coupe}} dessine des coupes à travers le terrain, les murs, les compositions, les marches et les plantes. Voir [Feuilles du paysage](topic:landscape-sheets) et [Coupes et jeu à publier](topic:landscape-sections).

## 10. Publier

{{ui:Jeu à publier (.zip)}} dans la boîte de dialogue des feuilles crée un PDF avec une liste des feuilles et un DWG par feuille. Plus › {{ui:Exporter l'IFC du paysage}} transmet à BimCraft les plantes et les aménagements durs. Enregistrez le projet : tout se trouve dans ce seul fichier.

## Modifiez une seule chose : l'escalier

L'intérêt de tout garder dans un seul projet est qu'une modification se répercute partout. Essayez-le avec une volée de marches entre deux terrasses :

1. Dessinez la ligne de la volée comme ligne caractéristique (ou comme ligne du dessin), puis Paysage › Plus › {{ui:Depuis une ligne}} › {{ui:Marches}}. Dans les propriétés des marches, cochez **Modèle le terrain**, et réglez les niveaux bas et haut sur les deux terrasses.
2. Dessinez un massif planté à côté et sous la volée avec {{ui:Zones}}, et du revêtement sur les terrasses. Le massif se découpe autour des marches et du revêtement, et la nomenclature des plantes ne compte que ce qui est planté.
3. Relevez le niveau haut de la volée dans les propriétés. Le terrain projeté, les cotes de niveau, les flèches de pente, ainsi que le déblai et le remblai, changent aussitôt. Si la volée ne rejoint plus la terrasse supérieure, le panneau Problèmes indique de combien.
4. Déplacez la ligne de la volée. Les marches suivent leur ligne dans la même étape d'annulation ; le massif se redécoupe et se recompte, et les tableaux et nomenclatures affichent les nouveaux chiffres.
5. Appuyez une fois sur Ctrl+Z : la ligne, les marches, le terrain et le massif reviennent ensemble.

Voir [Modificateurs de terrain et niveaux dynamiques](topic:ground-modifiers), [Zones plantées](topic:planted-areas) et [Tableaux](topic:worksheets).

## Pas encore disponible

Ces fonctions sont demandées mais ne figurent pas dans cette version :

- Des murs qui modèlent le terrain (ils signalent où ils le rencontrent, et leur sommet peut le suivre).
- La modification de votre propre liste de plantes de la bibliothèque dans l'application (modifiez la liste du projet et enregistrez-la comme fichier de plantes).
- Les textures et les couleurs de vos propres modèles GLB de plantes (la forme est lue ; c'est la couleur de la plante qui est utilisée).

Voir [L'espace de travail Paysage](topic:landscape) pour tous les outils.
