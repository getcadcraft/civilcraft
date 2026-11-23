---
title: Varrimento de um corredor rodoviário
summary: Ative um corredor para uma diretriz, defina os valores de faixa, berma e talude lateral, e leia as secções, as linhas de intersecção do talude e a movimentação de terras que ele produz.
keywords: entroncamento, interseção, estrada que encontra estrada, ramal, entroncamento em T, cruzamento, cota da plataforma, ligação, amarração, sobrelevação, super, inclinação, runoff, runout, tabela de taxas, inclinação transversal, rotação, corredor, conjunto, subconjunto, perfil transversal tipo, estrada, faixa, berma, inclinação transversal, talude lateral, intersecção do talude, escavação, aterro, secções, alvo, alvos, alvo de largura, alvo de cota, alvo de afastamento, alargamento, bordo da faixa de rodagem, seguir outro corredor
from: 6dcb92b3
---

Um corredor varre um perfil transversal tipo simples (um conjunto) ao longo de uma diretriz e do seu perfil de projeto, modela-o em relação ao terreno existente e acrescenta o resultado à superfície projetada. Uma diretriz pode ter vários corredores em intervalos de estacas diferentes, e um corredor pode ser construído a partir de modelos reutilizáveis por estaca ([Modelos de corredor](topic:corridor-templates)). O conjunto simples abaixo é igual nos dois lados; para dar a cada lado as suas próprias peças, veja [Construir cada lado a partir de peças](topic:corridor#build-each-side-from-parts).

## O conjunto

Do eixo para fora, em cada lado:

1. uma **faixa** com a largura indicada, descendo a partir do abaulamento com a **inclinação da faixa**
2. uma **berma** com a largura indicada, com a **inclinação da berma**
3. um **talude lateral** desde o bordo da berma até ao ponto em que encontra o terreno: o **talude de escavação** onde o terreno está acima, o **talude de aterro** onde está abaixo

Os valores iniciais são indicativos, não uma norma de projeto:

| Valor | Pés (EUA) | Metros |
|---|---|---|
| Largura da faixa | 12 ft | 3.6 m |
| Inclinação da faixa | 2% | 2% |
| Largura da berma | 4 ft | 1.2 m |
| Inclinação da berma | 4% | 4% |
| Talude de escavação | 2 : 1 | 2 : 1 |
| Talude de aterro | 3 : 1 | 3 : 1 |
| Secção a cada | 10 ft | 5 m |

Os taludes laterais indicam-se na horizontal para a vertical (H:V): 3 : 1 significa 3 na horizontal para 1 na vertical.

## Construir o corredor

Precisa de uma diretriz sem erros e de um perfil de projeto com pelo menos dois PVI e sem erros.

1. Selecione a diretriz.
2. No painel da direita, em **Corredor**, marque **Varrer um conjunto ao longo do perfil de projeto**.
   Os campos aparecem e o corredor é construído de imediato. A planta mostra os bordos da faixa e da berma e as linhas de intersecção do talude; com {{ui:Proposed (graded)}} escolhido em **Visualização**, as curvas de nível mostram o novo terreno.
3. Altere qualquer valor: **Largura da faixa**, **Inclinação da faixa**, **Largura da berma**, **Inclinação da berma**, **Talude de escavação**, **Talude de aterro**, **Secção a cada**. Prima {{key:Enter}} depois de cada um. A escavação, o aterro e o espaçamento das secções têm de ser superiores a 0.
4. Leia a linha sob os campos, por exemplo "39 secções de 0+00.00 a 3+86.36; escavação 240.2 cu yd, aterro 556.0 cu yd."

As secções são cortadas a cada passo de **Secção a cada**, nas extremidades e no início e no fim de cada curva horizontal e vertical. Cada secção e as linhas que passam por elas (eixo, bordos da faixa e da berma, intersecção do talude) tornam-se linhas de quebra da superfície projetada.

Para desativar o corredor, desmarque a caixa. Os seus valores ficam guardados para a próxima vez.

## Quando não é construído

Uma caixa vermelha sob os campos indica o motivo:

| Mensagem | O que fazer |
|---|---|
| "O corredor precisa de um perfil de projeto sem erros." | Acrescente PVI, ou corrija as curvas verticais sobrepostas (veja [Desenhar um perfil vertical](topic:profile)). |
| "O perfil de projeto não se sobrepõe à diretriz." | Mova os PVI para o intervalo de estacas da diretriz. |
| "O corredor precisa de pelo menos duas secções na superfície." | A maior parte do corredor está fora do terreno existente. |
| "4 taludes laterais saem da superfície antes de encontrar o terreno." | Perto do bordo da superfície, o talude não consegue atingir o terreno. Afaste a estrada do bordo, ou baixe a altura do aterro ou da escavação nesse ponto. |
| "As linhas de intersecção do talude do corredor cruzam-se (as secções sobrepõem-se, por exemplo no interior de uma curva apertada). Use um raio maior ou um conjunto mais estreito." | As secções no interior de uma curva acentuada sobrepõem-se. Aumente o raio ou estreite o conjunto. |

Um corredor com problemas não é modelado e não conta para a movimentação de terras.

## Corredores e plataformas em conjunto

A superfície projetada é construída por ordem: primeiro todos os corredores, depois todas as plataformas. Onde a modelação de uma plataforma se sobrepõe a um corredor, a plataforma prevalece. Onde um item posterior se sobrepõe a uma estrada, só é substituída a parte da estrada dentro da linha de intersecção do talude do item posterior; o resto da estrada, e qualquer linha de quebra do terreno que a estrada atravesse, mantém a sua forma. Os volumes são calculados em conjunto dentro de todas as linhas de intersecção do talude; veja [Volumes de movimentos de terras](topic:volumes).

## Sobrelevação

Numa curva, a estrada pode inclinar-se para o interior, para que o tráfego seja empurrado menos para o exterior. Marque **Sobreelevar as curvas** em **Sobrelevação** nas **Propriedades** da diretriz:

- Cada curva circular toma uma taxa **e** da tabela de taxas: a primeira linha cujo raio a curva atinge (uma linha com taxa vazia mantém o abaulamento normal). A tabela e a **Inclinação relativa máxima** (0.5 % inicialmente) são valores indicativos, não uma norma: defina-os a partir dos seus critérios de projeto. Acrescente ou remova linhas conforme precisar.
- As faixas rodam em torno do eixo. Antes da curva, a faixa exterior nivela-se ao longo do **runout** (abaulamento normal ÷ e × runoff) e depois ao longo do **runoff** (largura da faixa × e ÷ a inclinação); a faixa exterior continua a rodar até toda a estrada ter declive e em direção ao interior; dois terços do runoff ficam antes da curva e um terço sobre ela. Depois da curva, o mesmo acontece em sentido inverso.
- Uma berma do lado baixo nunca é mais plana do que a sua faixa; do lado alto mantém a sua própria inclinação (inverte-se).
- A tabela por baixo lista o raio, a taxa, o runoff e o runout de cada curva e onde a sobrelevação total começa e acaba. O **diagrama de sobrelevação** desenha as inclinações transversais das duas faixas ao longo das estacas (a faixa esquerda contínua, a direita a tracejado).
- Uma curva demasiado curta para atingir a sobrelevação total, ou duas curvas cujas transições se sobrepõem, é indicada numa caixa acima da tabela.

As secções, os volumes, a vista 3D e as folhas mostram todos a estrada inclinada. Cada alteração é um passo: {{key:Mod+Z}} anula-o.

## Alvos

Um alvo move um ponto de um lado da estrada até uma linha: o **Bordo da faixa de rodagem** ou o **Bordo da berma**, à **Esquerda** ou à **Direita**. Cada secção encontra a linha em ângulo reto com o eixo, avançando apenas para esse lado; assim, um alvo à direita nunca move o lado esquerdo.

| Define | O que acontece onde uma secção encontra a linha |
|---|---|
| **Largura** | O ponto fica sobre a linha: a faixa (ou a berma) alarga-se ou estreita-se até ela, mantendo a sua inclinação transversal. |
| **Cota** | O ponto assume a cota da linha nesse local, à sua própria distância: a inclinação transversal da faixa (ou da berma) segue-a. |

A linha pode ser uma linha característica (qualquer que seja o seu **Uso**) ou uma linha de outro corredor: o seu eixo, bordos da faixa de rodagem, bordos da berma ou linhas de intersecção do talude. A linha de um corredor segue esse corredor: se alterar a outra estrada, esta segue-a. O CivilCraft constrói primeiro o outro corredor; dois corredores que se fixassem mutuamente em ciclo são recusados de um dos lados, e a tabela indica qual.

1. Selecione a diretriz e ative o seu corredor.
2. Em **Alvos**, clique em {{ui:Adicionar um alvo}}.
3. Escolha o **Lado**, o **Ponto**, o que **Define** e **Até à linha**. Cada alteração é um passo de anulação.

**Resultado** indica em quantas secções a linha foi atingida. As secções que não a atingem (para além das suas extremidades, ou onde fica atrás do eixo) mantêm os valores do conjunto. Uma linha que seja eliminada deixa o corredor como estava antes do alvo, e a tabela indica-o. Cada lado pode ter uma largura e uma cota de alvo por cada ponto.

## Construir cada lado a partir de peças

Ative **Construir cada lado a partir de peças** nas definições do corredor. Cada lado tem então a sua própria lista, do eixo para fora: faixas, uma berma, uma valeta, um lancil, uma faixa ajardinada, um passeio e, por fim, o talude lateral até ao terreno (com os seus próprios rácios de escavação e aterro). Comece por {{ui:Estrada rural}} ou {{ui:Arruamento urbano}}, acrescente e remova peças, mova-as com as setas e {{ui:Copiar}} um lado para o outro. Cada alteração é um passo de anulação.

A inclinação transversal é a queda para longe da estrada, pelo que um passeio que escoa para a estrada tem valor negativo. Um lancil é uma face com a altura indicada, um topo com a largura indicada e um desnível opcional na parte de trás. A sobrelevação aplica-se a todas as faixas da primeira linha; a valeta, o lancil, a faixa ajardinada e o passeio pendem da berma das faixas tal como construídas. Os alvos continuam a mover a extremidade das faixas e a última peça. Os perfis transversais assinalam a linha de escoamento da valeta, o topo e a parte de trás do lancil, e o resto. Numa curva com espirais, a transição (runoff) é a espiral: abaulamento nivelado no TS, sobrelevação total no SC.

## Camadas do pavimento

Uma faixa, uma berma, uma valeta, uma faixa ajardinada ou um passeio pode ter a sua composição: em baixo da peça, {{ui:Adicionar uma camada}} acrescenta uma camada com um nome, um material, uma espessura e o seu tipo (desgaste, ligação, base, sub-base, leito ou outro), de cima para baixo. As camadas não alteram a superfície da estrada (o seu topo é a superfície de projeto); cada uma fica por baixo da sua peça, medida em profundidade vertical. Os perfis transversais desenham a base de cada camada como uma linha a tracejado, e {{ui:Camadas do pavimento: quantidades}} lista a área em planta e o volume de cada camada (área ao longo do corredor a partir das suas secções, volume = área × espessura). A exportação IFC escreve cada camada como elemento próprio com a sua espessura e material (veja [Exportação e importação IFC](topic:ifc)). A espessura que escreve é sua: o CivilCraft não dimensiona pavimentos.

## Onde as estradas encontram estradas, plataformas e caminhos

Com {{ui:Ligar às estradas e plataformas com que se cruza}} ativo (está ativo em todos os corredores), o CivilCraft liga um corredor àquilo com que se cruza em planta:

- **Uma estrada que termina noutra estrada** (o fim da sua diretriz fica sobre a outra estrada, ou a menos de cerca de metade da largura do seu próprio pavimento do bordo dessa estrada) é a estrada secundária de um entroncamento. A estrada que encontra abre o seu bordo para o pavimento da estrada secundária: ao longo da boca, a berma, o lancil, a faixa ajardinada e o passeio são assentes na inclinação transversal da faixa e desenhados como pavimento. A estrada secundária é assente na superfície da estrada principal onde as duas se sobrepõem, e é suavizada para cima ou para baixo até ela ao longo da aproximação.
- **Duas estradas que se cruzam** são ligadas da mesma forma dos dois lados. A estrada listada primeiro em Diretrizes é a estrada principal; a outra segue a sua superfície ao atravessá-la.
- **Uma estrada que termina num plataforma** (dentro dela, ou a menos de cerca de metade da largura do seu pavimento do seu bordo) chega à cota da plataforma e é suavizada até ela ao longo da aproximação.
- **Um caminho** (Paisagismo › Pavimentos e muros) para no bordo exterior de uma estrada, à cota do passeio ou da berma nesse ponto, em vez de passar por cima da estrada. Um caminho que atravessa uma estrada fica dividido em duas partes. Um fim desenhado um pouco antes de uma estrada (a menos de duas vezes a largura do caminho) é prolongado até ao seu bordo.

As **Propriedades** indicam o que cada corredor ligou, quanto foi elevado ou rebaixado nesse ponto e em que extensão. Essa extensão é o maior valor entre 10 m (30 ft) e vinte vezes a variação, e nunca mais de 45 % do corredor. **O perfil de projeto não é alterado**: a vista do perfil continua a mostrar a linha de rasante que desenhou, e as secções, a superfície projetada, os volumes e a vista 3D mostram a estrada tal como ligada. Para que a ligação seja exata por projeto, mova o último PVI para a cota que as Propriedades indicam.

Desligue o interruptor num corredor para o deixar exatamente como o perfil e o conjunto o definem; nesse caso não participa em nenhum entroncamento, nem como estrada secundária nem como estrada principal. As estradas que se encontram quase alinhadas (abaixo de cerca de 20°) ficam como estão, o mesmo acontecendo com os trilhos.

O que um entroncamento ainda não faz: não há concordâncias de lancil nos cantos (os cantos são retos), não há vias de viragem nem ilhéus, o fim da estrada secundária é cortado em esquadria em relação à sua própria diretriz, e um corredor construído a partir de modelos abre a sua berma da mesma forma simples (uma vala ou um muro na sua condição final é nivelado através da boca, sem passagem hidráulica). Para as concordâncias de lancil em planta, triângulos de visibilidade e marcação, veja [Solos, estradas, levantamento, minas e ligações](topic:soils-roads-survey-mines-links).

## O que ainda não está implementado

Os alvos para o talude de intersecção ainda não estão disponíveis. Para um corredor que muda ao longo da estrada, com esquerda e direita separadas, use [Modelos de corredor](topic:corridor-templates). Veja [Ainda não implementado](topic:not-built-yet).
