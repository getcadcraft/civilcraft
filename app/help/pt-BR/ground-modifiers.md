---
title: Modificadores do terreno e níveis ao vivo
summary: Tudo que molda o terreno projetado em uma lista ordenada (o último prevalece onde se sobrepõem), corte e aterro por modificador, verificações de junção no painel Problemas, e cotas de nível e setas de declividade que leem o terreno ao vivo.
keywords: modificadores do terreno, pilha, ordem, terreno projetado, terreno existente, sobreposição, corte e aterro, junção, muro de arrimo, borda de pavimento, nível da cama, patamar de degrau, cota de nível, altura de cota, seta de declividade, rótulo de inclinação, queda
from: 3998a5b0
---

O terreno projetado = terreno existente + os modificadores, em ordem. O terreno existente nunca é alterado.

## A lista

{{ui:Níveis}} › {{ui:Modificadores do terreno…}} lista cada objeto que molda o terreno: plataformas, camalhões, valas de drenagem, áreas de terraplenagem, pavimentação e caminhos, áreas plantadas com um nível acabado, e degraus e rampas cuja caixa **Molda o terreno** está marcada (com seus níveis de base e de topo). Onde dois se sobrepõem, o **posterior** prevalece. Arraste uma linha, ou use as setas, para mudar a ordem; o terreno é reconstruído na hora. Cada linha mostra seu corte e aterro (o que ela molda depois das linhas acima dela), com o total abaixo da lista.

## Verificações de junção

O painel Problemas lista, com **ir para**:

- um muro cujo lado alto está acima do topo dele (solo sobre o muro), ou cujo lado baixo mostra a sua fundação;
- uma área plantada cujo nível acabado está acima da borda do pavimento que encontra, ou mais de 150 mm abaixo dela (valor típico);
- degraus cuja base ou topo não encontra o pavimento onde pousam;
- dois modificadores que se sobrepõem (o posterior prevalece ali).

Um muro de arrimo pode ter seu topo acompanhando o lado alto do terreno: a altura dele é recalculada sempre que o terreno muda.

## Um muro de arrimo que molda o terreno

Selecione um muro de arrimo e marque **Molda o terreno**. A faixa sob o muro (tão larga quanto a espessura do muro) entra na lista como um modificador:

- a borda do **lado alto** é mantida no terreno ali, estaca por estaca, de modo que o topo do muro acompanha o lado alto (com o coroamento no topo). Digite um nível de **Topo** e ele mantém o lado alto nesse nível menos o coroamento;
- a borda do **lado baixo** é mantida no nível de **Terreno mantido no lado baixo** que você digitar ou, se vazio, no terreno ali;
- o lado alto é aquele cujo terreno está mais alto em todo o muro, então ele nunca inverte ao longo do muro;
- o terreno além da faixa não muda, e o terreno existente nunca muda.

Como qualquer modificador, ele fica na lista, e um modificador posterior a ele prevalece onde se sobrepõem. Um muro cujo nível mantido em uma extremidade está a mais de 150 mm (valor típico) do terreno existente ali recebe um aviso no painel Problemas (com **ir para**). Um muro independente não molda o terreno. A caixa fica desmarcada em arquivos de versões anteriores, que abrem como estavam.

## Cotas de nível e setas de declividade

{{ui:Cota de nível}} (um clique) e {{ui:Seta de declividade}} (dois cliques) leem o terreno toda vez que são desenhados: mova ou reajuste o nível de um objeto e os rótulos acompanham. Em Propriedades, escolha se um rótulo lê o terreno projetado ou o existente; rótulos do terreno existente são mostrados entre colchetes. As setas apontam morro abaixo e exibem `1:20 (5.0 %)`.
