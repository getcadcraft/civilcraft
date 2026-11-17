---
title: Calcular as horas de sol nun lugar
summary: Escolla un día (ou unha estación) e un fuso horario, e vexa as horas de sol directo en cada muro de cada masa e no terreo ao redor, co terreo debuxado no plano e os números en CSV.
keywords: sol, horas de sol, sombra, sombreado, acceso solar, horas de luz, fachada, muro, estación, solsticio, equinoccio, fuso horario, horario de verán, latitude, lonxitude, CSV, ráster
from: 4e32a314
---

**Horas de sol** conta as horas de sol directo que chegan a cada muro de cada masa de edificación e ao terreo ao redor, nun día que escolla ou promediadas nunha estación. As masas e o propio terreo proxectan sombra; nada máis o fai (non hai árbores nin veciños que non debuxou). A luz do ceo que non é sol directo non se conta.

## Antes de comezar

O lugar do sol vén da latitude e lonxitude do lugar, que proceden do **sistema de coordenadas** do proxecto. Un proxecto sen el recházase cunha mensaxe: fíxeo primeiro (**Coordenadas** no grupo SIG). Unha latitude e lonxitude escritas á man serían unha suposición, así que non hai campo para elas.

## Calcular

En **Propiedades**, baixo **Masas de edificación**, **Horas de sol**:

1. Escolla o **Día**. Empeza no día en que o sol está máis baixo no seu lugar (21 de decembro, ou 21 de xuño no hemisferio sur). Para unha estación, marque **Durante unha estación**, escolla o **Último día** e cada cantos días tomar mostra.
2. Escriba o **Fuso horario**: un nome como `America/Mexico_City`, ou un desfase respecto ao UTC como `-6`. Un nome segue as regras de horario de verán dese fuso para ese día; un desfase escrito úsase tal cal, así que use o que estea vixente ese día. A liña baixo a caixa indica o desfase que atopou.
3. Escolla cada cantos minutos situar o sol (cada 5, 10, 15 ou 30 minutos), e logo prema **Calcular as horas de sol**. Unha estación se executa en procesos en segundo plano; **Deter** a cancela.

## O que obtén

- Unha táboa por masa: o **peor muro**, a **media** e o **mellor muro**, en horas ao día, e unha táboa de cada muro coa súa orientación e as súas horas planta por planta.
- O terreo ao redor das masas, debuxado no plano do escuro (sen sol) ao amarelo (o máximo que recibe calquera celda), con lenda. As celdas baixo unha masa quedan en branco. **Amosar o terreo no plano** desactívao.
- **Muros en CSV** e **Terreo en CSV** gardan os números.

Para unha estación, as cifras son a media diaria dos días tomados como mostra. Non se garda nada no proxecto: o resultado é para consultar, e volver executalo volve xeralo.

## Cousas que convén saber

- Un muro só conta un momento como soleado cando mira ao sol e non hai nada no medio. Un muro que mira para o lado contrario non recibe nada.
- O terreo tómase en mostra nunha cuadrícula que depende do tamaño do lugar, e a posición do sol no punto medio de cada paso de tempo, así que as horas son correctas ata o paso escollido.
- A posición do sol é unha fórmula astronómica publicada, correcta ata aproximadamente un minuto de arco.
