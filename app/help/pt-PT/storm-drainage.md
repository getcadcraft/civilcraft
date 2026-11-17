---
title: Calcular os caudais pluviais, as dimensões dos coletores e a linha piezométrica
summary: Desenhar as bacias que drenam para cada órgão, somar os caudais ao longo da rede com o método racional, dimensionar os coletores pela equação de Manning e ver onde a linha piezométrica fica cheia ou atinge a superfície.
keywords: drenagem pluvial, bacia de drenagem, área de drenagem, método racional, coeficiente de escoamento, tempo de concentração, intensidade da precipitação, idf, manning, dimensionamento de coletores, linha piezométrica, hgl, linha de energia, egl, sobrecarga, inundação, nível de jusante
from: e44872ec
---

A drenagem pluvial trabalha sobre a [rede de coletores](topic:pipe-network): desenhe primeiro a rede, depois as áreas que drenam para ela. Tudo aparece em **Drenagem pluvial** no painel direito quando nada está selecionado.

## Desenhar uma bacia

1. Clique em **Desenhar uma bacia** em **Drenagem pluvial**.
2. Clique nos vértices da área que drena para um órgão. {{key:Enter}} ou um duplo clique termina; {{key:Backspace}} retira o último vértice, {{key:Esc}} interrompe.
3. A bacia drena para um órgão dentro dela, senão para o mais próximo. Abrem-se as suas **Propriedades**: defina o nome, o **Coeficiente de escoamento C** (a parte da chuva que escorre, de 0 a 1), o **Tempo de concentração** em minutos e para que órgão **Drena para**.

**Desenhar outra bacia** nas suas Propriedades inicia a seguinte. Clique dentro de uma bacia no plano para a selecionar; {{key:Delete}} remove-a. Cada alteração é um passo: {{key:Mod+Z}} anula-a.

## Definir a chuva de projeto

A intensidade da precipitação é i = a ÷ (tc + b) elevado a c, em polegadas por hora para um projeto em pés e em milímetros por hora para um projeto em metros. Ajuste **Intensidade a**, **b** e **c** à sua própria curva intensidade-duração-frequência para o período de retorno do projeto.

:::warning
A curva de intensidade inicial, o coeficiente n de Manning (0.013) e a perda na junção (0.5) são valores provisórios, não uma norma. Defina-os a partir dos seus próprios dados de precipitação e critérios de projeto.
:::

- **Tempo de concentração mais curto**: nenhum coletor é calculado com um tempo mais curto (10 minutos para começar).
- **n de Manning**: a rugosidade dos coletores.
- **Perda na junção**: a carga perdida em cada órgão, como parte da altura cinética V²/2g do coletor que sai dele.
- **Cota da água na saída**: o nível de jusante, onde o último coletor descarrega. Deixe-a em branco quando a saída é livre.

## Como os caudais se somam

Cada coletor transporta todas as bacias acima dele. Q = C × i × A, em que C × A é somado ao longo da rede e i é a intensidade ao maior tempo de concentração da água que chega: o tempo próprio de uma bacia, ou o tempo de uma bacia a montante mais o tempo de percurso nos coletores (comprimento ÷ velocidade a secção cheia). Q está em pés cúbicos por segundo (A em acres) ou em metros cúbicos por segundo (A em hectares).

## Dimensionar os coletores

A tabela em **Caudais e linhas piezométricas** mostra, para cada coletor, o caudal, o que transporta a secção cheia com a sua inclinação, a velocidade, a linha piezométrica no topo e na base e a altura a que escoa.

**Dimensionar os coletores para estes caudais** dá a cada coletor a menor dimensão normalizada que transporta o seu caudal com a sua própria inclinação (de 12 a 72 in, ou de 300 a 1800 mm). É um passo só. As cotas de soleira mantêm-se onde estão: se as dimensões mudarem, use **Definir todas as cotas de soleira a partir das regras** para manter o recobrimento, e depois verifique a tabela de novo.

## Ler as linhas piezométricas

A linha piezométrica (HGL) é calculada a partir da saída para montante:

- Um coletor que escoa parcialmente tem a sua HGL na superfície da água: a cota de soleira mais a altura normal.
- Quando a água abaixo está acima da sua geratriz superior, ou transporta mais do que consegue na secção cheia, escoa a secção cheia (em carga) e a sua HGL sobe pelo declive de atrito ao longo do seu comprimento.
- Em cada órgão, a HGL é a HGL do topo do coletor que sai mais a perda na junção.
- A linha de energia (EGL) é a HGL mais a altura cinética.

Um coletor que escoa a secção cheia é listado, e também qualquer órgão onde a HGL está acima da tampa: a água chega à superfície aí, e o órgão fica assinalado a vermelho no plano. Selecione um coletor ou um órgão para ver o seu caudal, altura, velocidade e as duas linhas nas suas Propriedades.

## Propagar uma tempestade

O método racional dá um pico para cada coletor. {{ui:Propagar a tempestade}} (abaixo dos resultados, nas Propriedades da rede) calcula a tempestade inteira: o escoamento de cada bacia ao longo do tempo, transportado pelos coletores com o seu tempo de percurso e armazenamento, e somado onde se encontram.

1. Deixe {{ui:A chuva dura}} e {{ui:Intensidade da chuva}} em branco para usar o maior tempo de concentração e a curva de precipitação acima, ou escreva os seus próprios valores.
2. Prima {{ui:Propagar a tempestade}}. A tabela indica, para cada coletor, o caudal máximo de entrada e de saída, quanto mais baixo fica o pico de saída, que parte da capacidade a secção cheia do coletor utiliza e o minuto em que atinge o pico.
3. Cada saída tem um pequeno gráfico de caudal ao longo do tempo e {{ui:Transferir o hidrograma (CSV)}}.

Uma bacia envia a chuva média ao longo do seu tempo de concentração, por isso uma tempestade mais curta do que isso tem um pico mais baixo do que C × i × A. Cada coletor é propagado com o método de Muskingum–Cunge, usando a altura de escoamento que o método racional já encontrou. Dois ramos com tempos de concentração diferentes não atingem o pico em simultâneo, por isso a sua soma é inferior à soma dos seus picos.

Isto não modela a sobrecarga, o remanso, o armazenamento nos órgãos nem as inundações. Um coletor cujo pico propagado está acima da sua capacidade a secção cheia é listado, e a sua água é passada adiante como se coubesse. Use-o para ver o tempo e o amortecimento, não para dimensionar o coletor. É um auxiliar de cálculo: um engenheiro verifica-o.

## Guardado com o projeto

As bacias e as definições da tempestade são guardadas no ficheiro do projeto. Ainda não estão na impressão para PDF, no DWG ou DXF, nem em LandXML: ver [Ainda não implementado](topic:not-built-yet).
