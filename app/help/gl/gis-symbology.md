---
title: Dar estilo a unha capa segundo un atributo
summary: Colorear os elementos dunha capa GIS segundo os valores dun campo (unha cor por valor ou por intervalos numéricos), dimensionar os puntos segundo un número, tinguir polígonos e amosar unha lenda na planta.
keywords: simboloxía, estilo, cor, categorizada, graduada, valores únicos, intervalo igual, cuantil, quebras naturais, jenks, rampa, daltonismo, lenda, tamaño, puntos, coropleta, clases, gis
from: a3a69add
---

Abra o menú de **tres puntos** dunha capa na lista de capas GIS e escolla {{ui:Estilo por atributo…}}.

## Tres estilos

- **Símbolo único:** a cor da capa, como antes.
- **Categorizada:** unha cor por cada valor distinto de calquera campo. Ata oito valores reciben as oito cores Okabe-Ito (escollidas para seguir separadas nos tipos habituais de daltonismo); con máis valores, os sete máis frecuentes reciben unha cor cada un e o resto comparte unha clase gris **Outros**. Os elementos sen valor son grises.
- **Graduada:** un campo numérico divídese en 2 a 9 intervalos, cada un cunha cor dunha rampa. Un valor sobre un corte vai ao intervalo inferior.

## Como se cortan os intervalos

| Método | Cortes |
|---|---|
| Intervalo igual | O rango do menor ao maior valor, dividido en anchuras iguais. Valores de 0 a 30 en tres intervalos: 0, 10, 20, 30. |
| Cuantil | Aproximadamente o mesmo número de elementos en cada intervalo. Os cortes léense dos valores ordenados coa interpolación lineal habitual: para 1 a 10 en dous intervalos, o corte é 5,5. |
| Quebras naturais (Jenks) | Os cortes que deixan a menor dispersión dentro de cada intervalo, para que os grupos de valores similares queden xuntos. Con máis de 1.500 valores traballa con 1.500 deles espazados por igual, e indícao. |

## Cores

Viridis e Cividis van do escuro ao claro cunha variación constante de luminosidade, así que a orde dos intervalos pódese ler mesmo en gris ou con daltonismo. Azuis vai do claro ao escuro. Vermello a azul é unha rampa bidireccional para valores arredor dun valor medio. **Inverter as cores** inviste calquera delas. O diálogo lista os intervalos e o número de elementos en cada un antes de aplicar.

## Tamaño, relleno e lenda

- **Tamaño do punto por** un campo numérico fai que o cadrado de cada punto sexa máis grande canto maior sexa o valor, entre os dous tamaños que indique (a metade do lado, en milímetros no papel).
- **Tinguir o interior dos polígonos** enche cada polígono coa cor da súa clase (os furados quedan baleiros). O tinte é na pantalla; as impresións e os DXF/DWG amosan os contornos coloreados.
- **Amosar unha lenda na planta** debuxa as clases, os seus números e o rango de tamaños na parte inferior esquerda da planta. A lenda está na pantalla; non aparece na impresión.
- Para etiquetar os elementos cun campo, use **Etiquetar con** no mesmo menú.

O estilo gárdase no ficheiro do proxecto. Unha versión que non coñece os estilos abre o ficheiro coa cor da capa. As impresións, DXF e DWG levan as clases como capas separadas co nome da capa e da clase, na cor máis próxima das nove cores básicas de CAD. Unha capa de máis de 200.000 elementos debúxase nunha soa cor.
