---
title: Tableaux : nomenclatures liées aux objets
summary: Tableaux enregistrés avec des lignes issues des plantes, des surfaces plantées, des revêtements, des murs, des marches, des modificateurs de terrain ou de toutes les quantités ; vos propres colonnes et formules, groupes et totaux ; CSV, XLSX et un tableau sur les feuilles, toujours à jour.
keywords: tableau, nomenclature, nomenclature des plantes, nomenclature des aménagements durs, quantités, colonnes, formule, total, somme, comptage, groupe, filtre, csv, xlsx, tableur, tableau sur feuille
from: 11bc1bac
---

{{ui:Tableaux}} (Paysage › Plus) ouvre les tableaux de ce projet. La première fois, la **nomenclature des plantes** et la **nomenclature des aménagements durs et des surfaces** sont créées pour vous. Un tableau est calculé à partir des objets chaque fois qu'il est affiché, écrit ou placé sur une feuille : modifiez un massif et ses comptages changent partout.

- **Lignes issues de** : plantes (une ligne par espèce, cultivar et taille), surfaces plantées, revêtements, murs, marches, modificateurs de terrain (déblai et remblai) ou toutes les quantités.
- **Colonnes** : un champ (`qty`, `area`, `botanical`, ou un nom entre crochets comme `[Net area]`) ou une formule : `+ - * / ^ %`, `&` pour joindre du texte, `= <> < <= > >=`, et `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Une formule qui ne peut pas être calculée affiche `#ERR` (ou `#DIV/0`) dans sa cellule. Les formules sont lues par l'analyseur propre à CadCraft ; rien de ce qu'elles contiennent n'est exécuté comme du code.
- **Total** par colonne (somme, nombre, moyenne, plus petit, plus grand), **Grouper par** (sous-totaux par groupe) et **Seulement les lignes où**.
- {{ui:Enregistrer en CSV}}, {{ui:Enregistrer en XLSX}}, et **Placer ce tableau sur les feuilles** (Feuilles › Tableaux le dessine sous forme de tableau, réparti sur autant de feuilles que nécessaire).

Les étiquettes des plantes et des surfaces utilisent les mêmes noms de champs (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
