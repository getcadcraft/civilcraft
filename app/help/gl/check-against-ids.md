---
title: Comprobar a exportación IFC contra o IDS dun cliente
summary: Cargue o ficheiro .ids que lle deu un cliente ou unha autoridade viaria e vexa en Problemas cada elemento exportado que non o cumpre.
keywords: ids, especificación de entrega de información, buildingsmart, requisitos, entrega, comprobación, validación, garantía de calidade, exportación ifc, ifc 4.3, trazado, estrada, contratación pública
from: 183d9a0e
---

## Que vai facer

Un IDS (Information Delivery Specification, unha norma de buildingSMART) é a lista do que debe conter un IFC. A contratación pública adoita enviar un co traballo. CivilCraft comproba contra el o IFC que exporta este proxecto, na versión de IFC que escolleu para a exportación, e lista cada elemento que non chega.

## Pasos

1. Abra o seu proxecto.
2. Faga clic en {{ui:IFC}} no grupo Exportar da barra de ferramentas. No diálogo, escolla a versión de IFC que vai entregar.
3. Faga clic en {{ui:Comprobar contra IDS…}}.
4. Faga clic en {{ui:Cargar un ficheiro .ids…}} e escolla o ficheiro. Non se envía nada.
5. Lea o resultado: cada especificación con {{ui:Cumpre}} ou {{ui:Non cumpre}} e a cantidade de elementos aos que se aplica.
6. Abra Problemas ({{key:Ctrl+Shift+M}}) e faga clic nun fallo para seleccionar o trazado, a plataforma, a tubaxe, a estrutura ou a masa de edificio de onde procede.

## O que debe ver

- Un aviso por cada elemento exportado e cada requisito que non cumpre, co nome da especificación, o que pide o IDS e o que ten a exportación.
- O informe de comprobación (en Problemas) comeza co IDS: o seu título, versión, autor e os recontos de cada especificación.

## Cousas que cómpre saber

- O IDS gárdase no ficheiro do proxecto, así que se comproba de novo ao abrir o proxecto. Cargalo ou esquecelo é un paso que pode desfacer.
- Cada cambio se comproba de novo pouco despois. As superficies grandes tardan máis en escribirse, así que a comprobación espera un pouco máis entre execucións.
- A comprobación usa o mesmo ficheiro que escribe a exportación {{ui:IFC}}, na última versión escollida alí (IFC 4.3 se non escolleu ningunha).
- Os números compáranse en unidades SI: un proxecto en pés convértese primeiro a metros.

- Os patróns do IDS léense como o valor completo. Un `^` ao inicio e un `$` ao final tómanse tamén como «o valor completo», tal como adoitan querer dicir a maioría dos ficheiros IDS.

## Seguinte

- [Exportar IFC](topic:ifc)
