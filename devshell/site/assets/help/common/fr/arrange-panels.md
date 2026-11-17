---
title: Disposer les panneaux et utiliser un second écran
summary: Ancrer les panneaux latéraux à gauche, à droite ou en bas, les empiler, les regrouper en onglets, les épingler ou les masquer, les faire flotter au-dessus du dessin, rendre la disposition plus dense, choisir le nombre de lignes de la barre d'outils, ou les déplacer dans leur propre fenêtre sur un autre écran.
keywords: panneaux, ancrer, flottant, déplacer un panneau, glisser, disposition, onglets, groupe d'onglets, empiler, épingler, masquage automatique, masquer un panneau, fermer un panneau, compacte, densité de la disposition, dense, lignes de la barre d'outils, retour à la ligne, 1 ligne, 2 lignes, lignes de barre d'outils, second écran, deux écrans, double écran, plusieurs écrans, fenêtre, fenêtre surgissante, réinitialiser la disposition
from: 49530239
---

Les panneaux à côté du dessin peuvent être déplacés. Placez-les où vous voulez, ou donnez-leur une fenêtre à part sur un second écran pour que le dessin occupe tout le premier.

:::note
Chaque panneau a une barre de titre : une fine barre avec le nom du panneau, un menu {{ui:⋯}}, une épingle et un bouton de fermeture en haut du panneau. Les versions antérieures à 0.7 n'ont que le nom et le menu {{ui:⋯}}.
:::

## Déplacer un panneau dans la fenêtre

1. Faites glisser le panneau par son nom, en haut.
2. Pendant le glissement, des zones délimitées apparaissent à gauche, à droite et en bas du dessin. Relâchez le panneau sur l'une d'elles pour l'ancrer là. La zone survolée s'assombrit.
3. Relâchez-le ailleurs sur le dessin pour le faire flotter.

Les panneaux peuvent partager un même côté : ils s'empilent, et chaque ligne entre deux d'entre eux se fait glisser pour partager l'espace (ligne sélectionnée, les touches fléchées la déplacent, et un double-clic dessus répartit l'espace à parts égales). Faites glisser le bord intérieur d'un côté ancré pour l'élargir ou le réduire ; double-cliquez sur le bord pour le remettre en place.

Un panneau flottant reste au-dessus du dessin. Déplacez-le par son nom, et redimensionnez-le en faisant glisser son coin inférieur droit (ou atteignez le coin avec {{key:Tab}} et utilisez les touches fléchées). Double-cliquez sur son nom pour l'ancrer de nouveau à l'endroit où il était.

:::touch
Faites glisser avec un doigt sur le nom du panneau. Faites glisser le coin inférieur droit d'un panneau flottant avec un doigt pour le redimensionner, et les bords entre panneaux ancrés de la même façon. Pour faire flotter ou ancrer sans glisser, utilisez le menu {{ui:⋯}}.
:::

## Regrouper les panneaux en onglets

Deux panneaux peuvent partager un même cadre et n'en afficher qu'un à la fois. Faites glisser un panneau par son nom sur la barre de titre d'un autre panneau (la barre est délimitée pendant que vous la survolez), puis relâchez : le cadre a désormais un onglet par panneau, dans sa barre de titre. Cliquez sur un onglet pour afficher ce panneau. Avec un onglet sélectionné, {{key:Left}} et {{key:Right}} changent d'onglet, et {{key:Home}} et {{key:End}} vont au premier et au dernier.

Pour sortir un panneau du groupe, choisissez {{ui:Sortir du groupe d'onglets}} dans son menu {{ui:⋯}}, ou faites-le glisser ailleurs. Choisissez {{ui:Mettre en onglet avec}} puis le nom d'un panneau pour les regrouper sans glisser.

## Épingler, masquer et faire revenir

- L'épingle de la barre de titre d'un panneau le rend **masquage automatique** : le panneau quitte son ancrage et devient un petit onglet sur ce bord. Pointez l'onglet, sélectionnez-le ou cliquez dessus, et le panneau glisse par-dessus le dessin ; éloignez-vous (ou appuyez sur {{key:Esc}}) et il revient. Appuyez de nouveau sur l'épingle, ou choisissez {{ui:Désépingler}}, pour l'ancrer définitivement.
- Le bouton de fermeture, ou {{ui:Masquer ce volet}} dans le menu, masque le panneau et referme son ancrage. Un onglet en pointillés sur le bord le fait revenir : cliquez dessus, ou sélectionnez-le et appuyez sur {{key:Enter}}.

## Rendre la disposition plus dense

{{ui:Paramètres}} › {{ui:Général}} › {{ui:Densité de la mise en page}} propose deux choix. {{ui:Confortable}} est la valeur par défaut. {{ui:Compacte}} resserre la hauteur des lignes, les marges des panneaux, les boutons de la barre d'outils et le texte des panneaux de cette application, pour que davantage tienne à l'écran. Ce réglage est conservé pour chaque application. Un écran tactile garde ses grands boutons dans les deux cas, et un téléphone garde sa propre disposition. {{ui:Réinitialiser la disposition}} laisse la densité telle que vous l'avez réglée.

## Choisir le nombre de lignes de la barre d'outils

{{ui:Paramètres}} › {{ui:Général}} › {{ui:Lignes de la barre d'outils}} propose trois choix. {{ui:Retour à la ligne}} est la valeur par défaut : chaque groupe d'outils s'affiche, sur autant de lignes qu'il en faut. {{ui:2 lignes}} garde la barre d'outils sur deux lignes et {{ui:1 ligne}} sur une seule, pour laisser plus de hauteur au dessin ; les groupes qui ne tiennent pas défilent latéralement dans la barre (avec la molette, un glissement à deux doigts, ou {{key:Tab}} jusqu'à un outil). Une barre d'outils qui tient déjà sur deux lignes reste identique avec {{ui:2 lignes}}, car une grille ne ferait que la rendre plus haute. Ce choix est conservé pour chaque application. Un écran tactile et un téléphone gardent leur propre disposition. CadCraft a son propre réglage pour sa barre d'outils, sous {{ui:Paramètres}} › {{ui:CadCraft}}.

## Utiliser le clavier

Le bouton {{ui:⋯}} de chaque panneau ouvre un menu : {{ui:Ancrer à gauche}}, {{ui:Ancrer à droite}}, {{ui:Ancrer en bas}}, {{ui:Flotter au-dessus du dessin}}, {{ui:Épingler au bord}}, {{ui:Masquer ce volet}}, {{ui:Mettre en onglet avec}} un autre panneau, {{ui:Déplacer dans une nouvelle fenêtre}} et {{ui:Le remettre}}. Atteignez le bouton avec {{key:Tab}}, appuyez sur {{key:Enter}}, déplacez-vous avec les touches fléchées et appuyez de nouveau sur {{key:Enter}}. {{key:Esc}} ferme le menu.

## Placer les panneaux sur un second écran

1. Choisissez {{ui:⋯}} sur un panneau, puis {{ui:Déplacer tous les panneaux dans une nouvelle fenêtre}}. Vous pouvez aussi choisir {{ui:Déplacer les panneaux dans une nouvelle fenêtre}} dans {{ui:Paramètres}}.
2. Une petite fenêtre s'ouvre avec les panneaux dedans. Faites-la glisser sur votre autre écran et agrandissez-la comme vous le souhaitez.
3. Continuez de travailler : les panneaux agissent sur le dessin comme avant, et le dessin occupe la fenêtre principale.

Les raccourcis fonctionnent tant que la fenêtre des panneaux est au premier plan : les touches que vous appuyez là, hors saisie dans une zone de texte, vont au dessin. Les questions et boîtes de dialogue de l'application s'ouvrent toujours dans la fenêtre principale ; regardez-y quand l'une apparaît. Le thème et la taille du texte des panneaux suivent la fenêtre principale.

:::chromium
Chrome et Edge peuvent placer la fenêtre sur l'autre écran à votre place. Avec un second écran connecté, choisissez {{ui:Le placer sur mon autre écran}} dans la fenêtre des panneaux (ou {{ui:Placer les panneaux sur mon autre écran}} dans le menu {{ui:⋯}} d'un panneau). Le navigateur demande une seule fois si ce site peut voir vos écrans ; une fois l'autorisation accordée, la fenêtre des panneaux s'ouvre sur cet écran à chaque fois.
:::

:::firefox safari
Faites glisser vous-même la fenêtre des panneaux vers l'autre écran. Elle s'ouvre au même endroit et à la même taille la fois suivante.
:::

## Plusieurs fenêtres de panneaux

Chaque panneau peut avoir sa propre fenêtre : jusqu'à quatre fenêtres de panneaux, par exemple une par écran.

- Dans le menu {{ui:⋯}} d'un panneau, {{ui:Déplacer dans une nouvelle fenêtre}} ouvre une autre fenêtre pour ce panneau, et {{ui:Déplacer vers la fenêtre des panneaux 2}} (et ainsi de suite) le place dans une fenêtre déjà ouverte. La seconde fenêtre s'appelle « panneaux 2 ».
- Faites glisser un panneau par son nom d'une fenêtre à une autre : relâchez-le sur la fenêtre principale pour l'ancrer là (les zones délimitées apparaissent pendant que vous la survolez) ou pour le faire flotter, ou sur une autre fenêtre de panneaux pour le déplacer dedans. Relâchez-le ailleurs et il reste à sa place.
- Une fenêtre de panneaux qui n'a plus aucun panneau se ferme d'elle-même.

Après un rechargement, l'application vous propose de nouveau vos fenêtres de panneaux. Les navigateurs ouvrent une fenêtre par clic, donc choisissez {{ui:Ouvrir la suivante}} une fois pour chaque fenêtre.

## La même chose pour chaque partie d'une disposition

Le ruban, la boîte à outils, les lignes d'outils et la barre d'état peuvent quitter la fenêtre principale pour une fenêtre à part, de la même façon qu'un panneau : ouvrez le menu {{ui:⋯}} de la partie et choisissez {{ui:Déplacer dans une nouvelle fenêtre}} ; {{ui:Le remettre}} (ou la fermeture de la fenêtre) la ramène à sa place. Les touches que vous appuyez dans cette fenêtre atteignent l'application, comme depuis la fenêtre des panneaux. Chaque partie n'a qu'un seul de ces menus.

## Déplacer une boîte de dialogue

Chaque boîte de dialogue peut être déplacée hors du chemin du dessin : appuyez sur sa barre de titre et faites-la glisser. La boîte retient l'endroit où vous l'avez laissée, chacune séparément, et y revient à son ouverture suivante. Double-cliquez sur la barre de titre pour la recentrer.

Au clavier, avec le focus dans la boîte, appuyez sur {{key:Alt}}+{{key:Shift}}+une touche fléchée pour la déplacer de 16 pixels à la fois ; ajoutez {{key:Ctrl}} pour 64. Une boîte qui se retrouve hors de l'écran (après une fenêtre ou un écran plus petit) est ramenée à l'écran.

Sur un téléphone, les boîtes de dialogue restent des feuilles pleine largeur et ne sont pas déplacées.

Dans CadCraft Studio, la boîte de dialogue {{ui:Tracer en PDF}} de CadCraft, que vous pouvez garder ouverte pendant votre travail, a un bouton dans sa barre de titre, {{ui:Ouvrir dans sa propre fenêtre}}. La boîte passe dans une fenêtre à part, que vous pouvez placer sur un autre écran. Fermer la boîte ferme la fenêtre, et fermer la fenêtre ferme la boîte.

## Remettre les panneaux en place

- Choisissez {{ui:Remettre les panneaux}} dans la fenêtre des panneaux, ou fermez-la simplement. Les panneaux retournent à leur emplacement d'origine.
- Fermer ou recharger la fenêtre principale ferme aussi la fenêtre des panneaux. Quand l'application se rouvre, elle indique que vos panneaux étaient dans leur propre fenêtre ; choisissez {{ui:Ouvrir}} pour la faire revenir, ou {{ui:Les garder ici}}.
- {{ui:Paramètres}} › {{ui:Général}} › {{ui:Réinitialiser la disposition}} remet chaque panneau à sa place de départ.

:::tip
Si rien ne s'ouvre quand vous déplacez des panneaux dans une nouvelle fenêtre, le navigateur a bloqué la fenêtre surgissante. L'application le signale et laisse les panneaux à leur place. Autorisez les fenêtres surgissantes pour getcadcraft.com, puis réessayez.
:::

La disposition est conservée pour chaque application dans ce navigateur, avec vos autres réglages.
