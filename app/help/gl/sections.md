---
title: Liñas de mostraxe e seccións transversais
summary: Cortar seccións en ángulo recto a un trazado, ver o terreo, o proxecto e o desmonte e terraplén en cada estaca, e obter volumes polo método das áreas extremas medias.
keywords: diagrama de masas, punto de equilibrio, contracción, expansión, distancia de transporte, préstamo, vertedoiro, follas de seccións, follas de seccións transversais, pdf de seccións, seccións, seccións transversais, liñas de mostraxe, vista de sección, desmonte, terraplén, áreas, área extrema media, volumes de áreas extremas, movemento de terras, estaca, desprazamento, csv
from: 09639ce2
---

Unha sección transversal amosa a estrada tal como se vai construír: atravesando o trazado nunha estaca, o terreo existente, o proxecto (o corredor ou a plataforma nivelada) e o desmonte e terraplén entre eles.

## Engadir liñas de mostraxe

1. Seleccione un trazado. En **Propiedades**, en **Liñas de mostraxe**, prema {{ui:Engadir liñas de mostraxe}}.
2. Estableza **Cada** (o espazamento: 50 ft ou 20 m ao inicio), **Largura esquerda** e **Largura dereita** (ata onde chega cada sección desde o eixe).
3. Para cortar unha sección nunha estaca concreta, escríbaa en **Engadir unha estaca** (por exemplo `2+35`) e prema {{key:Enter}}.

As seccións córtanse en cada múltiplo exacto do espazamento, nos dous extremos do trazado, no inicio e no fin de cada curva (PC e PT), e nas estacas que engada. As liñas de mostraxe amósanse no plano como liñas grises que atravesan o trazado; tamén saen en DXF, DWG e PDF na capa C-ROAD-SCTN. Cada cambio é un paso: {{key:Mod+Z}} desfaino.

## A vista de sección

Ábrase con {{ui:Vista de sección}} nas **Propiedades** do trazado, {{ui:Seccións}} en **Superficie** › {{ui:Máis}}, ou {{key:X}}. Ocupa o lugar da vista de perfil debaixo do plano.

- Recorra as seccións coas frechas da súa barra, coa lista de estacas, ou con {{key:Left}} e {{key:Right}} coa vista de sección enfocada ({{key:Home}} e {{key:End}} para a primeira e a última).
- A liña gris é o terreo existente, e a liña vermella o proxecto. O desmonte sombréase en laranxa e o terraplén en verde. Os puntos do corredor márcanse: CL (eixe), EOP (bordo da calzada), SH (arcén) e DL (liña de intersección).
- A cabeceira dá a estaca, as áreas de desmonte e terraplén desta sección e a exaxeración vertical. **Axustar** enche o panel; escolla 1× para ver a sección a escala verdadeira.
- A liña grosa no plano indica que sección está na pantalla.
- **Zoom e desprazamento**: a roda amplía ao redor do punteiro, e arrastrar move a vista. {{ui:Axustar}} (ou {{key:F}}, ou un dobre clic) volve axustar a sección completa.

## Medir nunha sección

1. Prema {{ui:Medir}} na barra da sección, ou prema {{key:M}}. A indicación di: "Prema o primeiro punto e despois o segundo."
2. Prema dous puntos. Cada un encaixa no extremo dunha liña ou nun punto do corredor (CL, EOP, SH, DL); manteña {{key:Alt}} para un punto libre.
3. A lectura dá a distancia horizontal (ΔH), a distancia vertical (ΔV), a pendente en porcentaxe co seu cociente e a lonxitude recta, nas unidades do proxecto.

Prema de novo para iniciar unha nova medida. {{key:Esc}} borra a medida, e {{key:M}} desactiva Medir.

## Follas de seccións

{{ui:Follas de seccións (PDF)}} en **Liñas de mostraxe** pon cada sección en páxinas PDF, en filas de esquerda a dereita e de arriba abaixo, en orde de estaca. Escolla o **Papel**, a **Escala do plano** (a escala horizontal das seccións) e a **Exaxeración do perfil** (1×, 2×, 5× ou 10×); o diálogo di cantas seccións caben nunha páxina e cantas páxinas resultan.

Cada sección amosa unha cuadrícula con desprazamentos e cotas, o terreo (en trazos), o proxecto, o desmonte e o terraplén sombreados (laranxa e verde), os puntos do corredor e, debaixo, a súa estaca e as súas áreas de desmonte e terraplén. Todas as seccións nas follas se debuxan do mesmo tamaño, o bastante altas para a máis grande; cando non cabe na páxina coa súa exaxeración, CivilCraft usa a maior que cabe e indícao. A franxa do título indica o trazado, as estacas desa páxina, as escalas e a numeración da folla (Folla 1 de 3).

## A que se miden o desmonte e o terraplén

Un corredor pode ter capas debaixo do pavimento: capas do firme, compoñentes de plantillas, pista. O selector **Volumes medidos ata** da barra da sección escolle ata onde chegan o desmonte e o terraplén:

- **Superficie inferior** (o inicio): ata a base desses compoñentes, así que o desmonte inclúe a profundidade da estrutura do pavimento.
- **Superficie superior**: só ata o alto do proxecto, como antes contaban os compoñentes.

As áreas da cabeceira, os volumes de abaixo, o CSV e o diagrama de masas seguen esta escolla, e gárdase co proxecto.

## Volumes por áreas extremas medias

Entre dúas seccións veciñas, o volume é a media das súas dúas áreas polo espazamento entre as súas estacas. A barra amosa os totais do trazado, e {{ui:CSV}} descarga as áreas e volumes de cada sección con totais acumulados (iardas cúbicas en proxectos en pés, metros cúbicos nos métricos).

**Propiedades** amosa os mesmos totais xunto aos volumes polo método de cuadrícula de [Volumes de movemento de terras](topic:volumes). Son aproximacións distintas: seccións máis próximas achégaos, e nunha estrada recta en terreo chan son iguais.

:::note
O desmonte e o terraplén só se contan dentro das áreas niveladas (as liñas de intersección dun corredor ou dunha plataforma), como fai o método de cuadrícula. Sen corredor nin plataforma o proxecto é o terreo, así que unha sección non amosa desmonte nin terraplén.
:::

## Diagrama de masas

**Diagrama de masas** en **Liñas de mostraxe** debuxa o diagrama de masas a partir dos mesmos volumes de áreas extremas: ao longo das estacas, o total acumulado de desmonte menos terraplén.

- **Contracción (−) ou expansión (+) do desmonte** indica o que fai un metro cúbico de desmonte cando se coloca como terraplén: −10 % (o valor inicial, un marcador) significa que se reduce a 0.9; unha rocha que se expande podería ser +5 %. Use a cifra do seu informe xeotécnico.
- Onde a liña sobe, a estrada está en desmonte; onde baixa, en terraplén. Por riba de cero (sombreado en laranxa), a terra móvese cara a diante da estaca; por baixo de cero (verde), cara atrás.
- Os **puntos de equilibrio** son onde a liña cruza cero: entre dous deles o desmonte e o terraplén equilíbranse. A táboa lista cada tramo equilibrado, o volume movido (o seu punto máis alto ou máis baixo) e a distancia media de transporte (a área sombreada dividida por ese volume).
- Onde a liña remata lonxe de cero, o que sobra é o **vertedoiro** (por riba) ou o **préstamo** (por baixo). Nese último tramo só conta a terra por encima do nivel no que termina.

**CSV** garda a ordenada de masa en cada sección, os tramos e o factor.
