---
title: Exportar a planta para DXF
summary: Escrever os traçados da planta como DXF R12, em camadas com nome, com as curvas de nível às suas cotas e as linhas de quebra em 3D, para qualquer programa CAD.
keywords: dxf, dwg, cad, exportar, traçados, r12, 2000, 2004, 2007, 2010, 2013, 2018, camadas, curvas de nível, troca de desenhos, mapa de fundo, fundo
from: f2d8ede9
---

{{ui:DXF}} escreve o que a planta mostra num ficheiro DXF no formato R12, a versão que qualquer programa CAD abre. Se já usou o AutoCAD ou o Civil 3D, abra-o ou insira-o da mesma forma que faria com qualquer DXF.

## Exportar

1. Prepare a planta como pretende o desenho: em **Visualização**, escolha a superfície (existente ou proposta), o intervalo das curvas de nível e os elementos que ficam ativos (curvas de nível, etiquetas, pontos, etiquetas de pontos, triângulos, linhas de quebra, bordo da superfície, coletores, setas de talude).
2. Clique em {{ui:DWG/DXF}} no grupo **Exportar** e escolha {{ui:DXF (R12, texto): o ficheiro de troca simples}}, e depois {{ui:Transferir}}.
3. O navegador transfere `<name>.dxf`. A barra de estado indica, por exemplo, "Exportado DXF R12: 2,140 objetos; etiquetas dimensionadas para 1" = 40'. As bandas não são exportadas."

As coordenadas são escritas nas unidades do projeto, com os seus valores reais (as coordenadas state plane mantêm-se como estão). Nada é escalado nem deslocado.

## O que está no ficheiro

| Elemento | Entidade DXF | Camada |
|---|---|---|
| Curvas de nível secundárias e principais | Polilinhas 2D à sua cota | C-TOPO-MINR, C-TOPO-MAJR |
| Etiquetas das curvas de nível | Texto | C-TOPO-TEXT |
| Triângulos | Polilinhas | C-TOPO-TINN |
| Linhas de quebra e limite | Polilinhas 3D | C-TOPO-BRKL |
| Bordo da superfície | Polilinhas | C-TOPO-BNDY |
| Setas de talude | Polilinhas | C-TOPO-SLOP |
| Pontos do levantamento e as suas etiquetas | Pontos (com cota), texto | V-NODE, V-NODE-TEXT |
| Linhas a partir dos códigos de linha | Polilinhas 3D | V-NODE-LINE |
| Eixos das diretrizes | Linhas e arcos | C-ROAD-CNTR |
| Marcas de PK e etiquetas | Polilinhas, texto | C-ROAD-STAN |
| Bordos do corredor | Polilinhas | C-ROAD-CORR |
| Linhas de amostragem | Polilinhas | C-ROAD-SCTN |
| Plataformas, linhas de intersecção do talude, linhas de talude | Polilinhas | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Linhas características | Polilinhas 3D (arcos em troços dentro de 0.01; ver [Linhas características](topic:feature-lines)) | C-GRAD-FEAT |
| Trajetórias de manobra | Polilinhas, texto | C-ROAD-SWPT |
| Coletores, órgãos e etiquetas | Polilinhas, texto | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Coletores e órgãos com problemas | Polilinhas | C-STRM-PROB |

Cada camada tem uma cor. A lista completa está em [Camadas da planta](topic:plan-layers).

## Tamanho das etiquetas

O texto tem de ter um tamanho em unidades de desenho. O CivilCraft dimensiona as etiquetas para a escala à qual a planta inteira cabe numa folha Tabloid (pés) ou numa folha A3 (metros), e indica essa escala na mensagem de estado. Se fizer a impressão a outra escala no programa CAD, redimensione o texto aí.

## O que não é exportado

- Bandas de cotas (apenas no ecrã).
- A vista de perfil. Os perfis são exportados como LandXML, não como desenho.
- A própria superfície como objeto 3D. Use LandXML para a TIN, ou ative {{ui:Triangles}} para obter as arestas dela como traçados.
- Qualquer item que tenha sido desativado em **Visualização**.

## DWG

{{ui:DWG/DXF}} escreve os mesmos traçados também como desenho DWG. A caixa de diálogo pede o formato: DXF, ou um DWG de 2000, 2004, 2007, 2010, 2013 ou 2018. O 2000 abre em quase todos os programas CAD, antigos e recentes; escolha uma versão mais recente quando quem receber o desenho o pedir. A escolha fica guardada neste navegador.

1. Clique em {{ui:DWG}} no grupo **Exportar**.
2. Escolha o **Formato** e clique em **Transferir DWG**.
3. O navegador transfere `<name>.dwg`. A barra de estado indica o que foi incluído, por exemplo "Exportado DWG (formato 2018): 12 polilinhas, 40 etiquetas em 9 camadas".

O DWG tem as mesmas camadas, cores, curvas de nível (como polilinhas à sua cota), linhas de quebra 3D, etiquetas e pontos do DXF, nas mesmas coordenadas. Os nomes de camadas que um DWG não aceita são alterados, e a mensagem de estado indica-o. O CivilCraft escreve o DWG com código próprio, por isso nada sai do computador.

### Camadas de mapa no DWG

Um desenho DWG não pode conter uma imagem no próprio desenho: os programas CAD mostram uma imagem colocada ao lado do desenho. Quando as camadas de mapa estão a ser mostradas, a caixa de diálogo oferece **Camadas de mapa como imagem ao lado do desenho**. Com essa opção marcada, a transferência é um `.zip` com `<name>.dwg`, `<name>-map.png` (as camadas de mapa sobre o desenho inteiro, até 4,096 pixels de largura) e `<name>-map.pgw` (o ficheiro de georreferenciação, para programas GIS). O desenho mostra a imagem como uma imagem na camada G-MAP-IMAG, na posição correta. Extraia os ficheiros para uma pasta e mantenha-os juntos.
