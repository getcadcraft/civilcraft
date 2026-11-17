---
title: Edita un punt topogràfic
summary: Canvia el número, les coordenades, la cota o la descripció d'un punt, o arrossega'l a un nou lloc del plànol.
keywords: edita punt, mou punt, canvia cota, renumera, número de punt, descripció, arrossega, nord, est, fixa un punt, errada
from: 375ae2e9
---

Un tir malament, una alçada de mira errònia, una descripció escrita malament: corregiu el punt i la superfície el segueix.

## Canvia els valors d'un punt

1. Amb {{ui:Selecciona}}, feu clic al punt del plànol. **Propietats** mostra el seu número, l'est, el nord, la cota i la descripció en caselles.
2. Escriviu el nou valor i premeu {{key:Enter}} (o feu clic fora). Deixeu buida la casella **Cota** per a un punt sense cota.
3. La superfície, les corbes de nivell i tot el que se'n deriva s'actualitzen de cop.

Cada canvi és un sol pas: {{key:Mod+Z}} el desfà i {{key:Mod+Y}} el refà. Un valor que CivilCraft no pot fer servir (un número que ja té un altre punt, lletres en una coordenada) es rebutja: la casella es ressalta i la barra d'estat diu per què.

Un codi de descripció nou crea un grup de punts nou, igual que ho fa una importació (vegeu [Construeix una superfície](topic:build-surface)).

## Mou un punt al plànol

1. Seleccioneu el punt (apareix un anell).
2. Arrossegueu l'anell. La barra d'estat mostra l'est i el nord on quedarà.
3. Deixeu anar per moure'l; la seva cota es manté. Premeu {{key:Esc}} abans de deixar anar per tornar-lo al seu lloc.

## Les línies de ruptura segueixen el punt

Una línia de ruptura dibuixada amb l'eina {{ui:Línia de ruptura}} copia els punts per on passa. Quan moveu un punt o en canvieu la cota, els vèrtexs de la línia de ruptura en aquell punt es mouen amb ell, en el mateix pas. Els grups de línies de ruptura creats a partir de descripcions es reconstrueixen sempre a partir dels punts.

:::note
Una superfície llegida d'un fitxer LandXML conserva els seus propis triangles: les edicions de punts només la canvien després de {{ui:Reconstrueix la superfície a partir dels punts}}.
:::
