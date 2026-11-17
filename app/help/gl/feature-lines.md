---
title: Liñas de elemento
summary: Debuxe liñas 3D que pendentea vértice a vértice, cree desfasamentos escalonados delas e úseas como liñas de ruptura do terreo ou como plataformas inclinadas no deseño.
keywords: arco, curva, radio, arco 3D, hélice, bordillo curvo, sobreposición de pendente, sobreposición de cotas, frechas de pendente, liña de elemento, pendente, inclinación, cota, desfase escalonado, desfase, liña de ruptura, bordillo, cuneta, berma, plataforma inclinada, talude, movemento de terras, polilínea 3D
from: d55b25fb
---

Unha liña de elemento é unha liña cunha cota en cada vértice: un bordillo, a liña de corrente dunha cuneta, a cima dunha berma, o bordo dunha plataforma inclinada. Define as súas cotas por número ou por pendente, cópiaa lateralmente cun chanzo para arriba ou para abaixo, e escolle o que fan con ela as superficies.

## Debuxar unha

1. Escolla **Superficie** › {{ui:Máis}} › {{ui:Liña de elemento}}, ou prema {{key:L}}.
2. Faga clic nos seus vértices no plano. Un clic sobre un punto de levantamento toma o lugar e a cota dese punto; en calquera outro sitio o vértice toma a cota do terreo existente naquel punto.
3. Prema {{key:Enter}} para rematar unha liña aberta, ou faga clic de novo no primeiro vértice para pechala.

A nova liña queda seleccionada e comeza como liña de ruptura do terreo existente, apoiada no chan.

## Arcos

Un segmento pode ser un arco en planta cuxos extremos están a cotas diferentes: unha curva de bordillo, unha cuneta curva, unha rampa que xira. A súa pendente vai uniformemente ao longo do arco, e a súa lonxitude mídese seguindo a curva.

- **Mentres debuxa:** prema {{key:C}} (nunha pantalla táctil, {{ui:Arco}} na barra sobre o plano) para activar os arcos. Despois dun vértice, faga clic nun punto da curva, logo faga clic onde remata o arco. Prema {{key:C}} de novo para os segmentos rectos. {{key:Backspace}} quita primeiro o punto da curva.
- **Despois:** en **Propiedades**, escriba un radio e o sentido do xiro na caixa **Arco** do vértice, por exemplo `50 L` ou `50 R` (esquerda ou dereita segundo avanza pola liña), e prema {{key:Enter}}. Deixe a caixa baleira para que o segmento volva ser recto. Un radio menor que a metade do segmento recházase.

A liña seleccionada mostra o radio de cada arco xunto á súa pendente. **Lonxitude** é ao longo dos arcos en planta; **Lonxitude 3D** conta tamén a subida e a baixada. Os desfasamentos escalonados conservan os arcos: un arco no lado de fóra dunha curva crece, o de dentro encolle, e un desfase que pasa do centro dun arco recházase.

As superficies, a vista 3D, o DXF e o DWG toman cada arco como tramos rectos curtos que quedan a menos de 0,01 da curva. LandXML consérvaos como arcos (ver **Arcos noutros ficheiros** máis abaixo).

## Fixar cotas e pendentes

**Propiedades** lista os vértices coa súa distancia ao longo da liña, a súa **Cota** e a **Pendente ata o seguinte** (en por cento). Escriba calquera das dúas e prema {{key:Enter}}:

- Unha cota move só ese vértice.
- Unha pendente fixa a cota no extremo afastado do seu segmento; os vértices posteriores quedan onde están, así que cambia a pendente do seguinte segmento.

Tamén en **Propiedades**:

| Acción | Que fai |
|---|---|
| **Subir ou baixar todo en** | Engade a altura que escriba a cada vértice. |
| {{ui:Cotas do terreo}} | Devolve cada vértice ao terreo existente (os vértices fóra da superficie conservan a súa cota e aparecen listados). |
| {{ui:Unha pendente, do primeiro ao último}} | Conserva as cotas primeira e última e pon os vértices intermedios nunha pendente uniforme. |

A liña seleccionada mostra as súas cotas nos vértices e as súas pendentes ao longo dos segmentos no plano. Arrastre un vértice con {{ui:Seleccionar}} para movelo; a súa cota mantense.

## Desfases escalonados

Baixo **Desfase escalonado**, escriba unha **Distancia** (positiva á dereita da dirección da liña, negativa á esquerda), despois unha altura (subida ou baixada de) ou unha pendente en por cento, e prema {{ui:Crear a liña desfasada}}. A copia é unha nova liña de elemento: por exemplo, a parte traseira dun bordillo a 0,5 ft ao lado e 0,5 ft máis alta, ou o bordo dunha cuneta a 6 ft para fóra cun 2 %. Recházase unha distancia que faría a copia dobrarse sobre si mesma nunha curva pechada.

## Pendentes e cotas na pantalla

Prema {{key:E}}, ou marque **Pendentes e cotas nas liñas de elemento** en **Visualización**, para ver a pendente de cada liña de elemento ao longo de cada segmento (cunha pequena frecha que apunta cara abaixo) e a súa cota nos vértices. Móstranse só na pantalla: non se engade nada ao debuxo, e o PDF, o DXF e o DWG quedan como están. Os segmentos curtos e os vértices apretados quedan sen etiqueta ata que achegue o zoom. A liña seleccionada mostra sempre as súas propias pendentes e cotas.

## Na vista de perfil

Unha liña de elemento que cruza un trazado aparece na vista de perfil dese trazado, co seu nome e a súa cota no cruce; tamén poden mostrarse as liñas que corren ao seu lado. Ver [Deseñar un perfil lonxitudinal](topic:profile).

## Que fan as superficies con ela

Escolla **Uso**:

| Uso | Que pasa |
|---|---|
| Liña de ruptura do terreo existente | O terreo existente pasa pola liña nas súas cotas, como unha liña de ruptura debuxada. |
| Nivelada no deseño | Unha liña **pechada** convértese nunha plataforma inclinada: a superficie proposta dentro dela nivelase ata o seu bordo. Active **Talude de encontro ao terreo** para trazar os taludes de desmonte e recheo (horizontal a 1 vertical) desde o seu bordo ata o terreo, como fai unha plataforma; cada talude comeza na cota propia do bordo nese punto. |
| Só debuxada | Queda no plano e sae en DXF, DWG e PDF (capa C-GRAD-FEAT, polilíneas 3D), pero as superficies ignórana. |

Os volumes, as seccións e a vista 3D inclúen as liñas de elemento niveladas no deseño, como as plataformas. Cada cambio é un paso: {{key:Mod+Z}} desfai.

## Compartir liñas co seu equipo

Nun debuxo aberto desde os seus ficheiros na nube en CadCraft Studio, nun plan de equipo, as **Propiedades** do proxecto (sen nada seleccionado) teñen unha sección **Equipo** con {{ui:Liñas do equipo…}}: as liñas que o seu equipo compartiu, cada unha coa súa revisión, sen seleccionar antes unha liña de elemento. Seleccione unha liña para compartila, enviar unha nova revisión, traer a revisión do equipo ou deixar de compartila. Fóra desa configuración, a sección indica o que necesita.

## Arcos noutros ficheiros

| Ficheiro | Que pasa cunha liña de elemento con arcos |
|---|---|
| Proxecto de CivilCraft | Consérvase exactamente. |
| LandXML | Escríbese como elemento de plano de liñas e arcos coas súas cotas, e léese de novo cos seus arcos. Unha liña de elemento doutro programa entra como **Só debuxada**: escolla o seu **Uso** para metela nunha superficie. |
| DWG e DXF | Unha polilínea 3D non pode conter un arco, así que a liña escríbese como tramos curtos a menos de 0,01 de cada arco. CivilCraft tamén anota no debuxo cales tramos eran arcos: ao abrir o debuxo como liñas, {{ui:Liñas de elemento}} devolve as liñas como liñas de elemento cos seus arcos. Outros programas ven unha polilínea 3D normal. |
