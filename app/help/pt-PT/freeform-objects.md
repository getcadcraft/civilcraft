---
title: Objetos de forma livre
summary: Trazer para o local uma forma feita noutra aplicação (STL, OBJ ou um item da biblioteca); fica assente no terreno ou é cortada nele, e o seu volume, área e implantação são contados como o resto.
keywords: forma livre, objeto personalizado, escultura, floreira, banco, malha, stl, obj, item da biblioteca, consciente do terreno, seguir o terreno, cortar o terreno, quantidades, volume, ifc
from: ec835f33
---

Uma intervenção única (uma floreira, um muro-banco, uma escultura, um monte para brincar) pode ser feita no ModelCraft ou no PartCraft e colocada aqui, para ficar no mesmo modelo e nos mesmos mapas que tudo o resto.

1. Paisagismo › {{ui:Mais}} › {{ui:Objeto de forma livre…}} e escolha um ficheiro **STL** ou **OBJ** (nas unidades do projeto: pés num projeto em pés, metros num projeto em metros) ou um **item da biblioteca** do CadCraft (`.json`) com um corpo de malha.
2. Clique onde ele deve ficar.

## Base

- **Segue o terreno**: a sua cota mais baixa fica sobre o terreno mais baixo sob a sua implantação, por isso nada flutua. As **Propriedades** estimam quanto dele fica abaixo do terreno.
- **Corta o terreno**: a base é definida a uma cota e o terreno dentro da implantação é modelado até essa cota, com taludes de intersecção, contado em Terraplenagem como uma plataforma.

Rode-o com **Rodar**; arraste-o na planta para o mover.

## Contado

As **Propriedades** indicam o volume (para um sólido fechado), a área de superfície, a implantação e a altura, medidos a partir da malha. A exportação IFC escreve-o com a **classe IFC** que escolher e essas quantidades.

:::note
A implantação é o fecho convexo do contorno: uma forma côncava (uma floreira em L) é modelada como se estivesse preenchida.
:::
