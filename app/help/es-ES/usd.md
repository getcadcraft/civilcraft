---
title: Exportar el emplazamiento 3D como USD
summary: Escriba la vista 3D del emplazamiento (superficies, líneas, alineaciones, tuberías y puntos de levantamiento) como USD, a escala real y con coordenadas reales.
keywords: usd, usda, usdc, usdz, openusd, exportar, 3d, emplazamiento, superficie, alineación, puntos de levantamiento, coordenadas, ensamblado de escena
from: e7be08ec
---

En la vista 3D, {{ui:USD}} junto a {{ui:GLB}} y {{ui:OBJ}} escribe lo que muestra la vista como USD.

1. Abra la vista 3D y elija qué mostrar.
2. Abra {{ui:USD}} y elija {{ui:Texto (.usda)}}, {{ui:Binario (.usdc)}} o {{ui:Paquete (.usdz)}}.

El archivo está a escala real (se quita la exageración vertical), en metros y con Z hacia arriba. El emplazamiento se sitúa en sus coordenadas de este, de norte y de cota del proyecto, y nombra su sistema de coordenadas cuando el proyecto tiene uno. Las superficies, las tuberías y las estructuras son mallas con sus colores; las curvas de nivel, las líneas de ruptura y las líneas de corredor son líneas; cada alineación es su propia línea bajo su nombre; y los puntos de levantamiento conservan sus números.
