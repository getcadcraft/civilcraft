---
title: Diseño del estacionamiento
summary: Distribuí cocheras, pasillos, espacios accesibles y para furgonetas e islas dentro de un contorno, nivelá el predio con pendientes hacia desagües respecto del terreno existente, luego pavimentá y plantá. También disponible para un asistente.
keywords: estacionamiento, predio, cochera, pasillo, accesible, ada, furgoneta, isla, desagüe, pendiente, nivelación, corte, relleno, pavimento, adoquines, plantación, árboles, terreno, nube de puntos, mcp, asistente
from: 06c14da9
---

Ajustá un estacionamiento a una parcela, plataforma o línea cerrada, y obtené cantidades, nivelación y pavimento en un paso.

## Distribuí

1. Seleccione parcela, plataforma o línea cerrada en el plano.
2. Abrí **Superficie, Más, Estacionamiento...**
3. Eleji reglas, ángulo de cochera (90, 75, 60, 45, 30 grados o paralelo) y pasillos de un sentido o de doble sentido. Tamaños de cochera, pasillo e isla empiezan desde la tabla ha cada uno ojeipe'a escrito.
4. Eprésiona **Distribuir**.

Filas van por borde contorno ojeipe'áva más cocheras (térã ángulo escrito). Cochera cuenta solo si entero dentro contorno. Si queda lugar para una fila y un pasillo, agrégase franja de una fila. Ventana omoñe'ẽ espacios, espacios accesibles y para furgonetas, islas, desagües y superficie por espacio, y plano omoĩ cocheras, espacios accesibles con pasillos de acceso rayados, islas, líneas centrales de pasillos y desagües en sus capas (C-PARK-...), para que lleguen a PDF, DXF y DWG.

## Espacios accesibles

Con reglas de Estados Unidos, cantidad sigue tabla 208.2 de ADA Standards 2010 para espacios previstos (uno de seis, redondeado hacia arriba, es espacio para furgoneta), ubicados cerca primera esquina del contorno (entrada), cada uno con pasillo de acceso; dos comparten uno. Cochera más angosta que ancho accesible, o pendiente mayor 1:48 en espacios accesibles, aparece como problema. **Estos números fueron escritos desde la norma como recordados y no se verificaron con la norma impresa.** Tamaños típicos de cochera y pasillo vienen de guías de diseño de estacionamientos y también están sin verificar. Revisá ambos y tu código local antes de confiar. Elegí **Personalizado** para ingresar tu cantidad de accesibles.

## Pendientes a desagües, corte y relleno

Salvo que lo apagues, el predio se vuelve área de nivelación en el espacio de trabajo Paisajismo. Desagües se ponen sobre líneas centrales de pasillo cada 100 pies (30 m aproximadamente); superficie sube desde cada desagüe con la pendiente que das (1.5 por ciento al inicio), así cada punto cae hacia su desagüe más cercano. Nivel se elige para que corte y relleno del predio se equilibren con el terreno existente. Terreno existente es la superficie existente del proyecto, que puede venir de puntos de medición, LandXML, nube de puntos de lidar o escaneo convertida en superficie, o curvas de nivel. Ventana muestra estimación de corte y relleno; volúmenes del proyecto dan la cifra exacta después. Área de nivelación mantiene su borde en el terreno existente, así donde nueva superficie difiere del terreno en el borde aparece un escalón, y la ventana dice cuánto.

## Pavimento y plantación

Todo el contorno recibe pavimento de adoquines (patrón de soga que podés cambiar en Paisajismo, Obras duras) y cada isla recibe cantero de arbustos y, si es lo bastante ancha, un árbol, tomados de la lista de plantas. Después todo es un objeto normal de Paisajismo: editalo, o elegí **Distribuir otra vez** para reemplazar lo que el predio hizo. Quitar el predio quita lo que hizo.

## Desde un asistente

El mismo predio puede pedirse por MCP: `parking_layout` previsualiza, `parking_build` escribe, `parking_remove` quita el predio. Pedí por nombre de parcela o enviá el contorno.

## Lo que no está hecho

No se verifica si los pasillos llegan a una calle. El pavimento cubre todo el contorno, así que su superficie incluye las islas. Opciones de materiales de pavimento de la Biblioteca y un tipo de Biblioteca para cocheras no están hechos; el patrón de pavimento es el de Obras duras. Reglas de otros países no están hechas.
