---
title: Trayectorias de giro de vehículos
summary: Conduzca un vehículo con hasta tres remolques a lo largo de una línea de elemento o de una alineación, hacia adelante o en reversa, y vea el área que barre, sus trayectorias de rueda, su dirección y dónde se pliega.
keywords: trayectoria de giro, seguimiento de vehículos, plantilla de giro, vehículo de diseño, camión, autobús, remolque, semirremolque, reversa, retroceso, plegado, articulación, bloqueo de dirección, desviación de trayectoria, trayectoria de rueda, muelle de carga, radio de giro
from: 8caafb8a
---

Una trayectoria de giro conduce un vehículo a lo largo de una línea y muestra el terreno que recorre su carrocería. Úsela para comprobar que un camión pueda hacer una esquina, llegar a un muelle de carga o retroceder un remolque hasta su lugar sin salirse del pavimento.

## Conduzca un vehículo a lo largo de una línea

1. Dibuje la línea que sigue el vehículo, en el sentido de avance: una línea de elemento (los arcos están bien: pulse {{key:C}} mientras la dibuja, vea [Líneas de elemento](topic:feature-lines)) o una alineación.
2. Seleccione la línea y pulse {{ui:Trayectoria de giro…}} en sus **Propiedades**.
3. En **Iniciar desde**, elija un vehículo y luego defina sus medidas con su propio vehículo de diseño: ancho, voladizo delantero, distancia entre ejes, voladizo trasero, vía y **Bloqueo de dirección**. Agregue hasta tres remolques, cada uno con el punto donde se engancha, su longitud desde el enganche hasta su eje, sus voladizos y su **Articulación máxima**.
4. Elija **Conducción**: hacia adelante o en reversa. Pulse {{ui:Recorrerla}}.

:::warning
Los vehículos desde los que se inicia son valores provisionales, no una norma. Defina las medidas según el vehículo de diseño que use su proyecto.
:::

## Hacia adelante y en reversa

| Conducción | Qué sigue la línea | Qué calcula CivilCraft |
|---|---|---|
| **Hacia adelante** | El centro del eje delantero | Dónde van el eje trasero y cada remolque, el ángulo de dirección y la articulación |
| **En reversa** | El centro del último eje (la parte trasera del remolque) | Dónde va cada unidad anterior, y la dirección que necesita la cabina para colocar el remolque allí |

La reversa es como se comprueba una maniobra de retroceso: indique dónde debe ir el remolque, y CivilCraft le dice si la cabina puede lograrlo.

## Lea el resultado

La trayectoria de giro se dibuja en el plano en naranja: su contorno y, punteadas, las trayectorias de las ruedas más externas. Seleccione (pulse dentro de ella) para ver en **Propiedades**:

- **Longitud recorrida**, el ángulo máximo de **Dirección** y la **Articulación** contra sus límites, y el **Área barrida**.
- Cualquier problema a lo largo de la línea, con su distancia: la dirección más allá del bloqueo, o un remolque que gira más allá de su límite de articulación (se pliega).
- **El vehículo a lo largo de la línea**: mueva el control deslizante para ver el vehículo en cualquier punto, con su dirección y su articulación ahí.

Cambie la línea y la trayectoria de giro la sigue. {{ui:Editar el vehículo…}} cambia las medidas; **Conducción** alterna entre hacia adelante y en reversa. Cada cambio es un paso: {{key:Mod+Z}} lo deshace. {{key:Delete}} elimina la trayectoria de giro seleccionada (la línea permanece).

El contorno y las trayectorias de las ruedas van al PDF, DXF y DWG en la capa C-ROAD-SWPT.

## Cómo se calcula

Cada unidad gira alrededor de la línea de su eje trasero y es arrastrada por el punto que va delante de ella (el eje delantero, o el enganche): el modelo de baja velocidad y sin deslizamiento que usan las comprobaciones de trayectoria de giro. El área barrida es la unión de los contornos de la carrocería en cada posición. No modela la velocidad, el deslizamiento de llantas, el tiempo que tarda la dirección en girar, los remolques con dirección propia ni la holgura bajo la carrocería.
