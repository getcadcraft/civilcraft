---
title: Projetar um perfil longitudinal
summary: Abra a vista do perfil, comece um perfil de projeto a partir do terreno, adicione e arraste PIVs, defina os comprimentos das curvas verticais e leia greides, valores de K e pontos altos e baixos.
keywords: perfil, alinhamento vertical, piv, curva vertical, greide, valor de k, crista, depressão, bvc, evc, vista do perfil, greide final, cota final, perfil do terreno natural, linhas de feição no perfil, cruzamentos, projetado, meio-fio, valeta, rótulos
from: dbb1f32d
---

Cada alinhamento tem um perfil de projeto: uma lista de PIVs (estaca e cota) ligados por greides retos, com uma curva vertical parabólica simétrica em qualquer PIV interno que tenha comprimento. O perfil do terreno natural é amostrado da superfície para você.

## Abrir a vista do perfil

1. Selecione o alinhamento (clique nele com {{ui:Select}}).
2. Pressione {{key:R}}, ou clique em {{ui:Profile}} na barra de ferramentas, ou em {{ui:Profile view}} na parte inferior do painel da direita.
   A vista do perfil abre sob a planta, com o terreno natural ao longo do alinhamento. Com dois ou mais alinhamentos, escolha um na lista à esquerda da barra do perfil.

A vista começa mostrando o alinhamento inteiro e esticando as cotas para preencher o painel; o exagero aparece impresso no canto inferior esquerdo, por exemplo "Exagero vertical 10×".

## Zoom e deslocamento do perfil

- **Zoom:** gire a roda do mouse (ou faça pinça no trackpad) e a vista amplia em torno do ponteiro. Segure {{key:Shift}} para ampliar só as estacas, ou {{key:Alt}} para ampliar só as cotas (isso muda o exagero). Com a vista do perfil em foco, as teclas de mais e menos ampliam a partir do centro.
- **Deslocar:** arraste com o botão direito ou o do meio do mouse, ou deslize com dois dedos no trackpad.
- **Ajustar:** clique duas vezes no perfil, ou pressione {{key:F}}, para mostrar o alinhamento inteiro de novo.

Editar um PIV mantém o zoom que você escolheu; ele não volta ao ajuste.

Mova o ponteiro ao longo do perfil: a barra mostra a estaca, as cotas do terreno e do projeto, o greide e o corte ou aterro ali, e um ponto acompanha o alinhamento na planta.

## Começar o perfil de projeto

1. No painel da direita, em **Perfil de projeto**, clique em {{ui:Start from the ground}}.
   Dois PIVs são colocados no terreno nas duas extremidades do alinhamento, ligados por um greide reto. A barra de status diz "Perfil de projeto iniciado no terreno nas duas extremidades. Ative Adicionar PIVs e clique para adicionar quebras de greide; defina um comprimento de curva na tabela."

Se o alinhamento não cruza a superfície, você recebe "Este alinhamento não tem terreno sob ele para começar." Nesse caso, adicione PIVs clicando (próxima seção).

## Adicionar PIVs

1. Pressione {{key:I}}, ou clique em {{ui:Add PVIs}} na barra do perfil. O botão fica pressionado.
2. Clique no perfil onde você quer uma quebra de greide. Um PIV é adicionado naquela estaca e cota, arredondado para 0.01, e selecionado.
3. Adicione quantos precisar e pressione {{key:I}} de novo para parar.

Um clique onde já existe um PIV é recusado ("Já existe um PIV em …"). Os PIVs ficam sempre em ordem de estaca.

## Snap ao adicionar ou arrastar

O botão **Snap** na barra do perfil fica ligado no início. Enquanto estiver ligado, um PIV que você adiciona ou arrasta cai sobre o PIV, ponto do terreno, estaca de PIV ou linha do terreno mais próximo, e um rótulo ao lado do marcador diz qual. Segure {{key:Alt}} para um ponto livre, em qualquer lugar.

## Ajustar PIVs

- **Arraste** um PIV no perfil para movê-lo. Ele não pode passar por seus vizinhos. A movimentação é um passo de desfazer.
- **Digite** valores exatos na tabela de PIVs no painel da direita: **Estaca**, **Cota**, **Declividade %** e **Curva L** (comprimento da curva vertical). Pressione {{key:Enter}} após cada um.
- **Escolha** um valor no perfil: o pequeno botão ao lado da estaca ou da cota de um PIV aguarda um clique na vista do perfil e preenche esse valor. O clique se encaixa como em Adicionar PIVs; segure {{key:Alt}} para um ponto livre; {{key:Esc}} cancela.
- **Declividade %** é a declividade da tangente que começa naquele PIV e vai até o próximo. Digitá-la move a **cota do próximo** PIV (a estaca dele nunca se move). Se o próximo PIV estiver bloqueado, a cota do PIV anterior se move no lugar.
- **Bloqueie** um PIV com o cadeado no fim da sua linha. Um PIV bloqueado não é arrastado, e uma edição de declividade não o move. Se as duas extremidades de uma tangente estiverem bloqueadas, a declividade dela não pode mudar: a barra de status informa isso, e você desbloqueia uma extremidade primeiro. O bloqueio é salvo no arquivo.
- **Remova** um PIV com o x no fim da sua linha, ou selecione-o (clique nele) e pressione {{key:Delete}}. Quando a vista do perfil tem o foco, {{key:Backspace}} também o remove.

O primeiro e o último PIV nunca recebem curva.

## Curvas verticais

1. Digite um comprimento em **Curva L** para um PIV interno, por exemplo 200.
2. A curva é desenhada centrada no PIV. O perfil e o painel da direita mostram o tipo dela (crista ou depressão), L e K, as estacas e cotas do BVC e do EVC, e o seu ponto alto ou baixo, quando há um dentro da curva.

K é calculado a partir de L (K = L dividido pela diferença algébrica dos greides, em percentual). Você digita L; digitar K diretamente ainda não está disponível.

Se uma curva vertical não couber, uma caixa vermelha diz por quê: ela avança sobre o PIV ou a curva anterior, ou passa do próximo PIV, e informa quanto espaço há daquele lado (uma curva precisa de metade do seu comprimento de cada lado do seu PIV). O botão dela define **a curva mais longa que cabe**, com o seu K, como um passo ({{key:Mod+Z}} desfaz). Ou afaste os PIVs.

## Ler os dados

Abaixo da tabela de PIVs, uma lista dá cada greide em percentual ("Greide 1: +1.25%") e cada curva, por exemplo "Crista em 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", e depois "Ponto alto 1+62.40, 254.12".

Se os PIVs não alcançam as duas extremidades do alinhamento, uma nota informa isso. Um corredor só é construído onde o perfil e o alinhamento se sobrepõem.

## Linhas de feição no perfil

As linhas de feição também aparecem na vista do perfil, para que você veja um meio-fio, uma valeta ou o topo de um muro em relação ao perfil da estrada.

- Onde uma linha de feição **cruza** o alinhamento, o perfil mostra um pequeno losango naquela estaca e cota, com o nome da linha e a sua cota ali (a própria cota da linha, calculada ao longo do segmento que cruza).
- Digite uma distância em {{ui:Alongside within}} para desenhar também as linhas de feição que **correm ao lado** do alinhamento dentro dessa distância, como linhas tracejadas em suas próprias cotas. Vazio ou 0 mostra apenas os cruzamentos.
- Marcas e rótulos acompanham cada alteração: mova um vértice, digite um greide ou eleve a linha, e o perfil mostra as novas cotas de imediato.
- Clique no losango de um cruzamento para selecionar essa linha de feição; a linha selecionada é desenhada na cor de destaque.
- {{ui:Feature lines}} na barra do perfil oculta ou mostra todas. As duas configurações são salvas com o projeto.

Veja [Linhas de feição](topic:feature-lines).

## Próximos passos

- [Varrer um corredor viário](topic:corridor) ao longo deste alinhamento e deste perfil.
- O perfil é gravado em LandXML junto com o alinhamento; veja [Intercâmbio de LandXML](topic:landxml).
