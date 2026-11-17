---
title: Trayectorias de giro de vehículos
summary: Conduzca un vehículo con hasta tres remolques por una línea característica o una alineación, hacia delante o marcha atrás, y vea la superficie que barre, las huellas de sus ruedas, su dirección y dónde se acodan los remolques (jackknife).
keywords: trayectoria de giro, seguimiento de vehículos, plantilla de giro, vehículo de diseño, camión, autobús, remolque, semirremolque, marcha atrás, retroceso, acodamiento, articulación, bloqueo de dirección, offtracking, huella de rueda, muelle de carga, radio de giro
from: 8caafb8a
---

Una trayectoria de giro conduce un vehículo por una línea y muestra el terreno que recorre su carrocería. Úsela para comprobar que un camión puede tomar una esquina, llegar a un muelle de carga o retroceder un remolque hasta su sitio sin salirse del pavimento.

## Conducir un vehículo por una línea

1. Dibuje la línea que sigue el vehículo, en el sentido de marcha: una línea característica (los arcos son válidos: pulse {{key:C}} mientras la dibuja, véase [Líneas características](topic:feature-lines)) o una alineación.
2. Selecciónela y pulse {{ui:Trayectoria de giro…}} en sus **Propiedades**.
3. Bajo **Partir de**, elija un vehículo y después defina sus dimensiones a partir de su propio vehículo de diseño: anchura, voladizo delantero, distancia entre ejes, voladizo trasero, vía y **Bloqueo de dirección**. Añada hasta tres remolques, cada uno con su punto de enganche, su longitud desde el enganche hasta su eje, sus voladizos y su **Articulación máxima**.
4. Elija **Marcha**: hacia delante o marcha atrás. Pulse {{ui:Recorrerla}}.

:::warning
Los vehículos de partida son valores provisionales, no un estándar. Defina las dimensiones a partir del vehículo de diseño que usa su proyecto.
:::

## Marcha hacia delante y marcha atrás

| Marcha | Qué sigue la línea | Qué calcula CivilCraft |
|---|---|---|
| **Hacia delante** | El centro del eje delantero | Dónde van el eje trasero y cada remolque, el ángulo de dirección y la articulación |
| **Marcha atrás** | El centro del último eje (la parte trasera del remolque) | Dónde va cada unidad delantera, y la dirección que necesita la cabina para colocar allí el remolque |

La maniobra de marcha atrás se comprueba así: indique dónde debe ir el remolque y CivilCraft dirá si la cabina puede lograrlo.

## Leer el resultado

La trayectoria de giro se dibuja en el plano en naranja: su contorno y, en trazos, las trayectorias de las ruedas exteriores. Selecciónela (pulse dentro de ella) para ver en **Propiedades**:

- **Longitud recorrida**, el mayor ángulo de **Dirección** y la **Articulación** frente a sus límites, y la **Superficie barrida**.
- Cualquier problema a lo largo de la línea, con su distancia: la dirección más allá del bloqueo, o un remolque que gira más allá de su límite de articulación (se acodan).
- **El vehículo a lo largo de la línea**: mueva el deslizador para ver el vehículo en cualquier punto, con su dirección y su articulación en ese punto.

Si cambia la línea, la trayectoria de giro se actualiza. {{ui:Editar el vehículo…}} cambia las dimensiones; **Marcha** alterna entre hacia delante y marcha atrás. Cada cambio es un paso: {{key:Mod+Z}} lo deshace. {{key:Delete}} elimina la trayectoria de giro seleccionada (la línea se mantiene).

El contorno y las trayectorias de las ruedas pasan al PDF, DXF y DWG en la capa C-ROAD-SWPT.

## Cómo se calcula

Cada unidad gira alrededor de la línea de su eje trasero y es arrastrada por el punto que tiene delante (el eje delantero o el enganche), con el modelo de baja velocidad y sin deslizamiento que usan las comprobaciones de trayectorias de giro. La superficie barrida es la unión de los contornos de la carrocería en todas las posiciones. No modela la velocidad, el deslizamiento de los neumáticos, el tiempo que tarda la dirección en girar, los remolques con dirección ni la altura libre bajo la carrocería.
