---
title: Cercas
summary: Uma cerca ao longo de uma linha, lote ou plataforma: mourões, travessas, painéis ou ripas, portões, inclinada ou em degraus no terreno, uma tabela, símbolos de planta e elementos IFC. Também disponível para um assistente.
keywords: cerca, mourões, travessas, painéis, ripas, portão, inclinada, em degraus, terreno, tabela, ifc, guarda-corpo, divisa
from: c0e7b84a
---

Faça uma cerca ao longo de uma linha de feição, um alinhamento, um lote ou uma plataforma, com seus mourões e portões posicionados para você.

## Criar uma cerca

1. Selecione uma linha, um lote ou uma plataforma.
2. Abra **Superfície, Mais, Cercas...**
3. Escolha o estilo (painéis, travessas ou ripas), inclinada ou em degraus, a altura, o espaçamento dos mourões e a largura do portão, depois **Cerca ao longo da seleção**, ou **Com um portão** para colocar um portão no meio do trecho reto mais longo.

Os mourões ficam nas extremidades, em cada canto (um vértice que gira 20 graus ou mais), nas duas bordas de cada portão e em módulos iguais entre eles, nenhum mais longo que o espaçamento. Painéis **inclinados** acompanham o terreno entre seus mourões. Painéis **em degraus** ficam nivelados e dão degraus nos mourões; o vão sob um painel é mais largo no mourão do lado mais baixo, e a janela avisa quando esse vão passa do limite, ou quando o terreno sobe através de um painel. Portões de 6 pés (1.8 m) ou mais largos recebem duas folhas; a planta mostra as folhas abertas com a sua abertura.

## Tabela e saídas

Cada cerca mostra seu comprimento, mourões por tipo, painéis, portões e degraus, com uma tabela **CSV** de mourões, painéis, travessas, ripas e portões. A planta tem camadas de cerca (C-FENC, C-FENC-POST, C-FENC-GATE) para PDF, DXF e DWG. A exportação IFC contém os mourões (IfcMember, post), os painéis (IfcRailing, user defined fence panel), as travessas (IfcMember) e os portões (IfcDoor, gate), com um sistema por cerca.

## A partir de um assistente

`fence_build` cria uma cerca (pontos ou uma linha, lote ou plataforma nomeados, portões por estaca) e `fence_list` lista as cercas com a sua tabela.

## O que não está feito

Os tamanhos iniciais são escolhas usuais, não uma norma. Tipos da Biblioteca são levados apenas pelo nome. Os portões devem estar em um único trecho reto. O BimCraft ainda não tem essa ferramenta.
