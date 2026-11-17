---
title: Sombra, rendimiento solar y confort exterior
summary: Estudie la sombra que proyectan los volúmenes de sus edificios durante un día o una temporada, vea una animación de ella, calcule cuánta electricidad producirían en un año típico los paneles solares de techos y muros, vea qué tan cómodo es el espacio junto a un edificio (UTCI), y obtenga una lectura preliminar del confort del viento peatonal.
keywords: estudio de sombra, sombra, horas de sol, animación, solar, PV, fotovoltaico, paneles, rendimiento, kWh, EPW, archivo climático, UTCI, confort térmico, confort exterior, estrés por calor, viento
from: 96e7af4d
---

La sección **Entorno** está bajo **Horas de sol** en las **Propiedades** de un volumen. Usa los volúmenes que ha dibujado como edificios.

## Cargar un archivo climático

Elija un archivo climático de año típico (**.epw**) para su ciudad. Son gratuitos del sitio de EnergyPlus y de climate.onebuilding.org. El archivo permanece en su navegador durante esta visita. El rendimiento solar y el estudio de confort lo necesitan; el estudio de sombra funciona sin él cuando el proyecto tiene sistema de coordenadas.

## Estudio de sombra

Elija una fecha (o marque **Temporada** y una última fecha y un paso en días) y una zona horaria, luego **Ejecutar estudio de sombra**. Obtiene un mapa de las horas de sol, o de sombra, sobre el terreno alrededor de los volúmenes; una tabla de cuánto del terreno está en sombra durante el día; y una animación del día que puede reproducir o avanzar por cuadros. **Guardar mapa**, **Guardar cuadros de animación** (todos los cuadros en una sola imagen) y **Guardar horas** (CSV) conservan los resultados.

El terreno se toma como plano, al nivel del volumen más bajo. Para la sombra en terreno con pendiente use **Horas de sol**, que lee el relieve.

## Rendimiento solar

Defina la eficiencia del panel, qué parte de cada techo y muro se cubre y las pérdidas del sistema, luego **Ejecutar rendimiento solar**. Para cada techo y muro obtiene la electricidad que produciría en un año típico un metro cuadrado de panel, cuánto le quitan los volúmenes vecinos y un total por cada volumen. El modelo se describe con palabras junto al botón: es una estimación de planeación a partir de un año típico, no una garantía.

## Confort exterior

**Ejecutar confort** calcula el Índice Térmico Universal del Clima (UTCI) para una persona de pie en terreno abierto y junto al primer volumen (lados sur, norte, este y oeste), con la sombra de cada volumen. Muestra cuánto cielo se ve, el UTCI diurno promedio y las horas por encima de 32 (estrés por calor) y por debajo de 0 (estrés por frío).

## Viento (lectura preliminar)

**Ejecutar estudio de viento** resuelve el flujo de aire alrededor de sus volúmenes una vez por cada dirección de viento que sopla en su archivo climático (4, 8, 12 o 16 direcciones), sobre el entorno que elija (campo abierto, suburbio o centro de ciudad), y luego suma el viento horario de todo el año. El mapa colorea el terreno por clase de confort, desde verde (**sentado**), pasando por **de pie**, **paseando** y **caminando**, hasta rojo (**incómodo**): la actividad cuya velocidad límite (4, 6, 8 y 10 m/s) se excede en no más del 5 % de las horas. Una segunda tabla da el grado NEN 8100 (A a E) según la proporción de horas en que el viento supera 5 m/s. El factor de ráfaga multiplica el promedio horario para obtener una ráfaga efectiva.

Cómo funciona, en palabras sencillas: un solucionador de flujo de grandes remolinos (large-eddy) de tipo lattice-Boltzmann (propio, en la biblioteca `lib/wind`) en una caja alrededor de los edificios, un perfil de velocidad del viento que aumenta con la altura según la rugosidad elegida, y la velocidad a unos 1.5 m sobre el suelo comparada con la velocidad aguas arriba a 10 m. **Lectura preliminar** es rápida y gruesa; **Estándar** usa más celdas y tarda mucho más. Si el panel indica que la cuadrícula es gruesa (menos de 10 celdas sobre el edificio más alto), o que el flujo seguía cambiando, dé menos crédito al mapa.

**Lo que no es.** El solucionador se ha verificado con flujos de libro de texto (un canal, una cavidad con tapa móvil) y se ejecutó sobre un cubo para comprobar que la estela y la aceleración en las esquinas se ven correctas. **No** se ha validado contra mediciones en túnel de viento de edificios, por eso cada resultado se etiqueta como no validado. No lo use para un valor de diseño, una carga de viento ni un certificado de planeación: un ingeniero de viento debe ejecutar y confirmar un estudio formal. El terreno plano, los muros lisos, el atajo de rugosidad de la estación meteorológica y la tabla de umbrales son simplificaciones; los umbrales pueden diferir de los criterios de su autoridad.

## Viento con OpenFOAM (complemento)

El motor de viento integrado es experimental. Para un solucionador de flujo formal, active el complemento **Viento peatonal (OpenFOAM)** en **Configuración > Complementos** (está desactivado hasta que lo active). Es un software con licencia GPL propio, separado del resto de CadCraft, y no incluye OpenFOAM: usted lo instala. Luego **Motor** en el bloque de viento muestra OpenFOAM.

Lo que configura una vez:
1. **Instalar OpenFOAM** (la serie v de ESI, de openfoam.com; el complemento se probó con v2512). En Ubuntu o Debian (también dentro de WSL en Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, luego `sudo apt install openfoam2512-default`. Se instala en `/usr/lib/openfoam/openfoam2512`. CadCraft necesita `blockMesh`, `snappyHexMesh` y `simpleFoam` para ejecutarse. (El paquete antiguo `openfoam` 1912 del propio repositorio de Ubuntu también funciona, pero sus objetos de función fallan; entonces el complemento lee los archivos de resultados por sí mismo.)
2. **Inicie el auxiliar** desde la carpeta `runner` del complemento con Node.js: `node cc-openfoam-runner.mjs serve`. Si OpenFOAM no está en la ruta de búsqueda, dé un pequeño `runner.json` con la ruta al `etc/bashrc` de OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) e inícielo con `--config runner.json`. El auxiliar escucha solo en esta computadora e imprime un token.
3. **Pegue el token** en los campos del complemento en el bloque de viento (la dirección sigue siendo `http://127.0.0.1:8765`) y pulse **Verificar el auxiliar**.

Luego **Ejecutar estudio de viento** trabaja un caso por cada dirección de viento del archivo climático: sus volúmenes se convierten en una superficie (STL) dentro de una caja del tamaño de la guía habitual (5 alturas de edificio alrededor y por encima, 10 hacia atrás), se malla con blockMesh y snappyHexMesh, se ejecuta como RANS k-epsilon estacionario con una entrada de capa límite atmosférica sobre la rugosidad que elija, y la velocidad a 1.5 m se lee de vuelta y se convierte en las mismas clases de Lawson y NEN 8100. Nada sale de su computadora.

**Lo que se ha verificado.** El texto encima de los resultados lo dice claramente y forma parte de cada CSV guardado. La escritura de casos, la lectura de resultados y todo el proceso del complemento se prueban sin OpenFOAM, y un solo cubo se ha ejecutado con OpenFOAM real en tres tamaños de malla (los números están en las notas del proyecto). **No** se ha validado contra mediciones en túnel de viento de edificios. Es una lectura preliminar, no un valor de diseño ni un certificado. El k-epsilon estándar sobrestima la turbulencia frente a los edificios; el terreno es plano, los muros son lisos y no hay relieve ni vegetación.
