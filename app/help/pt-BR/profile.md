---
title: Projetar um perfil longitudinal
summary: Abra a vista do perfil, inicie um perfil de projeto a partir do terreno, adicione e arraste PIVs, defina os comprimentos das curvas verticais e leia greides, valores de K e pontos altos e baixos.
keywords: perfil, alinhamento vertical, piv, curva vertical, greide, valor k, crista, depressão, bvc, evc, vista do perfil, greide final, fg, perfil do terreno natural, linhas de feição no perfil, cruzamentos, projetado, meio-fio, valeta, rótulos
from: e9182bfa
---

Cada alinhamento tem um perfil de projeto: uma lista de PIVs (estaca e cota) unidos por greides retos, com uma curva vertical parabólica simétrica em qualquer PIV interno que tenha um comprimento. O perfil do terreno natural é amostrado da superfície para você.

## Abrir a vista do perfil

1. Selecione o alinhamento (clique nele com {{ui:Selecionar}}).
2. Pressione {{key:R}}, ou clique em {{ui:Perfil}} na barra de ferramentas, ou em {{ui:Vista do perfil}} na parte inferior do painel da direita.
   A vista do perfil abre sob a planta, com o terreno existente ao longo do alinhamento. Com dois ou mais alinhamentos, escolha um na lista à esquerda da barra do perfil.

A vista sempre mostra o alinhamento inteiro e estica as cotas para preencher o painel; o exagero é impresso no canto inferior esquerdo, por exemplo "Exagero vertical 10×". Ela não faz zoom nem pan.

Mova o ponteiro ao longo do perfil: a barra mostra a estaca, as cotas do terreno e de projeto, o greide e o corte ou aterro naquele ponto, e um ponto acompanha o alinhamento na planta.

## Iniciar o perfil de projeto

1. No painel da direita, em **Perfil de projeto**, clique em {{ui:Começar do terreno}}.
   Dois PIVs são colocados no terreno nas duas extremidades do alinhamento, unidos por um único greide reto. A barra de status diz "Perfil de projeto iniciado no terreno nas duas extremidades. Ative Adicionar PIVs e clique para acrescentar mudanças de greide; informe um comprimento de curva na tabela."

Se o alinhamento não cruzar a superfície, aparece "Este alinhamento não tem terreno sob ele para começar." Nesse caso, adicione PIVs clicando (próxima seção).

## Adicionar PIVs

1. Pressione {{key:I}}, ou clique em {{ui:Adicionar PIVs}} na barra do perfil. O botão fica pressionado.
2. Clique no perfil onde quer uma mudança de greide. Um PIV é adicionado nessa estaca e cota, arredondado para 0.01, e selecionado.
3. Adicione quantos forem necessários e depois pressione {{key:I}} de novo para parar de adicionar.

Um clique onde já existe um PIV é recusado ("Já existe um PIV em …"). Os PIVs sempre ficam em ordem de estaca.

## Ajustar PIVs

- **Arraste** um PIV no perfil para movê-lo. Ele não pode passar dos vizinhos. A movimentação é uma única etapa de desfazer.
- **Digite** valores exatos na tabela de PIVs no painel da direita: **Estaca**, **Cota** e **Curva L** (comprimento da curva vertical). Pressione {{key:Enter}} após cada um.
- **Remova** um PIV com o x no fim da linha, ou selecione-o (clique nele) e pressione {{key:Delete}}. Quando a vista do perfil tem o foco, {{key:Backspace}} também o remove.

O primeiro e o último PIV nunca recebem curva.

## Curvas verticais

1. Digite um comprimento em **Curva L** para um PIV interno, por exemplo 200.
2. A curva é desenhada centrada no PIV. O perfil e o painel da direita mostram o tipo (crista ou depressão), L e K, as estacas e cotas do BVC e do EVC, e seu ponto alto ou baixo quando ele existe dentro da curva.

K é calculado a partir de L (K = L dividido pela diferença algébrica dos greides, em porcentagem). Você digita L; digitar K diretamente ainda não está disponível.

Se uma curva vertical não couber, uma caixa vermelha diz o motivo: ela avança sobre o PIV ou a curva anterior, ou passa do próximo PIV, e mostra quanto espaço há naquele lado (uma curva precisa de metade do seu comprimento em cada lado do seu PIV). Seu botão define **a maior curva que cabe**, com seu K, como uma única etapa ({{key:Mod+Z}} desfaz). Ou afaste os PIVs.

## Ler os dados

Abaixo da tabela de PIVs, uma lista mostra cada greide em porcentagem ("Greide 1: +1.25%") e cada curva, por exemplo "Crista em 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", e depois "Ponto alto 1+62.40, 254.12".

Se os PIVs não alcançarem as duas extremidades do alinhamento, uma nota informa isso. Um corredor é construído somente onde o perfil e o alinhamento se sobrepõem.

## Linhas de feição no perfil

As linhas de feição também aparecem na vista do perfil, para que você veja um meio-fio, uma valeta ou o topo de um muro em relação ao perfil da via.

- Onde uma linha de feição **cruza** o alinhamento, o perfil mostra um pequeno losango nessa estaca e cota, com o nome da linha e a cota dela ali (a cota própria da linha, calculada ao longo do segmento que cruza).
- Digite uma distância em {{ui:Ao lado, em até}} para também desenhar as linhas de feição que **correm ao lado** do alinhamento dentro dessa distância, como linhas tracejadas nas suas próprias cotas. Vazio ou 0 mostra somente os cruzamentos.
- As marcas e os rótulos acompanham cada alteração: mova um vértice, digite um greide ou eleve a linha, e o perfil mostra as novas cotas de imediato.
- Clique no losango de um cruzamento para selecionar essa linha de feição; a linha selecionada é desenhada na cor de destaque.
- {{ui:Linhas de feição}} na barra do perfil oculta ou mostra todas elas. As duas configurações são salvas com o projeto.

Veja [Linhas de feição](topic:feature-lines).

## Próximos passos

- [Varrer um corredor viário](topic:corridor) ao longo do alinhamento e deste perfil.
- O perfil é gravado em LandXML junto com o alinhamento; veja [Trocar dados LandXML](topic:landxml).
