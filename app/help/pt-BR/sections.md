---
title: Linhas de amostragem e seções transversais
summary: Corte seções perpendiculares a um alinhamento, veja o terreno, o projeto e o corte e aterro em cada estaca, e obtenha volumes pelo método das áreas médias.
keywords: diagrama de massas, ponto de equilíbrio, contração, expansão, distância de transporte, empréstimo, bota-fora, folhas de seções, folhas de seções transversais, PDF de seções, seções, seções transversais, linhas de amostragem, vista de seção, corte, aterro, áreas, áreas médias, volumes por áreas médias, terraplenagem, estaca, afastamento, csv
from: 09639ce2
---

Uma seção transversal mostra a estrada da forma como ela será construída: perpendicular ao alinhamento, em uma estaca, com o terreno natural, o projeto (o corredor ou a plataforma regularizados) e o corte e aterro entre eles.

## Adicionar linhas de amostragem

1. Selecione um alinhamento. Em **Propriedades**, em **Linhas de amostragem**, clique em {{ui:Add sample lines}}.
2. Defina **A cada** (o espaçamento: 50 ft ou 20 m para começar), **Largura esquerda** e **Largura direita** (até onde cada seção alcança a partir do eixo).
3. Para cortar uma seção numa estaca específica, digite-a em **Adicionar uma estaca** (por exemplo `2+35`) e pressione {{key:Enter}}.

As seções são cortadas em cada múltiplo inteiro do espaçamento, nas duas extremidades do alinhamento, no início e no fim de cada curva (PC e PT), e nas estacas que você adicionar. As linhas de amostragem aparecem na planta como linhas cinzas atravessando o alinhamento; elas também saem em DXF, DWG e PDF na camada C-ROAD-SCTN. Cada alteração é um passo: {{key:Mod+Z}} desfaz.

## A vista da seção

Abra-a com {{ui:Section view}} nas **Propriedades** do alinhamento, com {{ui:Sections}} em **Superfície** › {{ui:More}}, ou com {{key:X}}. Ela ocupa o lugar da vista do perfil sob a planta.

- Percorra as seções com as setas da barra, a lista de estacas, ou com {{key:Left}} e {{key:Right}} quando a vista da seção estiver em foco ({{key:Home}} e {{key:End}} para a primeira e a última).
- A linha cinza é o terreno natural, a linha vermelha é o projeto. O corte é sombreado em laranja, o aterro em verde. Os pontos do corredor são marcados: CL (eixo), EOP (borda da pista), SH (acostamento) e DL (pé de talude).
- O cabeçalho dá a estaca, as áreas de corte e aterro desta seção e o exagero vertical. **Ajustar** preenche o painel; escolha 1× para ver a seção em escala real.
- A linha grossa na planta mostra qual seção está na tela.
- **Zoom e deslocamento:** a roda amplia em torno do ponteiro, e arrastar move a vista. {{ui:Fit}} (ou {{key:F}}, ou um clique duplo) ajusta a seção inteira de novo.

## Medir em uma seção

1. Clique em {{ui:Measure}} na barra da seção, ou pressione {{key:M}}. A dica diz "Clique no primeiro ponto, depois no segundo."
2. Clique em dois pontos. Cada um se encaixa na extremidade de uma linha ou num ponto do corredor (CL, EOP, SH, DL); segure {{key:Alt}} para um ponto livre.
3. A leitura dá a distância horizontal (ΔH), a distância vertical (ΔV), a declividade em percentual com a sua razão, e o comprimento reto, nas unidades do projeto.

Clique de novo para iniciar uma nova medição. {{key:Esc}} a limpa, e {{key:M}} desliga Medir.

## Folhas de seções

{{ui:Section sheets (PDF)}} em **Linhas de amostragem** coloca cada seção em páginas PDF, em linhas da esquerda para a direita e de cima para baixo, em ordem de estaca. Escolha o **Papel**, a **Escala em planta** (a escala horizontal das seções) e o **Exagero do perfil** (1×, 2×, 5× ou 10×); a caixa de diálogo diz quantas seções cabem em uma página e quantas páginas isso gera.

Cada seção mostra uma grade com afastamentos e cotas, o terreno (tracejado), o projeto, o corte e o aterro sombreados (laranja e verde), os pontos do corredor e, abaixo, a sua estaca e suas áreas de corte e aterro. Todas as seções nas folhas são desenhadas no mesmo tamanho, alto o bastante para a maior delas; quando isso não cabe na página com o seu exagero, a CivilCraft usa a maior que cabe e informa isso. A faixa do título traz o nome do alinhamento, as estacas daquela página, as escalas e "Folha 1 de 3".

## A que nível medem-se corte e aterro

Um corredor pode ter camadas sob o pavimento: camadas de pavimento, componentes de modelo, linhas férreas. O seletor **Volumes medidos até** na barra da seção escolhe até onde vão o corte e o aterro:

- **Superfície inferior** (o padrão): até a base desses componentes, de modo que o corte inclui a espessura da composição do pavimento.
- **Superfície superior**: apenas até o topo do projeto, como era antes de os componentes serem contados.

As áreas do cabeçalho, os volumes abaixo, o CSV e o diagrama de massas seguem essa escolha, e ela é salva com o projeto.

## Volumes por áreas médias

Entre duas seções vizinhas, o volume é a média das duas áreas multiplicada pela distância entre as suas estacas. A barra mostra os totais do alinhamento, e {{ui:CSV}} baixa as áreas e os volumes de cada seção com totais acumulados (jardas cúbicas em projetos em pés, metros cúbicos nos métricos).

**Propriedades** mostra os mesmos totais ao lado dos volumes pelo método da grade de [Volumes de terraplenagem](topic:volumes). Os dois são aproximações diferentes: seções mais próximas os aproximam, e em uma estrada reta em terreno plano são iguais.

:::note
Corte e aterro são contados apenas dentro das áreas regularizadas (as linhas de pé de talude de um corredor ou de uma plataforma), como faz o método da grade. Sem corredor ou plataforma, o projeto é o próprio terreno, então uma seção não mostra corte nem aterro.
:::

## Diagrama de massas

**Diagrama de massas** em **Linhas de amostragem** desenha o diagrama de massas a partir dos mesmos volumes por áreas médias: ao longo das estacas, o total acumulado de corte menos aterro.

- **Contração (−) ou expansão (+) do corte** diz o que um metro cúbico de corte vira depois de lançado como aterro: −10 % (o valor inicial, provisório) significa que ele encolhe para 0.9; uma rocha que expande pode ser +5 %. Use o número do seu relatório geotécnico.
- Onde a linha sobe, a estrada está em corte; onde desce, em aterro. Acima de zero (sombreado em laranja), a terra se move no sentido crescente das estacas; abaixo de zero (verde), no sentido decrescente.
- **Pontos de equilíbrio** são onde a linha cruza zero: entre dois deles, corte e aterro se equilibram. A tabela lista cada trecho equilibrado, o volume movimentado (o seu ponto mais alto ou mais baixo) e a distância média de transporte (a área sombreada dividida por esse volume).
- Onde a linha termina fora de zero, o que sobra é **bota-fora** (acima) ou **empréstimo** (abaixo). Nesse último trecho, só a terra além do nível em que ela termina conta como movimentada.

**CSV** salva a ordenada de massa em cada seção, os trechos e o fator.
