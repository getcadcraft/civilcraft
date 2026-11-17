---
title: Dibujo con forzcursor, esquinas elegidas y mover, copiar y girar
summary: Coloque alineaciones, plataformas, parcelas y líneas características exactamente sobre puntos y esquinas que ya tiene, escriba o elija la coordenada este y norte de una esquina, gire una tangente hacia dos puntos, y mueva, copie o gire un objeto por una distancia o un ángulo.
keywords: forzcursor, referencia a objetos, osnap, referencia a punto, referencia a esquina, PI, vértice, esquina, elegir, cruceta, este, norte, coordenadas, coordenadas escritas, tangente, dirección, rumbo, mover, copiar, girar, transformar, copia girada, duplicar, alt, punto libre, dibujo
from: 49864dda
---

Nuevo en 0.9: al dibujar, el cursor cae en los puntos y esquinas que ya están en el plano, y la esquina de una plataforma, parcela o línea característica puede escribirse o elegirse. Este tema recorre las tres herramientas.

## Lo que hará

- Dibujar con forzcursor, para que una alineación, plataforma, parcela o línea nueva empiece y termine exactamente en algo que ya existe.
- Fijar la coordenada este y norte de una esquina escribiéndola o eligiendo un lugar en el plano.
- Girar una tangente de alineación hacia dos puntos elegidos.
- Mover, copiar o girar un objeto completo.

## Pasos

1. Elija una herramienta de dibujo, por ejemplo {{ui:Alineación}}, {{ui:Plataforma}}, {{ui:Parcela}} o {{ui:Línea característica}}. Mueva el cursor cerca de un punto topográfico, un PI de alineación, una plataforma, una parcela o una esquina de masa, un vértice de línea característica o una estructura pluvial. Aparece una marca con una etiqueta (PI, Esquina, Vértice, Estructura o Punto y su número) y la coordenada este y norte donde caerá. Haga clic para colocar el punto ahí.
2. Para colocar un punto libremente, mantenga pulsado {{key:Alt}} mientras hace clic. El forzcursor se desactiva.
3. Seleccione una plataforma, parcela o línea característica. En Propiedades, el bloque {{ui:Esquinas}} enumera cada esquina con un cuadro Este y un cuadro Norte. Escriba números nuevos, o pulse el botón de cruceta junto a una esquina y haga clic en un lugar del plano. La esquina toma ese este y norte. Pulse {{key:Esc}} para cancelar una elección. La cruceta funciona solo en el plano: cierre primero la vista 3D.
4. Para girar una tangente, seleccione una alineación. En Propiedades, bajo {{ui:Tangente desde dos puntos}}, elija la tangente, pulse {{ui:Primer punto}} y haga clic en el plano, pulse {{ui:Segundo punto}} y haga clic de nuevo, y luego pulse {{ui:Asignar dirección}}. La tangente gira para ir desde el primer punto hacia el segundo y conserva su longitud.
5. Para mover, copiar o girar, seleccione una alineación, plataforma, parcela o línea característica. En Propiedades, bajo {{ui:Desplazar, copiar y girar}}, escriba {{ui:Desplazar al este}} y {{ui:Desplazar al norte}} (los números negativos van al oeste y al sur) y pulse {{ui:Desplazar}} o {{ui:Copiar}}. O pulse {{ui:Distancia desde dos puntos}} y haga clic en el punto desde el que se mueve y en el punto al que se mueve.
6. Para girar, escriba el ángulo en {{ui:Girar en sentido antihorario}} (grados), y luego pulse {{ui:Girar}} o {{ui:Copiar girado}}. Gira alrededor del centro de sus esquinas, a menos que elija con la cruceta junto al ángulo un punto alrededor del cual girar.

## Notas

- Una copia deja el original donde está y queda seleccionada después.
- Cada desplazamiento, copia, giro, esquina elegida y tangente girada es un paso de deshacer.
- El forzcursor alcanza 10 píxeles de pantalla desde el cursor. Una marca de forzcursor solo ofrece un lugar; nada cambia hasta que haga clic.
- La misma cruceta está en las filas de PI de una alineación. Vea [Alineaciones](topic:alignment), [Parcelas](topic:parcels) y [Líneas características](topic:feature-lines).
