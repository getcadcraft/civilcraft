---
title: Novidades da 0.9 (anteriores)
summary: Plantillas de corredor e de terreo, encaixes e botóns Escoller ao debuxar, análise GIS cunha táboa de atributos, estudos de sombra, produción solar, confort e vento dun sitio, unha vista Render 3D, e os complementos Nubes de puntos e WaterCraft.
keywords: novidades 0.9, versión anterior, novidades, 0.9, notas de versión, plantillas de corredor, plantillas de terreo, editor de plantillas, sección tipo, varios corredores, encaixe, encaixes, escoller, mover, copiar, xirar, tanxente, render, render 3D, análise GIS, zona de influencia, superposición, unión espacial, táboa de atributos, estilo por atributo, estudo de sombra, produción solar, UTCI, confort exterior, estudo de vento, OpenFOAM, nube de puntos, las, laz, watercraft, caudal de incendio, hidrante, antigüidade da auga, cloro, demandas, información emerxente, disposición, en directo, dwg, idiomas, problemas, en directo, 0.8, 0.8.1, versión, novidades, chuvia, temporal, encharcamento, desbordamento, balsa de retención, saída, descenso, resgardo, cubicación, drón, acopio, enderezo ao sitio, parcela, solo, inundación, estabilidade de taludes, Bishop, asentamento, cruzamento, marcas viarias, sinais, distancia de visibilidade, axuste, mínimos cuadrados, poligonal, canteira a ceo aberto, modelo de bloques, enlace de radio, Fresnel, desvío, comunicación, cambios, rutas, mellor ruta, custo mínimo, aliñación, levantamento, movemento de terras, balance, desmonte e terraplén, transporte
from: 4664522c
---

Isto é o que cambiou en CivilCraft 0.9, comparado coa 0.8.1. CivilCraft 0.9 forma parte de CadCraft Studio 0.9 e das súas oito aplicacións. As partes principais son as plantillas de corredor e de terreo, os encaixes ao debuxar, a análise GIS, estudos do sol, produción solar, confort e vento dun sitio, e dous complementos: Nubes de puntos e WaterCraft.

## Novo

### Plantillas de corredor e de terreo

- **Plantillas de corredor.** Abra {{ui:Superficie}} › {{ui:Máis}} › {{ui:Plantillas do corredor…}} (ou escriba {{cmd:TEMPLATES}}). Unha plantilla é unha pequena sección transversal con compoñentes, desprazamentos, pendentes, materiais e códigos de punto. Gárdeas no proxecto, en {{ui:Miña biblioteca}} ou como ficheiro `.cctemplates.json`. O editor de plantillas amosa un debuxo a escala verdadeira e lista os problemas segundo escribe.
- **Construír a partir de plantillas por estaca.** Seleccione un trazado e active {{ui:Construír a partir de plantillas por estaca}} nas súas Propiedades. Cada lado de cada tramo ten a súa propia lista de pavimento e a súa propia condición de extremo. {{ui:Engadir un corredor}} debaixo de {{ui:Corredores neste trazado}} pon varios corredores nun trazado.
- **Plantillas de terreo.** {{ui:Superficie}} › {{ui:Máis}} › {{ui:Plantillas do terreo…}} (ou escriba {{cmd:TERRAINTEMPLATES}}) estende sobre un terreo materiais en capas, como terra vexetal ou pavimento e base, con área e volume por capa. Véxase [Plantillas de corredor e de terreo](topic:corridor-templates).

### Deseño

- **Encaixes.** As ferramentas Trazado, Parcela, Plataforma, Masa, Liña de elemento, Medir, Límite e Captación encaixan a puntos de levantamento, PI, esquinas, vértices e estruturas, cunha etiqueta xunto ao marcador. Manteña {{key:Alt}} para un punto libre.
- **Botóns Escoller, tanxente, mover, copiar, xirar.** As esquinas de plataforma, parcela e liña de elemento teñen caixas tipadas de Este e Norte e un botón Escoller con cruceta. As Propiedades tamén teñen {{ui:Tanxente desde dous puntos}} para trazados e {{ui:Mover, copiar e xirar}} para trazados, plataformas, parcelas e liñas de elemento. Véxase [Deseñar con encaixes, esquinas escollidas e mover, copiar, xirar](topic:draft-with-snaps).
- **Vista Render en 3D.** O botón {{ui:Render}} da barra 3D debuxa o terreo con cores naturais, ceo, néboa e sombras suaves. Non cambia o modelo. O menú {{ui:Sol}} agora ten os botóns {{ui:Aplicar}} e {{ui:Pechar}}. Véxase [Ver o sitio en 3D](topic:site-3d).
- **Os paneis abren unha sección por vez.** O panel esquerdo e o panel de Propiedades abren unha sección e pechan as demais, e as fichas da cinta de Paisaxismo que conteñen varias ferramentas son botóns divididos.

### Análise GIS

- **Analizar.** {{ui:Superficie}} › {{ui:Máis}} › {{ui:Analizar}} ofrece zona de influencia, superposición, unión espacial, selección por atributo ou forma, e medir. Cada ferramenta crea unha nova capa nun paso de desfacer.
- **Táboa de atributos.** O menú de tres puntos dunha capa ten {{ui:Táboa de atributos…}} e {{ui:Estilo por atributo…}}. Véxase [Analizar capas GIS](topic:gis-analysis) e [Traballar coa táboa de atributos dunha capa](topic:gis-table).

### O sitio: sol, solar, confort e vento

- **Sección de ambiente.** Seleccione unha masa: a sección {{ui:Ambiente}} está debaixo de {{ui:Horas de sol}} nas súas Propiedades. Ten un estudo de sombra (mapa, táboa, animación, CSV), produción solar a partir dun ficheiro meteorolóxico de ano típico (.epw) e confort exterior (UTCI).
- **Vento, só para cribado.** {{ui:Executar estudo de vento}} colorea o terreo desde sentado ata incómodo para cada dirección do vento no ficheiro meteorolóxico. Non está validado, e o panel así o indica.
- **Complemento de vento peatonal (OpenFOAM).** Desactivado ata que o active en {{ui:Configuración}} › {{ui:Complementos}}. OpenFOAM é un programa que vostede instala. Véxase [Sombra, produción solar e confort exterior](topic:environment).

### Nubes de puntos (complemento)

- Active {{ui:Nube de puntos}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece unha lapela de Nubes de puntos no panel dereito. Abra un ficheiro LAS ou LAZ, límpeo, clasifíqueo en terreo, vexetación e edificios, constrúa o terreo, as curvas de nivel e os volumes, e exporte LAS ou LAZ. Véxase [Nubes de puntos desde un dron ou escáner](topic:point-clouds).

### WaterCraft (complemento)

- Active {{ui:WaterCraft (distribución de auga)}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece unha lapela WaterCraft. Ten demandas dos clientes, caudal de incendio en cada hidrante, cal corte de conduta importa máis, e antigüidade da auga e cloro, cada un gardado como CSV. Véxase [WaterCraft: demandas, caudal de incendio, cortes e antigüidade da auga](topic:watercraft).

### Traballo conxunto

- Nunha sesión en directo vé os cursores e os nomes dos demais no plano. Plantas da biblioteca: CivilCraft Paisaxismo comeza coa súa colección predeterminada da biblioteca, {{ui:CivilCraft paisaxismo}}.

## En todas as aplicacións

- As indicacións aparecen como información emerxente de Bootstrap, e a indicación de inicio pódese pechar.
- A franxa de lapelas dun panel que non cabe desprázase en vez de quedar cortada.
- Os títulos das lapelas do navegador len `<documento> - CivilCraft | CadCraft`.
- {{ui:Configuración}} ten unha sección Disposición onde as disposicións son unha lista despregable de opcións de dúas liñas.
- As unidades de peso e temperatura están en {{ui:Configuración}} › {{ui:Global}} › {{ui:Unidades}}.
- A lista de idiomas amosa os idiomas para os que a versión ten ficheiros. Os idiomas distintos do inglés son borradores automáticos.

## Corrixido

- Os complementos de busca de enderezos e de comprobación de EnergyPlus non se podían activar; agora si.
- A axuda di agora que o complemento Nubes de puntos escribe unha nube limpa como LAS 1.4 ou LAZ.
- Premer sobre o propio agarre do obxecto seleccionado xa non inicia un arrastre que detiña un Escoller en espera.

## Límites

- As plantillas de corredor de exemplo son marcadores sen norma; un enxeñeiro debe comprobalas. As plantillas de terreo non engaden superficie e non se debuxan en 3D nin na vista de sección. O segundo corredor dun trazado non está na exportación IFC. Non hai transición entre dúas plantillas por estaca.
- As nubes de puntos probáronse con ficheiros inventados, non cun voo de drón real. Só se len LAS e LAZ.
- A análise GIS probouse con capas inventadas.
- Sombra, solar e confort son estimacións de planificación; o vento é un cribado sen validar. Nada diso é un valor de deseño.
- WaterCraft é unha axuda de cálculo probada en redes inventadas. Un enxeñeiro de auga decide que valen os números.
- Os idiomas máis aló do inglés son borradores automáticos.
- Os instaladores de Windows non están asinados dixitalmente, e a imaxe de disco de macOS non está notarizada.

## Antes: 0.8 e 0.8.1

Isto é o que cambiou en CivilCraft 0.8 (2026-11-01) e 0.8.1 (2026-11-02), comparado coa 0.7. As partes novas máis importantes son ferramentas que proban o nivelado e o sitio (chuvia, movemento de terras, rutas, balsas, progreso) e seis xanelas de cálculo para terreo, estradas, levantamento, minas, enlaces e vía férrea.

### Novo

**Probar o nivelado**

- **Facer chover.** {{ui:Facer chover…}} (en {{ui:Superficie}}) bota un temporal sobre o terreo nivelado. Vostede ve como a auga escorre das plataformas, se acumula nas esquinas baixas e desborda as balsas demasiado pequenas. A execución anímase e dá os volumes, o caudal máximo de saída e un CSV de cada balsa. A celda predeterminada é grosa para que unha primeira ollada sexa rápida; unha celda máis fina é máis lenta. As balsas que desbordan aparecen tamén no panel de Problemas.
- **Equilibrador de movemento de terras.** {{ui:Equilibrador de movemento de terras…}} sube ou baixa unha plataforma ata que o desmonte iguale o terraplén, e amosa a táboa de transporte entre eles.
- **Mellor ruta.** {{ui:Mellor ruta…}}: escolla un inicio e un fin, e CivilCraft atopa o camiño máis barato polo terreo que respecta os seus límites de pendente e curva, e despois fai un trazado a partir dese camiño.
- **Balsas de retención.** {{ui:Balsas de retención…}} calcula a cota e o almacenamento a partir do seu terreo, admite dispositivos de desaugadoiro (orificio, vertedoiro, vertedoiro en V, aliviadeiro), fai pasar un temporal pola balsa e comproba o caudal máximo retido, o tempo de descenso e o resgardo.
- **Progreso a partir de levantamentos.** {{ui:Progreso a partir de levantamentos…}} compara superficies de drón ou de escaneo de datas distintas co terreo tal como estaba e co proxecto: porcentaxe completada por volume, áreas escavadas en exceso e recheadas en exceso, acopios, e cando rematará o traballo a este ritmo (indicado como estimación).

**Coñecer o sitio**

- **Enderezo ao sitio.** {{ui:Enderezo ao sitio…}} aliña datos abertos de parcelas, edificios, zonificación, solo, inundación e terreo nun mesmo sitio. Pode gardar o sitio no ficheiro do proxecto: o enderezo escrito, cada fonte coa data en que a obtivo e a súa licenza, e o que devolveu. Reabra ou comparta o proxecto e o sitio segue aí, sen volver obter nada. Tamén pode gardalo como ficheiro de sitio ou envialo a BimCraft. Véxase [Enderezo ao sitio](topic:address-to-site).

**Terreo, estradas, levantamento, minas, enlaces e vía férrea**

- **Solos e pendentes.** {{ui:Solos e pendentes…}} debuxa o perfil do solo entre sondaxes que escriba. O método de Bishop busca entón o círculo crítico no seu terreo, cunha capa freática, unha sobrecarga e un coeficiente sísmico; o asentamento dunha cimentación leva consolidación, asentamento inmediato e tempo.
- **Cruzamentos e marcas viarias.** {{ui:Cruzamentos e marcas viarias…}} xunta ramas con curvas de bordo (un raio por rama, ou curvas de tres centros), a distancia de visibilidade para a velocidade de deseño, unha comprobación dos triángulos de visibilidade, pasos de peóns, liñas de parada, marcas e sinais cunha lista de sinais. Debúxanse no plano e gárdanse como .dxf con capas con nome.
- **Axuste topográfico.** {{ui:Axuste topográfico…}} fai un axuste por mínimos cuadrados dunha poligonal ou dunha rede: coordenadas axustadas, elipses de erro, a proba do chi cadrado e unha marca na medida que non encaixa. Inclúense redes libres, peche da poligonal pola regra do compás e RW5, ficheiros de campo GSI, JobXML ou CSV, e os puntos axustados gárdanse como CSV.
- **Canteiras a ceo aberto.** {{ui:Canteiras a ceo aberto…}} convirte mostras de sondaxe nun modelo de bloques e na canteira final dentro do seu ángulo de talude, coa relación de estéril, unha táboa por banco e unha curva de lei e tonelaxe. Tamén están as canteiras aniñadas por factor de ingresos e un programa de produción cun fluxo de caixa descontado.
- **Enlaces de radio.** {{ui:Enlaces de radio…}} comproba a visada sobre o seu terreo coa curvatura da terra, a primeira zona de Fresnel, o balance do enlace, o marxe de desvanecemento e a interrupción por multitrayecto, e indica a altura do mastro que despexaría o camiño. Tamén fai balances de perda de fibra, cantidades de trazado e o vento sobre unha torre.
- **Desvíos ferroviarios.** {{ui:Desvíos ferroviarios…}} fai un desvío a partir do seu número de corazón, comunicacións entre vías paralelas e un gálibo de estrutura inclinado polo peralte e ensanchado nunha curva. Un desvío pode situarse nunha estaca dun trazado.

Véxase [Solos, cruzamentos, axuste topográfico, canteiras, enlaces de radio e desvíos](topic:soils-roads-survey-mines-links).

### En todas as aplicacións

- **Idiomas.** 54 idiomas, dez deles novos. Os idiomas distintos do inglés son borradores automáticos ata que un falante nativo os le. As páxinas de axuda seguen sendo case todas en inglés.
- **Filas da barra de ferramentas.** {{ui:Configuración}} › {{ui:Xeral}} › {{ui:Filas da barra de ferramentas}}: Envolver (como antes), 2 filas ou 1 fila. A Cinta de CivilCraft amosa a ferramenta máis usada en grande, as seguintes en pequeno, e o resto detrás da frecha do nome do grupo.
- **Dispositivos de entrada.** Panel táctil, lapis, rato 3D, mando e MIDI poden manexar as aplicacións.
- **Problemas.** Un panel de Problemas que avisa en cada aplicación, con comprobacións que len os paquetes de normativa.
- **En directo.** Unha vista de quen está onde nunha sesión en directo.
- **Complementos.** Unha lista de complementos, con complementos de iluminación.
- **Conecte a súa IA.** Calquera asistente que conecte pode manexar as ferramentas de CivilCraft. Vén cunha nota de que a conexión dun clic dentro de CadCraft Studio e o conector aloxado aínda non están listos. Véxase [Deixe un asistente de IA traballar co seu sitio](topic:assistants).

### Corrixido en 0.8.1

- **Sección de clases de DWG.** Líase como tipo erróneo (GitHub cadcraft#5). Corrixido en CivilCraft xunto con CadCraft, BimCraft, ModelCraft e TakeoffCraft.
- **Cambio de idioma en execución.** CadCraft Studio e as edicións empaquetadas poden cambiar de idioma durante a execución. Antes só estaban en inglés. Aínda non se probou en todas as plataformas: díganos se o idioma non cambia.

### Non está aínda nesta versión

- **Son axudas de cálculo.** Cada resultado das novas xanelas precisa a revisión dun enxeñeiro. As resistencias do solo parten de valores típicos para o grupo de solo, e a xanela así o indica.
- **Facer chover.** Unha execución no sitio de mostra pode levar máis de dous minutos no navegador cunha celda fina. Probouse contra casos feitos a man e unha captación en V, pero aínda non nun sitio real nivelado.
- **Enderezo ao sitio.** Le ficheiros de datos abertos que vostede achega, e probouse só cos nosos propios ficheiros. As árbores non son unha fonte. Obter fontes por vostede agarda pola redacción sobre privacidade.
- **Progreso a partir de levantamentos.** Probado só con levantamentos inventados. O progreso en follas e anotacións (MarkupCraft) e o escaneo contra modelo (BimCraft) non están construídos.
- **Solos e pendentes.** Só superficies circulares: sen busca en cuña nin en bloque, e sen fenda de tensión.
- **Cruzamentos.** Un raio por rama, sen trazados de camións, e aínda non entran no corredor.
- **Ficheiros de campo.** Os lectores escribíronse a partir de descricións públicas de formatos e probáronse con ficheiros que fixemos nós. Hai que obter ficheiros de instrumentos reais.
- **Enlaces e vía férrea.** Enlaces de radio: só perda en espazo libre e multitrayecto (sen desvanecemento por choiva nin diagramas de antena), e non hai norma ferroviaria: cada límite ferroviario é un marcador, con cifras borrador que ningún enxeñeiro ferroviario revisou.
- **Windows e macOS.** A 0.8 non está asinada dixitalmente. Windows pode avisar, e macOS pide clic dereito e logo Abrir.

Todo o demais está en [Non construído aínda](topic:not-built-yet). Para a versión anterior, véxase [Novidades da 0.7](topic:whats-new-0-7).
