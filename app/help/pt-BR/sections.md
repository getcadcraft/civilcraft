---
title: Linhas de amostragem e seções transversais
summary: Corte seções perpendicularmente a um alinhamento, veja o terreno, o projeto e o corte e aterro em cada estaca, e obtenha volumes pelo método das áreas médias extremas.
keywords: diagrama de massas, curva de massa, ponto de equilíbrio, empolamento, contração, distância de transporte, empréstimo, bota-fora, folhas de seções, folhas de seções transversais, PDF de seções, seções, seções transversais, linhas de amostragem, vista de seção, corte, aterro, áreas, volumes por área média extrema, terraplenagem, estaca, afastamento, csv
from: 5060173c
---

Uma seção transversal mostra a estrada da forma como ela será construída: perpendicular ao alinhamento em uma estaca, o terreno existente, o projeto (o corredor ou a plataforma já terraplenados) e o corte e o aterro entre eles.

## Adicionar linhas de amostragem

1. Selecione um alinhamento. Em **Propriedades**, em **Linhas de amostragem**, clique em {{ui:Add sample lines}}.
2. Defina o **Intervalo** (o espaçamento: 50 ft ou 20 m, para começar), a **Largura esquerda** e a **Largura direita** (até onde cada seção alcança a partir do eixo).
3. Para cortar uma seção em uma estaca específica, digite-a em **Adicionar uma estação** (por exemplo `2+35`) e pressione {{key:Enter}}.

As seções são cortadas em todo múltiplo inteiro do intervalo, nas duas extremidades do alinhamento, no início e no fim de cada curva (PC e PT), e nas estacas que você adicionar. As linhas de amostragem aparecem na planta como linhas cinzas atravessando o alinhamento; elas também saem em DXF, DWG e PDF na camada C-ROAD-SCTN. Cada alteração é um passo: {{key:Mod+Z}} a desfaz.

## A vista de seção

Abra-a com {{ui:Section view}} nas **Propriedades** do alinhamento, com {{ui:Sections}} em **Superfície** › {{ui:More}}, ou com {{key:X}}. Ela ocupa o lugar da vista de perfil sob a planta.

- Percorra as seções com as setas da sua barra, pela lista de estacas, ou com {{key:Left}} e {{key:Right}} com a vista de seção em foco ({{key:Home}} e {{key:End}} para a primeira e a última).
- A linha cinza é o terreno existente, a linha vermelha é o projeto. O corte é sombreado em laranja, o aterro em verde. Os pontos do corredor são marcados: CL (eixo), EOP (borda da pista), SH (acostamento) e DL (pé de talude).
- O cabeçalho mostra a estaca, as áreas de corte e aterro desta seção e o exagero vertical. **Ajustar** preenche o painel; escolha 1× para ver a seção na escala real.
- A linha grossa na planta mostra qual seção está na tela.

## Folhas de seções

{{ui:Section sheets (PDF)}} em **Linhas de amostragem** coloca cada seção em páginas PDF, em linhas da esquerda para a direita e de cima para baixo, em ordem de estacas. Escolha o **Papel**, a **Escala da planta** (a escala horizontal das seções) e o **Exagero do perfil** (1×, 2×, 5× ou 10×); a caixa de diálogo informa quantas seções cabem em uma página e quantas páginas isso resulta.

Cada seção mostra uma malha com deslocamentos e cotas, o terreno (tracejado), o projeto, o corte e o aterro sombreados (laranja e verde), os pontos do corredor e, abaixo, a sua estaca e as suas áreas de corte e aterro. Todas as seções nas folhas são desenhadas com o mesmo tamanho, altas o suficiente para a maior delas; quando isso não cabe na página com o seu exagero, o CivilCraft usa a maior que cabe e informa isso. A faixa do título indica o alinhamento, as estacas daquela página, as escalas e "Folha 1 de 3".

## Volumes pelo método das áreas médias extremas

Entre duas seções vizinhas, o volume é a média das suas duas áreas multiplicada pela distância entre as suas estacas. A barra mostra os totais do alinhamento, e {{ui:CSV}} baixa as áreas e os volumes de cada seção com os totais acumulados (jardas cúbicas em projetos em pés, metros cúbicos nos métricos).

**Propriedades** mostra os mesmos totais ao lado dos volumes pelo método da malha de [Volumes de terraplenagem](topic:volumes). Os dois são aproximações diferentes: seções mais próximas as aproximam, e em uma estrada reta em terreno plano elas são iguais.

:::note
Corte e aterro são contados somente dentro das áreas terraplenadas (as linhas de pé de talude de um corredor ou de uma plataforma), como faz o método da malha. Sem corredor nem plataforma, o projeto é o próprio terreno, então uma seção não mostra corte nem aterro.
:::

## Diagrama de massas

**Diagrama de massas** em **Linhas de amostragem** desenha o diagrama de massas a partir dos mesmos volumes por áreas médias extremas: ao longo das estacas, o total acumulado do corte menos o aterro.

- **Empolamento (−) ou contração (+) do corte** indica o que uma jarda cúbica de corte produz depois de colocada como aterro: −10 % (o valor inicial, um valor provisório) significa que ela contrai para 0,9; uma rocha que empola pode ser +5 %. Use o valor do seu relatório geotécnico.
- Onde a linha sobe, a estrada está em corte; onde desce, em aterro. Acima de zero (sombreado em laranja) a terra se move para estacas crescentes; abaixo de zero (verde), para estacas decrescentes.
- **Pontos de equilíbrio** são onde a linha cruza zero: entre dois deles, o corte e o aterro se equilibram. A tabela lista cada trecho equilibrado, o volume movimentado (o seu ponto mais alto ou mais baixo) e a distância média de transporte (a área sombreada dividida por esse volume).
- Onde a linha termina fora de zero, o que sobra é **bota-fora** (acima) ou **empréstimo** (abaixo). Nesse último trecho, só a terra além do nível em que ele termina conta como movimentada.

**CSV** salva a ordenada de massa em cada seção, os trechos e o fator.
