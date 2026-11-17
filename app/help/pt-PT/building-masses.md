---
title: Desenhar volumes de edifício num local
summary: Desenhar um volume de edifício num lote, dar-lhe pisos e altura de piso, ver a área bruta de pavimento, escolher como assenta em terreno inclinado, empurrar e puxar a altura em 3D, e enviá-lo para o BimCraft ou guardá-lo como ficheiro IFC.
keywords: volumetria, massa, volume de edifício, volume, pegada, pisos, altura de piso, área bruta de pavimento, ABP, declive, embasamento, escavação, aterro, empurrar, puxar, 3D, estudo de local, projeto inicial, IFC, desenvolver, BimCraft, A-MASS
from: e5a67c16
---

Um volume de edifício é uma pegada, um número de pisos e uma altura de piso: a pergunta inicial de «quanto edifício cabe aqui, e o que isso faz ao terreno». Os volumes ficam no plano com o nome, o número de pisos e a área bruta de pavimento, entram no PDF e nas exportações DWG e DXF nas camadas `A-MASS` e `A-MASS-TEXT`, e ficam guardados no ficheiro do projeto.

## Desenhar um volume

1. Em **Propriedades**, em **Volumes de edifício**, clique em **Desenhar um volume**. (Também está no menu **Mais** da barra de ferramentas, ao lado de **Superfície**.)
2. Clique nos cantos da pegada. Um clique perto de um canto de lote ou de um ponto de levantamento toma a posição exata desse ponto.
3. Clique de novo no primeiro canto, ou prima {{key:Enter}}, para terminar. {{key:Backspace}} retira o último canto; {{key:Esc}} interrompe.

Um volume novo tem três pisos e uma altura de piso de 12 ft (3.6 m), e pertence ao lote onde cai o centro dele.

## Pisos, altura e área

Clique num volume para alterar o **Nome**, a **Utilização**, os **Pisos**, a **Altura de piso** e o **Lote**. A **Altura** é os pisos vezes a altura de piso: escreva uma altura e o número de pisos passa para o número inteiro mais próximo (nunca menos de um). A **Pegada** e a **Área bruta de pavimento** (pegada vezes pisos) são calculadas automaticamente.

## Em terreno inclinado

O terreno sob um volume é lido da superfície: o terreno existente, ou o terreno regularizado quando escolheu **Terreno proposto (regularizado)**. **Em terreno inclinado** indica onde fica o piso térreo:

- **Escalonado**: à cota média do terreno sob a pegada. O lado baixo é aterrado até essa cota e o lado alto escavado, e os dois aproximam-se de um equilíbrio.
- **Embasamento**: à cota mais alta do terreno. Uma base maciça aterra o lado baixo.
- **Escavado**: à cota mais baixa do terreno. O lado alto é escavado para dentro da colina.

Propriedades mostra a amplitude do terreno sob o volume, o **Nível do piso térreo** e o volume de aterro e escavação entre o terreno e esse nível. Um ponto da pegada que fique fora da superfície é deixado de fora, e as Propriedades indicam quantos.

## Na vista 3D

Os volumes são desenhados na vista 3D do local, com uma linha em volta de cada piso e os respetivos nomes sobre a cobertura. **Mostrar** tem uma caixa de verificação para **Volumes de edifício**. Clique num para o selecionar. Com um volume selecionado:

- arraste a cobertura para cima ou para baixo para empurrar ou puxar um piso de cada vez, ou prima {{key:PageUp}} e {{key:PageDown}};
- o movimento completo é um único passo de anulação.

A vista de rua de **Conduzir** também vê os volumes, e **Sol** projeta as sombras no terreno.

## Enviar

- **Volumes como IFC** guarda cada volume como um ficheiro IFC4: um local, um edifício com os seus pisos, e o volume como elemento de edifício com os números no conjunto de propriedades `CadCraft_SiteMass`. Com um sistema de coordenadas definido no projeto, o ficheiro fica colocado no mapa e leva a latitude e a longitude do local; sem ele, não diz nada sobre onde está.
- **Desenvolver no BimCraft** abre o BimCraft num novo separador com os volumes. Ali, ao escolher um volume, aparecem os seus números e **Desenvolver este volume**, que constrói paredes em cada nível e uma laje sob o edifício a partir da pegada, num único passo de anulação. Nada é carregado para nenhum servidor: o ficheiro passa entre os dois separadores deste navegador.

Ver também **Limites de zonamento** e **Horas de sol**.
