---
title: Medir distancias, superficies y pendientes
summary: Medí en el plano haciendo clic en puntos: la longitud y el rumbo de cada lado, el total acumulado, la longitud sobre el terreno, la pendiente, y la superficie y el perímetro de una forma cerrada; y entre dos puntos del perfil de una línea eléctrica.
keywords: medir, medición, distancia, longitud, superficie, perímetro, rumbo, pendiente, declive, regla, cinta, sobre el terreno, perfil, diferencia de altura
from: d614eb25
---

{{ui:Superficie}} › {{ui:Más}} › {{ui:Medir}} (también en el menú {{ui:Más}} del espacio de trabajo Líneas eléctricas, o presione {{key:M}}) mide sin agregar nada al proyecto.

## En el plano

1. Seleccione {{ui:Medir}} y luego haga clic en los puntos. Un clic cerca de un punto de relevamiento toma su lugar y su cota.
2. La línea de estado muestra la cantidad de puntos y la longitud total, la longitud y el rumbo del último lado, su pendiente cuando el terreno es conocido en ambos extremos, y la longitud sobre el terreno. Junto al puntero se ven el lado que se está dibujando y el total acumulado.
3. Haga clic otra vez en el primer punto para cerrar la forma: la línea de estado agrega su **superficie** y su **perímetro**. El siguiente clic inicia una nueva medición.
4. {{key:Enter}} termina la medición y conserva sus valores en la línea de estado; {{key:Backspace}} quita el último punto; {{key:Esc}} la borra, y {{key:Esc}} otra vez vuelve a {{ui:Seleccionar}}.

Las longitudes están en la unidad del proyecto y las superficies en su unidad cuadrada. La pendiente y la longitud sobre el terreno usan la superficie proyectada cuando existe, y si no, el terreno existente; fuera de la superficie se omiten.

## En el perfil de una línea eléctrica

En el [perfil de la línea](topic:overhead-line#the-line-profile), {{ui:Medir}} en la barra del perfil pide dos clics y muestra la distancia entre ellos, la diferencia de altura, la distancia recta y la pendiente. Un clic cerca del terreno, del conductor o de la parte superior de un soporte se ajusta a ese punto. Haga clic otra vez en {{ui:Medir}} para terminar.
