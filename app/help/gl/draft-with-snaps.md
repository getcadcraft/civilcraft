---
title: Debuxar con enganches, esquinas escollidas e mover, copiar e xirar
summary: Sitúe trazados, plataformas, parcelas e liñas de elemento exactamente sobre puntos e esquinas que xa existen, escriba ou escolla o este e o norte dunha esquina, xire unha tanxente cara a dous puntos, e mova, copie ou xire un obxecto unha distancia ou un ángulo.
keywords: enganche, enganches, osnap, enganche a punto, enganche a esquina, PI, vértice, esquina, escoller, mira, este, norte, coordenadas, coordenadas escritas, tanxente, dirección, rumbo, mover, copiar, xirar, transformar, copiar xirado, duplicar, alt, punto libre, debuxo
from: 49864dda
---

Novidade na 0.9: ao debuxar, o cursor cae sobre os puntos e as esquinas que xa existen no plano, e unha esquina de plataforma, parcela ou liña de elemento pode escribirse ou escollerse. Este tema percorre as tres ferramentas.

## O que fará

- Debuxar con enganches, para que un novo trazado, plataforma, parcela ou liña comece e remate exactamente sobre algo que xa existe.
- Fixar o este e o norte dunha esquina escribíndoo ou escollendo un lugar no plano.
- Xirar a tanxente dun trazado cara a dous puntos escollidos.
- Mover, copiar ou xirar un obxecto completo.

## Pasos

1. Escolla unha ferramenta de debuxo, por exemplo {{ui:Trazado}}, {{ui:Plataforma}}, {{ui:Parcela}} ou {{ui:Liña de elemento}}. Mova o punteiro preto dun punto de levantamento, dun PI de trazado, dunha esquina de plataforma, parcela ou masa, dun vértice de liña de elemento ou dunha estrutura pluvial. Aparece unha marca cunha etiqueta (PI, Esquina, Vértice, Estrutura ou Punto e o seu número) e o este e o norte onde caerá o punto. Prema para colocar o punto alí.
2. Para colocar un punto libremente, manteña premido {{key:Alt}} ao premer. O enganche desactívase.
3. Seleccione unha plataforma, parcela ou liña de elemento. En Propiedades, o bloque {{ui:Esquinas}} lista cada esquina cunha caixa de Este e unha caixa de Norte. Escriba novos números, ou prema o botón de mira xunto a unha esquina e prema un lugar no plano. A esquina toma ese este e ese norte. Prema {{key:Esc}} para cancelar unha selección. A mira só funciona no plano: peche antes a vista 3D.
4. Para xirar unha tanxente, seleccione un trazado. En Propiedades, debaixo de {{ui:Tanxente desde dous puntos}}, escolla a tanxente, prema {{ui:Primeiro punto}} e prema no plano, prema {{ui:Segundo punto}} e prema de novo, e despois prema {{ui:Definir a dirección}}. A tanxente xira para ir desde o primeiro punto cara ao segundo e conserva a súa lonxitude.
5. Para mover, copiar ou xirar, seleccione un trazado, plataforma, parcela ou liña de elemento. En Propiedades, debaixo de {{ui:Mover, copiar e xirar}}, escriba {{ui:Mover cara ao leste}} e {{ui:Mover cara ao norte}} (os números negativos vanse cara ao oeste e ao sur) e prema {{ui:Mover}} ou {{ui:Copiar}}. Ou prema {{ui:Distancia desde dous puntos}} e prema o punto desde o que se move e o punto ao que se move.
6. Para xirar, escriba o ángulo en {{ui:Xirar en sentido antihorario}} (en graos) e prema {{ui:Xirar}} ou {{ui:Copiar xirado}}. Xira arredor do centro das súas esquinas, a non ser que escolla un punto arredor do cal xirar co botón de mira xunto ao ángulo.

## Notas

- Unha copia deixa o orixinal onde está e queda seleccionada despois.
- Cada movemento, copia, xiro, esquina escollida e tanxente xirada é un paso de desfacer.
- Os enganches chegan a 10 píxeles de pantalla desde o cursor. Unha marca de enganche só ofrece un lugar; non se muda nada ata que prema.
- A mesma mira aparece nas filas de PI dun trazado. Ver [Trazados](topic:alignment), [Parcelas](topic:parcels) e [Liñas de elemento](topic:feature-lines).
