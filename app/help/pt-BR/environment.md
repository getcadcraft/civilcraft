---
title: Sombra, rendimento solar e conforto ao ar livre
summary: Estude a sombra que os volumes das edificações projetam ao longo de um dia ou de uma estação, veja uma animação dela, calcule quanta eletricidade painéis solares nos telhados e nas paredes produziriam em um ano típico, veja o quão confortável é a rua ao lado de uma edificação (UTCI) e obtenha uma leitura preliminar do conforto do vento para pedestres.
keywords: estudo de sombra, sombra, horas de sol, animação, solar, PV, fotovoltaico, painéis, rendimento, kWh, EPW, arquivo climático, UTCI, conforto térmico, conforto ao ar livre, estresse térmico, vento
from: 96e7af4d
---

A seção **Ambiente** fica abaixo de **Horas de sol** nas **Propriedades** de um volume. Ela usa os volumes que você desenhou como edificações.

## Carregar um arquivo climático

Escolha um arquivo climático de ano típico (**.epw**) para a sua cidade. Eles são gratuitos no site de clima do EnergyPlus e em climate.onebuilding.org. O arquivo permanece no seu navegador durante esta visita. O rendimento solar e o estudo de conforto precisam dele; o estudo de sombra funciona sem ele quando o projeto tem um sistema de coordenadas.

## Estudo de sombra

Escolha uma data (ou marque **Estação** e informe uma última data e um passo em dias) e um fuso horário, depois clique em **Executar estudo de sombra**. Você obtém um mapa das horas de sol, ou de sombra, no terreno ao redor dos volumes; uma tabela de quanto do terreno fica sombreado ao longo do dia; e uma animação do dia que você pode reproduzir ou avançar quadro a quadro. **Salvar mapa**, **Salvar quadros da animação** (todos os quadros em uma só imagem) e **Salvar horas** (CSV) mantêm os resultados.

O terreno é tomado como plano, no nível do volume mais baixo. Para sombra em terreno inclinado, use **Horas de sol**, que lê o relevo.

## Rendimento solar

Defina a eficiência dos painéis, quanto de cada telhado e parede é coberto e as perdas do sistema, depois clique em **Executar rendimento solar**. Para cada telhado e parede, você obtém a eletricidade que um metro quadrado de painel produziria em um ano típico, quanto dela os volumes vizinhos tiram, e um total para cada volume. O modelo é descrito em palavras simples ao lado do botão: trata-se de uma estimativa de planejamento com base em um ano típico, não de uma garantia.

## Conforto ao ar livre

**Executar conforto** calcula o Índice Térmico Climático Universal (UTCI) para uma pessoa em pé em terreno aberto e ao lado do primeiro volume (lados sul, norte, leste e oeste), com a sombra de cada volume. Ele mostra quanto céu é visto, o UTCI médio diurno e as horas acima de 32 (estresse térmico) e abaixo de 0 (estresse por frio).

## Vento (triagem)

**Executar estudo de vento** resolve o escoamento do ar ao redor dos seus volumes uma vez para cada direção de vento que sopra no seu arquivo climático (4, 8, 12 ou 16 direções), sobre o entorno que você escolher (campo aberto, subúrbio ou centro da cidade), e depois soma o vento horário do ano inteiro. O mapa colore o terreno por classe de conforto, de verde (**sentado**) passando por **em pé**, **passeando** e **caminhando** até vermelho (**desconfortável**): a atividade cuja velocidade-limite (4, 6, 8 e 10 m/s) é excedida em no máximo 5 % das horas. Uma segunda tabela dá a classe NEN 8100 (A a E) a partir da fração de horas em que o vento passa de 5 m/s. O fator de rajada multiplica a média horária para obter uma rajada efetiva.

Como funciona, em termos simples: um solver de escoamento por grandes vórtices (large-eddy) lattice-Boltzmann (próprio, na biblioteca `lib/wind`) em uma caixa ao redor das edificações, um perfil de velocidade do vento que sobe com a altura pela rugosidade escolhida, e a velocidade cerca de 1.5 m acima do solo comparada à velocidade a montante a 10 m. **Triagem** é rápida e grosseira; **Padrão** usa mais células e leva muito mais tempo. Se o painel indicar que a grade é grosseira (menos de 10 células sobre a edificação mais alta), ou que o escoamento ainda estava mudando, confie menos no mapa.

**O que isto não é.** O solver foi verificado com escoamentos de livro-texto (um canal, uma cavidade com tampa deslizante) e rodado em um cubo para verificar se a esteira e a aceleração nas quinas parecem corretas. Ele **não** foi validado com medições de edificações em túnel de vento, por isso todo resultado é rotulado como não validado. Não o use para um valor de projeto, uma carga de vento ou um certificado de planejamento: um engenheiro de vento deve executar e confirmar um estudo adequado. O terreno plano, as paredes lisas das edificações, o atalho de rugosidade pela estação meteorológica e a tabela de limiares são simplificações; os limiares podem diferir dos critérios que o seu órgão usa.

## Vento com OpenFOAM (complemento)

O motor de vento integrado acima é experimental. Para um solver de escoamento adequado, ative o complemento **Vento para pedestres (OpenFOAM)** em **Configurações > Complementos** (ele fica desativado até você fazê-lo). É um software licenciado sob GPL, mantido à parte do restante do CadCraft, e não inclui o OpenFOAM: você mesmo o instala. Depois, **Motor** no bloco de vento lista o OpenFOAM.

O que você configura, uma vez:
1. **Instale o OpenFOAM** (a série v da ESI, em openfoam.com; o complemento é testado com a v2512). No Ubuntu ou Debian (também dentro do WSL no Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, depois `sudo apt install openfoam2512-default`. Ele é instalado em `/usr/lib/openfoam/openfoam2512`. O CadCraft precisa de `blockMesh`, `snappyHexMesh` e `simpleFoam` para funcionar. (O pacote mais antigo `openfoam` 1912, do próprio repositório do Ubuntu, também funciona, mas suas function objects travam; nesse caso o complemento lê os arquivos de resultado por conta própria.)
2. **Inicie o auxiliar** a partir da pasta `runner` do complemento com o Node.js: `node cc-openfoam-runner.mjs serve`. Se o OpenFOAM não estiver no caminho de busca, dê a ele um pequeno `runner.json` com o caminho para o `etc/bashrc` do OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) e inicie com `--config runner.json`. O auxiliar escuta somente neste computador e imprime um token.
3. **Cole o token** nos campos do complemento no bloco de vento (o endereço permanece `http://127.0.0.1:8765`) e clique em **Verificar o auxiliar**.

Depois, **Executar estudo de vento** executa um caso por direção de vento do arquivo climático: seus volumes se tornam uma superfície (STL) em uma caixa dimensionada pela diretriz usual (5 alturas de edificação em torno e acima, 10 atrás), com malha gerada por blockMesh e snappyHexMesh, executada como RANS k-epsilon em regime estacionário com entrada de camada limite atmosférica sobre a rugosidade escolhida, e a velocidade a 1.5 m é lida de volta e convertida nas mesmas classes de Lawson e NEN 8100. Nada sai do seu computador.

**O que foi verificado.** O texto acima dos resultados afirma isso claramente e faz parte de cada CSV salvo. A escrita dos casos, a leitura dos resultados e todo o pipeline do complemento são testados sem o OpenFOAM, e um único cubo foi rodado no OpenFOAM real em três tamanhos de malha (os números estão nas notas do projeto). Ele **não** foi validado com medições de edificações em túnel de vento. É uma leitura preliminar, não um valor de projeto nem um certificado. O k-epsilon padrão superestima a turbulência à frente das edificações, o terreno é plano, as paredes são lisas e não há relevo nem vegetação.
