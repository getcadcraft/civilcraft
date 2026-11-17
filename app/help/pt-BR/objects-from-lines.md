---
title: Objetos a partir de linhas, mantidos vinculados
summary: Crie um pavimento, uma área plantada, um canteiro, uma sebe, um caminho, um muro, um meio-fio, degraus, uma rampa, uma plataforma, uma valeta ou uma linha de feição a partir de uma linha; ele acompanha a linha quando ela se move, até você romper o vínculo.
keywords: a partir de uma linha, linework, DWG, DXF, vínculo, vinculado, acompanhar, regenerar, romper vínculo, linha de feição, linha de feição a partir de linework, camada importada, contorno, supercad studio, linha de desenho
from: eb67a0c6
---

{{ui:From a line}} (Paisagismo › {{ui:More}}): clique em uma linha de feição, ou em uma linha ou contorno de uma camada importada de DWG/DXF. Uma linha fechada pode criar um pavimento, um gramado, um canteiro plantado, um campo, cobertura do solo, um canteiro ou uma plataforma; uma linha aberta, um caminho, um muro, um meio-fio, degraus (o primeiro e o último ponto), uma rampa, uma sebe ou uma valeta. Qualquer um dos dois tipos pode criar uma **linha de feição**, exceto uma própria linha de feição.

## Uma linha de feição a partir de uma linha

Uma linha de feição criada a partir de uma linha recebe os pontos dela, fechada se a linha era fechada. Suas cotas são lançadas sobre o terreno existente (0 onde ainda não há terreno), e o uso dela é **Desligado**: ela não molda o terreno até você escolher um uso e definir as cotas em suas Propriedades. Quando a linha se move, uma linha de feição com o mesmo número de pontos mantém cada cota que você definiu; quando a linha ganha ou perde pontos, as cotas são lançadas novamente sobre o terreno. Veja [Linhas de feição](topic:feature-lines).

O novo objeto mantém um **vínculo** com a sua linha. Quando a linha se move (você arrasta os pontos dela, ou o desenho é movido ou relido), o objeto assume a nova forma no mesmo passo de desfazer, e, pelos modificadores de terreno, o terreno projetado acompanha. Propriedades informa a que ele está vinculado; {{ui:Break link}} o torna livre.

As linhas são verificadas primeiro: uma linha precisa de pelo menos 2 pontos (3 para um contorno), no máximo 5000, com números reais; um contorno deve estar fechado e não pode se cruzar. Uma linha que falha não é usada: o objeto permanece como estava, e o painel Problemas informa o motivo. Se a linha for excluída, o objeto permanece e o painel Problemas registra isso.

## No SuperCad Studio

Abra o local e o desenho 2D no mesmo projeto. Escolha uma linha ou polilinha no desenho 2D, pressione Ctrl+K e execute {{ui:Landscape object from the picked drawing line}}: o CivilCraft pergunta o que criar, como acima, e o objeto permanece vinculado àquela linha do desenho. Depois de alterar linhas no desenho, Ctrl+K {{ui:Update the landscape from the drawing}} faz os objetos acompanharem, com um passo de desfazer para cada linha. O arquivo de vínculos do projeto registra qual objeto acompanha qual linha. A ajuda do próprio SuperCad Studio tem um tópico sobre Paisagismo.
