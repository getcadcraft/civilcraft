---
title: Nivelar una plataforma de edificación
summary: Dibuje una plataforma plana, defina su elevación y sus taludes de corte y terraplén, y deje que CivilCraft la empate con el terreno existente y la agregue a la superficie de proyecto.
keywords: muro de contención, muros de contención, lado vertical, muro en lugar de talud, talud por lado, terraplén, movimiento de tierras, plataforma, plataforma de edificación, empate, línea de empate, línea de elemento, grupo de movimiento de tierras, talud de corte, talud de terraplén, rasante terminada, superficie de proyecto, nivelación del sitio
from: 482319a6
---

Una plataforma es un área plana a una sola elevación. Desde su borde, CivilCraft nivela hacia afuera con su talud de corte donde el terreno está más alto que la plataforma, y con su talud de terraplén donde está más bajo, hasta que el talud encuentra el terreno existente. Esa línea de encuentro es la línea de empate. La plataforma y sus taludes reemplazan el terreno existente dentro de la línea de empate para formar la superficie de proyecto.

## Dibujar la plataforma

Necesita primero una superficie de terreno existente.

1. Pulse {{key:G}}, o haga clic en {{ui:Plataforma}} en el grupo **Diseño**.
   La sugerencia dice "Plataforma: haga clic en sus esquinas. Enter o doble clic termina, Backspace quita la última, Esc cancela."
2. Haga clic en las esquinas de la plataforma en orden, en cualquiera de los dos sentidos. Un contorno azul sigue al puntero.
3. Pulse {{key:Enter}} después de la última esquina (al menos tres).
   La plataforma se dibuja y queda seleccionada. Empieza a la elevación del terreno en su centro, redondeada a 0.1, con un talud de corte de 2 : 1 y un talud de terraplén de 3 : 1. La barra de estado dice, por ejemplo, "Plataforma 1 a elevación 254.3 (el terreno en su centro), corte 2:1, terraplén 3:1. Cámbielos en Propiedades."

:::warning
Termine con {{key:Enter}}. El doble clic también termina, pero en esta versión quita la esquina en la que hizo doble clic. Haga clic una vez en la última esquina y luego pulse {{key:Enter}}.
:::

El contorno de la plataforma no puede cruzarse a sí mismo ("El contorno de la plataforma se cruza a sí mismo.").

## Definir elevación y taludes

Con la plataforma seleccionada, el panel derecho muestra **Plataforma**:

1. **Nombre**.
2. **Elevación**: la elevación plana de la plataforma.
3. **Talud de corte** y **Talud de terraplén**, como H:V (2 significa 2 : 1). Ambos deben ser mayores que 0.
4. **Área de la plataforma** y **Esquinas**, que se muestran como referencia.

Pulse {{key:Enter}} después de cada valor. La línea de empate, la superficie de proyecto y los volúmenes se actualizan de inmediato.

Bajo los campos, una línea indica, por ejemplo, "Línea de empate: 48 líneas de talud (20 en corte, 28 en terraplén), la más lejana a 31.20 ft." La planta muestra la línea de empate y las líneas de talud en magenta.

## Cómo se encuentra el empate

- Las líneas de talud salen de cada borde en ángulo recto, aproximadamente cada veintava parte del tamaño de la plataforma.
- En las esquinas exteriores se abren en abanico cada 10°, para que el talud dé la vuelta a la esquina.
- En las esquinas interiores una línea sigue la bisectriz, donde se encuentran los taludes de los dos bordes.
- Cada línea sube con el talud de corte o baja con el talud de terraplén hasta llegar al terreno.

## Taludes por lado y muros de contención

Bajo **Lados y muros de contención** en las Propiedades de una plataforma, un andén o un bordo, cada lado puede nivelarse a su manera. El lado 1 va de la primera esquina que hizo clic a la segunda, el lado 2 de la segunda a la tercera, y así sucesivamente.

- **Todos los lados**: **Con talud** usa los taludes de corte y terraplén de arriba en cada lado; **Vertical: muros de contención** pone un muro en cada lado.
- Por lado: **Taludes de arriba**, **Sus propios taludes** (escriba un talud de corte y uno de terraplén para ese lado) o **Vertical (muro de contención)**.
- Escriba un talud como `3` o `3:1` (horizontal a 1 vertical), `33%` o `18.4°`; se muestra como H:1. El **Talud de corte** y el **Talud de terraplén** propios de la plataforma aceptan lo mismo.
- Un lado vertical no tiene terraplén: un muro de contención corre a lo largo del borde, desde la plataforma hacia abajo hasta el terreno existente (en terraplén), o desde el terreno hacia arriba hasta la plataforma (en corte). **Espesor del muro** (0.3 m o 1 ft para empezar) es cuánto da el escalón el terreno desde el borde de la plataforma hasta el terreno existente. Los volúmenes de corte y terraplén excluyen el terraplén que ese lado ya no tiene.
- Donde un muro encuentra un lado con talud, el talud da la vuelta al extremo del muro; dos muros se encuentran en inglete.
- Bajo los campos: la longitud de los muros, la cara expuesta (altura × longitud), la altura mayor y la altura promedio.

La planta dibuja la cara exterior de cada muro con marcas cortas a lo largo de ella, y su altura en ambos extremos y en su punto más alto (en la capa de muros de contención, que también pasa a DXF y DWG). La vista 3D muestra los muros como sólidos (Mostrar › Muros de contención), y las exportaciones GLB, OBJ y USD los incluyen. Las secciones a través del borde muestran el escalón.

**Advertencias** (en Propiedades y en el panel Problemas): un muro más alto que **Advertir por encima de una altura de muro de** (1.0 m o 3.3 ft para empezar) "puede requerir un muro de ingeniería o un permiso; revise las normas locales", y, cuando escriba **Pendiente máxima que sostiene el suelo**, cualquier lado cuyo talud de corte o de terraplén sea más empinado que eso. Son advertencias: la nivelación se construye igual. Cada cambio es un paso para {{key:Mod+Z}}.

## Mover esquinas

Seleccione la plataforma y arrastre un agarre cuadrado en una esquina. Cada arrastre es un paso de deshacer. Agregar o quitar una esquina todavía no está disponible: elimine la plataforma y vuelva a dibujarla.

## Cuando no nivela

Un recuadro rojo bajo **Movimiento de tierras** indica la plataforma y el problema:

| Mensaje | Qué hacer |
|---|---|
| "3 líneas de talud salen de la superficie antes de encontrarla: la plataforma está demasiado cerca del borde de la superficie o demasiado alta o baja." | Mueva la plataforma hacia adentro del borde de la superficie, o acerque su elevación al terreno. |
| "La línea de empate se cruza a sí misma (los taludes de lados distintos de la plataforma chocan entre sí). Rediseñe la plataforma o cambie los taludes." | Típico de plataformas angostas o en L con corte profundo o terraplén alto. Ensanche la plataforma, reduzca la diferencia o haga más empinados los taludes. |
| "El contorno de la plataforma se cruza a sí mismo." | Vuelva a dibujar las esquinas en orden alrededor de la plataforma. |

Una plataforma con problemas se deja fuera de la superficie de proyecto y de los volúmenes hasta corregirla.

## Ver el resultado

1. En **Visualización**, ponga **Superficie** en {{ui:Proyecto (rasante)}}. Las curvas de nivel ahora cruzan la plataforma en plano y siguen los taludes hasta la línea de empate.
2. Mueva el puntero sobre la plataforma: la barra de estado muestra las elevaciones de **Terreno** y **Nivelada**.
3. Lea corte y terraplén bajo **Movimiento de tierras**; vea [Volúmenes de movimiento de tierras](topic:volumes).

Las plataformas se nivelan después de las obras lineales, en el orden en que se dibujaron. Una plataforma posterior reemplaza cualquier cosa anterior dentro de su propia línea de empate.

## Eliminar una plataforma

Selecciónela y pulse {{key:Delete}} (en Mac, Fn y Delete), o haga clic en {{ui:Eliminar}}.

## Aún no implementado

Las plataformas son planas: todavía no están disponibles las plataformas inclinadas, las líneas de elemento con pendiente variable, los bancos de nivel ni la nivelación hasta una distancia o una elevación objetivo. Vea [Aún no implementado](topic:not-built-yet).
