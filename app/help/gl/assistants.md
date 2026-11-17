---
title: Deixe que un asistente de IA traballe co seu sitio
summary: Active os asistentes en Configuración para que un asistente no seu ordenador poida ler o sitio aberto (puntos, superficies, volumes, perfís, parcelas), engadir puntos de levantamento, gardar e exportar LandXML ou DWG, a través de CadCraft Studio. Desactivado ata que o active.
keywords: ia, asistente, mcp, script, automatización, studio, puntos, cota, estación, desvío, trazado, volume, desmonte, recheo, perfil, parcela, landxml, dwg, usd, cartafoles, permisos, desconectar, actividade
from: d0356582
---

## Que vai aprender

Como deixar que un asistente de IA (calquera asistente que fale MCP) traballe co sitio que ten aberto, o que pode e non pode facer, e como detelo.

## O que pode facer un asistente en CivilCraft

| Pide | Que obtén | Necesita |
|---|---|---|
| O sitio | Nome, unidades, sistema de coordenadas, grupos de puntos, trazados, superficies, plataformas, parcelas e tubaxes | Ler |
| Puntos de levantamento | Número, este, norte, cota e descrición, por grupo, por descrición ou dentro dunha caixa | Ler |
| Cotas da superficie | O terreo existente (ou a superficie niveladada) en calquera punto que nomee | Ler |
| Estacións e desvíos | A estación e o desvío de puntos ao longo dun trazado, ou as coordenadas e a cota do terreo das estacións | Ler |
| Un perfil | As cotas do terreo, do perfil de deseño e da superficie niveladada ao longo dun trazado, cada tantos pés ou metros | Ler |
| Desmonte e recheo | Volumes entre o terreo existente e a superficie niveladada (tamén cada plataforma e corredor), ou entre o terreo e un nivel | Ler |
| Parcelas | Vértices, superficie (con acres ou hectáreas), perímetro e descrición legal | Ler |
| Unha selección | Os puntos que nomea seleccionanse no plano, como se os tivese escollido | Editar |
| Novos puntos de levantamento | Puntos engadidos cos números que indica, ou os seguintes libres. Cada chamada é un paso que pode desfacer | Editar |
| Gardar | O propio {{ui:Gardar}} de CivilCraft | Gardar |
| LandXML ou DWG | Os mesmos ficheiros que os botóns {{ui:LandXML}} e {{ui:DWG}} | Exportar |
| O sitio en 3D | OpenUSD (.usdz, .usda ou .usdc) do terreo, da superficie niveladada, das plataformas e das tubaxes, tal como o exporta a vista 3D | Exportar |
| Plantas e o cadro de plantas | Plantas atopadas na lista de plantas por calquera nome, e os recontos do cadro de plantas | Ler |
| Plantación e nivelación | Plantas, un canteiro ou unha sebe colocados, ou unha plataforma, berma, cuneta ou zona de nivelación engadida, cada un un paso que pode desfacer, co seu desmonte e recheo | Editar |
| Comprobación de rega | O caudal de cada zona, a presión necesaria na súa válvula e na alimentación, a altura no peor caso, os tempos de funcionamento, os problemas e a lista de materiais, como axuda de cálculo que un deseñador de rega comproba | Ler |

Funciona co sitio que está aberto. En Studio tamén pode gardar e exportar en cartafoles que escolla (máis abaixo); sen cartafol, os seus ficheiros descárganse como o fan os botóns.

## Activalo

Os asistentes chegan a CivilCraft a través de CadCraft Studio no seu ordenador; o navegador simple non ten acceso.

1. Abra {{ui:Configuración}} e escolla a lapela **CivilCraft**.
2. Baixo **Asistentes**, marque **Permitir que os asistentes de IA e os scripts usen CivilCraft**.
3. **Ler** xa está marcado para vostede. Marque **Editar**, **Gardar** ou **Exportar** só cando o asistente os necesite.
4. Para que poida gardar e exportar nun cartafol, escolla {{ui:Engadir un cartafol…}} baixo **Cartafoles que pode usar** e escolla o cartafol no diálogo de Studio. {{ui:Eliminar}} retírao de inmediato; calquera outra ruta recházase.
5. Conecte o asistente en Studio (Studio mostra o enderezo e os axustes que hai que pegar nel).

## Mentres un asistente está conectado

Unha nota na parte superior do panel dereito indica que asistente está conectado e o que pode facer. Faga clic en {{ui:Desconectar}} para rematar a súa sesión de inmediato; ten que volver conectarse para continuar.

**Actividade**, baixo **Asistentes** en Configuración, lista cada chamada que fixo o asistente, a máis recente primeiro, e se funcionou.

:::tip
Pregunte con palabras simples, por exemplo: «cal é a cota do terreo cada 50 pés ao longo da rúa Main?», «canto desmonte e recheo precisan as plataformas?» ou «engada un punto de control nestas coordenadas». O asistente lee o sitio e responde, ou fai o cambio como un paso que pode desfacer.
:::

## Sen abrir CivilCraft

O servidor de ficheiros de CadCraft para asistentes (`npx @getcadcraft/mcp`) e a liña de comandos `cadcraft` abren proxectos gardados de CivilCraft (`.civilcraft.json`) e ficheiros de puntos co código propio de CivilCraft, sen xanela: as mesmas ferramentas de lectura, engadir puntos, gardar o proxecto, LandXML e o sitio en 3D como OpenUSD. `cadcraft convert site.civilcraft.json site.xml` escribe LandXML desde a liña de comandos. Abrir LandXML, a exportación DWG e as ferramentas do espazo de traballo Landscape seguen necesitando a xanela de CivilCraft.

## Desactivalo

Desmarque **Permitir que os asistentes de IA e os scripts usen CivilCraft**. Todos os asistentes desconéctanse de inmediato, e o axuste consérvase para a próxima vez.

## Ver tamén

- [Receitas para asistentes de IA](common:assistants-recipes): exemplos prácticos, cada un coas ferramentas que chama.
- [Dispoñer un trazado horizontal](topic:alignment)
- [Construír e afinar a superficie](topic:build-surface)
- [Seleccionar, copiar e pegar puntos de levantamento](topic:copy-paste-points)
- [Configuración de CivilCraft](topic:settings)
