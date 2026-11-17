---
title: Exportar o site 3D como USD
summary: Grave a vista 3D do site (superfícies, linhas, alinhamentos, tubos e pontos de levantamento) como USD, em escala real e nas coordenadas reais.
keywords: usd, usda, usdc, usdz, openusd, exportar, 3d, site, superfície, alinhamento, pontos de levantamento, coordenadas, montagem de cena
from: e7be08ec
---

Na vista 3D, {{ui:USD}} ao lado de {{ui:GLB}} e {{ui:OBJ}} grava o que a vista mostra como USD.

1. Abra a vista 3D e escolha o que mostrar.
2. Abra {{ui:USD}} e escolha {{ui:Texto (.usda)}}, {{ui:Binário (.usdc)}} ou {{ui:Pacote (.usdz)}}.

O arquivo está em escala real (o exagero vertical é removido), em metros, com Z para cima. O terreno fica nas coordenadas Leste e Norte e nas cotas do projeto, e indica o sistema de coordenadas quando o projeto tem um. Superfícies, tubos e estruturas são malhas com suas cores; curvas de nível, linhas de quebra e linhas de corredor são linhas; cada alinhamento é uma linha própria com seu nome; os pontos de levantamento mantêm os números.
