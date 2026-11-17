---
title: Montar uma rede de tubos por gravidade
summary: Desenhe trechos de tubos de drenagem pluvial ou de esgoto estrutura por estrutura, defina suas regras de declividade, cobertura e queda, deixe o CivilCraft definir as cotas de fundo e corrija os problemas que ele lista.
keywords: construtor de estruturas, tipo de estrutura, estrutura retangular, boca de lobo, quadro, cobertura, espessura de parede, item da biblioteca, rede de tubos, pluvial, esgoto, sanitário, estruturas, poços de visita, bocas de lobo, cotas de fundo, cobertura, declividade, queda, borda, poço de sedimentos, tubos por gravidade
from: 10a3c14d
---

Um projeto tem uma rede de tubos por gravidade, pluvial ou de esgoto. Ela é formada por estruturas (poços de visita, bocas de lobo) e tubos retos entre elas. O fluxo vai no sentido em que você desenha. O CivilCraft verifica cada tubo e cada estrutura contra três regras que você define, e pode definir todas as cotas de fundo a partir dessas regras.

## Desenhar um trecho

Você pode desenhar tubos sem uma superfície, mas as bordas, a cobertura e as cotas de fundo automáticas precisam de uma.

1. Pressione {{key:P}}, ou clique em {{ui:Pipes}} no grupo **Design**.
   A dica diz "Pipes: click structures from the top of the run down (click an existing one to join it). Enter finishes."
2. Clique onde fica a estrutura de montante. Uma estrutura é colocada.
3. Clique em cada próxima estrutura de jusante. Para conectar a uma estrutura que já existe, clique nela: a barra de status diz "Joined S3."
4. Pressione {{key:Enter}}.
   Os tubos são desenhados, as cotas de fundo são definidas pelas regras, e a barra de status diz, por exemplo, "3 pipes drawn, 12", inverts set from the rules; every check passes."

As novas estruturas recebem nomes S1, S2 … com diâmetro de 48 in (1200 mm). Os novos tubos recebem nomes P1, P2 … com diâmetro de 12 in (300 mm). Os diâmetros são em polegadas em um projeto em pés e em milímetros em um projeto em metros.

Termine com {{key:Enter}}. O duplo clique também funciona, mas, quando você dá duplo clique em uma estrutura existente para encerrar o trecho ali, a conexão é descartada: clique nela uma vez e depois pressione {{key:Enter}}.

## Definir suas regras

Sem nada selecionado, o painel direito (**Project**) tem um bloco **Pipe network**:

| Configuração | Valor inicial | Significado |
|---|---|---|
| Type | Storm | {{ui:Storm}} ou {{ui:Sanitary}}; gravado no LandXML |
| Least slope | 0.50% | Cada tubo precisa cair pelo menos isso |
| Least cover | 2 ft (0.6 m) | Do terreno ao topo do tubo, ao longo de todo o tubo |
| Drop in structures | 0.10 ft (0.03 m) | A cota de fundo de saída precisa estar pelo menos isso abaixo de cada cota de fundo de entrada |

**Estes valores iniciais são marcadores, não um padrão.** Defina os valores que a sua agência ou o seu projeto exige. A cobertura é medida do terreno ao topo (cota de fundo mais diâmetro interno); a espessura da parede não entra na conta. Onde plataformas ou corredores são terraplenados, a superfície terraplenada é o terreno.

## Deixar o CivilCraft definir as cotas de fundo

- {{ui:Set every invert from the rules}} (no bloco **Pipe network**) define todos os tubos.
- {{ui:Set its inverts from the rules}} (com um tubo selecionado) define apenas esse tubo.

Trabalhando de jusante para montante, cada trecho começa com pelo menos a cobertura na sua estrutura superior, cai pelo menos a declividade mínima, perde pelo menos a queda em cada estrutura, e fica mais fundo onde o terreno ao longo do tubo deixaria menos que a cobertura mínima. As cotas de fundo são arredondadas para baixo, em 0.01, nunca para cima. A barra de status diz "Inverts set: least cover at the top of each run, at least the least slope, at least the drop in each structure." ou informa o que não pôde ser feito.

## Editar estruturas e tubos

Clique em uma estrutura ou tubo com {{ui:Select}} para vê-lo no painel direito.

**Estrutura**: **Name**, **Rim**, **Sump depth**, **Diameter**, depois **Rim used**, **Sump**, **Easting** e **Northing**, e os tubos de entrada e de saída com as suas cotas de fundo.

- Deixe **Rim** vazio para tomá-la da superfície; a caixa então mostra o valor da superfície em cinza. Digite um valor para fixar a borda.
- Arraste a alça da estrutura no plano para movê-la. Os tubos dela acompanham; as cotas de fundo permanecem como estavam, então verifique os problemas depois.

**Type**: escolha um dos tipos de estrutura da rede (abaixo), ou nenhum, para uma estrutura redonda com o próprio diâmetro.

**Tubo**: **Name**, as estruturas entre as quais ele corre, **Diameter**, **Upper invert**, **Lower invert**, depois **Length**, **Slope** e **Least cover**.

Pressione {{key:Enter}} depois de cada valor.

## Ler e corrigir problemas

O bloco **Pipe network** lista cada problema (até 40); clique em um para selecionar o tubo ou a estrutura. Um tubo ou estrutura selecionado lista os seus próprios. Sem nada selecionado, ele diz "Every pipe and structure passes the rules."

| Mensagem (exemplos) | O que fazer |
|---|---|
| "P2 tem declive negativo (-0.40%)." ou "… é plano …" | Troque as cotas de fundo, ou defina-as pelas regras. |
| "P2 com 0.30% é mais plano que o mínimo de 0.50%." | Baixe a cota de fundo de jusante ou eleve a de montante. |
| "P3 has 1.40 of cover 35 along it, less than the minimum 2." | Baixe o tubo; defina as suas cotas de fundo pelas regras. |
| "In S3, P4 leaves at 245.20, less than 0.1 below P3 coming in at 245.25." | Baixe a cota de fundo superior do tubo de saída. |
| "P1's crown is above S1's rim." | O tubo está alto demais para a estrutura. |
| "S2 has 2 pipes leaving it; a gravity network should have one way out of each structure." | Remova um tubo de saída, ou redesenhe-o no sentido certo. |
| "The pipes form a loop; flow has to end at an outlet." | Um trecho foi desenhado voltando sobre si mesmo; exclua um tubo. |
| "S5 is off the surface and has no rim elevation." | Digite uma borda, ou mova a estrutura para a superfície. |
| "P6 runs partly off the surface; cover there is unknown." | Estenda a superfície, ou aceite que a cobertura ali não é verificada. |
| "P7 has no inverts yet." | Digite-as, ou defina-as pelas regras. |

Tubos e estruturas com problema também são marcados em vermelho no plano.

## Tipos de estrutura

Um tipo de estrutura é uma estrutura construída a partir dos seus parâmetros: um poço de visita, uma boca de lobo, uma caixa de passagem ou uma saída, **redonda** (diâmetro interno) ou **retangular** (largura e comprimento internos), com a sua **espessura de parede**, **laje de fundo**, um **poço de sedimentos** abaixo do tubo mais baixo e uma **tampa e quadro** (abertura redonda ou retangular, altura do quadro). Os tipos pertencem à rede, em **Structure types** nas Propriedades do projeto.

1. Clique em {{ui:New structure type}}. A caixa de diálogo desenha a estrutura no plano e na seção conforme você digita.
2. Clique em {{ui:Add the type}}.
3. Selecione uma estrutura e escolha o tipo em **Type**. Ela assume o tamanho e o poço de sedimentos do tipo; o próprio poço ainda pode ser alterado.

Edite um tipo e cada estrutura desse tipo acompanha os seus tamanhos. Remova um tipo e as suas estruturas continuam como estruturas redondas da mesma largura. Cada mudança é um passo: {{key:Mod+Z}} a desfaz.

Uma estrutura retangular é desenhada no plano, em DXF, DWG e PDF, e em 3D como um retângulo com o comprimento ao longo do seu tubo de saída; os tubos começam na parede dela. O LandXML a grava como uma estrutura retangular (`RectStruct`) com a sua espessura de parede, e lê essas estruturas de volta como tipos.

### Compartilhar um tipo pela biblioteca

{{ui:Save as library item}} grava o tipo como um item da biblioteca do CadCraft (um arquivo `.json`): o símbolo do plano, um corpo 3D até uma profundidade típica, e todos os tamanhos. Envie-o para a biblioteca para compartilhar. {{ui:Open a library item}} lê de volta para a rede uma estrutura salva dessa forma, convertida para as unidades do projeto. Itens da biblioteca que não são estruturas feitas no CivilCraft são recusados, com o motivo informado.

## Excluir

Selecione um tubo e pressione {{key:Delete}} para removê-lo. Excluir uma estrutura remove também os tubos conectados a ela. No Mac, pressione Fn e Delete, ou clique em {{ui:Delete}}.

## Ainda não implementado

Vazões, diâmetros de tubos e o gradiente hidráulico estão em [Drenagem pluvial](topic:storm-drainage). Catálogos de tubos, tubos não circulares, tubos na vista de perfil, tubos curvos e mais de uma rede por projeto ainda não estão disponíveis. Veja [Ainda não implementado](topic:not-built-yet).
