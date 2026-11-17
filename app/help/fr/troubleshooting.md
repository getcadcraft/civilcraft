---
title: Dépannage
summary: Symptômes, causes et solutions aux problèmes rencontrés dans CivilCraft, avec les messages exacts affichés par l'application.
keywords: problèmes, erreurs, ne fonctionne pas, réparer, aide, messages, dépannage, refusé, manquant, incorrect, inversé, courbes de niveau manquantes
from: a9f7dedc
---

Les messages apparaissent dans la barre d'état en bas à droite, dans des encadrés des panneaux gauche et droit, et dans les boîtes de dialogue. Ils sont cités ici tels que l'application les affiche.

## Ouvrir des fichiers

**« Ce fichier dépasse 200 Mo ; CivilCraft n'ouvre pas encore des fichiers aussi volumineux. »**
Divisez le fichier de points, ou allégez les données avant de l'ouvrir.

**« Impossible d'ouvrir site.json : ce n'est pas un fichier de projet CivilCraft. »**
Le fichier se termine par `.json` ou commence par `{`, mais ce n'est pas un projet CivilCraft. Les fichiers de points ne doivent pas commencer par `{`.

**« Impossible d'ouvrir … Ce fichier de projet provient d'une version plus récente de CivilCraft (version 2). »**
Le projet a été enregistré avec une version plus récente. Ouvrez-le là-bas, ou exportez-le en LandXML.

**« Impossible d'ouvrir … Il s'agit de XML mais pas de LandXML (son élément racine est <…>). »**
Le fichier est un autre type de XML. Exportez un LandXML depuis l'autre logiciel.

**« … ne contient ni points, ni surfaces TIN, ni tracés que CivilCraft peut lire. »**
Tout le contenu du fichier est ignoré par CivilCraft (par exemple seulement des surfaces en grille, ou seulement des tracés en spirale). La suite du message indique ce qui s'y trouvait. Voir [LandXML : ce qui est lu et écrit](topic:landxml-reference).

**« L'exemple n'a pas pu être chargé : … »**
{{ui:Ouvrir l'exemple de site}} lit un fichier depuis le site CadCraft. Sans connexion, cela ne fonctionne que si CivilCraft a été enregistré pour une utilisation hors ligne (le bouton de la barre d'application affiche {{ui:Prêt hors ligne}}). Passez en ligne, cliquez sur {{ui:Enregistrer pour le hors ligne}} : il fonctionne ensuite hors ligne. Voir [Hors ligne](common:offline).

**{{ui:Enregistrer pour le hors ligne}} affiche {{ui:Enregistrement impossible}}.**
Certains fichiers n'ont pas été téléchargés. Vérifiez la connexion et cliquez à nouveau sur le bouton.

**{{ui:Enregistrer pour le hors ligne}} affiche {{ui:Hors ligne indisponible}}.**
Cette fenêtre du navigateur ne peut pas conserver de copie hors ligne, généralement parce qu'il s'agit d'une fenêtre privée ou que l'ordinateur est géré. Ouvrez CivilCraft dans une fenêtre normale.

**Hors ligne, l'application ne s'ouvre pas du tout.**
Elle n'a pas été enregistrée pour une utilisation hors ligne dans ce navigateur, ou le navigateur a effacé ses données de site (Safari le fait pour les sites non visités depuis plusieurs semaines). Passez en ligne, ouvrez CivilCraft et cliquez sur {{ui:Enregistrer pour le hors ligne}}.

**La copie hors ligne est une version plus ancienne.**
Cliquez sur {{ui:Prêt hors ligne}}, puis sur {{ui:Enregistrer à nouveau (obtenir la version la plus récente)}} en étant en ligne.

**Un fichier est grisé dans la boîte d'ouverture.**
La boîte ne liste que les fichiers de points, LandXML et de projet d'après leur extension. Faites glisser le fichier sur le plan à la place, ou renommez-le en `.txt`.

## Importer des points

**« Aucun point n'a pu être lu dans ce fichier. »**
Choisissez l'ordre des colonnes à la main dans **Colonnes**. Si rien ne fonctionne, ouvrez le fichier dans un éditeur de texte et vérifiez qu'il contient un point par ligne avec des nombres.

**Le site apparaît en miroir, pivoté ou étiré en une ligne.**
Le nord et l'est sont inversés. Le résumé indiquait « deviné d'après le nombre de colonnes ». Choisissez PENZD au lieu de PNEZD (ou l'inverse) dans **Colonnes**, ou réimportez.

**Des points très éloignés des autres, et le plan dézoomé jusqu'à un point.**
Une ligne contient une faute de frappe dans une coordonnée, ou le fichier mélange plusieurs systèmes de coordonnées. Repérez le point (cliquez dessus pour voir son numéro) et corrigez le fichier.

**Lignes listées sous « Lignes non lues ».**
Voir le tableau dans [Importer des points topographiques](topic:import-points#rows-that-are-not-read).

**Mes anciens points ont disparu.**
L'import d'un fichier de points remplace tous les points et efface l'historique d'annulation. Ouvrez votre projet enregistré pour les récupérer.

## La surface

**« Surface : non construite » avec un cadre rouge.**
Le cadre indique la raison : « Une surface a besoin d'au moins trois points avec altitude. », « Les points sont tous alignés : aucun triangle. », « Aucun point avec altitude. », « La limite ne recouvre pas les points. » ou « Il ne reste aucun triangle à l'intérieur de la limite. » Vérifiez l'ordre des colonnes, les groupes de points (sont-ils {{ui:Écarté}} ?) et la limite.

**Les courbes de niveau coupent droit à travers un fossé ou une crête.**
Cette ligne n'est pas une ligne de rupture. Réglez son groupe sur {{ui:Ligne de rupture}}, ou tracez-la avec l'outil {{ui:Ligne de rupture}}. Voir [Construire et affiner la surface](topic:build-surface).

**Un groupe de lignes de rupture dessine un zigzag.**
Le groupe contient plus d'une ligne, ou ses points ne sont pas numérotés le long de la ligne. Remettez le groupe sur {{ui:Points}} et tracez chaque ligne avec l'outil {{ui:Ligne de rupture}}.

**De longs triangles fins sur le pourtour.**
Tracez une limite ({{key:O}}) ou réglez **Plus longue arête extérieure**.

**Aucune courbe de niveau, bien que la surface soit construite.**
Soit {{ui:Courbes de niveau}} est désactivé sous **Affichage**, soit l'équidistance est si petite qu'il y aurait plus de 2,000 niveaux de courbes. Choisissez une équidistance plus grande.

**Les lignes de rupture ou une limite ne changent rien.**
La surface provient d'un LandXML (« Surface (depuis LandXML) »). Elle est utilisée telle quelle. Cliquez sur {{ui:Reconstruire la surface à partir des points}} pour la construire à partir des points.

**« Il n'y a pas encore de surface : ouvrez d'abord les points topographiques. »**
Les lignes de rupture, la limite et la plateforme nécessitent une surface de terrain existante. Importez d'abord des points.

**« Cliquez sur un point topographique avec une altitude : une ligne de rupture prend les altitudes des points. »**
L'outil {{ui:Ligne de rupture}} ne choisit que des points topographiques. Zoomez et cliquez sur un point (un carré orange indique celui qui sera pris).

## Dessin

**Mon dernier point a disparu lorsque j'ai double-cliqué pour terminer.**
Dans cette version, le double-clic termine le tracé, la plateforme, la ligne de rupture ou la limite, mais supprime le point sur lequel vous avez double-cliqué. Cliquez une fois sur le dernier point et appuyez sur {{key:Enter}}. Utilisez {{key:Mod+Z}} si c'est déjà arrivé, puis redessinez.

**Je ne peux pas terminer un dessin sur une tablette.**
La fin du dessin nécessite {{key:Enter}} ; il n'existe pas encore de bouton à l'écran. Branchez un clavier. Voir [Souris, pavé tactile et écran tactile](topic:keyboard#mouse-trackpad-and-touch).

**Un glissement pour placer un point fait un panoramique.**
Un glissement de plus de quelques pixels fait un panoramique du plan dans tous les outils. Cliquez sans bouger.

**« Un tracé a besoin d'au moins deux points. » / « Une plateforme a besoin d'au moins trois sommets. » / « Un tronçon de canalisation a besoin d'au moins deux ouvrages. »**
Vous avez appuyé sur {{key:Enter}} trop tôt. Le dessin est abandonné ; recommencez.

**Les touches comme A ou G ne font rien.**
Une zone de texte ou une liste du panneau a toujours le focus, donc les lettres y vont. Cliquez une fois sur le plan, puis appuyez sur la touche. Sur Mac, la touche Suppr correspond à Retour arrière pour le navigateur : utilisez Fn et Suppr pour supprimer une sélection.

## Tracés et profils

**« Les courbes aux PI 2 et PI 3 se chevauchent : … Utilisez des rayons plus petits. »**
Deux courbes ont besoin de plus de tangente qu'il n'y en a entre leurs PI. Réduisez un ou les deux rayons dans le tableau des PI, ou éloignez les PI.

**« Le PI 3 fait demi-tour ; il ne peut pas recevoir de courbe. »**
Le tracé revient sur lui-même à ce PI. Déplacez ou supprimez le PI.

**« Ce tracé n'a aucun terrain sous lui pour démarrer. »**
Le tracé est en dehors de la surface. Déplacez-le sur la surface, ou ajoutez des PIV en cliquant avec {{ui:Ajouter des PIV}} activé.

**« La courbe verticale au PIV 3 (L = …) commence avant la fin de la courbe ou du PIV qui la précède. » / « … dépasse le PIV suivant. »**
Raccourcissez la longueur de la courbe ou éloignez les PIV.

**« Il existe déjà un PIV à … »**
Un PIV existe déjà à cette station. Cliquez ailleurs, ou faites glisser le PIV existant.

**La vue de profil est vide : « Dessinez un tracé pour voir son profil. »**
Il n'y a pas de tracé, ou le tracé sélectionné comporte des erreurs.

## Corridors et plateformes

**« Le corridor a besoin d'un profil projet sans erreur. »**
Démarrez un profil projet ({{ui:Commencer depuis le terrain}}) et corrigez les chevauchements de courbes.

**« … les talus sortent de la surface avant de rejoindre le terrain. » / « … les lignes de talus sortent de la surface avant de la rejoindre … »**
Le terrassement atteint le bord de la surface avant de rejoindre le terrain. Rapprochez le projet du bord, ou rapprochez-le du terrain. Une nouvelle plateforme dessinée en partie hors de la surface peut démarrer à l'altitude 0 : saisissez une altitude réelle.

**« Les lignes de raccordement du corridor se croisent … » / « La ligne de raccordement se croise elle-même … »**
Des talus venant de côtés différents se heurtent : courbes serrées, plateformes étroites, déblais profonds ou remblais hauts. Utilisez un rayon plus grand, un profil type plus étroit, une plateforme plus large ou des talus plus raides.

**« Pas encore de volumes : une plateforme doit se terrasser sans problème. »**
Corrigez les problèmes listés dans le cadre rouge au-dessus.

**{{ui:Projet (terrassé)}} est grisé.**
Aucune plateforme ni aucun corridor ne se terrasse encore.

## Canalisations

**« P2 n'a pas encore de fils d'eau. »**
Cliquez sur {{ui:Fixer ses fils d'eau selon les règles}} ou saisissez les fils d'eau.

**« P1 : pas de terrain au S1 pour démarrer. »**
L'ouvrage amont est hors de la surface et n'a pas de tampon. Saisissez-lui un tampon.

**Toutes les canalisations sont signalées après le déplacement d'un ouvrage.**
Déplacer un ouvrage ne change pas les fils d'eau. Cliquez sur {{ui:Fixer chaque fil d'eau selon les règles}}.

Tous les messages du réseau sont expliqués dans [Concevoir un réseau de canalisations gravitaires](topic:pipe-network#read-and-fix-problems).

## Enregistrer et exporter

**« Rien à exporter pour l'instant. » / « Rien à tracer pour l'instant. »**
Le projet est vide. Importez d'abord des points.

**Je ne trouve pas le fichier enregistré.**
Il se trouve dans les téléchargements du navigateur (généralement le dossier Téléchargements). Voir [Fichiers à ouvrir, enregistrer et exporter](topic:files#where-the-files-go).

**L'échelle du PDF est fausse sur papier.**
Imprimez à 100 % ou à taille réelle, et non « ajuster à la page ».

**Des points d'interrogation dans le texte du PDF.**
Les noms ou descriptions utilisent des caractères hors du jeu d'Europe occidentale. Le message d'état les compte. Renommez avec des caractères simples.

**Le tracé est coupé sur les bords.**
L'échelle est trop grande pour la feuille. Choisissez l'échelle marquée « (tient) », une feuille plus grande, ou {{ui:Ce qui est à l'écran}}.

**{{key:Mod+P}} a ouvert la boîte d'impression du navigateur.**
La page n'avait pas le focus. Fermez la boîte, cliquez sur le plan, puis appuyez de nouveau sur {{key:Mod+P}}, ou cliquez sur {{ui:PDF}}.

## L'application elle-même

**L'écran est vide ou la barre d'outils ne fait rien.**
Utilisez une version récente de Chrome, Edge, Firefox ou Safari, et rechargez la page. Voir [Navigateurs](common:browsers).

**L'application est lente avec un gros fichier de points.**
Désactivez {{ui:Triangles}}, {{ui:Libellés de points}} et {{ui:Tranches d'altitude}}, et utilisez une équidistance de courbes plus grande. Les très grandes surfaces prennent un moment à se reconstruire après chaque modification.

**Le navigateur demande « Quitter le site ? »**
Le projet contient des modifications non enregistrées. Restez, enregistrez avec {{key:Mod+S}}, puis quittez.
