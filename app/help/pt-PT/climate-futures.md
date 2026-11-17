---
title: "Cenários climáticos: cheias, calor e incêndio florestal em 2050 e 2080"
summary: Em Do endereço ao local, elevar o nível de cheia do local para um clima futuro, avaliar a exposição a incêndio florestal e transformar um ficheiro meteorológico, e apresentar o presente ao lado do futuro, a partir de um pacote de dados climáticos (SSP2-4.5 e SSP5-8.5, 2050 e 2080).
keywords: clima, alterações climáticas, futuro, 2050, 2080, ssp, cmip6, cenário, nível do mar, cheia, cota de cheia de base, bfe, fema, calor, ficheiro meteorológico, epw, morph, incêndio florestal, fogo florestal
from: b0d2ee38
---

Os valores climáticos vêm de um **pacote de dados**, não da aplicação. Ative o suplemento {{ui:Cenários climáticos}} em Definições › Suplementos, ou carregue um ficheiro de pacote próprio no bloco {{ui:Cenário climático}}.

:::warning
O pacote que vem com o suplemento é um **exemplo**: três locais (Denver, Miami, Joanesburgo), um modelo climático, cinco anos em cada período de 20 anos. Serve para experimentar as ferramentas, **não para projeto**. Um pacote completo é gerado com `tools/climate/build-pack.mjs` a partir dos dados NEX-GDDP-CMIP6 da NASA.
:::

## Onde fica

Superfície › Mais › Do endereço ao local. Defina o ponto, acrescente as camadas (uma camada FEMA de cheias dá a cota de cheia de base) e prima o botão que lê o local. Por baixo das linhas do local está o bloco {{ui:Cenário climático}}: escolha um **Cenário** (SSP2-4.5 ou SSP5-8.5) e um **Ano** (2050 = 2041-2060, 2080 = 2071-2090, ambos face a 1995-2014). É usado o local do pacote mais próximo do ponto, ou o que escolher; longe de todos, são usadas as variações médias globais, e o painel diz isso.

## Cota de cheia de projeto

A cota atual é a cota de cheia de base da FEMA quando a camada de cheias a tinha (em pés, NAVD 88); senão, escreva a sua. Escolha o tipo de cheia (costeira, de rio ou de chuva intensa, ou ambas), a altura de água no local para a parte da chuva, e uma folga, se a quiser. {{ui:Elevar o nível de cheia}} mostra lado a lado o nível atual e o futuro, as partes do nível do mar e da chuva, e as hipóteses: a subida total do nível do mar é acrescentada a um nível costeiro; o caudal de rio sobe um para um com a precipitação do dia mais chuvoso, e a altura de água segue o caudal elevado a 0.6 (Manning, canal largo); as partes são somadas.

:::warning
Uma triagem da variação, não um estudo de cheias. A cota de cheia de projeto é da autoridade ou do engenheiro.
:::

## Exposição a incêndio florestal (apenas triagem)

A vegetação mais próxima, o declive a subir a partir dela e a distância dão uma faixa de muito baixa a extrema, presente e futura (a futura multiplica pela variação do índice meteorológico de incêndio do pacote). **Apenas triagem:** uma escala relativa própria, para saber se um local precisa de uma avaliação de incêndio florestal a sério; não é uma classificação regulamentar.

## Calor: um ficheiro meteorológico futuro

Escolha um ficheiro `.epw` atual e {{ui:Criar o ficheiro meteorológico futuro}}: é transformado pelo método publicado de deslocamento e alongamento (Belcher, Hacker e Powell 2005) e o calor é comparado (temperatura média e máxima, temperaturas de projeto, horas acima de 30 °C e 35 °C, graus-dia). {{ui:Guardar o ficheiro meteorológico futuro}} guarda-o para o painel Ambiente, para a verificação energética do BimCraft ou para as suas próprias ferramentas.

## De onde vêm os números

NASA NEX-GDDP-CMIP6 (saída de modelos CMIP6 reduzida à escala, CC BY 4.0 por modelo) para temperatura, humidade, insolação, chuva e meteorologia de incêndio; a média global do IPCC AR6 para a subida do nível do mar, salvo se o pacote trouxer valores locais. O painel mostra a fonte, a licença e a data do pacote.
