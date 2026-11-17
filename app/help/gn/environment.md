---
title: Sombra, rendimiento solar y confort al aire libre
summary: Estudiá sombra edificio masas oguerékova día térã estación-pe, eicha animación, kuánto electricidad paneles solares techo ha pared-pe typical año-pe oguahẽta, mba'éichapa confortable calle edificio-pe (UTCI), ha peteĩ viento peatonal confort ojehechakuaáva.
keywords: estudio de sombra, sombra, horas de sol, animación, solar, PV, fotovoltaico, paneles, rendimiento, kWh, EPW, archivo de clima, UTCI, confort térmico, confort al aire libre, estrés por calor, viento
from: 96e7af4d
---

**Environment** sección oĩ **Horas de sol** ruguére masa **Propiedades**-pe. Oipuru masas edificio-kuéra ojapo haguéicha.

## Cargar un archivo de clima

Eleguá typical año clima archivo (**.epw**) tu ciudad-pe. Gratuitas oĩ EnergyPlus clima sitio-pe ha climate.onebuilding.org-pe. Archivo oĩ navegador-pe ko visita-pe. Rendimiento solar ha confort estudio oipota; sombra estudio ndojeporúi ndaipóri jave proyecto koordenada sistema.

## Estudio de sombra

Eleguá fecha (térã eleguá **Temporada** ha última fecha ha paso días-pe) ha horario zona, upéi **Ejecutar estudio de sombra**. Oguahẽ mapa de horas de sol térã sombra piso masas ryepýpe; tabla día-pe piso ndaipýva; ha día animación, ejepeteĩ térã ejepe'a paso paso. **Guardar mapa**, **Guardar fotogramas de animación** (fotogramas peteĩ imagen-pe) ha **Guardar horas** (CSV) ojapo resultados.

Piso plano oñemoĩ masa más bajo nivel-pe. Pendiente terreno sombra-pe, eleguá **Horas de sol**, terreno ohechakuaa.

## Rendimiento solar

Emoĩ paneles eficiencia, mboyve techo ha pared oñembyai ha sistema pérdidas, upéi **Ejecutar rendimiento solar**. Techo ha pared peteĩ-peteĩ-pe oguahẽ electricidad metro cuadrado panel typical año-pe, mboyve ambue masas ojapo, ha total masa peteĩ-peteĩ-pe. Modelo oĩ ejeskirĩ'a ejeporu botón ykére: planificación estimación, typical año-gui, ndaha'éi garantía.

## Confort al aire libre

**Ejecutar confort** ojapo Índice Térmico Climático Universal (UTCI) persona tierra abierta-pe ha primer masa ryepýpe (sur, norte, este ha oeste lados), masas sombra ndive. Ohechauka cielo cuánto ohecha, día promedio UTCI, ha horas 32 ryepýpe (estrés por calor) ha 0 ryepýpe (estrés por frío).

## Viento (cribado)

**Ejecutar estudio de viento** ojapo aire flujo masas rupi peteĩ jey viento dirección-pe clima archivo-pe (4, 8, 12 térã 16 dirección), eleguá entorno (campo abierto, suburbio térã centro ciudad), ha upéi suma año entero horario viento. Mapa tierra kolorea confort clase-pe, verde (**sentado**) gui **de pie**, **paseo** ha **caminata** rupi rojo (**incómodo**): actividad cuyo velocidad límite (4, 6, 8 ha 10 m/s) 5 % ryepýpe horas-pe ndaipóri excede. Segundo tabla NEN 8100 grado (A gui E) 5 m/s horas porcentaje-gui. Ráfaga factor horario promedio multiplica efectiva ráfaga-pe.

Mba'éichapa oñemoĩ, ñe'ẽ porã: lattice-Boltzmann large-eddy flujo solucionador (ñande rembiapo, biblioteca `lib/wind`-pe) edificio-kuéra ryepýpe caja-pe, viento velocidad perfil alto-gui oñemboguejy chosen rugosidad-pe, ha velocidad 1.5 m tierra-pe 10 m upstream velocidad-gui. **Cribado** rápido ha grueso; **Estándar** mboyve celda ha ojapo tiempo tuichaiterei. Panel ohechauka grilla grueso (10 celda ndaipóri edificio más alto ryepýpe), térã flujo ojeplanea mba'e, mapa ndaiporãi ejepytyvõ.

**Ko ndaha'éi.** Solucionador oñemoaranduhai textbook flujo-pe (canal, cavidad), ha cubo-pe ojapo estela ha velocidad aumento esquina-pe porã ohechakuaa. **Ndaha'éi** validado túnel de viento medidas edificio-kuéra-pe, upévare resultado peteĩ-peteĩ etiqueta no validado. Ndeporu diseño valor, viento carga térã planificación certificado-pe: viento ingeniero ojapo ha confirma estudio apropiado. Tierra plana, pared liso, clima estación rugosidad atajo ha umbral tabla simplificaciones; umbral autoridad criterio-kuéra-pe ndaikatúi ndaha'éi.

## Viento con OpenFOAM (complemento)

Motor viento incorporado ojehai experimental. Flujo solucionador porã jeporu, **Viento peatonal (OpenFOAM)** complemento **Configuración > Complementos**-pe ejejapo (oĩ apagado peve). GPL licencia propia software, CadCraft ambue ndive ndoiporúi, ha OpenFOAM ndoiporúi: ndejapo ndehe. Upéi **Motor** viento bloque-pe OpenFOAM ohechauka.

Ejapo peteĩ jey:
1. **Instalar OpenFOAM** (ESI v-series openfoam.com-gui; complemento tested v2512-pe). Ubuntu térã Debian-pe (WSL Windows-pe avei): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, upéi `sudo apt install openfoam2512-default`. Instala `/usr/lib/openfoam/openfoam2512`-pe. CadCraft oipota `blockMesh`, `snappyHexMesh` ha `simpleFoam` ejecutáre. (Ubuntu propio archivo-pe `openfoam` 1912 paquete avei oñemboguejy, ha función objetos oñembotyky; upéi complemento resultado archivo-kuéra ohendu ha'e.)
2. **Iniciar ayudante** complemento `runner` carpeta-pe Node.js-gui: `node cc-openfoam-runner.mjs serve`. OpenFOAM búsqueda ruta-pe ndoiporãi, peteĩ `runner.json` mboyve OpenFOAM `etc/bashrc` ruta-gui (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) ha iniciá `--config runner.json` ndive. Ayudante ko computadora-pe ohendu ha peteĩ token ohechauka.
3. **Emoĩ token** complemento campo-kuéra-pe viento bloque-pe (dirección `http://127.0.0.1:8765` oĩtaha) ha ejepe'a **Verificar el ayudante**.

Upéi **Ejecutar estudio de viento** peteĩ caso peteĩ viento dirección-pe clima archivo-pe: masas superficie (STL) oikeha caja-pe ohechakuaa tamaño guía rupi (5 altura edificio alrededor ha arriba, 10 atrás), blockMesh ha snappyHexMesh-gui malla, steady k-epsilon RANS-pe atmosférica límite capa entrada ndive, rugosidad eleguáva-pe, ha velocidad 1.5 m-pe ohechauka Lawson ha NEN 8100 clase-kuéra-pe. Nada ndoguahẽi ndeprograma-gui.

**Lo que se revisó.** Texto resultados ruguére ohechauka mba'éichapa, ha CSV guardado opa rupi. Complemento caso oñemoĩ, resultado lectura ha tubería OpenFOAM ndive ndoiporúi revisado, ha peteĩ cubo ojapo real OpenFOAM-pe irundy malla tamaño-pe (números proyecto notas-pe). **Ndaha'éi** validado túnel de viento medidas edificio-kuéra-pe. Cribado lectura, ndaha'éi diseño valor ni certificado. Estándar k-epsilon edificio renteguépe turbulencia overpredice, tierra plana, pared liso, terreno ni vegetación ndaiporãi.
