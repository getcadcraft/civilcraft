---
title: Perfis da superfície da água num rio
summary: Modelar um rio a partir da superfície do terreno e calcular perfis permanentes da superfície da água pelo método do passo padrão: níveis de água, energia, velocidades, números de Froude e a extensão da cheia na planta. Funcionalidade em laboratório; cada resultado exige revisão de um engenheiro.
keywords: dique, área de escoamento inativa, editor de perfis, rio, hidráulica, perfil da superfície da água, remanso, passo padrão, escoamento permanente, 1d, perfis transversais, manning, rugosidade, capacidade de transporte, altura crítica, altura normal, froude, linha de energia, extensão da cheia, planície de inundação, inundação, estações das margens, comprimentos de troço, contração, expansão, subcrítico, supercrítico, regime misto, ressalto hidráulico
from: fb8bf425
---

O CivilCraft calcula perfis unidimensionais permanentes da superfície da água ao longo de um rio: para cada caudal que indica, o nível da água em cada perfil transversal, a partir do balanço energético entre perfis vizinhos (o método do passo padrão). Está em laboratório enquanto é verificado.

**Apenas auxílio ao projeto.** Os níveis de água precisam da revisão de um engenheiro qualificado antes de alguém confiar neles: um modelo 1D só vale o que valem os seus perfis, os valores de rugosidade, os comprimentos de troço e as fronteiras, e não conhece pontes, aquedutos nem o escoamento que sai do rio.

## Desenhar o rio

1. Construa primeiro a superfície do terreno natural (pontos, linhas de quebra ou uma TIN que tenha aberto).
2. Em **Superfície** › {{ui:Mais}}, escolha {{ui:Rio}}.
3. Clique ao longo do eixo do rio **de montante para jusante**, depois prima {{key:Enter}} ou faça duplo clique.

O CivilCraft corta um perfil perpendicular ao eixo a cada 50 m (200 ft), com 100 m (300 ft) para cada lado, a partir do terreno. As estacas do rio são medidas a partir da extremidade de jusante, por isso crescem para montante. As margens começam como uma estimativa de 10 m (30 ft) para cada lado do ponto mais baixo de cada perfil.

Para acrescentar um perfil onde o rio estreita ou onde existe uma obra de arte, selecione o rio, clique em {{ui:Adicionar uma secção}} e desenhe uma linha de corte que o atravesse (em qualquer sentido: é virada para ficar da esquerda para a direita, olhando para jusante).

## Configurar o rio

Selecione o rio para o ver nas **Propriedades**:

- **Regime de escoamento**: subcrítico (o habitual: calculado para montante a partir da fronteira de jusante), supercrítico (calculado para jusante a partir da fronteira de montante) ou misto (ambos, e depois o que tiver maior força específica em cada perfil; uma pré-visualização).
- **Perfis de escoamento**: um nome e um caudal para cada um (por exemplo, um caudal de 10 anos e outro de 100 anos), e a fronteira na extremidade de jusante (e na de montante quando o regime não é subcrítico): **Altura normal** com uma inclinação de energia (a inclinação do leito é uma primeira estimativa), uma **Cota da superfície da água** conhecida, ou **Altura crítica**.
- **Perfis a partir do terreno**: o espaçamento, a distância para a esquerda e para a direita, a estimativa das margens e os dois valores de n de Manning. {{ui:Cortar de novo as secções}} substitui os perfis (um passo de anulação).
- **A tabela de perfis**: para cada perfil, os afastamentos das margens esquerda e direita, o n do leito e o n da zona de cheia, os comprimentos de troço até ao perfil seguinte a jusante (zona de cheia esquerda, leito, zona de cheia direita; medidos na planta para começar) e os coeficientes de contração e de expansão (0.1 e 0.3 para começar: transições graduais). {{ui:Editar}} abre o editor de perfis (a seguir); um ponto depois dele indica que o perfil tem um dique ou uma área inativa.

Cada alteração é um passo de anulação ({{key:Mod+Z}}).

## Editar um perfil: margens, diques e áreas inativas

{{ui:Editar}} num perfil desenha o seu terreno e permite arrastar o que o solver lê: a **margem esquerda e direita** (dividem o perfil em zona de cheia esquerda, leito principal e zona de cheia direita), um **dique** de cada lado e **áreas de escoamento inativas**. Cada manípulo também pode ser movido com as setas do teclado, e cada número pode ser introduzido ao lado do gráfico. {{ui:Aplicar}} é um único passo de anulação.

- Um **dique** tem uma posição (afastamento) e uma cota de crista. O terreno para lá dele, afastado do rio, fica separado do rio enquanto a superfície da água estiver abaixo da crista: a sua área, o perímetro molhado e a capacidade de transporte são excluídos. Acima da crista, o perfil inteiro volta a contar. Um dique fica fora da margem que protege; um que esteja dentro das margens é assinalado.
- Uma **área de escoamento inativa** retém água mas não transporta caudal (uma bolsa atrás de um aterro, água parada junto ao acesso a uma ponte). Indique os seus dois afastamentos e, se quiser, um nível de água abaixo do qual é inativa ({{ui:sempre}} se em branco): acima desse nível escoa como o resto. Uma que cubra parte do leito principal é assinalada.
- Entre dois perfis, a extensão da cheia deixa seco o terreno atrás de um dique que ambos os perfis têm, enquanto a superfície da água aí estiver abaixo da crista (a linha entre as duas cristas é reta).

## Calcular e ler os resultados

Clique em {{ui:Perfis da superfície da água}}. Para o perfil que escolher obtém:

- um **gráfico** ao longo do rio (escoamento da esquerda para a direita): fundo do leito, margens, superfície da água, linha de energia e superfície da água crítica; os perfis mantidos à altura crítica ficam circulados;
- uma **tabela** por perfil: estaca do rio, caudal, fundo do leito, superfície da água, superfície crítica, linha de energia, altura, velocidade no leito e global, número de Froude do leito, área do escoamento, largura ao topo, o caudal em cada zona de cheia e no leito, a inclinação de energia e os avisos;
- **avisos** em palavras simples, por exemplo um perfil definido à altura crítica, água acima das extremidades de um perfil, ou uma grande variação da capacidade de transporte entre dois perfis (acrescente perfis pelo meio).

{{ui:Tabela (CSV)}}, {{ui:Relatório}} (texto simples com o método, as fronteiras e cada tabela) e {{ui:Gráfico (SVG)}} gravam nos seus Transferidos. Cada um traz a linha de revisão.

Marque {{ui:Mostrar a extensão da cheia}} nas **Propriedades** para sombrear a área molhada na planta do perfil escolhido, com a linha de água desenhada onde a altura é zero. Entre perfis, a superfície da água é horizontal através do rio e varia linearmente com a estaca do rio. O terreno atrás de um dique fica seco enquanto a água estiver abaixo da crista. Outros terrenos baixos dentro do corredor do rio que a água não consegue alcançar (atrás de um aterro de estrada, por exemplo) continuam sombreados: verifique-os.

## No desenho e em Problemas

As linhas do rio vão para a planta, o PDF e o DWG nas suas próprias camadas: **C-WATR-CNTR** (o eixo), **C-WATR-SCTN** (cada linha de corte, com a sua estaca do rio) e **C-WATR-FLOD** (a linha de água da extensão da cheia, quando {{ui:Mostrar a extensão da cheia}} está marcado para um perfil). Os avisos do rio (um perfil à altura crítica, água acima das extremidades dos perfis, uma variação da capacidade de transporte que pede mais perfis, um balanço energético que não fechou, um dique dentro das margens) vão também para o painel **Problemas**, sobre o rio e colocados no perfil de origem.

## Como é calculado

- Energia entre dois perfis: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Capacidade de transporte por subdivisão: cada zona de cheia é dividida onde o seu n muda, K = Σ (1/n)·A·R^(2/3) (1.486/n em unidades US); o leito é uma só parte, com um n composto quando o seu n muda. O α vem de como a capacidade é repartida.
- Inclinação de atrito pela capacidade média, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², sobre o comprimento de troço ponderado pelo caudal.
- Coeficiente de contração quando o escoamento acelera a jusante, de expansão quando desacelera.
- Altura crítica = energia específica mínima. Cada nível de água é resolvido num intervalo, por isso nunca salta para o lado errado do crítico; quando não existe resposta, fica à altura crítica e é assinalado.

O programa é verificado contra a altura normal de Manning, a altura crítica num canal retangular e o exemplo de remanso de Chow (*Open-Channel Hydraulics*, 1959, capítulo 10), integrado de forma independente. O mesmo método é usado pelos programas 1D de rios correntes, por isso um cálculo à mão ou as notas de um estudante transpõem-se.

## Aquedutos e pontes

Nas **Propriedades** do rio, em **Aquedutos e pontes**, {{ui:Adicionar um aqueduto}} ou {{ui:Adicionar uma ponte}} coloca uma obra entre dois perfis (cada troço mantém pelo menos dois). O perfil abaixo dela não muda; a superfície da água logo a montante vem da estrutura, e o perfil continua para montante a partir daí. **Resultados** acrescenta uma tabela de cada estrutura: nível de jusante, nível de montante, qual controlo governa, o caudal através da abertura e o caudal sobre a estrada ou o tabuleiro. Apenas escoamento subcrítico.

- **Aqueduto** (caixa ou circular, uma ou mais condutas iguais). O controlo à entrada é escoamento de soleira enquanto a entrada está livre e escoamento por orifício quando fica afogada, misturado entre uma cota de montante de uma e de uma vez e meia a altura. O controlo à saída é o balanço energético: perda à entrada, atrito e altura cinética à saída, sobre o maior entre o nível de jusante e o meio da altura crítica e a coroa, menos a queda ao longo da conduta. O nível de montante é o maior dos dois. Marque **A água pode passar por cima da estrada** e o escoamento sobre a estrada reparte o caudal com as condutas.
- **Ponte.** A abertura é o perfil abaixo da ponte, cortado nos encontros, com cada pilar como uma área que não transporta caudal. A superfície da água na abertura vem do perfil de jusante (coeficiente de expansão), e o perfil acima da abertura vem dela (coeficiente de contração). Se a abertura não conseguir passar o caudal àquele nível de jusante, funciona à altura crítica e a ponte é assinalada como estrangulada. Se a água atingir a cota inferior do tabuleiro, o escoamento é sob pressão (tipo comporta enquanto o nível de jusante estiver abaixo da cota inferior, afogado acima dela), e a água sobre o tabuleiro soma escoamento sobre soleira; o nível de montante é aquele em que as parcelas somam o caudal.

Os coeficientes (descarga, perda à entrada, soleira) são valores predefinidos redondos. Altere-os para o seu projeto. Não são os ábacos ajustados que os manuais de projeto de aquedutos imprimem, por isso trate a cota de montante de um aqueduto perto do seu limite como uma estimativa. A água sobre uma estrada ou um tabuleiro, uma entrada afogada, uma abertura estrangulada e o escoamento rápido numa conduta são mostrados em **Problemas**.

## Escoamento não permanente

{{ui:Escoamento não permanente…}} nas **Propriedades** do rio encaminha um hidrograma de cheia ao longo dos perfis. Introduza o caudal de entrada como horas e caudais, um par por linha, a inclinação de jusante (altura normal) e durante quanto tempo correr. Parte da superfície da água permanente no primeiro caudal e resolve as equações unidimensionais completas (o esquema implícito de quatro pontos, ponderado 0.6 no tempo). Obtém o nível de água e o caudal de pico em cada perfil, com a hora em que cada um acontece, um gráfico do caudal nas duas extremidades e a verificação de volume (entrada, saída e a variação armazenada). Verifica-se que o escoamento permanente se mantém permanente, que um degrau no caudal de entrada termina no perfil permanente do novo caudal, que o volume fecha e a velocidade da onda de cheia contra a onda cinemática. Escoamento subcrítico, um troço, sem entradas laterais e sem aquedutos nem pontes dentro da simulação.

## Confluências

Troços que juntam o escoamento numa só saída: os caudais somam-se, e a superfície da água na cabeça do troço de jusante é levada até às extremidades dos troços que se juntam a ele (a mesma superfície da água na confluência, o método simples: sem ângulo, sem momento, por isso adequado a números de Froude baixos). O modelo e os testes estão em `river-structures.js`; um painel para juntar dois rios na planta ainda não está implementado.

## Ainda não implementado

Açudes e comportas como estruturas próprias, um painel para confluências, estruturas dentro de uma simulação não permanente e escoamento não permanente supercrítico. Uma simulação de regime misto assinala um ressalto hidráulico entre dois perfis, mas não o coloca.

**Onde os rios se juntam.** Nas Propriedades de um rio, "Desagua em" indica o rio em que se junta. Os rios que se juntam são resolvidos em conjunto: o rio para onde desaguam transporta a soma dos seus caudais, e cada um termina na superfície da água do primeiro perfil desse rio (o método da superfície de água igual; deixa de fora o ângulo e o momento dos caudais). Para juntar um rio principal e um ribeiro, desenhe um pequeno rio abaixo da confluência e faça ambos desaguar nele. Os resultados mostram uma tabela de confluência. Os valores predefinidos nestes resultados (contração 0.1, expansão 0.3, leito de uma só peça com rugosidade composta, regime misto pela força específica) mantêm-se até um engenheiro os rever, e os Resultados dizem-no.
