---
title: Secções transversais e linhas de amostragem
summary: Corte secções perpendiculares a uma diretriz, veja o terreno, o projeto, e a escavação e o aterro em cada estaca, e obtenha volumes pelo método das áreas médias das extremidades.
keywords: diagrama de Brückner, diagrama de massas, ponto de equilíbrio, retração, expansão, distância de transporte, empréstimo, bota-fora, folhas de secções, folhas de perfis transversais, pdf de secções, secções, perfis transversais, linhas de amostragem, vista de secção, escavação, aterro, áreas, área média das extremidades, volumes por extremidades, movimentos de terras, estaca, afastamento, csv
from: 09639ce2
---

Um perfil transversal mostra a estrada tal como será construída: perpendicularmente à diretriz numa estaca, o terreno existente, o projeto (o corredor ou a plataforma modelados) e a escavação e o aterro entre eles.

## Adicionar linhas de amostragem

1. Selecione uma diretriz. Em **Propriedades**, em **Linhas de amostragem**, clique em {{ui:Acrescentar linhas de amostragem}}.
2. Defina **Cada** (o espaçamento: 50 ft ou 20 m inicialmente), **Largura esquerda** e **Largura direita** (até onde cada secção chega a partir do eixo).
3. Para cortar uma secção numa estaca específica, escreva-a em **Adicionar uma estaca** (por exemplo `2+35`) e prima {{key:Enter}}.

As secções são cortadas em cada múltiplo inteiro do espaçamento, nas duas extremidades da diretriz, no início e no fim de cada curva (PC e PT), e nas estacas que acrescentar. As linhas de amostragem aparecem na planta como linhas cinzentas que atravessam a diretriz; também seguem para DXF, DWG e PDF na camada C-ROAD-SCTN. Cada alteração é um passo: {{key:Mod+Z}} anula-o.

## A vista de secção

Abra-a com {{ui:Vista de secção}} nas **Propriedades** da diretriz, {{ui:Perfis}} em **Superfície** › {{ui:Mais}}, ou {{key:X}}. Ocupa o lugar da vista do perfil sob a planta.

- Percorra as secções com as setas na sua barra, na lista de estacas, ou com {{key:Left}} e {{key:Right}} com a vista de secção focada ({{key:Home}} e {{key:End}} para a primeira e a última).
- A linha cinzenta é o terreno existente, a vermelha o projeto. A escavação é sombreada a laranja, o aterro a verde. Os pontos do corredor são assinalados: CL (eixo), EOP (bordo da faixa de rodagem), SH (berma) e DL (intersecção do talude).
- O cabeçalho indica a estaca, as áreas de escavação e aterro desta secção e o exagero vertical. **Ajustar** preenche o painel; escolha 1× para ver a secção à escala real.
- A linha grossa na planta mostra qual a secção que está no ecrã.
- **Zoom e deslocação:** a roda amplia em torno do cursor, e arrastar desloca a vista. {{ui:Ajustar}} (ou {{key:F}}, ou um duplo clique) volta a ajustar a secção completa.

## Medir numa secção

1. Clique em {{ui:Medir}} na barra da secção, ou prima {{key:M}}. A indicação diz "Clique no primeiro ponto e depois no segundo."
2. Clique em dois pontos. Cada um encaixa no fim de uma linha ou num ponto do corredor (CL, EOP, SH, DL); mantenha {{key:Alt}} premido para um ponto livre.
3. A leitura indica a distância horizontal (ΔH), a distância vertical (ΔV), o declive em percentagem com a sua razão, e o comprimento reto, nas unidades do projeto.

Clique de novo para iniciar uma nova medição. {{key:Esc}} limpa-a, e {{key:M}} desativa Medir.

## Folhas de secções

{{ui:Folhas de perfis (PDF)}} em **Linhas de amostragem** coloca cada secção em páginas PDF, em linhas da esquerda para a direita e de cima para baixo, por ordem de estaca. Escolha o **Papel**, a **Escala em planta** (a escala horizontal das secções) e o **Exagero do perfil** (1×, 2×, 5× ou 10×); a caixa de diálogo indica quantas secções cabem numa página e quantas páginas resultam.

Cada secção mostra uma grelha com afastamentos e cotas, o terreno (a tracejado), o projeto, a escavação e o aterro sombreados (laranja e verde), os pontos do corredor, e por baixo a sua estaca e as suas áreas de escavação e aterro. Todas as secções nas folhas são desenhadas com o mesmo tamanho, suficientemente altas para a maior; quando isso não cabe na página com o seu exagero, o CivilCraft usa a maior que cabe e indica-o. A faixa do título indica a diretriz, as estacas dessa página, as escalas e "Folha 1 de 3".

## Até onde se medem a escavação e o aterro

Um corredor pode ter camadas sob o pavimento: camadas do pavimento, componentes de modelo, trilhos. O seletor **Volumes medidos até**, na barra da secção, escolhe até onde vão a escavação e o aterro:

- **Superfície inferior** (a predefinição): até à base desses componentes, pelo que a escavação inclui a espessura da composição do pavimento.
- **Superfície superior**: apenas até ao topo do projeto, como antes de os componentes contarem.

As áreas do cabeçalho, os volumes abaixo, o CSV e o diagrama de Brückner seguem todos esta escolha, que fica guardada com o projeto.

## Volumes pelo método das áreas médias das extremidades

Entre duas secções vizinhas, o volume é a média das suas duas áreas multiplicada pela distância entre as suas estacas. A barra mostra os totais da diretriz, e {{ui:CSV}} transfere as áreas e os volumes de cada secção com totais acumulados (jardas cúbicas nos projetos em pés, metros cúbicos nos métricos).

As **Propriedades** mostram os mesmos totais ao lado dos volumes pelo método da malha de [Volumes de movimentos de terras](topic:volumes). São aproximações diferentes: secções mais próximas aproximam-nas, e numa estrada reta em terreno plano são iguais.

:::note
A escavação e o aterro só se contam dentro das áreas modeladas (as linhas de intersecção do talude de um corredor ou de uma plataforma), tal como no método da malha. Sem corredor nem plataforma, o projeto é o próprio terreno, pelo que uma secção não mostra escavação nem aterro.
:::

## Diagrama de Brückner

O **Diagrama de Brückner** em **Linhas de amostragem** desenha o diagrama a partir dos mesmos volumes por áreas das extremidades: ao longo das estacas, o total acumulado de escavação menos aterro.

- **Retração (−) ou expansão (+) da escavação** indica o que uma jarda cúbica de escavação dá quando é colocada como aterro: −10 % (o valor inicial, indicativo) significa que encolhe para 0.9; uma rocha que expande pode ser +5 %. Use o valor do seu relatório geotécnico.
- Onde a linha sobe, a estrada está em escavação; onde desce, em aterro. Acima de zero (sombreado a laranja) a terra move-se no sentido crescente das estacas; abaixo de zero (verde), no sentido decrescente.
- Os **pontos de equilíbrio** são onde a linha cruza zero: entre dois deles, a escavação e o aterro equilibram-se. A tabela lista cada troço equilibrado, o volume movido (o seu ponto mais alto ou mais baixo) e a distância média de transporte (a área sombreada dividida por esse volume).
- Onde a linha termina fora de zero, o excedente é **bota-fora** (acima) ou **empréstimo** (abaixo). Nesse último troço, só conta como movida a terra além do nível em que termina.

O **CSV** guarda a ordenada do diagrama em cada secção, os troços e o fator.
