---
title: Planos de plantação e mapas
summary: Coloque plantas isoladas, canteiros preenchidos ao espaçamento das plantas com misturas por percentagem, e sebes; etiquete-as; conte-as num mapa de plantação para uma folha de cálculo ou para a TakeoffCraft.
keywords: plano de plantação, mapa de plantação, canteiro de plantação, plantação em massa, sebe, árvore, arbusto, cobertura do solo, espaçamento, espaçamento triangular, contagem de plantas, quantidades, etiquetas, copa, símbolos de plantas, ifc, takeoff
from: ab49eab5
---

## Colocar plantas

1. Escolha uma planta em **Plantas**, à esquerda.
2. Clique em {{ui:Plant}} e depois clique na planta: cada clique coloca uma planta. Prima {{key:Esc}} para parar.

O símbolo de uma planta é desenhado com a largura da sua copa na maturidade; Mais › {{ui:Show at planting size}} desenha cada planta com o tamanho com que é plantada. As árvores assentam no solo por baixo delas: quando modelar o terreno mais tarde, seguem-no. Para fixar uma planta a uma cota, escreva-a em **Cota** nas Propriedades.

## Canteiros de plantação

1. Escolha a planta principal, clique em {{ui:Bed}} e clique nos cantos do canteiro. Prima {{key:Enter}} (ou clique de novo no primeiro canto) para o fechar.
2. O canteiro preenche-se com essa planta ao seu espaçamento, num padrão **triangular** (o habitual: cada planta à mesma distância de seis outras), a meio espaçamento do bordo.
3. Nas Propriedades, **Adicionar uma planta** mistura a planta escolhida à esquerda. Defina a **Parte %** de cada planta: o canteiro ocupa exatamente essa percentagem de cada uma, distribuída por ele. **Misturar de novo** reordena onde ficam.

Com o **Espaçamento** vazio usa-se o espaçamento próprio das plantas (ponderado pelas suas partes); escreva um valor para o usar em todas as plantas. O **Padrão** pode ser quadrado, e **Filas a** roda as filas.

## Sebes

Escolha a planta da sebe, clique em {{ui:Hedge}}, clique ao longo da sebe e prima {{key:Enter}}. As plantas ficam ao longo da linha ao seu espaçamento, centradas para que ambas as extremidades tenham a mesma margem. Uma sebe pode ter **duas filas desencontradas**, a uma distância definida.

## Etiquetas

As plantas isoladas são etiquetadas com a definição de etiqueta (`{name}` por defeito); escreva a sua própria etiqueta para uma planta nas Propriedades. Os canteiros são etiquetados com a contagem de cada planta, e as sebes com a sua. Mais › {{ui:Plant labels}} liga e desliga as etiquetas. Campos da etiqueta: `{name}`, `{botanical}`, `{size}` (o contentor), `{qty}`, `{height}`, `{spread}`, `{container}`.

## O mapa de plantação

Mais › {{ui:Plant schedule…}} conta cada planta por espécie, a partir de plantas isoladas, canteiros e sebes em conjunto, com o seu tamanho de plantação. Guarde-o como **CSV** ou **XLSX**, ou **Enviar para TakeoffCraft**: um ficheiro de quantidades que a TakeoffCraft abre para orçamentar as plantas (com as quantidades de pavimentação e de rega ao lado).

## IFC

Mais › {{ui:Export landscape IFC}} guarda o paisagismo como um ficheiro IFC (IFC 4.3) que um modelo BIM pode conter: cada planta é um `IfcGeographicElement` do tipo VEGETATION, tipificado pela sua espécie com as propriedades da planta (nome botânico, tamanhos, rusticidade, água, luz), e cada canteiro e sebe é um elemento com as suas contagens, no terreno. O BimCraft abre-o ao lado do edifício.
