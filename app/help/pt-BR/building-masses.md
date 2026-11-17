---
title: Desenhar massas de edificação em um terreno
summary: Desenhe uma massa de edificação em um lote, dê a ela pavimentos e altura de pavimento, veja sua área bruta de pavimentos, escolha como ela se assenta em terreno inclinado, empurre e puxe sua altura em 3D, e envie-a ao BimCraft ou salve-a como arquivo IFC.
keywords: massa, massing, massa de edificação, volume, área de implantação, pavimentos, altura do pavimento, área bruta de pavimentos, GFA, declividade, embasamento, corte e aterro, empurrar puxar, 3D, estudo do terreno, anteprojeto, IFC, desenvolver, BimCraft, A-MASS
from: e5a67c16
---

Uma massa de edificação é uma área de implantação, um número de pavimentos e uma altura de pavimento: a pergunta inicial "quanta edificação cabe aqui, e o que ela faz com o terreno". As massas ficam no plano com o nome, o número de pavimentos e a área bruta de pavimentos, entram na plotagem em PDF e nas exportações DWG e DXF nas camadas `A-MASS` e `A-MASS-TEXT`, e são salvas no arquivo do projeto.

## Desenhe uma massa

1. Em **Propriedades**, em **Massas de edificação**, clique em **Desenhar uma massa**. (Também está no menu **Mais** da barra de ferramentas, ao lado de **Superfície**.)
2. Clique nos cantos da área de implantação. Um clique perto de um canto de lote ou de um ponto de levantamento pega o lugar exato desse ponto.
3. Clique no primeiro canto de novo, ou pressione {{key:Enter}}, para finalizar. {{key:Backspace}} desfaz o último canto; {{key:Esc}} interrompe.

Uma nova massa tem três pavimentos e altura de pavimento de 12 ft (3.6 m), e pertence ao lote onde cai o seu centro.

## Pavimentos, altura e área

Clique em uma massa para mudar o **Nome**, o **Uso**, os **Pavimentos**, a **Altura do pavimento** e o **Lote**. A **Altura** é pavimentos vezes altura do pavimento: digite uma altura e o número de pavimentos vira o inteiro mais próximo (nunca menos que um). **Área de implantação** e **Área bruta de pavimentos** (área de implantação vezes pavimentos) são calculadas para você.

## Em terreno inclinado

O terreno sob uma massa é lido da superfície: terreno natural, ou o terreno terraplenado onde você escolheu **Terreno proposto (terraplenado)**. **Em terreno inclinado** diz onde fica o pavimento térreo:

- **Em degraus**: na média do terreno sob a área de implantação. O lado baixo é aterrado até ela e o lado alto é cortado, e os dois ficam quase equilibrados.
- **Embasamento**: no terreno mais alto. Uma base sólida aterra o lado baixo.
- **Corte**: no terreno mais baixo. O lado alto é cortado para dentro do morro.

Propriedades mostra a faixa do terreno sob a massa, o **Nível do pavimento térreo**, e o volume de aterro e corte entre o terreno e esse nível. Um trecho da área de implantação que esteja fora da superfície fica de fora, e as Propriedades dizem quantos são.

## Na visualização 3D

As massas são desenhadas na visualização 3D do terreno, com uma linha em volta de cada pavimento e os nomes sobre o telhado. **Mostrar** tem uma caixa de seleção para **Massas de edificação**. Clique em uma para selecioná-la. Com uma massa selecionada:

- arraste o telhado dela para cima ou para baixo para empurrá-la ou puxá-la um pavimento por vez, ou pressione {{key:PageUp}} e {{key:PageDown}};
- o movimento inteiro é um único passo de desfazer.

A visualização de rua de **Percurso** também vê as massas, e **Sol** projeta as sombras delas no terreno.

## Envie adiante

- **Massas como IFC** salva cada massa como um arquivo IFC4: um terreno, uma edificação com os seus pavimentos, e a massa como elemento da edificação com os seus números no conjunto de propriedades `CadCraft_SiteMass`. Com um sistema de coordenadas definido no projeto, o arquivo é posicionado no mapa e carrega a latitude e a longitude do terreno; sem ele, nada diz onde ele está.
- **Desenvolver no BimCraft** abre o BimCraft em uma nova guia com as massas. Lá, ao escolher uma massa, aparecem os números dela e **Desenvolver esta massa**, que constrói paredes em cada nível e uma laje sob a edificação a partir da área de implantação, em um único passo de desfazer. Nada é enviado: o arquivo passa entre as duas guias deste navegador.

Veja também **Limites de zoneamento** e **Horas de sol**.
