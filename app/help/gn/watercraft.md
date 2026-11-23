---
title: WaterCraft: demandas, caudal de incendio, cortes y edad del agua
summary: Con el complemento WaterCraft, convertí los clientes en demandas sobre tus cañerías de agua, verificá el caudal disponible en cada hidrante, mirá qué corte de cañería perjudica más, y seguí la edad del agua y el cloro a lo largo de un día.
keywords: watercraft, distribución de agua, demandas, clientes, factor de punta, patrón de demanda, caudal de incendio, hidrante, presión residual, criticidad, corte, tramo con válvula, edad del agua, cloro, residual, rastreo de fuente, extremo ciego, csv, complemento
from: 066fb17a
---

WaterCraft es un complemento que trabaja sobre la red de agua que ya dibujaste con las herramientas de Cañerías de agua. Agrega una pestaña al panel derecho con cuatro secciones.

:::warning
Es solo una ayuda de cálculo. Se verificó contra respuestas hechas a mano en redes inventadas, no en un modelo de una empresa real. Un ingeniero de aguas debe verificar cada resultado. Los escenarios, las reglas de control, las válvulas y las lecturas de campo tienen sus propios temas, "Escenarios" y "Estudios", en la ayuda del complemento WaterCraft.
:::

## Lo que vas a hacer

- Poner clientes en la red como demandas.
- Encontrar los hidrantes que no llegan al caudal que necesitás.
- Encontrar las cañerías cuya pérdida importa más.
- Encontrar agua vieja y cloro bajo.

## Pasos

1. Abrí {{ui:Configuración}} › {{ui:Complementos}} y activá {{ui:WaterCraft (distribución de agua)}}. Aparece una pestaña {{ui:WaterCraft}} en el panel derecho.
2. Primero dibujá un depósito, nudos y cañerías con las herramientas de Cañerías de agua (mirá [Cañerías de agua](topic:water-mains)). Sin red, la pestaña te lo indica.
3. Bajo {{ui:Demandas}}, pegá un cliente por línea: id, x, y, tipo, cantidad. Elegí el {{ui:Factor de punta}} y el {{ui:Patrón horario}} (día residencial, día comercial, plano, o mantener el patrón tal como está). Presioná {{ui:Revisar}} para ver dónde cae cada cliente (el nudo más cercano), luego {{ui:Colocar en la red}}. Deshacer quita las demandas otra vez.
4. Bajo {{ui:Caudal de incendio}}, fijá el caudal necesario y la presión residual, elegí si la presión residual se mantiene {{ui:Solo en el hidrante}} o {{ui:En todo el sistema (más estricto)}}, y presioná {{ui:Recorrido}}. Cada hidrante aparece listado del peor al mejor, como cumple o insuficiente.
5. Bajo {{ui:Cuál caño importa más}}, elegí {{ui:un caño por vez}} o {{ui:un tramo con válvula por vez}} y presioná {{ui:Recorrido}}. Cada corte muestra la demanda aislada, los nudos aislados, los nudos que quedan recién por debajo de la presión mínima y la presión más baja que queda.
6. Bajo {{ui:Edad del agua y cloro}}, elegí qué seguir (edad del agua, cloro o un rastreo de fuente), fijá las horas a correr y los límites que quieras, y presioná {{ui:Recorrido}}. Se listan los nudos fuera de tus límites.
7. Presioná {{ui:Guardar como CSV}} debajo de cualquier tabla para conservarla.

## Notas

- El caudal de incendio necesario y el consumo por vivienda o por hectárea son valores de partida, no normas. Usá las cifras propias de tu empresa de agua.
- Una cañería cortada en parte por una válvula se cierra completa, de modo que el corte mostrado es algo peor que uno real.
- Corré la sección de calidad de agua el tiempo suficiente para que el patrón diario se repita antes de leer el último día.
- {{ui:Detener}} termina una corrida larga antes; la lista muestra entonces solo lo que se hizo.
- Tu red se queda en este proyecto y en esta computadora. No se envía nada a ningún lado.
