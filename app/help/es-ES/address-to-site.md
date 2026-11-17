---
title: Dirección a emplazamiento
summary: Convierta una dirección en lo que un emplazamiento necesita saber: la parcela, los edificios de alrededor, la calificación del suelo, el suelo y la zona inundable, a partir de datos abiertos que pide con un botón o que aporta como archivos, y envíelos a BimCraft como sugerencias.
keywords: dirección, geocodificar, emplazamiento, parcela, edificios, calificación del suelo, suelo, inundación, datos abiertos, openstreetmap, fema, ssurgo, usgs, contexto, ccsite, bimcraft
from: 125d848a
---

## Qué hace

Superficie › Más › Dirección a emplazamiento responde, para un punto: en qué parcela está, los edificios de alrededor, la calificación del suelo, el tipo de suelo y la zona inundable. Los datos son abiertos: archivos que usted añade (GeoJSON, shapefile, KML, GeoPackage) y, cuando activa los complementos, botones que piden a un servicio abierto cada uno.

## Cómo se usa

1. Escriba una dirección y pulse el botón de búsqueda de direcciones (el complemento «Búsqueda de dirección»), o escriba la latitud y la longitud.
2. Añada capas: archivos con «Añadir archivos», u otros botones de origen (zona inundable, edificios, suelo, altura del terreno, parcelas del condado). Un servicio solo se consulta al pulsar su botón; no se descarga nada al iniciar.
3. Pulse el botón de ejecución para obtener la respuesta en texto, con un CSV.
4. «Guardar el emplazamiento como archivo» o «Enviar a BimCraft como sugerencias» entrega los contornos a BimCraft o ModelCraft; estos los listan y añaden solo lo que usted marque.

## Qué debe saber

- La búsqueda de direcciones pasa por getcadcraft.com, que consulta en su nombre a Nominatim de OpenStreetMap (una petición por segundo como máximo; las respuestas se guardan 90 días para que nunca se pregunte dos veces por la misma dirección; solo se guarda un hash de la dirección, nunca quién la consultó). Los demás botones van directamente desde su navegador a su servicio.
- Cada fuente tiene su propia licencia (OpenStreetMap es ODbL: conserve la línea de atribución).
- Las capas son tan buenas como los datos abiertos de su zona. Compruebe lo que importe con un levantamiento topográfico.
