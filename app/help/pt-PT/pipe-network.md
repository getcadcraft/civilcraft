---
title: Desenhar uma rede de coletores por gravidade
summary: Desenhe troços de coletores órgão a órgão, defina as suas regras de declive, recobrimento e queda, deixe o CivilCraft fixar as cotas de soleira, e resolva os problemas que ele lista.
keywords: construtor de órgãos, tipo de órgão, órgão retangular, caixa de sumidouro, aro, recobrimento, espessura de parede, item da biblioteca, rede de coletores, pluvial, doméstica, esgoto, órgãos, caixas de visita, sumidouros, cotas de soleira, declive, queda, poço, coletores por gravidade
from: 10a3c14d
---

Um projeto tem uma rede de coletores por gravidade, pluvial ou doméstica. É feita de órgãos (caixas de visita, sumidouros) e de coletores retos entre eles. O escoamento corre no sentido em que desenha. O CivilCraft verifica cada coletor e órgão contra três regras que define, e pode fixar todas as cotas de soleira a partir dessas regras.

## Desenhar um troço

Pode desenhar coletores sem superfície, mas os aros, o recobrimento e as cotas de soleira automáticas precisam de uma.

1. Prima {{key:P}}, ou clique em {{ui:Coletores}} no grupo **Desenho**.
   A dica diz "Coletores: clique nos órgãos do topo do troço para baixo (clique num já existente para o ligar). Enter termina."
2. Clique onde vai o órgão a montante. Fica colocado um órgão.
3. Clique em cada órgão seguinte, a jusante. Para ligar a um órgão que já existe, clique nele: a barra de estado diz "Ligado S3."
4. Prima {{key:Enter}}.
   Os coletores são desenhados, as suas cotas de soleira são definidas a partir das regras, e a barra de estado diz, por exemplo, "3 coletores desenhados, 12", cotas de soleira definidas a partir das regras; todas as verificações passam."

Os novos órgãos são nomeados S1, S2 … com 48 in (1200 mm) de diâmetro. Os novos coletores são nomeados P1, P2 … com 12 in (300 mm) de diâmetro. Os diâmetros estão em polegadas num projeto em pés e em milímetros num projeto em metros.

Termine com {{key:Enter}}. O duplo clique também funciona, mas quando faz duplo clique num órgão existente para terminar aí o troço, a ligação é perdida: clique uma vez nele e depois prima {{key:Enter}}.

## Definir as suas regras

Sem nada selecionado, o painel direito (**Projeto**) tem um bloco **Rede de coletores**:

| Definição | Valor inicial | Significado |
|---|---|---|
| Tipo | Pluvial | {{ui:Pluvial}} ou {{ui:Doméstica}}; escrito em LandXML |
| Declive mínimo | 0.50% | Cada coletor tem de descer pelo menos isto |
| Recobrimento mínimo | 2 ft (0.6 m) | Do terreno à geratriz superior do tubo, ao longo de todo o coletor |
| Queda nos órgãos | 0.10 ft (0.03 m) | A cota de soleira de saída tem de estar pelo menos isto abaixo de cada cota de soleira de entrada |

**Estes valores iniciais são marcadores, não uma norma.** Defina os valores que a sua entidade ou projeto exige. O recobrimento é medido do terreno à geratriz superior (cota de soleira mais diâmetro interior); a espessura da parede não conta. Onde plataformas ou corredores são modelados, a superfície modelada é o terreno.

## Deixar o CivilCraft fixar as cotas de soleira

- {{ui:Definir todas as cotas de soleira a partir das regras}} (no bloco **Rede de coletores**) define todos os coletores.
- {{ui:Definir as cotas de soleira a partir das regras}} (com um coletor selecionado) define só esse coletor.

Trabalhando a jusante, cada troço começa com pelo menos o recobrimento no seu órgão superior, desce pelo menos o declive mínimo, desce pelo menos a queda em cada órgão, e fica mais fundo onde o terreno ao longo do coletor deixaria menos do que o recobrimento mínimo. As cotas de soleira são arredondadas para baixo a 0.01, nunca para cima. A barra de estado diz "Cotas de soleira definidas: recobrimento mínimo no topo de cada troço, pelo menos o declive mínimo, pelo menos a queda em cada órgão." ou indica o que não conseguiu fazer.

## Editar órgãos e coletores

Clique num órgão ou num coletor com {{ui:Selecionar}} para o ver no painel direito.

**Órgão**: **Nome**, **Aro**, **Profundidade do poço**, **Diâmetro**, depois **Aro utilizado**, **Poço**, **Este** e **Norte**, e os coletores de entrada e de saída com as suas cotas de soleira.

- Deixe **Aro** vazio para o tomar da superfície; a caixa mostra então o valor da superfície a cinzento. Escreva um valor para fixar o aro.
- Arraste o ponto de controlo do órgão na planta para o mover. Os seus coletores seguem-no; as cotas de soleira mantêm-se como estavam, por isso verifique os problemas depois.

**Tipo**: escolha um dos tipos de órgão da rede (abaixo), ou nenhum, para um órgão redondo do seu próprio diâmetro.

**Coletor**: **Nome**, os órgãos entre os quais corre, **Diâmetro**, **Cota de soleira superior**, **Cota de soleira inferior**, depois **Comprimento**, **Declive** e **Recobrimento mínimo**.

Prima {{key:Enter}} depois de cada valor.

## Ler e resolver problemas

O bloco **Rede de coletores** lista cada problema (até 40); clique num para selecionar o coletor ou órgão. Um coletor ou órgão selecionado lista os seus próprios. Sem nada selecionado, diz "Todos os coletores e órgãos cumprem as regras."

| Mensagem (exemplos) | O que fazer |
|---|---|
| "P2 runs uphill (-0.40%)." ou "… runs flat …" | "P2 sobe (-0.40%)." ou "… é plano …". Troque as cotas de soleira, ou defina-as a partir das regras. |
| "P2 at 0.30% is flatter than the minimum 0.50%." | "P2 a 0.30% é mais plano do que o mínimo de 0.50%." Baixe a cota de soleira de jusante ou eleve a de montante. |
| "P3 has 1.40 of cover 35 along it, less than the minimum 2." | "P3 tem 1.40 de recobrimento em 35 ao longo de si, menos do que o mínimo 2." Baixe o coletor; defina as suas cotas de soleira a partir das regras. |
| "In S3, P4 leaves at 245.20, less than 0.1 below P3 coming in at 245.25." | "Em S3, P4 sai a 245.20, menos de 0.1 abaixo de P3, que entra a 245.25." Baixe a cota de soleira superior do coletor de saída. |
| "P1's crown is above S1's rim." | "A geratriz superior de P1 está acima do aro de S1." O coletor está demasiado alto para o órgão. |
| "S2 has 2 pipes leaving it; a gravity network should have one way out of each structure." | "S2 tem 2 coletores a sair; uma rede por gravidade deve ter uma só saída de cada órgão." Retire um coletor de saída, ou redesenhe-o no sentido certo. |
| "The pipes form a loop; flow has to end at an outlet." | "Os coletores formam um ciclo; o escoamento tem de terminar numa saída." Um troço foi desenhado de volta sobre si mesmo; elimine um coletor. |
| "S5 is off the surface and has no rim elevation." | "S5 está fora da superfície e não tem cota de aro." Escreva um aro, ou mova o órgão para a superfície. |
| "P6 runs partly off the surface; cover there is unknown." | "P6 corre em parte fora da superfície; o recobrimento aí é desconhecido." Estenda a superfície, ou aceite que o recobrimento não é verificado aí. |
| "P7 has no inverts yet." | "P7 ainda não tem cotas de soleira." Escreva-as, ou defina-as a partir das regras. |

Coletores e órgãos com problemas também ficam marcados a vermelho na planta.

## Tipos de órgão

Um tipo de órgão é um órgão construído a partir dos seus parâmetros: uma caixa de visita, sumidouro, caixa de ligação ou saída, **redondo** (diâmetro interior) ou **retangular** (largura e comprimento interiores), com a sua **espessura de parede**, **laje de fundo**, um **poço** abaixo do coletor mais baixo e um **aro e tampa** (abertura redonda ou retangular, altura do aro). Os tipos pertencem à rede, em **Tipos de órgão** nas Propriedades do projeto.

1. Clique em {{ui:Novo tipo de órgão}}. A caixa de diálogo desenha o órgão em planta e em corte à medida que escreve.
2. Clique em {{ui:Adicionar o tipo}}.
3. Selecione um órgão e escolha o tipo em **Tipo**. Ele toma o tamanho e o poço do tipo; o seu próprio poço ainda pode ser alterado.

Edite um tipo e cada órgão desse tipo segue as suas dimensões. Elimine um tipo e os seus órgãos ficam como órgãos redondos da mesma largura. Cada alteração é um passo: {{key:Mod+Z}} anula-a.

Um órgão retangular é desenhado na planta, em DXF, DWG e PDF, e em 3D como um retângulo com o seu comprimento ao longo do coletor de saída; os coletores começam na sua parede. O LandXML escreve-o como órgão retangular (`RectStruct`), com a sua espessura de parede, e lê esses órgãos de volta como tipos.

### Partilhar um tipo através da biblioteca

{{ui:Guardar como item da biblioteca}} escreve o tipo como item da biblioteca do CadCraft (um ficheiro `.json`): o seu símbolo de planta, um corpo 3D até uma profundidade típica, e todos os tamanhos. Carregue-o para a biblioteca para o partilhar. {{ui:Abrir um item da biblioteca}} lê de volta para a rede um órgão guardado assim, convertido para as unidades do projeto. Os itens da biblioteca que não sejam órgãos feitos no CivilCraft são recusados, com o motivo indicado.

## Eliminar

Selecione um coletor e prima {{key:Delete}} para o remover. Eliminar um órgão remove também os coletores ligados a ele. Num Mac, prima Fn e Delete, ou clique em {{ui:Eliminar}}.

## Ainda não implementado

Caudais, diâmetros de coletores e a linha piezométrica estão em [Drenagem pluvial](topic:storm-drainage). Catálogos de coletores, coletores não circulares, coletores no perfil, coletores curvos e mais de uma rede por projeto ainda não estão disponíveis. Veja [Ainda não implementado](topic:not-built-yet).
