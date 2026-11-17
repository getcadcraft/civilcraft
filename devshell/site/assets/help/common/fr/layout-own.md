---
title: Composer votre propre disposition et enregistrer vos configurations
summary: Choisissez le panneau qui affiche l'explorateur de projet, Propriétés ou le contenu propre du panneau, l'emplacement de la boîte à outils et ce que contiennent les barres ; enregistrez le tout comme votre propre disposition, et gardez des configurations complètes sous un nom pour passer de l'une à l'autre.
keywords: disposition, espace de travail, composer, personnaliser, ma disposition, disposition personnelle, panneaux, éditeurs, explorateur de projet, propriétés, boîte à outils, barre rapide, boîte d'informations, environnement de travail, configuration, profil, enregistrer une configuration, basculer de configuration, exporter une configuration, importer une configuration, ccenv
from: 6af528e0
---

En plus des trois dispositions intégrées, vous pouvez en composer une à votre goût, et enregistrer toute votre configuration sous un nom pour y revenir en une seule étape.

## Composer votre propre disposition

1. Ouvrez {{ui:Paramètres}} (l'engrenage, ou {{key:Mod+,}}), choisissez {{ui:Général}}, puis {{ui:Disposition}}.
2. Choisissez {{ui:Composer votre propre disposition…}}. La boîte de dialogue part de la disposition que vous utilisez actuellement.
3. Donnez-lui un nom, puis choisissez :
   - **Au-dessus du dessin :** la barre d'outils de l'application, un ruban ou aucun des deux ; une barre de titre ; une boîte d'informations et les commandes qu'elle contient.
   - **À côté du dessin :** la boîte à outils à gauche, à droite ou nulle part, avec ou sans {{ui:Mes outils}} ; le panneau qui contient les palettes, celui qui est au-dessus (l'explorateur de projet ou Propriétés, par exemple), et ceux qui sont en onglets dessous.
   - **La zone de dessin :** les onglets de vues, une barre rapide et une barre de vue avec les commandes que vous cochez, la palette d'édition, une barre d'état.
   - **Apparence :** taille, contours des boutons et style des onglets.
4. Choisissez {{ui:Utiliser cette disposition}}. L'application passe aussitôt dessus, et toutes les applications qui ont des dispositions l'utilisent aussi.

Seuls les éléments proposés par cette application sont offerts. Votre disposition figure sous {{ui:Des modules complémentaires et des fichiers}} ; {{ui:Exporter cette disposition}} l'enregistre dans un fichier que vous pouvez donner à un collègue, et le bouton de retrait la supprime. Les panneaux qu'elle remplit s'ancrent, flottent et se déplacent vers leur propre fenêtre, comme dans [Disposer les panneaux](common:arrange-panels).

## Enregistrer votre configuration comme environnement de travail

Un environnement de travail est toute votre configuration pour chaque application de ce navigateur : la disposition, le style de menu et vos raccourcis, le style de la barre d'outils, les panneaux et leurs tailles, et {{ui:Mes outils}}. Le thème et la langue n'en font pas partie.

- **Enregistrer :** saisissez un nom sous {{ui:Environnements de travail}} et choisissez {{ui:Enregistrer ma configuration}}. Enregistrer sous un nom existant remplace cette configuration.
- **Basculer :** choisissez une configuration dans la liste et choisissez {{ui:Basculer dessus}}. L'application se recharge dans cette configuration ; si vous avez un travail non enregistré, l'application le demande d'abord, comme pour tout rechargement.
- **Partager :** {{ui:Exporter}} enregistre la configuration choisie dans un fichier `.ccenv.json` ; {{ui:Importer une configuration…}} en ajoute une à partir d'un fichier. Un fichier ne règle que ces choix, rien d'autre.
- **Retirer :** choisissez une configuration, puis {{ui:Retirer}}.

Vous pouvez conserver jusqu'à douze configurations.

Pour modifier une disposition sans ouvrir la boîte de dialogue (faire glisser un bloc, faire un clic droit sur un outil), voir [Modifier une disposition à l'écran](common:layout-edit). Pour essayer d'abord les dispositions intégrées, voir [la disposition boîte à outils et boîte d'informations](common:layout-toolbox), [la disposition ruban et explorateur de projet](common:layout-ribbon) et [la disposition Dessin](common:layout-drafting).
