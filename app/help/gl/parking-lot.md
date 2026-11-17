---
title: Disposición do aparcadoiro
summary: Dispoña prazas, pasillos, prazas accesibles e para furgonetas e illas dentro dun contorno, nivele o aparcadoiro con pendentes cara aos desaugadoiros respecto do terreo existente, despois pavimente e planté. Tamén dispoñible para un asistente.
keywords: aparcadoiro, praza, pasillo, accesible, ada, furgoneta, illa, desaugadoiro, pendente, nivelado, desmonte, terraplén, pavimento, lousas, plantación, árbores, terreo, nube de puntos, mcp, asistente
from: 06c14da9
---

Encaixe un aparcadoiro nunha parcela, nunha plataforma ou nunha liña de elemento pechada, e obteña os recontos, o nivelado e a pavimentación nun só paso.

## Dispoñer o aparcadoiro

1. Seleccione unha parcela, unha plataforma ou unha liña de elemento pechada na planta.
2. Abra **Superficie, Máis, Aparcadoiro...**
3. Escolla as regras, o ángulo das prazas (90, 75, 60, 45, 30 graos ou paralelo) e os pasillos de un ou dous sentidos. Os tamaños de praza, pasillo e illa parten da táboa, e todos poden escribirse por riba.
4. Escolla **Dispoñer**.

As filas van ao longo da aresta do contorno que dá máis prazas (ou ao ángulo que escriba). Unha praza só conta se queda enteiramente dentro do contorno. Onde queda espazo para unha fila e un pasillo, engádese unha banda de carga simple. A xanela enumera as prazas, as accesibles e as de furgoneta, as illas, os desaugadoiros e a superficie por praza, e a planta amosa as prazas, as prazas accesibles cos seus pasillos de acceso con trama, as illas, as liñas centrais dos pasillos e os desaugadoiros nas súas propias capas (C-PARK-...), para que cheguen a PDF, DXF e DWG.

## Prazas accesibles

Coas regras dos Estados Unidos, o número segue a táboa 208.2 das Normas ADA de 2010 para as prazas previstas (unha de cada seis, redondeada cara arriba, é unha praza para furgoneta), colocadas máis preto da primeira esquina do contorno (a entrada), cada unha cun pasillo de acceso; dúas comparten un. Unha praza máis estreita que o ancho accesible, ou un pendente máis forte que 1:48 nas prazas accesibles, aparece como problema. **Estes números escribíronse da norma tal como se recordan e non se comprobaron coa norma impresa.** Os tamaños típicos de praza e pasillo proceden de guías de deseño de aparcadoiros e tamén están sen comprobar. Comprobe ambos, e a normativa local, antes de confiar neles. Escolla **Personalizado** para introducir o seu propio número de prazas accesibles.

## Pendentes cara a desaugadoiros, desmonte e terraplén

Salvo que o desactive, o aparcadoiro convértese nunha área de nivelado no espazo de traballo Paisaxe. Os desaugadoiros colócanse nas liñas centrais dos pasillos a cada 100 pés (30 m) aproximadamente; a superficie sobe desde cada desaugadoiro co pendente que dea (1,5 por cento para comezar), de xeito que cada punto cae cara ao desaugadoiro máis próximo. O nivel escóllese para que o desmonte e o terraplén do aparcadoiro se equilibren sobre o terreo existente. O terreo existente é a superficie existente do proxecto, que pode vir de puntos topográficos, LandXML, unha nube de puntos de lidar ou de escaneo convertida en superficie, ou de curvas de nivel. A xanela amosa a estimación de desmonte e terraplén; os volumes do proxecto amosan despois a cifra exacta. A área de nivelado mantén a súa aresta sobre o terreo existente, así que onde a nova superficie difire do terreo no bordo aparece un chanzo, e a xanela indica de que tamaño.

## Pavimentación e plantación

Todo o contorno recibe unha pavimentación de lousas (un patrón de soga que pode cambiar en Paisaxe, Obra dura), e cada illa recibe un parterre de arbustos e, se é suficientemente ancha, unha árbore, tomadas da lista de plantas. Despois, todo é un obxecto normal de Paisaxe: edítao, ou escolla **Dispoñer de novo** para substituír o que fixo o aparcadoiro. Eliminar o aparcadoiro elimina o que fixo.

## Desde un asistente

O mesmo aparcadoiro pódese pedir por MCP: `parking_layout` previsualiza, `parking_build` escribe, e `parking_remove` elimina un aparcadoiro. Pida por nome de parcela ou envíe o contorno.

## O que non está feito

Non se comproba se os pasillos chegan a unha rúa. A pavimentación cobre todo o contorno, así que a súa área inclúe as illas. As opcións de material de pavimento da Biblioteca e un tipo de Biblioteca para as prazas non están construídos; o patrón de pavimento é o de Obra dura. As regras doutros países non están construídas.
