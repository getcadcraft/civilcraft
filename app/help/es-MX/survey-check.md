---
title: Revisar un plano topográfico al importarlo
summary: Lea los niveles escritos como texto o en atributos de bloque como puntos topográficos, y revise un DWG o DXF por unidades incorrectas, falta de sistema de coordenadas, origen lejano, curvas planas, niveles extraños y puntos duplicados antes de construir el terreno con él.
keywords: revisión topográfica, revisión al importar, niveles topográficos, cotas puntuales, niveles como texto, atributos, unidades, sistema de coordenadas, lejos del origen, curvas en cero, valores atípicos, puntos duplicados, problemas, arquitecto paisajista, plano topográfico
from: d46acd24
---

Un plano topográfico puede verse bien y aun así ser incorrecto para un terreno: sus unidades pueden ser supuestas, sus curvas de nivel pueden quedar planas en la altura 0, o sus niveles pueden estar escritos como texto que no es geometría en absoluto. La sección **Niveles topográficos y revisión** del cuadro de diálogo {{ui:Geometría lineal}} (vea [Abrir un DWG o DXF como geometría lineal](topic:open-dwg-dxf)) lee esos niveles y le indica qué parece incorrecto antes de agregar algo.

## Niveles escritos como texto o en atributos

Muchos planos topográficos dan una cota puntual como un pequeño texto junto a una cruz, como `104.37` o `EL 104.37`, o como un atributo de un bloque de punto. Estos no son líneas, así que el lector de geometría lineal los omite. La sección indica cuántos encontró y le permite tomarlos como **puntos topográficos**:

1. Marque **Tomar … niveles como puntos topográficos**. Empiezan sin marcar, porque no todo número de un plano es una altura.
2. El texto se lee cuando es un nivel por sí solo: un número con parte decimal (`104.37`, `+104,37`, `-3.50`), o un número después de `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` o `LEVEL`, con una `m`, `ft` o `'` opcional después. Un número entero solo (`12`) se lee como número de lote o de hoja, no como nivel; un texto como `GATE 3` o una fecha nunca se lee. Se ignoran los códigos de formato del texto.
3. En atributos de bloque, elija **Atributo de bloque que contiene el nivel**. CivilCraft encuentra por sí solo una etiqueta llamada ELEV, Z, LEVEL, RL o similar; elija otra de la lista si el plano usa la suya. La elección se recuerda para ese nombre de archivo en esta computadora, así que al abrirlo de nuevo empieza con la misma etiqueta. Una etiqueta que usted elija toma también los números enteros como niveles.
4. Pulse {{ui:Agregar}}. Los puntos se numeran a partir del número más alto del proyecto, cada punto se describe con su capa (o su bloque), y las alturas se convierten a las unidades del proyecto como el resto del dibujo. Todo es un solo paso: {{key:Mod+Z}} quita los puntos.

El texto se ubica en su propio punto de inserción (o en su punto de alineación, cuando tiene uno). El texto dentro de bloques no se lee, y el dibujo nunca se modifica.

## La revisión

La revisión se aplica a lo que está por importar y enumera lo que encuentra, una línea por cada tipo de problema:

| Dice | Qué significa |
|---|---|
| **Unidades no indicadas** | El plano no dice cuáles son sus unidades, así que sus números se leen en las unidades del proyecto. Verifique una distancia que conozca. |
| **Unidades convertidas** | Las unidades del plano difieren de las del proyecto y se escalan (una nota, no una falla). |
| **Los datos abarcan … km** o **… m** | La extensión es mayor que 200 km o menor que medio metro, lo que normalmente indica una unidad equivocada (milímetros leídos como metros, o al revés). |
| **Sin sistema de coordenadas** | El proyecto no tiene ninguno. Es una advertencia cuando los datos están lejos de cero, como ocurre con coordenadas de plano estatal o de red nacional. Vea [Sistemas de coordenadas](topic:coordinate-systems). |
| **Lejos del origen** | Los datos están a más de 100 km de cero. Lejos de cero, las vistas 3D y las exportaciones pierden precisión y tiemblan. |
| **La capa de curvas … no tiene altura** | Una capa con nombre de curvas (TOPO, CONT, CNTR, CONTOUR) tiene líneas a altura 0, así que un terreno construido con ellas quedaría plano. |
| **Niveles exactamente 0** | Algunos niveles son 0 mientras el nivel típico está lejos de eso: probablemente faltan alturas. |
| **Niveles alejados del resto** | Algunos niveles quedan muy fuera de los demás (medidos contra el centro de todos los niveles, así que un sitio empinado con un rango amplio no se marca), o por encima de 9,000 m o por debajo de -11,000 m. |
| **Puntos sobre otro punto** | Dos puntos en el mismo lugar con el mismo nivel, o con niveles distintos. |

Después de pulsar {{ui:Agregar}}, las mismas líneas van a **Problemas**, una por cada tipo, con el nombre del archivo, para que pueda volver a ellas. La revisión juzga el plano; no cambia nada en él, y no le impide usarlo.

:::tip
Cuando la revisión dice que las curvas están planas en 0 y hay niveles escritos como texto, tome los niveles como puntos topográficos: a menudo tienen las alturas reales que les faltan a las líneas de curvas.
:::

## Lo que no se revisa

La revisión no compara el plano con un segundo levantamiento, y no puede saber en qué sistema de coordenadas está el plano: solo indica que no hay ninguno definido.
