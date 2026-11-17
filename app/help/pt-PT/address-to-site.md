---
title: Do endereço ao local
summary: Transformar um endereço no que um local precisa de saber: o lote, os edifícios em redor, o zonamento, o solo e a zona inundável, a partir de dados abertos pedidos por botão ou trazidos em ficheiros, e enviá-los ao BimCraft como sugestões.
keywords: endereço, geocodificação, local, lote, edifícios, zonamento, solo, cheia, dados abertos, openstreetmap, fema, ssurgo, usgs, contexto, ccsite, bimcraft
from: 125d848a
---

## O que faz

Superfície › Mais › Do endereço ao local responde, para um ponto: em que lote está, os edifícios em redor, o zonamento, o solo e a zona inundável. Os dados são abertos: ficheiros que acrescenta (GeoJSON, shapefile, KML, GeoPackage) e, quando ativa as extensões, botões que pedem a um serviço aberto cada um.

## Como usar

1. Escreva um endereço e prima o botão de pesquisa de endereço (a extensão «Pesquisa de endereço»), ou escreva a latitude e a longitude.
2. Adicione camadas: ficheiros com «Adicionar ficheiros», ou os outros botões de origem (zona inundável, edifícios, solo, altura do terreno, lotes do condado). Um serviço só é consultado quando prime o respetivo botão; nada é obtido ao arrancar.
3. Prima o botão de execução para obter a resposta em texto, com um CSV.
4. «Guardar o local como ficheiro» ou «Enviar para o BimCraft como sugestões» entrega os contornos ao BimCraft ou ao ModelCraft; estes listam-nos e acrescentam apenas o que assinalar.

## O que saber

- A pesquisa de endereço passa por getcadcraft.com, que consulta o Nominatim do OpenStreetMap (no máximo um pedido por segundo; as respostas ficam guardadas 90 dias, para que o mesmo endereço nunca seja pedido duas vezes; guarda-se apenas uma impressão digital (hash) do endereço, nunca quem pediu). Os outros botões ligam-se diretamente do navegador ao respetivo serviço.
- Cada fonte tem a sua própria licença (OpenStreetMap é ODbL: mantenha a linha de crédito).
- As camadas são tão boas como os dados abertos da zona. Verifique o que é importante contra um levantamento.
