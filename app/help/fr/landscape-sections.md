---
title: Coupes du paysage et jeu à publier
summary: Traits de coupe qui traversent le terrain existant et projeté, murs avec leurs semelles, compositions de revêtements et de zones plantées, marches et plantes à taille adulte, sur leurs propres feuilles ; un jeu à publier avec une liste des feuilles, un PDF et un DWG par feuille.
keywords: coupe, coupe transversale, élévation, repère de coupe, trait de coupe, publier, jeu de feuilles, liste des feuilles, registre des dessins, jeu PDF, DWG par feuille
from: 7271ac50
---

{{ui:Niveaux}} › {{ui:Trait de coupe}} : cliquez sur le début et la fin. Les coupes sont nommées A, B, C… (renommez-les dans Propriétés). Une coupe dessine, le long de sa ligne :

- le terrain existant (en tirets) et le terrain projeté ;
- les murs avec leurs semelles, là où la ligne les traverse ;
- les compositions de revêtements et de chemins, ainsi que le paillis et la terre végétale des zones plantées (après découpe), suspendus sous la surface finie ;
- les marches en profil ;
- les plantes situées à la distance définie de la ligne, en silhouettes à taille adulte.

Propriétés règle cette distance et une exagération verticale. Dans la boîte de dialogue Feuilles, **Coupes** les place sur leurs propres feuilles, jusqu'à quatre par feuille, chacune à une échelle standard adaptée.

## Le jeu à publier

{{ui:Jeu à publier (.zip)}} dans la boîte de dialogue Feuilles crée, dans un seul .zip :

- un PDF qui s'ouvre sur la **liste des feuilles**, puis sur chaque feuille de paysage, numérotées L-1, L-2… (plantation, terrassement, irrigation, détails, coupes, tableaux) ;
- un **DWG par feuille de plan**, avec les calques de cette feuille (noms `L-*` conservés), et un DWG par dessin de coupe.

Chaque trait de coupe du plan indique sur quelle feuille il se trouve (`A / L-5`) ; le numéro est recalculé à partir du jeu à chaque fois, donc l'ajout, la suppression ou le renommage de coupes renumérote les feuilles.
