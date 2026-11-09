---
title: Novidades na versão 0.8 e 0.8.1
summary: O CivilCraft 0.8 acrescenta Fazer chover (uma simulação de chuva sobre a modelação do terreno), um equilíbrio de terras, um localizador de melhor percurso, bacias de retenção, progresso a partir de levantamentos, uma importação de morada para local que mantém o local no projeto, e janelas para solos e taludes, entroncamentos e marcação, compensação topográfica, minas a céu aberto, ligações rádio e aparelhos de via. A 0.8.1 corrige a leitura de ficheiros DWG.
keywords: novidades, o que há de novo, notas de lançamento, registo de alterações, alterações, 0.8, 0.8.1, versão, novas funcionalidades, chuva, tempestade, empoçamento, galgamento, terraplenagem, equilíbrio, escavação e aterro, transporte, melhor percurso, custo mínimo, diretriz, bacia de retenção, descarga, esvaziamento, bordo livre, progresso, levantamento, drone, depósito, morada para local, parcela, solo, cheia, estabilidade de taludes, Bishop, assentamento, entroncamento, marcação, sinais, distância de visibilidade, compensação, mínimos quadrados, poligonal, cava a céu aberto, modelo de blocos, ligação rádio, Fresnel, aparelho de via, travessia de via, idiomas, problemas, Live, DWG
from: b0932cf0
---

Estas são as alterações do CivilCraft 0.8 (2026-11-01) e 0.8.1 (2026-11-02), em comparação com a 0.7. As grandes novidades são ferramentas que testam a modelação do terreno e o local (chuva, terraplenagem, percursos, bacias, progresso) e seis janelas de cálculo para terreno, estradas, levantamento, minas, ligações e ferrovia.

## Novo

### Testar a modelação do terreno

- **Fazer chover.** {{ui:Make it rain…}} (em {{ui:Surface}}) lança uma tempestade sobre o terreno modelado. Observa-se a água a escorrer das plataformas, a acumular-se nos cantos baixos e a galgar as bacias demasiado pequenas. A simulação é animada e dá os volumes, o caudal de pico e um CSV de cada bacia. A célula predefinida é grosseira para que uma primeira vista seja rápida; uma célula mais fina é mais lenta. As bacias que galgam também aparecem no painel de Problemas.
- **Equilíbrio de terras.** {{ui:Earthwork balancer…}} eleva ou baixa uma plataforma até a escavação igualar o aterro, e mostra a tabela de transporte entre os dois.
- **Melhor percurso.** {{ui:Best route…}}: escolha um início e um fim, e o CivilCraft encontra o caminho mais barato pelo terreno que respeita os limites de rasante e de curva, e depois cria uma diretriz a partir dele.
- **Bacias de retenção.** {{ui:Detention ponds…}} calcula a cota e o volume de armazenamento a partir do terreno, aceita dispositivos de saída (orifício, soleira, entalhe em V, vertedouro), faz passar uma tempestade pela bacia e verifica o caudal de pico retido, o tempo de esvaziamento e o bordo livre.
- **Progresso a partir de levantamentos.** {{ui:Progress from surveys…}} compara superfícies de drone ou de digitalização de datas diferentes com o terreno tal como estava e com o projeto: percentagem executada em volume, zonas com escavação em excesso e com aterro em excesso, depósitos temporários, e quando a obra termina a este ritmo (assinalado como estimativa).

### Conhecer o local

- **Morada para local.** {{ui:Address to site…}} reúne num só local dados abertos de parcelário, edifícios, zonamento, solos, cheias e terreno. Pode guardar o local no ficheiro do projeto: a morada escrita, cada fonte com o dia em que foi obtida e a respetiva licença, e o que foi devolvido. Ao reabrir ou partilhar o projeto, o local continua lá, sem voltar a obter nada. Também pode guardá-lo como ficheiro de local ou enviá-lo para o BimCraft. Ver [Morada para local](topic:address-to-site).

### Terreno, estradas, levantamentos, minas, ligações e ferrovia

- **Solos e taludes.** {{ui:Soils and slopes…}} desenha o perfil do solo entre as sondagens que escreve. Depois, o método de Bishop procura o círculo crítico no terreno, com nível freático, sobrecarga e coeficiente sísmico; o assentamento de uma sapata inclui a consolidação, o assentamento imediato e o tempo.
- **Entroncamentos e marcação.** {{ui:Junctions and striping…}} liga ramos com curvas de lancil (um raio por ramo, ou curvas de três centros), a distância de visibilidade para a velocidade de projeto, a verificação dos triângulos de visibilidade, passadeiras, linhas de paragem, marcações e sinais, com um mapa de sinais. São desenhados na planta e guardados como .dxf com camadas com nome.
- **Compensação topográfica.** {{ui:Survey adjustment…}} faz uma compensação por mínimos quadrados de uma poligonal ou rede: coordenadas compensadas, elipses de erro, o teste do qui-quadrado e um sinal na medição que não se ajusta. Estão incluídos redes livres, o fecho de uma poligonal pela regra de Bowditch e ficheiros de campo RW5, GSI, JobXML ou CSV, e os pontos compensados guardam-se em CSV.
- **Minas a céu aberto.** {{ui:Open pits…}} transforma amostras de sondagem num modelo de blocos e na cava final dentro do seu ângulo de talude, com o rácio de estéril, uma tabela por bancada e uma curva de teor e tonelagem. Também existem cavas encaixadas por fator de receita e um plano de produção com fluxo de caixa descontado.
- **Ligações rádio.** {{ui:Radio links…}} verifica a linha de vista sobre o terreno, com a curvatura da terra, a primeira zona de Fresnel, o orçamento de ligação, a margem de desvanecimento e a indisponibilidade por multipercurso, e indica a altura do mastro que libertaria o trajeto. Também faz orçamentos de perdas em fibra, quantidades do percurso e o vento sobre uma torre.
- **Aparelhos de via.** {{ui:Rail turnouts…}} cria um aparelho de via a partir do número do coração, cruzamentos de via entre vias paralelas e um gabarito de estrutura inclinado pela sobrelevação e alargado numa curva. Um aparelho pode ficar num PK de uma diretriz.

Ver [Solos e taludes, entroncamentos, compensação topográfica, minas, ligações rádio e aparelhos de via](topic:soils-roads-survey-mines-links).

## Em todas as aplicações

- **Idiomas.** 54 idiomas, dez deles novos. Os idiomas que não o inglês são rascunhos automáticos até um falante nativo os rever. Os tópicos de ajuda continuam, na maioria, em inglês.
- **Linhas da barra de ferramentas.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Quebra automática (como antes), 2 linhas ou 1 linha. O friso do CivilCraft mostra a ferramenta mais usada em grande, as seguintes em pequeno, e as restantes atrás da seta do nome do grupo.
- **Dispositivos de entrada.** Trackpad, caneta, rato 3D, comando e MIDI podem controlar as aplicações.
- **Problemas.** Um painel de Problemas que avisa em todas as aplicações, com verificações que leem os pacotes de regulamentação.
- **Live.** Uma vista de quem está onde numa sessão Live.
- **Suplementos.** Uma listagem de suplementos, com suplementos de iluminação.
- **Ligar a sua IA.** Qualquer assistente que ligar pode controlar as ferramentas do CivilCraft. Inclui uma nota a dizer que a ligação com um clique dentro do CadCraft Studio e o conector alojado ainda não estão prontos. Ver [Permitir que um assistente de IA trabalhe com o local](topic:assistants).

## Corrigido na 0.8.1

- **Secção de classes DWG.** Era lida com o tipo errado (GitHub cadcraft#5). Corrigido no CivilCraft juntamente com o CadCraft, BimCraft, ModelCraft e TakeoffCraft.
- **Mudar de idioma durante a execução.** O CadCraft Studio e as edições empacotadas podem mudar de idioma em tempo de execução. Antes só estavam em inglês. Ainda por testar em todas as plataformas: avise-nos se o idioma não mudar.

## Ainda não incluído nesta versão

- **Estes são auxiliares de cálculo.** Cada resultado das novas janelas precisa da verificação de um engenheiro. As resistências dos solos partem de valores típicos do grupo de solo, e a janela assim o indica.
- **Fazer chover.** Uma execução no local de exemplo pode levar mais de dois minutos no navegador com uma célula fina. Foi verificada com casos calculados à mão e com uma bacia de drenagem em V, mas ainda não num terreno modelado real.
- **Morada para local.** Lê os ficheiros de dados abertos que trouxer, e só foi testado com os nossos próprios ficheiros. As árvores não são uma fonte. Obter as fontes por si depende da redação sobre privacidade.
- **Progresso a partir de levantamentos.** Testado apenas com levantamentos fictícios. O progresso em folhas e anotações de revisão (MarkupCraft) e a comparação de digitalização com modelo (BimCraft) ainda não estão implementados.
- **Solos e taludes.** Apenas superfícies circulares: sem pesquisa em cunha ou em bloco e sem fenda de tração.
- **Entroncamentos.** Um raio por ramo, sem trajetórias de giro de camiões, e ainda não entram no corredor.
- **Ficheiros de campo.** Os leitores foram escritos a partir de descrições públicas de formatos e testados em ficheiros que fizemos. Precisamos de ficheiros reais de instrumentos.
- **Ligações e ferrovia.** Ligações rádio: apenas perda no espaço livre e multipercurso (sem desvanecimento por chuva nem diagramas de antena), e nenhuma norma ferroviária: todos os limites ferroviários são marcadores de posição, com valores de rascunho que nenhum engenheiro ferroviário verificou.
- **Windows e macOS.** A 0.8 não tem assinatura de código. O Windows pode avisar, e o macOS pede clique com o botão direito e depois Abrir.

Tudo o resto está em [Ainda não implementado](topic:not-built-yet). Para a versão anterior, ver [Novidades na 0.7](topic:whats-new-0-7).
