---
title: Ficheiros de estudo para outro programa de liñas (.DON)
summary: Garde unha liña aérea como ficheiro de estudo .DON, ou lea os apoios dunha nova liña. Sen probar co programa que os le.
keywords: don, .don, ficheiro de estudo, xml, exportar, importar, programa de liñas aéreas, tendido, cantón
from: 1abc4d07
---

Algúns programas de liñas aéreas gardan un estudo nun ficheiro `.DON` (texto XML). CivilCraft pode escribir unha liña nese formato e ler os apoios dunha.

:::warning
**Sen probar.** Fixémolo a partir dunha lista dos nomes de campo do formato que compartiu un usuario, non a partir dun ficheiro real, e non abrimos os nosos ficheiros no programa que os le. Ábraos alí e comprobe cada valor antes de fiarse. Se pode compartir un ficheiro `.DON` (cos datos do cliente retirados), axúdanos a corrixilo.
:::

## Gardar un ficheiro de estudo

1. Dálle á liña un condutor e asegúrese de que ten resultados (non aparece «non calculado» nas súas Propiedades).
2. {{ui:Máis}} › {{ui:Gardar un ficheiro de estudo (.DON)…}}, escolla a liña, engada unha descrición e un número de obra.
3. {{ui:Gardar o ficheiro de estudo}}.

O ficheiro contén os apoios da liña (coordenadas, terreo, alturas, funcións, cruceta, o apoio conservado ou suxerido, cargas por hipótese de carga, cimentación), unha sección por tramo entre finais de liña (condutor, tensión, vano de regulación, vanos, parámetros de tensión e catenaria, a tensión máxima por hipótese de carga) e as táboas de tendido. As lonxitudes están en metros e as forzas en daN; o texto escríbese en Latin-1, así que un carácter fóra del convértese en `?`.

## Ler un ficheiro de estudo

{{ui:Máis}} › {{ui:Abrir un ficheiro de estudo (.DON)…}} lee os apoios nunha liña nova. O condutor, os apoios e as crucetas coinciden coa súa biblioteca polo nome; o que non se atope queda para que o escolla en Propiedades.
