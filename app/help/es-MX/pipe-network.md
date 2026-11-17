---
title: Trazar una red de tuberías por gravedad
summary: Dibuje tramos de tuberías pluviales o sanitarias estructura por estructura, defina sus reglas de pendiente, recubrimiento y caída, deje que CivilCraft fije las cotas de batea, y corrija los problemas que enumera.
keywords: constructor de estructuras, tipo de estructura, estructura rectangular, pozo de visita, coladera, marco, recubrimiento, espesor de pared, elemento de biblioteca, red de tuberías, pluvial, sanitario, alcantarillado, estructuras, pozos de registro, cotas de batea, pendiente, caída, brocal, sumidero, tuberías por gravedad
from: 10a3c14d
---

Un proyecto contiene una sola red de tuberías por gravedad, pluvial o sanitaria. Se compone de estructuras (pozos de registro, coladeras) y tuberías rectas entre ellas. El flujo va en la dirección en que usted dibuja. CivilCraft verifica cada tubería y estructura contra tres reglas que usted define, y puede fijar todas las cotas de batea a partir de esas reglas.

## Dibujar un tramo

Puede dibujar tuberías sin superficie, pero los brocales, el recubrimiento y las cotas de batea automáticas la necesitan.

1. Pulse {{key:P}}, o haga clic en {{ui:Tuberías}} en el grupo **Diseño**.
   La indicación dice "Tuberías: haga clic en las estructuras desde la parte alta del tramo hacia abajo (haga clic en una existente para unirla). Enter termina."
2. Haga clic donde va la estructura aguas arriba. Se coloca una estructura.
3. Haga clic en cada estructura siguiente, aguas abajo. Para conectarse a una estructura que ya existe, haga clic en ella: la barra de estado dice "Unida a S3."
4. Pulse {{key:Enter}}.
   Las tuberías se dibujan, sus cotas de batea se fijan según las reglas, y la barra de estado dice, por ejemplo, "3 tuberías dibujadas, 12 cotas de batea fijadas según las reglas; todas las verificaciones pasan."

Las nuevas estructuras se nombran S1, S2 … con un diámetro de 48 in (1200 mm). Las nuevas tuberías se nombran P1, P2 … con un diámetro de 12 in (300 mm). Los diámetros están en pulgadas en un proyecto en pies, y en milímetros en un proyecto en metros.

Termine con {{key:Enter}}. El doble clic también funciona, pero si hace doble clic en una estructura existente para terminar el tramo allí, la unión se descarta: haga clic una vez y luego pulse {{key:Enter}}.

## Defina sus reglas

Sin nada seleccionado, el panel derecho (**Proyecto**) tiene un bloque **Red de tuberías**:

| Ajuste | Valor inicial | Significado |
|---|---|---|
| Tipo | Pluvial | {{ui:Pluvial}} o {{ui:Sanitario}}; se escribe en LandXML |
| Pendiente mínima | 0.50% | Cada tubería debe caer al menos esto |
| Recubrimiento mínimo | 2 ft (0.6 m) | Del terreno a la clave de la tubería, a lo largo de toda la tubería |
| Caída en estructuras | 0.10 ft (0.03 m) | La cota de batea de salida debe estar al menos así de abajo de cada cota de batea de entrada |

**Estos valores iniciales son provisionales, no una norma.** Defina los valores que exige su agencia o proyecto. El recubrimiento se mide del terreno a la clave (cota de batea más diámetro interior); el espesor de pared no se cuenta. Donde se nivelan plataformas u obras lineales, la superficie nivelada es el terreno.

## Deje que CivilCraft fije las cotas de batea

- {{ui:Establecer todas las plantillas según las reglas}} (en el bloque **Red de tuberías**) fija todas las tuberías.
- {{ui:Establecer sus plantillas según las reglas}} (con una tubería seleccionada) fija solo esa tubería.

Trabajando aguas abajo, cada tramo empieza con al menos el recubrimiento en su estructura superior, desciende al menos la pendiente mínima, cae al menos la caída en cada estructura, y se hunde más donde el terreno a lo largo de la tubería dejaría menos que el recubrimiento mínimo. Las cotas de batea se redondean hacia abajo a 0.01, nunca hacia arriba. La barra de estado dice "Cotas de batea fijadas: recubrimiento mínimo en la parte superior de cada tramo, al menos la pendiente mínima, al menos la caída en cada estructura." o nombra lo que no pudo hacer.

## Edite estructuras y tuberías

Haga clic en una estructura o tubería con {{ui:Seleccionar}} para verla en el panel derecho.

**Estructura**: **Nombre**, **Brocal**, **Profundidad del sumidero**, **Diámetro**, luego **Brocal usado**, **Sumidero**, **Este** y **Norte**, y las tuberías de entrada y salida con sus cotas de batea.

- Deje **Brocal** vacío para tomarlo de la superficie; el cuadro entonces muestra el valor de la superficie en gris. Escriba un valor para fijar el brocal.
- Arrastre el pinzamiento de la estructura en el plano para moverla. Sus tuberías la siguen; sus cotas de batea se mantienen como estaban, así que revise los problemas después.

**Tipo**: elija uno de los tipos de estructura de la red (abajo), o ninguno para una estructura redonda de su propio diámetro.

**Tubería**: **Nombre**, las estructuras entre las que corre, **Diámetro**, **Cota de batea superior**, **Cota de batea inferior**, luego **Longitud**, **Pendiente** y **Recubrimiento mínimo**.

Pulse {{key:Enter}} después de cada valor.

## Lea y corrija los problemas

El bloque **Red de tuberías** enumera cada problema (hasta 40); haga clic en uno para seleccionar la tubería o estructura. Una tubería o estructura seleccionada enumera los suyos. Sin selección, dice "Todas las tuberías y estructuras cumplen las reglas."

| Mensaje (ejemplos) | Qué hacer |
|---|---|
| "P2 sube (-0.40%)." o "… va plana …" | Intercambie las cotas de batea, o fíjelas según las reglas. |
| "P2 con 0.30% es más plana que la mínima de 0.50%." | Baje la cota de batea aguas abajo o suba la aguas arriba. |
| "P3 tiene 1.40 de recubrimiento en 35 a lo largo, menos que el mínimo de 2." | Baje la tubería; fije sus cotas de batea según las reglas. |
| "En S3, P4 sale en 245.20, menos de 0.1 por debajo de P3 que entra en 245.25." | Baje la cota de batea superior de la tubería de salida. |
| "La clave de P1 está por encima del brocal de S1." | La tubería está demasiado alta para la estructura. |
| "S2 tiene 2 tuberías de salida; una red por gravedad debe tener una sola salida por estructura." | Quite una tubería de salida, o vuelva a dibujarla en la dirección correcta. |
| "Las tuberías forman un circuito; el flujo debe terminar en una salida." | Un tramo se dibujó de regreso sobre sí mismo; borre una tubería. |
| "S5 está fuera de la superficie y no tiene elevación de brocal." | Escriba un brocal, o mueva la estructura a la superficie. |
| "P6 queda parcialmente fuera de la superficie; el recubrimiento ahí es desconocido." | Extienda la superficie, o acepte que el recubrimiento no se verifica ahí. |
| "P7 aún no tiene cotas de batea." | Escríbalas, o fíjelas según las reglas. |

Los tubos y estructuras con problemas también se marcan en rojo en el plano.

## Tipos de estructura

Un tipo de estructura es una estructura construida a partir de sus parámetros: un pozo de registro, coladera, caja de unión o salida, **redonda** (diámetro interior) o **rectangular** (ancho y largo interiores), con su **espesor de pared**, **losa de piso**, un **sumidero** bajo la tubería más baja y un **marco y tapa** (abertura redonda o rectangular, altura del marco). Los tipos pertenecen a la red, bajo **Tipos de estructura** en las Propiedades del proyecto.

1. Haga clic en {{ui:Nuevo tipo de estructura}}. El cuadro dibuja la estructura en planta y en corte mientras escribe.
2. Haga clic en {{ui:Agregar el tipo}}.
3. Seleccione una estructura y elija el tipo en **Tipo**. Toma el tamaño y el sumidero del tipo; su propio sumidero aún puede cambiarse.

Edite un tipo y cada estructura de ese tipo sigue sus tamaños. Quite un tipo y sus estructuras se quedan como estructuras redondas del mismo ancho. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

Una estructura rectangular se dibuja en el plano, en DXF, DWG y PDF, y en 3D como un rectángulo con su largo a lo largo de su tubería de salida; las tuberías empiezan en su muro. LandXML la escribe como estructura rectangular (`RectStruct`) con su espesor de pared, y lee esas estructuras de vuelta como tipos.

### Comparta un tipo mediante la biblioteca

{{ui:Guardar como elemento de biblioteca}} escribe el tipo como elemento de biblioteca de CadCraft (un archivo `.json`): su símbolo en planta, un cuerpo 3D hasta una profundidad típica, y todos los tamaños. Súbalo a la biblioteca para compartirlo. {{ui:Abrir un elemento de biblioteca}} lee de vuelta una estructura guardada así en la red, convertida a las unidades del proyecto. Los elementos de biblioteca que no son estructuras hechas en CivilCraft se rechazan, con el motivo.

## Eliminar

Seleccione una tubería y pulse {{key:Delete}} para quitarla. Eliminar una estructura quita también las tuberías conectadas a ella. En una Mac, pulse Fn y suprimir, o haga clic en {{ui:Eliminar}}.

## Aún no disponible

Los caudales, los tamaños de tubería y la línea de gradiente hidráulico están en [Drenaje pluvial](topic:storm-drainage). Los catálogos de tuberías, las tuberías no circulares, las tuberías en la vista de perfil, las tuberías curvas y más de una red por proyecto aún no están disponibles. Vea [Aún no disponible](topic:not-built-yet).
