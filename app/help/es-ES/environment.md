---
title: Sombra, rendimiento solar y confort exterior
summary: Estudie la sombra que proyectan los volúmenes de sus edificios a lo largo de un día o de una temporada, vea una animación de ella, calcule cuánta electricidad producirían en un año típico los paneles solares de cubiertas y fachadas, vea cuán confortable es la calle junto a un edificio (UTCI) y obtenga una lectura de cribado del confort del viento peatonal.
keywords: estudio de sombra, sombra, horas de sol, animación, solar, PV, fotovoltaico, paneles, rendimiento, kWh, EPW, archivo meteorológico, UTCI, confort térmico, confort exterior, estrés por calor, viento
from: 96e7af4d
---

La sección **Entorno** está bajo **Horas de sol** en las **Propiedades** de un volumen. Usa los volúmenes que ha dibujado como edificios.

## Cargar un archivo meteorológico

Elija un archivo meteorológico de año típico (**.epw**) de su localidad. Son gratuitos en el sitio de EnergyPlus y en climate.onebuilding.org. El archivo permanece en su navegador durante esta visita. El rendimiento solar y el estudio de confort lo necesitan; el estudio de sombra funciona sin él cuando el proyecto tiene sistema de coordenadas.

## Estudio de sombra

Elija una fecha (o marque **Temporada** y una última fecha y un paso en días) y una zona horaria, y después pulse **Ejecutar estudio de sombra**. Obtendrá un mapa de las horas de sol, o de sombra, sobre el terreno alrededor de los volúmenes; una tabla de cuánto del terreno está sombreado a lo largo del día; y una animación del día que puede reproducir o recorrer fotograma a fotograma. **Guardar mapa**, **Guardar fotogramas de animación** (todos los fotogramas en una sola imagen) y **Guardar horas** (CSV) conservan los resultados.

El terreno se toma como plano a la altura del volumen más bajo. Para la sombra en terreno con pendiente, use **Horas de sol**, que lee el relieve.

## Rendimiento solar

Defina la eficiencia de los paneles, qué parte de cada cubierta y fachada queda cubierta y las pérdidas del sistema, y después pulse **Ejecutar rendimiento solar**. Para cada cubierta y fachada obtendrá la electricidad que produciría en un año típico un metro cuadrado de panel, cuánta de ella le quitan los volúmenes vecinos, y un total por cada volumen. El modelo se explica con palabras sencillas junto al botón: es una estimación de planificación a partir de un año típico, no una garantía.

## Confort exterior

**Ejecutar confort** calcula el Índice Térmico Climático Universal (UTCI) para una persona de pie en terreno abierto y junto al primer volumen (lados sur, norte, este y oeste), con la sombra de cada volumen. Muestra cuánto cielo se ve, el UTCI medio diurno y las horas por encima de 32 (estrés por calor) y por debajo de 0 (estrés por frío).

## Viento (cribado)

**Ejecutar estudio de viento** resuelve el flujo de aire alrededor de sus volúmenes una vez por cada dirección de viento que sopla en su archivo meteorológico (4, 8, 12 o 16 direcciones), sobre el entorno que elija (campo abierto, suburbio o centro urbano), y después suma el viento horario de todo el año. El mapa colorea el terreno por clase de confort, de verde (**sentado**) pasando por **de pie**, **paseo** y **caminar**, hasta rojo (**incómodo**): la actividad cuya velocidad límite (4, 6, 8 y 10 m/s) se supera en no más del 5 % de las horas. Una segunda tabla da la categoría NEN 8100 (de A a E) según la proporción de horas en que el viento supera 5 m/s. El factor de ráfaga multiplica la media horaria para dar una ráfaga efectiva.

Cómo funciona, en palabras sencillas: un solver de grandes remolinos (LES) de Boltzmann en red (propio, en la biblioteca `lib/wind`) en una caja alrededor de los edificios, un perfil de velocidad del viento que crece con la altura según la rugosidad elegida, y la velocidad a unos 1.5 m sobre el terreno comparada con la velocidad aguas arriba a 10 m. **Cribado** es rápido y grueso; **Estándar** usa más celdas y tarda mucho más. Si el panel indica que la malla es gruesa (menos de 10 celdas sobre el edificio más alto), o que el flujo seguía cambiando, dé menos crédito al mapa.

**Lo que no es.** El solver se ha comprobado con flujos de manual (un canal, una cavidad con tapa móvil) y se ejecutó en un cubo para ver que la estela y la aceleración en las esquinas son correctas. **No** se ha validado con mediciones de edificios en túnel de viento, por lo que cada resultado se etiqueta como no validado. No lo use para un valor de diseño, una carga de viento ni un certificado de planificación: un ingeniero de viento debe ejecutar y confirmar un estudio adecuado. El terreno plano, las paredes lisas de los edificios, el atajo de rugosidad de la estación meteorológica y la tabla de umbrales son simplificaciones; los umbrales pueden diferir de los criterios de su administración.

## Viento con OpenFOAM (complemento)

El motor de viento integrado arriba es experimental. Para un solver de flujo adecuado, active el complemento **Viento peatonal (OpenFOAM)** en **Configuración > Complementos** (está desactivado hasta que lo haga). Es un software con licencia GPL propio, separado del resto de CadCraft, y no incluye OpenFOAM: lo instala usted mismo. Después, **Motor** del bloque de viento muestra OpenFOAM.

Lo que configura, una sola vez:
1. **Instale OpenFOAM** (la serie v de ESI desde openfoam.com; el complemento se ha probado con v2512). En Ubuntu o Debian (también dentro de WSL en Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, y después `sudo apt install openfoam2512-default`. Se instala en `/usr/lib/openfoam/openfoam2512`. CadCraft necesita `blockMesh`, `snappyHexMesh` y `simpleFoam` para ejecutarse. (El paquete `openfoam` 1912, más antiguo, del propio repositorio de Ubuntu también funciona, pero sus objetos de función fallan; en ese caso el complemento lee él mismo los archivos de resultados.)
2. **Inicie el auxiliar** desde la carpeta `runner` del complemento con Node.js: `node cc-openfoam-runner.mjs serve`. Si OpenFOAM no está en la ruta de búsqueda, cree un pequeño `runner.json` con la ruta al `etc/bashrc` de OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) e inícielo con `--config runner.json`. El auxiliar escucha solo en este equipo e imprime un token.
3. **Pegue el token** en los campos del complemento en el bloque de viento (la dirección sigue siendo `http://127.0.0.1:8765`) y pulse **Comprobar el auxiliar**.

Después, **Ejecutar estudio de viento** funciona con un caso por cada dirección de viento del archivo meteorológico: sus volúmenes se convierten en una superficie (STL) dentro de una caja dimensionada según la guía habitual (5 alturas de edificio alrededor y por encima, 10 detrás), se mallan con blockMesh y snappyHexMesh, se ejecutan como RANS k-épsilon estacionario con una entrada de capa límite atmosférica sobre la rugosidad que elija, y la velocidad a 1.5 m se lee de vuelta y se convierte en las mismas clases de Lawson y NEN 8100. Nada sale de su equipo.

**Qué se ha comprobado.** El texto encima de los resultados lo dice claramente y forma parte de cada CSV guardado. La escritura de casos, la lectura de resultados del complemento y todo el proceso se han probado sin OpenFOAM, y un solo cubo se ha ejecutado con OpenFOAM real en tres tamaños de malla (las cifras están en las notas del proyecto). **No** se ha validado con mediciones de edificios en túnel de viento. Es una lectura de cribado, no un valor de diseño ni un certificado. El k-épsilon estándar sobrestima la turbulencia delante de los edificios, el terreno es plano, las paredes son lisas y no hay relieve ni vegetación.
