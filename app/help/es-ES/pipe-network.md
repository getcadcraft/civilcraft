---
title: Trazar una red de tuberías por gravedad
summary: Dibuje tramos de tubería pluvial o de saneamiento estructura por estructura, defina sus reglas de pendiente, recubrimiento y caída, deje que CivilCraft fije las cotas de batea y corrija los problemas que enumera.
keywords: constructor de estructuras, tipo de estructura, estructura rectangular, sumidero, marco, recubrimiento, espesor de pared, elemento de biblioteca, red de tuberías, pluvial, saneamiento, alcantarillado, estructuras, pozos de registro, cotas de batea, pendiente, caída, brocal, pozo de decantación, tuberías por gravedad
from: 10a3c14d
---

Un proyecto contiene una red de tuberías por gravedad, pluvial o de saneamiento. Se compone de estructuras (pozos de registro, sumideros) y de tuberías rectas entre ellas. El flujo va en la dirección en que dibuja. CivilCraft comprueba cada tubería y cada estructura frente a tres reglas que usted define, y puede fijar todas las cotas de batea a partir de esas reglas.

## Dibujar un tramo

Puede dibujar tuberías sin superficie, pero los brocales, el recubrimiento y las cotas de batea automáticas necesitan una.

1. Pulse {{key:P}}, o haga clic en {{ui:Pipes}} en el grupo **Diseño**.
   La sugerencia dice «Tuberías: haga clic en las estructuras desde la parte superior del tramo hacia abajo (haga clic en una existente para unirla). Intro termina.»
2. Haga clic donde va la estructura aguas arriba. Se coloca una estructura.
3. Haga clic en cada estructura siguiente, aguas abajo. Para conectarse a una estructura que ya existe, haga clic sobre ella: la barra de estado dice «Unida S3».
4. Pulse {{key:Enter}}.
   Se dibujan las tuberías, sus cotas de batea se fijan según las reglas, y la barra de estado indica, por ejemplo, «3 tuberías dibujadas, 12 cotas de batea fijadas según las reglas; todas las comprobaciones se cumplen».

Las nuevas estructuras se llaman S1, S2… con un diámetro de 48 in (1200 mm). Las nuevas tuberías se llaman P1, P2… con un diámetro de 12 in (300 mm). Los diámetros van en pulgadas en un proyecto en pies, y en milímetros en un proyecto en metros.

Termine con {{key:Enter}}. El doble clic también funciona, pero si hace doble clic en una estructura existente para terminar el tramo allí, la unión se descarta: haga clic una vez y luego pulse {{key:Enter}}.

## Defina sus reglas

Sin nada seleccionado, el panel derecho (**Proyecto**) tiene un bloque **Red de tuberías**:

| Ajuste | Valor inicial | Significado |
|---|---|---|
| Tipo | Pluvial | {{ui:Storm}} o {{ui:Sanitary}}; se escribe en LandXML |
| Pendiente mínima | 0.50% | Cada tubería debe caer al menos esto |
| Recubrimiento mínimo | 2 ft (0.6 m) | Desde el terreno hasta la clave de la tubería, a lo largo de toda la tubería |
| Caída en estructuras | 0.10 ft (0.03 m) | La cota de batea de salida debe estar al menos esto por debajo de cada cota de batea de entrada |

**Estos valores iniciales son provisionales, no una norma.** Fije los valores que exija su organismo o su proyecto. El recubrimiento se mide desde el terreno hasta la clave (cota de batea más diámetro interior); el espesor de pared no cuenta. Donde se explanan plataformas o corredores, la superficie explanada es el terreno.

## Deje que CivilCraft fije las cotas de batea

- {{ui:Set every invert from the rules}} (en el bloque **Red de tuberías**) fija todas las tuberías.
- {{ui:Set its inverts from the rules}} (con una tubería seleccionada) fija solo esa tubería.

Trabajando aguas abajo, cada tramo empieza con al menos el recubrimiento en su estructura superior, desciende al menos la pendiente mínima, desciende al menos la caída en cada estructura, y se profundiza siempre que el terreno a lo largo de la tubería dejaría menos del recubrimiento mínimo. Las cotas de batea se redondean hacia abajo a 0.01, nunca hacia arriba. La barra de estado dice «Cotas de batea fijadas: recubrimiento mínimo en la parte superior de cada tramo, al menos la pendiente mínima, al menos la caída en cada estructura», o indica lo que no pudo hacer.

## Editar estructuras y tuberías

Haga clic en una estructura o tubería con {{ui:Select}} para verla en el panel derecho.

**Estructura**: **Nombre**, **Brocal**, **Profundidad del pozo**, **Diámetro**, y después **Brocal usado**, **Pozo de decantación**, **Este** y **Norte**, y las tuberías de entrada y salida con sus cotas de batea.

- Deje vacío el **Brocal** para tomarlo de la superficie; la casilla muestra entonces el valor de la superficie en gris. Escriba un valor para fijar el brocal.
- Arrastre el agarre de la estructura en el plano para moverla. Sus tuberías la siguen; sus cotas de batea se quedan como estaban, así que compruebe los problemas después.

**Tipo**: elija uno de los tipos de estructura de la red (abajo), o ninguno para una estructura circular de su propio diámetro.

**Tubería**: **Nombre**, las estructuras entre las que va, **Diámetro**, **Cota de batea superior**, **Cota de batea inferior**, y después **Longitud**, **Pendiente** y **Recubrimiento mínimo**.

Pulse {{key:Enter}} después de cada valor.

## Leer y corregir problemas

El bloque **Red de tuberías** enumera cada problema (hasta 40); haga clic en uno para seleccionar la tubería o la estructura. Una tubería o estructura seleccionada enumera los suyos. Si no hay ninguno, dice «Todas las tuberías y estructuras cumplen las reglas».

| Mensaje (ejemplos) | Qué hacer |
|---|---|
| «P2 va cuesta arriba (-0.40%).» o «… va en llano …» | Intercambie las cotas de batea, o fíjelas según las reglas. |
| «P2 con 0.30% es más plana que la pendiente mínima de 0.50%.» | Baje la cota de batea aguas abajo o suba la de aguas arriba. |
| «P3 tiene 1.40 de recubrimiento a lo largo de 35, menos que el mínimo de 2.» | Baje la tubería; fije sus cotas de batea según las reglas. |
| «En S3, P4 sale a 245.20, menos de 0.1 por debajo de P3, que entra a 245.25.» | Baje la cota de batea superior de la tubería de salida. |
| «La clave de P1 está por encima del brocal de S1.» | La tubería está demasiado alta para la estructura. |
| «S2 tiene 2 tuberías de salida; una red por gravedad debe tener una sola salida por estructura.» | Elimine una tubería de salida, o vuelva a dibujarla en la dirección correcta. |
| «Las tuberías forman un bucle; el flujo debe acabar en una salida.» | Un tramo se dibujó sobre sí mismo; elimine una tubería. |
| «S5 está fuera de la superficie y no tiene cota de brocal.» | Escriba un brocal, o mueva la estructura sobre la superficie. |
| «P6 va en parte fuera de la superficie; el recubrimiento allí es desconocido.» | Amplíe la superficie, o acepte que allí no se comprueba el recubrimiento. |
| «P7 aún no tiene cotas de batea.» | Escríbalas, o fíjelas según las reglas. |

Las tuberías y estructuras con problemas también se marcan en rojo en el plano.

## Tipos de estructura

Un tipo de estructura es una estructura construida a partir de sus parámetros: un pozo de registro, un sumidero, una arqueta o una salida, **circular** (diámetro interior) o **rectangular** (anchura y longitud interiores), con su **espesor de pared**, **losa de fondo**, un **pozo de decantación** bajo la tubería más baja y un **marco y tapa** (abertura circular o rectangular, altura del marco). Los tipos pertenecen a la red, bajo **Tipos de estructura** en las Propiedades del proyecto.

1. Haga clic en {{ui:New structure type}}. El cuadro dibuja la estructura en planta y en sección mientras escribe.
2. Haga clic en {{ui:Add the type}}.
3. Seleccione una estructura y elija el tipo en **Tipo**. Toma el tamaño y el pozo de decantación del tipo; su propio pozo de decantación todavía puede cambiarse.

Si edita un tipo, cada estructura de ese tipo sigue sus medidas. Si elimina un tipo, sus estructuras se quedan como estructuras circulares de la misma anchura. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

Una estructura rectangular se dibuja en el plano, en DXF, DWG y PDF, y en 3D como un rectángulo con su longitud a lo largo de su tubería de salida; las tuberías parten de su muro. LandXML la escribe como estructura rectangular (`RectStruct`) con su espesor de pared, y lee de vuelta esas estructuras como tipos.

### Compartir un tipo a través de la biblioteca

{{ui:Save as library item}} escribe el tipo como elemento de biblioteca de CadCraft (un archivo `.json`): su símbolo en planta, un cuerpo 3D hasta una profundidad típica, y todas las medidas. Súbalo a la biblioteca para compartirlo. {{ui:Open a library item}} lee de vuelta en la red una estructura guardada así, convertida a las unidades del proyecto. Los elementos de biblioteca que no sean estructuras creadas en CivilCraft se rechazan, indicando el motivo.

## Eliminar

Seleccione una tubería y pulse {{key:Delete}} para eliminarla. Al borrar una estructura se eliminan también las tuberías conectadas a ella. En Mac, pulse Fn y Supr, o haga clic en {{ui:Delete}}.

## No disponible todavía

Los caudales, los diámetros de tubería y la línea de gradiente hidráulico están en [Drenaje pluvial](topic:storm-drainage). Los catálogos de tuberías, las tuberías no circulares, las tuberías en la vista de perfil, las tuberías curvas y más de una red por proyecto todavía no están disponibles. Vea [Aún no disponible](topic:not-built-yet).
