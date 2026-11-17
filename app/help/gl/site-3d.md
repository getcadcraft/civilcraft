---
title: Ver o emprazamento en 3D
summary: Abrir a vista 3D, orbitar, desprazar e ampliar, definir a exaxeración vertical e a cor, escoller o que se mostra, e facer clic en trazados, plataformas, liñas de elementos, liñas de rotura, tubaxes, estruturas e puntos para seleccionalos.
keywords: etiquetas, etiquetas 3d, etiqueta orientada, etiquetas de cara á cámara, etiquetas de estacas, etiquetas de curvas de nivel, etiquetas de puntos, caer, aérea, capas de mapa sobre a superficie, 3d, tres d, vista 3d, cubo de vista, brúxula, orbitar, perspectiva, paralela, isométrica, iso, exaxeración vertical, terreo, modelo, modelo do emprazamento, voar arredor, visualizar, render, tubaxes en 3d, estruturas, pozos de rexistro, corredor 3d, estrada en 3d, superficie da estrada, carrís, bordos, beirarrúas, plantas en 3d, árbores en 3d, arbustos, sebes, paisaxismo 3d, rampas en 3d, escaleiras, muros, pavimento, elementos duros 3d
from: a16bafe1
---

A vista 3D mostra o emprazamento como un único modelo: o terreo existente e a superficie niveladas, as curvas de nivel caídas sobre eles, as liñas de rotura e o bordo da superficie, cada trazado sobre o seu perfil de proxecto con marcas de estacas, as liñas de elementos do corredor e a propia estrada (carrís, espaldóns, cunetas, bordos, franxas e beirarrúas nas súas cores), as plataformas coas súas liñas de intersección, a rede de tubaxes con tubaxes e estruturas á súa cota real, e desde o espazo de traballo Paisaxismo as plantas, o pavimento, os camiños, os muros, os bordos, as rampas e as escaleiras. Le o mesmo proxecto que a planta, así que cada cambio se ve nas dúas.

## Abrir a vista 3D

1. Abra puntos de levantamento (ou un LandXML ou un ficheiro de proxecto) para que haxa unha superficie. As plantas, o pavimento ou as rampas por si soas bastan tamén para abrila.
2. Prema {{key:D}}, ou faga clic en {{ui:3D}} no grupo {{ui:Vista}} da barra de ferramentas.
   A vista 3D abre sobre a planta, mirando todo o emprazamento desde o sueste. A primeira vez tarda un momento en cargar.
3. Prema {{key:D}} de novo, ou faga clic de novo en {{ui:3D}}, para volver á planta. Escoller unha ferramenta de debuxo como {{ui:Trazado}} ou {{ui:Plataforma}} tamén volve á planta, xa que o debuxo faise aí.

## Moverse

| Para | Faga isto |
|---|---|
| Orbitar | Arrastre co botón esquerdo ou co central |
| Desprazar | Arrastre co botón dereito, ou {{key:Shift}} e arrastre |
| Ampliar | Xire a roda; amplía cara ao punteiro |
| Orbitar nun trackpad | Deslice con dous dedos ({{key:Shift}} e deslizar despraza) |
| Ampliar nun trackpad | Pinza |
| Tacto | Un dedo orbita; dous dedos pinzan para ampliar e se moven para desprazar |
| Teclas (a vista ten o foco) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbitan; con {{key:Shift}} desprazan; {{key:Plus}} e {{key:Minus}} amplían |

A barra sobre a vista ten o resto:

- A lista de vistas: **Iso**, **Superior**, **Inferior**, **Alzado** (mirando ao norte), **Posterior**, **Esquerda**, **Dereita**.
- {{ui:Perspectiva}}: premida é unha vista en perspectiva; faga clic para unha proxección paralela (sen escorzo).
- {{ui:Todo}}: mostra de novo todo. {{key:F}} fai o mesmo mentres a vista 3D está aberta.

## O cubo de vista

O cubo de vista da esquina superior dereita xira coa vista. Faga clic nun lado, un bordo ou unha esquina para mirar o emprazamento desde aí (a cámara xira suavemente, salvo que o sistema pida movemento reducido). Arrastre o cubo para orbitar. O anel da brúxula debaixo mostra o norte (norte da cuadrícula, +Y): arrástreo para xirar o emprazamento arredor da vertical, ou faga clic en N, E, S ou W para mirar desde ese lado. {{ui:Inicio}}, a pequena casa na súa esquina superior esquerda, volve á vista iso de todo o emprazamento. Co teclado: {{key:Tab}} ata o cubo, as frechas escollen un lado, bordo ou esquina, e {{key:Enter}} mira desde aí.

Na planta o mesmo cubo mostra a parte superior. Faga clic en calquera outro lado, bordo ou esquina (ou arrástreo) para abrir a vista 3D mirando desde aí: é a forma máis rápida de entrar en 3D desde unha dirección dada. Para cambiar o cubo por unha pequena icona de eixos, ou ocultalo, vexa **Indicador de esquina** en [Configuración de CivilCraft](topic:settings).

## Exaxerar as cotas

Os emprazamentos adoitan ser moito máis anchos que altos, así que as cotas estíranse un **2×** para comezar. Escolla **1×**, **2×**, **3×**, **5×** ou **10×** na lista da barra, ou en **Exaxeración vertical 3D** en [Configuración de CivilCraft](topic:settings) (son unha mesma configuración). Só cambia a vista: os volumes, os perfís e as exportacións quedan á escala real.

## Colorear as superficies

- **Bandas de cota**: as mesmas bandas e cores que as bandas de cota da planta (o número de bandas defínese en **Visualización** no panel esquerdo). Cada bordo de banda córtase exactamente na súa cota.
- **Unha cor**: o terreo existente e a superficie niveladas, cada un nunha cor lisa.
- **Capas de mapa**: as capas de mapa que se mostran baixo a planta (unha imaxe xeorreferenciada, teselas de mapa ou un servizo de mapas; vexa [Capas de mapa](topic:map-layers)) estendidas sobre as superficies como unha folla, de xeito que unha fotografía aérea se ve sobre os outeiros. As imaxes que aínda chegan énchense ao chegar. Sen ningunha capa de mapa visible, as superficies conservan as súas bandas de cota e a vista así o indica. A imaxe é para a pantalla: as exportacións GLB e OBJ non a levan.

Cando se mostran as dúas superficies, o terreo existente é transparente sobre a superficie niveladas, así que se ven o desmonte (terreo por riba do deseño) e o terraplén.

## Escoller o que se mostra

Faga clic en {{ui:Mostrar}} na barra e marque ou desmarque:

| Elemento | Que é |
|---|---|
| Terreo existente | A superficie construída a partir dos puntos de levantamento (ou lida dun LandXML) |
| Superficie niveladas | O terreo existente cos corredores e as plataformas niveladas (só cando hai algúns) |
| Arestas de triangulación | Cada aresta da TIN, como liñas |
| Curvas de nivel | Curvas de nivel menores e maiores de cada superficie mostrada, ao intervalo da planta |
| Bordo da superficie | O bordo exterior de cada superficie mostrada, nas súas cotas |
| Liñas de rotura | Cada liña de rotura, nas súas cotas |
| Trazados e estacas | Cada trazado sobre o seu perfil de proxecto (sobre o terreo onde non hai perfil), con marcas cada 50 ft ou 20 m |
| Liñas de elementos do corredor | Bordo da calzada, espaldón e intersección en ambos lados |
| Superficies de estrada | A estrada que constrúe cada corredor, a partir do seu prototipo: carrís, espaldóns, cunetas, bordos, franxas e beirarrúas, cada unha na súa cor, sobre a superficie niveladas |
| Plantas | Cada planta, e as plantas en canteiros e sebes, como formas simples dimensionadas segundo a lista de plantas: unha árbore é un tronco e unha copa redonda (un cono para unha conífera, un penacho sobre un tronco alto para unha palmeira), os arbustos, as plantas de sebe, as vivaces e as cubresoles son cúpulas, as herbas son penachos, as trepadeiras son columnas finas. Quedan sobre a superficie niveladas (ou o terreo existente) ao tamaño que mostra a planta: adulta, ou no momento da plantación |
| Elementos duros | Pavimento e camiños coas súas pendentes, muros, bordos, escaleiras e rampas que sobe en tramos con descansos nivelados entre eles |
| Plataformas e intersección | O contorno de cada plataforma á súa cota e a súa liña de intersección |
| Tubaxes e estruturas | Tubaxes como tubos redondos entre as súas soleiras, estruturas desde o marco ata o sumidoiro |
| Puntos de levantamento | Un punto en cada punto cunha cota (desactivado ao principio) |
| Capas GIS | As capas GIS mostradas na planta, nas súas cores: liñas e contornos coas súas propias cotas nesas cotas, outras colocadas sobre o terreo existente (seguen exactamente o terreo); os puntos como pequenas cruces. As formas sen cota fóra da superficie déixanse fóra, e a vista di cantas son |
| Etiquetas | Nomes e valores que sempre lle miran de fronte: o nome de cada trazado no seu inicio e as súas estacas cada 100 ft (ou cada 100 m), a cota de cada curva de nivel maior, as plataformas, as liñas de elementos e as estruturas polo nome, e con **Puntos de levantamento** marcado o número e a cota de cada punto |

As etiquetas mantéñense do mesmo tamaño e dereitas en calquera xiro ou zoom, e un outeiro diante dunha etiqueta ocúltaa. Cando se amontoarían, aparecen as máis importantes e as demais esperan a que amplíe: primeiro os trazados, despois as estruturas, as plataformas, as liñas de elementos, as estacas, as curvas de nivel e os puntos, primeiro os máis próximos. Son só para a pantalla; as exportacións e os trazados non as levan.

As súas escollas, a exaxeración e a cor quedan lembradas neste navegador.

A estrada constrúese sobre o terreo existente. Con un trazado e un corredor pero sen puntos de levantamento nin superficie aínda, a estrada debúxase sobre un terreo provisional plano: á cota media do seu perfil de proxecto, ou nivelada á cota 0 cando tampouco hai perfil. Un aviso na parte inferior da vista 3D e nas propiedades do corredor así o indica. É só unha imaxe: non sae delas ningún volume nin ningunha sección. Abra os puntos de levantamento ou unha superficie e a estrada pasa sola ao terreo real.

A exaxeración vertical estira o terreo, non as plantas: estas quedan sobre o terreo exaxerado á súa altura e extensión reais, así que unha árbore parece unha árbore en calquera axuste. As plantas son formas simples, non modelos detallados: miles delas seguen rápidas de xirar e ampliar.

## Tubaxes e estruturas

- Unha tubaxe debúxase coa súa base por dentro nas soleiras que vostede fixa e a súa parte superior por dentro (a clave) a un diámetro interior por riba. Os diámetros van en pulgadas nun proxecto en pés e en milímetros nun proxecto métrico, como no panel dereito.
- Unha estrutura vai desde o seu marco (escrito, ou da superficie) ata o seu sumidoiro (a soleira máis baixa menos a profundidade do sumidoiro). Sen ningunha soleira, debúxase a 5 ft (1,5 m) de profundidade.
- As tubaxes e estruturas con algún problema (vexa a comprobación da rede no panel dereito) debúxanse en vermello.
- Unha tubaxe sen soleiras non se debuxa; unha nota na parte inferior da vista indica cantas son.

## Seleccionar desde a vista 3D

Faga clic nun trazado (ou na súa estrada), unha plataforma, unha liña de elementos, unha tubaxe, unha estrutura, un punto de levantamento, unha planta, unha rampa ou outro elemento duro. Selecciónase exactamente como se fose un clic na planta: as súas propiedades abren no panel dereito, onde pode editalas, e debúxase na cor de selección por riba de todo en 3D. Todo o que seleccione na planta resáltase tamén en 3D. Unha pista xunto ao punteiro nomea o que pulsou con o seu este, norte e cota. As tubaxes e as estruturas pódense pulsar mesmo onde están baixo o terreo; unha liña oculta tras un outeiro non se pode pulsar a través del.

Faga clic nunha liña de rotura para ver cal é: resáltase, e a barra de estado a nomea (as liñas de rotura non teñen propiedades propias).

Faga clic no terreo para ler o este, o norte e a cota alí na pista.

## Conducir por un trazado

Faga clic en **Conducir** na barra 3D e escolla un trazado. A vista pásase a un asento de condutor: 3,5 ft (1,07 m) por riba da estrada, sobre o seu perfil de proxecto (sobre o terreo existente pola liña central cando aínda non ten ningún), mirando cara adiante ao longo del.

- **Reproducir** ou {{key:Space}} conduce á velocidade que escolla (de 10 a 65 mph, ou de 15 a 100 km/h); {{key:Space}} de novo pausa. Para ao final; **Reproducir** entón comeza de novo desde o inicio.
- A barra deslizante salta a calquera estaca; {{key:Left}} e {{key:Right}} avanzan ou retroceden 10 ft (5 m).
- Arrastrar na vista pausa e permítelle mirar ao seu redor.
- **Parar** ou {{key:Esc}} devolve a vista ao punto onde estaba.

A exaxeración vertical aplícase tamén mentres se conduce: póñaa en 1× para ver a estrada como vai quedar.

## Luz do sol

Abra **{{ui:Sol}}** na barra 3D e marque **Luz do sol**. Dea unha data, unha hora do reloxo e a súa zona horaria (a diferenza respecto a UTC: no verán, a da hora de verán), e a latitude e a lonxitude do emprazamento. Cando o proxecto ten un sistema de coordenadas, énchense a partir del.

O emprazamento queda iluminado desde onde está o sol, con **Sombras** sobre o terreo, o corredor e as plataformas; o menú indica o acimut do sol e a súa altura, ou que está por debaixo do horizonte. As posicións saen das ecuacións solares da NOAA. As sombras caen ben a calquera exaxeración, pero paran no bordo do emprazamento: os outeiros e os edificios máis alá non proxectan ningunha.

## Exportar a vista 3D

Faga clic en {{ui:GLB}} ou {{ui:OBJ}} na barra. O que mostra a vista gárdase á escala real (sen exaxeración), en metros, con Y cara arriba. Detalles: [Exportar o emprazamento en 3D](topic:export-3d).
