---
title: Exportar o plano a DXF
summary: Escribe as liñas do plano como un DXF R12 en capas con nome, coas curvas de nivel nas súas cotas e as liñas de ruptura en 3D, para calquera programa CAD.
keywords: dxf, dwg, cad, exportar, liñas, r12, 2000, 2004, 2007, 2010, 2013, 2018, capas, curvas de nivel, intercambio de debuxos, mapa base, fondo
from: f2d8ede9
---

{{ui:DXF}} escribe o que mostra o plano como un ficheiro DXF no formato R12, a versión que abre calquera programa CAD. Se usou AutoCAD ou Civil 3D, ábreo ou insíreo como faría con calquera DXF.

## Exportar

1. Prepare o plano como quere o debuxo: en **Visualización**, escolla a superficie (existente ou proposta), o intervalo das curvas de nivel e que elementos están activos (curvas de nivel, etiquetas, puntos, etiquetas de puntos, triángulos, liñas de ruptura, bordo da superficie, tubaxes, frechas de pendente).
2. Prema {{ui:DWG/DXF}} no grupo **Exportar** e escolla {{ui:DXF (R12, texto) — o ficheiro de intercambio simple}}, e despois {{ui:Descargar}}.
3. O navegador descarga `<name>.dxf`. A barra de estado indica, por exemplo, "Exportado R12 DXF: 2,140 obxectos; etiquetas dimensionadas para 1" = 40'. As bandas non se exportan."

As coordenadas escríbense nas unidades do proxecto, cos seus valores reais (as coordenadas state plane mantéñense tal cal). Non se escala nin se move nada.

## Que hai no ficheiro

| Elemento | Entidade DXF | Capa |
|---|---|---|
| Curvas de nivel secundarias e principais | Polilíneas 2D á súa cota | C-TOPO-MINR, C-TOPO-MAJR |
| Etiquetas das curvas de nivel | Texto | C-TOPO-TEXT |
| Triángulos | Polilíneas | C-TOPO-TINN |
| Liñas de ruptura e límite | Polilíneas 3D | C-TOPO-BRKL |
| Bordo da superficie | Polilíneas | C-TOPO-BNDY |
| Frechas de pendente | Polilíneas | C-TOPO-SLOP |
| Puntos de levantamento e as súas etiquetas | Puntos (con cota), texto | V-NODE, V-NODE-TEXT |
| Liñas dos códigos de liña | Polilíneas 3D | V-NODE-LINE |
| Eixes do trazado | Liñas e arcos | C-ROAD-CNTR |
| Marcas e etiquetas de estacado | Polilíneas, texto | C-ROAD-STAN |
| Bordos do corredor | Polilíneas | C-ROAD-CORR |
| Liñas de mostra | Polilíneas | C-ROAD-SCTN |
| Plataformas, liñas de encontro, liñas de pendente | Polilíneas | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Liñas de elemento | Polilíneas 3D (os arcos como tramos a menos de 0,01; ver [Liñas de elemento](topic:feature-lines)) | C-GRAD-FEAT |
| Traxectorias de xiro | Polilíneas, texto | C-ROAD-SWPT |
| Tubaxes, estruturas, etiquetas | Polilíneas, texto | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Tubaxes e estruturas con problemas | Polilíneas | C-STRM-PROB |

Cada capa ten unha cor. A lista completa está en [Capas do plano](topic:plan-layers).

## Tamaño das etiquetas

O texto ten que ter un tamaño en unidades de debuxo. CivilCraft dimensiona as etiquetas para a escala á que todo o plano cabe nunha folla Tabloid (pés) ou nunha folla A3 (metros), e indica a escala na mensaxe de estado. Se imprime noutra escala no seu programa CAD, escale o texto alí.

## Que non se exporta

- Bandas de cota (só en pantalla).
- A vista de perfil. Os perfís sáen como LandXML, non como debuxo.
- A propia superficie como obxecto 3D. Use LandXML para o TIN, ou active {{ui:Triángulos}} para obter as súas arestas como liñas.
- Calquera cousa que desactivase en **Visualización**.

## DWG

{{ui:DWG/DXF}} escribe as mesmas liñas tamén como debuxo DWG. O seu diálogo pregunta polo formato: DXF, ou un DWG de 2000, 2004, 2007, 2010, 2013 ou 2018. O formato 2000 abre en case todos os programas CAD, antigos e novos; escolla un máis novo cando o pida quen reciba o debuxo. A súa escolla recórdase neste navegador.

1. Prema {{ui:DWG}} no grupo **Exportar**.
2. Escolla o **Formato** e prema **Descargar DWG**.
3. O navegador descarga `<name>.dwg`. A barra de estado indica o que se gardou, por exemplo "DWG exportado (formato 2018): 12 polilíneas, 40 etiquetas en 9 capas".

O DWG ten as mesmas capas, cores, curvas de nivel (como polilíneas á súa cota), liñas de ruptura 3D, etiquetas e puntos que o DXF, nas mesmas coordenadas. Os nomes de capa que un DWG non admite cámbianse, e a mensaxe de estado di isto. CivilCraft escribe o DWG co seu propio código, así que non sae nada do seu ordenador.

### Capas de mapa no DWG

Un debuxo DWG non pode conter unha imaxe dentro del: os programas CAD mostran a imaxe ao lado do debuxo. Cando hai capas de mapa visibles, o diálogo ofrece **Capas de mapa como imaxe ao lado do debuxo**. Con isto marcado, a descarga é un `.zip` que contén `<name>.dwg`, `<name>-map.png` (as capas de mapa sobre todo o debuxo, ata 4.096 píxeles de ancho) e `<name>-map.pgw` (o seu ficheiro de mundo, para programas GIS). O debuxo mostra a imaxe como unha imaxe na capa G-MAP-IMAG, no seu sitio. Descomprima os ficheiros nunha mesma cartafol e manteñaos xuntos.
