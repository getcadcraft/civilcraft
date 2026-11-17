---
title: Medir distancias, áreas y pendientes
summary: Mida en el plano haciendo clic en puntos: la longitud y el rumbo de cada lado, el total acumulado, la longitud a lo largo del terreno, la pendiente, y el área y el perímetro de una figura cerrada, así como la distancia entre dos puntos en el perfil de una línea de energía.
keywords: medir, medición, distancia, longitud, área, perímetro, rumbo, pendiente, gradiente, regla, cinta métrica, a lo largo del terreno, perfil, diferencia de altura
from: d614eb25
---

{{ui:Superficie}} › {{ui:Más}} › {{ui:Medir}} (también en el menú {{ui:Más}} del espacio de trabajo Líneas de energía, o pulse {{key:M}}) mide sin agregar nada al proyecto.

## En el plano

1. Elija {{ui:Medir}} y luego haga clic en los puntos. Un clic cerca de un punto topográfico toma su lugar y su elevación.
2. La barra de estado muestra el número de puntos y la longitud total, la longitud del último lado y su rumbo, su pendiente donde el terreno es conocido en ambos extremos, y la longitud a lo largo del terreno. Junto al puntero, el lado que se está dibujando y el total acumulado.
3. Haga clic de nuevo en el primer punto para cerrar la figura: la barra de estado agrega su **área** y su **perímetro**. El siguiente clic inicia una nueva medición.
4. {{key:Enter}} termina la medición y conserva sus valores en la barra de estado; {{key:Backspace}} retira el último punto; {{key:Esc}} la borra, y {{key:Esc}} de nuevo regresa a {{ui:Seleccionar}}.

Las longitudes están en la unidad del proyecto y las áreas en su unidad cuadrada. La pendiente y la longitud a lo largo del terreno usan la superficie proyectada cuando existe; si no, usan el terreno existente. Fuera de la superficie, se omiten.

## En el perfil de una línea de energía

En el [perfil de la línea](topic:overhead-line#the-line-profile), {{ui:Medir}} en la barra del perfil requiere dos clics y muestra la distancia horizontal, la diferencia de altura, la distancia recta y la pendiente entre ellos. Un clic cerca del terreno, del conductor o de la parte superior de un soporte se ajusta a ese punto. Haga clic de nuevo en {{ui:Medir}} para detenerse.
