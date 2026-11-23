---
title: Varrer um corredor viário
summary: Ative um corredor para um alinhamento, defina os valores de faixa, acostamento e talude, e leia as seções, as linhas de pé de talude e a terraplenagem que ele produz.
keywords: interseção, estrada encontra estrada, via secundária, cruzamento em T, cruzamento, cota da plataforma, junção, amarração, superelevação, super, sobrelevação, transição de superelevação, rampa de saída, tabela de taxas, declividade transversal, rotação, corredor, montagem, subcomponente, seção-tipo, estrada, faixa, acostamento, declividade transversal, talude, pé de talude, seções, alvo, alvos, alvo de largura, alvo de cota, alvo de deslocamento, alargamento, borda da pista, seguir outro corredor
from: 6dcb92b3
---

Um corredor varre uma seção-tipo simples (uma montagem) ao longo de um alinhamento e do seu perfil de projeto, ajusta-a ao terreno natural e acrescenta o resultado à superfície projetada. Um alinhamento pode ter vários corredores em trechos de estaca diferentes, e um corredor pode ser construído a partir de modelos reutilizáveis por estaca ([Modelos de corredor](topic:corridor-templates)). A montagem simples abaixo é igual nos dois lados; para dar a cada lado suas próprias partes, veja [Construir cada lado a partir de partes](topic:corridor#build-each-side-from-parts).

## A montagem

Do eixo para fora, em cada lado:

1. uma **faixa** de largura definida, descendo a partir do abaulamento com a **declividade da faixa**
2. um **acostamento** de largura definida com a **declividade do acostamento**
3. um **talude** a partir da borda do acostamento até encontrar o terreno: o **talude de corte** onde o terreno está acima, o **talude de aterro** onde está abaixo

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

Os taludes são dados na horizontal para a vertical (H:V): 3 : 1 significa 3 na horizontal para 1 na vertical.

## Construir o corredor

Você precisa de um alinhamento sem erros e de um perfil de projeto com pelo menos dois PIVs e sem erros.

1. Selecione o alinhamento.
2. No painel da direita, em **Corredor**, marque **Varrer uma montagem ao longo do perfil de projeto**.
   Os campos aparecem e o corredor é construído de imediato. A planta mostra as bordas da faixa e do acostamento e as linhas de pé de talude; com {{ui:Proposed (graded)}} escolhido em **Exibir**, as curvas de nível mostram o terreno novo.
3. Altere qualquer valor: **Largura da faixa**, **Declividade da faixa**, **Largura do acostamento**, **Declividade do acostamento**, **Talude de corte**, **Talude de aterro**, **Seção a cada**. Pressione {{key:Enter}} após cada um. Corte, aterro e espaçamento de seções devem ser maiores que 0.
4. Leia a linha abaixo dos campos, por exemplo "39 seções de 0+00.00 a 3+86.36; corte 240.2 cu yd, aterro 556.0 cu yd."

As seções são cortadas a cada passo de **Seção a cada**, nas extremidades, e no início e no fim de cada curva horizontal e vertical. Cada seção e as linhas que passam por elas (eixo, bordas da faixa e do acostamento, pé de talude) tornam-se linhas de quebra da superfície projetada.

Para desligar o corredor, desmarque a caixa. Os valores são mantidos para a próxima vez.

## Quando ele não é construído

Uma caixa vermelha abaixo dos campos diz o motivo:

| Mensagem | O que fazer |
|---|---|
| "O corredor precisa de um perfil de projeto sem erros." | Adicione PIVs ou corrija as curvas verticais sobrepostas (veja [Projetar um perfil longitudinal](topic:profile)). |
| "O perfil de projeto não se sobrepõe ao alinhamento." | Mova os PIVs para o intervalo de estacas do alinhamento. |
| "O corredor precisa de pelo menos duas seções na superfície." | A maior parte do corredor está fora do terreno natural. |
| "4 taludes saem da superfície antes de encontrar o terreno." | Perto da borda da superfície, o talude não alcança o terreno. Afaste a estrada da borda, ou reduza a altura do aterro ou do corte ali. |
| "As linhas de pé de talude do corredor se cruzam (seções se sobrepõem, por exemplo na parte interna de uma curva fechada). Use um raio maior ou uma montagem mais estreita." | As seções na parte interna de uma curva acentuada se sobrepõem. Aumente o raio ou estreite a montagem. |

Um corredor com problema não é projetado no terreno e não entra na terraplenagem.

## Corredores e plataformas juntos

A superfície projetada é construída em ordem: primeiro todos os corredores, depois todas as plataformas. Onde a regularização de uma plataforma se sobrepõe a um corredor, prevalece a plataforma. Onde um item posterior se sobrepõe a uma estrada, só a parte da estrada dentro da linha de pé de talude do item posterior é substituída; o restante da estrada, e qualquer linha de quebra do terreno que a estrada cruza, mantém sua forma. Os volumes são calculados dentro de todas as linhas de pé de talude juntas; veja [Volumes de terraplenagem](topic:volumes).

## Superelevação

Numa curva, a estrada pode inclinar-se para o lado interno, de modo que o tráfego seja menos empurrado para fora. Marque **Superelevar as curvas** em **Superelevação** nas **Propriedades** do alinhamento:

- Cada curva circular recebe uma taxa **e** da tabela de taxas: a primeira linha cujo raio a curva alcança (uma linha com taxa vazia mantém o abaulamento normal). A tabela e a **Declividade relativa máxima** (0.5 % para começar) são provisórias, não uma norma: defina-as com os critérios de projeto da sua equipe. Adicione ou remova linhas conforme precisar.
- As faixas giram em torno do eixo. Antes da curva, a faixa externa se achata ao longo do **trecho de saída** (abaulamento normal ÷ e × trecho de transição); depois, ao longo do **trecho de transição** (largura da faixa × e ÷ a declividade), a faixa externa continua girando até que toda a estrada tenha inclinação e em direção ao lado interno. Dois terços do trecho de transição ficam antes da curva e um terço sobre ela. Depois da curva, acontece o inverso.
- Um acostamento do lado baixo nunca é mais plano que a sua faixa; do lado alto, mantém a sua própria declividade (ele acompanha a inclinação).
- A tabela abaixo lista o raio, a taxa, o trecho de transição e o trecho de saída de cada curva, e onde começa e termina a superelevação plena. O **diagrama de superelevação** desenha as declividades transversais das duas faixas ao longo das estacas (faixa esquerda contínua, direita tracejada).
- Uma curva curta demais para atingir a superelevação plena, ou duas curvas cujas transições se sobrepõem, é indicada em uma caixa acima da tabela.

Seções, volumes, a vista 3D e as folhas mostram a estrada inclinada. Cada alteração é um passo: {{key:Mod+Z}} desfaz.

## Alvos

Um alvo move um ponto de um lado da estrada até uma linha: a **Borda da pista** ou a **Borda do acostamento**, na **Esquerda** ou na **Direita**. Cada seção encontra a linha em ângulo reto com o eixo, indo para fora apenas daquele lado; um alvo à direita nunca move o lado esquerdo.

| Define | O que acontece onde a seção encontra a linha |
|---|---|
| **Largura** | O ponto fica sobre a linha: a faixa (ou o acostamento) se alarga ou se estreita até ela, mantendo sua declividade transversal. |
| **Cota** | O ponto assume a cota da linha ali, na sua própria distância ao eixo: a declividade transversal da faixa (ou do acostamento) acompanha. |

A linha pode ser uma linha de feição (qualquer que seja o seu **Uso**) ou uma linha de outro corredor: o seu eixo, bordas da pista, bordas do acostamento ou linhas de pé de talude. A linha de um corredor acompanha esse corredor: mude a outra estrada e esta acompanha. A CivilCraft constrói primeiro o outro corredor; dois corredores que se teriam como alvo mutuamente em laço são recusados de um lado, e a tabela informa qual.

1. Selecione o alinhamento e ligue o corredor dele.
2. Em **Alvos**, clique em {{ui:Add a target}}.
3. Escolha o **Lado**, o **Ponto**, o que ele **Define** e a **Até a linha**. Cada alteração é um passo de desfazer.

**Resultado** informa em quantas seções a linha foi alcançada. Seções que não a alcançam (além das suas extremidades, ou onde ela fica atrás do eixo) mantêm os valores da montagem. Uma linha que é excluída deixa o corredor como era antes do alvo, e a tabela informa isso. Um lado pode ter um alvo de largura e um alvo de cota para cada ponto.

## Construir cada lado a partir de partes

Ative **Construir cada lado a partir de partes** nas configurações do corredor. Cada lado passa a ter sua própria lista, do eixo para fora: faixas, um acostamento, uma sarjeta, um meio-fio, uma faixa de plantio, uma calçada e, por último, o talude até o terreno (com suas próprias relações de corte e aterro). Comece por {{ui:Rural road}} ou {{ui:Urban street}}, adicione e remova partes, mova-as com as setas e use {{ui:Copy}} para levar um lado ao outro. Cada alteração é um passo de desfazer.

Uma declividade transversal é a queda para longe da estrada, então uma calçada que drena para a estrada é negativa. Um meio-fio é uma face da altura que você informa, um topo da largura que você informa e um recuo opcional na parte de trás. A superelevação gira todas as faixas da primeira linha; a sarjeta, o meio-fio, a faixa e a calçada pendem da borda das faixas como construídas. Os alvos ainda movem a extremidade das faixas e a última parte. As seções transversais marcam a linha de fundo da sarjeta, o topo e o fundo do meio-fio, e o restante. Numa curva com espirais, o trecho de transição é a espiral: abaulamento nivelado no TS, superelevação plena no SC.

## Camadas do pavimento

Uma faixa, um acostamento, uma sarjeta, uma faixa de plantio ou uma calçada pode ter a sua composição: em baixo da parte, {{ui:Add a course}} adiciona uma camada com nome, material, espessura e tipo (revestimento, ligante, base, sub-base, reforço do subleito ou outro), de cima para baixo. As camadas não alteram a superfície da estrada (o topo dela é a superfície de projeto); cada uma fica sob a sua parte, com a profundidade medida na vertical. As seções transversais desenham a base de cada camada como linha tracejada, e {{ui:Pavement courses: quantities}} lista a área em planta e o volume de cada camada (área ao longo do corredor a partir das seções; volume = área × espessura). A exportação IFC grava cada camada como elemento próprio, com sua espessura e material (veja [Exportação e importação IFC](topic:ifc)). A espessura que você digita é sua: a CivilCraft não dimensiona pavimentos.

## Onde estradas encontram estradas, plataformas e caminhos

Com {{ui:Join the roads and pads it meets}} ligado (está ligado em todo corredor), a CivilCraft junta um corredor àquilo que ele encontra em planta:

- **Uma estrada que termina em outra estrada** (a extremidade do alinhamento dela fica sobre a outra estrada, ou a até cerca de metade da largura de pista dela da borda dessa estrada) é a via secundária de uma interseção. A estrada encontrada abre sua borda para a pista da via secundária: na boca, o acostamento, o meio-fio, a faixa e a calçada são assentados com a declividade transversal da faixa e desenhados como pavimento. A via secundária é assentada sobre a superfície da via principal onde as duas se sobrepõem, e suavizada para subir ou descer até ela ao longo da aproximação.
- **Duas estradas que se cruzam** são unidas da mesma forma nos dois lados. A estrada listada primeiro em Alinhamentos é a via principal; a outra acompanha a superfície dela através do cruzamento.
- **Uma estrada que termina em uma plataforma** (dentro dela, ou a até cerca de metade da largura do pavimento da borda dela) chega à cota da plataforma e é suavizada até ela ao longo da aproximação.
- **Um caminho** (Paisagismo › {{ui:Hardscape}}) para na borda externa de uma estrada, na cota da calçada ou do acostamento ali, em vez de passar por cima da estrada. Um caminho que cruza uma estrada vira duas partes. Uma extremidade desenhada um pouco aquém de uma estrada (a até duas vezes a largura do caminho) é prolongada até a borda dela.

Propriedades diz o que cada corredor uniu, em quanto foi elevado ou rebaixado ali e em que extensão. Essa extensão é o maior valor entre 10 m (30 ft) e vinte vezes a variação, e nunca mais de 45 % do corredor. **O perfil de projeto não é alterado**: a vista do perfil continua mostrando a linha de greide que você desenhou, e as seções, a superfície projetada, os volumes e a vista 3D mostram a estrada como unida. Para tornar a união exata por projeto, mova o último PIV até a cota que as Propriedades informam.

Desligue o interruptor de um corredor para deixá-lo exatamente como o seu perfil e a montagem definem; ele então não participa de nenhuma junção, nem como via secundária nem como via principal. Estradas que se encontram quase alinhadas (abaixo de cerca de 20°) são deixadas de lado, assim como as trilhas.

O que uma junção ainda não faz: não há curvas de meio-fio nas esquinas (os cantos são retos), não há faixas de conversão nem ilhas, a extremidade da via secundária é cortada em esquadro com o próprio alinhamento, e um corredor construído a partir de modelos abre a sua borda do mesmo modo simples (uma vala ou um muro na condição final é nivelado através da boca, sem bueiro). Para curvas de meio-fio em planta, triângulos de visada e sinalização, veja [Solos, estradas, levantamento, minas e links](topic:soils-roads-survey-mines-links).

## O que ainda não foi implementado

Alvos para a declividade até o pé de talude ainda não estão disponíveis. Para um corredor que muda ao longo da estrada, com esquerda e direita separadas, use [Modelos de corredor](topic:corridor-templates). Veja [Ainda não implementado](topic:not-built-yet).
