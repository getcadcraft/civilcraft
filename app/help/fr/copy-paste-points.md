---
title: Sélectionner, copier et coller des points topographiques
summary: Sélectionnez des points par clic, Maj et un cadre, ou tous à la fois ; copiez, coupez, collez, collez à la même position, dupliquez et supprimez-les avec de nouveaux numéros de point qui n'entrent jamais en conflit ; collez des lignes de points depuis et vers un tableur.
keywords: copier, coller, couper, dupliquer, supprimer des points, sélectionner des points, tout sélectionner, sélection par cadre, fenêtre, presse-papiers, tableur, csv, renuméroter, numéros de point, coller à la même position, cloner, implantation
from: 78a6aea7
---

Les points topographiques peuvent être copiés et collés dans un projet, entre deux projets ouverts dans deux onglets du navigateur, et depuis et vers un tableur. Chaque modification est une étape d'annulation, et la surface se reconstruit aussitôt à partir des nouveaux points.

## Sélectionner des points

Avec {{ui:Sélectionner}} ({{key:V}}) :

- **Cliquez** sur un point pour le sélectionner (et lui seul). Ses numéros s'affichent sous **Propriétés**.
- {{key:Shift}} et **clic** ajoutent un point à la sélection, ou l'en retirent.
- {{key:Shift}} et **glisser** tracent un cadre : les points à l'intérieur sont ajoutés à la sélection. Si vous glissez autour des points, cela devient un lasso ; voir [Sélection au lasso de points topographiques](topic:lasso-selection). Un glissement sans {{key:Shift}} déplace la vue, comme toujours.
- {{key:Mod+A}} (ou {{ui:Plus}} › {{ui:Tout sélectionner (points)}}) sélectionne tous les points.
- {{key:Esc}} (ou {{ui:Plus}} › {{ui:Ne rien sélectionner}}) vide la sélection.

Les points sélectionnés ont un anneau. Avec plusieurs points sélectionnés, **Propriétés** indique leur nombre, leurs numéros, la plage de leurs altitudes et leurs groupes.

## Copier, couper et supprimer

- {{ui:Copier}} ou {{key:Mod+C}} copie les points sélectionnés. CivilCraft conserve la copie et la place aussi dans le presse-papiers du système sous forme de lignes de points, pour la coller directement dans un tableur ou un fichier texte.
- {{ui:Plus}} › {{ui:Couper}} ou {{key:Mod+X}} les copie puis les supprime, en une seule étape.
- {{ui:Plus}} › {{ui:Supprimer}} ou {{key:Delete}} les supprime. {{key:Mod+Z}} les restaure.

Les lignes contiennent : point, N, E, altitude, description (P,N,E,Z,D), séparés par des virgules, avec trois décimales. Pour obtenir l'E avant le N, réglez **Lignes de points** dans [Paramètres de CivilCraft](topic:settings). Une description qu'un tableur prendrait pour une formule (commençant par =, +, - ou @) reçoit une apostrophe devant, pour rester du texte.

## Coller

1. Appuyez sur {{key:Mod+V}} ou cliquez sur {{ui:Coller}}. Les points suivent le pointeur sous forme de petites croix, avec une ligne en pointillés vers leur emplacement d'origine.
2. Cliquez à l'endroit voulu. Le centre des points copiés se place sur le point cliqué.
3. Ou appuyez sur {{key:Enter}} pour les placer à leurs propres coordonnées, ou sur {{key:Esc}} pour annuler.

{{ui:Plus}} › {{ui:Coller à place}} ou {{key:Mod+Shift+V}} colle à leurs propres coordonnées, immédiatement. Les points collés sont ensuite sélectionnés, de sorte que vous pouvez les copier, les déplacer ou les supprimer à nouveau.

:::note
Cliquer sur {{ui:Coller}} dans la barre d'outils lit le presse-papiers du système. La première fois, le navigateur peut demander si CivilCraft peut accéder au presse-papiers. Si vous refusez, le bouton de la barre d'outils ne colle que la copie propre à CivilCraft ; {{key:Mod+V}} colle toujours les lignes d'un tableur sans rien demander.
:::

## Les numéros de point ne se confondent jamais

Deux points ne partagent jamais un numéro. Lors d'un collage :

- Un point collé garde son numéro si aucun point du projet ne le porte. Ainsi, après un **Couper**, les points reviennent avec leurs numéros, et les points copiés depuis un autre projet gardent les leurs lorsqu'ils sont libres.
- Un point collé dont le numéro est pris reçoit un nouveau numéro entier : un de plus que le plus grand numéro utilisé, en comptant vers le haut.
- La barre d'état indique ce qui s'est passé, par exemple « 1 a gardé son numéro ; 9 ont reçu de nouveaux numéros : 10–18 sont devenus 277–285 ».

Dans [Paramètres de CivilCraft](topic:settings), vous pouvez choisir **Toujours de nouveaux numéros**, et un numéro de départ pour les nouveaux, par exemple 5000 pour des points de projet.

:::warning
Les groupes de points qui construisent la surface comme une **ligne de rupture** relient leurs points dans l'ordre des numéros. Les copies collées de points de ligne de rupture (par exemple des relevés FL) reçoivent de nouveaux numéros, plus élevés, et se raccordent à la fin de cette ligne de rupture, éventuellement avec un long saut. Vérifiez le plan après avoir collé de tels points, ou réglez leur groupe sur {{ui:Points}}.
:::

## Dupliquer

{{ui:Plus}} › {{ui:Dupliquer}} ou {{key:Mod+D}} crée une copie des points sélectionnés qui suit le pointeur : cliquez à l'endroit voulu. Les copies reçoivent toujours de nouveaux numéros, et le presse-papiers de CivilCraft reste inchangé.

## Depuis un tableur ou un fichier texte

Sélectionnez des lignes de points dans un tableur (point, N, E, altitude, description) et copiez-les. Dans CivilCraft, appuyez sur {{key:Mod+V}} et cliquez à l'endroit voulu, ou appuyez sur {{key:Mod+Shift+V}} pour les placer à leurs propres coordonnées, ce qui est généralement ce que vous voulez pour de vraies données de levé.

Les lignes sont lues exactement comme un [fichier de points](topic:point-file-formats) : virgules, tabulations ou espaces, avec une ligne d'en-tête s'il y en a une. Sans en-tête, l'ordre des colonnes est donné par **Lignes de points** dans [Paramètres de CivilCraft](topic:settings).

Lorsque les deux sont présents, CivilCraft décide selon le plus récent : les lignes du presse-papiers du système qui diffèrent de la dernière copie de CivilCraft ont été copiées plus tard, elles sont donc collées. Un texte ne contenant aucun point est ignoré, et la copie de CivilCraft est collée à la place.

## Entre projets et onglets

La copie est conservée dans ce navigateur : un second onglet de CivilCraft peut la coller, même après la fermeture du premier. Des points copiés dans un projet en mètres et collés dans un projet en pieds gardent leurs numéros tels quels : rien n'est converti, et la barre d'état le signale.

## Ce qui n'est pas copié

Seuls les points topographiques sont copiés pour l'instant. Les tracés en plan, plateformes, réseaux de canalisations, lignes de rupture et limites ne peuvent pas encore être copiés ni collés. Le collage ne peut pas déplacer des points existants : utilisez {{ui:Couper}} puis collez, ou déplacez un point à la fois ([Modifier un point topographique](topic:edit-points)).
