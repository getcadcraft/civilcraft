---
title: Objetos desde geometría lineal, con vínculo
summary: Cree pavimento, una zona plantada, un arriate, un seto, un sendero, un muro, una guarnición, escalones, una rampa, una plataforma, una cuneta o una línea de elemento a partir de una línea; el objeto se mueve cuando la línea se mueve, hasta que rompa el vínculo.
keywords: desde una línea, geometría lineal, DWG, DXF, vínculo, vinculado, seguir, regenerar, romper vínculo, línea de elemento, línea de elemento desde geometría lineal, capa importada, contorno, supercad studio, línea de dibujo
from: eb67a0c6
---

{{ui:Desde una línea}} (Paisaje › {{ui:Más}}): haga clic en una línea de elemento, o en una línea o contorno de una capa DWG/DXF importada. Una línea cerrada puede crear pavimento, un césped, un arriate plantado, una pradera, un cubresuelo, un arriate o una plataforma; una línea abierta, un sendero, un muro, una guarnición, escalones (su primer y último punto), una rampa, un seto o una cuneta. Cualquiera de los dos tipos puede crear una **línea de elemento**, excepto una línea de elemento en sí.

## Una línea de elemento desde una línea

Una línea de elemento creada desde una línea toma sus puntos, y queda cerrada si la línea era cerrada. Sus niveles se colocan sobre el terreno existente (0 si todavía no hay terreno), y su uso es **Desactivado**: no modifica el terreno hasta que elija un uso y defina sus niveles en sus Propiedades. Cuando la línea se mueve, una línea de elemento con el mismo número de puntos conserva cada nivel que definió; cuando la línea gana o pierde puntos, los niveles se vuelven a colocar sobre el terreno. Vea [Líneas de elemento](topic:feature-lines).

El objeto nuevo conserva un **vínculo** con su línea. Cuando la línea se mueve (usted arrastra sus puntos, o el dibujo se mueve o se vuelve a leer), el objeto toma la nueva forma en el mismo paso de deshacer, y mediante los modificadores de terreno, el terreno proyectado lo sigue. Propiedades indica a qué está vinculado; {{ui:Romper enlace}} lo libera.

Primero se verifican las líneas: una línea necesita al menos 2 puntos (3 para un contorno), como máximo 5000, y números reales; un contorno debe estar cerrado y no cruzarse a sí mismo. Una línea que falla no se usa: el objeto se queda como estaba y el panel Problemas indica por qué. Si se borra la línea, el objeto permanece y el panel Problemas lo señala.

## En SuperCad Studio

Abra el sitio y el dibujo 2D en el mismo proyecto. Elija una línea o polilínea en el dibujo 2D, pulse Ctrl+K y ejecute {{ui:Objeto de paisaje desde la línea del dibujo seleccionada}}: CivilCraft pregunta qué crear, como arriba, y el objeto queda vinculado a esa línea del dibujo. Después de cambiar líneas en el dibujo, Ctrl+K {{ui:Actualizar el paisaje desde el dibujo}} hace que los objetos sigan los cambios, con un paso de deshacer por cada línea. El archivo de vínculos del proyecto registra qué objeto sigue a qué línea. La ayuda de SuperCad Studio tiene un tema de Paisaje.
