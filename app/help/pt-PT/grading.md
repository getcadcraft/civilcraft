---
title: Modelar uma plataforma de edifício
summary: Desenhe uma plataforma plana, defina a sua cota e os taludes de escavação e de aterro, e deixe o CivilCraft ligá-la ao terreno natural e acrescentá-la à superfície proposta.
keywords: muro de suporte, muros de suporte, lado vertical, muro em vez de talude, talude por lado, aterro, modelação do terreno, plataforma, plataforma de edifício, linha de intersecção do talude, linha característica, grupo de modelação, talude de escavação, talude de aterro, cota final, superfície proposta, modelação do local
from: 482319a6
---

Uma plataforma é uma área plana a uma só cota. A partir da sua aresta, o CivilCraft modela para fora: com o talude de escavação onde o terreno está mais alto do que a plataforma, e com o talude de aterro onde está mais baixo, até o talude encontrar o terreno natural. Essa linha de encontro é a linha de intersecção do talude. A plataforma e os seus taludes substituem o terreno natural dentro da linha de intersecção, para formar a superfície proposta.

## Desenhar a plataforma

Precisa primeiro de uma superfície de terreno existente.

1. Prima {{key:G}}, ou clique em {{ui:Plataforma}} no grupo **Projeto**.
   A sugestão diz «Plataforma: clique nos cantos. Enter ou duplo clique termina, Backspace retira o último, Esc cancela.»
2. Clique nos cantos da plataforma por ordem, em qualquer sentido. Um contorno azul segue o cursor.
3. Prima {{key:Enter}} depois do último canto (pelo menos três).
   A plataforma é desenhada e selecionada. Começa à cota do terreno no seu centro, arredondada a 0.1, com talude de escavação 2 : 1 e talude de aterro 3 : 1. A barra de estado diz, por exemplo, «Plataforma 1 à cota 254.3 (o terreno no centro), escavação 2:1, aterro 3:1. Altere-as em Propriedades.»

:::warning
Termine com {{key:Enter}}. O duplo clique também termina, mas nesta versão retira o canto em que clicou duas vezes. Clique uma vez no último canto e prima {{key:Enter}}.
:::

O contorno da plataforma não pode cruzar-se a si próprio («O contorno da plataforma cruza-se a si próprio.»).

## Definir a cota e os taludes

Com a plataforma selecionada, o painel da direita mostra **Plataforma**:

1. **Nome**.
2. **Cota**: a cota plana da plataforma.
3. **Talude de escavação** e **Talude de aterro**, como H:V (2 significa 2 : 1). Ambos têm de ser maiores do que 0.
4. **Área da plataforma** e **Cantos** são mostrados para referência.

Prima {{key:Enter}} depois de cada valor. A linha de intersecção, a superfície proposta e os volumes atualizam-se de imediato.

Por baixo dos campos, uma linha indica, por exemplo, «Linha de intersecção: 48 linhas de talude (20 em escavação, 28 em aterro), a mais afastada a 31.20 ft.» O desenho da planta mostra a linha de intersecção e as linhas de talude a magenta.

## Como se encontra a intersecção

- As linhas de talude saem de cada aresta, perpendicularmente a ela, cerca de uma em cada vigésima parte do tamanho da plataforma.
- Nos cantos exteriores, abrem em leque a cada 10°, para que o talude contorne o canto.
- Nos cantos interiores, uma linha corre pela bissetriz, onde se encontram os taludes das duas arestas.
- Cada linha sobe com o talude de escavação ou desce com o talude de aterro, até atingir o terreno.

## Taludes por lado e muros de suporte

Em **Lados e muros de suporte**, nas Propriedades de uma plataforma, de uma plataforma de nível ou de uma berma, cada lado pode ser modelado à sua maneira. O lado 1 vai do primeiro canto que clicou ao segundo, o lado 2 do segundo ao terceiro, e assim por diante.

- **Todos os lados**: **Com talude** usa os taludes de escavação e de aterro acima em todos os lados; **Vertical: muros de suporte** põe um muro em cada lado.
- Por lado: **Taludes acima**, **Taludes próprios** (escreva um talude de escavação e um de aterro para esse lado) ou **Vertical (muro de suporte)**.
- Escreva um talude como `3` ou `3:1` (horizontal para 1 vertical), `33%` ou `18.4°`; é mostrado como H:1. O **Talude de escavação** e o **Talude de aterro** da própria plataforma aceitam o mesmo.
- Um lado vertical não tem aterro: um muro de suporte corre ao longo da aresta, desde a plataforma até ao terreno natural (em aterro), ou desde o terreno até à plataforma (em escavação). A **Espessura do muro** (0.3 m ou 1 ft para começar) é o quanto o terreno dá um degrau desde a aresta da plataforma até ao terreno natural. Os volumes de escavação e de aterro deixam de fora o aterro que esse lado já não tem.
- Onde um muro encontra um lado com talude, o talude contorna a extremidade do muro; dois muros encontram-se em meia-esquadria.
- Nos campos: o comprimento dos muros, a face exposta (altura × comprimento), a altura mais alta e a altura média.

O desenho da planta traça a face exterior de cada muro com pequenos traços transversais, e mostra a sua altura nas duas extremidades e na mais alta (na camada de muros de suporte, que também vai para DXF e DWG). A vista 3D mostra os muros como sólidos (Mostrar › Muros de suporte), e as exportações GLB, OBJ e USD incluem-nos. Os cortes pela aresta mostram o degrau.

**Avisos** (nas Propriedades e no painel de Problemas): um muro mais alto do que **Avisar acima de uma altura de muro de** (1.0 m ou 3.3 ft, inicialmente) «pode precisar de um muro projetado ou de uma licença; verifique as regras locais», e, quando escreve o **Talude mais íngreme que o solo suporta**, qualquer lado cujo talude de escavação ou de aterro seja mais íngreme do que isso. São avisos: a modelação continua a ser construída. Cada alteração é um passo para {{key:Mod+Z}}.

## Mover os cantos

Selecione a plataforma e arraste um grip (ponto de controlo) quadrado num canto. Cada arrastamento é um passo de anulação. Acrescentar ou remover um canto ainda não está disponível: elimine a plataforma e desenhe-a de novo.

## Quando não modela

Uma caixa vermelha em **Movimentação de terras** indica a plataforma e o problema:

| Mensagem | O que fazer |
|---|---|
| «3 linhas de talude saem da superfície antes de a encontrarem: a plataforma está demasiado perto da aresta da superfície, ou demasiado alta/baixa.» | Afaste a plataforma da aresta da superfície, ou aproxime a sua cota do terreno. |
| «A linha de intersecção cruza-se a si própria (taludes de lados diferentes da plataforma chocam uns com os outros). Redesenhe a plataforma ou altere os taludes.» | Típico de plataformas estreitas ou em L, em escavação profunda ou aterro alto. Alargue a plataforma, reduza a diferença de cotas, ou torne os taludes mais íngremes. |
| «O contorno da plataforma cruza-se a si próprio.» | Desenhe de novo os cantos por ordem à volta da plataforma. |

Uma plataforma com um problema fica de fora da superfície proposta e dos volumes até ser corrigida.

## Ver o resultado

1. Em **Visualização**, defina **Superfície** como {{ui:Proposta (modelada)}}. As curvas de nível passam agora planas pela plataforma e seguem os taludes até à linha de intersecção.
2. Mova o cursor sobre a plataforma: a barra de estado mostra as cotas de **Solo** e **Modelado**.
3. Leia a escavação e o aterro em **Movimentação de terras**; ver [Volumes de movimentação de terras](topic:volumes).

As plataformas são modeladas depois dos corredores, pela ordem em que foram desenhadas. Uma plataforma posterior substitui tudo o que estiver antes dentro da sua própria linha de intersecção.

## Eliminar uma plataforma

Selecione-a e prima {{key:Delete}} (num Mac, Fn e Delete), ou clique em {{ui:Eliminar}}.

## Ainda não implementado

As plataformas são planas: plataformas inclinadas, linhas características de declive variável, bancadas, e modelação até uma distância ou cota alvo ainda não estão disponíveis. Ver [Ainda não implementado](topic:not-built-yet).
