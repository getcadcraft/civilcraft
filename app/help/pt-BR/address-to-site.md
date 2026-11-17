---
title: Do endereço ao terreno
summary: Transforme um endereço no que o terreno precisa saber: o lote, as edificações ao redor, o zoneamento, o solo e a zona de inundação, a partir de dados abertos que você pede por botão ou traz como arquivos, e envie-os ao BimCraft como sugestões.
keywords: endereço, geocodificação, terreno, lote, edificações, zoneamento, solo, inundação, dados abertos, openstreetmap, fema, ssurgo, usgs, contexto, ccsite, BimCraft
from: 125d848a
---

## O que faz

Superfície › Mais › Do endereço ao terreno responde, para um ponto: em qual lote ele está, as edificações ao redor, o zoneamento, o solo e a zona de inundação. Os dados são abertos: arquivos que você adiciona (GeoJSON, shapefile, KML, GeoPackage) e, quando você liga os complementos, botões que consultam um serviço aberto cada um.

## Como usar

1. Digite um endereço e pressione o botão de busca de endereço (o complemento "Busca de endereço"), ou digite a latitude e a longitude.
2. Adicione camadas: arquivos com "Adicionar arquivos", ou os outros botões de fonte (zona de inundação, edificações, solo, altura do terreno, lotes do município). Um serviço só é consultado quando você pressiona o botão dele; nada é baixado ao iniciar.
3. Pressione o botão de execução para obter a resposta em texto, com um CSV.
4. "Salvar o terreno como arquivo" ou "Enviar ao BimCraft como sugestões" entrega os contornos ao BimCraft ou ao ModelCraft; eles os listam e adicionam apenas o que você marcar.

## O que saber

- A busca de endereço passa pelo getcadcraft.com, que consulta o Nominatim do OpenStreetMap por você (no máximo uma requisição por segundo; respostas mantidas por 90 dias, para que o mesmo endereço nunca seja consultado duas vezes; só um hash do endereço é armazenado, nunca quem consultou). Os outros botões vão direto do seu navegador ao serviço deles.
- Cada fonte tem sua própria licença (o OpenStreetMap é ODbL: mantenha a linha de atribuição).
- As camadas são tão boas quanto os dados abertos da sua região. Confira o que importa com um levantamento.
