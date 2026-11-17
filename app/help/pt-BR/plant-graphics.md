---
title: Gráficos de plantas por escala, símbolos próprios e plantas em 3D
summary: Como as plantas são desenhadas na planta em cada escala de desenho e nível de detalhe, e como um registro de planta recebe seu próprio símbolo (SVG, ou um bloco DXF/DWG) e seu próprio modelo 3D (OBJ, STL ou GLB).
keywords: gráficos de plantas, símbolo de planta, símbolo por escala, nível de detalhe, nível de detalhe, círculo simples, contorno, símbolo detalhado, símbolo próprio, bloco, svg, dxf, dwg, planta 3D, modelo 3D próprio, obj, stl, glb, gltf, modelo de árvore, plantas em 3D
from: 875837d9
---

## Símbolos de planta por escala

Paisagismo › {{ui:Mais}} › {{ui:Gráficos de plantas}} define como as plantas são desenhadas na planta. **Automático, por escala** escolhe um dos três níveis pela escala de desenho:

- **Círculo simples** (mais grosseiro que 1:500): um círculo na largura da planta.
- **Contorno com centro** (de 1:500 a 1:200): o círculo e uma pequena cruz no centro.
- **Símbolo detalhado** (mais fino que 1:200): o símbolo próprio do registro, se houver, senão o símbolo embutido.

Altere as duas escalas com **Simples a partir de 1:** e **Contorno a partir de 1:**, ou escolha um nível para todas as escalas. Cada conjunto de folhas na caixa Folhas tem seu próprio **Detalhe das plantas na planta**, então uma planta de site em 1:500 e uma planta de plantio em 1:100 podem ser diferentes. As configurações são salvas com o projeto.

## Seu próprio símbolo

Escolha uma planta na seção Plantas e pressione {{ui:Símbolo próprio…}}. Ele lê um SVG ou um bloco de um desenho DXF ou DWG (quando o desenho tem vários blocos, você escolhe um). O símbolo é ajustado à largura da planta e desenhado no nível detalhado. Ele é mantido no projeto, então o arquivo acompanha o projeto.

- Um SVG é lido quanto às linhas, polilinhas, polígonos, retângulos, círculos, elipses e caminhos. Scripts, estilos, links e imagens nele nunca são examinados. Transformações não são aplicadas: você é avisado quando o arquivo as tem, então aplique-as antes no seu programa de desenho.
- Limites: 512 KB de SVG e 2000 formas. Um arquivo maior é recusado, com o motivo.

## Sua própria planta 3D

{{ui:Modelo 3D próprio…}} no mesmo registro lê um arquivo **OBJ**, **STL** ou **GLB**. Depois, em Gráficos de plantas, defina **Plantas em 3D** como **Modelo próprio de cada registro**: cada planta desse registro mostra o seu modelo, ajustado à sua altura e largura. Registros sem modelo próprio mantêm as formas embutidas. Escolha **Massas simples** para visões rápidas de sites grandes.

Um GLB é lido somente quanto à forma:

- Tudo o que o modelo precisa deve estar dentro do arquivo .glb. Um modelo que aponta para outros arquivos (um .bin separado, ou imagens por endereço) é recusado: nada é baixado.
- Geometria comprimida ou empacotada (Draco, meshopt, posições quantizadas) não é lida. Exporte sem compressão.
- Texturas e cores do arquivo não são usadas: o modelo é desenhado na cor própria da planta. As texturas ainda são verificadas, e uma textura com mais de 4096 pixels de lado é recusada.
- Limites: um arquivo de 32 MB, 50 000 triângulos (contando cada cópia de uma peça colocada mais de uma vez), 64 imagens e 16 MB de imagens.

Cada limite recusa o arquivo com o motivo; nada lido pela metade é mantido. Uma etapa de desfazer dá ao registro seu símbolo ou modelo, e {{ui:Remover símbolo próprio}} ou {{ui:Remover modelo 3D próprio}} os remove novamente.

Veja [Registros de plantas](topic:plant-records) para o próprio registro, e [Ver o terreno em 3D](topic:site-3d).
