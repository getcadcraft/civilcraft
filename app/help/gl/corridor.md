---
title: Construír un corredor viario
summary: Active un corredor para un trazado, defina os valores de faixa, arcén e talud lateral, e lea as seccións, as liñas de talude e o movemento de terras que produce.
keywords: peralte, super, inclinación en curva, transición, saída, táboa de taxas, pendente transversal, rotación, corredor, conxunto, subconxunto, sección tipo, estrada, faixa, arcén, talud lateral, talud, desmonte, terraplén, seccións, obxectivo, obxectivos, obxectivo de largura, obxectivo de cota, obxectivo de desprazamento, ensanche, bordo do firme, seguir outro corredor
from: 91303189
---

Un corredor fai avanzar unha sección tipo sinxela (un conxunto) ao longo dun trazado e do seu perfil de proxecto, nivela o conxunto no terreo existente e engade o resultado á superficie proposta. Un trazado pode levar varios corredores en intervalos de estacas distintos, e un corredor pode construírse con plantillas reutilizables por estaca ([Plantillas de corredor](topic:corridor-templates)). O conxunto sinxelo de abaixo é o mesmo nos dous lados; para dar a cada lado as súas propias partes, ver [Construír cada lado con partes](topic:corridor#build-each-side-from-parts).

## O conxunto

Desde o eixe cara a fóra, en cada lado:

1. unha **faixa** dunha anchura dada, que baixa desde o bombeo coa **pendente da faixa**
2. un **arcén** dunha anchura dada coa **pendente do arcén**
3. un **talud lateral** desde o bordo do arcén ata o punto onde encontra o terreo: a **pendente de desmonte** onde o terreo está por riba, e a **pendente de terraplén** onde está por baixo

Os valores iniciais son marcadores de posición, non unha norma de deseño:

| Valor | Pés EUA | Metros |
|---|---|---|
| Anchura da faixa | 12 ft | 3,6 m |
| Pendente da faixa | 2% | 2% |
| Anchura do arcén | 4 ft | 1,2 m |
| Pendente do arcén | 4% | 4% |
| Pendente de desmonte | 2 : 1 | 2 : 1 |
| Pendente de terraplén | 3 : 1 | 3 : 1 |
| Seccións cada | 10 ft | 5 m |

As pendentes dos taludes laterais son horizontal a vertical (H:V): 3 : 1 significa 3 en horizontal por 1 en vertical.

## Construír o corredor

Necesita un trazado sen erros e un perfil de proxecto con polo menos dous PVI e sen erros.

1. Seleccione o trazado.
2. No panel dereito, en **Corredor**, marque **Facer avanzar un conxunto ao longo do perfil de proxecto**.
   Aparecen os campos e o corredor constrúese de inmediato. O plano mostra os bordos da faixa e do arcén e as liñas de talude; con {{ui:Proposto (nivelado)}} escollido en **Visualización**, as curvas mostran o terreo novo.
3. Cambie calquera valor: **Anchura da faixa**, **Pendente da faixa**, **Anchura do arcén**, **Pendente do arcén**, **Pendente de desmonte**, **Pendente de terraplén**, **Seccións cada**. Prema {{key:Enter}} despois de cada un. A pendente de desmonte, a de terraplén e o espazado das seccións teñen que ser maiores que 0.
4. Lea a liña debaixo dos campos, por exemplo: «39 seccións desde 0+00,00 ata 3+86,36; desmonte 240,2 cu yd, terraplén 556,0 cu yd.»

As seccións córtanse en cada paso de **Seccións cada**, nos extremos e no inicio e no final de cada curva horizontal e vertical. Cada sección e as liñas que pasan por elas (eixe, bordos da faixa e do arcén, taludes) convértense en liñas de quebra da superficie proposta.

Para desactivar o corredor, desmarque a caixa. Os seus valores consérvanse para a próxima vez.

## Cando non se constrúe

Unha caixa vermella debaixo dos campos indica o motivo:

| Mensaxe | Que facer |
|---|---|
| «O corredor necesita un perfil de proxecto sen erros.» | Engada PVI, ou corrixa as curvas verticais que se solapan (ver [Deseñar un perfil vertical](topic:profile)). |
| «O perfil de proxecto non se solapa co trazado.» | Mova os PVI ao intervalo de estacas do trazado. |
| «O corredor necesita polo menos dúas seccións na superficie.» | A maior parte do corredor está fóra do terreo existente. |
| «4 taludes laterais saen da superficie antes de encontrar o terreo.» | Preto do bordo da superficie o talud non pode chegar ao terreo. Afaste a estrada do bordo, ou baixe a altura de terraplén ou desmonte alí. |
| «As liñas de talude do corredor se cruzan (as seccións solápanse, por exemplo na parte interior dunha curva pechada). Use un raio maior ou un conxunto máis estreito.» | As seccións na parte interior dunha curva pronunciada solápanse. Aumente o raio ou estreite o conxunto. |

Un corredor con algún problema non se nivela nin se conta no movemento de terras.

## Corredores e plataformas xuntos

A superficie proposta constrúese por orde: primeiro todos os corredores e despois todas as plataformas. Onde o nivelado dunha plataforma se solapa cun corredor, prevalece a plataforma. Os volumes calcúlanse dentro de todas as liñas de talude xuntas; ver [Volumes de movemento de terras](topic:volumes).

## Peralte

Nunha curva a estrada pode inclinarse cara ao interior, para que o tráfico empurre menos cara ao exterior. Marque **Aplicar peralte ás curvas** en **Peralte** nas **Propiedades** do trazado:

- Cada curva circular toma unha taxa **e** da táboa de taxas: a primeira fila cuxo raio alcanza a curva (unha fila sen taxa mantén o bombeo normal). A táboa e o **Gradiente relativo máximo** (0,5 % ao inicio) son marcadores de posición, non unha norma: fíxeos segundo os seus propios criterios de deseño. Engada ou elimine filas segundo precise.
- As faixas xiran arredor do eixe. Antes da curva, a faixa exterior aplánase ao longo da **saída** (bombeo normal ÷ e × transición), e despois ao longo da **transición** (anchura da faixa × e ÷ o gradiente) a faixa exterior segue xirando ata que toda a estrada inclínase con e cara ao interior; dous terzos da transición quedan antes da curva e un terzo nela. Despois da curva ocorre o mesmo á inversa.
- Un arcén no lado baixo nunca é máis plano que a súa faixa; no lado alto conserva a súa propia pendente (desliza cara abaixo).
- A táboa debaixo lista o raio, a taxa, a transición e a saída de cada curva, e onde comeza e remata o peralte completo. O **diagrama de peralte** debuxa as pendentes transversais das dúas faixas ao longo das estacas (a faixa esquerda en liña continua, a dereita en liña de trazos).
- Unha curva demasiado curta para alcanzar o peralte completo, ou dúas curvas cuxas transicións se solapan, indícase nunha caixa enriba da táboa.

As seccións, os volumes, a vista 3D e as follas mostran a estrada inclinada. Cada cambio é un paso: {{key:Mod+Z}} o desfai.

## Obxectivos

Un obxectivo move un punto dun lado da estrada ata unha liña: o **Bordo do firme** ou o **Bordo do arcén**, na **Esquerda** ou na **Dereita**. Cada sección encontra a liña en ángulo recto co eixe, saíndo só por ese lado, así que un obxectivo na dereita nunca move o lado esquerdo.

| Establece | Que pasa onde unha sección encontra a liña |
|---|---|
| **Anchura** | O punto queda sobre a liña: a faixa (ou o arcén) ensánchase ou estréitase ata ela, conservando a súa pendente transversal. |
| **Cota** | O punto toma alí a cota da liña, no seu propio desprazamento: a pendente transversal da faixa (ou do arcén) segue a liña. |

A liña pode ser unha liña de elemento (calquera que sexa o seu **Uso**) ou unha liña doutro corredor: o seu eixe, os bordos do firme, os bordos do arcén ou as liñas de talude. A liña dun corredor segue ese corredor: se cambia a outra estrada, esta segue. CivilCraft constrúe primeiro o outro corredor; dous corredores que se apuntasen mutuamente nun bucle recházanse por un lado, e a táboa indica cal.

1. Seleccione o trazado e active o seu corredor.
2. En **Obxectivos**, prema {{ui:Engadir un obxectivo}}.
3. Escolla o **Lado**, o **Punto**, o que **Establece** e **Ata a liña**. Cada cambio é un paso de desfacer.

**Resultado** indica en cantas seccións se alcanzou a liña. As seccións que non a alcanzan (máis aló dos seus extremos, ou onde queda detrás do eixe) conservan os valores do conxunto. Unha liña que se elimina deixa o corredor como estaba antes do obxectivo, e a táboa así o indica. Un lado pode ter unha anchura e un obxectivo de cota por cada punto.

## Construír cada lado con partes

Active **Construír cada lado con partes** nos axustes do corredor. Cada lado terá entón a súa propia lista, desde o eixe cara a fóra: faixas, un arcén, unha sarxeta, un bordo, unha franxa de plantación, unha beirarrúa e, por último, o talud lateral ata o terreo (coas súas propias relacións de desmonte e terraplén). Comece desde {{ui:Estrada rural}} ou {{ui:Rúa urbana}}, engada e elimine partes, móvaas coas frechas e use {{ui:Copiar}} para pasar un lado ao outro. Cada cambio é un paso de desfacer.

A pendente transversal é a caída lonxe da estrada, polo que unha beirarrúa que desaugua cara á estrada é negativa. Un bordo é unha cara da altura que dea, un cume da anchura que dea e unha caída opcional na parte traseira. O peralte fai xirar todas as faixas da primeira fila; a sarxeta, o bordo, a franxa e a beirarrúa penden do bordo das faixas tal como se constrúen. Os obxectivos seguen movendo o extremo das faixas e a última parte. As seccións transversais marcan a liña de desaugadoiro da sarxeta, o cume e a parte traseira do bordo, e o resto. Nunha curva con espirais, a transición é a espiral: bombeo nivelado no TS, peralte completo no SC.

## Capas do firme

Unha faixa, un arcén, unha sarxeta, unha franxa de plantación ou unha beirarrúa poden levar a súa estrutura: debaixo da parte, {{ui:Engadir unha capa}} engade unha capa cun nome, un material, un grosor e o seu tipo (superficie, ligazón, base, sub-base, coroación ou outro), de arriba abaixo. As capas non moven a superficie da estrada (a súa parte superior é a superficie de deseño); cada unha queda debaixo da súa parte, con profundidade medida en vertical cara abaixo. As seccións transversais debuxan a base de cada capa cunha liña de trazos, e {{ui:Capas do firme: cantidades}} lista a área en planta e o volume de cada capa (área ao longo do corredor a partir das súas seccións, volume = área × grosor). A exportación IFC escribe cada capa como elemento propio, co seu grosor e material (ver [Exportación e importación IFC](topic:ifc)). O grosor que escriba é o seu: CivilCraft non dimensiona os firmes.

## O que aínda non se constrúe

Os obxectivos para a pendente do talud aínda non están dispoñibles. Para un corredor que cambia ao longo da estrada, con esquerda e dereita separadas, use [Plantillas de corredor](topic:corridor-templates). Ver [Aínda non construído](topic:not-built-yet).
