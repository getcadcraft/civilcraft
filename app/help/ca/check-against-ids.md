---
title: Comprovar l'exportació IFC amb l'IDS d'un client
summary: Carregar el fitxer .ids que us ha donat un client o una autoritat viària i veure a Problemes cada element exportat que no el compleix.
keywords: ids, especificació de lliurament d'informació, buildingsmart, requisits, lliurament, comprovació, validació, qa, exportació ifc, ifc 4.3, traçat, carretera, contractació
from: 183d9a0e
---

## Què cal fer

Un IDS (Information Delivery Specification, una norma de buildingSMART) és la llista del que ha de contenir un IFC. La contractació pública sovint n'envia un amb l'obra. CivilCraft comprova l'IFC que exporta aquest projecte, en la versió d'IFC que heu triat per a l'exportació, contra aquest IDS, i llista cada element que no arriba.

## Passos

1. Obriu el vostre projecte.
2. Feu clic a {{ui:IFC}} al grup **Exporta** de la barra d'eines. Al diàleg, trieu la versió d'IFC que lliurareu.
3. Feu clic a {{ui:Comprova amb IDS…}}.
4. Feu clic a {{ui:Carrega un fitxer .ids…}} i trieu el fitxer. No es puja res.
5. Llegiu el resultat: cada especificació amb {{ui:Passa}} o {{ui:Falla}} i quants elements s'hi apliquen.
6. Obriu Problemes ({{key:Ctrl+Shift+M}}) i feu clic a una fallada per seleccionar el traçat, la plataforma, la canonada, l'estructura o el volum d'edificació d'on prové.

## Què heu de veure

- Un avís per cada element exportat i cada requisit que no compleix, amb el nom de l'especificació, el que demana l'IDS i el que té l'exportació.
- L'informe de comprovació (a Problemes) comença per l'IDS: el seu títol, la versió, l'autor i els recomptes de cada especificació.

## Bo de saber

- L'IDS es desa al fitxer del projecte, de manera que es torna a comprovar quan obriu el projecte. Carregar-lo o oblidar-lo és un pas que podeu desfer.
- Cada canvi es torna a comprovar una mica més tard. Les superfícies grans triguen més a escriure's, i per això la comprovació espera una mica més entre execucions.
- La comprovació usa el mateix fitxer que escriu l'exportació {{ui:IFC}}, en la versió que hi vau triar per última vegada (IFC 4.3 si encara no n'heu triat cap).
- Els números es comparen en unitats SI: un projecte en peus es converteix primer a metres.

- Els patrons de l'IDS es llegeixen com el valor sencer. Un `^` al principi i un `$` al final també es prenen com "el valor sencer", com volen dir la majoria de fitxers IDS.

## Següent

- [Exportar IFC](topic:ifc)
