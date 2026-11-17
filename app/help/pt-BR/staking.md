---
title: Gerar um relatório de locação
summary: Liste piquetes ao longo de um alinhamento em estacas e afastamentos, ou os pontos de levantamento próximos a ele, com estaca, afastamento, norte, leste, cotas de projeto e do terreno e corte ou aterro, e salve o relatório em CSV ou PDF.
keywords: locação, piquetes, relatório de locação, planilha de corte, planilha de greide, estaca, afastamento, corte, aterro, layout, locação de obra, as-built
from: d8a4e9f1
---

Selecione um alinhamento e clique em **Relatório de locação** em suas **Propriedades**.

## Piquetes nas estacas e afastamentos

1. **De** e **até**: as estacas a locar (1+50 ou 150).
2. **a cada**: o intervalo. Os piquetes ficam em cada múltiplo dele, nas duas extremidades e (com a caixa marcada) onde começam e terminam as curvas do alinhamento.
3. **Afastamentos**: à esquerda e à direita do alinhamento, olhando na direção do aumento das estacas: `12 L, 0, 12 R`, `L12 CL R12` ou `-12, 0, 12` (esquerda é negativo). Um alinhamento com corredor começa com as bordas da pista e os acostamentos.
4. **Numerar a partir de** e **com prefixo** nomeiam os piquetes: 1, 2, 3, ou S101, S102.

## Pontos de levantamento próximos ao alinhamento

Escolha **pontos de levantamento próximos ao alinhamento** e a distância. Cada ponto dentro dessa distância recebe sua estaca e afastamento, o projeto naquele ponto e a própria cota como terreno: uma verificação de pontos locados ou levantados como construído.

## O que o relatório informa

| Coluna | O que é |
|---|---|
| Ponto | O nome do piquete, ou o número do ponto de levantamento |
| Estaca, Afastamento | Onde ele está ao longo do alinhamento: L esquerda, R direita |
| Norte, Leste | Suas coordenadas |
| Cota de projeto | A superfície do corredor terraplenado ali (de linha de pé de talude a linha de pé de talude), senão o perfil de projeto no eixo |
| Cota do terreno | A superfície existente ali, ou a própria cota do ponto de levantamento |
| Corte/aterro | C quando o terreno está acima do projeto (cortar), F quando está abaixo (aterrar), com precisão de centésimo |

Um piquete sem cota de projeto (fora do corredor, ou em um alinhamento sem cota de projeto fora do eixo) não tem corte nem aterro; a caixa de diálogo informa quantos são.

## Salvar

- **CSV**: uma linha de título, depois as colunas acima, mais o corte ou aterro como número com sinal (terreno menos projeto) para planilhas e coletores de dados.
- **PDF**: páginas de tabela no papel escolhido, um piquete por linha, cortes em laranja e aterros em verde, com a faixa de título das demais folhas.

:::note
Os piquetes são calculados a partir do projeto no arquivo. Confira-os com os projetos aprovados antes de executar qualquer obra.
:::
