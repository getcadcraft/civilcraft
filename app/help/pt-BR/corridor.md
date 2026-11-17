---
title: Varrer um corredor viário
summary: Ative um corredor para um alinhamento, defina valores de faixa, acostamento e talude lateral, e leia as seções, as linhas de pé de talude e a terraplenagem produzidas.
keywords: superelevação, super, sobrelevação, rampa de transição, trecho de saída, tabela de taxas, declividade transversal, rotação, corredor, montagem, submontagem, seção típica, via, faixa, acostamento, talude lateral, pé de talude, corte, aterro, seções, alvo, alvos, alvo de largura, alvo de cota, alvo de deslocamento, alargamento, bordo da pista, seguir outro corredor
from: 91303189
---

Um corredor varre uma seção típica simples (uma montagem) ao longo de um alinhamento e do seu perfil de projeto, ajusta-a ao terreno natural e acrescenta o resultado à superfície projetada. Um alinhamento pode ter vários corredores em faixas de estacas diferentes, e um corredor pode ser construído a partir de modelos reutilizáveis por estaca ([Modelos de corredor](topic:corridor-templates)). A montagem simples abaixo é a mesma nos dois lados; para dar a cada lado suas próprias partes, veja [Construir cada lado a partir de partes](topic:corridor#build-each-side-from-parts).

## A montagem

A partir do eixo para fora, em cada lado:

1. uma **faixa** de determinada largura, caindo a partir do abaulamento na **declividade da faixa**
2. um **acostamento** de determinada largura na **declividade do acostamento**
3. um **talude lateral** a partir da borda do acostamento até o encontro com o terreno: o **talude de corte** onde o terreno está acima, o **talude de aterro** onde está abaixo

Os valores iniciais são provisórios, não um padrão de projeto:

| Valor | Pés (EUA) | Metros |
|---|---|---|
| Largura da faixa | 12 ft | 3.6 m |
| Declividade da faixa | 2% | 2% |
| Largura do acostamento | 4 ft | 1.2 m |
| Declividade do acostamento | 4% | 4% |
| Talude de corte | 2 : 1 | 2 : 1 |
| Talude de aterro | 3 : 1 | 3 : 1 |
| Seção a cada | 10 ft | 5 m |

Taludes laterais são medidos na horizontal para a vertical (H:V): 3 : 1 significa 3 na horizontal para 1 na vertical.

## Construir o corredor

É preciso ter um alinhamento sem erros e um perfil de projeto com pelo menos dois PVIs e sem erros.

1. Selecione o alinhamento.
2. No painel da direita, em **Corredor**, marque **Varrer uma montagem ao longo do perfil de projeto**.
   Os campos aparecem e o corredor é construído de imediato. A planta mostra as bordas da faixa e do acostamento e as linhas de pé de talude; com {{ui:Projetado (terraplenado)}} escolhido em **Exibir**, as curvas de nível mostram o terreno novo.
3. Altere qualquer valor: **Largura da faixa**, **Declividade da faixa**, **Largura do acostamento**, **Declividade do acostamento**, **Talude de corte**, **Talude de aterro**, **Seção a cada**. Pressione {{key:Enter}} depois de cada um. Os taludes de corte e de aterro e o espaçamento das seções devem ser maiores que 0.
4. Leia a linha abaixo dos campos, por exemplo "39 seções de 0+00.00 a 3+86.36; corte 240.2 cu yd, aterro 556.0 cu yd."

As seções são cortadas a cada passo de **Seção a cada**, nas extremidades e no início e no fim de cada curva horizontal e vertical. Cada seção e as linhas que passam por elas (eixo, bordas da faixa e do acostamento, pé de talude) tornam-se linhas de quebra da superfície projetada.

Para desligar o corredor, desmarque a caixa. Os valores dele são mantidos para a próxima vez.

## Quando não é construído

Uma caixa vermelha abaixo dos campos informa o motivo:

| Mensagem | O que fazer |
|---|---|
| "O corredor precisa de um perfil de projeto sem erros." | Adicione PVIs ou corrija as curvas verticais sobrepostas (veja [Projetar um perfil vertical](topic:profile)). |
| "O perfil de projeto não se sobrepõe ao alinhamento." | Mova os PVIs para a faixa de estacas do alinhamento. |
| "O corredor precisa de pelo menos duas seções sobre a superfície." | A maior parte do corredor está fora do terreno natural. |
| "4 taludes laterais saem da superfície antes de encontrar o terreno." | Perto da borda da superfície, o talude não consegue alcançar o terreno. Afaste a via da borda ou reduza a altura do aterro ou do corte ali. |
| "As linhas de pé de talude do corredor se cruzam (seções se sobrepõem, por exemplo na parte interna de uma curva fechada). Use um raio maior ou uma montagem mais estreita." | As seções na parte interna de uma curva acentuada se sobrepõem. Aumente o raio ou estreite a montagem. |

Um corredor com problema não é terraplenado e não entra na terraplenagem.

## Corredores e plataformas juntos

A superfície projetada é construída em ordem: primeiro todos os corredores, depois todas as plataformas. Onde a terraplenagem de uma plataforma se sobrepõe a um corredor, a plataforma prevalece. Os volumes são calculados dentro de todas as linhas de pé de talude juntas; veja [Volumes de terraplenagem](topic:volumes).

## Superelevação

Em uma curva, a via pode inclinar-se para o lado interno, assim o tráfego é empurrado menos para fora. Marque **Superelevar as curvas** em **Superelevação**, nas **Propriedades** do alinhamento:

- Cada curva circular recebe uma taxa **e** da tabela de taxas: a primeira linha cujo raio a curva alcança (uma linha com taxa vazia mantém o abaulamento normal). A tabela e o **Gradiente relativo máximo** (0.5 % no início) são provisórios, não um padrão: defina-os a partir dos seus próprios critérios de projeto. Adicione ou remova linhas conforme precisar.
- As faixas giram em torno do eixo. Antes da curva, a faixa externa se achata ao longo do **trecho de saída** (abaulamento normal ÷ e × rampa de transição) e, depois, ao longo da **rampa de transição** (largura da faixa × e ÷ o gradiente) a faixa externa continua girando até que toda a via tenha inclinação e para o lado interno; dois terços da rampa de transição ficam antes da curva e um terço sobre ela. Depois da curva, o mesmo acontece ao contrário.
- Um acostamento do lado baixo nunca é mais plano que a sua faixa; do lado alto, ele mantém a própria declividade (ele acompanha a inclinação).
- A tabela abaixo lista o raio, a taxa, a rampa de transição e o trecho de saída de cada curva, e onde a superelevação completa começa e termina. O **diagrama de superelevação** desenha as declividades transversais das duas faixas ao longo das estacas (a faixa esquerda em linha contínua, a direita tracejada).
- Uma curva curta demais para atingir a superelevação completa, ou duas curvas cujas rampas de transição se sobrepõem, é informada em uma caixa acima da tabela.

Seções, volumes, a visualização 3D e as folhas mostram todos a via inclinada. Cada alteração é uma etapa: {{key:Mod+Z}} a desfaz.

## Alvos

Um alvo move um ponto de um lado da via até uma linha: o **Bordo da pista** ou a **Borda do acostamento**, na **Esquerda** ou na **Direita**. Cada seção encontra a linha em ângulo reto com o eixo, saindo apenas desse lado, então um alvo à direita nunca move o lado esquerdo.

| Define | O que acontece onde a seção encontra a linha |
|---|---|
| **Largura** | O ponto fica sobre a linha: a faixa (ou o acostamento) se alarga ou se estreita até ela, mantendo sua declividade transversal. |
| **Cota** | O ponto assume ali a cota da linha, no próprio deslocamento: a declividade transversal da faixa (ou do acostamento) acompanha. |

A linha pode ser uma linha de feição (qualquer que seja o seu **Uso**) ou uma linha de outro corredor: o eixo dele, os bordos da pista, as bordas do acostamento ou as linhas de pé de talude. A linha de um corredor acompanha esse corredor: altere a outra via e esta acompanha. O CivilCraft constrói primeiro o outro corredor; dois corredores que se teriam como alvo em um ciclo são recusados de um lado, e a tabela informa qual.

1. Selecione o alinhamento e ligue o corredor dele.
2. Em **Alvos**, clique em {{ui:Adicionar um alvo}}.
3. Escolha o **Lado**, o **Ponto**, o que ele **Define** e **Até a linha**. Cada alteração é uma etapa de desfazer.

**Resultado** informa em quantas seções a linha foi atingida. Seções que não a alcançam (além das extremidades dela, ou onde ela fica atrás do eixo) mantêm os valores da montagem. Uma linha excluída deixa o corredor como estava antes do alvo, e a tabela informa isso. Um lado pode ter um alvo de largura e um de cota para cada ponto.

## Construir cada lado a partir de partes

Ative **Construir cada lado a partir de partes** nas configurações do corredor. Cada lado passa então a ter sua própria lista, do eixo para fora: faixas, um acostamento, uma sarjeta, um meio-fio, uma faixa de plantio, uma calçada e, por último, o talude lateral até o terreno (com suas próprias relações de corte e aterro). Comece por {{ui:Estrada rural}} ou {{ui:Via urbana}}, adicione e remova partes, mova-as com as setas e {{ui:Copiar}} um lado para o outro. Cada alteração é uma etapa de desfazer.

A declividade transversal é a queda para fora da via, então uma calçada que drena em direção à via tem valor negativo. Um meio-fio é uma face com a altura que você informar, um topo com a largura que você informar e um desnível opcional na parte de trás. A superelevação gira todas as faixas da primeira linha; a sarjeta, o meio-fio, a faixa e a calçada pendem da borda das faixas como construídas. Os alvos ainda movem o fim das faixas e a última parte. As seções transversais marcam a linha de fundo da sarjeta, o topo e o fundo do meio-fio, e o restante. Em uma curva com espirais, a rampa de transição é a espiral: abaulamento nivelado no TS, superelevação completa no SC.

## Camadas do pavimento

Uma faixa, um acostamento, uma sarjeta, uma faixa de plantio ou uma calçada pode ter sua própria composição: sob a parte, {{ui:Adicionar uma camada}} acrescenta uma camada com nome, material, espessura e tipo (revestimento, ligação, base, sub-base, reforço do subleito ou outro), de cima para baixo. As camadas não alteram a superfície da via (o topo dela é a superfície de projeto); cada uma fica sob sua parte, com a profundidade medida na vertical. As seções transversais desenham o fundo de cada camada como linha tracejada, e {{ui:Camadas do pavimento: quantidades}} lista a área em planta e o volume de cada camada (área ao longo do corredor a partir das seções, volume = área × espessura). A exportação IFC grava cada camada como um elemento próprio, com sua espessura e material (veja [Exportação e importação IFC](topic:ifc)). A espessura que você digitar é sua: o CivilCraft não dimensiona pavimentos.

## Ainda não implementado

Alvos para a declividade do pé de talude ainda não estão disponíveis. Para um corredor que muda ao longo da via, com esquerda e direita separadas, use [Modelos de corredor](topic:corridor-templates). Veja [Ainda não implementado](topic:not-built-yet).
