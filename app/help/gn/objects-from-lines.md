---
title: Objetos a partir de líneas, con vínculo
summary: Cree pavimento, un área plantada, un cantero, un seto, un sendero, un muro, un cordón, escalones, una rampa, una plataforma, una cuneta o una línea característica a partir de una línea; sigue a la línea cuando esta se mueve, hasta que usted rompa el vínculo.
keywords: desde una línea, líneas de dibujo, DWG, DXF, vínculo, vinculado, seguir, regenerar, romper vínculo, línea característica, línea característica desde dibujo, capa importada, contorno, línea de dibujo, supercad studio
from: eb67a0c6
---

{{ui:Línea-gui}} (Paisajismo › {{ui:Más}}): haga clic en una línea característica, o en una línea o contorno de una capa DWG/DXF importada. Una línea cerrada puede crear pavimento, un césped, un cantero plantado, un prado, cubresuelo, un cantero o una plataforma; una línea abierta, un sendero, un muro, un cordón, escalones (su primer y último punto), una rampa, un seto o una cuneta. Cualquiera de los dos tipos puede crear una **línea característica**, excepto una línea característica en sí misma.

## Una línea característica a partir de una línea

Una línea característica creada desde una línea toma sus puntos, y queda cerrada si la línea era cerrada. Sus niveles se fijan sobre el terreno existente (0 si todavía no hay terreno), y su uso es **Apagado**: no moldea el terreno hasta que usted elija un uso y fije sus niveles en sus Propiedades. Cuando la línea se mueve, una línea característica con la misma cantidad de puntos conserva cada nivel que usted fijó; cuando la línea gana o pierde puntos, los niveles se vuelven a fijar sobre el terreno. Vea [Líneas características](topic:feature-lines).

El objeto nuevo conserva un **vínculo** con su línea. Cuando la línea se mueve (usted arrastra sus puntos, o se mueve o se vuelve a leer el dibujo), el objeto toma la nueva forma en el mismo paso de deshacer, y a través de los modificadores de terreno, el terreno proyectado la sigue. Propiedades indica a qué está vinculado; {{ui:Eipe’a vínculo}} lo deja libre.

Primero se verifican las líneas: una línea necesita al menos 2 puntos (3 para un contorno), como máximo 5000, y números reales; un contorno debe estar cerrado y no cruzarse. Una línea que no cumple no se usa: el objeto queda como estaba y el panel de Problemas indica por qué. Si se elimina la línea, el objeto queda y el panel de Problemas lo anota.

## En SuperCad Studio

Abra el sitio y el dibujo 2D en el mismo proyecto. Elija una línea o polilínea del dibujo 2D, presione Ctrl+K y ejecute {{ui:Objeto de paisajismo desde la línea elegida del dibujo}}: CivilCraft pregunta qué crear, como arriba, y el objeto queda vinculado a esa línea del dibujo. Después de cambiar líneas en el dibujo, Ctrl+K {{ui:Actualizar el paisajismo desde el dibujo}} hace que los objetos las sigan, con un paso de deshacer por cada línea. El archivo de vínculos del proyecto registra qué objeto sigue a qué línea. La ayuda propia de SuperCad Studio tiene un tema de Paisajismo.
