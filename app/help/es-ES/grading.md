---
title: Nivelar una plataforma de edificio
summary: Dibujar una plataforma plana, fijar su elevación y sus taludes de desmonte y terraplén, y dejar que CivilCraft la empalme con el terreno existente y la añada a la superficie proyectada.
keywords: muro de contención, muros de contención, lado vertical, muro en lugar de talud, talud por lado, terraplén, nivelación, movimiento de tierras, plataforma, plataforma de edificio, empalme, línea de empalme, talud de desmonte, talud de terraplén, rasante, superficie proyectada, nivelación del terreno
from: 482319a6
---

Una plataforma es una zona plana a una sola elevación. Desde su borde, CivilCraft nivela hacia fuera con su talud de desmonte donde el terreno está por encima de la plataforma, y con su talud de terraplén donde está por debajo, hasta que el talud encuentra el terreno existente. Esa línea de encuentro es la línea de empalme. La plataforma y sus taludes sustituyen al terreno existente dentro de la línea de empalme para formar la superficie proyectada.

## Dibujar la plataforma

Necesita primero una superficie de terreno existente.

1. Pulse {{key:G}}, o haga clic en {{ui:Plataforma}} en el grupo **Diseño**.
   La pista dice "Plataforma: haga clic en sus esquinas. Intro o doble clic termina, Backspace quita la última, Esc cancela."
2. Haga clic en las esquinas de la plataforma en orden, en cualquier sentido. Un contorno azul sigue al puntero.
3. Pulse {{key:Enter}} tras la última esquina (al menos tres).
   La plataforma se dibuja y queda seleccionada. Empieza a la elevación del terreno en su centro, redondeada a 0.1, con un talud de desmonte de 2 : 1 y un talud de terraplén de 3 : 1. La barra de estado dice, por ejemplo: "Plataforma 1 a elevación 254.3 (el terreno en su centro), desmonte 2:1, terraplén 3:1. Cámbielos en Propiedades."

:::warning
Termine con {{key:Enter}}. El doble clic también termina, pero en esta versión elimina la esquina en la que hizo doble clic. Haga clic una vez en la última esquina y después pulse {{key:Enter}}.
:::

El contorno de la plataforma no debe cruzarse consigo mismo ("El contorno de la plataforma se cruza consigo mismo.").

## Fijar elevación y taludes

Con la plataforma seleccionada, el panel derecho muestra **Plataforma**:

1. **Nombre**.
2. **Elevación**: la elevación plana de la plataforma.
3. **Talud de desmonte** y **Talud de terraplén**, como H:V (2 significa 2 : 1). Ambos deben ser mayores que 0.
4. **Área de la plataforma** y **Esquinas**, que se muestran como referencia.

Pulse {{key:Enter}} tras cada valor. La línea de empalme, la superficie proyectada y los volúmenes se actualizan al instante.

Bajo los campos, una línea indica, por ejemplo, "Línea de empalme: 48 líneas de talud (20 en desmonte, 28 en terraplén), la más alejada a 31.20 ft." La planta dibuja la línea de empalme y las líneas de talud en magenta.

## Cómo se encuentra el empalme

- Las líneas de talud salen de cada borde en perpendicular, aproximadamente cada veinte parte del tamaño de la plataforma.
- En las esquinas exteriores se abren en abanico cada 10°, para que el talud dé la vuelta a la esquina.
- En las esquinas interiores una línea sigue la bisectriz, donde se encuentran los taludes de los dos bordes.
- Cada línea sube con el talud de desmonte o baja con el de terraplén hasta alcanzar el terreno.

## Taludes por lado y muros de contención

Bajo **Lados y muros de contención** en las Propiedades de una plataforma, una explanada o un caballón, cada lado puede nivelarse a su manera. El lado 1 va del primer vértice que marcó al segundo, el lado 2 del segundo al tercero, y así sucesivamente.

- **Todos los lados**: **Con talud** usa los taludes de desmonte y terraplén de arriba en todos los lados; **Vertical: muros de contención** pone un muro en cada lado.
- Por lado: **Taludes superiores**, **Sus propios taludes** (escriba un talud de desmonte y otro de terraplén para ese lado) o **Vertical (muro de contención)**.
- Escriba un talud como `3` o `3:1` (horizontal a 1 vertical), `33%` o `18.4°`; se muestra como H:1. Los campos **Talud de desmonte** y **Talud de terraplén** de la plataforma admiten lo mismo.
- Un lado vertical no tiene terraplén: un muro de contención corre a lo largo del borde, desde la plataforma hasta el terreno existente (en terraplén) o desde el terreno hasta la plataforma (en desmonte). El **Espesor del muro** (0.3 m o 1 ft para empezar) es cuánto escalona el terreno desde el borde de la plataforma hasta el terreno existente. Los volúmenes de desmonte y terraplén omiten el terraplén que ese lado ya no tiene.
- Donde un muro se encuentra con un lado con talud, el talud da la vuelta al extremo del muro; dos muros se unen en inglete.
- Bajo los campos: la longitud de los muros, la cara expuesta (altura × longitud), y la altura máxima y media.

La planta dibuja la cara exterior de cada muro con marcas cortas a lo largo de ella y su altura en ambos extremos y en su punto más alto (en la capa de muros de contención, que también pasa a DXF y DWG). La vista 3D muestra los muros como sólidos (Mostrar › Muros de contención), y las exportaciones GLB, OBJ y USD los incluyen. Las secciones a través del borde muestran el escalón.

**Advertencias** (en Propiedades y en el panel de Problemas): un muro más alto que **Avisar por encima de una altura de muro de** (1.0 m o 3.3 ft para empezar) "puede necesitar un muro de ingeniería o un permiso; compruebe la normativa local", y, cuando escribe la **Pendiente más empinada que aguanta el suelo**, cualquier lado cuyo talud de desmonte o de terraplén sea más empinado que eso. Son advertencias: la nivelación se construye igualmente. Cada cambio es un paso para {{key:Mod+Z}}.

## Mover esquinas

Seleccione la plataforma y arrastre un agarre cuadrado en una esquina. Cada arrastre es un paso de deshacer. Añadir o quitar una esquina todavía no está disponible: borre la plataforma y vuelva a dibujarla.

## Cuando no nivela

Un recuadro rojo bajo **Movimiento de tierras** nombra la plataforma y el problema:

| Mensaje | Qué hacer |
|---|---|
| "3 líneas de talud salen de la superficie antes de encontrarla: la plataforma está demasiado cerca del borde de la superficie o demasiado alta o baja." | Aleje la plataforma del borde de la superficie, o acerque su elevación al terreno. |
| "La línea de empalme se cruza consigo misma (los taludes de lados distintos de la plataforma chocan entre sí). Reforme la plataforma o cambie los taludes." | Típico de plataformas estrechas o en L con desmonte profundo o terraplén alto. Ensanche la plataforma, reduzca la diferencia o haga los taludes más empinados. |
| "El contorno de la plataforma se cruza consigo mismo." | Vuelva a dibujar las esquinas en orden alrededor de la plataforma. |

Una plataforma con un problema queda fuera de la superficie proyectada y de los volúmenes hasta que se corrija.

## Ver el resultado

1. En **Visualización**, ponga **Superficie** en {{ui:Proyecto (rasante)}}. Las curvas de nivel ahora atraviesan la plataforma en plano y siguen los taludes hasta la línea de empalme.
2. Mueva el puntero sobre la plataforma: la barra de estado muestra las elevaciones **Terreno** y **Rasante**.
3. Lea desmonte y terraplén en **Movimiento de tierras**; vea [Volúmenes de movimiento de tierras](topic:volumes).

Las plataformas se nivelan después de los corredores, en el orden en que se dibujaron. Una plataforma posterior sustituye todo lo anterior dentro de su propia línea de empalme.

## Borrar una plataforma

Selecciónela y pulse {{key:Delete}} (en Mac, Fn y Delete), o haga clic en {{ui:Eliminar}}.

## Todavía no disponible

Las plataformas son planas: las plataformas inclinadas, las líneas de característica con pendiente variable, los bancales y la nivelación hasta una distancia o una elevación objetivo todavía no están disponibles. Vea [Todavía no está hecho](topic:not-built-yet).
