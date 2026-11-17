---
title: Projetar uma via férrea
summary: Transformar um alinhamento numa via férrea: transições (clotoide, parábola cúbica, Bloss, Helmert, meia onda sinusoidal, sinusoide), sobrelevação em cada curva com a sua sobrelevação de equilíbrio, insuficiência e excesso, limites de sobrelevação e de geometria da via como avisos, aparelhos de mudança de via e travessias por PK, uma envolvente de gabarito varrida ao longo da linha e uma via com carris, travessas e leito de balastro construída como corredor, em planta, cortes, perfil, 3D e quantidades.
keywords: ferrovia, carril, caminho de ferro, via férrea, via, comboio, metro, elétrico, sobrelevação, superelevação, insuficiência de sobrelevação, excesso de sobrelevação, sobrelevação de equilíbrio, transição, curva de transição, clotoide, parábola cúbica, bloss, helmert, meia onda sinusoidal, cosseno, bitola, bitola padrão, bitola larga, bitola métrica, bitola estreita, travessa, travessa ferroviária, balastro, sub-balastro, plataforma, berma, entre-eixos de via, 60E1, 54E1, UIC60, 115RE, 136RE, declive da sobrelevação, taxa de variação da sobrelevação, aparelho de mudança de via, agulha, travessia, coração, número do coração, comprimento, curva de fecho, velocidade em desvio, gabarito, envolvente de gabarito, gabarito de obra, envolvente cinemática, cais, intervalo do cais, espaçamento das vias, declive, curva vertical, raio mínimo, sobrelevação LandXML
from: 99de9745
---

Qualquer alinhamento pode ser uma via férrea. As suas curvas passam então a ter transições de carril e uma sobrelevação (a superelevação dos carris), e o seu corredor é construído como uma via: carris sobre travessas, assentes num leito de balastro, modelados no terreno como uma estrada. Aparelhos de mudança de via e travessias são colocados por PK, e uma envolvente de gabarito pode ser varrida ao longo da via e verificada contra o que existe ao lado da linha.

Todos os valores abaixo são **valores provisórios**, não normas. As ferrovias definem os seus limites pela velocidade da linha, pelo tipo de via e pelo país; defina-os a partir da norma da sua própria ferrovia. O CivilCraft não inclui nenhuma tabela nacional.

## Tornar o alinhamento numa via férrea

1. Selecione o alinhamento e encontre **Ferrovia** em Propriedades.
2. Marque **Este alinhamento é uma via férrea**. Cada alteração é um passo de anulação.
3. Defina a **Velocidade de projeto** no topo das Propriedades do alinhamento: é a velocidade de linha contra a qual a sobrelevação é verificada. **Comboios mais lentos** (no bloco Ferrovia) é a velocidade contra a qual o excesso de sobrelevação é verificado.

## Transições

Atribua a cada curva um comprimento de espiral em cada extremidade na tabela PI (**Espiral de entrada**, **Espiral de saída**) e, em seguida, escolha o seu tipo na tabela de curvas do bloco Ferrovia, ou **Transição para cada curva**:

| Tipo | Curvatura ao longo da transição |
|---|---|
| Clotoide | cresce uniformemente (a espiral da estrada) |
| Parábola cúbica | y = x³ / (6·R·L), com L medido ao longo da tangente; a própria curva é um pouco mais longa |
| Bloss | 3u² − 2u³ da curvatura total (u = a fração do comprimento): começa e acaba suavemente |
| Helmert | duas parábolas, 2u² e depois 1 − 2(1 − u)² |
| Meia onda sinusoidal | (1 − cos πu) / 2 |
| Sinusoide | u − sen(2πu) / 2π |

Todas, exceto a parábola cúbica, rodam L / 2R, como a clotoide. Os PK seguem o comprimento real. O LandXML mantém o tipo (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Sobrelevação

Introduza a **Sobrelevação** de cada curva em milímetros. A tabela mostra, para cada curva:

- **Sobrelevação de equilíbrio** = G·v² / (g·R), sendo G a distância entre os eixos dos carris (**Entre-eixos dos carris**, a bitola mais a largura da cabeça do carril, a menos que a introduza). Com G = 1500 mm, isto é o conhecido 11.8·V² / R (V em km/h, R em m).
- **Insuficiência** = equilíbrio à velocidade da linha − sobrelevação aplicada.
- **Excesso** = sobrelevação aplicada − equilíbrio à velocidade dos comboios mais lentos.
- **Rampa**: o declive máximo da sobrelevação ao longo das suas rampas, em milímetros por metro.

A sobrelevação sobe ao longo de cada transição, com a forma da sua curvatura: reta para a clotoide ou a parábola cúbica, em forma de Bloss para Bloss, e assim por diante. Uma extremidade de curva sem transição sobe na reta que a antecede, pelo comprimento necessário ao limite de declive da sobrelevação, e indica-o: a sobrelevação muda então onde a curvatura não muda.

**Sobrelevação roda em torno de** indica qual o carril que se mantém no perfil de projeto: **o carril baixo** (o habitual), **o carril interior** ou **o eixo da via** (cada carril move-se metade da sobrelevação). O perfil de projeto é, aí, o topo do carril.

O **Diagrama de sobrelevação** desenha a altura de cada carril sobre o perfil ao longo dos PK; a vista do perfil e as folhas de planta e perfil recebem o mesmo, como uma faixa sob o perfil.

## Limites e avisos de sobrelevação

**Sobrelevação aplicada máxima**, **Insuficiência máxima de sobrelevação**, **Excesso máximo de sobrelevação**, **Declive máximo da sobrelevação** e **Variação mais rápida da sobrelevação** (o declive à velocidade da linha, em mm/s) são verificados em cada curva. Um valor acima de um limite é um aviso no bloco Ferrovia e no painel Problemas, com o limite e o valor encontrado. Sem velocidade de projeto, a insuficiência e a taxa de variação não são verificadas (uma nota o indica).

## A via

Defina a **Bitola** (predefinições padrão, larga, métrica ou estreita, ou a sua própria), o **Perfil do carril** (60E1, 54E1, 49E1, 115RE, 136RE: apenas as dimensões publicadas), o número de **Vias** e os seus **Entre-eixos de via** e, em seguida, **Travessas e balastro**: material da travessa, comprimento, largura, altura e espaçamento; altura do balastro sob a travessa (no carril baixo), ombro, inclinação, e quanto o seu topo fica abaixo do das travessas; altura do sub-balastro, a berma para além do pé do balastro e a inclinação transversal da plataforma.

Clique em **Construir a via**. Isto ativa o corredor da diretriz, construído como via ao longo do perfil de projeto: os carris e as travessas inclinam-se com a sobrelevação, a plataforma não. As linhas de intersecção dos taludes partem do bordo da berma nos taludes de escavação e aterro do corredor, e a via se integra na superfície projetada como uma estrada.

- **Planta**: ambos os carris de cada via (camada C-RAIL-TRAK) e, com mais de uma via, o eixo de cada via (C-RAIL-CNTR), no ecrã, em DXF, DWG, PDF e nas folhas de planta e perfil.
- **Cortes**: as travessas, os carris, a base do balastro e do sub-balastro em todos os cortes.
- **3D**: os carris, cada travessa e o leito de balastro (Mostrar › Via), também em GLB, OBJ e USD.
- **Quantidades**: comprimento da via, carril (ambos os carris de cada via, ao longo da linha própria de cada via), travessas, leito de balastro e balastro menos as travessas, e sub-balastro, por áreas médias das extremidades entre cortes.

## Verificações da geometria da via

Para além da sobrelevação, o bloco Ferrovia verifica a própria linha contra mais seis limites (todos valores provisórios, todos seus para definir):

- **Declive máximo** do perfil de projeto, em milímetros por metro.
- **Raio mínimo da curva vertical**, como um fator k em R ≥ k·V² (R em metros, V em km/h). Uma curva vertical parabólica de comprimento L entre dois declives tem um raio igual a L dividido pela variação de declive.
- **Curva vertical mais curta**.
- **Raio mínimo da curva** em planta (0 desativa a verificação).
- **Arco ou reta mais curta**, em segundos de percurso à velocidade da linha: um arco circular, ou a reta entre duas curvas, mais curto do que essa distância é assinalado. 1.8 s é o valor conhecido «metade da velocidade em km/h, em metros».
- **Taxa de variação da insuficiência de sobrelevação** ao longo de cada transição, em mm/s à velocidade da linha.

**Geometria da via** lista o declive máximo encontrado e cada curva vertical, com o seu raio e o raio que a velocidade da linha exige. Uma curva vertical que esteja numa transição ou numa rampa de sobrelevação recebe uma nota. Sem perfil de projeto ou sem velocidade de projeto, as verificações que o exigem são ignoradas e uma nota o indica.

## Aparelhos de mudança de via e travessias

Em **Aparelhos de mudança de via e travessias**, clique em **Adicionar um aparelho de mudança de via**. Ele fica colocado na reta mais longa; defina na tabela:

- **PK da ponta da agulha**: onde o aparelho começa neste alinhamento.
- **Coração**: o número do coração N (1:N). O ângulo do coração é 2·atan(1 / 2N).
- **Lado**: esquerdo ou direito, olhando no sentido crescente dos PK.
- **Distância da travessia**, em metros: acima de 0, o aparelho torna-se uma travessia para uma via paralela a essa distância (dois aparelhos e a reta entre eles).

A tabela mostra o **Comprimento** (ponta da agulha até ao coração), o **Raio** da curva de fecho e a **Velocidade em desvio** que esse raio permite com o seu limite de insuficiência de sobrelevação e sem sobrelevação. **Criar a via do aparelho** transforma o itinerário em desvio num alinhamento próprio (a agulha, a curva de fecho e, depois, em frente no ângulo do coração), com as mesmas definições ferroviárias, pronto a ser prolongado.

A planta desenha os dois carris em desvio de cada aparelho, o seu eixo, um traço na ponta da agulha e no coração, e «1:N» (camada C-RAIL-TURN), no ecrã e em DXF, DWG, PDF e folhas. A vista 3D desenha os carris em desvio ao nível da via principal.

A forma é um **valor provisório**: uma agulha reta e uma curva de fecho a partir do número do coração. Um aparelho construído segue a norma da ferrovia e o desenho do fabricante. Avisos: um aparelho que sai do alinhamento, que assenta numa curva, numa transição, numa sobrelevação ou numa curva vertical, ou que se sobrepõe a outro; e uma nota quando a velocidade da linha é superior à sua velocidade em desvio.

## Envolvente de gabarito

Marque **Varrer uma envolvente de gabarito ao longo desta via**. Escolha o **Contorno** (duas formas provisórias, ou **Contorno próprio**, introduzido como um ponto por linha: deslocamento a partir do eixo da via e, depois, altura acima do topo do carril, em metros), o **Comprimento do veículo** e os **Entre-eixos dos bogies** e, se existir, um **Bordo do cais** (lado, distância ao eixo da via, altura acima do carril).

Em cada PK, o contorno é inclinado com a sobrelevação em torno do carril baixo e alargado pela curva: o centro do veículo aproxima-se em b² / 8R, e as suas extremidades afastam-se em (L² − b²) / 8R (b os entre-eixos dos bogies, L o comprimento do veículo, R o raio aí, seguindo a transição). O bloco desenha a secção na reta e onde é mais larga, e lista:

- a **envolvente mais larga** e onde,
- os **entre-eixos de via** comparados com os entre-eixos que duas envolventes vizinhas exigem,
- a folga que resta no **bordo do cais**, ou quanto está dentro dele,
- cada linha característica, estrutura de tubagem e outro alinhamento ferroviário encontrado **dentro da envolvente**.

Uma linha característica com cotas é avaliada contra o contorno à sua altura acima do carril; sem perfil de projeto, ou para um ponto sem cota, é avaliada apenas em planta, e a lista indica-o. A planta mostra as duas arestas da envolvente (camada C-RAIL-CLRN), com uma cruz em cada elemento que está dentro.

Os contornos propostos são **valores provisórios, não o gabarito de qualquer ferrovia**. Introduza o gabarito de obra da sua ferrovia antes de confiar num resultado.

## Noutros programas

- **LandXML**: um alinhamento ferroviário é escrito com as suas transições (spiType) e um bloco `Cant`: a bitola, o ponto de rotação, a velocidade da linha e um PK onde cada rampa de sobrelevação começa e acaba, com a sobrelevação aplicada, a sobrelevação de equilíbrio e a insuficiência. Abrir um ficheiro LandXML com um bloco `Cant` torna esse alinhamento numa ferrovia com essas sobrelevações.
- **IFC**: o alinhamento com os seus segmentos de sobrelevação, os carris, as travessas, o balastro e o sub-balastro.

## Ainda não implementado

Aparelhos de mudança de via na exportação IFC; famílias de aparelhos para além da curva de fecho única (agulhas curvas, coração de ponta móvel, travessias de agulhas simples e duplas, cruzamentos em losango); regras de gabarito cinemático (a envolvente é um contorno fixo com deslocamento de curva); catenária e sinalização.

**Que norma.** No bloco Ferrovia, **Norma a citar** aceita Nenhuma ou Europeia (UIC e EN). Escolher Europeia indica os documentos que um projeto europeu cita (EN 13803 para os parâmetros do alinhamento, EN 13232 para agulhas e cruzamentos, EN 15273 para gabaritos, EN 13848 para a qualidade da geometria da via) e dá a cada limite uma caixa para a cláusula de onde provém. Nenhum número de qualquer norma está incorporado: os limites de sobrelevação, insuficiência, excesso, declive e taxa, a geometria dos aparelhos e o gabarito de obra são todos ainda valores provisórios, e a janela indica-o. Um engenheiro ferroviário verifica cada valor no texto da própria norma e escreve a cláusula ao lado, antes de qualquer coisa ser construída. A África do Sul e as tabelas AREMA não estão incluídas nesta versão.
