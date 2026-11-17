---
title: Deseño de rego
summary: Unha axuda de cálculo, non un deseño selado: aspersores, ramais, tubaxe principal, válvulas e liñas de goteo no sitio; zonas atopadas a partir das tubaxes; perda de presión por Hazen–Williams, a presión no peor caso, caudal e presión fronte ao subministro, intensidades de precipitación, tempos de rega, cobertura e unha lista de materiais.
keywords: rego, aspersor, aspersores, pulverizador, rotor, boquilla rotativa, borbulleador, goteo, liña de goteo, emisor, válvula, zona, estación, programador, tubaxe principal, ramal, punto de conexión, subministro de auga, presión, psi, kpa, caudal, gpm, perda por fricción, hazen williams, intensidade de precipitación, tempo de rega, cobertura, cabeza a cabeza, lista de materiais
from: 7d6342c1
---

:::warning
Isto é unha axuda de cálculo, non un deseño selado: un deseñador de rego comproba cada resultado antes de construír nada.
:::

## Organizar o sistema

1. Na sección **{{ui:Irrigation}}** á esquerda, escolla o **Aspersor**, o seu **Arco** e onde empeza o arco, e os diámetros das tubaxes para os ramais e a tubaxe principal.
2. {{ui:Irrigation}} › {{ui:Point of connection}}: faga clic onde se une o subministro de auga. Defina a súa **presión**, o **caudal dispoñible** e a perda do contador e do antirretorno en Propiedades.
3. {{ui:Irrigation}} › {{ui:Valve}}: faga clic onde vai a válvula de cada zona. Unha válvula inicia unha zona.
4. {{ui:Irrigation}} › {{ui:Head}}: faga clic para colocar aspersores; cada clic coloca un.
5. {{ui:Irrigation}} › {{ui:Lateral pipe}}: faga clic desde unha válvula, pasando polos seus aspersores, e prema {{key:Enter}}. {{ui:Mainline}}: desde o punto de conexión ata cada válvula.

Os extremos das tubaxes encaixan nos aspersores, nas válvulas, no subministro e noutros extremos de tubaxe, así que a rede se une. Unha zona é todo o que se alcanza desde a súa válvula polos ramais; a tubaxe principal leva unha zona de cada vez.

## Goteo

{{ui:Irrigation}} › {{ui:Drip line}}: faga clic ao longo da liña, comezando onde se alimenta (o extremo dun ramal ou unha válvula). Defina o **caudal do emisor** e o **espazamento** en Propiedades; o seu caudal é o dos emisores que hai ao longo dela.

## A comprobación

{{ui:Irrigation}} › {{ui:Check the system…}} lista todas as zonas:

| Columna | Como se calcula |
|---|---|
| Caudal | A suma dos caudais dos aspersores (e das liñas de goteo) |
| Na válvula | A presión de traballo do aspersor no peor caso máis as perdas nas tubaxes ata el (Hazen–Williams, o diámetro interior da tubaxe, a variación de cota) e a perda pola válvula |
| No subministro | O mesmo máis a perda da tubaxe principal que leva esa zona, e a perda do contador e do antirretorno |
| Precipitación | O caudal dos aspersores repartido pola superficie que regan, a espazamento cabeza a cabeza |
| Minutos á semana | Para aplicar o axuste **Rega á semana** |
| Problemas | Velocidade por riba do límite, un aspersor fóra do seu rango de presión, pulverizadores e rotores nunha mesma válvula, presión ou caudal insuficientes no subministro, aspersores sen zona, bucles |

Seleccione unha válvula para ver os datos da súa zona e o aspersor de peor caso marcado con círculo no plano. A lista de materiais conta os aspersores por tipo e arco, as tubaxes por diámetro, as válvulas, a liña de goteo e os emisores, e as estacións do programador. **Gardar como CSV** conserva ambas as dúas.

Axustes na sección Rego: **Hazen–Williams C** (150 para tubaxe plástica nova), o **caudal máis rápido** nunha tubaxe (1,5 m/s), a **perda pola válvula** e a **rega á semana**. Están identificados como valores predeterminados.

## Cobertura

{{ui:Irrigation}} › {{ui:Show coverage}} indica canta superficie deixan sen regar os aspersores, canta regan dous ou máis, e cales aspersores non alcanzan a un veciño (espazamento cabeza a cabeza).

## Aspersores

Os aspersores listados son tipos **xenéricos** que CadCraft escribe a partir das intensidades de precipitación de deseño (pulverizadores fixos, boquillas rotativas, rotores de engrenaxe, borbulleadores, microaspersores, emisores), non produtos de ningún fabricante. **Engadir aspersores desde un ficheiro…** lee os seus propios aspersores (unha lista JSON con o alcance, o caudal ou a intensidade de precipitación de cada un e o seu rango de presión); gárdanse co proxecto. Os datos publicados por un fabricante só se inclúen con permiso rexistrado dese fabricante.

Debaixo dos aspersores xenéricos, a lista ten **aspersores típicos** (os seus nomes rematan en "typical values"): tamaños de boquilla de pulverizadores fixos, boquillas rotativas e rotores de engrenaxe, microaspersores, borbulleadores e emisores, cun radio, un caudal e un rango de presión. CadCraft calcúlaos a partir de matemáticas publicadas (a ecuación do orificio para o caudal, o escalado do chorro para o radio) e clases nominais de caudal, só de fontes abertas; non se copia ningunha táboa de fabricante. Escolla un e o selector mostra a súa base e a súa licenza. Un proxecto que use un garda o aspersor e a súa fonte no ficheiro do proxecto. Son para planificar: comprobe os datos propios do aspersor real antes de construír.
