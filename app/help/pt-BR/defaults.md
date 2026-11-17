---
title: Valores iniciais e provisórios
summary: Todos os valores com que o CivilCraft começa, para projetos novos, exibição, alinhamentos, plataformas, corredores, redes de tubulação, volumes e plotagens, e quais deles são provisórios para substituir.
keywords: padrões, configurações, valores iniciais, provisórios, critérios de projeto, normas, regras, premissas
from: fbfc7432
---

O CivilCraft não tem caixa de diálogo de configurações nem modelo. Estes são os valores com que as coisas começam. Valores marcados como **provisório** não são tirados de nenhuma norma: substitua-os pelos critérios do seu projeto antes de confiar em uma verificação ou em um quantitativo.

## Projeto novo

| Configuração | Valor |
|---|---|
| Nome | Local sem título (o nome do primeiro arquivo de pontos o substitui) |
| Unidades | Pés (EUA) |
| Nome da superfície | Terreno natural |
| Grupos de pontos | Cada grupo começa como {{ui:Pontos}} |
| Maior aresta externa | 0 (manter todos os triângulos) |
| Etapas de desfazer mantidas | 200 |

## Exibir

| Configuração | Valor |
|---|---|
| Superfície | {{ui:Terreno natural}} |
| Curvas a cada | 1 (ft ou m) |
| Mestras a cada | 5ª curva |
| Faixas | 8 |
| Ligados | Curvas, rótulos das curvas de nível, pontos, linhas de quebra, borda da superfície, tubulações |
| Desligados | Triângulos, faixas de cota, setas de declividade, rótulos dos pontos |

## Alinhamentos e perfis

| Configuração | Valor |
|---|---|
| Nome | Alinhamento 1, Alinhamento 2 … |
| Estaca inicial | 0+00 |
| Raio da curva em cada PI intermediário | 100 ft ou 30 m, menor se não couber na metade de cada tangente |
| Perfil de projeto | Nenhum até você começar um; {{ui:Começar do terreno}} coloca um PVI sobre o terreno em cada extremidade |
| Comprimento da curva vertical | 0 (sem curva) até você digitar um valor |

## Plataformas

| Configuração | Valor |
|---|---|
| Nome | Plataforma 1, Plataforma 2 … |
| Cota | O terreno no meio da plataforma, arredondado para 0.1 (0 se o meio estiver fora da superfície) |
| Talude de corte | 2 : 1 (provisório) |
| Talude de aterro | 3 : 1 (provisório) |

## Montagem do corredor (provisórios)

| Configuração | Pés (EUA) | Metros |
|---|---|---|
| Largura da faixa | 12 ft | 3.6 m |
| Declividade da faixa | 2% | 2% |
| Largura do acostamento | 4 ft | 1.2 m |
| Declividade do acostamento | 4% | 4% |
| Talude de corte | 2 : 1 | 2 : 1 |
| Talude de aterro | 3 : 1 | 3 : 1 |
| Seção a cada | 10 ft | 5 m |

## Rede de tubulação

| Configuração | Pés (EUA) | Metros |
|---|---|---|
| Nome e tipo | Pluvial, pluvial | Pluvial, pluvial |
| Declividade mínima (provisório) | 0.50% | 0.50% |
| Recobrimento mínimo (provisório) | 2 ft | 0.6 m |
| Desnível nas estruturas (provisório) | 0.10 ft | 0.03 m |
| Diâmetro de nova estrutura | 48 in | 1200 mm |
| Diâmetro de novo tubo | 12 in | 300 mm |
| Profundidade do poço de sucção | 0 | 0 |
| Aro | A partir da superfície | A partir da superfície |

Uma rede de tubulação aberta a partir de LandXML usa estas regras também, porque o LandXML não as contém.

## Volumes

| Configuração | Valor |
|---|---|
| Método | Malha, amostrada nos centros das células dentro das linhas de pé de talude |
| Tamanho da célula | Escolhido para que o retângulo envolvente da área terraplenada contenha cerca de 250,000 células (1, 2 ou 5 vezes uma potência de dez) |
| Empolamento e contração | Nenhum |

## Plotagem

| Configuração | Valor |
|---|---|
| Área | {{ui:Tudo}} |
| Papel | Tabloid 11 × 17 in (projetos em pés), ISO A3 (projetos em metros); sempre na horizontal |
| Escala | A maior escala listada que couber |
| Tinta | {{ui:Cores das camadas}} |

Os rótulos DXF são dimensionados para a escala em que tudo cabe em Tabloid (pés) ou A3 (metros).
