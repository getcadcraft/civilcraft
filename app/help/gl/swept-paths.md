---
title: Traxectorias de xiro de vehículos
summary: Conducir un vehículo con ata tres remolques ao longo dunha liña de elementos ou dun trazado, cara adiante ou en marcha atrás, e ver a superficie que barre, as súas traxectorias de rodas, a súa dirección e onde se dobra.
keywords: traxectoria de xiro, seguimento de vehículos, plantilla de xiro, vehículo de deseño, camión, autobús, remolque, semirremolque, marcha atrás, dobrarse, articulación, límite de dirección, desviación traseira, traxectoria das rodas, moelle de carga, raio de xiro
from: 8caafb8a
---

Unha traxectoria de xiro conduce un vehículo por unha liña e amosa o terreo que pasa baixo o seu corpo. Use esta ferramenta para comprobar que un camión pode tomar unha curva, chegar a unha moelle de carga ou meter un remolque en marcha atrás sen saír do pavimento.

## Conducir un vehículo por unha liña

1. Debuxe a liña que segue o vehículo, no sentido da marcha: unha liña de elementos (os arcos están ben: prema {{key:C}} mentres a debuxa, vexa [Liñas de elementos](topic:feature-lines)) ou un trazado.
2. Seleccióneo e prema {{ui:Swept path…}} nas súas **Propiedades**.
3. Baixo **Comezar desde**, escolla un vehículo e logo axuste os seus tamaños segundo o seu propio vehículo de deseño: ancho, voladizo dianteiro, distancia entre eixos, voladizo traseiro, vía e **Límite de dirección**. Engada ata tres remolques, cada un con onde está enganchado, a súa lonxitude desde o enganche ata o seu eixe, os seus voladizos e a súa **Articulación máxima**.
4. Escolla **Condución**: cara adiante ou en marcha atrás. Prema {{ui:Drive it}}.

:::warning
Os vehículos de partida son valores provisionais, non unha norma. Estableza os tamaños a partir do vehículo de deseño que usa o proxecto.
:::

## Cara adiante e marcha atrás

| Condución | O que segue a liña | O que calcula CivilCraft |
|---|---|---|
| **Cara adiante** | O centro do eixe dianteiro | Onde van o eixe traseiro e cada remolque, o ángulo de dirección e a articulación |
| **Marcha atrás** | O centro do último eixe (a parte traseira do remolque) | Onde vai cada unidade por diante, e a dirección que a cabina necesita para situar alí o remolque |

A marcha atrás é como se comproba unha maniobra de retroceso: diga onde debe ir o remolque, e CivilCraft indica se a cabina pode conseguilo.

## Ler o resultado

A traxectoria de xiro debúxase no plano en laranxa: o seu contorno e, en trazos, as traxectorias das rodas máis externas. Seleccióneo (prema dentro del) para ver nas **Propiedades**:

- **Lonxitude percorrida**, o ángulo de **Dirección** máximo e a **Articulación** fronte aos seus límites, e a **Superficie barrida**.
- Calquera problema ao longo da liña, coa súa distancia: a dirección por riba do límite, ou un remolque que xira por riba do seu límite de articulación (dobrándose).
- **O vehículo ao longo da liña**: mova o control deslizante para ver o vehículo en calquera punto, coa súa dirección e articulación alí.

Cambie a liña e a traxectoria de xiro segue. {{ui:Edit the vehicle…}} muda os tamaños; **Condución** alterna entre cara adiante e marcha atrás. Cada cambio é un paso: {{key:Mod+Z}} o desfai. {{key:Delete}} elimina a traxectoria de xiro seleccionada (a liña queda).

O contorno e as traxectorias das rodas pasan ao PDF, ao DXF e ao DWG na capa C-ROAD-SWPT.

## Como se calcula

Cada unidade xira arredor da liña do seu eixe traseiro e é arrastada polo punto que ten diante (o eixe dianteiro, ou o enganche), o modelo de baixa velocidade e sen deslizamento que usan as comprobacións de traxectoria de xiro. A superficie barrida é a suma dos contornos do corpo en cada posición. Non modela a velocidade, o deslizamento dos pneumáticos, o tempo que tarda a dirección en xirar, os remolques con dirección nin a folga baixo a carrozaría.
