---
title: Organizar su propio diseño y guardar sus configuraciones
summary: Elija qué panel muestra el explorador del proyecto, Propiedades o el contenido propio del panel, dónde va la caja de herramientas y qué llevan las barras, guárdelo como su propio diseño, y guarde configuraciones completas con un nombre para cambiar entre ellas.
keywords: diseño, espacio de trabajo, organizar, personalizar, mi diseño, diseño propio, paneles, editores, explorador del proyecto, propiedades, caja de herramientas, barra rápida, cuadro de información, entorno de trabajo, configuración, perfil, guardar configuración, cambiar de configuración, exportar configuración, importar configuración, ccenv
from: 2a71af43
---

Además de los tres diseños incluidos, puede organizar uno propio y guardar toda su configuración con un nombre para volver a ella en un solo paso.

## Organizar su propio diseño

1. Abra {{ui:Configuración}} (el engrane, o {{key:Mod+,}}), elija {{ui:Global}} y luego {{ui:Diseño}}.
2. Elija {{ui:Organizar su propio diseño…}}. El cuadro parte del diseño que usa ahora.
3. Dele un nombre y elija:
   - **Sobre el dibujo:** la barra de herramientas de la aplicación, una cinta o ninguna; una barra de título; un cuadro de información y qué controles lleva.
   - **Junto al dibujo:** la caja de herramientas a la izquierda, a la derecha o sin ella, con o sin {{ui:Mis herramientas}}; qué panel lleva las paletas, cuál va arriba (el explorador del proyecto o Propiedades, por ejemplo) y cuáles son pestañas debajo.
   - **El área de dibujo:** pestañas de vista, una barra rápida y una barra de vista con los controles que marque, la paleta de edición, una barra de estado.
   - **Aspecto:** tamaño, contorno de los botones y estilo de las pestañas.
4. Elija {{ui:Usar este diseño}}. La aplicación cambia a él de inmediato, y todas las aplicaciones que tienen diseños también lo usan.

Solo se ofrece lo que tiene esta aplicación. Su diseño aparece en {{ui:De complementos y archivos}}; {{ui:Exportar este diseño}} lo guarda como un archivo que puede pasar a un colega, y el botón de quitar lo elimina. Los paneles que llena se siguen acoplando, flotando y pasando a su propia ventana, como en [Organizar los paneles](common:arrange-panels).

## Guardar su configuración como entorno de trabajo

Un entorno de trabajo es toda su configuración para todas las aplicaciones en este navegador: el diseño, el estilo de menú y sus teclas, el estilo de la barra de herramientas, los paneles y sus tamaños, y {{ui:Mis herramientas}}. El tema y el idioma no forman parte de él.

- **Guardar:** escriba un nombre en {{ui:Entornos de trabajo}} y elija {{ui:Guardar mi configuración}}. Guardar con un nombre que ya existe reemplaza esa configuración.
- **Cambiar:** elija una configuración en la lista y luego {{ui:Cambiar a esta}}. La aplicación se vuelve a cargar con esa configuración; si tiene trabajo sin guardar, la aplicación pregunta antes, como en cualquier recarga.
- **Compartir:** {{ui:Exportar}} guarda la configuración elegida como un archivo `.ccenv.json`; {{ui:Importar una configuración…}} agrega una desde un archivo. Un archivo solo fija estas opciones, nada más.
- **Quitar:** elija una configuración y luego {{ui:Quitar}}.

Puede guardar hasta doce configuraciones.

Para probar primero los diseños incluidos, vea [el diseño de caja de herramientas y cuadro de información](common:layout-toolbox) y [el diseño de cinta y explorador del proyecto](common:layout-ribbon).
