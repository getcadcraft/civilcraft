---
title: Xerar a planta en PDF
summary: Xerar todo ou a vista actual como PDF vectorial nunha folla estándar, a unha escala de enxeñaría ou métrica, en cores de capa ou en negro.
keywords: xerar, imprimir, pdf, folla, escala, tamaño de papel, folla de planta, publicar, cartela, frecha norte, barra de escala
from: 9af396ca
---

{{ui:PDF}} xera a planta como PDF vectorial nunha folla, cunha cartela do título, unha frecha norte e unha barra de escala. O PDF créase no navegador e descárgase; non pasa polo diálogo de impresión do navegador.

## Xerar

1. Configure a planta en **Visualización**: a superficie mostrada, o intervalo de curvas de nivel e que elementos están activos. A xeración segue estes axustes.
2. Se quere só unha parte do sitio, faga zoom e desprace a planta ata ela.
3. Prema {{ui:PDF}} no grupo **Exportar**, ou prema {{key:Mod+P}}. Ábrese o diálogo **Xerar a planta en PDF**.
4. Escolla a **Área**: {{ui:Everything}} ou {{ui:What is on screen}}.
5. Escolla o **Papel**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 ou A1. Un proxecto en pés comeza en Tabloid, un proxecto en metros en A3. As follas son sempre horizontais.
6. Escolla a **Escala**. A lista marca a maior escala que cabe con "(cabe)" e selecciona esa.
   - Pés: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metros: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Escolla a **Tinta**: {{ui:Layer colors}} ou {{ui:Black}}.
8. Lea a liña debaixo das opcións. Indica o tamaño da área no papel e o tamaño da folla, por exemplo "A área é de 297 × 222 mm a 1" = 40' nunha folla de 432 × 279 mm (horizontal)."
9. Prema {{ui:Download PDF}}.
   O navegador descarga `<name>.pdf`. A barra de estado indica "Xerado <name>.pdf a 1" = 40'."

Se a área é maior que a folla á escala escollida, a xeración céntrase e os bordos cortanse. Escolla a escala marcada con "(cabe)" ou unha folla maior.

## Que hai na folla

- A planta, centrada na zona de debuxo, como vectores reais: curvas de nivel, etiquetas, trazados con estacionamento, corredores, plataformas e liñas de cerre, tubaxes, puntos.
- Grosores de liña por capa: trazados, plataformas e tubaxes máis grosos; triángulos e curvas secundarias finos.
- Unha cartela ao longo da parte inferior, co **Nome** do proxecto, a escala, unha nota do intervalo de curvas e a superficie (existente ou transformada), e a data e a versión á dereita.
- Unha frecha norte na esquina superior dereita (o norte da planta vai arriba) e unha barra de escala na cartela.
- As capas de mapa mostradas baixo a planta (unha imaxe, teselas de mapa ou un servizo de mapas), cando está marcado **Capas de mapa baixo a planta**: debúxanse como unha imaxe de toda a zona de debuxo a 150 puntos por polgada, baixo as liñas, e a atribución do mapa vai na cartela. CivilCraft agarda ata 8 segundos as imaxes de mapa que aínda chegan; se faltan algunhas, a barra de estado indícao.

O texto usa a Helvetica integrada no PDF. Os caracteres fóra do conxunto da Europa occidental (Windows-1252) imprímense como "?", e a mensaxe de estado conta cantos son.

## Que non se xera

- Bandas de elevación.
- A vista de perfil. Xerar perfís aínda non está dispoñible.
- Máis dunha folla (para un trazado, use [follas de planta e perfil](topic:plan-profile-sheets)), ventás de vista, un cartel de título personalizado nin follas verticais.

:::note
O diálogo indica que as frechas de pendente só se ven en pantalla. Nesta versión, as frechas de pendente activadas en **Visualización** sí se xeran (e exportan a DXF). Desactívaas antes de xerar se non as quere.
:::

## Imprimir en papel

Abra o PDF descargado en calquera visor de PDF e imprímao ao 100 % (tamaño real) para que a escala siga sendo correcta. "Axustar á páxina" cambia a escala.
