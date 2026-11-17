---
title: Dibujar con ajustes, esquinas elegidas y mover, copiar, girar
summary: Coloque alineaciones, plataformas, parcelas y líneas características exactamente sobre puntos y esquinas que ya tiene, escriba o elija la coordenada este y norte de una esquina, oriente una tangente hacia dos puntos, y mueva, copie o gire un objeto por una distancia o un ángulo.
keywords: ajuste, ajustes, osnap, ajustar a punto, ajustar a esquina, PI, vértice, esquina, elegir, retícula, este, norte, coordenadas, coordenadas escritas, tangente, dirección, rumbo, mover, copiar, girar, transformar, copia girada, duplicar, alt, punto libre, dibujo
from: 49864dda
---

Novedad en la 0.9: al dibujar, el cursor se posa en los puntos y las esquinas que ya están en el plano, y una esquina de plataforma, parcela o línea característica puede escribirse o elegirse. Este tema recorre las tres herramientas.

## Qué va a hacer

- Dibujar con ajustes, de modo que una alineación, plataforma, parcela o línea nueva empiece y acabe exactamente sobre algo que ya existe.
- Fijar la coordenada este y norte de una esquina escribiéndola o eligiendo un lugar en el plano.
- Orientar una tangente de alineación hacia dos puntos elegidos.
- Mover, copiar o girar un objeto completo.

## Pasos

1. Elija una herramienta de dibujo, por ejemplo {{ui:Alineación}}, {{ui:Plataforma}}, {{ui:Parcela}} o {{ui:Línea característica}}. Acerque el puntero a un punto topográfico, a un PI de alineación, a una esquina de plataforma, parcela o masa, a un vértice de línea característica o a una estructura de pluviales. Aparece un marcador con una etiqueta (PI, Esquina, Vértice, Estructura o Punto y su número) y la coordenada este y norte donde caerá. Haga clic para colocar el punto allí.
2. Para colocar un punto libremente, mantenga pulsado {{key:Alt}} mientras hace clic. El ajuste se desactiva.
3. Seleccione una plataforma, parcela o línea característica. En **Propiedades**, el bloque {{ui:Esquinas}} lista cada esquina con un cuadro Este y un cuadro Norte. Escriba nuevos números, o pulse el botón de retícula junto a una esquina y haga clic en un lugar del plano. La esquina toma esa coordenada este y norte. Pulse {{key:Esc}} para cancelar una elección. La retícula solo funciona en el plano: cierre primero la vista 3D.
4. Para girar una tangente, seleccione una alineación. En **Propiedades**, bajo {{ui:Tangente desde dos puntos}}, elija la tangente, pulse {{ui:Primer punto}} y haga clic en el plano, pulse {{ui:Segundo punto}} y haga clic de nuevo, y después pulse {{ui:Fijar dirección}}. La tangente gira para ir desde el primer punto hacia el segundo, y conserva su longitud.
5. Para mover, copiar o girar, seleccione una alineación, plataforma, parcela o línea característica. En **Propiedades**, bajo {{ui:Mover, copiar y girar}}, escriba {{ui:Mover al este}} y {{ui:Mover al norte}} (los números negativos van al oeste y al sur) y pulse {{ui:Desplazar}} o {{ui:Copiar}}. O pulse {{ui:Distancia entre dos puntos}} y haga clic en el punto desde el que mover y en el punto hasta el que mover.
6. Para girar, escriba el ángulo en {{ui:Girar en sentido antihorario}} (grados), y pulse {{ui:Girar}} o {{ui:Copiar girado}}. Gira alrededor del centro de sus esquinas, salvo que elija un punto de giro con la retícula junto al ángulo.

## Notas

- Una copia deja el original donde está y queda seleccionada después.
- Cada desplazamiento, copia, giro, esquina elegida y tangente girada es un paso de deshacer.
- Los ajustes alcanzan 10 píxeles de pantalla desde el cursor. Un marcador de ajuste solo ofrece un lugar; no cambia nada hasta que haga clic.
- La misma retícula aparece en las filas de PI de una alineación. Véase [Alineaciones](topic:alignment), [Parcelas](topic:parcels) y [Líneas características](topic:feature-lines).
