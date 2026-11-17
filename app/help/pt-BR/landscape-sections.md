---
title: Seções de paisagismo e o conjunto de publicação
summary: Linhas de corte que atravessam o terreno natural e o proposto, muros com sapatas, composições de pavimentos e de áreas plantadas, degraus e plantas em tamanho adulto, em folhas próprias; um conjunto de publicação com lista de folhas, um PDF e um DWG por folha.
keywords: seção, corte transversal, elevação, marcador de seção, linha de corte, publicar, conjunto de folhas, lista de folhas, registro de desenhos, conjunto pdf, dwg por folha
from: 7271ac50
---

{{ui:Levels}} › {{ui:Section line}}: clique no início e no fim. As seções recebem os nomes A, B, C… (renomeie-as em Propriedades). Uma seção desenha, ao longo da sua linha:

- o terreno natural (tracejado) e o terreno proposto;
- muros com as suas sapatas, onde a linha os cruza;
- composições de pavimentos e de caminhos, e a cobertura morta e a terra vegetal das áreas plantadas (depois do recorte), pendurados abaixo da superfície acabada;
- degraus em perfil;
- plantas dentro da distância definida em relação à linha, como silhuetas em tamanho adulto.

Propriedades define essa distância e um exagero vertical. Na caixa de diálogo Folhas, **Seções** coloca as seções em folhas próprias, até quatro por folha, cada uma em uma escala padrão que caiba.

## O conjunto de publicação

{{ui:Publish set (.zip)}} na caixa de diálogo Folhas gera, em um único .zip:

- um PDF que abre com a **lista de folhas** e depois com todas as folhas de paisagismo, numeradas L-1, L-2… (plantio, terraplenagem, irrigação, detalhes, seções, planilhas);
- um **DWG por folha de planta**, com as camadas dessa folha (nomes `L-*` mantidos), e um DWG por desenho de seção.

Cada linha de seção na planta indica em qual folha está (`A / L-5`). O número é calculado a partir do conjunto a cada vez, então adicionar, remover ou renomear seções renumera tudo.
