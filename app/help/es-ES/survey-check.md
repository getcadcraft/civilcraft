---
title: Revisar un plano de levantamiento al importarlo
summary: Leer las cotas escritas como texto o en atributos de bloque como puntos de levantamiento, y revisar un DWG o DXF por unidades erróneas, falta de sistema de coordenadas, origen lejano, curvas planas, cotas extrañas y puntos duplicados antes de construir el terreno a partir de él.
keywords: revisión de levantamiento, comprobación de importación, cotas de levantamiento, cotas puntuales, cotas como texto, atributos, unidades, sistema de coordenadas, lejos del origen, curvas a cero, valores atípicos, puntos duplicados, problemas, arquitecto paisajista, plano de levantamiento
from: d46acd24
---

Un plano de levantamiento puede parecer correcto y, sin embargo, no servir para un terreno: sus unidades pueden ser supuestas, sus curvas de nivel pueden quedar planas a altura 0, o sus cotas pueden estar escritas como texto que no es geometría. La sección **Cotas de levantamiento y comprobación** del cuadro {{ui:Geometría lineal}} (véase [Abrir un DWG o DXF como geometría lineal](topic:open-dwg-dxf)) lee esas cotas e indica qué parece incorrecto antes de añadir nada.

## Cotas escritas como texto o en atributos

Muchos planos de levantamiento indican una cota puntual mediante un pequeño texto junto a una cruz, como `104.37` o `EL 104.37`, o como un atributo de un bloque de punto. No son líneas, así que el lector de geometría lineal las omite. La sección indica cuántas ha encontrado y le permite tomarlas como **puntos de levantamiento**:

1. Marque **Tomar … cotas como puntos de levantamiento**. Empieza sin marcar, porque no todo número de un plano es una altura.
2. Se lee el texto cuando es una cota por sí misma: un número con parte decimal (`104.37`, `+104,37`, `-3.50`), o un número tras `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` o `LEVEL`, con un `m`, `ft` o `'` opcional después. Un número entero solo (`12`) se lee como número de parcela o de hoja, no como cota; el texto como `GATE 3` o una fecha nunca se lee. Se ignoran los códigos de formato de texto.
3. Para los atributos de bloque, elija **Atributo de bloque que contiene la cota**. CivilCraft encuentra por sí mismo una etiqueta llamada ELEV, Z, LEVEL, RL o similar; elija otra de la lista si el plano usa la suya. La elección se recuerda para ese nombre de archivo en este equipo, así que al volver a abrirlo empieza con la misma etiqueta. Una etiqueta que usted elija también toma los números enteros como cotas.
4. Pulse {{ui:Añadir}}. Los puntos se numeran a continuación del número más alto del proyecto, cada punto se describe con su capa (o su bloque), y las alturas se convierten a las unidades del proyecto como el resto del plano. Todo ello es un solo paso: {{key:Mod+Z}} quita los puntos.

El texto se sitúa en su propio punto de inserción (o en su punto de alineación, si lo tiene). No se lee el texto dentro de los bloques y el plano nunca se modifica.

## La comprobación

La comprobación se hace sobre lo que va a importar y enumera lo que encuentra, una línea por cada tipo de problema:

| Indica | Qué significa |
|---|---|
| **Unidades no indicadas** | El plano no indica sus unidades, así que sus números se leen como las unidades del proyecto. Compruebe una distancia que conozca. |
| **Unidades convertidas** | Las unidades del plano difieren de las del proyecto y se escalan (es una nota, no un fallo). |
| **Los datos abarcan … km** o **… m** | La extensión es mayor de 200 km o menor de medio metro, lo que suele indicar una unidad incorrecta (milímetros leídos como metros, o al revés). |
| **Sin sistema de coordenadas** | El proyecto no tiene ninguno. Es una advertencia cuando los datos están lejos del cero, como ocurre con coordenadas de cuadrícula nacional o estatal. Véase [Sistemas de coordenadas](topic:coordinate-systems). |
| **Lejos del origen** | Los datos están a más de 100 km del cero. Lejos del cero, las vistas 3D y las exportaciones pierden precisión y tiemblan. |
| **La capa de curvas … no tiene altura** | Una capa con nombre de curvas (TOPO, CONT, CNTR, CONTOUR) contiene líneas a altura 0, así que un terreno construido con ellas quedaría plano. |
| **Cotas exactamente 0** | Algunas cotas valen 0 mientras la cota típica está muy lejos de ese valor: probablemente faltan alturas. |
| **Cotas alejadas del resto** | Algunas cotas están muy fuera de las demás (se mide frente al centro de todas las cotas, así que un emplazamiento empinado con un rango amplio no se marca), o por encima de 9,000 m o por debajo de -11,000 m. |
| **Puntos sobre otro punto** | Dos puntos en el mismo lugar con la misma cota, o con cotas distintas. |

Después de pulsar {{ui:Añadir}}, las mismas líneas pasan a **Problemas**, una por cada tipo, con el nombre del archivo, para que pueda volver a ellas. La comprobación evalúa el plano; no cambia nada en él y no le impide usarlo.

:::tip
Cuando la comprobación indique que las curvas están planas a 0 y hay cotas escritas como texto, tómelas como puntos de levantamiento: a menudo contienen las alturas reales que faltan en las líneas de curvas de nivel.
:::

## Lo que no se comprueba

La comprobación no compara el plano con un segundo levantamiento y no puede saber en qué sistema de coordenadas está el plano: solo indica que no hay ninguno definido.
