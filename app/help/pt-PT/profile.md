---
title: Desenhar um perfil vertical
summary: Abra a vista do perfil, inicie um perfil de projeto a partir do terreno, acrescente e arraste PVI, defina os comprimentos das curvas verticais e leia as rasantes, os valores K e os pontos altos e baixos.
keywords: perfil, alinhamento vertical, pvi, curva vertical, rasante, valor k, cume, vale, bvc, evc, vista do perfil, rasante de projeto, fg, perfil do terreno existente, linhas características no perfil, cruzamentos, projetado, lancil, vala, etiquetas
from: dbb1f32d
---

Cada diretriz tem um perfil de projeto: uma lista de PVI (estaca e cota) ligados por rasantes retas, com uma curva vertical parabólica simétrica em qualquer PVI intermédio que tenha um comprimento. O perfil do terreno existente é amostrado a partir da superfície por si.

## Abrir a vista do perfil

1. Selecione a diretriz (clique nela com {{ui:Selecionar}}).
2. Prima {{key:R}}, ou clique em {{ui:Perfil}} na barra de ferramentas, ou em {{ui:Vista do perfil}} na parte inferior do painel da direita.
   A vista do perfil abre sob a planta, com o terreno existente ao longo da diretriz. Com duas ou mais diretrizes, escolha uma na lista à esquerda da barra do perfil.

A vista começa por mostrar a diretriz completa e estica as cotas para preencher o painel; o exagero vertical aparece no canto inferior esquerdo, por exemplo "Exagero vertical 10×".

## Ampliar e deslocar o perfil

- **Zoom:** rode a roda do rato (ou faça pinça no trackpad) e a vista amplia-se em torno do cursor. Mantenha {{key:Shift}} premido para ampliar apenas as estacas, ou {{key:Alt}} para ampliar apenas as cotas (isso altera o exagero). Com a vista do perfil focada, as teclas de mais e de menos ampliam a partir do centro.
- **Deslocar:** arraste com o botão direito ou central do rato, ou deslize com dois dedos no trackpad.
- **Ajustar:** faça duplo clique no perfil ou prima {{key:F}} para voltar a mostrar a diretriz completa.

Editar um PVI mantém o zoom escolhido; não volta ao ajuste.

Mova o cursor ao longo do perfil: a barra mostra a estaca, as cotas do terreno e de projeto, a rasante e a escavação ou o aterro nesse ponto, e um ponto segue a diretriz na planta.

## Iniciar o perfil de projeto

1. No painel da direita, em **Perfil de projeto**, clique em {{ui:Começar a partir do terreno}}.
   São colocados dois PVI no terreno, nas duas extremidades da diretriz, ligados por uma rasante reta. A barra de estado indica "Perfil de projeto iniciado no terreno nas duas extremidades. Ative Adicionar PVI e clique para acrescentar quebras de rasante; defina-lhes um comprimento de curva na tabela."

Se a diretriz não cruzar a superfície, aparece "Esta diretriz não tem terreno por baixo a partir do qual começar." Nesse caso, acrescente PVI clicando (secção seguinte).

## Adicionar PVI

1. Prima {{key:I}}, ou clique em {{ui:Adicionar PVI}} na barra do perfil. Mantém-se premido.
2. Clique no perfil onde quer uma quebra de rasante. Um PVI é acrescentado nessa estaca e cota, arredondado a 0.01, e fica selecionado.
3. Acrescente os que precisar e prima {{key:I}} de novo para parar.

Um clique onde já existe um PVI é recusado ("Já existe um PVI em …"). Os PVI mantêm-se sempre por ordem de estaca.

## Snap ao acrescentar ou arrastar

O botão **Snap** na barra do perfil está ativo ao início. Enquanto estiver ativo, um PVI que acrescente ou arraste fica no PVI mais próximo, num ponto do terreno, na estaca de um PVI ou na linha do terreno, e uma etiqueta junto ao marcador indica qual. Mantenha {{key:Alt}} premido para um ponto livre, em qualquer lugar.

## Ajustar PVI

- **Arraste** um PVI no perfil para o mover. Não pode passar pelos seus vizinhos. A movimentação é um passo de anulação.
- **Escreva** valores exatos na tabela de PVI do painel da direita: **Estaca**, **Cota**, **Inclinação %** e **Curva L** (comprimento da curva vertical). Prima {{key:Enter}} depois de cada um.
- **Escolha** um valor no perfil: o pequeno botão ao lado da estaca ou da cota de um PVI aguarda um clique na vista do perfil e preenche esse valor. O clique funciona com snap como em Adicionar PVI; mantenha {{key:Alt}} premido para um ponto livre; {{key:Esc}} cancela.
- **Inclinação %** é a rasante da tangente que começa nesse PVI e vai até ao seguinte. Escrever um valor move a cota do **seguinte** PVI (a sua estaca nunca se move). Se o PVI seguinte estiver bloqueado, move-se em vez disso a cota do PVI anterior.
- **Bloqueie** um PVI com o cadeado no fim da sua linha. Um PVI bloqueado não é arrastado, e uma edição de inclinação não o move. Se as duas extremidades de uma tangente estiverem bloqueadas, a sua inclinação não pode mudar: a barra de estado indica-o, e primeiro tem de desbloquear uma extremidade. O bloqueio fica guardado no ficheiro.
- **Remova** um PVI com o x no fim da sua linha, ou selecione-o (clique nele) e prima {{key:Delete}}. Quando a vista do perfil tem o foco, {{key:Backspace}} também o remove.

O primeiro e o último PVI nunca têm curva.

## Curvas verticais

1. Escreva um comprimento em **Curva L** para um PVI intermédio, por exemplo 200.
2. A curva é desenhada centrada no PVI. O perfil e o painel da direita mostram o seu tipo (cume ou vale), L e K, as estacas e cotas do BVC e do EVC, e o seu ponto alto ou baixo quando o tem dentro da curva.

K é calculado a partir de L (K = L dividido pela diferença algébrica das rasantes, em percentagem). Escreve-se L; escrever K diretamente ainda não está disponível.

Se uma curva vertical não couber, uma caixa vermelha indica o motivo: recua para dentro do PVI ou da curva anterior, ou ultrapassa o PVI seguinte, e indica o espaço disponível de cada lado (uma curva precisa de metade do seu comprimento de cada lado do seu PVI). O seu botão define **a curva mais longa que cabe**, com o seu K, num único passo ({{key:Mod+Z}} anula-o). Ou afaste os PVI.

## Ler os dados

Sob a tabela de PVI, uma lista indica cada rasante em percentagem ("Rasante 1: +1.25%") e cada curva, por exemplo "Cume em 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", e depois "Ponto alto 1+62.40, 254.12".

Se os PVI não chegarem às duas extremidades da diretriz, uma nota indica-o. Um corredor só é construído onde o perfil e a diretriz se sobrepõem.

## Linhas características no perfil

As linhas características também aparecem na vista do perfil, para que veja um lancil, uma vala ou o topo de um muro em relação ao perfil da estrada.

- Onde uma linha característica **cruza** a diretriz, o perfil mostra um pequeno losango nessa estaca e cota, com o nome da linha e a sua cota nesse ponto (a cota própria da linha, calculada ao longo do segmento que cruza).
- Escreva uma distância em {{ui:Ao lado, a menos de}} para desenhar também as linhas características que **correm ao lado** da diretriz dentro dessa distância, como linhas a tracejado às suas próprias cotas. Vazio ou 0 mostra apenas os cruzamentos.
- As marcas e etiquetas acompanham cada alteração: mova um vértice, escreva uma rasante ou eleve a linha, e o perfil mostra imediatamente as novas cotas.
- Clique no losango de um cruzamento para selecionar essa linha característica; a linha selecionada é desenhada na cor de realce.
- {{ui:Linhas características}} na barra do perfil oculta ou mostra todas. Ambas as definições ficam guardadas com o projeto.

Veja [Linhas características](topic:feature-lines).

## A seguir

- [Varrimento de um corredor rodoviário](topic:corridor) ao longo da diretriz e deste perfil.
- O perfil é escrito em LandXML com a diretriz; veja [Trocar LandXML](topic:landxml).
