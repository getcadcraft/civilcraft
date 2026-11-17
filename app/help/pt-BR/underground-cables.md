---
title: Cabos subterrâneos
summary: Rotas de cabo em valas entre suportes e equipamentos, recobrimento e cruzamentos, emendas por comprimento de bobina, e as quantidades de vala e de cabo.
keywords: cabo subterrâneo, rota de cabo, vala, duto, recobrimento, cruzamento, cruzamento de tubulação, emenda, bobina, gabinete, transformador, fonte, queda de tensão
from: adfd2717
---

## Desenhe uma rota de cabo

1. Posicione o equipamento primeiro se o cabo termina em um gabinete, um transformador ou uma emenda: {{ui:Equipamento}}, depois clique.
2. Clique em {{ui:Cabo}} e clique na rota; comece e termine em um suporte ou em um equipamento para conectar a ele. Enter conclui.

Em Propriedades, escolha o **Cabo**, o **Tipo de vala**, quantos **cabos lado a lado** e a **folga** (%). A rota mostra o comprimento, onde começa e termina, e a corrente que transporta.

## O que é verificado

- **Recobrimento**: o topo do cabo abaixo do terreno ao longo da rota, comparado ao recobrimento do tipo de vala (ou ao menor recobrimento do conjunto de regras).
- **Cruzamentos**: onde a rota cruza um tubo do CivilCraft ou outro cabo, a folga entre eles é comparada a uma regra de afastamento: a **Folga de cruzamento** da própria rota (em suas Propriedades), quando você escolhe uma; senão, a regra **Cruzamentos subterrâneos** do conjunto de regras (os conjuntos de exemplo usam *Cruzamento subterrâneo*, 0.3 m); senão, a folga do tipo de vala até outros serviços. Dois cabos que se cruzam mantêm a maior das duas folgas. Uma linha aérea cruzada é listada para informação, e o cabo aparece no perfil dessa linha.
- **Emendas**: uma a cada comprimento de bobina do cabo (com folga), quando o item de cabo informa um comprimento de bobina.

## Equipamento

O equipamento tem um item da biblioteca, uma **carga** (kW) com seu **fator de potência**, e pode ser **uma fonte**: a rede é alimentada a partir dele. A tensão de uma fonte vem do item da biblioteca dela ou, então, da linha ou do cabo que ela alimenta.

## Quantidades

{{ui:Mais}} › {{ui:Quantitativos…}} conta o cabo (comprimento da rota × (1 + folga) × cabos lado a lado + o desnível em cada extremidade), a vala por tipo, os volumes de escavação, berço e reaterro, os dutos e as emendas, junto com o condutor, os suportes e os equipamentos das linhas aéreas.
