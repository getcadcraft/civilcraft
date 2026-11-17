---
title: Ainda não implementado
summary: O que esta versão do CivilCraft ainda não faz e o que fazer no lugar, hoje.
keywords: ausente, limitações, roteiro, não disponível, espirais, alargamento, dwg, dxf, bocas de lobo, detenção, seções transversais, para depois, limites
from: a2d970ef
---

O CivilCraft está em fase inicial. Esta página lista o que a versão atual não faz, para que você não procure por isso. Nada aqui tem data prometida.

## Pontos

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Acrescentar um segundo arquivo de pontos ao primeiro | Una os arquivos em um editor de texto ou em uma planilha antes |
| Exportar um arquivo de texto de pontos | Exporte o LandXML (os pontos saem como CgPoints), use {{ui:Export}} do GIS (pontos com os campos P, N, E, Z e D), ou {{ui:Copy}} os pontos para uma planilha |
| Estilos de rótulo de pontos, símbolos por chave de descrição, curvas (arcos) a partir de códigos de linha, um arquivo de chaves de descrição para compartilhar entre projetos | Os rótulos mostram o número, a cota e a descrição, ou menos ([Configurações do CivilCraft](topic:settings)); as chaves ficam no arquivo do projeto |
| Conversão de unidades | Converta o arquivo antes de importar; **Units** apenas renomeia a unidade |

## Superfícies

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Mais de uma superfície criada a partir de pontos | Um projeto por superfície |
| Ocultar limites (internos) | Use **Longest outside edge** ou um limite externo |
| Selecionar ou editar uma linha de quebra desenhada | {{key:Mod+Z}}, ou {{ui:Remove drawn breaklines}} e desenhe de novo |
| Editar uma superfície lida de um LandXML (linhas de quebra, limite) | {{ui:Rebuild the surface from the points}} |
| Editar uma superfície feita de uma grade de cotas | Importe a grade de novo com outras opções |
| Converter uma superfície lida de um LandXML quando o sistema de coordenadas muda | Primeiro, {{ui:Rebuild the surface from the points}} |
| Cotas de nível rotuladas e valores de declividade | Leia-os na barra de status, ou pinte a superfície por declividade com **Slope analysis** no espaço de trabalho Paisagismo ([Grading for landscape](topic:landscape-grading#grading-checks)) |

## Alinhamentos e perfis

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Espirais que não sejam clotoides; uma espiral entre duas curvas (transições compostas) | As espirais clotoides nas extremidades de uma curva estão disponíveis; as demais são nomeadas e ignoradas na importação de LandXML |
| Inserir um PI entre outros dois | Desenhe o alinhamento de novo, ou digite de novo as coordenadas dos PIs |
| Alinhamentos a partir de objetos, deslocamentos, alargamentos | Desenhe pelos PIs |
| Digitar K para uma curva vertical | Digite L (K é mostrado) |
| Curvas verticais circulares e assimétricas | Somente curvas parabólicas simétricas |
| Mais de um perfil de projeto por alinhamento | Um alinhamento por variante |
| Dar zoom na vista de perfil, faixas de perfil sob o perfil | A vista de perfil ajusta todo o alinhamento; plote-a em [folhas de planta e perfil](topic:plan-profile-sheets) |
| Seções em DWG ou LandXML | Folhas de seção em PDF; {{ui:CSV}} das áreas e volumes |
| Linhas de amostragem inclinadas, ou com larguras diferentes ao longo da via | Uma largura para cada lado, em todo o alinhamento |

## Corredores

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Canteiros centrais, barreiras e uma superelevação que gira os modelos | Desenhe-os como modelos ([Modelos de corredor](topic:corridor-templates)); os modelos por estaca ainda não aceitam superelevação |
| Uma mudança gradual entre os modelos de duas regiões (transições, afunilamentos) | Troque o modelo em uma estaca, ou dê a um ponto uma meta de largura para uma linha desenhada como o afunilamento |
| Rotação em torno de uma borda, superelevação em LandXML | A superelevação gira em torno do eixo nas curvas circulares; alargue uma faixa com uma meta de largura para uma linha de feição |
| Metas para os taludes laterais (pé de talude até uma linha ou superfície), superfícies próprias de corredor | As metas movem as bordas da pista e dos acostamentos ([Corredores](topic:corridor)); o corredor é terraplenado na superfície projetada |
| Corredores exportados como vias de LandXML; um segundo corredor em um alinhamento na exportação IFC | A superfície projetada é exportada |
| Modelos de terreno que alteram a superfície projetada, em 3D ou nas seções | Eles dão as áreas e volumes de cada camada ([Modelos de terreno](topic:corridor-templates#terrain-templates)) |
| Trajetórias de giro com velocidade, derrapagem dos pneus, tempo de esterçamento, reboques de esterçamento ou folga da carroceria; uma biblioteca de veículos de projeto padrão; uma trajetória de giro desenhada arrastando o veículo | Trajetórias de giro em baixa velocidade ao longo de uma linha de feição ou de um alinhamento, com as dimensões dos seus próprios veículos ([Trajetórias de giro de veículos](topic:swept-paths)) |

## Terraplenagem e volumes

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Bermas, linhas de feição abertas terraplenadas no projeto, terraplenagem até uma linha de feição de outro lugar | Feche a linha de feição ([Linhas de feição](topic:feature-lines)), ou use-a como linha de quebra do terreno existente |
| Inserir ou remover um vértice de linha de feição | Desenhe a linha de novo, ou crie um deslocamento escalonado dela |
| Arcos em linhas de quebra desenhadas (passando por pontos topográficos), espirais em linhas de feição | Desenhe uma linha de feição com arcos e use-a como linha de quebra do terreno existente |
| Terraplenagem até uma distância, uma cota ou outra superfície | Pé de talude somente até o terreno existente |
| Inserir ou remover um canto de plataforma | Exclua a plataforma e desenhe de novo |
| Volumes TIN para TIN (prisma), escolha do tamanho da célula da grade | Método de grade, com o tamanho da célula escolhido para você |
| Empolamento e contração, camada vegetal, espessuras de pavimento | Aplique os fatores aos números informados por conta própria |
| Custos de transporte livre e de transporte excedente, transporte entre alinhamentos diferentes, áreas de empréstimo e bota-foras posicionados no plano | O diagrama de massas com os pontos de equilíbrio, os volumes movimentados e as distâncias médias de transporte |

## Redes de tubos

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Mais de uma rede por projeto | Projetos separados para drenagem pluvial e esgoto |
| Redes de água: qualidade e idade da água, controles baseados em regras, outros tipos de válvula (controle de vazão, estrangulamento, sustentação), bombas definidas por potência, demanda que depende da pressão, uma opção Darcy–Weisbach, um catálogo de tubos com espessuras de parede e classes de pressão. O restante das redes de pressão está em laboratório: [Redes de água](topic:water-mains) | Verifique esses pontos em um software de distribuição de água; as vazões de projeto de esgoto estão em [Vazões de projeto de esgoto](topic:sanitary-design) |
| Vazões de esgoto ao longo do tempo (hidrogramas, roteamento dinâmico, reservação, bombas, extravasores) | [Vazões de projeto de esgoto](topic:sanitary-design) dá a vazão de pico permanente que uma folha de projeto usa |
| Capacidade de boca de lobo, espalhamento na sarjeta, roteamento com detenção, hidrogramas, perdas de energia além de um coeficiente de junção | Verifique-os em outro software; vazões, diâmetros e as linhas de gradiente hidráulico estão em [Drenagem pluvial](topic:storm-drainage) |
| Bacias de contribuição no PDF, DWG, DXF ou LandXML; bacias de contribuição a partir da superfície (divisores de água) | Desenhe as bacias à mão; elas são salvas no arquivo do projeto |
| Catálogos de tubos, tubos não circulares, estruturas que não sejam caixas ou cilindros verticais (cones, degraus, bermas internas) , uma categoria de drenagem na biblioteca | Tipos de estrutura a partir de parâmetros ([Rede de tubos](topic:pipe-network)); tubos com um diâmetro |
| Tubos na vista de perfil, tubos curvos | Leia as cotas de fundo e a cobertura no painel direito |

## Lotes

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Dividir lotes por área ou testada, lotes a partir das linhas ao redor deles, faixa de domínio | Desenhe cada lote pelos seus vértices, ou digite os seus rumos |
| Tabelas de curvas e tabelas de linhas no plano; rótulos movidos à mão | Cada trecho é rotulado ao longo de si mesmo |
| Lotes em LandXML | Os lotes são salvos no arquivo do projeto e vão para o PDF, DWG e DXF |

## Poligonais

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Ajustamento por mínimos quadrados, a regra do transit, ponderação dos ângulos em relação às distâncias | A regra da bússola |
| Ângulos de deflexão, ângulos zenitais e distâncias inclinadas, cotas por nivelamento trigonométrico | Reduza às distâncias e aos ângulos horizontais corretamente, ou aos rumos |
| Tomadas laterais, arquivos de dados brutos dos coletores de dados | Importe os pontos como um arquivo de pontos |

## Locação

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Piquetes de deslocamento (pontos de referência afastados do piquete), piquetes de talude no ponto de encontro do talude | Locar nos deslocamentos de que você precisa, inclusive além do acostamento |
| Enviar os piquetes diretamente no formato próprio de um coletor de dados | O CSV abre no software de escritório da maioria dos coletores de dados |
| Locar tubos, plataformas e lotes | Use pontos topográficos perto de um alinhamento, ou os trechos do lote |

## Arquivos e saída

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Textos, hachuras e cotas de DWG ou DXF; espaço papel; desenhos vinculados (xrefs); DXF binário | Abre-se a linework do espaço modelo ([Abrir um DWG ou DXF como linework](topic:open-dwg-dxf)); abra os desenhos vinculados separadamente |
| Mover vários pontos de uma vez arrastando | Recorte e cole-os, ou edite-os um de cada vez |
| Folhas em retrato, legendas próprias, viewports que você organiza, folhas de planta e perfil em DWG | Uma folha de planta em paisagem por PDF, ou folhas de planta e perfil ao longo de um alinhamento (PDF) |
| Plotar faixas de cotas e perfis | As faixas são apenas na tela; faça uma captura de tela se precisar delas |
| Alterar nomes, cores ou estilos de rótulo das camadas | Altere-os em um programa CAD depois da exportação DXF |
| Salvamento em nuvem e histórico de versões | Salve os arquivos `.civilcraft.json` e mantenha cópias de segurança; para trabalhar em um projeto em conjunto, use uma sessão ao vivo no CadCraft Studio ([Projete um local em conjunto, ao vivo](topic:work-live)) |
| CadCraft Studio para iPad e iPhone, e pela Google Play | Use o CivilCraft no navegador do dispositivo; no Android, o CadCraft Studio é instalado pelo seu APK em getcadcraft.com/download |
| Abrir vários arquivos de pontos ou de projeto ao mesmo tempo | Um arquivo por vez (arquivos GIS que pertencem juntos, como as partes de um shapefile, abrem juntos) |

## Paisagismo

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Cabeçotes e bicos dos fabricantes | Cabeçotes genéricos, ou adicione os seus a partir de um arquivo; os dados dos fabricantes entram à medida que eles autorizam |
| Comprimentos laterais máximos para linhas de gotejamento, vazões ao longo do tempo, bombas, redes de tubos em malha | Mantenha os trechos de gotejamento no comprimento publicado pelo fabricante; a verificação exige uma rede ramificada |
| O contorno exato de um objeto de forma livre côncavo; seu volume abaixo do terreno medido com exatidão | A envoltória convexa é terraplenada, e o volume abaixo do terreno é uma estimativa (indicada em Propriedades) |
| Plantas nos próprios Colocar da biblioteca do BimCraft e do ModelCraft | Exporte o IFC de paisagismo e abra-o no BimCraft ao lado do edifício |
| Modelos detalhados de plantas (folhas, galhos, estações) na vista 3D; objetos de forma livre e irrigação na vista 3D | As plantas aparecem em 3D como formas simples dimensionadas pela lista de plantas ([Ver o local em 3D](topic:site-3d)); o espalhamento do ModelCraft faz imagens de plantio |
| Muros de contenção de obra dura que retêm um nível terraplenado atrás deles, na superfície | Dê a uma plataforma ou plataforma de estacionamento lados verticais: eles são muros de arrimo na superfície ([Terraplenagem](topic:grading)) |
| Transformações SVG em seus próprios símbolos; texturas e cores de modelos GLB de plantas próprios; geometria GLB comprimida | Achate as transformações no seu programa de desenho antes; os modelos são desenhados na cor da planta; exporte o GLB sem compressão ([Gráficos de plantas](topic:plant-graphics)) |
| Sua própria lista de plantas guardada na conta da Biblioteca (editada no app) | Edite a lista própria do projeto na tabela de plantas e salve-a como um arquivo de plantas |
| As ferramentas de paisagismo para assistentes sem a janela (o servidor de arquivos e a linha de comando) | Funcionam com a janela do CivilCraft aberta ([Deixe um assistente de IA trabalhar com o seu local](topic:assistants)) |

## Linhas de energia

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Um padrão de país embutido (hipóteses de carga, folgas, fatores) | Defina os valores do seu padrão em {{ui:Load cases and limits…}} e salve-os, com a sua biblioteca, como um pacote para reutilizar e compartilhar ([Pacotes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| A distância horizontal de um condutor até a copa de uma árvore ou um muro ao lado da linha | A folga na vertical sobre plantas e muros que a linha cruza ([Verificações de linhas de energia](topic:power-line-checks#clearances)) |
| Fluência do condutor e o alongamento de um condutor novo | Considere-os pelas temperaturas na tabela de lançamento |
| Capacidade térmica de cabos enterrados (capacidade de corrente pela forma de instalação) | Digite a capacidade de corrente do seu fornecedor no item do cabo |
| Estudos de curto-circuito, proteção e aterramento | Use um programa elétrico específico; o CivilCraft fornece os comprimentos e os cabos da rede |
| Torres treliçadas dimensionadas barra a barra, e tirantes de ancoragem no solo | Os apoios são verificados pela carga nominal; os estais, pela carga nominal de projeto |
| Um arquivo de estudo `.DON` verificado no programa que o lê | Verifique o arquivo lá; envie-nos um exemplo para testarmos com um real |
| Linhas de energia na vista 3D e no IFC | O plano, o perfil da linha, as folhas e as camadas GIS |
| As ferramentas de linhas de energia para assistentes sem a janela | Funcionam com a janela do CivilCraft aberta ([Deixe um assistente de IA trabalhar com o seu local](topic:assistants)) |

## Volumes construídos

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Uma biblioteca de códigos de zoneamento ou das regras de qualquer cidade | Digite os limites da sua própria lei municipal ([Limites de zoneamento](topic:zoning-limits)) |
| Luz do céu nas paredes (luz natural de fachada), vento | [Horas de sol](topic:sun-hours) conta apenas o sol direto |
| Sombra de árvores, plantas ou de qualquer coisa que não esteja desenhada como volume | Desenhe os edifícios vizinhos como volumes |
| Formas de telhado em volumes | Volumes com topo plano |
| Aberturas, telhados e tipos de parede quando um volume é desenvolvido no BimCraft | O BimCraft cria paredes externas simples em cada pavimento e uma laje; acrescente o restante ali |

## GIS e sistemas de coordenadas

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| File Geodatabase; estilos de KML, ícones, sobreposições de terreno e links de rede | Converta antes para GeoPackage, shapefile ou GeoJSON; os marcadores KML são lidos sem os estilos |
| Editar feições GIS ou seus atributos | Edite-as em um programa GIS e importe de novo. O painel Analisar cria novas camadas (buffer, sobreposição, junção, seleção) e acrescenta campos de área e comprimento, mas não edita uma feição no lugar |
| Análise de redes e de rasters, buffers com extremidades planas ou quadradas e buffers de um lado só, adicionar ou excluir linhas e mudar o tipo de um campo na tabela de atributos, cores de classe manuais, uma legenda de estilo nas plotagens | Use Selecionar para escolher feições e criar uma camada a partir delas; extremidades planas não são oferecidas. Colorir por atributo e a tabela de atributos estão prontos: veja [Estilizar uma camada por um atributo](topic:gis-symbology) e [Trabalhar com a tabela de atributos de uma camada](topic:gis-table) |
| Estilos de rótulo (tamanho, posicionamento) e rótulos que evitam uns aos outros | Os rótulos têm um só tamanho e podem se sobrepor onde as feições são densas |
| Datums verticais e modelos de geoide | As cotas são usadas como o arquivo as fornece; verifique o datum vertical por conta própria |
| Transformações de grade diferentes de NAD27 para NAD83 sugeridas pela área (OSTN15; NTv2 para outros datums funciona quando você adiciona o arquivo), várias grades ao mesmo tempo, grades verticais | Adicione o arquivo da grade do seu datum por conta própria; uma grade por projeto |
| Camadas de mapa no DXF ou em exportações 3D | As camadas de mapa vão para a plotagem em PDF, e ao lado do DWG como imagem |
| Servidores de mapas que exigem login, chave ou token | Use serviços públicos, ou um arquivo de imagem georreferenciado |
| Gravar arquivos LAS ou LAZ a partir de uma superfície, do modelo do terreno ou das ferramentas de grade de cotas e LiDAR | Exporte as superfícies como uma grade de cotas GeoTIFF. O complemento [Nuvens de pontos](topic:point-clouds) grava uma nuvem limpa como LAS 1.4 ou LAZ |
| Intensidade, cor e retornos LiDAR; grades de cotas com várias bandas; arquivos de grade ou LiDAR com mais de 200 MB | O LiDAR é filtrado somente por classe, e as grades usam a primeira banda; divida os arquivos grandes em blocos antes |

## Entrada

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Seleção por caixa no toque (exige {{key:Shift}}) | Pressione e segure em cada ponto topográfico para adicioná-lo |
| Coordenadas ou distâncias digitadas durante o desenho | Desenhe de forma aproximada e depois digite as coordenadas exatas dos PIs na tabela de PIs do alinhamento |
| Digitar coordenadas para os cantos de plataformas e estruturas | Arraste as suas alças; amplie para maior precisão e acompanhe E e N na barra de status |
| Encaixe em objetos (além dos pontos topográficos para linhas de quebra) | Amplie e acompanhe a barra de status |

## Vista 3D

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Desenhar ou editar na vista 3D | Desenhe e edite no plano; a vista 3D acompanha cada edição |
| Selecionar linhas de feição de corredor ou feições GIS clicando no 3D | Clique nelas no plano |
| Exportar a vista exagerada ou em pés | As exportações são em escala real, em metros; veja [Exportar o local em 3D](topic:export-3d) |
| Rótulos em exportações GLB ou OBJ, tamanhos e estilos de rótulo no 3D | Os rótulos aparecem somente na vista 3D, em um só tamanho; veja [Ver o local em 3D](topic:site-3d) |
| Texturas a partir de fotos, gravação de um percurso em vídeo, sombras de fora do local, horas de sol exibidas na vista 3D | Camadas de mapa sobrepostas às superfícies; percorra e veja a posição do sol em um horário; [horas de sol](topic:sun-hours) para um dia ou uma estação no plano |
