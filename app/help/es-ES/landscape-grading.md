---
title: Explanación para paisajismo
summary: Plataformas, caballones, cunetas vegetales y explanación libre con cotas puntuales y curvas de nivel que se arrastran, con desmonte y terraplén en vivo, análisis de pendientes, flechas de flujo y encharcamiento, todo dentro de la superficie proyectada de CivilCraft.
keywords: muro de contención, muros de contención, lado vertical, muro en lugar de pendiente, pendiente por lado, terraplén, explanación, explanación para paisajismo, plataforma, terraza, plataforma de edificación, caballón, montículo, cuneta vegetal, cota puntual, curvas de nivel, editar curvas de nivel, desmonte y terraplén, movimiento de tierras, análisis de pendientes, accesibilidad, pendientes pronunciadas, flechas de flujo, drenaje, encharcamiento, charcos
from: e1559eb9
---

Todo esto se explana en la **superficie proyectada** con la misma explanación que las plataformas y los corredores. El **terreno existente** nunca se modifica, y Movimiento de tierras lo cuenta todo. El menú Explanación está en el grupo Paisajismo.

## Plataformas

{{ui:Grade}} › {{ui:Platform}}, luego haga clic en las esquinas y pulse {{key:Enter}}. La plataforma empieza en la cota media del terreno bajo ella; escriba una **Cota** para fijarla, o déjela vacía para que vuelva a seguir al terreno. Una **Pendiente** en % y una **Dirección de la pendiente** en grados (0 = este, 90 = norte) la inclinan. Sus lados se explanan hasta el terreno con el **Talud de desmonte** y el **Talud de terraplén** (horizontal a 1).

## Pendientes por lado y muros de contención

En **Lados y muros de contención**, en las Propiedades de una plataforma, de una explanada o de un caballón, cada lado puede explanarse a su manera. El lado 1 va desde la primera esquina en la que hizo clic hasta la segunda, el lado 2 de la segunda a la tercera, y así sucesivamente.

- **Todos los lados**: **Con pendiente** usa los taludes de desmonte y terraplén de arriba en todos los lados; **Vertical: muros de contención** pone un muro en cada lado.
- Por lado: **Pendientes de arriba**, **Pendientes propias** (escriba un talud de desmonte y otro de terraplén para ese lado) o **Vertical (muro de contención)**.
- Escriba una pendiente como `3` o `3:1` (horizontal a 1 vertical), `33%` o `18.4°`; se muestra como H:1. Los campos **Talud de desmonte** y **Talud de terraplén** propios de la plataforma admiten lo mismo.
- Un lado vertical no tiene terraplén: un muro de contención recorre el borde, desde la plataforma hacia abajo hasta el terreno existente (en terraplén) o desde el terreno hacia abajo hasta la plataforma (en desmonte). El **Espesor del muro** (0.3 m o 1 ft de partida) es cuánto da el terreno de escalón desde el borde de la plataforma hasta el terreno existente. Los volúmenes de desmonte y terraplén omiten el terraplén que ese lado ya no tiene.
- Donde un muro encuentra un lado con pendiente, la pendiente se envuelve alrededor del extremo del muro; dos muros se unen en inglete.
- Bajo los campos: la longitud de los muros, la superficie vista (altura × longitud), la altura máxima y la altura media.

El plano dibuja la cara exterior de cada muro con pequeñas marcas transversales y su altura en ambos extremos y en su punto más alto (en la capa de muros de contención, que también pasa a DXF y DWG). La vista 3D muestra los muros como sólidos (Mostrar › Muros de contención), y las exportaciones GLB, OBJ y USD los incluyen. Las secciones a través del borde muestran el escalón.

**Advertencias** (en Propiedades y en el panel de Problemas): un muro más alto que **Avisar por encima de una altura de muro de** (1.0 m o 3.3 ft de partida) «puede necesitar un muro de ingeniería o un permiso; compruebe la normativa local», y, cuando escribe la **Pendiente máxima que aguanta el terreno**, cualquier lado cuyo talud de desmonte o de terraplén sea más empinado que ese. Son advertencias: la explanación se construye igualmente. Cada cambio es un paso para {{key:Mod+Z}}.

## Caballones

{{ui:Grade}} › {{ui:Berm}}: un montículo cuya cima está a su **Altura** sobre la cota media del terreno bajo él, con sus lados explanados.

## Cunetas vegetales

{{ui:Grade}} › {{ui:Swale}}, luego haga clic a lo largo de la cuneta **en el sentido en que corre el agua** y pulse {{key:Enter}}. Ajuste su **Profundidad**, su **Anchura de fondo** (0 para una en V) y su **Talud lateral**. Sin **Pendiente**, su fondo sigue al terreno, a la profundidad indicada por debajo, y nunca sube; escriba una pendiente para darle una constante desde su inicio.

## Cotas puntuales y curvas de nivel

1. {{ui:Grade}} › {{ui:Grading area}}: haga clic en el contorno de la zona que quiere modelar.
2. {{ui:Grade}} › {{ui:Spot elevation}}: haga clic dentro de la zona. Escriba su cota en Propiedades, o use los botones ▲ ▼.
3. {{ui:Grade}} › {{ui:Edit a contour}}: haga clic en una curva de nivel dentro de la zona para tomarla como una línea que puede reformar.

Seleccione una cota o una curva y **arrástrela** (o sus puntos) en el plano: la superficie sigue al soltar, en un solo paso de deshacer. Dentro de la zona, el terreno se recalcula a partir de su borde (donde se une al terreno existente), las cotas puntuales y las curvas editadas.

## Desmonte y terraplén, en vivo

Las Propiedades de cada objeto de explanación muestran su **Desmonte** y su **Terraplén**, y los del conjunto del emplazamiento, según el método de cuadrícula que usa Movimiento de tierras, a medida que lo cambia. Los problemas (fuera de la superficie, un contorno que se cruza a sí mismo) aparecen también allí.

## Comprobaciones de explanación

En la sección **Comprobaciones de explanación** a la izquierda:

- El **Análisis de pendientes** colorea la superficie según su gradiente: hasta el límite suave, entre ambos, y más empinas que el límite pronunciado (5 % y 33.3 % de partida: el habitual 1:20 para recorridos accesibles y 1:3 para siega). La leyenda indica qué parte del área cae en cada grupo. Las áreas pronunciadas también se imprimen en las hojas.
- Las **Flechas de flujo y encharcamiento** dibujan hacia dónde corre el agua y marcan cada lugar donde se acumularía agua, con su profundidad; la sección indica cuántos lugares hay, el más profundo y cuánta agua retienen en total.

Las comprobaciones leen la superficie proyectada cuando se ha explanado algo; si no, leen el terreno existente.
