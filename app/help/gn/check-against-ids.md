---
title: Verificar la exportación IFC contra el IDS de un cliente
summary: Cargá el archivo .ids que te dio un cliente o una autoridad vial y mirá en Problemas cada elemento exportado que no lo cumple.
keywords: ids, especificación de entrega de información, buildingsmart, requisitos, entrega, verificación, validación, qa, exportación ifc, ifc 4.3, trazado, vial, licitación
from: 183d9a0e
---

## Lo que vas a hacer

Un IDS (Especificación de Entrega de Información, un estándar de buildingSMART) es la lista de lo que tiene que contener un IFC. La contratación pública suele enviar uno con la obra. CivilCraft verifica el IFC que exporta este proyecto, en la versión IFC que elegiste para la exportación, contra él, y lista cada elemento que no llega.

## Pasos

1. Abrí tu proyecto.
2. Hacé clic en {{ui:IFC}} en el grupo Exportar de la barra de herramientas. En el diálogo, elegí la versión IFC que vas a entregar.
3. Hacé clic en {{ui:Verificar con IDS…}}.
4. Hacé clic en {{ui:Cargar un archivo .ids…}} y elegí el archivo. Nada se sube.
5. Leé el resultado: cada especificación con {{ui:Cumple}} o {{ui:Falla}} y cuántos elementos alcanza.
6. Abrí Problemas ({{key:Ctrl+Shift+M}}) y hacé clic en una falla para seleccionar el trazado, la plataforma, el caño, la estructura o el volumen de edificio de donde viene.

## Lo que deberías ver

- Una advertencia por cada elemento exportado y requisito que no cumple, con el nombre de la especificación, lo que pide el IDS y lo que tiene la exportación.
- El informe de verificación (en Problemas) empieza con el IDS: su título, versión, autor y los conteos de cada especificación.

## Para tener en cuenta

- El IDS se guarda en el archivo del proyecto, así que se verifica de nuevo cuando abrís el proyecto. Cargarlo u olvidarlo es un paso que podés deshacer.
- Cada cambio se verifica de nuevo un momento después. Las superficies grandes tardan más en escribirse, así que la verificación espera un poco más entre pasadas.
- La verificación usa el mismo archivo que escribe la exportación {{ui:IFC}}, en la última versión elegida allí (IFC 4.3 si no elegiste una).
- Los números se comparan en unidades SI: un proyecto en pies se convierte primero a metros.

- Los patrones del IDS se leen como valor completo. Un `^` al inicio y un `$` al final también se toman como "el valor completo", como lo entiende la mayoría de los archivos IDS.

## Siguiente

- [Exportar IFC](topic:ifc)
