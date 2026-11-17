---
title: Exportar el sitio 3D como USD
summary: Escriba la vista 3D del sitio (superficies, líneas, alineaciones, tuberías y puntos de levantamiento) como USD a escala real y con coordenadas reales.
keywords: usd, usda, usdc, usdz, openusd, exportar, 3d, sitio, superficie, alineación, puntos de levantamiento, coordenadas, ensamblaje de escena
from: e7be08ec
---

En la vista 3D, {{ui:USD}} junto a {{ui:GLB}} y {{ui:OBJ}} exporta lo que muestra la vista en formato USD.

1. Abra la vista 3D y elija qué mostrar.
2. Abra {{ui:USD}} y elija {{ui:Texto (.usda)}}, {{ui:Binario (.usdc)}} o {{ui:Paquete (.usdz)}}.

El archivo está a escala real (se quita la exageración vertical), en metros con Z hacia arriba. El sitio se ubica en sus coordenadas de este, norte y elevación del proyecto, y nombra su sistema de coordenadas cuando el proyecto lo tiene. Las superficies, tuberías y estructuras son mallas con sus colores; las curvas de nivel, las líneas de ruptura y las líneas de obra lineal son líneas; cada alineación es una línea propia con su nombre; los puntos de levantamiento conservan sus números.
