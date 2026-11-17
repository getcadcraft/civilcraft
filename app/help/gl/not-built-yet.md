---
title: Aínda non construído
summary: O que esta versión de CivilCraft aínda non fai e o que facer en lugar disto hoxe.
keywords: falta, limitacións, plan de desenvolvemento, non dispoñible, espirais, ensanche, dwg, dxf, sumidoiros, retención, seccións transversais, vindeiras versións, límites
from: a2d970ef
---

CivilCraft está en fase inicial. Esta páxina lista o que a versión actual non fai, para que non o busque. Nada aquí ten unha data prometida.

## Puntos

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Engadir un segundo ficheiro de puntos ao primeiro | Una antes os ficheiros nun editor de texto ou nunha folla de cálculo |
| Exportar un ficheiro de texto de puntos | Exporte LandXML (os puntos saen como CgPoints), use a {{ui:Export}} de GIS (puntos cos campos P, N, E, Z e D), ou {{ui:Copy}} os puntos a unha folla de cálculo |
| Estilos de etiqueta de puntos, símbolos por código de descrición, curvas (arcos) a partir de códigos de liña, un ficheiro de códigos de descrición para compartir entre proxectos | As etiquetas mostran o número, a cota e a descrición, ou menos ([Configuración de CivilCraft](topic:settings)); os códigos gárdanse no ficheiro do proxecto |
| Conversión de unidades | Converta o ficheiro antes de importar; **Unidades** só cambia a etiqueta |

## Superficies

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Máis dunha superficie construída a partir de puntos | Un proxecto por superficie |
| Ocultar límites (interiores) | Use **Bordo exterior máis longo** ou un límite exterior |
| Seleccionar ou editar unha liña de rotura debuxada | {{key:Mod+Z}}, ou {{ui:Remove drawn breaklines}} e debuxar de novo |
| Editar unha superficie lida desde LandXML (liñas de rotura, límite) | {{ui:Rebuild the surface from the points}} |
| Editar unha superficie feita a partir dunha malla de cotas | Importe a malla de novo con outras opcións |
| Converter unha superficie lida desde LandXML cando cambia o sistema de coordenadas | {{ui:Rebuild the surface from the points}} primeiro |
| Cotas puntuais etiquetadas e valores de pendente | Léaos na barra de estado, ou coloree a superficie por pendente con **Análise de pendentes** no espazo de traballo Paisaxismo ([Movemento de terras para paisaxismo](topic:landscape-grading#grading-checks)) |

## Trazados e perfís

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Espirais distintas da clotoide; unha espiral entre dúas curvas (transicións compostas) | As espirais clotoides nos extremos dunha curva están dispoñibles; as demais están nomeadas e omítense ao importar LandXML |
| Inserir un PI entre outros dous | Debuxe o trazado de novo, ou reescriba as coordenadas dos PI |
| Trazados a partir de obxectos, desprazamentos, ensanches | Debuxe por PI |
| Escribir K para unha curva vertical | Escriba L (K móstrase) |
| Curvas verticais circulares e non simétricas | Só curvas parabólicas simétricas |
| Máis dun perfil de deseño por trazado | Un trazado por variante |
| Facer zoom na vista de perfil, bandas de perfil debaixo do perfil | A vista de perfil axústase a todo o trazado; trácea en [follas de plano e perfil](topic:plan-profile-sheets) |
| Seccións en DWG ou LandXML | Follas de seccións en PDF; {{ui:CSV}} das áreas e volumes |
| Liñas de mostra oblicuas, ou de anchos distintos ao longo da estrada | Un ancho para cada lado en todo o trazado |

## Corredores

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Medianas, barreiras e un peralte que xira as plantillas | Debúxeas como plantillas ([Plantillas de corredor](topic:corridor-templates)); as plantillas por estación aínda non admiten peralte |
| Un cambio gradual entre as plantillas de dúas zonas (transicións, afilamentos) | Cambie a plantilla nunha estación, ou dea a un punto un obxectivo de ancho a unha liña debuxada como afilamento |
| Xiro arredor dun bordo, peralte en LandXML | O peralte xira arredor do eixe en curvas circulares; amplíe unha faixa cun obxectivo de ancho a unha liña de elemento |
| Obxectivos para os taludes laterais (saída de talude ata unha liña ou unha superficie), superficies de corredor propias | Os obxectivos moven os bordos de pavimento e beirarrúas ([Corredores](topic:corridor)); o corredor nívelase na superficie proposta |
| Corredores exportados como estradas LandXML; un segundo corredor nun trazado na exportación IFC | Exportase a superficie proposta |
| Plantillas de terreo que cambian a superficie proposta, en 3D ou nas seccións | Dan as áreas e volumes de cada capa ([Plantillas de terreo](topic:corridor-templates#terrain-templates)) |
| Trazados de xiro con velocidade, deslizamento dos pneumáticos, tempo de dirección, remolques de dirección ou xogo da carrozaría; unha biblioteca de vehículos de deseño estándar; un trazado de xiro debuxado arrastrando o vehículo | Trazados de xiro a baixa velocidade ao longo dunha liña de elemento ou dun trazado, con tamaños de vehículo propios ([Trazados de xiro de vehículos](topic:swept-paths)) |

## Movemento de terras e volumes

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Bancadas, liñas de elemento abertas niveladas no deseño, nivelación ata unha liña de elemento doutro lugar | Peche a liña de elemento ([Liñas de elemento](topic:feature-lines)), ou úsea como liña de rotura do terreo existente |
| Inserir ou eliminar un vértice dunha liña de elemento | Debuxe a liña de novo, ou faga un desprazamento escalonado da mesma |
| Arcos en liñas de rotura debuxadas (por puntos de levantamento), espirais en liñas de elemento | Debuxe unha liña de elemento con arcos e úsea como liña de rotura do terreo existente |
| Nivelación ata unha distancia, unha cota ou outra superficie | Saída de talude só ata o terreo existente |
| Engadir ou eliminar unha esquina dunha plataforma | Elimine a plataforma e debuxeaa de novo |
| Volumes TIN a TIN (prisma), escoller o tamaño da celda da malla | Método de malla, tamaño de celda escollido por CivilCraft |
| Esponxamento e contracción, capa vexetal, espesores de pavimento | Aplique vostede os factores aos números informados |
| Custos de transporte libre e de sobretransporte, transporte entre trazados distintos, canteiras e vertedoiros situados no plano | O diagrama de masas de transporte con puntos de equilibrio, volumes movidos e distancias medias de transporte |

## Redes de tubaxes

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Máis dunha rede por proxecto | Proxectos separados para pluvial e saneamento |
| Canalizacións de auga: calidade e idade da auga, controis baseados en regras, outros tipos de válvulas (control de caudal, estrangulamento, sostemento), bombas dadas por potencia, demanda que depende da presión, unha opción Darcy–Weisbach, un catálogo de tubaxes con espesores de parede e clases de presión. O resto das redes a presión está en desenvolvemento: [Canalizacións de auga](topic:water-mains) | Compróbeo en software de distribución de auga; os caudais de deseño de saneamento están en [Caudais de deseño de saneamento](topic:sanitary-design) |
| Caudais de sumidoiro no tempo (hidrogramas, encamiñamento dinámico, almacenamento, bombas, desbordamentos) | [Caudais de deseño de saneamento](topic:sanitary-design) dá o caudal punta constante que usa unha folla de deseño |
| Capacidade de sumidoiros, extensión da cuneta, encamiñamento de retención, hidrogramas, perdas de enerxía distintas dun coeficiente de unión | Compróbeos noutro software; os caudais, tamaños e liñas de gradiente hidráulico están en [Drenaxe pluvial](topic:storm-drainage) |
| Cuncas de captación no trazado PDF, DWG, DXF ou LandXML; cuncas a partir da superficie (vertentes) | Debuxe as cuncas a man; gárdanse no ficheiro do proxecto |
| Catálogos de tubaxes, tubaxes non circulares, estruturas que non son caixas ou cilindros verticais (conos, degraos, bancadas), unha categoría de drenaxe na biblioteca | Tipos de estrutura a partir de parámetros ([Rede de tubaxes](topic:pipe-network)); tubaxes con diámetro |
| Tubaxes na vista de perfil, tubaxes curvos | Lea as cotas de fondo e o recubrimento no panel dereito |

## Parcelas

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Trazado de lotes por superficie ou fronte, parcelas a partir das liñas do seu arredor, dereito de paso | Debuxe cada parcela polas súas esquinas, ou introduza os seus rumbos e distancias |
| Táboas de curvas e táboas de liñas no plano; etiquetas movidas a man | Cada tramo ten a súa etiqueta ao longo de si mesmo |
| Parcelas en LandXML | As parcelas gárdanse no ficheiro do proxecto e van ao PDF, DWG e DXF |

## Poligonais

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Axuste por mínimos cadrados, a regra do tránsito, ponderación de ángulos fronte a distancias | A regra da brúxula |
| Ángulos de desviación, ángulos cenitais e distancias inclinadas, cotas por nivelación trigonométrica | Reduza ben a distancias e ángulos horizontais, ou a rumbos |
| Visadas laterais, ficheiros de datos brutos dos colectores de datos | Importe os puntos como ficheiro de puntos |

## Estaqueo

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Estacas de desprazamento (puntos de referencia retranqueados da estaca), estacas de talude no punto de corte | Estaque nos desprazamentos que precise, incluído máis aló do arcén |
| Enviar as estacas directamente ao formato propio dun colector de datos | O CSV ábrese no software de oficina da maioría dos colectores de datos |
| Estaquear tubaxes, plataformas e parcelas | Use puntos de levantamento preto dun trazado, ou os rumbos da parcela |

## Ficheiros e saída

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Texto, tramas e cotas de DWG ou DXF; espazo de papel; debuxos ligados (xrefs); DXF binario | Ábrense as liñas do espazo modelo ([Abrir un DWG ou DXF como liñas](topic:open-dwg-dxf)); abra os debuxos ligados por separado |
| Mover varios puntos á vez arrastrando | Córteos e péguea, ou edítaos un a un |
| Follas en vertical, cartelas propias, vistas de espazo de papel que dispoña, follas de plano e perfil en DWG | Unha folla de plano horizontal por PDF, ou follas de plano e perfil ao longo dun trazado (PDF) |
| Impresión de bandas de cota e perfís | As bandas só se ven en pantalla; faga unha captura se as necesita |
| Cambiar nomes de capas, cores ou estilos de etiqueta | Cámbeos nun programa CAD despois de exportar o DXF |
| Gardado na nube e historial de versións | Garde os ficheiros `.civilcraft.json` e manteña copias de seguridade; para traballar nun proxecto en equipo, use unha sesión en directo en CadCraft Studio ([Deseñar un terreo xuntos, en directo](topic:work-live)) |
| CadCraft Studio para iPad e iPhone, e desde Google Play | Use CivilCraft no navegador do dispositivo; en Android, CadCraft Studio instálase desde o seu APK en getcadcraft.com/download |
| Abrir varios ficheiros de puntos ou de proxectos á vez | Un ficheiro por cada apertura (os ficheiros GIS que pertencen xuntos, como as partes dun shapefile, ábrense xuntos) |

## Paisaxismo

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Cabezais e boquillas de fabricantes | Cabezais e boquillas xenéricos, ou engada os seus propios desde un ficheiro; os datos dos fabricantes entran cando os cedan |
| Lonxitudes laterais máximas para liñas de goteo, caudais no tempo, bombas, redes de tubaxes en anel | Manteña os tramos de goteo na lonxitude publicada polo fabricante; a comprobación require unha rede ramificada |
| O contorno exacto dun obxecto de forma libre cóncavo; o seu volume baixo o terreo medido con exactitude | Nívelase a envoltura convexa e o volume baixo o terreo é unha estimación (indícase en Propiedades) |
| Plantas en Colocar desde a biblioteca propia de BimCraft e ModelCraft | Exporte o IFC de paisaxismo e ábraa en BimCraft xunto ao edificio |
| Modelos de plantas detallados (follas, ramas, estacións) na vista 3D; obxectos de forma libre e rego na vista 3D | As plantas amósanse en 3D como formas simples con tamaño segundo a lista de plantas ([Ver o terreo en 3D](topic:site-3d)); a dispersión de ModelCraft fai imaxes de plantación |
| Muros de obra dura que retén un nivel nivelado detrás deles na superficie | Dea a unha plataforma ou a un pavimento lados verticais: son muros de contención na superficie ([Movemento de terras](topic:grading)) |
| Transformacións SVG nos seus propios símbolos; texturas e cores dos seus propios modelos de plantas GLB; xeometría GLB comprimida | Aplane antes as transformacións no seu programa de debuxo; os modelos mostran a cor da planta; exporte o GLB sen compresión ([Gráficos de plantas](topic:plant-graphics)) |
| A súa propia lista de plantas gardada na súa conta de Biblioteca (editada na aplicación) | Edite a lista propia do proxecto na táboa de plantas e gárdea como ficheiro de plantas |
| As ferramentas de paisaxismo para asistentes sen a xanela (o servidor de ficheiros e a liña de ordes) | Funcionan con a xanela de CivilCraft aberta ([Deixe que un asistente de IA traballe co seu terreo](topic:assistants)) |

## Liñas eléctricas

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| A norma dun país integrada (hipóteses de carga, distancias libres, factores) | Fixe os valores da súa norma en {{ui:Load cases and limits…}} e gárdeos, coa súa biblioteca, como paquete para reutilizar e compartir ([Paquetes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| A distancia lateral dun condutor á copa dunha árbore ou a un muro xunto á liña | A distancia libre en vertical sobre plantas e muros que cruza a liña ([Comprobacións de liñas eléctricas](topic:power-line-checks#clearances)) |
| Fluencia do condutor e alongamento dun condutor novo | Teña en conta ambos a través das temperaturas na táboa de tendido |
| Capacidade térmica dos cables soterrados (intensidade admisible segundo o modo de tendido) | Introduza a intensidade admisible do seu provedor no elemento do cable |
| Estudos de curtocircuíto, protección e posta a terra | Use un programa eléctrico específico; CivilCraft dá as lonxitudes e os cables da rede |
| Torres de celosía deseñadas barra a barra, e ancoraxes de tirante no solo | Os apoios compróbanse pola súa carga nominal; os tirantes pola súa carga admisible |
| Un ficheiro de estudo `.DON` comprobado no programa que o lee | Compróbeo nese programa; envíenos unha mostra para probar cun ficheiro real |
| Liñas eléctricas na vista 3D e en IFC | O plano, o perfil da liña, as follas e as capas GIS |
| As ferramentas de liñas eléctricas para asistentes sen a xanela | Funcionan con a xanela de CivilCraft aberta ([Deixe que un asistente de IA traballe co seu terreo](topic:assistants)) |

## Masas de edificación

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Unha biblioteca de códigos urbanísticos ou das normas de calquera cidade | Escriba os límites da súa propia ordenanza ([Límites de zonificación](topic:zoning-limits)) |
| Luz do ceo nos muros (luz natural da fachada), vento | [Horas de sol](topic:sun-hours) conta só o sol directo |
| Sombra de árbores, plantas ou calquera cousa que non se debuxe como masa | Debuxe os edificios veciños como masas |
| Formas de cuberta nas masas | Masas de cuberta plana |
| Ocos, cubertas e tipos de muro cando se desenvolve unha masa en BimCraft | BimCraft constrúe muros exteriores sinxelos en cada planta e un chan; engada o resto alí |

## GIS e sistemas de coordenadas

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| File Geodatabase; estilos KML, iconas, superposicións de terreo e ligazóns de rede | Convértaa a GeoPackage, shapefile ou GeoJSON primeiro; as marcas KML léense sen os seus estilos |
| Editar elementos GIS ou os seus atributos | Edítaos nun programa GIS e impórteos de novo. O panel Analizar crea novas capas (zona de influencia, superposición, unión, selección) e engade campos de área e lonxitude, pero non edita un elemento no sitio |
| Análise de redes e de ráster, zonas de influencia con extremos planos ou cadrados e zonas de influencia dun só lado, engadir ou eliminar filas e cambiar o tipo dun campo na táboa de atributos, cores de clase manuais, lenda de estilo nas impresións | Use {{ui:Select}} para escoller elementos e crear unha capa con eles; os extremos planos non se ofrecen. Colorear por atributo e a táboa de atributos xa están: vexa [Estilizar unha capa por un atributo](topic:gis-symbology) e [Traballar coa táboa de atributos dunha capa](topic:gis-table) |
| Estilos de etiqueta (tamaño, colocación) e etiquetas que se evitan entre si | As etiquetas teñen un tamaño e poden solaparse onde os elementos son densos |
| Datos verticais e modelos de xeoide | As cotas úsanse como as dá o ficheiro; compruebe vostede o dato vertical |
| Desprazamentos de malla distintos do de NAD27 a NAD83 suxeridos pola zona (OSTN15, NTv2 para outros datums funcionan ao engadir o ficheiro), varias mallas á vez, mallas verticais | Engada vostede o ficheiro de malla do seu datum; unha malla por proxecto |
| Capas de mapa nas exportacións DXF ou 3D | As capas de mapa van ao trazado PDF, e ao lado do DWG como imaxe |
| Servidores de mapas que requiren inicio de sesión, chave ou token | Use servizos públicos, ou un ficheiro de imaxe xeorreferenciado |
| Escribir ficheiros LAS ou LAZ desde unha superficie, o modelo do terreo ou as ferramentas de malla de cotas e LiDAR | Exporte as superficies como malla de cotas GeoTIFF. O complemento [Nubes de puntos](topic:point-clouds) escribe unha nube limpa como LAS 1.4 ou LAZ |
| Intensidade, cor e retornos LiDAR; mallas de cotas con varias bandas; ficheiros de malla ou LiDAR de máis de 200 MB | LiDAR filtrase só por clase, e as mallas usan a súa primeira banda; corte os ficheiros grandes en teselas antes |

## Entrada

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Selección por recuadro táctil (necesita {{key:Shift}}) | Prema prolongadamente en cada punto de levantamento para engadilo |
| Coordenadas ou distancias escritas mentres debuxa | Debuxe aproximadamente, e logo escriba as coordenadas exactas dos PI na táboa de PI do trazado |
| Escribir coordenadas para esquinas de plataformas e estruturas | Arrastre os seus agarradoiros; achegue o zoom para precisión e vixíe E e N na barra de estado |
| Enganche a obxectos (distinto dos puntos de levantamento para liñas de rotura) | Achegue o zoom e vixíe a barra de estado |

## Vista 3D

| Aínda non construído | Mentres tanto, hoxe |
|---|---|
| Debuxar ou editar na vista 3D | Debuxe e edite no plano; a vista 3D sigue cada edición |
| Seleccionar liñas de elemento de corredor ou elementos GIS premendo en 3D | Prema neles no plano |
| Exportar a vista exaxerada ou en pés | As exportacións son a escala real en metros; vexa [Exportar o terreo en 3D](topic:export-3d) |
| Etiquetas nas exportacións GLB ou OBJ, tamaños e estilos de etiqueta en 3D | As etiquetas amósanse só na vista 3D, nun tamaño; vexa [Ver o terreo en 3D](topic:site-3d) |
| Texturas a partir de fotos, gravar un percorrido en vídeo, sombras de fóra do terreo, horas de sol amosadas na vista 3D | Capas de mapa colocadas sobre as superficies; percorrido e posición do sol nun momento; [horas de sol](topic:sun-hours) para un día ou unha tempada no plano |
