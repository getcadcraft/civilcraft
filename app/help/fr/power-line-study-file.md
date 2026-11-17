---
title: Fichiers d'étude pour un autre logiciel de lignes (.DON)
summary: Enregistrez une ligne aérienne dans un fichier d'étude .DON, ou lisez les appuis d'un tel fichier pour créer une nouvelle ligne. Non testé avec le logiciel qui les lit.
keywords: don, .don, fichier d'étude, xml, exporter, importer, logiciel de lignes aériennes, pose, canton
from: 1abc4d07
---

Certains logiciels de lignes aériennes conservent une étude dans un fichier `.DON` (texte XML). CivilCraft peut écrire une ligne dans un tel fichier et lire les appuis d'un tel fichier.

:::warning
**Non testé.** Nous avons construit cette fonction à partir d'une liste de noms de champs du format, transmise par un utilisateur, et non à partir d'un vrai fichier ; nous n'avons pas ouvert nos fichiers dans le logiciel qui les lit. Ouvrez le fichier dans ce logiciel et vérifiez chaque valeur avant de vous y fier. Si vous pouvez partager un fichier `.DON` (sans les coordonnées du client), cela nous aidera à corriger.
:::

## Enregistrer un fichier d'étude

1. Donnez un conducteur à la ligne et assurez-vous qu'elle a des résultats (aucun « non calculé » dans ses Propriétés).
2. {{ui:Plus}} › {{ui:Enregistrer un fichier d'étude (.DON)…}}, choisissez la ligne, ajoutez une description et un numéro d'affaire.
3. {{ui:Enregistrer le fichier d'étude}}.

Le fichier contient les appuis de la ligne (coordonnées, terrain, hauteurs, rôles, traverse, appui conservé ou suggéré, charges par cas de charge, fondation), une section par tronçon entre arrêts (conducteur, tension, portée de référence, portées, tension et paramètre de chaînette, tension maximale par cas de charge) et les tableaux de pose. Les longueurs sont en mètres et les efforts en daN ; le texte est écrit en Latin-1, si bien qu'un caractère hors de ce jeu devient `?`.

## Lire un fichier d'étude

{{ui:Plus}} › {{ui:Ouvrir un fichier d'étude (.DON)…}} lit les appuis dans une nouvelle ligne. Le conducteur, les appuis et les traverses sont associés à votre bibliothèque par leur nom ; ce qui n'est pas trouvé reste à choisir dans les Propriétés.
