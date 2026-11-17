---
title: Traçar uma diretriz horizontal
summary: Desenhar uma diretriz através dos seus PI, definir os raios das curvas e o PK inicial, mover os PI e ler os dados das curvas, o PK e o offset.
keywords: diretriz, sem solução, curva não cabe, raio máximo, raio mínimo, raio mínimo de projeto, velocidade de projeto, sobreposição, eixo, pi, curva horizontal, raio, quilometragem, tangente, criar diretriz, traçado da diretriz, pc, pt, PK e offset
from: 8c5df4aa
---

Uma diretriz no CivilCraft é uma cadeia de tangentes através de pontos de interseção (PI), com uma curva circular em qualquer PI interior que tenha um raio. Tem quilometragem a partir de um PK inicial que escolhe. Um projeto pode ter muitas diretrizes.

## Desenhar a diretriz

1. Prima {{key:A}}, ou clique em {{ui:Diretriz}} no grupo **Conceção**.
   A sugestão diz «Diretriz: clique nos PI por ordem. Enter ou duplo clique termina, Backspace retira o último, Esc cancela.»
2. Clique no primeiro PI (o início da diretriz).
3. Clique em cada PI seguinte, por ordem. Uma linha vermelha segue o ponteiro e mostra o comprimento e o rumo da tangente que está a desenhar, por exemplo «212.40 ft  N 63°12'05" E».
4. Clique no último PI (o fim da diretriz).
5. Prima {{key:Enter}}.
   A diretriz é desenhada com quilometragem e fica selecionada. A barra de estado diz, por exemplo, «Diretriz 1: 386.36 ft, curvas de raio 100 ft onde couberem. Edite os raios em Propriedades; {{ui:Perfil}} (R) para desenhar a rasante.»

Enquanto desenha: {{key:Backspace}} remove o último PI, {{key:Esc}} cancela, e arrastar num espaço vazio desloca a vista sem acrescentar um PI.

:::warning
Termine com {{key:Enter}}. O duplo clique também termina, mas, nesta versão, retira o PI em que clicou duas vezes. Clique uma vez no último PI e, a seguir, prima {{key:Enter}}.
:::

Cada PI interior recebe uma curva de 100 ft (30 m num projeto em metros), ou o maior raio inteiro que caiba em metade de cada tangente, se 100 ft não couber. PI muito agudos ou em linha reta não recebem curva.

## Definir raios e coordenadas

Com a diretriz selecionada, o painel da direita mostra **Diretriz**:

1. **Nome** e **PK inicial**. Escreva um PK como `10+00` (pés) ou `0+500` (metros), ou como um número simples. Ver [Unidades, PK e formatos numéricos](topic:units-and-stations).
2. **Comprimento** e **PK final** são calculados automaticamente.
3. A tabela **PI** lista o **Este** e o **Norte** de cada PI, e um **Raio** para cada PI interior. Escreva um novo valor e prima {{key:Enter}}.
   - Um raio de 0 cria um vértice angular sem curva.
   - O primeiro e o último PI nunca têm raio.
   - O pequeno x no fim de uma linha remove esse PI (uma diretriz mantém pelo menos dois).
4. Leia a lista **Curvas**: para cada curva, os PK de PC e PT, o raio R, a deflexão Δ e o sentido (esquerda ou direita), o comprimento L, a tangente T, a externa E e a corda.
5. A linha sob as curvas indica o rumo da primeira tangente.

## Quando uma curva não cabe

Se as curvas precisarem de mais tangente do que existe entre os seus PI, a diretriz não tem solução: não fica desenhada corretamente até a corrigir, e fica fora das exportações LandXML. Uma caixa vermelha diz porquê, em números, e propõe o que caberia:

- «As curvas nos PI 2 e PI 3 precisam de 240.00 ft de tangente entre elas (130.00 + 110.00), mas os PI estão a 180.00 ft de distância.» — ou, quando só uma tem curva, «A curva no PI 2 precisa de 240.00 ft de tangente em direção ao PI 1 …».
- Um botão por cada PI define **o maior raio que cabe** aí, mantendo a outra curva como está (também tem de caber na outra tangente do PI). Quando ambos os PI têm curva, **Ambos** reduz os dois raios na mesma proporção, para que apenas se toquem.
- Quando uma curva sozinha é mais longa do que a tangente, a caixa diz que nenhuma curva no outro PI pode caber enquanto esta for tão grande.
- Um PI que inverte totalmente o sentido não pode ter curva; a caixa propõe **Sem curva no PI n**.

Cada botão é um passo: {{key:Mod+Z}} repõe os raios. Os raios propostos são arredondados por defeito a 0.01, para caberem sempre.

### Um raio mínimo de projeto

Escreva um **Raio mínimo de projeto** (por exemplo, a partir da velocidade de projeto) para que cada curva seja verificada contra ele; deixe-o vazio para nenhum. Uma curva abaixo dele aparece com um botão para **o menor raio que cumpre o mínimo**, quando esse raio cabe. Quando não cabe, a caixa diz isso e indica o maior raio que as tangentes permitem, para que saiba que tem de mover um PI ou baixar o mínimo.

## Mover PI no plano

1. Com {{ui:Selecionar}} ativo, clique na diretriz para a selecionar. Aparecem pegas quadradas nos respetivos PI.
2. Arraste uma pega. A diretriz, a sua quilometragem, o perfil e o corredor acompanham o movimento.
3. Largue. O movimento é um único passo de anulação.

Acrescentar um PI entre dois existentes ainda não está disponível: remova a diretriz e desenhe-a de novo, ou escreva as novas coordenadas dos PI que já tem.

## Ler PK e offset

Mova o ponteiro sobre o plano. A barra de estado mostra a diretriz mais próxima (ou a selecionada) com o PK e o offset, **L** ou **R** olhando no sentido crescente do PK, por exemplo «Diretriz 1: PK 2+15.30, offset 18.42 R». Para além de qualquer extremo, acrescenta «(para além do fim)».

## O que é desenhado

No plano, em DXF e em PDF: o eixo (tangentes como linhas, curvas como arcos verdadeiros), uma marca a cada 50 ft (20 m), com uma marca mais longa e uma etiqueta de PK a cada 100 unidades, e marcas de PC e PT etiquetadas com os respetivos PK.

## Eliminar uma diretriz

Selecione-a e prima {{key:Delete}}, ou clique em {{ui:Eliminar}} na barra de ferramentas ou no fundo do painel da direita. O perfil e o corredor vão com ela. {{key:Mod+Z}} repõe-na.

:::mac
No teclado de um Mac, a tecla com o rótulo **delete** equivale a {{key:Backspace}} no navegador e não elimina uma seleção. Prima {{key:Delete}} (Fn e delete), ou use o botão {{ui:Eliminar}}.
:::

## Seguinte

- [Desenhar um perfil vertical](topic:profile).
## Velocidade e classe de projeto

Nas Propriedades da diretriz, a **Velocidade de projeto** (km/h ou mph) e a **Classe de projeto** são guardadas com a diretriz, gravadas no projeto e escritas em IFC (Pset_RoadDesignCriteriaCommon). O CivilCraft não tem tabela que ligue uma velocidade a um raio mínimo, por isso nada é verificado a partir delas: defina o **Raio mínimo** pela norma de projeto que usa.

## Espirais

Uma curva pode ter uma espiral clotoide em qualquer extremo: tangente, espiral, curva, espiral, tangente. Na tabela de PI, escreva um comprimento em **Espiral de entrada** e **Espiral de saída** para um PI que tenha raio. O PI fica onde está; a curva aproxima-se para fazer lugar, pelo que a distância à tangente cresce com o deslocamento da espiral. Os dois comprimentos podem ser diferentes, e um PI com apenas um comprimento tem espiral só nesse extremo.

A lista de curvas passa então a mostrar TS, SC, CS e ST (tangente–espiral, espiral–curva, curva–espiral, espiral–tangente), com o ângulo da espiral θs, as distâncias à tangente e a distância externa. Os PK seguem ao longo das espirais como em todo o lado. As espirais que, juntas, rodam mais do que a curva são recusadas, com o PI indicado; uma espiral mais longa do que a tangente permite é uma sobreposição, como em qualquer curva. A sobrelevação usa a espiral como zona de transição (ver [Corredor](topic:corridor)).
