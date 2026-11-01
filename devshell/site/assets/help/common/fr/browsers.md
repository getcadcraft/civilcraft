---
title: Navigateurs et ordinateurs
summary: Les navigateurs dans lesquels les applications fonctionnent, ce qui change de l'un à l'autre et ce dont votre ordinateur a besoin.
keywords: chrome, edge, firefox, safari, brave, navigateur, mac, windows, linux, ipad, tablette, webgl, configuration requise, mémoire
from: a11b09b1
---

Les applications fonctionnent dans un navigateur web. Elles travaillent sur votre propre ordinateur : vos fichiers y sont ouverts et ne nous sont jamais envoyés (voir [Où vont vos fichiers](common:your-files)).

## Quel navigateur

Utilisez une version à jour de l'un de ces navigateurs :

| Navigateur | Moteur | Remarques |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Le plus complet : sélection de dossier, enregistrement pour une utilisation hors ligne, ouverture de fichiers. |
| Firefox | Gecko | Fonctionne. L'ouverture d'un dossier entier passe par un sélecteur plus simple. L'enregistrement hors ligne peut ne pas fonctionner dans les fenêtres privées. |
| Safari | WebKit | Fonctionne sur Mac et iPad. L'ouverture d'un dossier entier passe par un sélecteur plus simple. Safari peut supprimer une copie hors ligne que vous n'avez pas utilisée depuis quelques semaines. |

Les trois moteurs conviennent pour le travail de tous les jours. Lorsqu'une application procède autrement dans l'un d'eux, son aide indique les étapes pour votre navigateur.

## Ce qui change d'un navigateur à l'autre

- **Ouvrir un dossier.** Les navigateurs Chromium affichent un vrai sélecteur de dossier et peuvent lire le dossier directement. Firefox et Safari vous demandent de choisir un dossier puis lisent chacun de ses fichiers, ce qui prend plus de temps pour les gros dossiers de projet ; faire glisser le dossier sur l'application fonctionne dans les trois.
- **Enregistrer.** Les applications enregistrent en téléchargeant un fichier. C'est votre navigateur qui décide où vont les téléchargements et s'il vous demande d'abord.

:::chromium
Dans Chrome ou Edge, activez « Demander où enregistrer chaque fichier avant de le télécharger » (dans Paramètres, sous Téléchargements) pour choisir un dossier à chaque fois.
:::

:::firefox
Dans Firefox, ouvrez Paramètres, puis Général, puis Téléchargements, et choisissez « Toujours demander où enregistrer les fichiers » pour choisir un dossier à chaque fois.
:::

:::safari
Dans Safari, ouvrez Réglages, puis Général, et réglez « Emplacement des fichiers téléchargés » sur « Demander à chaque téléchargement » pour choisir un dossier à chaque fois.
:::

## Mac, Windows et Linux

Les applications sont identiques sur tous les ordinateurs. Seul le clavier change : les raccourcis sont écrits automatiquement pour votre ordinateur. Voir [Touches, souris et pavés tactiles](common:keys).

## Tablettes et écrans tactiles

Certaines applications acceptent le toucher (un doigt dessine ou sélectionne, deux doigts pincent pour zoomer et se déplacer en panoramique). L'aide de chaque application dit si c'est le cas. Sur un iPad, utilisez Safari ou Chrome. Un clavier est utile pour les applications qui utilisent des commandes saisies.

## Le plus ancien navigateur et système

Nous l'avons lu dans le code des applications 0.7, sans deviner : chaque fichier a été analysé et chaque fonction du langage qu'il utilise a été recherchée dans les données de compatibilité publiées par les navigateurs. En dessous de ces versions, les applications ne peuvent même pas démarrer, car le navigateur ne comprend pas le code.

| | Plus ancienne version capable de démarrer les applications |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS et iOS 16.4) |

CadCraft Studio embarque son propre moteur web sous Windows ; il lui faut donc Windows 10 ou 11. Sur un Mac, il utilise celui du système ; il lui faut donc macOS 13.3 ou une version plus récente. Paramètres › Mises à jour dans Studio indique ce que fait tourner votre copie.

C'est la plus ancienne version qui *démarre*, lue dans le code. Ce n'est pas une liste de vieux navigateurs dans lesquels nous avons fait tourner les applications : un navigateur plus ancien qui démarre peut donc encore manquer d'une fonction.

## Ce dont votre ordinateur a besoin

Ce sont des minimums prévus pour les applications, pas des exigences mesurées :

- 8 Go de mémoire (16 Go sont recommandés pour les grands modèles fédérés).
- Une puce graphique avec WebGL 2 pour les applications 3D. Si une vue 3D reste vide, vérifiez que l'accélération matérielle est activée dans les paramètres de votre navigateur.
- Un écran d'au moins 1280 pixels de large pour les barres d'outils complètes ; sur les écrans plus petits, elles passent à la ligne.

Les très gros fichiers (grands jeux de plans, grands modèles) consomment beaucoup de mémoire dans un onglet de navigateur. Fermez les autres onglets lourds si une application ralentit.
