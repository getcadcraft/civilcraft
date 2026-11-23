---
title: Varrer un corredor viario
summary: Activar un corredor para un trazado, definir os valores de carril, arcén e talude lateral, e ler as seccións, as liñas de intersección e o movemento de terras que produce.
keywords: cruzamento, interseción, estrada que encontra outra estrada, estrada lateral, cruce en T, cruce, cota da plataforma, unir, empalme, peralte, super, bombeo, transición, desaparición do bombeo, táboa de taxas, pendente transversal, rotación, corredor, conxunto, subconxunto, sección tipo, estrada, carril, arcén, talude lateral, liña de intersección, desmonte, terraplén, seccións, obxectivo, obxectivos, obxectivo de largura, obxectivo de cota, obxectivo de desprazamento, ensanchamento, bordo da calzada, seguir outro corredor
from: 6dcb92b3
---

Un corredor despraza unha sección tipo simple (un conxunto) ao longo dun trazado e do seu perfil de proxecto, ajústao ao terreo existente e engade o resultado á superficie proposta. Un trazado pode levar varios corredores en intervalos de estacas distintos, e un corredor pode construírse a partir de plantillas reutilizables por estaca ([Plantillas do corredor](topic:corridor-templates)). O conxunto simple de abaixo é o mesmo nos dous lados; para dar a cada lado as súas propias pezas, véxase [Construír cada lado a partir de pezas](topic:corridor#build-each-side-from-parts).

## O conxunto

Desde o eixe cara fóra, en cada lado:

1. un **carril** dunha largura dada, que baixa desde o bombeo á **pendente do carril**
2. un **arcén** dunha largura dada, coa **pendente do arcén**
3. un **talude lateral** desde o bordo do arcén ata o punto onde encontra o terreo: o **talude de desmonte** onde o terreo está por riba, o **talude de terraplén** onde está por baixo

Os valores iniciais son marcadores de posición, non unha norma de deseño:

| Valor | Pés US | Metros |
|---|---|---|
| Largura do carril | 12 ft | 3.6 m |
| Pendente do carril | 2% | 2% |
| Largura do arcén | 4 ft | 1.2 m |
| Pendente do arcén | 4% | 4% |
| Talude de desmonte | 2 : 1 | 2 : 1 |
| Talude de terraplén | 3 : 1 | 3 : 1 |
| Sección cada | 10 ft | 5 m |

As pendentes dos taludes laterais son horizontal a vertical (H:V): 3 : 1 significa 3 en horizontal por cada 1 en vertical.

## Construír o corredor

Cómpre un trazado sen erros e un perfil de proxecto con polo menos dous PVI e sen erros.

1. Seleccione o trazado.
2. No panel dereito, en **Corredor**, marque **Varrer un conxunto ao longo do perfil de proxecto**.
   Aparecen os campos e o corredor constrúese de inmediato. O plano amosa os bordos de carril e arcén e as liñas de intersección; con {{ui:Proposto (nivelado)}} escollido en **Visualización**, as curvas de nivel amosan o terreo novo.
3. Cambie calquera valor: **Largura do carril**, **Pendente do carril**, **Largura do arcén**, **Pendente do arcén**, **Talude de desmonte**, **Talude de terraplén**, **Sección cada**. Prema {{key:Enter}} despois de cada un. O desmonte, o terraplén e o espazamento das seccións teñen que ser maiores que 0.
4. Lea a liña debaixo dos campos, por exemplo "39 seccións desde 0+00.00 ata 3+86.36; desmonte 240.2 cu yd, terraplén 556.0 cu yd."

As seccións córtanse en cada paso de **Sección cada**, nos extremos, e no inicio e no fin de cada curva horizontal e vertical. Cada sección e as liñas que as atravesan (eixe, bordos de carril e arcén, liñas de intersección) convértense en liñas de rotura da superficie proposta.

Para desactivar o corredor, desmarque a caixa. Os seus valores consérvanse para a próxima vez.

## Cando non se constrúe

Unha caixa vermella debaixo dos campos explica o motivo:

| Mensaxe | Que facer |
|---|---|
| O corredor precisa un perfil de proxecto sen erros. | Engada PVI, ou corrixa as curvas verticais que se solapan (véxase [Deseñar un perfil vertical](topic:profile)). |
| O perfil de proxecto non se solapa co trazado. | Mova os PVI ao intervalo de estacas do trazado. |
| O corredor precisa polo menos dúas seccións sobre a superficie. | A maior parte do corredor está fóra do terreo existente. |
| 4 taludes laterais saen da superficie antes de encontrar o terreo. | Preto do bordo da superficie o talude non pode alcanzar o terreo. Afaste a estrada do bordo, ou baixe a altura do terraplén ou do desmonte nese punto. |
| As liñas de intersección do corredor cruzanse (as seccións solápanse, por exemplo na parte interior dunha curva pechada). Use un raio maior ou un conxunto máis estreito. | As seccións na parte interior dunha curva pronunciada solápanse. Aumente o raio ou estreite o conxunto. |

Un corredor con problemas non se nivela nin conta no movemento de terras.

## Corredores e plataformas xuntos

A superficie proposta constrúese por orde: primeiro todos os corredores, despois todas as plataformas. Onde o nivelado dunha plataforma se solapa cun corredor, gaña a plataforma. Onde un elemento posterior se solapa cunha estrada, só se substitúe a parte da estrada dentro da liña de intersección dese elemento; o resto da estrada, e calquera liña de rotura do terreo que a estrada cruce, conserva a súa forma. Os volumes calcúlanse dentro de todas as liñas de intersección xuntas; véxase [Volumes de movemento de terras](topic:volumes).

## Peralte

Nunha curva a estrada pode inclinarse cara ao interior, de modo que o tráfico é empuxado menos cara ao exterior. Marque **Peraltar as curvas** en **Peralte** nas **Propiedades** do trazado:

- Cada curva circular toma unha taxa **e** da táboa de taxas: a primeira fila cuxo raio alcanza a curva (unha fila sen taxa mantén o bombeo normal). A táboa e a **Pendente relativa máxima** (0.5 % ao inicio) son marcadores de posición, non unha norma: defínaos segundo os seus propios criterios de deseño. Engada ou elimine filas segundo precise.
- Os carrís xiran arredor do eixe. Antes da curva, o carril exterior se aplana na **desaparición do bombeo** (bombeo normal ÷ e × transición), e despois na **transición** (largura do carril × e ÷ pendente do bombeo); o carril exterior segue xirando ata que toda a estrada inclina á taxa e cara ao interior. Dúas terceiras partes da transición quedan antes da curva e unha terceira parte sobre ela. Despois da curva ocorre o mesmo en sentido inverso.
- Un arcén do lado baixo nunca é máis plano que o seu carril; no lado alto mantén a súa propia pendente (xira).
- A táboa debaixo lista o raio, a taxa, a transición e a desaparición do bombeo de cada curva, e onde comezan e rematan o peralte completo. O **diagrama de peralte** debuxa as pendentes transversais dos dous carrís ao longo das estacas (o carril esquerdo en liña continua e o dereito en trazos).
- Unha curva demasiado curta para alcanzar o peralte completo, ou dúas curvas cuxas transicións se solapan, indícase nunha caixa enriba da táboa.

As seccións, os volumes, a vista 3D e as follas amosan todos a estrada inclinada. Cada cambio é un paso: {{key:Mod+Z}} desfaino.

## Obxectivos

Un obxectivo move un punto dun lado da estrada ata unha liña: o **Bordo da calzada** ou o **Bordo do arcén**, no lado **Esquerdo** ou **Dereito**. Cada sección encontra a liña en ángulo recto co eixe, saíndo só por ese lado, así que un obxectivo á dereita nunca move o lado esquerdo.

| Fixa | Que pasa onde unha sección encontra a liña |
|---|---|
| **Largura** | O punto queda sobre a liña: o carril (ou o arcén) se ensancha ou estreita ata ela, mantendo a súa pendente transversal. |
| **Cota** | O punto toma a cota da liña alí, á súa propia distancia do eixe: a pendente transversal do carril (ou do arcén) séguea. |

A liña pode ser unha liña de elemento (calquera que sexa o seu **Uso**) ou unha liña doutro corredor: o seu eixe, bordos da calzada, bordos do arcén ou liñas de intersección. A liña dun corredor segue a ese corredor: se cambia a outra estrada, esta segue. CivilCraft constrúe primeiro o outro corredor; dous corredores que se fixesen obxectivo mutuamente en bucle recházanse por un lado, e a táboa indica cal.

1. Seleccione o trazado e active o seu corredor.
2. En **Obxectivos**, prema {{ui:Engadir un obxectivo}}.
3. Escolla o **Lado**, o **Punto**, o que **Fixa** e **Ata a liña**. Cada cambio é un paso de desfacer.

**Resultado** indica en cantas seccións se alcanzou a liña. As seccións que non a alcanzan (máis aló dos seus extremos, ou onde está detrás do eixe) conservan os valores do conxunto. Unha liña que se elimina deixa o corredor como estaba antes do obxectivo, e a táboa indícao. Un lado pode ter unha largura e unha cota de obxectivo por cada punto.

## Construír cada lado a partir de pezas

Active **Construír cada lado a partir de pezas** nos axustes do corredor. Cada lado terá entón a súa propia lista, desde o eixe cara fóra: carrís, un arcén, unha cuneta, un bordillo, unha franxa de plantación, unha beirarrúa e, por último, o talude lateral ata o terreo (coas súas propias relacións de desmonte e terraplén). Comece desde {{ui:Estrada rural}} ou {{ui:Rúa urbana}}, engada e elimine pezas, móveas coas frechas, e {{ui:Copiar}} un lado ao outro. Cada cambio é un paso de desfacer.

A pendente transversal é a caída afastándose da estrada, así que unha beirarrúa que desaugua cara á estrada é negativa. Un bordillo é unha cara da altura que vostede indica, unha cara superior da largura que indica e un desnivel opcional na parte traseira. O peralte xira todos os carrís da primeira fila; a cuneta, o bordillo, a franxa e a beirarrúa colgan do bordo dos carrís tal como se constrúen. Os obxectivos seguen movendo o extremo dos carrís e a última peza. As seccións transversais marcan a liña de auga da cuneta, o alto e a parte traseira do bordillo, e o resto. Nunha curva con espirais, a transición é a espiral: bombeo nivelado no TS, peralte completo no SC.

## Capas do firme

Un carril, arcén, cuneta, franxa de plantación ou beirarrúa pode levar a súa estrutura de capas. Baixo a peza, {{ui:Engadir unha capa}} engade unha capa cun nome, un material, un espesor e o seu tipo (superficie, ligante, base, sub-base, coroación ou outro), de arriba abaixo. As capas non modifican a superficie da estrada (o seu remate é a superficie de proxecto); cada unha vai debaixo da súa peza, medida a súa profundidade en vertical. As seccións transversais debuxan a base de cada capa como liña de trazos, e {{ui:Capas do firme: cantidades}} lista a área en planta e o volume de cada capa (área ao longo do corredor a partir das súas seccións, volume = área × espesor). A exportación IFC escribe cada capa como elemento propio, co seu espesor e material (véxase [Exportación e importación de IFC](topic:ifc)). O espesor que escriba é o seu: CivilCraft non dimensiona firmes.

## Onde as estradas se encontran con estradas, plataformas e sendas

Con {{ui:Unir as estradas e as plataformas cas que se cruza}} activado (está activado para todos os corredores), CivilCraft une un corredor co que encontra en planta:

- **Unha estrada que remata noutra estrada** (o extremo do seu trazado está sobre a outra estrada, ou a menos de aproximadamente a metade da súa propia largura de calzada do bordo desa estrada) é a estrada lateral dun cruzamento. A estrada encontrada abre o seu bordo para a calzada da estrada lateral: na boca, o arcén, o bordillo, a franxa e a beirarrúa dispóñense coa pendente transversal do carril e debúxanse como calzada. A estrada lateral sitúase sobre a superficie da estrada principal onde se solapan, e sóbese ou bájase até ela na aproximación.
- **Dúas estradas que se cruzan** únense do mesmo xeito nos dous lados. A estrada listada primeiro en Trazados é a estrada principal; a outra segue a súa superficie ao atravesala.
- **Unha estrada que remata nunha plataforma** (dentro dela, ou a menos de aproximadamente a metade da súa largura de calzada do seu bordo) chega á cota da plataforma e sóbese ou bájase até ela na aproximación.
- **Unha senda** (Paisaxismo › Obra dura) para no bordo exterior dunha estrada, á cota da beirarrúa ou do arcén alí, en vez de quedar sobre a estrada. Unha senda que cruza unha estrada convértese en dúas partes. Un extremo debuxado un pouco curto dunha estrada (a menos do dobre da largura da senda) prolóngase ata o seu bordo.

Propiedades di o que cada corredor uniu, canto se subiu ou baixou alí e en que lonxitude. Esa lonxitude é o maior valor entre 10 m (30 ft) e vinte veces a variación, e nunca máis do 45 % do corredor. **O perfil de proxecto non se modifica**: a vista do perfil segue amosando a liña de rasante que debuxou, e as seccións, a superficie proposta, os volumes e a vista 3D amosan a estrada tal como está unida. Para que a unión sexa exacta por deseño, mova o último PVI á cota que informan as Propiedades.

Desactive o interruptor dun corredor para deixalo exactamente como o define o seu perfil e conxunto; entón non toma parte en ningún cruzamento, nin como estrada lateral nin como estrada principal. As estradas que se encontran case en liña (por debaixo de uns 20°) déixanse así, e tamén as pistas.

O que un cruzamento aínda non fai: non hai curvas de bordillo (as esquinas son rectas), non hai carrís de xiro nin illas, o extremo da estrada lateral córtase en ángulo recto co seu propio trazado, e un corredor construído a partir de plantillas abre o seu bordo do mesmo xeito simple (unha vala ou un muro na súa condición de extremo nivélase de través na boca, sen bueiro). Para curvas de bordillo en planta, distancias de visibilidade e marcas viarias, véxase [Solos, estradas, levantamento, minas e enlaces](topic:soils-roads-survey-mines-links).

## Non construído aínda

Os obxectivos para a pendente da intersección aínda non están dispoñibles. Para un corredor que cambia ao longo da estrada, con esquerda e dereita separadas, use [Plantillas do corredor](topic:corridor-templates). Véxase [Non construído aínda](topic:not-built-yet).
