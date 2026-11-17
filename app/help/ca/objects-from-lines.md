---
title: Objectes a partir de línies, vinculats
summary: Feu un paviment, una zona plantada, un parterre, un seto, un camí, un mur, una vorada, graons, una rampa, una plataforma, una rigola o una línia característica a partir d'una línia; segueix la línia quan es mou, fins que trenqueu l'enllaç.
keywords: a partir d'una línia, línies de dibuix, DWG, DXF, enllaç, enllaçat, seguir, regenerar, trencar enllaç, línia característica, línia característica des de línies de dibuix, capa importada, contorn, SuperCad Studio, línia de dibuix
from: eb67a0c6
---

{{ui:Des d'una línia}} (Paisatge › {{ui:Més}}): feu clic a una línia característica, o a una línia o contorn d'una capa DWG/DXF importada. Una línia tancada pot fer un paviment, una gespa, un parterre plantat, un prat, una cobertura vegetal, un parterre o una plataforma; una línia oberta, un camí, un mur, una vorada, graons (el seu primer i darrer punt), una rampa, un seto o una rigola. Qualsevol dels dos tipus pot fer una **línia característica**, excepte una línia característica en si mateixa.

## Una línia característica a partir d'una línia

Una línia característica feta a partir d'una línia pren els seus punts, tancada si la línia ho era. Les seves cotes es fixen sobre el terreny existent (0 si encara no n'hi ha), i el seu ús és **Desactivat**: no modifica cap terreny fins que trieu un ús i en fixeu les cotes a les seves Propietats. Quan la línia es mou, una línia característica amb el mateix nombre de punts manté cada cota que heu fixat; quan la línia guanya o perd punts, les cotes es tornen a fixar sobre el terreny. Vegeu [Línies característiques](topic:feature-lines).

El nou objecte manté un **enllaç** a la seva línia. Quan la línia es mou (arrossegueu els seus punts, o el dibuix es mou o es torna a llegir), l'objecte pren la nova forma en el mateix pas de desfer, i a través dels modificadors de terreny el terreny projectat la segueix. Propietats indica a què està enllaçat; {{ui:Trenca l'enllaç}} el deixa lliure.

Les línies es comproven primer: una línia necessita almenys 2 punts (3 per a un contorn), com a màxim 5000, nombres reals, un contorn ha d'estar tancat i no es pot creuar a si mateix. Una línia que falla no s'usa: l'objecte es queda com estava i el panell Problemes n'indica el motiu. Si la línia s'elimina, l'objecte es queda i el panell Problemes ho fa constar.

## A SuperCad Studio

Obriu el lloc i el dibuix 2D en el mateix projecte. Trieu una línia o una polilínia al dibuix 2D, premeu Ctrl+K i executeu {{ui:Objecte de paisatge des de la línia triada del dibuix}}: CivilCraft pregunta què fer, com s'ha descrit, i l'objecte es queda enllaçat a aquesta línia del dibuix. Després de canviar línies al dibuix, Ctrl+K {{ui:Actualitza el paisatge des del dibuix}} fa que els objectes en segueixin, un pas de desfer per a cada línia. El fitxer d'enllaços del projecte registra quin objecte segueix quina línia. L'ajuda de SuperCad Studio té un tema sobre Paisatge.
