---
title: Gráficos de plantas por escala, símbolos próprios e plantas em 3D
summary: Como as plantas são desenhadas na planta a cada escala de desenho e nível de detalhe, e como um registo de planta recebe o seu próprio símbolo (SVG, ou bloco de DXF/DWG) e o seu próprio modelo 3D (OBJ, STL ou GLB).
keywords: gráficos de plantas, símbolo de planta, símbolo por escala, nível de detalhe, detalhe, círculo simples, contorno, símbolo detalhado, símbolo próprio, bloco, svg, dxf, dwg, planta 3D, modelo 3D próprio, obj, stl, glb, gltf, modelo de árvore, plantas em 3D
from: 875837d9
---

## Símbolos na planta por escala

Paisagismo › {{ui:More}} › {{ui:Plant graphics}} define como as plantas são desenhadas na planta. **Automático, por escala** escolhe um de três níveis a partir da escala do desenho:

- **Círculo simples** (mais grosseiro do que 1:500): um círculo com a largura da copa da planta.
- **Contorno com centro** (de 1:500 a 1:200): o círculo e uma pequena cruz no centro.
- **Símbolo detalhado** (mais fino do que 1:200): o símbolo próprio do registo, se tiver um, senão o símbolo incorporado.

Altere as duas escalas com **Simples a partir de 1:** e **Contorno a partir de 1:**, ou escolha um nível para todas as escalas. Cada conjunto de folhas na caixa de diálogo Folhas tem a sua própria **Detalhe das plantas na planta**, pelo que uma planta de implantação a 1:500 e uma planta de plantação a 1:100 podem ser diferentes. As definições são guardadas com o projeto.

## O seu símbolo próprio

Escolha uma planta na secção Plantas e clique em {{ui:Own symbol…}}. Lê-se um SVG, ou um bloco de um desenho DXF ou DWG (quando o desenho tem vários blocos, escolhe-se um). O símbolo é ajustado à largura da copa da planta e desenhado no nível detalhado. Fica guardado no projeto, pelo que o ficheiro o acompanha.

- Um SVG é lido nas suas linhas, polilinhas, polígonos, retângulos, círculos, elipses e trajetos. Scripts, estilos, ligações e imagens nele contidos nunca são analisados. As transformações não são aplicadas: é avisado quando o ficheiro as tem, pelo que convém aplaná-las primeiro no seu programa de desenho.
- Limites: 512 KB de SVG e 2000 formas. Um ficheiro maior é recusado, com o motivo indicado.

## A sua planta 3D própria

{{ui:Own 3D model…}} no mesmo registo lê um ficheiro **OBJ**, **STL** ou **GLB**. Depois, em Gráficos de plantas, defina **Plantas em 3D** como **Modelo próprio de cada registo**: cada planta desse registo mostra o seu modelo, ajustado à sua altura e largura de copa. Os registos sem modelo próprio mantêm as formas incorporadas. Escolha **Massas simples** para vistas rápidas de locais grandes.

Um GLB é lido apenas quanto à forma:

- Tudo o que o modelo precisa tem de estar dentro do ficheiro .glb. Um modelo que aponta para outros ficheiros (um .bin separado, ou imagens por endereço) é recusado: nada é transferido.
- A geometria comprimida ou empacotada (Draco, meshopt, posições quantizadas) não é lida. Exporte sem compressão.
- As texturas e as cores do ficheiro não são usadas: o modelo é desenhado na cor própria da planta. As texturas são verificadas na mesma, e uma textura com mais de 4096 pixels de lado é recusada.
- Limites: um ficheiro de 32 MB, 50 000 triângulos (contando cada cópia de uma peça colocada mais do que uma vez), 64 imagens e 16 MB de imagens.

Cada limite recusa o ficheiro com o motivo indicado; nada parcialmente lido é guardado. Um passo de Anular dá ao registo o seu símbolo ou modelo, e {{ui:Remove own symbol}} ou {{ui:Remove own 3D model}} remove-o de novo.

Consulte [Registos de plantas](topic:plant-records) para o próprio registo e [Ver o local em 3D](topic:site-3d).
