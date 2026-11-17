---
title: Verificações de linhas elétricas
summary: O que o CivilCraft verifica em cada linha e cabo, sempre atualizado: folgas, espaçamentos, balanço, levantamento, cargas e dimensionamento dos apoios, acessórios, retenidas, fundações, dados em falta, ligações, sobrecargas e queda de tensão.
keywords: verificações, folga, folga ao solo, obstáculo, cruzamento, espaçamento entre fases, balanço do isolador, levantamento, carga do apoio, carga nominal, dimensionamento, fundação, retenida, cabo de retenção, acessório, cruzeta, queda de tensão, sobrecarga, dados em falta, desligado
from: e6a0da47
---

**Verificações** na secção Linhas elétricas lista todos os problemas: a vermelho o que falha e a âmbar os avisos. Clique num para selecionar a linha, o apoio, o cabo ou o equipamento a que diz respeito; os apoios e vãos que falham são assinalados a vermelho na planta enquanto a área de trabalho estiver aberta.

:::warning
Uma ferramenta de apoio ao projeto: estas são verificações do projeto segundo as regras definidas, não uma certificação.
:::

## Folgas

A fase mais baixa do condutor é seguida em cada vão e em cada hipótese de carga. A sua folga mais baixa sobre o solo tem de atingir a **Regra de folga** da linha. Onde um vão atravessa um **obstáculo** (desenhado com {{ui:Obstáculo}}: um ponto ou uma linha, com a sua altura acima do solo e a sua própria regra de folga), a folga sobre o topo do obstáculo é verificada da mesma forma.

**O que a área de trabalho Paisagem coloca acima do solo também conta.** Plantas isoladas (com a copa à dimensão e altura adultas), sebes e canteiros (a espécie mais alta deles) e muros (o seu topo) são obstáculos sob uma linha, sem os desenhar de novo. Mantêm as regras definidas em {{ui:Hipóteses de carga e limites…}}: **Plantas da paisagem sob uma linha** (os conjuntos de exemplo usam *Árvores e plantas*, 3 m) e **Muros da paisagem sob uma linha** (*Edifício*); escolha **Não verificado** para os deixar de fora. A folga é medida na vertical desde o topo da planta ou do muro até ao condutor onde o vão o atravessa; a distância lateral até uma copa ao lado da linha não é verificada. Mover uma árvore ou elevar um muro altera as verificações de imediato.

As regras de folga são as suas: abra-as com **Regras…** junto de qualquer **Regra de folga** (ou em {{ui:Hipóteses de carga e limites…}}) para acrescentar, mudar o nome, alterar ou remover.

## Espaçamento e balanço

- **Espaçamento entre fases** necessário: k·√(flecha + comprimento do isolador) + U/150, com a flecha da hipótese quente e a tensão U em kV (uma forma comum; k é o do conjunto de regras). Comparado com o espaçamento entre fases da cruzeta.
- **Balanço do isolador** nos apoios de suspensão, sob a hipótese de vento: atan(carga transversal ÷ carga vertical), comparado com o maior balanço do conjunto de regras.
- **Levantamento**: um apoio de suspensão mais baixo do que os vizinhos pode ser puxado para cima no frio; fica assinalado.

## Cargas nos apoios e dimensionamento

Para cada apoio e cada hipótese de carga, com todos os condutores da linha:

- **Transversal**: vento por metro × o vão de vento (metade dos dois vãos), mais 2·H·sin(desvio ÷ 2) numa mudança de direção.
- **Ao longo da linha**: a diferença das trações dos dois lados numa amarração ou num ângulo; num apoio de suspensão só sob gelo de um lado (cada vão calculado isoladamente, o que está do lado da segurança).
- **Vertical**: a carga vertical por metro × o vão de peso (entre os pontos mais baixos de cada lado) mais o equipamento.

A carga horizontal é levada ao ponto nominal do apoio (carga equivalente = carga × altura de fixação ÷ altura do ponto nominal) e comparada com a sua **carga nominal** × o fator do conjunto de regras. Quando é demasiado fraco, é sugerido o apoio mais pequeno do mesmo material da biblioteca que a suporta. Um apoio com **retenida** passa a carga horizontal para a retenida, que suporta carga ÷ sin(ângulo da retenida) e é verificada contra a sua própria classificação.

Os acessórios (grampos, isoladores, cruzetas) são verificados contra a sua carga nominal: um acessório de amarração suporta a tração do condutor, e um de suspensão a sua parte da carga vertical e transversal. A **fundação** mostrada é a profundidade do apoio no solo e um furo um pouco mais largo do que a sua base.

## Dados, ligações e corrente

- Um item com um campo necessário vazio, ou uma chave que não está na biblioteca.
- Um extremo de rota de cabo, ou um equipamento, ligado a nada.
- **Queda de tensão** e **corrente** de cada fonte (equipamento marcado como fonte) até às cargas (kW e fator de potência no equipamento), ao longo de vãos aéreos e cabos: √3·I·L·(R cos φ + X sin φ), com R a 20 °C. Acima da corrente nominal do cabo, ou com mais queda do que o conjunto de regras permite, fica assinalado.
