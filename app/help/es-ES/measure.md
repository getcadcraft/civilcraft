---
title: Medir distancias, áreas y pendientes
summary: Mida en el plano haciendo clic en los puntos: la longitud y el rumbo de cada lado, el total acumulado, la longitud sobre el terreno, la pendiente, y el área y el perímetro de una forma cerrada; y entre dos puntos del perfil de una línea eléctrica.
keywords: medir, medición, distancia, longitud, área, perímetro, rumbo, pendiente, gradiente, regla, cinta, sobre el terreno, perfil, diferencia de altura
from: d614eb25
---

{{ui:Surface}} › {{ui:More}} › {{ui:Measure}} (también en el menú {{ui:More}} del espacio de trabajo Líneas eléctricas, o pulse {{key:M}}) mide sin añadir nada al proyecto.

## En el plano

1. Elija {{ui:Measure}} y, a continuación, haga clic en los puntos. Un clic cerca de un punto topográfico toma su posición y su cota.
2. La línea de estado indica el número de puntos y la longitud total, la longitud y el rumbo del último lado, su pendiente cuando el terreno es conocido en ambos extremos, y la longitud sobre el terreno. Junto al puntero, el lado que se está dibujando y el total acumulado.
3. Haga clic de nuevo en el primer punto para cerrar la forma: la línea de estado añade su **área** y su **perímetro**. El siguiente clic inicia una nueva medición.
4. {{key:Enter}} termina la medición y conserva sus valores en la línea de estado; {{key:Backspace}} deshace el último punto; {{key:Esc}} la borra, y {{key:Esc}} de nuevo vuelve a {{ui:Select}}.

Las longitudes están en la unidad del proyecto y las áreas en su unidad cuadrada. La pendiente y la longitud sobre el terreno usan la superficie proyectada cuando existe; si no, el terreno existente. Fuera de la superficie se omiten.

## En el perfil de una línea eléctrica

En el [perfil de la línea](topic:overhead-line#the-line-profile), {{ui:Measure}} en la barra del perfil necesita dos clics y muestra la distancia horizontal, la diferencia de altura, la distancia recta y la pendiente entre ambos puntos. Un clic cerca del terreno, del conductor o de la parte superior de un apoyo se ajusta a él. Haga clic de nuevo en {{ui:Measure}} para detener la medición.
