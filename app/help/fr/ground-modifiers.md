---
title: Modificateurs de terrain et niveaux en direct
summary: Tout ce qui façonne le terrain projeté dans une seule liste ordonnée (en cas de chevauchement, c'est la dernière de la liste qui l'emporte), déblai et remblai par modificateur, contrôles de jonction dans le panneau Problèmes, et cotes de niveau et flèches de pente qui lisent le terrain en direct.
keywords: modificateurs de terrain, pile, ordre, terrain projeté, terrain naturel, chevauchement, déblai et remblai, jonction, mur de soutènement, bord de revêtement, niveau de fond de forme, palier d'escalier, cote de niveau, cote de hauteur, flèche de pente, étiquette de pente, pentes
from: 3998a5b0
---

Terrain projeté = terrain naturel + les modificateurs, dans l'ordre. Le terrain naturel n'est jamais modifié.

## La liste

{{ui:Niveaux}} › {{ui:Modificateurs de terrain…}} liste chaque objet qui façonne le terrain : plateformes, merlons, noues, zones de terrassement, revêtements et cheminements, zones plantées avec un niveau fini, ainsi que les escaliers et rampes dont la case **Façonne le terrain** est cochée (avec leurs niveaux de base et de sommet). Lorsque deux objets se chevauchent, c'est **le dernier** qui l'emporte. Faites glisser une ligne, ou utilisez les flèches, pour changer l'ordre ; le terrain est reconstruit aussitôt. Chaque ligne affiche son déblai et son remblai (ce qu'elle façonne après les lignes situées au-dessus d'elle), avec le total sous la liste.

## Contrôles de jonction

Le panneau Problèmes liste, avec **Aller à** :

- un mur dont le côté haut est au-dessus de son sommet (terre au-dessus du mur), ou dont le côté bas laisse voir sa semelle ;
- une zone plantée dont le niveau fini est au-dessus du bord du revêtement qu'elle rejoint, ou de plus de 150 mm en dessous (valeur courante) ;
- des escaliers dont le pied ou le sommet ne rejoint pas le revêtement sur lequel ils aboutissent ;
- deux modificateurs qui se chevauchent (c'est le dernier qui l'emporte).

Un mur de soutènement peut avoir son sommet qui suit le côté haut du terrain : sa hauteur est recalculée à chaque modification du terrain.

## Un mur de soutènement qui façonne le terrain

Sélectionnez un mur de soutènement et cochez **Façonne le terrain**. La bande située sous le mur (aussi large que l'épaisseur du mur) rejoint la liste comme modificateur :

- l'arête du **côté haut** est maintenue au niveau du terrain à cet endroit, station par station, de sorte que le sommet du mur suit le côté haut (avec le chaperon au-dessus). Saisissez un niveau de **Sommet** et le côté haut est maintenu à ce niveau, moins le chaperon ;
- l'arête du **côté bas** est maintenue au niveau **Terrain maintenu côté bas** que vous saisissez, ou, si ce champ est vide, au niveau du terrain à cet endroit ;
- le côté haut est celui dont le terrain est le plus élevé sur tout le mur, de sorte qu'il ne s'inverse jamais le long du mur ;
- le terrain au-delà de la bande n'est pas modifié, et le terrain naturel ne l'est jamais.

Comme tout modificateur, il figure dans la liste, et un modificateur placé après lui l'emporte en cas de chevauchement. Un mur dont le niveau maintenu à une extrémité s'écarte de plus de 150 mm (valeur courante) du terrain naturel à cet endroit génère un avertissement dans le panneau Problèmes (avec **Aller à**). Un mur isolé ne façonne pas le terrain. La case est décochée dans les fichiers issus de versions antérieures, qui s'ouvrent donc comme ils étaient.

## Cotes de niveau et flèches de pente

{{ui:Cote de niveau}} (un clic) et {{ui:Flèche de pente}} (deux clics) lisent le terrain à chaque fois qu'ils sont tracés : déplacez ou remettez à niveau un objet et les étiquettes suivent. Dans Propriétés, choisissez si une étiquette lit le terrain projeté ou le terrain naturel ; les étiquettes du terrain naturel sont affichées entre crochets. Les flèches pointent vers le bas de la pente et indiquent `1:20 (5.0 %)`.
