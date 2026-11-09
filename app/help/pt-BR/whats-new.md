---
title: Novidades na versão 0.8 e 0.8.1
summary: O CivilCraft 0.8 traz Fazer chover (uma tempestade sobre a sua terraplenagem), um balanceador de terraplenagem, um localizador de melhor traçado, bacias de detenção, avanço a partir de levantamentos, um importador de endereço para terreno que mantém o terreno no projeto, e janelas para solos e taludes, interseções e sinalização, ajustamento topográfico, cavas a céu aberto, enlaces de rádio e aparelhos de mudança de via. A 0.8.1 corrige a leitura de arquivos DWG.
keywords: novidades, o que há de novo, notas de lançamento, changelog, alterações, 0.8, 0.8.1, versão, novos recursos, chuva, tempestade, empoçamento, galgamento, terraplenagem, balanço, corte e aterro, diagrama de massas, melhor traçado, menor custo, alinhamento, bacia de detenção, saída, rebaixamento, borda livre, avanço, levantamento, drone, pilha de material, endereço para terreno, lote, solo, inundação, estabilidade de taludes, Bishop, recalque, interseção, sinalização, placas, distância de visibilidade, ajustamento, mínimos quadrados, poligonal, cava a céu aberto, modelo de blocos, enlace de rádio, Fresnel, aparelho de mudança de via, ligação entre vias, idiomas, problemas, Live, DWG
from: b0932cf0
---

Esta é a lista do que mudou no CivilCraft 0.8 (2026-11-01) e 0.8.1 (2026-11-02), em comparação com a 0.7. As grandes novidades são as ferramentas que testam o seu terreno e o seu local de obra (chuva, terraplenagem, traçados, bacias, avanço) e seis janelas de cálculo para terreno, vias, levantamento, minas, enlaces e ferrovias.

## Novidades

### Testar a terraplenagem

- **Fazer chover.** {{ui:Make it rain…}} (em {{ui:Surface}}) lança uma tempestade sobre o terreno já regularizado. Você vê a água escoar pelas plataformas, empoçar nos cantos baixos e transbordar das bacias que são pequenas demais. A simulação é animada e dá os volumes, a vazão de pico e um CSV com todas as bacias. A célula padrão é grossa para que a primeira olhada seja rápida; uma célula mais fina é mais lenta. Bacias que transbordam também aparecem no painel Problemas.
- **Balanceador de terraplenagem.** {{ui:Earthwork balancer…}} eleva ou rebaixa uma plataforma até que o corte se iguale ao aterro, e mostra a tabela de transporte entre eles.
- **Melhor traçado.** {{ui:Best route…}}: escolha um início e um fim, e o CivilCraft encontra o caminho de menor custo pelo terreno que respeita seus limites de greide e de curva, e então cria um alinhamento a partir dele.
- **Bacias de detenção.** {{ui:Detention ponds…}} calcula cota e armazenamento a partir do seu terreno, aceita dispositivos de saída (orifício, vertedouro, vertedor em V, sangradouro), propaga uma tempestade pela bacia e verifica a vazão de pico retida, o tempo de esvaziamento e a borda livre.
- **Avanço a partir de levantamentos.** {{ui:Progress from surveys…}} compara superfícies de drone ou de varredura de datas diferentes com o terreno como era e com o projeto: percentual concluído por volume, áreas escavadas em excesso e aterradas em excesso, pilhas de material, e quando a obra termina neste ritmo (marcado como estimativa).

### Conhecer o terreno

- **Endereço para terreno.** {{ui:Address to site…}} reúne em um único terreno dados abertos de lote, edificação, zoneamento, solo, inundação e relevo. Você pode manter o terreno no arquivo do projeto: o endereço digitado, cada fonte com o dia em que foi obtida e sua licença, e o que foi retornado. Reabra ou compartilhe o projeto e o terreno continua lá, sem nada buscado de novo. Também é possível salvá-lo como arquivo de terreno ou enviá-lo ao BimCraft. Veja [Endereço para terreno](topic:address-to-site).

### Terreno, vias, levantamento, minas, enlaces e ferrovias

- **Solos e taludes.** {{ui:Soils and slopes…}} desenha o perfil do solo entre as sondagens que você digitar. O método de Bishop então busca o círculo crítico no seu terreno, com nível d'água, sobrecarga e coeficiente sísmico; o recalque de uma sapata recebe adensamento, recalque imediato e tempo.
- **Interseções e sinalização.** {{ui:Junctions and striping…}} liga os ramos com curvas de meio-fio (um raio por ramo, ou curvas de três centros), a distância de visibilidade para a velocidade de projeto, uma verificação dos triângulos de visibilidade, faixas de pedestres, linhas de retenção, sinalização horizontal e placas com uma tabela de placas. Elas são desenhadas na planta e salvas como .dxf com camadas nomeadas.
- **Ajustamento topográfico.** {{ui:Survey adjustment…}} executa um ajustamento por mínimos quadrados de uma poligonal ou rede: coordenadas ajustadas, elipses de erro, o teste do qui-quadrado e um alerta na medição que não se encaixa. Redes livres, fechamento de poligonal pela regra da bússola e arquivos de campo RW5, GSI, JobXML ou CSV estão incluídos, e os pontos ajustados são salvos em CSV.
- **Cavas a céu aberto.** {{ui:Open pits…}} transforma amostras de sondagem em um modelo de blocos e na cava final dentro do seu ângulo de talude, com a relação estéril/minério, uma tabela por bancada e uma curva de teor e tonelagem. Cavas aninhadas por fator de receita e um cronograma de produção com fluxo de caixa descontado também estão incluídos.
- **Enlaces de rádio.** {{ui:Radio links…}} verifica a linha de visada sobre o seu terreno com a curvatura da terra, a primeira zona de Fresnel, o balanço do enlace, a margem de desvanecimento e a interrupção por multipercurso, e informa a altura de mastro que livraria o trajeto. Também faz orçamentos de perda em fibra, quantitativos de trajeto e a ação do vento em uma torre.
- **Aparelhos de mudança de via.** {{ui:Rail turnouts…}} cria um aparelho a partir do número do coração, ligações entre vias paralelas e um gabarito de estrutura inclinado pela superelevação e alargado em curva. Um aparelho pode ficar em uma estaca de um alinhamento.

Veja [Solos e taludes, interseções, ajustamento topográfico, cavas, enlaces de rádio e aparelhos de mudança de via](topic:soils-roads-survey-mines-links).

## Em todos os aplicativos

- **Idiomas.** 54 idiomas, dez deles novos. Idiomas diferentes do inglês são rascunhos de tradução automática até que um falante nativo os leia. Os tópicos de ajuda ainda estão, em sua maioria, em inglês.
- **Linhas da barra de ferramentas.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Quebrar (como antes), 2 linhas ou 1 linha. A faixa de opções do CivilCraft mostra a ferramenta mais usada em tamanho grande, as próximas em tamanho pequeno, e as demais atrás da seta do nome do grupo.
- **Dispositivos de entrada.** Trackpad, caneta, mouse 3D, controle e MIDI podem controlar os aplicativos.
- **Problemas.** Um painel Problemas que avisa em todos os aplicativos, com verificações que leem pacotes de normas.
- **Live.** Uma visualização de quem está onde em uma sessão Live.
- **Complementos.** Uma listagem de complementos, com complementos de iluminação.
- **Conecte sua IA.** Qualquer assistente que você conectar pode operar as ferramentas do CivilCraft. Ele vem com uma nota de que a conexão com um clique dentro do CadCraft Studio e o conector hospedado ainda não estão prontos. Veja [Deixe um assistente de IA trabalhar com o seu terreno](topic:assistants).

## Corrigido na 0.8.1

- **Seção de classes do DWG.** Era lida como o tipo errado (GitHub cadcraft#5). Corrigido no CivilCraft junto com CadCraft, BimCraft, ModelCraft e TakeoffCraft.
- **Troca de idioma durante a execução.** O CadCraft Studio e as edições empacotadas podem trocar de idioma durante a execução. Antes disso, só estavam em inglês. Ainda não testado em todas as plataformas: nos avise se o idioma não mudar.

## Ainda não nesta versão

- **Estes são auxiliares de cálculo.** Todo resultado das novas janelas precisa da verificação de um engenheiro. As resistências do solo partem de valores típicos do grupo de solo, e a janela informa isso.
- **Fazer chover.** Uma execução no terreno de exemplo pode levar mais de dois minutos no navegador com célula fina. Foi verificada com casos de cálculo manual e uma bacia de contribuição em V, mas ainda não em um terreno real regularizado.
- **Endereço para terreno.** Lê arquivos de dados abertos que você trouxer, e foi testado apenas com os nossos próprios arquivos. Vegetação não é uma fonte de dados. A busca de fontes por conta do aplicativo aguarda a redação sobre privacidade.
- **Avanço a partir de levantamentos.** Testado apenas com levantamentos fictícios. O avanço em folhas e marcações (MarkupCraft) e a comparação de varredura com modelo (BimCraft) ainda não foram implementados.
- **Solos e taludes.** Apenas superfícies circulares: sem busca de cunha ou de bloco e sem fenda de tração.
- **Interseções.** Um raio por ramo, sem trajetórias de giro de caminhões, e ainda não entram no corredor.
- **Arquivos de campo.** Os leitores foram escritos a partir de descrições públicas de formato e testados com arquivos que nós mesmos fizemos. Faltam arquivos reais de instrumentos.
- **Enlaces e ferrovias.** Enlaces de rádio: apenas perda no espaço livre e multipercurso (sem desvanecimento por chuva nem diagramas de antena), e nenhuma norma ferroviária: cada limite ferroviário é um valor provisório, com números de rascunho que nenhum engenheiro ferroviário conferiu.
- **Windows e macOS.** A versão 0.8 não tem assinatura de código. O Windows pode avisar, e o macOS pede clicar com o botão direito e depois em Abrir.

Todo o restante está em [Ainda não implementado](topic:not-built-yet). Para a versão anterior, veja [Novidades na 0.7](topic:whats-new-0-7).
