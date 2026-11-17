---
title: Novidades na 0.9
summary: Modelos de corredor e de terreno, snaps e botões Escolher ponto ao desenhar, análise GIS com tabela de atributos, estudos de sombra, produção solar, conforto e vento de um terreno, uma vista de renderização 3D e os complementos Nuvens de pontos e WaterCraft.
keywords: novidades, 0.9, notas de lançamento, modelos de corredor, modelos de terreno, editor de modelos, seção típica, vários corredores, snap, snaps, escolher ponto, mover, copiar, girar, tangente, renderizar, renderização 3D, análise GIS, buffer, sobreposição, junção espacial, tabela de atributos, estilo por atributo, estudo de sombra, produção solar, UTCI, conforto ao ar livre, estudo de vento, OpenFOAM, nuvens de pontos, las, laz, watercraft, vazão de incêndio, hidrante, idade da água, cloro, demandas, dicas de ferramenta, layout, novidades, notas de lançamento, registro de alterações, alterações, 0.8, 0.8.1, versão, novos recursos, chuva, drenagem, empoçamento, transbordamento, terraplenagem, balanceamento, corte e aterro, transporte de material, melhor traçado, menor custo, alinhamento, bacia de detenção, saída, rebaixamento, borda livre, avanço, levantamento, drone, pilha de material, endereço para terreno, lote, solo, enchente, estabilidade de taludes, Bishop, recalque, interseção, sinalização, placas, distância de visibilidade, ajustamento, mínimos quadrados, poligonal, cava a céu aberto, modelo de blocos, enlace de rádio, Fresnel, aparelho de mudança de via, cruzamento de vias, idiomas, problemas, live, dwg
from: d7ac5b14
---

Esta é a lista do que mudou no CivilCraft 0.9, em comparação com a 0.8.1. O CivilCraft 0.9 faz parte do CadCraft Studio 0.9 e de seus oito aplicativos. As grandes partes são modelos de corredor e de terreno, snaps ao desenhar, análise GIS, estudos do sol, da produção solar, do conforto e do vento de um terreno, e dois complementos: Nuvens de pontos e WaterCraft.

## Novo

### Modelos de corredor e de terreno

- **Modelos de corredor.** Abra {{ui:Superfície}} › {{ui:Mais}} › {{ui:Modelos de corredor…}} (ou digite {{cmd:TEMPLATES}}). Um modelo é uma pequena seção transversal com componentes, afastamentos, declividades, materiais e códigos de pontos. Guarde-os no projeto, em {{ui:Minha biblioteca}} ou como um arquivo `.cctemplates.json`. O editor de modelos mostra um desenho em escala real e lista os problemas enquanto você digita.
- **Construir a partir de modelos por estaca.** Selecione um alinhamento e ative {{ui:Construir a partir de modelos por estaca}} em suas Propriedades. Cada lado de cada região tem sua própria lista de pavimentação e sua própria condição de término. {{ui:Adicionar um corredor}} em {{ui:Corredores neste alinhamento}} coloca vários corredores em um mesmo alinhamento.
- **Modelos de terreno.** {{ui:Superfície}} › {{ui:Mais}} › {{ui:Modelos de terreno…}} (ou digite {{cmd:TERRAINTEMPLATES}}) aplica sobre um terreno materiais em camadas, como solo vegetal, pavimento e base, com área e volume de cada camada. Veja [Modelos de corredor e modelos de terreno](topic:corridor-templates).

### Desenho

- **Snaps.** As ferramentas Alinhamento, Plataforma, Lote, Massa, Linha de feição, Medir, Divisa e Bacia de contribuição se encaixam em pontos de levantamento, PIs, cantos, vértices e estruturas, com um rótulo junto ao marcador. Mantenha {{key:Alt}} pressionada para um ponto livre.
- **Botões Escolher ponto, tangente e mover, copiar, girar.** Os cantos de plataforma, lote e linha de feição têm caixas digitáveis de Leste e Norte e um botão Escolher ponto com mira. Em Propriedades, também há {{ui:Tangente por dois pontos}} para alinhamentos e {{ui:Mover, copiar e girar}} para alinhamentos, plataformas, lotes e linhas de feição. Veja [Desenhe com snaps, cantos escolhidos e mover, copiar, girar](topic:draft-with-snaps).
- **Vista de renderização em 3D.** O botão {{ui:Renderizar}} na barra 3D desenha o terreno com cores naturais, céu, névoa e sombras suaves. Ele não altera o modelo. O menu {{ui:Sol}} agora tem os botões {{ui:Aplicar}} e {{ui:Fechar}}. Veja [Ver o terreno em 3D](topic:site-3d).
- **Painéis abrem uma seção por vez.** O painel da esquerda e o painel Propriedades abrem uma seção e fecham as outras, e os blocos da faixa de opções de Paisagismo que têm várias ferramentas são botões divididos.

### Análise GIS

- **Analisar.** {{ui:Superfície}} › {{ui:Mais}} › {{ui:Analisar}} oferece zona de influência (buffer), sobreposição, junção espacial, selecionar por atributo ou por forma, e medir. Cada ferramenta cria uma nova camada em uma única etapa de desfazer.
- **Tabela de atributos.** O menu de três pontos de uma camada tem {{ui:Tabela de atributos…}} e {{ui:Estilo por atributo…}}. Veja [Analisar camadas GIS](topic:gis-analysis) e [Trabalhar com a tabela de atributos de uma camada](topic:gis-table).

### O terreno: sol, produção solar, conforto e vento

- **Seção de ambiente.** Selecione uma massa: a seção {{ui:Ambiente}} fica abaixo de {{ui:Horas de sol}} em suas Propriedades. Ela tem um estudo de sombra (mapa, tabela, animação, CSV), produção solar a partir de um arquivo climático de ano típico (.epw) e conforto ao ar livre (UTCI).
- **Vento, apenas triagem.** {{ui:Executar estudo de vento}} colore o terreno de confortável a desconfortável, de sentado a desconfortável, para cada direção do vento no arquivo climático. Não é validado, e o painel diz isso.
- **Complemento de vento para pedestres (OpenFOAM).** Desligado até você ativá-lo em {{ui:Configurações}} › {{ui:Complementos}}. OpenFOAM é um software que você instala por conta própria. Veja [Sombra, produção solar e conforto ao ar livre](topic:environment).

### Nuvens de pontos (complemento)

- Ative {{ui:Nuvens de pontos}} em {{ui:Configurações}} › {{ui:Complementos}}; uma guia Nuvens de pontos aparece no painel da direita. Abra um arquivo LAS ou LAZ, limpe-o, classifique-o em solo, vegetação e edificações, gere o terreno, as curvas de nível e os volumes, e exporte LAS ou LAZ. Veja [Nuvens de pontos de um drone ou scanner](topic:point-clouds).

### WaterCraft (complemento)

- Ative {{ui:WaterCraft (distribuição de água)}} em {{ui:Configurações}} › {{ui:Complementos}}; uma guia WaterCraft aparece. Ela tem demandas de clientes, vazão de incêndio em cada hidrante, qual interrupção de trecho mais importa, e idade da água e cloro, cada um salvo como CSV. Veja [WaterCraft: demandas, vazão de incêndio, interrupções e idade da água](topic:watercraft).

### Trabalho em conjunto

- Em uma sessão Live, você vê os cursores e os nomes uns dos outros na planta. Plantas da biblioteca: o Paisagismo do CivilCraft começa com a coleção padrão da biblioteca, {{ui:Paisagismo do CivilCraft}}.

## Em todos os aplicativos

- As dicas aparecem como dicas de ferramenta do Bootstrap, e a dica inicial pode ser fechada.
- A faixa de guias de um painel que não cabe rola em vez de ser cortada.
- Os títulos das abas do navegador leem `<documento> - CivilCraft | CadCraft`.
- {{ui:Configurações}} tem uma seção Layout, em que os layouts são uma lista suspensa de opções de duas linhas.
- As unidades de peso e de temperatura estão em {{ui:Configurações}} › {{ui:Global}} › {{ui:Unidades}}.
- A lista de idiomas mostra os idiomas para os quais a versão tem arquivos. Os idiomas diferentes do inglês são rascunhos de máquina.

## Corrigido

- Os complementos de busca de endereço e de verificação do EnergyPlus não podiam ser ativados; agora podem.
- A ajuda agora diz que o complemento Nuvens de pontos grava uma nuvem limpa como LAS 1.4 ou LAZ.
- Clicar no próprio grip do objeto selecionado não inicia mais um arrasto de grip que interrompia um Escolher ponto em espera.

## Limites declarados

- Os modelos de corredor de exemplo são marcadores sem norma; um engenheiro precisa verificá-los. Modelos de terreno não acrescentam superfície e não são desenhados em 3D nem na vista de seção. O segundo corredor de um alinhamento não está na exportação IFC. Não há afunilamento entre dois modelos por estaca.
- Nuvens de pontos foram testadas com arquivos fictícios, não com um levantamento real de drone. Só LAS e LAZ são lidos.
- A análise GIS foi testada com camadas fictícias.
- Sombra, produção solar e conforto são estimativas de planejamento; o vento é uma triagem não validada. Nada disso é um valor de projeto.
- O WaterCraft é uma ferramenta de cálculo verificada com redes fictícias. Um engenheiro de água decide o que os números valem.
- Idiomas além do inglês são rascunhos de máquina.
- Os instaladores para Windows não têm assinatura de código, e a imagem de disco do macOS não é notarizada.

## Anterior: 0.8 e 0.8.1

Esta é a lista do que mudou no CivilCraft 0.8 (2026-11-01) e 0.8.1 (2026-11-02), em comparação com a 0.7. As grandes novidades são ferramentas que testam a sua terraplenagem e o seu terreno (chuva, movimento de terra, melhores traçados, bacias, avanço) e seis janelas de cálculo para solo, estradas, levantamento, minas, enlaces e ferrovias.

### Novo

**Teste a sua terraplenagem**

- **Faça chover.** {{ui:Fazer chover…}} (em {{ui:Superfície}}) despeja uma tempestade sobre o terreno terraplenado. Você vê a água escorrer das plataformas, empoçar nos cantos baixos e transbordar das bacias pequenas demais. A execução é animada e dá os volumes, a vazão de pico de saída e um CSV de cada bacia. A célula padrão é grossa para que a primeira visão seja rápida; uma célula mais fina é mais lenta. Bacias que transbordam também aparecem no painel Problemas.
- **Balanceador de terraplenagem.** {{ui:Balanceador de terraplenagem…}} eleva ou rebaixa uma plataforma até que corte seja igual a aterro, e mostra a tabela de transporte de material entre eles.
- **Melhor traçado.** {{ui:Melhor traçado…}}: escolha um início e um fim, e o CivilCraft encontra o caminho mais barato pelo terreno que respeita os seus limites de greide e de curva, e então faz um alinhamento a partir dele.
- **Bacias de detenção.** {{ui:Bacias de detenção…}} calcula cota e armazenamento a partir do seu terreno, aceita dispositivos de saída (orifício, vertedouro, vertedor em V, sangradouro), faz o trânsito de uma tempestade pela bacia e verifica a vazão de pico retida, o tempo de esvaziamento e a borda livre.
- **Avanço a partir de levantamentos.** {{ui:Avanço a partir de levantamentos…}} compara superfícies de drone ou de varredura de datas diferentes com o terreno como era e com o projeto: percentual concluído por volume, áreas escavadas além do previsto e áreas aterradas além do previsto, pilhas de material, e quando o trabalho termina neste ritmo (marcado como estimativa).

**Conheça o terreno**

- **Endereço para terreno.** {{ui:Endereço para terreno…}} reúne dados abertos de lote, edificação, zoneamento, solo, enchente e terreno em um único terreno. Você pode manter o terreno no arquivo do projeto: o endereço digitado, cada fonte com o dia em que foi obtida e sua licença, e o que foi retornado. Reabra ou compartilhe o projeto e o terreno continua lá, sem buscar nada de novo. Você também pode salvá-lo como arquivo de terreno ou enviá-lo ao BimCraft. Veja [Endereço para terreno](topic:address-to-site).

**Terreno, estradas, levantamento, minas, enlaces e ferrovias**

- **Solos e taludes.** {{ui:Solos e taludes…}} desenha o perfil do solo entre sondagens que você digita. O método de Bishop então procura o círculo crítico no seu terreno, com um lençol freático, uma sobrecarga e um coeficiente sísmico; o recalque de uma sapata recebe adensamento, recalque imediato e tempo.
- **Interseções e sinalização.** {{ui:Interseções e sinalização…}} junta ramos com concordâncias de meio-fio (um raio por ramo, ou concordâncias de três centros), a distância de visibilidade para a velocidade de projeto, uma verificação dos triângulos de visibilidade, faixas de pedestres, linhas de retenção, marcações e placas com uma tabela de placas. Elas são desenhadas na planta e salvas como .dxf com camadas nomeadas.
- **Ajuste topográfico.** {{ui:Ajustamento topográfico…}} faz um ajustamento por mínimos quadrados de uma poligonal ou de uma rede: coordenadas ajustadas, elipses de erro, o teste do qui-quadrado e um sinal na medição que não se encaixa. Redes livres, fechamento de poligonal pela regra da bússola e RW5, arquivos de campo GSI, JobXML ou CSV estão incluídos, e os pontos ajustados são salvos como CSV.
- **Cavas a céu aberto.** {{ui:Cavas a céu aberto…}} transforma amostras de sondagem em um modelo de blocos e na cava final dentro do seu ângulo de talude, com a razão estéril/minério, uma tabela por bancada e uma curva de teor e tonelagem. Cavas aninhadas por fator de receita e um cronograma de produção com fluxo de caixa descontado também estão incluídos.
- **Enlaces de rádio.** {{ui:Enlaces de rádio…}} verifica a linha de visada sobre o seu terreno, com a curvatura da terra, a primeira zona de Fresnel, o orçamento do enlace, a margem de desvanecimento e a interrupção por multipercurso, e dá a altura do mastro que liberaria o trajeto. Também faz orçamentos de perda em fibra, quantitativos de rota e o vento sobre uma torre.
- **Aparelhos de mudança de via.** {{ui:Aparelhos de mudança de via…}} faz um aparelho a partir do seu número de jacaré, cruzamentos entre vias paralelas e um gabarito da estrutura inclinado pela superelevação e alargado em curva. Um aparelho pode ficar em uma estaca de um alinhamento.

Veja [Solos, interseções, ajuste topográfico, cavas, enlaces de rádio e aparelhos de mudança de via](topic:soils-roads-survey-mines-links).

### Em todos os aplicativos

- **Idiomas.** 54 idiomas, dez deles novos. Os idiomas diferentes do inglês são rascunhos de máquina até que um falante nativo os leia. Os tópicos de ajuda ainda estão, em sua maioria, em inglês.
- **Linhas da barra de ferramentas.** {{ui:Configurações}} › {{ui:Geral}} › {{ui:Linhas da barra de ferramentas}}: Quebrar (como antes), 2 linhas ou 1 linha. A faixa de opções do CivilCraft mostra a ferramenta mais usada em tamanho grande, as próximas em tamanho pequeno, e as demais atrás da seta do nome do grupo.
- **Dispositivos de entrada.** Trackpad, caneta, mouse 3D, controle e MIDI podem controlar os aplicativos.
- **Problemas.** Um painel Problemas que avisa em todos os aplicativos, com verificações que leem pacotes de regulamentação.
- **Live.** Uma vista de quem está onde em uma sessão Live.
- **Complementos.** Uma lista de complementos, com complementos de iluminação.
- **Conecte a sua IA.** Qualquer assistente que você conectar pode operar as ferramentas do CivilCraft. Ele vem com uma nota de que a conexão com um clique dentro do CadCraft Studio e o conector hospedado ainda não estão prontos. Veja [Deixe um assistente de IA trabalhar com o seu terreno](topic:assistants).

### Corrigido na 0.8.1

- **Seção de classes do DWG.** Era lida com o tipo errado (GitHub cadcraft#5). Corrigido no CivilCraft junto com CadCraft, BimCraft, ModelCraft e TakeoffCraft.
- **Trocar o idioma em execução.** O CadCraft Studio e as edições empacotadas podem trocar de idioma durante a execução; antes, eram apenas em inglês. Ainda não testado em todas as plataformas: avise-nos se o idioma não mudar.

### Ainda não nesta versão

- **Estas são ferramentas de cálculo.** Todo resultado das novas janelas precisa da verificação de um engenheiro. As resistências do solo partem de valores típicos do grupo de solo, e a janela informa isso.
- **Faça chover.** Uma execução no terreno de exemplo pode levar mais de dois minutos no navegador com uma célula fina. Foi verificada com casos feitos à mão e com uma bacia de contribuição em V, ainda não em um terreno real terraplenado.
- **Endereço para terreno.** Lê arquivos de dados abertos que você traz, e foi testado apenas com os nossos próprios arquivos. Árvores não são uma fonte. Buscar fontes para você aguarda a redação da política de privacidade.
- **Avanço a partir de levantamentos.** Testado apenas com levantamentos fictícios. Avanço em folhas e marcações (MarkupCraft) e comparação de varredura com o modelo (BimCraft) ainda não estão implementados.
- **Solos e taludes.** Apenas superfícies circulares: sem busca em cunha ou em bloco e sem fenda de tração.
- **Interseções.** Um raio por ramo, sem trajetórias de giro de caminhões, e ainda não entram no corredor.
- **Arquivos de campo.** Os leitores foram escritos a partir de descrições públicas de formato e testados com arquivos que nós mesmos criamos. Arquivos reais de instrumentos são necessários.
- **Enlaces e ferrovias.** Enlaces de rádio: apenas perda no espaço livre e multipercurso (sem desvanecimento por chuva nem diagramas de antena), e nenhuma norma ferroviária: cada limite ferroviário é um marcador, com números de rascunho que nenhum engenheiro ferroviário verificou.
- **Windows e macOS.** A 0.8 não tem assinatura de código. O Windows pode avisar, e o macOS pede clicar com o botão direito e depois Abrir.

Todo o restante está em [Ainda não implementado](topic:not-built-yet). Para a versão anterior, veja [Novidades na 0.7](topic:whats-new-0-7).
