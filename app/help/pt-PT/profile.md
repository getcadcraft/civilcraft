---
title: Desenhar um perfil vertical
summary: Abra a vista de perfil, comece um perfil de projeto a partir do terreno, acrescente e arraste PVI, defina os comprimentos das curvas verticais e leia as inclinações, os valores de K e os pontos altos e baixos.
keywords: perfil, alinhamento vertical, pvi, curva vertical, inclinação, valor k, cume, vale, bvc, evc, vista de perfil, cota de acabamento, fg, perfil do terreno existente, linhas características em perfil, cruzamentos, projetado, lancil, valeta, rótulos
from: e9182bfa
---

Cada alinhamento tem um perfil de projeto: uma lista de PVI (estaca e cota) unidos por inclinações retas, com uma curva vertical parabólica simétrica em qualquer PVI interior que tenha comprimento. O perfil do terreno existente é amostrado automaticamente a partir da superfície.

## Abrir a vista de perfil

1. Selecione o alinhamento (clique nele com {{ui:Selecionar}}).
2. Prima {{key:R}}, ou clique em {{ui:Perfil}} na barra de ferramentas, ou em {{ui:Vista do perfil}} no fundo do painel da direita.
   A vista de perfil abre sob a planta, com o terreno existente ao longo do alinhamento. Com dois ou mais alinhamentos, escolha um na lista à esquerda da barra de perfil.

A vista mostra sempre todo o alinhamento e estica as cotas para encher o painel; o exagero aparece no canto inferior esquerdo, por exemplo «Exagero vertical 10×». Não faz zoom nem deslocamento.

Mova o ponteiro ao longo do perfil: a barra mostra a estaca, as cotas do terreno e do projeto, a inclinação e a escavação ou o aterro nesse ponto, e um ponto segue no alinhamento na planta.

## Iniciar o perfil de projeto

1. No painel da direita, em **Perfil de projeto**, clique em {{ui:Começar a partir do terreno}}.
   Dois PVI são colocados no terreno nas duas extremidades do alinhamento, unidos por uma inclinação reta. A barra de estado diz «Perfil de projeto iniciado no terreno nas duas extremidades. Ative Adicionar PVI e clique para acrescentar mudanças de inclinação; indique-lhes um comprimento de curva na tabela.»

Se o alinhamento não atravessar a superfície, aparece «Este alinhamento não tem terreno por baixo para começar.» Nesse caso, acrescente PVI clicando (secção seguinte).

## Acrescentar PVI

1. Prima {{key:I}}, ou clique em {{ui:Adicionar PVI}} na barra de perfil. Fica premido.
2. Clique no perfil onde pretende uma mudança de inclinação. Um PVI é acrescentado nessa estaca e cota, arredondado a 0.01, e fica selecionado.
3. Acrescente os que precisar e, depois, prima {{key:I}} de novo para parar de acrescentar.

Um clique onde já existe um PVI é recusado («Já existe um PVI em …»). Os PVI ficam sempre em ordem de estaca.

## Ajustar PVI

- **Arraste** um PVI no perfil para o mover. Não pode passar pelos vizinhos. O movimento é um passo de anulação.
- **Escreva** valores exatos na tabela de PVI no painel da direita: **Estaca**, **Cota** e **Curva L** (comprimento da curva vertical). Prima {{key:Enter}} depois de cada um.
- **Remova** um PVI com o x no fim da linha, ou selecione-o (clique nele) e prima {{key:Delete}}. Quando a vista de perfil tem o foco, {{key:Backspace}} também o remove.

O primeiro e o último PVI nunca recebem curva.

## Curvas verticais

1. Escreva um comprimento em **Curva L** para um PVI interior, por exemplo 200.
2. A curva é desenhada centrada no PVI. O perfil e o painel da direita mostram o seu tipo (cume ou vale), L e K, as estacas e cotas do BVC e do EVC, e o seu ponto alto ou baixo quando tem um dentro da curva.

K é calculado a partir de L (K = L dividido pela diferença algébrica das inclinações, em percentagem). Escreve-se L; escrever K diretamente ainda não está disponível.

Se uma curva vertical não couber, uma caixa vermelha diz porquê: entra para trás no PVI ou na curva anterior, ou ultrapassa o PVI seguinte, e indica quanto espaço há desse lado (uma curva precisa de metade do seu comprimento de cada lado do PVI). O botão define **a curva mais longa que cabe**, com o seu K, como um único passo ({{key:Mod+Z}} anula-o). Ou afaste os PVI.

## Ler os dados

Por baixo da tabela de PVI, uma lista indica cada inclinação em percentagem («Inclinação 1: +1.25%») e cada curva, por exemplo «Cume em 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)», seguida de «Ponto alto 1+62.40, 254.12».

Se os PVI não chegarem às duas extremidades do alinhamento, uma nota diz isso. Um corredor só é construído onde o perfil e o alinhamento se sobrepõem.

## Linhas características no perfil

As linhas características também aparecem na vista de perfil, para ver um lancil, uma valeta ou o topo de um muro em relação ao perfil da estrada.

- Onde uma linha característica **atravessa** o alinhamento, o perfil mostra um pequeno losango nessa estaca e cota, com o nome da linha e a sua cota ali (a cota da própria linha, calculada no segmento que atravessa).
- Escreva uma distância em {{ui:Ao lado, a menos de}} para desenhar também as linhas características que **correm ao lado** do alinhamento dentro dessa distância, como linhas tracejadas às suas próprias cotas. Vazio ou 0 mostra apenas os cruzamentos.
- As marcas e os rótulos seguem cada alteração: mova um vértice, escreva uma inclinação ou eleve a linha, e o perfil mostra de imediato as novas cotas.
- Clique no losango de um cruzamento para selecionar essa linha característica; a linha selecionada é desenhada na cor de realce.
- {{ui:Linhas características}} na barra de perfil oculta ou mostra todas. Ambas as definições ficam guardadas com o projeto.

Veja [Linhas características](topic:feature-lines).

## Seguinte

- [Varrer um corredor de estrada](topic:corridor) ao longo do alinhamento e deste perfil.
- O perfil é escrito em LandXML com o alinhamento; veja [Exportar LandXML](topic:landxml).
