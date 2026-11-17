---
title: WaterCraft: demandas, caudal contra incendios, cortes y edad del agua
summary: Con el complemento WaterCraft, convierta a los abonados en demandas de sus tuberías de agua, compruebe el caudal disponible en cada boca de incendio, vea qué corte de tubería perjudica más y siga la edad del agua y el cloro a lo largo de un día.
keywords: watercraft, distribución de agua, demandas, abonados, factor pico, patrón de demanda, caudal contra incendios, boca de incendio, presión residual, criticidad, corte, tramo con válvulas, edad del agua, cloro, residual, rastreo de origen, tramo ciego, csv, complemento
from: 76809f01
---

WaterCraft es un complemento que trabaja sobre la red de agua que ya dibujó con las herramientas de redes de agua. Añade una pestaña al panel derecho con cuatro secciones.

:::warning
Solo una ayuda de cálculo. Se comprobó con resultados calculados a mano en redes inventadas, no en un modelo de una compañía real. Un ingeniero de aguas debe revisar cada resultado. Todavía no hay estaciones de bombeo, ni decaimiento de segundo orden, ni escenarios.
:::

## Qué va a hacer

- Coloque a los abonados en la red como demandas.
- Encuentre las bocas de incendio que no alcanzan el caudal necesario.
- Encuentre las tuberías cuyo corte tiene más impacto.
- Encuentre agua antigua y cloro bajo.

## Pasos

1. Abra {{ui:Configuración}} › {{ui:Complementos}} y active {{ui:WaterCraft (distribución de agua)}}. Aparece una pestaña {{ui:WaterCraft}} en el panel derecho.
2. Dibuje primero un depósito, nudos y tuberías con las herramientas de redes de agua (véase [Redes de agua](topic:water-mains)). Sin una red, la pestaña le indica que haga eso.
3. En {{ui:Demandas}}, pegue un abonado por línea: id, x, y, tipo, cantidad. Elija el {{ui:Factor pico}} y el {{ui:Patrón horario}} (día residencial, día comercial, plano, o conservar el patrón tal como está). Pulse {{ui:Comprobar}} para ver dónde cae cada abonado (el nudo más cercano) y, después, {{ui:Colocar en la red}}. Deshacer devuelve las demandas.
4. En {{ui:Caudal contra incendios}}, indique el caudal necesario y la presión residual, elija si la presión residual se mantiene {{ui:Solo en la boca de incendio}} o {{ui:En todo el sistema (más estricto)}}, y pulse {{ui:Recorrido}}. Cada boca de incendio aparece ordenada de peor a mejor, marcada como cumple o no alcanza.
5. En {{ui:Qué tubería importa más}}, elija {{ui:una tubería cada vez}} o {{ui:un tramo con válvulas cada vez}} y pulse {{ui:Recorrido}}. Cada corte muestra la demanda aislada, los nudos aislados, los nudos que pasan a estar por debajo de la presión mínima y la presión más baja que queda.
6. En {{ui:Edad del agua y cloro}}, elija qué seguir (edad del agua, cloro o un rastreo de origen), indique las horas que debe calcular y los límites que quiera, y pulse {{ui:Recorrido}}. Se listan los nudos que quedan fuera de sus límites.
7. Pulse {{ui:Guardar como CSV}} bajo cualquier tabla para conservarla.

## Notas

- El caudal contra incendios necesario y el consumo por vivienda o por acre son valores de partida, no normas. Utilice las cifras propias de su compañía de aguas.
- Una tubería cortada parcialmente por una válvula se considera cerrada entera, así que el corte que se muestra es algo peor que uno real.
- Deje correr la sección de calidad del agua el tiempo suficiente para que el patrón diario se repita antes de leer el último día.
- {{ui:Detener}} termina antes una ejecución larga; la lista muestra entonces solo lo que se hizo.
- Su red se queda en este proyecto y en este equipo. No se envía nada a ningún sitio.
