---
title: Exportar o terreno em 3D
summary: Salve o que a vista 3D mostra como um arquivo GLB ou OBJ para outros programas 3D, em metros com Y para cima, em torno de uma origem local que o arquivo registra.
keywords: glb, gltf, obj, exportação 3D, exportar 3D, exportação de modelo, motor de jogo, visualização, visualizador 3D, metros, y para cima, origem, origem local, state plane
from: 07d23992
---

A vista 3D exporta o que mostra como um modelo 3D que outro programa pode abrir: um visualizador 3D, um programa de modelagem, um motor de jogo ou uma ferramenta de visualização.

## Exportar

1. Abra a vista 3D ({{key:D}}) e escolha o que aparece com {{ui:Mostrar}}. O que está oculto não é exportado.
2. Clique em {{ui:GLB}} ou {{ui:OBJ}} na barra.
   O arquivo é baixado como "*nome do projeto*-3d.glb" ou "-3d.obj", e a barra de status informa a origem.

## O que os arquivos contêm

| | GLB | OBJ |
|---|---|---|
| Superfícies | Malhas com normais e as cores das faixas ou das superfícies | Malhas com normais (sem cores) |
| Tubos e estruturas | Malhas arredondadas, as com problema em vermelho | Malhas arredondadas |
| Curvas de nível, linhas de quebra, alinhamentos, marcas, linhas do corredor e da plataforma | Linhas, cada conjunto na sua cor | Registros de linha (`l`) |
| Pontos de levantamento | Pontos | Registros de ponto (`p`) |

Cada conjunto mantém o seu nome ("Terreno existente", "Tubos", "Curvas mestras" e assim por diante), para que você possa ocultá-lo ou estilizá-lo no outro programa.

## Unidades, eixos e a origem

- **Metros.** Um projeto em pés é convertido a partir de pés de levantamento dos EUA (1 ft = 1200/3937 m).
- **Y para cima**, a convenção usual para esses formatos: leste vira +X, elevação +Y, e norte −Z.
- **Escala real.** O exagero vertical da vista não é aplicado.
- **Uma origem local.** As coordenadas State Plane são da ordem de milhões de pés, grandes demais para os números de precisão simples que esses formatos armazenam; por isso o arquivo é gravado em relação a uma origem próxima: a própria origem do terreno existente para leste e norte, e a elevação mais baixa dele arredondada para baixo. A origem, em unidades do projeto, é registrada no arquivo: em um GLB, como `extras` na cena e no nó superior dela; em um OBJ, como uma linha de comentário perto do início (`# origin easting … northing … elevation …`). Para posicionar o modelo de volta nas coordenadas do projeto, some a origem (depois de converter os metros de volta para pés em um projeto em pés).

## Ainda não implementado

- Exportar a vista com exagero, ou exportar nas unidades do projeto em vez de metros.
- Texturas, um arquivo de material para OBJ (.mtl) e propriedades por objeto (os nomes de tubos e estruturas existem apenas no CivilCraft).
- Exportar o corredor como sólidos separados, ou a vista de perfil em 3D.
