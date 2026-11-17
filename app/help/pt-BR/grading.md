---
title: Terraplenar uma plataforma de edificação
summary: Desenhe uma plataforma plana, defina sua elevação e os taludes de corte e aterro, e deixe o CivilCraft fazer o pé de talude até o terreno natural e adicioná-la à superfície projetada.
keywords: muro de arrimo, muros de arrimo, lado vertical, muro em vez de talude, talude por lado, aterro, terraplenagem, plataforma, plataforma de edificação, pé de talude, linha de feição, grupo de terraplenagem, talude de corte, talude de aterro, greide final, superfície projetada, terraplenagem de site
from: 482319a6
---

Uma plataforma é uma área plana em uma elevação. A partir da borda dela, o CivilCraft faz o talude para fora, no seu talude de corte onde o terreno está acima da plataforma e no seu talude de aterro onde está abaixo, até o talude encontrar o terreno natural. Essa linha de encontro é a linha de pé de talude. A plataforma e seus taludes substituem o terreno natural dentro da linha de pé de talude, para formar a superfície projetada.

## Desenhar a plataforma

Você precisa de uma superfície de terreno natural antes.

1. Pressione {{key:G}}, ou clique em {{ui:Plataforma}} no grupo **Projeto**.
   A dica diz "Plataforma: clique nos cantos. Enter ou clique duplo finaliza, Backspace remove o último, Esc cancela."
2. Clique nos cantos da plataforma em ordem, em qualquer sentido. Um contorno azul acompanha o ponteiro.
3. Pressione {{key:Enter}} depois do último canto (pelo menos três).
   A plataforma é desenhada e selecionada. Ela começa na elevação do terreno no seu meio, arredondada para 0.1, com talude de corte 2 : 1 e talude de aterro 3 : 1. A barra de status diz, por exemplo, "Plataforma 1 na elevação 254.3 (o terreno no meio dela), corte 2:1, aterro 3:1. Altere-os em Propriedades."

:::warning
Finalize com {{key:Enter}}. Um clique duplo também finaliza, mas nesta versão ele remove o canto em que você deu o clique duplo. Clique uma vez no último canto e depois pressione {{key:Enter}}.
:::

O contorno da plataforma não pode se cruzar consigo mesmo ("O contorno da plataforma se cruza.").

## Definir elevação e taludes

Com a plataforma selecionada, o painel da direita mostra **Plataforma**:

1. **Nome**.
2. **Elevação**: a elevação plana da plataforma.
3. **Talude de corte** e **Talude de aterro**, como H:V (2 significa 2 : 1). Ambos devem ser maiores que 0.
4. **Área da plataforma** e **Cantos** são mostrados para referência.

Pressione {{key:Enter}} depois de cada valor. A linha de pé de talude, a superfície projetada e os volumes são atualizados de imediato.

Abaixo dos campos, uma linha mostra, por exemplo, "Linha de pé de talude: 48 linhas de talude (20 em corte, 28 em aterro), ponto mais distante a 31.20 ft." A planta mostra a linha de pé de talude e as linhas de talude em magenta.

## Como o pé de talude é encontrado

- As linhas de talude saem de cada borda, perpendiculares a ela, cerca de a cada vigésimo do tamanho da plataforma.
- Nos cantos externos, elas se abrem a cada 10°, para que o talude contorne o canto.
- Nos cantos internos, uma linha segue a bissetriz, onde os taludes das duas bordas se encontram.
- Cada linha sobe no talude de corte ou desce no talude de aterro até atingir o terreno.

## Taludes por lado e muros de arrimo

Em **Lados e muros de arrimo**, nas Propriedades de uma plataforma, de uma banqueta ou de um aterro, cada lado pode ser terraplenado do seu jeito. O lado 1 vai do primeiro canto que você clicou até o segundo, o lado 2 do segundo ao terceiro, e assim por diante.

- **Todos os lados**: **Inclinado** usa os taludes de corte e aterro acima em todos os lados; **Vertical: muros de arrimo** coloca um muro em cada lado.
- Por lado: **Taludes da plataforma**, **Taludes próprios** (digite um talude de corte e um de aterro para aquele lado) ou **Vertical (muro de arrimo)**.
- Digite um talude como `3` ou `3:1` (horizontal para 1 vertical), `33%` ou `18.4°`; ele é mostrado como H:1. O **Talude de corte** e o **Talude de aterro** da própria plataforma aceitam o mesmo.
- Um lado vertical não tem aterro: um muro de arrimo corre ao longo da borda, da plataforma para baixo até o terreno natural (em aterro) ou do terreno para baixo até a plataforma (em corte). A **Espessura do muro** (0.3 m ou 1 ft no início) é o quanto o terreno dá degrau da borda da plataforma até o terreno natural. Os volumes de corte e aterro deixam de fora o aterro que esse lado não tem mais.
- Onde um muro encontra um lado inclinado, o talude contorna a ponta do muro; dois muros se encontram em meia-esquadria.
- Abaixo dos campos: o comprimento dos muros, a face exposta (altura × comprimento), a altura mais alta e a altura média.

A planta desenha a face externa de cada muro com traços curtos transversais e sua altura nas duas extremidades e no ponto mais alto (na camada de muros de arrimo, que também vai para DXF e DWG). A vista 3D mostra os muros como sólidos (Exibir › Muros de arrimo), e as exportações GLB, OBJ e USD os incluem. Seções pela borda mostram o degrau.

**Avisos** (em Propriedades e no painel Problemas): um muro mais alto que **Avisar acima de uma altura de muro de** (1.0 m ou 3.3 ft no início) "pode precisar de muro projetado ou de licença; verifique as regras locais", e, quando você digita o **Talude mais íngreme que o solo suporta**, qualquer lado cujo talude de corte ou aterro seja mais íngreme que isso. São avisos: o terraplenamento ainda é gerado. Cada mudança é um passo para {{key:Mod+Z}}.

## Mover cantos

Selecione a plataforma e arraste um grip quadrado em um canto. Cada arrasto é um passo de desfazer. Adicionar ou remover um canto ainda não está disponível: exclua a plataforma e desenhe-a de novo.

## Quando não terraplena

Uma caixa vermelha em **Terraplenagem** indica a plataforma e o problema:

| Mensagem | O que fazer |
|---|---|
| "3 linhas de talude saem da superfície antes de encontrá-la: a plataforma está muito perto da borda da superfície ou alta/baixa demais." | Mova a plataforma para dentro, a partir da borda da superfície, ou aproxime a elevação do terreno. |
| "A linha de pé de talude se cruza consigo mesma (taludes de lados diferentes da plataforma se encontram). Reformule a plataforma ou mude os taludes." | Típico de plataformas estreitas ou em L, em corte profundo ou aterro alto. Alargue a plataforma, reduza a diferença ou torne os taludes mais íngremes. |
| "O contorno da plataforma se cruza consigo mesmo." | Desenhe os cantos de novo, em ordem, em volta da plataforma. |

Uma plataforma com problema fica de fora da superfície projetada e dos volumes até ser corrigida.

## Ver o resultado

1. Em **Exibição**, defina **Superfície** como {{ui:Projetado (terraplenado)}}.
   As curvas de nível agora correm planas pela plataforma e seguem os taludes até a linha de pé de talude.
2. Passe o ponteiro sobre a plataforma: a barra de status mostra as elevações de **Solo** e **Terraplenado**.
3. Leia corte e aterro em **Terraplenagem**; veja [Volumes de terraplenagem](topic:volumes).

As plataformas são terraplenadas depois dos corredores, na ordem em que foram desenhadas. Uma plataforma posterior substitui qualquer coisa anterior dentro da própria linha de pé de talude.

## Excluir uma plataforma

Selecione-a e pressione {{key:Delete}} (em um Mac, Fn e delete), ou clique em {{ui:Excluir}}.

## Ainda não implementado

Plataformas são planas: plataformas inclinadas, linhas de feição com greide variável, banquetas e terraplenagem até uma distância ou elevação-alvo ainda não estão disponíveis. Veja [Ainda não implementado](topic:not-built-yet).
