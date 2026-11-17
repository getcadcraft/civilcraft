---
title: Movimiento de suelo para paisajismo
summary: Plataformas, albardones, canaletas y movimiento de suelo libre con elevaciones puntuales y curvas de nivel que arrastras, con corte y relleno en vivo, análisis de pendientes, flechas de flujo y encharcamiento, todo dentro de la superficie proyectada de CivilCraft.
keywords: muro de contención, muros de contención, lado vertical, muro en lugar de pendiente, pendiente por lado, talud, movimiento de suelo, movimiento de suelo para paisajismo, plataforma, terraza, base, albardón, montículo, canaleta, nivel puntual, curvas de nivel, editar curvas de nivel, corte y relleno, movimiento de tierra, análisis de pendientes, accesibilidad, pendientes pronunciadas, flechas de flujo, drenaje, encharcamiento, charcos
from: e1559eb9
---

Todo lo que está aquí se nivela dentro de la **superficie proyectada** con el mismo movimiento de suelo que las bases y los corredores. El **terreno existente** nunca se cambia, y el Movimiento de tierra lo cuenta todo. El menú Movimiento de suelo está en el grupo paisajismo.

## Plataformas

{{ui:Grade}} › {{ui:Platform}}, luego haz clic en las esquinas y presiona {{key:Enter}}. La plataforma empieza en la elevación media del terreno debajo; escribe una **Elevación** para fijarla, o déjala vacía para que vuelva a seguir el terreno. Una **Caída** en % y **Cae hacia** en grados (0 = este, 90 = norte) la inclinan. Sus lados se nivelan hasta el terreno en la **Pendiente de corte** y la **Pendiente de relleno** (horizontal a 1).

## Pendientes por lado y muros de contención

Bajo **Lados y muros de contención** en las Propiedades de una base, una plataforma o un albardón, cada lado puede nivelarse a su manera. El lado 1 va desde la primera esquina que marcaste hasta la segunda, el lado 2 desde la segunda hasta la tercera, y así sucesivamente.

- **Todos los lados**: **En pendiente** usa las pendientes de corte y relleno de arriba en cada lado; **Vertical: muros de contención** pone un muro en cada lado.
- Por lado: **Pendientes superiores**, **Sus propias pendientes** (escribe una pendiente de corte y otra de relleno para ese lado) o **Vertical (muro de contención)**.
- Escribe una pendiente como `3` o `3:1` (horizontal a 1 vertical), `33%` o `18.4°`; se muestra como H:1. La **Pendiente de corte** y la **Pendiente de relleno** propias de la base aceptan lo mismo.
- Un lado vertical no tiene terraplén: un muro de contención corre a lo largo del borde, desde la base hacia abajo hasta el terreno existente (en relleno) o desde el terreno hacia abajo hasta la base (en corte). **Espesor del muro** (0,3 m o 1 ft para empezar) es cuánto da el salto el terreno desde el borde de la base hasta el terreno existente. Los volúmenes de corte y relleno dejan afuera el terraplén que ese lado ya no tiene.
- Donde un muro se encuentra con un lado en pendiente, la pendiente se envuelve alrededor del extremo del muro; dos muros se encuentran en inglete.
- Bajo los campos: la longitud de los muros, la cara expuesta (altura × longitud), la altura máxima y la altura media.

El plano dibuja la cara exterior de cada muro con marcas cortas a través de ella y su altura en ambos extremos y en su punto más alto (en la capa de muros de contención, que también pasa a DXF y DWG). La vista 3D muestra los muros como sólidos (Mostrar › Muros de contención), y las exportaciones GLB, OBJ y USD los incluyen. Las secciones a través del borde muestran el escalón.

**Avisos** (en Propiedades, y en el panel de Problemas): un muro más alto que **Avisar por encima de una altura de muro de** (1,0 m o 3,3 ft para empezar) "puede requerir un muro de ingeniería o un permiso; verifica las normas locales", y, cuando escribes la **Pendiente más empinada que sostiene el suelo**, cualquier lado cuya pendiente de corte o relleno sea más empinada que eso. Son avisos: el movimiento de suelo igual se construye. Cada cambio es un paso para {{key:Mod+Z}}.

## Albardones

{{ui:Grade}} › {{ui:Berm}}: un montículo cuya cima está a su **Altura** sobre el terreno medio debajo, con sus lados niveladas hasta el terreno.

## Canaletas

{{ui:Grade}} › {{ui:Swale}}, luego haz clic a lo largo de la canaleta **en la dirección en que corre el agua** y presiona {{key:Enter}}. Define su **Profundidad**, el **Ancho de fondo** (0 para una V) y la **Pendiente lateral**. Sin **Caída**, su fondo sigue el terreno, a su profundidad bajo él, y nunca sube cuesta arriba; escribe una caída para darle una constante desde su inicio.

## Elevaciones puntuales y curvas de nivel

1. {{ui:Grade}} › {{ui:Grading area}}: haz clic en el contorno del área que quieres dar forma.
2. {{ui:Grade}} › {{ui:Spot elevation}}: haz clic dentro del área. Escribe su elevación en Propiedades, o usa los botones ▲ ▼.
3. {{ui:Grade}} › {{ui:Edit a contour}}: haz clic en una curva de nivel dentro del área para tomarla como una línea que puedes remodelar.

Selecciona un punto o una curva de nivel y **arrástralo** (o sus puntos) en el plano: la superficie sigue al soltar, en un paso de deshacer. Dentro del área el terreno se reconstruye desde su borde (donde encuentra el terreno existente), las elevaciones puntuales y las curvas de nivel editadas.

## Corte y relleno en vivo

Las Propiedades de cada objeto de movimiento de suelo muestran su **Corte** y **Relleno** y los del sitio completo, por el método de grilla que usa Movimiento de tierra, a medida que lo cambias. Los problemas (fuera de la superficie, un contorno que se cruza a sí mismo) se listan allí.

## Verificaciones de movimiento de suelo

En la sección **Verificaciones de movimiento de suelo** a la izquierda:

- **Análisis de pendientes** colorea la superficie según su gradiente: hasta el límite suave, entre ambos, y más empinas que el límite pronunciado (5 % y 33.3 % para empezar: el habitual 1:20 para rutas accesibles y 1:3 para corte de césped). La leyenda dice qué parte del área cae en cada grupo. Las áreas pronunciadas también se imprimen en las hojas.
- **Flechas de flujo y encharcamiento** dibuja hacia dónde corre el agua y marca cada lugar donde se encharcaría, con su profundidad; la sección dice cuántos lugares hay, el más profundo y cuánta agua retienen.

Las verificaciones leen la superficie proyectada cuando algo se nivela, si no, el terreno existente.
