---
title: WaterCraft: demandas, flujo contra incendio, cortes y antigüedad del agua
summary: Con el complemento WaterCraft, convierta a los clientes en demandas de sus tuberías principales de agua, revise el flujo disponible en cada hidrante, vea qué corte de tubería afecta más y siga la antigüedad del agua y el cloro a lo largo de un día.
keywords: watercraft, distribución de agua, demandas, clientes, factor pico, patrón de demanda, flujo contra incendio, hidrante, presión residual, criticidad, corte, tramo con válvulas, antigüedad del agua, cloro, residual, trazado de fuente, extremo ciego, csv, complemento
from: 76809f01
---

WaterCraft es un complemento que trabaja sobre la red de agua que ya dibujó con las herramientas de tuberías principales de agua. Agrega una pestaña al panel derecho con cuatro secciones.

:::warning
Solo es una ayuda para cálculos. Se verificó contra resultados hechos a mano en redes ficticias, no en un modelo real de una empresa de agua. Un ingeniero hidráulico debe revisar cada resultado. Todavía no hay estaciones de rebombeo, ni decaimiento de segundo orden, ni escenarios.
:::

## Qué hará

- Coloque clientes en la red como demandas.
- Encuentre los hidrantes que no alcanzan el flujo que necesita.
- Encuentre las tuberías cuya pérdida importa más.
- Encuentre agua antigua y cloro bajo.

## Pasos

1. Abra {{ui:Configuración}} › {{ui:Complementos}} y active {{ui:WaterCraft (distribución de agua)}}. Aparece una pestaña {{ui:WaterCraft}} en el panel derecho.
2. Primero dibuje un depósito, nodos y tuberías con las herramientas de tuberías principales de agua (vea [Tuberías principales de agua](topic:water-mains)). Sin una red, la pestaña le indica que haga eso.
3. En {{ui:Demandas}}, pegue un cliente por línea: id, x, y, tipo, cantidad. Elija el {{ui:Factor pico}} y el {{ui:Patrón horario}} (día residencial, día comercial, plano, o conservar el patrón tal como está). Pulse {{ui:Revisar}} para ver en qué punto cae cada cliente (el nodo más cercano) y luego pulse {{ui:Colocar en la red}}. Deshacer quita las demandas.
4. En {{ui:Flujo contra incendio}}, indique el flujo necesario y la presión residual, elija si la presión residual se mantiene {{ui:Solo en el hidrante}} o {{ui:En todo el sistema (más estricto)}}, y pulse {{ui:Desarrollo}}. Cada hidrante aparece ordenado del peor al mejor, como cumple o como insuficiente.
5. En {{ui:Qué tubería importa más}}, elija {{ui:una tubería a la vez}} o {{ui:un tramo con válvulas a la vez}} y pulse {{ui:Desarrollo}}. Cada corte muestra la demanda desconectada, los nodos desconectados, los nodos que pasan a estar bajo la presión mínima y la presión más baja que queda.
6. En {{ui:Antigüedad del agua y cloro}}, elija qué seguir (antigüedad del agua, cloro o un trazado de fuente), indique las horas a simular y los límites que quiere, y pulse {{ui:Desarrollo}}. Se listan los nodos que quedan fuera de sus límites.
7. Pulse {{ui:Guardar como CSV}} bajo cualquier tabla para conservarla.

## Notas

- El flujo de incendio necesario y el consumo por vivienda o por acre son valores de partida, no normas. Use las cifras propias de su empresa de agua.
- Una tubería que una válvula corta parcialmente se considera cerrada completa, así que el corte que se muestra es un poco peor que uno real.
- Deje correr la sección de calidad del agua el tiempo suficiente para que el patrón diario se repita antes de leer el último día.
- {{ui:Detener}} termina una ejecución larga antes; la lista muestra entonces solo lo que se hizo.
- Su red se queda en este proyecto y en esta computadora. No se envía nada a ningún lado.
