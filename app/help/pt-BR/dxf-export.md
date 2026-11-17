---
title: Exportar a planta para DXF
summary: Grave o traçado da planta como um DXF R12 em camadas nomeadas, com as curvas de nível nas suas elevações e as linhas de quebra em 3D, para qualquer programa CAD.
keywords: dxf, dwg, cad, exportação, linhas de desenho, r12, 2000, 2004, 2007, 2010, 2013, 2018, camadas, curvas de nível, troca de desenho, mapa base, plano de fundo
from: f2d8ede9
---

{{ui:DXF}} grava o que a planta mostra como um arquivo DXF no formato R12, a versão que todo programa CAD abre. Se você já usou AutoCAD ou Civil 3D, abra ou insira o arquivo como faria com qualquer DXF.

## Exportar

1. Configure a planta do jeito que você quer o desenho: em **Exibição**, escolha a superfície (existente ou proposta), o intervalo das curvas de nível e quais itens estão ligados (curvas de nível, rótulos, pontos, rótulos de ponto, triângulos, linhas de quebra, borda da superfície, tubos, setas de declividade).
2. Clique em {{ui:DWG/DXF}} no grupo **Exportar** e escolha {{ui:DXF (R12, texto): o arquivo de troca simples}}, depois {{ui:Baixar}}.
3. O navegador baixa `<name>.dxf`. A barra de status informa, por exemplo, "Exportado DXF R12: 2,140 objetos; rótulos dimensionados para 1" = 40'. Faixas não são exportadas."

As coordenadas são gravadas nas unidades do projeto, com seus valores reais (coordenadas State Plane permanecem como estão). Nada é escalado nem movido.

## O que há no arquivo

| Item | Entidade DXF | Camada |
|---|---|---|
| Curvas de nível intermediárias e mestras | Polilinhas 2D na sua elevação | C-TOPO-MINR, C-TOPO-MAJR |
| Rótulos das curvas de nível | Texto | C-TOPO-TEXT |
| Triângulos | Polilinhas | C-TOPO-TINN |
| Linhas de quebra e limite | Polilinhas 3D | C-TOPO-BRKL |
| Borda da superfície | Polilinhas | C-TOPO-BNDY |
| Setas de declividade | Polilinhas | C-TOPO-SLOP |
| Pontos de levantamento e seus rótulos | Pontos (com elevação), texto | V-NODE, V-NODE-TEXT |
| Linhas dos códigos de linha | Polilinhas 3D | V-NODE-LINE |
| Eixos do alinhamento | Linhas e arcos | C-ROAD-CNTR |
| Marcas e rótulos de estaqueamento | Polilinhas, texto | C-ROAD-STAN |
| Bordas do corredor | Polilinhas | C-ROAD-CORR |
| Linhas de amostragem | Polilinhas | C-ROAD-SCTN |
| Plataformas, linhas de pé de talude, linhas de declividade | Polilinhas | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Linhas de feição | Polilinhas 3D (arcos como trechos dentro de 0.01; veja [Linhas de feição](topic:feature-lines)) | C-GRAD-FEAT |
| Trajetórias de varredura | Polilinhas, texto | C-ROAD-SWPT |
| Tubos, estruturas, rótulos | Polilinhas, texto | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Tubos e estruturas com problemas | Polilinhas | C-STRM-PROB |

Cada camada tem uma cor. A lista completa está em [Camadas da planta](topic:plan-layers).

## Tamanho dos rótulos

O texto precisa ter um tamanho nas unidades do desenho. O CivilCraft dimensiona os rótulos para a escala em que a planta inteira cabe em uma folha Tabloid (pés) ou A3 (metros), e informa a escala na mensagem de status. Se você plotar em outra escala no seu programa CAD, escale o texto ali.

## O que não é exportado

- Faixas de elevação (somente na tela).
- A vista de perfil. Os perfis são enviados como LandXML, não como desenho.
- A própria superfície como objeto 3D. Use LandXML para a TIN, ou ative {{ui:Triângulos}} para obter as arestas dela como linhas.
- Qualquer item que você desativou em **Exibição**.

## DWG

{{ui:DWG/DXF}} também grava as mesmas linhas como um desenho DWG. A caixa de diálogo pede o formato: DXF, ou um DWG de 2000, 2004, 2007, 2010, 2013 ou 2018. O formato 2000 abre em quase todos os programas CAD, antigos e novos; escolha um mais recente quando quem receber o desenho pedir. Sua escolha fica lembrada neste navegador.

1. Clique em {{ui:DWG}} no grupo **Exportar**.
2. Escolha o **Formato** e clique em **Baixar DWG**.
3. O navegador baixa `<name>.dwg`. A barra de status informa o que foi incluído, por exemplo "Exportado DWG (formato 2018): 12 polilinhas, 40 rótulos em 9 camadas".

O DWG tem as mesmas camadas, cores, curvas de nível (como polilinhas na sua elevação), linhas de quebra 3D, rótulos e pontos do DXF, nas mesmas coordenadas. Nomes de camada que um DWG não aceita são alterados, e a mensagem de status informa isso. O CivilCraft grava DWG com código próprio, então nada sai do seu computador.

### Camadas de mapa no DWG

Um desenho DWG não pode conter uma imagem dentro dele: os programas CAD mostram uma imagem ao lado do desenho. Quando as camadas de mapa estão visíveis, a caixa de diálogo oferece **Camadas de mapa como uma imagem ao lado do desenho**. Com essa opção marcada, o download é um `.zip` contendo `<name>.dwg`, `<name>-map.png` (as camadas de mapa sobre todo o desenho, com até 4,096 pixels de largura) e `<name>-map.pgw` (seu arquivo de mundo, para programas GIS). O desenho mostra a imagem como uma figura na camada G-MAP-IMAG, no lugar. Descompacte os arquivos em uma mesma pasta e mantenha-os juntos.
