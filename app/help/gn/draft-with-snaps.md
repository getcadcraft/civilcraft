---
title: Borrador con snaps, esquinas elegidas y mover, copiar, girar
summary: Ubicá trazados, plataformas, parcelas y líneas de rasgo exactamente sobre puntos y esquinas que ya tenés, escribí o elegí el este y norte de una esquina, orientá una tangente hacia dos puntos, y mové, copiá o girá un objeto por una distancia o un ángulo.
keywords: snap, snaps, osnap, snap a punto, snap a esquina, PI, vértice, esquina, elegir, cruz, este, norte, coordenadas, coordenadas escritas, tangente, dirección, rumbo, mover, copiar, girar, transformar, copiar girado, duplicar, alt, punto libre, dibujo
from: 49864dda
---

Novedad en 0.9: al dibujar, el cursor cae sobre los puntos y esquinas que ya están en el plano, y una esquina de plataforma, parcela o línea de rasgo se puede escribir o elegir. Este tema recorre las tres herramientas.

## Qué vas a hacer

- Dibujar con snaps, así un trazado, plataforma, parcela o línea nueva empieza y termina exactamente sobre algo que existe.
- Fijar el este y norte de una esquina escribiéndolo o eligiendo un lugar en el plano.
- Orientar una tangente de trazado hacia dos puntos elegidos.
- Mover, copiar o girar un objeto entero.

## Pasos

1. Elegí una herramienta de dibujo, por ejemplo {{ui:Trazado}}, {{ui:Plataforma}}, {{ui:Parcela}} o {{ui:Línea de rasgo}}. Acercá el puntero a un punto de relevamiento, un PI de trazado, una esquina de plataforma, parcela o masa, un vértice de línea de rasgo o una estructura pluvial. Aparece un marcador con una etiqueta (PI, Esquina, Vértice, Estructura o Punto y su número) y el este y norte donde caerá. Hacé clic para ubicar el punto allí.
2. Para ubicar un punto libremente, mantené {{key:Alt}} mientras hacés clic. El snap se apaga.
3. Seleccioná una plataforma, parcela o línea de rasgo. En **Propiedades**, el bloque {{ui:Esquinas}} lista cada esquina con una casilla de Este y una de Norte. Escribí números nuevos, o presioná el botón de cruz junto a una esquina y hacé clic en un lugar del plano. La esquina toma ese este y norte. Presioná {{key:Esc}} para cancelar una elección. La cruz funciona solo en el plano: cerrá primero la vista 3D.
4. Para orientar una tangente, seleccioná un trazado. En **Propiedades**, bajo {{ui:Tangente desde dos puntos}}, elegí la tangente, presioná {{ui:Primer punto}} y hacé clic en el plano, presioná {{ui:Segundo punto}} y hacé clic de nuevo, luego presioná {{ui:Fijar dirección}}. La tangente gira para ir del primer punto hacia el segundo y conserva su longitud.
5. Para mover, copiar o girar, seleccioná un trazado, plataforma, parcela o línea de rasgo. En **Propiedades**, bajo {{ui:Mover, copiar y girar}}, escribí {{ui:Mover al este}} y {{ui:Mover al norte}} (los números negativos van al oeste y al sur) y presioná {{ui:Mover}} o {{ui:Copiar}}. O presioná {{ui:Distancia desde dos puntos}} y hacé clic en el punto desde donde mover y en el punto hasta donde mover.
6. Para girar, escribí el ángulo en {{ui:Girar en sentido antihorario}} (grados), luego presioná {{ui:Girar}} o {{ui:Copiar girado}}. Gira alrededor del medio de sus esquinas, salvo que elijas un punto alrededor del cual girar con la cruz junto al ángulo.

## Notas

- Una copia deja el original donde está y después queda seleccionada.
- Cada mover, copiar, girar, esquina elegida y tangente orientada es un paso de deshacer.
- Los snaps alcanzan 10 píxeles de pantalla desde el cursor. Un marcador de snap solo ofrece un lugar; no se cambia nada hasta que hacés clic.
- La misma cruz está en las filas de PI de un trazado. Ver [Trazados](topic:alignment), [Parcelas](topic:parcels) y [Líneas de rasgo](topic:feature-lines).
