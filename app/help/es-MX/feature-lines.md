---
title: Líneas características
summary: Dibuje líneas 3D que nivele vértice por vértice, haga desfases escalonados de ellas, y úselas como líneas de ruptura del terreno o como plataformas con pendiente en el diseño.
keywords: arco, curva, radio, arco 3D, hélice, guarnición curva, superposición de pendiente, superposición de elevación, flechas de pendiente, línea característica, pendiente, elevación, desfase escalonado, desfase, línea de ruptura, guarnición, cuneta, berma, plataforma con pendiente, liga, nivelación, polilínea 3D
from: d55b25fb
---

Una línea característica es una línea con una elevación en cada vértice: una guarnición, la línea de flujo de una cuneta, la cresta de una berma, el borde de una plataforma con pendiente. Usted fija sus elevaciones por número o por pendiente, la copia hacia un lado con un escalón hacia arriba o hacia abajo, y elige qué hacen las superficies con ella.

## Dibujar una

1. Elija **Superficie** › {{ui:Más}} › {{ui:Línea característica}}, o pulse {{key:L}}.
2. Haga clic en sus vértices en la planta. Un clic en un punto topográfico toma el lugar y la elevación del punto; en cualquier otro lugar, el vértice toma la elevación del terreno existente en ese punto.
3. Pulse {{key:Enter}} para terminar una línea abierta, o haga clic de nuevo en el primer vértice para cerrarla.

La nueva línea queda seleccionada y comienza como línea de ruptura del terreno existente, apoyada sobre el terreno.

## Arcos

Un segmento puede ser un arco en planta cuyos extremos están a elevaciones distintas: un retorno de guarnición, una cuneta curva, una rampa que gira. Su pendiente corre uniformemente a lo largo del arco, y su longitud se mide sobre la curva.

- **Mientras dibuja:** pulse {{key:C}} (en una pantalla táctil, {{ui:Arco}} en la barra sobre la planta) para activar los arcos. Después de un vértice, haga clic en un punto de la curva y luego en donde termina el arco. Pulse {{key:C}} de nuevo para segmentos rectos. {{key:Backspace}} elimina primero el punto de la curva.
- **Después:** en **Propiedades**, escriba un radio y el sentido de giro en el cuadro **Arco** del vértice, por ejemplo `50 L` o `50 R` (izquierda o derecha al recorrer la línea), y pulse {{key:Enter}}. Vacíe el cuadro para que el segmento vuelva a ser recto. Un radio menor que la mitad del segmento se rechaza.

La línea seleccionada muestra el radio de cada arco junto a su pendiente. **Longitud** es a lo largo de los arcos en planta; **Longitud 3D** también cuenta el ascenso y el descenso. Los desfases escalonados conservan los arcos: un arco en el lado exterior de una curva crece, uno en el interior se reduce, y un desfase más allá del centro de un arco se rechaza.

Las superficies, la vista 3D, DXF y DWG toman cada arco como trozos rectos cortos que quedan a menos de 0.01 de la curva. LandXML los conserva como arcos (vea **Arcos en otros archivos** más abajo).

## Fijar elevaciones y pendientes

**Propiedades** lista los vértices con su distancia a lo largo de la línea, su **Elevación** y la **Pendiente al siguiente** (en porcentaje). Escriba cualquiera de los dos y pulse {{key:Enter}}:

- Una elevación mueve solo ese vértice.
- Una pendiente fija la elevación en el extremo lejano de su segmento; los vértices posteriores se quedan donde están, así que cambia la pendiente del siguiente segmento.

También en **Propiedades**:

| Acción | Qué hace |
|---|---|
| **Subir o bajar todos en** | Suma la altura que escriba a cada vértice. |
| {{ui:Elevaciones del terreno}} | Vuelve a poner cada vértice sobre el terreno existente (los vértices fuera de la superficie conservan la suya, y se listan). |
| {{ui:Una sola pendiente, del primero al último}} | Conserva la primera y la última elevación y pone los vértices intermedios en una pendiente uniforme. |

La línea seleccionada muestra sus elevaciones en los vértices y sus pendientes a lo largo de los segmentos en la planta. Arrastre un vértice con {{ui:Seleccionar}} para moverlo; su elevación se mantiene.

## Desfases escalonados

En **Desfase escalonado**, escriba una **Distancia** (positiva a la derecha de la dirección de la línea, negativa a la izquierda), luego una altura (subir o bajar en) o una pendiente en porcentaje, y haga clic en {{ui:Crear la línea desfasada}}. La copia es una nueva línea característica: por ejemplo, el respaldo de una guarnición a 0.5 ft al costado y 0.5 ft más alta, o el borde de una cuneta a 6 ft hacia afuera con 2 %. Una distancia que haría que la copia se doble sobre sí misma en una curva cerrada se rechaza.

## Pendientes y elevaciones en la pantalla

Pulse {{key:E}}, o marque **Pendientes y elevaciones en líneas características** en **Visualización**, para ver la pendiente de cada línea característica a lo largo de cada segmento (con una pequeña flecha que apunta cuesta abajo) y su elevación en los vértices. Se muestran solo en pantalla: no se agrega nada al dibujo, y el PDF, DXF y DWG quedan como están. Los segmentos cortos y los vértices juntos no se etiquetan hasta que acerque el zoom. La línea seleccionada siempre muestra sus propias pendientes y elevaciones.

## En la vista de perfil

Una línea característica que cruza una alineación se muestra en la vista de perfil de esa alineación, con su nombre y su elevación en el cruce; también pueden mostrarse las líneas que corren junto a ella. Vea [Diseñar un perfil longitudinal](topic:profile).

## Lo que hacen las superficies con ella

Elija **Uso**:

| Uso | Qué pasa |
|---|---|
| Línea de ruptura del terreno existente | El terreno existente pasa por la línea a sus elevaciones, como una línea de ruptura dibujada. |
| Nivelada en el diseño | Una línea **cerrada** se convierte en una plataforma con pendiente: la superficie propuesta dentro de ella se nivela hasta su borde. Active **Liga al terreno** para trazar taludes de corte y terraplén (horizontal a 1 vertical) desde su borde hasta el terreno, como lo hace una plataforma; cada talud comienza en la elevación propia del borde en ese punto. |
| Solo dibujada | Permanece en la planta y sale en DXF, DWG y PDF (capa C-GRAD-FEAT, polilíneas 3D), pero las superficies la ignoran. |

Los volúmenes, las secciones y la vista 3D incluyen las líneas características niveladas en el diseño, como las plataformas. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## Compartir líneas con su equipo

En un dibujo abierto desde sus archivos en la nube de CadCraft Studio, en un plan de equipo, las **Propiedades** del proyecto (sin nada seleccionado) tienen una sección **Equipo** con {{ui:Líneas del equipo…}}: las líneas que su equipo ha compartido, cada una con su revisión, sin tener que seleccionar primero una línea característica. Seleccione una línea para compartirla, subir una nueva revisión, bajar la del equipo o dejar de compartirla. Fuera de esa configuración, la sección indica lo que necesita.

## Arcos en otros archivos

| Archivo | Qué pasa con una línea característica con arcos |
|---|---|
| Proyecto de CivilCraft | Se conserva exactamente. |
| LandXML | Se escribe como una característica de planta de líneas y arcos con sus elevaciones, y se lee de vuelta con sus arcos. Una línea característica de otro programa llega como **Solo dibujada**: elija su **Uso** para ponerla en una superficie. |
| DWG y DXF | Una polilínea 3D no puede contener un arco, así que la línea se escribe como trozos cortos a menos de 0.01 de cada arco. CivilCraft también anota en el dibujo qué trozos eran arcos: al abrir el dibujo como trazos de líneas, {{ui:Líneas características}} devuelve las líneas como líneas características con sus arcos. Otros programas ven una polilínea 3D común. |
