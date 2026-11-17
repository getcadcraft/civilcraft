---
title: Desenhar uma linha elétrica aérea
summary: Coloque apoios na planta, deixe o CivilCraft determinar o papel de cada apoio e as secções entre fins de linha, e mova apoios na planta ou no perfil da linha.
keywords: linha aérea, apoio, poste, vão, secção, fim de linha, ângulo, suspensão, perfil, altura, braço transversal, estai, tirante
from: b8e5e272
---

## Desenhar

1. Tenha uma superfície: o terreno sob a linha vem dela ([Criar uma superfície](topic:build-surface)). Um apoio sem terreno debaixo de si é listado em **Verificações**; introduza o seu **Nível do terreno** nas Propriedades.
2. Clique em {{ui:Linha}} no grupo Linhas elétricas aéreas e clique em cada apoio na planta.
3. Faça duplo clique no último, ou prima {{key:Enter}}.

A linha recebe o condutor, o apoio e o equipamento que usou por último neste computador (na primeira vez: exemplos da biblioteca). Altere-os nas Propriedades.

## A linha nas Propriedades

Selecione a linha (clique num vão) para definir o seu **Condutor**, **Condutores por circuito**, **Circuitos**, **Tensão**, a **Regra de folga** que tem de manter sobre o terreno, e o equipamento **Em cada apoio** (um braço transversal, isoladores, acessórios). A tabela lista as suas **secções**, com o vão de regulação de cada uma, a tração corrente, e a hipótese de carga que a rege.

## Apoios

Clique num apoio para o selecionar. Nas Propriedades:

- **Apoio**: o seu item da biblioteca. Quando é demasiado fraco, {{ui:Usar …}} coloca o menor apoio do mesmo material na sua biblioteca que suporte a carga.
- **Papel**: Automático, Suspensão, Ângulo ou Fim de linha. Automático significa: o primeiro e o último apoios são fins de linha; uma mudança de direção acima do ângulo da regra torna o apoio num apoio de ângulo; uma mudança maior torna-o num fim de linha.
- **Altura acima do terreno**: vazio toma-a do item da biblioteca (o seu comprimento menos a profundidade no terreno).
- **Também neste apoio**: equipamento extra, como um **estai** (tirante). Um apoio estaiado transmite a tração da linha ao seu estai.
- **Apoio existente**: é verificado como os outros, mas fica de fora das quantidades.

{{ui:Apoio}} acrescenta um apoio no vão mais próximo do seu clique. Arraste um apoio na planta para o mover. {{key:Delete}} remove-o (uma linha mantém pelo menos dois).

Os vãos correm entre fins de linha: dentro de uma secção o condutor corre livremente pelas pinças de suspensão, pelo que uma só tração serve toda a secção.

## O perfil da linha

Clique em {{ui:Perfil}} (ou em **Perfil** nas Propriedades da linha). O painel sob a planta mostra o terreno ao longo da linha, cada apoio desde o terreno até ao seu topo, a fase mais baixa do condutor na **Hipótese de carga** que escolher, e a folga que a linha tem de manter, como linha tracejada. Um vão que falha fica a vermelho; o número sob cada vão é a sua folga mais baixa.

- **Linha** escolhe a linha elétrica aérea a mostrar. Selecionar outra linha, ou um dos seus apoios, na planta muda o perfil para ela.
- Mova o ponteiro sobre o perfil: uma linha-guia segue-o, e o rótulo indica a distância ao longo da linha, o terreno, o condutor e a folga nesse ponto (e diz quando a folga está abaixo da regra da linha).
- {{ui:Medir}} na barra do perfil: clique em dois pontos para obter a distância horizontal, a diferença de altura, a distância em linha reta e o declive entre eles. Um clique perto do terreno, do condutor ou do topo de um apoio fixa-se nele. Clique de novo em {{ui:Medir}} para parar.
- Os obstáculos que a linha atravessa erguem-se do terreno: os desenhados como barras, as plantas de Paisagismo pela sua copa, os muros como barras (veja [Verificações de linhas elétricas](topic:power-line-checks#clearances)). As rotas de cabos e as tubagens que a linha atravessa são marcadas abaixo do terreno, no seu topo, com o nome.

- Arraste um apoio lateralmente para o mover ao longo da linha.
- Arraste o seu topo para cima ou para baixo para definir a sua altura acima do terreno.
