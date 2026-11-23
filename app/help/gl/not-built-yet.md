---
title: Non construído aínda
summary: O que esta versión de CivilCraft aínda non fai e o que facer hoxe no seu lugar.
keywords: ausente, límites, plan de desenvolvemento, non dispoñible, espirais, ensanchamento, dwg, dxf, sumidoiros, retención, seccións transversais, próxima versión, límites
from: b91588d4
---

CivilCraft está en fase inicial. Esta páxina lista o que a versión actual non fai, para que non o busque. Nada aquí ten unha data prometida.

## Puntos

| Non construído aínda | En cambio, hoxe |
|---|---|
| Engadir un segundo ficheiro de puntos ao primeiro | Una os ficheiros nun editor de texto ou nunha folla de cálculo antes |
| Exportar un ficheiro de texto de puntos | Exporte LandXML (os puntos saen como CgPoints), use {{ui:Exportar}} de GIS (puntos con campos P, N, E, Z e D), ou {{ui:Copiar}} os puntos a unha folla de cálculo |
| Estilos de etiqueta de puntos, símbolos por clave de descrición, curvas (arcos) a partir de códigos de liña, un ficheiro de claves de descrición para compartir entre proxectos | As etiquetas amosan o número, a cota e a descrición, ou menos ([Configuración de CivilCraft](topic:settings)); as claves gárdanse no ficheiro do proxecto |
| Conversión de unidades | Converta o ficheiro antes de importar; **Unidades** só cambia a etiqueta |

## Superficies

| Non construído aínda | En cambio, hoxe |
|---|---|
| Máis dunha superficie construída a partir de puntos | Un proxecto por superficie |
| Ocultar límites (interiores) | Use **Lado exterior máis longo** ou un límite exterior |
| Seleccionar ou editar unha liña de rotura debuxada | {{key:Mod+Z}}, ou {{ui:Eliminar liñas de rotura debuxadas}} e debuxala de novo |
| Editar unha superficie lida de LandXML (liñas de rotura, límite) | {{ui:Reconstruír a superficie a partir dos puntos}} |
| Editar unha superficie feita dunha cuadrícula de cotas | Importe a cuadrícula de novo con outras opcións |
| Converter unha superficie lida de LandXML cando cambia o sistema de coordenadas | {{ui:Reconstruír a superficie a partir dos puntos}} primeiro |
| Cotas puntuais etiquetadas e valores de pendente | Léaos na barra de estado, ou coloree a superficie por pendente con **Análise de pendentes** no espazo de traballo Paisaxismo ([Nivelado para paisaxismo](topic:landscape-grading#grading-checks)) |

## Trazados e perfís

| Non construído aínda | En cambio, hoxe |
|---|---|
| Espirais distintas da clotoide; unha espiral entre dúas curvas (transicións compostas) | As espirais clotoides nos extremos dunha curva están dispoñibles; as demais dan nome e omítense na importación de LandXML |
| Inserir un PI entre dous outros | Debuxe o trazado de novo, ou reescriba as coordenadas dos PI |
| Trazados a partir de obxectos, desprazamentos, ensanchamentos | Debuxe por PI |
| Escribir K para unha curva vertical | Escriba L (amósase K) |
| Curvas verticais circulares e non simétricas | Só curvas parabólicas simétricas |
| Máis dun perfil de proxecto por trazado | Un trazado por variante |
| Facer zoom na vista de perfil, bandas de perfil debaixo do perfil | A vista de perfil ocupa todo o trazado; trácea nas [follas de planta e perfil](topic:plan-profile-sheets) |
| Seccións en DWG ou LandXML | Follas de seccións en PDF; {{ui:CSV}} das áreas e volumes |
| Liñas de mostraxe en ángulo, ou de anchos distintos ao longo da estrada | Un ancho por cada lado para todo o trazado |

## Corredores

| Non construído aínda | En cambio, hoxe |
|---|---|
| Medianas, barreiras e un peralte que fai xirar as plantillas | Debúxeas como plantillas ([Plantillas do corredor](topic:corridor-templates)); as plantillas por estaca aínda non admiten peralte |
| Un cambio gradual entre as plantillas de dúas rexións (transicións, afiladuras) | Cambie a plantilla nunha estaca, ou dea a un punto un obxectivo de largura a unha liña debuxada como afiladura |
| Xiro arredor dun bordo, peralte en LandXML | O peralte xira arredor do eixe nas curvas circulares; ensanche un carril cun obxectivo de largura a unha liña de elemento |
| Obxectivos para os taludes laterais (intersección cunha liña ou superficie), superficies de corredor propias | Os obxectivos moven os bordos da calzada e dos arcéns ([Corredores](topic:corridor)); o corredor nivélase na superficie proposta |
| Curvas de bordo, carrís de xiro e illas nivelados nun cruzamento; o extremo dunha estrada lateral cortado ao bordo da estrada principal nun esvaído; unha senda unida a unha estrada no plano, na súa lonxitude e superficie | As estradas que se encontran únense en ángulo recto, abrindo o bordo da estrada principal e subindo a estrada lateral até el ([Onde as estradas se encontran](topic:corridor#where-roads-meet-roads-pads-and-paths)); unha senda para no bordo da estrada na superficie proposta e en 3D |
| Corredores exportados como estradas LandXML; un segundo corredor nun trazado na exportación IFC | Exportase a superficie proposta |
| Plantillas de terreo que cambian a superficie proposta, en 3D ou nas seccións | Dan áreas e volumes de cada capa ([Plantillas do terreo](topic:corridor-templates#terrain-templates)) |
| Trazados de xiro con velocidade, deslizamento de pneumáticos, tempo de dirección, remolques de dirección ou holgura da carrozaría; unha biblioteca de vehículos de deseño estándar; un trazado de xiro debuxado arrastrando o vehículo | Trazados de xiro a baixa velocidade ao longo dunha liña de elemento ou dun trazado, cos seus propios tamaños de vehículo ([Trazados de xiro de vehículos](topic:swept-paths)) |

## Nivelado e volumes

| Non construído aínda | En cambio, hoxe |
|---|---|
| Bancadas, liñas de elemento abertas niveladas no deseño, nivelado ata unha liña de elemento doutro lugar | Peche a liña de elemento ([Liñas de elemento](topic:feature-lines)), ou úsea como liña de rotura do terreo existente |
| Inserir ou eliminar un vértice de liña de elemento | Debuxe a liña de novo, ou faga un desprazamento escalonado dela |
| Arcos en liñas de rotura debuxadas (por puntos de levantamento), espirais en liñas de elemento | Debuxe unha liña de elemento con arcos e úsea como liña de rotura do terreo existente |
| Nivelado ata unha distancia, unha cota ou outra superficie | Só intersección co terreo existente |
| Engadir ou eliminar unha esquina de plataforma | Elimine a plataforma e debuxeaa de novo |
| Volumes TIN a TIN (prisma), escoller o tamaño da celda da cuadrícula | Método de cuadrícula, con tamaño de celda escollido por vostede |
| Esponxamento e contracción, cuberta vexetal, espesores de pavimento | Aplique os factores aos números informados vostede mesmo |
| Custos de transporte libre e de sobretransporte, transporte entre trazados distintos, préstamos e vertedoiros situados no plano | O diagrama de masas con puntos de equilibrio, volumes movidos e distancias medias de transporte |

## Redes de tubaxes

| Non construído aínda | En cambio, hoxe |
|---|---|
| Máis dunha rede por proxecto | Proxectos separados para pluviais e sanitario |
| Condutas de auga: calidade e antigüidade da auga, controis baseados en regras, outros tipos de válvulas (control de caudal, estranguladora, de mantemento), bombas dadas por potencia, demanda que depende da presión, unha opción de Darcy–Weisbach, un catálogo de tubaxes con espesores de parede e clases de presión. O resto das redes de presión está no laboratorio: [Condutas de auga](topic:water-mains) | Compróbeos en software de distribución de auga; os caudais de deseño sanitario están en [Caudais de deseño sanitario](topic:sanitary-design) |
| Caudais de esgoto ao longo do tempo (hidrogramas, encamiñamento dinámico, almacenamento, bombas, desbordamentos) | [Caudais de deseño sanitario](topic:sanitary-design) dá o caudal punta constante que usa unha folla de deseño |
| Capacidade de sumidoiro, dispersión na cuneta, encamiñamento en balsa de retención, hidrogramas, perdas de enerxía distintas dun coeficiente de cruzamento | Compróbeos noutro software; caudais, tamaños e liñas de rasante están en [Drenaxe pluvial](topic:storm-drainage) |
| Captacións no PDF, DWG, DXF ou LandXML; captacións a partir da superficie (vertentes) | Debuxe as captacións a man; gárdanse no ficheiro do proxecto |
| Catálogos de tubaxes, tubaxes non redondas, estruturas que non son caixas ou cilindros verticais (conos, chanzos, bancadas), unha categoría de drenaxe na biblioteca | Tipos de estrutura a partir de parámetros ([Rede de tubaxes](topic:pipe-network)); tubaxes cun diámetro |
| Tubaxes na vista de perfil, tubaxes curvas | Lea as cotas de fondo e recubrimento no panel dereito |

## Parcelas

| Non construído aínda | En cambio, hoxe |
|---|---|
| Repartir lotes por área ou fronte, parcelas a partir das liñas que as rodean, dereito de paso | Debuxe cada parcela polas súas esquinas, ou introduza os seus rumbos |
| Táboas de curvas e táboas de liñas no plano; etiquetas movidas a man | Cada tramo etiquétase ao longo de si mesmo |
| Parcelas en LandXML | As parcelas gárdanse no ficheiro do proxecto e van ao PDF, DWG e DXF |

## Poligonais

| Non construído aínda | En cambio, hoxe |
|---|---|
| Axuste por mínimos cuadrados, a regra do transit, ponderar ángulos fronte a distancias | A regra do compás |
| Ángulos de desviación, ángulos cenitais e distancias inclinadas, cotas por nivelación trigonométrica | Reduza a distancias e ángulos horizontais correctamente, ou a rumbos |
| Visadas laterais, ficheiros de datos brutos de colectores de datos | Importe os puntos como ficheiro de puntos |

## Replanteo

| Non construído aínda | En cambio, hoxe |
|---|---|
| Estacas de desprazamento (puntos de referencia separados da estaca), estacas de talude no punto de captura | Replantee nos desprazamentos que precise, incluso máis aló do arcén |
| Enviar as estacas directamente no formato propio dun colector de datos | O CSV ábrese no software de oficina da maioría dos colectores |
| Replantear tubaxes, plataformas e parcelas | Use puntos de levantamento preto dun trazado, ou as liñas da parcela |

## Ficheiros e saída

| Non construído aínda | En cambio, hoxe |
|---|---|
| Texto, tramas e cotas de DWG ou DXF; espazo de papel; debuxos ligados (xrefs); DXF binario | Abre o trazado do espazo modelo ([Abrir un DWG ou DXF como trazado](topic:open-dwg-dxf)); abra os debuxos ligados por separado |
| Mover varios puntos ao mesmo tempo arrastrando | Cortar e pegar, ou editalos un a un |
| Follas en vertical, cartelas propias, ventás de visualización que vostede organice, follas de planta e perfil en DWG | Unha folla de planta en paisaxe por PDF, ou follas de planta e perfil ao longo dun trazado (PDF) |
| Trazar bandas de cotas e perfís | As bandas só se ven en pantalla; faga unha captura se as precisa |
| Cambiar nomes de capas, cores ou estilos de etiqueta | Cámbieos nun programa CAD despois da exportación DXF |
| Gardado na nube e historial de versións | Garde os ficheiros `.civilcraft.json` e manteña copias de seguridade; para traballar nun proxecto xuntos, use unha sesión en directo en CadCraft Studio ([Deseñar un sitio xuntos, en directo](topic:work-live)) |
| CadCraft Studio para iPad e iPhone, e desde Google Play | Use CivilCraft no navegador do dispositivo; en Android, CadCraft Studio instálase desde o seu APK en getcadcraft.com/download |
| Abrir varios ficheiros de puntos ou de proxecto á vez | Un ficheiro por cada apertura (os ficheiros GIS que van xuntos, como as partes dun shapefile, ábrense xuntos) |

## Paisaxismo

| Non construído aínda | En cambio, hoxe |
|---|---|
| Cabezais e boquillas de fabricantes | Cabezais xenéricos, ou engada os seus propios cabezais desde un ficheiro; os datos dos fabricantes entran cando o permiten |
| Lonxitudes laterais máximas para liñas de goteo, fluxos ao longo do tempo, bombas, redes de tubaxes en bucle | Manteña as liñas de goteo na lonxitude publicada polo fabricante; a comprobación precisa unha rede ramificada |
| O contorno exacto dun obxecto de forma libre cóncavo; o seu volume baixo o terreo medido con exactitude | Nívelase a envolvente convexa e o volume baixo o terreo é unha estimación (indicada nas Propiedades) |
| Plantas na función Colocar desde a biblioteca propia de BimCraft e ModelCraft | Exporte IFC de paisaxismo e ábrao en BimCraft xunto ao edificio |
| Modelos detallados de plantas (follas, ramas, estacións) na vista 3D; obxectos de forma libre e rego na vista 3D | As plantas amósanse en 3D como formas simples dimensionadas segundo a lista de plantas ([Ver o sitio en 3D](topic:site-3d)); a dispersión de ModelCraft crea imaxes de plantación |
| Muros de obra dura que retén un nivel rebaixado detrás deles na superficie | Dea a unha plataforma ou a unha pa lados verticais: son muros de contención na superficie ([Nivelado](topic:grading)) |
| Transformacións SVG nos seus propios símbolos; texturas e cores dos seus propios modelos GLB de plantas; xeometría GLB comprimida | Aplane as transformacións no seu programa de debuxo primeiro; os modelos debúxanse coa cor da planta; exporte o GLB sen compresión ([Gráficos de plantas](topic:plant-graphics)) |
| A súa propia lista de plantas gardada na súa conta da Biblioteca (editada na aplicación) | Edite a lista propia do proxecto na Táboa de plantas e gárdea como ficheiro de plantas |
| As ferramentas de paisaxismo para asistentes sen a xanela (o servidor de ficheiros e a liña de comandos) | Funcionan con a xanela de CivilCraft aberta ([Deixe un asistente de IA traballar co seu sitio](topic:assistants)) |

## Liñas eléctricas

| Non construído aínda | En cambio, hoxe |
|---|---|
| Unha norma nacional integrada (hipóteses de carga, distancias, factores) | Defina os valores da súa norma en {{ui:Hipóteses de carga e límites…}} e gárdeos, coa súa biblioteca, como paquete para reutilizar e compartir ([Paquetes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| A distancia lateral dun conductor á copa dunha árbore ou a un muro ao lado da liña | A distancia vertical libre sobre as plantas e os muros que a liña cruza ([Comprobacións de liñas eléctricas](topic:power-line-checks#clearances)) |
| Fluencia do conductor e alongamento dun conductor novo | Teña en conta estes efectos mediante as temperaturas da táboa de tendido |
| Clasificación térmica de cables soterrados (capacidade de corrente segundo como se instalan) | Introduza no elemento de cable a capacidade de corrente que informa o seu provedor |
| Estudos de curtocircuíto, protección e posta a terra | Use un programa eléctrico específico; CivilCraft dá as lonxitudes e os cables da rede |
| Torres de celosía deseñadas barra a barra, e tirantes de anclaxe no solo | Os apoios compróbanse pola súa carga nominal; os tirantes pola súa carga de servizo |
| Un ficheiro de estudo `.DON` comprobado no programa que o le | Compróbeo alí; envíenos unha mostra para probar contra un real |
| Liñas eléctricas na vista 3D e en IFC | O plano, o perfil da liña, as follas e as capas GIS |
| As ferramentas de liñas eléctricas para asistentes sen a xanela | Funcionan con a xanela de CivilCraft aberta ([Deixe un asistente de IA traballar co seu sitio](topic:assistants)) |

## Masas de edificación

| Non construído aínda | En cambio, hoxe |
|---|---|
| Unha biblioteca de códigos de zonificación ou as normas de calquera cidade | Escriba os límites da súa propia ordenanza ([Límites de zonificación](topic:zoning-limits)) |
| Luz do ceo nos muros (luz natural de fachada), vento | [Horas de sol](topic:sun-hours) conta só o sol directo |
| Sombra de árbores, plantas ou calquera cousa non debuxada como masa | Debuxe os edificios veciños como masas |
| Formas de cuberta en masas | Masas de cuberta plana |
| Aberturas, cubertas e tipos de muro cando se desenvolve unha masa en BimCraft | BimCraft constrúe muros exteriores simples en cada nivel e un piso; engada o resto alí |

## GIS e sistemas de coordenadas

| Non construído aínda | En cambio, hoxe |
|---|---|
| File Geodatabase; estilos de KML, iconas, superposicións terrestres e ligazóns de rede | Converta a GeoPackage, shapefile ou GeoJSON primeiro; as marcas KML léense sen os seus estilos |
| Editar elementos GIS ou os seus atributos | Edítelos nun programa GIS e importe de novo. O panel Analizar fai capas novas (zona de influencia, superposición, unión, selección) e engade campos de área e lonxitude, pero non edita un elemento no seu sitio |
| Análise de rede e de ráster, zonas de influencia con extremos planos ou cadrados e de un só lado, engadir ou borrar filas e cambiar o tipo dun campo na táboa de atributos, cores de clase manuais, unha lenda de estilo nos trazados | Use **Seleccionar** para escoller elementos e facer unha capa con eles; non se ofrecen extremos planos. Colorear por atributo e a táboa de atributos xa están construídos: véxase [Dar estilo a unha capa por un atributo](topic:gis-symbology) e [Traballar coa táboa de atributos dunha capa](topic:gis-table) |
| Estilos de etiqueta (tamaño, colocación) e etiquetas que se evitan entre elas | As etiquetas teñen un tamaño e poden solaparse onde os elementos son densos |
| Datums verticais e modelos de xeoide | As cotas úsanse como as dá o ficheiro; comprobe o datum vertical vostede mesmo |
| Desprazamentos de cuadrícula distintos do paso de NAD27 a NAD83 suxerido por área (OSTN15, NTv2 para outros datums funcionan ao engadir o ficheiro), varias cuadrículas á vez, cuadrículas verticais | Engada vostede o ficheiro de cuadrícula do seu datum; unha cuadrícula por proxecto |
| Capas de mapa nas exportacións DXF ou 3D | As capas de mapa van ao trazado PDF, e xunto ao DWG como imaxe |
| Servidores de mapas que requiren inicio de sesión, clave ou token | Use servizos públicos, ou un ficheiro de imaxe xeorreferenciada |
| Escribir ficheiros LAS ou LAZ a partir dunha superficie, do modelo do terreo ou das ferramentas de cuadrícula de cotas e LiDAR | Exporte superficies como cuadrícula de cotas GeoTIFF. O complemento [Nubes de puntos](topic:point-clouds) escribe unha nube limpa como LAS 1.4 ou LAZ |
| Intensidade, cor e retornos LiDAR; cuadrículas de cotas con varias bandas; ficheiros de cuadrícula ou LiDAR de máis de 200 MB | LiDAR filtrase só por clase, e as cuadrículas usan a súa primeira banda; corte antes os ficheiros grandes en teselas |

## Entrada

| Non construído aínda | En cambio, hoxe |
|---|---|
| Selección por caixa con tacto (necesita {{key:Shift}}) | Manteña premido cada punto de levantamento para engadilo |
| Coordenadas ou distancias escritas mentres debuxa | Debuxe aproximadamente, e logo escriba as coordenadas exactas dos PI na táboa de PI do trazado |
| Escribir coordenadas para esquinas de plataforma e estruturas | Arrastre os seus agarres; amplíe para ter precisión e vixíe E e N na barra de estado |
| Encaixe a obxectos (que non sexan puntos de levantamento para liñas de rotura) | Amplíe e vixíe a barra de estado |

## Vista 3D

| Non construído aínda | En cambio, hoxe |
|---|---|
| Debuxar ou editar na vista 3D | Debuxe e edite no plano; a vista 3D sigue cada edición |
| Seleccionar liñas de elemento de corredor ou elementos GIS premendo en 3D | Prema neles no plano |
| Exportar a vista exaxerada ou en pés | As exportacións son a escala real en metros; véxase [Exportar o sitio en 3D](topic:export-3d) |
| Etiquetas en exportacións GLB ou OBJ, tamaños e estilos de etiqueta en 3D | As etiquetas amósanse só na vista 3D, dun tamaño; véxase [Ver o sitio en 3D](topic:site-3d) |
| Texturas a partir de fotos, gravar un percorrido como vídeo, sombras de máis aló do sitio, horas de sol na vista 3D | Capas de mapa colgadas sobre as superficies; percorrer e a posición do sol nun momento; [horas de sol](topic:sun-hours) para un día ou unha tempada no plano |
