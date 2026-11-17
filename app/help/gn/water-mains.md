---
title: Redes de agua: presiones, caudales y caudal de incendio
summary: Dibujar en el plano una red de presión con nudos, depósitos, tanques, caños, bombas y válvulas reductoras de presión; CivilCraft calcula las cargas, presiones y caudales (Hazen–Williams, redes malladas), el caudal disponible para un incendio y un día de demanda. Función de laboratorio; cada resultado necesita la verificación de un ingeniero.
keywords: agua, red de agua, distribución de agua, red de presión, caño a presión, red mallada, hazen-williams, factor C, pérdida de carga, presión residual, caudal de incendio, hidrante, demanda, nudo, depósito, tanque, bomba, curva de bomba, válvula reductora de presión, prv, válvula de retención, período extendido, epanet, inp, velocidad
from: df46bf6d
---

Las redes de agua son el lado de presión de un sitio: caños que siempre están llenos, con el agua impulsada por un depósito, un tanque o una bomba. CivilCraft calcula la carga y la presión en cada nudo y el caudal en cada caño, incluidas las redes malladas donde el agua tiene más de un camino. Está en laboratorio mientras se verifica.

**Solo una ayuda de cálculo.** Cada número necesita la verificación de un ingeniero calificado: la respuesta es tan buena como las demandas, las cotas, los diámetros de caño y los valores de rugosidad que le diste, y un modelo en régimen permanente no sabe nada de golpe de ariete, calidad del agua ni del comportamiento real de una bomba contra incendio.

## Dibujar la red

1. En **Superficie** › {{ui:More}}, elegí {{ui:Water mains…}}. La ventana queda abierta mientras trabajás en el plano.
2. Elegí {{ui:Reservoir}} y hacé clic en el plano donde está el suministro. Su carga empieza 100 ft (30 m) por encima del terreno; cambiala en Propiedades.
3. Elegí {{ui:Junction}} y hacé clic en cada lugar donde se extrae agua o se encuentran caños. Un nudo toma su cota del terreno; tipeá otra en Propiedades para cambiarla.
4. Elegí {{ui:Pipe}}, hacé clic en un nudo, y después en el nudo al que se une. La herramienta sigue activa para el próximo caño. Una {{ui:Pump}} y una {{ui:Pressure reducing valve}} se dibujan igual, desde el nudo de succión (o aguas arriba) hasta el nudo de impulsión (o aguas abajo). Un {{ui:Tank}} se coloca como un nudo.
5. Seleccioná un nudo y tipeá su {{ui:Demand}} (gpm, o L/s en un proyecto en metros). Seleccioná un caño y fijá su {{ui:Diameter}} (in, o mm) y, si lo sabés, su C de Hazen–Williams.

Cada cambio es un paso de deshacer. Suprimir quita el nudo y los caños que terminan en él.

## Qué significa cada parte

- **Caño.** La longitud se mide a lo largo del plano, salvo que tipees una. C es la rugosidad de Hazen–Williams (130 para empezar; cambiá el valor por defecto en la ventana). Un coeficiente de pérdida menor K suma las pérdidas de codos y accesorios. Marcá **Check valve** para un caño que no debe llevar agua hacia atrás; un caño **Closed** no lleva nada.
- **Depósito.** Una fuente con carga fija, el nivel de agua que mantiene por encima del nivel de referencia. Entrega o toma lo que la red necesite.
- **Tanque.** Un nivel que cambia a lo largo del día. En los resultados de régimen permanente es una fuente en su nivel actual.
- **Bomba.** Un punto de diseño (caudal y carga) da la curva habitual que pasa por él: la carga a caudal cero es el 133 % de la carga de diseño, y la carga es cero al doble del caudal de diseño. Una bomba nunca impulsa agua hacia atrás.
- **Válvula reductora de presión.** Mantiene la presión que fijaste aguas abajo mientras el suministro es más alto. Cuando el suministro es más bajo está abierta y no mantiene nada; si el agua correría hacia atrás, se cierra.

## Leer los resultados

La ventana muestra la carga y la presión de cada nudo y el caudal, la velocidad y la pérdida de carga por cada 1,000 ft (o por km) de cada enlace, con los nudos coloreados en el plano: verde entre tu presión mínima y máxima, rojo por debajo, ámbar por encima. Las flechas de caudal muestran la dirección. Seleccioná un nudo o un caño para leer sus números en Propiedades.

Debajo de las tablas hay una lista de lo que conviene revisar: presión baja o alta, un caño más rápido que tu límite, un nudo aislado de toda fuente, o un solucionador que no convergió. Los mismos hallazgos están en el panel de Problemas. Fijá los límites en la ventana (20 psi, 100 psi y 10 ft/s para empezar; 140 kPa, 700 kPa y 3 m/s en un proyecto en metros).

## Caudal de incendio

{{ui:Fire flow…}} dibuja un caudal en un nudo y muestra la presión allí y la presión más baja en cualquier punto de la red. También calcula el caudal disponible en ese nudo mientras el nudo más débil de la red mantiene la presión residual que indiques. Las demás demandas quedan como están.

## Un día de demanda

{{ui:A day of demand…}} corre la red hora por hora. Indicá el patrón de demanda en la configuración del archivo (una lista de multiplicadores que se repite); los tanques se llenan y se vacían según el caudal que entra y sale, y una bomba puede seguir un patrón de encendido y apagado. Un tanque que llega a su nivel más alto o más bajo se nombra en la lista: CivilCraft no cierra su entrada ni su salida por vos, así que leelo como "este tanque es demasiado chico o la bomba demasiado grande".

## Texto EPANET

{{ui:Save as EPANET text (.inp)}} escribe la red en el formato de texto plano que leen muchos programas de agua, y {{ui:Open EPANET text (.inp)…}} lee uno. Solo pasa lo que CivilCraft modela: nudos, depósitos, tanques, caños, bombas con curva de carga, válvulas reductoras de presión, patrones de demanda y los tiempos. Otros tipos de válvula, bombas dadas por potencia y otras fórmulas de pérdida de carga se nombran y quedan afuera. El archivo debe usar las mismas unidades que el proyecto.

## Hidrantes, válvulas y accesorios

Seleccioná un nudo y marcá **Hydrant** para poner uno allí; seleccioná un ramal y presioná **Add at the middle** para poner una válvula, una válvula de aire, una purga o un medidor sobre él. Son objetos de la red: se mueven con ella y un paso de deshacer los quita.

El trazado también implica accesorios, y CivilCraft los lista sin que lo pidas: una **tee** donde se encuentran tres ramales, una **cruz** donde se encuentran cuatro, un **codo** (con su ángulo) donde dos ramales giran 5° o más, una **reducción** donde se encuentran dos diámetros, y una **tapa** en un extremo ciego. {{ui:Fittings schedule (CSV)}} los cuenta y cuenta los ramales por diámetro. Esto es lo que implica el trazado, un cómputo para verificar contra tus propios detalles, no una lista para pedir.

Los ramales se tienden al terreno menos un recubrimiento (4 ft o 1.2 m) para poder dibujarlos y modelarlos en 3D; las presiones de arriba nunca dependen de eso.

## En el plano y en los archivos

El plano, el PDF y el DWG o DXF llevan los ramales en **C-WATR-MAIN** con sus diámetros en **C-WATR-TEXT**, los hidrantes en **C-WATR-HYDR**, las válvulas en **C-WATR-VALV** y los accesorios en **C-WATR-FITT**. La exportación de LandXML escribe una red de caños de agua (una estructura por cada nudo, un caño por cada ramal, hidrantes con nombre); la importación de LandXML lee una de vuelta como redes de agua, sin demandas, bombas ni válvulas, que LandXML no lleva. La exportación IFC escribe los ramales como segmentos de caño, hidrantes, válvulas y accesorios en un solo sistema de agua. Estos archivos se verificaron con nuestros propios lectores y escritores; probalos en tus otros programas y contanos qué dicen.

## Lo que todavía no está

Calidad y edad del agua, controles y reglas más allá del patrón de encendido y apagado de una bomba, otros tipos de válvula, demanda según presión, caños con diámetro variable, y caudales de cloacas en el tiempo. Ver [Todavía no implementado](topic:not-built-yet). Los caudales de diseño sanitario, que son otro cálculo, están en [Caudales de diseño sanitario](topic:sanitary-design).
