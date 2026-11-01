---
title: Disposer les panneaux et utiliser un second écran
summary: Ancrer les panneaux latéraux à gauche, à droite ou en bas, les empiler, les regrouper en onglets, les épingler ou les masquer, les faire flotter au-dessus du dessin, rendre la mise en page plus dense, choisir le nombre de lignes de la barre d'outils, ou les déplacer dans leur propre fenêtre sur un autre écran.
keywords: panneaux, ancrer, flottant, déplacer un panneau, glisser, disposition, onglets, groupe d'onglets, empiler, épingler, masquage automatique, masquer un panneau, fermer un panneau, compacte, densité de la mise en page, dense, lignes de la barre d'outils, retour à la ligne, 1 ligne, 2 lignes, lignes de barre d'outils, second écran, deux écrans, double écran, plusieurs écrans, fenêtre, fenêtre contextuelle, réinitialiser la disposition
from: 32a8dae2
---

Les panneaux situés à côté du dessin peuvent être déplacés. Placez-les où vous le souhaitez, ou donnez-leur une fenêtre propre sur un second écran afin que le dessin occupe tout le premier.

:::note
Chaque panneau possède une barre de titre : une fine barre affichant le nom du panneau, un bouton {{ui:⋯}} de menu, une épingle et un bouton de fermeture en haut du panneau. Les versions antérieures à 0.7 n'ont que le nom et le menu {{ui:⋯}}.
:::

## Déplacer un panneau dans la fenêtre

1. Faites glisser le panneau par son nom en haut.
2. Pendant le glissement, des zones délimitées apparaissent à gauche, à droite et en bas du dessin. Relâchez le panneau sur l'une d'elles pour l'ancrer à cet endroit. La zone survolée s'assombrit.
3. Relâchez-le n'importe où ailleurs sur le dessin pour le faire flotter.

Des panneaux peuvent partager un même côté : ils s'empilent, et chaque ligne séparant deux d'entre eux se fait glisser pour partager l'espace (lorsque la ligne a le focus, les touches fléchées la déplacent, et un double-clic sur celle-ci répartit l'espace à parts égales). Faites glisser le bord intérieur d'un côté ancré pour l'élargir ou le rétrécir ; double-cliquez sur le bord pour le remettre en place.

Un panneau flottant reste au-dessus du dessin. Déplacez-le par son nom, et redimensionnez-le en faisant glisser son coin inférieur droit (ou atteignez le coin avec {{key:Tab}} puis utilisez les touches fléchées). Double-cliquez sur son nom pour l'ancrer de nouveau à son emplacement précédent.

:::touch
Faites glisser avec un doigt sur le nom du panneau. Faites glisser le coin inférieur droit d'un panneau flottant avec un doigt pour le redimensionner, et les bords entre panneaux ancrés de la même manière. Pour faire flotter ou ancrer un panneau sans glisser, utilisez le menu {{ui:⋯}}.
:::

## Regrouper des panneaux en onglets

Deux panneaux peuvent partager un même cadre et n'en afficher qu'un à la fois. Faites glisser un panneau par son nom sur la barre de titre d'un autre panneau (la barre est délimitée pendant que vous la survolez) puis relâchez : le cadre comporte alors un onglet par panneau, dans sa barre de titre. Cliquez sur un onglet pour afficher ce panneau. Lorsqu'un onglet a le focus, {{key:Left}} et {{key:Right}} changent d'onglet, et {{key:Home}} et {{key:End}} mènent au premier et au dernier.

Pour sortir un panneau du groupe, choisissez {{ui:Sortir du groupe d'onglets}} dans son menu {{ui:⋯}}, ou faites-le glisser ailleurs. Choisissez {{ui:Mettre en onglet avec}} puis le nom d'un panneau pour les regrouper sans glisser.

## Épingler, masquer et rétablir

- L'épingle de la barre de titre d'un panneau active le **masquage automatique** : le panneau quitte son ancrage et devient un petit onglet sur ce bord. Pointez l'onglet, donnez-lui le focus ou cliquez dessus : le panneau glisse par-dessus le dessin ; éloignez-vous (ou appuyez sur {{key:Esc}}) et il revient. Appuyez de nouveau sur l'épingle, ou choisissez {{ui:Désépingler}}, pour l'ancrer définitivement.
- Le bouton de fermeture, ou {{ui:Masquer ce volet}} dans le menu, masque le panneau et referme son ancrage. Un onglet en pointillés sur le bord permet de le rétablir : cliquez dessus, ou donnez-lui le focus et appuyez sur {{key:Enter}}.

## Rendre la mise en page plus dense

{{ui:Paramètres}} › {{ui:Général}} › {{ui:Densité de la mise en page}} propose deux choix. {{ui:Confortable}} est la valeur par défaut. {{ui:Compacte}} réduit la hauteur des lignes, les marges des panneaux, les boutons de la barre d'outils et le texte des panneaux de cette application, pour que davantage d'éléments tiennent à l'écran. Ce réglage est conservé pour chaque application. Un écran tactile conserve ses grands boutons dans les deux cas, et un téléphone garde sa propre mise en page. {{ui:Réinitialiser la disposition}} ne modifie pas la densité choisie.

## Choisir le nombre de lignes de la barre d'outils

{{ui:Paramètres}} › {{ui:Général}} › {{ui:Lignes de la barre d'outils}} propose trois choix. {{ui:Retour à la ligne}} est la valeur par défaut : chaque groupe d'outils s'affiche, sur autant de lignes que nécessaire. {{ui:2 lignes}} limite la barre d'outils à deux lignes, et {{ui:1 ligne}} à une seule, pour laisser plus de hauteur au dessin ; les groupes qui ne tiennent pas défilent latéralement dans la barre d'outils (avec la molette de la souris, un glissement à deux doigts, ou {{key:Tab}} jusqu'à un outil). Une barre d'outils qui tient déjà sur deux lignes reste telle quelle avec {{ui:2 lignes}}, car une grille ne ferait que la rendre plus haute. Ce choix est conservé pour chaque application. Un écran tactile et un téléphone conservent leur propre mise en page. CadCraft a son propre réglage pour sa barre d'outils, sous {{ui:Paramètres}} › {{ui:CadCraft}}.

## Utiliser le clavier

Le bouton {{ui:⋯}} de chaque panneau ouvre un menu : {{ui:Ancrer à gauche}}, {{ui:Ancrer à droite}}, {{ui:Ancrer en bas}}, {{ui:Flotter au-dessus du dessin}}, {{ui:Épingler au bord}}, {{ui:Masquer ce volet}}, {{ui:Mettre en onglet avec}} un autre panneau, {{ui:Déplacer dans une nouvelle fenêtre}} et {{ui:Le remettre}}. Atteignez le bouton avec {{key:Tab}}, appuyez sur {{key:Enter}}, déplacez-vous avec les touches fléchées et appuyez de nouveau sur {{key:Enter}}. {{key:Esc}} ferme le menu.

## Placer les panneaux sur un second écran

1. Choisissez {{ui:⋯}} sur un panneau, puis {{ui:Déplacer tous les panneaux dans une nouvelle fenêtre}}. Vous pouvez aussi choisir {{ui:Déplacer les panneaux dans une nouvelle fenêtre}} dans {{ui:Paramètres}}.
2. Une petite fenêtre s'ouvre avec les panneaux. Faites-la glisser sur votre autre écran et agrandissez-la à votre convenance.
3. Continuez à travailler : les panneaux agissent sur le dessin comme auparavant, et le dessin occupe la fenêtre principale.

Les raccourcis continuent de fonctionner lorsque la fenêtre des panneaux est au premier plan : les touches que vous appuyez là, sauf lorsque vous saisissez du texte dans une zone, sont envoyées au dessin. Les questions et boîtes de dialogue posées par l'application s'ouvrent toujours dans la fenêtre principale ; regardez-y lorsqu'une apparaît. Le thème et la taille du texte des panneaux suivent la fenêtre principale.

:::chromium
Chrome et Edge peuvent placer la fenêtre sur l'autre écran à votre place. Lorsqu'un second écran est connecté, choisissez {{ui:Le placer sur mon autre écran}} dans la fenêtre des panneaux (ou {{ui:Placer les panneaux sur mon autre écran}} dans le menu {{ui:⋯}} d'un panneau). Le navigateur demande une seule fois si ce site peut voir vos écrans ; une fois l'autorisation accordée, la fenêtre des panneaux s'ouvre sur cet écran à chaque fois.
:::

:::firefox safari
Faites glisser vous-même la fenêtre des panneaux sur l'autre écran. Elle s'ouvrira à la même place et à la même taille la prochaine fois.
:::

## Plusieurs fenêtres de panneaux

Chaque panneau peut avoir sa propre fenêtre : jusqu'à quatre fenêtres de panneaux, par exemple une par écran.

- Dans le menu {{ui:⋯}} d'un panneau, {{ui:Déplacer dans une nouvelle fenêtre}} ouvre une autre fenêtre pour ce panneau, et {{ui:Déplacer dans la fenêtre de panneaux 2}} (et ainsi de suite) le déplace dans une fenêtre déjà ouverte. La seconde fenêtre s'appelle « panneaux 2 ».
- Faites glisser un panneau par son nom d'une fenêtre à une autre : relâchez-le sur la fenêtre principale pour l'ancrer là (les zones délimitées s'affichent pendant que vous la survolez) ou pour le faire flotter, ou sur une autre fenêtre de panneaux pour le déplacer dedans. Relâchez-le ailleurs et il reste à son emplacement précédent.
- Une fenêtre de panneaux qui ne contient plus aucun panneau se ferme d'elle-même.

Après un rechargement, l'application vous propose de nouveau vos fenêtres de panneaux. Les navigateurs n'ouvrent qu'une fenêtre par clic : choisissez {{ui:Ouvrir la suivante}} une fois pour chaque fenêtre.

## Déplacer une boîte de dialogue

Chaque boîte de dialogue peut être écartée du dessin : appuyez sur sa barre de titre et faites-la glisser. La boîte de dialogue mémorise l'endroit où vous l'avez laissée, chaque boîte séparément, et y revient à sa prochaine ouverture. Double-cliquez sur la barre de titre pour la recentrer.

Au clavier, appuyez sur {{key:Alt}}+{{key:Shift}}+une touche fléchée, la boîte de dialogue ayant le focus, pour la déplacer de 16 pixels à la fois ; ajoutez {{key:Ctrl}} pour 64 pixels. Une boîte de dialogue qui se retrouve hors de l'écran (après une fenêtre ou un écran plus petit) est ramenée à l'intérieur.

Sur téléphone, les boîtes de dialogue restent en feuilles pleine largeur et ne se déplacent pas.

Dans CadCraft Studio, la boîte de dialogue {{ui:Tracer en PDF}} de CadCraft, que vous pouvez garder ouverte pendant votre travail, comporte dans sa barre de titre un bouton {{ui:Ouvrir dans sa propre fenêtre}}. La boîte de dialogue passe dans une fenêtre propre, que vous pouvez placer sur un autre écran. Fermer la boîte de dialogue ferme la fenêtre, et fermer la fenêtre ferme la boîte de dialogue.

## Remettre les panneaux en place

- Choisissez {{ui:Remettre les panneaux}} dans la fenêtre des panneaux, ou fermez-la simplement. Les panneaux retournent à leur emplacement précédent.
- Fermer ou recharger la fenêtre principale ferme aussi la fenêtre des panneaux. Lorsque l'application se rouvre, elle indique que vos panneaux se trouvaient dans leur propre fenêtre ; choisissez {{ui:Ouvrir}} pour rétablir la fenêtre, ou {{ui:Les garder ici}}.
- {{ui:Paramètres}} › {{ui:Général}} › {{ui:Réinitialiser la disposition}} remet chaque panneau à sa place de départ.

:::tip
Si rien ne s'ouvre lorsque vous déplacez des panneaux dans une nouvelle fenêtre, le navigateur a bloqué la fenêtre contextuelle. L'application l'indique et garde les panneaux à leur emplacement. Autorisez les fenêtres contextuelles pour getcadcraft.com, puis réessayez.
:::

La disposition est conservée pour chaque application dans ce navigateur, avec vos autres paramètres.
