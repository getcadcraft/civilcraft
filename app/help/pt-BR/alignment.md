---
title: Desenhar um alinhamento horizontal
summary: Desenhe um alinhamento pelos seus PIs, defina os raios das curvas e a estaca inicial, mova PIs e leia os dados das curvas, a estaca e o deslocamento.
keywords: alinhamento, sem solução, curva não cabe, maior raio, menor raio, raio mínimo, velocidade de projeto, sobreposição, eixo, pi, curva horizontal, raio, estaqueamento, tangente, criar alinhamento, layout de alinhamento, pc, pt, estaca deslocamento
from: 8c5df4aa
---

Um alinhamento no CivilCraft é uma cadeia de tangentes ligadas por pontos de interseção (PI), com uma curva circular em cada PI intermediário que tenha raio. Ele é estaqueado a partir de uma estaca inicial que você escolhe. Um projeto pode ter vários alinhamentos.

## Desenhe o alinhamento

1. Pressione {{key:A}}, ou clique em {{ui:Alinhamento}} no grupo **Projeto**.
   A dica diz "Alinhamento: clique nos PIs em ordem. Enter ou duplo clique finaliza, Backspace remove o último, Esc cancela."
2. Clique no primeiro PI (o início do alinhamento).
3. Clique em cada PI seguinte, em ordem. Uma linha vermelha acompanha o ponteiro e mostra o comprimento e o rumo da tangente que você está desenhando, por exemplo "212.40 ft  N 63°12'05" L".
4. Clique no último PI (o fim do alinhamento).
5. Pressione {{key:Enter}}.
   O alinhamento é desenhado com estaqueamento e fica selecionado. A barra de status diz, por exemplo, "Alinhamento 1: 386.36 ft, curvas de raio 100 ft onde couberem. Edite os raios em Propriedades; Perfil (R) para projetar o greide."

Enquanto desenha: {{key:Backspace}} remove o último PI, {{key:Esc}} cancela, e arrastar em espaço vazio faz pan sem adicionar um PI.

:::warning
Finalize com {{key:Enter}}. O duplo clique também finaliza, mas nesta versão ele elimina o PI em que você deu duplo clique. Clique no último PI uma vez e depois pressione {{key:Enter}}.
:::

Cada PI intermediário recebe uma curva de 100 ft (30 m em projeto métrico), ou o maior raio inteiro que caiba na metade de cada tangente se 100 ft não couber. PIs muito agudos ou em linha reta não recebem curva.

## Defina raios e coordenadas

Com o alinhamento selecionado, o painel direito mostra **Alinhamento**:

1. **Nome** e **Estaca inicial**. Digite uma estaca como `10+00` (pés) ou `0+500` (metros), ou como um número simples. Veja [Unidades, estacas e formatos numéricos](topic:units-and-stations).
2. **Comprimento** e **Estaca final** são calculados para você.
3. A tabela **PIs** lista o **Leste** e o **Norte** de cada PI, e um **Raio** para cada PI intermediário. Digite um novo valor e pressione {{key:Enter}}.
   - Raio 0 cria um ponto de ângulo sem curva.
   - O primeiro e o último PI nunca têm raio.
   - O pequeno x no fim de uma linha remove esse PI (um alinhamento mantém pelo menos dois).
4. Leia a lista **Curvas**: para cada curva, as estacas PC e PT, o raio R, a deflexão Δ e o sentido (esquerda ou direita), o comprimento L, a tangente T, a externa E e a corda.
5. A linha sob as curvas dá o rumo da primeira tangente.

## Quando uma curva não cabe

Se as curvas precisarem de mais tangente do que há entre os seus PIs, o alinhamento não tem solução: ele não é desenhado corretamente até você corrigi-lo, e fica de fora das exportações LandXML. Uma caixa vermelha diz o motivo, em números, e oferece o que caberia:

- "As curvas nos PI 2 e PI 3 precisam de 240.00 ft de tangente entre elas (130.00 + 110.00), mas os PIs estão a 180.00 ft de distância." — ou, quando só uma delas tem curva, "A curva no PI 2 precisa de 240.00 ft de tangente em direção ao PI 1 …".
- Um botão para cada PI define **o maior raio que cabe** ali, mantendo a outra curva como está (ele também precisa caber na outra tangente do PI). Quando os dois PIs têm curvas, **Ambos** reduz os dois raios proporcionalmente para que apenas se encontrem.
- Quando uma só curva é maior que a tangente, a caixa diz que nenhuma curva no outro PI cabe enquanto ela estiver nesse tamanho.
- Um PI que volta em linha reta não pode receber curva; a caixa oferece **Sem curva no PI n**.

Cada botão é um passo: {{key:Mod+Z}} devolve os raios. Os raios oferecidos são arredondados para baixo em 0.01, para que sempre caibam.

### Um raio mínimo de projeto

Digite um **Raio mínimo de projeto** (por exemplo, a partir da sua velocidade de projeto) para verificar cada curva contra ele; deixe vazio para nenhum. Uma curva abaixo dele é listada com um botão para **o menor raio que atende ao mínimo**, quando esse raio cabe. Quando não cabe, a caixa diz isso e informa o maior raio que as tangentes permitem, para que você saiba mover um PI ou reduzir o mínimo.

## Mova PIs no plano

1. Com {{ui:Selecionar}} ativo, clique no alinhamento para selecioná-lo. Grips quadrados aparecem nos PIs dele.
2. Arraste um grip. O alinhamento, a estaqueamento, o perfil e o corredor acompanham.
3. Solte. O movimento é um único passo de desfazer.

Adicionar um PI entre dois já existentes ainda não está implementado: exclua o alinhamento e desenhe-o de novo, ou digite novas coordenadas para os PIs que você tem.

## Leia estaca e deslocamento

Mova o ponteiro sobre o plano. A barra de status mostra o alinhamento mais próximo (ou o selecionado) com a estaca e o deslocamento, **L** ou **R** olhando no sentido crescente das estacas, por exemplo "Alinhamento 1: Est 2+15.30, deslocamento 18.42 R". Além de qualquer extremidade, ele acrescenta "(além do fim)".

## O que é desenhado

No plano, no DXF e no PDF: o eixo (tangentes como linhas, curvas como arcos verdadeiros), um traço a cada 50 ft (20 m), com um traço mais longo e um rótulo de estaca a cada 100 unidades, e traços de PC e PT rotulados com as suas estacas.

## Exclua um alinhamento

Selecione-o e pressione {{key:Delete}}, ou clique em {{ui:Excluir}} na barra de ferramentas ou na parte inferior do painel direito. O perfil e o corredor dele vão junto. {{key:Mod+Z}} o traz de volta.

:::mac
Em um teclado de Mac, a tecla rotulada **delete** equivale a {{key:Backspace}} no navegador e não exclui uma seleção. Pressione {{key:Delete}} (Fn e delete), ou use o botão {{ui:Excluir}}.
:::

## Próximo

- [Desenhe um perfil vertical](topic:profile).
## Velocidade de projeto e classe

Nas Propriedades do alinhamento, **Velocidade de projeto** (km/h ou mph) e **Classe de projeto** ficam com o alinhamento, são salvas no projeto e gravadas no IFC (Pset_RoadDesignCriteriaCommon). O CivilCraft não tem uma tabela que relacione velocidade a raio mínimo, então nada é verificado a partir delas: defina o **Raio mínimo** pela sua própria norma de projeto.

## Espirais

Uma curva pode ter uma espiral clotoide em qualquer extremidade: tangente, espiral, curva, espiral, tangente. Na tabela de PIs, digite um comprimento em **Espiral de entrada** e **Espiral de saída** para um PI que tenha raio. O PI continua onde está; a curva se aproxima para abrir espaço, então a distância de tangente aumenta pelo deslocamento da espiral. Os dois comprimentos podem ser diferentes, e um PI com só um comprimento recebe espiral só nessa extremidade.

A lista de curvas então mostra TS, SC, CS e ST (tangente para espiral, espiral para curva, curva para espiral, espiral para tangente) com o ângulo da espiral θs, as distâncias de tangente e a distância externa. As estacas seguem ao longo das espirais como em todo lugar. Espirais que juntas giram mais do que a curva são recusadas, com o PI nomeado; uma espiral maior do que a tangente permite é uma sobreposição, como em qualquer curva. A superelevação usa a espiral como sua transição (veja [Corredor](topic:corridor)).
