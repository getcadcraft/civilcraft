---
title: Modificadors del terreny i cotes en directe
summary: Tot el que modela el terreny projectat en una sola llista ordenada (el posterior guanya on se solapen), desmunt i terraplè per a cada modificador, comprovacions d'unions al tauler Problemes, i cotes puntuals i fletxes de pendent que llegeixen el terreny en directe.
keywords: modificadors del terreny, pila, ordre, terreny projectat, terreny actual, solapament, desmunt i terraplè, unió, mur de contenció, vora de paviment, nivell del llit, replà de graons, cota puntual, alçada puntual, fletxa de pendent, etiqueta de pendent, pendents
from: 3998a5b0
---

El terreny projectat és el terreny actual més els modificadors, en ordre. El terreny actual no es canvia mai.

## La llista

{{ui:Cotes}} › {{ui:Modificadors del terreny…}} llista tots els objectes que modelen el terreny: plataformes, bermes, rases, àrees d'explanació, paviments i camins, àrees plantades amb una cota acabada, i graons i rampes amb la casella **Modela el terreny** marcada (amb les seves cotes inferior i superior). Quan dos se solapen, el **posterior** guanya. Arrossegueu una fila, o useu les fletxes, per canviar l'ordre; el terreny es reconstrueix a l'instant. Cada fila mostra el seu desmunt i terraplè (el que modela després de les de sobre), i sota la llista hi ha el total.

## Comprovacions d'unions

El tauler Problemes llista, amb **vés a**:

- un mur on el costat alt és per sobre del seu cim (terra per sobre del mur), o on el costat baix mostra la sabata;
- una àrea plantada on la cota acabada és per sobre de la vora del paviment amb què toca, o més de 150 mm per sota, que és el valor habitual;
- graons on la part inferior o la superior no coincideixen amb el paviment on arriben;
- dos modificadors que se solapen (el posterior guanya en aquest punt).

Un mur de contenció pot tenir el cim que segueix el costat alt del terreny: la seva alçada es torna a calcular cada cop que canvia el terreny.

## Un mur de contenció que modela el terreny

Seleccioneu un mur de contenció i marqueu **Modela el terreny**. La franja que hi ha sota el mur (tan ampla com el gruix del mur) s'afegeix a la llista com a modificador:

- la vora del **costat alt** es manté a la cota del terreny en aquell punt, estació per estació, de manera que el cim del mur segueix el costat alt (amb el coronament a sobre). Si escriviu una **cota de Cim**, el costat alt es manté a aquesta cota menys el coronament;
- la vora del **costat baix** es manté a la cota **Terreny retingut al costat baix** que escriviu o, si la deixeu buida, a la del terreny en aquell punt;
- el costat alt és el costat on el terreny és més alt en tot el recorregut del mur, de manera que mai no canvia al llarg del mur;
- el terreny més enllà de la franja no canvia, i el terreny actual mai no canvia.

Com qualsevol modificador, es troba a la llista, i un modificador posterior a ell guanya on se solapen. Un mur amb una cota retinguda en un extrem a més de 150 mm del terreny actual en aquell punt rep un avís al tauler Problemes (amb **vés a**). Un mur independent no modela el terreny. La casella és desactivada en fitxers de versions anteriors, de manera que s'obren tal com eren.

## Cotes puntuals i fletxes de pendent

{{ui:Cota puntual}} (un clic) i {{ui:Fletxa de pendent}} (dos clics) llegeixen el terreny cada cop que es dibuixen: si moveu o torneu a nivellar un objecte, les etiquetes el segueixen. Al panell de propietats trieu si una etiqueta llegeix el terreny projectat o el terreny actual; les etiquetes del terreny actual es mostren entre parèntesis. Les fletxes apunten pendent avall i mostren `1:20 (5.0 %)`.
