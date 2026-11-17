---
title: Folhas de planta e perfil
summary: Plotar um alinhamento como um conjunto de folhas de planta e perfil em um único PDF, com linhas de correspondência entre elas.
keywords: planta e perfil, folhas, plotagem, pdf, linha de correspondência, produção de planta, projetos viários, plotagem de perfil, exagero vertical, conjunto de folhas
from: 34b4ec78
---

As folhas de planta e perfil são como os projetos viários costumam ser desenhados: cada folha mostra um trecho da via duas vezes, a planta acima e o perfil abaixo, na mesma escala horizontal, de modo que uma estaca fique no mesmo lugar nos dois.

## Criar as folhas

1. Selecione o alinhamento. Em **Propriedades**, clique em {{ui:Folhas de planta e perfil}}.
2. Escolha o **Papel**, a **Escala da planta** e o **Exagero do perfil** (quantas vezes mais alto o perfil é desenhado do que longo; 10× para começar). A caixa de diálogo informa quantas folhas isso gera e quanto do alinhamento cada uma mostra.
3. Para plotar parte do alinhamento, altere **Da estaca** e **Até a estaca**.
4. Clique em {{ui:Baixar PDF}}. O PDF tem uma página por folha.

## O que há em uma folha

| Parte | O que mostra |
|---|---|
| Planta | Tudo o que há na planta (curvas de nível, pontos topográficos, o alinhamento e sua estaqueamento, corredores, plataformas, linhas de feição, tubos, linhas de amostragem), girado para que este trecho atravesse a folha, com a seta do norte girada na mesma direção |
| Linhas de correspondência | Uma linha traço-ponto perpendicular ao alinhamento em cada extremidade que continua em outra folha, rotulada como "Linha de correspondência sta 5+50.00, ver folha 2" |
| Perfil | O terreno natural (tracejado), o perfil de projeto (vermelho), o greide de cada tangente e o PVI, cota, L e K de cada curva vertical; estacas na parte inferior, cotas dos dois lados |
| Faixa da legenda | O nome do projeto, o alinhamento e seu intervalo de estacas, "Folha 1 de 3", as escalas horizontal e vertical e o exagero |

O trecho por folha tem o comprimento que a janela da planta permite na escala, arredondado para baixo para 50 ft (20 m) em trechos longos ou 10 ft (5 m) em trechos curtos.

:::note
Quando as cotas do perfil não couberem no exagero escolhido, o CivilCraft desenha todas as folhas com o maior dentre 10×, 5×, 4×, 2× e 1× que couber, e a barra de status informa isso. Um alinhamento curvo é girado pela direção do início ao fim de cada trecho, então a via pode subir ou descer levemente na folha.
:::
