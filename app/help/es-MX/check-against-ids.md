---
title: Compruebe la exportación IFC contra el IDS de un cliente
summary: Cargue el archivo .ids que le entregó un cliente o una autoridad vial y vea en Problemas cada elemento exportado que no lo cumple.
keywords: ids, especificación de entrega de información, buildingsmart, requisitos, entrega, verificación, validación, qa, exportación ifc, ifc 4.3, alineación, vía, adquisiciones
from: 183d9a0e
---

## Qué hará

Un IDS (Especificación de entrega de información, una norma de buildingSMART) es la lista de lo que debe contener un IFC. La contratación pública a menudo envía uno con el trabajo. CivilCraft verifica el IFC que exporta este proyecto, en la versión de IFC que eligió para la exportación, contra él, y enumera cada elemento que no cumple.

## Pasos

1. Abra su proyecto.
2. Haga clic en {{ui:IFC}} en el grupo Exportar de la barra de herramientas. En el cuadro, elija la versión de IFC que entregará.
3. Haga clic en {{ui:Comprobar con IDS…}}.
4. Haga clic en {{ui:Cargar un archivo .ids…}} y elija el archivo. No se sube nada.
5. Lea el resultado: cada especificación con {{ui:Cumple}} o {{ui:Falla}} y cuántos elementos aplica.
6. Abra Problemas ({{key:Ctrl+Shift+M}}) y haga clic en una falla para seleccionar la alineación, plataforma, tubería, estructura o masa de edificio de la que proviene.

## Qué debe ver

- Una advertencia por cada elemento exportado y requisito que no cumple, con el nombre de la especificación, lo que pide el IDS y lo que tiene la exportación.
- El informe de verificación (en Problemas) empieza con el IDS: su título, versión, autor y el conteo de cada especificación.

## Bueno saber

- El IDS se guarda en el archivo del proyecto, así que se vuelve a verificar al abrir el proyecto. Cargarlo u olvidarlo es un paso que puede deshacer.
- Cada cambio se verifica de nuevo un momento después. Las superficies grandes tardan más en escribirse, así que la verificación espera un poco más entre ejecuciones.
- La verificación usa el mismo archivo que escribe la exportación {{ui:IFC}}, en la versión elegida por última vez ahí (IFC 4.3 si no eligió una).
- Los números se comparan en unidades SI: un proyecto en pies se convierte primero a metros.

- Los patrones del IDS se leen como el valor completo. Un `^` al inicio y un `$` al final también se toman como "el valor completo", como lo entienden la mayoría de los archivos IDS.

## Siguiente

- [Exporte IFC](topic:ifc)
