---
title: Vedações
summary: Uma vedação ao longo de uma linha, de um lote ou de uma plataforma: postes, travessas, painéis ou ripas, portões, inclinada ou em degraus no terreno, um mapa, símbolos em planta e elementos IFC. Também disponível para um assistente.
keywords: vedação, postes, travessas, painéis, ripas, portão, inclinada, em degraus, terreno, mapa, ifc, guarda, limite
from: c0e7b84a
---

Crie uma vedação ao longo de uma linha característica, de uma diretriz, de um lote ou de uma plataforma, com os postes e os portões colocados automaticamente.

## Criar uma vedação

1. Selecione uma linha, um lote ou uma plataforma.
2. Abra **Superfície, Mais, Vedações...**
3. Escolha o estilo (painéis, travessas ou ripas), inclinada ou em degraus, a altura, o espaçamento dos postes e a largura do portão e, depois, **Vedação ao longo da seleção**, ou **Com um portão** para colocar um portão a meio do troço reto mais comprido.

Os postes ficam nas extremidades, em cada canto (um vértice que muda de direção 20 graus ou mais), nas duas extremidades de cada portão e em tramos iguais entre eles, nenhum mais comprido do que o espaçamento. Os painéis **inclinados** acompanham o terreno entre os respetivos postes. Os painéis **em degraus** mantêm-se nivelados e alteram-se nos postes; a folga por baixo de um painel é maior no poste mais baixo, e a janela avisa quando essa folga ultrapassa o limite, ou quando o terreno sobe através de um painel. Portões de 6 feet (1.8 m) ou mais largos têm duas folhas; a planta mostra as folhas abertas com a respetiva abertura.

## Mapa e saídas

Cada vedação mostra o comprimento, os postes por tipo, os painéis, os portões e os degraus, com um mapa em **CSV** de postes, painéis, travessas, ripas e portões. A planta tem camadas de vedação (C-FENC, C-FENC-POST, C-FENC-GATE) para PDF, DXF e DWG. A exportação IFC contém os postes (IfcMember, post), os painéis (IfcRailing, user defined fence panel), as travessas (IfcMember) e os portões (IfcDoor, gate), um sistema por vedação.

## A partir de um assistente

`fence_build` cria uma vedação (pontos, ou uma linha, lote ou plataforma com nome, com portões por PK) e `fence_list` lista as vedações com o respetivo mapa.

## O que ainda não está implementado

As dimensões iniciais são escolhas habituais, não um código. Os tipos da biblioteca transportam-se apenas pelo nome. Os portões têm de estar num único troço reto. O BimCraft ainda não tem esta ferramenta.
