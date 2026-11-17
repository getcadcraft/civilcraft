---
title: "Áreas plantadas: gramados, canteiros, prados, forração"
summary: Áreas plantadas como objetos com composição de camadas (terra vegetal, cobertura morta, manta, bordadura), uma mistura de plantas e um nível final opcional; elas se recortam ao redor de pavimentação, muros e degraus e fornecem área líquida, volumes, comprimento de bordadura e contagens de plantas.
keywords: área plantada, gramado, grama, canteiro, borda de canteiro, prado, forração, terra vegetal, cobertura morta, manta, manta antiervas, bordadura, nível final, quantitativos, área líquida, recorte
from: 2617ec0e
---

{{ui:Áreas}} no grupo Paisagismo desenha um **gramado**, um **canteiro plantado**, um **prado** ou uma **forração**: clique nos cantos e pressione {{key:Enter}}. Um canteiro ou forração começa preenchido com a planta escolhida na seção Plantas; um gramado não tem plantas.

## O que contém

- **Composição das camadas**: espessura da terra vegetal, da cobertura morta, uma manta antiervas e uma bordadura (aço, madeira, tijolo, concreto, plástico ou nenhuma). As espessuras típicas já vêm preenchidas; defina as suas.
- **Mistura**: espécies (com cultivar e tamanho) e parcelas, preenchidas como um canteiro no espaçamento ou densidade.
- **Cota final**: deixe vazio e a área segue o terreno; informe uma cota e a área se torna um modificador de terreno (veja [Modificadores de terreno e níveis](topic:ground-modifiers)).
- **Recortar ao redor de pavimentação, muros e degraus** (ligado por padrão): onde pavimentação, caminho, muro, meio-fio, rampa ou degraus se sobrepõem à área, essa parte fica de fora. Nenhuma planta é colocada sob eles nem a menos de meio espaçamento de sua borda.

## Quantidades

As Propriedades mostram a **área líquida** (após o recorte, medida exatamente), o perímetro, o **comprimento da bordadura** (somente ao longo da borda própria da área, não onde a pavimentação a corta), os volumes de terra vegetal e cobertura morta, a área da manta e as contagens de plantas por linha da mistura. A tabela de plantio conta as plantas da área; o arquivo de quantitativos para o TakeoffCraft recebe área, terra vegetal, cobertura morta, manta e bordadura; o IFC de paisagismo grava um IfcGeographicElement com um conjunto de quantidades.
