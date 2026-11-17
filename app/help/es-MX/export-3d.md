---
title: Exportar el sitio en 3D
summary: Guarde lo que muestra la vista 3D como archivo GLB u OBJ para otros programas 3D, en metros con Y hacia arriba, alrededor de un origen local que el archivo registra.
keywords: glb, gltf, obj, exportación 3D, exportar 3d, exportación de modelo, motor de juegos, visualización, visor 3D, metros, Y arriba, origen, origen local, state plane
from: 07d23992
---

La vista 3D exporta lo que muestra como un modelo 3D que otro programa puede abrir: un visor 3D, un modelador, un motor de juegos o una herramienta de visualización.

## Exportar

1. Abra la vista 3D ({{key:D}}) y elija qué se muestra con {{ui:Mostrar}}. Lo que está oculto no se exporta.
2. Haga clic en {{ui:GLB}} u {{ui:OBJ}} en la barra.
   El archivo se descarga como "*nombre del proyecto*-3d.glb" o "-3d.obj", y la barra de estado indica el origen.

## Qué contienen los archivos

| | GLB | OBJ |
|---|---|---|
| Superficies | Mallas con normales y los colores de banda o de superficie | Mallas con normales (sin colores) |
| Tuberías y estructuras | Mallas redondas; las que tienen problemas en rojo | Mallas redondas |
| Curvas de nivel, líneas de ruptura, alineaciones, marcas de cadenamiento, líneas de obra lineal y de plataforma | Líneas, cada conjunto en su color | Registros de línea (`l`) |
| Puntos topográficos | Puntos | Registros de punto (`p`) |

Cada conjunto conserva su nombre ("Terreno existente", "Tuberías", "Curvas de nivel mayores", etc.), para que pueda ocultarlo o darle estilo en el otro programa.

## Unidades, ejes y origen

- **Metros.** Un proyecto en pies se convierte desde pies de agrimensura de EE. UU. (1 ft = 1200/3937 m).
- **Y hacia arriba**, la convención habitual de estos formatos: el este pasa a +X, la elevación a +Y, y el norte a −Z.
- **Escala real.** La exageración vertical de la vista no se aplica.
- **Un origen local.** Las coordenadas State Plane son millones de pies, demasiado grandes para los números de precisión sencilla que guardan estos formatos, así que el archivo se escribe relativo a un origen cercano: el propio origen del terreno existente para el este y el norte, y su elevación más baja redondeada hacia abajo. El origen, en unidades del proyecto, se registra en el archivo: en un GLB como `extras` en la escena y su nodo superior, en un OBJ como una línea de comentario cerca del inicio (`# origin easting … northing … elevation …`). Para colocar el modelo de nuevo en las coordenadas del proyecto, sume el origen (después de convertir metros de nuevo a pies en un proyecto en pies).

## Aún no implementado

- Exportar la vista exagerada, o exportar en unidades del proyecto en lugar de metros.
- Texturas, un archivo de material para OBJ (.mtl) y propiedades por objeto (los nombres de tuberías y estructuras solo están en CivilCraft).
- Exportar el corredor como sólidos separados, o la vista de perfil en 3D.
