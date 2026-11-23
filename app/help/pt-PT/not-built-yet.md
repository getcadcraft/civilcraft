---
title: Ainda não implementado
summary: O que esta versão do CivilCraft ainda não faz e o que fazer hoje em vez disso.
keywords: em falta, limitações, roteiro, não disponível, espirais, alargamentos, dwg, dxf, entradas, retenção, secções transversais, para mais tarde, limites
from: b91588d4
---

O CivilCraft está numa fase inicial. Esta página lista o que a versão atual não faz, para que não o procure. Nada aqui tem data prevista.

## Pontos

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Acrescentar um segundo ficheiro de pontos ao primeiro | Junte os ficheiros num editor de texto ou numa folha de cálculo primeiro |
| Exportar um ficheiro de texto de pontos | Exporte LandXML (os pontos saem como CgPoints), use {{ui:Exportar}} SIG (pontos com os campos P, N, E, Z e D), ou {{ui:Copiar}} os pontos para uma folha de cálculo |
| Estilos de etiquetas de pontos, símbolos por código de descrição, curvas (arcos) a partir de códigos de linha, um ficheiro de códigos de descrição para partilhar entre projetos | As etiquetas mostram o número, a cota e a descrição, ou menos ([Definições do CivilCraft](topic:settings)); os códigos ficam guardados no ficheiro do projeto |
| Conversão de unidades | Converta o ficheiro antes de importar; **Unidades** apenas renomeia |

## Superfícies

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Mais do que uma superfície construída a partir de pontos | Um projeto por superfície |
| Ocultar limites interiores | Use **Maior aresta exterior** ou um limite exterior |
| Selecionar ou editar uma linha de quebra desenhada | {{key:Mod+Z}}, ou {{ui:Remover as linhas de quebra desenhadas}} e voltar a desenhar |
| Editar uma superfície lida de LandXML (linhas de quebra, limite) | {{ui:Reconstruir a superfície a partir dos pontos}} |
| Editar uma superfície feita a partir de uma malha de cotas | Importe a malha de novo com outras opções |
| Converter uma superfície lida de LandXML quando o sistema de coordenadas muda | Primeiro {{ui:Reconstruir a superfície a partir dos pontos}} |
| Cotas pontuais e valores de declive com etiquetas | Leia-os na barra de estado, ou pinte a superfície por declive com **Análise de declive** na área de trabalho de Paisagismo ([Modelação para paisagismo](topic:landscape-grading#grading-checks)) |

## Diretrizes e perfis

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Espirais que não sejam clotoides; uma espiral entre duas curvas (transições compostas) | As espirais clotoides nas extremidades de uma curva estão disponíveis; as outras são nomeadas e ignoradas na importação de LandXML |
| Inserir um PI entre dois outros | Volte a desenhar a diretriz, ou volte a escrever as coordenadas dos PI |
| Diretrizes a partir de objetos, deslocamentos, alargamentos | Desenhe por PI |
| Escrever K para uma curva vertical | Escreva L (K é mostrado) |
| Curvas verticais circulares e não simétricas | Apenas curvas parabólicas simétricas |
| Mais do que um perfil de projeto por diretriz | Uma diretriz por variante |
| Ampliar a vista do perfil, faixas de perfil sob o perfil | A vista do perfil ajusta-se à diretriz completa; imprima-a em [folhas de planta e perfil](topic:plan-profile-sheets) |
| Secções em DWG ou LandXML | Folhas de secções em PDF; {{ui:CSV}} das áreas e volumes |
| Linhas de amostragem em ângulo, ou de larguras diferentes ao longo da estrada | Uma largura de cada lado para toda a diretriz |

## Corredores

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Separadores centrais, barreiras e uma sobrelevação que rode os modelos | Desenhe-os como modelos ([Modelos de corredor](topic:corridor-templates)); os modelos por estaca ainda não aceitam sobrelevação |
| Uma mudança gradual entre os modelos de duas regiões (transições, afunilamentos) | Mude o modelo numa estaca, ou dê a um ponto um alvo de largura para uma linha desenhada como afunilamento |
| Rotação em torno de uma aresta, sobrelevação em LandXML | A sobrelevação roda em torno do eixo nas curvas circulares; alargue uma faixa com um alvo de largura para uma linha característica |
| Alvos para os taludes laterais (intersecção do talude para uma linha ou superfície), superfícies de corredor próprias | Os alvos movem os bordos da faixa de rodagem e das bermas ([Corredores](topic:corridor)); o corredor é modelado na superfície projetada |
| Concordâncias de lancil, vias de viragem e ilhéus modelados num entroncamento; o fim de uma estrada secundária cortado ao bordo da estrada principal numa esconsa; um caminho ligado a uma estrada no plano, no seu comprimento e área | As estradas que se encontram são ligadas em esquadria, com o bordo da estrada principal aberto e a estrada secundária suavizada até ele ([Onde as estradas se encontram](topic:corridor#where-roads-meet-roads-pads-and-paths)); um caminho para no bordo da estrada na superfície projetada e em 3D |
| Corredores exportados como vias LandXML; um segundo corredor numa diretriz na exportação IFC | A superfície projetada é exportada |
| Modelos de terreno que alteram a superfície projetada, em 3D ou nas secções | Dão áreas e volumes de cada camada ([Modelos de terreno](topic:corridor-templates#terrain-templates)) |
| Trajetos de manobra com velocidade, deslizamento de pneus, tempo de direção, reboques de direção ou folga da carroçaria; uma biblioteca de veículos de projeto normalizados; um trajeto de manobra desenhado ao arrastar o veículo | Trajetos de manobra a baixa velocidade ao longo de uma linha característica ou de uma diretriz, com as dimensões de veículo que definir ([Trajetos de manobra de veículos](topic:swept-paths)) |

## Modelação e volumes

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Bancadas, linhas características abertas modeladas no projeto, modelação até uma linha característica vinda de outro lado | Feche a linha característica ([Linhas características](topic:feature-lines)), ou use-a como linha de quebra do terreno existente |
| Inserir ou remover um vértice de uma linha característica | Volte a desenhar a linha, ou faça um deslocamento escalonado dela |
| Arcos em linhas de quebra desenhadas (através de pontos de levantamento), espirais em linhas características | Desenhe uma linha característica com arcos e use-a como linha de quebra do terreno existente |
| Modelação até uma distância, uma cota ou outra superfície | Intersecção do talude apenas até ao terreno existente |
| Acrescentar ou remover um canto de plataforma | Elimine a plataforma e volte a desenhá-la |
| Volumes TIN-a-TIN (prismáticos), escolha do tamanho da célula da malha | Método da malha, tamanho de célula escolhido por si |
| Empolamento e contração, camada vegetal, espessuras de pavimento | Aplique os fatores aos números apresentados por si |
| Custos de transporte livre e de sobretransporte, transporte entre diretrizes diferentes, empréstimos e bota-foras colocados na planta | O diagrama de Brückner com pontos de equilíbrio, volumes movidos e distâncias médias de transporte |

## Redes de tubagem

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Mais do que uma rede por projeto | Projetos separados para pluviais e residuais |
| Condutas de água: qualidade e idade da água, controlos por regras, outros tipos de válvulas (controlo de caudal, estrangulamento, manutenção), bombas dadas por potência, consumo que depende da pressão, uma opção Darcy–Weisbach, um catálogo de tubos com espessuras de parede e classes de pressão. O resto das redes sob pressão está em laboratório: [Condutas de água](topic:water-mains) | Verifique-os num programa de distribuição de água; os caudais de dimensionamento de residuais estão em [Caudais de dimensionamento de residuais](topic:sanitary-design) |
| Caudais de esgoto ao longo do tempo (hidrogramas, encaminhamento dinâmico, armazenamento, bombas, extravasores) | [Caudais de dimensionamento de residuais](topic:sanitary-design) dá o caudal de ponta estacionário que uma folha de dimensionamento usa |
| Capacidade de entrada, espraiamento na valeta, encaminhamento de retenção, hidrogramas, perdas de energia para além de um coeficiente de nó | Verifique-os noutros programas; caudais, dimensões e linhas piezométricas estão em [Drenagem pluvial](topic:storm-drainage) |
| Bacias de contribuição no traçado PDF, DWG, DXF ou LandXML; bacias a partir da superfície (cumeadas) | Desenhe as bacias à mão; ficam guardadas no ficheiro do projeto |
| Catálogos de tubos, tubos não circulares, estruturas que não sejam caixas ou cilindros verticais (cones, degraus, bancadas) , uma categoria de drenagem na biblioteca | Tipos de estrutura a partir de parâmetros ([Rede de tubagem](topic:pipe-network)); tubos com um diâmetro |
| Tubos na vista do perfil, tubos curvos | Leia as cotas de fundo e a cobertura no painel da direita |

## Lotes

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Dividir lotes por área ou frente, lotes a partir das linhas que os rodeiam, servidão de passagem | Desenhe cada lote pelos seus cantos, ou escreva as suas chamadas |
| Tabelas de curvas e tabelas de linhas na planta; etiquetas movidas à mão | Cada troço é etiquetado ao longo de si próprio |
| Lotes em LandXML | Os lotes são guardados no ficheiro do projeto e seguem para o PDF, DWG e DXF |

## Poligonais

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Compensação por mínimos quadrados, a regra do transporte, ponderação de ângulos em função das distâncias | A regra da bússola |
| Ângulos de deflexão, ângulos zenitais e distâncias inclinadas, cotas por nivelamento trigonométrico | Reduza a distâncias e ângulos horizontais corretamente, ou rumos |
| Tomadas laterais, ficheiros de dados brutos de coletores de dados | Importe os pontos como ficheiro de pontos |

## Implantação

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Estacas de deslocamento (pontos de referência afastados da estaca), estacas de talude no ponto de encontro | Implante às distâncias de que precisa, incluindo para lá da berma |
| Enviar as estacas diretamente para o formato próprio de um coletor de dados | O CSV abre-se no programa de escritório da maioria dos coletores de dados |
| Implantar tubos, plataformas e lotes | Use pontos de levantamento perto de uma diretriz, ou as linhas do lote |

## Ficheiros e saída

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Texto, tramas e cotas de DWG ou DXF; espaço de papel; desenhos ligados (xrefs); DXF binário | A geometria do espaço modelo abre-se ([Abrir um DWG ou DXF como geometria](topic:open-dwg-dxf)); abra os desenhos ligados por si próprios |
| Mover vários pontos ao mesmo tempo ao arrastar | Recorte e cole-os, ou edite-os um de cada vez |
| Folhas em retrato, legendas próprias, janelas de vista que organize, folhas de planta e perfil em DWG | Uma folha de planta em paisagem por PDF, ou folhas de planta e perfil ao longo de uma diretriz (PDF) |
| Traçar faixas de cotas e perfis | As faixas são apenas para ecrã; faça uma captura de ecrã se as precisar |
| Alterar nomes de camadas, cores ou estilos de etiquetas | Altere-os num programa CAD após a exportação DXF |
| Gravação na nuvem e histórico de versões | Guarde os ficheiros `.civilcraft.json` e mantenha cópias de segurança; para trabalhar num projeto em conjunto, use uma sessão Live no CadCraft Studio ([Trabalhar num local em conjunto, ao vivo](topic:work-live)) |
| CadCraft Studio para iPad e iPhone, e a partir da Google Play | Use o CivilCraft no navegador do dispositivo; no Android, o CadCraft Studio instala-se a partir do seu APK em getcadcraft.com/download |
| Abrir vários ficheiros de pontos ou de projeto ao mesmo tempo | Um ficheiro de cada vez (os ficheiros SIG que pertencem juntos, como as partes de um shapefile, abrem em conjunto) |

## Paisagismo

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Cabeças e bicos de fabricantes | Cabeças genéricas, ou acrescente as suas cabeças a partir de um ficheiro; os dados dos fabricantes entram à medida que dão autorização |
| Comprimentos laterais máximos para linhas de gotejamento, caudais ao longo do tempo, bombas, redes de tubagem em anel | Mantenha os ramais de gota no comprimento publicado pelo fabricante; a verificação precisa de uma rede ramificada |
| O contorno exato de um objeto de forma livre côncavo; o seu volume abaixo do terreno medido com exatidão | O fecho convexo é modelado e o volume abaixo do terreno é uma estimativa (indicada nas Propriedades) |
| Plantas da Biblioteca "Colocar a partir da biblioteca" próprias do BimCraft e do ModelCraft | Exporte o IFC de paisagismo e abra-o no BimCraft ao lado do edifício |
| Modelos detalhados de plantas (folhas, ramos, estações) na vista 3D; objetos de forma livre e rega na vista 3D | As plantas aparecem em 3D como formas simples dimensionadas a partir da lista de plantas ([Ver o local em 3D](topic:site-3d)); a dispersão do ModelCraft faz imagens de plantações |
| Muros de suporte que retêm um nível modelado atrás deles na superfície | Dê a uma plataforma ou a um pavimento lados verticais: são muros de suporte na superfície ([Modelação](topic:grading)) |
| Transformações SVG nos seus próprios símbolos; texturas e cores de modelos GLB de plantas próprios; geometria GLB comprimida | Primeiro aplane as transformações no seu programa de desenho; os modelos são desenhados na cor da planta; exporte o GLB sem compressão ([Gráficos de plantas](topic:plant-graphics)) |
| A sua própria lista de plantas guardada na sua conta da Biblioteca (editada na aplicação) | Edite a lista própria do projeto na tabela de Plantas e guarde-a como ficheiro de plantas |
| As ferramentas de paisagismo para assistentes sem a janela (o servidor de ficheiros e a linha de comandos) | Funcionam com a janela do CivilCraft aberta ([Deixe um assistente de IA trabalhar com o seu local](topic:assistants)) |

## Linhas elétricas

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Um padrão de um país integrado (hipóteses de carga, folgas, fatores) | Defina os valores do seu padrão em {{ui:Hipóteses de carga e limites…}} e guarde-os, com a sua biblioteca, como um pacote para reutilizar e partilhar ([Pacotes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| A distância lateral de um condutor à copa de uma árvore ou a um muro ao lado da linha | A folga na vertical sobre plantas e muros que a linha atravessa ([Verificações de linhas elétricas](topic:power-line-checks#clearances)) |
| Fluência dos condutores e o alongamento de um condutor novo | Tenha-os em conta através das temperaturas da tabela de lançamento |
| Capacidade térmica de cabos enterrados (capacidade de corrente a partir da forma como são instalados) | Introduza a capacidade de corrente do seu fornecedor no item do cabo |
| Estudos de curto-circuito, proteção e terras | Use um programa elétrico dedicado; o CivilCraft dá os comprimentos e os cabos da rede |
| Torres reticuladas desenhadas barra a barra, e tirantes de amarração no solo | Os apoios são verificados pela sua carga nominal; os tirantes pela sua carga nominal |
| Um ficheiro de estudo `.DON` verificado no programa que o lê | Verifique o ficheiro nesse programa; envie-nos uma amostra para testarmos com um real |
| Linhas elétricas na vista 3D e no IFC | A planta, o perfil da linha, as folhas e as camadas SIG |
| As ferramentas de linhas elétricas para assistentes sem a janela | Funcionam com a janela do CivilCraft aberta ([Deixe um assistente de IA trabalhar com o seu local](topic:assistants)) |

## Volumes de edifícios

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Uma biblioteca de códigos de zonamento ou das regras de qualquer cidade | Escreva os limites do seu próprio regulamento ([Limites de zonamento](topic:zoning-limits)) |
| Luz do céu nas paredes (luz da fachada), vento | [Horas de sol](topic:sun-hours) conta apenas o sol direto |
| Sombra de árvores, plantas ou de qualquer coisa que não esteja desenhada como volume | Desenhe os edifícios vizinhos como volumes |
| Formas de telhado em volumes | Volumes de topo plano |
| Vãos, telhados e tipos de paredes quando um volume é desenvolvido no BimCraft | O BimCraft constrói paredes exteriores simples em cada piso e uma laje; acrescente o resto lá |

## SIG e sistemas de coordenadas

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Geodatabase de ficheiro; estilos, ícones, sobreposições de terreno e ligações de rede de KML | Converta primeiro para GeoPackage, shapefile ou GeoJSON; as marcas KML são lidas sem os seus estilos |
| Editar entidades SIG ou os seus atributos | Edite-as num programa SIG e importe de novo. O painel Analisar cria novas camadas (zona-tampão, sobreposição, junção, seleção) e acrescenta campos de área e comprimento, mas não edita uma entidade no lugar |
| Análise de rede e de raster, zonas-tampão com extremidades planas ou quadradas e zonas-tampão de um só lado, acrescentar ou eliminar linhas e alterar o tipo de um campo na tabela de atributos, cores de classes manuais, uma legenda de estilos nos traçados | Use Selecionar para escolher entidades e criar uma camada a partir delas; as extremidades planas não são oferecidas. Colorir por atributo e a tabela de atributos estão implementados: veja [Estilizar uma camada por um atributo](topic:gis-symbology) e [Trabalhar com a tabela de atributos de uma camada](topic:gis-table) |
| Estilos de etiquetas (tamanho, posicionamento) e etiquetas que evitam umas às outras | As etiquetas têm um tamanho e podem sobrepor-se onde as entidades são densas |
| Datums verticais e modelos de geoide | As cotas são usadas tal como o ficheiro as dá; verifique o datum vertical por si |
| Transformações de grelha para além de NAD83 a partir de NAD27 sugeridas por área (OSTN15; NTv2 para outros datums funciona quando acrescenta o ficheiro), várias grelhas em simultâneo, grelhas verticais | Acrescente o ficheiro de grelha do seu datum por si; uma grelha por projeto |
| Camadas de mapa nas exportações DXF ou 3D | As camadas de mapa vão para o traçado PDF, e junto ao DWG como imagem |
| Servidores de mapas que exigem início de sessão, chave ou token | Use serviços públicos, ou um ficheiro de imagem georreferenciado |
| Escrever ficheiros LAS ou LAZ a partir de uma superfície, do modelo do terreno ou das ferramentas de malha de cotas e LiDAR | Exporte as superfícies como malha de cotas GeoTIFF. O suplemento [Nuvens de pontos](topic:point-clouds) escreve uma nuvem limpa como LAS 1.4 ou LAZ |
| Intensidade, cor e retornos LiDAR; malhas de cotas com várias bandas; ficheiros de malha ou LiDAR com mais de 200 MB | O LiDAR é filtrado apenas por classe, as malhas usam a sua primeira banda; divida os ficheiros grandes em blocos primeiro |

## Entrada

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Seleção por caixa ao toque (precisa de {{key:Shift}}) | Mantenha premido cada ponto de levantamento para o acrescentar |
| Coordenadas ou distâncias escritas enquanto desenha | Desenhe aproximadamente e depois escreva as coordenadas exatas dos PI na tabela de PI da diretriz |
| Escrever coordenadas para cantos de plataformas e estruturas | Arraste as suas pegas; amplie para precisão e acompanhe E e N na barra de estado |
| Snap a objetos (para além de pontos de levantamento para linhas de quebra) | Amplie e acompanhe a barra de estado |

## Vista 3D

| Ainda não implementado | Em vez disso, hoje |
|---|---|
| Desenhar ou editar na vista 3D | Desenhe e edite na planta; a vista 3D segue cada edição |
| Selecionar linhas características de corredor ou entidades SIG clicando em 3D | Clique nelas na planta |
| Exportar a vista exagerada ou em pés | As exportações são à escala real em metros; veja [Exportar o local em 3D](topic:export-3d) |
| Etiquetas em exportações GLB ou OBJ, tamanhos e estilos de etiquetas em 3D | As etiquetas aparecem apenas na vista 3D, num tamanho; veja [Ver o local em 3D](topic:site-3d) |
| Texturas a partir de fotografias, gravar uma viagem em vídeo, sombras de fora do local, horas de sol mostradas na vista 3D | Camadas de mapa sobre as superfícies; percorrer e a posição do sol num momento; [horas de sol](topic:sun-hours) para um dia ou uma estação na planta |
