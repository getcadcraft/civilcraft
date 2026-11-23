---
title: Deseñar un perfil vertical
summary: Abrir a vista de perfil, comezar un perfil de proxecto desde o terreo, engadir e arrastrar PVI, fixar lonxitudes de curvas verticais e ler pendentes, valores K e puntos altos e baixos.
keywords: perfil, alineación vertical, pvi, curva vertical, pendente, valor k, convexa, cóncava, bvc, evc, vista de perfil, rasante de proxecto, rasante acabada, FG, perfil do terreo existente, liñas de elemento no perfil, cruzamentos, proxectadas, bordillo, cuneta, etiquetas
from: dbb1f32d
---

Cada trazado ten un perfil de proxecto: unha lista de PVI (estaca e cota) unidos por pendentes rectas, cunha curva vertical parabólica simétrica en cada PVI interior que teña lonxitude. O perfil do terreo existente tómase da superficie por vostede.

## Abrir a vista de perfil

1. Seleccione o trazado (prema sobre el con {{ui:Seleccionar}}).
2. Prema {{key:R}}, ou prema {{ui:Perfil}} na barra de ferramentas, ou {{ui:Ver perfil}} na parte inferior do panel dereito.
   A vista de perfil ábrese debaixo do plano co terreo existente ao longo do trazado. Con dous ou máis trazados, escolla un na lista á esquerda da barra de perfil.

A vista comeza amosando todo o trazado e estirando as cotas para encher o panel; a exaxeración imprímese na esquina inferior esquerda, por exemplo "Exaxeración vertical 10×".

## Ampliar e desprazar o perfil

- **Zoom:** xire a roda do rato (ou pinche nun trackpad) e a vista amplía ao redor do punteiro. Manteña {{key:Shift}} para ampliar só as estacas, ou {{key:Alt}} para ampliar só as cotas (isto cambia a exaxeración). Con a vista de perfil enfocada, as teclas de máis e menos amplían desde o centro.
- **Desprazamento:** arrastre co botón dereito ou central do rato, ou pase dous dedos nun trackpad.
- **Axustar:** faga dobre clic no perfil ou prema {{key:F}} para amosar de novo todo o trazado.

Editar un PVI mantén o zoom que escolleu; non volve ao axuste.

Mova o punteiro ao longo do perfil: a barra amosa a estaca, as cotas do terreo e do proxecto, a pendente e o desmonte ou terraplén alí, e un punto segue o trazado no plano.

## Comezar o perfil de proxecto

1. No panel dereito, baixo **Perfil de proxecto**, prema {{ui:Comezar desde o terreo}}.
   Dous PVI colócanse no terreo nos dous extremos do trazado, unidos por unha pendente recta. A barra de estado di: "Perfil de proxecto comezado no terreo nos dous extremos. Active Engadir PVI e prema para engadir cambios de pendente; dea unha lonxitude de curva na táboa."

Se o trazado non cruza a superficie, aparece a indicación de que este trazado non ten terreo debaixo desde o que comezar. Entón engada PVI premendo, como se explica na seguinte sección.

## Engadir PVI

1. Prema {{key:I}}, ou prema {{ui:Engadir PVI}} na barra de perfil. Queda premido.
2. Prema no perfil onde queira un cambio de pendente. Engádese un PVI nesa estaca e cota, redondeado a 0.01, e queda seleccionado.
3. Engada os que precise, e logo prema {{key:I}} de novo para parar de engadir.

Un clic onde xa hai un PVI recházase (xa hai un PVI en …). Os PVI mantéñense sempre en orde de estaca.

## Encaixe ao engadir ou arrastrar

O botón **Encaixe** da barra de perfil está activado ao inicio. Mentres está activado, un PVI que engada ou arrastre cae sobre o PVI máis próximo, un punto do terreo, a estaca dun PVI ou a liña do terreo, e unha etiqueta xunto ao marcador indica cal. Manteña {{key:Alt}} para un punto libre, en calquera lugar.

## Axustar PVI

- **Arrastre** un PVI no perfil para movelo. Non pode pasar aos seus veciños. O movemento é un paso de desfacer.
- **Escriba** valores exactos na táboa de PVI do panel dereito: **Estaca**, **Cota**, **Pendente %** e **Lonxitude de curva** (lonxitude da curva vertical). Prema {{key:Enter}} despois de cada un.
- **Escolla** un valor do perfil: o pequeno botón xunto á estaca ou cota dun PVI espera un clic na vista de perfil e enche ese valor. O clic encaixa como en Engadir PVI; manteña {{key:Alt}} para un punto libre; {{key:Esc}} cancela.
- **Pendente %** é a pendente da tanxente que comeza nese PVI e chega ao seguinte. Escribila move a cota do **seguinte** PVI (a súa estaca nunca se move). Se o seguinte PVI está bloqueado, móvese en cambio a cota do PVI anterior.
- **Bloquee** un PVI co cadeado ao final da súa fila. Un PVI bloqueado non se arrastra, e unha edición de pendente non o move. Se os dous extremos dunha tanxente están bloqueados, a súa pendente non pode cambiar: a barra de estado di isto, e primeiro cómpre desbloquear un extremo. O bloqueo gárdase no ficheiro.
- **Elimine** un PVI coa x ao final da súa fila, ou selecciónao (prema sobre el) e prema {{key:Delete}}. Cando a vista de perfil ten o foco, {{key:Backspace}} tamén o elimina.

O primeiro e o último PVI nunca reciben unha curva.

## Curvas verticais

1. Escriba unha lonxitude en **Lonxitude de curva** para un PVI interior, por exemplo 200.
2. A curva debuxase centrada no PVI. O perfil e o panel dereito amosan o seu tipo (convexa ou cóncava), L e K, as estacas e cotas de BVC e EVC, e o seu punto alto ou baixo cando o ten dentro da curva.

K sáese de L (K = L dividido pola diferenza algébrica de pendentes, en porcentaxe). Vostede escribe L; escribir K directamente aínda non está dispoñible.

Se unha curva vertical non cabe, unha caixa vermella indica por que: volve sobre o PVI ou a curva anterior, ou pasa do seguinte PVI, e canto espazo hai dese lado (unha curva precisa a metade da súa lonxitude a cada lado do seu PVI). O seu botón fixa **a curva máis longa que cabe**, co seu K, nun só paso ({{key:Mod+Z}} desfaino). Ou separe os PVI.

## Ler os datos

Debaixo da táboa de PVI, unha lista dá cada pendente en porcentaxe (Pendente 1: +1.25%) e cada curva, por exemplo Convexa en 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40), e logo Punto alto 1+62.40, 254.12.

Se os PVI non chegan aos dous extremos do trazado, unha nota indícao. Un corredor só se constrúe onde se solapan o perfil e o trazado.

## Liñas de elemento no perfil

As liñas de elemento tamén se amosan na vista de perfil, para ver un bordillo, unha cuneta ou o alto dun muro fronte ao perfil da estrada.

- Onde unha liña de elemento **cruza** o trazado, o perfil amosa un pequeno rombo nesa estaca e cota, con etiqueta do nome da liña e a súa cota alí (a cota propia da liña, calculada ao longo do segmento que cruza).
- Escriba unha distancia en {{ui:Ao lado, dentro de}} para debuxar tamén as liñas de elemento que **corren ao lado** do trazado dentro desa distancia, como liñas de trazos á súa propia cota. Baleiro ou 0 amosa só os cruzamentos.
- As marcas e as etiquetas seguen cada cambio: mova un vértice, escriba unha pendente ou eleve a liña, e o perfil amosa as novas cotas de inmediato.
- Prema no rombo dun cruzamento para seleccionar esa liña de elemento; a liña seleccionada debúxase na cor de realce.
- {{ui:Liñas de elemento}} na barra de perfil oculta ou amosa todas. Ambos os dous axustes gárdanse co proxecto.

Véxase [Liñas de elemento](topic:feature-lines).

## Seguinte

- [Varrer un corredor viario](topic:corridor) ao longo do trazado e deste perfil.
- O perfil escríbese en LandXML co trazado; véxase [Intercambio de LandXML](topic:landxml).
