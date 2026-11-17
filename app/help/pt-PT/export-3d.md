---
title: Exportar o local em 3D
summary: Guardar o que a vista 3D mostra como um ficheiro GLB ou OBJ para outros programas 3D, em metros e com Y para cima, em torno de uma origem local que o ficheiro regista.
keywords: glb, gltf, obj, exportação 3d, exportar 3d, exportação de modelos, motor de jogo, visualização, visualizador 3d, metros, y para cima, origem, origem local, state plane
from: 07d23992
---

A vista 3D exporta o que mostra como um modelo 3D que outro programa pode abrir: um visualizador 3D, um programa de modelação, um motor de jogo ou uma ferramenta de visualização.

## Exportar

1. Abra a vista 3D ({{key:D}}) e escolha o que aparece com {{ui:Mostrar}}. O que estiver oculto não é exportado.
2. Clique em {{ui:GLB}} ou {{ui:OBJ}} na barra.
   O ficheiro é transferido como "*nome do projeto*-3d.glb" ou "-3d.obj", e a barra de estado indica a origem.

## O que os ficheiros contêm

| | GLB | OBJ |
|---|---|---|
| Superfícies | Malhas com normais e as cores das bandas ou das superfícies | Malhas com normais (sem cores) |
| Coletores e órgãos | Malhas redondas, os problemáticos a vermelho | Malhas redondas |
| Curvas de nível, linhas de quebra, diretrizes, marcas, linhas do corredor e das plataformas | Linhas, cada conjunto na sua cor | Registos de linha (`l`) |
| Pontos do levantamento | Pontos | Registos de ponto (`p`) |

Cada conjunto mantém o seu nome ("Terreno existente", "Coletores", "Curvas de nível principais" e assim por diante), por isso pode ocultá-lo ou estilizá-lo no outro programa.

## Unidades, eixos e origem

- **Metros.** Um projeto em pés é convertido a partir de pés de agrimensura dos EUA (1 ft = 1200/3937 m).
- **Y para cima**, a convenção habitual para estes formatos: a coordenada este torna-se +X, a cota +Y, e a coordenada norte −Z.
- **Escala real.** O exagero vertical da vista não é aplicado.
- **Uma origem local.** As coordenadas state plane são de milhões de pés, grandes demais para os números de precisão simples que estes formatos guardam, por isso o ficheiro é escrito em relação a uma origem próxima: a origem do próprio terreno existente para o este e o norte, e a cota mais baixa dele, arredondada para baixo. A origem, nas unidades do projeto, fica registada no ficheiro: num GLB como `extras` na cena e no nó de topo; num OBJ como uma linha de comentário perto do início (`# origin easting … northing … elevation …`). Para repor o modelo nas coordenadas do projeto, some a origem (depois de converter metros de volta para pés, num projeto em pés).

## Ainda não implementado

- Exportar a vista exagerada, ou exportar nas unidades do projeto em vez de metros.
- Texturas, um ficheiro de materiais para OBJ (.mtl) e propriedades por objeto (os nomes dos coletores e órgãos existem apenas no CivilCraft).
- Exportar o corredor como sólidos separados, ou a vista de perfil em 3D.
