---
title: Cercas
summary: Una cerca a lo largo de una línea, parcela o plataforma: postes, largueros, paneles o tablillas, portones, inclinados o escalonados sobre el terreno, un cuadro de cantidades, símbolos en planta y elementos IFC. También disponible para un asistente.
keywords: cerca, postes, largueros, paneles, tablillas, portón, inclinada, escalonada, terreno, cuadro de cantidades, ifc, barandal, lindero
from: c0e7b84a
---

Haga una cerca a lo largo de una línea característica, una alineación, una parcela o una plataforma, con sus postes y portones colocados por el programa.

## Hacer una cerca

1. Seleccione una línea, una parcela o una plataforma.
2. Abra **Superficie, Más, Cercas...**
3. Elija el estilo (paneles, largueros o tablillas), inclinada o escalonada, la altura, la separación de los postes y el ancho del portón, y luego **Cerca a lo largo de la selección**, o **Con portón** para poner un portón en medio del tramo recto más largo.

Los postes van en los extremos, en cada esquina (un vértice que gira 20 grados o más), en ambos bordes de cada portón y en tramos iguales intermedios, ninguno más largo que la separación. Los paneles **inclinados** siguen el terreno entre sus postes. Los paneles **escalonados** quedan nivelados y escalonan en los postes; el espacio bajo un panel es más ancho en su poste cuesta abajo, y la ventana advierte cuando ese espacio supera el límite, o cuando el terreno sube a través de un panel. Los portones de 6 pies (1.8 m) o más anchos tienen dos hojas; el plano muestra las hojas abiertas con su giro.

## Cuadro de cantidades y salidas

Cada cerca muestra su longitud, los postes por tipo, los paneles, los portones y los escalones, con un cuadro de cantidades en **CSV** de postes, paneles, largueros, tablillas y portones. El plano tiene capas de cerca (C-FENC, C-FENC-POST, C-FENC-GATE) para PDF, DXF y DWG. La exportación IFC contiene los postes (IfcMember, post), los paneles (IfcRailing, user defined fence panel), los largueros (IfcMember) y los portones (IfcDoor, gate), con un sistema por cerca.

## Desde un asistente

`fence_build` hace una cerca (con puntos, o con una línea, parcela o plataforma con nombre, y portones por estación) y `fence_list` enumera las cercas con su cuadro de cantidades.

## Lo que no está hecho

Los tamaños iniciales son opciones usuales, no un código. Los tipos de la Biblioteca se incluyen solo con su nombre. Los portones deben estar en un mismo tramo recto. BimCraft todavía no tiene esta herramienta.
