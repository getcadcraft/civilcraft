---
title: Novidades da versão 0.9 (anteriores)
summary: Modelos de corredor e de terreno, encaixes e botões Escolher no desenho, análise SIG com tabela de atributos, estudos de sombra, geração solar, conforto e vento para um local, uma vista 3D Renderizar, e os complementos Nuvens de pontos e WaterCraft.
keywords: novidades 0.9, versão anterior, novidades, 0.9, notas de versão, modelos de corredor, modelos de terreno, editor de modelos, seção-tipo, vários corredores, snap, snaps, escolher, mover, copiar, girar, tangente, renderizar, renderização 3D, análise SIG, buffer, sobreposição, junção espacial, tabela de atributos, estilo por atributo, estudo de sombra, geração solar, UTCI, conforto externo, estudo de vento, OpenFOAM, nuvens de pontos, LAS, LAZ, WaterCraft, vazão de incêndio, hidrante, idade da água, cloro, demandas, dicas, layout, novidades, registro de alterações, 0.8, 0.8.1, versão, novos recursos, chuva, tempestade, empoçamento, transbordamento, terraplenagem, equilíbrio, corte e aterro, transporte, melhor traçado, menor custo, alinhamento, bacia de detenção, saída, rebaixamento, borda livre, progresso, levantamento, drone, pilha de material, endereço para terreno, lote, solo, enchente, estabilidade de taludes, Bishop, recalque, nó viário, sinalização, distância de visibilidade, ajustamento, mínimos quadrados, poligonal, cava a céu aberto, modelo de blocos, enlace de rádio, Fresnel, aparelho de mudança de via, cruzamento, idiomas, problemas, ao vivo, DWG
from: 4664522c
---

Estas são as mudanças da CivilCraft 0.9, em comparação com a 0.8.1. A CivilCraft 0.9 faz parte do CadCraft Studio 0.9 e dos seus oito aplicativos. As grandes partes são os modelos de corredor e de terreno, os encaixes ao desenhar, a análise SIG, os estudos de sol, geração solar, conforto e vento de um local, e dois complementos: Nuvens de pontos e WaterCraft.

## Novo

### Modelos de corredor e de terreno

- **Modelos de corredor.** Abra {{ui:Surface}} › {{ui:More}} › {{ui:Corridor templates…}} (ou digite {{cmd:TEMPLATES}}). Um modelo é uma pequena seção transversal com componentes, afastamentos, declividades, materiais e códigos de ponto. Guarde-os no projeto, em {{ui:My library}} ou como um arquivo `.cctemplates.json`. O editor de modelos mostra um desenho em escala real e lista os problemas enquanto você digita.
- **Construir a partir de modelos por estaca.** Selecione um alinhamento e ative {{ui:Build from templates by station}} nas suas Propriedades. Cada lado de cada região tem sua própria lista de pavimento e sua própria condição de extremidade. {{ui:Add a corridor}} em {{ui:Corridors on this alignment}} coloca vários corredores em um mesmo alinhamento.
- **Modelos de terreno.** {{ui:Surface}} › {{ui:More}} › {{ui:Terrain templates…}} (ou digite {{cmd:TERRAINTEMPLATES}}) aplica materiais em camadas, como camada vegetal ou pavimento e base, sobre um terreno, com área e volume de cada camada. Veja [Modelos de corredor e modelos de terreno](topic:corridor-templates).

### Desenho

- **Snaps.** As ferramentas Alinhamento, Plataforma, Lote, Massa, Linha de feição, Medir, Contorno e Bacia de contribuição se encaixam em pontos de levantamento, PIs, cantos, vértices e estruturas, com um rótulo ao lado do marcador. Segure {{key:Alt}} para um ponto livre.
- **Botões Escolher, tangente e mover, copiar, girar.** Os cantos de plataforma, lote e linha de feição têm caixas digitáveis de Leste e Norte e um botão Escolher com mira. As Propriedades também têm {{ui:Tangent from two points}} para alinhamentos e {{ui:Move, copy and rotate}} para alinhamentos, plataformas, lotes e linhas de feição. Veja [Desenhar com snaps, cantos escolhidos e mover, copiar, girar](topic:draft-with-snaps).
- **Vista Renderizar em 3D.** O botão {{ui:Render}} na barra 3D desenha o terreno com cores naturais, céu, névoa e sombras suaves. Ele não altera o modelo. O menu {{ui:Sun}} agora tem os botões {{ui:Apply}} e {{ui:Close}}. Veja [Ver o local em 3D](topic:site-3d).
- **Painéis abrem uma seção por vez.** O painel da esquerda e o painel de Propriedades abrem uma seção e fecham as outras, e as faixas de Paisagismo que reúnem várias ferramentas são botões divididos.

### Análise SIG

- **Analisar.** {{ui:Surface}} › {{ui:More}} › {{ui:Analyze}} oferece buffer, sobreposição, junção espacial, seleção por atributo ou forma, e medição. Cada ferramenta cria uma nova camada em um único passo de desfazer.
- **Tabela de atributos.** O menu de três pontos de uma camada tem {{ui:Attribute table…}} e {{ui:Style by attribute…}}. Veja [Analisar camadas SIG](topic:gis-analysis) e [Trabalhar com a tabela de atributos de uma camada](topic:gis-table).

### O local: sol, energia solar, conforto e vento

- **Seção Ambiente.** Selecione uma massa: a seção {{ui:Environment}} fica abaixo de {{ui:Sun hours}} nas suas Propriedades. Ela tem um estudo de sombra (mapa, tabela, animação, CSV), geração solar a partir de um arquivo de clima de ano típico (.epw) e conforto externo (UTCI).
- **Vento, apenas triagem.** {{ui:Run wind study}} colore o terreno de sentado a desconfortável para cada direção do vento no arquivo de clima. Ele não foi validado, e o painel diz isso.
- **Complemento de vento para pedestres (OpenFOAM).** Desligado até você ativá-lo em {{ui:Settings}} › {{ui:Add-ons}}. O OpenFOAM é um software que você instala por conta própria. Veja [Sombra, geração solar e conforto externo](topic:environment).

### Nuvens de pontos (complemento)

- Ative {{ui:Point clouds}} em {{ui:Settings}} › {{ui:Add-ons}}; uma aba Nuvens de pontos aparece no painel da direita. Abra um arquivo LAS ou LAZ, limpe-o, separe-o em solo, vegetação e edificações, construa o terreno, as curvas de nível e os volumes, e exporte LAS ou LAZ. Veja [Nuvens de pontos de um drone ou scanner](topic:point-clouds).

### WaterCraft (complemento)

- Ative {{ui:WaterCraft (water distribution)}} em {{ui:Settings}} › {{ui:Add-ons}}; uma aba WaterCraft aparece. Ela tem demandas a partir de consumidores, vazão de incêndio em cada hidrante, qual interrupção de tubulação importa mais, e idade da água e cloro, cada um salvo como CSV. Veja [WaterCraft: demandas, vazão de incêndio, interrupções e idade da água](topic:watercraft).

### Trabalho em conjunto

- Em uma sessão ao vivo, você vê os cursores e os nomes uns dos outros na planta. Plantas da biblioteca: o CivilCraft Paisagismo começa com a coleção padrão da sua Biblioteca, {{ui:CivilCraft landscape}}.

## Em todos os aplicativos

- As dicas aparecem como balões flutuantes do Bootstrap, e a dica inicial pode ser fechada.
- A faixa de abas de um painel que não cabe passa a rolar, em vez de ser cortada.
- Os títulos das abas do navegador seguem o padrão `<documento> - CivilCraft | CadCraft`.
- {{ui:Settings}} tem uma seção Layout, em que os layouts são uma lista suspensa de opções de duas linhas.
- As unidades de peso e de temperatura ficam em {{ui:Settings}} › {{ui:Global}} › {{ui:Units}}.
- A lista de idiomas mostra os idiomas para os quais a versão tem arquivos. Os idiomas diferentes do inglês são rascunhos de máquina.

## Corrigido

- Os complementos de consulta de endereço e de verificação EnergyPlus não podiam ser ativados; agora podem.
- A ajuda agora diz que o complemento Nuvens de pontos grava uma nuvem limpa como LAS 1.4 ou LAZ.
- Clicar na alça do próprio objeto selecionado não inicia mais um arrasto de alça que interrompia um Escolher em espera.

## Limites honestos

- Os modelos de corredor de exemplo são provisórios, sem base em nenhuma norma; um engenheiro deve verificá-los. Os modelos de terreno não acrescentam superfície e não são desenhados em 3D nem na vista da seção. A segunda estrada num alinhamento não está na exportação IFC. Não há afunilamento entre dois modelos por estaca.
- Nuvens de pontos foram testadas com arquivos fictícios, não com um levantamento real de drone. Só LAS e LAZ são lidos.
- A análise SIG foi testada com camadas fictícias.
- Sombra, geração solar e conforto são estimativas de planejamento; o vento é uma triagem não validada. Nada disso é um valor de projeto.
- WaterCraft é uma ferramenta de cálculo conferida com redes fictícias. Um engenheiro de água decide o que os números valem.
- Idiomas além do inglês são rascunhos de máquina.
- Os instaladores para Windows não têm assinatura de código, e a imagem de disco do macOS não é notarizada.

## Anteriores: 0.8 e 0.8.1

Estas são as mudanças da CivilCraft 0.8 (2026-11-01) e da 0.8.1 (2026-11-02), em comparação com a 0.7. As grandes novidades são ferramentas para testar a sua regularização e o seu local (chuva, terraplenagem, traçados, bacias, progresso), e seis janelas de cálculo para terreno, estradas, levantamento, minas, links e ferrovias.

### Novo

**Teste a sua regularização**

- **Faça chover.** {{ui:Make it rain…}} (em {{ui:Surface}}) lança uma tempestade sobre o terreno regularizado. Você vê a água escorrer das plataformas, empoçar nos cantos baixos e transbordar das bacias pequenas demais. A simulação é animada e dá os volumes, a vazão de pico de saída e um CSV de cada bacia. A célula padrão é grossa, para que a primeira olhada seja rápida; uma célula mais fina é mais lenta. Bacias que transbordam também aparecem no painel de Problemas.
- **Balanceador de terraplenagem.** {{ui:Earthwork balancer…}} eleva ou rebaixa uma plataforma até o corte igualar o aterro, e mostra a tabela de transporte entre eles.
- **Melhor traçado.** {{ui:Best route…}}: escolha um início e um fim, e a CivilCraft encontra o caminho mais barato pelo terreno que respeita os seus limites de greide e de curva, e então cria um alinhamento a partir dele.
- **Bacias de detenção.** {{ui:Detention ponds…}} calcula a cota e o armazenamento a partir do seu terreno, aceita dispositivos de saída (orifício, vertedouro, vertedouro em V, sangradouro), faz o roteamento de uma tempestade pela bacia e verifica a vazão de pico retida, o tempo de esvaziamento e a borda livre.
- **Progresso a partir de levantamentos.** {{ui:Progress from surveys…}} compara superfícies de drone ou de scanner de datas diferentes com o terreno como era e com o projeto: percentual concluído por volume, áreas escavadas em excesso e aterradas em excesso, pilhas de material, e quando a obra termina nesse ritmo (marcado como estimativa).

**Conheça o local**

- **Endereço para terreno.** {{ui:Address to site…}} reúne dados abertos de lote, edificação, zoneamento, solo, enchente e terreno sobre um mesmo local. Você pode manter o local no arquivo do projeto: o endereço digitado, cada fonte com o dia em que foi obtida e a sua licença, e o que voltou. Reabra ou compartilhe o projeto e o local continua ali, sem nada buscado de novo. Você também pode salvá-lo como arquivo de local ou enviá-lo ao BimCraft. Veja [Endereço para terreno](topic:address-to-site).

**Terreno, estradas, levantamento, minas, links e ferrovias**

- **Solos e taludes.** {{ui:Soils and slopes…}} desenha o perfil do solo entre as sondagens que você digita. O método de Bishop então procura o círculo crítico no seu terreno, com nível d'água, sobrecarga e coeficiente sísmico; o recalque de uma sapata recebe adensamento, recalque imediato e tempo.
- **Nós viários e sinalização.** {{ui:Junctions and striping…}} junta ramos com curvas de meio-fio (um raio por ramo, ou curvas de três centros), a distância de visibilidade para a velocidade de projeto, uma verificação dos triângulos de visada, faixas de pedestres, linhas de retenção, marcações e placas com uma tabela de placas. Eles são desenhados na planta e salvos como .dxf com camadas nomeadas.
- **Ajustamento de levantamento.** {{ui:Survey adjustment…}} faz um ajustamento por mínimos quadrados de uma poligonal ou rede: coordenadas ajustadas, elipses de erro, o teste do qui-quadrado e um sinal na medição que não se encaixa. Redes livres, fechamento de uma poligonal pela regra da bússola e arquivos de campo RW5, GSI, JobXML ou CSV estão incluídos, e os pontos ajustados são salvos como CSV.
- **Cavas a céu aberto.** {{ui:Open pits…}} transforma amostras de sondagem em um modelo de blocos e na cava final dentro do seu ângulo de talude, com a razão de estéril, uma tabela por bancada e uma curva de teor e tonelagem. Cavas aninhadas por fator de receita e um cronograma de produção com fluxo de caixa descontado também estão incluídos.
- **Enlaces de rádio.** {{ui:Radio links…}} verifica a linha de visada sobre o seu terreno, com a curvatura da terra, a primeira zona de Fresnel, o orçamento do enlace, a margem de desvanecimento e a indisponibilidade por multipercurso, e informa a altura do mastro que livraria o trajeto. Também faz orçamentos de perda em fibra, quantitativos de rota e o vento sobre uma torre.
- **Aparelhos de mudança de via.** {{ui:Rail turnouts…}} cria um aparelho a partir do seu número de coração, cruzamentos entre vias paralelas e um gabarito de estrutura inclinado pela superelevação e alargado em curva. Um aparelho pode ficar em uma estaca de um alinhamento.

Veja [Solos, junções, ajustamento de levantamento, cavas, enlaces de rádio e aparelhos de mudança de via](topic:soils-roads-survey-mines-links).

### Em todos os aplicativos

- **Idiomas.** 54 idiomas, dez deles novos. Os idiomas diferentes do inglês são rascunhos de máquina até que um falante nativo os leia. Os tópicos de ajuda ainda são, em sua maioria, em inglês.
- **Linhas da barra de ferramentas.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Quebrar (como antes), 2 linhas ou 1 linha. A Faixa de opções da CivilCraft mostra a ferramenta mais usada em tamanho grande, as próximas em tamanho pequeno, e as demais atrás da seta do nome do grupo.
- **Dispositivos de entrada.** Trackpad, caneta, mouse 3D, controle e MIDI podem controlar os aplicativos.
- **Problemas.** Um painel de Problemas que avisa em todos os aplicativos, com verificações que leem pacotes de normas.
- **Ao vivo.** Uma visão de quem está onde em uma sessão ao vivo.
- **Complementos.** Uma lista de complementos, com complementos de iluminação.
- **Conecte sua IA.** Qualquer assistente que você conectar pode operar as ferramentas da CivilCraft. Ele acompanha uma nota de que a conexão com um clique dentro do CadCraft Studio e o conector hospedado ainda não estão prontos. Veja [Deixe um assistente de IA trabalhar com seu local](topic:assistants).

### Corrigido na 0.8.1

- **Seção de classes do DWG.** Ela era lida com o tipo errado (GitHub cadcraft#5). Corrigido na CivilCraft junto com o CadCraft, o BimCraft, o ModelCraft e o TakeoffCraft.
- **Troca de idioma durante a execução.** O CadCraft Studio e as edições empacotadas podem mudar de idioma durante a execução. Antes, eram só em inglês. Ainda não testado em todas as plataformas: avise-nos se o idioma não mudar.

### Ainda não nesta versão

- **São ferramentas de cálculo.** Todo resultado das novas janelas precisa da verificação de um engenheiro. As resistências do solo partem de valores típicos do grupo de solo, e a janela informa isso.
- **Faça chover.** Uma execução no local de exemplo pode levar mais de dois minutos no navegador com uma célula fina. Foi conferida com casos feitos à mão e com uma bacia em V, mas ainda não num terreno regularizado real.
- **Endereço para terreno.** Lê os arquivos de dados abertos que você traz, e foi testada apenas com arquivos nossos. Árvores não são uma fonte. Buscar as fontes por você aguarda a redação sobre privacidade.
- **Progresso a partir de levantamentos.** Testado apenas com levantamentos fictícios. Progresso em folhas e marcações (MarkupCraft) e varredura contra o modelo (BimCraft) não estão construídos.
- **Solos e taludes.** Somente superfícies circulares: sem busca em cunha ou em bloco e sem fenda de tração.
- **Nós viários.** Um raio por ramo, sem trajetórias de giro de caminhões, e ainda não entram no corredor.
- **Arquivos de campo.** Os leitores foram escritos a partir de descrições públicas de formato e testados com arquivos que nós fizemos. Arquivos de instrumentos reais são necessários.
- **Enlaces e ferrovias.** Enlaces de rádio: apenas perda no espaço livre e multipercurso (sem desvanecimento por chuva nem diagramas de antena), e nenhuma norma ferroviária: todo limite ferroviário é provisório, com números preliminares que nenhum engenheiro ferroviário verificou.
- **Windows e macOS.** A versão 0.8 não tem assinatura de código. O Windows pode avisar, e o macOS pede clique com o botão direito e depois Abrir.

Todo o restante está em [Ainda não implementado](topic:not-built-yet). Para a versão anterior, veja [Novidades da versão 0.7](topic:whats-new-0-7).
