---
title: Planos de plantio e tabelas
summary: Posicionar plantas isoladas, canteiros de plantio preenchidos no espaçamento das plantas com misturas por percentual, e cercas vivas; rotulá-las; contá-las em uma tabela de plantio para uma planilha ou para o TakeoffCraft.
keywords: plano de plantio, tabela de plantio, canteiro de plantio, plantio em massa, cerca viva, árvore, arbusto, forração, espaçamento, espaçamento triangular, contagem de plantas, quantitativos, rótulos, copa, símbolos de plantas, ifc, levantamento
from: ab49eab5
---

## Posicionar plantas

1. Escolha uma planta em **Plantas**, à esquerda.
2. Clique em {{ui:Planta}} e depois clique na planta: cada clique posiciona uma planta. Pressione {{key:Esc}} para parar.

O símbolo de uma planta é desenhado na largura da maturidade; Mais › {{ui:Mostrar no tamanho de plantio}} desenha cada planta no tamanho em que é plantada. Árvores ficam sobre o terreno sob elas: quando você modelar o terreno depois, elas o acompanham. Para fixar uma planta em uma cota, digite-a em **Cota** nas Propriedades.

## Canteiros de plantio

1. Escolha a planta principal, clique em {{ui:Canteiro}} e clique nos cantos do canteiro. Pressione {{key:Enter}} (ou clique de novo no primeiro canto) para fechá-lo.
2. O canteiro é preenchido com essa planta no seu espaçamento, em padrão **triangular** (o usual: cada planta à mesma distância de outras seis), a meio espaçamento da borda.
3. Nas Propriedades, **Adicionar uma planta** mistura a planta escolhida à esquerda. Defina a **Parcela %** de cada planta: o canteiro usa exatamente essa quantidade de cada uma, distribuída por ele. **Misturar de novo** embaralha onde elas ficam.

Se **Espaçamento** estiver vazio, usa o espaçamento próprio das plantas (ponderado pelas parcelas); digite um valor para usá-lo em todas as plantas. **Padrão** pode ser quadrado, e **Linhas a** gira as linhas.

## Cercas vivas

Escolha a planta da cerca, clique em {{ui:Cerca viva}}, clique ao longo da cerca e pressione {{key:Enter}}. As plantas são colocadas ao longo da linha no seu espaçamento, centralizadas para que as duas extremidades tenham a mesma margem. Uma cerca pode ter **duas fileiras, alternadas**, a uma distância definida.

## Rótulos

Plantas isoladas recebem rótulo conforme a configuração de rótulo (`{name}` por padrão); digite seu próprio rótulo para uma planta nas Propriedades. Canteiros são rotulados com a contagem de cada planta, cercas com a delas. Mais › {{ui:Rótulos das plantas}} liga e desliga os rótulos. Campos de rótulo: `{name}`, `{botanical}`, `{size}` (o recipiente), `{qty}`, `{height}`, `{spread}`, `{container}`.

## A tabela de plantio

Mais › {{ui:Tabela de plantio…}} conta cada planta por espécie, somando plantas isoladas, canteiros e cercas, com seu tamanho de plantio. Salve como **CSV** ou **XLSX**, ou **Enviar para o TakeoffCraft**: um arquivo de quantitativos que o TakeoffCraft abre para precificar as plantas (com os quantitativos de pavimentação e irrigação ao lado).

## IFC

Mais › {{ui:Exportar IFC de paisagismo}} salva o paisagismo como um arquivo IFC (IFC 4.3) que um modelo BIM pode conter: cada planta é um `IfcGeographicElement` do tipo VEGETATION, tipado pela sua espécie, com as propriedades da planta (nome botânico, tamanhos, rusticidade, água, luz); cada canteiro e cerca é um elemento com suas contagens, no terreno. O BimCraft o abre ao lado da edificação.
