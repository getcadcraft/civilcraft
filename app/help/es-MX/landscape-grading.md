---
title: Nivelación para paisajismo
summary: Plataformas, bermas, cunetas vegetadas y nivelación libre con cotas puntuales y curvas de nivel que se arrastran, corte y relleno en vivo, análisis de pendientes, flechas de flujo y encharcamiento, todo dentro de la superficie propuesta de CivilCraft.
keywords: muro de contención, muros de contención, lado vertical, muro en lugar de talud, talud por lado, pendiente por lado, terraplén, nivelación, nivelación para paisajismo, plataforma, terraza, berma, montículo, cuneta vegetada, cota puntual, curvas de nivel, editar curvas de nivel, corte y relleno, movimiento de tierras, análisis de pendientes, accesibilidad, pendientes pronunciadas, flechas de flujo, drenaje, encharcamiento, charcos
from: e1559eb9
---

Todo aquí se nivela en la **superficie propuesta** con la misma nivelación que las plataformas y las obras lineales. El **terreno existente** nunca se modifica, y {{ui:Movimiento de tierras}} lo cuenta todo. El menú {{ui:Nivelar}} está en el grupo Paisajismo.

## Plataformas

{{ui:Nivelar}} › {{ui:Plataforma}}, luego haga clic en las esquinas y pulse {{key:Enter}}. La plataforma empieza con la elevación media del terreno bajo ella; escriba una **Elevación** para fijarla, o déjela vacía para que vuelva a seguir el terreno. Una **Pendiente** en % y una **Dirección de la pendiente** en grados (0 = este, 90 = norte) la inclinan. Sus lados se nivelan hasta el terreno con el **Talud de corte** y el **Talud de relleno** (horizontal a 1).

## Taludes por lado y muros de contención

En **Lados y muros de contención** en las Propiedades de una plataforma, de una berma, cada lado puede nivelarse de su propia manera. El lado 1 va del primer punto que hizo clic al segundo, el lado 2 del segundo al tercero, y así sucesivamente.

- **Todos los lados**: **Inclinado** usa los taludes de corte y relleno de arriba en cada lado; **Vertical: muros de contención** pone un muro en cada lado.
- Por lado: **Taludes de arriba**, **Taludes propios** (escriba un talud de corte y uno de relleno para ese lado) o **Vertical (muro de contención)**.
- Escriba un talud como `3` o `3:1` (horizontal a 1 vertical), `33%` o `18.4°`; se muestra como H:1. El **Talud de corte** y el **Talud de relleno** de la plataforma aceptan lo mismo.
- Un lado vertical no tiene terraplén: un muro de contención corre a lo largo del borde, desde la plataforma hacia abajo hasta el terreno existente (en relleno) o desde el terreno hacia abajo hasta la plataforma (en corte). El **Espesor del muro** (0.3 m o 1 ft para empezar) es cuánto da el terreno el paso desde el borde de la plataforma hasta el terreno existente. Los volúmenes de corte y relleno excluyen el terraplén que ese lado ya no tiene.
- Donde un muro se encuentra con un lado inclinado, el talud rodea el extremo del muro; dos muros se encuentran en inglete.
- Bajo los campos: la longitud de los muros, la cara expuesta (altura × longitud), la altura más alta y la altura media.

El plano dibuja la cara exterior de cada muro con marcas cortas transversales y su altura en ambos extremos y en su punto más alto (en la capa de muros de contención, que también va a DXF y DWG). La vista 3D muestra los muros como sólidos (Mostrar › Muros de contención), y las exportaciones GLB, OBJ y USD los incluyen. Las secciones a través del borde muestran el escalón.

**Advertencias** (en Propiedades, y en el panel Problemas): un muro más alto que **Advertir por encima de una altura de muro de** (1.0 m o 3.3 ft para empezar) "puede requerir un muro diseñado por un ingeniero o un permiso; verifique las normas locales", y, cuando escriba la **Pendiente máxima que sostiene el suelo**, cualquier lado cuyo talud de corte o de relleno sea más pronunciado que eso. Son advertencias: la nivelación se construye igual. Cada cambio es un solo paso para {{key:Mod+Z}}.

## Bermas

{{ui:Nivelar}} › {{ui:Berma}}: un montículo cuya cima está a su **Altura** sobre el terreno medio bajo él, con sus lados nivelados.

## Cunetas vegetadas

{{ui:Nivelar}} › {{ui:Cuneta vegetada}}, luego haga clic a lo largo de la cuneta **en el sentido en que corre el agua** y pulse {{key:Enter}}. Configure su **Profundidad**, **Ancho de fondo** (0 para una en V) y **Talud lateral**. Sin **Pendiente**, su fondo sigue al terreno, a su profundidad por debajo, y nunca sube en cuesta; escriba una pendiente para darle una constante desde su inicio.

## Cotas puntuales y curvas de nivel

1. {{ui:Nivelar}} › {{ui:Área de nivelación}}: haga clic en el contorno del área que quiere dar forma.
2. {{ui:Nivelar}} › {{ui:Cota de elevación puntual}}: haga clic dentro del área. Escriba su elevación en Propiedades, o use los botones ▲ ▼.
3. {{ui:Nivelar}} › {{ui:Editar una curva de nivel}}: haga clic en una curva dentro del área para tomarla como una línea que puede reformar.

Seleccione una cota o una curva y **arrástrela** (o sus puntos) en el plano: la superficie sigue al soltar, en un solo paso de deshacer. Dentro del área el terreno se reconstruye desde su borde (donde se encuentra con el terreno existente), las cotas puntuales y las curvas editadas.

## Corte y relleno, en vivo

Las Propiedades de cada objeto de nivelación muestran su **Corte** y su **Relleno**, y los del sitio completo, con el método de cuadrícula que usa Movimiento de tierras, a medida que lo cambia. Los problemas (fuera de la superficie, un contorno que se cruza a sí mismo) se enumeran ahí.

## Comprobaciones de nivelación

En la sección **Comprobaciones de nivelación** a la izquierda:

- **Análisis de pendientes** colorea la superficie según el gradiente: hasta el límite suave, entre ambos, y más empinado que el límite pronunciado (5 % y 33.3 % para empezar: lo habitual, 1:20 para rutas accesibles y 1:3 para siega). La leyenda indica qué parte del área cae en cada rango. Las áreas empinadas también se imprimen en las hojas.
- **Flechas de flujo y encharcamiento** dibuja hacia dónde corre el agua y marca cada lugar donde se encharcaría, con su profundidad; la sección indica cuántos lugares son, cuál es el más profundo y cuánta agua retienen.

Las comprobaciones leen la superficie propuesta cuando algo está nivelado; de lo contrario, leen el terreno existente.
