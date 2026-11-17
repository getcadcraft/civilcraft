---
title: Projetar um jardim, do início ao fim
summary: Os dez passos do arquiteto paisagista, do levantamento ao conjunto publicado, com o que a área de trabalho de paisagismo faz em cada um hoje e o que ainda não faz.
keywords: tutorial, passo a passo, como fazer, projeto de paisagismo, projeto de jardim, primeiros passos, exemplo, amostra, levantamento, linhas, terreno, plantio, tabela, folhas, publicar, um projeto
from: 87900bf5
---

Um projeto de paisagismo dá voltas: levantamento, croqui, linhas, terreno, áreas, níveis, plantio, tabelas, folhas, e depois volta de novo. Estes são os dez passos, com o que existe para cada um. Quando um passo tem uma lacuna, ela é indicada em **Ainda não implementado**, no final, e não escondida dentro do passo.

Você pode acompanhar no local de exemplo ou no seu próprio desenho de levantamento. Com o seu, comece pelo passo 1.

## 1. Trazer o levantamento

{{ui:Surface}} › {{ui:Linework from a drawing…}}, escolha o desenho de levantamento (DWG 2000–2018 ou DXF). Confira as unidades, pegue as curvas de nível, as polilinhas 3D e o contorno para a superfície, e os blocos de pontos como pontos de levantamento. A seção **Níveis do levantamento e verificação** lê os níveis escritos como texto ou como atributo e lista o que parece errado (unidades, sistema de coordenadas, distância da origem, curvas planas, níveis estranhos, pontos duplicados) antes de você adicionar qualquer coisa. Veja [Verificar um desenho de levantamento na importação](topic:survey-check) e [Abrir um DWG ou DXF como linhas](topic:open-dwg-dxf). Defina o sistema de coordenadas com {{ui:Coordinate system…}}.

## 2. Croquis à mão

Uma folha no papel, como um levantamento antigo ou uma cópia marcada, entra com {{ui:Scan…}} (Começar a partir de uma digitalização): ela é posicionada na escala ou em coordenadas conhecidas sob a planta, e pode ser traçada em linhas. O ModelCraft lê a foto de um croqui à mão (Arquivo › Importar foto de croqui…). O próprio CivilCraft não tem ferramenta para croqui à mão: posicione a folha sob a planta e desenhe por cima.

## 3. Do croqui às linhas

Desenhe linhas de feição e contornos sobre o levantamento no CivilCraft, ou desenhe-os no desenho 2D. Paisagismo › Mais › {{ui:From a line}} transforma uma linha em pavimento, área plantada, muro, degraus, linha de feição e mais, mantidos vinculados: mova a linha e o objeto acompanha. Veja [Objetos a partir das linhas](topic:objects-from-lines). No SuperCad Studio, abra o local, o desenho e o modelo do edifício em um único projeto: a área de trabalho **Paisagismo** tem as ferramentas de todos eles, e uma linha escolhida no desenho 2D pode virar um objeto de paisagismo que a acompanha (Ctrl+K, Objeto de paisagismo a partir da linha escolhida no desenho).

## 4. O terreno proposto

Abra {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. Construa o terreno proposto com {{ui:Platform}}, {{ui:Berm}}, {{ui:Swale}} e áreas de terraplenagem com cotas de nível e curvas de nível; o pavimento, os caminhos, os muros, as rampas e os degraus que você adicionar se ajustam à mesma superfície proposta. O terreno natural nunca muda. {{ui:Levels}} › {{ui:Ground modifiers…}} lista tudo o que modela o terreno em uma única ordem, com corte e aterro de cada um. Veja [Terraplenagem](topic:landscape-grading) e [Modificadores do terreno e níveis dinâmicos](topic:ground-modifiers).

## 5. Pavimentos e áreas plantadas

{{ui:Hardscape}} › {{ui:Paving}}, {{ui:Path}}, {{ui:Wall}}, {{ui:Kerb}}, {{ui:Ramp}} e {{ui:Steps}}. {{ui:Areas}} desenha um gramado, canteiro, prado ou cobertura do solo com a sua composição de camadas; ela se recorta sozinha ao redor de pavimentos, muros e degraus. {{ui:Bed}} preenche uma área no espaçamento das plantas, a partir de uma mistura de plantas. Veja [Elementos construídos](topic:hardscape), [Áreas plantadas](topic:planted-areas) e [Plantio](topic:planting).

## 6. Níveis, declividades e encontros

Em **Verificações de terraplenagem**, marque **Análise de declividade** e **Setas de fluxo e empoçamento**. Se a água empoçar contra um terraço, adicione um {{ui:Swale}} ao redor dele. As Propriedades informam quantos espelhos os degraus precisam e se cabem, e onde um caminho é mais íngreme que o seu limite. O painel de Problemas lista onde os objetos se encontram mal: um muro acima do topo, um canteiro acima do pavimento, degraus que não chegam ao patamar. {{ui:Spot level}} e {{ui:Gradient arrow}} identificam o terreno e se atualizam sozinhos.

## 7. Plantio

Em **Plantas**, pesquise na lista de plantas (algumas centenas de espécies, ou a sua própria lista), escolha uma e clique em {{ui:Plant}}, {{ui:Bed}} ou {{ui:Hedge}}. Defina o tamanho e os rótulos da planta em Mais. Mais › {{ui:Plant table}} edita os seus próprios registros: cultivares, tamanhos fornecidos, densidade, notas de especificação. Cada registro pode ter o seu próprio símbolo e modelo 3D (OBJ, STL ou GLB), e Mais › {{ui:Plant graphics}} desenha as plantas de forma mais simples em escalas menores. Veja [A lista de plantas](topic:plant-list), [Registros de plantas](topic:plant-records) e [Gráficos de plantas](topic:plant-graphics).

## 8. Quantitativos e tabelas

Mais › {{ui:Worksheets}}: as tabelas de plantas e de elementos construídos, e as suas, continuam vinculadas aos objetos; salve-as como CSV ou XLSX ou coloque-as nas folhas (veja [Planilhas](topic:worksheets)). Mais › {{ui:Plant schedule…}} envia as contagens ao TakeoffCraft. As quantidades de elementos construídos estão nas Propriedades de pavimento, muro e degraus. A irrigação tem a sua própria lista de materiais: {{ui:Irrigation}} › **Verificar o sistema…**. Veja [Irrigação](topic:irrigation).

## 9. Desenhos e folhas

Mais › {{ui:Landscape sheets…}}: plantas de plantio, de terraplenagem e de irrigação, com detalhes. {{ui:Levels}} › {{ui:Section line}} desenha seções pelo terreno, muros, composições de camadas, degraus e plantas. Veja [Folhas de paisagismo](topic:landscape-sheets) e [Seções de paisagismo e o conjunto de publicação](topic:landscape-sections).

## 10. Publicar

{{ui:Publish set (.zip)}} na caixa de diálogo de folhas gera um PDF com uma lista de folhas e um DWG por folha. Mais › {{ui:Export landscape IFC}} entrega ao BimCraft as plantas e os elementos construídos. Salve o projeto: tudo está em um único arquivo.

## Mude uma coisa: a escadaria

O objetivo de manter tudo em um projeto é que uma mudança se propague. Experimente com um lance de degraus entre dois terraços:

1. Desenhe a linha do lance como linha de feição (ou como linha no desenho) e depois clique em Paisagismo › Mais › {{ui:From a line}} › {{ui:Steps}}. Nas Propriedades dos degraus, marque **Modela o terreno** e defina os níveis inferior e superior como os dos dois terraços.
2. Desenhe um canteiro plantado ao lado e por baixo do lance com {{ui:Areas}}, e pavimento nos terraços. O canteiro se recorta sozinho ao redor dos degraus e do pavimento, e a tabela de plantio conta apenas o que está plantado.
3. Eleve o nível superior do lance nas Propriedades. O terreno proposto, as cotas de nível, as setas de declividade e o corte e aterro mudam de imediato. Se o lance não encontrar mais o terraço superior, o painel de Problemas diz por quanto.
4. Mova a linha do lance. Os degraus acompanham a sua linha no mesmo passo de desfazer; o canteiro se recorta de novo e é recontado, e as planilhas e tabelas mostram os novos números.
5. Pressione Ctrl+Z uma vez: a linha, os degraus, o terreno e o canteiro voltam juntos.

Veja [Modificadores do terreno e níveis dinâmicos](topic:ground-modifiers), [Áreas plantadas](topic:planted-areas) e [Planilhas](topic:worksheets).

## Ainda não implementado

Estes itens são pedidos e não estão nesta versão:

- Muros que modelam o terreno (eles informam onde encontram o terreno, e o topo pode acompanhá-lo).
- Editar a sua própria lista de plantas da Biblioteca no aplicativo (edite a lista do projeto e salve-a como arquivo de plantas).
- Texturas e cores dos seus próprios modelos GLB de plantas (a forma é lida; a cor da planta é usada).

Veja [A área de trabalho de paisagismo](topic:landscape) para todas as ferramentas.
