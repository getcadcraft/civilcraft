---
title: Vallas
summary: Una valla a lo largo de una línea, parcela o plataforma: postes, travesaños, paneles o barrotes, puertas, inclinada o escalonada sobre el terreno, un listado, símbolos en planta y elementos IFC. También disponible para un asistente.
keywords: valla, postes, travesaños, paneles, barrotes, puerta, inclinada, escalonada, terreno, listado, ifc, barandilla, lindero
from: c0e7b84a
---

Haga una valla a lo largo de una línea de elemento, un alineamiento, una parcela o una plataforma, con sus postes y puertas colocados por usted.

## Hacer una valla

1. Seleccione una línea, una parcela o una plataforma.
2. Abra **Superficie, Más, Vallas...**
3. Elija el estilo (paneles, travesaños o barrotes), inclinada o escalonada, la altura, la separación de postes y el ancho de la puerta, y después **Valla a lo largo de la selección**, o **Con una puerta** para colocar una puerta en el centro del tramo recto más largo.

Los postes van en los extremos, en cada esquina (un vértice que gira 20 grados o más), en ambos bordes de cada puerta y en vanos iguales intermedios, ninguno más largo que la separación. Los paneles **inclinados** siguen el terreno entre sus postes. Los paneles **escalonados** permanecen nivelados y escalonan en los postes; el hueco bajo un panel es más ancho en su poste de la parte baja, y la ventana avisa cuando ese hueco supera el límite, o cuando el terreno sube a través de un panel. Las puertas de 6 feet (1.8 m) o más tienen dos hojas; el plano muestra las hojas abiertas con su giro.

## Listado y salidas

Cada valla muestra su longitud, los postes por tipo, los paneles, las puertas y los escalones, con un listado **CSV** de postes, paneles, travesaños, barrotes y puertas. El plano tiene las capas de valla (C-FENC, C-FENC-POST, C-FENC-GATE) para PDF, DXF y DWG. La exportación IFC incluye los postes (IfcMember, post), los paneles (IfcRailing, user defined fence panel), los travesaños (IfcMember) y las puertas (IfcDoor, gate), con un sistema por valla.

## Desde un asistente

`fence_build` hace una valla (puntos o una línea, parcela o plataforma con nombre, puertas por estación) y `fence_list` enumera las vallas con su listado.

## Lo que no está hecho

Los tamaños iniciales son opciones habituales, no una norma. Los tipos de la Biblioteca se incorporan solo con su nombre. Las puertas deben estar en un mismo tramo recto. BimCraft todavía no tiene esta herramienta.
