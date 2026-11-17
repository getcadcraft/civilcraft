---
title: Câbles souterrains
summary: Tracés de câbles en tranchée entre supports et équipements, recouvrement et croisements, manchons selon la longueur du touret, et quantités de tranchée et de câbles.
keywords: câble souterrain, tracé de câble, tranchée, fourreau, recouvrement, croisement, croisement de canalisation, manchon, touret, armoire, transformateur, source, chute de tension
from: adfd2717
---

## Dessiner un tracé de câble

1. Placez d'abord l'équipement si le câble se termine sur une armoire, un transformateur ou un manchon : {{ui:Équipement}}, puis cliquez.
2. Cliquez sur {{ui:Câble}} puis cliquez sur le tracé ; commencez et terminez sur un support ou un équipement pour vous y raccorder. {{key:Enter}} termine.

Dans Propriétés, choisissez le **Câble**, le **Type de tranchée**, le nombre de **câbles côte à côte**, et la **réserve** (%). Le tracé affiche sa longueur, son point de départ et d'arrivée, et le courant qu'il transporte.

## Ce qui est vérifié

- **Recouvrement** : le dessus du câble sous le terrain le long du tracé, comparé au recouvrement du type de tranchée (ou au recouvrement minimal du jeu de règles).
- **Croisements** : lorsque le tracé croise une canalisation CivilCraft ou un autre câble, l'écart entre eux est comparé à une règle de dégagement : le **Dégagement de croisement** propre au tracé (dans ses Propriétés) lorsque vous en choisissez un, sinon la règle **Croisements souterrains** du jeu de règles (les jeux d'exemple utilisent *Croisement souterrain*, 0.3 m), sinon l'écart du type de tranchée avec les autres réseaux. Deux câbles qui se croisent conservent le plus grand des deux. Une ligne aérienne croisée est listée à titre d'information, et le câble apparaît dans le profil de cette ligne.
- **Manchons** : un par longueur de touret de câble (réserve comprise), lorsque l'élément de câble indique une longueur de touret.

## Équipement

Un équipement a un élément de bibliothèque, une **charge** (kW) avec son **facteur de puissance**, et peut être **une source** : le réseau y est alimenté. La tension d'une source vient de son élément de bibliothèque, ou sinon de la ligne ou du câble qu'elle alimente.

## Quantités

{{ui:Plus}} › {{ui:Quantités…}} compte le câble (longueur du tracé × (1 + réserve) × câbles côte à côte + la remontée à chaque extrémité), la tranchée par type, les volumes de déblai, de lit de pose et de remblai, les fourreaux et manchons, avec le conducteur, les supports et les équipements des lignes aériennes.
