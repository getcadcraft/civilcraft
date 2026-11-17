---
title: Deixar um assistente de IA trabalhar com o local
summary: Ativar os assistentes nas Definições para que um assistente no computador possa ler o local aberto (pontos, superfícies, volumes, perfis, lotes), acrescentar pontos de levantamento, guardar e exportar LandXML ou DWG, através do CadCraft Studio. Desligado até o ativar.
keywords: ia, assistente, mcp, script, automatização, studio, pontos, cota, pk, offset, diretriz, volume, escavação, aterro, perfil, lote, landxml, dwg, usd, pastas, permissões, desligar, atividade
from: d0356582
---

## O que vai aprender

Como deixar um assistente de IA (qualquer assistente que fale MCP) trabalhar com o local aberto, o que pode e não pode fazer e como o parar.

## O que um assistente pode fazer no CivilCraft

| Pede | O que obtém | Precisa de |
|---|---|---|
| O local | Nome, unidades, sistema de coordenadas, grupos de pontos, diretrizes, superfícies, plataformas, lotes e coletores | Ler |
| Pontos de levantamento | Número, este, norte, cota e descrição, por grupo, por descrição ou dentro de uma caixa | Ler |
| Cotas da superfície | O terreno existente (ou a superfície regularizada) nos pontos que indicar | Ler |
| PK e offsets | O PK e o offset de pontos ao longo de uma diretriz, ou as coordenadas e a cota do terreno dos PK | Ler |
| Um perfil | Cotas do terreno, do perfil de projeto e da superfície regularizada ao longo de uma diretriz, a cada tantos pés ou metros | Ler |
| Escavação e aterro | Volumes entre o terreno existente e a superfície regularizada (cada plataforma e corredor também), ou entre o terreno e um nível | Ler |
| Lotes | Vértices, área (em acres ou hectares), perímetro e a descrição legal | Ler |
| Uma seleção | Os pontos que indicar ficam selecionados no plano, como se os tivesse escolhido | Editar |
| Novos pontos de levantamento | Pontos acrescentados com os números que indicar, ou os seguintes livres. Cada chamada é um passo que pode anular | Editar |
| Guardar | O próprio {{ui:Guardar}} do CivilCraft | Guardar |
| LandXML ou DWG | Os mesmos ficheiros dos botões {{ui:LandXML}} e {{ui:DWG}} | Exportar |
| O local em 3D | OpenUSD (.usdz, .usda ou .usdc) do terreno, da superfície regularizada, das plataformas e dos coletores, tal como a vista 3D o exporta | Exportar |
| Plantas e o mapa de plantas | Plantas encontradas na lista de plantas por qualquer nome, e as contagens do mapa de plantas | Ler |
| Plantação e regularização | Plantas, um canteiro ou uma sebe colocados, ou uma plataforma, berma, valeta ou área de regularização acrescentada, cada uma um passo que pode anular, com a sua escavação e aterro | Editar |
| Verificação de rega | O caudal de cada zona, a pressão necessária na sua válvula e na alimentação, a altura manométrica no pior caso, os tempos de funcionamento, os problemas e a lista de materiais, como auxiliar de cálculo que um projetista de rega verifica | Ler |

Funciona com o local que está aberto. No Studio, pode também guardar e exportar para pastas que escolher (abaixo); sem pasta, os ficheiros são transferidos como os dos botões.

## Ligar

Os assistentes chegam ao CivilCraft através do CadCraft Studio no computador; o navegador simples não tem forma de entrar.

1. Abra {{ui:Definições}} e escolha o separador **CivilCraft**.
2. Em **Assistentes**, marque **Permitir que os assistentes de IA e os scripts usem o CivilCraft**.
3. **Ler** já vem marcado por predefinição. Marque **Editar**, **Guardar** ou **Exportar** apenas quando o assistente precisar deles.
4. Para o deixar guardar e exportar para uma pasta, escolha {{ui:Adicionar uma pasta…}} em **Pastas que pode usar** e escolha a pasta na caixa de diálogo do Studio. {{ui:Remover}} retira-a logo; qualquer outro caminho é recusado.
5. Ligue o assistente no Studio (o Studio mostra o endereço e as definições a colar nele).

## Enquanto um assistente está ligado

Uma nota no topo do painel da direita indica qual o assistente ligado e o que pode fazer. Clique em {{ui:Desligar}} para terminar a sua sessão de imediato; o assistente tem de se ligar de novo para continuar.

**Atividade**, em **Assistentes** nas Definições, lista cada chamada feita pelo assistente, da mais recente para a mais antiga, com indicação de se resultou.

:::tip
Pergunte em linguagem simples, por exemplo «qual é a cota do terreno a cada 50 ft ao longo da Main Street?», «quanta escavação e aterro precisam as plataformas?» ou «acrescente um ponto de controlo nestas coordenadas». O assistente lê o local e responde, ou faz a alteração como um passo que pode anular.
:::

## Sem abrir o CivilCraft

O servidor de ficheiros do CadCraft para assistentes (`npx @getcadcraft/mcp`) e a linha de comandos `cadcraft` abrem projetos CivilCraft guardados (`.civilcraft.json`) e ficheiros de pontos com o código do próprio CivilCraft, sem janela: as mesmas ferramentas de leitura, acrescentar pontos, guardar o projeto, LandXML e o local em 3D como OpenUSD. `cadcraft convert site.civilcraft.json site.xml` escreve LandXML a partir da linha de comandos. Abrir LandXML, a exportação DWG e as ferramentas do espaço de trabalho Landscape ainda precisam da janela do CivilCraft.

## Desligar

Desmarque **Permitir que os assistentes de IA e os scripts usem o CivilCraft**. Todos os assistentes são desligados logo, e a definição fica guardada para a próxima vez.

## Ver também

- [Receitas para assistentes de IA](common:assistants-recipes): exemplos práticos, cada um com as ferramentas que chama.
- [Traçar uma diretriz horizontal](topic:alignment)
- [Construir e refinar a superfície](topic:build-surface)
- [Selecionar, copiar e colar pontos de levantamento](topic:copy-paste-points)
- [Definições do CivilCraft](topic:settings)
