---
title: Desenhar um jardim, do início ao fim
summary: Os dez passos do arquiteto paisagista, desde o levantamento até ao conjunto publicado, com o que a área de trabalho Paisagismo faz hoje em cada um e o que ainda não faz.
keywords: tutorial, passo a passo, como fazer, desenho paisagístico, desenho de jardins, primeiros passos, exemplo, amostra, por etapas, levantamento, linhas, terreno, plantação, mapa, folhas, publicar, um projeto
from: 87900bf5
---

Um projeto de paisagismo é cíclico: levantamento, esboço, linhas, terreno, áreas, cotas, plantação, mapas, folhas, e volta ao início. Estes são os dez passos, com o que existe para cada um. Quando um passo tem uma lacuna, ela é indicada em **Ainda não implementado** no fim, e não escondida no passo.

Pode acompanhar no terreno de exemplo ou no seu próprio desenho de levantamento. Com o seu, comece no passo 1.

## 1. Trazer o levantamento

{{ui:Superfície}} › {{ui:Linhas de um desenho…}}, escolha o desenho de levantamento (DWG 2000–2018 ou DXF). Verifique as unidades, use as curvas de nível, as polilinhas 3D e o limite para a superfície, e os blocos de pontos como pontos de levantamento. A secção **Cotas do levantamento e verificação** lê as cotas escritas como texto ou como atributo e lista o que parece errado (unidades, sistema de coordenadas, distância à origem, curvas de nível planas, cotas estranhas, pontos duplicados) antes de adicionar nada. Veja [Verificar um desenho de levantamento ao importar](topic:survey-check) e [Abrir um DWG ou DXF como linhas](topic:open-dwg-dxf). Defina o sistema de coordenadas com {{ui:Sistema de coordenadas…}}.

## 2. Esboços à mão

Uma folha em papel, como um levantamento antigo ou uma cópia com anotações, entra com {{ui:Digitalizar…}} (Começar a partir de uma digitalização): é colocada à escala ou em coordenadas conhecidas por baixo da planta, e pode ser decalcada em linhas. O ModelCraft lê uma fotografia de um esboço à mão (Ficheiro › Importar uma fotografia de esboço…). O próprio CivilCraft não tem uma ferramenta para esboços à mão: coloque a folha por baixo da planta e desenhe por cima dela.

## 3. Do esboço às linhas

Desenhe linhas características e contornos sobre o levantamento no CivilCraft, ou desenhe-os no desenho 2D. Paisagismo › {{ui:Mais}} › {{ui:A partir de uma linha}} transforma uma linha em pavimento, área plantada, muro, degraus, linha característica e mais, mantida ligada: mova a linha e o objeto acompanha-a. Veja [Objetos a partir de linhas](topic:objects-from-lines). No SuperCad Studio, abra o terreno, o desenho e o modelo do edifício num só projeto: a área de trabalho Paisagismo tem as ferramentas de todos eles, e uma linha escolhida no desenho 2D pode tornar-se um objeto de paisagismo que a acompanha (Ctrl+K, {{ui:Objeto de paisagismo a partir da linha escolhida no desenho}}).

## 4. O terreno projetado

Abra {{ui:Superfície}} › {{ui:Mais}} › {{ui:Área de trabalho Paisagismo}}. Construa o terreno projetado com {{ui:Plataforma}}, {{ui:Talude de terra}}, {{ui:Vala de drenagem}} e áreas de modelação com cotas pontuais e curvas de nível; o pavimento, os caminhos, os muros, as rampas e os degraus que adicionar moldam-se na mesma superfície projetada. O terreno existente nunca muda. {{ui:Cotas}} › {{ui:Modificadores do terreno…}} lista tudo o que molda o terreno por uma ordem, com o corte e o aterro de cada um. Veja [Modelação](topic:landscape-grading) e [Modificadores do terreno e cotas dinâmicas](topic:ground-modifiers).

## 5. Pavimentos e áreas plantadas

{{ui:Pavimentos e muros}} › {{ui:Pavimento}}, {{ui:Caminho}}, {{ui:Muro}}, {{ui:Lancil}}, {{ui:Rampa}} e {{ui:Degraus}}. {{ui:Áreas}} desenha um relvado, canteiro, prado ou cobertura vegetal com a respetiva camada; recorta-se sozinha à volta de pavimentos, muros e degraus. {{ui:Canteiro}} preenche uma área ao espaçamento das plantas, a partir de uma mistura de plantas. Veja [Pavimentos e muros](topic:hardscape), [Áreas plantadas](topic:planted-areas) e [Plantação](topic:planting).

## 6. Cotas, declives e junções

Em **Verificações de modelação**, marque **Análise de declives** e **Setas de escoamento e acumulação de água**. Se a água se acumular contra um patamar, adicione uma {{ui:Vala de drenagem}} à volta dele. As Propriedades indicam quantos espelhos os degraus precisam e se cabem, e onde um caminho é mais inclinado do que o seu limite. O painel Problemas lista onde os objetos se encontram mal: um muro demasiado alto, um canteiro acima do pavimento, degraus que não chegam ao patamar. {{ui:Cota pontual}} e {{ui:Seta de inclinação}} rotulam o terreno e atualizam-se sozinhas.

## 7. Plantação

Em **Plantas**, pesquise a lista de plantas (algumas centenas de espécies, ou a sua própria lista), escolha uma e depois {{ui:Planta}}, {{ui:Canteiro}} ou {{ui:Sebe}}. Defina o tamanho e as etiquetas da planta em Mais. Em Mais › {{ui:Tabela de plantas}} edite os seus registos: cultivares, tamanhos fornecidos, densidade, notas de especificação. Cada registo pode ter o seu próprio símbolo e modelo 3D (OBJ, STL ou GLB), e Mais › {{ui:Gráficos de plantas}} desenha as plantas de forma mais simples nas escalas menores. Veja [A lista de plantas](topic:plant-list), [Registos de plantas](topic:plant-records) e [Gráficos de plantas](topic:plant-graphics).

## 8. Quantidades e mapas

Mais › {{ui:Folhas de cálculo}}: os mapas de plantas e de pavimentos, e os seus próprios, ficam ligados aos objetos; guarde-os em CSV ou XLSX ou coloque-os nas folhas (veja [Folhas de cálculo](topic:worksheets)). Mais › {{ui:Mapa de plantação…}} envia as contagens para o TakeoffCraft. As quantidades de pavimentos e muros estão nas Propriedades de pavimento, muro e degraus. A rega tem a sua própria lista de materiais: {{ui:Rega}} › **Verificar o sistema…**. Veja [Rega](topic:irrigation).

## 9. Desenhos e folhas

Mais › {{ui:Folhas de paisagismo…}}: plantas de plantação, de modelação e de rega, com pormenores. {{ui:Cotas}} › {{ui:Linha de corte}} desenha cortes pelo terreno, muros, camadas, degraus e plantas. Veja [Folhas de paisagismo](topic:landscape-sheets) e [Cortes e conjunto de publicação](topic:landscape-sections).

## 10. Publicar

{{ui:Publicar conjunto (.zip)}} na caixa de diálogo Folhas cria um PDF com uma lista de folhas e um DWG por folha. Mais › {{ui:Exportar IFC de paisagismo}} entrega ao BimCraft as plantas e os pavimentos e muros. Guarde o projeto: tudo fica num só ficheiro.

## Altere uma coisa: a escadaria

A vantagem de manter tudo num só projeto é que uma alteração se propaga. Experimente com um lanço de degraus entre dois terraços:

1. Desenhe a linha do lanço como linha característica (ou como linha no desenho) e depois Paisagismo › {{ui:Mais}} › {{ui:A partir de uma linha}} › {{ui:Degraus}}. Nas Propriedades dos degraus, marque **Molda o terreno** e defina as cotas inferior e superior nos dois terraços.
2. Desenhe um canteiro plantado ao lado e por baixo do lanço com {{ui:Áreas}}, e pavimento nos terraços. O canteiro recorta-se sozinho à volta dos degraus e do pavimento, e o mapa de plantação conta apenas o que está plantado.
3. Eleve a cota superior do lanço nas Propriedades. O terreno projetado, as cotas pontuais, as setas de inclinação e o corte e aterro alteram-se de imediato. Se o lanço deixar de encontrar o terraço superior, o painel Problemas indica em quanto.
4. Mova a linha do lanço. Os degraus seguem a sua linha no mesmo passo de anulação; o canteiro recorta-se de novo e é recontado, e as folhas de cálculo e os mapas mostram os novos números.
5. Prima Ctrl+Z uma vez: a linha, os degraus, o terreno e o canteiro voltam atrás em conjunto.

Veja [Modificadores do terreno e cotas dinâmicas](topic:ground-modifiers), [Áreas plantadas](topic:planted-areas) e [Folhas de cálculo](topic:worksheets).

## Ainda não implementado

Estas funcionalidades são pedidas, mas não existem nesta versão:

- Muros que moldam o terreno (indicam onde o encontram, e a sua parte superior pode acompanhá-lo).
- Edição da sua própria lista de plantas da Biblioteca na aplicação (edite a lista do projeto e guarde-a como ficheiro de plantas).
- Texturas e cores dos seus próprios modelos de plantas GLB (a forma é lida; usa-se a cor da planta).

Veja [A área de trabalho Paisagismo](topic:landscape) para todas as ferramentas.
