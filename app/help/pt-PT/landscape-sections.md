---
title: Cortes de paisagismo e conjunto de publicação
summary: Linhas de corte que atravessam o terreno existente e o terreno projetado, muros com fundações, camadas de pavimentos e de áreas plantadas, degraus e plantas à dimensão adulta, em folhas próprias; um conjunto de publicação com uma lista de folhas, um PDF e um DWG por folha.
keywords: corte, corte transversal, alçado, marcador de corte, linha de corte, publicar, conjunto de folhas, lista de folhas, registo de desenhos, conjunto PDF, DWG por folha
from: 7271ac50
---

{{ui:Cotas}} › {{ui:Linha de corte}}: clique no início e no fim. Os cortes recebem os nomes A, B, C… (renomeie-os nas Propriedades). Um corte desenha, ao longo da sua linha:

- o terreno existente (a tracejado) e o terreno projetado;
- os muros com as respetivas fundações, onde a linha os atravessa;
- as camadas de pavimentos e de caminhos, e a cobertura morta e a terra vegetal das áreas plantadas (após o recorte), suspensas abaixo da superfície acabada;
- os degraus em perfil;
- as plantas dentro da distância definida da linha, como silhuetas à dimensão adulta.

As Propriedades definem essa distância e um exagero vertical. Na caixa de diálogo Folhas, **Cortes** coloca-os em folhas próprias, até quatro por folha, cada um a uma escala padrão que se adequa.

## O conjunto de publicação

O {{ui:Publicar conjunto (.zip)}} na caixa de diálogo Folhas cria, num único .zip:

- um PDF que abre com a **lista de folhas** e depois todas as folhas de paisagismo, numeradas L-1, L-2… (plantação, modelação do terreno, rega, pormenores, cortes, folhas de cálculo);
- um **DWG por folha de planta** com as camadas dessa folha (os nomes `L-*` mantêm-se) e um DWG por desenho de corte.

Cada linha de corte na planta indica a folha em que está (`A / L-5`); o número é calculado a partir do conjunto de cada vez, pelo que adicionar, remover ou renomear cortes altera a numeração.
