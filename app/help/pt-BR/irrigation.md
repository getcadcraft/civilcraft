---
title: Projeto de irrigação
summary: Um auxílio de cálculo, não um projeto com responsabilidade técnica: aspersores, linhas laterais, linha principal, válvulas e linhas de gotejamento no local; zonas encontradas a partir das tubulações; perda de carga por Hazen–Williams, o aspersor de pior caso, vazão e pressão em relação ao abastecimento, taxas de precipitação, tempos de funcionamento, cobertura e uma lista de materiais.
keywords: irrigação, aspersor, aspersores, aspersão, rotor, bocal rotativo, borbulhador, gotejamento, linha de gotejamento, emissor, válvula, zona, estação, controlador, linha principal, lateral, ponto de conexão, abastecimento de água, pressão, psi, kpa, vazão, gpm, perda de carga, hazen williams, taxa de precipitação, tempo de funcionamento, cobertura, espaçamento aspersor a aspersor, lista de materiais
from: 7d6342c1
---

:::warning
Este é um auxílio de cálculo, não um projeto com responsabilidade técnica: um projetista de irrigação confere cada resultado antes de qualquer coisa ser construída.
:::

## Monte o sistema

1. Na seção **Irrigação** à esquerda, escolha o **Aspersor**, seu **Arco** e onde o arco começa, e os diâmetros das tubulações para as laterais e a linha principal.
2. {{ui:Irrigação}} › {{ui:Ponto de conexão}}: clique onde o abastecimento de água se conecta. Defina sua **pressão**, a **vazão disponível** e a perda do hidrômetro e do antirrefluxo nas Propriedades.
3. {{ui:Irrigação}} › {{ui:Válvula}}: clique onde fica a válvula de cada zona. Uma válvula inicia uma zona.
4. {{ui:Irrigação}} › {{ui:Aspersor}}: clique para posicionar os aspersores; cada clique posiciona um.
5. {{ui:Irrigação}} › {{ui:Tubo lateral}}: clique a partir de uma válvula, passando pelos seus aspersores, e pressione {{key:Enter}}. {{ui:Linha principal}}: do ponto de conexão até cada válvula.

As extremidades das tubulações se encaixam em aspersores, válvulas, no abastecimento e em outras extremidades de tubulação, de modo que a rede se una. Uma zona é tudo o que é alcançado a partir da sua válvula pelas laterais; a linha principal transporta uma zona por vez.

## Gotejamento

{{ui:Irrigação}} › {{ui:Linha de gotejamento}}: clique ao longo da linha, começando onde ela é alimentada (uma extremidade de lateral ou uma válvula). Defina a **vazão do emissor** e o **espaçamento** nas Propriedades; sua vazão é a dos emissores ao longo dela.

## A verificação

{{ui:Irrigação}} › {{ui:Verificar o sistema…}} lista cada zona:

| Coluna | Como é calculada |
|---|---|
| Vazão | A soma das vazões dos aspersores (e das linhas de gotejamento) |
| Na válvula | A pressão de trabalho do aspersor de pior caso mais as perdas de carga das tubulações até ele (Hazen–Williams, o diâmetro interno da tubulação, a variação de elevação) e a perda pela válvula |
| No abastecimento | O mesmo, mais a perda da linha principal que transporta essa zona, e a perda do hidrômetro e do antirrefluxo |
| Precipitação | A vazão dos aspersores sobre a área que eles irrigam no espaçamento aspersor a aspersor |
| Minutos por semana | Para aplicar a configuração **Água por semana** |
| Problemas | Velocidade acima do limite, um aspersor fora da sua faixa de pressão, aspersões e rotores em uma mesma válvula, pressão ou vazão insuficientes no abastecimento, aspersores sem zona, laços |

Selecione uma válvula para ver os números da sua zona e o aspersor de pior caso circulado na planta. A lista de materiais conta os aspersores por tipo e arco, as tubulações por diâmetro, as válvulas, a linha de gotejamento e os emissores, e as estações do controlador. **Salvar como CSV** guarda ambas.

Configurações na seção Irrigação: **Hazen–Williams C** (150 para tubulação plástica nova), a **velocidade máxima de escoamento** em uma tubulação (1.5 m/s), a **perda pela válvula** e a **água por semana**. São padrões rotulados.

## Cobertura

{{ui:Irrigação}} › {{ui:Mostrar cobertura}} informa quanto da área os aspersores deixam seca, quanto é molhada por dois ou mais aspersores, e quais aspersores não alcançam um vizinho (espaçamento aspersor a aspersor).

## Aspersores

Os aspersores listados são tipos **genéricos** escritos pelo CadCraft a partir de taxas de precipitação de projeto (aspersores fixos, bocais rotativos, rotores de engrenagem, borbulhadores, microaspersores, emissores), não produtos de nenhum fabricante. **Adicionar aspersores de um arquivo…** lê os seus próprios (uma lista JSON com o alcance do jato, a vazão ou a taxa de precipitação e a faixa de pressão de cada aspersor); eles são salvos com o projeto. Dados publicados por um fabricante só entram com a permissão registrada desse fabricante.

Abaixo dos aspersores genéricos, a lista tem **aspersores típicos** (seus nomes terminam em "valores típicos"): tamanhos de bocal de aspersores fixos, bocais rotativos e rotores de engrenagem, microaspersores, borbulhadores e emissores, com raio, vazão e faixa de pressão. O CadCraft os calcula a partir de matemática publicada (a equação do orifício para a vazão, a escala do alcance do jato para o raio) e de classes nominais de vazão, apenas de fontes abertas; nenhuma tabela de fabricante é copiada. Escolha um e o seletor mostra sua base e licença. Um projeto que usa um deles mantém o aspersor e sua fonte no arquivo do projeto. Eles servem para planejamento: confira os dados próprios do aspersor real antes de construir.
