---
title: Verifique massas contra os limites de zoneamento que você digita
summary: Digite os recuos de um lote linha a linha, um limite de altura, um plano de exposição ao céu, um coeficiente de aproveitamento e uma taxa de ocupação, veja o envelope construtivo na planta e leia quais massas ultrapassam quais limites.
keywords: zoneamento, recuo, recuos, frontal, lateral, fundos, envelope, área edificável, limite de altura, plano de exposição ao céu, coeficiente de aproveitamento, CA, taxa de ocupação, lote, lei municipal, verificação de código
from: 3e267b31
---

**O CivilCraft não tem código de zoneamento.** Ele não conhece as regras de nenhuma cidade e não traz uma biblioteca delas. Todo número desta página é um que você digita, tirado da sua própria lei municipal, e todo resultado informa que foi medido contra os limites que você digitou. É uma forma de ver como os limites de um lote moldam uma edificação, não uma decisão sobre se um projeto é permitido.

## Digite os limites

Em **Propriedades**, em **Massas de edificação**, escolha um **Lote** (ou selecione uma massa: os limites do lote dela aparecem abaixo). Depois preencha o que se aplica; deixe uma caixa vazia para "sem limite":

- **Linha da rua**: a divisa do lote na rua. O **Recuo frontal** se aplica a ela, o **Recuo de fundos** à divisa mais oposta a ela, e o **Recuo lateral** às demais.
- **Limite de altura**.
- **Plano de céu**: começa em uma altura na divisa e sobe a quantidade que você digitar para cada 1 de avanço para dentro, medida a partir da linha da rua ou de cada divisa do lote (2 significa 2 para 1). A altura permitida sobre um ponto é a menor entre o plano e o limite de altura.
- **Coeficiente de aproveitamento** (área bruta de piso das massas no lote dividida pela área do lote) e **Taxa de ocupação** (as projeções delas divididas pela área do lote, digitada em porcentagem).

## O envelope

Marque **Mostrar o envelope na planta** para desenhá-lo na camada `A-MASS-ENVL`. O envelope é o lote recuado a partir de cada divisa pelo recuo daquela divisa, com as linhas de recuo se encontrando em cantos de meia-esquadria. Uma divisa de lote feita de uma curva é tratada como cordas curtas dentro de 0.01 da curva. Lotes convexos e côncavos funcionam ambos. Se os recuos se sobrepuserem (um recuo profundo em um lote estreito ou muito côncavo), não há envelope, e as Propriedades informam isso; tente distâncias menores.

## O resultado

Abaixo das caixas, cada massa e cada limite recebe uma linha, com um visto ou um X:

- **recuos**: a área da massa que fica fora do envelope;
- **altura**: a altura da massa contra a maior altura permitida sobre a sua projeção (um prisma de uma só altura é limitado pela menor altura permitida em qualquer um dos seus cantos);
- **coeficiente de aproveitamento** e **taxa de ocupação**: todas as massas do lote somadas.
