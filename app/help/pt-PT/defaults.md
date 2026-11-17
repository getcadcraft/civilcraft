---
title: Valores iniciais e valores provisórios
summary: Todos os valores com que o CivilCraft começa, para projetos novos, visualização, diretrizes, plataformas, corredores, redes de tubagens, volumes e impressões, e quais são valores provisórios a substituir.
keywords: predefinições, definições, valores iniciais, valores provisórios, critérios de projeto, normas, regras, pressupostos
from: fbfc7432
---

O CivilCraft não tem caixa de diálogo de definições nem modelo predefinido. Estes são os valores com que as coisas começam. Os valores marcados como **valor provisório** não são retirados de nenhuma norma: substitua-os pelos critérios do seu projeto antes de confiar numa verificação ou numa quantidade.

## Projeto novo

| Definição | Valor |
|---|---|
| Nome | Local sem nome (o nome do primeiro ficheiro de pontos substitui-o) |
| Unidades | Pés (EUA) |
| Nome da superfície | {{ui:Terreno natural}} |
| Grupos de pontos | Cada grupo começa como {{ui:Pontos}} |
| Aresta exterior mais longa | 0 (manter todos os triângulos) |
| Passos de anulação guardados | 200 |

## Visualização

| Definição | Valor |
|---|---|
| Superfície | {{ui:Terreno natural}} |
| Curvas de nível a cada | 1 (ft ou m) |
| Curvas mestras a cada | 5.ª curva de nível |
| Faixas | 8 |
| {{ui:Ligadas}} | Curvas de nível, etiquetas das curvas, pontos, linhas de quebra, limite da superfície, tubagens |
| {{ui:Desligadas}} | Triângulos, faixas de cota, setas de inclinação, etiquetas dos pontos |

## Diretrizes e perfis

| Definição | Valor |
|---|---|
| Nome | Diretriz 1, Diretriz 2 … |
| PK inicial | 0+00 |
| Raio da curva em cada PI interior | 100 ft ou 30 m, menor se isso não couber em metade de cada tangente |
| Perfil de projeto | Nenhum até iniciar um; {{ui:Começar a partir do terreno}} coloca um PVI no terreno em cada extremidade |
| Comprimento da curva vertical | 0 (sem curva) até escrever um valor |

## Plataformas

| Definição | Valor |
|---|---|
| Nome | Plataforma 1, Plataforma 2 … |
| Cota | O terreno no meio da plataforma, arredondado a 0.1 (0 se o meio estiver fora da superfície) |
| Talude de escavação | 2 : 1 (valor provisório) |
| Talude de aterro | 3 : 1 (valor provisório) |

## Montagem do corredor (valores provisórios)

| Definição | Pés (EUA) | Metros |
|---|---|---|
| Largura da via | 12 ft | 3.6 m |
| Inclinação da via | 2% | 2% |
| Largura da berma | 4 ft | 1.2 m |
| Inclinação da berma | 4% | 4% |
| Talude de escavação | 2 : 1 | 2 : 1 |
| Talude de aterro | 3 : 1 | 3 : 1 |
| Perfil transversal a cada | 10 ft | 5 m |

## Rede de tubagens

| Definição | Pés (EUA) | Metros |
|---|---|---|
| Nome e tipo | Pluvial, pluvial | Pluvial, pluvial |
| Declive mínimo (valor provisório) | 0.50% | 0.50% |
| Recobrimento mínimo (valor provisório) | 2 ft | 0.6 m |
| Queda nas estruturas (valor provisório) | 0.10 ft | 0.03 m |
| Diâmetro de nova estrutura | 48 in | 1200 mm |
| Diâmetro de novo tubo | 12 in | 300 mm |
| Profundidade do poço de recolha | 0 | 0 |
| Aro | Da superfície | Da superfície |

Uma rede de tubagens aberta a partir de LandXML usa estas regras também, porque o LandXML não as contém.

## Volumes

| Definição | Valor |
|---|---|
| Método | Grelha, amostrada nos centros das células dentro das linhas de intersecção do talude |
| Tamanho da célula | Escolhido para que o retângulo envolvente da área modelada tenha cerca de 250,000 células (1, 2 ou 5 vezes uma potência de dez) |
| Empolamento e retração | Nenhum |

## Impressão

| Definição | Valor |
|---|---|
| Área | {{ui:Tudo}} |
| Papel | Tabloid 11 × 17 in (projetos em pés), ISO A3 (projetos em metros); sempre paisagem |
| Escala | A maior escala listada que cabe |
| Tinta | {{ui:Cores das camadas}} |

As etiquetas DXF têm o tamanho da escala à qual tudo cabe em Tabloid (pés) ou A3 (metros).
