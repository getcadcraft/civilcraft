---
title: Do enderezo ao emprazamento
summary: Converta un enderezo no que un emprazamento necesita saber: a parcela, os edificios ao redor, a zonificación, o solo e a zona inundable, a partir de datos abertos que pida por botón ou traia como ficheiros, e envíeos a BimCraft como suxestións.
keywords: enderezo, xeocodificación, emprazamento, parcela, edificios, zonificación, solo, inundación, datos abertos, openstreetmap, fema, ssurgo, usgs, contexto, ccsite, bimcraft
from: 125d848a
---

## Que fai

Superficie › Máis › Do enderezo ao emprazamento responde, para un punto: en que parcela está, os edificios ao redor, a zonificación, o solo e a zona inundable. Os datos son abertos: ficheiros que engada (GeoJSON, shapefile, KML, GeoPackage) e, cando active os complementos, botóns que piden un servizo aberto cada un.

## Como se usa

1. Escriba un enderezo e prema o botón de busca de enderezos (o complemento «Busca de enderezos»), ou escriba a latitude e a lonxitude.
2. Engada capas: ficheiros con «Engadir ficheiros», ou os outros botóns de fonte (zona inundable, edificios, solo, altura do terreo, parcelas do condado). Un servizo só se pregunta cando preme o seu botón; non se descarga nada ao iniciar.
3. Prema o botón de execución para a resposta en palabras, con un CSV.
4. «Gardar o sitio como ficheiro» ou «Enviar a BimCraft como suxestións» entrega os contornos a BimCraft ou ModelCraft; estes listanos e engaden só o que marque.

## Que cómpre saber

- A busca de enderezos pasa por getcadcraft.com, que consulta por vostede Nominatim de OpenStreetMap (como máximo unha petición por segundo; as respostas gárdanse 90 días para que nunca se pregunte dúas veces o mesmo enderezo; só se garda un hash do enderezo, nunca quen preguntou). Os outros botóns van directamente desde o seu navegador ao seu servizo.
- Cada fonte ten a súa propia licenza (OpenStreetMap é ODbL: conserve a liña de crédito).
- As capas son tan boas como os datos abertos do seu lugar. Comprobe contra un levantamento o que sexa importante.
