---
title: Dirección a sitio
summary: Convierta una dirección en lo que un sitio necesita saber: la parcela, los edificios alrededor, la zonificación, el suelo y la zona de inundación, a partir de datos abiertos que pide con un botón o que trae como archivos, y envíelos a BimCraft como sugerencias.
keywords: dirección, geocodificación, sitio, parcela, edificios, zonificación, suelo, inundación, datos abiertos, openstreetmap, fema, ssurgo, usgs, contexto, ccsite, bimcraft
from: 125d848a
---

## Qué hace

Superficie › Más › Dirección a sitio responde, para un punto: a qué parcela pertenece, los edificios alrededor, la zonificación, el suelo y la zona de inundación. Los datos son abiertos: los archivos que usted agrega (GeoJSON, shapefile, KML, GeoPackage) y, cuando active los complementos, botones que consultan un servicio abierto cada uno.

## Cómo se usa

1. Escriba una dirección y pulse el botón de búsqueda de dirección (el complemento "Búsqueda de dirección"), o escriba la latitud y la longitud.
2. Agregue capas: archivos con "Agregar archivos", o los otros botones de origen (zona de inundación, edificios, suelo, altura del terreno, parcelas del condado). Un servicio se consulta solo cuando pulsa su botón; nada se descarga al iniciar.
3. Pulse el botón de ejecutar para obtener la respuesta en texto, con un CSV.
4. "Guardar el sitio como archivo" o "Enviar a BimCraft como sugerencias" entrega los contornos a BimCraft o a ModelCraft; ellos los listan y agregan solo lo que usted marque.

## Qué debe saber

- La búsqueda de dirección pasa por getcadcraft.com, que consulta Nominatim de OpenStreetMap por usted (como máximo una solicitud por segundo; las respuestas se guardan 90 días para que nunca se pregunte dos veces la misma dirección; solo se guarda un hash de la dirección, nunca quién la consultó). Los demás botones van directamente de su navegador a su servicio.
- Cada fuente tiene su propia licencia (OpenStreetMap es ODbL: conserve la línea de atribución).
- Las capas son tan buenas como los datos abiertos de su zona. Verifique lo que importa contra un levantamiento.
