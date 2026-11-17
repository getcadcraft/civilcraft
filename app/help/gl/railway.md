---
title: Deseñar unha vía de ferrocarril
summary: Facer dun trazado un ferrocarril: transicións de carril (clotoide, parábola cúbica, Bloss, Helmert, semionda sinusoidal, sinusoide), peralte en cada curva co seu peralte de equilibrio, insuficiencia e exceso, límites de peralte e de xeometría da vía como avisos, aparellos de vía e travesías por estación, unha envolvente de gálibo percorrida ao longo da liña e unha vía con carrís, traviesas e un leito de balasto construídos como o corredor, en planta, seccións, perfil, 3D e cantidades.
keywords: estrada de ferro, ferrocarril, carril, vía, tren, metro, tranvía, peralte, sobreelevación, insuficiencia de peralte, exceso de peralte, peralte de equilibrio, transición, curva de transición, clotoide, parábola cúbica, Bloss, Helmert, semionda sinusoidal, coseno, ancho de vía, ancho normal, ancho ibérico, ancho métrico, ancho estreito, traviesa, durmiente, balasto, sub-balasto, plataforma, berma, entreeixos de vía, 60E1, 54E1, UIC60, 115RE, 136RE, pendente do peralte, variación do peralte, aparello de vía, agulla, agullas, travesía, corazón, número de corazón, avance, curva de peche, velocidade en desvío, gálibo, envolvente de gálibo, gálibo de obra, gálibo de carga, envolvente cinemática, andén, hueco do andén, separación de vías, pendente, curva vertical, raio mínimo, peralte LandXML
from: 99de9745
---

Calquera trazado pode ser unha vía de ferrocarril. As súas curvas reciben entón transicións de carril e un peralte (a sobreelevación dos carrís), e o seu corredor constrúese como unha vía: carrís sobre traviesas, sobre un leito de balasto, nivelado no terreo como unha estrada. Os aparellos de vía e as travesías colócanse por estación, e pódese percorrer ao longo dela unha envolvente de gálibo e comprobala contra o que hai ao lado da vía.

Todos os números seguintes son **valores provisionais**, non normas. Os ferrocarrís fixan os seus límites segundo a velocidade da liña, o tipo de vía e o país; fíxeos segundo a norma do seu propio ferrocarril. CivilCraft non inclúe ningunha táboa nacional.

## Facer do trazado un ferrocarril

1. Seleccione o trazado e busque **Ferrocarril** en Propiedades.
2. Marque **Este trazado é unha vía de ferrocarril**. Cada cambio é un paso de desfacer.
3. Estableza a **Velocidade de deseño** na parte superior das propiedades do trazado: é a velocidade da liña contra a que se comproba o peralte. **Trens máis lentos** (no bloque Ferrocarril) é a velocidade contra a que se comproba o exceso de peralte.

## Transicións

Dea a cada curva unha lonxitude de espiral en cada extremo na táboa de PI (**Espiral de entrada**, **Espiral de saída`**), e logo escolla o seu tipo na táboa de curvas do bloque Ferrocarril, ou **Transición para cada curva**:

| Tipo | Curvatura ao longo da transición |
|---|---|
| Clotoide | crece de forma uniforme (a espiral das estradas) |
| Parábola cúbica | y = x³ / (6·R·L), medindo L ao longo da tanxente; a propia curva é un pouco máis longa |
| Bloss | 3u² − 2u³ da curvatura total (u = a fracción da lonxitude): comeza e remata suavemente |
| Helmert | dúas parábolas, 2u² e despois 1 − 2(1 − u)² |
| Semionda sinusoidal | (1 − cos πu) / 2 |
| Sinusoide | u − sin(2πu) / 2π |

Todas, salvo a parábola cúbica, xiran L / 2R, como a clotoide. As estacións seguen a lonxitude real. LandXML conserva o tipo (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Peralte

Escriba o **Peralte** de cada curva en milímetros. A táboa mostra para cada curva:

- **Peralte de equilibrio** = G·v² / (g·R), sendo G a distancia entre os eixos dos carrís (**Entreeixos de carrís**, o ancho de vía máis o ancho da cabeza do carril, salvo que o escriba). Con G = 1500 mm isto é a coñecida fórmula 11,8·V² / R (V en km/h, R en m).
- **Insuficiencia** = peralte de equilibrio á velocidade da liña − peralte aplicado.
- **Exceso** = peralte aplicado − peralte de equilibrio á velocidade dos trens máis lentos.
- **Rampa**: a pendente máis forte do peralte ao longo das súas rampas, en milímetros por metro.

O peralte sobe ao longo de cada transición, con forma igual á da súa curvatura: recta para a clotoide ou a parábola cúbica, con forma de Bloss para Bloss, e así sucesivamente. O extremo dunha curva sen transición sobe na recta anterior, tanto como necesite o límite de pendente do peralte, e así se indica: o peralte cambia entón onde non cambia a curvatura.

**Peralte xira arredor de** indica que carril se mantén no perfil de deseño: **o carril baixo** (o habitual), **o carril interior** ou **o eixo da vía** (cada carril se move a metade do peralte). O perfil de deseño é o cumio do carril alí.

O **Diagrama do peralte** debuxa a altura de cada carril sobre o perfil ao longo das estacións; a vista de perfil e as follas de planta e perfil reciben o mesmo como unha banda baixo o perfil.

## Límites e avisos do peralte

**Peralte aplicado máximo**, **Insuficiencia máxima de peralte**, **Exceso máximo de peralte**, **Pendente máis forte do peralte** e **Variación máis rápida do peralte** (a pendente á velocidade da liña, en mm/s) compróbanse en cada curva. Un valor por riba dun límite é un aviso no bloque Ferrocarril e no panel de Problemas, co límite e o valor atopado. Sen velocidade de deseño, non se comproban a insuficiencia nin a variación (unha nota así o indica).

## A vía

Estableza o **Ancho de vía** (predefinidos normal, ibérico, métrico ou estreito, ou o seu propio), a **Sección do carril** (60E1, 54E1, 49E1, 115RE, 136RE: só as súas dimensións publicadas), o número de **Vías** e os seus **Entreeixos de vía**, e logo **Traviesas e balasto**: material das traviesas, lonxitude, largura, altura e separación; espesor do balasto baixo a traviesa (no carril baixo), berma, talude, pendente, e canto máis baixo está o seu cumio que as traviesas; espesor do sub-balasto, a berma máis alá do pé do balasto e a pendente transversal da plataforma.

Prema **Construír a vía**. Actívase sobre o corredor do trazado, construído como unha vía sobre o perfil de deseño: os carrís e as traviesas inclínanse co peralte, a plataforma non. Os taludes de desmonte parten do bordo de berma no corte e no terraplén do corredor, e a vía se nivela coa superficie proxectada como unha estrada.

- **Planta**: os dous carrís de cada vía (capa C-RAIL-TRAK) e, con máis dunha vía, o eixo de cada vía (C-RAIL-CNTR), na pantalla, en DXF, DWG, PDF e nas follas de planta e perfil.
- **Seccións**: as traviesas, os carrís, e as bases do balasto e do sub-balasto en cada sección.
- **3D**: os carrís, cada traviesa e o leito de balasto (Mostrar › Vía), tamén en GLB, OBJ e USD.
- **Cantidades**: lonxitude de vía, carril (os dous carrís de cada vía, ao longo da liña propia de cada vía), traviesas, o leito de balasto e o balasto menos as traviesas, e o sub-balasto, por áreas medias entre seccións.

## Comprobacións da xeometría da vía

Ademais do peralte, o bloque Ferrocarril comproba a propia liña contra seis límites máis (todos provisionais, todos axustables por vostede):

- **Pendente máis forte** do perfil de deseño, en milímetros por metro.
- **Raio mínimo de curva vertical**, como factor k en R ≥ k·V² (R en metros, V en km/h). Unha curva vertical parabólica de lonxitude L entre dúas pendentes ten un raio de L dividido pola variación da pendente.
- **Curva vertical máis curta**.
- **Raio mínimo de curva** en planta (0 desactiva a comprobación).
- **Arco ou recta máis curta**, como segundos de percorrido á velocidade da liña: un arco circular, ou a recta entre dúas curvas, máis curto que esa distancia, dá aviso. 1,8 s é a coñecida regra de «a metade da velocidade en km/h, en metros».
- **Variación da insuficiencia de peralte** ao longo de cada transición, en mm/s á velocidade da liña.

**Xeometría da vía** lista a pendente máis forte atopada e cada curva vertical co seu raio e o raio que exixe a velocidade da liña. Unha curva vertical que caia sobre unha transición ou unha rampa de peralte recibe unha nota. Sen perfil de deseño ou sen velocidade de deseño, as comprobacións que o necesitan sáltanse e unha nota así o indica.

## Aparellos de vía e travesías

Baixo **Aparellos de vía e travesías**, prema **Engadir un aparello de vía**. Colócase na recta máis longa; estableza na táboa:

- **Estación do pé da agulla**: onde comeza o aparello neste trazado.
- **Corazón**: o número de corazón N (1:N). O ángulo do corazón é 2·atan(1 / 2N).
- **Lado**: esquerdo ou dereito, mirando cara á estación crecente.
- **Separación da travesía** en metros: maior que 0, o aparello convértese nunha travesía cara a unha vía paralela a esa distancia (dous aparellos e a recta entre eles).

A táboa mostra o **Avance** (pé da agulla ao corazón), o **Raio** da curva de peche e a **Velocidade en desvío** que ese raio permite co seu límite de insuficiencia de peralte e sen peralte. **Facer a súa vía** converte o desvío nun trazado propio (a agulla, a curva de peche e logo recto no ángulo do corazón) cos mesmos axustes de ferrocarril, listo para alongarse.

A planta debuxa os dous carrís en desvío de cada aparello, a súa liña central, unha marca no pé da agulla e no corazón, e «1:N» (capa C-RAIL-TURN), na pantalla e en DXF, DWG, PDF e follas. A vista 3D debuxa os carrís en desvío ao nivel da vía principal.

A forma é **provisional**: unha agulla recta e unha curva de peche a partir do número de corazón. Un aparello construído segue a norma do ferrocarril e o plano do fabricante. Avisos: un aparello que sae do trazado, que cae sobre unha curva, unha transición, un peralte ou unha curva vertical, ou que se solapa con outro; e unha nota cando a velocidade da liña supera a súa velocidade en desvío.

## Envolvente de gálibo

Marque **Percorrer unha envolvente de gálibo ao longo desta vía**. Escolla o **Contorno** (dúas formas provisionais, ou **Contorno propio** escrito como un punto por liña: desprazamento desde o eixo da vía, e logo altura sobre o cumio do carril, en metros), a **Lonxitude do vehículo** e os **Entreeixos dos bogies**, e, se hai un, o **Bordo do andén** (lado, distancia desde o eixo da vía, altura sobre o carril).

En cada estación o contorno se inclina co peralte arredor do carril baixo e se ensancha pola curva: o centro do vehículo se move cara a dentro en b² / 8R, e os seus extremos cara a fóra en (L² − b²) / 8R (b os entreeixos dos bogies, L a lonxitude do vehículo, R o raio alí, segundo a transición). O bloque debuxa a sección na recta e onde é máis ancha, e lista:

- a **envolvente máis ancha** e onde,
- os **entreeixos de vía** comparados cos entreeixos que precisan as dúas envolventes veciñas,
- o espazo que queda no **bordo do andén**, ou canto se invade,
- cada liña de elemento, estrutura de tubaxe e outro trazado ferroviario atopado **dentro da envolvente**.

Unha liña de elemento con cotas xulgase contra o contorno á súa altura sobre o carril; sen perfil de deseño, ou para un punto sen cota, xúlgase só en planta e a lista di iso. A planta amosa os dous bordos da envolvente (capa C-RAIL-CLRN) cunha cruz en cada cousa que está dentro.

Os contornos ofrecidos son **provisionais, non o gálibo de ningún ferrocarril**. Escriba o gálibo de obra do seu ferrocarril antes de fiarse dun resultado.

## Noutros programas

- **LandXML**: un trazado ferroviario escríbese coas súas transicións (spiType) e un bloque `Cant`: o ancho de vía, o punto de xiro, a velocidade da liña, e unha estación onde comeza e remata cada rampa de peralte, co peralte aplicado, o peralte de equilibrio e a insuficiencia. Abrir un ficheiro LandXML cun bloque `Cant` converte ese trazado nun ferrocarril con eses peraltes.
- **IFC**: o trazado cos seus segmentos de peralte, os carrís, as traviesas, o balasto e o sub-balasto.

## Aínda sen construír

Aparellos de vía na exportación IFC, familias de aparellos máis aló da curva de peche única (agullas curvas, corazóns de punta móbil, cruzamentos, diamantes), regras de gálibo cinemático (a envolvente é un contorno fixo con desprazamento por curva), catenaria e sinalización.

**Que norma.** No bloque Ferrocarril, «Norma a citar» admite Ningunha ou Europea (UIC e EN). Escoller Europea nomea os documentos que cita un proxecto europeo (EN 13803 para os parámetros do trazado, EN 13232 para agullas e cruzamentos, EN 15273 para os gálibos, EN 13848 para a calidade da xeometría da vía) e dá a cada límite unha caixa para a cláusula da que procede. Non se inclúe ningún número de ningunha norma: os límites de peralte, insuficiencia, exceso, pendente e variación, a xeometría dos aparellos e o gálibo de obra seguen sendo provisionais, e a xanela así o di. Un enxeñeiro ferroviario comproba cada valor co texto da propia norma e escribe a cláusula ao lado antes de construír nada. Sudáfrica e as táboas AREMA non están nesta versión.
