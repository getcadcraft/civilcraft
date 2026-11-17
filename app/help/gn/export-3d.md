---
title: Exportar el sitio en 3D
summary: Oñeguarda 3D vista ohechaukáva GLB térã OBJ archivo ambue 3D programa-kuéra-pe, metro-pe Y arriba, origen local-pe archivo oñemboguejy.
keywords: glb, gltf, obj, exportación 3D, exportar 3D, exportación de modelo, motor de juego, visualización, visor 3D, metros, y arriba, origen, origen local, state plane
from: 07d23992
---

3D vista exporta ohechaukáva modelo 3D ambue programa-kuéra oikuaa: 3D visor, modelador, juego motor térã visualización herramienta.

## Exportar

1. Ejepe'a 3D vista ({{key:D}}) ha eleguá ohechauka {{ui:Mostrar}}. Ohenóipe ndoexportase.
2. Ejepe'a {{ui:GLB}} térã {{ui:OBJ}} barra-pe.
   Archivo ojejapo "*nombre del proyecto*-3d.glb" térã "-3d.obj", ha barra de estado origen ohechauka.

## Lo que contienen los archivos

| | GLB | OBJ |
|---|---|---|
| Superficies | Mallas normales ha banda térã superficie colores ndive | Mallas normales ndive (colores ndaipóri) |
| Caños y estructuras | Mallas redondas, problema-kuéra pytã-pe | Mallas redondas |
| Curvas de nivel, líneas de quiebre, trazados, marcas, líneas de corredor y plataforma | Líneas, peteĩ-peteĩ color-pe | Líneas registros (`l`) |
| Puntos de relevamiento | Puntos | Punto registros (`p`) |

Cada conjunto ohupyty héra ("Terreno existente", "Caños", "Curvas de nivel mayores" ha ambue), upévare ambue programa-pe ohenói térã ohechauka hag̃ua.

## Unidades, ejes y origen

- **Metros.** Pies proyecto EE.UU. pies de relevamiento-gui oñemboguejy (1 pie = 1200/3937 m).
- **Y arriba**, formato-kuéra costumbre: este +X-pe, elevación +Y-pe, norte −Z-pe.
- **Escala real.** Vista exageración vertical ndojeporúi.
- **Origen local.** Coordenadas state plane millones de pies, grande mbovy formato-kuéra single-precision número-pe, upévare archivo ojejapo origen apytépe: terreno existente origen propio este ha norte-pe, ha elevación mboyve bajo redondeado abajo. Origen, proyecto unidades-pe, archivo-pe oñemoĩ: GLB-pe `extras` escena ha superior nodo-pe, OBJ-pe comentario línea primero-pe (`# origin easting … northing … elevation …`). Modelo proyecto koordenadas-pe emoĩ jey, origen ñomoĩ (pies proyecto-pe metros pies-pe emboguejy rire).

## Todavía no construido

- Exagerada vista exportación, térã proyecto unidades metro-pe ndaha'éi.
- Texturas, OBJ material archivo (.mtl) ha objeto propiedades (caños ha estructuras nombres CivilCraft-pe añoite).
- Corredor sólidos aparte exportación, térã perfil vista 3D.
