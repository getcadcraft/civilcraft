---
title: Deseñar un perfil lonxitudinal
summary: Abra a vista de perfil, comece un perfil de deseño desde o terreo, engada e arrastre PVI, estableza as lonxitudes das curvas verticais e lea pendentes, valores K e puntos altos e baixos.
keywords: perfil, aliñación vertical, pvi, curva vertical, pendente, valor k, cume, val, bvc, evc, vista de perfil, rasante, fg, perfil do terreo existente, liñas de elemento no perfil, cruzamentos, proxectado, bordo, cuneta, etiquetas
from: e9182bfa
---

Cada aliñación ten un perfil de deseño: unha lista de PVI (estación e cota) unidos por pendentes rectas, cunha curva vertical parabólica simétrica en cada PVI interior que teña lonxitude. O perfil do terreo existente tómao CivilCraft da superficie por vostede.

## Abrir a vista de perfil

1. Seleccione a aliñación (prema nela con {{ui:Seleccionar}}).
2. Prema {{key:R}}, ou prema {{ui:Perfil}} na barra de ferramentas, ou {{ui:Ver perfil}} na parte inferior do panel da dereita.
   A vista de perfil ábrese baixo o plano co terreo existente ao longo da aliñación. Con dúas ou máis aliñacións, escolla unha na lista á esquerda da barra de perfil.

A vista sempre amosa toda a aliñación e estira as cotas para encher o panel; a exageración vertical impríndese na esquina inferior esquerda, por exemplo «Exageración vertical 10×». Non fai zoom nin desprazamento.

Mova o punteiro ao longo do perfil: a barra amosa a estación, as cotas do terreo e de deseño, a pendente e o desmonte ou terraplén nese punto, e un punto segue a aliñación no plano.

## Comezar o perfil de deseño

1. No panel da dereita, en **Perfil de deseño**, prema {{ui:Comezar desde o terreo}}.
   Colócanse dous PVI sobre o terreo nos dous extremos da aliñación, unidos por unha pendente recta. A barra de estado di «Perfil de deseño iniciado sobre o terreo nos dous extremos. Active Engadir PVI e prema para engadir cambios de pendente; dé lles unha lonxitude de curva na táboa».

Se a aliñación non cruza a superficie, aparece «Esta aliñación non ten terreo debaixo desde o que comezar». Entón engada PVI premendo no seu lugar (sección seguinte).

## Engadir PVI

1. Prema {{key:I}}, ou prema {{ui:Engadir PVI}} na barra de perfil. Queda premido.
2. Prema no perfil onde queira un cambio de pendente. Engádese un PVI nesa estación e cota, redondeado a 0,01, e queda seleccionado.
3. Engada os que precise, e logo prema {{key:I}} de novo para deixar de engadir.

Un clic onde xa hai un PVI recházase («Xa hai un PVI en …»). Os PVI mantéñense sempre en orde de estación.

## Axustar PVI

- **Arrastre** un PVI no perfil para movelo. Non pode pasar os seus veciños. O movemento é un paso de desfacer.
- **Escriba** valores exactos na táboa de PVI do panel da dereita: **Estación**, **Cota** e **Curva L** (lonxitude da curva vertical). Prema {{key:Enter}} despois de cada un.
- **Elimine** un PVI coa x ao final da súa fila, ou seleccióneo (prema nel) e prema {{key:Delete}}. Cando a vista de perfil ten o foco, {{key:Backspace}} tamén o elimina.

O primeiro e o último PVI nunca reciben curva.

## Curvas verticais

1. Escriba unha lonxitude en **Curva L** para un PVI interior, por exemplo 200.
2. A curva debúxase centrada no PVI. O perfil e o panel da dereita amosan o seu tipo (cume ou val), L e K, as estacións e cotas de BVC e EVC, e o seu punto alto ou baixo cando o ten dentro da curva.

K calcúlase a partir de L (K = L dividido pola diferenza alxébrica das pendentes, en porcentaxe). Vostede escribe L; escribir K directamente aínda non está dispoñible.

Se unha curva vertical non cabe, unha caixa vermella indica o motivo: retrocede cara ao PVI ou á curva anterior, ou pasa do seguinte PVI, e canto espazo hai dese lado (unha curva necesita a metade da súa lonxitude a cada lado do seu PVI). O seu botón fixa **a curva máis longa que cabe**, co seu K, nun só paso ({{key:Mod+Z}} desfai). Ou separe os PVI.

## Ler os datos

Baixo a táboa de PVI, unha lista indica cada pendente en porcentaxe («Pendente 1: +1,25 %») e cada curva, por exemplo «Cume en 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)», e logo «Punto alto 1+62.40, 254.12».

Se os PVI non chegan aos dous extremos da aliñación, unha nota indícao. Un corredor só se constrúe onde se solapan o perfil e a aliñación.

## Liñas de elemento no perfil

As liñas de elemento tamén se amosan na vista de perfil, para ver un bordo, unha cuneta ou o alto dun muro contra o perfil da estrada.

- Onde unha liña de elemento **cruza** a aliñación, o perfil amosa un pequeno rombo nesa estación e cota, etiquetado co nome da liña e a súa cota alí (a propia cota da liña, calculada ao longo do segmento que cruza).
- Escriba unha distancia en {{ui:Ao lado, dentro de}} para debuxar tamén as liñas de elemento que **van ao lado** da aliñación dentro desa distancia, como liñas a trazos á súa cota. Baleiro ou 0 amosa só os cruzamentos.
- As marcas e etiquetas seguen todos os cambios: mova un vértice, escriba unha pendente ou eleve a liña, e o perfil amosa ao instante as novas cotas.
- Prema no rombo dun cruzamento para seleccionar esa liña de elemento; a liña seleccionada debúxase na cor de destaque.
- {{ui:Liñas de elemento}} na barra de perfil oculta ou amosa todas. Ambos os dous axustes gárdanse co proxecto.

Vexa [Liñas de elemento](topic:feature-lines).

## Seguinte

- [Barrer un corredor viario](topic:corridor) ao longo desta aliñación e deste perfil.
- O perfil escríbese en LandXML coa aliñación; vexa [Intercambiar LandXML](topic:landxml).
