---
title: Movemento de terras para paisaxismo
summary: Plataformas, bermas, cunetas e movemento libre de terras con cotas puntuais e curvas de nivel que arrastra, con desmonte e terraplén en tempo real, análise de pendentes, frechas de fluxo e encharcamentos, todo no terreo proposto de CivilCraft.
keywords: muro de contención, muros de contención, lado vertical, muro en vez de pendente, pendente por lado, terraplén, movemento de terras, plataforma, terraza, plataforma de vivenda, berma, montículo, cuneta, cota puntual, nivel puntual, curvas de nivel, editar curvas de nivel, desmonte e terraplén, análise de pendentes, accesibilidade, pendentes pronunciadas, frechas de fluxo, drenaxe, encharcamento, poza
from: e1559eb9
---

Todo isto se modela no **terreo proposto** co mesmo movemento de terras que as plataformas e os corredores. O **terreo existente** nunca cambia, e o cálculo de movemento de terras conta todo. O menú {{ui:Grade}} está no grupo Paisaxismo.

## Plataformas

{{ui:Grade}} › {{ui:Platform}}, despois faga clic nas esquinas e prema {{key:Enter}}. A plataforma empeza á cota media do terreo baixo ela; escriba unha **Cota** para fixala, ou deixe o campo baleiro para que volva seguir o terreo. Unha **Pendente** en % e a **Dirección da pendente** en graos (0 = leste, 90 = norte) inclínana. Os seus lados se modelan ata o terreo coa **Pendente de desmonte** e a **Pendente de terraplén** (horizontal a 1).

## Pendentes por lado e muros de contención

Baixo **Lados e muros de contención**, nas Propiedades dunha plataforma, dunha plataforma de vivenda ou dunha berma, cada lado pode modelarse ao seu xeito. O lado 1 vai do primeiro punto no que fixo clic ao segundo, o lado 2 do segundo ao terceiro, e así por diante.

- **Todos os lados**: **Inclinado** usa as pendentes de desmonte e terraplén de enriba en todos os lados; **Vertical: muros de contención** pon un muro en cada lado;
- Por lado: **Pendentes superiores**, **Pendentes propias** (escriba unha pendente de desmonte e outra de terraplén para ese lado) ou **Vertical (muro de contención)**;
- Escriba unha pendente como `3` ou `3:1` (horizontal a 1 vertical), `33%` ou `18.4°`; amósase como H:1. A **Pendente de desmonte** e a **Pendente de terraplén** da propia plataforma admiten o mesmo;
- Un lado vertical non ten talude: un muro de contención vai ao longo do bordo, desde a plataforma ata o terreo existente (en terraplén) ou desde o terreo ata a plataforma (en desmonte). O **Grosor do muro** (0,3 m ou 1 ft para empezar) é canto escalona o terreo desde o bordo da plataforma ata o terreo existente. Os volumes de desmonte e terraplén deixan fóra o talude que ese lado xa non ten;
- Onde un muro se atopa cun lado inclinado, a pendente envolve o extremo do muro; dous muros únense en inglete;
- Debaixo dos campos: a lonxitude dos muros, a superficie vista (altura × lonxitude), a altura máxima e a media.

No plano, cada muro dibúxase coa súa cara exterior, con pequenos trazos transversais, e coa súa altura nos dous extremos e no punto máis alto (na capa de muros de contención, que tamén vai a DXF e DWG). A vista 3D mostra os muros como sólidos (Amosar › Muros de contención), e as exportacións GLB, OBJ e USD inclúenos. As seccións trazadas polo bordo mostran o chanzo.

**Avisos** (en Propiedades e no panel de Problemas): un muro máis alto que **Avisar por riba dunha altura de muro de** (1,0 m ou 3,3 ft para empezar) «pode necesitar un muro deseñado por un enxeñeiro ou un permiso; comprobe as normas locais», e, cando escribe a **Pendente máxima que aguanta o terreo**, calquera lado cuxa pendente de desmonte ou de terraplén sexa máis pronunciada que ela. Son avisos: o movemento de terras constrúese igual. Cada cambio é un paso para {{key:Mod+Z}}.

## Bermas

{{ui:Grade}} › {{ui:Berm}}: un montículo cuxa cima está a unha **Altura** por encima do terreo medio debaixo del, cos seus lados modelados ata o terreo.

## Cunetas

{{ui:Grade}} › {{ui:Swale}}, despois faga clic ao longo da cuneta **no sentido no que corre a auga** e prema {{key:Enter}}. Defina a súa **Profundidade**, o **Ancho do fondo** (0 para unha V) e a **Pendente lateral**. Sen **Pendente**, o seu fondo segue o terreo, a súa profundidade por debaixo del, e nunca sobe; escriba unha pendente para darlle unha pendente constante desde o inicio.

## Cotas puntuais e curvas de nivel

1. {{ui:Grade}} › {{ui:Grading area}}: faga clic no contorno da área que quere modelar.
2. {{ui:Grade}} › {{ui:Spot elevation}}: faga clic dentro da área. Escriba a súa cota en Propiedades, ou use os botóns ▲ ▼.
3. {{ui:Grade}} › {{ui:Edit a contour}}: faga clic nunha curva de nivel dentro da área para tomala como unha liña que pode remodelar.

Seleccione unha cota ou unha curva e **arrástrea** (ou os seus puntos) no plano: a superficie segue cando solta, nun só paso de desfacer. Dentro da área o terreo reconstrúese a partir do seu bordo (onde encontra o terreo existente), das cotas puntuais e das curvas editadas.

## Desmonte e terraplén en directo

As Propiedades de cada obxecto de movemento de terras mostran o seu **Desmonte** e o seu **Terraplén**, e os do sitio completo, polo método de cuadrícula que usa o cálculo de movemento de terras, a medida que os cambia. Os problemas (fóra da superficie, un contorno que se cruza a si mesmo) aparecen listados alí.

## Comprobacións de movemento de terras

Na sección **Comprobacións de movemento de terras** á esquerda:

- **Análise de pendentes** colorea a superficie por gradiente: ata o límite suave, entre os dous, e máis pronunciadas que o límite forte (5 % e 33,3 % para empezar: o habitual 1:20 para rutas accesibles e 1:3 para segado). A lenda indica que parte da área cae en cada un. As zonas pronunciadas tamén se imprimen nas follas.
- **Frechas de fluxo e encharcamento** debuxa por onde corre a auga e marca con círculo cada lugar onde se encharcaría, coa súa profundidade; a sección indica cantos lugares son, o máis fondo e canta auga conteñen.

As comprobacións len a superficie proposta cando algo está modelado; se non, len o terreo existente.
