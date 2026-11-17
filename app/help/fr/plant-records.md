---
title: Fiches de plantes, cultivars et calibres fournis
summary: La liste de plantes propre à votre projet sous forme de tableau : cultivars, calibres fournis (contenant, motte, circonférence, tige libre), densité, notes de spécification, import et export CSV ; chaque plante placée indique un calibre ; symboles de plantes selon l'échelle, vos propres symboles et modèles 3D.
keywords: tableau des plantes, base de données de plantes, cultivar, variété, calibre fourni, contenant, motte, racines nues, circonférence, tige libre, densité, plantes par mètre carré, spécification, notes de spécification, symbole de plante, bloc, symbole propre, plante 3D, niveau de détail, échelle
from: 12251beb
---

Ouvrez {{ui:Tableau des plantes}} depuis le menu {{ui:Plus}} du groupe Paysage, ou depuis la section Plantes. Chaque ligne est une fiche de plante de la liste propre à ce projet (une fiche de la liste de plantes y est copiée lorsque vous l'ajoutez). Chaque modification est vérifiée comme un fichier importé, et constitue une seule étape d'annulation.

## Les colonnes

- **Nom botanique**, **Nom courant**, **Type**, **Hauteur** et **Étalement** à maturité (mètres).
- **Espacement** (de centre à centre) ou **Densité** (plantes par m²). Un massif fait d'une fiche avec une densité et sans espacement est rempli à cette densité, selon son propre motif (triangulaire ou carré).
- **Calibres fournis** : une entrée par calibre, séparées par `;`. Chaque entrée comporte un identifiant, un genre (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) puis l'un des éléments suivants : un volume `10L`, une hauteur `h0.6`, un étalement `s0.4`, une circonférence `g14-16` (cm), une tige libre `st1.8`. Exemple : `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Cultivars** : noms séparés par `;`. Un cultivar conserve ses propres calibres et remarques lorsque le fichier importé les contenait.
- **Notes de spécification**.

{{ui:Dupliquer}} copie une ligne sous une nouvelle clé ; {{ui:Enregistrer en CSV}} et {{ui:Enregistrer comme fichier de plantes}} écrivent la liste (les lignes CSV des cultivars se placent sous leur espèce, avec `cultivar_of`). Importer un CSV ou un fichier de plantes le fusionne.

## Votre liste de plantes de la bibliothèque

Connectez-vous à votre compte CadCraft (Paramètres, Vos modules complémentaires, Se connecter) et le tableau des plantes peut utiliser la liste que vous conservez dans la bibliothèque :

- {{ui:Depuis ma liste de la bibliothèque}} importe vos propres éléments de plante (y compris ceux qui attendent encore une validation). Une plante déjà présente ici est mise à jour depuis la bibliothèque ; les cultivars, calibres fournis, densité et spécification que vous avez ajoutés ici sont conservés.
- {{ui:Enregistrer comme liste de plantes}} enregistre chaque ligne comme élément de plante de votre bibliothèque, un élément par espèce : une nouvelle plante devient un nouvel élément, une plante modifiée devient une nouvelle version, une plante inchangée n'est pas touchée. Cochez d'abord la case : l'enregistrement met les plantes à disposition du public sous CC0. Un premier envoi public d'une personne pas encore reconnue de confiance est vérifié par une personne avant d'apparaître, comme tout envoi.

La bibliothèque conserve la fiche de plante de base. Les cultivars, calibres fournis, densité et notes de spécification restent dans le projet et dans le fichier de plantes ({{ui:Enregistrer comme fichier de plantes}}) ; la boîte de dialogue indique à chaque enregistrement combien de lignes cela concerne.

## Une plante placée indique un calibre

Sélectionnez une plante, une haie, ou une ligne de mélange d'un massif ou d'une zone plantée : lorsque la fiche a des cultivars ou des calibres fournis, {{ui:Cultivar et calibre}} en choisit un. La nomenclature compte alors par espèce, cultivar et calibre, et une étiquette peut les afficher : `{botanical} '{cultivar}' {size}` ou `{full}`.

## Symboles des plantes selon l'échelle

{{ui:Représentation des plantes}} (Paysage › Plus) définit la façon dont les plantes sont dessinées en plan : **automatique** (plus grossier que 1:500, un cercle à l'étalement ; entre 1:200 et 1:500, un contour avec son centre ; plus fin, le symbole détaillé ; les deux échelles peuvent être modifiées) ou un seul niveau pour toutes les échelles. La boîte de dialogue Feuilles a son propre **Détail des plantes en plan** pour cet ensemble.

Sur une fiche de la section Plantes, {{ui:Symbole propre…}} lit un SVG, ou un bloc d'un dessin DXF/DWG, et le dessine à l'étalement de la plante au niveau détaillé. {{ui:Modèle 3D propre…}} lit un OBJ, STL ou GLB ; dans Représentation des plantes, choisissez **Modèle propre de chaque fiche** pour le voir en 3D. Les fichiers sont limités (512 KB de SVG, 2000 formes, 50 000 triangles) et conservés dans le projet. Les transformations SVG ne sont pas appliquées (vous êtes averti lorsqu'un fichier en contient). Voir [Représentation des plantes, vos propres symboles et plantes en 3D](topic:plant-graphics) pour les niveaux, les limites et ce que peut contenir un GLB.
