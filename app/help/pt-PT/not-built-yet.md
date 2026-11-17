---
title: Ainda não implementado
summary: O que esta versão do CivilCraft ainda não faz e o que fazer em alternativa hoje.
keywords: em falta, limitações, roteiro, não disponível, espirais, alargamento, dwg, dxf, sumidouros, retenção, secções transversais, para mais tarde, limites
from: a2d970ef
---

O CivilCraft está numa fase inicial. Esta página lista o que a versão atual não faz, para que não o procure. Nada aqui tem data prometida.

## Pontos

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Acrescentar um segundo ficheiro de pontos ao primeiro | Una os ficheiros num editor de texto ou folha de cálculo primeiro |
| Exportar um ficheiro de texto de pontos | Exporte LandXML (os pontos saem como CgPoints), use {{ui:Exportar}} do GIS (pontos com os campos P, N, E, Z e D), ou copie os pontos com {{ui:Copiar}} para uma folha de cálculo |
| Estilos de rótulos de pontos, símbolos por código de descrição, curvas (arcos) a partir de códigos de linha, um ficheiro de códigos de descrição para partilhar entre projetos | Os rótulos mostram o número, a cota e a descrição, ou menos ([Definições do CivilCraft](topic:settings)); os códigos ficam guardados no ficheiro do projeto |
| Conversão de unidades | Converta o ficheiro antes de importar; **Unidades** apenas altera o rótulo |

## Superfícies

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Mais do que uma superfície criada a partir de pontos | Um projeto por superfície |
| Ocultar limites interiores | Use **Aresta exterior mais longa** ou um limite exterior |
| Selecionar ou editar uma linha de quebra desenhada | {{key:Mod+Z}}, ou {{ui:Remover as linhas de quebra desenhadas}} e desenhe de novo |
| Editar uma superfície lida de LandXML (linhas de quebra, limite) | {{ui:Reconstruir a superfície a partir dos pontos}} |
| Editar uma superfície feita de uma grelha de cotas | Importe a grelha de novo com outras opções |
| Converter uma superfície lida de LandXML quando muda o sistema de coordenadas | Primeiro, {{ui:Reconstruir a superfície a partir dos pontos}} |
| Cotas pontuais rotuladas e valores de declive | Leia-os na barra de estado, ou pinte a superfície por declive com **Análise de declives** no espaço de trabalho Paisagismo ([Modelação para paisagismo](topic:landscape-grading#grading-checks)) |

## Diretrizes e perfis

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Espirais que não sejam clotoides; uma espiral entre duas curvas (transições compostas) | Estão disponíveis espirais clotoides nas extremidades de uma curva; as outras são identificadas e ignoradas na importação de LandXML |
| Inserir um PI entre outros dois | Desenhe a diretriz de novo, ou reescreva as coordenadas do PI |
| Diretrizes a partir de objetos, deslocamentos, alargamentos | Desenhe por PI |
| Escrever K para uma curva vertical | Escreva L (K é mostrado) |
| Curvas verticais circulares e não simétricas | Apenas curvas parabólicas simétricas |
| Mais do que um perfil de projeto por diretriz | Uma diretriz por variante |
| Fazer zoom da vista do perfil, faixas de perfil sob o perfil | A vista do perfil ajusta-se a toda a diretriz; imprima-a em [folhas de planta e perfil](topic:plan-profile-sheets) |
| Secções em DWG ou LandXML | Folhas de secções em PDF; {{ui:CSV}} das áreas e volumes |
| Linhas de amostragem oblíquas, ou de larguras diferentes ao longo da estrada | Uma largura de cada lado para toda a diretriz |

## Corredores

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Medianas, barreiras e uma sobrelevação que roda os modelos | Desenhe-as como modelos ([Modelos de corredor](topic:corridor-templates)); os modelos por estaca ainda não aceitam sobrelevação |
| Uma variação gradual entre os modelos de duas regiões (transições, afilamentos) | Mude o modelo numa estaca, ou atribua a um ponto um alvo de largura numa linha desenhada como afilamento |
| Rotação em torno de uma aresta, sobrelevação em LandXML | A sobrelevação roda em torno do eixo nas curvas circulares; alargue uma faixa com um alvo de largura numa linha característica |
| Alvos para os taludes laterais (interseção do talude com uma linha ou superfície), superfícies de corredor próprias | Os alvos movem as bordas do pavimento e das bermas ([Corredores](topic:corridor)); o corredor é modelado na superfície proposta |
| Corredores exportados como vias LandXML; um segundo corredor numa diretriz na exportação IFC | Exporta-se a superfície proposta |
| Modelos de terreno que alteram a superfície proposta, em 3D ou nas secções | Dão áreas e volumes de cada camada ([Modelos de terreno](topic:corridor-templates#terrain-templates)) |
| Trajetórias de giro com velocidade, derrapagem dos pneus, tempo de direção, reboques de direção ou folga da carroçaria; uma biblioteca de veículos de projeto padrão; uma trajetória desenhada arrastando o veículo | Trajetórias de giro a baixa velocidade ao longo de uma linha característica ou de uma diretriz, com as dimensões do seu veículo ([Trajetórias de giro de veículos](topic:swept-paths)) |

## Modelação e volumes

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Bancadas, linhas características abertas modeladas no projeto, modelação até uma linha característica de outro lugar | Feche a linha característica ([Linhas características](topic:feature-lines)), ou use-a como linha de quebra do terreno existente |
| Inserir ou remover um vértice de linha característica | Desenhe a linha de novo, ou faça dela um deslocamento escalonado |
| Arcos em linhas de quebra desenhadas (através de pontos de levantamento), espirais em linhas características | Desenhe uma linha característica com arcos e use-a como linha de quebra do terreno existente |
| Modelação até uma distância, cota ou outra superfície | Apenas talude até ao terreno existente |
| Acrescentar ou remover um canto de plataforma | Elimine a plataforma e desenhe-a de novo |
| Volumes TIN para TIN (prisma), escolha do tamanho da célula da grelha | Método de grelha, com tamanho de célula escolhido automaticamente |
| Empolamento e retração, terra vegetal, espessuras de pavimento | Aplique os fatores aos números apresentados. |
| Custos de transporte livre e de sobretransporte, transporte entre diretrizes diferentes, empréstimos e depósitos colocados na planta | O diagrama de Brückner, com pontos de equilíbrio, volumes movidos e distâncias médias de transporte |

## Redes de coletores

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Mais do que uma rede por projeto | Projetos separados para a rede pluvial e a doméstica |
| Condutas de água: qualidade e idade da água, controlos por regras, outros tipos de válvulas (controlo de caudal, estrangulamento, manutenção de pressão), bombas definidas por potência, consumo que depende da pressão, uma opção Darcy–Weisbach, um catálogo de tubos com espessuras de parede e classes de pressão. O resto das redes sob pressão está em fase de teste: [Condutas de água](topic:water-mains) | Verifique esses pontos em software de distribuição de água; os caudais de projeto de saneamento estão em [Caudais de projeto de saneamento](topic:sanitary-design) |
| Escoamentos de esgoto ao longo do tempo (hidrogramas, encaminhamento dinâmico, armazenamento, bombas, extravasores) | [Caudais de projeto de saneamento](topic:sanitary-design) dá o caudal de ponta estacionário que uma folha de projeto usa |
| Capacidade de sumidouros, espraiamento na sarjeta, encaminhamento de retenção, hidrogramas, perdas de energia além de um coeficiente de junção | Verifique-os noutro software; caudais, dimensões e linhas piezométricas estão em [Drenagem pluvial](topic:storm-drainage) |
| Bacias de drenagem no PDF, DWG, DXF ou LandXML; bacias a partir da superfície (divisores de água) | Desenhe as bacias à mão; são guardadas no ficheiro do projeto |
| Catálogos de tubos, tubos não circulares, órgãos que não sejam caixas ou cilindros verticais (cones, degraus, banquetas), uma categoria de drenagem na biblioteca | Tipos de órgão a partir de parâmetros ([Rede de coletores](topic:pipe-network)); tubos com diâmetro |
| Coletores no perfil, coletores curvos | Leia as cotas de soleira e o recobrimento no painel direito |

## Lotes

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Dispor lotes por área ou frente, parcelas a partir das linhas que as rodeiam, faixa de domínio | Desenhe cada parcela pelos seus cantos, ou introduza os seus rumos e distâncias |
| Tabelas de curvas e tabelas de linhas na planta; rótulos movidos à mão | Cada segmento é rotulado ao longo de si próprio |
| Parcelas em LandXML | As parcelas são guardadas no ficheiro do projeto e seguem para o PDF, DWG e DXF |

## Poligonais

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Ajustamento por mínimos quadrados, regra do transit, ponderação de ângulos contra distâncias | A regra de Bowditch |
| Ângulos de deflexão, ângulos zenitais e distâncias inclinadas, cotas por nivelamento trigonométrico | Reduza a distâncias e ângulos horizontais corretos, ou a rumos |
| Visadas laterais, ficheiros de dados brutos de coletores de dados | Importe os pontos como ficheiro de pontos |

## Implantação

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Estacas de offset (pontos de referência afastados da estaca), estacas de talude no ponto de interseção | Implante nos offsets de que precisa, incluindo além da berma |
| Enviar estacas diretamente para o formato próprio de um coletor de dados | O CSV abre no software de escritório da maioria dos coletores de dados |
| Implantar coletores, plataformas e parcelas | Use pontos de levantamento perto de uma diretriz, ou os segmentos da parcela |

## Ficheiros e saída

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Texto, tramas e cotas de DWG ou DXF; espaço de papel; desenhos referenciados (xrefs); DXF binário | Os traçados do espaço modelo abrem ([Abrir um DWG ou DXF como traçado](topic:open-dwg-dxf)); abra os desenhos referenciados separadamente |
| Mover vários pontos ao mesmo tempo, arrastando | Recorte-os e cole-os, ou edite-os um a um |
| Folhas em retrato, legendas próprias, janelas de vista que organiza, folhas de planta e perfil em DWG | Uma folha de planta em paisagem por PDF, ou folhas de planta e perfil ao longo de uma diretriz (PDF) |
| Imprimir bandas de cotas e perfis | As bandas são apenas de ecrã; faça uma captura de ecrã se precisar delas |
| Alterar nomes de camadas, cores ou estilos de rótulos | Altere-os num programa CAD depois da exportação DXF |
| Gravação na nuvem e histórico de versões | Guarde os ficheiros `.civilcraft.json` e mantenha cópias de segurança; para trabalhar num projeto em conjunto, use uma sessão Live no CadCraft Studio ([Projetar um local em conjunto, em Live](topic:work-live)) |
| CadCraft Studio para iPad e iPhone, e a partir da Google Play | Use o CivilCraft no navegador do dispositivo; em Android, o CadCraft Studio instala-se a partir do seu APK em getcadcraft.com/download |
| Abrir vários ficheiros de pontos ou de projeto de uma vez | Um ficheiro de cada vez (os ficheiros GIS que pertencem juntos, como as partes de um shapefile, abrem em conjunto) |

## Paisagismo

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Cabeças e bicos de fabricantes | Cabeças genéricas, ou acrescente as suas cabeças a partir de um ficheiro; os dados dos fabricantes entram à medida que dão autorização |
| Comprimentos laterais máximos para linhas de gotejamento, caudais ao longo do tempo, bombas, redes de tubagem em malha fechada | Mantenha os troços de gotejamento no comprimento publicado pelo fabricante; a verificação exige uma rede ramificada |
| O contorno exato de um objeto de forma livre côncavo; o seu volume abaixo do solo medido com exatidão | O invólucro convexo é modelado e o volume abaixo do solo é uma estimativa (indicada em Propriedades) |
| Plantas no próprio Place from library do BimCraft e do ModelCraft | Exporte IFC de paisagismo e abra-o no BimCraft ao lado do edifício |
| Modelos detalhados de plantas (folhas, ramos, estações do ano) na vista 3D; objetos de forma livre e rega na vista 3D | As plantas aparecem em 3D como formas simples dimensionadas a partir da lista de plantas ([Ver o local em 3D](topic:site-3d)); a dispersão do ModelCraft faz imagens de plantação |
| Muros rígidos de paisagismo que retêm um nível modelado atrás deles na superfície | Dê a uma plataforma ou a uma base lados verticais: ficam como muros de suporte na superfície ([Modelação](topic:grading)) |
| Transformações SVG nos seus símbolos próprios; texturas e cores de modelos GLB de plantas próprios; geometria GLB comprimida | Aplane as transformações no seu programa de desenho primeiro; os modelos são desenhados com a cor da planta; exporte o GLB sem compressão ([Gráficos de plantas](topic:plant-graphics)) |
| A sua própria lista de plantas guardada na sua conta da biblioteca (editada na aplicação) | Edite a lista própria do projeto na tabela de plantas e guarde-a como ficheiro de plantas |
| As ferramentas de paisagismo para assistentes sem a janela (o servidor de ficheiros e a linha de comandos) | Funcionam com a janela do CivilCraft aberta ([Deixe um assistente de IA trabalhar com o seu local](topic:assistants)) |

## Linhas elétricas aéreas

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| A norma de um país incorporada (hipóteses de carga, folgas, coeficientes) | Defina os valores da sua norma em {{ui:Hipóteses de carga e limites…}} e guarde-os, com a sua biblioteca, como pacote para reutilizar e partilhar ([Pacotes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| A distância lateral de um condutor à copa de uma árvore ou a um muro ao lado da linha | A folga na vertical sobre plantas e muros que a linha atravessa ([Verificações de linhas elétricas](topic:power-line-checks#clearances)) |
| Fluência do condutor e alongamento de um condutor novo | Considere-os nas temperaturas da tabela de lançamento |
| Capacidade térmica de cabos enterrados (corrente admissível pelo modo de instalação) | Introduza a capacidade de corrente do seu fornecedor no item do cabo |
| Estudos de curto-circuito, proteção e ligação à terra | Use um programa elétrico dedicado; o CivilCraft dá os comprimentos e os cabos da rede |
| Torres de treliça projetadas barra a barra, e estais de ancoragem no solo | Os apoios são verificados pela carga nominal; os estais pela sua carga nominal |
| Um ficheiro de estudo `.DON` verificado no programa que o lê | Verifique o ficheiro aí; envie-nos uma amostra para testarmos com um ficheiro real |
| Linhas elétricas aéreas na vista 3D e em IFC | A planta, o perfil da linha, as folhas e as camadas GIS |
| As ferramentas de linhas elétricas para assistentes sem a janela | Funcionam com a janela do CivilCraft aberta ([Deixe um assistente de IA trabalhar com o seu local](topic:assistants)) |

## Volumetrias de edifícios

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Uma biblioteca de códigos de zonamento ou regras de qualquer município | Escreva os limites do seu próprio regulamento ([Limites de zonamento](topic:zoning-limits)) |
| Luz do céu nas paredes (luz do dia na fachada), vento | [Horas de sol](topic:sun-hours) conta apenas o sol direto |
| Sombra de árvores, plantas ou de tudo o que não esteja desenhado como volumetria | Desenhe os edifícios vizinhos como volumetrias |
| Formas de cobertura em volumetrias | Volumetrias com topo plano |
| Vãos, coberturas e tipos de parede quando uma volumetria é desenvolvida no BimCraft | O BimCraft constrói paredes exteriores simples em cada piso e uma laje; acrescente o resto lá |

## GIS e sistemas de coordenadas

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Geodatabase de ficheiro; estilos, ícones, sobreposições de terreno e ligações de rede do KML | Converta primeiro para GeoPackage, shapefile ou GeoJSON; as marcas KML são lidas sem os seus estilos |
| Editar elementos GIS ou os seus atributos | Edite-os num programa GIS e importe de novo. O painel Analisar cria camadas novas (zona tampão, sobreposição, junção, seleção) e acrescenta campos de área e comprimento, mas não edita um elemento no lugar |
| Análise de redes e de raster, zonas tampão com extremos planos ou quadrados e zonas tampão de um só lado, acrescentar ou eliminar linhas e alterar o tipo de um campo na tabela de atributos, cores de classe manuais, uma legenda de estilo nas impressões | Use Selecionar para escolher elementos e criar uma camada com eles; extremos planos não são oferecidos. Pintar por atributo e a tabela de atributos estão implementados: veja [Estilizar uma camada por um atributo](topic:gis-symbology) e [Trabalhar com a tabela de atributos de uma camada](topic:gis-table) |
| Estilos de rótulos (tamanho, posicionamento) e rótulos que não se sobrepõem | Os rótulos têm um tamanho e podem sobrepor-se onde os elementos são densos |
| Datums verticais e modelos de geoide | As cotas são usadas como o ficheiro as dá; verifique o datum vertical |
| Transformações de grelha além da de NAD27 para NAD83 sugeridas por área (OSTN15; NTv2 para outros datums funciona ao acrescentar o ficheiro), várias grelhas de uma vez, grelhas verticais | Acrescente o ficheiro de grelha do seu datum; uma grelha por projeto |
| Camadas de mapa em exportações DXF ou 3D | As camadas de mapa vão para a impressão PDF, e ao lado do DWG como imagem |
| Servidores de mapas que pedem início de sessão, chave ou token | Use serviços públicos, ou um ficheiro de imagem georreferenciada |
| Escrever ficheiros LAS ou LAZ a partir de uma superfície, do modelo de terreno ou das ferramentas de grelha de cotas e LiDAR | Exporte superfícies como grelha de cotas GeoTIFF. O suplemento [Nuvens de pontos](topic:point-clouds) escreve uma nuvem limpa como LAS 1.4 ou LAZ |
| Intensidade, cor e retornos LiDAR; grelhas de cotas com várias bandas; ficheiros de grelha ou LiDAR com mais de 200 MB | O LiDAR é filtrado apenas por classe, e as grelhas usam a primeira banda; divida os ficheiros grandes em blocos antes |

## Entrada

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Seleção por caixa com toque (exige {{key:Shift}}) | Mantenha premido cada ponto de levantamento para o acrescentar |
| Coordenadas ou distâncias escritas enquanto desenha | Desenhe por aproximação e depois escreva as coordenadas exatas dos PI na tabela de PI da diretriz |
| Escrever coordenadas para cantos de plataforma e órgãos | Arraste os seus pontos de controlo; amplie para precisão e observe E e N na barra de estado |
| Snap a objetos (exceto pontos de levantamento para linhas de quebra) | Amplie e observe a barra de estado |

## Vista 3D

| Ainda não implementado | Em alternativa, hoje |
|---|---|
| Desenhar ou editar na vista 3D | Desenhe e edite na planta; a vista 3D segue cada edição |
| Selecionar linhas características de corredor ou elementos GIS clicando em 3D | Clique neles na planta |
| Exportar a vista exagerada ou em pés | As exportações estão à escala real em metros; veja [Exportar o local em 3D](topic:export-3d) |
| Rótulos em exportações GLB ou OBJ, tamanhos e estilos de rótulos em 3D | Os rótulos aparecem apenas na vista 3D, com um tamanho; veja [Ver o local em 3D](topic:site-3d) |
| Texturas de fotografias, gravação de um percurso em vídeo, sombras de fora do local, horas de sol mostradas na vista 3D | Camadas de mapa sobre as superfícies; percurso e posição do sol num só instante; [horas de sol](topic:sun-hours) para um dia ou uma estação na planta |
