---
title: Exportar o terreo en 3D
summary: Gardar o que mostra a vista 3D como ficheiro GLB ou OBJ para outros programas 3D, en metros con Y cara arriba, arredor dunha orixe local que o ficheiro rexistra.
keywords: glb, gltf, obj, exportación 3D, exportar 3d, exportación de modelos, motor de xogos, visualización, visor 3D, metros, y cara arriba, orixe, orixe local, state plane
from: 07d23992
---

A vista 3D exporta o que mostra como modelo 3D que outro programa pode abrir: un visor 3D, un modelador, un motor de xogos ou unha ferramenta de visualización.

## Exportar

1. Abra a vista 3D ({{key:D}}) e escolla o que se mostra con {{ui:Mostrar}}. O que está oculto non se exporta.
2. Prema {{ui:GLB}} ou {{ui:OBJ}} na barra.
   O ficheiro descárgase como "*nome do proxecto*-3d.glb" ou "-3d.obj", e a barra de estado indica a orixe.

## Que contén cada ficheiro

| | GLB | OBJ |
|---|---|---|
| Superficies | Mallas con normais e as cores das bandas ou superficies | Mallas con normais (sen cores) |
| Tubaxes e estruturas | Mallas redondas, as problemáticas en vermello | Mallas redondas |
| Curvas de nivel, liñas de ruptura, trazados, marcas, liñas de corredor e de plataforma | Liñas, cada conxunto na súa cor | Rexistros de liña (`l`) |
| Puntos de levantamento | Puntos | Rexistros de punto (`p`) |

Cada conxunto conserva o seu nome ("Terreo existente", "Tubaxes", "Curvas de nivel principais" e así), así que pode ocultalo ou darlle estilo no outro programa.

## Unidades, eixos e orixe

- **Metros.** Un proxecto en pés convértese desde pés topográficos dos EUA (1 ft = 1200/3937 m).
- **Y cara arriba**, a convención habitual para estes formatos: o este pasa a +X, a cota a +Y, e o norte a −Z.
- **Escala real.** A exaxeración vertical da vista non se aplica.
- **Unha orixe local.** As coordenadas state plane son millóns de pés, demasiado grandes para os números de precisión simple que gardan estes formatos, así que o ficheiro escríbese en relación cunha orixe próxima: a orixe propia do terreo existente para o este e o norte, e a súa cota máis baixa redondeada cara abaixo. A orixe, en unidades do proxecto, rexístrase no ficheiro: nun GLB como `extras` na escena e no seu nodo superior, nun OBJ como liña de comentario preto do inicio (`# origin easting … northing … elevation …`). Para colocar o modelo de novo nas coordenadas do proxecto, sume a orixe (despois de converter metros a pés nun proxecto en pés).

## Non construído aínda

- Exportar a vista exaxerada, ou exportar en unidades do proxecto en lugar de metros.
- Texturas, un ficheiro de materiais para OBJ (.mtl) e propiedades por obxecto (os nomes de tubaxes e estruturas só existen en CivilCraft).
- Exportar o corredor como sólidos separados, ou a vista de perfil en 3D.
