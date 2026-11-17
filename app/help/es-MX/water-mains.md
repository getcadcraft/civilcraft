---
title: "Redes de agua: presiones, caudales y flujo contra incendio"
summary: Dibuje en el plano una red de presión con nodos, depósitos, tanques, tuberías, bombas y válvulas reductoras de presión; CivilCraft calcula las cargas, presiones y caudales (Hazen–Williams, redes malladas), el flujo disponible para un incendio y un día de demanda. Función de laboratorio; cada resultado requiere la revisión de un ingeniero.
keywords: agua, red de agua, distribución de agua, red de presión, tubería a presión, red mallada, hazen-williams, factor C, pérdida de carga, presión residual, flujo contra incendio, hidrante, demanda, nodo, depósito, tanque, bomba, curva de bomba, válvula reductora de presión, prv, válvula de retención, periodo extendido, epanet, inp, velocidad
from: df46bf6d
---

Las redes de agua son el lado de presión de un sitio: tuberías siempre llenas, con el agua impulsada por un depósito, un tanque o una bomba. CivilCraft calcula la carga y la presión en cada nodo y el caudal en cada tubería, incluidas las redes malladas, donde el agua tiene más de una vía. Es una función de laboratorio mientras se verifica.

**Solo una ayuda de cálculo.** Cada número requiere la revisión de un ingeniero calificado: el resultado solo es tan bueno como las demandas, las elevaciones, los diámetros de tubería y los valores de rugosidad que usted indicó, y un modelo en régimen permanente no contempla el golpe de ariete, la calidad del agua ni el comportamiento real de una bomba contra incendio.

## Dibujar la red

1. En **Superficie** › {{ui:Más}}, elija {{ui:Redes de agua…}}. La ventana permanece abierta mientras trabaja en el plano.
2. Elija {{ui:Depósito}} y haga clic en el plano donde esté el suministro. Su carga empieza 100 ft (30 m) sobre el terreno; cámbiela en Propiedades.
3. Elija {{ui:Nodo}} y haga clic en cada lugar donde se extrae agua o se unen tuberías. Un nodo toma su elevación del terreno; escriba otra en Propiedades para reemplazarla.
4. Elija {{ui:Tubería}}, haga clic en un nodo y luego en el nodo al que se une. La herramienta sigue activa para la siguiente tubería. Una {{ui:Bomba}} y una {{ui:Válvula reductora de presión}} se dibujan de la misma forma, desde el nodo de succión (o aguas arriba) hasta el nodo de descarga (o aguas abajo). Un {{ui:Tanque}} se coloca como un nodo.
5. Seleccione un nodo y escriba su {{ui:Demanda}} (gpm, o L/s en un proyecto en metros). Seleccione una tubería y defina su {{ui:Diámetro}} (in, o mm) y, si lo conoce, su C de Hazen–Williams.

Cada cambio es un paso de deshacer. Delete elimina el nodo y las tuberías que terminan en él.

## Qué significa cada elemento

- **Tubería.** La longitud se mide sobre el plano, a menos que escriba una. C es la rugosidad de Hazen–Williams (130 para empezar; cambie el valor predeterminado en la ventana). Un coeficiente de pérdida menor K suma las pérdidas de codos y accesorios. Marque **Válvula de retención** para una tubería que no debe llevar agua hacia atrás; una tubería **Cerrada** no lleva nada.
- **Depósito.** Una fuente con carga fija, el nivel de agua que mantiene sobre el datum. Entrega o toma lo que la red necesite.
- **Tanque.** Un nivel que cambia a lo largo del día. En los resultados en régimen permanente es una fuente en su nivel actual.
- **Bomba.** Un punto de diseño (caudal y carga) define la curva habitual que pasa por él: la carga con caudal cero es el 133 % de la carga de diseño, y la carga es cero con el doble del caudal de diseño. Una bomba nunca impulsa agua hacia atrás.
- **Válvula reductora de presión.** Mantiene la presión que usted define aguas abajo mientras el suministro sea mayor. Cuando el suministro es menor, está abierta y no mantiene nada; si el agua correría hacia atrás, se cierra.

## Lea los resultados

La ventana muestra la carga y la presión de cada nodo, y el caudal, la velocidad y la pérdida de carga de cada tramo por cada 1,000 ft (o por km), con los nodos coloreados en el plano: verde entre su presión mínima y máxima, rojo por debajo, ámbar por encima. Las flechas de flujo muestran la dirección. Seleccione un nodo o una tubería para leer sus números en Propiedades.

Debajo de las tablas hay una lista de lo que conviene revisar: presión baja o alta, una tubería más rápida que su límite, un nodo aislado de todas las fuentes, o un solucionador que no convergió. Los mismos hallazgos aparecen en el panel de Problemas. Defina los límites en la ventana (20 psi, 100 psi y 10 ft/s para empezar; 140 kPa, 700 kPa y 3 m/s en un proyecto en metros).

## Flujo contra incendio

{{ui:Flujo contra incendio…}} dibuja un caudal en un nodo y muestra la presión allí y la presión más baja en cualquier punto de la red. También calcula el caudal disponible en ese nodo mientras el nodo más débil de la red conserve la presión residual que usted indique. Las demás demandas no cambian.

## Un día de demanda

{{ui:Un día de demanda…}} calcula la red hora por hora. Indique el patrón de demanda en la configuración del archivo (una lista de multiplicadores que se repite); los tanques se llenan y vacían según el caudal que entra y sale, y una bomba puede seguir un patrón de encendido y apagado. Un tanque que llega a su nivel máximo o mínimo se nombra en la lista: CivilCraft no cierra su entrada ni su salida por usted, así que léalo como "este tanque es demasiado pequeño o la bomba demasiado grande".

## Texto EPANET

{{ui:Guardar como texto EPANET (.inp)}} escribe la red en el formato de texto plano que leen muchos programas de agua, y {{ui:Abrir texto EPANET (.inp)…}} lee uno. Solo pasa lo que CivilCraft modela: nodos, depósitos, tanques, tuberías, bombas con curva de carga, válvulas reductoras de presión, patrones de demanda y los tiempos. Otros tipos de válvula, las bombas definidas por potencia y otras fórmulas de pérdida de carga se nombran y se excluyen. El archivo debe usar las mismas unidades que el proyecto.

## Hidrantes, válvulas y accesorios

Seleccione un nodo y marque **Hidrante** para colocar uno allí; seleccione una tubería principal y pulse **Agregar en el centro** para colocar en ella una válvula, una válvula de aire, una purga o un medidor. Son objetos de la red: se mueven con ella, y un paso de deshacer los elimina.

El trazado también implica accesorios, y CivilCraft los enumera sin que se lo pida: una **te** donde se unen tres tuberías principales, una **cruz** donde se unen cuatro, un **codo** (con su ángulo) donde dos tuberías principales giran 5° o más, una **reducción** donde se unen dos diámetros, y un **tapón** en un extremo ciego. {{ui:Lista de accesorios (CSV)}} los cuenta, junto con las tuberías por diámetro. Esto es lo que implica el trazado: una cuantificación para verificar contra sus propios detalles, no una lista para pedir.

Las tuberías principales se tienden al terreno menos un recubrimiento (4 ft o 1.2 m) para poder dibujarlas y modelarlas en 3D; las presiones anteriores nunca dependen de él.

## En el plano y en los archivos

El plano, el PDF y el DWG o DXF llevan las tuberías principales en **C-WATR-MAIN**, con sus diámetros en **C-WATR-TEXT**, los hidrantes en **C-WATR-HYDR**, las válvulas en **C-WATR-VALV** y los accesorios en **C-WATR-FITT**. LandXML de salida escribe una red de tuberías de agua (una estructura por nodo, una tubería por tubería principal, hidrantes con nombre); LandXML de entrada la lee de vuelta como redes de agua, sin demandas, bombas ni válvulas, que LandXML no almacena. La exportación IFC escribe las tuberías principales como segmentos de tubería, hidrantes, válvulas y accesorios en un solo sistema de agua. Estos archivos se verificaron con nuestros propios lectores y escritores; pruébelos en sus otros programas y cuéntenos qué resulta.

## Lo que todavía no está

Calidad y edad del agua, controles y reglas más allá del patrón de encendido y apagado de una bomba, otros tipos de válvula, demanda por presión, tuberías con diámetro variable, y caudales de alcantarillado en el tiempo. Consulte [No disponible todavía](topic:not-built-yet). Los caudales de diseño sanitario, que son otro cálculo, están en [Caudales de diseño sanitario](topic:sanitary-design).
