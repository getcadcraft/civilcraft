---
title: Plataformas de vivenda en terreos inclinados
summary: Modele unha plataforma nunha ladeira: muros de contención como bordos da plataforma, o mapa de desmonte e terraplén sombreado por fondura con cotas puntuais (plano e 3D), unha sección trazada en calquera punto a través do terreo e do deseño, e rampas ou plataformas inclinadas para accesos.
keywords: plataforma, base de vivenda, terreo inclinado, ladeira, outeiro, muro de contención, desmonte e terraplén, mapa de desmonte e terraplén, cotas puntuais, sección libre, liña de sección, planos para o concello, acceso, rampa, plataforma inclinada, pendente, factor de esponxamento, movemento de terras
from: daa08a3f
---

Unha plataforma de vivenda é unha **plataforma** (**Deseño** › {{ui:Pad}}): un polígono plano a un nivel, modelado no terreo. Catro cousas axudan nunha ladeira.

## Muros de contención como bordos da plataforma

Seleccione a plataforma e poña un lado en {{ui:Vertical (retaining wall)}} en vez de unha pendente (**Propiedades** › {{ui:Sides and retaining walls}}, ou {{ui:Vertical: retaining walls}} para todos os lados á vez). A altura do muro lese do terreo ao longo del: cima no terreo, base na plataforma, mostrada nos dous extremos e no seu punto máis alto no plano, con aviso cando supera o límite que definiu. Muros e pendentes pódense combinar lado a lado.

## O mapa de desmonte e terraplén

Marque {{ui:Cut and fill map}} en **Amosar**. O plano sombrease segundo a profundidade do desmonte ou do terraplén, en intervalos iguais (desmonte en cor cálida, terraplén en azul, case nivelado en pálido), cunha lenda; e as **cotas puntuais** móstranse sobre a plataforma: a variación de nivel en puntos dunha cuadrícula, e o desmonte máis fondo e o terraplén máis alto marcados con ▲. As celas son as mesmas que usan os volumes de movemento de terras, así que o mapa e os números sempre coinciden.

Na vista 3D, escolla **Desmonte e terraplén** da lista de cores para pór as mesmas cores sobre o terreo e o deseño.

Un factor de esponxamento ou de contracción está na ferramenta de transporte de terras (**Deseño** › {{ui:Mass haul}}); non se aplica aos volumes dunha plataforma.

## Unha sección libre

En **Superficie** › {{ui:More}}, escolla {{ui:Free section}}, faga clic nos puntos da liña de sección en calquera lugar (pode dobrarse) e prema {{key:Enter}}. Un diálogo debuxa a sección: o terreo existente, o deseño modelado (en trazos) e o desmonte e o terraplén entre ambos, sombreados, coas súas áreas (o deseño só conta dentro das plataformas e estradas). {{ui:Vertical exaggeration}} toma por defecto o valor que axusta o debuxo; {{ui:Save as SVG}} e {{ui:Save as CSV}} dan un debuxo para o concello e os números.

## Rampas e plataformas inclinadas

En **Superficie** › {{ui:More}}, escolla {{ui:Ramp or sloped pad}}, faga clic no extremo baixo e despois no alto, prema {{key:Enter}}, e indique o ancho, o nivel no extremo baixo e a pendente. A plataforma é unha franxa cuxas esquinas levan eses niveis (o bordo entre dúas esquinas vai cunha pendente constante), e modela o terreo como calquera plataforma. As esquinas de calquera plataforma tamén poden levar os seus propios niveis, así que un acceso, unha rampa ou unha terraza inclinada é unha plataforma cun nivel en cada esquina.
