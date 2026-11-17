---
title: Projetar uma via férrea
summary: Transforme um alinhamento em uma ferrovia: transições de trilho (clotoide, parábola cúbica, Bloss, Helmert, meia onda senoidal, senoide), superelevação em cada curva com sua superelevação de equilíbrio, insuficiência e excesso, limites de superelevação e de geometria da via como avisos, aparelhos de mudança de via e travessias por estaca, um envelope de gabarito varrido ao longo da linha e uma via com trilhos, dormentes e lastro construída como corredor, em planta, seções, perfil, 3D e quantitativos.
keywords: ferrovia, trilho, ferroviário, via, via férrea, trem, metrô, bonde, superelevação, insuficiência de superelevação, excesso de superelevação, superelevação de equilíbrio, transição, curva de transição, clotoide, parábola cúbica, Bloss, Helmert, meia onda senoidal, cosseno, bitola, bitola padrão, bitola larga, bitola métrica, bitola estreita, dormente, lastro, sub-lastro, plataforma da via, berma, afastamento entre vias, 60E1, 54E1, UIC60, 115RE, 136RE, gradiente de superelevação, taxa de variação da superelevação, aparelho de mudança de via, desvio, agulha, travessia de vias, jacaré, número do jacaré, lead, curva de fechamento, velocidade no desvio, gabarito, envelope de gabarito, gabarito da estrutura, gabarito de carregamento, envelope cinemático, plataforma, vão da plataforma, espaçamento entre vias, greide, curva vertical, raio mínimo, LandXML superelevação
from: 99de9745
---

Qualquer alinhamento pode ser uma via férrea. Suas curvas então recebem transições de trilho e uma superelevação (a superelevação dos trilhos), e seu corredor é construído como uma via: trilhos sobre dormentes em um leito de lastro, com greide e terraplenagem como uma estrada. Aparelhos de mudança de via e travessias são colocados nele por estaca, e um envelope de gabarito pode ser varrido ao longo dele e verificado contra o que está ao lado da via.

Todos os números abaixo são **valores provisórios**, não normas. As ferrovias definem seus limites pela velocidade da linha, pelo tipo de via e pelo país; defina-os a partir da norma da sua própria ferrovia. O CivilCraft não traz nenhuma tabela nacional.

## Tornar o alinhamento uma ferrovia

1. Selecione o alinhamento e localize **Ferrovia** em Propriedades.
2. Marque **Este alinhamento é uma via férrea**. Cada alteração é uma etapa de desfazer.
3. Defina a **Velocidade de projeto** no topo das Propriedades do alinhamento: é a velocidade da linha contra a qual a superelevação é verificada. **Trens mais lentos** (no bloco Ferrovia) é a velocidade contra a qual o excesso de superelevação é verificado.

## Transições

Informe um comprimento de espiral em cada extremidade de cada curva na tabela de PI (**Espiral de entrada**, **Espiral de saída**) e, em seguida, escolha o tipo na tabela de curvas do bloco Ferrovia, ou use **Transição para todas as curvas**:

| Tipo | Curvatura ao longo da transição |
|---|---|
| Clotoide | cresce uniformemente (a espiral da estrada) |
| Parábola cúbica | y = x³ / (6·R·L), com L medido ao longo da tangente; a curva em si é um pouco mais longa |
| Bloss | 3u² − 2u³ da curvatura total (u = a parcela do comprimento): começa e termina suavemente |
| Helmert | duas parábolas, 2u² e depois 1 − 2(1 − u)² |
| Meia onda senoidal | (1 − cos πu) / 2 |
| Senoide | u − sen(2πu) / 2π |

Todos, exceto a parábola cúbica, giram L / 2R, como a clotoide. As estacas seguem o comprimento real. O LandXML mantém o tipo (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Superelevação

Digite a **Superelevação** de cada curva em milímetros. A tabela mostra, para cada curva:

- **Superelevação de equilíbrio** = G·v² / (g·R), sendo G a **Distância entre centros dos trilhos** (a bitola mais a largura da cabeça do trilho, a menos que você digite outro valor). Com G = 1500 mm, isso corresponde à conhecida fórmula 11,8·V² / R (V em km/h, R em m).
- **Insuficiência** = equilíbrio na velocidade da linha − superelevação aplicada.
- **Excesso** = superelevação aplicada − equilíbrio na velocidade dos trens mais lentos.
- **Rampa**: o maior gradiente de superelevação ao longo de suas rampas, em milímetros por metro.

A superelevação cresce ao longo de cada transição, com a forma de sua curvatura: reta para clotoide ou parábola cúbica, em forma de Bloss para Bloss, e assim por diante. Uma extremidade de curva sem transição tem sua rampa na tangente que a precede, pelo comprimento que o limite de gradiente de superelevação exigir, e isso é indicado: a superelevação então varia onde a curvatura não varia.

**A superelevação gira em torno de** define qual trilho permanece sobre o perfil de projeto: **o trilho baixo** (o usual), **o trilho interno** ou **o eixo da via** (cada trilho se move metade da superelevação). O perfil de projeto é o topo do trilho nesse ponto.

O **Diagrama de superelevação** desenha a altura de cada trilho sobre o perfil ao longo das estacas; a vista de perfil e as folhas de planta e perfil recebem o mesmo como uma faixa abaixo do perfil.

## Limites e avisos de superelevação

**Maior superelevação aplicada**, **Maior insuficiência de superelevação**, **Maior excesso de superelevação**, **Maior gradiente de superelevação** e **Mais rápida variação de superelevação** (o gradiente na velocidade da linha, em mm/s) são verificados em cada curva. Um valor acima de um limite gera um aviso no bloco Ferrovia e no painel Problemas, com o limite e o valor encontrado. Sem velocidade de projeto, a insuficiência e a taxa de variação não são verificadas (uma nota informa isso).

## A via

Defina a **Bitola** (predefinições padrão 1435 mm, larga, métrica ou estreita, ou a sua própria), o **Perfil do trilho** (60E1, 54E1, 49E1, 115RE, 136RE: apenas suas dimensões publicadas), o número de **Vias** e o seu **Afastamento entre vias**; depois, **Dormentes e lastro**: material do dormente, comprimento, largura, altura e espaçamento; altura do lastro sob o dormente (no trilho baixo), ombro, inclinação, quanto o topo dele fica abaixo dos dormentes; altura do sub-lastro, a berma além do pé do lastro e a declividade transversal da plataforma da via.

Clique em **Construir a via**. Ela atua sobre o corredor do alinhamento, construído como via ao longo do perfil de projeto: os trilhos e dormentes se inclinam com a superelevação, a plataforma da via não. Os taludes de corte e aterro partem da borda da berma no corte e no aterro do corredor, e a via se ajusta ao terreno proposto como uma estrada.

- **Planta**: os dois trilhos de cada via (camada C-RAIL-TRAK) e, com mais de uma via, o eixo de cada via (C-RAIL-CNTR), na tela, em DXF, DWG, PDF e nas folhas de planta e perfil.
- **Seções**: os dormentes, os trilhos, a base do lastro e a base do sub-lastro em cada seção.
- **3D**: os trilhos, cada dormente e o leito de lastro (Mostrar › Via), também em GLB, OBJ e USD.
- **Quantitativos**: comprimento da via, trilhos (os dois trilhos de cada via, ao longo da linha própria de cada via), dormentes, leito de lastro e lastro menos os dormentes, e sub-lastro, pelo método das áreas médias entre seções.

## Verificações de geometria da via

Além da superelevação, o bloco Ferrovia verifica a própria linha contra seis outros limites (todos valores provisórios, todos definidos por você):

- **Maior greide** do perfil de projeto, em milímetros por metro.
- **Menor raio de curva vertical**, como um fator k em R ≥ k·V² (R em metros, V em km/h). Uma curva vertical parabólica de comprimento L entre dois greides tem raio igual a L dividido pela variação do greide.
- **Menor curva vertical**.
- **Menor raio de curva em planta** (0 desliga a verificação).
- **Menor arco ou tangente**, em segundos de percurso na velocidade da linha: um arco circular, ou a tangente entre duas curvas, mais curto que essa distância gera aviso. 1,8 s é a conhecida regra "metade da velocidade em km/h, em metros".
- **Taxa de variação da insuficiência de superelevação** ao longo de cada transição, em mm/s na velocidade da linha.

**Geometria da via** lista o maior greide encontrado e cada curva vertical com seu raio e o raio que a velocidade da linha exige. Uma curva vertical que está sobre uma transição ou uma rampa de superelevação recebe uma nota. Sem perfil de projeto ou sem velocidade de projeto, as verificações que dependem deles são ignoradas e uma nota informa isso.

## Aparelhos de mudança de via e travessias

Em **Aparelhos de mudança de via e travessias**, clique em **Adicionar aparelho de mudança de via**. Ele é colocado na maior tangente; ajuste na tabela:

- **Estaca do início da agulha**: onde o aparelho começa neste alinhamento.
- **Jacaré**: o número do jacaré N (1:N). O ângulo do jacaré é 2·atan(1 / 2N).
- **Lado**: esquerdo ou direito, olhando no sentido crescente das estacas.
- **Espaçamento da travessia** em metros: acima de 0, o aparelho se torna uma travessia para uma via paralela a essa distância (dois aparelhos e a tangente entre eles).

A tabela mostra o **Lead** (da agulha ao jacaré), o **Raio** da curva de fechamento e a **Velocidade no desvio** que esse raio permite com o seu limite de insuficiência de superelevação e sem superelevação. **Criar via do desvio** transforma o trajeto do desvio em um alinhamento próprio (a agulha, a curva de fechamento e depois reto no ângulo do jacaré) com as mesmas configurações ferroviárias, pronto para ser prolongado.

A planta desenha os dois trilhos de desvio de cada aparelho, seu eixo, uma marca no início da agulha e no jacaré, e "1:N" (camada C-RAIL-TURN), na tela e em DXF, DWG, PDF e folhas. A vista 3D desenha os trilhos de desvio no nível da via principal.

A forma é um **valor provisório**: uma agulha reta e uma curva de fechamento a partir do número do jacaré. Um aparelho construído segue a norma da ferrovia e o desenho do fabricante. Avisos: um aparelho que sai do alinhamento, que fica sobre uma curva, uma transição, a superelevação ou uma curva vertical, ou que se sobrepõe a outro; e uma nota quando a velocidade da linha está acima da velocidade no desvio.

## Envelope de gabarito

Marque **Varrer um envelope de gabarito ao longo desta via**. Escolha o **Contorno** (duas formas provisórias, ou **Seu próprio contorno** digitado como um ponto por linha: deslocamento a partir do eixo da via, depois altura acima do topo do trilho, em metros), o **Comprimento do veículo** e os **Centros dos truques** e, se houver, a **Borda da plataforma** (lado, distância do eixo da via, altura acima do trilho).

Em cada estaca, o contorno é inclinado com a superelevação em torno do trilho baixo e alargado pela curva: o meio do veículo se desloca para dentro em b² / 8R, suas extremidades para fora em (L² − b²) / 8R (b os centros dos truques, L o comprimento do veículo, R o raio ali, seguindo a transição). O bloco desenha a seção na tangente e onde ela é mais larga, e lista:

- o **envelope mais largo** e onde ele está,
- os **afastamentos entre vias** definidos, comparados com os afastamentos que dois envelopes vizinhos exigem,
- a folga que sobra na **borda da plataforma**, ou quanto ela está invadida,
- cada linha de elemento, estrutura de tubulação e outro alinhamento ferroviário encontrado **dentro do envelope**.

Uma linha de elemento com cotas é avaliada contra o contorno na sua altura acima do trilho; sem perfil de projeto, ou para um ponto sem cota, ela é avaliada apenas em planta, e a lista informa isso. A planta mostra as duas bordas do envelope (camada C-RAIL-CLRN) com uma cruz em cada coisa que está dentro dele.

Os contornos oferecidos são **valores provisórios, não a bitola de nenhuma ferrovia**. Digite o gabarito da estrutura da sua ferrovia antes de confiar em um resultado.

## Em outros programas

- **LandXML**: um alinhamento ferroviário é gravado com suas transições (spiType) e um bloco `Cant`: a bitola, o ponto de rotação, a velocidade da linha e uma estaca onde cada rampa de superelevação começa e termina, com a superelevação aplicada, a superelevação de equilíbrio e a insuficiência. Abrir um arquivo LandXML com um bloco `Cant` torna esse alinhamento uma ferrovia com essas superelevações.
- **IFC**: o alinhamento com seus segmentos de superelevação, os trilhos, dormentes, lastro e sub-lastro.

## Ainda não implementado

Aparelhos de mudança de via na exportação IFC, famílias de aparelhos além da curva de fechamento única (agulhas curvas, jacarés de ponta móvel, cruzamentos duplos, travessias em diamante), regras de gabarito cinemático (o envelope é um contorno fixo com deslocamento da curva), catenária e sinalização.

**Qual norma.** No bloco Ferrovia, "Norma a citar" aceita Nenhuma ou Europeia (UIC e EN). Escolher Europeia indica os documentos que um projeto europeu cita (EN 13803 para os parâmetros do alinhamento, EN 13232 para agulhas e cruzamentos, EN 15273 para gabaritos, EN 13848 para a qualidade da geometria da via) e dá a cada limite uma caixa para a cláusula de onde ele vem. Nenhum número de nenhuma norma está embutido: os limites de superelevação, insuficiência, excesso, greide e taxa, a geometria dos aparelhos e o gabarito da estrutura são todos ainda valores provisórios, e a janela informa isso. Um engenheiro ferroviário confere cada valor com o próprio texto da norma e digita a cláusula ao lado, antes de qualquer construção. A África do Sul e as tabelas da AREMA não estão nesta versão.
