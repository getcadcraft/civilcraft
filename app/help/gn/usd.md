---
title: Exportar el sitio 3D como USD
summary: Escribir la vista 3D del sitio (superficies, líneas, trazados, caños y puntos de relevamiento) como USD a escala real y con coordenadas reales.
keywords: usd, usda, usdc, usdz, openusd, exportar, 3d, sitio, superficie, trazado, puntos de relevamiento, coordenadas, armado de escena
from: e7be08ec
---

En la vista 3D, {{ui:USD}} junto a {{ui:GLB}} y {{ui:OBJ}} escribe lo que muestra la vista como USD.

1. Abrí la vista 3D y elegí qué mostrar.
2. Abrí {{ui:USD}} y elegí {{ui:Text (.usda)}}, {{ui:Binary (.usdc)}} o {{ui:Package (.usdz)}}.

El archivo está a escala real (la exageración vertical se quita otra vez), en metros con Z hacia arriba. El sitio se ubica en sus este, norte y cotas del proyecto, y declara su sistema de coordenadas cuando el proyecto lo tiene. Las superficies, los caños y las estructuras son mallas con sus colores; las curvas de nivel, las líneas de quiebre y las líneas de corredor son líneas; cada trazado es su propia línea bajo su nombre; los puntos de relevamiento conservan sus números.
