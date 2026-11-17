---
title: Valados
summary: Un valado ao longo dunha liña, parcela ou plataforma: postes, travesas, paneis ou piquetas, portas, inclinados ou escalonados sobre o terreo, un cuadro, símbolos en planta e elementos IFC. Tamén dispoñible para un asistente.
keywords: valado, postes, travesas, paneis, piquetas, porta, inclinado, escalonado, terreo, cuadro, ifc, barandilla, límite
from: c0e7b84a
---

Cree un valado ao longo dunha liña de elemento, dun trazado, dunha parcela ou dunha plataforma, cos seus postes e portas colocados por vostede.

## Crear un valado

1. Seleccione unha liña, unha parcela ou unha plataforma.
2. Abra **Superficie, Máis, Valados...**
3. Escolla o estilo (paneis, travesas ou piquetas), inclinado ou escalonado, a altura, a separación entre postes e o ancho da porta; despois **Valado ao longo da selección**, ou **Con porta** para colocar unha porta no medio do tramo recto máis longo.

Os postes van nos extremos, en cada esquina (un vértice que xira 20 graos ou máis), nos dous bordos de cada porta e en tramos iguais intermedios, ningún máis longo que a separación. Os paneis **inclinados** seguen o terreo entre os seus postes. Os paneis **escalonados** quedan nivelados e escalónanse nos postes; o oco baixo un panel é máis ancho no seu poste de baixada, e a xanela avisa cando ese oco supera o límite, ou cando o terreo sobe a través dun panel. As portas de 6 pés (1,8 m) e máis anchas teñen dúas follas; a planta amosa as follas abertas co seu xiro.

## Cuadro e saídas

Cada valado amosa a súa lonxitude, os postes por tipo, os paneis, as portas e os chanzos, cun cuadro **CSV** de postes, paneis, travesas, piquetas e portas. A planta ten capas de valado (C-FENC, C-FENC-POST, C-FENC-GATE) para PDF, DXF e DWG. A exportación IFC contén os postes (IfcMember, post), os paneis (IfcRailing, user defined fence panel), as travesas (IfcMember) e as portas (IfcDoor, gate), cun sistema por valado.

## Desde un asistente

`fence_build` crea un valado (puntos ou unha liña, parcela ou plataforma co nome, portas por estación) e `fence_list` lista os valados co seu cuadro.

## O que non está feito

Os tamaños iniciais son opcións habituais, non un código. Os tipos da Biblioteca só se transportan como nome. As portas deben estar nun só tramo recto. BimCraft aínda non dispón desta ferramenta.
