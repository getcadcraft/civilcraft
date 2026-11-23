---
title: Novidades na versão 0.9 (anterior)
summary: Modelos de corredor e de terreno, snaps e botões Escolher ao desenhar, análise SIG com tabela de atributos, estudos de sombra, produção solar, conforto e vento para um local, uma vista de renderização 3D, e os suplementos Nuvens de pontos e WaterCraft.
keywords: novidades 0.9, versão anterior, novidades, 0.9, notas de lançamento, modelos de corredor, modelos de terreno, editor de modelos, perfil transversal tipo, vários corredores, snap, snaps, escolher, mover, copiar, rodar, tangente, renderizar, render 3d, análise SIG, zona-tampão, sobreposição, junção espacial, tabela de atributos, estilo por atributo, estudo de sombra, produção solar, utci, conforto exterior, estudo de vento, openfoam, nuvens de pontos, las, laz, watercraft, caudal de incêndio, hidrante, idade da água, cloro, consumos, dicas, layout, registo de alterações, 0.8, 0.8.1, versão, novas funcionalidades, chuva, tempestade, empoçamento, galgamento, movimentos de terras, equilíbrio, escavação e aterro, transporte, melhor percurso, menor custo, diretriz, bacia de retenção, saída, rebaixamento, folga, progresso, levantamento, drone, depósito de materiais, endereço para local, parcela, solo, cheia, estabilidade de taludes, bishop, assentamento, entroncamento, marcação, sinalização, distância de visibilidade, compensação, mínimos quadrados, poligonal, cava a céu aberto, ligação rádio, fresnel, aparelho de via, cruzamento, idiomas, problemas, live, dwg
from: 4664522c
---

Estas são as alterações do CivilCraft 0.9, em comparação com a 0.8.1. O CivilCraft 0.9 faz parte do CadCraft Studio 0.9 e das suas oito aplicações. As partes principais são os modelos de corredor e de terreno, os snaps ao desenhar, a análise SIG, os estudos do sol, da produção solar, do conforto e do vento num local, e dois suplementos: Nuvens de pontos e WaterCraft.

## Novidades

### Modelos de corredor e de terreno

- **Modelos de corredor.** Abra {{ui:Superfície}} › {{ui:Mais}} › {{ui:Modelos de corredor…}} (ou escreva {{cmd:TEMPLATES}}). Um modelo é um pequeno perfil transversal com componentes, afastamentos, inclinações, materiais e códigos de pontos. Guarde-os no projeto, em {{ui:A minha biblioteca}} ou como um ficheiro `.cctemplates.json`. O editor de modelos mostra um desenho à escala real e lista os problemas à medida que escreve.
- **Construir a partir de modelos por estaca.** Selecione uma diretriz e ative {{ui:Construir a partir de modelos por estaca}} nas suas Propriedades. Cada lado de cada região tem a sua própria lista de pavimentos e a sua própria condição final. {{ui:Adicionar um corredor}} em {{ui:Corredores neste alinhamento}} coloca vários corredores numa diretriz.
- **Modelos de terreno.** {{ui:Superfície}} › {{ui:Mais}} › {{ui:Modelos de terreno…}} (ou escreva {{cmd:TERRAINTEMPLATES}}) aplica materiais em camadas, como terra vegetal, ou pavimento e base, sobre um terreno, com área e volume por camada. Veja [Modelos de corredor e modelos de terreno](topic:corridor-templates).

### Desenho

- **Snaps.** As ferramentas Diretriz, Plataforma, Lote, Volume, Linha característica, Medir, Limite e Bacia fazem snap a pontos de levantamento, PI, cantos, vértices e estruturas, com uma etiqueta junto ao marcador. Mantenha {{key:Alt}} premido para um ponto livre.
- **Botões Escolher, tangente e mover, copiar, rodar.** Os cantos de plataformas, lotes e linhas características têm caixas escritas de Este e Norte e um botão Escolher com cruz de mira. As Propriedades têm também {{ui:Tangente a partir de dois pontos}} para diretrizes e {{ui:Mover, copiar e rodar}} para diretrizes, plataformas, lotes e linhas características. Veja [Desenhar com snaps, cantos escolhidos e mover, copiar, rodar](topic:draft-with-snaps).
- **Vista de renderização em 3D.** O botão {{ui:Renderizar}} na barra 3D desenha o terreno com cores naturais, céu, neblina e sombras suaves. Não altera o modelo. O menu {{ui:Sol}} tem agora os botões {{ui:Aplicar}} e {{ui:Fechar}}. Veja [Ver o local em 3D](topic:site-3d).
- **Painéis abrem uma secção de cada vez.** O painel esquerdo e o painel de Propriedades abrem uma secção e fecham as outras, e os blocos do friso de Paisagismo que agrupam várias ferramentas são botões divididos.

### Análise SIG

- **Analisar.** {{ui:Superfície}} › {{ui:Mais}} › {{ui:Analisar}} oferece zona-tampão, sobreposição, junção espacial, seleção por atributo ou forma, e medição. Cada ferramenta cria uma nova camada num único passo de anulação.
- **Tabela de atributos.** O menu de três pontos de uma camada tem {{ui:Tabela de atributos…}} e {{ui:Estilo por atributo…}}. Veja [Analisar camadas SIG](topic:gis-analysis) e [Trabalhar com a tabela de atributos de uma camada](topic:gis-table).

### O local: sol, produção solar, conforto e vento

- **Secção de ambiente.** Selecione um volume: a secção {{ui:Ambiente}} fica sob {{ui:Horas de sol}} nas suas Propriedades. Tem um estudo de sombra (mapa, tabela, animação, CSV), produção solar a partir de um ficheiro meteorológico de ano típico (.epw) e conforto exterior (UTCI).
- **Vento, apenas triagem.** {{ui:Executar estudo de vento}} colore o terreno de sentado a desconfortável para cada direção do vento no ficheiro meteorológico. Não está validado, e o painel indica-o.
- **Suplemento de vento para peões (OpenFOAM).** Desligado até o ativar em {{ui:Definições}} › {{ui:Suplementos}}. O OpenFOAM é um programa que instala por si. Veja [Sombra, produção solar e conforto exterior](topic:environment).

### Nuvens de pontos (suplemento)

- Ative {{ui:Nuvens de pontos}} em {{ui:Definições}} › {{ui:Suplementos}}; aparece um separador Nuvens de pontos no painel da direita. Abra um ficheiro LAS ou LAZ, limpe-o, separe-o em terreno, vegetação e edifícios, construa o terreno, as curvas de nível e os volumes, e exporte LAS ou LAZ. Veja [Nuvens de pontos de um drone ou scanner](topic:point-clouds).

### WaterCraft (suplemento)

- Ative {{ui:WaterCraft (distribuição de água)}} em {{ui:Definições}} › {{ui:Suplementos}}; aparece um separador WaterCraft. Tem consumos de clientes, caudal de incêndio em cada hidrante, a interrupção de conduta mais importante, e idade da água e cloro, cada um guardado como CSV. Veja [WaterCraft: consumos, caudal de incêndio, interrupções e idade da água](topic:watercraft).

### Trabalhar em conjunto

- Numa sessão Live vê os cursores e os nomes uns dos outros na planta. Plantas da biblioteca: o {{ui:Paisagismo CivilCraft}} começa a partir da sua coleção predefinida da biblioteca.

## Em todas as aplicações

- As indicações aparecem como balões de ajuda Bootstrap, e a dica inicial pode ser fechada.
- A barra de separadores de um painel que não cabe desloca-se em vez de ser cortada.
- Os títulos dos separadores do navegador leem `<documento> - CivilCraft | CadCraft`.
- {{ui:Definições}} tem uma secção Layout, em que os layouts são uma lista pendente de opções de duas linhas.
- As unidades de peso e de temperatura estão em {{ui:Definições}} › {{ui:Global}} › {{ui:Unidades}}.
- A lista de idiomas mostra os idiomas para os quais esta versão tem ficheiros. Os idiomas diferentes do inglês são rascunhos automáticos.

## Corrigido

- Os suplementos de pesquisa de endereços e de verificação do EnergyPlus não podiam ser ativados; agora podem.
- A ajuda indica agora que o suplemento Nuvens de pontos escreve uma nuvem limpa como LAS 1.4 ou LAZ.
- Clicar na própria pega do objeto selecionado deixa de iniciar um arrastamento de pega que parava um Escolher em espera.

## Limites reais

- Os modelos de corredor de exemplo são valores indicativos sem norma; um engenheiro tem de os verificar. Os modelos de terreno não acrescentam superfície e não são desenhados em 3D nem na vista de secção. O segundo corredor numa diretriz não está na exportação IFC. Não existe transição gradual entre dois modelos por estaca.
- As nuvens de pontos foram testadas com ficheiros fictícios, não com um levantamento real por drone. Só se leem LAS e LAZ.
- A análise SIG foi testada com camadas fictícias.
- Sombra, produção solar e conforto são estimativas de planeamento; o vento é uma triagem não validada. Nada disto é um valor de projeto.
- O WaterCraft é uma ajuda de cálculo verificada com redes fictícias. Um engenheiro de águas decide o valor dos números.
- Os idiomas além do inglês são rascunhos automáticos.
- Os instaladores do Windows não têm assinatura de código, e a imagem de disco do macOS não está notarizada.

## Anteriores: 0.8 e 0.8.1

Estas são as alterações do CivilCraft 0.8 (2026-11-01) e 0.8.1 (2026-11-02), em comparação com a 0.7. As principais novidades são ferramentas que testam a sua modelação do terreno e o seu local (chuva, movimentos de terras, percursos, bacias, progresso) e seis janelas de cálculo para terreno, estradas, levantamento, minas, ligações e ferrovia.

### Novidades

**Teste a sua modelação**

- **Chover.** {{ui:Fazer chover…}} (em {{ui:Superfície}}) deixa cair uma tempestade sobre o terreno modelado. Vê a água escorrer das plataformas, acumular-se nos cantos baixos e galgar as bacias demasiado pequenas. A simulação é animada e dá os volumes, o caudal de pico e um CSV de cada bacia. A célula predefinida é grosseira para que uma primeira vista seja rápida; uma célula mais fina é mais lenta. As bacias que galgam também aparecem no painel de Problemas.
- **Equilibrador de movimentos de terras.** {{ui:Equilíbrio de terras…}} eleva ou rebaixa uma plataforma até a escavação igualar o aterro, e mostra a tabela de transporte entre eles.
- **Melhor percurso.** {{ui:Melhor percurso…}}: escolha um início e um fim, e o CivilCraft encontra o caminho mais barato através do terreno que respeita os seus limites de declive e de curva, e depois cria uma diretriz a partir dele.
- **Bacias de retenção.** {{ui:Bacias de retenção…}} calcula a cota e o armazenamento a partir do seu terreno, aceita dispositivos de saída (orifício, soleira, entalhe em V, vertedouro), faz passar uma tempestade pela bacia e verifica o caudal de pico retido, o tempo de esvaziamento e a folga.
- **Progresso a partir de levantamentos.** {{ui:Progresso a partir de levantamentos…}} compara superfícies de drone ou de scanner de datas diferentes com o terreno como estava e com o projeto: percentagem concluída em volume, áreas escavadas em excesso e aterradas em excesso, depósitos de materiais, e quando a obra termina a este ritmo (assinalado como estimativa).

**Conheça o local**

- **Morada para local.** {{ui:Morada para local…}} reúne dados abertos de parcela, edifício, zonamento, solo, cheias e terreno num único local. Pode guardar o local no ficheiro do projeto: a morada escrita, cada fonte com o dia em que a obteve e a sua licença, e o que devolveu. Reabra ou partilhe o projeto e o local continua lá, sem nada ser obtido de novo. Também o pode guardar como ficheiro de local ou enviá-lo para o BimCraft. Veja [Morada para local](topic:address-to-site).

**Terreno, estradas, levantamento, minas, ligações e ferrovia**

- **Solos e taludes.** {{ui:Solos e taludes…}} desenha o perfil do solo entre sondagens que escreve. O método de Bishop procura depois o círculo crítico no seu terreno, com nível freático, sobrecarga e coeficiente sísmico; o assentamento de uma sapata inclui consolidação, assentamento imediato e tempo.
- **Entroncamentos e marcação.** {{ui:Entroncamentos e marcação…}} junta ramos com concordâncias de lancil (um raio por ramo, ou concordâncias de três centros), a distância de visibilidade para a velocidade de projeto, uma verificação dos triângulos de visibilidade, passadeiras, linhas de paragem, marcações e sinais com um mapa de sinalização. São desenhados na planta e guardados como .dxf com camadas nomeadas.
- **Compensação topográfica.** {{ui:Compensação topográfica…}} executa uma compensação por mínimos quadrados de uma poligonal ou rede: coordenadas compensadas, elipses de erro, o teste do qui-quadrado e uma marca na medição que não se ajusta. Estão incluídas redes livres, o fecho de uma poligonal pela regra da bússola e ficheiros de campo RW5, GSI, JobXML ou CSV, e os pontos compensados guardam-se em CSV.
- **Minas a céu aberto.** {{ui:Minas a céu aberto…}} transforma amostras de sondagem num modelo de blocos e na cava final dentro do seu ângulo de talude, com a razão de estéril, uma tabela por bancada e uma curva de teor e tonelagem. Também existem cavas encaixadas por fator de receita e um calendário de produção com fluxo de caixa descontado.
- **Ligações rádio.** {{ui:Ligações rádio…}} verifica a linha de vista sobre o terreno com a curvatura da terra, a primeira zona de Fresnel, o balanço de ligação, a margem de desvanecimento e a interrupção por multipercurso, e indica a altura do mastro que libertaria o trajeto. Faz também balanços de perdas em fibra, quantidades de traçado e o vento sobre uma torre.
- **Aparelhos de via.** {{ui:Aparelhos de via…}} cria um aparelho de via a partir do seu número de coração, cruzamentos entre vias paralelas e um gabarito inclinado pela insuficiência de sobrelevação e alargado numa curva. Um aparelho de via pode situar-se numa estaca de uma diretriz.

Veja [Solos, entroncamentos, compensação topográfica, minas, ligações rádio e aparelhos de via](topic:soils-roads-survey-mines-links).

### Em todas as aplicações

- **Idiomas.** 54 idiomas, dez deles novos. Os idiomas diferentes do inglês são rascunhos automáticos até um falante nativo os rever. Os tópicos de ajuda continuam sobretudo em inglês.
- **Linhas da barra de ferramentas.** {{ui:Definições}} › {{ui:Geral}} › {{ui:Linhas da barra de ferramentas}}: Quebrar (como antes), 2 linhas ou 1 linha. O Friso do CivilCraft mostra a ferramenta mais usada em grande, as seguintes em pequeno, e as restantes atrás da seta do nome do grupo.
- **Dispositivos de entrada.** O trackpad, a caneta, o rato 3D, o comando e o MIDI podem controlar as aplicações.
- **Problemas.** Um painel de Problemas que avisa em todas as aplicações, com verificações que leem pacotes de regulamentação.
- **Live.** Uma vista de quem está onde numa sessão Live.
- **Suplementos.** Uma lista de suplementos, com suplementos de iluminação.
- **Ligue a sua IA.** Qualquer assistente que ligue pode controlar as ferramentas do CivilCraft. Vem com uma nota de que a ligação com um clique dentro do CadCraft Studio e o conector alojado ainda não estão prontos. Veja [Deixe um assistente de IA trabalhar com o seu local](topic:assistants).

### Corrigido na 0.8.1

- **Secção de classes DWG.** Era lida com o tipo errado (GitHub cadcraft#5). Corrigido no CivilCraft, juntamente com o CadCraft, o BimCraft, o ModelCraft e o TakeoffCraft.
- **Mudança de idioma com a aplicação em execução.** O CadCraft Studio e as edições empacotadas podem mudar de idioma em tempo de execução. Antes só estavam em inglês. Ainda não testado em todas as plataformas: diga-nos se o idioma não mudar.

### Ainda não nesta versão

- **São ajudas de cálculo.** Cada resultado das novas janelas precisa de verificação por um engenheiro. As resistências do solo partem de valores típicos para o grupo de solo, e a janela indica-o.
- **Chover.** Uma simulação no local de exemplo pode demorar mais de dois minutos no navegador com uma célula fina. Foi verificada com casos feitos à mão e com uma bacia em forma de V, ainda não num terreno real modelado.
- **Morada para local.** Lê os ficheiros de dados abertos que traz, e foi testado apenas com os nossos próprios ficheiros. As árvores não são uma fonte. A obtenção de fontes por si aguarda a redação sobre privacidade.
- **Progresso a partir de levantamentos.** Testado apenas com levantamentos fictícios. O progresso em folhas e anotações (MarkupCraft) e a comparação de digitalização com modelo (BimCraft) não estão implementados.
- **Solos e taludes.** Apenas superfícies circulares: sem pesquisa em cunha ou em bloco e sem fenda de tração.
- **Entroncamentos.** Um raio por ramo, sem trajetos de veículos pesados, e ainda não entram no corredor.
- **Ficheiros de campo.** Os leitores foram escritos a partir de descrições públicas dos formatos e testados com ficheiros que criámos. Procuram-se ficheiros reais de instrumentos.
- **Ligações e ferrovia.** Ligações rádio: apenas perda em espaço livre e multipercurso (sem atenuação por chuva nem diagramas de antena), e nenhuma norma ferroviária: cada limite ferroviário é um valor indicativo, com números preliminares que nenhum engenheiro ferroviário verificou.
- **Windows e macOS.** A 0.8 não tem assinatura de código. O Windows pode avisar, e o macOS pede clique com o botão direito e depois Abrir.

Tudo o resto está em [Ainda não implementado](topic:not-built-yet). Para a versão anterior, veja [Novidades na 0.7](topic:whats-new-0-7).
