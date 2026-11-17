---
title: Referência da barra de ferramentas
summary: Todo botão da barra de ferramentas do CivilCraft, o que ele faz, sua tecla e quando fica desabilitado ou recusa a ação.
keywords: barra de ferramentas, botões, comandos, ferramentas, arquivo, exportar, superfície, projeto, editar, exibir, menu
from: 4c4352bc
---

A barra de ferramentas percorre o topo do aplicativo em sete grupos. Cada botão mostra sua dica e sua tecla quando você passa o ponteiro sobre ele.

## Arquivo

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:Novo}} | nenhuma | Inicia um projeto vazio. Pergunta antes se há alterações não salvas. |
| {{ui:Abrir}} | {{key:Mod+O}} | Abre um arquivo de pontos (CSV, TXT), LandXML ou um projeto do CivilCraft. |
| {{ui:Salvar}} | {{key:Mod+S}} | Baixa o projeto como `<name>.civilcraft.json`. |

## Exportar

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:LandXML}} | nenhuma | Baixa `<name>.xml`: pontos, superfícies, alinhamentos, perfis e a rede de tubos como LandXML 1.2. "Nada para exportar ainda." quando o projeto está vazio. |
| {{ui:DXF}} | nenhuma | Baixa `<name>.dxf`: as linhas da planta como DXF R12. |
| {{ui:PDF}} | {{key:Mod+P}} | Abre **Plotar a planta em PDF**. "Nada para plotar ainda." quando o projeto está vazio. |

## Superfície

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:Linha de quebra}} | {{key:B}} | Clique nos pontos de levantamento em ordem, {{key:Enter}} para terminar. A linha de quebra recebe as cotas dos pontos. |
| {{ui:Limite}} | {{key:O}} | Clique nos vértices do limite externo, {{key:Enter}} para terminar. Substitui qualquer limite. |

Ambos exibem "Ainda não há superfície: abra antes os pontos de levantamento." quando não há superfície.

## Projeto

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:Alinhamento}} | {{key:A}} | Clique nos PIs em ordem, {{key:Enter}} para terminar. |
| {{ui:Plataforma}} | {{key:G}} | Clique nos vértices da plataforma, {{key:Enter}} para terminar. Como as ferramentas de superfície, avisa quando não há superfície; uma plataforma só é terraplenada sobre uma superfície. |
| {{ui:Tubos}} | {{key:P}} | Clique nas estruturas de montante para jusante (clique em uma existente para conectá-la), {{key:Enter}} para terminar. |
| {{ui:Perfil}} | {{key:R}} | Mostra ou oculta a vista de perfil sob a planta. |

## Editar

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:Desfazer}} | {{key:Mod+Z}} | Desfaz a última alteração (até 200). Desabilitado quando não há nada a desfazer. |
| {{ui:Refazer}} | {{key:Mod+Y}} | Refaz o que foi desfeito. Desabilitado quando não há nada a refazer. |
| {{ui:Copiar}} | {{key:Mod+C}} | Copia os pontos de levantamento selecionados e os coloca na área de transferência como linhas de pontos que uma planilha aceita. Desabilitado até que pontos sejam selecionados. |
| {{ui:Colar}} | {{key:Mod+V}} | Cola pontos: eles seguem o ponteiro, e um clique os posiciona com números que nenhum outro ponto tem. Linhas de pontos copiadas em uma planilha também são coladas. |
| {{ui:Mais}} | nenhuma | Abre o menu abaixo. |

O menu {{ui:Mais}}:

| Item | Tecla | O que faz |
|---|---|---|
| {{ui:Recortar}} | {{key:Mod+X}} | Copia os pontos selecionados e os exclui (um passo de desfazer). |
| {{ui:Copiar}} | {{key:Mod+C}} | Como o botão {{ui:Copiar}}. |
| {{ui:Colar}} | {{key:Mod+V}} | Como o botão {{ui:Colar}}. |
| {{ui:Colar no mesmo local}} | {{key:Mod+Shift+V}} | Cola os pontos em suas próprias coordenadas, com números que nenhum outro ponto tem. |
| {{ui:Duplicar}} | {{key:Mod+D}} | Uma cópia dos pontos selecionados segue o ponteiro; clique onde ela deve ficar. A área de transferência não é alterada. |
| {{ui:Excluir}} | {{key:Delete}} | Exclui os pontos de levantamento selecionados, ou o alinhamento, a plataforma, a estrutura (com seus tubos), o tubo ou o PIV selecionado. |
| {{ui:Selecionar todos os pontos}} | {{key:Mod+A}} | Seleciona todos os pontos de levantamento. |
| {{ui:Limpar seleção}} | {{key:Esc}} | Limpa a seleção. |

Um item que não pode agir no momento fica desabilitado, e sua dica explica o motivo. Detalhes: [Selecionar, copiar e colar pontos de levantamento](topic:copy-paste-points).

O desfazer abrange alterações no projeto, nas configurações da superfície e nos pontos de levantamento (colar, recortar, duplicar, excluir). Não abrange as configurações de exibição, e abrir ou importar qualquer arquivo o limpa.

## GIS

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:Coordenadas}} | nenhuma | Abre a caixa **Sistema de coordenadas**: diga em qual sistema o projeto está, ou use coordenadas do terreno ou locais. Veja [Definir o sistema de coordenadas do projeto](topic:coordinate-systems) e [Coordenadas do terreno e locais](topic:ground-and-local-coordinates). |
| {{ui:Importar}} | nenhuma | Importa dados de GIS: shapefiles, GeoJSON, GeoPackage, grades de elevação e LiDAR. Veja [Importar dados de GIS](topic:gis-import). |
| {{ui:Exportar}} | nenhuma | Exporta os dados como construídos para um departamento de GIS. Veja [Exportar dados como construídos para GIS](topic:gis-export). |
| {{ui:Analisar}} | nenhuma | Abre o painel de análise de GIS: buffer, sobreposição, junção espacial, selecionar por atributo, medir. Veja [Analisar camadas de GIS](topic:gis-analysis). |
| {{ui:Tabela de atributos}} | nenhuma | Em Superfície › Mais. Abre a tabela de atributos de uma camada de GIS: ordenar, filtrar, selecionar, editar, adicionar campos, calcular, salvar como CSV. Veja [Trabalhar com a tabela de atributos de uma camada](topic:gis-table). |
| {{ui:Mapa}} | nenhuma | Abre a caixa **Camadas de mapa**: uma imagem georreferenciada, ou servidores de mapas que você adiciona, desenhados sob a planta. Veja [Mostrar camadas de mapa sob a planta](topic:map-layers). |

As ferramentas de GIS são carregadas na primeira vez que você usa um desses botões, abre um arquivo de GIS ou abre um projeto que tem sistema de coordenadas ou camadas de GIS.

## Exibir

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:Selecionar}} | {{key:V}} ou {{key:Esc}} | Clique para selecionar alinhamentos, plataformas, estruturas, tubos e pontos ({{key:Shift}} e um clique ou um arraste adiciona pontos); arraste os grips para mover PIs, vértices de plataformas e estruturas. |
| {{ui:Ajustar}} | {{key:F}} | Dá zoom na planta para mostrar a superfície, os pontos, os alinhamentos e as plataformas (na vista 3D: mostra tudo). |
| {{ui:3D}} | {{key:D}} | Mostra o terreno em 3D sobre a planta, ou volta para a planta. A barra sobre a vista 3D define a vista, o exagero, a coloração e o que aparece, e exporta GLB ou OBJ. Veja [Ver o terreno em 3D](topic:site-3d). |

## Botões nos painéis

| Botão | Onde | O que faz |
|---|---|---|
| {{ui:Abrir o terreno de exemplo}} | A caixa em uma planta vazia | Carrega o levantamento de exemplo (precisa de conexão, a menos que o CivilCraft esteja salvo para uso offline) |
| {{ui:Remover o limite}} | Painel esquerdo, Superfície | Retira o limite externo |
| {{ui:Remover linhas de quebra desenhadas}} | Painel esquerdo, Superfície | Remove toda linha de quebra desenhada com a ferramenta (não os grupos de linhas de quebra) |
| {{ui:Reconstruir a superfície a partir dos pontos}} | Painel esquerdo, Superfície (somente superfície de LandXML) | Descarta a TIN do LandXML e constrói a partir dos pontos; não pode ser desfeito |
| {{ui:Começar do terreno}} | Painel direito, Alinhamento | Inicia um perfil de projeto com um PIV sobre o terreno em cada extremidade |
| {{ui:Vista do perfil}} | Painel direito, Alinhamento | Abre a vista de perfil deste alinhamento |
| {{ui:Adicionar PIVs}} | Barra do perfil | Enquanto pressionado, um clique no perfil adiciona um PIV |
| {{ui:Definir todas as cotas de fundo pelas regras}} | Painel direito, Rede de tubos | Define as cotas de fundo de todos os tubos pelas regras |
| {{ui:Definir suas cotas de fundo pelas regras}} | Painel direito, Tubo | Define as cotas de fundo deste tubo pelas regras |
