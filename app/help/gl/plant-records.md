---
title: Rexistros de plantas, cultivares e tamaños subministrados
summary: A lista propia de plantas do proxecto como táboa: cultivares, tamaños subministrados (recipiente, cepellón, perímetro, tronco libre), densidade, notas de especificación, CSV de entrada e saída; cada planta colocada indica un tamaño; símbolos de plantas por escala e os seus propios símbolos e modelos 3D.
keywords: táboa de plantas, base de datos de plantas, cultivar, variedade, tamaño subministrado, recipiente, cepellón, raíz espida, perímetro, tronco libre, densidade, plantas por metro cadrado, especificación, notas de especificación, símbolo de planta, bloque, símbolo propio, planta en 3D, nivel de detalle, escala
from: 12251beb
---

Abra {{ui:Plant table}} desde o menú {{ui:More}} do grupo Paisaxismo, ou desde a sección Plantas. Cada fila é un rexistro de planta na lista propia deste proxecto (un rexistro da lista de plantas cópiase ao engadilo). Cada edición se comproba igual que un ficheiro importado, e é un paso de desfacer.

## As columnas

- **Nome botánico**, **Nome común**, **Tipo**, **Altura** e **Extensión** na madurez (metros).
- **Distancia** (de centro a centro) ou **Densidade** (plantas por m²). Un canteiro dun rexistro con densidade e sen distancia énchese a esa densidade, co seu propio patrón (triangular ou cadrado).
- **Tamaños subministrados**: unha entrada por tamaño, separadas por `;`. Cada entrada é un identificador, un tipo (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) e logo calquera destes: un volume `10L`, unha altura `h0.6`, unha extensión `s0.4`, un perímetro `g14-16` (cm), un tronco libre `st1.8`. Exemplo: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Cultivares**: nomes separados por `;`. Un cultivar conserva os seus propios tamaños e notas cando o ficheiro importado os tiña.
- **Notas de especificación**.

{{ui:Duplicate}} copia unha fila cunha clave nova; {{ui:Save as CSV}} e {{ui:Save as a plants file}} escriben a lista (as filas CSV dos cultivares van baixo a súa especie, con `cultivar_of`). Importar un CSV ou un ficheiro de plantas combínao coa lista.

## A súa propia lista da Biblioteca

Inicie sesión na súa conta de CadCraft (Configuración, Os seus complementos, Iniciar sesión) e a táboa de plantas pode usar a lista que garda na Biblioteca:

- {{ui:From my Library list}} trae os seus propios elementos de planta (incluídos os que aínda agardan revisión). Unha planta que xa ten aquí actualízase desde a Biblioteca; os cultivares, os tamaños subministrados, a densidade e a especificación que engadiu aquí consérvanse.
- {{ui:Save as a plant list}} garda cada fila como elemento de planta propio na Biblioteca, un elemento por especie: unha planta nova é un elemento novo, unha planta cambiada é unha versión nova, e unha sen cambios déixase como está. Marque primeiro a caixa: ao gardar, as plantas cédense ao público baixo CC0. A primeira subida pública dunha persoa que aínda non é de confianza revísaa unha persoa antes de aparecer, como ocorre con toda subida.

A Biblioteca garda o rexistro básico da planta. Os cultivares, os tamaños subministrados, a densidade e as notas de especificación quedan no proxecto e no ficheiro de plantas ({{ui:Save as a plants file}}); o diálogo indica cantas filas afecta cada vez que se garda.

## Unha planta colocada indica un tamaño

Seleccione unha planta, un seto ou unha fila de mestura dun canteiro ou dunha área plantada: cando o rexistro ten cultivares ou tamaños subministrados, {{ui:Cultivar and size}} escolle un. O cadro de plantas conta entón por especie, cultivar e tamaño, e unha etiqueta pode mostralos: `{botanical} '{cultivar}' {size}` ou `{full}`.

## Símbolos das plantas por escala

{{ui:Plant graphics}} (Paisaxismo › More) fixa como se debuxan as plantas en planta: **automático** (máis grosa que 1:500 un círculo coa extensión, entre 1:200 e 1:500 un contorno co seu centro, máis fina o símbolo detallado; ambas as escalas poden cambiarse) ou un nivel para todas as escalas. O diálogo de Follas ten a súa propia **Detalle das plantas no plano** para ese conxunto.

Nun rexistro da sección Plantas, {{ui:Own symbol…}} lee un SVG, ou un bloque dun debuxo DXF/DWG, e debúxao coa extensión da planta no nivel detallado. {{ui:Own 3D model…}} lee un OBJ, STL ou GLB; en Gráficos de plantas escolla **Modelo propio de cada rexistro** para velo en 3D. Os ficheiros teñen límites (512 KB de SVG, 2000 formas, 50 000 triángulos) e gárdanse no proxecto. As transformacións SVG non se aplican (avísase cando un ficheiro as ten). Ver [Gráficos de plantas, símbolos propios e plantas en 3D](topic:plant-graphics) para os niveis, os límites e o que pode conter un GLB.
