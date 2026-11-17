---
title: Exportar o site 3D como USD
summary: Escrever a vista 3D do site (superfícies, linhas, diretrizes, coletores e pontos topográficos) como USD, à escala real e com as coordenadas reais.
keywords: usd, usda, usdc, usdz, openusd, exportar, 3d, site, superfície, diretriz, pontos topográficos, coordenadas, montagem de cena
from: e7be08ec
---

Na vista 3D, {{ui:USD}} ao lado de {{ui:GLB}} e {{ui:OBJ}} escreve o que a vista mostra como USD.

1. Abra a vista 3D e escolha o que mostrar.
2. Abra {{ui:USD}} e escolha {{ui:Texto (.usda)}}, {{ui:Binário (.usdc)}} ou {{ui:Pacote (.usdz)}}.

O ficheiro está à escala real (o exagero vertical é desfeito), em metros, com Z para cima. O site fica nas suas coordenadas de este, norte e cotas do projeto, e indica o seu sistema de coordenadas quando o projeto tem um. As superfícies, os coletores e as estruturas são malhas com as respetivas cores; as curvas de nível, as linhas de quebra e as linhas de corredor são linhas; cada diretriz é uma linha própria com o seu nome; os pontos topográficos mantêm os seus números.
