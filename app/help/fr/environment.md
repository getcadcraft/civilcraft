---
title: Ombre, production solaire et confort extérieur
summary: Étudier l'ombre que portent vos masses sur une journée ou une saison, voir son animation, estimer l'électricité que produiraient en une année type les panneaux solaires des toitures et des murs, voir le confort de la rue à côté d'un bâtiment (UTCI), et obtenir une évaluation préliminaire du confort au vent pour les piétons.
keywords: étude d'ombre, ombre, heures d'ensoleillement, animation, solaire, PV, photovoltaïque, panneaux, production, kWh, EPW, fichier météo, UTCI, confort thermique, confort extérieur, stress thermique, vent
from: 96e7af4d
---

La section **Environnement** se trouve sous **Heures d'ensoleillement** dans les **Propriétés** d'une masse. Elle utilise les masses que vous avez dessinées comme bâtiments.

## Charger un fichier météo

Choisissez un fichier météo d'une année type (**.epw**) pour votre ville. Ils sont gratuits sur le site météo d'EnergyPlus et sur climate.onebuilding.org. Le fichier reste dans votre navigateur pendant cette visite. La production solaire et l'étude de confort en ont besoin ; l'étude d'ombre fonctionne sans lui lorsque le projet a un système de coordonnées.

## Étude d'ombre

Choisissez une date (ou cochez **Saison**, puis une dernière date et un pas en jours), ainsi qu'un fuseau horaire, puis cliquez sur **Lancer l'étude d'ombre**. Vous obtenez une carte des heures de soleil, ou d'ombre, sur le sol autour des masses ; un tableau de la part du sol ombragée au fil de la journée ; et une animation de la journée que vous pouvez lire ou parcourir pas à pas. **Enregistrer la carte**, **Enregistrer les images de l'animation** (toutes les images sur une seule image) et **Enregistrer les heures** (CSV) conservent les résultats.

Le sol est considéré comme plat, au niveau de la masse la plus basse. Pour l'ombre sur un terrain en pente, utilisez **Heures d'ensoleillement**, qui lit le relief.

## Production solaire

Réglez le rendement des panneaux, la part de chaque toiture et de chaque mur couverte et les pertes du système, puis cliquez sur **Lancer la production solaire**. Pour chaque toiture et chaque mur, vous obtenez l'électricité qu'un mètre carré de panneau produirait en une année type, la part de celle-ci que prennent les masses voisines, et un total pour chaque masse. Le modèle est décrit en mots simples à côté du bouton : c'est une estimation de planification à partir d'une année type, pas une garantie.

## Confort extérieur

**Lancer l'étude de confort** calcule l'indice universel de confort thermique extérieur (UTCI) pour une personne debout sur un sol dégagé et à côté de la première masse (côtés sud, nord, est et ouest), avec l'ombre de chaque masse. Il indique la part du ciel visible, l'UTCI moyen diurne, et les heures au-dessus de 32 (stress thermique) et au-dessous de 0 (stress par le froid).

## Vent (évaluation préliminaire)

**Lancer l'étude du vent** résout l'écoulement de l'air autour de vos masses une fois pour chaque direction de vent présente dans votre fichier météo (4, 8, 12 ou 16 directions), sur l'environnement que vous choisissez (campagne dégagée, banlieue ou centre-ville), puis additionne le vent horaire de toute l'année. La carte colore le sol selon la classe de confort, du vert (**assis**) jusqu'au rouge (**inconfortable**) en passant par **debout**, **promenade** et **marche** : l'activité dont la vitesse limite (4, 6, 8 et 10 m/s) n'est dépassée que pendant 5 % des heures au plus. Un second tableau donne la classe NEN 8100 (A à E) d'après la part des heures où le vent dépasse 5 m/s. Le facteur de rafale multiplie la moyenne horaire pour donner une rafale effective.

Fonctionnement, en mots simples : un solveur d'écoulement LES (simulation des grandes échelles) par Boltzmann sur réseau (le nôtre, dans la bibliothèque `lib/wind`) calcule l'écoulement dans une boîte autour des bâtiments, avec un profil de vitesse du vent qui croît avec la hauteur selon la rugosité choisie, puis la vitesse à environ 1.5 m au-dessus du sol est comparée à la vitesse en amont à 10 m. **Évaluation préliminaire** est rapide et grossière ; **Standard** utilise plus de cellules et dure beaucoup plus longtemps. Si le panneau indique que la grille est grossière (moins de 10 cellules sur le bâtiment le plus haut), ou que l'écoulement changeait encore, faites moins confiance à la carte.

**Ce que ce n'est pas.** Le solveur a été vérifié sur des écoulements de référence (un canal, une cavité entraînée) et exécuté sur un cube pour vérifier que le sillage et l'accélération aux angles sont corrects. Il n'a **pas** été validé par des mesures en soufflerie sur des bâtiments, de sorte que chaque résultat est étiqueté comme non validé. Ne l'utilisez pas pour une valeur de projet, une charge de vent ou un certificat d'urbanisme : un ingénieur en vent doit mener et confirmer une étude complète. Le sol plat, les murs lisses, le raccourci de rugosité de la station météo et le tableau de seuils sont des simplifications ; les seuils peuvent différer des critères de votre autorité.

## Vent avec OpenFOAM (module complémentaire)

Le moteur de vent intégré ci-dessus est expérimental. Pour un solveur d'écoulement complet, activez le module complémentaire **Vent piéton (OpenFOAM)** dans **Paramètres > Modules complémentaires** (il est désactivé tant que vous ne le faites pas). C'est un logiciel sous licence GPL, distinct du reste de CadCraft, et il n'inclut pas OpenFOAM : vous l'installez vous-même. Puis **Moteur** dans le bloc vent liste OpenFOAM.

Ce que vous configurez, une seule fois :
1. **Installez OpenFOAM** (la série v d'ESI, sur openfoam.com ; le module complémentaire est testé avec la v2512). Sur Ubuntu ou Debian (aussi dans WSL sous Windows) : `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, puis `sudo apt install openfoam2512-default`. Il s'installe sous `/usr/lib/openfoam/openfoam2512`. CadCraft a besoin de `blockMesh`, `snappyHexMesh` et `simpleFoam` pour fonctionner. (Le paquet plus ancien `openfoam` 1912, dans le dépôt officiel d'Ubuntu, fonctionne aussi, mais ses function objects plantent ; le module lit alors lui-même les fichiers de résultats.)
2. **Lancez le programme auxiliaire** depuis le dossier `runner` du module avec Node.js : `node cc-openfoam-runner.mjs serve`. Si OpenFOAM n'est pas dans le chemin de recherche, donnez-lui un petit `runner.json` avec le chemin vers le `etc/bashrc` d'OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) et démarrez-le avec `--config runner.json`. Le programme n'écoute que sur cet ordinateur et affiche un jeton.
3. **Collez le jeton** dans les champs du module, dans le bloc vent (l'adresse reste `http://127.0.0.1:8765`), et appuyez sur **Vérifier le programme auxiliaire**.

Ensuite, **Lancer l'étude du vent** exécute un cas par direction de vent du fichier météo : vos masses deviennent une surface (STL) dans une boîte dimensionnée selon la règle usuelle (5 hauteurs de bâtiment vers l'amont et sur les côtés, 10 à l'aval), maillée avec blockMesh et snappyHexMesh, calculée en RANS stationnaire k-epsilon avec une entrée de couche limite atmosphérique sur la rugosité choisie. La vitesse à 1.5 m est relue puis convertie dans les mêmes classes de Lawson et NEN 8100. Rien ne quitte votre ordinateur.

**Ce qui a été vérifié.** Le texte au-dessus des résultats le dit clairement, et il figure dans chaque CSV enregistré. L'écriture des cas, la lecture des résultats et l'ensemble de la chaîne du module sont testés sans OpenFOAM, et un cube unique a été calculé avec un vrai OpenFOAM à trois tailles de maillage (les chiffres figurent dans les notes du projet). Il n'a **pas** été validé par des mesures en soufflerie sur des bâtiments. C'est une lecture d'évaluation préliminaire, pas une valeur de projet ni un certificat. Le k-epsilon standard surestime la turbulence devant les bâtiments, le sol est plat, les murs sont lisses et il n'y a ni relief ni végétation.
