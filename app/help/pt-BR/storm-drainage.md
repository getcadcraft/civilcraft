---
title: Calcular vazões pluviais, diâmetros de tubos e a linha piezométrica
summary: Desenhe as bacias de contribuição que drenam para cada estrutura, some as vazões ao longo da rede pelo método racional, dimensione os tubos pela equação de Manning e veja onde a linha piezométrica fica plena ou atinge a superfície.
keywords: drenagem pluvial, bacia de contribuição, área de drenagem, método racional, coeficiente de escoamento, tempo de concentração, intensidade da chuva, IDF, Manning, dimensionamento de tubos, linha piezométrica, HGL, linha de energia, EGL, sobrecarga, alagamento, água de jusante
from: e44872ec
---

A drenagem pluvial funciona sobre a [rede de tubulações](topic:pipe-network): desenhe primeiro a rede, depois as áreas que drenam para ela. Tudo aparece em **Drenagem pluvial** no painel da direita quando nada está selecionado.

## Desenhar uma bacia de contribuição

1. Clique em **Desenhar uma bacia de contribuição** em **Drenagem pluvial**.
2. Clique nos vértices da área que drena para uma estrutura. {{key:Enter}} ou um duplo clique finaliza; {{key:Backspace}} desfaz o último vértice, {{key:Esc}} interrompe.
3. A bacia drena para uma estrutura dentro dela, senão para a mais próxima. Suas **Propriedades** abrem: defina o nome, o **Coeficiente de escoamento C** (a parcela da chuva que escoa, de 0 a 1), o **Tempo de concentração** em minutos e para qual estrutura ela **Drena para**.

**Desenhar outra bacia** em suas Propriedades inicia a próxima. Clique dentro de uma bacia na planta para selecioná-la; {{key:Delete}} a remove. Cada alteração é um passo: {{key:Mod+Z}} desfaz.

## Definir a chuva de projeto

A intensidade da chuva é i = a ÷ (tc + b) elevado a c, em polegadas por hora para um projeto em pés e em milímetros por hora para um projeto em metros. Ajuste **Intensidade a**, **b** e **c** à sua própria curva intensidade-duração-frequência para o período de retorno do projeto.

:::warning
A curva inicial de intensidade, o n de Manning (0.013) e a perda na junção (0.5) são valores provisórios, não um padrão. Defina-os a partir de seus próprios dados de chuva e critérios de projeto.
:::

- **Menor tempo de concentração**: nenhum tubo é calculado com tempo menor (10 minutos no início).
- **n de Manning**: a rugosidade dos tubos.
- **Perda na junção**: a carga perdida em cada estrutura, como parcela da carga cinética V²/2g do tubo que sai dela.
- **Nível da água na saída**: o nível de jusante, onde o último tubo descarrega. Deixe em branco quando a saída for livre.

## Como as vazões se somam

Cada tubo transporta todas as bacias acima dele. Q = C × i × A, em que C × A é somado ao longo da rede e i é a intensidade no maior tempo de concentração da água que chega: o tempo próprio de uma bacia, ou o tempo de uma bacia a montante mais o tempo de percurso pelos tubos (comprimento ÷ a velocidade em seção plena). Q é em pés cúbicos por segundo (A em acres) ou metros cúbicos por segundo (A em hectares).

## Dimensionar os tubos

A tabela em **Vazões e linhas piezométricas** mostra, para cada tubo, a vazão, o que ele transporta em seção plena na sua declividade, a velocidade, a carga hidráulica no topo e no pé, e a altura do escoamento.

**Dimensionar os tubos para estas vazões** dá a cada tubo o menor diâmetro padrão que transporta sua vazão na própria declividade (de 12 a 72 in, ou de 300 a 1800 mm). É um passo só. As cotas de fundo permanecem onde estão: se os diâmetros mudarem, use **Definir todas as cotas de fundo pelas regras** para manter o recobrimento e depois verifique a tabela de novo.

## Ler as linhas piezométricas

A linha piezométrica (HGL) é calculada de jusante para montante, a partir da saída:

- Um tubo que escoa parcialmente cheio tem sua HGL na superfície da água: a cota de fundo mais a altura normal.
- Quando a água abaixo está acima da geratriz superior, ou o tubo transporta mais do que consegue em seção plena, ele escoa cheio (sob sobrecarga) e sua HGL sobe pela declividade de atrito ao longo do comprimento.
- Em cada estrutura, a HGL é a HGL no topo do tubo que sai mais a perda na junção.
- A linha de energia (EGL) é a HGL mais a carga cinética.

Um tubo que escoa cheio é listado, assim como qualquer estrutura em que a HGL está acima da borda: a água chega à superfície ali, e a estrutura é circulada em vermelho na planta. Selecione um tubo ou uma estrutura para ver sua vazão, altura, velocidade e as duas linhas nas suas Propriedades.

## Propagar uma chuva

O método racional dá um pico para cada tubo. {{ui:Propagar a chuva}} (abaixo dos resultados, nas Propriedades da rede) calcula a chuva inteira: o escoamento de cada bacia ao longo do tempo, levado pelos tubos com seu tempo de percurso e armazenamento, e somado onde se encontram.

1. Deixe {{ui:A chuva dura}} e {{ui:Intensidade da chuva}} em branco para usar o maior tempo de concentração e a curva de chuva acima, ou digite os seus.
2. Pressione {{ui:Propagar a chuva}}. A tabela lista, para cada tubo, a maior vazão de entrada e de saída, quanto menor é o pico de saída, quanta capacidade plena do tubo é usada e o minuto em que atinge o pico.
3. Cada saída recebe um pequeno gráfico de vazão ao longo do tempo e {{ui:Baixar o hidrograma (CSV)}}.

Uma bacia libera a chuva média em seu tempo de concentração, então uma tempestade mais curta que isso atinge pico abaixo de C × i × A. Cada tubo é propagado pelo método de Muskingum–Cunge, usando a altura de escoamento que o método racional já encontrou. Dois ramos com tempos de concentração diferentes não atingem o pico juntos, de modo que a soma deles é menor que a soma dos picos.

Isso não modela sobrecarga, remanso, armazenamento nas estruturas nem alagamento. Um tubo cujo pico propagado está acima da capacidade plena é listado, e sua água é passada adiante como se coubesse. Use-o para ver tempo e atenuação, não para dimensionar o tubo. É um auxiliar de cálculo: um engenheiro o verifica.

## Salvo com o projeto

Bacias e as configurações da chuva são salvas no arquivo do projeto. Ainda não estão no PDF da planta, no DWG ou DXF, nem no LandXML: veja [Ainda não implementado](topic:not-built-yet).
