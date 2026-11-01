---
title: Navegadores y computadoras
summary: En qué navegadores se ejecutan las aplicaciones, qué cambia entre ellos y qué necesita su computadora.
keywords: chrome, edge, firefox, safari, brave, navegador, mac, windows, linux, ipad, tableta, webgl, requisitos, memoria
from: a11b09b1
---

Las aplicaciones se ejecutan dentro de un navegador web. Hacen el trabajo en su propia computadora: sus archivos se abren allí y nunca se nos envían (vea [Adónde van sus archivos](common:your-files)).

## Qué navegador usar

Use una versión actualizada de alguno de estos:

| Navegador | Motor | Notas |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | El más completo: selección de carpetas, guardado para usar sin conexión, manejo de archivos. |
| Firefox | Gecko | Funciona. Abrir una carpeta completa usa un selector más sencillo. Puede que el guardado sin conexión no funcione en ventanas privadas. |
| Safari | WebKit | Funciona en Mac y iPad. Abrir una carpeta completa usa un selector más sencillo. Safari puede borrar una copia sin conexión que no haya usado en unas semanas. |

Los tres motores sirven para el trabajo diario. Donde una aplicación hace algo distinto en uno de ellos, su ayuda muestra los pasos para su navegador.

## Qué cambia entre navegadores

- **Abrir una carpeta.** Los navegadores Chromium muestran un selector de carpetas real y pueden leerla directamente. Firefox y Safari le piden que elija una carpeta y luego leen todos los archivos que contiene, lo que tarda más en carpetas de proyecto grandes; arrastrar la carpeta a la aplicación funciona en los tres.
- **Guardar.** Las aplicaciones guardan descargando un archivo. Su navegador decide adónde van las descargas y si pregunta antes.

:::chromium
En Chrome o Edge, active "Preguntar dónde guardar cada archivo antes de descargarlo" (en Configuración, en Descargas) para elegir una carpeta cada vez.
:::

:::firefox
En Firefox, abra Configuración, luego General, luego Descargas, y elija "Siempre preguntar dónde guardar los archivos" para elegir una carpeta cada vez.
:::

:::safari
En Safari, abra Configuración, luego General, y fije "Ubicación de descarga de archivos" en "Preguntar por cada descarga" para elegir una carpeta cada vez.
:::

## Mac, Windows y Linux

Las aplicaciones son iguales en todas las computadoras. Lo que cambia es el teclado: los atajos se escriben automáticamente para su computadora. Vea [Teclas, mouse y trackpads](common:keys).

## Tabletas y pantallas táctiles

Algunas aplicaciones aceptan el tacto (un dedo dibuja o selecciona, dos dedos pellizcan para hacer zoom y encuadre). La ayuda de cada aplicación indica si lo hace. En un iPad, use Safari o Chrome. Un teclado ayuda con las aplicaciones que usan comandos escritos.

## El navegador y el sistema más antiguos

Esto lo leímos del código de las aplicaciones 0.7, no lo adivinamos: se analizó cada archivo y se buscó cada característica del lenguaje que usa en los datos de compatibilidad publicados de los navegadores. Con versiones anteriores a estas, las aplicaciones ni siquiera pueden iniciar, porque el navegador no entiende el código.

| | Versión más antigua que puede iniciar las aplicaciones |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS y iOS 16.4) |

CadCraft Studio lleva su propio motor web en Windows, así que necesita Windows 10 u 11; en una Mac usa el del sistema, así que necesita macOS 13.3 o posterior. Configuración › Actualizaciones en Studio muestra con qué se ejecuta su copia.

Esta es la versión más antigua que *inicia*, leída del código. No es una lista de navegadores antiguos en los que ejecutamos las aplicaciones, así que uno más antiguo que inicie aún puede carecer de alguna función.

## Qué necesita su computadora

Estos son mínimos planeados para las aplicaciones, no requisitos medidos:

- 8 GB de memoria (se recomiendan 16 GB para modelos federados grandes).
- Un chip gráfico con WebGL 2 para las aplicaciones 3D. Si una vista 3D queda en blanco, compruebe que la aceleración por hardware esté activada en la configuración de su navegador.
- Una pantalla de al menos 1280 píxeles de ancho para ver completas las barras de herramientas; las pantallas más pequeñas las ajustan en varias líneas.

Los archivos muy grandes (juegos de planos grandes, modelos grandes) usan mucha memoria en una pestaña del navegador. Cierre otras pestañas pesadas si una aplicación se vuelve lenta.
