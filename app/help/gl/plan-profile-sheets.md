---
title: Follas de planta e perfil
summary: Xerar un trazado como un conxunto de follas de planta e perfil nun só PDF, con liñas de unión entre elas.
keywords: planta e perfil, follas, xerar, pdf, liña de unión, produción de planos, planos de estradas, xerado de perfil, exaxeración vertical, conxunto de follas
from: 34b4ec78
---

As follas de planta e perfil son a forma habitual de debuxar os planos de estradas: cada folla mostra un tramo da estrada dúas veces, a planta arriba e o perfil abaixo, á mesma escala horizontal, de modo que unha estación queda no mesmo lugar nos dous.

## Crear as follas

1. Seleccione o trazado. En **Propiedades**, prema {{ui:Plan and profile sheets}}.
2. Escolla o **Papel**, a **Escala da planta** e a **Exaxeración do perfil** (cantas veces máis alto se debuxa o perfil que longo; 10× para empezar). O diálogo indica cantas follas se crean e canta parte do trazado mostra cada unha.
3. Para xerar só unha parte do trazado, cambie **Desde a estación** e **Ata a estación**.
4. Prema {{ui:Download PDF}}. O PDF ten unha páxina por folla.

## Que hai nunha folla

| Parte | Que mostra |
|---|---|
| Planta | Todo o que hai na planta (curvas de nivel, puntos de levantamento, o trazado coa súa estacionamento, corredores, plataformas, liñas características, tubaxes, liñas de mostraxe) xirado para que este tramo atravese a folla, cunha frecha norte xirada en consecuencia |
| Liñas de unión | Unha liña de trazos e puntos perpendicular ao trazado en cada extremo que continúa noutra folla, con unha etiqueta "Liña de unión est. 5+50.00, ver folla 2" |
| Perfil | O terreo existente (a trazos), o perfil de proxecto (vermello), a pendente de cada tanxente e o PVI, a cota, L e K de cada curva vertical; as estacións na parte inferior e as cotas nos dous lados |
| Cartela do título | O nome do proxecto, o trazado e o seu intervalo de estacións, "Folla 1 de 3", as escalas horizontal e vertical e a exaxeración |

O tramo por folla é tan longo como permita a ventá da planta á escala, redondeado a un múltiplo enteiro de 50 ft (20 m) nos tramos longos ou de 10 ft (5 m) nos curtos.

:::note
Cando as cotas do perfil non caben coa exaxeración escollida, CivilCraft debuxa todas as follas coa maior das exaxeracións 10×, 5×, 4×, 2× e 1× que cabe, e a barra de estado indícao. Un trazado curvo xírase segundo a dirección do principio ao final de cada tramo, polo que a estrada pode subir ou baixar lixeiramente na folla.
:::
