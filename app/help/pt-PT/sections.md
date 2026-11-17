---
title: Linhas de amostragem e perfis transversais
summary: Cortar perfis perpendiculares a uma diretriz, ver o terreno natural, o projeto e a escavação e o aterro em cada PK, e obter volumes pelo método das áreas médias extremas.
keywords: diagrama de Brückner, diagrama de massas, ponto de equilíbrio, contração, empolamento, distância de transporte, empréstimo, depósito, folhas de perfis, folhas de perfis transversais, pdf de perfis, perfis, perfis transversais, linhas de amostragem, vista de perfil, escavação, aterro, áreas, área média extrema, volumes de áreas extremas, movimento de terras, PK, afastamento, csv
from: 5060173c
---

Um perfil transversal mostra a estrada da forma como será construída: perpendicular à diretriz num PK, o terreno natural, o projeto (o corredor ou a plataforma modelados) e a escavação e o aterro entre eles.

## Acrescentar linhas de amostragem

1. Selecione uma diretriz. Nas **Propriedades**, em **Linhas de amostragem**, clique em {{ui:Acrescentar linhas de amostragem}}.
2. Defina **A cada** (o espaçamento: 50 ft ou 20 m para começar), a **Largura esquerda** e a **Largura direita** (até onde cada perfil se estende a partir do eixo).
3. Para cortar um perfil num PK específico, introduza-o em **Acrescentar um PK** (por exemplo `2+35`) e prima {{key:Enter}}.

Os perfis são cortados em cada múltiplo inteiro do espaçamento, nas duas extremidades da diretriz, no início e no fim de cada curva (PC e PT), e nos PK que acrescentar. As linhas de amostragem aparecem na planta como linhas cinzentas atravessadas à diretriz; saem também em DXF, DWG e PDF na camada C-ROAD-SCTN. Cada alteração é um passo: {{key:Mod+Z}} anula-o.

## A vista de perfil

Abra-a com {{ui:Vista de perfil}} nas **Propriedades** da diretriz, com {{ui:Perfis}} em **Superfície** › {{ui:Mais}}, ou com {{key:X}}. Ocupa o lugar da vista de perfil sob a planta.

- Percorra os perfis com as setas da sua barra, a lista de PK, ou com {{key:Left}} e {{key:Right}} com a vista de perfil em foco ({{key:Home}} e {{key:End}} para o primeiro e o último).
- A linha cinzenta é o terreno natural, a linha vermelha é o projeto. A escavação é sombreada a laranja, o aterro a verde. Os pontos do corredor estão assinalados: CL (eixo), EOP (bordo da faixa de rodagem), SH (berma) e DL (linha de intersecção do talude).
- O cabeçalho indica o PK, as áreas de escavação e de aterro deste perfil e o exagero vertical. **Ajustar** preenche o painel; escolha 1× para ver o perfil à escala real.
- A linha grossa na planta mostra qual perfil está no ecrã.

## Folhas de perfis

{{ui:Folhas de perfis (PDF)}} em **Linhas de amostragem** coloca cada perfil em páginas PDF, em linhas da esquerda para a direita e de cima para baixo, por ordem de PK. Escolha o **Papel**, a **Escala em planta** (a escala horizontal dos perfis) e o **Exagero vertical do perfil** (1×, 2×, 5× ou 10×); a caixa de diálogo indica quantos perfis cabem numa página e quantas páginas resultam disso.

Cada perfil mostra uma grelha com afastamentos e cotas, o terreno (tracejado), o projeto, a escavação e o aterro sombreados (laranja e verde), os pontos do corredor e, por baixo, o seu PK e as suas áreas de escavação e de aterro. Todos os perfis das folhas são desenhados do mesmo tamanho, suficientemente altos para o maior; quando isso não cabe na página com o seu exagero, o CivilCraft usa o maior que cabe e indica-o. A faixa do título indica a diretriz, os PK dessa página, as escalas e "Folha 1 de 3".

## Volumes pelo método das áreas médias extremas

Entre dois perfis vizinhos, o volume é a média das duas áreas vezes a distância entre os seus PK. A barra mostra os totais da diretriz, e {{ui:CSV}} descarrega as áreas e os volumes de cada perfil com totais acumulados (jardas cúbicas em projetos em pés, metros cúbicos nos métricos).

As **Propriedades** mostram os mesmos totais ao lado dos volumes pelo método da grelha de [Volumes de movimento de terras](topic:volumes). Os dois são aproximações diferentes: perfis mais próximos aproximam-nos, e numa estrada reta em terreno plano são iguais.

:::note
Escavação e aterro só são contados dentro das áreas modeladas (as linhas de intersecção de um corredor ou de uma plataforma), como faz o método da grelha. Sem corredor nem plataforma, o projeto é o terreno, por isso um perfil não mostra escavação nem aterro.
:::

## Diagrama de Brückner

**Diagrama de Brückner** em **Linhas de amostragem** desenha o diagrama de massas a partir dos mesmos volumes das áreas extremas: ao longo dos PK, o total acumulado de escavação menos aterro.

- **Contração (−) ou empolamento (+) da escavação** indica o que um metro cúbico de escavação passa a ser depois de colocado como aterro: −10 % (o valor inicial, uma referência) significa que encolhe para 0.9; uma rocha que empola pode ser +5 %. Use o valor do seu relatório geotécnico.
- Onde a linha sobe, a estrada está em escavação; onde desce, em aterro. Acima de zero (sombreado a laranja) a terra move-se para montante; abaixo de zero (verde), para jusante.
- Os **pontos de equilíbrio** são onde a linha cruza zero: entre dois deles a escavação e o aterro equilibram-se. A tabela lista cada troço equilibrado, o volume movimentado (o seu ponto mais alto ou mais baixo) e a distância média de transporte (a área sombreada dividida por esse volume).
- Onde a linha termina fora de zero, o que sobra é **depósito** (acima) ou **empréstimo** (abaixo). Nesse último troço só conta como movimentada a terra além do nível em que termina.

**CSV** guarda a ordenada de massas em cada perfil, os troços e o fator.
