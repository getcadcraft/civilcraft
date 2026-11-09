---
title: Mba'épa ojeporavo 0.8 ha 0.8.1 rehe
summary: CivilCraft 0.8-pe oñemoĩ Que llueva (diseño rehe tormenta corrida), movimiento de suelo equilibrador, mejor recorrido buscador, estanques de detención, avance desde relevamientos, dirección a sitio importador, ha ventanas suelos ha pendientes, intersecciones ha señalización, ajuste de relevamiento, tajos a cielo abierto, enlaces de radio ha desvíos ferroviarios. 0.8.1-pe ojejapo mboyve DWG archivos ojeleeva.
keywords: qué hay de nuevo, novedades, notas de versión, changelog, cambios, 0.8, 0.8.1, versión, nuevas funciones, lluvia, tormenta, encharcamiento, desborde, movimiento de suelo, balance, corte y relleno, acarreo, mejor recorrido, menor costo, alineación, estanque de detención, salida, vaciado, borde libre, avance, relevamiento, dron, acopio, dirección a sitio, parcela, suelo, inundación, estabilidad de taludes, bishop, asentamiento, intersección, señalización, señales, distancia de visibilidad, ajuste, mínimos cuadrados, poligonal, tajo a cielo abierto, modelo de bloques, enlace de radio, fresnel, desvío, cruce, idiomas, problemas, en vivo, dwg
from: b0932cf0
---

Ko'ã mba'e ojeporavo CivilCraft 0.8 (2026-11-01) ha 0.8.1 (2026-11-02) rehe, 0.7 ndive ojeporandúva. Tembiapo tuichaiterei pyahúva tembiapo oñeñeʼẽ grading ha sitio (lluvia, movimiento de suelo, recorridos, estanques, avance), ha seis cálculo ventana terreno, camino, relevamiento, mina, enlace ha ferrocarril-pe.

## Pyahúva

### Grading ñemboʼe

- **Que llueva.** {{ui:Que llueva…}} ({{ui:Superficie}} guýpe) tormenta oguata grading terreno ári. Ehecha agua oñeguejy plataformas-gui, oñeguata mbytépe ñu ha estanques ojekangue ojupaha. Corrida animada ha volúmenes, pico caudal ha cada estanque CSV omombe'u. Celda hasy primera ojehecha jeporã; celda porãve oñeha pyahúvagui. Estanques ojupaha Problemas panel-pe avei ojehechaukáva.
- **Movimiento de suelo equilibrador.** {{ui:Equilibrio de movimiento de suelo…}} plataforma oñemboapi térã oñemboʼaguasu corte ha relleno iguálpe, ha tabla de acarreo mbytépe omombe'u.
- **Mejor recorrido.** {{ui:Mejor recorrido…}}: emboguejy inicio ha fin, CivilCraft ojuhu tape porã ojeguerekóva terreno rehe, ojeguerekóva tu pendiente ha curva límites, upéi alineación ojapo upe tape-gui.
- **Estanques de detención.** {{ui:Estanques de detención…}} vaekue ojejapo etapa ha almacenamiento tu terreno-gui, salida dispositivos (orificio, vertedero, V-muesca, aliviadero) omoĩ, tormenta estanque rupi ojehasa ha pico retenido, vaciado tiempo ha borde libre ojehechaukáva.
- **Avance desde relevamientos.** {{ui:Avance desde relevamientos…}} dron térã escaneo superficies ojeikuaa ojehechaukáva diferentes fechas-gui terreno ha diseño ndive: por ciento volumen ndive, sobre-excavado ha sobre-rellenado áreas, acopios, ha ko tembiapo mboyve oñemopaha ko ritmo-pe (estimación ojehecha).

### Sitio ojeikuaa

- **Dirección a sitio.** {{ui:De dirección a predio…}} parcela abierta, edificio, zonificación, suelo, inundación ha terreno datos peteĩ sitio-pe ojehecha. Sitio proyecto archivo-pe oguarda ikatu: tipeado dirección, peteĩ fuente ha día ojeguatava ha licencia, ha ojeguatava. Proyecto oñeabre térã ojerrepartí, sitio oĩ, mbaʼeve ojeguata jey. Sitio archivo-pe avei oguarda térã BimCraft-pe oñemoĩ. Ehecha [Dirección a sitio](topic:address-to-site).

### Terreno, camino, relevamiento, mina, enlace ha ferrocarril

- **Suelos y pendientes.** {{ui:Suelos y pendientes…}} suelo perfil ojehecha tu tipeado perforaciones mbytépe. Bishop método upéi crítico círculo tu terreno-pe ojeheka, napa de agua, sobrecarga ha terremoto coeficiente ndive; zapata asentamiento consolidación, inmediato asentamiento ha tiempo ojeguereko.
- **Intersecciones y señalización.** {{ui:Intersecciones y señalización…}} piernas ojehasa cordón retorno ndive (pierna peteĩ radio, térã tres centro retorno), diseño velocidad distancia de visibilidad, triángulo de visibilidad ojehechaukáva, cruce peatonal, pare barras, marcas ha señales señal planilla ndive. Plano-pe ojehecha ha .dxf héra capas ndive ojeguarda.
- **Ajuste de relevamiento.** {{ui:Ajuste de relevamiento…}} poligonal térã red mínimos cuadrados ajuste ojapo: ajustado coordenadas, error elipses, chi-cuadrado prueba ha medida ndojeporãiva marca. Red libre, poligonal cierre compás regla ha RW5, GSI, JobXML térã CSV campo archivo oñemoĩ, ajustado puntos CSV-pe oñeguarda.
- **Tajos a cielo abierto.** {{ui:Tajos a cielo abierto…}} perforación muestra ojapo modelo de bloques ha ultimate tajo tu pendiente ángulo ndive, strip ratio, banco por tabla ha grado ha tonelaje curva ndive. Ingreso factor ndive tajos anidados ha descontado flujo de caja ndive producción cronograma avei.
- **Enlaces de radio.** {{ui:Enlaces de radio…}} línea de vista tu terreno rehe ojehechaukáva tierra curvatura, primer zona de Fresnel, enlace presupuesto, desvanecimiento margen ha multipath corte, ha mástil altura omombe'u ojehasa tape. Fibra pérdida presupuesto, ruta cantidades ha torre viento avei.
- **Desvíos ferroviarios.** {{ui:Desvíos ferroviarios…}} frog número-gui desvío ojapo, paralelo vía entre cruce ha peralte gálibo inclinado y curva ndive ensanchado. Desvío alineación estación-pe oĩ ikatu.

Ehecha [Suelos, intersecciones, ajuste de relevamiento, tajos, enlaces de radio y desvíos](topic:soils-roads-survey-mines-links).

## Opa aplicación-pe

- **Idiomas.** 54 idioma, mokõi chupe pyahúva. English ndaha'éi idioma máquina borrador oĩ, nativo hablante omoñe'ẽ peve. Ayuda temas heta English-pe ko'ágã.
- **Herramientas filas.** {{ui:Configuración}} › {{ui:General}} › {{ui:Filas de la barra}}: Wrap (heko ko'ẽrõ), 2 filas térã 1 fila. CivilCraft Cinta ojehechaukáva heta ojeporúva ndaʼévagui, ambue hasy ndaʼévagui, ha ambue grupo héra flecha ári.
- **Entrada aparatos.** Trackpad, lápiz, 3D mouse, control ha MIDI app ojeporomba'e ikatu.
- **Problemas.** Problemas panel opa aplicación-pe omombe'u, normas paquetes ojeikuaa chequeo ndive.
- **En vivo.** En vivo sesión-pe ndive ko'ápe ojehecha ja'e.
- **Complementos.** Complemento lista, luz complementos ndive.
- **Conectá tu IA.** Pe asistente nde conecta ikatu CivilCraft herramientas ojapo. Nota ndive ojeguara ko'ã: CadCraft Studio-pe ojeconectá peteĩ jey ha alojado conector ndaipóri ko'ágã. Ehecha [Dejá que un asistente de IA trabaje con tu sitio](topic:assistants).

## Ojejapo 0.8.1-pe

- **DWG clases sección.** Tipo ndaha'éi ojeleva (GitHub cadcraft#5). CivilCraft-pe ojejapo CadCraft, BimCraft, ModelCraft ha TakeoffCraft ndive.
- **Idioma ojemoambue ojepe'ẽ jave.** CadCraft Studio ha paquete ediciones idioma ojemoambue ikatu. Ko'ágã English-pe anave. Opa plataforma-pe ndojehechaiterei: ndojeikuaa idioma ndoambuéramo, ñane mombe'u.

## Ndaipóri ko'ágã

- **Ko'ã cálculo ayuda ha.** Ventana-pe resultado peteĩ ingeniero chequeo ojeikotevẽ. Suelo fuerza tipo grupo tipo valor-gui oñepyrũ, ventana omombe'u.
- **Que llueva.** Sitio muestra corrida dos minuto hasy navegador-pe celda porã jave. Mano casos ndive ojehechakuaa, V-forma cuenca ndive, real grading sitio-pe ndaipóri.
- **Dirección a sitio.** Ojeleéva datos archivo abierto, nde ojeikotevẽ ha ñande archivo ndive ojehechakuaa. Árbol ndaha'éi fuente. Fuentes ojeguata privacidad redacción oñemoĩ jave.
- **Avance desde relevamientos.** Relevamiento hechos ojehecha ha hasy. Hojas ha MarkupCraft ndive avance ha BimCraft ndive escaneo modelo-pe ndojapo.
- **Suelos y pendientes.** Círculo superficies ndaha'éi: cuña ni bloque búsqueda ni tensión grieta ndaipóri.
- **Intersecciones.** Pierna peteĩ radio, camión camino barrido ndaipóri, ni corredor-pe ndojejuhu ko'ágã.
- **Archivos de campo.** Lectores ojeikuaa público formato descripción-gui ha ñande ojapo archivo ndive ojehecha. Instrumento archivo real ojeikotevẽ.
- **Enlaces y ferrocarril.** Enlace de radio: espacio libre pérdida ha multipath anave (lluvia desvanecimiento ni antena patrón ndaipóri), ferrocarril norma ndaipóri: opa límite marcador, número borrador ferrocarril ingeniero ndojechekáiva.
- **Windows ha macOS.** 0.8 código firmado ndaha'éi. Windows omombe'u ikatu, macOS derecho clic ha Abrir oporandu.

Opa mba'e [Todavía no construido](topic:not-built-yet). Ojeguata versión 0.7 rehe: [Qué hay de nuevo en 0.7](topic:whats-new-0-7).
