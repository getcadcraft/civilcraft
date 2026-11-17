---
title: Ler curvas de nivel, cotas e pendentes
summary: Definir o intervalo das curvas de nivel e as curvas directoras, mostrar bandas de altitude, frechas de pendente e triángulos, e ler as cotas do terreo baixo o punteiro.
keywords: curvas de nivel, intervalo entre curvas, curvas directoras, etiquetas, bandas de altitude, frechas de pendente, triángulos, cota puntual, análise da superficie, análise de altitudes, análise de pendentes
from: 585e500a
---

A superficie móstrase con curvas de nivel en canto existe. Todo o que trata este tema configúrase en **Visualización** no panel esquerdo. As opcións de visualización só cambian o que se ve (e o que se exporta); non son pasos de desfacer.

## Definir o intervalo das curvas de nivel

1. En **Visualización**, escolla un valor en **Curvas cada**.
   - En pés: 0,25, 0,5, 1, 2, 5, 10 ou 20 ft.
   - En metros: 0,1, 0,25, 0,5, 1, 2, 5 ou 10 m.
2. Escolla **Directora cada**: a 2.ª, 4.ª, 5.ª ou 10.ª curva.
   As curvas directoras débuxanse máis grosas e etiquétanse coa súa cota. Caen en múltiplos exactos do espazo entre directoras (con curvas de 1 ft e unha directora cada 5: 245, 250, 255 …).
3. Desactive {{ui:Etiquetas de curvas de nivel}} se as etiquetas saturan unha parcela pequena.

Un proxecto novo comeza con 1 unidade e unha curva directora cada 5. As curvas dóbranse nas liñas de quebra; se cortan en liña recta unha liña de desaugadoiro ou un cumio, esa liña aínda non é unha liña de quebra (ver [Construír e refinar a superficie](topic:build-surface)).

:::note
As curvas débuxanse só cando hai como máximo 2.000 niveis entre o punto máis baixo e o máis alto. Nun terreo con moito desnivel e un intervalo moi pequeno, o plano non mostra ningunha curva: escolla un intervalo maior.
:::

## Suavizar as curvas de nivel

As curvas trázanse en tramos rectos, un por cada triángulo da superficie, polo que xiran nunha pequena esquina en cada aresta do triángulo. **Suavizado de curvas de nivel** en **Visualización** redondea esas esquinas:

- **Ningún (tramos rectos)**: as liñas trazadas tal como están. É o que mostra un debuxo novo ou máis antigo.
- **Lixeiro**: esquinas un pouco redondeadas. Unha liña nunca se desprace máis do 10% do camiño cara á seguinte curva, nin se afasta do seu tramo recto máis que a sexta parte da lonxitude dese tramo.
- **Forte**: unha curva fluída. Unha liña nunca se desprace máis do 25% do camiño cara á seguinte curva, nin se afasta do seu tramo recto máis que a terceira parte da lonxitude dese tramo.

Con calquera das dúas opcións, unha curva suavizada segue cruzando cada aresta do triángulo no mesmo punto que a trazada, queda dentro do triángulo que cruza cada tramo e, por iso, nunca pode cruzar nin tocar outra curva. Onde unha curva cruza unha liña de quebra ou o límite, conserva a súa curva pronunciada. As liñas suavizadas son as que se debuxan e exportan (DXF, DWG, PDF, GIS e 3D), con máis vértices que as liñas trazadas.

O suavizado cambia só as liñas debuxadas. As cotas, os volumes, os perfís e as seccións seguen lendo da propia superficie. Unha curva que pasa exactamente polos puntos de levantamento (un punto a 250,00 na curva de 250) conserva unha pequena esquina en cada un deses puntos.

## Como se fai a superficie que hai detrás das curvas

As curvas seguen a superficie, e a superficie segue o **Método de curvas de nivel** en **Superficie** no panel esquerdo. O predeterminado, **Triangulación con interpolación lineal**, une os puntos en triángulos e conserva exactamente cada punto e cada liña de quebra. Os outros métodos axustan primeiro unha malla regular aos puntos (krigaxe, curvatura mínima, veciño natural, distancia inversa e outros), o que dá curvas máis redondeadas entre os puntos pero non pasa exactamente por todos eles; o informe da superficie en **Superficie** indica canto se separa o resultado dos seus puntos.

**ABOS (aproximación baseada en suavizado)** é un dos métodos de malla. Ten dous axustes propios: **Suavidade** (0,5 ao inicio; canto menor, máis suave) e **Precisión** (1 ao inicio: a superficie achégase ata o 1% do intervalo de alturas do terreo nos seus puntos; escriba un número menor para un axuste máis cercano). Se non pode alcanzar a precisión na malla que ten, o informe da superficie dío: escriba un **Espazado da malla** menor.

## Ler unha cota en calquera punto

Mova o punteiro sobre o plano. A barra de estado mostra:

- **E** e **N** baixo o punteiro
- **Terreo** e a cota do terreo existente nese punto, interpolada no triángulo baixo o punteiro
- **Nivelado** e a cota proposta, onde unha plataforma ou un corredor modificou o terreo
- «Fóra da superficie» fóra da superficie

Para ler un punto de levantamento con exactitude, escolla {{ui:Seleccionar}} e prema sobre o punto: o panel dereito mostra o número, o este, o norte, a cota, a descrición e o grupo.

## Mostrar bandas de altitude

1. Marque {{ui:Bandas de altitude}}.
   A superficie énchese de cor, desde o baixo (verde azulado) ata o alto (marrón ocre). Unha lenda debaixo das caixas de selección indica o intervalo de cotas de cada banda.
2. Escolla cantas bandas en **Bandas**: 5, 8, 10 ou 12. As bandas dividen o intervalo entre a cota máis baixa e a máis alta en pasos iguais.

As bandas son só para ver. Non se exportan a DXF nin se debuxan en PDF.

## Mostrar frechas de pendente

Marque {{ui:Frechas de pendente}}. Cada triángulo con tamaño suficiente leva unha frecha curta que apunta ladeira abaixo. Os triángulos planos non levan frecha. As frechas serven para comprobar rapidamente a dirección do drenaxe; o valor da pendente en si aínda non se etiqueta.

## Mostrar triángulos, puntos e arestas

- {{ui:Triángulos}} debuxa as arestas do TIN. Actívea para comprobar como a superficie une os puntos, sobre todo ao longo das liñas de quebra e no exterior.
- {{ui:Puntos}} debuxa cada punto de levantamento; {{ui:Etiquetas de puntos}} engade o seu número, cota e descrición (ou menos: ver **Etiquetas de puntos** en [Configuración de CivilCraft](topic:settings)).
- {{ui:Liñas de quebra}} debuxa as liñas de quebra (e o límite) en laranxa.
- {{ui:Bordo da superficie}} debuxa o contorno da superficie.

## Existente ou proposto

Cando unha plataforma ou un corredor se nivela sen problemas, **Superficie** en **Visualización** ofrece {{ui:Proposto (nivelado)}}. As curvas, as bandas e as frechas amosan entón a superficie nivelada, para que vexa o terreo novo e os taludes ao seu arredor. Para volver ao levantamento, cambie a {{ui:Terreo existente}}.

## Que se exporta

A saída en DXF e PDF segue estas opcións: o que desactivou non se escribe, e as curvas son as da superficie que se mostra. As bandas de altitude nunca se exportan.
