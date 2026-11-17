---
title: Modificadores do terreno e cotas em tempo real
summary: Tudo o que molda o terreno proposto numa única lista ordenada (a última prevalece onde se sobrepõem), escavação e aterro por modificador, verificações de junção no painel Problemas, e cotas pontuais e setas de inclinação que leem o terreno em tempo real.
keywords: modificadores do terreno, pilha, ordem, terreno proposto, terreno natural, sobreposição, escavação e aterro, junção, muro de suporte, borda de pavimento, cota da base, patamar de degrau, cota pontual, altura pontual, seta de inclinação, rótulo de inclinação, declives
from: 3998a5b0
---

Terreno proposto = terreno natural + os modificadores, por ordem. O terreno natural nunca é alterado.

## A lista

{{ui:Cotas}} › {{ui:Modificadores do terreno…}} lista todos os objetos que moldam o terreno: plataformas, taludes de terra, valas, zonas de modelação, pavimentos e caminhos, áreas plantadas com cota acabada, e degraus e rampas cuja caixa **Molda o terreno** esteja marcada (com as respetivas cotas de base e de topo). Onde dois se sobrepõem, o **posterior** prevalece. Arraste uma linha ou use as setas para alterar a ordem; o terreno é reconstruído de imediato. Cada linha mostra a sua escavação e aterro (o que molda depois dos que estão acima), com o total por baixo da lista.

## Verificações de junção

O painel Problemas lista, com **ir para**:

- um muro cujo lado alto está acima do seu topo (terra sobre o muro), ou cujo lado baixo mostra a sua fundação;
- uma área plantada cuja cota acabada está acima da borda do pavimento com que confina, ou mais de 150 mm abaixo dela (valor típico);
- degraus cuja base ou topo não coincide com o pavimento onde aterram;
- dois modificadores que se sobrepõem (o posterior prevalece aí).

Um muro de suporte pode ter o topo a seguir o lado alto do terreno: a sua altura é recalculada sempre que o terreno muda.

## Um muro de suporte que molda o terreno

Selecione um muro de suporte e marque **Molda o terreno**. A faixa sob o muro (com a largura da espessura do muro) passa a fazer parte da lista como modificador:

- a aresta do **lado alto** é mantida à cota do terreno nesse ponto, estação a estação, pelo que o topo do muro acompanha o lado alto (com o remate por cima). Se escrever uma cota em **Topo**, o lado alto fica nessa cota, menos o remate;
- a aresta do **lado baixo** é mantida na cota **Terreno mantido no lado baixo** que escrever ou, se a deixar em branco, no terreno nesse ponto;
- o lado alto é aquele cujo terreno é mais alto ao longo de todo o muro, pelo que nunca troca ao longo do muro;
- o terreno para lá da faixa não é alterado, e o terreno natural nunca é.

Como qualquer modificador, fica na lista, e um modificador posto depois dele prevalece onde se sobrepõem. Um muro cuja cota mantida numa extremidade esteja a mais de 150 mm (valor típico) do terreno natural nesse ponto recebe um aviso no painel Problemas (com **ir para**). Um muro isolado não molda o terreno. A caixa fica desmarcada nos ficheiros de versões anteriores, que abrem como estavam.

## Cotas pontuais e setas de inclinação

{{ui:Cota pontual}} (um clique) e {{ui:Seta de inclinação}} (dois cliques) leem o terreno sempre que são desenhados: ao mover um objeto ou ao alterar a sua cota, os rótulos acompanham-no. Nas Propriedades escolha se um rótulo lê o terreno proposto ou o natural; os rótulos do terreno natural são apresentados entre parênteses. As setas apontam encosta abaixo e indicam `1:20 (5.0 %)`.
