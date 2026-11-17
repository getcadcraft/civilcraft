---
title: Dispoñer un trazado horizontal
summary: Debuxe un trazado polos seus PI, fixe os raios das curvas e a estación inicial, mova os PI e lea os datos das curvas, a estación e o desvío.
keywords: trazado, sen solución, a curva non cabe, raio maior, raio menor, raio mínimo, velocidade de deseño, solapamento, eixo, pi, curva horizontal, raio, estacado, tanxente, crear trazado, disposición do trazado, pc, pt, estación e desvío
from: 8c5df4aa
---

Un trazado en CivilCraft é unha cadea de tanxentes por puntos de intersección (PI), cunha curva circular en calquera PI interior que teña un raio. Estácase desde unha estación inicial que vostede escolle. Un proxecto pode conter moitos trazados.

## Debuxar o trazado

1. Prema {{key:A}}, ou faga clic en {{ui:Trazado}} no grupo **Deseño**.
   A suxestión di: «Trazado: faga clic nos PI por orde. Enter ou dobre clic remata, Backspace elimina o último, Esc cancela».
2. Faga clic no primeiro PI (o inicio do trazado).
3. Faga clic en cada PI seguinte, por orde. Unha liña vermella segue o punteiro e mostra a lonxitude e o rumbo da tanxente que está a debuxar, por exemplo «212.40 ft  N 63°12'05" E».
4. Faga clic no último PI (o final do trazado).
5. Prema {{key:Enter}}.
   O trazado debúxase con estacado e queda seleccionado. A barra de estado di, por exemplo: «Trazado 1: 386.36 ft, curvas de 100 ft de raio onde caben. Edite os raios en Propiedades; Perfil (R) para deseñar a súa pendente».

Mentres debuxa: {{key:Backspace}} elimina o último PI, {{key:Esc}} cancela, e arrastrar sobre un espazo baleiro despraza a vista sen engadir un PI.

:::warning
Remate con {{key:Enter}}. Un dobre clic tamén remata, pero nesta versión elimina o PI no que fixo dobre clic. Faga clic unha vez no último PI e logo prema {{key:Enter}}.
:::

Cada PI interior recibe unha curva de 100 ft (30 m nun proxecto en metros), ou o maior raio enteiro que caiba na metade de cada tanxente se 100 ft non cabe. Os PI moi agudos ou de paso directo non reciben curva.

## Fixar raios e coordenadas

Con o trazado seleccionado, o panel dereito mostra **Trazado**:

1. **Nome** e **Estación inicial**. Escriba unha estación como `10+00` (pés) ou `0+500` (metros), ou como un número simple. Consulte [Unidades, estacións e formatos de números](topic:units-and-stations).
2. **Lonxitude** e **Estación final** calcúlanse por vostede.
3. A táboa **PI** lista o **Este** e o **Norte** de cada PI, e un **Raio** para cada PI interior. Escriba un novo valor e prema {{key:Enter}}.
   - Un raio de 0 fai un punto angular sen curva.
   - O primeiro e o último PI nunca teñen raio.
   - A x pequena ao final dunha fila elimina ese PI (un trazado conserva polo menos dous).
4. Lea a lista **Curvas**: para cada curva, as súas estacións PC e PT, o raio R, a deflexión Δ e o sentido (esquerda ou dereita), a lonxitude L, a tanxente T, a externa E e a corda.
5. A liña debaixo das curvas dá o rumbo da primeira tanxente.

## Cando unha curva non cabe

Se as curvas precisan máis tanxente da que hai entre os seus PI, o trazado non ten solución: non se debuxa correctamente ata que o corrixa, e queda fóra das exportacións LandXML. Unha caixa vermella indica o motivo, en cifras, e ofrece o que cabería:

- «As curvas do PI 2 e do PI 3 precisan 240.00 ft de tanxente entre elas (130.00 + 110.00), pero os PI están a 180.00 ft de distancia.» — ou, cando só unha delas ten curva, «A curva do PI 2 precisa 240.00 ft de tanxente cara ao PI 1 …».
- Un botón para cada PI fixa **o maior raio que cabe** alí, coa outra curva tal como está (tamén ten que caber na outra tanxente do PI). Cando os dous PI teñen curva, **Ambos** reduce os dous raios en proporción para que apenas se toquen.
- Cando unha soa curva é máis longa que a tanxente, a caixa indica que ningunha curva no outro PI pode caber mentres sexa tan grande.
- Un PI que dá a volta en seco non pode levar curva; a caixa ofrece **Sen curva no PI n**.

Cada botón é un paso: {{key:Mod+Z}} repón os raios. Os raios ofrecidos redondéanse cara abaixo a 0.01 para que sempre caben.

### Un raio mínimo de deseño

Escriba un **Raio mínimo de deseño** (por exemplo, segundo a súa velocidade de deseño) para que cada curva se comprobe contra el; déixeo baleiro se non quere ningún. Unha curva por debaixo del aparece listada cun botón para **o menor raio que cumpre o mínimo**, cando ese raio cabe. Cando non cabe, a caixa di iso e dá o maior raio que permiten as tanxentes, para que saiba que debe mover un PI ou baixar o mínimo.

## Mover PI no plano

1. Con {{ui:Seleccionar}} activo, faga clic no trazado para seleccionalo. Aparecen agarraderos cadrados nos seus PI.
2. Arrastre un agarradeiro. O trazado, o seu estacado, o perfil e o corredor seguen o movemento.
3. Solte. O movemento é un paso de desfacer.

Engadir un PI entre dous existentes aínda non está dispoñible: elimine o trazado e debúxeo de novo, ou escriba novas coordenadas para os PI que ten.

## Ler estación e desvío

Mova o punteiro sobre o plano. A barra de estado mostra o trazado máis próximo (ou o seleccionado) coa estación e o desvío, **L** ou **R** mirando cara ás estacións crecentes, por exemplo «Trazado 1: Est 2+15.30, desvío 18.42 R». Máis aló de calquera dos extremos engade «(máis aló do final)».

## O que se debuxa

No plano, en DXF e en PDF: o eixo (as tanxentes como liñas, as curvas como arcos verdadeiros), unha marca cada 50 ft (20 m) cunha marca máis longa e unha etiqueta de estación cada 100 unidades, e as marcas PC e PT etiquetadas coas súas estacións.

## Eliminar un trazado

Selecciónello e prema {{key:Delete}}, ou faga clic en {{ui:Eliminar}} na barra de ferramentas ou na parte inferior do panel dereito. O seu perfil e o seu corredor vanse con el. {{key:Mod+Z}} devólveo.

:::mac
Nun teclado de Mac, a tecla etiquetada **delete** é {{key:Backspace}} para o navegador e non elimina unha selección. Prema {{key:Delete}} (Fn e delete), ou use o botón {{ui:Eliminar}}.
:::

## Seguinte

- [Deseñar un perfil vertical](topic:profile).

## Velocidade e clase de deseño

Nas propiedades do trazado, **Velocidade de deseño** (km/h ou mph) e **Clase de deseño** consérvanse co trazado, gárdanse no proxecto e escríbense en IFC (Pset_RoadDesignCriteriaCommon). CivilCraft non ten unha táboa que relacione unha velocidade cun raio mínimo, así que non se comproba nada a partir deles: estableza o **Raio mínimo** segundo a súa propia norma de deseño.

## Espirais

Unha curva pode ter unha espiral clotoide en calquera dos extremos: tanxente, espiral, curva, espiral, tanxente. Na táboa de PI, escriba unha lonxitude en **Espiral de entrada** e **Espiral de saída** para un PI que teña raio. O PI queda no seu sitio; a curva achégase para facer sitio, así que a distancia de tanxente aumenta co desvío da espiral. As dúas lonxitudes poden diferir, e un PI con só unha lonxitude recibe espiral só nese extremo.

A lista de curvas mostra entón TS, SC, CS e ST (tanxente a espiral, espiral a curva, curva a espiral, espiral a tanxente), co ángulo da espiral θs, as distancias de tanxente e a distancia externa. As estacións seguen as espirais como en todas partes. As espirais que xuntas xiran máis que a curva recházanse co PI nomeado; unha espiral máis longa do que permite a tanxente é un solapamento, como en calquera curva. O peralte usa a espiral como a súa rampa de transición (consulte [Corredor](topic:corridor)).
