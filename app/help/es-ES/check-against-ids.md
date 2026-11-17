---
title: Comprobar la exportación IFC con el IDS de un cliente
summary: Cargue el archivo .ids que le entregó un cliente o una autoridad viaria y vea en Problemas cada elemento exportado que no lo cumpla.
keywords: ids, especificación de entrega de información, buildingsmart, requisitos, entrega, comprobación, validación, qa, exportación ifc, ifc 4.3, alineación, carretera, contratación pública
from: 183d9a0e
---

## Lo que hará

Un IDS (Information Delivery Specification, una norma de buildingSMART) es la lista de lo que debe contener un IFC. La contratación pública a menudo envía una con la obra. CivilCraft comprueba el IFC que exporta este proyecto, en la versión IFC que eligió para la exportación, frente a ella, y enumera cada elemento que no llega.

## Pasos

1. Abra su proyecto.
2. Haga clic en {{ui:IFC}} en el grupo Exportar de la barra de herramientas. En el diálogo, elija la versión IFC que va a entregar.
3. Haga clic en {{ui:Comprobar con IDS…}}.
4. Haga clic en {{ui:Cargar un archivo .ids…}} y elija el archivo. No se sube nada.
5. Lea el resultado: cada especificación con {{ui:Cumple}} o {{ui:Falla}} y cuántos elementos afecta.
6. Abra Problemas ({{key:Ctrl+Shift+M}}) y haga clic en un fallo para seleccionar la alineación, plataforma, tubería, estructura o masa de edificación de la que procede.

## Lo que debe ver

- Una advertencia por cada elemento exportado y requisito que no cumpla, con el nombre de la especificación, lo que pide el IDS y lo que tiene la exportación.
- El informe de comprobación (en Problemas) empieza por el IDS: su título, su versión, su autor y los recuentos de cada especificación.

## Conviene saber

- El IDS se guarda en el archivo del proyecto, así que se vuelve a comprobar al abrirlo. Cargarlo u olvidarlo es un paso que puede deshacer.
- Cada cambio se vuelve a comprobar un momento después. Las superficies grandes tardan más en escribirse, así que la comprobación espera un poco más entre pasadas.
- La comprobación usa el mismo archivo que escribe la exportación {{ui:IFC}}, en la versión elegida por última vez allí (IFC 4.3 si no ha elegido ninguna).
- Los números se comparan en unidades SI: un proyecto en pies se convierte primero a metros.

- Los patrones del IDS se leen como valor completo. Un `^` al inicio y un `$` al final también se toman como «valor completo», como lo entienden la mayoría de los archivos IDS.

## Siguiente

- [Exportar IFC](topic:ifc)
