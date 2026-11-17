---
title: Verificar volumes contra os limites de zonamento que escreve
summary: Escreva os recuos de um lote linha a linha, um limite de altura, um plano de exposição ao céu, um coeficiente de utilização e uma ocupação, veja a envolvente edificável no plano e leia que volumes ultrapassam que limites.
keywords: zonamento, recuo, recuos, frente, lateral, fundo, envolvente, área edificável, limite de altura, plano de exposição ao céu, coeficiente de utilização, FAR, ocupação, lote, parcela, regulamento municipal, verificação de código
from: 3e267b31
---

**O CivilCraft não tem nenhum código de zonamento.** Não conhece as regras de nenhuma cidade e não inclui uma biblioteca delas. Cada número desta página é um que escreve, tirado do seu próprio regulamento municipal, e cada resultado indica que foi medido contra os limites que escreveu. É uma forma de ver como os limites de um lote moldam um edifício, não uma decisão sobre se um projeto é permitido.

## Escrever os limites

Em **Propriedades**, em **Volumes de edifícios**, escolha um **Lote** (ou selecione um volume: os limites do seu lote aparecem por baixo). Depois preencha o que se aplica; deixe uma caixa vazia para «sem limite»:

- **Linha de rua**: a linha do lote na rua. O **Recuo frontal** aplica-se a ela, o **Recuo posterior** à linha mais oposta, e o **Recuo lateral** às restantes.
- **Limite de altura**.
- **Plano de exposição ao céu**: começa a uma altura na linha do lote e sobe a quantidade que escrever por cada 1 de profundidade para dentro, medida a partir da linha de rua ou de cada linha do lote (2 significa 2 para 1). A altura permitida sobre um ponto é a menor entre o plano e o limite de altura.
- **Coeficiente de utilização** (área bruta de pavimento dos volumes no lote, a dividir pela área do lote) e **Ocupação** (as áreas de implantação dos volumes, a dividir pela área do lote, escrita em percentagem).

## A envolvente

Marque **Mostrar a envolvente no plano** para a desenhar na camada `A-MASS-ENVL`. A envolvente é o lote recuado em cada linha do lote pelo recuo dessa linha, com as linhas de deslocamento a encontrarem-se em cantos em meia-esquadria. Uma linha de lote feita de uma curva é tomada como cordas curtas a menos de 0.01 da curva. Lotes convexos e côncavos funcionam ambos. Se os recuos se cruzarem (um recuo profundo num lote estreito ou muito côncavo) não há envolvente, e as Propriedades indicam-no; experimente distâncias menores.

## O resultado

Por baixo das caixas, cada volume e cada limite tem uma linha, com um visto ou uma cruz:

- **recuos**: a área do volume que fica fora da envolvente;
- **altura**: a altura do volume contra a mais alta permitida sobre a sua implantação (um prisma de uma só altura é limitado pela menor altura permitida em qualquer dos seus cantos);
- **coeficiente de utilização** e **ocupação**: todos os volumes do lote somados.
