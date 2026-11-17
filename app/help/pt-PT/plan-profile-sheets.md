---
title: Folhas de planta e perfil
summary: Imprima uma diretriz como um conjunto de folhas de planta e perfil num só PDF, com linhas de ligação entre elas.
keywords: planta e perfil, folhas, imprimir, plotar, pdf, linha de ligação, produção de plantas, planos de estradas, perfil, exagero vertical, conjunto de folhas
from: 34b4ec78
---

As folhas de planta e perfil são a forma habitual de desenhar os planos de estradas: cada folha mostra um troço da estrada duas vezes, a planta em cima e o perfil em baixo, à mesma escala horizontal, para que uma estaca fique no mesmo sítio nas duas.

## Criar as folhas

1. Selecione a diretriz. Em **Propriedades**, clique em {{ui:Plan and profile sheets}}.
2. Escolha o **Formato**, a **Escala da planta** e o **Exagero do perfil** (quantas vezes mais alto é desenhado o perfil do que é longo; 10× para começar). A caixa de diálogo indica quantas folhas resultam e quanto da diretriz mostra cada uma.
3. Para imprimir apenas parte da diretriz, altere **De PK** e **Até PK**.
4. Clique em {{ui:Download PDF}}. O PDF tem uma página por folha.

## O que há numa folha

| Parte | O que mostra |
|---|---|
| Planta | Tudo o que está na planta (curvas de nível, pontos topográficos, a diretriz e a sua marcação de PK, corredores, plataformas, linhas características, coletores, linhas de amostragem) rodado para que este troço atravesse a folha, com a seta do norte rodada em conformidade |
| Linhas de ligação | Uma linha traço-ponto perpendicular à diretriz em cada extremidade que continua noutra folha, com o rótulo "Linha de ligação PK 5+50.00, ver folha 2" |
| Perfil | O terreno natural (tracejado), o perfil de projeto (vermelho), a rasante de cada tangente e o PVI, a cota, L e K de cada curva vertical; PK ao longo da base, cotas dos dois lados |
| Legenda | O nome do projeto, a diretriz e o seu intervalo de PK, "Folha 1 de 3", as escalas horizontal e vertical e o exagero |

Cada folha tem o troço tão comprido quanto a janela da planta permite à escala, arredondado por defeito para um múltiplo inteiro de 50 ft (20 m) em troços longos ou de 10 ft (5 m) em troços curtos.

:::note
Quando as cotas do perfil não couberem no exagero escolhido, a CivilCraft desenha todas as folhas com o maior dos valores 10×, 5×, 4×, 2× e 1× que caiba, e a barra de estado indica-o. Uma diretriz em curva é rodada segundo a direção do início ao fim de cada troço, pelo que a estrada pode subir ou descer ligeiramente na folha.
:::
