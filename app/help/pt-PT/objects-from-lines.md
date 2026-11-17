---
title: Objetos a partir de linhas, mantidos ligados
summary: Crie um pavimento, uma área plantada, um canteiro, uma sebe, um caminho, um muro, um lancil, degraus, uma rampa, uma plataforma, uma vala ou uma linha característica a partir de uma linha; o objeto segue a linha quando esta se move, até quebrar a ligação.
keywords: a partir de uma linha, traçado, DWG, DXF, ligação, ligado, seguir, regenerar, quebrar ligação, linha característica, linha característica a partir de traçado, camada importada, contorno, supercad studio, linha de desenho
from: eb67a0c6
---

{{ui:A partir de uma linha}} (Paisagismo › {{ui:Mais}}): clique numa linha característica, ou numa linha ou contorno de uma camada DWG/DXF importada. Uma linha fechada pode criar pavimento, um relvado, um canteiro plantado, um prado, uma cobertura do solo, um canteiro ou uma plataforma; uma linha aberta, um caminho, um muro, um lancil, degraus (o primeiro e o último ponto), uma rampa, uma sebe ou uma vala. Qualquer um dos tipos pode criar uma **linha característica**, exceto uma linha característica em si.

## Uma linha característica a partir de uma linha

Uma linha característica criada a partir de uma linha toma os seus pontos, fechada se a linha era fechada. As suas cotas são assentes no terreno existente (0 onde ainda não há nenhum), e a sua utilização é **Desligada**: não modela terreno até escolher uma utilização e definir as suas cotas nas Propriedades. Quando a linha se move, uma linha característica com o mesmo número de pontos mantém cada cota que definiu; quando a linha ganha ou perde pontos, as cotas são assentes de novo no terreno. Veja [Linhas características](topic:feature-lines).

O novo objeto mantém uma **ligação** à sua linha. Quando a linha se move (arrasta os seus pontos, ou o desenho é movido ou relido), o objeto toma a nova forma no mesmo passo de anulação, e através dos modificadores do terreno o terreno proposto segue-o. As Propriedades indicam a que está ligado; {{ui:Quebrar ligação}} torna-o livre.

As linhas são verificadas primeiro: uma linha precisa de pelo menos 2 pontos (3 para um contorno), no máximo 5000, com números reais; um contorno tem de estar fechado e não se pode cruzar a si próprio. Uma linha que falhe não é usada: o objeto fica como estava e o painel de Problemas indica porquê. Se a linha for eliminada, o objeto fica e o painel de Problemas regista-o.

## No SuperCad Studio

Abra o local e o desenho 2D no mesmo projeto. Escolha uma linha ou polilinha no desenho 2D, prima Ctrl+K e execute {{ui:Objeto de paisagismo a partir da linha de desenho escolhida}}: o CivilCraft pergunta o que criar, como acima, e o objeto fica ligado a essa linha do desenho. Depois de alterar linhas no desenho, Ctrl+K {{ui:Atualizar o paisagismo a partir do desenho}} faz os objetos seguirem, com um passo de anulação por cada linha. O ficheiro de ligações do projeto regista qual objeto segue qual linha. A ajuda do próprio SuperCad Studio tem um tópico sobre Paisagismo.
