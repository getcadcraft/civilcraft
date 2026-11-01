---
title: Composer votre propre disposition et enregistrer vos configurations
summary: Choisir quel panneau montre l'explorateur de projet, Propriétés ou le contenu propre au panneau, où va la boîte à outils et ce que contiennent les barres, l'enregistrer comme votre disposition, et conserver des configurations entières sous un nom pour passer de l'une à l'autre.
keywords: disposition, espace de travail, composer, personnaliser, ma disposition, propre disposition, panneaux, éditeurs, explorateur de projet, propriétés, boîte à outils, barre rapide, boîte d'informations, environnement de travail, configuration, profil, enregistrer une configuration, changer de configuration, exporter une configuration, importer une configuration, ccenv
from: 2a71af43
---

Outre les trois dispositions intégrées, vous pouvez en composer une à vous, et enregistrer toute votre configuration sous un nom pour y revenir en une seule étape.

## Composer votre propre disposition

1. Ouvrez {{ui:Paramètres}} (l'engrenage, ou {{key:Mod+,}}), choisissez {{ui:Général}}, puis {{ui:Disposition}}.
2. Choisissez {{ui:Composer votre propre disposition…}}. La boîte de dialogue part de la disposition que vous utilisez actuellement.
3. Donnez-lui un nom, puis choisissez :
   - **Au-dessus du dessin :** la barre d'outils de l'application, un ruban ou rien ; une barre de titre ; une boîte d'informations et les commandes qu'elle contient.
   - **À côté du dessin :** la boîte à outils à gauche, à droite ou pas du tout, avec ou sans {{ui:Mes outils}} ; quel panneau contient les palettes, lequel est au-dessus (l'explorateur de projet ou Propriétés, par exemple), et lesquels sont des onglets en dessous.
   - **La zone de dessin :** des onglets de vue, une barre rapide et une barre de vue avec les commandes que vous cochez, la palette de modification, une barre d'état.
   - **Apparence :** taille, contours des boutons et style des onglets.
4. Choisissez {{ui:Utiliser cette disposition}}. L'application passe aussitôt à celle-ci, et toutes les applications qui ont des dispositions l'utilisent aussi.

Seul ce que cette application possède est proposé. Votre disposition figure sous {{ui:Des modules complémentaires et des fichiers}} ; {{ui:Exporter cette disposition}} l'enregistre dans un fichier que vous pouvez donner à un collègue, et le bouton de suppression la retire. Les panneaux qu'elle remplit s'ancrent, flottent et passent dans leurs propres fenêtres comme dans [Organiser les panneaux](common:arrange-panels).

## Enregistrer votre configuration comme environnement de travail

Un environnement de travail est toute votre configuration pour chaque application de ce navigateur : la disposition, le style de menu et vos touches, le style de la barre d'outils, les panneaux et leurs tailles, et {{ui:Mes outils}}. Le thème et la langue n'en font pas partie.

- **Enregistrer :** saisissez un nom sous {{ui:Environnements de travail}} et choisissez {{ui:Enregistrer ma configuration}}. Enregistrer sous un nom existant remplace cette configuration.
- **Changer :** choisissez une configuration dans la liste et choisissez {{ui:Basculer dessus}}. L'application se recharge avec cette configuration ; si vous avez un travail non enregistré, l'application demande d'abord, comme pour tout rechargement.
- **Partager :** {{ui:Exporter}} enregistre la configuration choisie dans un fichier `.ccenv.json` ; {{ui:Importer une configuration…}} en ajoute une depuis un fichier. Un fichier ne fait jamais que définir ces choix, rien d'autre.
- **Supprimer :** choisissez une configuration et choisissez {{ui:Supprimer}}.

Vous pouvez conserver jusqu'à douze configurations.

Pour essayer d'abord les agencements intégrés, voir [la disposition boîte à outils et boîte d'informations](common:layout-toolbox) et [la disposition ruban et explorateur de projet](common:layout-ribbon).
