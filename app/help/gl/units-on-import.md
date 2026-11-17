---
title: Unidades ao importar: un ficheiro indica as súas unidades, ou pregúntase antes
summary: Cando un debuxo ou unha malla que trae a un proxecto indica as súas unidades, CivilCraft convértea e díxoo. Cando non as indica, CivilCraft pregunta antes de lela e lembra a súa resposta para ese ficheiro.
keywords: unidades, importar, DWG, DXF, STL, OBJ, levantamento, pés, pés US, metros, milímetros, escala, tamaño incorrecto, grande, pequeno, preguntar, lembrado, INSUNITS, unidades do debuxo
from: 60921963
---

## Que vai facer

Traer un ficheiro a un proxecto e asegurarse de que entra co tamaño correcto.

## Pasos

1. Abra o ficheiro como sempre: {{ui:Abrir}}, arrástreo sobre o plano, ou use o comando de debuxo CAD.
2. Se o ficheiro indica as súas unidades, non se pregunta nada: o diálogo de importación mostra **Como indica o debuxo**.
3. Se non as indica, un diálogo pregunta **Unidades de** o ficheiro antes de abrir o diálogo de importación. Escolla cal é unha unidade no ficheiro e prema {{ui:Usar estas unidades}}.
4. {{ui:Cancelar}} (ou {{key:Esc}}) omite o ficheiro. Non se le nada del no proxecto.

## Que ficheiros indican as súas unidades

- **DWG e DXF**: as unidades de inserción do debuxo (`$INSUNITS`). Pregúntase polos ficheiros que non as teñen. A lista **Unidades do debuxo** do diálogo de importación parte da súa resposta e aínda pode cambiala.
- **STL e OBJ** (formas libres de terreo): nunca indican unidades. Pregúntase sempre.
- **Listas de puntos** (CSV, TXT) e listas de levantamentos de obra: unha lista que indica a súa unidade nas primeiras liñas convértese e a liña de estado díxoo. Unha que non indica ningunha pregúntase ao premer {{ui:Importar}}, antes de que entren os puntos. As columnas de latitude e lonxitude pasan polo sistema de coordenadas.
- **O complemento de nubes de puntos**: pregunta cando crea unha nube cuxo ficheiro non indica unidade, e etiqueta os números da nube coa unidade que leva.
- **IFC e LandXML**: indican as súas unidades; conviértense ás unidades do proxecto.
- **LAS, LAZ e mallas de elevación en ráster**: colócanse segundo o seu sistema de coordenadas; o diálogo de terreo pregunta pola unidade de elevación cando o ficheiro non a indica.

## Bo saber

- A resposta lémbrase para ese ficheiro neste computador, en todas as aplicacións de CadCraft. A próxima vez que entre non se lle pregunta.
- Para que se lle pregunte de novo: a paleta de comandos ({{key:Mod+K}}) › **Preguntar de novo polas unidades dos ficheiros importados**.
- A unidade que indica unha lista lese das súas oito primeiras liñas: por exemplo, unha liña como `units: ft`, ou cabeceiras de columna que levan todas a mesma unidade entre corchetes, como `Elevation (m)`.
