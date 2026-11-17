---
title: Menús, teclas e rato
summary: Escolla un estilo de menú que coincida coa forma en que xa traballa, dea a calquera orde a súa propia tecla, mova ordes entre as pestanas da cinta e defina o que fan a roda e os botóns do rato no plano e en 3D.
keywords: estilo de menú, menús, cinta, cinta civil, barra de ferramentas, liña de ordes, debuxo clásico 2D, atallos de teclado, teclas de acceso, teclas, personalizar, reasignar, rato, roda, inverter, dirección do zoom, botón central, botón dereito, desprazar, orbitar, exportar, importar, cambio, familiar
from: 07ac73a0
---

As ordes de CivilCraft son as mesmas por onde se cheguen. Un **estilo de menú** só decide onde están na pantalla, como se chaman alí e que teclas as executan, para que poida conservar os seus hábitos. Escóllao en {{ui:Settings}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}}; o cambio é inmediato, e este navegador o recorda.

## Os tres estilos

| Estilo | O que obtén |
|---|---|
| {{ui:CivilCraft}} | A barra de ferramentas propia de CivilCraft ({{ui:File}}, {{ui:Export}}, {{ui:Surface}}, Deseño, Editar, GIS, {{ui:View}}) e teclas simples: {{key:A}} trazado, {{key:G}} plataforma, {{key:P}} tubaxes, {{key:B}} liña de rotura, {{key:O}} límite, {{key:L}} liña de elemento, {{key:R}} perfil, {{key:X}} seccións, {{key:E}} movemento de terras, {{key:D}} 3D, {{key:F}} axustar, {{key:V}} seleccionar. O punto de partida. |
| {{ui:Drafting classic}} | Unha cinta pequena ({{ui:Home}}, {{ui:Insert}}, {{ui:Output}}) e unha liña de ordes, para quen escribe as ordes: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (desfacer), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Comece a escribir en calquera lugar e as letras van á liña de ordes; {{key:Enter}} executa, {{key:Enter}} sen nada repite a última orde, {{key:Esc}} a borra. O botón central despraza. |
| {{ui:Civil ribbon}} | Pestanas de botóns grandes, como os programas de deseño civil agrupan as súas ferramentas: {{ui:Home}} (datos do terreo, crear deseño, vistas de perfil e de sección), {{ui:Surfaces}}, {{ui:Modify}}, {{ui:Geolocation}}, {{ui:View}} e {{ui:Output}}, cun menú {{ui:File}} e botóns rápidos á dereita. As teclas simples seguen. O botón central despraza o plano; en 3D o botón central despraza e {{key:Shift}} co botón central orbita. |

Todos os estilos conservan as teclas {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Unha tecla que pertence ao deseño propio de CivilCraft, pero que o seu estilo lle deu a outra orde, non fai nada, e a liña de estado indica onde foi a súa orde ("En As miñas teclas, Plataforma é Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} e as frechas conservan sempre o seu significado, e mentres debuxa unha liña, os seus puntos conservan as súas teclas ({{key:Backspace}}, {{key:Enter}}).
:::

## Personalícello

1. Escolla o estilo máis próximo ao que quere, e logo prema en {{ui:Customize…}}.
2. En {{ui:Keys and menus}}, busque unha orde (a caixa de busca axuda). Prema {{ui:Add a key}} e logo a tecla, ou dúas teclas seguidas para unha tecla de dúas letras. Prema unha tecla para a quitar.
3. Cunha cinta, {{ui:Where it sits}} move a orde a outra pestana e panel, ao menú {{ui:File}} ou a {{ui:Keys only}}.
4. En {{ui:Mouse}}, defina a roda, os botóns que desprazan o plano e o que fai cada botón na vista 3D.
5. Dea un nome e prema {{ui:Save}}.

Gardar un estilo integrado crea a súa propia copia («A miña cinta civil»); o integrado nunca cambia. Unha tecla dada a dúas ordes, ou unha que se executaría antes de poder escribir unha tecla de dúas letras, móstrase en vermello e hai que corrixila antes de gardar.

## Rato

- **Roda do rato**: {{ui:Scroll up zooms in}} (o punto de partida) ou {{ui:Scroll up zooms out}}, e a velocidade, no plano e en 3D. Unha pinza no trackpad sempre fai zoom no sentido en que se moven os dedos.
- **Desprazar o plano con**: o botón central, o botón dereito, ou ambos. {{key:Space}} e arrastrar tamén desprazan. O botón esquerdo sempre selecciona e debuxa.
- **Arrastrar na vista 3D**: Cada vista propia mantén os botóns de CivilCraft (o esquerdo orbita, o dereito despraza). Ou defina cada botón para orbitar, desprazar, facer zoom ou nada; {{key:Shift}} co botón inverte orbitar e desprazar. Un clic sen arrastrar tamén selecciona.

## Levar consigo

{{ui:Export}} garda o estilo en uso como un pequeno ficheiro `.ccinput.json`; {{ui:Import…}} engade un, desde outro ordenador ou dun compañeiro. Un ficheiro importado só pode apuntar ás ordes propias de CivilCraft: o que haxa de máis nel omítese e cóntase na liña de estado. {{ui:Delete this style}} elimina un dos seus propios.

:::note
Estes axustes quedan neste navegador. {{ui:Use this style in every app}} baixo as tarxetas de estilo fai que cada aplicación se abra co seu estilo correspondente (a súa propia barra, unha cinta ou {{ui:Drafting classic}}), cos cambios que fixo en cada aplicación. CivilCraft non ten estilo de barra de menús: cando se escolle para todas as aplicacións a barra de menús doutra aplicación, CivilCraft conserva a súa propia barra de ferramentas.
:::

Relacionado: [Teclado e rato](topic:keyboard) · [Configuración de CivilCraft](topic:settings) · [Vir doutro software civil](topic:coming-from)
