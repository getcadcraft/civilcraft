---
title: Permitir que um assistente de IA trabalhe com seu terreno
summary: Ative os assistentes em Configurações para que um assistente no seu computador leia o terreno aberto (pontos, superfícies, volumes, perfis, lotes), adicione pontos de levantamento, salve e exporte LandXML ou DWG, por meio do CadCraft Studio. Desligado até você ativá-lo.
keywords: ia, assistente, mcp, script, automação, studio, pontos, cota, estaca, deslocamento, alinhamento, volume, corte, aterro, perfil, lote, landxml, dwg, usd, pastas, permissões, desconectar, atividade
from: d0356582
---

## O que você vai aprender

Como permitir que um assistente de IA (qualquer assistente que fale MCP) trabalhe com o terreno que você tem aberto, o que ele pode e não pode fazer, e como interrompê-lo.

## O que um assistente pode fazer no CivilCraft

| Ele pede | O que recebe | Precisa de |
|---|---|---|
| O terreno | Nome, unidades, sistema de coordenadas, grupos de pontos, alinhamentos, superfícies, plataformas, lotes e tubos | Leitura |
| Pontos de levantamento | Número, leste, norte, cota e descrição, por grupo, por descrição ou dentro de uma caixa | Leitura |
| Cotas da superfície | O terreno natural (ou a superfície terraplenada) nos pontos que ele indicar | Leitura |
| Estacas e deslocamentos | A estaca e o deslocamento dos pontos ao longo de um alinhamento, ou as coordenadas e a cota do terreno das estacas | Leitura |
| Um perfil | Cotas do terreno, do perfil de projeto e da superfície terraplenada ao longo de um alinhamento, a cada tantos pés ou metros | Leitura |
| Corte e aterro | Volumes entre o terreno natural e a superfície terraplenada (e de cada plataforma e corredor), ou entre o terreno e um nível | Leitura |
| Lotes | Vértices, área (em acres ou hectares), perímetro e a descrição legal | Leitura |
| Uma seleção | Os pontos que ele indicar são selecionados no plano, como se você os tivesse escolhido | Edição |
| Novos pontos de levantamento | Pontos adicionados com os números que ele der, ou os próximos livres. Cada chamada é um passo que você pode desfazer | Edição |
| Salvar | O {{ui:Salvar}} próprio do CivilCraft | Salvar |
| LandXML ou DWG | Os mesmos arquivos dos botões {{ui:LandXML}} e {{ui:DWG}} | Exportar |
| O terreno em 3D | OpenUSD (.usdz, .usda ou .usdc) do terreno natural, da superfície terraplenada, das plataformas e dos tubos, como a visualização 3D exporta | Exportar |
| Plantas e a lista de plantas | Plantas encontradas na lista de plantas por qualquer nome, e as contagens da lista | Leitura |
| Plantio e terraplenagem | Plantas, um canteiro ou uma sebe posicionados, ou uma plataforma, banqueta, valeta ou área de terraplenagem adicionados, cada um como um passo que você pode desfazer, com o seu corte e aterro | Edição |
| Uma verificação de irrigação | A vazão de cada zona, a pressão necessária na sua válvula e na alimentação, a carga do pior caso, tempos de funcionamento, problemas e a lista de materiais, como auxílio de cálculo que um projetista de irrigação confere | Leitura |

Ele funciona com o terreno aberto. No Studio, ele também pode salvar e exportar em pastas que você escolher (abaixo); sem uma pasta, os arquivos são baixados como fazem os botões.

## Ative

Os assistentes chegam ao CivilCraft pelo CadCraft Studio no seu computador; o navegador comum não tem como entrar.

1. Abra {{ui:Configurações}} e escolha a aba **CivilCraft**.
2. Em **Assistentes**, marque **Permitir que assistentes de IA e scripts usem o CivilCraft**.
3. **Leitura** já vem marcada para você. Marque **Edição**, **Salvar** ou **Exportar** só quando o assistente precisar.
4. Para deixá-lo salvar e exportar em uma pasta, escolha {{ui:Adicionar uma pasta…}} em **Pastas que ele pode usar** e escolha a pasta na caixa de diálogo do Studio. {{ui:Remover}} a retira na hora; qualquer outro caminho é recusado.
5. Conecte o assistente no Studio (o Studio mostra o endereço e as configurações para colar nele).

## Enquanto um assistente está conectado

Uma nota no topo do painel direito diz qual assistente está conectado e o que ele pode fazer. Clique em {{ui:Desconectar}} para encerrar a sessão dele na hora; ele precisa conectar de novo para continuar.

**Atividade**, em **Assistentes** nas Configurações, lista cada chamada que o assistente fez, da mais recente para a mais antiga, com a indicação de ter funcionado ou não.

:::tip
Pergunte em linguagem simples, por exemplo "qual é a cota do terreno a cada 50 pés ao longo da Rua Principal?", "quanto corte e aterro as plataformas precisam?" ou "adicione um ponto de controle nestas coordenadas". O assistente lê o terreno e responde, ou faz a alteração como um único passo que você pode desfazer.
:::

## Sem abrir o CivilCraft

O servidor de arquivos do CadCraft para assistentes (`npx @getcadcraft/mcp`) e a linha de comando `cadcraft` abrem projetos CivilCraft salvos (`.civilcraft.json`) e arquivos de pontos com o próprio código do CivilCraft, sem janela: as mesmas ferramentas de leitura, a adição de pontos, o salvamento do projeto, o LandXML e o terreno em 3D como OpenUSD. `cadcraft convert site.civilcraft.json site.xml` grava LandXML pela linha de comando. Abrir LandXML, a exportação de DWG e as ferramentas da área de trabalho Landscape ainda precisam da janela do CivilCraft.

## Desligue

Desmarque **Permitir que assistentes de IA e scripts usem o CivilCraft**. Todo assistente é desconectado na hora, e a configuração fica guardada para a próxima vez.

## Veja também

- [Receitas para assistentes de IA](common:assistants-recipes): exemplos práticos, cada um com as ferramentas que chama.
- [Desenhar um alinhamento horizontal](topic:alignment)
- [Construir e refinar a superfície](topic:build-surface)
- [Selecionar, copiar e colar pontos de levantamento](topic:copy-paste-points)
- [Configurações do CivilCraft](topic:settings)
