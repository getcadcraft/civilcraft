---
title: Exportar el lloc 3D en USD
summary: Escriure la vista 3D del lloc (superfícies, línies, traçats, canonades i punts topogràfics) en USD a escala real i amb coordenades reals.
keywords: usd, usda, usdc, usdz, openusd, exportar, 3d, lloc, superfície, traçat, punts topogràfics, coordenades, muntatge de l'escena
from: e7be08ec
---

A la vista 3D, {{ui:USD}} al costat de {{ui:GLB}} i {{ui:OBJ}} escriu el que mostra la vista en USD.

1. Obriu la vista 3D i trieu què voleu mostrar.
2. Obriu {{ui:USD}} i trieu {{ui:Text (.usda)}}, {{ui:Binari (.usdc)}} o {{ui:Paquet (.usdz)}}.

El fitxer és a escala real (es treu l'exageració vertical), en metres amb Z cap amunt. El lloc es col·loca a les seves coordenades est, nord i cotes del projecte, i en fa constar el sistema de coordenades quan el projecte n'en té un. Les superfícies, les canonades i les estructures són malles amb els seus colors; les corbes de nivell, les línies de ruptura i les línies de corredor són línies; cada traçat és la seva pròpia línia sota el seu nom; els punts topogràfics conserven els seus números.
