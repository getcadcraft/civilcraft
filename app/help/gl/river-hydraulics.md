---
title: Perfís da superficie da auga dos ríos
summary: Modelar un río a partir da superficie do terreo e calcular perfís permanentes da superficie da auga polo método do paso estándar: niveis da auga, enerxía, velocidades, números de Froude e a extensión da inundación en planta. Función de laboratorio; cada resultado necesita a revisión dun enxeñeiro.
keywords: dique, área de caudal ineficaz, editor de seccións, río, hidráulica, perfil da superficie da auga, remanso, paso estándar, caudal permanente, 1d, seccións transversais, manning, rugosidade, conductancia, calado crítico, calado normal, froude, liña de enerxía, extensión da inundación, leito de inundación, inundación, marxes do leito, lonxitudes de tramo, contracción, expansión, subcrítico, supercrítico, réxime mixto, resalto hidráulico
from: fb8bf425
---

CivilCraft calcula perfís da superficie da auga unidimensionais e permanentes ao longo dun río: para cada caudal que indique, o nivel da auga en cada sección transversal, a partir do balance de enerxía entre seccións veciñas (o método do paso estándar). Está no laboratorio mentres se comproba.

**Só como axuda para o deseño.** Os niveis da auga precisan a revisión dun enxeñeiro cualificado antes de que alguén se fíe deles: un modelo 1D vale o que valen as súas seccións, os seus valores de rugosidade, as lonxitudes de tramo e os contornos, e non coñece pontes, bueiros nin o caudal que sae do río.

## Debuxar o río

1. Constrúa primeiro a superficie do terreo existente (puntos, liñas de rotura ou unha TIN que abrise).
2. Baixo **Superficie** › {{ui:Máis}}, escolla {{ui:Río}}.
3. Faga clic ao longo da liña central do río **de augas arriba a augas abaixo**, e logo prema {{key:Enter}} ou faga dobre clic.

CivilCraft corta unha sección perpendicular á liña central cada 50 m (200 ft), 100 m (300 ft) a cada lado, a partir do terreo. As estacas do río mídense desde o extremo de augas abaixo, así que medran augas arriba. As marxes comezan como unha estimación a 10 m (30 ft) a cada lado do punto máis baixo de cada sección.

Para engadir unha sección onde o río se estreita ou hai unha obra, seleccione o río, faga clic en {{ui:Engadir unha sección}} e debuxe unha liña de corte que o atravese (en calquera sentido: xírase para que vaia de esquerda a dereita mirando augas abaixo).

## Configurar o río

Seleccione o río para ver as súas propiedades en **Propiedades**:

- **Réxime de caudal**: subcrítico (o habitual: calcúlase augas arriba desde o contorno de augas abaixo), supercrítico (calcúlase augas abaixo desde o contorno de augas arriba) ou mixto (ambos, e logo o que teña a maior forza específica en cada sección; unha vista previa).
- **Perfís de caudal**: un nome e un caudal para cada un (por exemplo un caudal de 10 anos e outro de 100 anos), e o contorno no extremo de augas abaixo (e no de augas arriba cando o réxime non é subcrítico): **Calado normal** cunha pendente de enerxía (a pendente do leito é unha primeira estimación), unha **Superficie da auga coñecida** en cota, ou **Calado crítico**.
- **Seccións desde o terreo**: o espazamento, canto se estende á esquerda e á dereita, a estimación das marxes e os dous valores de n de Manning; {{ui:Cortar as seccións de novo}} substitúe as seccións (un paso de Desfacer).
- **A táboa de seccións**: para cada sección, os desprazamentos das marxes á esquerda e á dereita, o n do canal e o n da zona de desbordamento, as lonxitudes de tramo ata a seguinte sección augas abaixo (zona de desbordamento esquerda, canal, zona de desbordamento dereita; medidas desde a planta para comezar) e os coeficientes de contracción e expansión (0,1 e 0,3 para comezar: transicións graduais). {{ui:Editar}} abre o editor de seccións (a seguir); un punto despois del indica que a sección ten un dique ou unha área ineficaz.

Cada cambio é un paso de Desfacer ({{key:Mod+Z}}).

## Editar unha sección: marxes, diques e áreas ineficaces

{{ui:Editar}} nunha sección debuxa o seu terreo e permítelle arrastrar o que lee o solucionador: a **marxe esquerda e a dereita** (dividen a sección en zona de desbordamento esquerda, canal principal e zona de desbordamento dereita), un **dique** a cada lado e **áreas de caudal ineficaz**. Cada manexador tamén se pode mover coas teclas de frecha, e cada número pódese escribir xunto ao gráfico. {{ui:Aplicar}} é un paso de Desfacer.

- Un **dique** ten unha posición (desprazamento) e unha cota de coroación. O terreo máis aló del, lonxe do río, queda separado do río mentres a superficie da auga está por debaixo da coroación: a súa área, o perímetro mollado e a conductancia quedan excluídos. Por riba da coroación, toda a sección volve contar. Un dique queda fóra da marxe que protexe; un que estea dentro das marxes márcase.
- Unha **área de caudal ineficaz** retén auga pero non leva caudal (un recuncho detrás dun terraplén, auga morta xunto a un acceso a unha ponte). Indique os seus dous desprazamentos e, se quere, un nivel de auga por debaixo do cal é ineficaz ({{ui:sempre}} cando estea en branco): por riba dese nivel, flúe como o resto. Unha que cubra parte do canal principal márcase.
- Entre dúas seccións, a extensión da inundación deixa en seco o terreo detrás dun dique que teñan ambas seccións, mentres a superficie da auga alí estea por debaixo da coroación (a liña entre as dúas coroacións é recta).

## Calcular e ler os resultados

Prema {{ui:Perfís da superficie da auga}}. Para o perfil que escolla obtén:

- un **gráfico** ao longo do río (caudal de esquerda a dereita): fondo do canal, marxes, superficie da auga, liña de enerxía e superficie crítica da auga; as seccións mantidas en calado crítico van marcadas con un círculo;
- unha **táboa** por sección: estaca do río, caudal, fondo do canal, superficie da auga, superficie crítica da auga, liña de enerxía, calado, velocidade no canal e en conxunto, o número de Froude do canal, área do caudal, anchura en superficie, o caudal en cada zona de desbordamento e no canal, a pendente de enerxía e os avisos;
- **avisos** en palabras simples, por exemplo unha sección fixada en calado crítico, auga por riba dos extremos dunha sección, ou un cambio grande de conductancia entre dúas seccións (engada seccións intermedias).

{{ui:Táboa (CSV)}}, {{ui:Informe}} (texto simple co método, os contornos e todas as táboas) e {{ui:Gráfico (SVG)}} gárdanse nas súas descargas. Cada un leva a liña de revisión.

Marque {{ui:Amosar a extensión da inundación}} en **Propiedades** para sombrear a zona mollada en planta para o perfil escollido, cunha liña de auga trazada onde o calado é cero. Entre seccións a superficie da auga é horizontal de lado a lado do río e cambia de xeito lineal coa estaca do río. O terreo detrás dun dique queda en seco mentres a auga estea por debaixo da coroación. Outro terreo baixo dentro do corredor do río ao que a auga non chega (detrás dun terraplén de estrada, por exemplo) segue sombreado: revíseo.

## No debuxo e en Problemas

As liñas do río van á planta, ao PDF e ao DWG nas súas propias capas: **C-WATR-CNTR** (a liña central), **C-WATR-SCTN** (cada liña de corte, coa súa estaca do río) e **C-WATR-FLOD** (a liña de auga da extensión da inundación, cando {{ui:Amosar a extensión da inundación}} está marcado para un perfil). Os avisos do río (unha sección fixada en calado crítico, auga por riba dos extremos das seccións, un cambio de conductancia que pide máis seccións, un balance de enerxía que non pechou, un dique dentro das marxes) tamén van ao panel **Problemas**, referidos ao río e situados na sección de onde proceden.

## Como se calcula

- Enerxía entre dúas seccións: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Conductancia por subdivisión: cada zona de desbordamento divídese onde cambia o seu n, K = Σ (1/n)·A·R^(2/3) (1,486/n en unidades US); o canal é unha soa peza, cun n composto cando cambia o seu n. α sae de como se reparte a conductancia.
- Pendente de fricción por conductancia media, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², sobre a lonxitude de tramo ponderada polo caudal.
- Coeficiente de contracción cando o caudal se acelera augas abaixo, e de expansión cando se frea.
- Calado crítico = enerxía específica mínima. Cada nivel da auga resólvese dentro dun intervalo, de modo que nunca salta ao lado equivocado do crítico; cando non hai resposta, fíxase en calado crítico e márcase.

O programa compróbase contra o calado normal de Manning, o calado crítico nun canal rectangular e o exemplo de remanso de Chow (*Open-Channel Hydraulics*, 1959, capítulo 10), integrado de forma independente. O mesmo método úsano os programas comúns de ríos 1D, así que un cálculo a man ou os apuntes dun estudante son transferibles.

## Bueiros e pontes

No bloque **Propiedades** do río, baixo **Bueiros e pontes**, {{ui:Engadir un bueiro}} ou {{ui:Engadir unha ponte}} coloca unha obra entre dúas seccións (cada tramo conserva polo menos dúas). O perfil debaixo dela non cambia; a superficie da auga xusto augas arriba vén da obra, e o perfil continúa augas arriba desde aí. **Resultados** engade unha táboa de cada obra: auga abaixo, nivel de auga arriba, que control domina, o caudal polo vau e o caudal sobre a estrada ou o tablero. Só para caudal subcrítico.

- **Bueiro** (en caixón ou redondo, un ou máis canos iguais). O control de entrada é caudal de vertedoiro mentres a entrada está libre e caudal por orificio cando queda afogada, mesturado entre un nivel de auga arriba de un a un e medio vez a altura. O control de saída é o balance de enerxía: perda na entrada, fricción e altura de velocidade de saída, sobre o maior entre a auga abaixo e o punto medio do calado crítico e a clave, menos a caída ao longo do cano. O nivel de auga arriba é o maior dos dous. Marque **A auga pode pasar pola estrada** e o caudal de vertedoiro da estrada comparte o caudal cos canos.
- **Ponte.** A abertura é a sección por debaixo da ponte, cortada nos estribos, con cada pila como unha área que non leva caudal. A superficie da auga na abertura vén da sección de abaixo (coeficiente de expansión), e a sección de arriba da abertura (coeficiente de contracción). Se a abertura non pode pasar o caudal con esa auga abaixo, funciona en calado crítico e a ponte márcase como obstrución. Se a auga alcanza o cordón inferior, o caudal é de presión (tipo compuerta mentres a auga abaixo estea por debaixo do cordón inferior, afogado por riba del), e a auga sobre o tablero engade caudal de vertedoiro; o nivel augas arriba é aquel no que todo suma o caudal.

Os coeficientes (descarga, perda na entrada, vertedoiro) son valores predeterminados de cifras redondas. Cámbieos para o seu deseño. Non son os ábacos axustados que publican os manuais de deseño de bueiros, así que trate o nivel de auga arriba dun bueiro preto do seu límite como unha estimación. A auga sobre unha estrada ou un tablero, unha entrada afogada, unha abertura obstruída e o caudal rápido nun cano móstranse en **Problemas**.

## Caudal non permanente

{{ui:Caudal non permanente…}} nas **Propiedades** do río encamiña un hidrograma de cheas polas seccións. Escriba o caudal de entrada como horas e caudais, un par por liña, a pendente de augas abaixo (calado normal) e canto tempo se executa. Arranca desde a superficie permanente da auga no primeiro caudal e resolve as ecuacións unidimensionais completas (o esquema implícito de catro puntos, ponderado 0,6 no tempo). Obtén o nivel máximo da auga e o caudal máximo en cada sección coa hora en que ocorre cada un, un gráfico do caudal nos dous extremos e a comprobación de volumes (entrada, saída e a variación almacenada). Compróbase que o caudal permanente se mantén permanente, que un escalón na entrada acaba no perfil permanente do novo caudal, que os volumes pechan e a velocidade da onda de cheas fronte á onda cinemática. Só caudal subcrítico, un tramo, sen caudal lateral e sen bueiros nin pontes dentro da execución.

## Confluencias

Tramos que xuntan o caudal nunha soa saída: os caudais suman, e a superficie da auga na cabeceira do tramo de augas abaixo sóbese ata os extremos dos tramos que se unen a el (a mesma superficie da auga na confluencia, o método simple: sen ángulo, sen momento, así que convén para números de Froude baixos). O modelo e as probas están no seu sitio (`river-structures.js`); aínda non se construíu un panel para unir dous ríos no plano.

## Aínda non construído

Vertedoiros e compuertas como estruturas propias, un panel para confluencias, estruturas dentro dunha execución non permanente e caudal supercrítico non permanente. Unha execución en réxime mixto marca un resalto hidráulico entre dúas seccións, pero non o sitúa.

**Onde se unen os ríos.** En Propiedades dun río, «Desemboca en» indica o río co que se une. Os ríos que se unen resólvense xuntos: o río no que desembocan leva a suma dos seus caudais, e cada un deles remata na superficie da auga da primeira sección dese río (o método da superficie da auga igual; deixa de lado o ángulo e o momento dos caudais). Para unir un río principal cun regato, debuxe un río curto augas abaixo da confluencia e faga que ambos desemboquen nel. Os resultados mostran unha táboa de confluencia. Os valores predeterminados destes resultados (contracción 0,1, expansión 0,3, canal dunha soa peza cunha rugosidade composta, o réxime mixto pola forza específica) mantéñense ata que un enxeñeiro os revise, e os Resultados así o indican.
