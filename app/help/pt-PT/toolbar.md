---
title: Referência da barra de ferramentas
summary: Cada botão da barra de ferramentas do CivilCraft, o que faz, a sua tecla, e quando está esbatido ou recusa.
keywords: barra de ferramentas, botões, comandos, ferramentas, ficheiro, exportar, superfície, projeto, editar, vista, menu
from: 4c4352bc
---

A barra de ferramentas percorre o topo da aplicação em sete grupos. Cada botão mostra a sua dica e tecla quando passa o rato por cima.

## Ficheiro

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:Novo}} | nenhuma | Inicia um projeto vazio. Pergunta primeiro se há alterações não guardadas. |
| {{ui:Abrir}} | {{key:Mod+O}} | Abre um ficheiro de pontos (CSV, TXT), LandXML ou um projeto do CivilCraft. |
| {{ui:Guardar}} | {{key:Mod+S}} | Transfere o projeto como `<name>.civilcraft.json`. |

## Exportar

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:LandXML}} | nenhuma | Transfere `<name>.xml`: pontos, superfícies, diretrizes, perfis e a rede de coletores como LandXML 1.2. "Ainda não há nada para exportar." quando o projeto está vazio. |
| {{ui:DXF}} | nenhuma | Transfere `<name>.dxf`: as linhas de planta em DXF R12. |
| {{ui:PDF}} | {{key:Mod+P}} | Abre **Imprimir a planta em PDF**. "Ainda não há nada para imprimir." quando o projeto está vazio. |

## Superfície

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:Linha de quebra}} | {{key:B}} | Clique nos pontos de levantamento por ordem, {{key:Enter}} para terminar. A linha de quebra toma as cotas dos pontos. |
| {{ui:Limite}} | {{key:O}} | Clique nos vértices do limite exterior, {{key:Enter}} para terminar. Substitui qualquer limite. |

Ambos indicam "Ainda não há superfície: abra primeiro os pontos de levantamento." quando não há superfície.

## Projeto

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:Diretriz}} | {{key:A}} | Clique nos PI por ordem, {{key:Enter}} para terminar. |
| {{ui:Plataforma}} | {{key:G}} | Clique nos vértices da plataforma, {{key:Enter}} para terminar. Como as ferramentas de superfície, avisa quando não há superfície; uma plataforma só é modelada sobre uma. |
| {{ui:Coletores}} | {{key:P}} | Clique nos órgãos de montante para jusante (clique num existente para se ligar a ele), {{key:Enter}} para terminar. |
| {{ui:Perfil}} | {{key:R}} | Mostra ou oculta a vista do perfil sob a planta. |

## Editar

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:Anular}} | {{key:Mod+Z}} | Anula a última alteração (até 200). Esbatido quando não há nada a anular. |
| {{ui:Refazer}} | {{key:Mod+Y}} | Refaz o que foi anulado. Esbatido quando não há nada a refazer. |
| {{ui:Copiar}} | {{key:Mod+C}} | Copia os pontos de levantamento selecionados e coloca-os na área de transferência como linhas de pontos que uma folha de cálculo aceita. Esbatido até haver pontos selecionados. |
| {{ui:Colar}} | {{key:Mod+V}} | Cola pontos: seguem o cursor, e um clique coloca-os com números que nenhum outro ponto tem. Linhas de pontos copiadas numa folha de cálculo também são coladas. |
| {{ui:Mais}} | nenhuma | Abre o menu abaixo. |

O menu {{ui:Mais}}:

| Item | Tecla | O que faz |
|---|---|---|
| {{ui:Cortar}} | {{key:Mod+X}} | Copia os pontos selecionados e elimina-os (um só passo de anular). |
| {{ui:Copiar}} | {{key:Mod+C}} | Como o botão {{ui:Copiar}}. |
| {{ui:Colar}} | {{key:Mod+V}} | Como o botão {{ui:Colar}}. |
| {{ui:Colar no mesmo sítio}} | {{key:Mod+Shift+V}} | Cola os pontos nas suas próprias coordenadas, com números que nenhum outro ponto tem. |
| {{ui:Duplicar}} | {{key:Mod+D}} | Uma cópia dos pontos selecionados segue o cursor; clique onde deve ficar. A área de transferência não é alterada. |
| {{ui:Eliminar}} | {{key:Delete}} | Elimina os pontos de levantamento selecionados, ou a diretriz, a plataforma, o órgão (com os seus coletores), o coletor ou o PVI selecionado. |
| {{ui:Selecionar todos os pontos}} | {{key:Mod+A}} | Seleciona todos os pontos de levantamento. |
| {{ui:Limpar seleção}} | {{key:Esc}} | Limpa a seleção. |

Um item que não pode atuar neste momento fica esbatido, e a sua dica indica porquê. Detalhes: [Selecionar, copiar e colar pontos de levantamento](topic:copy-paste-points).

Anular abrange as alterações ao projeto, às definições da superfície e aos pontos de levantamento (colar, cortar, duplicar, eliminar). Não abrange as definições de visualização, e abrir ou importar qualquer ficheiro limpa o histórico.

## SIG

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:Coordenadas}} | nenhuma | Abre a caixa de diálogo **Sistema de coordenadas**: indique em que sistema está o projeto, ou use coordenadas do terreno ou locais. Ver [Definir o sistema de coordenadas do projeto](topic:coordinate-systems) e [Coordenadas do terreno e locais](topic:ground-and-local-coordinates). |
| {{ui:Importar}} | nenhuma | Importa dados SIG: shapefiles, GeoJSON, GeoPackage, grelhas de altimetria e LiDAR. Ver [Importar dados SIG](topic:gis-import). |
| {{ui:Exportar}} | nenhuma | Exporta os dados as-built para um departamento SIG. Ver [Exportar dados as-built para SIG](topic:gis-export). |
| {{ui:Analisar}} | nenhuma | Abre o painel de análise SIG: zona-tampão, sobreposição, junção espacial, selecionar por atributo, medir. Ver [Analisar camadas SIG](topic:gis-analysis). |
| {{ui:Tabela de atributos}} | nenhuma | Em Superfície › Mais. Abre a tabela de atributos de uma camada SIG: ordenar, filtrar, selecionar, editar, acrescentar campos, calcular, guardar como CSV. Ver [Trabalhar com a tabela de atributos de uma camada](topic:gis-table). |
| {{ui:Mapa}} | nenhuma | Abre a caixa de diálogo **Camadas de mapa**: uma imagem georreferenciada, ou servidores de mapas que acrescentar, desenhados sob a planta. Ver [Mostrar camadas de mapa sob a planta](topic:map-layers). |

As ferramentas SIG carregam-se na primeira vez que usa um destes botões, abre um ficheiro SIG, ou abre um projeto que tem um sistema de coordenadas ou camadas SIG.

## Vista

| Botão | Tecla | O que faz |
|---|---|---|
| {{ui:Selecionar}} | {{key:V}} ou {{key:Esc}} | Clique para selecionar diretrizes, plataformas, órgãos, coletores e pontos ({{key:Shift}} e um clique ou um arrastamento acrescenta pontos); arraste os grips (pontos de controlo) para mover PI, vértices de plataforma e órgãos. |
| {{ui:Ajustar}} | {{key:F}} | Aproxima a planta para mostrar a superfície, os pontos, as diretrizes e as plataformas (na vista 3D: mostra tudo). |
| {{ui:3D}} | {{key:D}} | Mostra o local em 3D sobre a planta, ou volta à planta. A barra sobre a vista 3D define a vista, o exagero, as cores e o que se mostra, e exporta GLB ou OBJ. Ver [Ver o local em 3D](topic:site-3d). |

## Botões nos painéis

| Botão | Onde | O que faz |
|---|---|---|
| {{ui:Abrir o local de exemplo}} | A caixa numa planta vazia | Carrega o levantamento de exemplo (precisa de ligação, a menos que o CivilCraft esteja guardado para utilização offline) |
| {{ui:Remover o limite}} | Painel esquerdo, Superfície | Retira o limite exterior |
| {{ui:Remover as linhas de quebra desenhadas}} | Painel esquerdo, Superfície | Remove todas as linhas de quebra desenhadas com a ferramenta (não os grupos de linhas de quebra) |
| {{ui:Reconstruir a superfície a partir dos pontos}} | Painel esquerdo, Superfície (apenas superfície LandXML) | Elimina a TIN do LandXML e constrói a partir dos pontos; não pode ser anulado |
| {{ui:Começar a partir do terreno}} | Painel direito, Diretriz | Inicia um perfil de projeto com um PVI no terreno em cada extremidade |
| {{ui:Vista do perfil}} | Painel direito, Diretriz | Abre a vista do perfil desta diretriz |
| {{ui:Adicionar PVI}} | Barra do perfil | Enquanto estiver ativo, um clique no perfil acrescenta um PVI |
| {{ui:Definir todas as cotas de soleira a partir das regras}} | Painel direito, Rede de coletores | Define as cotas de soleira de todos os coletores a partir das regras |
| {{ui:Definir as cotas de soleira a partir das regras}} | Painel direito, Coletor | Define as cotas de soleira deste coletor a partir das regras |
