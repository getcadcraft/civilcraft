---
title: Gráficos de plantas por escala, símbolos propios e plantas en 3D
summary: Como se debuxan as plantas en planta a cada escala de debuxo e nivel de detalle, e como un rexistro de planta recibe o seu propio símbolo (SVG, ou un bloque DXF ou DWG) e o seu propio modelo 3D (OBJ, STL ou GLB).
keywords: gráficos de plantas, símbolo de planta, símbolo por escala, nivel de detalle, círculo simple, contorno, símbolo detallado, símbolo propio, bloque, svg, dxf, dwg, planta en 3D, modelo 3D propio, obj, stl, glb, gltf, modelo de árbore, plantas en 3D
from: 875837d9
---

## Símbolos en planta por escala

Paisaxismo › {{ui:More}} › {{ui:Plant graphics}} fixa como se debuxan as plantas en planta. **Automático, por escala** escolle un de tres niveis segundo a escala do debuxo:

- **Círculo simple** (máis grosa que 1:500): un círculo coa extensión da planta.
- **Contorno con centro** (de 1:500 a 1:200): o círculo e unha pequena cruz central.
- **Símbolo detallado** (máis fina que 1:200): o símbolo propio do rexistro, se o ten, ou o símbolo integrado.

Cambie as dúas escalas con **Simple desde 1:** e **Contorno desde 1:**, ou escolla un nivel para todas as escalas. Cada conxunto de follas do diálogo Follas ten a súa propia **Detalle das plantas no plano**, así que unha planta de sitio a 1:500 e un plano de plantación a 1:100 poden diferir. Os axustes gárdanse co proxecto.

## O seu propio símbolo

Escolla unha planta na sección Plantas e prema {{ui:Own symbol…}}. Lee un SVG, ou un bloque dun debuxo DXF ou DWG (cando o debuxo ten varios bloques, vostede escolle un). O símbolo axústase á extensión da planta e debúxase no nivel detallado. Gárdase no proxecto, así que o ficheiro vai con el.

- Un SVG lese polas liñas, polilíneas, polígonos, rectángulos, círculos, elipses e trazados. Nunca se examinan os scripts, estilos, ligazóns nin imaxes que conteña. As transformacións non se aplican: avísase cando o ficheiro as ten, así que hai que aplanalas primeiro no programa de debuxo.
- Límites: 512 KB de SVG e 2000 formas. Un ficheiro máis grande recházase co motivo.

## A súa propia planta en 3D

{{ui:Own 3D model…}} no mesmo rexistro lee un ficheiro **OBJ**, **STL** ou **GLB**. Logo, en Gráficos de plantas, configure **Plantas en 3D** como **Modelo propio de cada rexistro**: cada planta dese rexistro mostra o seu modelo, escalado á súa altura e extensión. Os rexistros sen modelo propio conservan as formas integradas. Escolla **Masas simples** para vistas rápidas de sitios grandes.

Un GLB lese só pola forma:

- Todo o que o modelo necesita debe estar dentro do ficheiro .glb. Un modelo que apunta a outros ficheiros (un .bin separado, ou imaxes por dirección) recházase: non se descarga nada.
- A xeometría comprimida ou empaquetada (Draco, meshopt, posicións cuantizadas) non se lee. Exporte sen compresión.
- As texturas e as cores do ficheiro non se usan: o modelo debúxase coa cor propia da planta. As texturas séguense comprobando, e unha textura de máis de 4096 píxeles por lado recházase.
- Límites: un ficheiro de 32 MB, 50 000 triángulos (contando cada copia dunha peza colocada máis dunha vez), 64 imaxes e 16 MB de imaxes.

Cada límite recházao o ficheiro co motivo; non se garda nada a medio ler. Un paso de desfacer devolve ao rexistro o seu símbolo ou modelo, e {{ui:Remove own symbol}} ou {{ui:Remove own 3D model}} os quitan de novo.

Ver [Rexistros de plantas](topic:plant-records) para o rexistro en si, e [Ver o sitio en 3D](topic:site-3d).
