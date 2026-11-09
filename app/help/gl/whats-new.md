---
title: Novidades da versión 0.8 e 0.8.1
summary: CivilCraft 0.8 engade Facer chover (unha corrida de tormenta sobre o seu nivelado), un equilibrador de movemento de terras, un buscador de mellor ruta, balsas de retención, progreso a partir de levantamentos, un importador de enderezo á parcela que garda a parcela no proxecto, e xanelas para solos e pendentes, cruzamentos e marcas viarias, compensación topográfica, canteiras a ceo aberto, enlaces de radio e desvíos ferroviarios. 0.8.1 corrixe a lectura dos ficheiros DWG.
keywords: novidades, o que hai de novo, notas de versión, rexistro de cambios, cambios, 0.8, 0.8.1, versión, novas funcionalidades, chuvia, tormenta, encharcamento, desbordamento, movemento de terras, equilibrio, desmonte e terraplén, transporte, mellor ruta, custo mínimo, trazado, balsa de retención, desaugadoiro, rebaixamento, resgardo, progreso, levantamento, dron, acopio, enderezo á parcela, parcela, solo, inundación, estabilidade de taludes, Bishop, asentamento, cruzamento, marcas viarias, sinais, distancia de visibilidade, compensación, mínimos cadrados, poligonal, canteira a ceo aberto, modelo de bloques, enlace de radio, Fresnel, desvío, idiomas, problemas, en directo, dwg
from: b0932cf0
---

Isto é o que cambiou en CivilCraft 0.8 (2026-11-01) e 0.8.1 (2026-11-02), en comparación coa 0.7. As partes novas máis grandes son ferramentas que proban o seu nivelado e o seu emprazamento (chuvia, movemento de terras, rutas, balsas, progreso) e seis xanelas de cálculo para terreo, estradas, levantamento, minas, enlaces e vía férrea.

## Novo

### Probe o seu nivelado

- **Facer chover.** {{ui:Make it rain…}} (baixo {{ui:Surface}}) fai caer unha tormenta sobre o terreo nivelado. Vese como a auga escorre das plataformas, se acumula nas esquinas baixas e desborda as balsas que son demasiado pequenas. A corrida está animada e dá os volumes, o caudal máximo de saída e un CSV de cada balsa. A celda por defecto é gruesa para que unha primeira ollada sexa rápida; unha celda máis fina é máis lenta. As balsas que desbordan aparecen tamén no panel de Problemas.
- **Equilibrador de movemento de terras.** {{ui:Earthwork balancer…}} sobe ou baixa unha plataforma ata que o desmonte iguala o terraplén, e mostra a táboa de transporte entre eles.
- **Mellor ruta.** {{ui:Best route…}}: escolla un inicio e un fin, e CivilCraft busca o camiño máis barato polo terreo que respecta os seus límites de rasante e curva, e logo fai un trazado a partir del.
- **Balsas de retención.** {{ui:Detention ponds…}} calcula a cota e o almacenamento a partir do seu terreo, admite dispositivos de desaugadoiro (orificio, vertedoiro, en V, aliviadoiro), fai pasar unha tormenta pola balsa e comproba o caudal máximo retido, o tempo de rebaixamento e o resgardo.
- **Progreso a partir de levantamentos.** {{ui:Progress from surveys…}} compara superficies de dron ou de escaneo de datas diferentes co terreo tal como estaba e co deseño: porcentaxe completada por volume, áreas escavadas en exceso e recheadas en exceso, acopios, e cando remata o traballo a este ritmo (marcado como estimación).

### Coñeza o emprazamento

- **Enderezo á parcela.** {{ui:Address to site…}} aliña datos abertos de parcela, edificio, zonificación, solo, inundación e terreo nun só emprazamento. Pode gardar o emprazamento no ficheiro de proxecto: o enderezo escrito, cada fonte coa data en que a descargou e a súa licenza, e o que devolveu. Reabra ou comparta o proxecto e o emprazamento aínda está, sen volver descargar nada. Tamén pode gardalo como ficheiro de emprazamento ou enviarlo a BimCraft. Vexa [Enderezo á parcela](topic:address-to-site).

### Terreo, estradas, levantamento, minas, enlaces e vía

- **Solos e pendentes.** {{ui:Soils and slopes…}} debuxa o perfil do solo entre as perforacións que escriba. O método de Bishop busca despois o círculo crítico no seu terreo, con nivel freático, sobrecarga e coeficiente sísmico; o asentamento dunha zapata obtén consolidación, asentamento inmediato e tempo.
- **Cruzamentos e marcas viarias.** {{ui:Junctions and striping…}} xunta ramais con retornos de bordo (un radio por ramal, ou retornos de tres centros), a distancia de visibilidade para a velocidade de deseño, unha comprobación dos triángulos de visibilidade, pasos de peóns, barras de parada, marcas e sinais cunha táboa de sinais. Debúxanse no plano e gárdanse como .dxf con capas con nome.
- **Compensación topográfica.** {{ui:Survey adjustment…}} executa unha compensación por mínimos cadrados dunha poligonal ou rede: coordenadas compensadas, elipses de erro, a proba chi cadrado e unha marca na medida que non encaixa. Inclúense redes libres, peche dunha poligonal polo método da brúxula e RW5, e ficheiros de campo GSI, JobXML ou CSV; os puntos compensados gárdanse como CSV.
- **Canteiras a ceo aberto.** {{ui:Open pits…}} converte as mostras de sondaxe nun modelo de bloques e na canteira final dentro do seu ángulo de talude, coa relación de estéril, unha táboa por banco e unha curva de ley e tonelaxe. Tamén hai canteiras aniñadas por factor de ingresos e un calendario de produción con fluxo de caixa descontado.
- **Enlaces de radio.** {{ui:Radio links…}} comproba a visibilidade directa sobre o seu terreo coa curvatura terrestre, a primeira zona de Fresnel, o balance do enlace, o marxe de desvanecemento e a interrupción por multitrayecto, e indica a altura de mastro que libraría o camiño. Tamén fai balances de perdas de fibra, cantidades de ruta e o vento sobre unha torre.
- **Desvíos ferroviarios.** {{ui:Rail turnouts…}} fai un desvío a partir do seu número de cruzamento, cambios de vía entre vías paralelas e un gálibo inclinado por peralte e ensanchado nunha curva. Un desvío pode situarse nunha estación dun trazado.

Vexa [Solos, cruzamentos, compensación topográfica, canteiras, enlaces de radio e desvíos](topic:soils-roads-survey-mines-links).

## En todas as aplicacións

- **Idiomas.** 54 idiomas, dez deles novos. Os idiomas distintos do inglés son borradores automáticos ata que un falante nativo os lea. Os temas da axuda seguen sendo en gran parte en inglés.
- **Filas da barra de ferramentas.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Ajustar (como antes), 2 filas ou 1 fila. O Ribbon de CivilCraft mostra a ferramenta máis usada en grande, as seguintes pequenas, e as demais detrás da frecha do nome do grupo.
- **Dispositivos de entrada.** Panel táctil, lapis, rato 3D, mando e MIDI poden manexar as aplicacións.
- **Problemas.** Un panel de Problemas que avisa en todas as aplicacións, con comprobacións que len os paquetes de normativa.
- **En directo.** Unha vista de quen está onde nunha sesión en directo.
- **Complementos.** Unha lista de complementos, con complementos de iluminación.
- **Conecte a súa IA.** Calquera asistente que conecte pode manexar as ferramentas de CivilCraft. Ven cunha nota de que a conexión dun clic dentro de CadCraft Studio e o conector aloxado aínda non están listos. Vexa [Deixe que un asistente de IA traballe co seu emprazamento](topic:assistants).

## Corrixido en 0.8.1

- **Sección de clases DWG.** Líase como tipo incorrecto (GitHub cadcraft#5). Corrixido en CivilCraft xunto con CadCraft, BimCraft, ModelCraft e TakeoffCraft.
- **Cambio de idioma en execución.** CadCraft Studio e as edicións empaquetadas poden cambiar de idioma en tempo de execución. Antes só estaban en inglés. Aínda sen probar en todas as plataformas: dígannos se o idioma non cambia.

## Aínda non está nesta versión

- **Son axudas de cálculo.** Cada resultado das xanelas novas necesita a comprobación dun enxeñeiro. As resistencias do solo parten de valores típicos do grupo de solo, e a xanela así o indica.
- **Facer chover.** Unha corrida sobre o emprazamento de exemplo pode tardar máis de dous minutos no navegador cunha celda fina. Comprobouse con casos feitos a man e unha conca en V, pero aínda non nun emprazamento real nivelado.
- **Enderezo á parcela.** Le ficheiros de datos abertos que vostede traia, e probouse só cos nosos propios ficheiros. As árbores non son unha fonte. Buscar fontes por vostede depende da redacción sobre privacidade.
- **Progreso a partir de levantamentos.** Probado só con levantamentos inventados. O progreso en follas e anotacións (MarkupCraft) e o escaneo contra modelo (BimCraft) non están construídos.
- **Solos e pendentes.** Só superficies circulares: sen busca de cuña nin de bloque e sen fenda de tracción.
- **Cruzamentos.** Un radio por ramal, sen trazados de paso de camións, e aínda non entran no corredor.
- **Ficheiros de campo.** Os lectores escribíronse a partir de descricións públicas de formato e probáronse con ficheiros que fixemos. Hai que conseguir ficheiros reais de instrumentos.
- **Enlaces e vía.** Enlaces de radio: só perda en espazo libre e multitrayecto (sen desvanecemento por chuvia nin diagramas de antena), e sen norma ferroviaria: cada límite de vía é unha marca de posición, con cifras borrador que ningún enxeñeiro ferroviario comprobou.
- **Windows e macOS.** 0.8 non está asinada con código. Windows pode avisar, e macOS pide clic dereito e logo Abrir.

Todo o demais está en [Aínda sen construír](topic:not-built-yet). Para a versión anterior, vexa [Novidades da 0.7](topic:whats-new-0-7).
