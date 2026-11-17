---
title: Objetos de forma livre
summary: Traga uma forma feita em outro aplicativo (STL, OBJ ou um item da biblioteca) para o terreno; ela fica apoiada no solo ou é recortada nele, e seu volume, sua área e sua pegada são contados como os demais itens.
keywords: forma livre, objeto personalizado, escultura, jardineira, banco, malha, stl, obj, item da biblioteca, sensível ao terreno, acompanhar o terreno, recortar o terreno, quantitativos, volume, ifc
from: ec835f33
---

Um elemento único (uma jardineira, um muro de banco, uma escultura, um monte para brincar) pode ser feito no ModelCraft ou no PartCraft e colocado aqui para que fique no mesmo modelo e nas mesmas tabelas que todo o restante.

1. Paisagismo › Mais › {{ui:Objeto de forma livre…}} e escolha um arquivo **STL** ou **OBJ** (nas unidades do projeto: pés em um projeto em pés, metros em um projeto em metros) ou um **item da biblioteca** do CadCraft (`.json`) com um corpo de malha.
2. Clique onde ele deve ficar.

## Sua base

- **Acompanha o terreno**: seu ponto mais baixo fica sobre o terreno mais baixo sob a pegada, então nada flutua. As Propriedades estimam quanto dele fica abaixo do terreno.
- **Recorta o terreno**: sua base é definida em uma elevação, e o terreno dentro da pegada é terraplenado até ela com taludes até o terreno, contados em Terraplenagem como uma plataforma.

Gire com **Girado**, arraste-o na planta para movê-lo.

## Quantitativos

As Propriedades informam seu **volume** (para um sólido fechado), **área de superfície**, **pegada** e **altura**, medidos a partir da malha. A exportação IFC grava o objeto com a **classe IFC** que você escolher e essas quantidades.

:::note
A pegada é o fecho convexo do contorno: uma forma côncava (uma jardineira em forma de L) é terraplenada como se estivesse preenchida.
:::
