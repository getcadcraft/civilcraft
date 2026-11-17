---
title: Liñas de mostraxe e seccións transversais
summary: Cortar seccións perpendiculares a un trazado, ver o terreo, o deseño e o desmonte e terraplén en cada estaca, e obter volumes por áreas medias extremas.
keywords: transporte de masas, diagrama de masas, punto de equilibrio, contracción, esponxamento, distancia de transporte, préstamo, vertedoiro, follas de seccións, follas de seccións transversais, pdf de seccións, seccións, seccións transversais, liñas de mostraxe, vista de sección, desmonte, terraplén, áreas, área media extrema, volumes por áreas extremas, movemento de terras, estaca, desfase, csv
from: 5060173c
---

Unha sección transversal mostra a estrada tal como se vai construír: perpendicular ao trazado nunha estaca, o terreo existente, o deseño (o corredor ou a plataforma niveladas) e o desmonte e terraplén entre eles.

## Engadir liñas de mostraxe

1. Seleccione un trazado. En **Propiedades**, baixo **Liñas de mostraxe**, faga clic en {{ui:Engadir liñas de mostraxe}}.
2. Estableza **Cada** (o espazamento: 50 ft ou 20 m para comezar), **Ancho esquerdo** e **Ancho dereito** (ata onde chega cada sección desde a liña central).
3. Para cortar unha sección nunha estaca concreta, escriba esta en **Engadir unha estaca** (por exemplo `2+35`) e prema {{key:Enter}}.

As seccións córtanse en cada múltiplo enteiro do espazamento, nos dous extremos do trazado, no inicio e no fin de cada curva (PC e PT) e nas estacas que engada. As liñas de mostraxe aparecen na planta como liñas grises atravesando o trazado; tamén saen en DXF, DWG e PDF na capa C-ROAD-SCTN. Cada cambio é un paso: {{key:Mod+Z}} desfáino.

## A vista de sección

Ábrase con {{ui:Vista de sección}} nas **Propiedades** do trazado, con {{ui:Seccións}} baixo **Superficie** › {{ui:Máis}}, ou con {{key:X}}. Ocupa o lugar da vista de perfil baixo a planta.

- Recorra as seccións coas frechas da súa barra, coa lista de estacas, ou con {{key:Left}} e {{key:Right}} coa vista de sección enfocada ({{key:Home}} e {{key:End}} para a primeira e a última).
- A liña gris é o terreo existente, a liña vermella o deseño. O desmonte sombréase en laranxa, o terraplén en verde. Os puntos do corredor van marcados: CL (liña central), EOP (bordo da calzada), SH (espaldón) e DL (liña de intersección).
- A cabeceira dá a estaca, as áreas de desmonte e terraplén desta sección e a exaxeración vertical. **Axustar** enche o panel; escolla 1× para ver a sección a escala real.
- A liña grosa da planta indica que sección está na pantalla.

## Follas de seccións

{{ui:Follas de seccións (PDF)}} baixo **Liñas de mostraxe** pon cada sección en páxinas PDF, en filas de esquerda a dereita e de arriba a abaixo en orde de estacas. Escolla o **Papel**, a **Escala en planta** (a escala horizontal das seccións) e a **Exaxeración do perfil** (1×, 2×, 5× ou 10×); o diálogo di cantas seccións caben nunha páxina e cantas páxinas resultan.

Cada sección mostra unha cuadrícula con desprazamentos e cotas, o terreo (en trazos), o deseño, o desmonte e terraplén sombreados (laranxa e verde), os puntos do corredor e, debaixo, a súa estaca e as súas áreas de desmonte e terraplén. Todas as seccións das follas debúxanse do mesmo tamaño, o bastante altas para a máis grande; cando iso non cabe na páxina coa súa exaxeración, CivilCraft usa a máis grande que cabe e así o indica. A franxa do título indica o trazado, as estacas desa páxina, as escalas e «Folla 1 de 3».

## Volumes por áreas medias extremas

Entre dúas seccións veciñas, o volume é a media das súas dúas áreas polo espazo entre as súas estacas. A barra mostra os totais do trazado, e {{ui:CSV}} descarga as áreas e os volumes de cada sección con totais acumulados (iardas cúbicas nos proxectos en pés, metros cúbicos nos métricos).

**Propiedades** mostra os mesmos totais xunto aos volumes por cuadrícula de [Volumes de movemento de terras](topic:volumes). Os dous son aproximacións distintas: seccións máis próximas achéganos máis, e nunha estrada recta en terreo chan son iguais.

:::note
O desmonte e o terraplén só se contan dentro das áreas niveladas (as liñas de intersección dun corredor ou dunha plataforma), como fai o método de cuadrícula. Sen corredor nin plataforma o deseño é o terreo, así que unha sección non mostra desmonte nin terraplén.
:::

## Transporte de masas

**Transporte de masas** baixo **Liñas de mostraxe** debuxa o diagrama de transporte de masas a partir dos mesmos volumes por áreas extremas: ao longo das estacas, o total acumulado de desmonte menos terraplén.

- **Contracción (−) ou esponxamento (+) do desmonte** indica o que fai un iarda cúbica de desmonte cando se coloca como terraplén: −10 % (o valor de partida, un marcador de posición) significa que se reduce a 0,9; a rocha que esponxa pode ser +5 %. Use a cifra do seu informe xeotécnico.
- Onde a liña sobe, a estrada está en desmonte; onde baixa, en terraplén. Por riba de cero (sombreado en laranxa) a terra move cara a arriba da estaca; por debaixo de cero (verde), cara a abaixo.
- Os **puntos de equilibrio** son onde a liña cruza o cero: entre dous deles o desmonte e o terraplén equilibran. A táboa lista cada tramo equilibrado, o volume movido (o seu punto máis alto ou máis baixo) e a distancia media de transporte (a área sombreada dividida polo volume).
- Onde a liña acaba fóra de cero, o sobrante é **vertedoiro** (por riba) ou **préstamo** (por debaixo). Nese último tramo só conta como movida a terra máis aló do nivel no que acaba.

**CSV** garda a ordenada de masa en cada sección, os tramos e o factor.
