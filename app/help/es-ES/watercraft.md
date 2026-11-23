---
title: WaterCraft: demandas, caudal contra incendios, cortes y edad del agua
summary: Con el complemento WaterCraft, convierta a los abonados en demandas sobre sus conducciones de agua, compruebe el caudal disponible en cada hidrante, vea qué corte de conducción perjudica más y siga la edad del agua y el cloro a lo largo de un día.
keywords: watercraft, distribución de agua, demandas, abonados, factor pico, patrón de demanda, caudal contra incendios, hidrante, presión residual, criticidad, corte, tramo con válvulas, edad del agua, cloro, cloro residual, traza de origen, fondo de saco, CSV, complemento
from: 066fb17a
---

WaterCraft es un complemento que trabaja sobre la red de agua que ya dibujó con las herramientas de Conducciones de agua. Añade una pestaña al panel derecho con cuatro secciones.

:::warning
Solo es una herramienta de cálculo. Se comprobó frente a resultados hechos a mano en redes ficticias, no en un modelo real de una compañía de aguas. Un ingeniero de aguas debe comprobar cada resultado. Los escenarios, las reglas de control, las válvulas y las lecturas de campo tienen sus propios temas, «Escenarios» y «Estudios», en la ayuda del complemento WaterCraft.
:::

## Qué hará

- Incorpore abonados a la red como demandas.
- Localice los hidrantes que no alcanzan el caudal que necesita.
- Localice las conducciones cuya pérdida tiene más importancia.
- Localice agua antigua y cloro bajo.

## Pasos

1. Abra {{ui:Configuración}} › {{ui:Complementos}} y active {{ui:WaterCraft (distribución de agua)}}. Aparece una pestaña {{ui:WaterCraft}} en el panel derecho.
2. Dibuje primero un depósito, nudos y tuberías con las herramientas de Conducciones de agua (vea [Conducciones de agua](topic:water-mains)). Sin red, la pestaña le indica que haga eso.
3. En {{ui:Demandas}}, pegue un abonado por línea: id, x, y, tipo, cantidad. Elija el {{ui:Factor pico}} y el {{ui:Patrón horario}} (día residencial, día comercial, plano, o mantener el patrón tal cual). Pulse {{ui:Comprobar}} para ver dónde cae cada abonado (el nudo más cercano), y luego {{ui:Incorporar a la red}}. Deshacer quita las demandas.
4. En {{ui:Caudal contra incendios}}, fije el caudal necesario y la presión residual, elija si la presión residual se mantiene {{ui:Solo en el hidrante}} o {{ui:En todo el sistema (más estricto)}}, y pulse {{ui:Recorrido}}. Cada hidrante aparece con el peor primero, como cumple o no llega.
5. En {{ui:Qué conducción importa más}}, elija {{ui:una tubería cada vez}} o {{ui:un tramo con válvulas cada vez}} y pulse {{ui:Recorrido}}. Cada corte muestra la demanda aislada, los nudos aislados, los nudos que quedan por debajo de la presión mínima y la presión más baja que queda.
6. En {{ui:Edad del agua y cloro}}, elija qué seguir (edad del agua, cloro o una traza de origen), fije las horas de simulación y los límites que quiera, y pulse {{ui:Recorrido}}. Se enumeran los nudos fuera de sus límites.
7. Pulse {{ui:Guardar como CSV}} bajo cualquier tabla para conservarla.

## Notas

- El caudal contra incendios necesario y el consumo por vivienda o por acre son valores iniciales, no normas. Use las cifras propias de su compañía.
- Una tubería que una válvula corta solo en parte se cierra entera, así que el corte que se muestra es algo peor que uno real.
- Ejecute la sección de calidad del agua el tiempo suficiente para que el patrón diario se repita antes de leer el último día.
- {{ui:Detener}} termina antes un cálculo largo; la lista muestra entonces solo lo que se hizo.
- Su red se queda en este proyecto y en este ordenador. No se envía nada a ningún sitio.
