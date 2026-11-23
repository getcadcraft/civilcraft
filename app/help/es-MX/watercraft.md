---
title: WaterCraft: demandas, flujo contra incendio, interrupciones y antigüedad del agua
summary: Con el complemento WaterCraft, convierta clientes en demandas de sus tuberías principales, revise el flujo disponible en cada hidrante, vea qué interrupción de tubería afecta más y siga la antigüedad del agua y el cloro a lo largo de un día.
keywords: watercraft, distribución de agua, demandas, clientes, factor pico, patrón de demanda, flujo contra incendio, hidrante, presión residual, criticidad, interrupción, tramo con válvulas, antigüedad del agua, cloro, residual, rastreo de fuente, extremo ciego, csv, complemento
from: 066fb17a
---

WaterCraft es un complemento que trabaja sobre la red de agua que ya dibujó con las herramientas de redes de distribución de agua. Agrega una pestaña al panel derecho con cuatro secciones.

:::warning
Solo es una ayuda de cálculo. Se verificó contra respuestas hechas a mano en redes ficticias, no en un modelo real de una empresa de agua. Un ingeniero de agua debe revisar cada resultado. Los escenarios, las reglas de control, las válvulas y las lecturas de campo tienen sus propios temas, "Escenarios" y "Estudios", en la ayuda del complemento WaterCraft.
:::

## Lo que hará

- Coloque clientes en la red como demandas.
- Encuentre los hidrantes que quedan por debajo del flujo que necesita.
- Encuentre las tuberías principales cuya pérdida tiene más importancia.
- Encuentre agua antigua y cloro bajo.

## Pasos

1. Abra {{ui:Configuración}} › {{ui:Complementos}} y active {{ui:WaterCraft (distribución de agua)}}. Aparece una pestaña {{ui:WaterCraft}} en el panel derecho.
2. Dibuje primero un depósito, las uniones y las tuberías con las herramientas de redes de distribución de agua (vea [Redes de distribución de agua](topic:water-mains)). Sin una red, la pestaña se lo indica.
3. En {{ui:Demandas}}, pegue un cliente por línea: id, x, y, tipo, cantidad. Elija el {{ui:Factor pico}} y el {{ui:Patrón horario}} (día residencial, día comercial, plano, o conservar el patrón tal como está). Pulse {{ui:Revisar}} para ver dónde cae cada cliente (la unión más cercana), y luego {{ui:Colocar en la red}}. Deshacer quita las demandas.
4. En {{ui:Flujo contra incendio}}, defina el flujo necesario y la presión residual, elija si la residual se mantiene {{ui:Solo en el hidrante}} o {{ui:En todo el sistema (más estricto)}}, y pulse {{ui:Desarrollo}}. Cada hidrante se lista del peor al mejor, como cumple o insuficiente.
5. En {{ui:Qué tubería importa más}}, elija {{ui:una tubería a la vez}} o {{ui:un tramo con válvulas a la vez}} y pulse {{ui:Desarrollo}}. Cada interrupción muestra la demanda cortada, las uniones cortadas, las uniones que quedan por debajo de la presión mínima y la presión más baja que queda.
6. En {{ui:Antigüedad del agua y cloro}}, elija qué seguir (antigüedad del agua, cloro o un rastreo de fuente), defina las horas a correr y los límites que quiera, y pulse {{ui:Desarrollo}}. Se listan las uniones fuera de sus límites.
7. Pulse {{ui:Guardar como CSV}} bajo cualquier tabla para guardarla.

## Notas

- El flujo contra incendio necesario y el consumo por vivienda o por acre son valores iniciales, no normas. Use las cifras propias de su empresa de agua.
- Una tubería cortada en parte por una válvula se cierra completa, así que la interrupción mostrada es un poco peor que una real.
- Corra la sección de calidad del agua el tiempo suficiente para que el patrón diario se repita antes de leer el último día.
- {{ui:Detener}} termina antes una corrida larga; la lista muestra entonces solo lo que se hizo.
- Su red se queda en este proyecto y en esta computadora. No se envía nada a ningún lugar.
