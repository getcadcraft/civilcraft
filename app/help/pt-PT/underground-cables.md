---
title: Cabos subterrâneos
summary: Traçados de cabo em valas entre suportes e equipamentos, cobertura e cruzamentos, juntas por comprimento de bobina, e as quantidades de vala e de cabo.
keywords: cabo subterrâneo, traçado de cabo, vala, tubagem, cobertura, cruzamento, cruzamento de coletor, junta, bobina, armário, transformador, fonte, queda de tensão
from: adfd2717
---

## Desenhar um traçado de cabo

1. Coloque primeiro o equipamento se o cabo terminar num armário, num transformador ou numa junta: {{ui:Equipamento}}, depois clique.
2. Clique em {{ui:Cabo}} e clique no traçado; comece e termine num suporte ou num equipamento para se ligar a ele. {{key:Enter}} termina.

Em Propriedades, escolha o **Cabo**, o **Tipo de vala**, quantos **cabos lado a lado** e a **folga** (%). O traçado mostra o seu comprimento, onde começa e termina, e a corrente que transporta.

## O que é verificado

- **Cobertura**: a parte superior do cabo fica abaixo do terreno ao longo do traçado, face à cobertura do tipo de vala (ou à cobertura mínima do conjunto de regras).
- **Cruzamentos**: onde o traçado cruza um coletor do CivilCraft ou outro cabo, a distância entre eles face a uma regra de afastamento: a **Distância de cruzamento** do próprio traçado (nas suas Propriedades), quando escolhe uma; senão, a regra **Cruzamentos subterrâneos** do conjunto de regras (os conjuntos de exemplo usam *Cruzamento subterrâneo*, 0.3 m); senão, a distância do tipo de vala a outros serviços. Dois cabos que se cruzam mantêm a maior das duas. Uma linha aérea cruzada é listada a título informativo, e o cabo aparece no perfil dessa linha.
- **Juntas**: uma a cada comprimento de bobina do cabo (com folga), quando o item de cabo indica um comprimento de bobina.

## Equipamento

O equipamento tem um item da biblioteca, uma **carga** (kW) com o seu **fator de potência**, e pode ser **uma fonte**: a rede é alimentada a partir dele. A tensão de uma fonte vem do respetivo item da biblioteca, ou então da linha ou do cabo que alimenta.

## Quantidades

{{ui:Mais}} › {{ui:Quantidades…}} contabiliza o cabo (comprimento do traçado × (1 + folga) × cabos lado a lado + o desnível em cada extremidade), a vala por tipo, os volumes de escavação, de camada de assentamento e de reaterro, as tubagens e as juntas, com os condutores, suportes e equipamento das linhas aéreas.
