---
title: Perfis da superfície da água em rios
summary: Modele um rio a partir da superfície do terreno e calcule perfis permanentes da superfície da água pelo método do passo padrão: níveis de água, energia, velocidades, números de Froude e a mancha de inundação na planta. Um recurso de laboratório; cada resultado exige a revisão de um engenheiro.
keywords: dique, área de escoamento ineficaz, editor de seções, rio, hidráulica, perfil da superfície da água, remanso, passo padrão, escoamento permanente, 1D, seções transversais, Manning, rugosidade, condutância, altura crítica, altura normal, Froude, linha de energia, mancha de inundação, planície de inundação, inundação, margens, comprimentos de trecho, contração, expansão, subcrítico, supercrítico, regime misto, ressalto hidráulico
from: fb8bf425
---

O CivilCraft calcula perfis unidimensionais, permanentes, da superfície da água ao longo de um rio: para cada vazão informada, o nível da água em cada seção transversal, a partir do balanço de energia entre seções vizinhas (o método do passo padrão). Ele está no laboratório enquanto é verificado.

**Apenas auxílio de projeto.** Os níveis de água precisam da revisão de um engenheiro qualificado antes que alguém confie neles: um modelo 1D é tão bom quanto suas seções, valores de rugosidade, comprimentos de trecho e condições de contorno, e ele não conhece pontes, bueiros nem o escoamento que sai do rio.

## Desenhar o rio

1. Construa primeiro a superfície do terreno existente (pontos, linhas de quebra ou um TIN que você abriu).
2. Em **Superfície** › {{ui:More}}, escolha {{ui:River}}.
3. Clique ao longo do eixo do rio **de montante para jusante**, depois pressione {{key:Enter}} ou dê um duplo clique.

O CivilCraft corta uma seção perpendicular ao eixo a cada 50 m (200 ft), com 100 m (300 ft) para cada lado, a partir do terreno. As estacas do rio são medidas a partir da extremidade de jusante, então elas aumentam em direção a montante. As margens começam como uma estimativa de 10 m (30 ft) para cada lado do ponto mais baixo de cada seção.

Para adicionar uma seção onde o rio se estreita ou onde existe uma estrutura, selecione o rio, clique em {{ui:Add a section}} e desenhe uma linha de corte atravessando-o (em qualquer sentido: ela é virada para ficar da esquerda para a direita olhando para jusante).

## Configurar o rio

Selecione o rio para vê-lo em **Propriedades**:

- **Regime de escoamento**: subcrítico (o usual: calculado de montante a partir da condição de jusante), supercrítico (calculado de jusante a partir da condição de montante) ou misto (ambos, depois o que tiver a maior força específica em cada seção; uma prévia).
- **Perfis de vazão**: um nome e uma vazão para cada um (por exemplo, uma vazão de 10 anos e uma de 100 anos), e a condição de contorno na extremidade de jusante (e na de montante quando o regime não for subcrítico): **Altura normal** com uma declividade de energia (a declividade do leito é uma primeira estimativa), um **Nível de água conhecido**, ou **Altura crítica**.
- **Seções a partir do terreno**: o espaçamento, a distância para a esquerda e para a direita, a estimativa das margens e os dois valores de n de Manning; {{ui:Cut sections again}} substitui as seções (um passo de desfazer).
- **A tabela de seções**: para cada seção, os deslocamentos das margens esquerda e direita, o n do canal e o n da planície de inundação, os comprimentos de trecho até a próxima seção a jusante (planície esquerda, canal, planície direita; medidos na planta para começar) e os coeficientes de contração e expansão (0,1 e 0,3 para começar: transições graduais). {{ui:Edit}} abre o editor de seções (a seguir); um ponto depois dele indica que a seção tem um dique ou uma área ineficaz.

Cada alteração é um passo de desfazer ({{key:Mod+Z}}).

## Editar uma seção: margens, diques e áreas ineficazes

{{ui:Edit}} em uma seção desenha o seu terreno e permite arrastar o que o solucionador lê: a **margem esquerda e a direita** (elas dividem a seção em planície esquerda, canal principal e planície direita), um **dique** em qualquer lado e **áreas de escoamento ineficaz**. Cada alça também pode ser movida com as teclas de seta, e cada número pode ser digitado ao lado do gráfico. {{ui:Apply}} é um passo de desfazer.

- Um **dique** tem uma posição (deslocamento) e uma cota de crista. O terreno além dele, longe do rio, fica separado do rio enquanto a superfície da água estiver abaixo da crista: sua área, seu perímetro molhado e sua condutância são excluídos. Acima da crista a seção inteira volta a contar. Um dique fica fora da margem que ele protege; um dique dentro das margens é sinalizado.
- Uma **área de escoamento ineficaz** retém água, mas não transporta vazão (uma depressão atrás de um aterro, água parada ao lado do acesso de uma ponte). Informe seus dois deslocamentos e, se quiser, um nível de água abaixo do qual ela é ineficaz ({{ui:always}} quando vazio): acima desse nível ela escoa como o resto. Uma área que cobre parte do canal principal é sinalizada.
- Entre duas seções, a mancha de inundação deixa seco o terreno atrás de um dique que as duas seções têm, enquanto a superfície da água ali estiver abaixo da crista (a linha entre as duas cristas é reta).

## Calcular e ler os resultados

Clique em {{ui:Water surface profiles}}. Para o perfil que você escolher, você obtém:

- um **gráfico** ao longo do rio (vazão da esquerda para a direita): fundo do canal, margens, superfície da água, linha de energia e superfície crítica da água; seções mantidas em altura crítica são circuladas;
- uma **tabela** por seção: estaca do rio, vazão, fundo do canal, superfície da água, superfície crítica da água, linha de energia, altura, velocidade no canal e no total, o número de Froude do canal, área de escoamento, largura do topo, a vazão em cada planície e no canal, a declividade de energia e os avisos;
- **avisos** em palavras simples, por exemplo uma seção definida em altura crítica, água acima das extremidades de uma seção, ou uma grande variação de condutância entre duas seções (adicione seções entre elas).

{{ui:Table (CSV)}}, {{ui:Report}} (texto simples com o método, as condições de contorno e cada tabela) e {{ui:Plot (SVG)}} salvam na sua pasta de downloads. Cada um deles traz a linha de revisão.

Marque {{ui:Show the flood extent}} em **Propriedades** para sombrear na planta a área molhada do perfil escolhido, com a linha d'água desenhada onde a altura é zero. Entre seções, a superfície da água é nivelada através do rio e varia linearmente com a estaca do rio. O terreno atrás de um dique fica seco enquanto a água estiver abaixo da sua crista. Outras áreas baixas dentro do corredor do rio que a água não consegue alcançar (atrás de um aterro de estrada, por exemplo) ainda são sombreadas: confira.

## No desenho e em Problemas

As linhas do rio vão para a planta, para o PDF e para o DWG em suas próprias camadas: **C-WATR-CNTR** (o eixo), **C-WATR-SCTN** (cada linha de corte, com sua estaca do rio) e **C-WATR-FLOD** (a linha d'água da mancha de inundação, quando {{ui:Show the flood extent}} está marcado para um perfil). Os avisos do rio (uma seção definida em altura crítica, água acima das extremidades de seção, uma variação de condutância que pede mais seções, um balanço de energia que não fechou, um dique dentro das margens) também vão para o painel **Problemas**, relativos ao rio e posicionados na seção de onde vêm.

## Como é calculado

- Energia entre duas seções: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Condutância por subdivisão: cada planície é dividida onde o seu n muda, K = Σ (1/n)·A·R^(2/3) (1,486/n em unidades americanas); o canal é uma peça única, com um n composto quando o seu n muda. O α vem de como a condutância é dividida.
- Declividade de atrito pela condutância média, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², sobre o comprimento de trecho ponderado pela vazão.
- Coeficiente de contração quando o escoamento acelera a jusante, de expansão quando ele desacelera.
- Altura crítica = menor energia específica. Cada nível de água é resolvido em um intervalo fechado, então nunca salta para o lado errado do crítico; quando não existe resposta, ele é definido como altura crítica e sinalizado.

O programa é verificado contra a altura normal de Manning, a altura crítica em canal retangular e o exemplo de remanso de Chow (*Open-Channel Hydraulics*, 1959, capítulo 10), integrado de forma independente. O mesmo método é usado pelos programas 1D de rios mais comuns, então um cálculo à mão ou as anotações de um estudante se aplicam.

## Bueiros e pontes

Nas **Propriedades** do rio, em **Bueiros e pontes**, {{ui:Add a culvert}} ou {{ui:Add a bridge}} coloca um deles entre duas seções (cada trecho mantém pelo menos duas). O perfil abaixo dele não muda; a superfície da água logo acima dele vem da estrutura, e o perfil segue para montante a partir dali. **Resultados** adiciona uma tabela de cada estrutura: nível a jusante, nível a montante, qual controle governa, a vazão pela abertura e a vazão sobre a estrada ou o tabuleiro. Somente escoamento subcrítico.

- **Bueiro** (celular ou circular, uma ou mais galerias iguais). O controle de entrada é escoamento de vertedouro enquanto a entrada está livre e escoamento por orifício quando ela está afogada, com transição entre um nível a montante de um e um e meio vez a altura. O controle de saída é o balanço de energia: perda na entrada, atrito e carga cinética de saída, sobre o maior entre o nível de jusante e o ponto médio da altura crítica e da geratriz superior, menos a queda ao longo da galeria. O nível a montante é o maior dos dois. Marque **A água pode passar sobre a estrada** e o escoamento de vertedouro da estrada divide a vazão com as galerias.
- **Ponte.** A abertura é a seção abaixo da ponte, cortada nos encontros, com cada pilar como uma área que não transporta vazão. O nível da água na abertura vem da seção de jusante (coeficiente de expansão), e a seção de montante, da abertura (coeficiente de contração). Se a abertura não puder escoar a vazão com aquele nível de jusante, ela opera em altura crítica e a ponte é sinalizada como obstruída. Se a água alcançar a longarina inferior, o escoamento é sob pressão (tipo comporta enquanto o nível de jusante estiver abaixo da longarina inferior, afogado acima dela), e a água sobre o tabuleiro soma escoamento de vertedouro; o nível de montante é aquele em que as parcelas somam a vazão.

Os coeficientes (vazão, perda na entrada, vertedouro) são valores padrão arredondados e digitados. Altere-os para o seu projeto. Eles não são os ábacos ajustados que os manuais de projeto de bueiros imprimem, então trate o nível a montante de um bueiro perto do seu limite como uma estimativa. Água sobre uma estrada ou tabuleiro, uma entrada afogada, uma abertura obstruída e escoamento rápido em uma galeria são mostrados em **Problemas**.

## Escoamento não permanente

{{ui:Unsteady flow…}} nas **Propriedades** do rio encaminha um hidrograma de cheia ao longo das seções. Digite a afluência como horas e vazões, um par por linha, a declividade de jusante (altura normal) e por quanto tempo rodar. Ele começa a partir da superfície da água permanente na primeira vazão e resolve as equações unidimensionais completas (o esquema implícito de quatro pontos, com peso 0,6 no tempo). Você obtém o nível e a vazão máximos da água em cada seção, com a hora em que cada um ocorre, um gráfico da vazão nas duas extremidades e a verificação de volume (entrada, saída e a variação armazenada). Ele é verificado quanto a: escoamento permanente que continua permanente, um degrau na afluência terminando no perfil permanente da nova vazão, fechamento do volume e a velocidade da onda de cheia em relação à onda cinemática. Escoamento subcrítico, um trecho, sem afluência lateral, e sem bueiros nem pontes dentro da simulação.

## Confluências

Trechos que juntam a vazão em uma única saída: as vazões se somam, e a superfície da água na cabeceira do trecho de jusante é levada até as extremidades dos trechos que nele desaguam (a mesma superfície da água na confluência, o método simples: sem ângulo, sem quantidade de movimento, então se adequa a números de Froude baixos). O modelo e os testes estão no lugar (`river-structures.js`); um painel para juntar dois rios no plano ainda não está implementado.

## Ainda não implementado

Vertedouros e comportas como estruturas próprias, um painel para confluências, estruturas dentro de uma simulação não permanente, e escoamento supercrítico não permanente. Uma simulação de regime misto sinaliza um ressalto hidráulico entre duas seções, mas não o posiciona.

**Onde os rios se juntam.** Nas Propriedades de um rio, "Deságua em" indica o rio em que ele deságua. Os rios que desaguam são resolvidos em conjunto: o rio em que eles desaguam carrega a soma de suas vazões, e cada um deles termina na superfície da água da primeira seção daquele rio (o método da superfície de água igual; ele deixa de fora o ângulo e a quantidade de movimento das vazões). Para juntar um rio principal e um córrego, desenhe um trecho curto de rio abaixo da confluência e faça os dois desaguarem nele. Os resultados mostram uma tabela de confluência. Os valores padrão destes resultados (contração 0,1, expansão 0,3, canal de peça única com rugosidade composta, regime misto por força específica) permanecem até que um engenheiro os revise, e os Resultados informam isso.
