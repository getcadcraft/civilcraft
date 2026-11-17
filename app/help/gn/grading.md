---
title: Nivelar una plataforma de edificio
summary: Dibujar una plataforma plana, fijar su cota y los taludes de corte y relleno, y dejar que CivilCraft la empalme con el suelo existente y la agregue a la superficie proyectada.
keywords: muro de contención, muros de contención, cara vertical, muro en lugar de talud, talud por lado, terraplén, movimiento de suelo, plataforma, plataforma de edificio, empalme, grupo movimiento de suelo, talud de corte, talud de relleno, cota terminada, superficie proyectada, nivelación del sitio
from: 482319a6
---

Una plataforma es un área plana a una sola cota. Desde su borde, CivilCraft nivela hacia afuera con tu talud de corte donde el terreno está más alto que la plataforma, y con tu talud de relleno donde está más bajo, hasta que el talud encuentra el suelo existente. Esa línea de encuentro es la línea de empalme. La plataforma y sus taludes reemplazan el suelo existente dentro de la línea de empalme para formar la superficie proyectada.

## Dibujar la plataforma

Necesitás primero una superficie de suelo existente.

1. Presioná {{key:G}}, o hacé clic en {{ui:Plataforma}} en el grupo **Diseño**.
   La ayuda dice "Plataforma: haga clic en sus esquinas. Enter o doble clic termina, Retroceso quita la última, Esc cancela."
2. Hacé clic en las esquinas de la plataforma en orden, en cualquier sentido. Un contorno azul sigue al puntero.
3. Presioná {{key:Enter}} después de la última esquina (al menos tres).
   La plataforma se dibuja y queda seleccionada. Empieza a la cota del suelo en su centro, redondeada a 0,1, con un talud de corte 2 : 1 y un talud de relleno 3 : 1. La barra de estado dice, por ejemplo, "Plataforma 1 a cota 254,3 (el suelo en su centro), corte 2:1, relleno 3:1. Cámbielos en Propiedades."

:::warning
Terminá con {{key:Enter}}. El doble clic también termina, pero en esta versión quita la esquina donde hiciste doble clic. Hacé clic una vez en la última esquina y después presioná {{key:Enter}}.
:::

El contorno de la plataforma no debe cruzarse a sí mismo ("El contorno de la plataforma se cruza a sí mismo.").

## Fijar cota y taludes

Con la plataforma seleccionada, el panel derecho muestra **Plataforma**:

1. **Nombre**.
2. **Cota**: la cota plana de la plataforma.
3. **Talud de corte** y **Talud de relleno**, como H:V (2 significa 2 : 1). Ambos deben ser mayores que 0.
4. **Área de la plataforma** y **Esquinas** se muestran como referencia.

Presioná {{key:Enter}} después de cada valor. La línea de empalme, la superficie proyectada y los volúmenes se actualizan de inmediato.

Debajo de los campos, una línea dice por ejemplo "Línea de empalme: 48 líneas de talud (20 en corte, 28 en relleno), la más lejana a 31,20 ft." El plano muestra la línea de empalme y las líneas de talud en magenta.

## Cómo se encuentra el empalme

- Las líneas de talud salen de cada borde en ángulo recto, aproximadamente cada veinteavo del tamaño de la plataforma.
- En las esquinas exteriores se abren cada 10°, de modo que el talud da la vuelta a la esquina.
- En las esquinas interiores una línea corre por la bisectriz, donde se encuentran los taludes de los dos bordes.
- Cada línea sube con el talud de corte o baja con el talud de relleno hasta llegar al terreno.

## Taludes por lado y muros de contención

Bajo **Lados y muros de contención** en las Propiedades de una plataforma, una plataforma o un terraplén, cada lado puede nivelarse de su propia manera. El lado 1 va de la primera esquina que hiciste clic a la segunda, el lado 2 de la segunda a la tercera, y así sucesivamente.

- **Todos los lados**: **Con talud** usa los taludes de corte y relleno de arriba en todos los lados; **Vertical: muros de contención** pone un muro en cada lado.
- Por lado: **Taludes de arriba**, **Sus propios taludes** (escribí un talud de corte y uno de relleno para ese lado) o **Vertical (muro de contención)**.
- Escribí un talud como `3` o `3:1` (horizontal a 1 vertical), `33%` o `18,4°`; se muestra como H:1. El **Talud de corte** y el **Talud de relleno** propios de la plataforma aceptan lo mismo.
- Un lado vertical no tiene terraplén: un muro de contención corre a lo largo del borde, desde la plataforma hasta el terreno existente (en relleno) o desde el terreno hasta la plataforma (en corte). El **Espesor del muro** (0,3 m o 1 ft para empezar) es cuánto se escalona el terreno desde el borde de la plataforma hasta el suelo existente. Los volúmenes de corte y relleno dejan afuera el terraplén que ese lado ya no tiene.
- Donde un muro se encuentra con un lado con talud, el talud da la vuelta al extremo del muro; dos muros se encuentran en inglete.
- Debajo de los campos: la longitud de los muros, la cara expuesta (altura × longitud), la altura mayor y la altura promedio.

El plano dibuja la cara exterior de cada muro con cortas marcas transversales y su altura en ambos extremos y en su punto más alto (en la capa de muros de contención, que también va a DXF y DWG). La vista 3D muestra los muros como sólidos (Mostrar › Muros de contención), y las exportaciones GLB, OBJ y USD los incluyen. Los cortes a través del borde muestran el escalón.

**Advertencias** (en Propiedades, y en el panel de Problemas): un muro más alto que **Advertir por encima de una altura de muro de** (1,0 m o 3,3 ft para empezar) "puede necesitar un muro de ingeniería o un permiso; verifique las normas locales", y, cuando escribís **La pendiente más empinada que sostiene el suelo**, cualquier lado cuyo talud de corte o relleno sea más empinado que eso. Son advertencias: la nivelación igual se construye. Cada cambio es un paso para {{key:Mod+Z}}.

## Mover esquinas

Seleccioná la plataforma y arrastrá un agarre cuadrado en una esquina. Cada arrastre es un paso de deshacer. Agregar o quitar una esquina todavía no está disponible: borrá la plataforma y volvé a dibujarla.

## Cuando no nivela

Un recuadro rojo bajo **Movimiento de suelo** indica la plataforma y el problema:

| Mensaje | Qué hacer |
|---|---|
| "3 líneas de talud salen de la superficie antes de encontrarla: la plataforma está demasiado cerca del borde de la superficie o demasiado alta/baja." | Alejá la plataforma del borde de la superficie, o acercá su cota al terreno. |
| "La línea de empalme se cruza a sí misma (los taludes de lados diferentes de la plataforma chocan entre sí). Reformá la plataforma o cambiá los taludes." | Típico de plataformas angostas o en L con corte profundo o relleno alto. Ensanchá la plataforma, reducí la diferencia o hacé los taludes más empinados. |
| "El contorno de la plataforma se cruza a sí mismo." | Volvé a dibujar las esquinas en orden alrededor de la plataforma. |

Una plataforma con problemas queda afuera de la superficie proyectada y de los volúmenes hasta que se corrija.

## Ver el resultado

1. Bajo **Pantalla**, poné **Superficie** en {{ui:Propuesto (con pendientes)}}.
   Las curvas de nivel ahora pasan planas por la plataforma y siguen los taludes hasta la línea de empalme.
2. Pasá el puntero sobre la plataforma: la barra de estado muestra las cotas **Suelo** y **Nivelado**.
3. Leé el corte y el relleno bajo **Movimiento de suelo**; ver [Volúmenes de movimiento de suelo](topic:volumes).

Las plataformas se nivelan después de los corredores, en el orden en que se dibujaron. Una plataforma posterior reemplaza lo que haya antes dentro de su propia línea de empalme.

## Borrar una plataforma

Seleccionala y presioná {{key:Delete}} (en Mac, Fn y suprimir), o hacé clic en {{ui:Eliminar}}.

## Todavía no construido

Las plataformas son planas: las plataformas inclinadas, las líneas de elemento con pendiente variable, las banquetas y la nivelación hasta una distancia o una cota objetivo todavía no están disponibles. Ver [Todavía no construido](topic:not-built-yet).
