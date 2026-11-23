---
title: Ainda não implementado
summary: O que esta versão do CivilCraft ainda não faz e o que fazer hoje no lugar.
keywords: faltando, limitações, roteiro, não disponível, espirais, alargamento, dwg, dxf, bocas de lobo, detenção, seções transversais, em breve, limites
from: b91588d4
---

A CivilCraft está no começo. Esta página lista o que a versão atual não faz, para que você não procure por isso. Nada aqui tem data prometida.

## Pontos

| Ainda não implementado | O que fazer hoje |
|---|---|
| Adicionar um segundo arquivo de pontos ao primeiro | Junte os arquivos em um editor de texto ou planilha antes |
| Exportar um arquivo de texto de pontos | Exporte LandXML (os pontos saem como CgPoints), use {{ui:Export}} de SIG (pontos com os campos P, N, E, Z e D), ou use {{ui:Copy}} para levar os pontos a uma planilha |
| Estilos de rótulo de pontos, símbolos por chave de descrição, curvas (arcos) a partir de códigos de linha, um arquivo de chaves de descrição para compartilhar entre projetos | Os rótulos mostram o número, a cota e a descrição, ou menos ([Configurações da CivilCraft](topic:settings)); as chaves ficam salvas no arquivo do projeto |
| Conversão de unidades | Converta o arquivo antes de importar; {{ui:Units}} apenas renomeia |

## Superfícies

| Ainda não implementado | O que fazer hoje |
|---|---|
| Mais de uma superfície construída a partir de pontos | Um projeto por superfície |
| Ocultar contornos (internos) | Use **Maior borda externa** ou um contorno externo |
| Selecionar ou editar uma linha de quebra desenhada | {{key:Mod+Z}}, ou {{ui:Remove drawn breaklines}} e desenhe de novo |
| Editar uma superfície lida de LandXML (linhas de quebra, contorno) | {{ui:Rebuild the surface from the points}} |
| Editar uma superfície feita a partir de uma grade de cotas | Importe a grade de novo com outras opções |
| Converter uma superfície lida de LandXML quando o sistema de coordenadas muda | {{ui:Rebuild the surface from the points}} primeiro |
| Cotas pontuais rotuladas e valores de declividade | Leia-os na barra de status, ou colora a superfície pela declividade com **Análise de declividade** no espaço de trabalho Paisagismo ([Regularização para paisagismo](topic:landscape-grading#grading-checks)) |

## Alinhamentos e perfis

| Ainda não implementado | O que fazer hoje |
|---|---|
| Espirais que não sejam clotoides; uma espiral entre duas curvas (transições compostas) | Espirais clotoides nas extremidades de uma curva estão disponíveis; as outras são nomeadas e ignoradas na importação de LandXML |
| Inserir um PI entre dois outros | Desenhe o alinhamento de novo, ou digite novamente as coordenadas dos PIs |
| Alinhamentos a partir de objetos, deslocamentos, alargamentos | Desenhe por PIs |
| Digitar K para uma curva vertical | Digite L (K é mostrado) |
| Curvas verticais circulares e assimétricas | Somente curvas verticais parabólicas simétricas |
| Mais de um perfil de projeto por alinhamento | Um alinhamento por variante |
| Dar zoom na vista do perfil, faixas de perfil sob o perfil | A vista do perfil se ajusta ao alinhamento inteiro; plote-a nas [folhas de planta e perfil](topic:plan-profile-sheets) |
| Seções em DWG ou LandXML | Folhas de seções em PDF; {{ui:CSV}} das áreas e volumes |
| Linhas de amostragem em ângulo, ou de larguras diferentes ao longo da estrada | Uma largura de cada lado para o alinhamento inteiro |

## Corredores

| Ainda não implementado | O que fazer hoje |
|---|---|
| Canteiros centrais, barreiras e uma superelevação que gira modelos | Desenhe-os como modelos ([Modelos de corredor](topic:corridor-templates)); modelos por estaca ainda não aceitam superelevação |
| Uma mudança gradual entre os modelos de duas regiões (transições, afunilamentos) | Mude o modelo em uma estaca, ou dê um alvo de largura a um ponto até uma linha desenhada como o afunilamento |
| Rotação em torno de uma borda, superelevação em LandXML | A superelevação gira em torno do eixo nas curvas circulares; alargue uma faixa com um alvo de largura até uma linha de feição |
| Alvos para as declividades transversais (pé de talude até uma linha ou uma superfície), superfícies próprias de corredores | Os alvos movem as bordas da pista e dos acostamentos ([Corredores](topic:corridor)); o corredor é regularizado na superfície projetada |
| Meios-fios de retorno, faixas de conversão e ilhas regularizadas em uma junção; a extremidade de uma via secundária cortada até a borda da via principal em ângulo; um caminho unido a uma estrada na planta, no seu comprimento e área | Estradas que se encontram são unidas em esquadro, com a borda da via principal aberta e a via secundária suavizada até ela ([Onde estradas se encontram](topic:corridor#where-roads-meet-roads-pads-and-paths)); um caminho para na borda da estrada na superfície projetada e em 3D |
| Corredores exportados como vias LandXML; um segundo corredor em um alinhamento na exportação IFC | A superfície projetada é exportada |
| Modelos de terreno que alteram a superfície projetada, em 3D ou nas seções | Eles dão áreas e volumes de cada camada ([Modelos de terreno](topic:corridor-templates#terrain-templates)) |
| Trajetórias de giro com velocidade, derrapagem dos pneus, tempo de esterçamento, reboques articulados ou folga da carroceria; uma biblioteca de veículos de projeto padrão; uma trajetória de giro desenhada arrastando o veículo | Trajetórias de giro em baixa velocidade ao longo de uma linha de feição ou de um alinhamento, com as dimensões dos seus próprios veículos ([Trajetórias de veículos](topic:swept-paths)) |

## Terraplenagem e volumes

| Ainda não implementado | O que fazer hoje |
|---|---|
| Bermas, linhas de feição abertas regularizadas no projeto, regularização até uma linha de feição de outro lugar | Feche a linha de feição ([Linhas de feição](topic:feature-lines)), ou use-a como linha de quebra do terreno natural |
| Inserir ou remover um vértice de linha de feição | Desenhe a linha de novo, ou faça um deslocamento escalonado dela |
| Arcos em linhas de quebra desenhadas (por pontos de levantamento), espirais em linhas de feição | Desenhe uma linha de feição com arcos e use-a como linha de quebra do terreno natural |
| Regularização até uma distância, uma cota ou outra superfície | Somente pé de talude até o terreno natural |
| Incluir ou remover um canto de plataforma | Exclua a plataforma e desenhe-a de novo |
| Volumes TIN a TIN (prisma), escolha do tamanho da célula da grade | Método da grade, com o tamanho da célula escolhido para você |
| Empolamento e contração, camada vegetal, espessuras de pavimento | Aplique os fatores aos números informados por você mesmo |
| Custos de transporte livre e de transporte excedente, transporte entre alinhamentos diferentes, empréstimos e bota-foras posicionados na planta | O diagrama de massas com pontos de equilíbrio, volumes movimentados e distâncias médias de transporte |

## Redes de tubulação

| Ainda não implementado | O que fazer hoje |
|---|---|
| Mais de uma rede por projeto | Projetos separados para drenagem pluvial e esgoto |
| Adutoras de água: qualidade e idade da água, controles por regras, outros tipos de válvula (controle de vazão, estrangulamento, de sustentação), bombas definidas por potência, demanda que depende da pressão, uma opção Darcy–Weisbach, um catálogo de tubos com espessuras de parede e classes de pressão. O restante das redes pressurizadas está em teste: [Tubulações de água](topic:water-mains) | Verifique isso em software de distribuição de água; as vazões de projeto de esgoto estão em [Vazões de projeto de esgoto](topic:sanitary-design) |
| Vazões de esgoto ao longo do tempo (hidrogramas, roteamento dinâmico, armazenamento, bombas, extravasores) | [Vazões de projeto de esgoto](topic:sanitary-design) dá a vazão de pico em regime permanente que uma folha de projeto usa |
| Capacidade de boca de lobo, espalhamento na sarjeta, roteamento de detenção, hidrogramas, perdas de energia além de um coeficiente de junção | Verifique em outro software; vazões, dimensões e linhas de greide estão em [Drenagem pluvial](topic:storm-drainage) |
| Bacias de contribuição no PDF, DWG, DXF ou LandXML; bacias a partir da superfície (divisores de água) | Desenhe as bacias à mão; elas são salvas no arquivo do projeto |
| Catálogos de tubos, tubos não circulares, estruturas que não são caixas ou cilindros verticais (cones, degraus, bermas), uma categoria de drenagem na biblioteca | Tipos de estrutura a partir de parâmetros ([Rede de tubulações](topic:pipe-network)); tubos com diâmetro |
| Tubos na vista do perfil, tubos curvos | Leia as cotas de fundo e a cobertura no painel da direita |

## Lotes

| Ainda não implementado | O que fazer hoje |
|---|---|
| Parcelar lotes por área ou testada, lotes a partir das linhas ao redor, faixa de domínio | Desenhe cada lote pelos seus cantos, ou digite os seus rumos |
| Tabelas de curvas e tabelas de linhas na planta; rótulos movidos à mão | Cada lado é rotulado ao longo de si mesmo |
| Lotes em LandXML | Os lotes são salvos no arquivo do projeto e vão para o PDF, DWG e DXF |

## Poligonais

| Ainda não implementado | O que fazer hoje |
|---|---|
| Ajustamento por mínimos quadrados, a regra do transporte, pesos de ângulos em relação a distâncias | A regra da bússola |
| Ângulos de deflexão, ângulos zenitais e distâncias inclinadas, cotas por nivelamento trigonométrico | Reduza para distâncias e ângulos horizontais corretos, ou para rumos |
| Visadas laterais, arquivos de dados brutos de coletores de dados | Importe os pontos como arquivo de pontos |

## Locação

| Ainda não implementado | O que fazer hoje |
|---|---|
| Estacas de afastamento (pontos de referência recuados em relação à estaca), estacas de talude no ponto de encontro com o terreno | Locação nos afastamentos que você precisa, inclusive além do acostamento |
| Enviar estacas diretamente ao formato próprio de um coletor de dados | O CSV abre no software de escritório da maioria dos coletores de dados |
| Locar tubulações, plataformas e lotes | Use pontos de levantamento perto de um alinhamento, ou os lados do lote |

## Arquivos e saída

| Ainda não implementado | O que fazer hoje |
|---|---|
| Textos, hachuras e cotas de DWG ou DXF; espaço papel; desenhos vinculados (xrefs); DXF binário | O desenho linear do espaço modelo é aberto ([Abrir um DWG ou DXF como desenho linear](topic:open-dwg-dxf)); abra os desenhos vinculados separadamente |
| Mover vários pontos de uma vez arrastando | Recorte e cole-os, ou edite-os um de cada vez |
| Folhas em retrato, legendas próprias, janelas de visualização que você organiza, folhas de planta e perfil em DWG | Uma folha de planta em paisagem por PDF, ou folhas de planta e perfil ao longo de um alinhamento (PDF) |
| Plotar faixas de cotas e perfis | As faixas são apenas na tela; tire uma captura de tela se precisar delas |
| Alterar nomes de camadas, cores ou estilos de rótulo | Altere-os em um programa CAD após a exportação DXF |
| Salvamento em nuvem e histórico de versões | Salve os arquivos `.civilcraft.json` e mantenha cópias de segurança; para trabalhar em um projeto em conjunto, use uma sessão ao vivo no CadCraft Studio ([Projetar um local em conjunto, ao vivo](topic:work-live)) |
| CadCraft Studio para iPad e iPhone, e pela Google Play | Use a CivilCraft no navegador do dispositivo; no Android, o CadCraft Studio é instalado pelo APK em getcadcraft.com/download |
| Abrir vários arquivos de pontos ou de projeto ao mesmo tempo | Um arquivo por vez (arquivos SIG que pertencem juntos, como as partes de um shapefile, abrem juntos) |

## Paisagismo

| Ainda não implementado | O que fazer hoje |
|---|---|
| Cabeçotes e bicos de fabricantes | Cabeçotes genéricos, ou adicione os seus a partir de um arquivo; os dados dos fabricantes entram à medida que eles autorizam |
| Comprimentos laterais máximos para linhas de gotejamento, vazões ao longo do tempo, bombas, redes de tubulação em malha | Mantenha as linhas de gotejamento no comprimento publicado pelo fabricante; a verificação exige uma rede ramificada |
| O contorno exato de um objeto de forma livre côncavo; seu volume abaixo do terreno medido com exatidão | Regulariza-se o fecho convexo, e o volume abaixo do terreno é uma estimativa (informada nas Propriedades) |
| Plantas na função Inserir da biblioteca do BimCraft e do ModelCraft | Exporte o IFC de paisagismo e abra-o no BimCraft ao lado da edificação |
| Modelos detalhados de plantas (folhas, galhos, estações) na vista 3D; objetos de forma livre e irrigação na vista 3D | As plantas aparecem em 3D como formas simples dimensionadas pela lista de plantas ([Ver o local em 3D](topic:site-3d)); a dispersão do ModelCraft faz imagens de plantio |
| Muros de elementos construídos que retêm um nível regularizado atrás deles na superfície | Dê a uma plataforma ou a um pad laterais verticais: eles são muros de arrimo na superfície ([Regularização](topic:grading)) |
| Transformações SVG em seus próprios símbolos; texturas e cores de modelos GLB de plantas próprios; geometria GLB comprimida | Aplique as transformações no seu programa de desenho antes; os modelos são desenhados na cor da planta; exporte o GLB sem compressão ([Gráficos de plantas](topic:plant-graphics)) |
| Sua própria lista de plantas guardada na sua conta da Biblioteca (editada no aplicativo) | Edite a lista própria do projeto na tabela de plantas e salve-a como arquivo de plantas |
| As ferramentas de paisagismo para assistentes sem a janela (o servidor de arquivos e a linha de comando) | Elas funcionam com a janela da CivilCraft aberta ([Deixe um assistente de IA trabalhar com seu local](topic:assistants)) |

## Linhas de transmissão

| Ainda não implementado | O que fazer hoje |
|---|---|
| A norma de um país já embutida (hipóteses de carga, folgas, fatores) | Defina os valores da sua norma em {{ui:Load cases and limits…}} e salve-os, com a sua biblioteca, como um pacote para reutilizar e compartilhar ([Pacotes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| A distância horizontal de um condutor até a copa de uma árvore ou um muro ao lado da linha | A folga vertical sobre plantas e muros que a linha cruza ([Verificações de linhas de transmissão](topic:power-line-checks#clearances)) |
| Fluência do condutor e o alongamento de um condutor novo | Considere-os nas temperaturas da tabela de lançamento |
| Capacidade térmica de cabos enterrados (capacidade de corrente a partir da forma como são instalados) | Informe a capacidade de corrente do seu fornecedor no item do cabo |
| Estudos de curto-circuito, proteção e aterramento | Use um programa elétrico dedicado; a CivilCraft fornece os comprimentos da rede e os cabos |
| Torres treliçadas dimensionadas barra a barra, e estais ancorados no solo | Os suportes são verificados pela carga nominal; os estais, pela carga nominal de trabalho |
| Um arquivo de estudo `.DON` verificado no programa que o lê | Verifique o arquivo nesse programa; envie-nos uma amostra para testarmos com um real |
| Linhas de transmissão na vista 3D e no IFC | A planta, o perfil da linha, as folhas e as camadas SIG |
| As ferramentas de linhas de transmissão para assistentes sem a janela | Elas funcionam com a janela da CivilCraft aberta ([Deixe um assistente de IA trabalhar com seu local](topic:assistants)) |

## Massas de edificação

| Ainda não implementado | O que fazer hoje |
|---|---|
| Uma biblioteca de códigos de zoneamento ou as regras de qualquer cidade | Digite os limites da sua própria lei ([Limites de zoneamento](topic:zoning-limits)) |
| Luz do céu nas paredes (iluminação de fachada), vento | [Horas de sol](topic:sun-hours) conta apenas o sol direto |
| Sombra de árvores, plantas ou qualquer coisa não desenhada como massa | Desenhe as edificações vizinhas como massas |
| Formas de cobertura em massas | Massas com topo plano |
| Aberturas, coberturas e tipos de parede quando uma massa é desenvolvida no BimCraft | O BimCraft cria paredes externas simples em cada pavimento e um piso; acrescente o restante lá |

## SIG e sistemas de coordenadas

| Ainda não implementado | O que fazer hoje |
|---|---|
| File Geodatabase; estilos, ícones, sobreposições de solo e links de rede de KML | Converta antes para GeoPackage, shapefile ou GeoJSON; marcas KML são lidas sem os seus estilos |
| Editar feições SIG ou os seus atributos | Edite-as em um programa SIG e importe de novo. O painel Analisar cria novas camadas (buffer, sobreposição, junção, seleção) e acrescenta campos de área e comprimento, mas não edita uma feição no lugar |
| Análise de rede e de raster, buffers com extremidades planas ou quadradas e buffers unilaterais, adicionar ou excluir linhas e mudar o tipo de um campo na tabela de atributos, cores de classe manuais, uma legenda de estilo nos gráficos | Use {{ui:Select}} para escolher feições e criar uma camada a partir delas; extremidades planas não são oferecidas. Colorir por atributo e a tabela de atributos já existem: veja [Estilizar uma camada por um atributo](topic:gis-symbology) e [Trabalhar com a tabela de atributos de uma camada](topic:gis-table) |
| Estilos de rótulo (tamanho, posicionamento) e rótulos que evitam uns aos outros | Os rótulos têm um tamanho e podem se sobrepor onde as feições são densas |
| Datums verticais e modelos de geoide | As cotas são usadas como o arquivo as fornece; confira o datum vertical você mesmo |
| Deslocamentos de grade além de NAD27 para NAD83 sugeridos por área (OSTN15, NTv2 para outros datums funcionam quando você adiciona o arquivo), várias grades ao mesmo tempo, grades verticais | Adicione você mesmo o arquivo de grade do seu datum; uma grade por projeto |
| Camadas de mapa nos exportados em DXF ou em 3D | As camadas de mapa vão para a plotagem em PDF e, ao lado do DWG, como imagem |
| Servidores de mapas que exigem login, chave ou token | Use serviços públicos, ou um arquivo de imagem georreferenciado |
| Gravar arquivos LAS ou LAZ a partir de uma superfície, do modelo do terreno ou das ferramentas de grade de elevação e LiDAR | Exporte superfícies como grade de elevação GeoTIFF. O complemento [Nuvens de pontos](topic:point-clouds) grava uma nuvem limpa como LAS 1.4 ou LAZ |
| Intensidade, cor e retornos de LiDAR; grades de elevação com várias bandas; arquivos de grade ou LiDAR com mais de 200 MB | O LiDAR é filtrado apenas por classe, e as grades usam a primeira banda; divida arquivos grandes em partes antes |

## Entrada

| Ainda não implementado | O que fazer hoje |
|---|---|
| Seleção por caixa com toque (precisa de {{key:Shift}}) | Pressione longamente cada ponto de levantamento para adicioná-lo |
| Coordenadas ou distâncias digitadas durante o desenho | Desenhe aproximadamente e depois digite as coordenadas exatas dos PIs na tabela de PIs do alinhamento |
| Digitar coordenadas de cantos de plataformas e estruturas | Arraste suas alças; aproxime o zoom para precisão e acompanhe E e N na barra de status |
| Encaixe em objetos (além de pontos de levantamento para linhas de quebra) | Aproxime o zoom e acompanhe a barra de status |

## Vista 3D

| Ainda não implementado | O que fazer hoje |
|---|---|
| Desenhar ou editar na vista 3D | Desenhe e edite na planta; a vista 3D acompanha cada edição |
| Selecionar linhas de feição de corredores ou feições SIG clicando em 3D | Clique neles na planta |
| Exportar a vista com exagero ou em pés | As exportações são em escala real, em metros; veja [Exportar o local em 3D](topic:export-3d) |
| Rótulos em exportações GLB ou OBJ, tamanhos e estilos de rótulo em 3D | Os rótulos aparecem apenas na vista 3D, em um tamanho; veja [Ver o local em 3D](topic:site-3d) |
| Texturas de fotos, gravar um percurso como vídeo, sombras de fora do local, horas de sol mostradas na vista 3D | Camadas de mapa sobre as superfícies; percorra e veja a posição do sol em um momento; [horas de sol](topic:sun-hours) para um dia ou uma estação na planta |
