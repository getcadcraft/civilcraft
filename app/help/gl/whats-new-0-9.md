---
title: Novidades da 0.9
summary: Plantillas de corredor e de terreo, encaixes e botóns Escoller ao debuxar, análise GIS cunha táboa de atributos, estudos de sombra, produción solar, confort e vento para un sitio, unha vista de Render 3D, e os complementos Nubes de puntos e WaterCraft.
keywords: novidades, 0.9, notas da versión, plantillas de corredor, plantillas de terreo, editor de plantillas, sección tipo, varios corredores, encaixe, encaixes, escoller, mover, copiar, xirar, tanxente, render, render 3d, análise gis, zona de influencia, superposición, unión espacial, táboa de atributos, estilo por atributo, estudo de sombra, produción solar, utci, confort exterior, estudo de vento, openfoam, nubes de puntos, las, laz, watercraft, caudal de incendio, hidrante, idade da auga, cloro, demandas, info-burbullas, disposición, notas da versión, rexistro de cambios, cambios, 0.8, 0.8.1, versión, novas funcionalidades, chuvia, pluviais, encharcamento, desbordamento, movemento de terras, balance, desmonte e terraplén, transporte, mellor ruta, custo mínimo, trazado, balsa de retención, desaugadoiro, esgotamento, francobordo, progreso, levantamento, drone, acopio, enderezo á parcela, parcela, solo, cheas, estabilidade de taludes, bishop, asentamento, cruzamento, marcas viarias, sinais, distancia de visibilidade, compensación, mínimos cadrados, poligonal, canteira a ceo aberto, modelo de bloques, enlace de radio, fresnel, desvío, cruzamento de vías, idiomas, problemas, live, dwg
from: d7ac5b14
---

Isto é o que cambiou en CivilCraft 0.9, comparado coa 0.8.1. CivilCraft 0.9 forma parte de CadCraft Studio 0.9 e das súas oito aplicacións. As partes grandes son as plantillas de corredor e de terreo, os encaixes ao debuxar, a análise GIS, os estudos do sol, da produción solar, do confort e do vento dun sitio, e dous complementos: Nubes de puntos e WaterCraft.

## Novidades

### Plantillas de corredor e de terreo

- **Plantillas de corredor.** Abra {{ui:Surface}} › {{ui:More}} › {{ui:Corridor templates…}} (ou escriba {{cmd:TEMPLATES}}). Unha plantilla é unha pequena sección transversal con compoñentes, desfasamentos, pendentes, materiais e códigos de punto. Gárdeas no proxecto, en {{ui:My library}} ou como ficheiro `.cctemplates.json`. O editor de plantillas mostra un debuxo a escala real e lista os problemas segundo escribe.
- **Construír a partir de plantillas por estaca.** Seleccione un trazado e active {{ui:Build from templates by station}} nas súas Propiedades. Cada lado de cada rexión ten a súa propia lista de firme e a súa propia condición final. {{ui:Add a corridor}} en {{ui:Corridors on this alignment}} pon varios corredores nun mesmo trazado.
- **Plantillas de terreo.** {{ui:Surface}} › {{ui:More}} › {{ui:Plantillas de terreo…}} (ou escriba {{cmd:TERRAINTEMPLATES}}) estende materiais por capas, como terra vexetal ou firme e base, sobre un terreo, con superficie e volume por capa. Vexa [Plantillas de corredor e plantillas de terreo](topic:corridor-templates).

### Debuxo

- **Encaixes.** As ferramentas Trazado, Parcela, Masa, Liña de elemento, Medir, Límite e Zona de captación encaixan en puntos de levantamento, PI, esquinas, vértices e estruturas, cunha etiqueta xunto ao marcador. Manteña premida {{key:Alt}} para un punto libre.
- **Botóns Escoller, tanxente e mover, copiar e xirar.** As esquinas de Plataforma, Parcela e Liña de elemento teñen caixas de Este e Norte escritas e un botón Escoller con cruz. Propiedades tamén ten {{ui:Tanxente desde dous puntos}} para os trazados e {{ui:Mover, copiar e xirar}} para trazados, plataformas, parcelas e liñas de elemento. Vexa [Debuxar con encaixes, esquinas escollidas e mover, copiar, xirar](topic:draft-with-snaps).
- **Vista de render en 3D.** O botón {{ui:Render}} da barra 3D debuxa o terreo con cores naturais, ceo, bruma e sombras suaves. Non cambia o modelo. O menú {{ui:Sun}} ten agora botóns {{ui:Apply}} e {{ui:Close}}. Vexa [Ver o sitio en 3D](topic:site-3d).
- **Os paneis ábrense unha sección de cada vez.** O panel esquerdo e o panel de Propiedades abren unha sección e pechan as outras, e as teselas da cinta de Paisaxismo que conteñen varias ferramentas son botóns divididos.

### Análise GIS

- **Analizar.** {{ui:Surface}} › {{ui:More}} › {{ui:Analizar}} ofrece zona de influencia, superposición, unión espacial, selección por atributo ou forma, e medición. Cada ferramenta fai unha capa nova nun só paso de desfacer.
- **Táboa de atributos.** O menú de tres puntos dunha capa ten {{ui:Táboa de atributos…}} e {{ui:Estilo por atributo…}}. Vexa [Analizar capas GIS](topic:gis-analysis) e [Traballar coa táboa de atributos dunha capa](topic:gis-table).

### O sitio: sol, produción solar, confort e vento

- **Sección de ambiente.** Seleccione unha masa: a sección {{ui:Environment}} está debaixo de {{ui:Horas de sol}} nas súas Propiedades. Ten un estudo de sombra (mapa, táboa, animación, CSV), produción solar a partir dun ficheiro de tempo de referencia dun ano típico (.epw) e confort exterior (UTCI).
- **Vento, só para cribado.** {{ui:Run wind study}} colorea o terreo desde sentado ata incómodo para cada dirección do vento no ficheiro de tempo. Non está validado e o panel así o indica.
- **Complemento de vento peonil (OpenFOAM).** Desactivado ata que o active en {{ui:Settings}} › {{ui:Add-ons}}. OpenFOAM é un programa que instala vostede mesmo. Vexa [Sombra, produción solar e confort exterior](topic:environment).

### Nubes de puntos (complemento)

- Active {{ui:Point clouds}} en {{ui:Settings}} › {{ui:Add-ons}}; aparece unha lapela de Nubes de puntos no panel da dereita. Abra un ficheiro LAS ou LAZ, límpeo, ordéneo en terreo, vexetación e edificios, constrúa o terreo, as curvas de nivel e os volumes, e exporte LAS ou LAZ. Vexa [Nubes de puntos dun drone ou escáner](topic:point-clouds).

### WaterCraft (complemento)

- Active {{ui:WaterCraft (distribución de auga)}} en {{ui:Settings}} › {{ui:Add-ons}}; aparece unha lapela de WaterCraft. Ten demandas de clientes, caudal de incendio en cada hidrante, cal corte de conduto importa máis, e idade da auga e cloro, cada un gardado como CSV. Vexa [WaterCraft: demandas, caudal de incendio, cortes e idade da auga](topic:watercraft).

### Traballo en equipo

- Nunha sesión Live vese o cursor e o nome dos demais no plano. Na biblioteca de plantas, Paisaxismo de CivilCraft comeza coa súa colección predeterminada, {{ui:Paisaxismo de CivilCraft}}.

## En todas as aplicacións

- As suxestións móstranse como info-burbullas de Bootstrap, e a suxestión inicial pode pecharse.
- A franxa de lapelas dun panel que non cabe despraza-se en vez de cortarse.
- Os títulos das lapelas do navegador len `<documento> - CivilCraft | CadCraft`.
- {{ui:Settings}} ten unha sección de Disposición, onde as disposicións son unha lista despregable de opcións de dúas liñas.
- As unidades de peso e temperatura están en {{ui:Settings}} › {{ui:Global}} › {{ui:Units}}.
- A lista de idiomas mostra os idiomas para os que a compilación ten ficheiros. As linguas distintas do inglés son borradores automáticos.

## Corrixido

- Os complementos de busca de enderezos e de comprobación de EnergyPlus non se podían activar; agora sí.
- A axuda di agora que o complemento Nubes de puntos garda unha nube limpa como LAS 1.4 ou LAZ.
- Facer clic no propio agarre do obxecto seleccionado xa non inicia un arrastre de agarre que paraba un Escoller en espera.

## Límites recoñecidos

- As plantillas de corredor de exemplo son marcadores de posición sen norma; un enxeñeiro debe comprobalas. As plantillas de terreo non engaden superficie e non se debuxan en 3D nin na vista de sección. O segundo corredor dun trazado non está na exportación IFC. Non hai transición entre dúas plantillas por estaca.
- As nubes de puntos probáronse con ficheiros inventados, non cun levantamento real con drone. Só se len LAS e LAZ.
- A análise GIS probouse con capas inventadas.
- Sombra, sol e confort son estimacións de planificación; o vento é un cribado sen validar. Nada disto é un valor de deseño.
- WaterCraft é unha axuda de cálculo comprobada con redes inventadas. Un técnico en auga decide canto valen os números.
- As linguas distintas do inglés son borradores automáticos.
- Os instaladores de Windows non levan sinatura de código, e a imaxe de disco de macOS non está notarizada.

## Anteriores: 0.8 e 0.8.1

Isto é o que cambiou en CivilCraft 0.8 (2026-11-01) e 0.8.1 (2026-11-02), comparado coa 0.7. As partes novas máis grandes son ferramentas que proban o seu movemento de terras e o seu sitio (chuvia, movemento de terras, rutas, balsas, progreso) e seis xanelas de cálculo para terreo, estradas, levantamento, minas, enlaces e vía.

### Novidades

**Probe o seu movemento de terras**

- **Facer chover.** {{ui:Facer chover…}} (en {{ui:Surface}}) fai caer unha tormenta sobre o terreo con pendentes. Vese a auga correr dende as plataformas, encharcarse nos recunchos baixos e desbordar as balsas que son demasiado pequenas. A execución anímase e dá os volumes, o caudal máximo de saída e un CSV de cada balsa. A celda predeterminada é grosa para que a primeira ollada sexa rápida; unha celda máis fina é máis lenta. As balsas que desbordan aparecen tamén no panel de Problemas.
- **Equilibrio de movemento de terras.** {{ui:Equilibrio de movemento de terras…}} sobe ou baixa unha plataforma ata que desmonte iguala o terraplén, e mostra a táboa de transporte entre eles.
- **Mellor ruta.** {{ui:Mellor ruta…}}: escolla un inicio e un final, e CivilCraft atopa o camiño máis barato polo terreo que respecta os seus límites de pendente e curva, e despois fai un trazado a partir del.
- **Balsas de retención.** {{ui:Balsas de retención…}} calcula a cota e o almacenamento a partir do seu terreo, admite dispositivos de desaugadoiro (orificio, vertedoiro, en V, aliviadoiro), fai pasar unha tormenta pola balsa e comproba o caudal máximo retido, o tempo de esgotamento e o francobordo.
- **Progreso a partir de levantamentos.** {{ui:Progreso a partir de levantamentos…}} compara superficies de drone ou escáner de datas distintas co terreo tal como estaba e co deseño: porcentaxe completada por volume, zonas escavadas de máis e enchidas de máis, acopios, e cando remata a obra a este ritmo (marcado como estimación).

**Coñeza o sitio**

- **Enderezo á parcela.** {{ui:Enderezo á parcela…}} aliña datos abertos de parcelas, edificios, urbanismo, solo, cheas e terreo nun só sitio. Pode gardar o sitio no ficheiro de proxecto: o enderezo escrito, cada fonte co día en que a obtivo e a súa licenza, e o que devolveu. Reabra ou comparta o proxecto e o sitio segue aí, sen volver obter nada. Tamén pode gardalo como ficheiro de sitio ou envialo a BimCraft. Vexa [Enderezo á parcela](topic:address-to-site).

**Terreo, estradas, levantamento, minas, enlaces e vía**

- **Solos e pendentes.** {{ui:Solos e pendentes…}} debuxa o perfil do solo entre as sondaxes que escribe. O método de Bishop busca despois o círculo crítico no seu terreo, cunha capa freática, unha sobrecarga e un coeficiente sísmico; o asentamento dunha zapata inclúe consolidación, asentamento inmediato e tempo.
- **Cruzamentos e marcas viarias.** {{ui:Cruzamentos e marcas viarias…}} xunta ramais con curvas de bordo (un radio por ramal, ou curvas de tres centros), a distancia de visibilidade para a velocidade de proxecto, unha comprobación dos triángulos de visibilidade, pasos de peóns, liñas de parada, marcas e sinais cun cadro de sinais. Debúxanse no plano e gárdanse como .dxf con capas con nome.
- **Compensación topográfica.** {{ui:Compensación topográfica…}} fai unha compensación por mínimos cadrados dunha poligonal ou dunha rede: coordenadas compensadas, elipses de erro, a proba de chi cadrado e unha marca na medida que non encaixa. Inclúense redes libres, pechar unha poligonal pola regra da brúxula e RW5, e ficheiros de campo GSI, JobXML ou CSV, e os puntos compensados gárdanse como CSV.
- **Canteiras a ceo aberto.** {{ui:Canteiras a ceo aberto…}} convirte mostras de sondaxe nun modelo de bloques e na cava final dentro do seu ángulo de talude, coa razón de estéril, unha táboa por banco e unha curva de lei e tonelaxe. Tamén hai cavas aniñadas por factor de ingresos e un calendario de produción cun fluxo de caixa descontado.
- **Enlaces de radio.** {{ui:Enlaces de radio…}} comproba a liña de visión sobre o seu terreo coa curvatura terrestre, a primeira zona de Fresnel, o balance do enlace, a marxe de desvanecemento e a interrupción por multitrayecto, e dá a altura de mastro que libraría o camiño. Tamén fai balances de perda de fibra, cantidades de ruta e o vento sobre unha torre.
- **Desvíos ferroviarios.** {{ui:Desvíos ferroviarios…}} fai un desvío a partir do seu número de corazón, cruzamentos entre vías paralelas e un gálibo inclinado por peralte e ensanchado nunha curva. Un desvío pode estar nunha estaca dun trazado.

Vexa [Solos, cruzamentos, compensación, canteiras, enlaces de radio e desvíos](topic:soils-roads-survey-mines-links).

### En todas as aplicacións

- **Idiomas.** 54 linguas, dez delas novas. As linguas distintas do inglés son borradores automáticos ata que un falante nativo as lea. Os temas de axuda seguen sendo en gran parte inglés.
- **Filas da barra de ferramentas.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Envolver (como antes), 2 filas ou 1 fila. A cinta de CivilCraft mostra a ferramenta máis usada en grande, as seguintes en pequeno, e o resto detrás da frecha do nome do grupo.
- **Dispositivos de entrada.** A pantalla táctil, a pluma, o ratón 3D, o mando e MIDI poden manexar as aplicacións.
- **Problemas.** Un panel de Problemas que avisa en todas as aplicacións, con comprobacións que len os paquetes de normativa.
- **Live.** Unha vista de quen está onde nunha sesión Live.
- **Complementos.** Unha lista de complementos, con complementos de iluminación.
- **Conecte a súa IA.** Calquera asistente que conecte pode manexar as ferramentas de CivilCraft. Vén cunha nota de que a conexión dun clic dentro de CadCraft Studio e o conector aloxado aínda non están listos. Vexa [Deixe que un asistente de IA traballe co seu sitio](topic:assistants).

### Corrixido na 0.8.1

- **Sección de clases de DWG.** Líase como tipo equivocado (GitHub cadcraft#5). Corrixido en CivilCraft xunto con CadCraft, BimCraft, ModelCraft e TakeoffCraft.
- **Cambio de idioma en execución.** CadCraft Studio e as edicións empaquetadas poden cambiar de idioma en tempo de execución. Antes só estaban en inglés. Aínda non se probou en todas as plataformas: díganos se o idioma non cambia.

### Non está aínda nesta versión

- **Son axudas de cálculo.** Cada resultado das novas xanelas necesita a comprobación dun enxeñeiro. As resistencias do solo parten de valores típicos para o grupo de solo, e a xanela di isto.
- **Facer chover.** Unha execución no sitio de exemplo pode levar máis de dous minutos no navegador cunha celda fina. Foi comprobada con casos a man e cunha conca en V, pero aínda non nun sitio real con movemento de terras.
- **Enderezo á parcela.** Le ficheiros de datos abertos que vostede traia, e só se probou con ficheiros nosos. As árbores non son unha fonte. Obter as fontes por vostede depende da redacción sobre privacidade.
- **Progreso a partir de levantamentos.** Probado só con levantamentos inventados. Non están construídos o progreso sobre follas e anotacións (MarkupCraft) nin a comparación de exploración contra modelo (BimCraft).
- **Solos e pendentes.** Só superficies circulares: non hai busca en cuña nin en bloque, nin fenda de tracción.
- **Cruzamentos.** Un radio por ramal, sen trazados de paso de camións, e aínda non entran no corredor.
- **Ficheiros de campo.** Os lectores escribíronse a partir de descricións públicas do formato e probáronse con ficheiros que fixemos nós. Fan falta ficheiros de instrumentos reais.
- **Enlaces e vía.** Enlaces de radio: só perda en espazo libre e multitrayecto (sen desvanecemento por chuvia nin diagramas de antena), e sen norma ferroviaria: cada límite de vía é un marcador de posición, con cifras de borrador que ningún enxeñeiro ferroviario comprobou.
- **Windows e macOS.** A 0.8 non ten sinatura de código. Windows pode avisar, e macOS pide clic dereito e despois Abrir.

Todo o demais está en [Non construído aínda](topic:not-built-yet). Para a versión anterior, vexa [Novidades da 0.7](topic:whats-new-0-7).
