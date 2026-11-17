---
title: Áreas plantadas: relvados, canteiros, prados, cobertura do solo
summary: Áreas plantadas como objetos com uma composição (terra vegetal, cobertura morta, membrana, rebordo), uma mistura de plantas e um nível acabado opcional; recortam-se automaticamente à volta de pavimentos, muros e escadas, e dão área líquida, volumes, comprimento de rebordo e contagens de plantas.
keywords: área plantada, relvado, relva, canteiro, bordadura, prado, cobertura do solo, terra vegetal, cobertura morta, membrana, manta antiervas, rebordo, nível acabado, quantidades, área líquida, recorte
from: 2617ec0e
---

{{ui:Areas}} no grupo Paisagismo desenha um **relvado**, um **canteiro plantado**, um **prado** ou uma **cobertura do solo**: clique nos seus cantos e prima {{key:Enter}}. Um canteiro ou uma cobertura começa preenchido com a planta escolhida na secção Plantas; um relvado não tem plantas.

## O que contém

- **Composição**: profundidade de terra vegetal, profundidade de cobertura morta, uma membrana antiervas e um rebordo (aço, madeira, tijolo, betão, plástico ou nenhum). As profundidades típicas estão preenchidas; defina as suas.
- **Mistura**: espécies (com cultivar e tamanho) e percentagens, preenchidas como um canteiro ao espaçamento ou à densidade.
- **Nível acabado**: deixe vazio e a área segue o terreno; indique um nível e a área torna-se um modificador do terreno (ver [Modificadores do terreno e níveis](topic:ground-modifiers)).
- **Recortar à volta de pavimentos, muros e escadas** (ativo por defeito): onde pavimento, caminho, muro, lancil, rampa ou escadas se sobrepõem à área, essa parte fica de fora. Nenhuma planta é colocada sob eles nem a menos de meio espaçamento da sua extremidade.

## Quantidades

**Propriedades** mostra a **área líquida** (depois do recorte, medida com exatidão), o perímetro, o **comprimento do rebordo** (apenas ao longo do próprio bordo da área, não onde o pavimento a corta), os volumes de terra vegetal e de cobertura morta, a área da membrana e as contagens de plantas por linha de mistura. O mapa de plantação conta as plantas da área; o ficheiro de quantidades para a TakeoffCraft recebe a área, a terra vegetal, a cobertura morta, a membrana e o rebordo; o IFC de paisagismo escreve um IfcGeographicElement com um conjunto de quantidades.
