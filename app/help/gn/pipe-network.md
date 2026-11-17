---
title: Trazar una red de caños por gravedad
summary: Dibuje tramos de caños pluviales o cloacales estructura por estructura, fije sus reglas de pendiente, recubrimiento y caída, deje que CivilCraft fije las cotas de fondo, y corrija los problemas que lista.
keywords: constructor de estructuras, tipo de estructura, estructura rectangular, boca de registro, marco, recubrimiento, espesor de pared, elemento de biblioteca, red de caños, pluvial, cloacal, alcantarilla, estructuras, cámaras, bocas de tormenta, cotas de fondo, pendiente, caída, cota de tapa, pozo de decantación, caños por gravedad
from: 10a3c14d
---

Un proyecto contiene una red de caños por gravedad, pluvial o cloacal. Se compone de estructuras (cámaras, bocas) y caños rectos entre ellas. El flujo va en la dirección en que usted dibuja. CivilCraft verifica cada caño y cada estructura contra tres reglas que usted fija, y puede fijar todas las cotas de fondo a partir de ellas.

## Dibujar un tramo

Puede dibujar caños sin superficie, pero las cotas de tapa, el recubrimiento y las cotas de fondo automáticas necesitan una.

1. Presione {{key:P}}, o haga clic en {{ui:Caños}} en el grupo **Diseño**.
   La indicación dice "Caños: haga clic en las estructuras desde arriba del tramo hacia abajo (haga clic en una existente para unirla). Enter termina."
2. Haga clic donde va la estructura aguas arriba. Se coloca una estructura.
3. Haga clic en cada estructura siguiente, aguas abajo. Para conectar con una estructura que ya existe, haga clic sobre ella: la barra de estado dice "Unida S3."
4. Presione {{key:Enter}}.
   Se dibujan los caños, sus cotas de fondo se fijan según las reglas, y la barra de estado dice, por ejemplo, "3 caños dibujados, 12 cotas de fondo fijadas según las reglas; todas las verificaciones pasan."

Las estructuras nuevas se nombran S1, S2 … con un diámetro de 48 in (1200 mm). Los caños nuevos se nombran P1, P2 … con un diámetro de 12 in (300 mm). Los diámetros van en pulgadas en un proyecto en pies, y en milímetros en un proyecto en metros.

Termine con {{key:Enter}}. El doble clic también funciona, pero si hace doble clic en una estructura existente para terminar allí el tramo, la unión se pierde: haga clic una vez y luego presione {{key:Enter}}.

## Fijar sus reglas

Sin nada seleccionado, el panel derecho (**Proyecto**) tiene un bloque **Red de caños**:

| Ajuste | Valor inicial | Significado |
|---|---|---|
| Tipo | {{ui:Pluvial}} | {{ui:Pluvial}} o {{ui:Cloacal}}; se escribe en LandXML |
| Pendiente mínima | 0.50% | Cada caño debe caer al menos esto |
| Recubrimiento mínimo | 2 ft (0.6 m) | Del terreno a la corona del caño, a lo largo de todo el caño |
| Caída en estructuras | 0.10 ft (0.03 m) | La cota de fondo de salida debe estar al menos esto por debajo de cada cota de entrada |

**Estos valores iniciales son marcadores de posición, no una norma.** Fije los valores que exige su organismo o proyecto. El recubrimiento se mide desde el terreno hasta la corona (cota de fondo más diámetro interior); el espesor de pared no se cuenta. Donde se nivelan plataformas o corredores, la superficie nivelada es el terreno.

## Dejar que CivilCraft fije las cotas de fondo

- {{ui:Fijar todas las cotas de fondo según las reglas}} (en el bloque **Red de caños**) fija todos los caños.
- {{ui:Fijar sus cotas de fondo según las reglas}} (con un caño seleccionado) fija solo ese caño.

Trabajando aguas abajo, cada tramo empieza con al menos el recubrimiento en su estructura superior, desciende al menos la pendiente mínima, cae al menos la caída en cada estructura, y se profundiza donde el terreno a lo largo del caño dejaría menos que el recubrimiento mínimo. Las cotas de fondo se redondean hacia abajo, a 0.01, nunca hacia arriba. La barra de estado dice "Cotas de fondo fijadas: recubrimiento mínimo en la parte superior de cada tramo, al menos la pendiente mínima, al menos la caída en cada estructura." o nombra lo que no pudo hacer.

## Editar estructuras y caños

Haga clic en una estructura o un caño con {{ui:Seleccionar}} para verlo en el panel derecho.

**Estructura**: **Nombre**, **Cota de tapa**, **Profundidad del pozo**, **Diámetro**, luego **Cota de tapa usada**, **Pozo**, **Este** y **Norte**, y los caños de entrada y salida con sus cotas de fondo.

- Deje **Cota de tapa** vacía para tomarla de la superficie; el cuadro entonces muestra el valor de la superficie en gris. Escriba un valor para fijar la cota de tapa.
- Arrastre el punto de control de la estructura en el plano para moverla. Sus caños la siguen; sus cotas de fondo se mantienen como estaban, así que revise los problemas después.

**Tipo**: elija uno de los tipos de estructura de la red (abajo), o ninguno para una estructura redonda de su propio diámetro.

**Caño**: **Nombre**, las estructuras entre las que va, **Diámetro**, **Cota de fondo superior**, **Cota de fondo inferior**, luego **Longitud**, **Pendiente** y **Recubrimiento mínimo**.

Presione {{key:Enter}} después de cada valor.

## Leer y corregir problemas

El bloque **Red de caños** lista cada problema (hasta 40); haga clic en uno para seleccionar el caño o la estructura. Un caño o una estructura seleccionados listan los suyos. Si no hay ninguno, dice "Todos los caños y estructuras cumplen las reglas."

| Mensaje (ejemplos) | Qué hacer |
|---|---|
| "P2 sube (-0.40%)." o "… es plano …" | Intercambie las cotas de fondo, o fíjelas según las reglas. |
| "P2 con 0.30% es más plano que la pendiente mínima de 0.50%." | Baje la cota de fondo aguas abajo, o suba la aguas arriba. |
| "P3 tiene 1.40 de recubrimiento 35 a lo largo, menos que el mínimo 2." | Baje el caño; fije sus cotas de fondo según las reglas. |
| "En S3, P4 sale en 245.20, menos que 0.1 bajo P3 que entra en 245.25." | Baje la cota de fondo superior del caño de salida. |
| "La corona de P1 está por encima de la cota de tapa de S1." | El caño está demasiado alto para la estructura. |
| "S2 tiene 2 caños que salen de ella; una red por gravedad debe tener una sola salida por estructura." | Quite un caño de salida, o vuelva a dibujarlo en la dirección correcta. |
| "Los caños forman un bucle; el flujo debe terminar en una salida." | Un tramo se dibujó sobre sí mismo; elimine un caño. |
| "S5 está fuera de la superficie y no tiene cota de tapa." | Escriba una cota de tapa, o mueva la estructura sobre la superficie. |
| "P6 queda parcialmente fuera de la superficie; el recubrimiento allí es desconocido." | Extienda la superficie, o acepte que el recubrimiento allí no se verifique. |
| "P7 todavía no tiene cotas de fondo." | Escríbalas, o fíjelas según las reglas. |

Los caños y estructuras con problemas también se marcan en rojo en el plano.

## Tipos de estructura

Un tipo de estructura es una estructura construida a partir de sus parámetros: una cámara, una boca de tormenta, una caja de empalme o una salida, **redonda** (diámetro interior) o **rectangular** (ancho y largo interiores), con su **espesor de pared**, **losa de piso**, un **pozo** bajo el caño más bajo y un **marco y tapa** (abertura redonda o rectangular, altura del marco). Los tipos pertenecen a la red, bajo **Tipos de estructura** en las Propiedades del proyecto.

1. Haga clic en {{ui:Nuevo tipo de estructura}}. El cuadro dibuja la estructura en planta y en corte mientras usted escribe.
2. Haga clic en {{ui:Agregar el tipo}}.
3. Seleccione una estructura y elija el tipo en **Tipo**. Toma el tamaño y el pozo del tipo; su propio pozo todavía puede cambiarse.

Edite un tipo y cada estructura de ese tipo sigue sus tamaños. Quite un tipo y sus estructuras se quedan como estructuras redondas del mismo ancho. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

Una estructura rectangular se dibuja en el plano, en DXF, DWG y PDF, y en 3D como un rectángulo con su largo a lo largo de su caño de salida; los caños empiezan en su pared. LandXML la escribe como estructura rectangular (`RectStruct`) con su espesor de pared, y lee esas estructuras de vuelta como tipos.

### Compartir un tipo por la biblioteca

{{ui:Guardar como elemento de biblioteca}} escribe el tipo como elemento de biblioteca de CadCraft (un archivo `.json`): su símbolo de planta, un cuerpo 3D hasta una profundidad típica, y todos los tamaños. Súbalo a la biblioteca para compartirlo. {{ui:Abrir un elemento de biblioteca}} lee de vuelta una estructura guardada así en la red, convertida a las unidades del proyecto. Los elementos de biblioteca que no son estructuras hechas en CivilCraft se rechazan, con el motivo.

## Eliminar

Seleccione un caño y presione {{key:Delete}} para quitarlo. Eliminar una estructura quita también los caños conectados a ella. En Mac, presione Fn y Delete, o haga clic en {{ui:Eliminar}}.

## Aún no disponible

Caudales, tamaños de caño y la línea de gradiente hidráulico están en [Drenaje pluvial](topic:storm-drainage). Los catálogos de caños, los caños no circulares, los caños en la vista de perfil, los caños curvos y más de una red por proyecto todavía no están disponibles. Vea [Aún no disponible](topic:not-built-yet).
