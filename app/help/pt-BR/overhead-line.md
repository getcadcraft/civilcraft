---
title: Desenhar uma linha aérea
summary: Posicione as estruturas no plano, deixe o CivilCraft descobrir o papel de cada estrutura e os trechos entre as ancoragens terminais, e mova as estruturas no plano ou no perfil da linha.
keywords: linha aérea, estrutura, poste, vão, seção, ancoragem terminal, ângulo, suspensão, perfil, altura, braço, estai, tirante
from: b8e5e272
---

## Desenhar

1. Tenha uma superfície: o terreno sob a linha vem dela ([Criar uma superfície](topic:build-surface)). Uma estrutura sem terreno embaixo dela aparece em **Checks**; digite o **Ground level** dela em Propriedades.
2. Clique em {{ui:Line}} no grupo Power lines e clique em cada estrutura no plano.
3. Dê duplo clique na última, ou pressione Enter.

A linha recebe o condutor, a estrutura e os equipamentos que você usou por último neste computador (na primeira vez: exemplos da biblioteca). Altere-os em Propriedades.

## A linha em Propriedades

Selecione a linha (clique em um vão) para definir o **Conductor**, **Conductors per circuit**, **Circuits**, **Voltage**, a **Clearance rule** que ela precisa manter sobre o terreno, e os equipamentos **On every support** (um braço, isoladores, acessórios). A tabela lista as suas **sections**, com o vão de regulagem de cada uma, a tração usual e a hipótese de carga que a governa.

## Estruturas

Clique em uma estrutura para selecioná-la. Em Propriedades:

- **Support**: o item da biblioteca dela. Quando ela é fraca demais, {{ui:Use …}} coloca a menor estrutura do mesmo material na sua biblioteca que suporta a carga.
- **Role**: Automatic, Suspension, Angle ou Dead-end. Automatic significa: a primeira e a última estruturas são ancoragens terminais; uma mudança de direção acima do ângulo da regra torna a estrutura um ângulo; uma mudança maior, uma ancoragem terminal.
- **Height above ground**: vazio a toma do item da biblioteca (o comprimento dele menos a profundidade enterrada).
- **On this support too**: equipamentos extras, como um **stay** (estai). Uma estrutura estaiada transfere a tração da linha para o seu estai.
- **Existing support**: é verificada como as outras, mas fica fora das quantidades.

{{ui:Support}} acrescenta uma estrutura no vão mais próximo do seu clique. Arraste uma estrutura no plano para movê-la. Delete a remove (uma linha mantém pelo menos duas).

As seções vão de ancoragem terminal a ancoragem terminal: dentro de uma seção, o condutor corre livre pelas presilhas de suspensão, então uma única tração vale para toda a seção.

## O perfil da linha

Clique em {{ui:Profile}} (ou em **Profile** nas Propriedades da linha). O painel sob o plano mostra o terreno ao longo da linha, cada estrutura do terreno até o seu topo, a fase mais baixa do condutor na **Load case** que você escolher, e a folga que a linha precisa manter, como uma linha tracejada. Um vão que falha fica vermelho; o número sob cada vão é a sua folga mínima.

- **Line** escolhe a linha aérea a mostrar. Selecionar outra linha, ou uma das suas estruturas, no plano troca o perfil para ela.
- Passe o ponteiro sobre o perfil: uma linha-guia o acompanha, e o rótulo informa a distância ao longo da linha, o terreno, o condutor e a folga naquele ponto (e avisa quando a folga está abaixo da regra da linha).
- {{ui:Measure}} na barra do perfil: clique em dois pontos para obter a distância horizontal, a diferença de altura, a distância reta e a declividade entre eles. Um clique perto do terreno, do condutor ou do topo de uma estrutura se ajusta a esse ponto. Clique em {{ui:Measure}} de novo para parar.
- Obstáculos que a linha cruza se erguem do terreno: os desenhados como barras, as plantas do Paisagismo pela sua copa, os muros como barras (veja [Verificações de linhas de energia](topic:power-line-checks#clearances)). Rotas de cabos e tubulações que a linha cruza são marcadas abaixo do terreno, no seu topo, com o nome delas.

- Arraste uma estrutura para os lados para movê-la ao longo da linha.
- Arraste o topo dela para cima ou para baixo para definir a sua altura acima do terreno.
