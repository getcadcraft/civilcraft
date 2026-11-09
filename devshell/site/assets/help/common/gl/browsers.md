---
title: Navegadores e ordenadores
summary: Que navegadores usan as aplicacións, en que se diferencian e que necesita o seu ordenador.
keywords: chrome, edge, firefox, safari, brave, navegador, mac, windows, linux, ipad, tableta, webgl, requisitos, memoria
from: a11b09b1
---

As aplicacións funcionan dentro dun navegador web. Fan o traballo no seu propio ordenador: os seus ficheiros ábrense alí e nunca se envían a nós (véxase [Onde van os seus ficheiros](common:your-files)).

## Que navegador

Use unha versión actualizada dun destes:

| Navegador | Motor | Notas |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | O máis completo: escoller carpetas, gardar para uso sen conexión, manexo de ficheiros. |
| Firefox | Gecko | Funciona. Abrir unha carpeta completa usa un selector máis simple. O gardado sen conexión pode non funcionar en xanelas privadas. |
| Safari | WebKit | Funciona en Mac e iPad. Abrir unha carpeta completa usa un selector máis simple. Safari pode borrar unha copia sen conexión que non use durante algunhas semanas. |

Os tres motores serven para o traballo diario. Cando unha aplicación fai algo de xeito diferente nalgún deles, a súa axuda mostra os pasos do seu navegador.

## En que se diferencian os navegadores

- **Abrir unha carpeta.** Os navegadores Chromium mostran un selector de carpetas real e poden ler a carpeta directamente. Firefox e Safari piden que escolla unha carpeta e len despois todos os ficheiros que contén, o que tarda máis con cartafoles de proxectos grandes; arrastrar a carpeta á aplicación funciona nos tres.
- **Gardar.** As aplicacións gardan descargando un ficheiro. O navegador decide onde van as descargas e se pregunta antes.

:::chromium
En Chrome ou Edge, active «Preguntar onde gardar cada ficheiro antes de descargalo» (en Configuración, baixo Descargas) para escoller unha carpeta cada vez.
:::

:::firefox
En Firefox, abra Configuración, despois Xeral, despois Descargas, e escolla «Preguntar sempre onde gardar os ficheiros» para escoller unha carpeta cada vez.
:::

:::safari
En Safari, abra Configuración, despois Xeral, e estableza «Ubicación de descarga de ficheiros» en «Preguntar en cada descarga» para escoller unha carpeta cada vez.
:::

## Mac, Windows e Linux

As aplicacións son iguais en todos os ordenadores. O que cambia é o teclado: os atallos escríbense automaticamente para o seu ordenador. Véxase [Teclas, ratos e trackpads](common:keys).

## Tabletas e pantallas táctiles

Algunhas aplicacións aceptan o tacto (un dedo debuxa ou selecciona, dous dedos pellizcan para facer zoom e desprazar). A axuda de cada aplicación di se o fai. Nun iPad, use Safari ou Chrome. Un teclado axuda coas aplicacións que usan comandos escritos.

## A versión máis antiga de navegador e sistema

Estes datos lémolos do código das aplicacións 0.7, non dunha suposición: revisouse cada ficheiro e buscouse cada función da linguaxe que usa nos datos de compatibilidade publicados polos navegadores. Por debaixo destas versións as aplicacións nin sequera arrancan, porque o navegador non entende o código.

| | Versión máis antiga que pode iniciar as aplicacións |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS e iOS 16.4) |

CadCraft Studio leva o seu propio motor web en Windows, polo que necesita Windows 10 ou 11; nun Mac usa o do sistema, polo que necesita macOS 13.3 ou posterior. Configuración › Actualizacións en Studio mostra en que sistema funciona a súa copia.

Esta é a versión máis antiga que *arranca*, lida do código. Non é unha lista de navegadores antigos nos que probamos as aplicacións, así que un máis antigo que arranque pode aínda non ter unha función.

## Que necesita o seu ordenador

Estes son mínimos previstos para as aplicacións, non requisitos medidos:

- 8 GB de memoria (recoméndanse 16 GB para modelos federados grandes).
- Un chip gráfico con WebGL 2 para as aplicacións 3D. Se unha vista 3D queda en branco, comprobe que a aceleración por hardware está activada na configuración do navegador.
- Unha pantalla de polo menos 1280 píxeles de ancho para as barras de ferramentas completas; as pantallas máis pequenas axustan as barras en varias filas.

Ficheiros moi grandes (conxuntos de planos grandes, modelos grandes) usan moita memoria nunha pestana do navegador. Peche outras pestanas pesadas se unha aplicación vai lenta.
