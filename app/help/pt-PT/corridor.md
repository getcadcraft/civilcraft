---
title: Gerar um corredor rodoviário por varrimento
summary: Ative um corredor para uma diretriz, defina os valores de via, berma e talude lateral, e leia os perfis transversais, as linhas de intersecção do talude e os movimentos de terras que produz.
keywords: sobrelevação, super, inclinação em curva, transição, tabela de taxas, inclinação transversal, rotação, corredor, perfil transversal tipo, subconjunto, estrada, via, berma, talude lateral, linha de intersecção do talude, escavação, aterro, perfis transversais, alvo, alvos, alvo de largura, alvo de cota, alvo de afastamento, alargamento, bordo do pavimento, seguir outro corredor
from: 91303189
---

Um corredor faz varrer um perfil transversal tipo simples ao longo de uma diretriz e do seu perfil longitudinal de projeto, modela-o no terreno existente e acrescenta o resultado à superfície proposta. Uma diretriz pode ter vários corredores em intervalos de PK diferentes, e um corredor pode ser construído a partir de modelos reutilizáveis por PK ([Modelos de corredor](topic:corridor-templates)). O perfil transversal tipo simples abaixo é igual nos dois lados; para dar a cada lado as suas próprias partes, veja [Construir cada lado a partir de partes](topic:corridor#build-each-side-from-parts).

## O perfil transversal tipo

Do eixo para fora, de cada lado:

1. uma **via** com uma largura dada, que desce a partir do abaulamento com a **inclinação da via**
2. uma **berma** com uma largura dada, com a **inclinação da berma**
3. um **talude lateral** a partir do bordo da berma até encontrar o terreno: o **talude de escavação** onde o terreno está acima, e o **talude de aterro** onde está abaixo

Os valores iniciais são valores provisórios, não uma norma de projeto:

| Valor | Pés (EUA) | Metros |
|---|---|---|
| Largura da via | 12 ft | 3.6 m |
| Inclinação da via | 2% | 2% |
| Largura da berma | 4 ft | 1.2 m |
| Inclinação da berma | 4% | 4% |
| Talude de escavação | 2 : 1 | 2 : 1 |
| Talude de aterro | 3 : 1 | 3 : 1 |
| Perfil transversal a cada | 10 ft | 5 m |

Os taludes laterais são indicados na horizontal para a vertical (H:V): 3 : 1 significa 3 na horizontal para 1 na vertical.

## Construir o corredor

É preciso uma diretriz sem erros e um perfil longitudinal de projeto com pelo menos dois PVI e sem erros.

1. Selecione a diretriz.
2. No painel direito, em **Corredor**, marque **Varrer um perfil transversal tipo ao longo do perfil de projeto**.
   Os campos aparecem e o corredor é construído de imediato. A planta mostra as arestas da via e da berma e as linhas de intersecção do talude; com {{ui:Proposta (modelada)}} escolhido em **Visualização**, as curvas de nível mostram o novo terreno.
3. Altere qualquer valor: **Largura da via**, **Inclinação da via**, **Largura da berma**, **Inclinação da berma**, **Talude de escavação**, **Talude de aterro**, **Perfil transversal a cada**. Prima {{key:Enter}} depois de cada um. Os taludes de escavação e de aterro e o espaçamento dos perfis transversais têm de ser superiores a 0.
4. Leia a linha por baixo dos campos, por exemplo "39 perfis transversais de 0+00.00 a 3+86.36; escavação 240.2 cu yd, aterro 556.0 cu yd."

Os perfis transversais são traçados a cada passo de **Perfil transversal a cada**, nas extremidades, e no início e no fim de cada curva horizontal e vertical. Cada perfil e as linhas que passam por eles (eixo, arestas da via e da berma, linhas de intersecção do talude) tornam-se linhas de quebra da superfície proposta.

Para desativar o corredor, desmarque a caixa. Os seus valores ficam guardados para a próxima vez.

## Quando não é construído

Uma caixa vermelha por baixo dos campos indica a razão:

| Mensagem | O que fazer |
|---|---|
| « O corredor precisa de um perfil de projeto sem erros. » | Acrescente PVI, ou corrija as curvas verticais que se sobrepõem (veja [Desenhar um perfil vertical](topic:profile)). |
| « O perfil de projeto não se sobrepõe à diretriz. » | Mova os PVI para o intervalo de PK da diretriz. |
| « O corredor precisa de pelo menos dois perfis transversais na superfície. » | A maior parte do corredor está fora do terreno existente. |
| « 4 taludes laterais saem da superfície antes de encontrar o terreno. » | Perto do limite da superfície, o talude não consegue chegar ao terreno. Afaste a estrada do limite, ou reduza a altura de aterro ou de escavação nesse ponto. |
| « As linhas de intersecção do talude do corredor cruzam-se (os perfis sobrepõem-se, por exemplo no interior de uma curva apertada). Use um raio maior ou um perfil transversal tipo mais estreito. » | Os perfis no interior de uma curva apertada sobrepõem-se. Aumente o raio ou estreite o perfil transversal tipo. |

Um corredor com problemas não é modelado e não entra nos movimentos de terras.

## Corredores e plataformas em conjunto

A superfície proposta é construída por ordem: primeiro todos os corredores, depois todas as plataformas. Onde a modelação de uma plataforma se sobrepõe a um corredor, a plataforma prevalece. Os volumes são calculados em conjunto dentro de todas as linhas de intersecção do talude; veja [Volumes de movimentos de terras](topic:volumes).

## Sobrelevação

Numa curva, a estrada pode inclinar-se para o interior, para que o tráfego seja menos empurrado para o exterior. Marque **Sobrelevar as curvas** em **Sobrelevação** nas **Propriedades** da diretriz:

- Cada curva circular recebe uma taxa **e** da tabela de taxas: a primeira linha cujo raio a curva atinge (uma linha com taxa vazia mantém o abaulamento normal). A tabela e o **Declive relativo máximo** (0.5 % para começar) são valores provisórios, não uma norma: defina-os a partir dos seus próprios critérios de projeto. Acrescente ou remova linhas conforme precisar.
- As vias rodam em torno do eixo. Antes da curva, a via exterior aplana ao longo da **transição de saída** (abaulamento normal ÷ e × transição); depois, ao longo da **transição** (largura da via × e ÷ o declive), a via exterior continua a rodar até toda a estrada inclinar para o interior com a taxa e. Dois terços da transição ficam antes da curva e um terço sobre ela. Depois da curva, acontece o mesmo ao contrário.
- Uma berma do lado baixo nunca é mais plana do que a sua via; no lado alto mantém a sua própria inclinação (rola).
- A tabela por baixo lista o raio, a taxa, a transição e a transição de saída de cada curva e onde a sobrelevação total começa e termina. O **diagrama de sobrelevação** desenha as inclinações transversais das duas vias ao longo dos PK (a via esquerda a cheio, a direita a tracejado).
- Uma curva demasiado curta para atingir a sobrelevação total, ou duas curvas cujas transições se sobrepõem, é indicada numa caixa acima da tabela.

Perfis transversais, volumes, a vista 3D e as folhas mostram todos a estrada inclinada. Cada alteração é um passo: {{key:Mod+Z}} desfaz essa ação.

## Alvos

Um alvo move um ponto de um lado da estrada para uma linha: o **Bordo da faixa de rodagem** ou o **Bordo da berma**, à **Esquerda** ou à **Direita**. Cada perfil encontra a linha em ângulo reto com o eixo, indo para fora apenas desse lado, por isso um alvo à direita nunca move o lado esquerdo.

| Define | O que acontece onde um perfil encontra a linha |
|---|---|
| **Largura** | O ponto fica sobre a linha: a via (ou a berma) alarga-se ou estreita-se até lá, mantendo a sua inclinação transversal. |
| **Cota** | O ponto assume a cota da linha nesse ponto, ao seu próprio afastamento: a inclinação transversal da via (ou da berma) acompanha. |

A linha pode ser uma linha característica (qualquer que seja a sua **Utilização**) ou uma linha de outro corredor: o seu eixo, os bordos da faixa de rodagem, os bordos da berma ou as linhas de intersecção do talude. A linha de um corredor segue esse corredor: altere a outra estrada e esta segue. O CivilCraft constrói primeiro o outro corredor; dois corredores que se visassem mutuamente num ciclo são recusados de um lado, e a tabela indica qual.

1. Selecione a diretriz e ative o seu corredor.
2. Em **Alvos**, clique em {{ui:Adicionar um alvo}}.
3. Escolha o **Lado**, o **Ponto**, o que **Define** e a **Linha de destino**. Cada alteração é um passo de anulação.

**Resultado** indica em quantos perfis a linha foi atingida. Os perfis que não a atingem (para além dos seus extremos, ou onde fica atrás do eixo) mantêm os valores da montagem. Uma linha que é eliminada deixa o corredor como estava antes do alvo, e a tabela di-lo. Um lado pode ter uma largura e uma cota de alvo para cada ponto.

## Construir cada lado a partir de partes

Ative **Construir cada lado a partir de partes** nas definições do corredor. Cada lado tem então a sua própria lista, do eixo para fora: vias, uma berma, uma sarjeta, um lancil, uma faixa de plantação, um passeio e, por fim, o talude lateral até ao terreno (com as suas próprias razões de escavação e aterro). Comece por {{ui:Estrada rural}} ou {{ui:Arruamento urbano}}, acrescente e remova partes, mova-as com as setas e use {{ui:Copiar}} para copiar um lado para o outro. Cada alteração é um passo de anulação.

A inclinação transversal é a descida para longe da estrada, pelo que um passeio que drena para a estrada tem valor negativo. Um lancil é uma face da altura que indicar, um topo da largura que indicar e uma queda opcional na parte de trás. A sobrelevação roda todas as vias da primeira linha; a sarjeta, o lancil, a faixa e o passeio partem da aresta das vias tal como construídas. Os alvos continuam a mover o fim das vias e a última parte. Os perfis transversais marcam a linha de escoamento da sarjeta, o topo e a parte de trás do lancil, e o resto. Numa curva com espirais, a transição é a própria espiral: abaulamento nivelado no TS, sobrelevação total no SC.

## Camadas do pavimento

Uma via, berma, sarjeta, faixa de plantação ou passeio pode ter a sua estrutura: por baixo da parte, {{ui:Adicionar uma camada}} acrescenta uma camada com um nome, um material, uma espessura e o seu tipo (desgaste, ligação, base, sub-base, coroamento ou outro), de cima para baixo. As camadas não alteram a superfície da estrada (o seu topo é a superfície de projeto); cada uma fica por baixo da sua parte, com a profundidade medida na vertical. Os perfis transversais desenham a base de cada camada como uma linha tracejada, e {{ui:Camadas do pavimento: quantidades}} lista a área em planta e o volume de cada camada (área ao longo do corredor a partir dos seus perfis; volume = área × espessura). A exportação IFC escreve cada camada como o seu próprio elemento, com a sua espessura e material (veja [Exportação e importação IFC](topic:ifc)). A espessura que escreve é sua: o CivilCraft não dimensiona pavimentos.

## O que ainda não está construído

Os alvos para a linha de intersecção do talude ainda não estão disponíveis. Para um corredor que muda ao longo da estrada, com a esquerda e a direita separadas, use [Modelos de corredor](topic:corridor-templates). Veja [Ainda não implementado](topic:not-built-yet).
