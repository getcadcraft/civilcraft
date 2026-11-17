---
title: Objetos a partir de líneas, con vínculo
summary: Cree pavimento, una zona plantada, un parterre, un seto, un sendero, un muro, un bordillo, escalones, una rampa, una plataforma, una vaguada o una línea de elementos a partir de una línea; se mueve cuando la línea se mueve, hasta que rompa el vínculo.
keywords: desde una línea, geometría lineal, DWG, DXF, vínculo, vinculado, seguir, regenerar, romper vínculo, línea de elementos, línea de elementos desde geometría lineal, capa importada, contorno, supercad studio, línea de dibujo
from: eb67a0c6
---

{{ui:From a line}} (Paisajismo › {{ui:More}}): haga clic en una línea de elementos, o en una línea o contorno de una capa importada de DWG/DXF. Una línea cerrada puede crear pavimento, un césped, un parterre plantado, una pradera, cubresuelos, un parterre o una plataforma; una línea abierta, un sendero, un muro, un bordillo, escalones (su primer y último punto), una rampa, un seto o una vaguada. Cualquiera de los dos tipos puede crear una **línea de elementos**, salvo una línea de elementos en sí misma.

## Una línea de elementos a partir de una línea

Una línea de elementos creada a partir de una línea toma sus puntos, cerrados si la línea estaba cerrada. Sus cotas se sitúan sobre el terreno existente (0 si todavía no hay ninguno), y su uso es **Desactivado**: no modela ningún terreno hasta que elija un uso y defina sus cotas en sus Propiedades. Cuando la línea se mueve, una línea de elementos con el mismo número de puntos conserva cada cota que haya definido; cuando la línea gana o pierde puntos, las cotas se vuelven a situar sobre el terreno. Vea [Líneas de elementos](topic:feature-lines).

El nuevo objeto conserva un **vínculo** con su línea. Cuando la línea se mueve (al arrastrar sus puntos, o al mover o volver a leer el dibujo), el objeto adopta la nueva forma en el mismo paso de deshacer, y a través de los modificadores de terreno, el terreno proyectado la sigue. Propiedades indica a qué está vinculado; {{ui:Break link}} lo deja libre.

Las líneas se comprueban primero: una línea necesita al menos 2 puntos (3 para un contorno), como máximo 5000, y números reales; un contorno debe estar cerrado y no cruzarse. Una línea que no cumple no se usa: el objeto permanece como estaba y el panel Problemas indica por qué. Si se borra la línea, el objeto permanece y el panel Problemas lo anota.

## En SuperCad Studio

Abra el emplazamiento y el dibujo 2D en el mismo proyecto. Elija una línea o polilínea del dibujo 2D, pulse Ctrl+K y ejecute {{ui:Landscape object from the picked drawing line}}: CivilCraft pregunta qué crear, como arriba, y el objeto queda vinculado a esa línea del dibujo. Después de cambiar líneas en el dibujo, Ctrl+K {{ui:Update the landscape from the drawing}} hace que los objetos las sigan, con un paso de deshacer por cada línea. El archivo de vínculos del proyecto registra qué objeto sigue a qué línea. La ayuda de SuperCad Studio tiene un tema sobre Paisajismo.
