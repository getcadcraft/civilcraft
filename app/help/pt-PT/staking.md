---
title: Criar um relatório de implantação
summary: Listar as estacas ao longo de uma diretriz, nas estações e afastamentos, ou os pontos de levantamento próximos, com estação, afastamento, norte, este, cotas de projeto e do terreno e escavação ou aterro, e guardar o relatório em CSV ou PDF.
keywords: implantação, locação, relatório de estacas, folha de escavação, folha de rasante, estação, afastamento, escavação, aterro, marcação, implantação de obra, as-built
from: d8a4e9f1
---

Selecione uma diretriz e clique em **Relatório de implantação** nas suas **Propriedades**.

## Estacas nas estações e afastamentos

1. **De** e **até**: as estações a implantar (1+50 ou 150).
2. **a cada**: o intervalo. As estacas ficam em todos os múltiplos dele, nas duas extremidades, e (com a caixa assinalada) onde começam e acabam as curvas da diretriz.
3. **Afastamentos**: à esquerda e à direita da diretriz, olhando no sentido das estações crescentes: `12 L, 0, 12 R`, `L12 CL R12` ou `-12, 0, 12` (à esquerda é menos). Uma diretriz com corredor começa pelos bordos da faixa de rodagem e pelas bermas.
4. **Numerar a partir de** e **com prefixo** dão nome às estacas: 1, 2, 3, ou S101, S102.

## Pontos de levantamento próximos da diretriz

Escolha **pontos de levantamento próximos da diretriz** e a distância. Cada ponto dentro dessa distância recebe a sua estação e afastamento, o projeto nesse local e a sua própria cota como terreno: uma verificação dos pontos implantados ou medidos como construído.

## O que diz o relatório

| Coluna | O que é |
|---|---|
| Ponto | O nome da estaca, ou o número do ponto de levantamento |
| Estação, Afastamento | Onde está ao longo da diretriz: L esquerda, R direita |
| Norte, Este | As suas coordenadas |
| Cota de projeto | A superfície do corredor escavado nesse local (da linha de intersecção do talude à linha de intersecção do talude), senão o perfil de projeto no eixo |
| Cota do terreno | A superfície existente nesse local, ou a cota própria do ponto de levantamento |
| Escavação/aterro | C quando o terreno está acima do projeto (escavar), F quando está abaixo (aterrar), até à centésima |

Uma estaca sem cota de projeto (fora do corredor, ou numa diretriz sem ele fora do eixo) não tem escavação nem aterro; a caixa de diálogo indica quantas são.

## Guardar

- **CSV**: uma linha de título, depois as colunas acima, mais a escavação ou o aterro como número com sinal (terreno menos projeto), para folhas de cálculo e equipamentos de registo de dados.
- **PDF**: páginas de tabela no formato de papel escolhido, uma estaca por linha, escavações a laranja e aterros a verde, com a legenda das outras folhas.

:::note
As estacas são calculadas a partir do projeto no ficheiro do projeto. Verifique-as face aos planos aprovados antes de construir seja o que for.
:::
