---
title: Novidades na 0.9
summary: Modelos de corredor e de terreno, snaps e botões Escolher ao desenhar, análise SIG com uma tabela de atributos, estudos de sombra, produção solar, conforto e vento de um local, uma vista de Renderização 3D, e os suplementos Nuvens de pontos e WaterCraft.
keywords: novidades, 0.9, notas de versão, modelos de corredor, modelos de terreno, editor de modelos, secção típica, vários corredores, snap, snaps, escolher, mover, copiar, rodar, tangente, renderizar, renderização 3d, análise sig, buffer, sobreposição, junção espacial, tabela de atributos, estilo por atributo, estudo de sombra, produção solar, utci, conforto exterior, estudo de vento, openfoam, nuvens de pontos, las, laz, watercraft, caudal de incêndio, hidrante, idade da água, cloro, consumos, dicas, layout, novidades, registo de alterações, alterações, 0.8, 0.8.1, versão, novas funcionalidades, chuva, águas pluviais, empoçamento, galgamento, movimento de terras, equilíbrio, aterro e corte, transporte, melhor percurso, custo mínimo, alinhamento, bacia de retenção, saída, rebaixamento, folga, progresso, levantamento, drone, depósito de materiais, morada para local, parcela, solo, cheia, estabilidade de taludes, bishop, assentamento, entroncamento, marcação, sinais, distância de visibilidade, compensação, mínimos quadrados, poligonal, cava a céu aberto, modelo de blocos, ligação rádio, fresnel, aparelho de via, cruzamento, idiomas, problemas, live, dwg
from: d7ac5b14
---

Esta é a lista do que mudou no CivilCraft 0.9, em comparação com a 0.8.1. O CivilCraft 0.9 faz parte do CadCraft Studio 0.9 e das suas oito aplicações. As grandes partes são os modelos de corredor e de terreno, os snaps ao desenhar, a análise SIG, os estudos do sol, da produção solar, do conforto e do vento num local, e dois suplementos: Nuvens de pontos e WaterCraft.

## Novidades

### Modelos de corredor e de terreno

- **Modelos de corredor.** Abra {{ui:Superfície}} › {{ui:Mais}} › {{ui:Modelos de corredor…}} (ou escreva {{cmd:TEMPLATES}}). Um modelo é uma pequena secção transversal com componentes, afastamentos, declives, materiais e códigos de pontos. Guarde-os no projeto, em {{ui:A minha biblioteca}} ou como ficheiro `.cctemplates.json`. O editor de modelos mostra um desenho à escala real e lista os problemas à medida que escreve.
- **{{ui:Construir a partir de modelos por estaca}}.** Selecione um alinhamento e ative {{ui:Construir a partir de modelos por estaca}} nas suas Propriedades. Cada lado de cada região tem a sua própria lista de pavimentos e a sua própria condição final. {{ui:Adicionar um corredor}} em {{ui:Corredores neste alinhamento}} põe vários corredores num mesmo alinhamento.
- **Modelos de terreno.** {{ui:Superfície}} › {{ui:Mais}} › {{ui:Modelos de terreno…}} (ou escreva {{cmd:TERRAINTEMPLATES}}) aplica materiais em camadas, como terra vegetal ou pavimento e base, sobre um terreno, com área e volume por camada. Veja [Modelos de corredor e modelos de terreno](topic:corridor-templates).

### Desenho

- **Snaps.** As ferramentas Alinhamento, Plataforma, Parcela, Volume, Linha característica, Medir, Limite e Bacia de drenagem fazem snap a pontos de levantamento, PI, cantos, vértices e estruturas, com uma etiqueta junto ao marcador. Mantenha {{key:Alt}} premido para um ponto livre.
- **Botões Escolher, tangente e mover, copiar, rodar.** Os cantos de plataforma, parcela e linha característica têm caixas de Este e Norte digitáveis e um botão Escolher com cruz. As Propriedades têm também {{ui:Tangente a partir de dois pontos}} para alinhamentos e {{ui:Mover, copiar e rodar}} para alinhamentos, plataformas, parcelas e linhas características. Veja [Desenhar com snaps, cantos escolhidos e mover, copiar, rodar](topic:draft-with-snaps).
- **Vista de renderização em 3D.** O botão {{ui:Renderizar}} na barra 3D desenha o terreno com cores naturais, céu, neblina e sombras suaves. Não altera o modelo. O menu {{ui:Sol}} tem agora os botões {{ui:Aplicar}} e {{ui:Fechar}}. Veja [Ver o local em 3D](topic:site-3d).
- **Os painéis abrem uma secção de cada vez.** O painel esquerdo e o painel de Propriedades abrem uma secção e fecham as outras, e os separadores da faixa Paisagismo que agrupam várias ferramentas são botões divididos.

### Análise SIG

- **Analisar.** {{ui:Superfície}} › {{ui:Mais}} › {{ui:Analisar}} oferece buffer, sobreposição, junção espacial, seleção por atributo ou forma, e medição. Cada ferramenta cria uma camada nova num só passo de anulação.
- **Tabela de atributos.** O menu de três pontos de uma camada tem {{ui:Tabela de atributos…}} e {{ui:Estilo por atributo…}}. Veja [Analisar camadas SIG](topic:gis-analysis) e [Trabalhar com a tabela de atributos de uma camada](topic:gis-table).

### O local: sol, produção solar, conforto e vento

- **Secção de ambiente.** Selecione um volume: a secção {{ui:Ambiente}} fica por baixo de {{ui:Horas de sol}} nas suas Propriedades. Tem um estudo de sombra (mapa, tabela, animação, CSV), produção solar a partir de um ficheiro meteorológico de ano típico (.epw) e conforto exterior (UTCI).
- **Vento, apenas para triagem.** {{ui:Executar estudo de vento}} pinta o terreno desde «sentado» até «desconfortável» para cada direção do vento no ficheiro meteorológico. Não está validado e o painel diz isso.
- **Suplemento de vento pedonal (OpenFOAM).** Desligado até o ativar em {{ui:Definições}} › {{ui:Suplementos}}. O OpenFOAM é um programa que instala por conta própria. Veja [Sombra, produção solar e conforto exterior](topic:environment).

### Nuvens de pontos (suplemento)

- Ative {{ui:Nuvens de pontos}} em {{ui:Definições}} › {{ui:Suplementos}}; aparece um separador Nuvens de pontos no painel da direita. Abra um ficheiro LAS ou LAZ, limpe-o, separe-o em terreno, vegetação e edifícios, construa o terreno, as curvas de nível e os volumes, e exporte LAS ou LAZ. Veja [Nuvens de pontos de um drone ou scanner](topic:point-clouds).

### WaterCraft (suplemento)

- Ative {{ui:WaterCraft (distribuição de água)}} em {{ui:Definições}} › {{ui:Suplementos}}; aparece um separador WaterCraft. Tem consumos dos clientes, caudal de incêndio em cada hidrante, a interrupção de conduta que mais importa, e idade da água e cloro, cada um guardado em CSV. Veja [WaterCraft: consumos, caudal de incêndio, interrupções e idade da água](topic:watercraft).

### Trabalho em conjunto

- Numa sessão Live vê os cursores e os nomes uns dos outros no plano. Plantas da biblioteca: o CivilCraft Paisagismo começa na sua coleção predefinida da biblioteca, {{ui:CivilCraft paisagismo}}.

## Em todas as aplicações

- As dicas aparecem como tooltips do Bootstrap, e a faixa de dicas inicial pode ser fechada.
- A faixa de separadores de um painel que não cabe desliza em vez de ser cortada.
- Os títulos dos separadores do navegador leem `<document> - CivilCraft | CadCraft`.
- Em {{ui:Definições}} há uma secção Layout, onde os layouts são uma lista pendente com opções de duas linhas.
- As unidades de peso e de temperatura estão em {{ui:Definições}} › {{ui:Global}} › {{ui:Unidades}}.
- A lista de idiomas mostra os idiomas para os quais a versão tem ficheiros. Os idiomas diferentes do inglês são rascunhos automáticos.

## Corrigido

- Os suplementos de pesquisa de endereços e de verificação EnergyPlus não podiam ser ativados; agora podem.
- A ajuda diz agora que o suplemento Nuvens de pontos escreve uma nuvem limpa como LAS 1.4 ou LAZ.
- Clicar na pega do próprio objeto selecionado deixou de iniciar um arrastamento de pega que parava um Escolher em espera.

## Limites honestos

- Os modelos de corredor de exemplo são marcadores sem qualquer norma; um engenheiro tem de os verificar. Os modelos de terreno não acrescentam superfície e não são desenhados em 3D nem na vista de secção. O segundo corredor de um alinhamento não está na exportação IFC. Não há transição entre dois modelos por estaca.
- As nuvens de pontos foram testadas em ficheiros fictícios, não num levantamento real por drone. Só se leem ficheiros LAS e LAZ.
- A análise SIG foi testada em camadas fictícias.
- Sombra, produção solar e conforto são estimativas de planeamento; o vento é uma triagem não validada. Nada disto é um valor de projeto.
- O WaterCraft é uma ajuda de cálculo verificada em redes fictícias. Um engenheiro de águas decide o que os números valem.
- Os idiomas além do inglês são rascunhos automáticos.
- Os instaladores para Windows não têm assinatura de código, e a imagem de disco para macOS não está notarizada.

## Anteriores: 0.8 e 0.8.1

Esta é a lista do que mudou no CivilCraft 0.8 (2026-11-01) e na 0.8.1 (2026-11-02), em comparação com a 0.7. As grandes novidades são ferramentas que testam a sua modelação e o seu local (chuva, movimento de terras, percursos, bacias, progresso) e seis janelas de cálculo para terreno, estradas, levantamento, minas, ligações e caminhos de ferro.

### Novidades

**Testar a modelação**

- **Faça chover.** {{ui:Faça chover…}} (em {{ui:Superfície}}) lança uma tempestade sobre o terreno modelado. Vê a água escorrer das plataformas, acumular-se nos cantos baixos e galgar as bacias demasiado pequenas. A simulação é animada e dá os volumes, o caudal de pico e um CSV de cada bacia. A célula predefinida é grosseira para que uma primeira vista seja rápida; uma célula mais fina é mais lenta. As bacias que galgam aparecem também no painel de Problemas.
- **Equilíbrio de terras.** {{ui:Equilíbrio de terras…}} eleva ou baixa uma plataforma até o corte igualar o aterro, e mostra a tabela de transporte entre eles.
- **Melhor percurso.** {{ui:Melhor percurso…}}: escolha um início e um fim, e o CivilCraft encontra o caminho mais barato pelo terreno que respeita os seus limites de declive e de curvatura, e cria a partir dele um alinhamento.
- **Bacias de retenção.** {{ui:Bacias de retenção…}} calcula a cota e o armazenamento a partir do seu terreno, aceita dispositivos de saída (orifício, soleira, entalhe em V, descarregador), encaminha uma tempestade pela bacia e verifica o caudal de pico retido, o tempo de esvaziamento e a folga.
- **Progresso a partir de levantamentos.** {{ui:Progresso a partir de levantamentos…}} compara superfícies de drone ou de scanner de datas diferentes com o terreno como estava e com o projeto: percentagem concluída por volume, áreas escavadas em excesso e aterradas em excesso, depósitos de materiais, e quando a obra acaba a este ritmo (assinalado como estimativa).

**Conhecer o local**

- **Morada para local.** {{ui:Morada para local…}} alinha dados abertos de parcelas, edifícios, zonamento, solos, cheias e terreno num só local. Pode guardar o local no ficheiro de projeto: a morada escrita, cada fonte com o dia em que a obteve e a sua licença, e o que foi devolvido. Reabra ou partilhe o projeto e o local continua lá, sem nada ser obtido de novo. Também o pode guardar como ficheiro de local ou enviá-lo para o BimCraft. Veja [Morada para local](topic:address-to-site).

**Terreno, estradas, levantamento, minas, ligações e caminho de ferro**

- **Solos e taludes.** {{ui:Solos e taludes…}} desenha o perfil do solo entre sondagens que escreve. O método de Bishop procura depois o círculo crítico no seu terreno, com nível freático, sobrecarga e coeficiente sísmico; o assentamento de uma sapata tem em conta a consolidação, o assentamento imediato e o tempo.
- **Entroncamentos e marcação.** {{ui:Entroncamentos e marcação…}} junta ramos com concordâncias de lancil (um raio por ramo, ou concordâncias de três centros), a distância de visibilidade para a velocidade de projeto, uma verificação dos triângulos de visibilidade, passadeiras, linhas de paragem, marcações e sinais com um mapa de sinais. São desenhados no plano e guardados como .dxf com camadas com nome.
- **Compensação topográfica.** {{ui:Compensação topográfica…}} faz uma compensação por mínimos quadrados de uma poligonal ou rede: coordenadas compensadas, elipses de erro, o teste do qui-quadrado e um sinal na medição que não encaixa. Estão incluídas redes livres, o fecho de uma poligonal pela regra da bússola e ficheiros de campo RW5, GSI, JobXML ou CSV, e os pontos compensados guardam-se em CSV.
- **Cavas a céu aberto.** {{ui:Cavas a céu aberto…}} transforma amostras de sondagem num modelo de blocos e na cava final dentro do seu ângulo de talude, com a razão estéril, uma tabela por bancada e uma curva de teor e tonelagem. Estão também cavas aninhadas por fator de receita e um plano de produção com fluxo de caixa descontado.
- **Ligações rádio.** {{ui:Ligações rádio…}} verifica a linha de vista sobre o seu terreno com a curvatura da terra, a primeira zona de Fresnel, o orçamento da ligação, a margem de desvanecimento e a interrupção por multipercurso, e indica a altura do mastro que libertaria o percurso. Faz também orçamentos de perda de fibra, quantidades de percurso e o vento numa torre.
- **Aparelhos de via.** {{ui:Aparelhos de via…}} faz um aparelho de via a partir do seu número de coração, cruzamentos entre vias paralelas e um gabarito de estrutura inclinado pela sobrelevação e alargado numa curva. Um aparelho pode ficar numa estaca de um alinhamento.

Veja [Solos, entroncamentos, compensação topográfica, cavas, ligações rádio e aparelhos de via](topic:soils-roads-survey-mines-links).

### Em todas as aplicações

- **Idiomas.** 54 idiomas, dez deles novos. Os idiomas diferentes do inglês são rascunhos automáticos até um falante nativo os rever. Os tópicos de ajuda continuam, na sua maioria, em inglês.
- **Linhas da barra de ferramentas.** {{ui:Definições}} › {{ui:Geral}} › {{ui:Linhas da barra de ferramentas}}: Quebrar (como antes), 2 linhas ou 1 linha. A faixa do CivilCraft mostra a ferramenta mais usada em grande, as seguintes em pequeno, e as restantes atrás da seta do nome do grupo.
- **Dispositivos de entrada.** Trackpad, caneta, rato 3D, comando e MIDI podem controlar as aplicações.
- **Problemas.** Um painel de Problemas que avisa em todas as aplicações, com verificações que leem pacotes de regulamentação.
- **Live.** Uma vista de quem está onde numa sessão Live.
- **Suplementos.** Uma lista de suplementos, com suplementos de iluminação.
- **Ligue a sua IA.** Qualquer assistente que ligue pode controlar as ferramentas do CivilCraft. Vem com uma nota de que a ligação com um clique dentro do CadCraft Studio e o conector alojado ainda não estão prontos. Veja [Deixe um assistente de IA trabalhar no seu local](topic:assistants).

### Corrigido na 0.8.1

- **Secção de classes DWG.** Era lida com o tipo errado (GitHub cadcraft#5). Corrigido no CivilCraft juntamente com o CadCraft, BimCraft, ModelCraft e TakeoffCraft.
- **Mudar de idioma em execução.** O CadCraft Studio e as edições empacotadas podem mudar de idioma durante a execução. Antes só tinham inglês. Ainda não testado em todas as plataformas: diga-nos se o idioma não mudar.

### Ainda não disponível nesta versão

- **Estes são auxiliares de cálculo.** Cada resultado das novas janelas precisa da verificação de um engenheiro. As resistências do solo partem de valores típicos para o grupo de solo, e a janela indica-o.
- **Faça chover.** Uma execução no local de exemplo pode levar mais de dois minutos no navegador com uma célula fina. Foi verificada contra casos feitos à mão e uma bacia em V, ainda não num local real modelado.
- **Morada para local.** Lê os ficheiros de dados abertos que traz, e foi testada apenas com os nossos próprios ficheiros. As árvores não são uma fonte. Obter as fontes por si aguarda a redação da privacidade.
- **Progresso a partir de levantamentos.** Testado apenas com levantamentos fictícios. O progresso em folhas e anotações (MarkupCraft) e a comparação de digitalização com modelo (BimCraft) não estão construídos.
- **Solos e taludes.** Apenas superfícies circulares: sem pesquisa de cunha ou de bloco e sem fenda de tração.
- **Entroncamentos.** Um raio por ramo, sem trajetórias de giro de camiões, e ainda não entram no corredor.
- **Ficheiros de campo.** Os leitores foram escritos a partir de descrições públicas dos formatos e testados em ficheiros que fizemos. São precisos ficheiros de instrumentos reais.
- **Ligações e caminho de ferro.** Ligações rádio: apenas perda em espaço livre e multipercurso (sem desvanecimento por chuva nem diagramas de antena), e nenhuma norma ferroviária: cada limite ferroviário é um marcador, com valores de rascunho que nenhum engenheiro ferroviário verificou.
- **Windows e macOS.** A 0.8 não tem assinatura de código. O Windows pode avisar, e o macOS pede clique com o botão direito e depois Abrir.

Tudo o resto está em [Ainda não implementado](topic:not-built-yet). Para a versão anterior, veja [Novidades na 0.7](topic:whats-new-0-7).
