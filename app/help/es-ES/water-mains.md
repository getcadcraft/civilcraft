---
title: Redes de agua: presiones, caudales y caudal contra incendios
summary: Dibuje en el plano una red de presión con nudos, depósitos, tanques, tuberías, bombas y válvulas reductoras de presión; CivilCraft calcula las alturas, presiones y caudales (Hazen–Williams, redes malladas), el caudal disponible para un incendio y un día de demanda. Una función de laboratorio; cada resultado necesita la revisión de un ingeniero.
keywords: agua, red de agua, distribución de agua, red de presión, tubería a presión, red mallada, hazen-williams, factor C, pérdida de carga, presión residual, caudal contra incendios, hidrante, demanda, nudo, depósito, tanque, bomba, curva de bomba, válvula reductora de presión, prv, válvula de retención, periodo extendido, epanet, inp, velocidad
from: df46bf6d
---

Las redes de agua son el lado de presión de un emplazamiento: tuberías siempre llenas, con el agua impulsada por un depósito, un tanque o una bomba. CivilCraft calcula la altura y la presión en cada nudo y el caudal en cada tubería, incluidas las redes malladas, donde el agua tiene más de un camino. Está en el laboratorio mientras se verifica.

**Solo una ayuda de cálculo.** Cada número necesita la comprobación de un ingeniero cualificado: el resultado es tan bueno como las demandas, cotas, diámetros y valores de rugosidad que usted haya dado, y un modelo en régimen permanente no sabe nada de golpe de ariete, de calidad del agua ni del comportamiento real de una bomba de incendios.

## Dibuje la red

1. En **Superficie** › {{ui:Más}}, elija {{ui:Redes de agua…}}. La ventana permanece abierta mientras trabaja en el plano.
2. Elija {{ui:Depósito}} y haga clic en el plano donde está el suministro. Su altura empieza 100 ft (30 m) por encima del terreno; cámbiela en Propiedades.
3. Elija {{ui:Nudo}} y haga clic en cada lugar donde se extrae agua o confluyen tuberías. Un nudo toma su cota del terreno; escriba otra en Propiedades para anularla.
4. Elija {{ui:Tubería}}, haga clic en un nudo y después en el nudo al que se une. La herramienta sigue activa para la siguiente tubería. Una {{ui:Bomba}} y una {{ui:Válvula reductora de presión}} se dibujan igual, desde el nudo de succión (o aguas arriba) hasta el de impulsión (o aguas abajo). Un {{ui:Tanque}} se coloca como un nudo.
5. Seleccione un nudo y escriba su {{ui:Demanda}} (gpm, o L/s en un proyecto en metros). Seleccione una tubería y ajuste su {{ui:Diámetro}} (in, o mm) y, si lo conoce, su factor C de Hazen–Williams.

Cada cambio es un paso de deshacer. Delete elimina el nudo y las tuberías que terminan en él.

## Qué significa cada parte

- **Tubería.** La longitud se mide sobre el plano, salvo que escriba una. C es la rugosidad de Hazen–Williams (130 para empezar; cambie el valor por defecto en la ventana). Un coeficiente de pérdida singular K añade las pérdidas de codos y accesorios. Marque **Válvula de retención** para una tubería que no debe llevar agua hacia atrás; una tubería **Cerrada** no transporta nada.
- **Depósito.** Una fuente con una altura fija: el nivel de agua que mantiene por encima del plano de referencia. Da o toma lo que la red necesite.
- **Tanque.** Un nivel que cambia a lo largo del día. En los resultados en régimen permanente es una fuente a su nivel actual.
- **Bomba.** Un punto de diseño (caudal y altura) da la curva habitual que pasa por él: la altura a caudal cero es el 133 % de la altura de diseño, y la altura es cero al doble del caudal de diseño. Una bomba nunca impulsa agua hacia atrás.
- **Válvula reductora de presión.** Mantiene la presión que usted fije aguas abajo mientras el suministro es más alto. Cuando el suministro es más bajo, está abierta y no mantiene nada; si el agua correría hacia atrás, se cierra.

## Lea los resultados

La ventana muestra la altura y la presión de cada nudo, y el caudal, la velocidad y la pérdida de carga por cada 1,000 ft (o por km) de cada tramo, con los nudos coloreados en el plano: verde entre su presión mínima y máxima, rojo por debajo, ámbar por encima. Las flechas de caudal muestran el sentido. Seleccione un nudo o una tubería para leer sus valores en Propiedades.

Debajo de las tablas hay una lista de lo que conviene revisar: presión baja o alta, una tubería más rápida que su límite, un nudo aislado de todas las fuentes, o un cálculo que no ha convergido. Los mismos hallazgos aparecen en el panel de Problemas. Fije los límites en la ventana (20 psi, 100 psi y 10 ft/s para empezar; 140 kPa, 700 kPa y 3 m/s en un proyecto en metros).

## Caudal contra incendios

{{ui:Caudal contra incendios…}} dibuja un caudal en un nudo y muestra la presión allí y la presión más baja de toda la red. También calcula el caudal disponible en ese nudo mientras el nudo más débil de la red mantiene la presión residual que usted indique. Las demás demandas no cambian.

## Un día de demanda

{{ui:Un día de demanda…}} calcula la red hora a hora. Indique el patrón de demanda en los ajustes del archivo (una lista de multiplicadores que se repite); los tanques se llenan y se vacían con el caudal que entra y sale, y una bomba puede seguir un patrón de encendido y apagado. Un tanque que alcanza su nivel máximo o mínimo se nombra en la lista: CivilCraft no cierra por usted su entrada ni su salida, así que léalo como "este tanque es demasiado pequeño, o la bomba demasiado grande".

## Texto EPANET

{{ui:Guardar como texto EPANET (.inp)}} escribe la red en el formato de texto plano que leen muchos programas de agua, y {{ui:Abrir texto EPANET (.inp)…}} lee uno. Solo pasa lo que CivilCraft modela: nudos, depósitos, tanques, tuberías, bombas con curva de altura, válvulas reductoras de presión, patrones de demanda y los tiempos. Otros tipos de válvula, bombas definidas por potencia y otras fórmulas de pérdida de carga se nombran y se dejan fuera. El archivo debe usar las mismas unidades que el proyecto.

## Hidrantes, válvulas y accesorios

Seleccione un nudo y marque **Hidrante** para colocar uno allí; seleccione una conducción y pulse **Añadir en el punto medio** para colocar en ella una válvula, una válvula de aire, un desagüe o un contador. Son objetos de la red: se mueven con ella, y un solo paso de deshacer los elimina.

La disposición también implica accesorios, y CivilCraft los lista sin que se le pida: una **te** donde confluyen tres conducciones, una **cruz** donde confluyen cuatro, un **codo** (con su ángulo) donde dos conducciones giran 5° o más, una **reducción** donde se encuentran dos diámetros, y un **tapón** en un extremo ciego. {{ui:Tabla de accesorios (CSV)}} los cuenta, junto con las conducciones por diámetro. Esto es lo que implica la disposición: una medición que debe contrastar con sus propios detalles, no una lista para pedir material.

Las conducciones se tienden bajo el terreno menos un recubrimiento (4 ft o 1.2 m) para poder dibujarlas y modelarlas en 3D; las presiones de arriba no dependen nunca de él.

## En el plano y en los archivos

El plano, el PDF y el DWG o DXF llevan las conducciones en **C-WATR-MAIN**, con sus diámetros en **C-WATR-TEXT**; los hidrantes en **C-WATR-HYDR**; las válvulas en **C-WATR-VALV**; y los accesorios en **C-WATR-FITT**. La exportación de LandXML escribe una red de tuberías de agua (una estructura por cada nudo, una tubería por cada conducción, hidrantes con nombre); la importación de LandXML la lee de nuevo como conducciones de agua, sin demandas, bombas ni válvulas, que LandXML no contiene. La exportación IFC escribe las conducciones como segmentos de tubería, hidrantes, válvulas y accesorios en un solo sistema de agua. Estos archivos se han comprobado con nuestros propios lectores y escritores; pruébelos en sus otros programas e infórmenos de lo que muestran.

## Lo que aún no está

Calidad y edad del agua, controles y reglas más allá del patrón de encendido y apagado de una bomba, otros tipos de válvula, demanda según la presión, tuberías con diámetro variable, y caudales de saneamiento a lo largo del tiempo. Consulte [Aún no disponible](topic:not-built-yet). Los caudales de diseño de saneamiento, que son otro cálculo, están en [Caudales de diseño de saneamiento](topic:sanitary-design).
