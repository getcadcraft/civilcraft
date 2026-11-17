---
title: "Futuros climáticos: inundación, calor e incendio forestal en 2050 e 2080"
summary: En Do enderezo ao emprazamento, eleve o nivel de inundación do sitio para un clima futuro, avalíe a exposición a incendios forestais e modifique un ficheiro meteorolóxico, presente xunto a futuro, a partir dun paquete de datos climáticos (SSP2-4.5 e SSP5-8.5, 2050 e 2080).
keywords: clima, cambio climático, futuro, 2050, 2080, ssp, cmip6, escenario, nivel do mar, inundación, cota base de inundación, bfe, fema, calor, ficheiro meteorolóxico, epw, morph, incendio forestal, lume forestal
from: b0d2ee38
---

As cifras climáticas proceden dun **paquete de datos**, non da aplicación. Active o complemento {{ui:Futuros climáticos}} en Configuración › Complementos, ou cargue un ficheiro de paquete propio no bloque {{ui:Futuro climático}}.

:::warning
O paquete que vén co complemento é unha **mostra**: tres lugares (Denver, Miami, Xohanesburgo), un modelo climático, cinco anos en cada período de 20 anos. Está para probar as ferramentas, **non para deseño**. Un paquete completo constrúese con `tools/climate/build-pack.mjs` a partir dos datos NEX-GDDP-CMIP6 da NASA.
:::

## Onde está

Superficie › Máis › Do enderezo ao emprazamento. Fixe o punto, engada as capas (unha capa de inundación da FEMA dá a cota base de inundación) e prema o botón que lee o sitio. Baixo as filas do sitio está o bloque {{ui:Futuro climático}}: escolla un **Escenario** (SSP2-4.5 ou SSP5-8.5) e un **Ano** (2050 = 2041-2060, 2080 = 2071-2090, ambos fronte a 1995-2014). Úsase o lugar do paquete máis próximo ao punto, ou o que escolla; lonxe de todos os lugares, usanse as variacións medias globais e o panel dino.

## Cota de inundación de deseño

O nivel actual é a cota base de inundación da FEMA cando a capa de inundación a tiña (pés, NAVD 88); se non, escriba a súa propia. Escolla o tipo de inundación (costeira, fluvial ou chuvia intensa, ou ambas), a profundidade da inundación no sitio para a parte de chuvia, e un resgardo se o quere. {{ui:Elevar o nivel de inundación}} mostra o nivel actual e o futuro lado a lado, as partes do nivel do mar e da chuvia, e as hipóteses: a subida total do nivel do mar engádese a un nivel costeiro; o caudal fluvial sobe en proporción un a un coa chuvia do día máis húmido e a profundidade segue o caudal elevado á potencia 0.6 (Manning, canle ancha); as partes súmanse.

:::warning
Unha análise preliminar do cambio, non un estudo de inundación. O nivel de inundación de deseño é o que determine a autoridade ou o seu enxeñeiro.
:::

## Exposición a incendios forestais (só análise preliminar)

A vexetación máis próxima, a pendente que sobe desde ela e a distancia dan unha banda desde moi baixa ata extrema, actual e futura (a futura multiplica pola variación do índice meteorolóxico de incendio do paquete). **Só análise preliminar:** a nosa propia escala relativa para saber se un sitio precisa unha avaliación de incendio forestal en condicións; non é unha clasificación normativa.

## Calor: un ficheiro meteorolóxico futuro

Escolla un ficheiro `.epw` actual e {{ui:Crear o ficheiro meteorolóxico futuro}}: modifícase co método publicado de desprazamento e estiramento (Belcher, Hacker e Powell 2005) e compárase o calor (temperatura media e máxima, temperaturas de deseño, horas por riba de 30 °C e 35 °C, graos-día). {{ui:Gardar o ficheiro meteorolóxico futuro}} gárdao para o panel Ambiente, para a comprobación de enerxía de BimCraft ou para as súas propias ferramentas.

## De onde proceden as cifras

NASA NEX-GDDP-CMIP6 (saídas de modelos CMIP6 reducidas de escala, CC BY 4.0 por modelo) para temperatura, humidade, insolación, chuvia e meteoroloxía de incendio; a media global do IPCC AR6 para a subida do nivel do mar, salvo que o paquete traia cifras locais. O panel mostra a fonte, a licenza e a data do paquete.
