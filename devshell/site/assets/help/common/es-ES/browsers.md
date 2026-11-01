---
title: Navegadores y ordenadores
summary: En qué navegadores se ejecutan las aplicaciones, qué cambia de uno a otro y qué necesita su ordenador.
keywords: chrome, edge, firefox, safari, brave, navegador, mac, windows, linux, ipad, tableta, webgl, requisitos, memoria
from: a11b09b1
---

Las aplicaciones se ejecutan dentro de un navegador web. Hacen el trabajo en su propio ordenador: sus archivos se abren allí y nunca se nos envían (vea [Adónde van sus archivos](common:your-files)).

## Qué navegador

Use una versión actualizada de uno de estos:

| Navegador | Motor | Notas |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | El más completo: selección de carpetas, guardado para uso sin conexión, gestión de archivos. |
| Firefox | Gecko | Funciona. Para abrir una carpeta entera usa un selector más sencillo. Puede que el guardado sin conexión no funcione en ventanas privadas. |
| Safari | WebKit | Funciona en Mac y en iPad. Para abrir una carpeta entera usa un selector más sencillo. Safari puede borrar una copia sin conexión que lleve unas semanas sin usar. |

Los tres motores sirven para el trabajo diario. Cuando una aplicación hace algo de forma distinta en uno de ellos, su ayuda muestra los pasos para su navegador.

## Qué cambia entre navegadores

- **Abrir una carpeta.** Los navegadores Chromium muestran un selector de carpetas de verdad y pueden leer la carpeta directamente. Firefox y Safari le piden que elija una carpeta y luego leen todos los archivos que contiene, lo que tarda más en carpetas de proyecto grandes; arrastrar la carpeta sobre la aplicación funciona en los tres.
- **Guardar.** Las aplicaciones guardan descargando un archivo. Su navegador decide adónde van las descargas y si pregunta antes.

:::chromium
En Chrome o Edge, active «Preguntar dónde guardar cada archivo antes de descargar» (en Configuración, dentro de Descargas) para elegir una carpeta cada vez.
:::

:::firefox
En Firefox, abra Ajustes, después General, después Descargas, y elija «Preguntarle siempre dónde guardar los archivos» para elegir una carpeta cada vez.
:::

:::safari
En Safari, abra Ajustes, después General, y establezca «Ubicación de descarga de archivos» en «Preguntar para cada descarga» para elegir una carpeta cada vez.
:::

## Mac, Windows y Linux

Las aplicaciones son iguales en todos los ordenadores. Lo que cambia es el teclado: los atajos se escriben automáticamente para su ordenador. Vea [Teclas, ratones y trackpads](common:keys).

## Tabletas y pantallas táctiles

Algunas aplicaciones admiten el tacto (un dedo dibuja o selecciona, dos dedos hacen pellizco para ampliar y desplazan la vista). La ayuda de cada aplicación dice si lo admite. En un iPad, use Safari o Chrome. Un teclado ayuda con las aplicaciones que usan comandos escritos.

## El navegador y el sistema más antiguos

Lo hemos leído del código de las aplicaciones 0.7, no lo hemos supuesto: se analizó cada archivo y se buscó cada función del lenguaje que usa en los datos de compatibilidad publicados de los navegadores. Por debajo de estas versiones las aplicaciones ni siquiera pueden arrancar, porque el navegador no entiende el código.

| | Versión más antigua que puede arrancar las aplicaciones |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS e iOS 16.4) |

CadCraft Studio lleva su propio motor web en Windows, así que necesita Windows 10 u 11; en un Mac usa el del sistema, así que necesita macOS 13.3 o posterior. Ajustes › Actualizaciones en Studio muestra con qué se ejecuta su copia.

Esta es la versión más antigua que *arranca*, leída del código. No es una lista de navegadores antiguos en los que hayamos ejecutado las aplicaciones, así que uno más antiguo que arranque aún puede carecer de alguna función.

## Qué necesita su ordenador

Estos son mínimos previstos para las aplicaciones, no requisitos medidos:

- 8 GB de memoria (se recomiendan 16 GB para modelos federados grandes).
- Un chip gráfico con WebGL 2 para las aplicaciones 3D. Si una vista 3D se queda en blanco, compruebe que la aceleración por hardware está activada en los ajustes de su navegador.
- Una pantalla de al menos 1280 píxeles de ancho para ver las barras de herramientas completas; las pantallas más pequeñas las reparten en varias filas.

Los archivos muy grandes (juegos de planos grandes, modelos grandes) usan mucha memoria en una pestaña del navegador. Cierre otras pestañas pesadas si una aplicación va lenta.
