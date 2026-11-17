---
title: Verificações de linhas de energia
summary: O que o CivilCraft verifica em cada linha e cabo, sempre atualizado: folgas, espaçamentos, balanço, levantamento, cargas nas estruturas e dimensionamento, acessórios, estais, fundações, dados faltantes, conexões, sobrecargas e queda de tensão.
keywords: verificações, folga, folga sobre o terreno, obstáculo, cruzamento, espaçamento entre fases, balanço do isolador, levantamento, carga na estrutura, carga nominal, dimensionamento, fundação, estai, acessório, travessa, queda de tensão, sobrecarga, dados faltantes, desconectado
from: e6a0da47
---

**Verificações** na seção Linhas de energia lista todos os problemas, em vermelho o que falha e em âmbar os avisos. Clique em um deles para selecionar a linha, estrutura, cabo ou equipamento a que se refere; estruturas e vãos que falham são circulados em vermelho na planta enquanto a área de trabalho está aberta.

:::warning
Uma ferramenta de projeto: estas são verificações do seu projeto contra as suas próprias regras, não uma certificação.
:::

## Folgas

A fase mais baixa do condutor é acompanhada ao longo de cada vão, em cada hipótese de carga. Sua folga mínima sobre o terreno deve atingir a **Regra de folga** da linha. Onde um vão cruza um **obstáculo** (desenhado com {{ui:Obstáculo}}: um ponto ou uma linha, com sua altura acima do terreno e sua própria regra de folga), a folga sobre o topo do obstáculo é verificada da mesma forma.

**O que a área de trabalho Paisagismo põe acima do terreno também conta.** Plantas isoladas (com a copa na dimensão e altura adultas), cercas vivas e canteiros de plantio (a espécie mais alta deles) e muros (o topo) são obstáculos sob uma linha, sem precisar desenhá-los de novo. Eles mantêm as regras definidas em {{ui:Hipóteses de carga e limites…}}: **Plantas de paisagismo sob uma linha** (os conjuntos de exemplo usam *Árvores e plantas*, 3 m) e **Muros de paisagismo sob uma linha** (*Edificação*); escolha **Não verificado** para deixá-los de fora. A folga é medida em linha reta para cima, do topo da planta ou do muro até o condutor no ponto onde o vão o cruza; a distância lateral até uma copa ao lado da linha não é verificada. Mover uma árvore ou elevar um muro muda as verificações de imediato.

Suas regras de folga são suas: abra-as com **Regras…** ao lado de qualquer **Regra de folga** (ou em {{ui:Hipóteses de carga e limites…}}) para adicionar, renomear, alterar ou remover.

## Espaçamento e balanço

- **Espaçamento entre fases** necessário: k·√(flecha + comprimento do isolador) + U/150, com a flecha do caso quente e a tensão U em kV (uma forma comum; k é o da sua regra). Comparado com o espaçamento entre fases da travessa.
- **Balanço do isolador** em estruturas de suspensão, sob o caso de vento: atan(carga transversal ÷ carga vertical), comparado com o maior balanço da sua regra.
- **Levantamento**: uma estrutura de suspensão mais baixa que suas vizinhas pode ser puxada para cima no frio; ela é sinalizada.

## Cargas nas estruturas e dimensionamento

Para cada estrutura e hipótese de carga, com todos os condutores da linha:

- **Transversal**: vento por metro × vão de vento (metade dos dois vãos), mais 2·H·sin(mudança de direção ÷ 2) em uma mudança de direção.
- **Ao longo da linha**: a diferença das trações dos dois lados em uma ancoragem terminal ou ângulo; em uma estrutura de suspensão, somente sob gelo em um lado (cada vão calculado separadamente, o que erra pelo lado seguro).
- **Vertical**: a carga vertical por metro × vão de peso (entre os pontos mais baixos de cada lado) mais o equipamento.

A carga horizontal é levada ao ponto nominal da estrutura (carga equivalente = carga × altura de fixação ÷ altura do ponto nominal) e comparada com sua **carga nominal** × o fator da regra. Quando ela é fraca demais, sugere-se a menor estrutura do mesmo material na sua biblioteca que a suporte. Uma estrutura com **estai** transfere a carga horizontal ao estai, que suporta carga ÷ sen(ângulo do estai) e é verificado contra a sua própria capacidade.

Acessórios (grampos, isoladores, travessas) são verificados contra sua carga nominal: um acessório de ancoragem suporta a tração do condutor, e um acessório de suspensão, sua parcela da carga vertical e transversal. A **fundação** mostrada é a profundidade da estrutura no terreno e um furo um pouco mais largo que sua base.

## Dados, conexões e corrente

- Um item com um campo necessário vazio, ou uma chave que não está na biblioteca.
- Um fim de trajeto de cabo, ou um equipamento, não conectado a nada.
- **Queda de tensão** e **corrente** de cada fonte (equipamento marcado como fonte) até as cargas (kW e fator de potência no equipamento), ao longo de vãos aéreos e cabos: √3·I·L·(R cos φ + X sin φ), com R a 20 °C. Acima da capacidade de corrente do cabo, ou de uma queda maior que a permitida pela regra, é sinalizado.
