---
title: "Futuros climáticos: inundação, calor e incêndio florestal em 2050 e 2080"
summary: Em Do endereço ao terreno, eleve a cota de inundação do terreno para um clima futuro, avalie a exposição a incêndio florestal e transforme um arquivo climático, mostrando o presente ao lado do futuro, a partir de um pacote de dados climáticos (SSP2-4.5 e SSP5-8.5, 2050 e 2080).
keywords: clima, mudança climática, futuro, 2050, 2080, ssp, cmip6, cenário, nível do mar, inundação, cota de inundação de referência, bfe, fema, calor, arquivo climático, epw, morph, incêndio florestal, queimada
from: b0d2ee38
---

Os dados climáticos vêm de um **pacote de dados**, não do aplicativo. Ative o complemento {{ui:Clima futuro}} em Configurações › Complementos, ou carregue um arquivo de pacote próprio no bloco {{ui:Clima futuro}}.

:::warning
O pacote que vem com o complemento é uma **amostra**: três lugares (Denver, Miami, Joanesburgo), um modelo climático, cinco anos em cada período de 20 anos. Serve para testar as ferramentas, **não para projeto**. Um pacote completo é gerado com `tools/climate/build-pack.mjs` a partir dos dados NEX-GDDP-CMIP6 da NASA.
:::

## Onde fica

Superfície › Mais › Do endereço ao terreno. Defina o ponto, adicione as camadas (uma camada de inundação da FEMA fornece a cota de inundação de referência) e pressione o botão que lê o terreno. Abaixo das linhas do terreno está o bloco {{ui:Clima futuro}}: escolha um **Cenário** (SSP2-4.5 ou SSP5-8.5) e um **Ano** (2050 = 2041-2060, 2080 = 2071-2090, ambos em relação a 1995-2014). Usa-se o lugar do pacote mais próximo do ponto, ou o que você escolher; longe de todos os lugares, usam-se as variações médias globais e o painel informa isso.

## Cota de inundação de projeto

O nível atual é a cota de inundação de referência (BFE) da FEMA quando a camada de inundação tinha uma (em pés, NAVD 88); caso contrário, digite a sua. Escolha o tipo de inundação (costeira, fluvial ou chuva intensa, ou ambas), a profundidade da inundação no terreno para a parte da chuva, e uma borda livre se quiser. {{ui:Elevar a cota de inundação}} mostra o nível atual e o futuro lado a lado, as partes do nível do mar e da chuva, e as premissas: a elevação total do nível do mar é somada a um nível costeiro; a vazão fluvial sobe um para um com a chuva do dia mais chuvoso, e a profundidade segue a vazão elevada a 0.6 (Manning, canal largo); as partes são somadas.

:::warning
Uma triagem da mudança, não um estudo de inundação. A cota de inundação de projeto é da autoridade ou do seu engenheiro.
:::

## Exposição a incêndio florestal (apenas triagem)

A vegetação mais próxima, a encosta a partir dela e a distância dão uma faixa de muito baixa a extrema, atual e futura (a futura multiplica pela variação do índice de condição meteorológica de incêndio do pacote). **Apenas triagem:** uma escala relativa nossa, para saber se um terreno precisa de uma avaliação de incêndio florestal de verdade; não é uma classificação normativa.

## Calor: um arquivo climático futuro

Escolha um arquivo `.epw` de hoje e {{ui:Gerar o arquivo climático futuro}}: ele é transformado pelo método publicado de deslocamento e alongamento (Belcher, Hacker e Powell 2005), e o calor é comparado (temperatura média e máxima, temperaturas de projeto, horas acima de 30 °C e 35 °C, graus-dia). {{ui:Salvar o arquivo climático futuro}} o salva para o painel Ambiente, para a verificação de energia do BimCraft ou para as suas próprias ferramentas.

## De onde vêm os números

NASA NEX-GDDP-CMIP6 (saída de modelos CMIP6 em escala reduzida, CC BY 4.0 por modelo) para temperatura, umidade, insolação, chuva e condição de incêndio; a média global do IPCC AR6 para a elevação do nível do mar, a menos que o pacote traga números locais. O painel mostra a fonte, a licença e a data do pacote.
