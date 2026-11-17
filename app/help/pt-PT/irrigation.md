---
title: Projeto de rega
summary: Um auxiliar de cálculo, não um projeto carimbado: aspersores, ramais, conduta principal, válvulas e linhas de gota a gota no terreno; zonas identificadas a partir das tubagens; perda de pressão por Hazen–Williams, o aspersor mais desfavorável, caudal e pressão face ao abastecimento, taxas de precipitação, tempos de rega, cobertura e lista de materiais.
keywords: rega, aspersor, aspersores, difusor, rotor, bocal rotativo, borbulhador, gota a gota, linha de gota a gota, emissor, válvula, zona, estação, controlador, conduta principal, ramal, ponto de ligação, abastecimento de água, pressão, psi, kpa, caudal, gpm, perda por atrito, hazen williams, taxa de precipitação, tempo de rega, cobertura, aspersor a aspersor, lista de materiais
from: 7d6342c1
---

:::warning
Trata-se de um auxiliar de cálculo, não de um projeto carimbado: um projetista de rega verifica cada resultado antes de qualquer construção.
:::

## Definir o sistema

1. Na secção **Rega** à esquerda, escolha o **Aspersor**, o seu **Arco** e onde começa o arco, e os diâmetros das tubagens dos ramais e da conduta principal.
2. {{ui:Rega}} › {{ui:Ponto de ligação}}: clique onde o abastecimento de água se liga. Defina a sua **pressão**, o **caudal disponível** e a perda do contador e do antirretorno nas Propriedades.
3. {{ui:Rega}} › {{ui:Válvula}}: clique onde fica a válvula de cada zona. Uma válvula inicia uma zona.
4. {{ui:Rega}} › {{ui:Aspersor}}: clique para colocar os aspersores; cada clique coloca um.
5. {{ui:Rega}} › {{ui:Tubo lateral}}: clique desde uma válvula, passando pelos seus aspersores, e prima {{key:Enter}}. {{ui:Conduta principal}}: desde o ponto de ligação até cada válvula.

As extremidades das tubagens encaixam nos aspersores, nas válvulas, no abastecimento e noutras extremidades de tubagem, para que a rede fique ligada. Uma zona é tudo o que se alcança a partir da sua válvula ao longo dos ramais; a conduta principal transporta uma zona de cada vez.

## Gota a gota

{{ui:Rega}} › {{ui:Linha de gota a gota}}: clique ao longo da linha, começando onde é alimentada (uma extremidade de ramal ou uma válvula). Defina o **caudal do emissor** e o **espaçamento** nas Propriedades; o seu caudal é o dos emissores ao longo dela.

## A verificação

{{ui:Rega}} › {{ui:Verificar o sistema…}} lista cada zona:

| Coluna | Como é calculada |
|---|---|
| Caudal | Os caudais dos aspersores (e das linhas de gota a gota) somados |
| Na válvula | A pressão de funcionamento do aspersor mais desfavorável, mais as perdas nas tubagens até ele (Hazen–Williams, o diâmetro interior da tubagem, a diferença de cota), e a perda através da válvula |
| No abastecimento | O mesmo, mais a perda da conduta principal que transporta essa zona, e a perda do contador e do antirretorno |
| Precipitação | O caudal dos aspersores sobre a área que regam, com espaçamento aspersor a aspersor |
| Minutos por semana | Para aplicar a definição **Água por semana** |
| Problemas | Velocidade acima do limite, um aspersor fora da sua gama de pressão, difusores e rotores numa só válvula, pressão ou caudal insuficientes no abastecimento, aspersores sem zona, circuitos fechados |

Selecione uma válvula para ver os valores da sua zona e o seu aspersor mais desfavorável assinalado com um círculo na planta. A lista de materiais conta os aspersores por tipo e arco, as tubagens por diâmetro, as válvulas, as linhas de gota a gota e os emissores, e as estações do controlador. **Guardar como CSV** guarda as duas.

As definições da secção Rega: **Hazen–Williams C** (150 para tubagem nova de plástico), a **velocidade máxima** do escoamento numa tubagem (1.5 m/s), a **perda através de uma válvula** e **Água por semana**. São valores predefinidos identificados como tal.

## Cobertura

{{ui:Rega}} › {{ui:Mostrar a cobertura}} indica quanta área os aspersores deixam seca, quanta é regada por dois ou mais aspersores, e quais aspersores não alcançam um vizinho (espaçamento aspersor a aspersor).

## Aspersores

Os aspersores listados são tipos **genéricos** criados pelo CadCraft a partir de taxas de precipitação de projeto (difusores fixos, bocais rotativos, rotores de engrenagem, borbulhadores, micro-difusores, emissores), e não produtos de qualquer fabricante. **Adicionar aspersores a partir de um ficheiro…** lê os seus próprios (uma lista JSON com o alcance, o caudal ou a taxa de precipitação de cada aspersor e a sua gama de pressão); são guardados com o projeto. Os dados publicados de um fabricante só se incluem com a autorização registada desse fabricante.

Abaixo dos aspersores genéricos, a lista tem **aspersores típicos** (os seus nomes terminam em "valores típicos"): tamanhos de bocal de difusores fixos, bocais rotativos e rotores de engrenagem, micro-difusores, borbulhadores e emissores, com um raio, um caudal e uma gama de pressão. São calculados pelo CadCraft a partir de fórmulas publicadas (a equação do orifício para o caudal, o escalonamento do alcance do jato para o raio) e de classes de caudal nominal, apenas a partir de fontes abertas; não é copiada nenhuma tabela de fabricante. Escolha um e o seletor mostra a sua base e a licença. Um projeto que o utilize guarda o aspersor e a sua fonte no ficheiro do projeto. São para planeamento: verifique os dados próprios do aspersor real antes de construir.
